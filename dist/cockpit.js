/* Original Blender-authored wheelhouse, rendered locally with Three.js 0.160.
   One persistent world; authored camera stops; one shared lighthouse clock. */
(() => {
  'use strict';
  const stage=document.querySelector('#wheelhouse');
  if(!stage)return;
  const root=document.documentElement,canvas=stage.querySelector('canvas');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const small=()=>stage.clientWidth<760;
  const panel=stage.querySelector('.scene-panel'),title=panel.querySelector('h2'),content=panel.querySelector('.panel-content');
  const status=stage.querySelector('.scene-status'),announcement=document.querySelector('#cockpit-announcement');
  const pause=stage.querySelector('.scene-pause'),home=document.querySelector('.scene-return');
  const buttons=[...document.querySelectorAll('[data-cockpit-go]')];
  const hotspots=[...stage.querySelectorAll('.scene-hotspot')];
  const email=window.PORTFOLIO?.contact?.email||'lufforsolution@gmail.com';
  document.querySelector('.cockpit-enquiry').href='mailto:'+email;
  const config=Object.freeze({rotationSeconds:12,beamAngle:.105,beamIntensity:8,pixelRatio:1.5,pointerStrength:.04});
  const layout=window.LUFFOR_SHIP,views=layout.views;
  const shipPoint=a=>a.map((value,index)=>value*(layout.scale?.[index]||1));
  const concepts=[
    {name:'Forme',kind:'Company website',image:'assets/project-forme.svg',copy:'A service-led website with a clearer path from first visit to enquiry.'},
    {name:'The Quiet Edit',kind:'Publishing website',image:'assets/project-quiet-edit.svg',copy:'An editorial interface that gives articles, topics, and featured stories room to breathe.'},
    {name:'Common Ground',kind:'Custom application',image:'assets/project-common-ground.svg',copy:'A shared workspace for people, projects, and everyday tasks.'},
    {name:'Perspective',kind:'Dashboard & UI / UX',image:'assets/project-perspective.svg',copy:'A reporting interface that organizes complex information into a useful overview.'}
  ];
  let active='helm',engine=null,visible=true,localPaused=false,ready=false,conceptIndex=0;
  const movementAllowed=()=>!reduce.matches&&!root.classList.contains('motion-off');
  const ambientAllowed=()=>movementAllowed()&&!localPaused;
  const loadingLabel=stage.querySelector('.scene-loading');
  let introSkipped=!movementAllowed();
  stage.dataset.intro=introSkipped?'complete':'loading';
  const skip=document.createElement('button');skip.type='button';skip.className='scene-skip';skip.textContent='Skip intro ↗';skip.setAttribute('aria-label','Skip wheelhouse introduction');skip.hidden=introSkipped;stage.append(skip);
  // The first geometry is a small architectural blockout authored in Blender.
  let wakeBootstrap=()=>{};
  const boot={wake(){wakeBootstrap();},hide(){}};
  function finishIntro(){
    const restoreFocus=document.activeElement===skip;
    introSkipped=true;stage.dataset.intro='complete';skip.hidden=true;canvas.style.opacity='';boot.hide(true);
    if(ready)loadingLabel.hidden=true;
    engine?.finishIntro();updatePause();
    if(restoreFocus)(ready?pause:document.querySelector('.scene-destinations [data-cockpit-go="helm"]')).focus({preventScroll:true});
  }
  skip.addEventListener('click',finishIntro);
  function projectPreview(){
    const p=concepts[conceptIndex];
    content.innerHTML=`<p class="panel-concept-note">INDEPENDENT INTERFACE CONCEPTS</p><img class="panel-project-image" src="${p.image}" width="1600" height="1000" alt="${p.name} ${p.kind.toLowerCase()} interface concept"><div class="panel-project-nav">${concepts.map((c,i)=>`<button type="button" data-concept="${i}" aria-label="View ${c.name} concept" aria-pressed="${i===conceptIndex}">${String(i+1).padStart(2,'0')}</button>`).join('')}</div><h3>${p.name}</h3><p>${p.copy}</p><a class="panel-enquiry">Build your next project <span aria-hidden="true">↗</span></a>`;
    content.querySelector('.panel-enquiry').href='mailto:'+email;
  }
  function showPanel(name){
    const hasPanel=['chart','console','radio'].includes(name);
    panel.hidden=!hasPanel;stage.classList.toggle('scene-panel-open',hasPanel);
    home.disabled=name==='helm';
    if(!hasPanel)return;
    const index={chart:'02 / CHART TABLE',console:'03 / INSTRUMENTS',radio:'04 / MARINE RADIO',lighthouse:'05 / THE LIGHTHOUSE'};
    panel.querySelector('.panel-index').textContent=index[name];
    if(name==='chart'){
      title.textContent='A clearer way forward.';projectPreview();
    }else if(name==='console'){
      title.textContent='Built around your business.';
      content.innerHTML='<p>From an unclear idea to a useful digital solution. Strategy, design, and development, working together.</p><ul class="panel-service-list"><li>01 &nbsp; Website design & development</li><li>02 &nbsp; Custom web applications</li><li>03 &nbsp; UI / UX & digital strategy</li></ul><a class="panel-enquiry">Discuss your project <span aria-hidden="true">↗</span></a>';
      content.querySelector('a').href='mailto:'+email;
    }else if(name==='radio'){
      title.textContent='Send a signal.';
      content.innerHTML='<p>Tell us what you’re trying to solve. We’ll start with the right questions.</p><a class="panel-enquiry"><span class="panel-email"></span><span aria-hidden="true">↗</span></a><p class="radio-signoff">YOUR NEXT CHAPTER STARTS WITH A CONVERSATION.</p>';
      content.querySelector('a').href='mailto:'+email;content.querySelector('.panel-email').textContent=email;

    }
    panel.scrollTop=0;
    if(movementAllowed())panel.animate([{opacity:0},{opacity:1}],{duration:200,easing:'ease-out'});
  }
  function navigate(name,instant=false){
    if(!views[name])return;
    if(!introSkipped)finishIntro();
    active=name;
    buttons.forEach(b=>{if(b.closest('.scene-destinations'))b.setAttribute('aria-pressed',String(b.dataset.cockpitGo===name));});
    stage.dataset.destination=name;
    showPanel(name);
    engine?.go(name,instant||!movementAllowed());
    announcement.textContent=views[name].label;
    status.textContent=name==='helm'?'Drag to look around. Click to explore.':views[name].label;
  }
  buttons.forEach(b=>b.addEventListener('click',event=>{
    navigate(b.dataset.cockpitGo);
    if(b.classList.contains('scene-hotspot')){const focusTarget=panel.hidden?stage:title;focusTarget.setAttribute('tabindex','-1');focusTarget.focus({preventScroll:true});}
    if(!visible)stage.scrollIntoView({behavior:movementAllowed()?'smooth':'instant',block:'start'});
  }));
  document.querySelector('.site-header .wordmark').addEventListener('click',()=>navigate('helm'));
  panel.querySelector('.scene-panel-close').addEventListener('click',()=>{
    // Move focus before hiding the focused panel.
    document.querySelector('.scene-destinations [data-cockpit-go="helm"]').focus({preventScroll:true});navigate('helm');
  });
  content.addEventListener('click',event=>{const b=event.target.closest('[data-concept]');if(b){conceptIndex=Number(b.dataset.concept);projectPreview();content.querySelector(`[data-concept="${conceptIndex}"]`).focus({preventScroll:true});}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active!=='helm'&&event.target.closest('#hero,.site-header')&&!document.querySelector('dialog[open]')){event.preventDefault();document.querySelector('.scene-destinations [data-cockpit-go="helm"]').focus({preventScroll:true});navigate('helm');}});
  function updatePause(){
    pause.hidden=!ready||!introSkipped;pause.disabled=!movementAllowed();
    pause.setAttribute('aria-pressed',String(localPaused));
    pause.textContent=!movementAllowed()?'Motion reduced':localPaused?'▷  Resume':'Ⅱ  Pause';
    pause.setAttribute('aria-label',!movementAllowed()?'Wheelhouse motion reduced':localPaused?'Resume wheelhouse animation':'Pause wheelhouse animation');
    engine?.wake();
  }
  pause.addEventListener('click',()=>{localPaused=!localPaused;updatePause();});
  document.querySelectorAll('[data-look]').forEach(button=>button.addEventListener('click',()=>{if(!introSkipped)finishIntro();engine?.look(Number(button.dataset.look));}));
  reduce.addEventListener('change',()=>{if(reduce.matches&&!introSkipped)finishIntro();engine?.go(active,true);updatePause();});
  addEventListener('portfolio:motionchange',()=>{if(!movementAllowed()){if(!introSkipped)finishIntro();engine?.go(active,true);}updatePause();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;boot.wake();engine?.wake();},{rootMargin:'80px'}).observe(stage);
  document.addEventListener('visibilitychange',()=>{boot.wake();engine?.wake();});
  function fallback(message){
    introSkipped=true;stage.dataset.intro='complete';skip.hidden=true;canvas.style.opacity='';boot.hide(true);
    ready=false;stage.dataset.renderer='fallback';canvas.hidden=true;hotspots.forEach(b=>b.hidden=true);pause.hidden=true;
    stage.querySelector('.scene-loading').hidden=true;
    status.textContent=message||'Still view. Explore with the cabin navigation.';
  }
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();engine?.stop();fallback('Still view. Explore with the cabin navigation.');});
  window.LufforCockpit=Object.freeze({get state(){return {destination:active,renderer:stage.dataset.renderer,paused:localPaused,reduced:!movementAllowed(),visible,beaconAngle:engine?.beaconAngle||0,drawCalls:engine?.drawCalls||0,triangles:engine?.triangles||0,transitioning:engine?.transitioning||false};}});

  async function initialize(){
    const [THREE,{GLTFLoader}]=await Promise.all([import('./assets/vendor/three.module.js'),import('./assets/vendor/GLTFLoader.js')]);
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,small()?1.25:config.pixelRatio));
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const wireScene=new THREE.Scene();wireScene.background=new THREE.Color('#030505');
    const loader=new GLTFLoader();let wireModel=null,wireFrame=0,wireStart=0,introElapsed=0,introDisposed=false;
    function disposeIntro(){
      if(introDisposed)return;introDisposed=true;if(wireFrame)cancelAnimationFrame(wireFrame);wakeBootstrap=()=>{};
      if(wireModel){wireModel.traverse(o=>{if(o.geometry)o.geometry.dispose();});wireScene.clear();wireModel=null;}
      wireBlack.dispose();wireInk.dispose();colorBuffer.dispose();outlineBuffer.dispose();revealPass.material.dispose();revealPass.geometry.dispose();
    }
    const wireBlack=new THREE.MeshBasicMaterial({color:'#030505',polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,toneMapped:false});
    const wireInk=new THREE.LineBasicMaterial({color:'#dddcd8',transparent:true,opacity:.82,toneMapped:false});
    // Sample the same camera twice. The cell grid stays fixed during the reveal.
    const colorBuffer=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
    const outlineBuffer=new THREE.WebGLRenderTarget(1,1);
    const revealScene=new THREE.Scene(),screenCamera=new THREE.Camera();
    const revealPass=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
      uniforms:{colorFrame:{value:colorBuffer.texture},edges:{value:outlineBuffer.texture},progress:{value:0},cells:{value:new THREE.Vector2()}},
      vertexShader:'varying vec2 uvScreen;void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:`varying vec2 uvScreen;
