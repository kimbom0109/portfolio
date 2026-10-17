/* ═══════════════════════════════════════════
   김보민 Portfolio — main.js
   Handles: Nav scroll, reveal animations,
            project filtering, mobile menu
   ═══════════════════════════════════════════ */

'use strict';

/* ── 1. Navbar Scroll State ── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ── 2. Intersection Observer — Reveal on Scroll ── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // Stagger delay based on position among siblings
      const parent = entry.target.parentElement;
      const siblings = [...parent.querySelectorAll('.reveal')];
      const order = siblings.indexOf(entry.target);
      const delay = Math.min(order * 80, 400);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

/* ── 3. Project Filter ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#view-game .project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        // Re-trigger reveal if needed
        if (!card.classList.contains('visible')) {
          card.classList.add('visible');
        }
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ── 4. Mobile Menu Toggle ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);

  // Animate hamburger → X
  const spans = hamburger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close menu on mobile link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

/* ── 5. Tab Views (hash routing: #/ · #/school · #/game) ── */
const dock = document.createElement('div');
dock.className = 'dock';
dock.hidden = true;
dock.setAttribute('aria-label', '닫은 창');
document.body.appendChild(dock);

function updateDock() {
  let any = false;
  dock.querySelectorAll('.dock-chip').forEach(chip => {
    const show = chip.dataset.view === 'all' || chip.dataset.view === currentView;
    chip.hidden = !show;
    if (show) any = true;
  });
  dock.hidden = !any;
}

const VIEWS = ['home', 'about', 'school', 'game', 'contact'];
const viewEls = document.querySelectorAll('.view');
const viewLinks = document.querySelectorAll('[data-view-link]');
let currentView = 'home';

function showView(name) {
  if (name === currentView) return;
  currentView = name;
  viewEls.forEach(v => v.classList.toggle('active', v.dataset.view === name));
  viewLinks.forEach(l => l.classList.toggle('active', l.dataset.viewLink === name));
  updateDock();
  window.scrollTo(0, 0);
}

function route() {
  const h = location.hash;
  if (h.startsWith('#/')) {
    const name = h.slice(2);
    showView(VIEWS.includes(name) ? name : 'home');
  }
}

window.addEventListener('hashchange', route);
viewLinks.forEach(l => l.classList.toggle('active', l.dataset.viewLink === currentView));
route();

/* ── 5b. Window chrome (title bars) & menu-bar clock ── */
function makeWinBar(title) {
  const bar = document.createElement('div');
  bar.className = 'win-bar';
  bar.innerHTML = '<span class="win-dots"><i></i><i></i><i></i></span>' +
                  '<span class="win-title"></span><span class="win-btns"></span>';
  bar.querySelector('.win-title').textContent = title;
  return bar;
}

document.querySelectorAll('.project-card').forEach(card => {
  const t = card.querySelector('.project-title').textContent.trim();
  const bar = makeWinBar(t + '.exe');
  bar.querySelector('.win-btns').innerHTML = '<b>–</b><b>□</b><b>×</b>';
  card.prepend(bar);
});

document.querySelectorAll('.skill-block').forEach(block => {
  const t = block.querySelector('h3').textContent.trim();
  const bar = makeWinBar(t + '.exe');
  bar.querySelector('.win-btns').innerHTML = '<b>–</b><b>□</b><b>×</b>';
  block.prepend(bar);
});

const contactWin = document.querySelector('.contact-simple');
if (contactWin) {
  const bar = makeWinBar('contact.txt');
  bar.querySelector('.win-btns').innerHTML = '<b>–</b><b>□</b><b>×</b>';
  contactWin.prepend(bar);
}

document.querySelectorAll('.modal-box').forEach(box => {
  const bar = makeWinBar(box.querySelector('.modal-title').textContent.trim());
  const close = box.querySelector('.modal-close');
  if (close) bar.querySelector('.win-btns').appendChild(close);
  box.prepend(bar);
});

/* ── 5c. Interactive windows: minimize · maximize · close ── */
let maxed = null;   // { win, ph, layer, wasMin }

