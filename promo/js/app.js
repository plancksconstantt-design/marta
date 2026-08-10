// ============================================================
//   АРХИТЕКТОР · ОБЩИЙ СКРИПТ
// ============================================================

const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];

/* ===== ПРОГРЕСС-БАР И ШАПКА ===== */
const progress = $('#progress'), header = $('#header');
let ticking = false;
function onScroll(){ if(!ticking){ requestAnimationFrame(update); ticking = true; } }
function update(){
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  if(progress) progress.style.width = (max>0 ? (scrollY/max)*100 : 0) + '%';
  if(header) header.classList.toggle('scrolled', scrollY > 40);
}
addEventListener('scroll', onScroll, {passive:true});
update();

/* ===== МЕНЮ-БУРГЕР ===== */
const burger = $('#burger');
if(burger){
  burger.addEventListener('click', ()=>{
    document.body.classList.toggle('menu-open');
    burger.classList.toggle('is-open');
  });
  $$('#menu a').forEach(a=>a.addEventListener('click', ()=>{
    document.body.classList.remove('menu-open');
    burger.classList.remove('is-open');
  }));
}
addEventListener('keydown', e=>{ if(e.key==='Escape') document.body.classList.remove('menu-open'); });

/* ===== ПРЕЛОАДЕР (только при первом заходе) ===== */
const loader = $('#loader');
if(loader){
  const hasSeen = sessionStorage.getItem('portfolio_seen');
  if(hasSeen){ loader.remove(); }
  else{
    sessionStorage.setItem('portfolio_seen','1');
    let n = 0;
    const count = $('#loaderCount');
    const t = setInterval(()=>{
      n = Math.min(100, n + Math.ceil(Math.random()*14));
      if(count) count.textContent = String(n).padStart(3,'0');
      if(n >= 100){
        clearInterval(t);
        setTimeout(()=>{
          loader.classList.add('loader--done');
          setTimeout(()=>loader.remove(), 1000);
        }, 300);
      }
    }, 90);
  }
}

/* ===== LIGHTBOX ===== */
const lightbox = $('#lightbox');
if(lightbox){
  const lbImg = $('#lightboxImg');
  const lbCaption = $('#lightboxCaption');
  const lbCounter = $('#lightboxCounter');
  const btnClose = $('.lightbox__close');
  const btnPrev = $('.lightbox__prev');
  const btnNext = $('.lightbox__next');

  let items = [], currentIdx = 0;

  function collect(){
    items = [];
    $$('img.lightbox-trigger').forEach(img=>{
      items.push({
        src: img.src,
        alt: img.alt,
        caption: img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || ''
      });
    });
  }

  function show(){
    const it = items[currentIdx];
    if(!it) return;
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCaption.textContent = it.caption;
    lbCounter.textContent = items.length > 1 ? `${currentIdx+1} / ${items.length}` : '';
    btnPrev.style.display = items.length > 1 ? '' : 'none';
    btnNext.style.display = items.length > 1 ? '' : 'none';
  }

  function open(idx){ collect(); currentIdx = idx; show();
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
  }
  function close(){ lightbox.classList.remove('active'); document.body.classList.remove('lightbox-open'); }
  function prev(){ currentIdx = (currentIdx - 1 + items.length) % items.length; show(); }
  function next(){ currentIdx = (currentIdx + 1) % items.length; show(); }

  document.addEventListener('click', e=>{
    const img = e.target.closest('img.lightbox-trigger');
    const icon = e.target.closest('.zoom-icon');
    if(img){ e.preventDefault(); open($$('img.lightbox-trigger').indexOf(img)); }
    else if(icon){
      const parent = icon.parentElement.querySelector('img.lightbox-trigger');
      if(parent){ e.preventDefault(); open($$('img.lightbox-trigger').indexOf(parent)); }
    }
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  lightbox.addEventListener('click', e=>{ if(e.target===lightbox || e.target.classList.contains('lightbox__stage')) close(); });

  addEventListener('keydown', e=>{
    if(!lightbox.classList.contains('active')) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowLeft') prev();
    if(e.key==='ArrowRight') next();
  });

  let tx=0,ty=0;
  lightbox.addEventListener('touchstart', e=>{tx=e.changedTouches[0].screenX;ty=e.changedTouches[0].screenY;},{passive:true});
  lightbox.addEventListener('touchend', e=>{
    const dx = tx - e.changedTouches[0].screenX;
    const dy = Math.abs(ty - e.changedTouches[0].screenY);
    if(Math.abs(dx)>50 && dy<80){ dx>0 ? next() : prev(); }
  },{passive:true});
}

/* ===== ЧАСЫ (если есть) ===== */
const clockEls = $$('.js-clock');
if(clockEls.length){
  const fmt = new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Minsk',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const tick = ()=> clockEls.forEach(el=>el.textContent = fmt.format(new Date()));
  tick(); setInterval(tick, 1000);
}

/* ===== АВТОМАТИЧЕСКАЯ ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ ===== */
const currentPath = location.pathname.split('/').pop() || 'index.html';
$$('.nav a').forEach(a=>{
  const href = a.getAttribute('href');
  if(href === currentPath) a.classList.add('active');
});