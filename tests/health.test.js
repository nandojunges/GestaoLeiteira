import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.TEST_API_URL || 'http://localhost:3000';

test('GET /api/v1/health responde ok:true', async (t) => {
  const res = await fetch(BASE + '/api/v1/health');
  assert.equal(res.ok, true, 'HTTP não ok');
  const json = await res.json();
  assert.equal(json.ok, true, 'payload.ok != true');
  assert.ok(typeof json.ts === 'number', 'payload.ts ausente');
});
