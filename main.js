
// Render "ESPi" in dynamic text with the blue lowercase i
window.espify=function(root){ if(!root) return; const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>/\bESPi?\b(?! Innovations)(?!-\d)/.test(n.nodeValue)&&!(n.parentNode.closest&&n.parentNode.closest('.espi,script,style'))?1:2}); const ns=[]; while(w.nextNode()) ns.push(w.currentNode);
  ns.forEach(n=>{ const f=document.createDocumentFragment(); n.nodeValue.split(/(\bESPi?\b(?! Innovations)(?!-\d))/).forEach((t,k)=>{ if(k%2){const s=document.createElement('span');s.className='espi';s.innerHTML='ESP<span>i</span>';f.append(s);} else if(t) f.append(t); }); n.replaceWith(f); }); };
(() => {
  const header = document.querySelector('.site-header');
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  document.getElementById('year').textContent = new Date().getFullYear();

  // Header state on scroll
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Fullscreen menu
  const setMenu = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('open')); menu.querySelector('a').focus(); }
    else { menu.classList.remove('open'); setTimeout(() => { if (btn.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 350); }
  };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.about-head, .letter-card, .bleed blockquote, .finds-head, .find-list li, .regions-head, .region-list li, .split-copy > *, .who-grid article, .contact-grid > *, .news-head > *, .news-card, .faq-head > *, .faq-item');
  revealEls.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  // Side dots
  const dots = [...document.querySelectorAll('.dots li')];
  const secIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) dots.forEach(d => d.classList.toggle('on', d.dataset.for === en.target.id));
  }), { threshold: 0.4 });
  document.querySelectorAll('[data-section]').forEach(s => secIO.observe(s));

  // Parallax on full-bleed image
  const bleed = document.querySelector('.bleed img');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (bleed && !reduce) {
    const par = () => {
      const r = bleed.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) bleed.style.transform = `translateY(${(r.top / innerHeight) * -60}px)`;
    };
    window.addEventListener('scroll', par, { passive: true }); par();
  }

  // Cursor-follow image preview for product finds (desktop)
  const cur = document.querySelector('.cursor-img');
  const curImg = cur.querySelector('img');
  if (matchMedia('(hover: hover) and (min-width: 761px)').matches) {
    document.querySelectorAll('.find-list a').forEach(a => {
      a.addEventListener('mouseenter', () => { curImg.src = a.dataset.img; cur.classList.add('show'); });
      a.addEventListener('mouseleave', () => cur.classList.remove('show'));
      a.addEventListener('mousemove', e => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; });
    });
  }

  // Contact form (front-end validation)
  const form = document.getElementById('contact-form');
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.field').classList.toggle('err', bad);
      if (bad) ok = false;
    });
    if (!ok) { status.textContent = 'Please fill in your name, a valid email, and a message.'; return; }
    const v = id => (form.querySelector('#'+id)||{}).value || '';
    if (form.querySelector('.hp').value) return;
    const subject = 'Website inquiry from ' + v('name') + (v('company') ? ', ' + v('company') : '') + ' (' + v('type') + ')';
    const ROUTES = {
      'US distributor, wholesaler or retail buyer': 'sales', 'Business looking for an OEM product': 'sales', 'US brand': 'sales', 'Business wanting a product line review': 'sales',
      'Manufacturer or maker outside the US': 'partners', 'Existing client with an order question': 'orders',
      'Business requesting a client portal account': 'orders', 'Compliance or certification question': 'compliance',
      'Invoice or payment question': 'accounts', 'Privacy request': 'privacy', 'Job seeker': 'careers'
    };
    const to = (ROUTES[v('type')] || 'info') + '@espinnovations.com';
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; status.textContent = 'Sending your message…';
    fetch('https://formsubmit.co/ajax/' + to, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: v('name'), email: v('email'), company: v('company'), 'I am a': v('type'), message: v('msg'), _subject: subject, _template: 'table', _captcha: 'false' })
    }).then(r => r.json().then(j => ({ ok: r.ok && String(j.success) === 'true' }))).then(({ ok }) => {
      if (!ok) throw new Error('send failed');
      form.reset(); status.textContent = 'Thank you. Your message is on its way, and we’ll reply by email soon.';
    }).catch(() => {
      const body = 'Name: ' + v('name') + '\nCompany: ' + v('company') + '\nEmail: ' + v('email') + '\nI am a: ' + v('type') + '\n\n' + v('msg');
      status.innerHTML = 'We couldn’t send your message just now. Please <a href="mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '">email it to ' + to + '</a> instead.';
    }).finally(() => { btn.disabled = false; });
  });
})();