function mkBtn(label, aria, cls) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.textContent = label;
  b.setAttribute('aria-label', aria);
  return b;
}

/* "maximize" = show the window large in the centre of the screen (like the project popups).
   The window is moved into a fixed layer on <body> so the blurred backdrop can never cover it. */
function unmax() {
  if (!maxed) return;
  const { win, ph, layer, wasMin } = maxed;
  win.classList.remove('is-max');
  if (wasMin) win.classList.add('is-min');
  const minBtn = win.querySelector('.wb-min');
  if (minBtn) minBtn.setAttribute('aria-pressed', wasMin);
  ph.replaceWith(win);
  layer.remove();
  maxed = null;
}

function toggleMax(win) {
  if (maxed && maxed.win === win) { unmax(); return; }
  unmax();
  const wasMin = win.classList.contains('is-min');
  const slotHeight = win.offsetHeight;      // measured before expanding, so a folded window leaves a folded-size slot
  const ph = win.cloneNode(false);          // keeps the grid/flow slot while the window is away
  ph.removeAttribute('id');
  ph.className = win.className + ' win-ph';
  ph.style.height = slotHeight + 'px';
  win.classList.remove('is-min');
  const openMinBtn = win.querySelector('.wb-min');
  if (openMinBtn) openMinBtn.setAttribute('aria-pressed', 'false');
  ph.setAttribute('aria-hidden', 'true');
  win.before(ph);
  const layer = document.createElement('div');
  layer.className = 'max-layer';
  layer.addEventListener('click', (e) => { if (e.target === layer) unmax(); });
  layer.appendChild(win);
  document.body.appendChild(layer);
  win.classList.add('is-max');
  maxed = { win, ph, layer, wasMin };
}

function closeWin(win, title) {
  if (maxed && maxed.win === win) unmax();
  win.classList.add('is-closed');
  const v = win.closest('.view');
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'dock-chip';
  chip.textContent = title;
  chip.dataset.view = v ? v.dataset.view : 'all';
  chip.addEventListener('click', () => {
    win.classList.remove('is-closed', 'is-min');
    chip.remove();
    updateDock();
  });
  dock.appendChild(chip);
  updateDock();
}

function setupWindow(win) {
  const bar = win.querySelector(':scope > .win-bar');
  if (!bar) return;
  const btns = bar.querySelector('.win-btns');
  const title = bar.querySelector('.win-title').textContent;
  const isModal = win.classList.contains('modal-box');
  const isCard = win.classList.contains('project-card');
  const modalClose = btns.querySelector('.modal-close');

  btns.innerHTML = '';
  const min = mkBtn('–', '최소화', 'wb wb-min');
  const max = mkBtn('□', '최대화', 'wb wb-max');
  btns.append(min, max);
  if (modalClose) {
    btns.appendChild(modalClose);
  } else {
    const close = mkBtn('×', '닫기', 'wb wb-close');
    close.addEventListener('click', (e) => { e.stopPropagation(); closeWin(win, title); });
    btns.appendChild(close);
  }

  min.setAttribute('aria-pressed', win.classList.contains('is-min'));

  min.addEventListener('click', (e) => {
    e.stopPropagation();
    min.setAttribute('aria-pressed', win.classList.toggle('is-min'));
  });

  max.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isModal) {
      max.setAttribute('aria-pressed', win.classList.toggle('is-wide'));
    } else if (isCard) {
      openModal(win.dataset.modalId);
    } else {
      toggleMax(win);
    }
  });

  bar.addEventListener('dblclick', () => min.click());
  if (isCard) bar.addEventListener('click', (e) => e.stopPropagation());
}

document.querySelectorAll('.win, .project-card, .skill-block, .contact-simple, .modal-box')
  .forEach(setupWindow);

/* windows with data-href act as a link to another site (opens in a new tab once an address is set) */
document.querySelectorAll('.win[data-href]').forEach(win => {
  const url = () => win.dataset.href;
  const go = () => { if (url()) window.open(url(), '_blank', 'noopener'); };
  const body = win.querySelector('.win-body');
  if (url() && body) { body.tabIndex = 0; body.setAttribute('role', 'link'); }
  win.addEventListener('click', (e) => { if (!e.target.closest('.win-bar')) go(); });
  if (body) body.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') unmax();
});

