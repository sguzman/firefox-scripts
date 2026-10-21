import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const s=await readFile(new URL('./github-file-copy.user.js',import.meta.url),'utf8');
test('raw link is same-origin and uses bounded privileged request',()=>{
 assert.match(s,/url\.origin!==location\.origin/);
 assert.match(s,/url\.pathname\.replace\('\/blob\/', '\/raw\/'\)/);
 assert.match(s,/const request=GM_xmlhttpRequest/);
 assert.match(s,/rows:400,cache:8,bytes:2\*1024\*1024,timeout:12000/);
});
test('only file rows, explicit click, and cancellation cleanup',()=>{
 assert.match(s,/const link=column\.querySelector\('a\[href\*="\/blob\/"\]'\)/);
 assert.match(s,/b\.addEventListener\('click',async e=>/);
 assert.match(s,/request\.abort\?\.\(\)/);
 assert.doesNotMatch(s,/setInterval\s*\(/);
});
