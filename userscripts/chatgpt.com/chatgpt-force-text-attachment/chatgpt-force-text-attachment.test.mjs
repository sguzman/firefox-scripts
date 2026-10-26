import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const s=await readFile(new URL('./chatgpt-force-text-attachment.user.js',import.meta.url),'utf8');

test('Firefox v1.2.0 userscript retains a one-click button and bounded upload work',()=>{
  assert.match(s,/^\/\/ @version\s+1\.2\.0$/m);
  assert.match(s,/button\.addEventListener\('click',\(\)=>void attach\(true\)\)/);
  assert.match(s,/MAX_TEXT=4\*1024\*1024/);
  assert.match(s,/i<8;i\+\+/);
  assert.match(s,/i<18;i\+\+/);
  assert.doesNotMatch(s,/setInterval\s*\(/);
});

test('Ctrl+Shift+V reads native paste data rather than requesting clipboard permission',()=>{
  assert.match(s,/window\.addEventListener\('keydown',onKeydown,true\)/);
  assert.match(s,/window\.addEventListener\('paste',onPaste,true\)/);
  assert.match(s,/event\.clipboardData\?\.getData\('text\/plain'\)/);
  assert.match(s,/void attach\(true,text\)/);
  assert.match(s,/ensurePasteSink\(\)\.focus/);
  const shortcut=s.slice(s.indexOf('function onKeydown('),s.indexOf('// Observe new structural nodes'));
  assert.doesNotMatch(shortcut,/navigator\.clipboard\.readText/);
  assert.doesNotMatch(shortcut,/event\.preventDefault\(\);\s*event\.stopImmediatePropagation\(\);\s*pasteArm\.timer=/);
  assert.match(s,/pastedText===null\?await navigator\.clipboard\.readText\(\):pastedText/);
});

test('file selection is deterministic but never guesses ties or overwrites selections',()=>{
  assert.match(s,/id==='upload-files'/);
  assert.match(s,/candidates\[0\]\.score===candidates\[1\]\.score/);
  assert.match(s,/if\(input\.files\?\.length\)/);
  assert.match(s,/if\(!succeeded\)throw Error/);
  assert.match(s,/input\.dispatchEvent\(new Event\('change'/);
  assert.doesNotMatch(s,/\.submit\s*\(|send-button.*click\s*\(/);
  assert.doesNotMatch(s,/document\.execCommand\('paste'\)/);
});

test('button follows the ChatGPT composer but does not paste into it',()=>{
  assert.match(s,/if\(!plus&&!prompt\)return null/);
  assert.match(s,/const leftEdge=Math\.min/);
  assert.match(s,/const above=/);
  assert.match(s,/observer\.observe\(document\.body/);
  assert.match(s,/prefers-color-scheme:dark/);
});
