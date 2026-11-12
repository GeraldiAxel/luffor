/* English / Bahasa Indonesia switch.
   English is authored in index.html (works without JavaScript and for search engines).
   Indonesian lives in ID below, keyed by each element's data-i18n attribute.
   Scripts that build text at runtime call LufforI18n.t(key, englishText) and listen for `luffor:langchange`. */
(() => {
  'use strict';
  const ID = {
    // header, hero, footer
    'nav.pricing': 'Harga', 'nav.talk': 'Hubungi kami',
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
    
    // the inspected concept, the concept index and the first-message note (body.css / body.js)
    'look.title': 'Satu layar, dan tiga keputusan <em>di dalamnya.</em>',
    'look.lead': 'Common Ground adalah ruang kerja tim yang kami rancang sebagai konsep, bukan untuk klien. Kami tampilkan di sini agar Anda bisa menilai sendiri perhatian yang akan didapat layar milik Anda.',
    'look.caption': 'Common Ground · aplikasi custom · konsep antarmuka dengan konten demonstrasi',
    'look.1.name': 'Filter',
    'look.1.copy': 'Tiga filter berada di atas papan. Memilih “Assigned to me” mengganti pekerjaan semua orang dengan pekerjaan Anda sendiri, tanpa berpindah halaman.',
    'look.2.name': 'Kartu tugas',
    'look.2.copy': 'Setiap kartu menampilkan jenis pekerjaan, tugasnya, dan tim yang memegangnya. Anda tahu giliran siapa sebelum membuka apa pun.',
    'look.3.name': 'Tahapan',
    'look.3.copy': 'Pekerjaan bergerak dari kiri ke kanan: perencanaan, sedang dikerjakan, siap ditinjau. Angka di samping tiap tahap menunjukkan di mana pekerjaan mengantre.',
    'index.title': 'Tiga konsep lain, dan paket yang <em>paling dekat</em> dengan masing-masing.',
    'index.lead': 'Keempatnya adalah konsep Luffor sendiri dengan konten demonstrasi. Tidak satu pun merupakan pekerjaan klien.',
    'index.forme.kind': 'Website perusahaan · konsep',
    'index.forme.copy': 'Halaman dibuka dengan apa yang dikerjakan Forme dan satu tombol menuju layanannya. “Start a project” tetap ada di header untuk pengunjung yang sudah yakin.',
    'index.forme.link': 'Paket terdekat: Website company profile',
    'index.quiet.kind': 'Website editorial · konsep',
    'index.quiet.copy': 'Tiga cerita membuka halaman depan, masing-masing dengan topik, judul, dan satu tautan untuk lanjut membaca. Tidak ada hal lain yang bersaing dengan tulisannya.',
    'index.quiet.link': 'Paket terdekat: Website company profile',
    'index.perspective.kind': 'Dashboard laporan · konsep',
    'index.perspective.copy': 'Tiga tren berada di atas satu grafik aktivitas, dan panel “Your next steps” mengubah angka menjadi hal yang perlu dikerjakan. Semua angka yang tampil hanyalah ilustrasi.',
    'index.perspective.link': 'Dihitung sebagai aplikasi web custom',
    'brief.title': 'Pesan pertama Anda cukup <em>tiga kalimat.</em>',
    'brief.link': 'Tulis ke Luffor',
    'brief.1.term': 'Apa yang dikerjakan bisnis Anda',
    'brief.1.copy': 'Dan siapa yang ingin Anda jangkau lewat website atau aplikasinya.',
    'brief.2.term': 'Apa yang harus bisa dilakukan pengunjung',
    'brief.2.copy': 'Memesan, membeli, bertanya, membaca. Satu tindakan yang jelas sudah cukup untuk memulai.',
    'brief.3.term': 'Paket mana yang terlihat paling dekat',
    'brief.3.copy': 'Atau katakan saja jika tidak ada yang cocok. Pekerjaan custom mendapat proposal dengan cakupan, harga tetap, dan jadwal.',
    
    // industries
    
    // FAQ
    
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
    'cockpit.panel.work.index': 'LEMARI KARYA', 'cockpit.panel.work.title': 'Arah yang lebih jelas.',
    'cockpit.panel.services.index': 'MEJA PETA', 'cockpit.panel.services.title': 'Dibangun sesuai bisnis Anda.',
    'cockpit.panel.about.index': 'POS PENGAWAS', 'cockpit.panel.about.title': 'Kru kecil. Satu tujuan.',
    'cockpit.panel.contact.index': 'RADIO KAPAL', 'cockpit.panel.contact.title': 'Kirim sinyal.',
    'cockpit.concepts': 'KONSEP ANTARMUKA INDEPENDEN', 'cockpit.build': 'Bangun proyek Anda berikutnya',
    'cockpit.services.copy': 'Dari ide yang belum jelas menjadi solusi digital yang berguna. Strategi, desain, dan pengembangan, bekerja bersama.',
    'cockpit.services.1': 'Desain &amp; pengembangan website', 'cockpit.services.2': 'Aplikasi web custom', 'cockpit.services.3': 'UI / UX &amp; strategi digital',
    'cockpit.discuss': 'Diskusikan proyek Anda',
    'cockpit.about.copy': 'Luffor adalah agensi digital yang membantu bisnis menemukan arah yang jelas di tengah tantangan yang rumit.',
    'cockpit.about.1': 'Di kemudi: pengembangan', 'cockpit.about.2': 'Di meja peta: strategi &amp; perencanaan', 'cockpit.about.3': 'Di pos pengawas: desain &amp; UI / UX',
    'cockpit.start': 'Mulai percakapan',
    'cockpit.contact.copy': 'Ceritakan apa yang ingin Anda selesaikan. Kami mulai dengan pertanyaan yang tepat.',
    'cockpit.contact.signoff': 'BAB BERIKUTNYA DIMULAI DARI SEBUAH PERCAKAPAN.',
    'cockpit.link.services': 'Lihat paket &amp; harga', 'cockpit.label.home': 'Anjungan. Geser untuk melihat sekeliling. Klik untuk menjelajah.', 'cockpit.label.work': 'Lemari karya',
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
    document.querySelector('[data-current-language]').textContent = lang === 'id' ? 'Bahasa Indonesia' : 'English';
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === lang));
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
    const menus = [...document.querySelectorAll('.nav-disclosure')];
    function close(menu, restoreFocus) {
      menu.open = false;
      if (restoreFocus) menu.querySelector('summary').focus();
    }
    document.addEventListener('click', event => {
      const option = event.target.closest('[data-language]');
      if (option) set(option.dataset.language);
      for (const menu of menus) {
        if (!menu.open) continue;
        if (option || !menu.contains(event.target) || event.target.closest('a')) {
          close(menu, Boolean(option && menu.contains(option)));
        }
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') menus.filter(menu => menu.open).forEach(menu => close(menu, true));
    });
    document.addEventListener('focusin', event => {
      menus.filter(menu => menu.open && !menu.contains(event.target)).forEach(menu => close(menu, false));
    });
    matchMedia('(max-width: 760px)').addEventListener('change', () => menus.forEach(menu => close(menu, false)));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
