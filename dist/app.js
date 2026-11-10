/* The hero and footer share the same brand and enquiry details. */
(() => {
  'use strict';
  const {brand, contact} = window.PORTFOLIO;
  const dialog = document.querySelector('#contact-dialog');
  let returnFocus = null;
  document.querySelectorAll('[data-current-year]').forEach(node => node.textContent = new Date().getFullYear());
  if (brand.name !== 'Luffor') {
    document.querySelectorAll('[data-brand]').forEach(node => node.textContent = brand.name + '.');
    document.querySelectorAll('[data-brand-plain]').forEach(node => node.textContent = brand.name);
    document.querySelectorAll('.wordmark[aria-label]').forEach(node => node.setAttribute('aria-label', brand.name + ', home'));
    document.title = brand.name + ' — Website & Application Development Agency';
  }
  if (brand.logo) document.querySelectorAll('.brand-logo').forEach(node => { node.src = brand.logo; node.hidden = false; });
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    document.querySelectorAll('[data-email], .primary-cta, .contact-arrow').forEach(link => link.href = 'mailto:' + contact.email);
    document.querySelector('.contact-arrow').setAttribute('aria-label', 'Email ' + brand.name + ' about a project');
    document.querySelectorAll('[data-email]').forEach(link => {
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      link.replaceChildren(document.createTextNode(contact.email + ' '), arrow);
    });
  }
  const locationText = brand.location && !brand.location.startsWith('[') ? brand.location : brand.specialty;
  const availability = brand.availability && !brand.availability.startsWith('[') ? brand.availability : 'Strategy. Design. Development.';
  document.querySelector('.footer-location').replaceChildren(document.createTextNode(locationText), document.createElement('br'), document.createTextNode(availability));
  document.querySelectorAll('[data-social]').forEach(link => {
    const url = contact[link.dataset.social];
    if (url && /^https:\/\//.test(url)) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  });
  const closeContact = () => {
    dialog.close(); document.body.classList.remove('modal-open');
    if (location.hash.startsWith('#social-')) history.replaceState(null, '', location.pathname + location.search + '#contact');
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
  };
  const route = () => {
    const hash = location.hash;
    if (/^#(?:capabilities|work|about|project-.*)$/.test(hash)) history.replaceState(null, '', location.pathname + location.search + '#top');
    const platform = hash.slice(8);
    if (!hash.startsWith('#social-') || !['instagram', 'behance', 'linkedin'].includes(platform)) {
      if (dialog.open) closeContact();
      return;
    }
    returnFocus = document.activeElement;
    document.querySelector('#contact-dialog-title').textContent = 'Elsewhere.';
    document.querySelector('#contact-dialog-copy').textContent = 'This profile link is a placeholder. Your own profile will appear here when added.';
    document.querySelector('#contact-dialog-value').textContent = '[' + platform.toUpperCase() + ' PROFILE]';
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    dispatchEvent(new CustomEvent('portfolio:contactopen', {detail: {dialog}}));
  };
  document.addEventListener('click', event => {
    if (event.target.closest('[data-close-contact]')) { event.preventDefault(); closeContact(); return; }
    const link = event.target.closest('a[href^="#social-"]');
    if (link && link.hash === location.hash) { event.preventDefault(); route(); }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeContact(); });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeContact();
  });
  addEventListener('hashchange', route);
  route();
})();
