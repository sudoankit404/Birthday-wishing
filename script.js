(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Falling petals ---------- */
  const petalBox = $('#petals');
  function makePetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 12 + Math.random() * 16;
    p.style.setProperty('--x', Math.random() * 100 + 'vw');
    p.style.setProperty('--s', size + 'px');
    p.style.setProperty('--dur', 11 + Math.random() * 12 + 's');      // slow fall
    p.style.setProperty('--delay', -Math.random() * 20 + 's');        // already mid-air on load
    p.style.setProperty('--sway', 2.5 + Math.random() * 3 + 's');
    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    p.appendChild(document.createElement('span'));
    petalBox.appendChild(p);
  }
  if (!reduceMotion) {
    const count = window.innerWidth < 600 ? 16 : window.innerWidth < 1000 ? 24 : 34;
    for (let i = 0; i < count; i++) makePetal();
  }

  /* ---------- Typing effect ---------- */
  const typedEl = $('#typed');
  const phrases = [
    'You are the most beautiful part of my life.',
    'Every day with you feels like a celebration.',
    'May all your dreams bloom like roses today.',
    'I love you, now and always.'
  ];
  if (reduceMotion) {
    typedEl.textContent = phrases[0];
  } else {
    let pi = 0, ci = 0, del = false;
    (function tick() {
      const text = phrases[pi];
      typedEl.textContent = text.slice(0, ci);
      let wait = del ? 28 : 65;
      if (!del && ci === text.length) { del = true; wait = 1800; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 500; }
      else ci += del ? -1 : 1;
      setTimeout(tick, wait);
    })();
  }

  /* ---------- Reveal on scroll ---------- */
  $$('.cards .card').forEach((el, i) => el.style.setProperty('--d', i * 0.15 + 's'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Navigation ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#links');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { links.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Gallery slider ---------- */
  const slider = $('#slider');
  const dotsBox = $('#dots');

  // Build the slides from the list in photos.js
  const photoList = (typeof NAINA_PHOTOS !== 'undefined' && Array.isArray(NAINA_PHOTOS)) ? NAINA_PHOTOS : [];
  photoList.forEach((p, i) => {
    const fig = document.createElement('figure');
    fig.className = 'slide';
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.caption || `Memory ${i + 1}`;
    img.loading = 'lazy';
    const cap = document.createElement('figcaption');
    cap.textContent = p.caption || '';
    fig.append(img, cap);
    slider.appendChild(fig);
  });
  const slides = $$('.slide', slider);

  // Friendly placeholder if a photo file can't be found
  slides.forEach((slide, i) => {
    const img = $('img', slide);
    img.addEventListener('error', () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#5a1236'/><stop offset='1' stop-color='#2a0a1c'/></linearGradient></defs>
        <rect width='800' height='1000' fill='url(#g)'/>
        <text x='400' y='470' text-anchor='middle' font-size='120'>❤</text>
        <text x='400' y='580' text-anchor='middle' font-family='sans-serif' font-size='40' fill='#f3d3a4'>Photo not found</text>
        <text x='400' y='640' text-anchor='middle' font-family='sans-serif' font-size='26' fill='#e8c9d2'>${(photoList[i] && photoList[i].src || '').replace(/[<>&']/g, '')}</text>
      </svg>`;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  });

  slides.forEach((_, i) => {
    const d = document.createElement('i');
    d.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(d);
  });
  const dots = $$('i', dotsBox);
  let current = 0;

  function setActive(i) {
    current = i;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  }
  function nearest() {
    const mid = slider.scrollLeft + slider.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    slides.forEach((s, i) => {
      const c = s.offsetLeft + s.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }
  function goTo(i) {
    i = (i + slides.length) % slides.length;
    const s = slides[i];
    slider.scrollTo({ left: s.offsetLeft - (slider.clientWidth - s.offsetWidth) / 2, behavior: 'smooth' });
  }
  let ticking = false;
  slider.addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { setActive(nearest()); ticking = false; });
  }, { passive: true });
  $('#prev').addEventListener('click', () => goTo(current - 1));
  $('#next').addEventListener('click', () => goTo(current + 1));
  window.addEventListener('resize', () => goTo(current));
  setActive(0);
  window.addEventListener('load', () => goTo(0));

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbIndex = 0;
  function showLb(i) {
    lbIndex = (i + slides.length) % slides.length;
    const img = $('img', slides[lbIndex]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $('figcaption', slides[lbIndex]).textContent;
  }
  function openLb(i) { showLb(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  slides.forEach((s, i) => s.addEventListener('click', () => {
    if (i !== current) goTo(i); else openLb(i);
  }));
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => showLb(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showLb(lbIndex + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });
  // swipe in lightbox
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
  });

  /* ---------- Surprise ---------- */
  const letter = $('#letter'), btn = $('#surprise');
  const emojis = ['❤', '💖', '💕', '🌹', '✨', '💗', '🎉'];
  function burst(x, y) {
    if (reduceMotion) return;
    for (let i = 0; i < 34; i++) {
      const b = document.createElement('span');
      b.className = 'burst';
      b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 220;
      b.style.left = x + 'px'; b.style.top = y + 'px';
      b.style.setProperty('--tx', Math.cos(ang) * dist + 'px');
      b.style.setProperty('--ty', Math.sin(ang) * dist - 60 + 'px');
      b.style.setProperty('--r', (Math.random() * 360 - 180) + 'deg');
      b.style.setProperty('--fs', 16 + Math.random() * 20 + 'px');
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1900);
    }
  }
  btn.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2);
    const open = letter.classList.toggle('open');
    btn.textContent = open ? 'Close the letter 💌' : 'Tap to open 💌';
    if (open) setTimeout(() => letter.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
  });

  $('#year').textContent = new Date().getFullYear();
})();
