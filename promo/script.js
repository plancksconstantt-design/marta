// ============================================================
//   АРХИТЕКТОР · ПОРТФОЛИО — скрипты
//   Блоки соответствуют комментариям в index.html и styles.css
// ============================================================

document.documentElement.classList.add('js');
const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* БЛОК 1: ПРЕЛОАДЕР */
const loader = $('#loader');
function finishLoad(){
  loader.classList.add('loader--done');
  document.body.classList.add('loaded');
  if(!RM) scramble($('#heroTitle'));
  setTimeout(()=>loader.remove(), 1300);
}
if(RM){ finishLoad(); }
else{
  let n = 0;
  const count = $('#loaderCount'), bar = $('#loaderBar');
  const t = setInterval(()=>{
    n = Math.min(100, n + Math.ceil(Math.random()*14));
    count.textContent = String(n).padStart(3,'0');
    bar.style.width = n + '%';
    if(n >= 100){ clearInterval(t); setTimeout(finishLoad, 260); }
  }, 90);
}

/* БЛОК 2: ДЕШИФРОВКА ЗАГОЛОВКОВ */
const CHARS = 'АБВГДЕЗИКЛМНОПРСТУФХЦЧШЫЭЮЯ0123456789#/\\—';
function scramble(el){
  if(!el || el.dataset.done) return;
  el.dataset.done = 1;
  if(RM){ return; }
  const text = el.textContent, dur = 950, start = performance.now();
  (function tick(now){
    const p = Math.min(1,(now-start)/dur);
    const shown = Math.floor(p*text.length);
    let out = '';
    for(let i=0;i<text.length;i++){
      const ch = text[i];
      out += (ch===' ') ? ' ' : (i<shown ? ch : CHARS[(Math.random()*CHARS.length)|0]);
    }
    el.textContent = out;
    if(p<1) requestAnimationFrame(tick); else el.textContent = text;
  })(start);
}

/* БЛОК 3: ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ */
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.classList.add('in');
    if(e.target.hasAttribute('data-scramble')) scramble(e.target);
    $$('.bar-fill', e.target).forEach(b=> b.style.width = b.dataset.level + '%');
    io.unobserve(e.target);
  });
},{threshold:.15});
$$('[data-reveal], .mask, [data-scramble], .skills-grid').forEach(el=>io.observe(el));

/* БЛОК 4: СКРОЛЛ — прогресс-бар и шапка (БЕЗ параллакса) */
const progress = $('#progress'), header = $('#header');
let ticking = false;
function onScroll(){ if(!ticking){ requestAnimationFrame(update); ticking = true; } }
function update(){
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max>0 ? (scrollY/max)*100 : 0) + '%';
  header.classList.toggle('scrolled', scrollY > 40);
}
addEventListener('scroll', onScroll, {passive:true});
update();

/* БЛОК 5: НАВИГАЦИЯ — активный пункт */
const spy = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    $$('.nav a').forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#'+e.target.id));
  });
},{rootMargin:'-40% 0px -55% 0px'});
['about','experience','projects','contacts'].forEach(id=>{ const s=$('#'+id); if(s) spy.observe(s); });

/* БЛОК 6: МЕНЮ (БУРГЕР) */
const burger = $('#burger');
function setMenu(open){
  document.body.classList.toggle('menu-open', open);
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
}
burger.addEventListener('click', ()=>setMenu(!document.body.classList.contains('menu-open')));
$$('#menu a').forEach(a=>a.addEventListener('click', ()=>setMenu(false)));
addEventListener('keydown', e=>{ if(e.key==='Escape' && !$('#lightbox').classList.contains('active')) setMenu(false); });

/* БЛОК 7: ВРЕМЯ В МИНСКЕ */
const fmt = new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Minsk',hour:'2-digit',minute:'2-digit',second:'2-digit'});
function tickClock(){ const t = fmt.format(new Date()); $$('.js-clock').forEach(el=>el.textContent=t); }
tickClock(); setInterval(tickClock, 1000);

/* БЛОК 8: КАСТОМНЫЙ КУРСОР */
if(matchMedia('(pointer:fine)').matches && !RM){
  document.documentElement.classList.add('has-cursor');
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  let mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;
  addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY;
    dot.style.left = mx+'px'; dot.style.top = my+'px'; });
  (function loop(){
    rx += (mx-rx)*.16; ry += (my-ry)*.16;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(loop);
  })();
  addEventListener('mouseover', e=>{
    ring.classList.toggle('big', !!e.target.closest('a,button,.toc a,.skill'));
  });
}

