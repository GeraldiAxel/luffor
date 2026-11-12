/* English / Bahasa Indonesia switch.
   English is authored in index.html (works without JavaScript and for search engines).
   Indonesian lives in ID below, keyed by each element's data-i18n attribute.
   Scripts that build text at runtime call LufforI18n.t(key, englishText) and listen for `luffor:langchange`. */
(() => {
  'use strict';
  const ID = {
    // header, hero, footer
    'nav.pricing': 'Harga', 'nav.process': 'Proses', 'nav.work': 'Karya', 'nav.faq': 'FAQ',
    'nav.menu': 'Menu', 'nav.talk': 'Hubungi kami',
    'header.note': 'Desain &amp; pengembangan digital',
    'hero.title': 'Website &amp; aplikasi.<br>Dibangun untuk hasil.',
    'hero.copy': 'Kami merancang dan membangun website serta aplikasi custom yang mendorong bisnis Anda maju. Arah yang jelas, dari ide pertama hingga hasil akhir.',
    'hero.cta': 'Mulai percakapan', 'hero.packages': 'Lihat paket',
    'contact.eyebrow': 'Bab berikutnya',
    'contact.title': 'Mari bangun<br><em>solusi digital Anda berikutnya.</em>',
    'contact.line': 'Ceritakan apa yang ingin Anda selesaikan.<br>Kami mulai dengan pertanyaan yang tepat.',
    'contact.whatsapp': 'Chat di WhatsApp',
    'footer.tagline': 'Sudut pandang yang jelas.<br>Kesan yang bertahan.',
    'footer.explore': 'JELAJAHI', 'footer.elsewhere': 'LAINNYA', 'footer.hello': 'SAPA KAMI',
    'footer.toHero': 'Kembali ke atas', 'footer.talk': 'Hubungi kami',
    'footer.colophonA': 'DIPANDU RASA INGIN TAHU. BERAKAR PADA KETELITIAN.', 'footer.colophonB': 'DIRANCANG DENGAN SENGAJA.',
    'cockpit.explore': 'JELAJAHI KOKPIT', 'cockpit.status': 'Geser untuk melihat sekeliling. Klik untuk menjelajah.',
    'cockpit.back': '↶ Kembali ke anjungan',
    'dest.home': 'Anjungan', 'dest.work': 'Karya', 'dest.services': 'Layanan', 'dest.about': 'Tentang', 'dest.contact': 'Kontak',
    'dest.helm': 'Kemudi', 'dest.reverse': 'Lihat ke belakang',

    // process
    
    
    // pricing
    'pricing.eyebrow': 'Paket',
    'pricing.title': 'Harga jelas, <em>sebelum</em> mulai.',
    'pricing.lead': 'Setiap paket memiliki harga tetap yang disepakati di awal. Butuh sesuatu di antaranya? Kami buatkan penawaran.',
    'price.from': 'Mulai', 'pkg.recommended': 'Rekomendasi',
    'pkg.landing.tier': 'Starter', 'pkg.landing.name': 'Landing page',
    'pkg.landing.i1': 'Desain responsif satu halaman', 'pkg.landing.i2': 'Hingga 6 bagian konten',
    'pkg.landing.i3': 'Tombol WhatsApp dan formulir kontak', 'pkg.landing.i4': 'Pengaturan SEO dasar dan Google Analytics',
    'pkg.landing.i5': 'Pengaturan domain dan hosting', 'pkg.landing.i6': '2 kali revisi',
    'pkg.company.tier': 'Bisnis', 'pkg.company.name': 'Website company profile',
    'pkg.company.i1': 'Hingga 8 halaman', 'pkg.company.i2': 'Versi bahasa Inggris dan Indonesia',
    'pkg.company.i3': 'Bagian blog atau berita yang bisa Anda perbarui', 'pkg.company.i4': 'WhatsApp, peta, dan formulir kontak',
    'pkg.company.i5': 'Pengaturan Google Business Profile dan Search Console', 'pkg.company.i6': '3 kali revisi',
    'pkg.store.tier': 'Commerce', 'pkg.store.name': 'Toko online',
    'pkg.store.i1': 'Katalog produk dengan kategori', 'pkg.store.i2': 'Checkout lewat WhatsApp atau pembayaran Midtrans / Xendit',
    'pkg.store.i3': 'Notifikasi pesanan', 'pkg.store.i4': 'Admin untuk mengelola produk dan stok',
    'pkg.store.i5': 'Pengaturan opsi pengiriman', 'pkg.store.i6': 'Sesi pelatihan untuk tim Anda',
    'pkg.custom.tier': 'Custom', 'pkg.custom.name': 'Aplikasi web custom',
    'pkg.custom.copy': 'Ceritakan cara bisnis Anda berjalan. Kami kirimkan proposal dengan cakupan, harga tetap, dan jadwal.',
    'pricing.note': 'Harga dalam rupiah, belum termasuk biaya pihak ketiga seperti domain, hosting, dan biaya pembayaran.',
    'offer.tag': 'Promo peluncuran',

    // process
    'process.eyebrow': 'Proses', 'process.title': 'Cara proyek <em>berjalan</em>.',
    'process.lead': 'Lima langkah, satu kontak, dan Anda selalu tahu langkah berikutnya.',
    'step.1.name': 'Konsultasi gratis', 'step.1.copy': 'Telepon singkat atau chat WhatsApp tentang bisnis, tujuan, dan anggaran Anda.',
    'step.2.name': 'Proposal', 'step.2.copy': 'Proposal harga tetap dengan cakupan dan jadwal. Pengerjaan dimulai setelah DP 50%.',
    'step.3.name': 'Desain', 'step.3.copy': 'Kami mendesain halaman utama terlebih dahulu dan menyempurnakannya bersama Anda sebelum mulai membangun.',
    'step.4.name': 'Pembangunan &amp; peluncuran', 'step.4.copy': 'Kami membangun, menguji di ponsel dan desktop, menghubungkan domain, lalu meluncurkan. Sisa 50% dibayar saat peluncuran.',
    'step.5.name': 'Dukungan', 'step.5.copy': '30 hari perbaikan gratis setelah peluncuran, lalu perawatan bulanan opsional.',
    'included.title': 'Termasuk di setiap proyek',
    'included.1': 'Desain mobile-first', 'included.2': 'Cepat diakses di jaringan Indonesia', 'included.3': 'HTTPS yang aman',
    'included.4': 'Integrasi WhatsApp', 'included.5': 'Pengaturan SEO dasar', 'included.6': 'Domain, konten, dan kode milik Anda',

    // concept work
    'work.eyebrow': 'Karya konsep', 'work.title': 'Cara kami memikirkan <em>antarmuka</em>.',
    'work.lead': 'Ini adalah konsep independen untuk menunjukkan pendekatan kami, bukan proyek klien. Bisnis Anda bisa menjadi studi kasus pertama kami di sini.',
    'concept.1.kind': 'Website perusahaan', 'concept.1.copy': 'Website berbasis layanan dengan alur yang lebih jelas dari kunjungan pertama hingga pertanyaan.',
    'concept.2.kind': 'Website publikasi', 'concept.2.copy': 'Antarmuka editorial yang memberi ruang bagi artikel dan cerita utama.',
    'concept.3.kind': 'Aplikasi custom', 'concept.3.copy': 'Ruang kerja bersama untuk orang, proyek, dan tugas sehari-hari.',
    'concept.4.kind': 'Dashboard &amp; UI / UX', 'concept.4.copy': 'Antarmuka laporan yang mengubah informasi rumit menjadi ringkasan yang berguna.',

    // industries
    'ind.eyebrow': 'Untuk siapa', 'ind.title': 'Dibuat untuk bisnis <em>seperti milik Anda</em>.',
    'ind.1.name': 'Toko lokal &amp; UMKM', 'ind.1.copy': 'Katalog, lokasi, dan pemesanan lewat WhatsApp.',
    'ind.2.name': 'Restoran &amp; kafe', 'ind.2.copy': 'Menu, reservasi, dan tautan pesan antar.',
    'ind.3.name': 'Klinik &amp; kesehatan', 'ind.3.copy': 'Layanan, jadwal praktik, dan permintaan janji temu.',
    'ind.4.name': 'Properti', 'ind.4.copy': 'Daftar properti dengan foto, filter, dan formulir pertanyaan.',
    'ind.5.name': 'Pendidikan &amp; kursus', 'ind.5.copy': 'Program, pendaftaran, dan pembayaran online.',
    'ind.6.name': 'Jasa profesional', 'ind.6.copy': 'Website kredibel untuk konsultan, firma hukum, dan akuntan.',

    // FAQ
    'faq.eyebrow': 'FAQ', 'faq.title': 'Pertanyaan yang <em>sering</em> kami dengar.',
    'faq.1.q': 'Berapa biaya pembuatan website?', 'faq.1.a': 'Lihat paket di atas. Setiap harga bersifat tetap dan disepakati sebelum mulai, jadi tidak ada biaya kejutan.',
    'faq.2.q': 'Berapa lama pengerjaannya?', 'faq.2.a': 'Sekitar satu minggu untuk landing page, dua sampai tiga minggu untuk website company profile, dan tiga sampai empat minggu untuk toko online, setelah konten Anda siap.',
    'faq.3.q': 'Apakah saya perlu menyiapkan konten?', 'faq.3.a': 'Kirimkan yang Anda punya: logo, foto, dan detail produk. Kami bantu menyusun dan menulis sisanya dalam bahasa Inggris atau Indonesia.',
    'faq.4.q': 'Siapa pemilik website-nya?', 'faq.4.a': 'Anda. Domain didaftarkan atas nama Anda dan Anda menerima seluruh kode sumber saat serah terima.',
    'faq.5.q': 'Bisakah saya memperbarui website sendiri?', 'faq.5.a': 'Bisa. Kami siapkan cara mudah untuk mengubah teks dan gambar, beserta panduan singkat.',
    'faq.6.q': 'Bagaimana sistem pembayarannya?', 'faq.6.a': 'DP 50% untuk memulai dan 50% saat peluncuran, dengan invoice untuk setiap pembayaran.',
    'faq.7.q': 'Apa yang terjadi setelah peluncuran?', 'faq.7.a': '30 hari perbaikan gratis sudah termasuk. Setelah itu Anda bisa memilih paket perawatan bulanan atau meminta bantuan saat dibutuhkan.',
    'faq.8.q': 'Apakah Anda melayani bisnis di seluruh Indonesia?', 'faq.8.a': 'Ya. Kami bekerja jarak jauh dengan klien di mana pun di Indonesia, lewat WhatsApp, video call, dan email.',

    // runtime strings (sections.js, cockpit-studio.js)
    'wa.ask': 'Tanyakan paket ini', 'wa.quote': 'Minta penawaran', 'wa.offer': 'Ambil promo', 'wa.chat': 'Chat di WhatsApp',
    'mail.ask': 'Email tentang paket ini', 'mail.quote': 'Minta penawaran lewat email', 'mail.offer': 'Ambil promo lewat email', 'mail.chat': 'Kirim email',
    'wa.msg.general': 'Halo Luffor, saya ingin bertanya tentang pembuatan website.',
    'wa.msg.landing': 'Halo Luffor, saya ingin bertanya tentang paket Landing page.',
    'wa.msg.company': 'Halo Luffor, saya ingin bertanya tentang paket Website company profile.',
    'wa.msg.store': 'Halo Luffor, saya ingin bertanya tentang paket Toko online.',
    'wa.msg.custom': 'Halo Luffor, saya ingin minta penawaran untuk aplikasi web custom.',
    'wa.msg.offer': 'Halo Luffor, saya tertarik dengan promo peluncuran.',
    'price.placeholder': '[Harga]',
    'offer.text': 'Diskon {discount}% untuk {slots} klien pertama kami.', 'offer.textNoSlots': 'Diskon {discount}% untuk klien pertama kami.',
    'offer.until': 'Berlaku hingga {date}.',
    'cockpit.panel.work.index': '02 / LEMARI KARYA', 'cockpit.panel.work.title': 'Arah yang lebih jelas.',
    'cockpit.panel.services.index': '03 / MEJA PETA', 'cockpit.panel.services.title': 'Dibangun sesuai bisnis Anda.',
    'cockpit.panel.about.index': '04 / POS PENGAWAS', 'cockpit.panel.about.title': 'Kru kecil. Satu tujuan.',
    'cockpit.panel.contact.index': '05 / RADIO KAPAL', 'cockpit.panel.contact.title': 'Kirim sinyal.',
    'cockpit.concepts': 'KONSEP ANTARMUKA INDEPENDEN', 'cockpit.build': 'Bangun proyek Anda berikutnya',
    'cockpit.services.copy': 'Dari ide yang belum jelas menjadi solusi digital yang berguna. Strategi, desain, dan pengembangan, bekerja bersama.',
    'cockpit.services.1': 'Desain &amp; pengembangan website', 'cockpit.services.2': 'Aplikasi web custom', 'cockpit.services.3': 'UI / UX &amp; strategi digital',
    'cockpit.discuss': 'Diskusikan proyek Anda',
    'cockpit.about.copy': 'Luffor adalah agensi digital yang membantu bisnis menemukan arah yang jelas di tengah tantangan yang rumit.',
    'cockpit.about.1': 'Di kemudi: pengembangan', 'cockpit.about.2': 'Di meja peta: strategi &amp; perencanaan', 'cockpit.about.3': 'Di pos pengawas: desain &amp; UI / UX',
    'cockpit.start': 'Mulai percakapan',
    'cockpit.contact.copy': 'Ceritakan apa yang ingin Anda selesaikan. Kami mulai dengan pertanyaan yang tepat.',
    'cockpit.contact.signoff': 'BAB BERIKUTNYA DIMULAI DARI SEBUAH PERCAKAPAN.',
    'cockpit.link.work': 'Lihat semua konsep', 'cockpit.link.services': 'Lihat paket &amp; harga', 'cockpit.link.about': 'Untuk siapa kami bekerja',
    'cockpit.link.contact': 'Pertanyaan umum',
    'cockpit.label.home': 'Anjungan. Geser untuk melihat sekeliling. Klik untuk menjelajah.', 'cockpit.label.work': 'Lemari karya',
    'cockpit.label.services': 'Meja peta', 'cockpit.label.about': 'Pos pengawas', 'cockpit.label.contact': 'Stasiun radio',
    'cockpit.label.helm': 'Meja kemudi', 'cockpit.label.reverse': 'Melihat ke belakang dari haluan',
    'lang.switch': 'Switch language to English'
  };
  const KEY = 'luffor-lang';
  const english = new Map();
  let lang = 'en';
  try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem(KEY) || 'en'; } catch { /* storage optional */ }
  if (lang !== 'id') lang = 'en';

  const t = (key, en) => (lang === 'id' && ID[key] !== undefined ? ID[key] : en);
  const fill = (el, html) => {
    // Keep motion.js rolling-label markup intact: update its lines instead of replacing it.
    const rolls = el.querySelectorAll('.roll-line');
    if (rolls.length) { const tmp = document.createElement('span'); tmp.innerHTML = html; rolls.forEach(r => r.textContent = tmp.textContent); }
    else el.innerHTML = html;
  };
  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (!english.has(el)) english.set(el, el.innerHTML);
      fill(el, lang === 'id' ? (ID[el.dataset.i18n] ?? english.get(el)) : english.get(el));
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(b => {
      b.setAttribute('aria-label', lang === 'id' ? ID['lang.switch'] : 'Ganti bahasa ke Bahasa Indonesia');
      b.querySelectorAll('[data-lang-opt]').forEach(o => o.classList.toggle('is-active', o.dataset.langOpt === lang));
    });
  }
  function set(next) {
    lang = next === 'id' ? 'id' : 'en';
    try { localStorage.setItem(KEY, lang); } catch { /* storage optional */ }
    apply();
    dispatchEvent(new CustomEvent('luffor:langchange', { detail: { lang } }));
  }
  window.LufforI18n = { get lang() { return lang; }, t, set, id: ID };
  // English text is read from the page before any translation, so run as soon as the DOM is parsed.
  const start = () => {
    apply();
    document.addEventListener('click', e => { if (e.target.closest('[data-lang-toggle]')) set(lang === 'id' ? 'en' : 'id'); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
