'use strict';

const fs = require('fs');

const baseArg = process.argv[2];
const outputArgIndex = process.argv.indexOf('--output');
const outputPath = outputArgIndex >= 0 ? process.argv[outputArgIndex + 1] : null;

if (!baseArg) {
  console.error('Usage: node tools/verify-live-deployment.mjs https://store.example [--output path.json]');
  process.exit(64);
}

let base;
try {
  base = new URL(baseArg);
} catch {
  console.error('FAIL: invalid storefront URL');
  process.exit(1);
}

if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) {
  console.error('FAIL: storefront URL must be a clean HTTPS origin');
  process.exit(1);
}

base.pathname = '/';
const origin = base.origin;

const checks = [];
let failed = false;

function record(name, ok, detail, extra = {}) {
  checks.push({ name, ok, detail, ...extra });
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name} — ${detail}`);
}

async function request(path, options = {}) {
  const response = await fetch(origin + path, {
    redirect: 'follow',
    ...options,
    headers: {
      'User-Agent': 'SmartPickShop-Four-Offer-Live-Gate/1.0',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  return { response, text };
}

async function json(path) {
  const { response, text } = await request(path);
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  return { response, text, body };
}

(async () => {
  const startedAt = new Date().toISOString();

  try {
    const health = await json('/health');
    record('/health HTTP 200', health.response.status === 200, `HTTP ${health.response.status}`, { status: health.response.status });
    record('/health ok:true', health.body?.ok === true, health.body ? `ok=${String(health.body.ok)}` : 'invalid JSON');
    record('/health sandbox', health.body?.paypal_environment === 'sandbox', `paypal_environment=${health.body?.paypal_environment ?? 'missing'}`);

    const ready = await json('/ready');
    record('/ready HTTP 200', ready.response.status === 200, `HTTP ${ready.response.status}`, { status: ready.response.status });
    record('/ready ready:true', ready.body?.ready === true, ready.body ? `ready=${String(ready.body.ready)}` : 'invalid JSON');
    record('/ready sandbox', ready.body?.paypal_environment === 'sandbox', `paypal_environment=${ready.body?.paypal_environment ?? 'missing'}`);
    record('/ready no missing vars', Array.isArray(ready.body?.missing) && ready.body.missing.length === 0, `missing=${JSON.stringify(ready.body?.missing ?? null)}`);
    record('/ready no invalid vars', Array.isArray(ready.body?.invalid) && ready.body.invalid.length === 0, `invalid=${JSON.stringify(ready.body?.invalid ?? null)}`);

    const config = await request('/config.js');
    record('/config.js HTTP 200', config.response.status === 200, `HTTP ${config.response.status}`, { status: config.response.status });
    record('PayPal API ready', /"paypalApiReady"\s*:\s*true/.test(config.text), 'paypalApiReady:true required');
    record('Runtime sandbox', /"paypalEnvironment"\s*:\s*"sandbox"/.test(config.text), 'paypalEnvironment:sandbox required');

    const storefront = await request('/');
    record('/ HTTP 200', storefront.response.status === 200, `HTTP ${storefront.response.status}`, { status: storefront.response.status });
    record('$19 offer rendered', storefront.text.includes('AI Project Handoff Pack'), 'AI Project Handoff Pack present');
    record('$19 offer slug rendered', storefront.text.includes('data-offer="ai-project-handoff"'), 'ai-project-handoff offer present');

    const report = {
      schema: 'smartpickshop.four-offer-live-gate.v1',
      checked_at: new Date().toISOString(),
      started_at: startedAt,
      storefront_origin: origin,
      verdict: failed ? 'NOT_READY' : 'READY_FOR_SANDBOX_PURCHASE',
      checks
    };

    const rendered = JSON.stringify(report, null, 2) + '\n';
    if (outputPath) {
      fs.mkdirSync(require('path').dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, rendered);
      console.log(`Evidence written to ${outputPath}`);
    } else {
      console.log(rendered);
    }

    if (failed) process.exit(1);
    console.log('VERDICT: READY FOR ONE MANUAL $19 PAYPAL SANDBOX PURCHASE.');
    console.log('PAYPAL_ENV must remain sandbox until the purchase/delivery acceptance gate passes.');
  } catch (error) {
    const report = {
      schema: 'smartpickshop.four-offer-live-gate.v1',
      checked_at: new Date().toISOString(),
      started_at: startedAt,
      storefront_origin: origin,
      verdict: 'ERROR',
      error: error instanceof Error ? error.message : String(error),
      checks
    };
    if (outputPath) {
      fs.mkdirSync(require('path').dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
    }
    console.error(`ERROR: ${report.error}`);
    process.exit(1);
  }
})();