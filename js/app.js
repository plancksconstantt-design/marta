// ============================================================
//   АРХИТЕКТОР · ОБЩИЙ СКРИПТ
// ============================================================

const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

/* ===== ПРОГРЕСС-БАР И ШАПКА ===== */
const progress = $('#progress');
const header = $('#header');
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}

function update() {
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  if (header) header.classList.toggle('scrolled', scrollY > 40);
}

addEventListener('scroll', onScroll, { passive: true });
update();

/* ===== МЕНЮ-БУРГЕР ===== */
const burger = $('#burger');
if (burger) {
  burger.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
    burger.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', 
      document.body.classList.contains('menu-open'));
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}
addEventListener('keydown', e => {
  if (e.key === 'Escape' && !document.querySelector('.lightbox.active')) {
    document.body.classList.remove('menu-open');
  }
});

/* ===== ПРЕЛОАДЕР (показывается один раз за сессию) ===== */
const loader = $('#loader');
if (loader) {
  const hasSeen = sessionStorage.getItem('portfolio_seen');
  if (hasSeen) {
    loader.remove();
  } else {
    sessionStorage.setItem('portfolio_seen', '1');
    let n = 0;
    const count = $('#loaderCount');
    const bar = $('#loaderBar');
    const t = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 14));
      if (count) count.textContent = String(n).padStart(3, '0');
      if (bar) bar.style.width = n + '%';
      if (n >= 100) {
        clearInterval(t);
        setTimeout(() => {
          loader.classList.add('loader--done');
          setTimeout(() => loader.remove(), 1000);
        }, 300);
      }
    }, 90);
  }
}

/* ===== LIGHTBOX ===== */
const lightbox = $('#lightbox');
if (lightbox) {
  const lbImg = $('#lightboxImg');
  const lbCaption = $('#lightboxCaption');
  const lbCounter = $('#lightboxCounter');
  const btnClose = $('.lightbox__close');
  const btnPrev = $('.lightbox__prev');
  const btnNext = $('.lightbox__next');

  let items = [];
  let currentIdx = 0;

  // Собираем все картинки с классом lightbox-trigger
  function collect() {
    items = [];
    $$('img.lightbox-trigger').forEach(img => {
      items.push({
        src: img.src,
        alt: img.alt,
        caption: img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || ''
      });
    });
  }

  function show() {
    const it = items[currentIdx];
    if (!it) return;
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    if (lbCaption) lbCaption.textContent = it.caption;
    if (lbCounter) lbCounter.textContent = items.length > 1 
      ? `${currentIdx + 1} / ${items.length}` 
      : '';
    if (btnPrev) btnPrev.style.display = items.length > 1 ? '' : 'none';
    if (btnNext) btnNext.style.display = items.length > 1 ? '' : 'none';
  }

  function open(idx) {
    collect();
    if (items.length === 0) return;
    currentIdx = idx;
    show();
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
  }

  function prev() {
    currentIdx = (currentIdx - 1 + items.length) % items.length;
    show();
  }

  function next() {
    currentIdx = (currentIdx + 1) % items.length;
    show();
  }

  // Клик по картинке или по иконке лупы
  document.addEventListener('click', e => {
    const img = e.target.closest('img.lightbox-trigger');
    const icon = e.target.closest('.zoom-icon');
    
    if (img) {
      e.preventDefault();
      const idx = $$('img.lightbox-trigger').indexOf(img);
      if (idx !== -1) open(idx);
    } else if (icon) {
      e.preventDefault();
      const parentImg = icon.closest('figure')?.querySelector('img.lightbox-trigger') 
                      || icon.parentElement.querySelector('img.lightbox-trigger');
      if (parentImg) {
        const idx = $$('img.lightbox-trigger').indexOf(parentImg);
        if (idx !== -1) open(idx);
      }
    }
  });

  if (btnClose) btnClose.addEventListener('click', close);
  if (btnPrev) btnPrev.addEventListener('click', prev);
  if (btnNext) btnNext.addEventListener('click', next);
  
  // Клик вне картинки — закрыть
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) {
      close();
    }
  });

  // Клавиатура
  addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Свайпы на мобильных
  let tx = 0, ty = 0;
  lightbox.addEventListener('touchstart', e => {
    tx = e.changedTouches[0].screenX;
    ty = e.changedTouches[0].screenY;
  }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].screenX;
    const dy = Math.abs(ty - e.changedTouches[0].screenY);
    if (Math.abs(dx) > 50 && dy < 80) {
      dx > 0 ? next() : prev();
    }
  }, { passive: true });
}

/* ===== КОПИРОВАНИЕ НОМЕРА ===== */
const copyBtn = $('#copyPhone');
if (copyBtn) {
  copyBtn.addEventListener('click', async function () {
    const num = '+375298140142';
    try {
      await navigator.clipboard.writeText(num);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = num;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const old = this.textContent;
    this.textContent = 'Скопировано ✓';
    setTimeout(() => this.textContent = old, 1800);
  });
}

/* ===== ЧАСЫ (Минск) ===== */
const clockEls = $$('.js-clock');
if (clockEls.length) {
  const fmt = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Minsk',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const tick = () => clockEls.forEach(el => el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 1000);
}

/* ===== АКТИВНЫЙ ПУНКТ МЕНЮ ===== */
const currentPath = location.pathname.split('/').pop() || 'index.html';
$$('.nav a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPath) a.classList.add('active');
});

/* ===== АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ ===== */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      // анимация прогресс-баров навыков
      $$('.bar-fill', e.target).forEach(b => {
        b.style.width = b.dataset.level + '%';
      });
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  $$('[data-reveal]').forEach(el => revealIO.observe(el));
}