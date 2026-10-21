import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const s=await readFile(new URL('./chatgpt-current-message-jump.user.js',import.meta.url),'utf8');
test('bounded tail traversal, rAF and no idle polling',()=>{
 assert.match(s,/tailNodes:1600/);
 assert.match(s,/candidates:240/);
 assert.match(s,/inspected\+\+<LIMIT\.tailNodes/);
 assert.match(s,/requestAnimationFrame\(paint\)/);
 assert.doesNotMatch(s,/setInterval\s*\(|document\.querySelectorAll\(SELECTOR\)/);
});
test('safe placement and graceful virtualized fallback',()=>{
 assert.match(s,/document\.elementFromPoint/);
 assert.match(s,/Missing controls > covering content/);
 assert.match(s,/scrollTo\(preceding\|\|turns\[index\]\)/);
 assert.match(s,/observer\.disconnect\(\)/);
});