uniform sampler2D colorFrame,edges;
uniform vec2 cells;uniform float progress;
void main(){
  vec2 sampleAt=(floor(uvScreen*cells)+.5)/cells;
  vec3 coarse=texture2D(colorFrame,sampleAt).rgb;
  float gray=dot(coarse,vec3(.2126,.7152,.0722));
  float steps=floor(clamp(gray,0.,1.)*7.)/7.;
  float lines=texture2D(edges,uvScreen).r;
  vec3 ink=vec3(max(lines*(1.-smoothstep(.44,.80,progress)),steps*smoothstep(.12,.61,progress)));
  vec3 colored=mix(coarse,texture2D(colorFrame,uvScreen).rgb,smoothstep(.78,.99,progress));
  gl_FragColor=vec4(mix(ink,colored,smoothstep(.53,.98,progress)),1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
    }));
    revealScene.add(revealPass);
    function renderReveal(progress){
      const width=canvas.width,height=canvas.height;
      colorBuffer.setSize(width,height);outlineBuffer.setSize(width,height);
      renderer.setRenderTarget(colorBuffer);renderer.render(scene,camera);
      renderer.setRenderTarget(outlineBuffer);renderer.render(wireScene,camera);
      renderer.setRenderTarget(null);
      revealPass.material.uniforms.progress.value=progress;
      revealPass.material.uniforms.cells.value.set(stage.clientWidth/5,stage.clientHeight/5);
      renderer.render(revealScene,screenCamera);
    }
    const scene=new THREE.Scene();scene.background=new THREE.Color('#c8d8d0');scene.fog=new THREE.FogExp2('#c8d8d0',.0045);
    const camera=new THREE.PerspectiveCamera(61,1,.08,240);
    const target=new THREE.Vector3(),basePosition=new THREE.Vector3(),baseTarget=new THREE.Vector3(),tmp=new THREE.Vector3(),baseQuaternion=new THREE.Quaternion();
    const head=new THREE.Vector2(),headTarget=new THREE.Vector2(),headQuaternion=new THREE.Quaternion(),lookMatrix=new THREE.Matrix4(),worldUp=new THREE.Vector3(0,1,0);
    let fov=61,flight=null,frame=0,last=0,elapsed=0,needsFrame=true,hovered=null,disposed=false,diagnosticTick=-1;
    const pointer=new THREE.Vector2(),pointerTarget=new THREE.Vector2(),raycaster=new THREE.Raycaster();
    const lighthouse=new THREE.Vector3(6.9,5.034,-24),beamDirection=new THREE.Vector3();
    const homeDirection=new THREE.Vector3(...shipPoint([.35,1.72,-1.72])).sub(lighthouse).normalize();
    const homeAngle=Math.atan2(homeDirection.x,homeDirection.z);
    const hemi=new THREE.HemisphereLight('#c7d1df','#88654c',1.04);scene.add(hemi);
    const sun=new THREE.DirectionalLight('#ffdcac',2.7);sun.position.set(9,7,-17);sun.target.position.fromArray(shipPoint([0,1.5,5]));scene.add(sun,sun.target);
    sun.castShadow=true;sun.shadow.mapSize.set(small()?1024:1536,small()?1024:1536);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:65});sun.shadow.normalBias=.04;sun.shadow.bias=-.0001;sun.shadow.radius=3;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;
    const fill=new THREE.PointLight('#ffe7bd',8,12,2);fill.position.fromArray(shipPoint([.1,3.7,1.5]));scene.add(fill);
    const chartLight=new THREE.PointLight('#ffd89e',3.5,5,2);chartLight.position.fromArray(shipPoint([-3.9,1.75,-.95]));scene.add(chartLight);
    const consoleLight=new THREE.PointLight('#81cbb9',.65,3,2);consoleLight.position.fromArray(shipPoint([.35,1.85,-1.4]));scene.add(consoleLight);
    const radioLight=new THREE.PointLight('#b2d6bc',.6,2,2);radioLight.position.fromArray(shipPoint([3.4,1.85,.1]));scene.add(radioLight);
    const beacon=new THREE.SpotLight('#fff1cc',config.beamIntensity,70,config.beamAngle,.6,0);
    beacon.position.copy(lighthouse);beacon.castShadow=true;beacon.shadow.mapSize.set(small()?512:1024,small()?512:1024);
    beacon.shadow.camera.near=1.45;beacon.shadow.camera.far=65;beacon.shadow.bias=-.0002;beacon.shadow.normalBias=.025;beacon.shadow.focus=1;
    scene.add(beacon,beacon.target);
    for(const [color,power,position] of [['#ffe7bd',16,[-3.8,2.9,12.7]],['#fff0d5',20,[0,6.8,14]],['#ffe5b5',12,[-5.2,5.8,8.5]],['#fff0d5',18,[6,5.3,9]]]){const l=new THREE.PointLight(color,power,13,2);l.position.fromArray(shipPoint(position));scene.add(l);}
    stage.dataset.crew='3';
    // The sky is a painted gradient with restrained stars, generated locally.
    const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vDirection;
