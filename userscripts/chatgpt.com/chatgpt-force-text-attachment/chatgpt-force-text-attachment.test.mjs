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
 assert.match(s,/if\(!confirmed\)throw new Error/);
 assert.match(s,/input\.dispatchEvent\(new Event\('change'/);
 assert.doesNotMatch(s,/\.submit\s*\(|send-button.*click\s*\(/);
});
