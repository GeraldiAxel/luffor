/* A brief, local GPU engraving pass. Original image remains the static fallback. */
(() => {
  'use strict';
  const art = document.querySelector('.footer-art');
  const image = art.querySelector('img');
  const replay = document.querySelector('.draw-replay');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 3400;
  let renderer = null;
  let preparation = null;
  let hasPlayed = false;
  let visible = false;
  let frame = 0;
  let elapsed = 0;
  let previousTime = 0;
  let finishingTimer = 0;
  let fallbackAnimation = null;
  let generation = 0;
  const allowed = () => !reduced.matches && document.documentElement.classList.contains('motion-on');

  const staticArt = () => {
    generation++;
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previousTime = 0;
    if (finishingTimer) clearTimeout(finishingTimer);
    fallbackAnimation?.cancel(); fallbackAnimation = null;
    art.classList.remove('is-inking','ink-finishing','ink-pending');
    art.dataset.inkPhase = 'complete';
    replay.setAttribute('aria-label','Replay ocean drawing');
  };
  const finish = () => {
    frame = 0; previousTime = 0;
    art.classList.add('ink-finishing');
    art.dataset.inkPhase = 'complete';
    replay.setAttribute('aria-label','Replay ocean drawing');
    finishingTimer = setTimeout(()=>art.classList.remove('is-inking','ink-finishing'),350);
  };

  const createRenderer = () => {
    const canvas = document.createElement('canvas');
    canvas.className = 'footer-ink'; canvas.setAttribute('aria-hidden','true');
    let gl;
    try { gl = canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'}); } catch { return null; }
    if (!gl) return null;
    const vertex = `attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
    const fragment = `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_image;
      uniform vec2 u_texel;
      uniform float u_progress;
      float luminance(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
      void main(){
        vec3 navy=vec3(.007843,.12549,.309804);
        vec3 ivory=vec3(.97647,.96078,.92157);
        vec3 source=texture2D(u_image,v_uv).rgb;
        float lum=luminance(source);
        float left=luminance(texture2D(u_image,v_uv-vec2(u_texel.x,0.)).rgb);
        float right=luminance(texture2D(u_image,v_uv+vec2(u_texel.x,0.)).rgb);
        float above=luminance(texture2D(u_image,v_uv+vec2(0.,u_texel.y)).rgb);
        float below=luminance(texture2D(u_image,v_uv-vec2(0.,u_texel.y)).rgb);
        float contour=clamp(length(vec2(right-left,above-below))*3.6,0.,1.);
        float highlight=smoothstep(.22,.87,lum);
        float etch=max(contour*.85,highlight*.8);
        float grain=fract(sin(dot(floor(v_uv*vec2(1300.,440.)),vec2(12.9898,78.233)))*43758.5);
        float irregular=(sin(v_uv.y*127.)+sin(v_uv.y*341.)*.4)*.012;
        float tip=u_progress*1.25-.04-v_uv.x+irregular;
        float drawn=smoothstep(-.012,.024,tip+highlight*.016+contour*.012);
        float shaded=smoothstep(.025,.19,tip+grain*.018);
        vec3 outline=mix(navy,ivory,etch);
        vec3 result=mix(navy,outline,drawn);
        result=mix(result,source,shaded);
        float pen=(1.-smoothstep(.002,.02,abs(tip)))*contour*.2;
        result=mix(result,ivory,pen);
        gl_FragColor=vec4(result,1.);
      }`;
    const compile = (type,source) => {
      const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    };
    const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
    if (!vs || !fs) return null;
    const program=gl.createProgram(); gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return null;
    gl.deleteShader(vs); gl.deleteShader(fs); gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'a_position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
    gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);
    gl.uniform2f(gl.getUniformLocation(program,'u_texel'),1/image.naturalWidth,1/image.naturalHeight);
    const progress=gl.getUniformLocation(program,'u_progress');
    const resize = () => {
      canvas.width=Math.min(image.naturalWidth,Math.max(640,Math.round(image.getBoundingClientRect().width*Math.min(devicePixelRatio||1,1.5))));
      canvas.height=Math.round(canvas.width*image.naturalHeight/image.naturalWidth);
      gl.viewport(0,0,canvas.width,canvas.height);
    };
    resize();
    canvas.addEventListener('webglcontextlost',staticArt);
    art.append(canvas);
    return {canvas,resize,draw(value){if(gl.isContextLost())return false;const displayProgress=innerWidth <= 760 ? .08+value*.832 : value;gl.uniform1f(progress,displayProgress);gl.drawArrays(gl.TRIANGLES,0,6);return true;}};
  };
  const prepare = () => {
    if (preparation) return preparation;
    preparation=(async()=>{
      try { if (image.decode) await image.decode(); else if (!image.complete) await new Promise((resolve,reject)=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',reject,{once:true});});
        if (!image.naturalWidth) return;
        renderer=createRenderer(); art.dataset.inkRenderer=renderer?'engraving':'wipe';
      } catch { renderer=null; art.dataset.inkRenderer='wipe'; }
    })();
    return preparation;
  };
  const tick = now => {
    frame=0;
    if (!allowed()) { staticArt(); return; }
    if (!visible || document.hidden) { previousTime=0; return; }
    if (previousTime) elapsed+=Math.min(50,now-previousTime);
    previousTime=now;
    if (!renderer.draw(Math.min(1,elapsed/duration))) { staticArt(); return; }
    if (elapsed>=duration) finish(); else frame=requestAnimationFrame(tick);
  };
  const start = async () => {
    if (!allowed()) return;
    staticArt(); art.classList.add('ink-pending'); const ticket=generation;
    await prepare();
    if (ticket!==generation || !allowed()) return;
    hasPlayed=true; elapsed=0; previousTime=0; art.classList.remove('ink-pending');
    art.dataset.inkPhase='drawing'; replay.setAttribute('aria-label','Restart ocean drawing');
    if (renderer) {
      renderer.resize(); renderer.draw(0); art.classList.add('is-inking');
      frame=requestAnimationFrame(tick);
    } else if (image.animate) {
      fallbackAnimation=image.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:2800,easing:'cubic-bezier(.25,.1,.25,1)'});
      fallbackAnimation.finished.then(()=>{if(ticket===generation)finish();}).catch(()=>{});
    } else finish();
  };
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    for (const entry of entries) {
      visible=entry.isIntersecting && entry.intersectionRatio>=.35;
      if (visible && allowed() && !hasPlayed) start();
      else if (visible && art.dataset.inkPhase==='drawing' && renderer && !frame) frame=requestAnimationFrame(tick);
    }
  },{threshold:[0,.35,.6,1]}) : null;
  observer?.observe(art);
  if (observer && allowed()) art.classList.add('ink-pending');
  replay.hidden=false; replay.disabled=!allowed();
  replay.addEventListener('click',()=>{visible=true;start();});
  addEventListener('portfolio:motionchange',()=>{replay.disabled=!allowed();if(!allowed())staticArt();});
  reduced.addEventListener('change',()=>{replay.disabled=!allowed();if(!allowed())staticArt();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&art.dataset.inkPhase==='drawing'&&renderer&&!frame)frame=requestAnimationFrame(tick);});
  addEventListener('resize',()=>{if(renderer&&art.dataset.inkPhase==='drawing')renderer.resize();},{passive:true});
  if (!observer) hasPlayed=true;
})();
