import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=async p=>readFile(new URL(p,import.meta.url),'utf8');
const manifest=JSON.parse(await read('./manifest.json'));
const s=await read('./content.js');
test('extension permission and host are tightly scoped',()=>{
  assert.equal(manifest.manifest_version,3);
  assert.deepEqual(manifest.permissions,['clipboardRead']);
  assert.deepEqual(manifest.host_permissions,['https://chatgpt.com/*']);
  assert.equal(manifest.background,undefined);
  assert.deepEqual(manifest.content_scripts[0].matches,['https://chatgpt.com/*']);
  assert.equal(manifest.content_scripts[0].all_frames,false);
});
test('clipboard read only in click path; no menu or background clipboard access',()=>{
  const onclick=s.indexOf("button.addEventListener('click',()=>void attach())");
  const attach=s.indexOf('async function attach(){');
  const read=s.indexOf('await navigator.clipboard.readText()');
  assert.ok(onclick>0&&attach>onclick&&read>attach);
  assert.doesNotMatch(s,/found\.plus\.click\s*\(|document\.execCommand\s*\(|setInterval\s*\(/);
  assert.match(s,/MAX_TEXT=4\*1024\*1024/);
  assert.match(s,/No accessible ChatGPT upload input/);
  assert.match(s,/if\(!succeeded\)throw Error/);
});
