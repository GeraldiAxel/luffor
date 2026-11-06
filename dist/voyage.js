/* A single ship riding layered ink waves; normal document scrolling remains native. */
(() => {
  const hero=document.querySelector('.edition-hero'),ship=document.querySelector('.voyage-ship');if(!hero||!ship)return;
  const back=document.querySelector('.voyage-water-back'),front=document.querySelector('.voyage-water-front'),ns='http://www.w3.org/2000/svg';
  const layers=[{svg:back,y:46,a:8,k:1.4,v:.5,p:.2},{svg:back,y:66,a:10,k:1.9,v:.7,p:2},{svg:front,y:83,a:9,k:1.7,v:.8,p:3,fill:true},{svg:front,y:101,a:7,k:2.2,v:.55,p:1.2},{svg:front,y:119,a:10,k:1.4,v:.65,p:4.3,fill:true},...Array.from({length:9},(_,i)=>({svg:front,y:126+i*4,a:5+i*.2,k:1.6+i*.08,v:.45,p:i*.22,alpha:.12+i*.018}))];
  layers.forEach(layer=>{layer.path=document.createElementNS(ns,'path');layer.path.setAttribute('fill',layer.fill?'#02204f':'none');layer.path.setAttribute('opacity',String(layer.alpha||.35));layer.svg.append(layer.path);});
  let frame=0,visible=false,previous=0,time=0,mouseX=0,mouseY=0,x=0,y=0,lastPaint=-1;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const allowed=()=>!reduce.matches&&!document.documentElement.classList.contains('motion-off');
  const yAt=(l,px,t)=>l.y+l.a*Math.sin(px*.008*l.k+t*l.v+l.p)+l.a*.4*Math.sin(px*.017*l.k-t*l.v*.7+l.p*1.7);
  const wake=()=>{if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);};
  function render(now){frame=0;if(!visible||document.hidden)return;const animate=allowed(),dt=Math.min(.05,previous?(now-previous)/1000:.016);previous=now;if(animate)time+=dt;x+=(mouseX-x)*.055;y+=(mouseY-y)*.055;
    if(now-lastPaint>30||!animate){layers.forEach(l=>{let d='';for(let px=-20;px<=820;px+=18)d+=(px===-20?'M':'L')+px.toFixed(1)+' '+yAt(l,px,time).toFixed(1);if(l.fill)d+='L820 200L-20 200Z';l.path.setAttribute('d',d);});lastPaint=now;}
    const swell=yAt(layers[2],400,time)-layers[2].y,slope=(yAt(layers[2],445,time)-yAt(layers[2],355,time))/90,rect=hero.getBoundingClientRect(),scroll=Math.max(0,Math.min(1,-rect.top/rect.height));
    ship.style.transform=`translate3d(${animate?x:0}px,${animate?swell*.75+y-scroll*24:0}px,0) rotate(${animate?Math.atan(slope)*57.3*.58:0}deg) scale(${animate?1-scroll*.15:1})`;
    hero.style.setProperty('--voyage-copy-y',animate?(-scroll*18).toFixed(2)+'px':'0px');if(animate)wake();else previous=0;
  }
  hero.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const r=hero.getBoundingClientRect();mouseX=(event.clientX-r.left-r.width/2)/r.width*14;mouseY=(event.clientY-r.top-r.height/2)/r.height*7;},{passive:true});hero.addEventListener('pointerleave',()=>{mouseX=0;mouseY=0;});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else if(frame){cancelAnimationFrame(frame);frame=0;previous=0;}},{rootMargin:'50px 0px'});observer.observe(hero);
  addEventListener('portfolio:motionchange',wake);reduce.addEventListener('change',wake);document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});addEventListener('resize',wake,{passive:true});
  let crossing=false;
  document.querySelector('[data-voyage-enter]').addEventListener('click',async event=>{
    if(!allowed()||event.metaKey||event.ctrlKey)return;
    event.preventDefault();if(crossing)return;crossing=true;
    const destination=document.querySelector(event.currentTarget.hash);
    const curtain=document.createElement('div');curtain.className='wave-curtain';curtain.setAttribute('aria-hidden','true');curtain.innerHTML='<svg viewBox="0 0 1440 140" preserveAspectRatio="none"><path d="M0 87C100 6 180 120 300 57S500 110 640 46S850 125 1000 51S1250 91 1440 20V150H0Z" fill="#02204f" stroke="#f9f5eb" stroke-width=".7"/></svg>';document.body.append(curtain);
    try{
      await curtain.animate([{transform:'translateY(115%)'},{transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.76,0,.18,1)',fill:'forwards'}).finished;
      destination.scrollIntoView({behavior:'instant'});history.pushState(null,'','#'+destination.id);
      const heading=destination.querySelector('h2');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
      await curtain.animate([{transform:'translateY(0)'},{transform:'translateY(-125%)'}],{duration:600,easing:'cubic-bezier(.76,0,.18,1)',fill:'forwards'}).finished;
    }catch{/* Navigation can cancel a transition. */}finally{curtain.remove();crossing=false;}
  });
})();
