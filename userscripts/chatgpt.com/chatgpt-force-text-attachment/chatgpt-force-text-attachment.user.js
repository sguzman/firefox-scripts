// ==UserScript==
// @name         ChatGPT Force Text Attachment (Firefox)
// @namespace    https://github.com/sguzman/firefox-scripts
// @version      1.0.0
// @description  Explicitly attach clipboard text as .txt, without changing the prompt.
// @match        https://chatgpt.com/c/*
// @match        https://chatgpt.com/g/*/c/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  if(window.__fxTextAttachment) return;
  const MAX_TEXT=4*1024*1024;
  const PLUS='#composer-plus-btn,[data-testid="composer-plus-btn"],button[aria-label="Add files and more"]';
  const PROMPT='#prompt-textarea,[data-testid="prompt-textarea"]';
  let button=null,busy=false,raf=0,disposed=false;
  function locate() {
    const prompt=document.querySelector(PROMPT);
    const plus=document.querySelector(PLUS);
    if(!prompt?.isConnected||!plus?.isConnected)return null;
    // ChatGPT sometimes mounts + beside, not inside, the form. Find a
    // close common composer ancestor without capturing the whole page.
    let root=prompt.closest('form')||prompt.parentElement;
    for(let depth=0;root && depth<5 && !root.contains(plus);depth++)
      root=root.parentElement;
    if(!root || root===document.body || root===document.documentElement ||
       root===document.querySelector('main')) return null;
    return {prompt,plus,root};
  }
  function toast(message,error=false) {
    const el=document.createElement('div');
    el.setAttribute('role','status');el.textContent=message;
    Object.assign(el.style,{position:'fixed',zIndex:'2147482999',
      bottom:'20px',left:'50%',transform:'translateX(-50%)',
      background:'Canvas',color:error?'#bb4b42':'CanvasText',
      border:'1px solid currentColor',borderRadius:'8px',
      padding:'8px 12px',font:'13px system-ui',maxWidth:'440px'});
    document.body.append(el);setTimeout(()=>el.remove(),4200);
  }
  function show() {
    raf=0;if(disposed)return;
    const found=locate();
    if(!found){if(button)button.hidden=true;return;}
    if(!button) {
      button=document.createElement('button');button.type='button';
      button.textContent='Clipboard';
      button.setAttribute('aria-label','Attach clipboard text as a .txt file');
      Object.assign(button.style,{position:'fixed',zIndex:'2147482000',
        padding:'6px 10px',height:'32px',borderRadius:'8px',
        background:'Canvas',color:'CanvasText',border:'1px solid GrayText',
        font:'12px system-ui',cursor:'pointer'});
      button.addEventListener('click',()=>void attach());
      document.body.append(button);
    }
    const rect=found.plus.getBoundingClientRect();
    const width=button.offsetWidth||90;
    let left=rect.left-width-10,top=rect.top+(rect.height-32)/2;
    if(left<6) {left=rect.left;top=rect.top-40;}
    const composer=found.prompt.getBoundingClientRect();
    const overlaps=left+width>composer.left&&left<composer.right&&
      top+32>composer.top&&top<composer.bottom;
    button.hidden=overlaps||top<4||left<4||left+width>innerWidth-4;
    if(!button.hidden){button.style.left=Math.round(left)+'px';button.style.top=Math.round(top)+'px';}
  }
  function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(show);}
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const accepts=input=>{
    if(!input||input.type!=='file'||input.disabled||!input.isConnected)return false;
    const accepts=(input.accept||'').trim().toLowerCase();
    return !accepts||accepts.split(',').some(v=>
      ['*/*','.txt','text/plain','text/*'].includes(v.trim()));
  };
  function filename() {
    const d=new Date(),pad=n=>String(n).padStart(2,'0');
    return 'clipboard-'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+
      '-'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds())+'.txt';
  }
  function inputFor(root) {
    const local=Array.from(root.querySelectorAll('input[type="file"]')).filter(accepts);
    if(local.length===1)return local[0];
    if(local.length>1) return local.find(i=>i.multiple)||local[0];
    return null;
  }
  async function findInput(found) {
    let input=inputFor(found.root);
    if(input)return input;
    // A single explicit click may reveal the native input.
    found.plus.click();
    for(let i=0;i<8;i++) {
      await sleep(125);
      const fresh=locate();
      if(!fresh)return null;
      input=inputFor(fresh.root);
      if(input)return input;
      // ChatGPT sometimes portals its attachment input outside the form.
      const globals=Array.from(document.querySelectorAll('input[type="file"]')).filter(accepts);
      if(globals.length===1)return globals[0]; // no ambiguous upload target
    }
    return null;
  }
  function attachmentShown(root,name) {
    if(root.textContent?.includes(name))return true;
    for(const el of root.querySelectorAll('[title],[aria-label]')) {
      if(el.title?.includes(name)||el.getAttribute('aria-label')?.includes(name))
        return true;
    }
    return false;
  }
  async function attach() {
    if(busy)return;
    const found=locate();
    if(!found)return;
    busy=true;button.disabled=true;button.textContent='Attaching…';
    try {
      if(!navigator.clipboard?.readText)
        throw new Error('Firefox clipboard read is unavailable; permission may be required');
      // Clipboard access occurs only after the user clicks this control.
      const text=await navigator.clipboard.readText();
      if(!text)throw new Error('Clipboard contains no text');
      if(text.length>MAX_TEXT)throw new Error('Clipboard exceeds the 4 MiB safety limit');
      const file=new File([text],filename(),{type:'text/plain',lastModified:Date.now()});
      const input=await findInput(found);
      if(!input)throw new Error('No unambiguous text-file upload input found');
      const dt=new DataTransfer();dt.items.add(file);
      input.files=dt.files;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
      // Only confirmation in the composer counts as uploaded. Never retry
      // automatically: it can create a duplicate attachment.
      let confirmed=false;
      for(let i=0;i<18;i++){
        const active=locate();
        if(!active)break;
        if(attachmentShown(active.root,file.name)){confirmed=true;break;}
        await sleep(200);
      }
      if(!confirmed)throw new Error('Upload was sent but is unconfirmed; check attachments');
      toast('Attached '+file.name);
    } catch(error) {
      toast(error instanceof Error?error.message:'Could not attach clipboard text',true);
    } finally {
      busy=false;
      if(button){button.disabled=false;button.textContent='Clipboard';}
    }
  }
  function changed(records) {
    for(const record of records) {
      let checked=0;
      for(const node of record.addedNodes||[]) {
        if(++checked>12)break;
        if(node.nodeType===1 &&
          (node.matches?.(PROMPT)||node.matches?.(PLUS)||
            node.querySelector?.(PROMPT)||node.querySelector?.(PLUS)))
          return true;
      }
    }
    return false;
  }
  // No observer on the whole streaming transcript. Composer replacement
  // re-evaluates only on specific navigation or nearby UI changes.
  const root=document.querySelector('main')||document.body;
  const observer=new MutationObserver(records=>{if(changed(records))schedule();});
  if(root)observer.observe(root,{childList:true,subtree:false});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('popstate',schedule);
  function dispose(){
    disposed=true;observer.disconnect();if(raf)cancelAnimationFrame(raf);
    window.removeEventListener('resize',schedule);
    window.removeEventListener('scroll',schedule,true);
    window.removeEventListener('popstate',schedule);
    button?.remove();delete window.__fxTextAttachment;
  }
  window.addEventListener('pagehide',dispose,{once:true});
  window.__fxTextAttachment={dispose};
  schedule();
})();
