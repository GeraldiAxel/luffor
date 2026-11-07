/* A diagonal stack of website and application interfaces. Native CSS 3D and Web Animations. */
(() => {
  'use strict';
  const root=document.documentElement, section=document.querySelector('#work'), stage=document.querySelector('.archive-stage'), world=document.querySelector('.archive-world');
  const projects=window.PORTFOLIO.projects;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>!reduce.matches&&!root.classList.contains('motion-off');
  const mod=(n,m)=>((n%m)+m)%m;
  const interfaces=['interface-forme.svg','interface-quiet-edit.svg','interface-common-ground.svg','interface-perspective.svg'];
  const portraits=interfaces.map(name=>name.replace('.svg','-portrait.svg'));
  const hoverLabel=document.createElement('div');hoverLabel.className='archive-hover-label';hoverLabel.setAttribute('aria-hidden','true');document.body.append(hoverLabel);
  const groups=['websites','websites','applications','applications'];
  projects.forEach((p,i)=>{p.interface=p.interface||'assets/'+interfaces[i];p.portrait='assets/'+portraits[i];p.group=p.group||groups[i];});
  let selected=projects.map((_,i)=>i), items=[], s=0, target=0, W=650, H=437, step=455, active=-1, frame=0, previous=0, visible=false, dragging=false, hover=-1, mouseX=0, mouseY=0, tiltX=0, tiltY=0, pointerStart=null, pendingLaunch=null, origin=null, closing=null;
  const caption=document.querySelector('.archive-caption-copy'), openLink=caption.querySelector('.archive-open'), tabs=document.querySelector('.archive-project-tabs');
  const e=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const size=()=>{H=innerWidth<=760?Math.min(340,innerWidth*.80):Math.min(430,innerWidth*.30);W=H*.75;step=W*.43;stage.style.setProperty('--screen-w',W+'px');stage.style.setProperty('--screen-h',H+'px');wake();};
  const makePanels=()=>{
    world.replaceChildren();items=[];
    const count=selected.length===1?1:selected.length*5;
    for(let v=0;v<count;v++){
      const i=selected[v%selected.length],p=projects[i],node=document.createElement('div');node.className='interface-panel';node.dataset.v=v;
      node.innerHTML=`<div class="interface-bar"><span class="window-dots"><i></i><i></i><i></i></span><span>${p.group==='websites'?'WEBSITE':'APPLICATION'}</span><span class="interface-expand">↗</span></div><div class="interface-display"><img class="interface-blur" src="${e(p.portrait)}" width="600" height="800" alt="" draggable="false"><img class="interface-sharp" src="${e(p.portrait)}" width="600" height="800" alt="" draggable="false"></div><div class="interface-edge"></div>`;
      world.append(node);items.push({node,v,i,r:0,lift:0});
    }
    s=target=selected.length===1?0:selected.length*2;active=-1;tabs.replaceChildren();
    selected.forEach((i,k)=>{const button=document.createElement('button');button.type='button';button.className='archive-tab mono';button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label','Select '+projects[i].title);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{target=Math.round(target)+mod(k-mod(Math.round(target),selected.length)+selected.length/2,selected.length)-selected.length/2;wake();});tabs.append(button);});
    size();updateCaption(selected[0],1);wake();
  };
  const swap=(node,value,dir)=>{if(node.textContent===value)return;if(!motion()){node.textContent=value;return;}node.getAnimations?.().forEach(a=>a.cancel());node.textContent=value;node.animate([{transform:`translateY(${dir*105}%)`},{transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.2,.8,.2,1)'});};
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
    const tiltTargetY=motion()&&hover>=0?Math.max(-2.5,Math.min(2.5,mouseX*3)):0,tiltTargetX=motion()&&hover>=0?Math.max(-2,Math.min(2,-mouseY*2)):0;
    tiltY+=(tiltTargetY-tiltY)*(motion()?1-Math.exp(-9*dt):1);tiltX+=(tiltTargetX-tiltX)*(motion()?1-Math.exp(-9*dt):1);
    let settling=Math.abs(target-s)>.0001||Math.abs(tiltY-tiltTargetY)>.01||Math.abs(tiltX-tiltTargetX)>.01;
    for(const item of items){
      const r=selected.length===1?0:mod(item.v-s+items.length/2,items.length)-items.length/2;item.r=r;
      const liftTarget=motion()&&hover===item.v?1:0;item.lift+=(liftTarget-item.lift)*(motion()?1-Math.exp(-10*dt):1);
      if(Math.abs(liftTarget-item.lift)>.001)settling=true;
      const x=r*step+item.lift*W*.40;
      const shown=Math.abs(x)<stage.clientWidth*.7;
      item.node.style.visibility=shown?'visible':'hidden';if(!shown)continue;
      item.node.classList.toggle('is-current',Math.abs(r)<.5);
      item.node.style.opacity='1';
      item.node.style.transform=`translate3d(${x}px,${-r*H*.13-item.lift*H*.025}px,${-r*W*.3+item.lift*W*.55}px) rotateY(${-30+tiltY*.3}deg) rotateX(${tiltX*.25}deg)`;
      item.node.style.zIndex=String(Math.round(100-r*2+item.lift*30));
      item.node.style.setProperty('--screen-dim','0');
    }
    world.style.transform=`rotateX(-10deg) scale(${dragging ? .9 : 1})`;
    const i=selected[mod(Math.round(s),selected.length)];if(i!==active)updateCaption(i,Math.sign(target-s)||1);
    if(settling)wake();else previous=0;
  }
  const currentPanel=()=>items.find(item=>Math.abs(item.r)<.5)?.node;
  const prepareLaunch=(slug,node=currentPanel())=>{const rect=node?.getBoundingClientRect();if(rect){pendingLaunch={slug,rect:{top:rect.top,left:rect.left,width:rect.width,height:rect.height},rotation:0};node.classList.add('is-launching');stage.classList.add('is-opening');hoverLabel.classList.remove('is-visible');}};
  openLink.addEventListener('click',event=>{if(!event.metaKey&&!event.ctrlKey&&!pendingLaunch)prepareLaunch(projects[active].slug);});
  stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;pointerStart={x:event.clientX,y:event.clientY,target,pointer:event.pointerId};dragging=false;});
  stage.addEventListener('pointermove',event=>{
    const volume=event.target.closest('.interface-panel');hover=volume?Number(volume.dataset.v):-1;hoverLabel.classList.toggle('is-visible',Boolean(volume&&!dragging&&event.pointerType!=='touch'&&motion()));if(volume){hoverLabel.textContent=projects[items[Number(volume.dataset.v)].i].title;hoverLabel.style.transform=`translate(${event.clientX+14}px,${event.clientY+12}px)`;}
    const rect=stage.getBoundingClientRect();mouseX=(event.clientX-rect.left-rect.width/2)/(W/2);mouseY=(event.clientY-rect.top-rect.height/2)/(H/2);
    if(pointerStart){const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;if(!dragging&&Math.abs(dy)>Math.abs(dx)*1.3&&Math.abs(dy)>8){pointerStart=null;return;}if(Math.abs(dx)>5){dragging=true;hoverLabel.classList.remove('is-visible');stage.classList.add('is-dragging');stage.setPointerCapture(event.pointerId);target=pointerStart.target-dx/step;event.preventDefault();}}
    stage.classList.toggle('over-cover',Boolean(volume&&Math.abs(items[Number(volume.dataset.v)]?.r||0)<.5));wake();
  },{passive:false});
  stage.addEventListener('pointerup',event=>{
    if(!pointerStart)return;const wasDrag=dragging;pointerStart=null;dragging=false;stage.classList.remove('is-dragging');
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    if(wasDrag){target=Math.round(target);wake();return;}
    const volume=event.target.closest('.interface-panel');if(!volume)return;const item=items[Number(volume.dataset.v)];
    target=Math.round(s+item.r);updateCaption(item.i,1);prepareLaunch(projects[item.i].slug,item.node);openLink.click();
  });
  stage.addEventListener('pointercancel',()=>{pointerStart=null;dragging=false;stage.classList.remove('is-dragging');target=Math.round(target);wake();});
  stage.addEventListener('pointerleave',()=>{hover=-1;stage.classList.remove('over-cover');hoverLabel.classList.remove('is-visible');wake();});
  stage.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();target=Math.round(target)+(event.key==='ArrowRight'?1:-1);wake();}
    else if(event.key==='Enter'){
      event.preventDefault();const i=selected[mod(Math.round(target),selected.length)];
      const panel=items.filter(item=>item.i===i).sort((a,b)=>Math.abs(a.r)-Math.abs(b.r))[0];
      updateCaption(i,1);prepareLaunch(projects[i].slug,panel?.node);openLink.click();
    }else if(event.key==='Home'||event.key==='End'){event.preventDefault();target=selected.length*2+(event.key==='End'?selected.length-1:0);wake();}
  });
  stage.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)*.65||event.shiftKey){event.preventDefault();target+=Math.max(-1,Math.min(1,(event.deltaX||event.deltaY)/step*.4));clearTimeout(stage.snapTimer);stage.snapTimer=setTimeout(()=>{target=Math.round(target);wake();},140);wake();}},{passive:false});
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{target=Math.round(target)+Number(button.dataset.step);wake();}));
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;selected=projects.map((p,i)=>filter==='all'||p.group===filter?i:-1).filter(i=>i>=0);document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('article.project').forEach((article,i)=>article.hidden=!selected.includes(i));makePanels();}));
  document.querySelectorAll('[data-archive-view]').forEach(button=>button.addEventListener('click',()=>{const index=button.dataset.archiveView==='index';section.classList.toggle('is-index',index);document.querySelectorAll('[data-archive-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(!index){visible=true;wake();}}));
  let arrived=false;
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&!section.classList.contains('is-index');if(visible){if(!arrived&&motion())world.animate([{transform:'translateX(-100px) rotateX(-10deg)',opacity:0},{transform:'translateX(0) rotateX(-10deg)',opacity:1}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});arrived=true;wake();}else if(frame){cancelAnimationFrame(frame);frame=0;previous=0;}},{rootMargin:'100px 0px'});observer.observe(stage);
  addEventListener('resize',size,{passive:true});addEventListener('portfolio:motionchange',()=>{s=target;wake();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});

  const clipFor=rect=>`inset(${Math.max(0,rect.top)}px ${Math.max(0,innerWidth-rect.left-rect.width)}px ${Math.max(0,innerHeight-rect.top-rect.height)}px ${Math.max(0,rect.left)}px round 10px)`;
  addEventListener('portfolio:casechange',event=>{
    hoverLabel.classList.remove('is-visible');const {dialog}=event.detail;if(closing){closing.cancel();closing=null;}origin=event.detail.origin?.rect||origin;
    if(!motion())return;
    if(event.detail.origin){const r=event.detail.origin.rect;dialog.style.transformOrigin=`${r.left+r.width/2}px ${r.top+r.height/2}px`;dialog.animate([{clipPath:clipFor(r),transform:'rotate(0deg)'},{clipPath:'inset(0px 0px 0px 0px round 0px)',transform:'rotate(0deg)'}],{duration:750,easing:'cubic-bezier(.76,0,.18,1)'});}
    const copy=dialog.querySelector('.case-heading');if(copy)copy.animate([{transform:'translateY(34px)',clipPath:'inset(0 0 100% 0)'},{transform:'translateY(0)',clipPath:'inset(0)'}],{duration:850,delay:event.detail.origin?430:0,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
  });
  document.querySelector('#case-dialog').addEventListener('close',()=>{stage.classList.remove('is-opening');items.forEach(item=>item.node.classList.remove('is-launching'));if(motion())world.animate([{transform:'translateX(-100px) rotateX(-10deg)',opacity:0},{transform:'translateX(0) rotateX(-10deg)',opacity:1}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});origin=null;pendingLaunch=null;if(closing){closing.cancel();closing=null;}});
  window.LufforArchive={consumeLaunch(slug){const result=pendingLaunch?.slug===slug?pendingLaunch:null;pendingLaunch=null;return result;},dismiss(dialog,finish){if(!motion()||!origin)return false;if(closing)return true;const r=origin;closing=dialog.animate([{clipPath:'inset(0px 0px 0px 0px)',transform:'rotate(0deg)'},{clipPath:clipFor(r),transform:'rotate(0deg)'}],{duration:550,easing:'cubic-bezier(.76,0,.18,1)',fill:'forwards'});closing.finished.then(()=>{const a=closing;closing=null;origin=null;finish();a.cancel();wake();}).catch(()=>{});return true;}};
  document.querySelector('.archive-controls').hidden=false;document.querySelector('.archive-experience').hidden=false;root.classList.add('archive-ready');makePanels();
})();