void main(){
  vec3 d=normalize(vDirection);float h=clamp(d.y*1.6,0.,1.);
  vec3 c=mix(vec3(.66,.63,.59),vec3(.32,.42,.51),pow(h,.55));
  vec2 p=d.xz/max(d.y+.22,.1);
  float cloud=.5+.18*sin(p.x*2.+p.y*.9)+.12*sin(4.*p.y+sin(p.x*3.))
    +.065*sin(p.x*9.+p.y*7.)+.027*sin(p.y*24.+p.x*14.);
  float veil=smoothstep(.47,.8,cloud)*smoothstep(.0,.18,d.y);
  c=mix(c,vec3(.81,.79,.75),veil*.34);gl_FragColor=vec4(c,1.);
}`});
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(160,32,20),skyMaterial));
    const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(.65,24,16),new THREE.MeshBasicMaterial({color:'#fff0bf'}));sunDisc.position.set(-22,24,-90);scene.add(sunDisc);
    // Sea normals and narrow glints are animated entirely in this inexpensive pass.
    const waterMaterial=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uBeacon:{value:0}},vertexShader:`varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`varying vec3 vWorld;uniform float uTime;uniform float uBeacon;
void main(){
  vec2 p=vWorld.xz;float t=uTime*.24;
  float swell=sin(p.y*.24+p.x*.13)+.65*sin(p.x*.35-p.y*.07);
  float a=sin(p.x*1.63+p.y*.61+t+swell*2.4);
  float b=sin(p.x*2.55-p.y*1.31-t*.7+swell*1.7);
  float ripple=a*.40+b*.25+.23*sin(p.y*5.1+p.x*2.9+swell*4.-t)+.12*sin(p.x*8.4+p.y*3.3+t);float glint=pow(max(0.,ripple),18.);
  vec3 c=mix(vec3(.075,.14,.15),vec3(.19,.30,.31),ripple*.5+.5);
  c+=vec3(.25,.29,.23)*glint/(1.+length(p)*.03);
  float fog=1.-exp(-length(p)*.009);c=mix(c,vec3(.70,.79,.76),fog);
  gl_FragColor=vec4(c,1.);
}`});
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(300,300),waterMaterial);sea.rotation.x=-Math.PI/2;sea.position.set(0,-1.69,-45);scene.add(sea);
    // A single volume follows the SAME direction as the real shadow-casting light.
    // Its cabin portion is clipped against the forward window aperture/mullions.
    const length=62;
    const beamGeometry=new THREE.ConeGeometry(Math.tan(config.beamAngle)*length,length,40,1,true);beamGeometry.translate(0,-length/2,0);
    const beamMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uOrigin:{value:lighthouse}},vertexShader:`varying vec3 vWorld;varying vec2 vUv;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`varying vec3 vWorld;varying vec2 vUv;uniform float uTime;uniform vec3 uOrigin;