(function(){
  const dlg=document.getElementById('pmodal'); const dataEl=document.getElementById('product-data');
  if(!dlg||!dataEl) return;
  const D=JSON.parse(dataEl.textContent); let cur=null, idx=0, opener=null;
  const $=s=>dlg.querySelector(s), main=$('.pm-main'), thumbs=$('.pm-thumbs'), counter=$('.pm-counter');
  function show(i){const g=cur.gallery; idx=(i+g.length)%g.length; main.src=g[idx]; main.alt=cur.name+' photo '+(idx+1)+' of '+g.length;
    counter.textContent=(idx+1)+' / '+g.length; thumbs.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-current',j===idx?'true':'false'));
    const t=thumbs.children[idx]; if(t) t.scrollIntoView({block:'nearest',inline:'nearest'});}
  function open(id,btn){cur=D[id]; if(!cur) return; opener=btn;
    $('.pm-year').textContent=cur.year; $('.pm-tag').textContent=cur.tag; $('#pm-title').textContent=cur.name; $('.pm-more').textContent=cur.more; espify(dlg);
    const dl=$('.pm-details'); dl.innerHTML=''; cur.details.forEach(([k,v])=>{const d=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;d.append(dt,dd);dl.append(d);});
    thumbs.innerHTML=''; cur.gallery.forEach((src,j)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show photo '+(j+1));const im=document.createElement('img');im.src=src;im.alt='';b.append(im);b.onclick=()=>show(j);thumbs.append(b);});
    const multi=cur.gallery.length>1; dlg.querySelectorAll('.pm-nav,.pm-counter,.pm-thumbs').forEach(e=>e.hidden=!multi);
    show(0); dlg.showModal(); document.body.classList.add('modal-open'); dlg.scrollTop=0; $('.pm-close').focus();}
  function close(){dlg.close();}
  dlg.addEventListener('close',()=>{document.body.classList.remove('modal-open'); if(opener) opener.focus();});
  document.querySelectorAll('.work-open').forEach(b=>b.addEventListener('click',()=>open(b.dataset.product,b)));
  $('.pm-close').onclick=close; $('.pm-prev').onclick=()=>show(idx-1); $('.pm-next').onclick=()=>show(idx+1);
  $('.pm-cta').addEventListener('click',close);
  dlg.addEventListener('click',e=>{if(e.target===dlg) close();});
  dlg.addEventListener('keydown',e=>{if(!cur||cur.gallery.length<2) return; if(e.key==='ArrowLeft'){show(idx-1);} if(e.key==='ArrowRight'){show(idx+1);}});
  let x0=null; const st=$('.pm-stage');
  st.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  st.addEventListener('touchend',e=>{if(x0===null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40) show(idx+(dx<0?1:-1)); x0=null;});
})();

(function(){
  const f=document.getElementById('portal-signin'); if(!f) return;
  const st=f.querySelector('.pc-status');
  f.addEventListener('submit',e=>{
    e.preventDefault(); let ok=true;
    const em=f.querySelector('#ps-email'), pw=f.querySelector('#ps-pass');
    const badE=!/^\S+@\S+\.\S+$/.test(em.value.trim()), badP=!pw.value;
    em.closest('.pfield').classList.toggle('err',badE); pw.closest('.pfield').classList.toggle('err',badP);
    if(badE||badP){st.textContent='Please enter your business email and password.';return;}
    location.href='portal.html';
  });
  document.querySelectorAll('a[data-type]').forEach(a=>a.addEventListener('click',()=>{
    const sel=document.getElementById('type'); if(sel) sel.value=a.dataset.type;
  }));
})();

// Role in the market: rotating background photos
(function(){
  const sec=document.getElementById('difference'); if(!sec||!sec.classList.contains('has-slides')) return;
  const slides=[...sec.querySelectorAll('.life-slide')], dots=[...sec.querySelectorAll('.life-dots button')],
        steps=[...sec.querySelectorAll('.life-steps li')], cap=document.getElementById('life-cap'), pause=sec.querySelector('.life-pause');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i=0, timer=null, visible=false, paused=reduce;
  const show=n=>{ i=(n+slides.length)%slides.length;
    slides.forEach((s,k)=>{ s.classList.toggle('is-on',k===i); if(k===(i+1)%slides.length){const im=s.querySelector('img'); if(im.loading==='lazy') im.loading='eager';} });
    dots.forEach((d,k)=>d.setAttribute('aria-pressed',String(k===i)));
    steps.forEach((s,k)=>s.classList.toggle('is-active',k===i));
    cap.textContent=slides[i].dataset.label; };
  const stop=()=>{clearInterval(timer);timer=null;};
  const start=()=>{stop(); if(!paused&&visible&&!document.hidden) timer=setInterval(()=>show(i+1),6000);};
  dots.forEach((d,k)=>d.addEventListener('click',()=>{show(k);start();}));
  const setPaused=p=>{paused=p;pause.setAttribute('aria-pressed',String(p));pause.setAttribute('aria-label',p?'Play slideshow':'Pause slideshow');pause.querySelector('.lp-txt').textContent=p?'Play':'Pause';start();};
  pause.addEventListener('click',()=>setPaused(!paused));
  if(reduce) setPaused(true);
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;start();},{threshold:.15}).observe(sec);
  document.addEventListener('visibilitychange',start);
  show(0);
})();

// Behind the scenes: background video (plays only when visible; respects reduced motion)
(function(){
  const sec=document.getElementById('confidential'); const v=sec&&sec.querySelector('.quiet-video'); if(!v) return;
  const btn=sec.querySelector('.quiet-pause'); const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduce, visible=false, loaded=false;
  const sync=()=>{ if(!paused&&visible&&!document.hidden){ if(!loaded){v.preload='auto';v.load();loaded=true;} const p=v.play(); if(p&&p.catch) p.catch(()=>{}); } else v.pause(); };
  const set=p=>{paused=p;btn.setAttribute('aria-pressed',String(p));btn.setAttribute('aria-label',p?'Play background video':'Pause background video');btn.querySelector('.lp-txt').textContent=p?'Play':'Pause';sync();};
  btn.addEventListener('click',()=>set(!paused));
  if(reduce) set(true);
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.1}).observe(sec);
  document.addEventListener('visibilitychange',sync);
})();
