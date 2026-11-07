/* Lenis 1.3.27: page smoothing, native modal scrolling, accessible section links. */
(() => {
  'use strict';
  if(typeof window.Lenis!=='function')return;
  const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let lenis=null;
  const modalOpen=()=>Boolean(document.querySelector('dialog[open]'));
  const syncModal=()=>{
    if(!lenis)return;
    if(modalOpen())lenis.stop();else{lenis.start();lenis.resize();}
  };
  const sync=()=>{
    const enabled=!reduce.matches&&!root.classList.contains('motion-off')&&!document.hidden;
    if(!enabled){lenis?.destroy();lenis=null;return;}
    if(!lenis){
      lenis=new window.Lenis({
        autoRaf:true,
        lerp:.085,
        smoothWheel:true,
        syncTouch:false,
        respectReducedMotion:true,
        stopInertiaOnNavigate:true,
        virtualScroll:({event,deltaX,deltaY})=>!(event.type==='wheel'&&event.target instanceof Element&&event.target.closest('.archive-stage')&&(event.shiftKey||Math.abs(deltaX)>Math.abs(deltaY)*.65))
      });
    }
    syncModal();
  };
  document.addEventListener('click',event=>{
    if(!lenis||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href^="#"]');
    if(!link||link.hasAttribute('download')||link.target==='_blank')return;
    let target;try{target=document.getElementById(decodeURIComponent(link.hash.slice(1)));}catch{return;}
    if(!target||modalOpen())return;
    event.preventDefault();
    if(location.hash!==link.hash)history.pushState(null,'',link.hash);
    lenis.scrollTo(target,{onComplete:()=>{
      const focusTarget=target.id==='main'?target:target.querySelector('h2');
      if(focusTarget){focusTarget.setAttribute('tabindex','-1');focusTarget.focus({preventScroll:true});}
    }});
  });
  addEventListener('portfolio:motionchange',sync);
  addEventListener('portfolio:casechange',syncModal);
  addEventListener('portfolio:contactopen',syncModal);
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',syncModal));
  reduce.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  sync();
})();
