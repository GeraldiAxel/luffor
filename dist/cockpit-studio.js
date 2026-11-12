/* Luffor cockpit studio: a ship's wheelhouse adapted into a developer workplace.
   Blender-authored scene (assets/cockpit-studio/), baked lightmaps, authored cameras, one lighthouse clock.
   Rendered locally with the vendored Three.js 0.160. Scene data comes from scene_manifest.json. */
(() => {
  'use strict';
  const stage = document.querySelector('#wheelhouse');
  if (!stage) return;
  const ASSETS = 'assets/cockpit-studio/';
  // Brightness: exposureStops is AgX exposure in stops (Blender scene default 0.2), lightmapBoost scales the baked
  // lighting, fill is a soft ambient that lifts the darkest corners and the (unbaked) characters.
  const config = Object.freeze({ pixelRatio: 1.5, beamIntensity: 3100, beamShadows: true, lookYaw: Math.PI, lookPitch: 0.42, lightmapExt: '.webp',
    exposureStops: 0.9, lightmapBoost: 1.25, fill: 0.7 });
  const root = document.documentElement, canvas = stage.querySelector('canvas');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const small = () => stage.clientWidth < 760;
  const panel = stage.querySelector('.scene-panel'), title = panel.querySelector('h2'), content = panel.querySelector('.panel-content');
  const status = stage.querySelector('.scene-status'), announcement = document.querySelector('#cockpit-announcement');
  const pause = stage.querySelector('.scene-pause'), home = document.querySelector('.scene-return');
  const buttons = [...document.querySelectorAll('[data-cockpit-go]')];
  const hotspots = [...stage.querySelectorAll('.scene-hotspot')];
  const loadingLabel = stage.querySelector('.scene-loading');
  const email = window.PORTFOLIO?.contact?.email || 'lufforsolution@gmail.com';
  // Copy is English here; Indonesian comes from i18n.js (keys cockpit.*). sections.js owns the WhatsApp/email links.
  const L = (key, en) => window.LufforI18n ? window.LufforI18n.t(key, en) : en;
  const contactHref = context => window.LufforContact ? window.LufforContact.href(context) : 'mailto:' + email;

  // The scene fills the first viewport together with the site header and the destination bar below it.
  const chrome = [document.querySelector('.site-header'), document.querySelector('.scene-nav')].filter(Boolean);
  const fitViewport = () => stage.style.setProperty('--cockpit-chrome', chrome.reduce((h, e) => h + e.offsetHeight, 0) + 'px');
  fitViewport();
  const chromeObserver = new ResizeObserver(fitViewport);
  chrome.forEach(e => chromeObserver.observe(e));

  // Destination ids match `destinations[].id` in scene_manifest.json.
  const places = {
    home: { label: 'The bridge. Drag to look around. Click to explore.' },
    work: { label: 'The work locker', index: '02 / WORK LOCKER', title: 'A clearer way forward.' },
    services: { label: 'The chart table', index: '03 / CHART TABLE', title: 'Built around your business.' },
    about: { label: 'The lookout', index: '04 / THE LOOKOUT', title: 'A small crew. One heading.' },
    contact: { label: 'The radio station', index: '05 / MARINE RADIO', title: 'Send a signal.' },
    helm: { label: 'The helm desk' },
    reverse: { label: 'Looking aft from the bow' }
  };
  const concepts = [
    { name: 'Forme', kind: 'Company website', image: 'assets/project-forme.svg', copy: 'A service-led website with a clearer path from first visit to enquiry.' },
    { name: 'The Quiet Edit', kind: 'Publishing website', image: 'assets/project-quiet-edit.svg', copy: 'An editorial interface that gives articles, topics, and featured stories room to breathe.' },
    { name: 'Common Ground', kind: 'Custom application', image: 'assets/project-common-ground.svg', copy: 'A shared workspace for people, projects, and everyday tasks.' },
    { name: 'Perspective', kind: 'Dashboard & UI / UX', image: 'assets/project-perspective.svg', copy: 'A reporting interface that organizes complex information into a useful overview.' }
  ];
  let active = 'home', engine = null, visible = true, localPaused = false, ready = false, conceptIndex = 0;
  const movementAllowed = () => !reduce.matches && !root.classList.contains('motion-off');
  const ambientAllowed = () => movementAllowed() && !localPaused;
  let introSkipped = !movementAllowed();
  stage.dataset.intro = introSkipped ? 'complete' : 'loading';
  const skip = document.createElement('button');
  skip.type = 'button'; skip.className = 'scene-skip'; skip.textContent = 'Skip intro ↗';
  skip.setAttribute('aria-label', 'Skip cockpit introduction'); skip.hidden = introSkipped; stage.append(skip);
  const homeButton = () => document.querySelector('.scene-destinations [data-cockpit-go="home"]');

  function finishIntro() {
    const restoreFocus = document.activeElement === skip;
    introSkipped = true; stage.dataset.intro = 'complete'; skip.hidden = true;
    if (ready) loadingLabel.hidden = true;
    engine?.finishIntro(); updatePause();
    if (restoreFocus) (ready ? pause : homeButton()).focus({ preventScroll: true });
  }
  skip.addEventListener('click', finishIntro);

  // Each panel ends with a link down to the matching section of the page.
  const sectionLink = { services: ['#pricing', 'cockpit.link.services', 'See packages &amp; prices'] };
  const enquiry = (context, key, en) => `<a class="panel-enquiry" data-panel-contact="${context}">${L(key, en)} <span aria-hidden="true">↗</span></a>`;
  function projectPreview() {
    const p = concepts[conceptIndex], i = conceptIndex + 1;
    content.innerHTML = `<p class="panel-concept-note">${L('cockpit.concepts', 'INDEPENDENT INTERFACE CONCEPTS')}</p><img class="panel-project-image" src="${p.image}" width="1600" height="1000" alt="${p.name} ${p.kind.toLowerCase()} interface concept"><div class="panel-project-nav">${concepts.map((c, n) => `<button type="button" data-concept="${n}" aria-label="View ${c.name} concept" aria-pressed="${n === conceptIndex}">${String(n + 1).padStart(2, '0')}</button>`).join('')}</div><h3>${p.name}</h3><p>${L('concept.' + i + '.copy', p.copy)}</p>${enquiry('general', 'cockpit.build', 'Build your next project')}`;
    finishPanel('work');
  }
  function finishPanel(name) {
    content.querySelectorAll('[data-panel-contact]').forEach(a => {
      a.href = contactHref(a.dataset.panelContact);
      if (/^https:/.test(a.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    });
    const mail = content.querySelector('.panel-email');
    if (mail) mail.textContent = window.LufforContact?.hasWhatsApp ? L('wa.chat', 'Chat on WhatsApp') : email;
    const s = sectionLink[name];
    if (s) {
      const a = document.createElement('a');
      a.className = 'panel-section-link'; a.href = s[0]; a.innerHTML = `${L(s[1], s[2])} <span aria-hidden="true">↓</span>`;
      content.append(a);
    }
  }
  function showPanel(name, animate = true) {
    const place = places[name], hasPanel = Boolean(place.index);
    panel.hidden = !hasPanel; stage.classList.toggle('scene-panel-open', hasPanel);
    home.disabled = name === 'home';
    if (!hasPanel) return;
    panel.querySelector('.panel-index').textContent = L(`cockpit.panel.${name}.index`, place.index);
    title.textContent = L(`cockpit.panel.${name}.title`, place.title);
    if (name === 'work') projectPreview();
    else {
      if (name === 'services') content.innerHTML = `<p>${L('cockpit.services.copy', 'From an unclear idea to a useful digital solution. Strategy, design, and development, working together.')}</p><ul class="panel-service-list"><li>01 &nbsp; ${L('cockpit.services.1', 'Website design &amp; development')}</li><li>02 &nbsp; ${L('cockpit.services.2', 'Custom web applications')}</li><li>03 &nbsp; ${L('cockpit.services.3', 'UI / UX &amp; digital strategy')}</li></ul>${enquiry('general', 'cockpit.discuss', 'Discuss your project')}`;
      else if (name === 'about') content.innerHTML = `<p>${L('cockpit.about.copy', 'Luffor is a digital agency helping businesses find a clear direction through complex challenges.')}</p><ul class="panel-service-list"><li>01 &nbsp; ${L('cockpit.about.1', 'At the helm: development')}</li><li>02 &nbsp; ${L('cockpit.about.2', 'At the chart table: strategy &amp; planning')}</li><li>03 &nbsp; ${L('cockpit.about.3', 'On lookout: design &amp; UI / UX')}</li></ul>${enquiry('general', 'cockpit.start', 'Start a conversation')}`;
      else if (name === 'contact') content.innerHTML = `<p>${L('cockpit.contact.copy', 'Tell us what you’re trying to solve. We’ll start with the right questions.')}</p><a class="panel-enquiry" data-panel-contact="general"><span class="panel-email"></span> <span aria-hidden="true">↗</span></a><p class="radio-signoff">${L('cockpit.contact.signoff', 'YOUR NEXT CHAPTER STARTS WITH A CONVERSATION.')}</p>`;
      finishPanel(name);
    }
    panel.scrollTop = 0;
    if (animate && movementAllowed()) panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
  }
  addEventListener('luffor:langchange', () => { showPanel(active, false); status.textContent = L('cockpit.label.' + active, places[active].label); });
  function navigate(name, instant = false) {
    if (!places[name]) return;
    if (!introSkipped) finishIntro();
    active = name;
    buttons.forEach(b => { if (b.closest('.scene-destinations')) b.setAttribute('aria-pressed', String(b.dataset.cockpitGo === name)); });
    stage.dataset.destination = name;
    showPanel(name);
    engine?.go(name, instant || !movementAllowed());
    announcement.textContent = status.textContent = L('cockpit.label.' + name, places[name].label);
  }
  buttons.forEach(b => b.addEventListener('click', () => {
    navigate(b.dataset.cockpitGo);
    if (b.classList.contains('scene-hotspot')) { const t = panel.hidden ? stage : title; t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    if (!visible) stage.scrollIntoView({ behavior: movementAllowed() ? 'smooth' : 'instant', block: 'start' });
  }));
  document.querySelector('.site-header .wordmark').addEventListener('click', () => navigate('home'));
  panel.querySelector('.scene-panel-close').addEventListener('click', () => { homeButton().focus({ preventScroll: true }); navigate('home'); });
  content.addEventListener('click', event => {
    const b = event.target.closest('[data-concept]');
    if (b) { conceptIndex = Number(b.dataset.concept); projectPreview(); content.querySelector(`[data-concept="${conceptIndex}"]`).focus({ preventScroll: true }); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active !== 'home' && event.target.closest('#hero,.site-header') && !document.querySelector('dialog[open]')) {
      event.preventDefault(); homeButton().focus({ preventScroll: true }); navigate('home');
    }
  });
  function updatePause() {
    pause.hidden = !ready || !introSkipped; pause.disabled = !movementAllowed();
    pause.setAttribute('aria-pressed', String(localPaused));
    pause.textContent = !movementAllowed() ? 'Motion reduced' : localPaused ? '▷  Resume' : 'Ⅱ  Pause';
    pause.setAttribute('aria-label', !movementAllowed() ? 'Cockpit motion reduced' : localPaused ? 'Resume cockpit animation' : 'Pause cockpit animation');
    engine?.wake();
  }
  pause.addEventListener('click', () => { localPaused = !localPaused; updatePause(); });
  document.querySelectorAll('[data-look]').forEach(b => b.addEventListener('click', () => { if (!introSkipped) finishIntro(); engine?.look(Number(b.dataset.look)); }));
  reduce.addEventListener('change', () => { if (reduce.matches && !introSkipped) finishIntro(); engine?.go(active, true); updatePause(); });
  addEventListener('portfolio:motionchange', () => { if (!movementAllowed()) { if (!introSkipped) finishIntro(); engine?.go(active, true); } updatePause(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; engine?.wake(); }, { rootMargin: '80px' }).observe(stage);
  document.addEventListener('visibilitychange', () => engine?.wake());
  function fallback(message) {
    introSkipped = true; stage.dataset.intro = 'complete'; skip.hidden = true;
    ready = false; stage.dataset.renderer = 'fallback'; canvas.hidden = true; hotspots.forEach(b => b.hidden = true); pause.hidden = true;
    loadingLabel.hidden = true;
    status.textContent = message || 'Still view. Explore with the cabin navigation.';
  }
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); engine?.stop(); fallback(); });
  window.LufforCockpit = Object.freeze({ get state() { return { destination: active, renderer: stage.dataset.renderer, intro: stage.dataset.intro, paused: localPaused, reduced: !movementAllowed(), visible, ...(engine?.info() || {}) }; } });

  async function initialize() {
    const [THREE, { GLTFLoader }, manifest] = await Promise.all([
      import('./assets/vendor/three.module.js'), import('./assets/vendor/GLTFLoader.js'),
      fetch(ASSETS + 'scene_manifest.json').then(r => { if (!r.ok) throw new Error('manifest'); return r.json(); })]);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.25 : config.pixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = Math.pow(2, config.exposureStops ?? manifest.rendering?.exposure_stops ?? 0.2);
    const shadows = config.beamShadows && !small();
    renderer.shadowMap.enabled = shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
    const wireScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 800);
    const cams = Object.fromEntries(manifest.cameras.map(c => [c.name, c]));
    const dest = Object.fromEntries(manifest.destinations.map(d => [d.id, d]));
    const hsPos = Object.fromEntries(manifest.hotspots.map(h => [h.name, h.position]));

    // A tiny generated environment so the brass reads as metal (no external HDR).
    const envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 8), new THREE.MeshBasicMaterial({ color: 0x0a1630, side: THREE.BackSide })));
    for (const [x, y, z, c] of [[6, 4, 2, 0xffb46a], [-7, 3, -4, 0xffd9a0], [0, 6, 8, 0x9cc4ff]]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); envScene.add(m);
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(envScene, 0.04).texture; pmrem.dispose();

    const loader = new GLTFLoader(), texLoader = new THREE.TextureLoader();
    const lmName = f => config.lightmapExt ? f.replace(/\.png$/, config.lightmapExt) : f;
    // The light line model arrives first and carries the opening; the full scene follows.
    const wirePromise = loader.loadAsync(ASSETS + manifest.files.wireframe);
    const scenePromise = Promise.all([loader.loadAsync(ASSETS + manifest.files.scene),
      ...manifest.files.lightmaps.map(f => texLoader.loadAsync(ASSETS + 'lightmaps/' + lmName(f)).then(t => { t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.channel = 1; return [f, t]; }))]);

    // --- camera state
    const O = manifest.opening_sequence, T = O.timeline_s;
    const basePos = new THREE.Vector3(), baseQuat = new THREE.Quaternion();
    let baseHfov = 80, flight = null;
    const head = new THREE.Vector2(), headTarget = new THREE.Vector2();
    const qYaw = new THREE.Quaternion(), qPitch = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), RIGHT = new THREE.Vector3(1, 0, 0);
    const poseOf = c => ({ p: new THREE.Vector3().fromArray(c.position), q: new THREE.Quaternion().fromArray(c.quaternion), f: c.fov_horizontal_deg });
    function setBase(pose) { basePos.copy(pose.p); baseQuat.copy(pose.q); baseHfov = pose.f; }
    function applyCamera() {
      camera.position.copy(basePos);
      qYaw.setFromAxisAngle(UP, head.x); qPitch.setFromAxisAngle(RIGHT, head.y);
      camera.quaternion.copy(qYaw).multiply(baseQuat).multiply(qPitch);
      // Keep the authored horizontal field of view on wide screens; cap the vertical one on tall screens.
      const v = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(baseHfov) / 2) / camera.aspect);
      camera.fov = Math.min(THREE.MathUtils.radToDeg(v), 68); camera.updateProjectionMatrix();
    }
    const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    function go(name, instant = false) {
      const to = poseOf(cams[dest[name].camera]);
      headTarget.set(0, 0);
      if (instant || !ready) { flight = null; head.set(0, 0); setBase(to); needsFrame = true; wake(); return; }
      // Start from wherever the camera is now, including any look-around offset, so journeys can be interrupted.
      applyCamera();
      const from = { p: camera.position.clone(), q: camera.quaternion.clone(), f: baseHfov };
      head.set(0, 0);
      const d = from.p.distanceTo(to.p);
      flight = { from, to, t: 0, duration: Math.min(2.4, Math.max(1.4, 1.1 + 0.2 * d)), ease: easeInOut };
      stage.dataset.transitioning = 'true'; wake();
    }
    function stepFlight(dt) {
      if (!flight) return;
      flight.t = Math.min(flight.t + dt / flight.duration, 1);
      const e = flight.ease(flight.t);
      basePos.lerpVectors(flight.from.p, flight.to.p, e);
      baseQuat.slerpQuaternions(flight.from.q, flight.to.q, e);
      baseHfov = flight.from.f + (flight.to.f - flight.from.f) * e;
      if (flight.t >= 1) { flight = null; stage.dataset.transitioning = 'false'; }
    }

    // --- opening pass: line model + pixel cells + block-noise reveal + ordered dither
    const rtScene = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
    const rtWire = new THREE.WebGLRenderTarget(2, 2);
    const post = new THREE.ShaderMaterial({
      uniforms: { tScene: { value: rtScene.texture }, tWire: { value: rtWire.texture }, uRes: { value: new THREE.Vector2(2, 2) }, uProgress: { value: 0 }, uTime: { value: 0 }, uPixel: { value: 6 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        uniform sampler2D tScene, tWire; uniform vec2 uRes; uniform float uProgress, uTime, uPixel; varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float bayer(vec2 p){ int i = int(mod(p.x, 4.)) + int(mod(p.y, 4.)) * 4;
          float m[16]; m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
          float v = 0.; for (int k = 0; k < 16; k++) if (k == i) v = m[k]; return (v + .5) / 16.; }
        void main(){
          float px = max(uPixel, 1.);
          vec2 block = floor(gl_FragCoord.xy / px), uvb = (block + .5) * px / uRes;
          vec3 col = texture2D(tScene, px > 1.5 ? uvb : vUv).rgb;
          gl_FragColor = vec4(col, 1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          col = gl_FragColor.rgb;
          vec2 rb = floor(gl_FragCoord.xy / 24.);
          float thr = hash(rb) * .62 + distance((rb + .5) * 24. / uRes, vec2(.5)) * .5;
          float r = smoothstep(thr, thr + .18, uProgress * 1.35);
          float w = max(texture2D(tWire, vUv).r, texture2D(tWire, uvb).r * .6);
          float flick = step(.93, hash(rb + floor(uTime * 10.))) * step(hash(rb * 1.7), .35) * .28;
          vec3 wire = vec3(max(w, flick * hash(block)));
          float luma = dot(col, vec3(.299, .587, .114));
          vec3 mono = vec3(step(bayer(floor(gl_FragCoord.xy / max(px * .5, 1.))), luma * 2.4));
          col = r < .02 ? wire : mix(mono, col, smoothstep(.45, 1., r));
          gl_FragColor = vec4(col, 1.);
        }` });
    const quadScene = new THREE.Scene(), quadCam = new THREE.Camera();
    quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
    let intro = introSkipped ? null : { t: 0, hold: true }, introDisposed = false;
    function disposeIntro() {
      if (introDisposed) return; introDisposed = true; intro = null;
      wireScene.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); wireScene.clear();
      rtScene.dispose(); rtWire.dispose(); post.dispose();
      if (!flight || flight.opening) { flight = null; setBase(poseOf(cams[dest[active].camera])); }
      needsFrame = true;
    }

    // --- sizing and loop
    let frame = 0, last = 0, needsFrame = true, disposed = false, sceneReady = false, mixer = null, hotspotPoints = [];
    const beams = [], tmp = new THREE.Vector3();
    function resize() {
      const w = Math.max(stage.clientWidth, 2), h = Math.max(stage.clientHeight, 2);
      renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.25 : config.pixelRatio));
      renderer.setSize(w, h, false);
      const pr = renderer.getPixelRatio();
      if (!introDisposed) { rtScene.setSize(w * pr, h * pr); rtWire.setSize(w * pr, h * pr); post.uniforms.uRes.value.set(w * pr, h * pr); }
      camera.aspect = w / h; needsFrame = true; wake();
    }
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(stage);
    function placeHotspots() {
      const show = sceneReady && introSkipped && !flight;
      for (const { button, point, id } of hotspotPoints) {
        tmp.copy(point).project(camera);
        const hidden = !show || id === active || tmp.z > 1 || Math.abs(tmp.x) > 0.96 || Math.abs(tmp.y) > 0.9;
        button.hidden = hidden;
        if (!hidden) { button.style.left = ((tmp.x * .5 + .5) * stage.clientWidth) + 'px'; button.style.top = ((-tmp.y * .5 + .5) * stage.clientHeight) + 'px'; }
      }
    }
    const running = () => visible && !document.hidden && !disposed;
    function wake() { if (!frame && running()) { last = 0; frame = requestAnimationFrame(tick); } }
    function tick(now) {
      frame = 0;
      if (!running()) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now;
      const ambient = ambientAllowed();
      if (mixer && ambient) mixer.update(dt);
      stepFlight(dt);
      const dx = headTarget.x - head.x, dy = headTarget.y - head.y;
      const turning = Math.abs(dx) + Math.abs(dy) > 0.0005;
      if (turning) { const k = movementAllowed() ? 1 - Math.pow(0.0015, dt) : 1; head.x += dx * k; head.y += dy * k; }
      applyCamera();
      if (intro) {
        // The line drawing holds until the full scene has loaded, then the timed reveal plays.
        if (!intro.hold) intro.t += dt;
        else if (sceneReady && intro.t >= T.wireframe_only[1] - 0.6) intro.hold = false;
        else intro.t = Math.min(intro.t + dt, T.wireframe_only[1] - 0.6);
        const u = post.uniforms;
        u.uProgress.value = THREE.MathUtils.clamp((intro.t - T.reveal[0]) / (T.reveal[1] - T.reveal[0]), 0, 1);
        u.uPixel.value = THREE.MathUtils.lerp(6, 1, THREE.MathUtils.smoothstep(intro.t, T.reveal[0] + .3, T.reveal[1]));
        u.uTime.value = now / 1000;
        stage.dataset.intro = u.uProgress.value > 0 ? 'reveal' : 'wireframe';
        renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
        renderer.setRenderTarget(rtWire); renderer.setClearColor(0x000000); renderer.clear(); renderer.render(wireScene, camera);
        renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
        if (intro.t >= T.settled && sceneReady) finishIntro();
      } else if (sceneReady) {
        renderer.setRenderTarget(null); renderer.render(scene, camera);
      }
      placeHotspots();
      const keepGoing = intro || flight || turning || needsFrame || (sceneReady && ambient);
      needsFrame = false;
      if (keepGoing) frame = requestAnimationFrame(tick);
    }

    // --- drag to look around
    let drag = null;
    canvas.addEventListener('pointerdown', e => { if (e.button !== 0) return; if (!introSkipped) finishIntro(); drag = { x: e.clientX, y: e.clientY, yaw: headTarget.x, pitch: headTarget.y, moved: false }; });
    canvas.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved && Math.abs(dy) > Math.abs(dx) && e.pointerType === 'touch') { drag = null; return; }   // leave vertical touch scrolling alone
      if (!drag.moved) { drag.moved = true; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; }
      headTarget.x = THREE.MathUtils.clamp(drag.yaw + dx / stage.clientWidth * 2.2, -config.lookYaw, config.lookYaw);
      headTarget.y = THREE.MathUtils.clamp(drag.pitch + dy / stage.clientHeight * 1.2, -config.lookPitch, config.lookPitch);
      wake();
    });
    const endDrag = e => { drag = null; canvas.style.cursor = 'grab'; if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

    engine = {
      go, wake,
      look(direction) { headTarget.x = THREE.MathUtils.clamp(headTarget.x - direction * Math.PI / 3, -config.lookYaw, config.lookYaw); wake(); },
      finishIntro: disposeIntro,
      stop() { disposed = true; if (frame) cancelAnimationFrame(frame); sizeObserver.disconnect(); },
      info() { return { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, transitioning: Boolean(flight), camera: camera.position.toArray().map(v => Number(v.toFixed(3))), clips: mixer ? mixer._actions.length : 0 }; }
    };

    // --- 1. line model: start the opening straight away
    resize();
    if (intro) {
      setBase(poseOf(cams[O.start_camera]));
      flight = { from: poseOf(cams[O.start_camera]), to: poseOf(cams[O.end_camera]), t: 0, duration: O.camera_duration_s, ease: easeOut, opening: true };
    } else setBase(poseOf(cams[dest[active].camera]));
    const wireGltf = await wirePromise;
    if (!introDisposed) {
      wireGltf.scene.traverse(o => { if (o.isLine || o.isLineSegments) o.material = new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false }); });
      wireScene.add(wireGltf.scene);
      stage.dataset.renderer = 'preview'; stage.dataset.intro = 'wireframe'; wake();
    }

    // --- 2. full scene
    const [gltf, ...lmPairs] = await scenePromise;
    const lmTex = Object.fromEntries(lmPairs);
    const keep = manifest.realtime_lights.keep;
    gltf.scene.traverse(o => {
      if (o.isLight) {
        if (keep.some(n => o.name.startsWith(n) || o.parent?.name.startsWith(n))) {
          beams.push(o); o.intensity = config.beamIntensity; o.decay = 1.2; o.distance = 0; o.penumbra = 0.5;
          if (shadows) { o.castShadow = true; o.shadow.mapSize.set(2048, 2048); o.shadow.camera.near = 22; o.shadow.camera.far = 60; o.shadow.bias = -0.0008; o.shadow.radius = 3; }
        } else o.visible = false;     // already in the lightmaps
        return;
      }
      if (!o.isMesh) return;
      if (shadows && (/^(ARCH_Shell|FURN_Static|PROP_Static|INT_|ANIM_)/.test(o.name) || o.isSkinnedMesh)) { o.castShadow = true; o.receiveShadow = true; }
      const lm = manifest.lightmaps.objects[o.name] ?? manifest.lightmaps.objects[o.parent?.name];
      const fix = m => {
        m = m.clone();
        m.envMap = envTex; m.envMapIntensity = m.metalness > 0.5 ? 0.9 : 0.05;
        if (lm && lmTex[lm]) { m.lightMap = lmTex[lm]; m.lightMapIntensity = manifest.lightmaps.range * Math.PI * config.lightmapBoost; }
        if (o.isSkinnedMesh) { m.emissive = m.color.clone(); m.emissiveIntensity = 0.035; }
        if (/Beam/.test(m.name)) { m.blending = THREE.AdditiveBlending; m.side = THREE.DoubleSide; }
        if (m.transparent) m.depthWrite = false;
        return m;
      };
      o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material);
      if (o.isSkinnedMesh) o.frustumCulled = false;
    });
    scene.add(gltf.scene);
    scene.add(new THREE.HemisphereLight(0x5a7bb0, 0x3a2414, config.fill));
    mixer = new THREE.AnimationMixer(gltf.scene);
    const loops = new Set(manifest.animations.map(a => a.name));
    gltf.animations.filter(c => loops.has(c.name)).forEach(c => mixer.clipAction(c).play());
    mixer.setTime(5.4);                         // the beam is crossing the bridge at this point of the shared loop
    hotspotPoints = hotspots.map(button => { const d = dest[button.dataset.cockpitGo]; return d && hsPos[d.hotspot] ? { button, id: d.id, point: new THREE.Vector3().fromArray(hsPos[d.hotspot]) } : null; }).filter(Boolean);
    renderer.compile(scene, camera);
    sceneReady = true; ready = true; stage.dataset.renderer = 'ready'; stage.dataset.crew = '3';
    canvas.style.cursor = 'grab';
    if (introSkipped) { disposeIntro(); loadingLabel.hidden = true; }
    updatePause(); needsFrame = true; wake();
  }
  initialize().catch(error => { console.warn('Cockpit unavailable:', error); engine?.stop(); fallback(); });
})();