/* digital clock: seven-segment LCD digits (time only) */
const navClock = document.getElementById('navClock');
const SEGMENTS = {            // which of the segments a-g are lit for each digit
  '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
  '5': 'afgcd', '6': 'afgecd', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'
};
const T = 2, DW = 10, DH = 18;                   // segment thickness, digit width and height (viewBox units)

function hSeg(cy) {                              // horizontal segment with pointed ends
  const x1 = 1.5, x2 = DW - 1.5, h = T / 2;
  return `${x1},${cy} ${x1 + h},${cy - h} ${x2 - h},${cy - h} ${x2},${cy} ${x2 - h},${cy + h} ${x1 + h},${cy + h}`;
}
function vSeg(cx, y1, y2) {                      // vertical segment with pointed ends
  const h = T / 2;
  return `${cx},${y1} ${cx + h},${y1 + h} ${cx + h},${y2 - h} ${cx},${y2} ${cx - h},${y2 - h} ${cx - h},${y1 + h}`;
}
const SEG_SHAPES = {
  a: hSeg(1), g: hSeg(DH / 2), d: hSeg(DH - 1),
  f: vSeg(1, 1.5, DH / 2 - 0.5), b: vSeg(DW - 1, 1.5, DH / 2 - 0.5),
  e: vSeg(1, DH / 2 + 0.5, DH - 1.5), c: vSeg(DW - 1, DH / 2 + 0.5, DH - 1.5)
};

function lcdSvg(text) {
  let x = 0, shapes = '';
  const gap = 2.4;
  for (const ch of text) {
    if (SEGMENTS[ch]) {
      for (const [seg, pts] of Object.entries(SEG_SHAPES)) {
        const on = SEGMENTS[ch].includes(seg);
        shapes += `<polygon class="${on ? 'lcd-on' : 'lcd-off'}" points="${pts}" transform="translate(${x} 0)"/>`;
      }
      x += DW + gap;
    } else if (ch === ':') {                     // two square dots, blinking
      for (const cy of [5, 13]) {
        shapes += `<rect class="lcd-on lcd-colon" x="${x}" y="${cy - 1}" width="2" height="2"/>`;
      }
      x += 2 + gap;
    } else if (ch === '.') {                     // date separator: one square dot on the baseline
      shapes += `<rect class="lcd-on" x="${x}" y="${DH - 2}" width="2" height="2"/>`;
      x += 2 + gap;
    } else {                                     // space between date and time
      x += 5;
    }
  }
  const w = x - gap, scale = 1.35;
  return `<svg class="lcd" viewBox="0 0 ${w} ${DH}" width="${Math.round(w * scale)}" height="${Math.round(DH * scale)}" ` +
         `aria-hidden="true">${shapes}</svg>`;
}

function tickClock() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  navClock.innerHTML = lcdSvg(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
}
tickClock();
setInterval(tickClock, 15000);

document.getElementById('toTop').addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 6. Project Modal ── */
let lastFocused = null;

function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  lastFocused = document.activeElement;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Focus the close button for accessibility
  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

// Open via card "자세히 보기" button
document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(btn.dataset.open);
  });
});

// Also open by clicking the entire card
document.querySelectorAll('.project-card[data-modal-id]').forEach(card => {
  card.addEventListener('click', (e) => {
    if (!e.target.closest('[data-open]')) {
      openModal(card.dataset.modalId);
    }
  });
  card.style.cursor = 'pointer';
});

// Close via ✕ button
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

// Close by clicking the overlay background
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
  }
});

/* ── 8. Game tab: most advanced project first ──
   Order comes from the status badge on each card, so a new game only needs the right badge:
   released-badge (출시) > ongoing (개발 중) > game-badge (기획) > upcoming-badge (예정).
   Cards with the same stage keep the order they have in the HTML. */
