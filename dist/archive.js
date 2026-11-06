/* A physical, endless project shelf. Native CSS 3D and Web Animations. */
(() => {
  'use strict';
  const root=document.documentElement, section=document.querySelector('#work'), stage=document.querySelector('.archive-stage'), world=document.querySelector('.archive-world');
  const projects=window.PORTFOLIO.projects;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>!reduce.matches&&!root.classList.contains('motion-off');
  const mod=(n,m)=>((n%m)+m)%m, smooth=x=>x*x*(3-2*x);
  const covers=['cover-forme.svg','cover-quiet-edit.svg','cover-common-ground.svg','cover-perspective.svg'];
  const groups=['websites','websites','applications','applications'];
  projects.forEach((p,i)=>{p.cover=p.cover||'assets/'+covers[i];p.group=p.group||groups[i];});
  let selected=projects.map((_,i)=>i), items=[], s=8, target=8, H=350, spine=50, depth=238, gap=10, active=-1, frame=0, previous=0, visible=false, dragging=false, hover=-1, mouseX=0, mouseY=0, tiltX=0, tiltY=0, pointerStart=null, pendingLaunch=null, origin=null, closing=null;
  const caption=document.querySelector('.archive-caption-copy'), openLink=caption.querySelector('.archive-open'), tabs=document.querySelector('.archive-project-tabs');
  const e=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const size=()=>{H=Math.min(390,Math.max(225,innerWidth*.29));if(innerWidth<=760)H=Math.min(310,Math.max(220,innerWidth*.64));spine=H*.145;depth=H*2/3;gap=H*.025;stage.style.setProperty('--book-h',H+'px');stage.style.setProperty('--book-spine',spine+'px');stage.style.setProperty('--book-depth',depth+'px');wake();};
  const makeBooks=()=>{
    world.replaceChildren();items=[];
    const count=selected.length===1?1:selected.length*5;
    for(let v=0;v<count;v++){
      const i=selected[v%selected.length],p=projects[i],node=document.createElement('div');
      node.className='archive-volume '+(i%2?'light-volume':'dark-volume');node.dataset.v=v;
      node.innerHTML=`<div class="book-spine"><span class="spine-number">${String(i+1).padStart(2,'0')}</span><span class="spine-name">${e(p.title)}</span><span class="spine-imprint">${p.group==='websites'?'WEBSITE':'APPLICATION'}</span></div><div class="book-cover"><img src="${e(p.cover)}" width="600" height="900" alt="" draggable="false"></div><div class="book-pages"></div><div class="book-top"></div>`;
      world.append(node);items.push({node,v,i,r:0,lift:0});
    }
    s=target=selected.length===1?0:selected.length*2;active=-1;
    tabs.replaceChildren();
    selected.forEach((i,k)=>{const button=document.createElement('button');button.type='button';button.className='archive-tab mono';button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label','Select '+projects[i].title);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{target=Math.round(target)+mod(k-mod(Math.round(target),selected.length)+selected.length/2,selected.length)-selected.length/2;wake();});tabs.append(button);});
    size();updateCaption(selected[0],1);wake();
  };
  const swap=(node,value,dir)=>{if(node.textContent===value)return;if(!motion()){node.textContent=value;return;}node.getAnimations?.().forEach(a=>a.cancel());node.textContent=value;node.animate([{transform:`translateY(${dir*105}%)`},{transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});};
  const updateCaption=(i,dir)=>{
    active=i;const p=projects[i];swap(caption.querySelector('.archive-name'),p.title,dir);swap(caption.querySelector('.archive-kicker'),String(i+1).padStart(2,'0')+' / '+p.category.toUpperCase(),dir);swap(caption.querySelector('.archive-description'),p.description,dir);openLink.href='#project-'+p.slug;
    tabs.querySelectorAll('button').forEach((button,k)=>button.setAttribute('aria-pressed',String(selected[k]===i)));
    section.dataset.activeProject=p.slug;
  };
  function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
  function render(now){
    frame=0;if(!visible||document.hidden)return;
    const dt=Math.min(.05,previous?(now-previous)/1000:.016);previous=now;
    const ease=motion()?1-Math.exp(-(dragging?18:6.5)*dt):1;
    s+=(target-s)*ease;if(Math.abs(target-s)<.0001)s=target;
    if(Math.abs(s)>selected.length*20){const shift=Math.trunc(s/selected.length)*selected.length;s-=shift;target-=shift;}
    const tiltTargetY=motion()&&hover>=0?Math.max(-7,Math.min(7,mouseX*8)):0,tiltTargetX=motion()&&hover>=0?Math.max(-5,Math.min(5,-mouseY*5)):0;
    tiltY+=(tiltTargetY-tiltY)*(motion()?1-Math.exp(-9*dt):1);tiltX+=(tiltTargetX-tiltX)*(motion()?1-Math.exp(-9*dt):1);
    let settling=Math.abs(target-s)>.0001||Math.abs(tiltY-tiltTargetY)>.01||Math.abs(tiltX-tiltTargetX)>.01;
    for(const item of items){
      const r=selected.length===1?0:mod(item.v-s+items.length/2,items.length)-items.length/2;item.r=r;
      const o=smooth(Math.max(0,1-Math.abs(r))),B=Math.abs(r)<1?(r+Math.sin(Math.PI*r)/Math.PI)/2:Math.sign(r)*.5;
      const x=r*(spine+gap)+(depth-spine+gap*1.6)*B;
      const liftTarget=motion()&&hover===item.v&&Math.abs(r)>.5?1:0;item.lift+=(liftTarget-item.lift)*(motion()?1-Math.exp(-12*dt):1);
      if(Math.abs(liftTarget-item.lift)>.001)settling=true;
      const shown=Math.abs(x)<stage.clientWidth/2+depth*1.5;
      item.node.style.visibility=shown?'visible':'hidden';if(!shown)continue;
      item.node.classList.toggle('is-current',Math.abs(r)<.5);
      item.node.style.transform=`translate3d(${x}px,${-o*H*.035-item.lift*H*.055}px,${o*H*.25}px) rotateZ(${-5*o}deg) rotateX(${tiltX*o}deg) rotateY(${-90*o+tiltY*o}deg)`;
      item.node.style.zIndex=String(Math.round(100-Math.abs(r)*4));item.node.style.setProperty('--spine-shade',String(o*.48));item.node.style.setProperty('--cover-shade',String((1-o)*.35));
    }
    world.style.transform=`rotateX(-7deg) rotateZ(${innerWidth>900?-2:0}deg) scale(${dragging ? .96 : 1})`;
    const i=selected[mod(Math.round(s),selected.length)];if(i!==active)updateCaption(i,Math.sign(target-s)||1);
    if(settling)wake();else previous=0;
  }
  const currentBook=()=>items.find(item=>Math.abs(item.r)<.5)?.node;
  const rectOfBook=()=>currentBook()?.querySelector('.book-cover').getBoundingClientRect();
  const prepareLaunch=slug=>{const rect=rectOfBook();if(rect)pendingLaunch={slug,rect:{top:rect.top,left:rect.left,width:rect.width,height:rect.height},rotation:-5};};
  openLink.addEventListener('click',event=>{if(!event.metaKey&&!event.ctrlKey)prepareLaunch(projects[active].slug);});
  stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;pointerStart={x:event.clientX,y:event.clientY,target,pointer:event.pointerId};dragging=false;});
  stage.addEventListener('pointermove',event=>{
    const volume=event.target.closest('.archive-volume');hover=volume?Number(volume.dataset.v):-1;
    const rect=stage.getBoundingClientRect();mouseX=(event.clientX-rect.left-rect.width/2)/(depth*.6);mouseY=(event.clientY-rect.top-rect.height/2)/(H/2);
    if(pointerStart){const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;if(!dragging&&Math.abs(dy)>Math.abs(dx)*1.3&&Math.abs(dy)>8){pointerStart=null;return;}if(Math.abs(dx)>5){dragging=true;stage.classList.add('is-dragging');stage.setPointerCapture(event.pointerId);target=pointerStart.target-dx/(spine+gap);event.preventDefault();}}
    stage.classList.toggle('over-cover',Boolean(volume&&Math.abs(items[Number(volume.dataset.v)]?.r||0)<.5));wake();
  },{passive:false});
  stage.addEventListener('pointerup',event=>{
    if(!pointerStart)return;const wasDrag=dragging;pointerStart=null;dragging=false;stage.classList.remove('is-dragging');
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    if(wasDrag){target=Math.round(target);wake();return;}
    const volume=event.target.closest('.archive-volume');if(!volume)return;const item=items[Number(volume.dataset.v)];
    if(Math.abs(item.r)<.5){prepareLaunch(projects[item.i].slug);openLink.click();}else{target=Math.round(target+item.r);wake();}
  });
  stage.addEventListener('pointercancel',()=>{pointerStart=null;dragging=false;stage.classList.remove('is-dragging');target=Math.round(target);wake();});
  stage.addEventListener('pointerleave',()=>{hover=-1;stage.classList.remove('over-cover');wake();});
  stage.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();target=Math.round(target)+(event.key==='ArrowRight'?1:-1);wake();}else if(event.key==='Enter'){event.preventDefault();prepareLaunch(projects[active].slug);openLink.click();}else if(event.key==='Home'||event.key==='End'){event.preventDefault();target=selected.length*2+(event.key==='End'?selected.length-1:0);wake();}});
  stage.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)*.65||event.shiftKey){event.preventDefault();target+=Math.max(-1,Math.min(1,(event.deltaX||event.deltaY)/(spine+gap)*.4));clearTimeout(stage.snapTimer);stage.snapTimer=setTimeout(()=>{target=Math.round(target);wake();},140);wake();}},{passive:false});
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{target=Math.round(target)+Number(button.dataset.step);wake();}));
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;selected=projects.map((p,i)=>filter==='all'||p.group===filter?i:-1).filter(i=>i>=0);document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('article.project').forEach((article,i)=>article.hidden=!selected.includes(i));makeBooks();}));
  document.querySelectorAll('[data-archive-view]').forEach(button=>button.addEventListener('click',()=>{const index=button.dataset.archiveView==='index';section.classList.toggle('is-index',index);document.querySelectorAll('[data-archive-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(!index){visible=true;wake();}}));
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&!section.classList.contains('is-index');if(visible)wake();else if(frame){cancelAnimationFrame(frame);frame=0;previous=0;}},{rootMargin:'100px 0px'});observer.observe(stage);
  addEventListener('resize',size,{passive:true});addEventListener('portfolio:motionchange',()=>{s=target;wake();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});

  const clipFor=rect=>`inset(${Math.max(0,rect.top)}px ${Math.max(0,innerWidth-rect.left-rect.width)}px ${Math.max(0,innerHeight-rect.top-rect.height)}px ${Math.max(0,rect.left)}px round 3px)`;
  const animatePoster=dialog=>{
    const img=dialog.querySelector('.case-cover');if(!img||!motion())return;
    const ns='http://www.w3.org/2000/svg',id='poster-ink-'+Date.now();const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 600 900');svg.setAttribute('aria-hidden','true');svg.classList.add('case-cover');
    svg.innerHTML=`<defs><filter id="${id}-rag" x="-40%" y="-30%" width="180%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="90" xChannelSelector="R" yChannelSelector="G"/></filter><mask id="${id}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1000" height="1300"><g fill="white" filter="url(#${id}-rag)">${[[150,330],[420,600],[280,120],[90,760],[490,250],[310,860],[300,470]].map(([cx,cy])=>`<circle cx="${cx}" cy="${cy}" r="0"/>`).join('')}</g></mask></defs><image href="${e(img.getAttribute('src'))}" width="600" height="900" mask="url(#${id})"/>`;
    img.replaceWith(svg);const circles=[...svg.querySelectorAll('circle')],delays=[0,120,220,300,360,420,180],start=performance.now()+320;let af;
    const tick=now=>{if(!dialog.open||!svg.isConnected)return;let done=true;circles.forEach((circle,i)=>{const k=Math.min(1,Math.max(0,(now-start-delays[i])/1100));circle.setAttribute('r',String((1-Math.pow(1-k,3))*840));if(k<1)done=false;});if(!done)af=requestAnimationFrame(tick);};
    af=requestAnimationFrame(tick);dialog.addEventListener('close',()=>cancelAnimationFrame(af),{once:true});
  };
  addEventListener('portfolio:casechange',event=>{
    const {dialog}=event.detail;if(closing){closing.cancel();closing=null;}origin=event.detail.origin?.rect||origin;
    animatePoster(dialog);
    if(!motion())return;
    if(event.detail.origin){const r=event.detail.origin.rect;dialog.style.transformOrigin=`${r.left+r.width/2}px ${r.top+r.height/2}px`;dialog.animate([{clipPath:clipFor(r),transform:'rotate(-5deg)'},{clipPath:'inset(0px 0px 0px 0px round 0px)',transform:'rotate(0deg)'}],{duration:1000,easing:'cubic-bezier(.76,0,.18,1)'});}
    const copy=dialog.querySelector('.case-heading');if(copy)copy.animate([{transform:'translateY(34px)',clipPath:'inset(0 0 100% 0)'},{transform:'translateY(0)',clipPath:'inset(0)'}],{duration:850,delay:event.detail.origin?430:0,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
  });
  document.querySelector('#case-dialog').addEventListener('close',()=>{origin=null;pendingLaunch=null;if(closing){closing.cancel();closing=null;}});
  window.LufforArchive={consumeLaunch(slug){const result=pendingLaunch?.slug===slug?pendingLaunch:null;pendingLaunch=null;return result;},dismiss(dialog,finish){if(!motion()||!origin)return false;if(closing)return true;const r=origin;closing=dialog.animate([{clipPath:'inset(0px 0px 0px 0px)',transform:'rotate(0deg)'},{clipPath:clipFor(r),transform:'rotate(-5deg)'}],{duration:650,easing:'cubic-bezier(.76,0,.18,1)',fill:'forwards'});closing.finished.then(()=>{const a=closing;closing=null;origin=null;finish();a.cancel();wake();}).catch(()=>{});return true;}};
  document.querySelector('.archive-controls').hidden=false;document.querySelector('.archive-experience').hidden=false;root.classList.add('archive-ready');makeBooks();
})();
