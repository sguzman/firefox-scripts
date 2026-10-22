// ==UserScript==
// @name         ChatGPT Force Text Attachment (Firefox)
// @namespace    https://github.com/sguzman/firefox-scripts
// @version      1.0.1
// @description  Show a clipboard-to-text-file control beside the ChatGPT composer.
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  if(window.__fxTextAttachment)return;
  const MAX_TEXT=4*1024*1024;
  const PLUS='#composer-plus-btn,[data-testid="composer-plus-btn"],button[aria-label*="Add files"],button[aria-label*="Attach"]';
  const PROMPT='#prompt-textarea,[data-testid="prompt-textarea"],[contenteditable="true"][aria-label*="Message"]';
  let button=null,busy=false,frame=0,disposed=false;
  const style=document.createElement('style');
  style.textContent=[
    '#fx-text-attachment-button{box-sizing:border-box!important;height:32px!important;',
    'min-width:85px!important;padding:5px 9px!important;border-radius:8px!important;',
    'border:1px solid #06080c!important;background:#1b2028!important;',
    'color:#f9fafb!important;box-shadow:0 2px 8px #0005!important;',
    'font:600 12px/1.2 system-ui!important;cursor:pointer!important;opacity:1!important;',
    'visibility:visible!important;white-space:nowrap!important}',
    '#fx-text-attachment-button:disabled{opacity:.7!important;cursor:wait!important}',
    '#fx-text-attachment-toast{position:fixed;z-index:2147482999;bottom:20px;left:50%;',
    'transform:translateX(-50%);background:#1b2028;color:#f9fafb;',
    'border:1px solid #06080c;border-radius:8px;padding:8px 12px;',
    'font:13px system-ui;max-width:440px;box-shadow:0 2px 8px #0005}',
    '@media(prefers-color-scheme:dark){#fx-text-attachment-button{',
    'background:#f8fafc!important;color:#111827!important;',
    'border-color:#cbd5e1!important}#fx-text-attachment-toast{',
    'background:#f8fafc;color:#111827;border-color:#cbd5e1}}',
    '#fx-text-attachment-button:focus-visible{outline:3px solid #3b82f6!important;outline-offset:2px}'
  ].join('');
  document.head?.append(style);
  const promptNode=()=>document.querySelector(PROMPT);
  const plusNode=()=>document.querySelector(PLUS);
  function composer(){
    const prompt=promptNode();
    if(!prompt?.isConnected)return null;
    const root=prompt.closest('form')||
      prompt.closest('[data-testid*="composer"]')||
      prompt.parentElement;
    return {prompt,plus:plusNode(),root:root||prompt.parentElement};
  }
  function ensureButton(){
    if(button)return button;
    button=document.createElement('button');button.type='button';
    button.id='fx-text-attachment-button';button.textContent='Clipboard';
    button.setAttribute('aria-label','Attach clipboard text as a .txt file');
    Object.assign(button.style,{position:'fixed',zIndex:'2147482000'});
    button.addEventListener('click',()=>void attach());
    document.body.append(button);
    return button;
  }
  function toast(message,isError=false){
    document.getElementById('fx-text-attachment-toast')?.remove();
    const el=document.createElement('div');el.id='fx-text-attachment-toast';
    el.setAttribute('role','status');el.textContent=message;
    if(isError)el.style.outline='2px solid #d97757';
    document.body.append(el);setTimeout(()=>el.remove(),4000);
  }
  function show(){
    frame=0;if(disposed)return;
    const found=composer();
    if(!found){if(button)button.style.display='none';return;}
    const b=ensureButton();
    const width=b.offsetWidth||90,plus=found.plus;
    const ref=(plus?.isConnected?plus:found.prompt).getBoundingClientRect();
    const promptRect=found.prompt.getBoundingClientRect();
    if(promptRect.width===0||promptRect.height===0){
      b.style.display='none';return;
    }
    const candidates=[];
    if(plus?.isConnected){
      candidates.push({x:ref.left-width-10,y:ref.top+(ref.height-32)/2});
      candidates.push({x:ref.right+10,y:ref.top+(ref.height-32)/2});
    }
    // The + button may not exist until a menu opens, or may be outside the
    // prompt's form. In either case, keep the clipboard control discoverable.
    candidates.push({x:promptRect.left-width-10,y:promptRect.top+4});
    candidates.push({x:promptRect.right-width,y:promptRect.top-39});
    let position=null;
    for(const p of candidates){
      if(p.x<5 || p.y<5 || p.x+width>innerWidth-5 || p.y+32>innerHeight-5)continue;
      const overlaps=p.x+width>promptRect.left&&p.x<promptRect.right&&
        p.y+32>promptRect.top&&p.y<promptRect.bottom;
      if(!overlaps){position=p;break;}
    }
    if(!position){
      // Fixed viewport gutter: do not hide merely because the + control
      // has changed shape or is rendered in a portal.
      position={x:Math.max(5,innerWidth-width-12),
        y:Math.max(5,Math.min(innerHeight-37,promptRect.top-40))};
    }
    b.style.left=Math.round(position.x)+'px';
    b.style.top=Math.round(position.y)+'px';
    b.style.display='block';
  }
  function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(show);}
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function eligible(input){
    if(!input||input.type!=='file'||input.disabled||!input.isConnected)return false;
    const accept=(input.accept||'').trim().toLowerCase();
    return !accept||accept.split(',').some(x=>
      ['*/*','.txt','text/plain','text/*'].includes(x.trim()));
  }
  function filename(){
    const d=new Date(),pad=n=>String(n).padStart(2,'0');
    return 'clipboard-'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+
      '-'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds())+'.txt';
  }
  function selectInput(root){
    const local=Array.from(root?.querySelectorAll?.('input[type="file"]')||[])
      .filter(eligible);
    if(local.length===1)return local[0];
    if(local.length>1)return local.find(x=>x.multiple)||null;
    return null;
  }
  async function findInput(found){
    let input=selectInput(found.root);
    if(input)return input;
    const global=()=> {
      const options=Array.from(document.querySelectorAll('input[type="file"]'))
        .filter(eligible);
      return options.length===1?options[0]:null;
    };
    input=global();
    if(input)return input;
    if(!found.plus?.isConnected)
      throw Error('ChatGPT attachment + control not found; no upload attempted');
    found.plus.click(); // one deliberate action after user pressed Clipboard
    for(let i=0;i<8;i++){
      await sleep(125);
      input=selectInput(composer()?.root)||global();
      if(input)return input;
    }
    return null; // no repeated clicks or guessed menu-item selection
  }
  function confirmed(root,name){
    if(root?.textContent?.includes(name))return true;
    for(const el of root?.querySelectorAll?.('[title],[aria-label]')||[])
      if(el.title?.includes(name)||el.getAttribute('aria-label')?.includes(name))
        return true;
    return false;
  }
  async function attach(){
    if(busy)return;
    const found=composer();
    if(!found)return;
    busy=true;button.disabled=true;button.textContent='Attaching…';
    try {
      if(!navigator.clipboard?.readText)
        throw Error('Firefox clipboard access unavailable; permission may be required');
      const text=await navigator.clipboard.readText(); // only on click
      if(!text)throw Error('Clipboard is empty');
      if(text.length>MAX_TEXT)throw Error('Clipboard exceeds 4 MiB');
      const file=new File([text],filename(),{type:'text/plain'});
      const input=await findInput(found);
      if(!input)throw Error('No unambiguous file upload input found');
      const transfer=new DataTransfer();transfer.items.add(file);
      input.files=transfer.files;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
      let succeeded=false;
      for(let i=0;i<18;i++){
        if(confirmed(composer()?.root,file.name)){succeeded=true;break;}
        await sleep(200);
      }
      if(!succeeded)throw Error('Attachment unconfirmed; check composer before retrying');
      toast('Attached '+file.name);
    }catch(error){
      toast(error?.message||'Cannot attach clipboard',true);
    }finally{
      busy=false;if(button){button.disabled=false;button.textContent='Clipboard';}
    }
  }
  // Observe new structural nodes only; streamed text does not schedule
  // composer-layout checks. The watcher is bounded to 32 inserted nodes.
  function relevant(records){
    let examined=0;
    for(const record of records){
      for(const node of record.addedNodes){
        if(++examined>32)return false;
        if(node.nodeType!==1)continue;
        if(node.matches?.(PROMPT)||node.matches?.(PLUS)||
          (node.childElementCount>0 && node.querySelector?.(PROMPT+','+PLUS)))
          return true;
      }
      for(const node of record.removedNodes){
        if(++examined>32)return false;
        if(node===button || node.matches?.(PROMPT) || node.matches?.(PLUS))return true;
      }
    }
    return false;
  }
  const observer=new MutationObserver(records=>{if(relevant(records))schedule();});
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('popstate',schedule);
  function dispose(){
    disposed=true;observer.disconnect();if(frame)cancelAnimationFrame(frame);
    window.removeEventListener('resize',schedule);
    window.removeEventListener('scroll',schedule,true);
    window.removeEventListener('popstate',schedule);
    style.remove();button?.remove();
    document.getElementById('fx-text-attachment-toast')?.remove();
    delete window.__fxTextAttachment;
  }
  window.addEventListener('pagehide',dispose,{once:true});
  window.__fxTextAttachment={dispose};
  schedule();
})();