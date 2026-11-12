/* Brand, contact, pricing and launch-offer details. Edit this file; the page updates everywhere. */
window.PORTFOLIO = {
  brand: { name: 'Luffor', logo: '', location: '[Location]', specialty: 'Websites & applications', availability: '[Availability]' },
  contact: {
    email: 'lufforsolution@gmail.com',
    // WhatsApp number in international format, digits only: e.g. '6281234567890' for 0812-3456-7890.
    // While empty, every WhatsApp button falls back to email.
    whatsapp: '',
    instagram: '', behance: '', linkedin: ''
  },
  // Starting prices in Indonesian rupiah, as plain numbers (e.g. 3500000).
  // null shows a visible "[Price]" placeholder; `npm run check` warns until every price is set.
  // The custom application is always quoted per project.
  packages: {
    landing: null,
    company: null,
    store: null
  },
  // Launch offer for the first clients. The banner stays hidden until discountPercent is a number.
  // slots and endDate (YYYY-MM-DD) are optional.
  launchOffer: { discountPercent: null, slots: null, endDate: '' }
};
