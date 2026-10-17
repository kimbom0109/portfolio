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
