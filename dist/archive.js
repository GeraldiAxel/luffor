/* A curved WebGL ribbon of Luffor's original website/application concepts. */
(() => {
  'use strict';
  const root=document.documentElement,section=document.querySelector('#work'),stage=document.querySelector('.archive-stage'),world=document.querySelector('.archive-world');
  const projects=window.PORTFOLIO.projects,reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const interfaces=['forme','quiet-edit','common-ground','perspective'];
  projects.forEach((p,i)=>{p.interface=p.interface||'assets/interface-'+interfaces[i]+'.svg';p.group=p.group||(['websites','websites','applications','applications'][i]);});
  const motion=()=>!reduce.matches&&!root.classList.contains('motion-off');
  const mod=(v,n)=>((v%n)+n)%n,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const e=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const caption=document.querySelector('.archive-caption-copy'),openLink=caption.querySelector('.archive-open'),tabs=document.querySelector('.archive-project-tabs');
  let selected=projects.map((_,i)=>i),active=0,intended=null,visible=false,engine=null,pendingLaunch=null,origin=null,closing=null,pointerStart=null,dragging=false;
  const hoverLabel=document.createElement('div');hoverLabel.className='archive-hover-label';hoverLabel.setAttribute('aria-hidden','true');document.body.append(hoverLabel);
  const canvas=document.createElement('canvas');canvas.className='ribbon-gl';canvas.setAttribute('aria-hidden','true');stage.append(canvas);
  const status=document.createElement('span');status.className='ribbon-status';status.setAttribute('aria-hidden','true');status.textContent='PREPARING THE INTERFACES';stage.append(status);stage.dataset.renderer='loading';
  function swap(node,value){if(node.textContent===value)return;node.getAnimations?.().forEach(a=>a.cancel());node.textContent=value;if(motion())node.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});}
  function setCaption(i){active=i;const p=projects[i];swap(caption.querySelector('.archive-name'),p.title);swap(caption.querySelector('.archive-kicker'),String(i+1).padStart(2,'0')+' / '+p.category.toUpperCase());swap(caption.querySelector('.archive-description'),p.description);openLink.href='#project-'+p.slug;tabs.querySelectorAll('button').forEach((button,k)=>button.setAttribute('aria-pressed',String(selected[k]===i)));section.dataset.activeProject=p.slug;}
  function fallback(){world.innerHTML=selected.map(i=>`<div class="ribbon-fallback-card" data-project="${i}"><img src="${e(projects[i].interface)}" width="1280" height="800" alt="" draggable="false"><span>${e(projects[i].title)}</span></div>`).join('');}
  function goTo(i){intended=i;engine?.goTo(i);if(!engine)world.querySelectorAll('[data-project]').forEach(node=>node.hidden=Number(node.dataset.project)!==i);setCaption(i);}
  function step(direction){const n=selected.indexOf(intended??active);goTo(selected[mod(n+direction,selected.length)]);}
  function buildControls(){fallback();tabs.replaceChildren();selected.forEach(i=>{const b=document.createElement('button');b.type='button';b.className='archive-tab mono';b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label','Select '+projects[i].title);b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>goTo(i));tabs.append(b);});intended=null;setCaption(selected[0]);engine?.rebuild();}
  function prepareLaunch(i,card){const rect=engine?.boundsFor(i,card)||world.querySelector(`[data-project="${i}"]`)?.getBoundingClientRect();if(rect){pendingLaunch={slug:projects[i].slug,rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},rotation:0};engine?.setOpening(i,card);stage.classList.add('is-opening');}hoverLabel.classList.remove('is-visible');}
  function openProject(i,card){setCaption(i);prepareLaunch(i,card);openLink.click();}
  openLink.addEventListener('click',event=>{if(!event.metaKey&&!event.ctrlKey&&!pendingLaunch)prepareLaunch(active);});
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.step))));
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{selected=projects.map((p,i)=>b.dataset.filter==='all'||p.group===b.dataset.filter?i:-1).filter(i=>i>=0);document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('article.project').forEach((article,i)=>article.hidden=!selected.includes(i));buildControls();}));
  document.querySelectorAll('[data-archive-view]').forEach(b=>b.addEventListener('click',()=>{const index=b.dataset.archiveView==='index';section.classList.toggle('is-index',index);document.querySelectorAll('[data-archive-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(index)engine?.pause();else requestAnimationFrame(()=>{engine?.resize();engine?.wake();});}));
  stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;pointerStart={x:event.clientX,y:event.clientY,target:engine?.target||0};dragging=false;});
  stage.addEventListener('pointermove',event=>{
    const rect=stage.getBoundingClientRect();engine?.track(event.clientX-rect.left,event.clientY-rect.top,event.pointerType);
    if(pointerStart){const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;if(!dragging&&Math.abs(dy)>Math.abs(dx)*1.3&&Math.abs(dy)>8){pointerStart=null;return;}if(Math.abs(dx)>5){dragging=true;intended=null;stage.classList.add('is-dragging');stage.setPointerCapture(event.pointerId);engine?.setTarget(pointerStart.target-dx*1.65);engine?.setDragging(true);hoverLabel.classList.remove('is-visible');event.preventDefault();}}
    const hit=engine?.pick();stage.classList.toggle('over-cover',Boolean(hit));hoverLabel.classList.toggle('is-visible',Boolean(hit&&!dragging&&event.pointerType!=='touch'&&motion()));if(hit){hoverLabel.textContent=projects[hit.i].title;hoverLabel.style.transform=`translate(${event.clientX+14}px,${event.clientY+12}px)`;}
  },{passive:false});
  stage.addEventListener('pointerup',event=>{if(!pointerStart)return;pointerStart=null;const wasDrag=dragging;dragging=false;stage.classList.remove('is-dragging');engine?.setDragging(false);if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);if(wasDrag)return;const rect=stage.getBoundingClientRect();engine?.track(event.clientX-rect.left,event.clientY-rect.top,event.pointerType);const hit=engine?.pick();if(hit)openProject(hit.i,hit);else{const fallbackCard=event.target.closest('[data-project]');if(fallbackCard)openProject(Number(fallbackCard.dataset.project));}});
  stage.addEventListener('pointercancel',()=>{pointerStart=null;dragging=false;stage.classList.remove('is-dragging');engine?.setDragging(false);});
  stage.addEventListener('pointerleave',()=>{engine?.track(-9999,-9999,'');hoverLabel.classList.remove('is-visible');stage.classList.remove('over-cover');});
  stage.addEventListener('wheel',event=>{if(event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)*.65){event.preventDefault();intended=null;engine?.push((event.deltaX||event.deltaY)*(event.deltaMode===1?16:1)*1.25);}},{passive:false});
  stage.addEventListener('keydown',event=>{if(event.metaKey||event.ctrlKey||event.altKey)return;if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key)){event.preventDefault();step(['ArrowRight','ArrowDown'].includes(event.key)?1:-1);}else if(event.key==='Home'||event.key==='End'){event.preventDefault();goTo(selected[event.key==='Home'?0:selected.length-1]);}else if(event.key==='Enter'){event.preventDefault();openProject(intended??active);}else if(['PageDown','PageUp',' '].includes(event.key)){event.preventDefault();intended=null;engine?.push(stage.clientHeight*.9*(event.key==='PageUp'||event.shiftKey?-1:1));}});
  let lastScroll=scrollY;
  addEventListener('scroll',()=>{const delta=scrollY-lastScroll;lastScroll=scrollY;if(visible&&motion()&&!document.querySelector('dialog[open]')&&Math.abs(delta)<160){intended=null;engine?.push(delta*.35);}},{passive:true});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)engine?.wake();else engine?.pause();},{rootMargin:'50px 0px'}).observe(stage);
  addEventListener('portfolio:motionchange',()=>{engine?.syncMotion();hoverLabel.classList.remove('is-visible');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)engine?.pause();else engine?.wake();});
  addEventListener('resize',()=>engine?.resize(),{passive:true});
  const clipFor=r=>`inset(${Math.max(0,r.top)}px ${Math.max(0,innerWidth-r.left-r.width)}px ${Math.max(0,innerHeight-r.top-r.height)}px ${Math.max(0,r.left)}px round 12px)`;
  addEventListener('portfolio:casechange',event=>{hoverLabel.classList.remove('is-visible');const {dialog}=event.detail;if(closing){closing.cancel();closing=null;}origin=event.detail.origin?.rect||origin;if(!motion())return;if(event.detail.origin)dialog.animate([{clipPath:clipFor(origin),opacity:.7},{clipPath:'inset(0px 0px 0px 0px round 0px)',opacity:1}],{duration:750,easing:'cubic-bezier(.76,0,.18,1)'});const copy=dialog.querySelector('.case-heading');copy?.animate([{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:event.detail.origin?350:0,fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'});});
  document.querySelector('#case-dialog').addEventListener('close',()=>{origin=null;pendingLaunch=null;stage.classList.remove('is-opening');if(closing){closing.cancel();closing=null;}engine?.setOpening(null);engine?.reveal();});
  window.LufforArchive={consumeLaunch(slug){const r=pendingLaunch?.slug===slug?pendingLaunch:null;pendingLaunch=null;return r;},dismiss(dialog,finish){if(!motion()||!origin)return false;if(closing)return true;closing=dialog.animate([{clipPath:'inset(0px 0px 0px 0px)',opacity:1},{clipPath:clipFor(origin),opacity:.6}],{duration:550,easing:'cubic-bezier(.76,0,.18,1)',fill:'forwards'});closing.finished.then(()=>{const a=closing;closing=null;finish();a.cancel();}).catch(()=>{});return true;}};
  document.querySelector('.archive-controls').hidden=false;document.querySelector('.archive-experience').hidden=false;root.classList.add('archive-ready');buildControls();

  const SHAPE=`
    const float PI=3.141592653589793;
    float shape(float q,float c){return mix(1.0-q*q,sin(PI*q),c)*exp(-q*q);}
    float slope(float q,float c){return mix(-2.0*q*(2.0-q*q),PI*cos(PI*q)-2.0*q*sin(PI*q),c)*exp(-q*q);}
    float ramp(float s){s=clamp(s,-1.0,1.0);return s*(1.5-.5*s*s);}
  `;
  const vertex=SHAPE+`
    uniform float uSheetW,uDepth,uSpan,uCurve,uVelocity,uLeanA,uLeanW,uDiag,uAxis,uHover;
    uniform vec2 uRes; varying vec2 vUv; varying vec3 vWorld; varying float vX,vRoll;
    void main(){
      vUv=uv;vec3 p=position;
      vec2 q=uv*2.0-1.0;p.z-=uHover*.035*uRes.y*(1.0-q.x*q.x)*(1.0-q.y*q.y);
      vec4 wp=modelMatrix*vec4(p,1.0);if(uAxis>.5)wp.xy=wp.yx;
      float x=wp.x;float n=x/uSheetW;float zq=n*uSpan-.2;
      float roll=-.16*slope(zq,uCurve)/PI*uCurve;
      roll+=1.8*uVelocity*smoothstep(.3,.9,abs(n))*sign(n);
      wp.yz=mat2(cos(roll),sin(roll),-sin(roll),cos(roll))*wp.yz;
      wp.z-=uDepth*shape(zq,uCurve);wp.y+=uDiag*x;
      float rear=1.0-smoothstep(-1.0,.3,n);
      wp.y+=.1*uSheetW*uVelocity*rear;wp.z+=.2*uSheetW*uVelocity*rear;
      if(uLeanW>0.0)wp.z+=uLeanA*ramp(x/uLeanW);
      vX=x;vRoll=roll;if(uAxis>.5)wp.xy=wp.yx;vWorld=wp.xyz;
      gl_Position=projectionMatrix*viewMatrix*wp;
    }
  `;
  const fragment=SHAPE+`
    uniform sampler2D uImage,uOverlay;uniform vec4 uCrop;
    uniform float uSheetW,uDepth,uSpan,uCurve,uHover,uAlpha,uCorner,uAspect,uShade,uLeanA,uLeanW;
    varying vec2 vUv;varying vec3 vWorld;varying float vX,vRoll;
    void main(){
      vec4 image=texture2D(uImage,uCrop.xy+vUv*uCrop.zw);vec4 over=texture2D(uOverlay,vUv);
      vec3 color=mix(image.rgb,over.rgb,over.a);
      float q=vX/uSheetW*uSpan-.2;float z=-uDepth*shape(q,uCurve);
      float depth=uDepth>.0001?clamp((uDepth-z)/(2.0*uDepth),0.0,1.0):0.0;
      vec2 dome=vUv*2.0-1.0;depth=clamp(depth+uHover*.08*(1.0-dome.x*dome.x)*(1.0-dome.y*dome.y),0.0,1.0);
      color=mix(color,vec3(.0048),uShade*.68*depth);
      float dz=-uDepth*slope(q,uCurve)*uSpan/uSheetW;
      if(uLeanW>0.0){float s=min(abs(vX/uLeanW),1.0);dz+=uLeanA/uLeanW*1.5*(1.0-s*s);}
      vec3 normal=normalize(vec3(-dz,0.0,1.0));normal.yz=mat2(cos(vRoll),sin(vRoll),-sin(vRoll),cos(vRoll))*normal.yz;
      vec3 light=normalize(vec3(-.4,.5,1.0));color*=1.0-.12*(1.0-(dot(normal,light)*.5+.5));
      vec3 viewDir=normalize(cameraPosition-vWorld);float spec=pow(max(0.0,dot(normal,normalize(light+viewDir))),48.0);color+=spec*.22;
      vec2 p=vec2((vUv.x-.5)*uAspect,vUv.y-.5);vec2 b=vec2(uAspect*.5,.5)-uCorner;
      vec2 d=abs(p)-b;float dist=length(max(d,0.0))+min(max(d.x,d.y),0.0)-uCorner;
      float edge=1.0-smoothstep(-fwidth(dist),fwidth(dist),dist);
      gl_FragColor=vec4(color,edge*uAlpha);
      #include <colorspace_fragment>
    }
  `;
  const floorVertex=SHAPE+`
    uniform float uRun,uLeanA,uLeanW;varying vec2 vUv;varying vec3 vWorld;varying float vFar;
    void main(){vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);wp.z+=uLeanA*ramp(wp.x/uLeanW);vFar=-wp.z/uRun;vWorld=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}
  `;
  const floorFragment=`
    uniform vec2 uCells;uniform vec3 uBase;uniform float uAlpha,uSheetW;uniform sampler2D uReflection;uniform mat4 uReflectionMatrix;
    varying vec2 vUv;varying vec3 vWorld;varying float vFar;
    void main(){
      float fade=1.0-smoothstep(.2,.95,vFar);vec2 g=vec2(vUv.x*uCells.x,vFar*uCells.y);
      vec2 ln=1.0-smoothstep(vec2(0.0),max(fwidth(g)*1.5,vec2(.0001)),abs(fract(g)-.5));float grid=max(ln.x,ln.y);
      vec3 color=uBase*(1.0-.55*exp(-14.0*abs(vFar)))+grid*.012*fade;
      vec3 wp=vWorld;wp.x-=(wp.x+.6*uSheetW)*.35*abs(vFar);vec4 projected=uReflectionMatrix*vec4(wp,1.0);vec2 uv=projected.xy/projected.w*.5+.5;
      float edges=smoothstep(0.0,.1,uv.x)*smoothstep(0.0,.1,uv.y)*(1.0-smoothstep(.9,1.0,uv.x))*(1.0-smoothstep(.9,1.0,uv.y));
      float weight=vFar>0.0?exp(-6.0*vFar):exp(2.2*vFar);vec3 reflected=texture2D(uReflection,clamp(uv,0.0,1.0)).rgb;
      color+=reflected*grid*.42*weight*edges*fade;
      gl_FragColor=vec4(color,uAlpha*fade);
      #include <colorspace_fragment>
    }
  `;
  async function boot(){
    const THREE=await import('./assets/vendor/three.module.js');
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setClearColor('#010d21');renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(53.4,1,.1,2000);camera.position.set(0,0,41.18);camera.lookAt(0,0,0);
    const plane=new THREE.PlaneGeometry(1,1,96,24),reflectCamera=camera.clone(),reflection=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false});
    const floorMat=new THREE.ShaderMaterial({vertexShader:floorVertex,fragmentShader:floorFragment,transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,extensions:{derivatives:true},uniforms:{uRun:{value:1},uLeanA:{value:0},uLeanW:{value:1},uCells:{value:new THREE.Vector2(1,1)},uBase:{value:new THREE.Color('#010d21')},uAlpha:{value:0},uSheetW:{value:1},uReflection:{value:reflection.texture},uReflectionMatrix:{value:new THREE.Matrix4()}}});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(1,1,48,24),floorMat);floor.rotation.x=-Math.PI/2;floor.renderOrder=-1;floor.frustumCulled=false;scene.add(floor);
    const loader=new THREE.TextureLoader();
    const textures=await Promise.all(projects.map(p=>loader.loadAsync(p.interface).then(t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;})));
    await document.fonts.load('400 18px "DM Sans"').catch(()=>{});
    let cards=[],vw=1,vh=1,U=1,H=1,W=1,k=1,phone=false,length=1,current=0,target=0,frame=0,previous=0,intro=0,age=0,velocity=0,depth=1,openCard=null,drag=false,mouse={x:-9999,y:-9999,touch:false},hovered=null,failed=false;
    renderer.debug.onShaderError=()=>{failed=true;};
    function overlay(card){
      const old=card.mat.uniforms.uOverlay.value;old?.dispose();const c=document.createElement('canvas'),scale=2;c.width=Math.round(card.w*scale);c.height=Math.round(card.h*scale);const ctx=c.getContext('2d');ctx.scale(scale,scale);
      const inset=phone?12*U:20*U,font=phone?14*U:18*U;const gradient=ctx.createLinearGradient(0,card.h*.5,0,card.h);gradient.addColorStop(0,'transparent');gradient.addColorStop(1,'rgba(0,0,0,.65)');ctx.fillStyle=gradient;ctx.fillRect(0,card.h*.5,card.w,card.h*.5);
      ctx.font=`400 ${font}px "DM Sans",sans-serif`;ctx.fillStyle='#fff';ctx.shadowColor='#0008';ctx.shadowBlur=12*U;ctx.fillText(projects[card.i].title,inset,card.h-12*U);ctx.shadowBlur=0;
      const radius=12.5*U,x=card.w-inset-radius,y=card.h-10*U-radius;ctx.fillStyle='#010d21';ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.4*U;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-4.5*U,y);ctx.lineTo(x+4.5*U,y);if(phone){ctx.moveTo(x+.9*U,y-3.6*U);ctx.lineTo(x+4.5*U,y);ctx.lineTo(x+.9*U,y+3.6*U);}else{ctx.moveTo(x,y-4.5*U);ctx.lineTo(x,y+4.5*U);}ctx.stroke();
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());card.mat.uniforms.uOverlay.value=texture;
    }
    function rebuild(){
      cards.forEach(card=>{scene.remove(card.mesh);card.mat.uniforms.uOverlay.value?.dispose();card.mat.dispose();});cards=[];
      const count=Math.max(8,selected.length*2);for(let n=0;n<count;n++){
        const i=selected[n%selected.length],uniforms={uImage:{value:textures[i]},uOverlay:{value:null},uCrop:{value:new THREE.Vector4(0,0,1,1)},uRes:{value:new THREE.Vector2(1,1)},uSheetW:{value:1},uDepth:{value:0},uSpan:{value:1.15},uCurve:{value:1},uVelocity:{value:0},uLeanA:{value:0},uLeanW:{value:1},uDiag:{value:.03},uAxis:{value:0},uHover:{value:0},uAlpha:{value:0},uCorner:{value:.03},uAspect:{value:1.6},uShade:{value:1}};
        const mat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,extensions:{derivatives:true},uniforms});const mesh=new THREE.Mesh(plane,mat);mesh.frustumCulled=false;scene.add(mesh);cards.push({i,n,mat,mesh,base:0,w:1,h:1,pos:0,hover:0,bounds:null});
      }intro=motion()?0:1;age=0;resize(true);setCaption(selected[0]);
    }
    function resize(reset=false){
      const width=stage.clientWidth,height=stage.clientHeight;if(width<10||height<10)return;const wasPhone=phone;vw=width;vh=height;phone=vw<=649;U=vw/(phone?390:1500);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(vw,vh,false);camera.aspect=vw/vh;camera.updateProjectionMatrix();camera.updateMatrixWorld();H=Math.tan(THREE.MathUtils.degToRad(53.4/2))*41.18;W=H*camera.aspect;k=2*H/vh;
      let base=0;cards.forEach(card=>{card.w=phone?vw-40*U:Math.min(vh*.435,550*U)*1.6;card.h=phone?card.w/1.6:card.w/1.6;card.base=base;base+=(phone?card.h:card.w)+(phone?20:10)*U;card.mesh.scale.set(card.w*k,card.h*k,1);const u=card.mat.uniforms;u.uRes.value.set(card.w*k,card.h*k);u.uAspect.value=1.6;u.uCorner.value=(phone?15:20)*U/card.h;overlay(card);});length=base;
      if(reset||wasPhone!==phone){current=target=cards[0].base+(phone?cards[0].h:cards[0].w)/2-(phone?vh:vw)/2;}
      const a=-cards[0].h*k/2-.06*H,run=6*H,near=Math.min(41.18*(1-Math.abs(a)/H)+.2*H,41.18*.8),widthFloor=W*8;
      floor.position.set(0,a,(near-run)/2);floor.scale.set(widthFloor,near+run,1);floor.visible=!phone;const f=floorMat.uniforms;f.uRun.value=run;f.uLeanA.value=-.12*W;f.uLeanW.value=W;f.uSheetW.value=W;f.uCells.value.set(widthFloor/(.22*H),run/(.22*H));
      reflection.setSize(Math.max(1,Math.round(vw*.5)),Math.max(1,Math.round(vh*.5)));const mirror=a-.07*H;reflectCamera.copy(camera);reflectCamera.position.set(0,2*mirror,41.18);reflectCamera.up.set(0,-1,0);reflectCamera.lookAt(0,2*mirror,0);reflectCamera.updateMatrixWorld();f.uReflectionMatrix.value.multiplyMatrices(reflectCamera.projectionMatrix,reflectCamera.matrixWorldInverse);wake();
    }
    function setTarget(value){target=phone?value:current+Math.tanh((value-current)/Math.max(1,vw))*vw;wake();}
    function push(delta){if(openCard!==null)return;setTarget(target+delta);}
    function goTo(i){const candidates=cards.filter(card=>card.i===i).map(card=>{let value=card.base+(phone?card.h:card.w)/2-(phone?vh:vw)/2;value+=Math.round((current-value)/length)*length;return value;});target=candidates.sort((a,b)=>Math.abs(a-current)-Math.abs(b-current))[0];wake();}
    function shape(q,c){return((1-c)*(1-q*q)+c*Math.sin(Math.PI*q))*Math.exp(-q*q);}
    function slope(q,c){return((1-c)*(-2*q*(2-q*q))+c*(Math.PI*Math.cos(Math.PI*q)-2*q*Math.sin(Math.PI*q)))*Math.exp(-q*q);}
    function point(card,ux,uy){
      const p=new THREE.Vector3(card.mesh.position.x+(ux-.5)*card.w*k,card.mesh.position.y+(uy-.5)*card.h*k,0);if(phone){const a=p.x;p.x=p.y;p.y=a;}const span=phone?1:1.15,curve=phone?0:1,n=p.x/(phone?H:W),q=n*span-.2;let roll=-.16*slope(q,curve)/Math.PI*curve;if(!phone)roll+=1.8*velocity*THREE.MathUtils.smoothstep(Math.abs(n),.3,.9)*Math.sign(n);const y=p.y,z=p.z;p.y=y*Math.cos(roll)-z*Math.sin(roll);p.z=y*Math.sin(roll)+z*Math.cos(roll);p.z-=depth*shape(q,curve);if(!phone){p.y+=.03*p.x;const rear=1-THREE.MathUtils.smoothstep(n,-1,.3);p.y+=.1*W*velocity*rear;p.z+=.2*W*velocity*rear;const s=clamp(p.x/W,-1,1);p.z+=-.12*W*s*(1.5-.5*s*s);}if(phone){const a=p.x;p.x=p.y;p.y=a;}p.project(camera);return{x:(p.x*.5+.5)*vw,y:(-.5*p.y+.5)*vh};
    }
    function bounds(card){const points=[];for(let col=0;col<=5;col++){points.push(point(card,col/5,0),point(card,col/5,1));}const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),right=Math.max(...points.map(p=>p.x)),bottom=Math.max(...points.map(p=>p.y));return{left,top,right,bottom,width:right-left,height:bottom-top};}
    function pick(){if(drag||openCard!==null||mouse.x<0)return null;return cards.filter(card=>card.mesh.visible&&card.bounds&&mouse.x>=card.bounds.left&&mouse.x<=card.bounds.right&&mouse.y>=card.bounds.top&&mouse.y<=card.bounds.bottom).sort((a,b)=>Math.abs(a.pos+(phone?a.h:a.w)/2-(phone?vh:vw)/2)-Math.abs(b.pos+(phone?b.h:b.w)/2-(phone?vh:vw)/2))[0]||null;}
    function wake(){if(!frame&&visible&&!document.hidden&&!section.classList.contains('is-index')&&!failed)frame=requestAnimationFrame(render);}
    function pause(){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}
    function render(now){
      frame=0;if(!visible||document.hidden||section.classList.contains('is-index'))return;const dt=Math.min(.05,previous?(now-previous)/1000:.016);previous=now;const enabled=motion();age+=dt;intro=enabled?Math.min(1,age/.65):1;current+=(target-current)*(enabled?1-Math.pow(.9,dt*60):1);if(Math.abs(target-current)<.05)current=target;
      const t=Math.tanh((target-current)/(phone?245:550));velocity=enabled?Math.min(1,Math.abs(t*t)):0;depth=phone?H*.18*1.1*velocity:W*.2*(1+1.1*velocity);
      const axis=phone?vh:vw,left=-(length-axis)/2;let nearest=null,nearestDistance=Infinity;
      cards.forEach(card=>{card.pos=mod(card.base-current-left,length)+left;const screenX=phone?(vw-card.w)/2:card.pos,screenY=phone?card.pos:(vh-card.h)/2;card.mesh.position.set((screenX+card.w/2-vw/2)*k,-(screenY+card.h/2-vh/2)*k,0);card.mesh.visible=card.pos+(phone?card.h:card.w)>-axis*.75&&card.pos<axis*1.75&&(openCard===null||card.n===openCard);const distance=Math.abs(card.pos+(phone?card.h:card.w)/2-axis/2);if(distance<nearestDistance){nearest=card;nearestDistance=distance;}const u=card.mat.uniforms;u.uSheetW.value=phone?H:W;u.uDepth.value=depth;u.uSpan.value=phone?1:1.15;u.uCurve.value=phone?0:1;u.uVelocity.value=phone?0:velocity;u.uLeanA.value=phone?0:-.12*W;u.uLeanW.value=phone?0:W;u.uDiag.value=phone?0:.03;u.uAxis.value=phone?1:0;u.uShade.value=phone?0:1;u.uAlpha.value=intro;card.bounds=card.mesh.visible?bounds(card):null;});
      hovered=pick();let hoverMoving=false;cards.forEach(card=>{const goal=enabled&&!mouse.touch&&hovered===card?1:0;card.hover+=(goal-card.hover)*(1-Math.exp(-(goal?8:6)*dt));if(Math.abs(goal-card.hover)>.001)hoverMoving=true;card.mat.uniforms.uHover.value=card.hover;});
      if(nearest&&nearest.i!==active&&openCard===null)setCaption(nearest.i);
      floorMat.uniforms.uAlpha.value=intro*.9;
      if(!phone){floor.visible=false;renderer.setRenderTarget(reflection);renderer.render(scene,reflectCamera);renderer.setRenderTarget(null);floor.visible=true;}
      renderer.render(scene,camera);if(failed){fail();return;}
      if(intro<1||current!==target||hoverMoving)wake();else previous=0;
    }
    function fail(){failed=true;pause();stage.classList.remove('gl-ready');stage.classList.add('gl-failed');stage.dataset.renderer='fallback';canvas.style.display='none';fallback();}
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail();});
    engine={get target(){return target;},rebuild,resize,wake,pause,push,goTo,setTarget,pick,track(x,y,type){mouse={x,y,touch:type==='touch'};wake();},setDragging(value){drag=value;wake();},setOpening(i,card){if(i===null){openCard=null;}else{const chosen=card||cards.filter(c=>c.i===i).sort((a,b)=>Math.abs(a.pos+(phone?a.h:a.w)/2-(phone?vh:vw)/2)-Math.abs(b.pos+(phone?b.h:b.w)/2-(phone?vh:vw)/2))[0];openCard=chosen?.n??null;}wake();},boundsFor(i,card){const chosen=card||cards.filter(c=>c.i===i&&c.bounds).sort((a,b)=>Math.abs(a.pos+(phone?a.h:a.w)/2-(phone?vh:vw)/2)-Math.abs(b.pos+(phone?b.h:b.w)/2-(phone?vh:vw)/2))[0];if(!chosen?.bounds)return null;const r=stage.getBoundingClientRect(),b=chosen.bounds;return{left:r.left+b.left,top:r.top+b.top,width:b.width,height:b.height};},reveal(){age=0;intro=motion()?0:1;wake();},syncMotion(){if(!motion()){current=target;intro=1;cards.forEach(c=>c.hover=0);}stage.dataset.motion=motion()?'on':'off';wake();}};
    rebuild();stage.dataset.renderer='webgl';stage.dataset.motion=motion()?'on':'off';stage.classList.add('gl-ready');wake();
  }
  boot().catch(error=>{console.warn('The interface ribbon is using its static fallback.',error);stage.dataset.renderer='fallback';stage.classList.add('gl-failed');});
})();