const STAGE_RANK = [['released-badge', 4], ['ongoing', 3], ['game-badge', 2], ['upcoming-badge', 1]];

function stageOf(card) {
  const badge = card.querySelector('.project-status');
  if (!badge) return 0;
  for (const [cls, rank] of STAGE_RANK) if (badge.classList.contains(cls)) return rank;
  return 0;
}

const gameGrid = document.querySelector('#view-game .projects-grid');
if (gameGrid) {
  [...gameGrid.querySelectorAll('.project-card')]
    .map((card, i) => ({ card, i, rank: stageOf(card) }))
    .sort((a, b) => b.rank - a.rank || a.i - b.i)
    .forEach(({ card }) => gameGrid.appendChild(card));
}


/* ── 9. School tab: grouped by year (newest first), in-progress items first inside each year ──
   The year comes from each card's year label; cards with the same status keep their HTML order.
   Cards whose label has no year (e.g. high school) go in a last group. */
function yearOf(card) {
  const m = (card.querySelector('.project-year') || {}).textContent.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}

const schoolGrid = document.querySelector('#view-school .projects-grid');
if (schoolGrid) {
  const items = [...schoolGrid.querySelectorAll('.project-card')]
    .map((card, i) => ({ card, i, ongoing: card.querySelector('.project-status.ongoing') ? 1 : 0, year: yearOf(card) }))
    .sort((a, b) => b.year - a.year || b.ongoing - a.ongoing || a.i - b.i);
  let current = null;
  items.forEach(({ card, year }) => {
    if (year !== current) {
      current = year;
      const h = document.createElement('h3');
      h.className = 'year-heading';
      h.textContent = year ? String(year) : 'High school';
      schoolGrid.appendChild(h);
    }
    schoolGrid.appendChild(card);
  });
}


/* ── 10. Sound player (CD): small synthesized click sounds, off by default ──
   Nothing is played until the visitor presses the button; volume is remembered. */
