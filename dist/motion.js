/* Luffor motion: native CSS / Web Animations, no runtime dependencies. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  const hero = document.querySelector('.hero');
  const compass = document.querySelector('.hero-compass');
  const rail = document.querySelector('.journey-index');
  const chapters = ['capabilities','work','about','contact'].map(id => document.getElementById(id));
  const chapterLinks = [...document.querySelectorAll('.chapter-link')];
  const targets = [...document.querySelectorAll('.reveal')];
  const inView = new Set();
  const played = new WeakSet();
  const running = new Set();
  let enabled = false;
  let scrollFrame = 0;
  let cursorFrame = 0;
  let activeCursor = null;
  let storedOff = false;
  let bearing = 25;
  try { storedOff = localStorage.getItem('luffor-motion') === 'off'; } catch { /* Optional preference storage. */ }

  const splitWords = heading => {
    if (!heading || heading.dataset.wordsReady) return;
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, {acceptNode: node => node.parentElement.closest('.heading-count, .word-clip, [aria-hidden="true"]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let count = 0;
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part || /^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); continue; }
        const clip = document.createElement('span');
        const inner = document.createElement('span');
        clip.className = 'word-clip'; inner.className = 'word-inner'; inner.textContent = part;
        inner.style.setProperty('--word-delay', Math.min(count++ * 45, 270) + 'ms');
        clip.append(inner); fragment.append(clip);
      }
      node.replaceWith(fragment);
    }
    heading.dataset.wordsReady = 'true';
  };
  document.querySelectorAll('h1, .section-heading h2, #about-title, #capabilities-title, #contact-title').forEach(splitWords);

  // Preserve a single accessible label; the second visual line is aria-hidden.
  document.querySelectorAll('.nav-link, .quiet-link, .footer-column a, .back-top').forEach(link => {
    [...link.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()).forEach(node => {
      const text = node.textContent.trim();
      const clip = document.createElement('span'); clip.className = 'roll-clip';
      const stack = document.createElement('span'); stack.className = 'roll-stack';
      const line = document.createElement('span'); line.className = 'roll-line'; line.textContent = text;
      const duplicate = line.cloneNode(true); duplicate.setAttribute('aria-hidden', 'true');
      stack.append(line, duplicate); clip.append(stack); node.replaceWith(clip);
    });
  });

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('is-unseen'); played.add(entry.target); revealObserver.unobserve(entry.target);
    });
  }, {threshold:.06, rootMargin:'0px 0px -15px 0px'}) : null;
  const watchReveals = () => {
    targets.forEach(target => {
      if (enabled && revealObserver && !played.has(target) && target.getBoundingClientRect().top > innerHeight - 25) {
        target.classList.add('is-unseen'); revealObserver.observe(target);
      } else { target.classList.remove('is-unseen'); played.add(target); }
    });
  };
  const viewObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-in-view', entry.isIntersecting);
      if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target);
    });
    scheduleScroll();
  }, {rootMargin:'80px 0px', threshold:0}) : null;
  document.querySelectorAll('.project-image, .footer-art, .hero-compass, .hero-art, .editorial-asterisk').forEach(node => { if (viewObserver) viewObserver.observe(node); });
  document.querySelector('.footer-grid').classList.add('reveal');
  targets.push(document.querySelector('.footer-grid'));

  const play = (element, frames, options = {}) => {
    if (!enabled || !element?.animate) return;
    const animation = element.animate(frames, {duration:700, easing:'cubic-bezier(.16,1,.3,1)', ...options});
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
    return animation;
  };

  function updateScroll() {
    scrollFrame = 0;
    if (document.hidden) return;
    const length = document.documentElement.scrollHeight - innerHeight;
    const progress = length > 0 ? Math.max(0, Math.min(1, scrollY / length)) : 0;
    root.style.setProperty('--page-progress', progress.toFixed(4));
    let current = 0;
    chapters.forEach((section, index) => { if (section.getBoundingClientRect().top < innerHeight * .52) current = index; });
    chapterLinks.forEach((link,index) => { if (index === current) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current'); });
    rail.querySelector('.journey-current').textContent = String(current + 1).padStart(2,'0');
    const railVisible = scrollY > hero.offsetTop + hero.offsetHeight * .5 && !document.body.classList.contains('modal-open');
    rail.classList.toggle('is-visible', railVisible);
    rail.inert = !railVisible;
    if (!enabled) return;
    for (const node of inView) {
      const rect = node.getBoundingClientRect();
      const ratio = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight));
      if (node.matches('.project-image') && fine.matches) node.style.setProperty('--image-scroll', (ratio * 18).toFixed(2) + 'px');
      if (node.matches('.footer-art')) node.style.setProperty('--sea-shift', (ratio * 8).toFixed(2) + 'px');
      if (node.matches('.hero-art')) { node.style.setProperty('--hero-sea-x', (ratio * 7).toFixed(2) + 'px'); node.style.setProperty('--hero-sea-y', (ratio * 3).toFixed(2) + 'px'); }
      if (node.matches('.editorial-asterisk')) node.style.setProperty('--asterisk-turn', (ratio * 120).toFixed(2) + 'deg');
    }
  }
  function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', scheduleScroll, {passive:true});
  addEventListener('resize', scheduleScroll, {passive:true});
  addEventListener('hashchange', scheduleScroll);
  document.fonts?.ready.then(scheduleScroll);

  const moveCursor = () => {
    cursorFrame = 0;
    if (!enabled || !activeCursor || document.hidden) return;
    const state = activeCursor;
    state.x += (state.tx - state.x) * .23; state.y += (state.ty - state.y) * .23;
    state.node.style.setProperty('--cursor-x', state.x.toFixed(2) + 'px');
    state.node.style.setProperty('--cursor-y', state.y.toFixed(2) + 'px');
    if (Math.abs(state.tx-state.x) + Math.abs(state.ty-state.y) > .15) cursorFrame = requestAnimationFrame(moveCursor);
  };
  const wakeCursor = () => { if (!cursorFrame) cursorFrame = requestAnimationFrame(moveCursor); };
  const clearPointer = () => {
    if (cursorFrame) cancelAnimationFrame(cursorFrame);
    cursorFrame = 0; activeCursor = null;
    document.querySelectorAll('.is-hovered').forEach(node => node.classList.remove('is-hovered'));
    document.querySelectorAll('.magnetic').forEach(node => { node.style.setProperty('--magnet-x','0px'); node.style.setProperty('--magnet-y','0px'); });
  };
  document.querySelectorAll('.project-image').forEach((image,index) => {
    const cursor = document.createElement('span'); cursor.className = 'project-cursor'; cursor.setAttribute('aria-hidden','true');
    cursor.innerHTML = `<span class="cursor-index">${String(index+1).padStart(2,'0')} / 04</span><span>View study</span><span class="cursor-arrow">↗</span>`;
    image.append(cursor);
    const place = event => {
      if (!enabled || !fine.matches || innerWidth <= 900 || event.pointerType === 'touch') return;
      const box = image.getBoundingClientRect(); const x = event.clientX-box.left, y = event.clientY-box.top;
      if (!activeCursor || activeCursor.image !== image) activeCursor = {image,node:cursor,x,y,tx:x,ty:y};
      activeCursor.tx = x; activeCursor.ty = y;
      image.style.setProperty('--image-x', ((x/box.width-.5)*7).toFixed(2)+'px');
      image.style.setProperty('--image-y', ((y/box.height-.5)*7).toFixed(2)+'px');
      image.style.setProperty('--image-rotate', ((x/box.width-.5)*.7).toFixed(2)+'deg');
      image.classList.add('is-hovered'); wakeCursor();
    };
    image.addEventListener('pointerenter', place); image.addEventListener('pointermove', place, {passive:true});
    image.addEventListener('pointerleave', () => { image.classList.remove('is-hovered'); image.style.setProperty('--image-x','0px'); image.style.setProperty('--image-y','0px'); image.style.setProperty('--image-rotate','0deg'); if (activeCursor?.image === image) clearPointer(); });
  });

  document.querySelectorAll('.contact-arrow, .hero-compass, .hero-actions .text-link, .back-top, .menu-toggle').forEach(node => {
    node.classList.add('magnetic');
    node.addEventListener('pointermove', event => {
      if (!enabled || !fine.matches || event.pointerType === 'touch') return;
      const box = node.getBoundingClientRect(); const strength = node.matches('.contact-arrow,.hero-compass') ? .14 : .07;
      node.style.setProperty('--magnet-x', Math.max(-9,Math.min(9,(event.clientX-box.left-box.width/2)*strength)).toFixed(2)+'px');
      node.style.setProperty('--magnet-y', Math.max(-7,Math.min(7,(event.clientY-box.top-box.height/2)*strength)).toFixed(2)+'px');
    }, {passive:true});
    node.addEventListener('pointerleave', () => { node.style.setProperty('--magnet-x','0px'); node.style.setProperty('--magnet-y','0px'); });
  });
  hero.addEventListener('pointermove', event => {
    if (!enabled || !fine.matches || !compass || event.pointerType === 'touch') return;
    const box = compass.getBoundingClientRect();
    let angle = Math.atan2(event.clientY-box.top-73,event.clientX-box.left-73)*180/Math.PI+90;
    while (angle-bearing>180) angle-=360; while (angle-bearing< -180) angle+=360;
    bearing = angle; compass.style.setProperty('--compass-bearing',angle.toFixed(2)+'deg');
  }, {passive:true});
  document.addEventListener('click', event => {
    if (!enabled || !fine.matches || event.detail === 0 || !event.target.closest('a,button')) return;
    const echo = document.createElement('span'); echo.className = 'click-echo'; echo.setAttribute('aria-hidden','true');
    echo.style.left = event.clientX-7+'px'; echo.style.top = event.clientY-7+'px'; document.body.append(echo);
    const animation = play(echo,[{opacity:.5,transform:'scale(.4)'},{opacity:0,transform:'scale(3.8)'}],{duration:650});
    if (animation) animation.finished.catch(()=>{}).finally(()=>echo.remove()); else echo.remove();
  });

  const animateCase = event => {
    clearPointer(); scheduleScroll();
    const dialog = event?.detail?.dialog || document.querySelector('#case-dialog');
    if (!enabled || !dialog.open) return;
    if (event?.detail?.origin) return;
    const heading = dialog.querySelector('#case-title'); splitWords(heading);
    heading?.querySelectorAll('.word-inner').forEach((word,index) => play(word,[{transform:'translateY(115%) rotate(3deg)'},{transform:'translateY(0) rotate(0)'}],{duration:850,delay:index*45}));
    [dialog.querySelector('.case-heading .eyebrow'),dialog.querySelector('.case-subtitle'),dialog.querySelector('.case-hero')].forEach((node,index) => { if (node) play(node,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:100+index*65}); });
  };
  const animateContact = event => {
    clearPointer(); scheduleScroll();
    const dialog = event?.detail?.dialog || document.querySelector('#contact-dialog');
    if (dialog.open) play(dialog,[{opacity:0,transform:'translateY(16px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:500});
  };
  addEventListener('portfolio:casechange', animateCase);
  addEventListener('portfolio:contactopen', animateContact);
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close',scheduleScroll));

  const setEnabled = value => {
    enabled = Boolean(value) && !reduce.matches;
    root.classList.toggle('motion-on',enabled); root.classList.toggle('motion-off',!enabled);
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.setAttribute('aria-label', reduce.matches ? 'Animations reduced by your device preference' : enabled ? 'Turn off animations' : 'Turn on animations');
    toggle.querySelector('.motion-toggle-label').textContent = reduce.matches ? 'MOTION REDUCED' : enabled ? 'MOTION ON' : 'MOTION OFF';
    toggle.disabled = reduce.matches;
    if (!enabled) {
      clearPointer(); running.forEach(animation=>animation.cancel());
      revealObserver?.disconnect(); targets.forEach(node=>node.classList.remove('is-unseen'));
      hero.classList.remove('is-arriving');
    } else watchReveals();
    scheduleScroll();
    dispatchEvent(new CustomEvent('portfolio:motionchange', {detail:{enabled}}));
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    storedOff = enabled; setEnabled(!enabled);
    try { localStorage.setItem('luffor-motion',storedOff?'off':'on'); } catch { /* Optional preference storage. */ }
  });
  reduce.addEventListener('change',()=>setEnabled(!storedOff));
  fine.addEventListener('change',()=>{ clearPointer(); scheduleScroll(); });
  document.addEventListener('visibilitychange',()=>{ if (document.hidden) { clearPointer(); if (scrollFrame) cancelAnimationFrame(scrollFrame); scrollFrame=0; root.classList.add('motion-paused'); } else { root.classList.remove('motion-paused'); scheduleScroll(); } });
  root.classList.add('motion-ready');
  setEnabled(!storedOff);
  if (enabled && scrollY < 50 && !location.hash.startsWith('#project-')) { hero.classList.add('is-arriving'); setTimeout(()=>hero.classList.remove('is-arriving'),1700); }
  if (document.querySelector('#case-dialog').open) animateCase();
  if (document.querySelector('#contact-dialog').open) animateContact();
  // Read-only inspection is useful for browser QA and does not change the page.
  window.PortfolioMotion = Object.freeze({get enabled(){return enabled;},get reduced(){return reduce.matches;},get activeAnimations(){return running.size;}});
})();
