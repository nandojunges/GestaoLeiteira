import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.TEST_API_URL || 'http://localhost:3000';

async function safeFetch(url, opts){ try { return await fetch(url, opts); } catch(e){ return null; } }

test('GET /api/v1/health responde ok:true', async (t) => {
  const res = await safeFetch(BASE + '/api/v1/health');
  if(!res){
    test.skip('API offline: pulando health');
    return;
  }
  assert.equal(res.ok, true, 'HTTP não ok');
  const json = await res.json();
  assert.equal(json.ok, true, 'payload.ok != true');
  assert.ok(typeof json.ts === 'number', 'payload.ts ausente');
});
