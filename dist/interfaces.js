/* Pointer response only: no ambient hero movement or continuous animation. */
(() => {
  const hero=document.querySelector('#hero'),visual=document.querySelector('.product-visual');
  if(!hero||!visual)return;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  let x=0,y=0,tx=0,ty=0,frame=0,visible=false;
  const enabled=()=>!reduce.matches&&fine.matches&&!document.documentElement.classList.contains('motion-off');
  const wake=()=>{if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);};
  function render(){frame=0;if(!visible||document.hidden)return;if(!enabled()){x=y=tx=ty=0;}else{x+=(tx-x)*.12;y+=(ty-y)*.12;}visual.style.setProperty('--product-x',x.toFixed(3)+'deg');visual.style.setProperty('--product-y',y.toFixed(3)+'deg');if(Math.abs(x-tx)>.005||Math.abs(y-ty)>.005)wake();}
  hero.addEventListener('pointermove',event=>{if(!enabled()||event.pointerType==='touch')return;const r=hero.getBoundingClientRect();tx=-(event.clientY-r.top-r.height/2)/r.height*2;ty=(event.clientX-r.left-r.width/2)/r.width*2.5;wake();},{passive:true});
  hero.addEventListener('pointerleave',()=>{tx=ty=0;wake();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else if(frame){cancelAnimationFrame(frame);frame=0;}}).observe(hero);
  addEventListener('portfolio:motionchange',wake);reduce.addEventListener('change',wake);fine.addEventListener('change',wake);document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});
})();
