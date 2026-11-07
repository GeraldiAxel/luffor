(() => {
  'use strict';
  const data = window.PORTFOLIO;
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const caseDialog = document.querySelector('#case-dialog');
  const contactDialog = document.querySelector('#contact-dialog');
  let returnFocus = null;
  let activeProject = null;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.querySelector('.menu-label').textContent = 'Menu'; nav.classList.remove('is-open'); };
  menu.addEventListener('click', () => {
    const opened = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!opened));
    menu.querySelector('.menu-label').textContent = opened ? 'Menu' : 'Close';
    nav.classList.toggle('is-open', !opened);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  document.querySelectorAll('[data-current-year]').forEach(node => node.textContent = new Date().getFullYear());
  if (data.brand.name !== 'Luffor') {
    document.querySelectorAll('[data-brand]').forEach(node => node.textContent = data.brand.name + '.');
    document.querySelectorAll('[data-brand-plain]').forEach(node => node.textContent = data.brand.name);
    document.querySelectorAll('.wordmark[aria-label]').forEach(node => node.setAttribute('aria-label', data.brand.name + ', home'));
    document.title = data.brand.name + ' — Website & Application Development Agency';
  }
  if (data.brand.logo) document.querySelectorAll('.brand-logo').forEach(node => { node.src = data.brand.logo; node.hidden = false; });
  document.querySelector('.case-topbar .wordmark').textContent = data.brand.name + '.';
  document.querySelectorAll('article.project').forEach((article, index) => {
    const project = data.projects[index];
    if (!project) return;
    article.querySelectorAll('a').forEach(link => link.href = '#project-' + project.slug);
    article.querySelector('.project-image').setAttribute('aria-label', 'View ' + project.title + ' concept study');
    article.querySelector('.project-image > img').src = project.image;
    if (project.alt) article.querySelector('.project-image > img').alt = project.alt;
    article.querySelector('h3 a').textContent = project.title;
    article.querySelector('.project-title p').textContent = project.description;
    article.querySelector('.project-meta > span:first-child').textContent = project.category.toUpperCase();
    article.querySelector('.project-meta > span:last-child').textContent = 'INDEPENDENT CONCEPT';
  });
  const hasLocation = Boolean(data.brand.location && !data.brand.location.startsWith('['));
  const hasAvailability = Boolean(data.brand.availability && !data.brand.availability.startsWith('['));
  const detailValues = [hasLocation ? data.brand.location : 'Your business', data.brand.specialty, hasAvailability ? data.brand.availability : 'Design. Development. Launch.'];
  document.querySelectorAll('.about-details dd').forEach((node, index) => {
    if (index === 2) {
      node.lastChild.textContent = detailValues[index];
      node.querySelector('.availability-dot').hidden = !hasAvailability;
    } else node.textContent = detailValues[index];
  });
  document.querySelector('.about-details dt').textContent = hasLocation ? 'BASED IN' : 'BUILT AROUND';
  document.querySelectorAll('.about-details dt')[2].textContent = hasAvailability ? 'LOOKING AHEAD' : 'FROM IDEA TO';
  document.querySelector('.footer-location').replaceChildren(document.createTextNode(hasLocation ? data.brand.location : 'Websites & applications'), document.createElement('br'), document.createTextNode(hasAvailability ? data.brand.availability : 'Strategy. Design. Development.'));
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email);
  if (validEmail) { const arrow=document.querySelector('.contact-arrow'); arrow.href='mailto:'+data.contact.email; arrow.setAttribute('aria-label','Email '+data.brand.name+' about a project'); }
  if (validEmail) document.querySelectorAll('[data-email]').forEach(link => { link.href = 'mailto:' + data.contact.email; link.replaceChildren(document.createTextNode(data.contact.email + ' '), Object.assign(document.createElement('span'), {textContent:'↗'})); link.lastChild.setAttribute('aria-hidden', 'true'); });
  document.querySelectorAll('[data-social]').forEach(link => {
    const url = data.contact[link.dataset.social];
    if (url && /^https:\/\//.test(url)) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  });

  const syncBodyLock = () => document.body.classList.toggle('modal-open', caseDialog.open || contactDialog.open);
  const openCase = slug => {
    const index = data.projects.findIndex(project => project.slug === slug);
    if (index < 0) return;
    const project = data.projects[index];
    const next = data.projects[(index + 1) % data.projects.length];
    const e = escapeHTML;
    const origin = window.LufforArchive?.consumeLaunch(slug);
    activeProject = slug;
    document.querySelector('#case-content').innerHTML = `
      <div class="case-intro"><div class="case-heading"><p class="eyebrow"><span class="section-number">${String(index + 1).padStart(2, '0')} /</span> Concept study / ${e(project.category)}</p><h2 id="case-title">${e(project.title)}</h2><p class="case-subtitle">${e(project.description)}</p><p class="case-intro-note mono">INDEPENDENT DIGITAL CONCEPT.<br>NOT COMMISSIONED CLIENT WORK.</p></div><div class="case-poster"><div class="case-window"><div class="interface-bar"><span class="window-dots"><i></i><i></i><i></i></span><span>${e(project.title)} / interface concept</span><span>↗</span></div><img class="case-cover" src="${e(project.interface||project.image)}" width="1280" height="800" alt="${e(project.title)} interface concept"></div></div></div>
      <img class="case-hero" src="${e(project.image)}" alt="${e(project.title)} visual concept" width="1600" height="950">
      <div class="case-overview"><dl class="case-facts"><div><dt class="mono">DISCIPLINE</dt><dd>${e(project.category)}</dd></div><div><dt class="mono">PROJECT TYPE</dt><dd>${e(project.year)}</dd></div><div><dt class="mono">FOCUS</dt><dd>${e(project.role)}</dd></div><div><dt class="mono">STATUS</dt><dd>Independent concept</dd></div></dl><div><h3>Overview</h3><p>${e(project.overview)}</p></div></div>
      <div class="case-process"><section><p class="mono">01 / THE QUESTION</p><h3>Challenge</h3><p>${e(project.challenge)}</p></section><section><p class="mono">02 / THE THINKING</p><h3>Approach</h3><p>${e(project.approach)}</p></section><section><p class="mono">03 / THE WORK</p><h3>Outcome</h3><p>${e(project.outcome)}</p></section></div>
      <img class="case-support" src="${e(project.support)}" alt="${e(project.title)} supporting visual exploration" width="1600" height="800" loading="lazy">
      <div class="case-end"><button class="text-link" data-close-case><span aria-hidden="true">←</span> Back to selected work</button><a class="next-study" href="#project-${e(next.slug)}"><span class="mono" style="display:block;margin:0 0 9px;color:var(--slate)">NEXT STUDY</span>${e(next.title)} <span aria-hidden="true">↗</span></a></div>`;
    if (!caseDialog.open) { returnFocus = document.activeElement; caseDialog.showModal(); }
    document.querySelector('#case-title').setAttribute('tabindex', '-1');
    document.querySelector('#case-title').focus({preventScroll: true});
    caseDialog.scrollTop = 0;
    document.title = project.title + ' — ' + data.brand.name;
    syncBodyLock();
    window.dispatchEvent(new CustomEvent('portfolio:casechange', {detail: {dialog: caseDialog, origin, slug}}));
  };
  const closeCase = (restore = true) => {
    if (!caseDialog.open) return;
    const finish = () => {
      caseDialog.close(); activeProject = null;
      if (restore && location.hash.startsWith('#project-')) history.replaceState(null, '', location.pathname + location.search + '#work');
      document.title = data.brand.name + ' — Website & Application Development Agency';
      syncBodyLock();
      if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    };
    if (!window.LufforArchive?.dismiss(caseDialog,finish)) finish();
  };
  const showContact = platform => {
    returnFocus = document.activeElement;
    document.querySelector('#contact-dialog-title').textContent = platform ? 'Elsewhere.' : 'Let’s talk.';
    document.querySelector('#contact-dialog-copy').textContent = platform ? 'This profile link is a placeholder. Your own profile will appear here when added.' : 'This is a replaceable contact detail. Your own email address will appear here when added.';
    document.querySelector('#contact-dialog-value').textContent = platform ? '[' + platform.toUpperCase() + ' PROFILE]' : '[EMAIL ADDRESS]';
    if (!contactDialog.open) contactDialog.showModal();
    syncBodyLock();
    window.dispatchEvent(new CustomEvent('portfolio:contactopen', {detail: {dialog: contactDialog}}));
  };
  const closeContact = () => {
    contactDialog.close();
    if (location.hash === '#contact-details' || location.hash.startsWith('#social-')) history.replaceState(null, '', location.pathname + location.search + '#contact');
    syncBodyLock();
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
  };
  const route = () => {
    const hash = location.hash;
    if (hash.startsWith('#project-')) {
      const slug = hash.slice(9);
      if (data.projects.some(project => project.slug === slug)) { openCase(slug); return; }
    }
    if (caseDialog.open) closeCase(false);
    if (hash === '#contact-details') { if (validEmail) location.href = 'mailto:' + data.contact.email; else showContact(); }
    else if (hash.startsWith('#social-')) { const platform = hash.slice(8); if (['instagram', 'behance', 'linkedin'].includes(platform)) showContact(platform); }
    else if (contactDialog.open) { contactDialog.close(); syncBodyLock(); }
  };
  document.addEventListener('click', event => {
    if (event.target.closest('[data-close-case]')) { event.preventDefault(); closeCase(); return; }
    if (event.target.closest('[data-close-contact]')) { event.preventDefault(); closeContact(); return; }
    const link = event.target.closest('a[href^="#project-"], a[href="#contact-details"], a[href^="#social-"]');
    if (link && link.hash === location.hash) { event.preventDefault(); route(); }
  });
  caseDialog.addEventListener('cancel', event => { event.preventDefault(); closeCase(); });
  contactDialog.addEventListener('cancel', event => { event.preventDefault(); closeContact(); });
  contactDialog.addEventListener('click', event => { const rect = contactDialog.getBoundingClientRect(); if (event.target === contactDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeContact(); });
  window.addEventListener('hashchange', route);
  route();

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { document.querySelectorAll('.main-nav a').forEach(link => { if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current'); }); } }), {rootMargin:'-15% 0px -60% 0px',threshold:0});
    ['capabilities','work','about','contact'].forEach(id => sectionObserver.observe(document.getElementById(id)));
  }
})();
