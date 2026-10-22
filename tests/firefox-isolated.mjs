// Isolated Firefox QA. Every test uses a disposable Playwright browser,
// synthetic DOM, and mocked I/O. Never a real Firefox profile or login.
import {firefox} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const file=async name=>readFile(new URL(name,root),'utf8');
const browser=await firefox.launch({headless:true});
const failures=[];
async function run(name,fn) {
  const context=await browser.newContext({viewport:{width:1440,height:850}});
  const page=await context.newPage();
  page.on('crash',()=>failures.push(name+' renderer crashed'));
  try{await fn(page);console.log('PASS '+name);}
  catch(e){failures.push(name+': '+String(e));console.error('FAIL '+name,e);}
  finally {await context.close();}
}
try{
  await run('Copy Entire Chat: explicit complete export, no background fetch',async page=>{
    await page.route('https://chatgpt.com/**',route=>route.fulfill({
      status:200,contentType:'text/html',
      body:'<!doctype html><html><head><title>Sample Chat</title></head><body><main><h1>Sample Chat</h1></main></body></html>'
    }));
    await page.goto('https://chatgpt.com/c/123e4567-e89b-12d3-a456-426614174000');
    await page.evaluate(()=>{
      window.__reads=0;window.__clipboard=null;
      window.GM_registerMenuCommand=(_name,callback)=>window.__command=callback;
      window.GM_setClipboard=text=>window.__clipboard=text;
      window.fetch=async url=>{
        window.__reads++;
        const body=String(url).includes('/api/auth/session')?{accessToken:'private-token'}:
          {title:'Synthetic Chat',messages:[
            {id:'one',author:{role:'user'},content:{parts:['hello']}},
            {id:'two',author:{role:'assistant'},content:{parts:['goodbye']}}
          ],page_info:{has_previous_page:false}};
        return {ok:true,status:200,json:async()=>body,
          headers:{get:()=>null}};
      };
    });
    await page.addScriptTag({content:await file('userscripts/chatgpt.com/chatgpt-copy-entire-chat/chatgpt-copy-entire-chat.user.js')});
    assert.equal(await page.evaluate(()=>window.__reads),0);
    assert.equal(await page.evaluate(()=>typeof window.__command),'function');
    await page.evaluate(()=>window.__command());
    await page.waitForFunction(()=>window.__clipboard!==null);
    const text=await page.evaluate(()=>window.__clipboard);
    assert.match(text,/USER\nhello\n\nASSISTANT\ngoodbye/);
  });
  await run('Current Message Jump: bounded scroll controls',async page=>{
    await page.setContent(`<main style="max-width:700px;margin:auto">
      <article data-testid="conversation-turn-user" style="height:70px">
        <div data-message-author-role="user">Question</div></article>
      <article data-testid="conversation-turn-assistant" style="height:2100px">
        <div data-message-author-role="assistant">Long response</div></article>
      <article data-testid="conversation-turn-next-user" style="height:110px">
        <div data-message-author-role="user">Next question</div></article>
      </main>`);
    await page.addScriptTag({content:await file('userscripts/chatgpt.com/chatgpt-current-message-jump/chatgpt-current-message-jump.user.js')});
    await page.evaluate(()=>window.scrollTo(0,650));
    await page.waitForFunction(()=>document.getElementById('fx-current-message-jump')?.style.display==='flex');
    await page.locator('#fx-current-message-jump button').first().click();
    await page.waitForFunction(()=>window.scrollY<100);
  });
  await run('Force Text Attachment: one confirmed upload',async page=>{
    await page.setContent(`<main><div style="position:fixed;left:350px;bottom:70px">
      <form style="display:flex;align-items:center;width:520px;gap:40px">
      <button id="composer-plus-btn" type="button">+</button>
      <textarea id="prompt-textarea" style="width:350px;height:55px"></textarea>
      <input type="file" style="display:none" id="fx-upload">
      <div id="chips"></div></form></div></main>`);
    await page.evaluate(()=>{
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
        readText:async()=> 'Synthetic clipboard contents'
      }});
      document.querySelector('#fx-upload').addEventListener('change',e=>{
        const span=document.createElement('span');
        span.textContent=e.target.files[0]?.name||'';
        document.querySelector('#chips').append(span);
      });
    });
    await page.addScriptTag({content:await file('userscripts/chatgpt.com/chatgpt-force-text-attachment/chatgpt-force-text-attachment.user.js')});
    await page.locator('button[aria-label="Attach clipboard text as a .txt file"]').waitFor({state:'visible'});
    await page.locator('button[aria-label="Attach clipboard text as a .txt file"]').click();
    await page.waitForFunction(()=>document.querySelector('#chips')?.textContent?.includes('.txt'));
    assert.match(await page.locator('#chips').innerText(),/clipboard-.*\.txt/);
  });
  await run('Sticky Copy: one proxy, native Copy delegated',async page=>{
    await page.setContent(`<main style="margin:0 auto;width:740px">
      <div class="group"><button aria-label="Copy" id="native">Copy</button>
        <pre style="height:2100px;width:700px;padding:24px;background:#ddd">code text</pre>
      </div>
      <form style="position:fixed;bottom:0;height:60px;background:#eee">
        <textarea id="prompt-textarea">prompt</textarea></form>
      </main>`);
    await page.evaluate(()=>{window.__nativeClicks=0;
      document.getElementById('native').onclick=()=>window.__nativeClicks++});
    await page.addScriptTag({content:await file('userscripts/chatgpt.com/chatgpt-sticky-copy/chatgpt-sticky-copy.user.js')});
    await page.evaluate(()=>window.scrollTo(0,620));
    await page.waitForFunction(()=>document.querySelector('button[aria-label="Copy current code or writing block"]')?.style.display==='block');
    await page.locator('button[aria-label="Copy current code or writing block"]').click();
    assert.equal(await page.evaluate(()=>window.__nativeClicks),1);
  });
  await run('GitHub File Row Copy: raw redirect permission and icon state lifecycle',async page=>{
    const html=`<!doctype html><html><body><main>
      <div class="react-directory-row"><div class="react-directory-filename-column">
        <span><a href="/owner/repo/blob/main/file.txt">file.txt</a></span></div></div>
      </main></body></html>`;
    await page.route('https://github.com/**',route=>route.fulfill({
      status:200,contentType:'text/html',body:html}));
    await page.goto('https://github.com/owner/repo');
    const script=await file('userscripts/github.com/github-file-copy/github-file-copy.user.js');
    const allowed=[...script.matchAll(/^\/\/ @connect\s+(\S+)/gm)].map(m=>m[1]);
    await page.evaluate(domains=>{
      window.__allowConnect=domains;
      window.__rawReads=[];window.__clipboard=null;
      window.GM_setClipboard=text=>window.__clipboard=text;
      window.GM_xmlhttpRequest=opts=>{
        window.__rawReads.push(opts.url);
        const redirected='https://raw.githubusercontent.com/owner/repo/main/file.txt';
        const sourceHost=new URL(opts.url).hostname;
        const finalHost=new URL(redirected).hostname;
        const abortable={abort(){}};
        if(!domains.includes(sourceHost)||!domains.includes(finalHost)){
          queueMicrotask(()=>opts.onerror({error:'Request redirected to unlisted host'}));
          return abortable;
        }
        // Deliberately hold the request so Firefox can assert the loading UI.
        window.__finishRawRequest=()=>opts.onload({
          status:200,finalUrl:redirected,responseText:'raw file contents',
          responseHeaders:'content-type: text/plain'
        });
        return abortable;
      };
    },allowed);
    await page.addScriptTag({content:script});
    const button=page.locator('.fx-github-row-copy');
    await button.waitFor();
    assert.equal(await button.getAttribute('data-state'),'idle');
    assert.equal(await button.locator('svg').count(),1);
    await button.click();
    assert.equal(await button.getAttribute('data-state'),'copying');
    assert.equal(await button.innerText(),'Copying…');
    assert.equal(await button.isDisabled(),true);
    assert.equal(await page.evaluate(()=>window.__clipboard),null);
    assert.deepEqual(allowed.sort(),['github.com','raw.githubusercontent.com']);
    await page.evaluate(()=>window.__finishRawRequest());
    await page.waitForFunction(()=>window.__clipboard==='raw file contents');
    assert.equal(await button.getAttribute('data-state'),'copied');
    await page.waitForFunction(()=>
      document.querySelector('.fx-github-row-copy')?.dataset.state==='idle');
    assert.equal(await button.locator('svg').count(),1);
    assert.deepEqual(await page.evaluate(()=>window.__rawReads),
      ['https://github.com/owner/repo/raw/main/file.txt']);
  });
  await run('Page Snapshot ZIP: manual trigger, captured assets, valid offline archive',async page=>{
    const html='<!doctype html><html><head><title>Snapshot fixture</title>'+
      '<link rel="stylesheet" href="/main.css">'+
      '<style>.hero{background:url("/bg.svg")}</style>'+
      '<script src="/app.js" type="module"></script></head>'+
      '<body><main><h1>Saved visible DOM</h1>'+
      '<img src="/photo.svg" alt="test"><div class="hero">body</div></main></body></html>';
    await page.route('https://snapshot.example/**',route=>{
      const pathname=new URL(route.request().url()).pathname;
      const resources={
        '/main.css':['text/css','@import "extra.css"; .content{background:url("/photo.svg")}'],
        '/extra.css':['text/css','h1{color:blue}'],
        '/app.js':['application/javascript','import "./dep.js"; window.__appLoaded=true;'],
        '/dep.js':['application/javascript','window.__depLoaded=true;'],
        '/bg.svg':['image/svg+xml','<svg xmlns="http://www.w3.org/2000/svg"></svg>'],
        '/photo.svg':['image/svg+xml','<svg xmlns="http://www.w3.org/2000/svg"></svg>']
      };
      const body=resources[pathname];
      return route.fulfill({status:200,
        contentType:body?.[0]||'text/html',body:body?.[1]||html});
    });
    await page.goto('https://snapshot.example/view');
    await page.evaluate(()=>{
      window.__snapshotMenu=null;window.__assetCalls=[];
      window.GM_registerMenuCommand=(_label,callback)=>window.__snapshotMenu=callback;
      const assets={
        '/main.css':['text/css','@import "extra.css"; .content{background:url("/photo.svg")}'],
        '/extra.css':['text/css','h1{color:blue}'],
        '/app.js':['application/javascript','import "./dep.js"; window.__appLoaded=true;'],
        '/dep.js':['application/javascript','window.__depLoaded=true;'],
        '/bg.svg':['image/svg+xml','<svg xmlns="http://www.w3.org/2000/svg"></svg>'],
        '/photo.svg':['image/svg+xml','<svg xmlns="http://www.w3.org/2000/svg"></svg>']
      };
      window.GM_xmlhttpRequest=options=>{
        window.__assetCalls.push(options.url);
        let cancelled=false;
        const req={abort(){cancelled=true;options.onabort?.()}};
        setTimeout(()=>{
          if(cancelled)return;
          const value=assets[new URL(options.url).pathname];
          if(!value){options.onload({status:404});return;}
          options.onload({
            status:200,response:new TextEncoder().encode(value[1]).buffer,
            finalUrl:options.url,responseHeaders:'content-type: '+value[0]
          });
        },5);
        return req;
      };
    });
    await page.addScriptTag({content:await file('userscripts/web/page-snapshot/page-snapshot.user.js')});
    assert.equal(await page.evaluate(()=>window.__assetCalls.length),0,
      'Snapshot must never fetch on script initialization');
    assert.equal(await page.evaluate(()=>typeof window.__snapshotMenu),'function');
    const pending=page.waitForEvent('download',{timeout:35000});
    await page.evaluate(()=>window.__snapshotMenu());
    const download=await pending;
    assert.match(download.suggestedFilename(),/^page-snapshot-.*\.zip$/);
    const archive=await readFile(await download.path());
    const files=new Map();
    let offset=0;
    while(offset+30<archive.length && archive.readUInt32LE(offset)===0x04034b50){
      const method=archive.readUInt16LE(offset+8);
      assert.equal(method,0,'ZIP uses STORE method');
      const length=archive.readUInt32LE(offset+18);
      const nameLength=archive.readUInt16LE(offset+26);
      const extra=archive.readUInt16LE(offset+28);
      const name=archive.subarray(offset+30,offset+30+nameLength).toString();
      const start=offset+30+nameLength+extra;
      files.set(name,archive.subarray(start,start+length));
      offset=start+length;
    }
    assert.equal(archive.readUInt32LE(offset),0x02014b50,
      'Central directory must follow ZIP entries');
    assert.ok(files.has('index.html'));
    assert.ok(files.has('source-dom.html'));
    assert.ok(files.has('manifest.json'));
    const manifest=JSON.parse(files.get('manifest.json').toString());
    assert.equal(manifest.version,'1.0.0');
    assert.equal(manifest.page,'https://snapshot.example/view');
    assert.ok(manifest.captured.some(item=>item.url.endsWith('/main.css')));
    assert.ok(manifest.captured.some(item=>item.url.endsWith('/app.js')));
    assert.ok(manifest.captured.some(item=>item.url.endsWith('/photo.svg')));
    const snapshot=files.get('index.html').toString();
    assert.match(snapshot,/Saved visible DOM/);
    assert.doesNotMatch(snapshot,/<script\b/i);
    assert.match(snapshot,/Content-Security-Policy/);
    assert.match(files.get('source-dom.html').toString(),/\/app\.js/);
    const css=manifest.captured.find(x=>x.url.endsWith('/main.css'));
    assert.ok(files.get(css.path).toString().includes('extra.css'));
    assert.ok(archive.length<5*1024*1024);
  });
  await run('ChatGPT coexistence: long transcript and streamed DOM churn',async page=>{
    await page.setContent('<main id="conversation"></main>');
    await page.evaluate(()=>{
      const main=document.querySelector('main');
      const fragment=document.createDocumentFragment();
      for(let i=0;i<3500;i++){
        const item=document.createElement('article');
        item.dataset.testid='conversation-turn-'+i;
        item.dataset.turnKey='turn-'+i;
        const role=document.createElement('div');
        role.dataset.messageAuthorRole=i%2?'assistant':'user';
        role.textContent='Synthetic turn '+i;
        item.append(role);fragment.append(item);
      }
      main.append(fragment);
      const composer=document.createElement('form');
      composer.style.cssText='position:fixed;bottom:8px;left:500px;background:white;display:flex;gap:20px';
      composer.innerHTML='<button type="button" id="composer-plus-btn">+</button>'+
        '<textarea id="prompt-textarea" style="width:300px;height:40px"></textarea>';
      main.append(composer);
      window.GM_registerMenuCommand=(_name,fn)=>{window.__exportCommand=fn;};
      window.GM_setClipboard=()=>{};
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
        readText:async()=> 'synthetic clipboard'
      }});
    });
    const scripts=[
      'userscripts/chatgpt.com/chatgpt-copy-entire-chat/chatgpt-copy-entire-chat.user.js',
      'userscripts/chatgpt.com/chatgpt-current-message-jump/chatgpt-current-message-jump.user.js',
      'userscripts/chatgpt.com/chatgpt-force-text-attachment/chatgpt-force-text-attachment.user.js',
      'userscripts/chatgpt.com/chatgpt-sticky-copy/chatgpt-sticky-copy.user.js'
    ];
    for(const path of scripts)await page.addScriptTag({content:await file(path)});
    await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight-600));
    const ms=await page.evaluate(async()=>{
      const start=performance.now(),main=document.querySelector('main');
      // Heavy streaming text should not cause whole-transcript rescans.
      for(let i=0;i<450;i++) {
        const node=document.createElement('span');
        node.textContent='part';
        main.lastElementChild?.append(node);
      }
      await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
      return performance.now()-start;
    });
    assert.ok(ms<5000,'Synthetic stream churn became excessively slow: '+ms+'ms');
    const counts=await page.evaluate(()=>({
      jump:document.querySelectorAll('#fx-current-message-jump').length,
      sticky:document.querySelectorAll('button[aria-label="Copy current code or writing block"]').length,
      clipboard:document.querySelectorAll('button[aria-label="Attach clipboard text as a .txt file"]').length,
      export:typeof window.__exportCommand
    }));
    assert.deepEqual(counts,{jump:1,sticky:1,clipboard:1,export:'function'});
    console.log('PASS coexistence under 3500 turns and 450 synthetic edits ('+Math.round(ms)+'ms)');
  });
} finally {
  await browser.close();
}
if(failures.length) {
  for(const message of failures)console.error(message);
  process.exitCode=1;
} else console.log('PASS all five isolated Firefox scenarios');
