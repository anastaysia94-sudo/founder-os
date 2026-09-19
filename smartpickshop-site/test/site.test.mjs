import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

test('brand and canonical domain are present', () => {
  assert.match(index, /SmartPickShop Holdings/);
  assert.match(index, /https:\/\/smartpickshop\.dev\//);
});

test('verified public destinations are present', () => {
  assert.match(index, /founder-dynasty-os-web-production\.up\.railway\.app/);
  assert.match(index, /cashh-radar-web-production\.up\.railway\.app/);
  assert.match(index, /htbjqk-9u\.myshopify\.com/);
});

test('health endpoints exist', () => {
  assert.match(server, /\/health/);
  assert.match(server, /\/ready/);
});

test('no localhost links or obvious placeholders ship in landing page', () => {
  assert.doesNotMatch(index, /localhost|example\.com|YOUR_|REPLACE_/i);
});