void main(){
  if(vWorld.z>1.&&vWorld.y<0.)discard;
  if(vWorld.z>4.&&abs(vWorld.x)>7.1)discard;
  // Intersect the ray with each glazed segment before shading air inside.
  vec2 bow[6];bow[0]=vec2(-7.011,.608);bow[1]=vec2(-4.346,-2.584);
  bow[2]=vec2(-1.476,-3.496);bow[3]=vec2(1.476,-3.496);
  bow[4]=vec2(4.346,-2.584);bow[5]=vec2(7.011,.608);
  vec2 ray=vWorld.xz-uOrigin.xz;
  for(int i=0;i<5;i++){
    vec2 edge=bow[i+1]-bow[i],d=bow[i]-uOrigin.xz;
    float det=ray.x*edge.y-ray.y*edge.x;
    if(abs(det)<.0001)continue;
    float t=(d.x*edge.y-d.y*edge.x)/det;
    float u=(d.x*ray.y-d.y*ray.x)/det;
    if(t>0.&&t<1.&&u>=0.&&u<=1.){
      float y=mix(uOrigin.y,vWorld.y,t);
      if(y<1.70||y>4.10||min(u,1.-u)*length(edge)<.06)discard;
    }
  }
  float fade=pow(1.-vUv.y,.5);gl_FragColor=vec4(vec3(1.,.91,.70),.037*fade);
}`});
    const beam=new THREE.Mesh(beamGeometry,beamMaterial);beam.position.copy(lighthouse);beam.renderOrder=2;scene.add(beam);
    // A tiny halo makes the lantern readable between passes, without a lens flare.
    const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;
    const hc=haloCanvas.getContext('2d'),gradient=hc.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,245,204,.9)');gradient.addColorStop(.17,'rgba(255,233,172,.45)');gradient.addColorStop(1,'rgba(255,233,172,0)');hc.fillStyle=gradient;hc.fillRect(0,0,64,64);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(haloCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.copy(lighthouse);halo.scale.set(1.3,1.3,1);scene.add(halo);
    const modelPromise=loader.loadAsync('./assets/luffor-wheelhouse.glb');
    // Fetch this 0.2 MB blockout while the detailed ship loads in parallel.
    if(!introSkipped){
      const block=await loader.loadAsync('./assets/ship-blockout.glb').catch(()=>null);
      if(block&&!introSkipped){
        wireModel=block.scene;
        const meshes=[];wireModel.traverse(o=>{if(o.isMesh)meshes.push(o);});
        meshes.forEach(o=>{o.material=wireBlack;const line=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,35),wireInk);o.add(line);});
        wireScene.add(wireModel);wireStart=performance.now();stage.dataset.renderer='preview';stage.dataset.intro='wireframe';
        function drawBlockout(now){
          wireFrame=0;if(ready||introSkipped||!visible||document.hidden)return;
          const view=resolveView('helm');
          const t=Math.min((now-wireStart)/1000,.45)/layout.intro.duration,e=t*t*(3-2*t);
          renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.fov=view.f;
          camera.position.copy(view.p).addScaledVector(new THREE.Vector3(...layout.intro.cameraOffset),1-e);camera.lookAt(view.t);camera.updateProjectionMatrix();
          renderer.render(wireScene,camera);wireFrame=requestAnimationFrame(drawBlockout);
        }
        wakeBootstrap=()=>{if(!wireFrame&&!ready&&!introSkipped&&visible&&!document.hidden)wireFrame=requestAnimationFrame(drawBlockout);};wakeBootstrap();
      }
    }
    const model=await modelPromise;
    if(wireFrame){cancelAnimationFrame(wireFrame);wireFrame=0;}wakeBootstrap=()=>{};
    introElapsed=wireStart?Math.min((performance.now()-wireStart)/1000,.45):0;
    // Model-space grain stays attached to the deck, even on the stair route.
    // Restrict fine texture to surfaces large enough to resolve it at this scale.
    const surfaced=new Set();
    function finishSurface(material){
      if(surfaced.has(material))return;
      surfaced.add(material);
      const timber=/Timber|Deck |Cabin |Frames /.test(material.name);
      const cloth=/shirt|knit|trousers|woven/.test(material.name);
      if(!timber&&!cloth)return;
      material.onBeforeCompile=shader=>{
        shader.vertexShader='varying vec3 surfacePoint;\n'+shader.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\n surfacePoint=(modelMatrix*vec4(transformed,1.)).xyz;');
        shader.fragmentShader='varying vec3 surfacePoint;\n'+shader.fragmentShader.replace('#include <color_fragment>', `
          #include <color_fragment>
          vec3 p=surfacePoint;
          float frequency=${cloth?'156.':'90.'};
          float phase=p.x*frequency+sin(p.z*3.1+p.y*2.3)*1.6+sin(p.z*.81)*4.;
          float attenuation=1.-smoothstep(.25,2.7,fwidth(phase));
          float grain=sin(phase)*.065+sin(phase*1.77)*.033;
          float board=floor(p.x/.328);
          float tint=fract(sin(board*45.31)*984.74);
          diffuseColor.rgb*=1.+grain*attenuation+${cloth?'0.':'(tint-.5)*.105'};
        `);
      };
      material.customProgramCacheKey=()=>cloth?'woven':'woodgrain';
    }
    model.scene.traverse(o=>{
      if(!o.isMesh)return;
      o.castShadow=true;o.receiveShadow=true;
      const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{finishSurface(m);if(m.map)m.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());});
    });scene.add(model.scene);
    // The generated radar texture is placed over its authored screen surface.
    const radarCanvas=document.createElement('canvas');radarCanvas.width=512;radarCanvas.height=256;
    const rc=radarCanvas.getContext('2d'),radarTexture=new THREE.CanvasTexture(radarCanvas);radarTexture.colorSpace=THREE.SRGBColorSpace;
    const radar=new THREE.Mesh(new THREE.PlaneGeometry(1.1*(layout.scale?.[0]||1),.39),new THREE.MeshBasicMaterial({map:radarTexture}));radar.position.fromArray(shipPoint([.35,1.72,-1.771]));scene.add(radar);
    let radarTick=-1;
    function drawRadar(t){
      const tick=Math.floor(t*8);if(tick===radarTick)return;radarTick=tick;
      rc.fillStyle='#081c1c';rc.fillRect(0,0,512,256);rc.strokeStyle='#285b50';rc.lineWidth=2;
      for(let i=1;i<=4;i++){rc.beginPath();rc.arc(160,128,i*27,0,Math.PI*2);rc.stroke();}
      rc.beginPath();rc.moveTo(40,128);rc.lineTo(280,128);rc.moveTo(160,14);rc.lineTo(160,242);rc.stroke();
      const a=t*.55;const sweep=rc.createConicGradient(a,160,128);sweep.addColorStop(0,'#83bca688');sweep.addColorStop(.13,'#83bca600');sweep.addColorStop(1,'#83bca600');rc.fillStyle=sweep;rc.beginPath();rc.arc(160,128,108,0,Math.PI*2);rc.fill();
      rc.strokeStyle='#a1d9ba';rc.beginPath();rc.moveTo(160,128);rc.lineTo(160+Math.cos(a)*108,128+Math.sin(a)*108);rc.stroke();
      rc.fillStyle='#a0cbb2';for(const p of [[126,88],[204,155],[100,163]])rc.fillRect(p[0],p[1],4,4);
      rc.font='13px monospace';rc.fillText('HEADING',330,62);rc.font='34px monospace';rc.fillText('024°',330,105);rc.font='12px monospace';rc.fillText('STEADY',330,153);rc.fillText('ON COURSE',330,175);rc.fillText('LUFFOR / NAV',330,222);radarTexture.needsUpdate=true;
    }
    const hitMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
    const destinations={
      chart:{point:[-3.4,1.27,.2],size:[2.2,.5,2.4],places:['helm','console','chart']},
      console:{point:[.35,1.85,-1.72],size:[2,.8,.5],places:['helm','chart','console','radio']},
      radio:{point:[3.45,1.7,-.25],size:[1.8,.85,.8],places:['helm','radio','console']},
      lighthouse:{point:[6.9,4.9,-24],size:[2,8,2],places:['helm','console','lighthouse']},
      aft:{point:[0,1.0,11.0],size:[2.6,.3,2.0],places:['helm','console','chart','radio']},
      stairs:{point:[-5.45,.45,5.1],size:[2.1,.5,1.1],places:['helm','aft','lounge']},
      upper:{point:[-5.45,2.6,8.7],size:[2.05,.5,1.3],places:['helm','aft','stairs','lounge']},
      overlook:{point:[0,4.6,12.9],size:[2.8,.4,.4],places:['upper']},
      lounge:{point:[-5.3,1.1,13.0],size:[2.5,1.8,2.0],places:['helm','aft','stairs']},
      helm:{point:[-5.45,3.6,10.9],size:[2.0,.4,1.1],places:['upper','overlook','lounge','aft']}
    };
    Object.entries(destinations).forEach(([name,d])=>{if(name!=='lighthouse'){d.point=shipPoint(d.point);d.size=shipPoint(d.size);}});
    const hitMeshes=[],expandedHitMeshes=[];
    Object.entries(destinations).forEach(([name,d])=>{
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(...d.size),hitMaterial);
      mesh.position.fromArray(d.point);mesh.userData.destination=name;
      const expanded=mesh.clone();expanded.scale.setScalar(1.5);
      scene.add(mesh,expanded);hitMeshes.push(mesh);expandedHitMeshes.push(expanded);
    });
    // Render the destination's geometry into a mask, then trace its visible silhouette.
    const outlineRegions={
      chart:[[-3.4,.78,.2],[2.8,1.65,2.5]],
      console:[[-.5,1.25,-1.15],[4.4,2.65,3.4]],
      radio:[[3.45,.93,-.25],[2.0,2.0,1.4]],
      lighthouse:[[6.9,2.3,-24],[2.0,7.8,2.0]],
      stairs:[[-5.45,2.35,7.85],[2.5,4.8,7.3]],
      upper:[[-5.45,2.35,7.85],[2.5,4.8,7.3]],
      helm:[[-5.45,2.35,7.85],[2.5,4.8,7.3]],
      overlook:[[0,4.15,12.4],[4.0,1.4,1.5]],
      aft:[[2.5,1.1,15.2],[3.0,2.4,1.8]],
      lounge:[[-4.0,.9,12.0],[5.5,2.0,3.8]]
    };
    const outlineScene=new THREE.Scene();
    const maskMaterial=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    const masks=new Map();
    model.scene.updateMatrixWorld(true);
    const occluderMaterial=new THREE.MeshBasicMaterial({color:0x000000,toneMapped:false,side:THREE.DoubleSide});
    model.scene.traverse(object=>{
      if(!object.isMesh)return;
      const occluder=new THREE.Mesh(object.geometry,occluderMaterial);
      occluder.matrixAutoUpdate=false;occluder.matrix.copy(object.matrixWorld);
      outlineScene.add(occluder);
    });
    Object.entries(outlineRegions).forEach(([name,[center,size]])=>{
      const bounds=new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(...(name==='lighthouse'?center:shipPoint(center))),
        new THREE.Vector3(...(name==='lighthouse'?size:shipPoint(size))));
      const vertices=[];
      model.scene.traverse(object=>{
        if(!object.isMesh)return;
        const positions=object.geometry.attributes.position,index=object.geometry.index;
        const count=index?index.count:positions.count;
        const triangle=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
        const centroid=new THREE.Vector3();
        for(let offset=0;offset<count;offset+=3){
          triangle.forEach((point,corner)=>point.fromBufferAttribute(positions,index?index.getX(offset+corner):offset+corner).applyMatrix4(object.matrixWorld));
          centroid.copy(triangle[0]).add(triangle[1]).add(triangle[2]).multiplyScalar(1/3);
          if(bounds.containsPoint(centroid))triangle.forEach(point=>vertices.push(point.x,point.y,point.z));
        }
      });
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
      const mask=new THREE.Mesh(geometry,maskMaterial);mask.visible=false;mask.renderOrder=1;
      outlineScene.add(mask);masks.set(name,mask);
    });
    const outlineTarget=new THREE.WebGLRenderTarget(1,1,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
    const outlineOverlay=new THREE.Scene();
    const outlineQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
      transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
      uniforms:{mask:{value:outlineTarget.texture},pixel:{value:new THREE.Vector2()}},
      vertexShader:'varying vec2 screenUV;void main(){screenUV=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:`varying vec2 screenUV;uniform sampler2D mask;uniform vec2 pixel;