(function () {
  const disc = document.getElementById('cdDisc');
  if (!disc) return;

  let musicOn = false, sfxOn = true, vol = 0.5, ctx = null;   // effects always on; music starts when the CD is clicked

  function blip(f1, f2, dur) {
    if (!sfxOn || vol <= 0) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * 0.25), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  /* "tang": a short gunshot-like crack (filtered noise burst) with a low thump */
  let noiseBuf = null;
  function pew() {
    if (!sfxOn || vol <= 0) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime, peak = Math.max(0.0002, vol * 0.5);
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / d.length, 2);
    }
    const n = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), ng = ctx.createGain();
    n.buffer = noiseBuf;
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(7000, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 0.18);
    ng.gain.setValueAtTime(peak, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    n.connect(lp).connect(ng).connect(ctx.destination);
    n.start(t);
    const o = ctx.createOscillator(), og = ctx.createGain();       // body of the shot
    o.type = 'sine';
    o.frequency.setValueAtTime(230, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.12);
    og.gain.setValueAtTime(peak * 0.9, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(og).connect(ctx.destination);
    o.start(t); o.stop(t + 0.17);
  }

  /* glass-break for the easter egg: a burst of bright noise plus falling tinkles */
  function glass() {
    if (!sfxOn || vol <= 0) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime, peak = Math.max(0.0002, vol * 0.5);
    const len = Math.floor(ctx.sampleRate * 0.9), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, 3);
    const n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = buf; hp.type = 'highpass'; hp.frequency.value = 2500;
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    n.connect(hp).connect(g).connect(ctx.destination); n.start(t);
    for (let i = 0; i < 9; i++) {
      const o = ctx.createOscillator(), og = ctx.createGain(), st = t + 0.05 + i * 0.07 + Math.random() * 0.05;
      o.type = 'sine'; o.frequency.value = 2200 + Math.random() * 3800;
      og.gain.setValueAtTime(0.0001, st); og.gain.exponentialRampToValueAtTime(peak * 0.25, st + 0.005);
      og.gain.exponentialRampToValueAtTime(0.0001, st + 0.12);
      o.connect(og).connect(ctx.destination); o.start(st); o.stop(st + 0.14);
    }
  }
  document.addEventListener('bm-shatter', glass);

  /* "jeo-jeo-jeok": a quick run of tiny ticks while the glass cracks */
  function crackling() {
    if (!sfxOn || vol <= 0) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime, peak = Math.max(0.0002, vol * 0.3);
    for (let i = 0; i < 16; i++) {
      const st = t + i * 0.06 + Math.random() * 0.03;
      const len = Math.floor(ctx.sampleRate * 0.03), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, 2);
      const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 2500 + Math.random() * 3500; bp.Q.value = 1.2;
      g.gain.value = peak * (0.4 + i / 16);
      n.connect(bp).connect(g).connect(ctx.destination); n.start(st);
    }
  }
  document.addEventListener('bm-cracking', crackling);

  function render() {
    disc.setAttribute('aria-pressed', musicOn);
    disc.setAttribute('aria-label', musicOn ? '음악 멈추기' : '음악 재생');
    disc.classList.toggle('is-spinning', musicOn);
  }

  /* background music: official YouTube player (hidden), controlled by the CD.
     After the screen shatters (dark theme) the player switches to a second track;
     going back to the light theme returns to the first one, paused. */
  const TRACKS = {
    light: { id: 'rePFEUu7YZs', title: 'テロル - Neru' },
    dark: { id: 'w2HuQ95Huxw', title: '魔法少女ノ魔女裁判' }
  };
  const trackEl = document.querySelector('.cd-track');
  let current = TRACKS.light;
  let yt = null, ytReady = false, ytWanted = false, ytLoading = false;
  function ytApply() {
    if (!ytReady) return;
    yt.setVolume(100);
    if (ytWanted) yt.playVideo(); else yt.pauseVideo();
  }
  function ytLoad() {
    if (ytLoading) return;
    ytLoading = true;
    window.onYouTubeIframeAPIReady = () => {
      yt = new YT.Player('ytHost', {
        videoId: current.id,
        playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: () => {
            ytReady = true;
            if (ytWanted) yt.loadVideoById(current.id); else yt.cueVideoById(current.id);
            ytApply();
          },
          onStateChange: (e) => { if (e.data === 0 && ytWanted) yt.playVideo(); }   // loop
        }
      });
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  function setTrack(track, play) {
    current = track;
    if (trackEl) trackEl.textContent = track.title;
    musicOn = play; ytWanted = play; render();
    if (play) ytLoad();
    if (ytReady) {
      if (play) yt.loadVideoById(track.id); else { yt.cueVideoById(track.id); yt.pauseVideo(); }
      yt.setVolume(100);
    }
  }
  document.addEventListener('bm-theme', (e) => {
    if (e.detail && e.detail.dark) setTrack(TRACKS.dark, true);
    else setTrack(TRACKS.light, false);
  });

  function toggleMusic() {
    musicOn = !musicOn; render();
    ytWanted = musicOn;
    if (musicOn) ytLoad();
    ytApply();
  }
  disc.addEventListener('click', toggleMusic);
  disc.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMusic(); }
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('#cdDisc')) return;
    pew();
  });
})();


