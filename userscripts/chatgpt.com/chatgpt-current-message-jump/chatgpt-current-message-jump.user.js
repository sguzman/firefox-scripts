// ==UserScript==
// @name         ChatGPT Current Message Jump (Firefox)
// @namespace    https://github.com/sguzman/firefox-scripts
// @version      1.0.0
// @description  Two safe-gutter buttons to move through the current long exchange.
// @match        https://chatgpt.com/c/*
// @match        https://chatgpt.com/g/*/c/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  if(window.__fxCurrentMessageJump) return;
  const LIMIT=Object.freeze({candidates:240,tailNodes:1600,button:38,gap:8});
  const SELECTOR='[data-testid^="conversation-turn-"],[data-turn-key]';
  const ROLE='[data-message-author-role],[data-turn]';
  const active={turn:null,index:-1};
  let main=document.querySelector('main'),turns=[],raf=0,disposed=false;
  if(!main) return; // Fail closed if the renderer is unknown.
  const overlay=document.createElement('div');
  overlay.id='fx-current-message-jump';
  Object.assign(overlay.style,{position:'fixed',zIndex:'2147482000',
    display:'none',flexDirection:'column',gap:LIMIT.gap+'px',
    pointerEvents:'none'});
  function button(text,label) {
    const b=document.createElement('button');
    b.type='button';b.textContent=text;b.title=label;b.setAttribute('aria-label',label);
    Object.assign(b.style,{width:LIMIT.button+'px',height:LIMIT.button+'px',
      cursor:'pointer',pointerEvents:'auto',borderRadius:'9px',
      color:'CanvasText',background:'Canvas',border:'1px solid GrayText',
      boxShadow:'0 1px 6px #0004',font:'bold 23px system-ui'});
    overlay.append(b);return b;
  }
  const up=button('↑','Go to start of current exchange');
  const down=button('↓','Go to next conversation message');
  document.body.append(overlay);
  function role(turn) {
    const marker=turn.matches?.(ROLE)?turn:turn.querySelector?.(ROLE);
    return marker?.getAttribute('data-message-author-role')||
      marker?.getAttribute('data-turn')||turn.getAttribute('data-turn')||'';
  }
  function turnId(turn) {
    return turn.getAttribute('data-turn-key')||
      turn.getAttribute('data-turn-id')||
      turn.getAttribute('data-testid')||'';
  }
  function rebuildTurns() {
    main=document.querySelector('main');
    if(!main) {turns=[];return;}
    // Reverse traverse the tail only. No full transcript querySelectorAll.
    const reversed=[];let node=main.lastElementChild,inspected=0;
    while(node && inspected++<LIMIT.tailNodes && reversed.length<LIMIT.candidates) {
      if(node.matches?.(SELECTOR)) reversed.push(node);
      if(node.lastElementChild) {node=node.lastElementChild;continue;}
      while(node && node!==main && !node.previousElementSibling)
        node=node.parentElement;
      if(!node || node===main) break;
      node=node.previousElementSibling;
    }
    const seen=new Set();
    turns=reversed.reverse().filter(turn=>{
      const key=turnId(turn);
      if(key && seen.has(key))return false;
      if(key)seen.add(key);
      return Boolean(turn.getBoundingClientRect) && turn.isConnected;
    });
  }
  function viewingArea() {
    const composer=document.querySelector('#prompt-textarea,[data-testid="prompt-textarea"]');
    const top=Math.max(0,Math.round(innerHeight*0.07));
    const bottom=Math.min(innerHeight,
      composer?.getBoundingClientRect().top ?? innerHeight)-16;
    return {top,bottom};
  }
  function chooseCurrent() {
    const {top,bottom}=viewingArea();
    if(bottom<=top+100) return null;
    const midpoint=(top+bottom)/2;
    let best=null,bestScore=-Infinity;
    turns.forEach((turn,index)=>{
      if(role(turn)!=='assistant')return;
      const rect=turn.getBoundingClientRect();
      const overlap=Math.max(0,Math.min(bottom,rect.bottom)-Math.max(top,rect.top));
      if(overlap<=0) return;
      const score=overlap + (rect.top<=midpoint && rect.bottom>=midpoint ? 10000:0);
      if(score>bestScore){bestScore=score;best={turn,index,rect,top,bottom};}
    });
    return best;
  }
  function hitUnsafe(x,y) {
    const el=document.elementFromPoint(x,y);
    if(!el)return false;
    if(overlay.contains(el)) return false;
    if(el.closest?.('button,a,input,textarea,[role="dialog"],[role="button"],pre,code,table,figure,[data-testid="writing-block-container"]'))
      return true;
    // Refuse a placement intersecting actual text, not merely a wide
    // paragraph container. Only the nearby visible text needs testing.
    const p=el.closest?.('p,h1,h2,h3,li,blockquote');
    if(p && p.getClientRects) {
      const rect=p.getBoundingClientRect();
      if(x>=rect.left && x<=rect.right && y>=rect.top && y<=rect.bottom)
        return true;
    }
    return false;
  }
  function safePosition(y,height) {
    const size=LIMIT.button;
    for(const x of [innerWidth-size-12,12]){
      if(x<0||y<4||y+height>innerHeight-4)continue;
      const points=[[x+3,y+3],[x+size-3,y+3],
        [x+3,y+height-3],[x+size-3,y+height-3]];
      if(points.every(([cx,cy])=>!hitUnsafe(cx,cy))) return x;
    }
    return null; // Missing controls > covering content.
  }
  function hide(){overlay.style.display='none';active.turn=null;}
  function paint(){
    raf=0;if(disposed) return;
    if(!main?.isConnected){hide();return;}
    const current=chooseCurrent();
    if(!current){hide();return;}
    const {turn,index,rect,top,bottom}=current;
    if(rect.top>=top-45){hide();return;}
    const hasNext=index<turns.length-1 ||
      rect.bottom>bottom+45;
    down.style.display=hasNext?'block':'none';
    const height=LIMIT.button+(hasNext?LIMIT.gap+LIMIT.button:0);
    const y=Math.max(top+8,Math.min(bottom-height-8,Math.round((top+bottom-height)/2)));
    const x=safePosition(y,height);
    if(x===null){hide();return;}
    active.turn=turn;active.index=index;
    overlay.style.left=x+'px';overlay.style.top=y+'px';
    overlay.style.display='flex';
  }
  function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(paint);}
  function scrollTo(turn,edge='start') {
    const scroller=turn?.closest?.('[data-scroll-container]')||turn;
    if(edge==='start') scroller.scrollIntoView({behavior:'instant',block:'start'});
    else turn.scrollIntoView({behavior:'instant',block:'end'});
    schedule();
  }
  function currentIndex() {
    const i=turns.indexOf(active.turn);
    return i>=0?i:active.index;
  }
  up.addEventListener('click',()=>{
    const index=currentIndex();
    if(index<0)return;
    const preceding=turns[index-1];
    // Do not guess at missing virtualized turns. Jump to the current
    // assistant boundary when the predecessor isn't mounted.
    scrollTo(preceding||turns[index]);
  });
  down.addEventListener('click',()=>{
    const i=currentIndex();
    if(i<0)return;
    const next=turns[i+1];
    scrollTo(next||turns[i],'end');
  });
  function relevant(nodes) {
    let n=0;
    for(const el of nodes){
      if(++n>32)break;
      if(el.nodeType!==1)continue;
      if(el.matches?.(SELECTOR)||el.querySelector?.(SELECTOR))return true;
    }
    return false;
  }
  let observer=new MutationObserver(records=>{
    if(records.some(record=>relevant(record.addedNodes)||relevant(record.removedNodes))) {
      rebuildTurns();schedule();
    }
  });
  observer.observe(main,{childList:true,subtree:true});
  function onNav(){
    const next=document.querySelector('main');
    if(next && next!==main){
      observer.disconnect();main=next;
      observer.observe(main,{childList:true,subtree:true});
    }
    rebuildTurns();schedule();
  }
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('popstate',onNav);

  function dispose() {
    disposed=true;observer.disconnect();if(raf)cancelAnimationFrame(raf);
    window.removeEventListener('scroll',schedule,true);
    window.removeEventListener('resize',schedule);
    window.removeEventListener('popstate',onNav);

    overlay.remove();delete window.__fxCurrentMessageJump;
  }
  window.addEventListener('pagehide',dispose,{once:true});
  window.__fxCurrentMessageJump={dispose};
  rebuildTurns();schedule();
})();