void main(){
  float center=texture2D(mask,screenUV).r;
  float edge=0.;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
    edge=max(edge,texture2D(mask,screenUV+vec2(float(x),float(y))*pixel).r);
  }
  gl_FragColor=vec4(.9765,.9608,.9216,(edge-center)*.95);
}`
    }));
    outlineOverlay.add(outlineQuad);
    function setHovered(name){
      hovered=name;
      masks.forEach((mask,key)=>{mask.visible=key===name;});
      needsFrame=true;wake();
    }
    function renderHoverOutline(){
      if(!hovered||flight||!introSkipped||!panel.hidden)return;
      const width=stage.clientWidth,height=stage.clientHeight;
      outlineTarget.setSize(width,height);
      outlineQuad.material.uniforms.pixel.value.set(1.5/width,1.5/height);
      const clearColor=renderer.getClearColor(new THREE.Color()),clearAlpha=renderer.getClearAlpha();
      renderer.setClearColor(0x000000,0);
      renderer.setRenderTarget(outlineTarget);renderer.render(outlineScene,camera);
      renderer.setRenderTarget(null);renderer.setClearColor(clearColor,clearAlpha);
      renderer.autoClear=false;renderer.render(outlineOverlay,screenCamera);renderer.autoClear=true;
    }
    hotspots.forEach(button=>{
      const enter=()=>setHovered(button.dataset.cockpitGo);
      button.addEventListener('pointerenter',enter);button.addEventListener('focus',enter);
      button.addEventListener('pointerleave',()=>setHovered(null));
      button.addEventListener('blur',()=>setHovered(null));
    });
    const hotspotPoints=hotspots.map(button=>({button,point:new THREE.Vector3(...destinations[button.dataset.cockpitGo].point)}));
    function updateHotspots(){
      hotspotPoints.forEach(({button,point})=>{
        tmp.copy(point).project(camera);
        const allowed=destinations[button.dataset.cockpitGo].places.includes(active);
        const hidden=Boolean(flight)||!introSkipped||!panel.hidden||!allowed||tmp.z>1||tmp.z<0||Math.abs(tmp.x)>.94||Math.abs(tmp.y)>.85;
        button.hidden=hidden;
        if(!hidden){button.style.left=((tmp.x*.5+.5)*stage.clientWidth)+'px';button.style.top=((-tmp.y*.5+.5)*stage.clientHeight)+'px';}
      });
    }
    function resolveView(name){const view=views[name],middle=!small()&&stage.clientWidth/stage.clientHeight<1.5&&view.midPosition;const p=new THREE.Vector3(...(small()?view.mobilePosition:middle?view.midPosition:view.position)),t=new THREE.Vector3(...(small()?view.mobileTarget:middle?view.midTarget:view.target));const q=new THREE.Quaternion().setFromRotationMatrix(lookMatrix.lookAt(p,t,worldUp));return {p,t,q,f:small()?view.mobileFov:middle?view.midFov:view.fov};}
    function go(name,instant=false){
      setHovered(null);
      const v=resolveView(name);
      if(instant){basePosition.copy(v.p);baseTarget.copy(v.t);baseQuaternion.copy(v.q);fov=v.f;flight=null;}
      else{
        const fromPosition=camera.position.clone();
        const distance=fromPosition.distanceTo(v.p);
        stage.dataset.route=active+' / direct';
        flight={
          start:performance.now(),p:fromPosition,q:camera.quaternion.clone(),f:fov,to:v,
          duration:Math.min(1800,Math.max(900,distance*95))
        };
      }
      head.set(0,0);headTarget.set(0,0);stage.dataset.transitioning=String(Boolean(flight));pointerTarget.set(0,0);needsFrame=true;wake();
    }
    function resize(){
      renderer.setPixelRatio(Math.min(devicePixelRatio,small()?1.25:config.pixelRatio));
      renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;
      go(active,true);camera.updateProjectionMatrix();
    }
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(stage);
    function pick(event){
      const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);
      const available=meshes=>meshes.filter(object=>destinations[object.userData.destination].places.includes(active));
      // Direct object hits take priority when the larger margins overlap.
      const direct=raycaster.intersectObjects(available(hitMeshes),false)[0];
      const hit=direct||raycaster.intersectObjects(available(expandedHitMeshes),false)[0];
      return hit?.object.userData.destination||null;
    }
    const objectLabel=document.createElement('span');objectLabel.className='scene-object-label';objectLabel.hidden=true;objectLabel.setAttribute('aria-hidden','true');stage.append(objectLabel);
    let pointerDown=null;
    canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;if(!introSkipped)finishIntro();pointerDown={x:event.clientX,y:event.clientY,yaw:headTarget.x,pitch:headTarget.y,dragging:false};});
    canvas.addEventListener('pointerup',event=>{if(pointerDown&&!pointerDown.dragging&&Math.hypot(event.clientX-pointerDown.x,event.clientY-pointerDown.y)<8){const name=pick(event);if(name)navigate(name);}pointerDown=null;canvas.style.cursor='grab';if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);});
    canvas.addEventListener('pointercancel',()=>{pointerDown=null;canvas.style.cursor='grab';});
    canvas.addEventListener('pointermove',event=>{
      if(pointerDown){
        const dx=event.clientX-pointerDown.x,dy=event.clientY-pointerDown.y;
        if(!pointerDown.dragging&&Math.hypot(dx,dy)>7&&(event.pointerType!=='touch'||Math.abs(dx)>Math.abs(dy))){pointerDown.dragging=true;canvas.setPointerCapture(event.pointerId);}
        if(pointerDown.dragging){
          headTarget.set(pointerDown.yaw-dx*.004,THREE.MathUtils.clamp(pointerDown.pitch-dy*.003,-.45,.45));
          if(!movementAllowed())head.copy(headTarget);canvas.style.cursor='grabbing';setHovered(null);objectLabel.hidden=true;needsFrame=true;wake();return;
        }
      }
      if(event.pointerType==='touch'||!fine.matches)return;
      setHovered(pick(event));canvas.style.cursor=hovered?'pointer':'grab';
      const rect=canvas.getBoundingClientRect();objectLabel.hidden=!hovered||Boolean(flight);
      if(hovered){objectLabel.textContent='[ '+views[hovered].label+' ]';objectLabel.style.left=Math.min(event.clientX-rect.left+15,rect.width-200)+'px';objectLabel.style.top=(event.clientY-rect.top+17)+'px';}
      if(!movementAllowed()||localPaused)return;
      const r=canvas.getBoundingClientRect();pointerTarget.set(((event.clientX-r.left)/r.width-.5)*2,((event.clientY-r.top)/r.height-.5)*2);needsFrame=true;wake();
    },{passive:true});
    canvas.addEventListener('pointerleave',()=>{pointerTarget.set(0,0);setHovered(null);objectLabel.hidden=true;needsFrame=true;wake();});
    function wake(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
    function render(now){
      frame=0;if(disposed||!visible||document.hidden){last=0;return;}
      const dt=last?Math.min((now-last)/1000,.05):0;last=now;
      const ambient=ambientAllowed();if(ambient)elapsed+=dt;
      if(flight){
        const u=Math.min((now-flight.start)/flight.duration,1),e=u*u*(3-2*u);
        basePosition.lerpVectors(flight.p,flight.to.p,e);
        baseQuaternion.slerpQuaternions(flight.q,flight.to.q,e);
        fov=THREE.MathUtils.lerp(flight.f,flight.to.f,e);
        if(u===1){flight=null;stage.dataset.transitioning='false';}
      }
      if(!movementAllowed()){pointerTarget.set(0,0);pointer.set(0,0);}
      pointer.lerp(pointerTarget,1-Math.exp(-dt*7));
      if(movementAllowed())head.lerp(headTarget,1-Math.exp(-dt*11));else head.copy(headTarget);
      camera.position.copy(basePosition);camera.quaternion.copy(baseQuaternion);
      // Yaw around the world vertical, then pitch around the camera's right axis.
      // Local-axis yaw would roll the horizon when looking back from a pitched view.
      headQuaternion.setFromAxisAngle(worldUp,head.x);camera.quaternion.premultiply(headQuaternion);
      headQuaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),head.y);camera.quaternion.multiply(headQuaternion);
      if(ambient&&!flight&&introSkipped){camera.position.x+=pointer.x*config.pointerStrength;camera.position.y-=pointer.y*.025;}
      if(!introSkipped&&active==='helm'){
        const t=Math.min(introElapsed/layout.intro.duration,1),e=t*t*(3-2*t);camera.position.addScaledVector(new THREE.Vector3(...layout.intro.cameraOffset),1-e);camera.lookAt(resolveView('helm').t);
      }
      camera.fov=fov;camera.updateProjectionMatrix();camera.updateMatrixWorld();
      const angle=homeAngle+elapsed/config.rotationSeconds*Math.PI*2;
      beamDirection.set(Math.sin(angle),homeDirection.y/Math.hypot(homeDirection.x,homeDirection.z),Math.cos(angle)).normalize();beacon.target.position.copy(lighthouse).addScaledVector(beamDirection,60);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),beamDirection);
      const alignment=Math.pow(Math.max(0,beamDirection.dot(homeDirection)),20);
      halo.material.opacity=.26+alignment*.65;
      waterMaterial.uniforms.uTime.value=elapsed;waterMaterial.uniforms.uBeacon.value=alignment;beamMaterial.uniforms.uTime.value=elapsed;
      drawRadar(elapsed);updateHotspots();needsFrame=false;
      if(!introSkipped){
        introElapsed+=dt;
        if(introElapsed>=layout.intro.duration||!movementAllowed())finishIntro();
        else{
          const progress=introElapsed/layout.intro.duration;
          stage.dataset.intro=progress<.53?'wireframe':'reveal';
          renderReveal(progress);
        }
      }
      if(introSkipped){renderer.render(scene,camera);renderHoverOutline();}
      if(Math.floor(now/500)!==diagnosticTick){diagnosticTick=Math.floor(now/500);stage.dataset.beaconAngle=angle.toFixed(4);stage.dataset.drawCalls=String(renderer.info.render.calls);stage.dataset.triangles=String(renderer.info.render.triangles);stage.dataset.cameraPosition=JSON.stringify(camera.position.toArray().map(x=>Number(x.toFixed(3))));stage.dataset.lookAngle=String(Math.round(head.x*180/Math.PI));}
      if(ambient||flight||!introSkipped||head.distanceTo(headTarget)>.001||pointer.distanceTo(pointerTarget)>.001)wake();else last=0;
    }
    engine={go,wake,look(direction){headTarget.x-=direction*Math.PI/3;if(!movementAllowed())head.copy(headTarget);needsFrame=true;wake();},finishIntro:disposeIntro,stop(){disposed=true;if(frame)cancelAnimationFrame(frame);sizeObserver.disconnect();disposeIntro();},get beaconAngle(){return homeAngle+elapsed/config.rotationSeconds*Math.PI*2;},get drawCalls(){return renderer.info.render.calls;},get triangles(){return renderer.info.render.triangles;},get transitioning(){return Boolean(flight);}};
    resize();go(active,true);ready=true;stage.dataset.renderer='ready';
    loadingLabel.textContent='COMING ABOARD';
    if(introSkipped){disposeIntro();loadingLabel.hidden=true;}else{stage.dataset.intro='wireframe';boot.hide();}
    updatePause();wake();
  }
  initialize().catch(error=>{console.warn('Wheelhouse static fallback:',error.message);engine?.stop();fallback();});
})();