/* БЛОК 9: КОПИРОВАНИЕ НОМЕРА */
$('#copyPhone').addEventListener('click', async function(){
  const btn = this, num = '+375298140142';
  try{ await navigator.clipboard.writeText(num); }
  catch(e){
    const ta = document.createElement('textarea');
    ta.value = num; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
  }
  const old = btn.textContent;
  btn.textContent = 'Скопировано ✓';
  setTimeout(()=>btn.textContent = old, 1800);
});

/* БЛОК 10: ЗАПАСНЫЕ ИЗОБРАЖЕНИЯ */
$$('img[data-seed]').forEach(img=>{
  img.addEventListener('error', ()=>{
    if(img.dataset.fb) return;
    img.dataset.fb = 1;
    img.src = `https://picsum.photos/seed/${img.dataset.seed}/${img.dataset.w||1200}/${img.dataset.h||800}`;
  }, {once:true});
});

/* БЛОК 11: ГОД В ФУТЕРЕ */
$('#year').textContent = new Date().getFullYear();

/* ============================================================
   БЛОК 12: LIGHTBOX — просмотр изображений целиком
   ============================================================ */
(function(){
  const lightbox    = $('#lightbox');
  const lbImg       = $('#lightboxImg');
  const lbCaption   = $('#lightboxCaption');
  const lbCounter   = $('#lightboxCounter');
  const btnClose    = $('.lightbox__close');
  const btnPrev     = $('.lightbox__prev');
  const btnNext     = $('.lightbox__next');

  // Галереи: каждое изображение группируется по data-gallery
  // Если data-gallery нет — картинка открывается одна
  const galleries = new Map();

  function collectGalleries(){
    galleries.clear();
    $$('.lightbox-trigger').forEach((img, idx) => {
      const key = img.closest('[data-gallery]')?.getAttribute('data-gallery') || ('_single_' + idx);
      if(!galleries.has(key)) galleries.set(key, []);
      galleries.get(key).push({
        el: img,
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        caption: img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || ''
      });
    });
  }

  let currentKey = null;
  let currentIndex = 0;

  function showImage(){
    const list = galleries.get(currentKey);
    if(!list || list.length === 0) return;
    const item = list[currentIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = item.caption;
    lbCounter.textContent = list.length > 1
      ? `${currentIndex + 1} / ${list.length}`
      : '';
    // скрываем стрелки, если картинка одна
    btnPrev.style.display = list.length > 1 ? '' : 'none';
    btnNext.style.display = list.length > 1 ? '' : 'none';
  }

  function open(imgEl){
    collectGalleries();
    currentKey = imgEl.closest('[data-gallery]')?.getAttribute('data-gallery');
    if(!currentKey){
      // картинка без галереи — создаём временную группу
      currentKey = '__solo__';
      galleries.set(currentKey, [{
        el: imgEl,
        src: imgEl.getAttribute('src'),
        alt: imgEl.getAttribute('alt') || '',
        caption: imgEl.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || ''
      }]);
    }
    const list = galleries.get(currentKey);
    currentIndex = list.findIndex(item => item.el === imgEl);
    if(currentIndex < 0) currentIndex = 0;
    showImage();
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
  }

  function close(){
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    // очищаем src, чтобы браузер не держал тяжёлую картинку в памяти
    setTimeout(()=>{ if(!lightbox.classList.contains('active')) lbImg.removeAttribute('src'); }, 300);
  }

  function prev(){
    const list = galleries.get(currentKey);
    if(!list) return;
    currentIndex = (currentIndex - 1 + list.length) % list.length;
    showImage();
  }
  function next(){
    const list = galleries.get(currentKey);
    if(!list) return;
    currentIndex = (currentIndex + 1) % list.length;
    showImage();
  }

  // клик по картинке или по иконке лупы
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.lightbox-trigger');
    const zoomIcon = e.target.closest('.zoom-icon');
    if(trigger){
      e.preventDefault();
      open(trigger);
    } else if(zoomIcon){
      e.preventDefault();
      const parentTrigger = zoomIcon.parentElement.querySelector('.lightbox-trigger');
      if(parentTrigger) open(parentTrigger);
    }
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  // клик вне картинки — закрыть
  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox || e.target.classList.contains('lightbox__stage')){
      close();
    }
  });

  // клавиатура
  addEventListener('keydown', (e) => {
    if(!lightbox.classList.contains('active')) return;
    if(e.key === 'Escape'){ close(); e.preventDefault(); }
    if(e.key === 'ArrowLeft'){ prev(); e.preventDefault(); }
    if(e.key === 'ArrowRight'){ next(); e.preventDefault(); }
  });

  // свайпы на мобильных
  let touchStartX = 0, touchStartY = 0, touchEndX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, {passive:true});
  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - e.changedTouches[0].screenY);
    if(Math.abs(diffX) > 50 && diffY < 80){
      if(diffX > 0) next(); else prev();
    }
  }, {passive:true});

  // начальная инициализация
  collectGalleries();
})();