/* ── 11. Crosshair shots: bullet-hole cracks, worse when you keep hitting the same spot,
   and an easter egg: too many shots shatters the whole page into a dark theme.
   Click once more (or reload) to restore. ── */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const layer = document.createElementNS(NS, 'svg');
  layer.setAttribute('class', 'crack-layer');
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const f = (n) => n.toFixed(1);
  const mk = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* one tapered crack ray: thick at the hole, thin at the tip, with a slight bend */
  function ray(x, y, ang, len, w0) {
    const m = 3, left = [], right = [];
    let cx = x, cy = y, a = ang;
    for (let i = 0; i <= m; i++) {
      const w = w0 * (1 - i / (m + 0.4));
      const nx = -Math.sin(a), ny = Math.cos(a);
      left.push(f(cx + nx * w) + ' ' + f(cy + ny * w));
      right.push(f(cx - nx * w) + ' ' + f(cy - ny * w));
      a += rnd(-0.28, 0.28);
      cx += Math.cos(a) * len / m; cy += Math.sin(a) * len / m;
    }
    return 'M' + left.join('L') + 'L' + f(cx) + ' ' + f(cy) + 'L' + right.reverse().join('L') + 'Z';
  }

  function holeShape(x, y, r) {
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283, rr = r * rnd(0.55, 1.25);
      pts.push(f(x + Math.cos(a) * rr) + ' ' + f(y + Math.sin(a) * rr));
    }
    return 'M' + pts.join('L') + 'Z';
  }

  /* a long thin crack with small bends */
  function crackLine(x, y, ang, len) {
    let cx = x, cy = y, a = ang, d = 'M' + f(cx) + ' ' + f(cy), done = 0;
    while (done < len) {
      const step = rnd(len * 0.18, len * 0.34);
      a += rnd(-0.14, 0.14);
      cx += Math.cos(a) * step; cy += Math.sin(a) * step; done += step;
      d += 'L' + f(cx) + ' ' + f(cy);
    }
    return d;
  }

  /* an irregular ring of straight segments, like the web of cracks around a bullet hole */
  function webRing(x, y, r, gapChance) {
    const n = 11 + Math.floor(rnd(0, 4)), pts = [];
    const off = rnd(0, 6.28);
    for (let i = 0; i <= n; i++) {
      const a = off + (i / n) * 6.283, rr = r * rnd(0.86, 1.14);
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    let d = '';
    for (let i = 0; i < n; i++) {
      if (Math.random() < gapChance) continue;
      d += 'M' + f(pts[i][0]) + ' ' + f(pts[i][1]) + 'L' + f(pts[i + 1][0]) + ' ' + f(pts[i + 1][1]);
    }
    return d;
  }

  /* a bullet hole in the style of shattered glass: dark chip, bright slivers around it,
     a few long thin cracks and a broken web ring. `stage` makes it worse. */
  function bulletHole(parent, x, y, stage) {
    const s = 0.55 + stage * 0.3;
    const g = mk('g', { class: 'hole' });
    const line = (d, cls) => g.appendChild(mk('path', { d, class: cls }));
    const nl = Math.min(10, 4 + Math.floor(stage * 1.5)), off = rnd(0, 6.28);
    for (let i = 0; i < nl; i++) {
      const d = crackLine(x, y, off + (i / nl) * 6.283 + rnd(-0.2, 0.2), rnd(34, 78) * s * (i % 3 === 0 ? 1.35 : 1));
      line(d, 'g-long-hi');
      line(d, 'g-long');
    }
    line(webRing(x, y, rnd(24, 30) * s, 0.12), 'g-ring-hi');
    line(webRing(x, y, rnd(24, 30) * s, 0.12), 'g-ring');
    if (stage >= 1) { const d = webRing(x, y, rnd(44, 56) * s, 0.3); line(d, 'g-ring-hi'); line(d, 'g-ring'); }
    if (stage >= 3) { const d = webRing(x, y, rnd(68, 82) * s, 0.45); line(d, 'g-ring-hi'); line(d, 'g-ring'); }
    const ns = 8 + stage * 3;
    for (let i = 0; i < ns; i++) {
      const len = rnd(6, 20) * s * (Math.random() < 0.25 ? 1.7 : 1);
      line(ray(x, y, off + (i / ns) * 6.283 + rnd(-0.12, 0.12), len, rnd(0.7, 1.5)), 'g-spike');
    }
    line(holeShape(x, y, 4.6 * (1 + stage * 0.2)), 'g-hole');
    parent.appendChild(g);
    return g;
  }

  /* ── shots ── */
  const shots = [];
  let busy = false;

  function shoot(x, y) {
    const now = performance.now();
    shots.push({ t: now, x, y });
    while (shots.length && now - shots[0].t > 6000) shots.shift();
    const near = shots.filter((s) => now - s.t < 3500 && Math.hypot(s.x - x, s.y - y) < 70).length;
    const stage = Math.min(4, near - 1);
    const dur = 1.25 + stage * 0.4;
    const g = mk('g', { class: 'crack', style: 'transform-origin:' + f(x) + 'px ' + f(y) + 'px;--d:' + dur + 's;--o:' + (0.4 + stage * 0.15).toFixed(2) });
    bulletHole(g, x, y, stage, false);
    layer.appendChild(g);
    setTimeout(() => g.remove(), dur * 1000 + 200);
    // only hammering the same spot breaks the whole screen
    const same = shots.filter((s) => Math.hypot(s.x - x, s.y - y) < 70).length;
    if (same >= 10) shatter(x, y);
  }

  /* ── easter egg: glass cracks across the whole screen, shatters, and the theme flips ──
     Light -> dark. Break it again (many shots) and it flips back; reloading also resets it. */
  function longCrack(x, y, ang, len, w) {
    let cx = x, cy = y, a = ang, d = 'M' + f(cx) + ' ' + f(cy), done = 0;
    const kids = [];
    while (done < len) {
      const step = rnd(26, 60);
      a += rnd(-0.22, 0.22);
      cx += Math.cos(a) * step; cy += Math.sin(a) * step; done += step;
      d += 'L' + f(cx) + ' ' + f(cy);
      if (Math.random() < 0.22 && len - done > 80) kids.push([cx, cy, a + (Math.random() < 0.5 ? 1 : -1) * rnd(0.5, 0.9), (len - done) * rnd(0.3, 0.55)]);
    }
    return { d, w, kids };
  }

  function shatter(x, y) {
    if (busy) return;
    busy = true;
    shots.length = 0;
    document.dispatchEvent(new CustomEvent('bm-cracking'));
    const big = mk('svg', { class: 'crack-big', 'aria-hidden': 'true' });
    document.body.appendChild(big);
    const reach = Math.min(220, Math.min(innerWidth, innerHeight) * 0.3);   // only a patch of the screen cracks
    const list = [];
    const n = 11, off = rnd(0, 6.28);
    for (let i = 0; i < n; i++) {
      const c = longCrack(x, y, off + (i / n) * 6.283 + rnd(-0.15, 0.15), reach * rnd(0.6, 1.05), 1);
      list.push(c);
      c.kids.forEach(([kx, ky, ka, kl]) => list.push(longCrack(kx, ky, ka, kl, 0.6)));
    }
    list.forEach((c, i) => {
      ['crack-big-halo', 'crack-big-line'].forEach((cls) => {
        const p = mk('path', { d: c.d, class: cls, pathLength: '1' });
        p.style.strokeWidth = (cls === 'crack-big-halo' ? 3.2 : 1.4) * c.w + 'px';
        p.style.animationDelay = (i % n) * 18 + 'ms';
        big.appendChild(p);
      });
    });
    [40, 90, 150, 220].forEach((r, k) => {
      if (r > reach) return;
      const d = webRing(x, y, r, 0.25);
      ['crack-big-halo', 'crack-big-line'].forEach((cls) => {
        const p = mk('path', { d, class: cls, pathLength: '1' });
        p.style.strokeWidth = (cls === 'crack-big-halo' ? 3.2 : 1.4) + 'px';
        p.style.animationDelay = (180 + k * 150) + 'ms';
        big.appendChild(p);
      });
    });
    const ring = mk('circle', { cx: f(x), cy: f(y), r: 5, class: 'crack-big-hole' });
    big.appendChild(ring);
    setTimeout(() => {
      big.remove();
      layer.textContent = '';                       // no cracks left behind once it has shattered
      const flash = document.createElement('div');
      flash.className = 'glass-flash';
      document.body.appendChild(flash);
      const dark = document.documentElement.classList.toggle('shattered');
      document.dispatchEvent(new CustomEvent('bm-theme', { detail: { dark } }));
      document.documentElement.classList.add('shattering');
      document.dispatchEvent(new CustomEvent('bm-shatter'));
      setTimeout(() => { flash.remove(); document.documentElement.classList.remove('shattering'); busy = false; }, 420);
    }, 1050);
  }

  document.addEventListener('click', (e) => {
    if (busy) return;
    shoot(e.clientX, e.clientY);
  });
})();
