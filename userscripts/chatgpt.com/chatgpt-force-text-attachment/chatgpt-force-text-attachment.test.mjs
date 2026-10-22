import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const s=await readFile(new URL('./chatgpt-force-text-attachment.user.js',import.meta.url),'utf8');
test('reads clipboard only after click, with size and time budgets',()=>{
 assert.match(s,/button\.addEventListener\('click',\(\)=>void attach\(\)\)/);
 assert.match(s,/const text=await navigator\.clipboard\.readText\(\)/);
 assert.match(s,/MAX_TEXT=4\*1024\*1024/);
 assert.match(s,/i<8;i\+\+/);
 assert.match(s,/i<18;i\+\+/);
 assert.doesNotMatch(s,/setInterval\s*\(/);
});
test('does not auto-submit, retry uploads, or accept unconfirmed state',()=>{
 assert.match(s,/if\(!succeeded\)throw Error/);
 assert.match(s,/input\.dispatchEvent\(new Event\('change'/);
 assert.doesNotMatch(s,/\.submit\s*\(|send-button.*click\s*\(/);
});

test('v1.0.1 supports home-page composer and inverse theme',()=>{
 assert.match(s,/^\/\/ @version\s+1\.0\.1$/m);
 assert.match(s,/^\/\/ @match\s+https:\/\/chatgpt\.com\/\*$/m);
 assert.match(s,/prefers-color-scheme:dark/);
 assert.match(s,/const candidates=\[\]/);
 assert.match(s,/observer\.observe\(document\.body/);
});
