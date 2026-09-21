'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');

function run(tool, args = [], options = {}) {
  return spawnSync(process.execPath, [...(options.nodeArgs || []), path.join(root, 'tools', tool), ...args], {
    encoding: 'utf8', timeout: 10000, env: options.env || process.env
  });
}

test('both acceptance tools execute as ES modules and show usage', () => {
  for (const tool of ['verify-live-deployment.mjs', 'verify-sandbox-purchase.mjs']) {
    const result = run(tool);
    assert.equal(result.status, 64, result.stderr);
    assert.match(result.stderr, /Usage:/);
    assert.doesNotMatch(result.stderr, /ReferenceError/);
  }
});

test('sandbox verifier refuses missing credentials before network access', () => {
  const env = { ...process.env };
  for (const name of ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'SUPABASE_SECRET_KEY', 'DELIVERY_TOKEN_SECRET']) delete env[name];
  const result = run('verify-sandbox-purchase.mjs', ['TESTORDER12345'], { env });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing required environment variables/);
});

test('live verifier writes nested evidence for success, failure, and network error', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'four-offer-verifier-'));
  try {
    for (const mode of ['ready', 'not-ready', 'network-error']) {
      const preload = path.join(directory, `${mode}.mjs`);
      const output = path.join(directory, mode, 'evidence.json');
      fs.writeFileSync(preload, `globalThis.fetch = async (url) => {
        if (${JSON.stringify(mode)} === 'network-error') throw new Error('test_network_failure');
        const pathname = new URL(url).pathname;
        if (pathname === '/health') return Response.json({ok:true,paypal_environment:'sandbox'});
        if (pathname === '/ready') return Response.json({ready:${mode === 'ready'},paypal_environment:'sandbox',missing:[],invalid:[]}, {status:${mode === 'ready' ? 200 : 503}});
        if (pathname === '/config.js') return new Response('window.FOUR_OFFER_CONFIG={"paypalApiReady":true,"paypalEnvironment":"sandbox"}');
        return new Response('<h1>AI Project Handoff Pack</h1><a data-offer="ai-project-handoff">$19</a>');
      };`);
      const result = run('verify-live-deployment.mjs', ['https://store.example.test', '--output', output], {
        nodeArgs: ['--import', pathToFileURL(preload).href]
      });
      assert.equal(result.status, mode === 'ready' ? 0 : 1, result.stderr);
      const report = JSON.parse(fs.readFileSync(output, 'utf8'));
      assert.equal(report.verdict, {ready:'READY_FOR_SANDBOX_PURCHASE','not-ready':'NOT_READY','network-error':'ERROR'}[mode]);
      if (mode === 'network-error') assert.equal(report.error, 'test_network_failure');
      else assert.equal(report.checks.length, 14);
    }
  } finally {
    fs.rmSync(directory, {recursive:true, force:true});
  }
});
