/* Packages, WhatsApp links, launch offer and the header menu. Values come from site-data.js. */
(() => {
  'use strict';
  const data = window.PORTFOLIO || {};
  const contact = data.contact || {}, prices = data.packages || {}, offer = data.launchOffer || {};
  const T = (key, en) => window.LufforI18n ? window.LufforI18n.t(key, en) : en;
  const lang = () => window.LufforI18n?.lang || 'en';
  const wa = String(contact.whatsapp || '').replace(/\D/g, '');
  const hasWa = wa.length >= 9;
  const email = contact.email || '';
  const rupiah = n => 'Rp ' + Number(n).toLocaleString('id-ID');

  const labels = {
    ask: ['Ask about this package', 'Email about this package'],
    quote: ['Request a quote', 'Request a quote by email'],
    offer: ['Claim the offer', 'Claim the offer by email'],
    chat: ['Chat on WhatsApp', 'Send an email']
  };
  const messages = {
    general: 'Hi Luffor, I’d like to ask about building a website.',
    landing: 'Hi Luffor, I’d like to ask about the Landing page package.',
    company: 'Hi Luffor, I’d like to ask about the Company website package.',
    store: 'Hi Luffor, I’d like to ask about the Online store package.',
    custom: 'Hi Luffor, I’d like a quote for a custom web application.',
    offer: 'Hi Luffor, I’m interested in the launch offer.'
  };
  const kindOf = context => context === 'custom' ? 'quote' : context === 'offer' ? 'offer' : context === 'general' ? 'chat' : 'ask';

  // A WhatsApp (or, without a number, email) link with a prefilled message in the visitor's language.
  function contactHref(context) {
    const text = T('wa.msg.' + context, messages[context] || messages.general);
    if (hasWa) return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text);
    return email ? 'mailto:' + email + '?subject=' + encodeURIComponent('Luffor') + '&body=' + encodeURIComponent(text) : '#contact';
  }
  window.LufforContact = { href: contactHref, hasWhatsApp: hasWa };

  function render() {
    document.querySelectorAll('[data-wa-link]').forEach(a => {
      const context = a.dataset.waContext || 'general';
      a.href = contactHref(context);
      if (hasWa) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } else { a.removeAttribute('target'); a.removeAttribute('rel'); }
      const label = a.querySelector('[data-wa-label]');
      if (label) {
        const kind = kindOf(context);
        label.textContent = T((hasWa ? 'wa.' : 'mail.') + kind, labels[kind][hasWa ? 0 : 1]);
      }
    });
    document.querySelectorAll('[data-price]').forEach(el => {
      const value = prices[el.dataset.price];
      const ok = typeof value === 'number' && value > 0;
      el.textContent = ok ? rupiah(value) : T('price.placeholder', '[Price]');
      el.classList.toggle('is-placeholder', !ok);
    });
    const banner = document.querySelector('[data-launch-offer]');
    if (banner) {
      const d = offer.discountPercent;
      banner.hidden = !(typeof d === 'number' && d > 0);
      if (!banner.hidden) {
        const slots = typeof offer.slots === 'number' && offer.slots > 0 ? offer.slots : null;
        let text = slots ? T('offer.text', '{discount}% off for our first {slots} clients.') : T('offer.textNoSlots', '{discount}% off for our first clients.');
        text = text.replace('{discount}', d).replace('{slots}', slots);
        const end = /^\d{4}-\d{2}-\d{2}$/.test(offer.endDate || '') ? new Date(offer.endDate + 'T00:00:00') : null;
        if (end && !isNaN(end)) {
          if (end < new Date(new Date().toDateString())) banner.hidden = true;
          const date = end.toLocaleDateString(lang() === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          text += ' ' + T('offer.until', 'Valid until {date}.').replace('{date}', date);
        }
        banner.querySelector('[data-offer-text]').textContent = text;
      }
    }
  }

  // Header: the section links show inline on wide screens and in a dropdown on phones.
  const menu = document.querySelector('.nav-menu');
  const wide = matchMedia('(min-width: 761px)');
  const syncMenu = () => { if (menu) menu.open = wide.matches; };
  wide.addEventListener('change', syncMenu);
  menu?.addEventListener('click', e => { if (!wide.matches && e.target.closest('.nav-link')) menu.open = false; });
  document.addEventListener('click', e => { if (menu && !wide.matches && menu.open && !menu.contains(e.target)) menu.open = false; });

  // Cursor spotlight on cards.
  document.querySelectorAll('.ls-spot').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  // Process: the rail fills and step numbers light up as the visitor scrolls through the steps.
  const steps = document.querySelector('[data-steps]');
  if (steps) {
    const items = [...steps.children];
    let queued = false;
    const update = () => {
      queued = false;
      const r = steps.getBoundingClientRect(), mark = innerHeight * 0.62;
      const p = Math.min(Math.max((mark - r.top) / r.height, 0), 1);
      steps.style.setProperty('--progress', p.toFixed(3));
      items.forEach(li => li.classList.toggle('is-reached', li.getBoundingClientRect().top < mark));
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', queue, { passive: true }); addEventListener('resize', queue); update();
  }

  syncMenu();
  render();
  addEventListener('luffor:langchange', render);
})();
