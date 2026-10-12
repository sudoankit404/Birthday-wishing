/* =====================================================
   Birthday website for Naina Ma'am — from Ankit Sharma
   ---------------------------------------------------
   PHOTOS: put 21 pictures in a folder named "photos"
   next to index.html and name them photo1.jpg ...
   photo21.jpg (jpg, jpeg, png or webp all work).
   Change PHOTO_COUNT below to use 20, 21 or 22 photos.
   ===================================================== */
(() => {
  'use strict';

  const PHOTO_COUNT = 21;
  const BIRTHDAY = new Date(2026, 9, 12); // 12 October 2026

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* ---------- Flower SVG generator ---------- */
  const PALETTES = [
    ['#f7a1b9', '#ffd3df'], ['#ff8fab', '#ffc2d1'], ['#c9a7f5', '#e8d9ff'],
    ['#ffb88c', '#ffe0cc'], ['#f9d56e', '#fff0b8'], ['#ff7aa2', '#ffc0d4']
  ];
  function flowerSVG(p, n = 9) {
    let outer = '', inner = '';
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      outer += `<g transform="rotate(${a.toFixed(1)} 50 50)"><ellipse class="petal" style="--i:${i}" cx="50" cy="27" rx="10.5" ry="23" fill="${p[0]}" stroke="rgba(255,255,255,.55)" stroke-width=".8"/></g>`;
    }
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i + 180 / n;
      inner += `<g transform="rotate(${a.toFixed(1)} 50 50)"><ellipse class="petal" style="--i:${i + 3}" cx="50" cy="36" rx="7" ry="14" fill="${p[1]}" opacity=".95"/></g>`;
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${outer}${inner}` +
      `<circle class="core" cx="50" cy="50" r="9" fill="#f3c969"/>` +
      `<circle class="core" cx="50" cy="50" r="4.5" fill="#d39a2f"/></svg>`;
  }
  function makeFlower(pi, n, cls = '') {
    const el = document.createElement('span');
    el.className = 'flower ' + cls;
    el.innerHTML = flowerSVG(PALETTES[pi % PALETTES.length], n || 9);
    return el;
  }

  /* ---------- Fill dates ---------- */
  const fullDate = `${WEEKDAYS[BIRTHDAY.getDay()]}, ${BIRTHDAY.getDate()} ${MONTHS[BIRTHDAY.getMonth()]} ${BIRTHDAY.getFullYear()}`;
  $$('[data-date="full"]').forEach(e => (e.textContent = fullDate));
  $('#bigDay').textContent = BIRTHDAY.getDate();
  $('#bigMonth').textContent = MONTHS[BIRTHDAY.getMonth()];
  $('#bigWeek').textContent = WEEKDAYS[BIRTHDAY.getDay()];
  $('#bigYear').textContent = BIRTHDAY.getFullYear();

  /* ---------- Calendar ---------- */
  (function buildCalendar() {
    const y = BIRTHDAY.getFullYear(), m = BIRTHDAY.getMonth();
    $('#calHead').textContent = `${MONTHS[m]} ${y}`;
    const grid = $('#calGrid');
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
      const w = document.createElement('div'); w.className = 'w'; w.textContent = d; grid.appendChild(w);
    });
    const first = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++) {
      const e = document.createElement('div'); e.className = 'd empty'; grid.appendChild(e);
    }
    for (let d = 1; d <= total; d++) {
      const c = document.createElement('div');
      c.className = 'd' + (d === BIRTHDAY.getDate() ? ' today' : '');
      c.textContent = d;
      if (d === BIRTHDAY.getDate()) c.setAttribute('aria-label', 'Today, ' + fullDate);
      grid.appendChild(c);
    }
  })();

  /* ---------- Intro atmosphere: stars, fireflies, spotlight ---------- */
  (function atmosphere() {
    const stars = $('#stars');
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 90; i++) {
      const s = document.createElement('i');
      const sz = rand(1, 3);
      s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%;width:${sz}px;height:${sz}px;--t:${rand(2.5, 6)}s;--dl:${rand(0, 5)}s`;
      frag.appendChild(s);
    }
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i');
      s.className = 'ff';
      s.style.cssText = `left:${rand(5, 95)}%;top:${rand(10, 90)}%;width:4px;height:4px;--t:${rand(7, 13)}s;--dl:${rand(0, 6)}s;--fx:${rand(-90, 90)}px;--fy:${rand(-90, 60)}px`;
      frag.appendChild(s);
    }
    stars.appendChild(frag);

    const spot = $('#spot');
    const move = e => {
      const t = e.touches ? e.touches[0] : e;
      spot.style.setProperty('--x', t.clientX + 'px');
      spot.style.setProperty('--y', t.clientY + 'px');
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
  })();

  /* ---------- FX canvas: petals + confetti ---------- */
  const cv = $('#fx'), ctx = cv.getContext('2d');
  let W = 0, H = 0, running = false;
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  const PETAL_COLORS = ['#f9a8c0', '#ffd0dc', '#ffffff', '#f7b6cf', '#e9c6ff', '#ffdca8'];
  const CONF_COLORS = ['#d9567b', '#f4a6b8', '#c9a15b', '#c9a7f5', '#ffffff', '#ffd27a', '#7a2a67'];
  let petals = [], conf = [];

  function newPetal(init) {
    return {
      x: rand(0, W), y: init ? rand(0, H) : -20, s: rand(5, 11),
      vy: rand(.5, 1.4), vx: rand(-.3, .3), r: rand(0, 6.28), vr: rand(-.03, .03),
      sw: rand(0, 6.28), sws: rand(.01, .025),
      c: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0], a: rand(.5, .9)
    };
  }
  function drawPetal(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s);
    ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s);
    ctx.fill(); ctx.restore();
  }
  function burst(x, y, n = 120) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(3, 13);
      conf.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rand(2, 6),
        w: rand(5, 10), h: rand(3, 6), r: rand(0, 6), vr: rand(-.3, .3),
        c: CONF_COLORS[(Math.random() * CONF_COLORS.length) | 0], life: rand(90, 170)
      });
    }
  }
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.sw += p.sws; p.x += p.vx + Math.sin(p.sw) * .7; p.y += p.vy; p.r += p.vr;
      if (p.y > H + 20 || p.x < -30 || p.x > W + 30) Object.assign(p, newPetal(false), { x: rand(0, W) });
      drawPetal(p);
    }
    for (let i = conf.length - 1; i >= 0; i--) {
      const c = conf[i];
      c.vy += .2; c.vx *= .985; c.x += c.vx; c.y += c.vy; c.r += c.vr; c.life--;
      if (c.life <= 0 || c.y > H + 30) { conf.splice(i, 1); continue; }
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
      ctx.globalAlpha = Math.min(1, c.life / 40); ctx.fillStyle = c.c;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore();
    }
    requestAnimationFrame(loop);
  }
  function startFX() {
    if (running) return;
    const count = reduce ? 8 : Math.round(Math.min(42, Math.max(14, W / 24)));
    petals = Array.from({ length: count }, () => newPetal(true));
    running = true; loop();
  }

  /* ---------- Hero: sparkles + garden ---------- */
  (function hero() {
    const sp = $('#sparkles'), f = document.createDocumentFragment();
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('i'); s.className = 'sparkle';
      s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 85)}%;--s:${rand(4, 9)}px;--t:${rand(3, 6)}s;--dl:${rand(0, 4)}s`;
      f.appendChild(s);
    }
    sp.appendChild(f);

    const g = $('#garden'), n = window.innerWidth < 520 ? 7 : 11;
    for (let i = 0; i < n; i++) {
      const k = rand(.55, 1.25);
      const plant = document.createElement('div');
      plant.className = 'plant';
      const gd = (i * 0.11).toFixed(2) + 's';
      plant.style.cssText = `--x:${((i + .5) * 100 / n).toFixed(2)}%;--h:calc(${k.toFixed(2)} * clamp(70px,17vh,170px));--s:calc(${k.toFixed(2)} * clamp(54px,9vw,100px));--sw:${rand(4, 7).toFixed(1)}s;--gd:${gd}`;
      plant.innerHTML = '<div class="stem"></div><i class="leaf a"></i><i class="leaf b"></i>';
      const fl = makeFlower(i, 8 + (i % 3));
      fl.style.setProperty('--base', (i * .11 + 1.2).toFixed(2) + 's');
      fl.style.setProperty('--dir', i % 2 ? 'reverse' : 'normal');
      plant.appendChild(fl);
      g.appendChild(plant);
    }
  })();

  $('#celebrate').addEventListener('click', () => {
    burst(W / 2, H * .45, 150);
    setTimeout(() => burst(W * .2, H * .6, 70), 180);
    setTimeout(() => burst(W * .8, H * .6, 70), 340);
  });

  /* ---------- Letter corners, blooms, quote floaters, footer ---------- */
  $('#cTL').appendChild(makeFlower(0, 10));
  $('#cBR').appendChild(makeFlower(2, 10, ''));
  $('#cTL .flower').style.cssText = 'width:100%;height:100%';
  $('#cBR .flower').style.cssText = 'width:100%;height:100%';

  (function blooms() {
    const items = [
      ['Joy', 'Laughter that lights up every single day.'],
      ['Health', 'Strength and wellness in every season.'],
      ['Success', 'Every goal reached, every dream within reach.'],
      ['Peace', 'A calm heart and a smiling soul.']
    ];
    const grid = $('#bloomGrid');
    items.forEach((it, i) => {
      const c = document.createElement('div');
      c.className = 'bloom-card reveal';
      c.style.setProperty('--d', (i * .12) + 's');
      const fl = makeFlower(i + 1, 9 + (i % 2));
      fl.style.setProperty('--base', '.2s');
      c.appendChild(fl);
      c.insertAdjacentHTML('beforeend', `<h3>${it[0]}</h3><p>${it[1]}</p>`);
      grid.appendChild(c);
    });

    const qf = $('#qFloaters');
    for (let i = 0; i < 9; i++) {
      const f = makeFlower(i, 8 + (i % 3));
      const s = rand(60, 150);
      f.style.cssText += `;width:${s}px;height:${s}px;left:${rand(-3, 95)}%;top:${rand(0, 90)}%;--ft:${rand(9, 16)}s;--dir:${i % 2 ? 'reverse' : 'normal'}`;
      f.style.setProperty('--base', (i * .15) + 's');
      qf.appendChild(f);
    }

    const ff = $('#footFlowers');
    for (let i = 0; i < 5; i++) {
      const f = makeFlower(i + 2, 9);
      f.style.setProperty('--base', (i * .15) + 's');
      ff.appendChild(f);
    }
  })();

  /* ---------- Quotes carousel ---------- */
  (function quotes() {
    const Q = [
      'A teacher lights a lamp that outlasts every season — today, we celebrate the one who lit ours.',
      'Some people teach lessons; the rare ones teach us who we can become. You are one of the rare ones.',
      'Like flowers, the finest minds bloom with patience, care and a little sunlight. Thank you for being all three.',
      'Grace is not found in grand gestures, but in the way you make everyone feel they matter.',
      'May every year add more light to your path than there are candles on your cake.',
      'Your words become our wisdom, and your kindness becomes our compass.'
    ];
    const track = $('#qtrack'), dots = $('#qdots'), box = $('#qbox');
    let cur = 0, timer;
    Q.forEach((t, i) => {
      const s = document.createElement('div');
      s.className = 'qslide' + (i === 0 ? ' active' : '');
      s.innerHTML = `<p>${t}</p><span>for Naina Ma'am</span>`;
      track.appendChild(s);
      const d = document.createElement('button');
      d.className = i === 0 ? 'on' : ''; d.setAttribute('aria-label', 'Quote ' + (i + 1));
      d.addEventListener('click', () => { go(i); restart(); });
      dots.appendChild(d);
    });
    const slides = $$('.qslide', track), dotEls = $$('button', dots);
    function go(i) {
      cur = (i + Q.length) % Q.length;
      slides.forEach((s, k) => s.classList.toggle('active', k === cur));
      dotEls.forEach((d, k) => d.classList.toggle('on', k === cur));
    }
    function restart() { clearInterval(timer); timer = setInterval(() => go(cur + 1), 6500); }
    $('#qPrev').addEventListener('click', () => { go(cur - 1); restart(); });
    $('#qNext').addEventListener('click', () => { go(cur + 1); restart(); });
    let sx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) { go(cur + (dx < 0 ? 1 : -1)); restart(); }
    });
    box.addEventListener('mouseenter', () => clearInterval(timer));
    box.addEventListener('mouseleave', restart);
    restart();
  })();

  /* ---------- Gallery: auto-scrolling photo reels ---------- */
  (function reels() {
    const host = $('#reels');
    const ROWS = 3;
    const SPEEDS = [46, 36, 54]; // pixels per second, one value per row
    const ratios = [0.8, 1, 0.75, 1.25, 0.8, 1, 0.75, 0.8, 1.25, 1, 0.75];
    const cols = [['#ffd6e0', '#ffeef3'], ['#e8d9ff', '#fbf5ff'], ['#ffe2cf', '#fff3ea'], ['#ffd9ec', '#fff0f7']];
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'PNG'];
    const perRow = Math.ceil(PHOTO_COUNT / ROWS);
    const rows = [];

    function makePH(n, col) {
      const d = document.createElement('div');
      d.className = 'ph';
      d.style.cssText = `--c1:${col[0]};--c2:${col[1]}`;
      d.innerHTML = `<span class="f">🌸</span><b>Photo ${n}</b><span>Photo/photo${n}.jpeg</span>`;
      return d;
    }

    function makeItem(n) {
      const fig = document.createElement('figure');
      fig.className = 'm-item';
      fig.style.setProperty('--ar', ratios[(n - 1) % ratios.length]);
      const col = cols[(n - 1) % cols.length];
      const done = new Promise(resolve => {
        const img = new Image();
        img.alt = 'Memory photo ' + n;
        img.decoding = 'async';
        img.draggable = false;
        let k = 0;
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            fig.style.setProperty('--ar', (img.naturalWidth / img.naturalHeight).toFixed(4));
          }
          resolve();
        };
        img.onerror = () => {
          k++;
          if (k < exts.length) img.src = `Photo/photo${n}.${exts[k]}`;
          else { img.onerror = null; fig.replaceChildren(makePH(n, col)); resolve(); }
        };
        img.src = `Photo/photo${n}.${exts[0]}`;
        fig.appendChild(img);
      });
      return { fig, done };
    }

    function setSpeed(o) {
      const seconds = (o.track.offsetWidth / 2) / o.speed;
      o.track.style.setProperty('--dur', Math.max(20, seconds).toFixed(1) + 's');
    }

    // Repeat the photos until each half of the track is wider than the screen,
    // so the loop never shows a gap, then start scrolling.
    function finalize(o) {
      const setW = o.track.offsetWidth || 1;
      const need = Math.max(window.innerWidth, (window.screen && window.screen.width) || 0) * 1.25;
      const m = Math.max(1, Math.ceil(need / setW));
      const items = Array.from(o.track.children);
      const frag = document.createDocumentFragment();
      for (let c = 1; c < 2 * m; c++) {
        items.forEach(it => {
          const cl = it.cloneNode(true);
          cl.setAttribute('aria-hidden', 'true');
          frag.appendChild(cl);
        });
      }
      o.track.appendChild(frag);
      setSpeed(o);
      o.row.classList.add('run');
    }

    for (let r = 0; r < ROWS; r++) {
      const start = r * perRow + 1;
      const end = Math.min(PHOTO_COUNT, (r + 1) * perRow);
      if (start > end) continue;
      const row = document.createElement('div');
      row.className = 'm-row reveal' + (r % 2 ? ' rev' : '');
      row.style.setProperty('--d', (r * .15) + 's');
      const track = document.createElement('div');
      track.className = 'm-track';
      const waits = [];
      for (let n = start; n <= end; n++) {
        const it = makeItem(n);
        track.appendChild(it.fig);
        waits.push(it.done);
      }
      row.appendChild(track);
      host.appendChild(row);
      const o = { row, track, speed: SPEEDS[r % SPEEDS.length] };
      rows.push(o);
      Promise.race([Promise.all(waits), new Promise(res => setTimeout(res, 6000))]).then(() => finalize(o));
    }

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => rows.forEach(o => o.row.classList.contains('run') && setSpeed(o)), 250);
    });
  })();

  /* ---------- Scroll: progress bar, reveal, scroll-spy ---------- */
  const prog = $('.progress');
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight || 1;
    prog.style.transform = `scaleX(${Math.min(1, h.scrollTop / max)})`;
  }
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

  function startObservers() {
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in', 'go');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal, .flower, .garden').forEach(el => io.observe(el));

    const links = $$('.nav a');
    const spy = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { threshold: .45 });
    ['home', 'wishes', 'date', 'quotes', 'gallery'].forEach(id => spy.observe(document.getElementById(id)));
  }

  /* ---------- The mysterious entry ---------- */
  const intro = $('#intro'), orb = $('#orb'), label = $('#orbLabel'), num = $('#orbNum');
  setTimeout(() => orb.classList.add('ready'), 5600);

  let started = false;
  function begin() {
    if (started) return;
    started = true;
    intro.classList.add('charging');
    orb.classList.add('charging');
    const steps = [['3', 'Something is stirring…'], ['2', 'A secret is unfolding…'], ['1', 'Open your eyes…']];
    steps.forEach((s, i) => setTimeout(() => { num.textContent = s[0]; label.textContent = s[1]; }, i * 1000));
    setTimeout(openSite, 3000);
  }
  function openSite() {
    intro.classList.add('opening');
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);
    setTimeout(() => {
      document.body.classList.add('revealed');
      startObservers();
      startFX();
      burst(W / 2, H * .42, 160);
      setTimeout(() => burst(W * .25, H * .5, 80), 300);
      setTimeout(() => burst(W * .75, H * .5, 80), 500);
    }, 700);
    setTimeout(() => intro.classList.add('gone'), 2100);
  }
  orb.addEventListener('click', begin);
})();
