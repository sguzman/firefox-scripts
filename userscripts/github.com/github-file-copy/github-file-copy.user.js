// ==UserScript==
// @name         GitHub File Row Copy (Firefox)
// @namespace    https://github.com/sguzman/firefox-scripts
// @version      1.0.2
// @description  Copy a GitHub file from its repository row without opening it.
// @match        https://github.com/*/*
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      github.com
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  if(window.__fxGitHubFileCopy) return;
  const ROW='.react-directory-row .react-directory-filename-column';
  const LIMIT=Object.freeze({rows:400,cache:8,bytes:2*1024*1024,timeout:12000});
  const cache=new Map(),activeRequests=new Set();
  let frame=0,disposed=false,root=document.querySelector('main')||document.body;
  if(!root)return;
  function rawURL(link) {
    const url=new URL(link,location.href);
    if(url.origin!==location.origin||url.protocol!=='https:'||
       !/^\/[^/]+\/[^/]+\/blob\/[^/]+\/.+/.test(url.pathname))
      throw new Error('Invalid repository file URL');
    url.pathname=url.pathname.replace('/blob/','/raw/');
    url.search='';url.hash='';
    return url.href;
  }
  const style=document.createElement('style');
  style.id='fx-github-file-copy-css';
  style.textContent=`
    .fx-github-row-copy{cursor:pointer;display:inline-flex;align-items:center;
      border:1px solid #06080c!important;border-radius:5px;
      color:#f9fafb!important;background:#1b2028!important;
      box-shadow:0 1px 5px #0005!important;
      font:12px system-ui;padding:2px 5px;margin-right:6px;
      justify-content:center;gap:5px;min-width:26px;min-height:23px;
      line-height:1.3;vertical-align:middle}
    .fx-github-row-copy svg{width:15px;height:15px;display:block;flex-shrink:0}
    .fx-github-row-copy[data-state="copying"]{min-width:75px}
    .fx-github-row-copy:focus-visible{outline:2px solid var(--focus-outlineColor,#0969da)}
    .fx-github-row-copy:disabled{opacity:.7;cursor:wait}
    @media(prefers-color-scheme:dark){
      .fx-github-row-copy{
        background:#f8fafc!important;color:#111827!important;
        border-color:#cbd5e1!important;box-shadow:0 1px 6px #0007!important
      }
    }
  `;
  document.head.append(style);
  // Inline icon only: no remote resources, fonts or extra permissions.
  function makeCopyIcon() {
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');
    svg.setAttribute('stroke-width','2');
    svg.setAttribute('stroke-linecap','round');
    svg.setAttribute('stroke-linejoin','round');
    const rect=document.createElementNS(ns,'rect');
    for(const [name,value] of Object.entries({x:'8',y:'8',width:'13',height:'13',rx:'2'}))
      rect.setAttribute(name,value);
    const back=document.createElementNS(ns,'path');
    back.setAttribute('d','M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3');
    svg.append(rect,back);
    return svg;
  }
  function setButtonState(button,state,label='') {
    button.dataset.state=state;
    button.replaceChildren(state==='idle'?makeCopyIcon():
      document.createTextNode(label));
  }
  function getText(url) {
    if(cache.has(url))return Promise.resolve(cache.get(url));
    return new Promise((resolve,reject)=>{
      let finished=false;
      const done=(error,value)=>{
        if(finished)return;finished=true;
        activeRequests.delete(request);
        if(error)reject(error);else resolve(value);
      };
      const request=GM_xmlhttpRequest({
        method:'GET',url,timeout:LIMIT.timeout,
        headers:{Accept:'text/plain,*/*;q=0.9'},
        responseType:'text',
        onload:r=>{
          if(r.status<200||r.status>=300)
            return done(new Error('GitHub returned HTTP '+r.status));
          const type=(r.responseHeaders||'').match(/content-type:\s*([^\r\n]+)/i)?.[1]||'';
          if(/text\/html/i.test(type))
            return done(new Error('Received HTML instead of file contents'));
          const text=String(r.responseText||'');
          if(text.length>LIMIT.bytes)
            return done(new Error('File exceeds 2 MiB copy limit'));
          // Bounded session cache: never store unbounded raw files.
          cache.set(url,text);
          if(cache.size>LIMIT.cache)cache.delete(cache.keys().next().value);
          done(null,text);
        },
        onerror:()=>done(new Error('GitHub raw-file request failed')),
        ontimeout:()=>done(new Error('GitHub raw-file request timed out')),
        onabort:()=>done(new Error('Request aborted'))
      });
      activeRequests.add(request);
    });
  }
  function decorate(column) {
    if(column.querySelector(':scope > .fx-github-row-copy'))return;
    const link=column.querySelector('a[href*="/blob/"]');
    if(!link)return;
    let url;
    try{url=rawURL(link.href);}catch{return;}
    const filename=Array.from(column.children).find(c=>c.contains(link));
    if(!filename)return;
    const b=document.createElement('button');
    b.type='button';b.className='fx-github-row-copy';
    const accessibleName='Copy contents of '+(link.textContent||'file').trim();
    b.title='Copy file contents';
    b.setAttribute('aria-label',accessibleName);
    setButtonState(b,'idle');
    b.addEventListener('click',async e=>{
      e.preventDefault();e.stopPropagation();
      if(b.disabled)return;
      b.disabled=true;
      b.title='Copying file contents';
      b.setAttribute('aria-label','Copying file contents');
      setButtonState(b,'copying','Copying…');
      try {
        const text=await getText(url);
        if(typeof GM_setClipboard!=='function')
          throw new Error('Userscript clipboard grant unavailable');
        GM_setClipboard(text,'text');
        b.title='Copied file contents';
        setButtonState(b,'copied','Copied');
      } catch(error) {
        b.title=error instanceof Error?error.message:'Could not copy file';
        setButtonState(b,'error','Error');
      } finally {
        setTimeout(()=>{
          if(!b.isConnected)return;
          b.disabled=false;
          b.title='Copy file contents';
          b.setAttribute('aria-label',accessibleName);
          setButtonState(b,'idle');
        },1200);
      }
    });
    column.insertBefore(b,filename);
  }
  function scan(){
    frame=0;if(disposed)return;
    root=document.querySelector('main')||document.body;
    // GitHub lists at most a bounded number of rows per pass.
    for(const col of Array.from(root.querySelectorAll(ROW)).slice(0,LIMIT.rows))
      decorate(col);
  }
  function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(scan);}
  function relevant(records){
    for(const record of records) {
      let count=0;
      for(const node of record.addedNodes||[]) {
        if(++count>20)break;
        if(node.nodeType!==1)continue;
        if(node.matches?.('.react-directory-row,.react-directory-filename-column')||
          node.querySelector?.('.react-directory-row,.react-directory-filename-column'))
          return true;
      }
    }
    return false;
  }
  const observer=new MutationObserver(records=>{if(relevant(records))schedule();});
  observer.observe(root,{childList:true,subtree:true});
  function navigate(){cache.clear();schedule();}
  document.addEventListener('turbo:load',navigate);
  window.addEventListener('popstate',navigate);
  function dispose(){
    disposed=true;observer.disconnect();if(frame)cancelAnimationFrame(frame);
    document.removeEventListener('turbo:load',navigate);
    window.removeEventListener('popstate',navigate);
    for(const request of activeRequests)try{request.abort?.();}catch{}
    activeRequests.clear();cache.clear();style.remove();
    document.querySelectorAll('.fx-github-row-copy').forEach(el=>el.remove());
    delete window.__fxGitHubFileCopy;
  }
  window.addEventListener('pagehide',dispose,{once:true});
  window.__fxGitHubFileCopy={dispose};
  schedule();
})();
