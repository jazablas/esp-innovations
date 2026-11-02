(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  $('#year').textContent = new Date().getFullYear();

  // ---------- Catalog (no prices: quoted per account) ----------
  const CATALOG = [
    { id: 'lighter', kind: 'goods', name: 'USB Rechargeable Arc Lighters', tag: 'Home & outdoor', img: 'assets/work/arc-lighter.webp', opts: ['Pocket', 'Keychain', 'Flexible-neck candle / BBQ'] },
    { id: 'mini330', kind: 'goods', name: 'MINI330 TWS Speaker', tag: 'Audio', img: 'assets/work/mini330.webp', opts: ['Light wood', 'Dark wood', 'White', 'Black'] },
    { id: 'mk', kind: 'goods', name: 'MK-Series Retro Speakers', tag: 'Audio', img: 'assets/work/mk-speakers.webp', opts: ['MK30', 'MK35', 'MK40', 'MK180'] },
    { id: 'vest', kind: 'goods', name: 'USB Heated Vest', tag: 'Apparel tech', img: 'assets/work/heated-vest.webp', opts: [] },
    { id: 'umbrella', kind: 'goods', name: 'Bright Night Lighted Umbrellas', tag: 'Lifestyle', img: 'assets/work/umbrellas.webp', opts: ['Slow Flow', 'Water Cluster', 'Waterbeads', 'Monsoon', 'Ripple Effect'] },
    { id: 'headphones', kind: 'goods', name: 'Qi Wireless-Charging Headphones (HQ834)', tag: 'Audio', img: 'assets/work/qi-headphones.webp', opts: ['Headphones only', 'Headphones + matching stand'] },
    { id: 'redalf', kind: 'goods', name: 'Redalf Triple Portable Monitor', tag: 'Computing', img: 'assets/work/triple-monitor.webp', opts: [] },
    { id: 'quad', kind: 'goods', name: 'Portable Quad Laptop Screen Extender', tag: 'Computing', img: 'assets/work/quad-monitor.webp', opts: ['USB-C to USB-C', 'USB-A to USB-C'] },
    { id: 'dual', kind: 'goods', name: '16″ Dual-Screen Touch Laptop', tag: 'Computing', img: 'assets/work/dual-laptop.webp', opts: ['i5 · 16 GB · 512 GB', 'i5 · 32 GB · 1 TB', 'i7 · 32 GB · 2 TB'] },
    { id: 'shield', kind: 'goods', name: 'VINTA Active//Shield', tag: 'Health & safety', img: 'assets/work/active-shield.webp', opts: [] },
    { id: 'kiosk', kind: 'goods', name: 'Touch-Screen Kiosks', tag: 'Commercial displays', img: 'assets/work/kiosk.webp', opts: ['Crystal silver', 'Purple gold', 'Classic black'] },
    { id: 'wall', kind: 'goods', name: 'Wall-Mounted Ad Players', tag: 'Commercial displays', img: 'assets/work/wall-player.webp', opts: ['Portrait', 'Landscape'] },
    { id: 'svc-source', kind: 'services', letter: 'F', name: 'Product sourcing search', tag: 'Find', desc: 'Tell us what your customers want. We search our worldwide network and come back with vetted options and samples.' },
    { id: 'svc-oem', kind: 'services', letter: 'O', name: 'OEM product development', tag: 'Develop', desc: 'A product made for your brand: we develop, design and build it with the right manufacturer.' },
    { id: 'svc-design', kind: 'services', letter: 'D', name: 'Design, prototyping & samples', tag: 'Design', desc: 'Product changes, packaging, branding and pre-production samples for your approval.' },
    { id: 'svc-cert', kind: 'services', letter: 'T', name: 'US certification & third-party testing', tag: 'Test', desc: 'Compliance review, US certifications and third-party lab testing as needed for your product.' },
    { id: 'svc-logistics', kind: 'services', letter: 'L', name: 'Logistics: factory to US', tag: 'Deliver', desc: 'Production follow-up, inspection, freight, customs and delivery to your warehouse.' },
    { id: 'svc-review', kind: 'services', letter: 'R', name: 'Product line review & next line', tag: 'Plan', desc: 'We review your current product line, recommend what to keep, refresh or retire, and help you develop your next line of products.' },
    { id: 'svc-marketing', kind: 'services', letter: 'M', name: 'Marketing plan', tag: 'Market', desc: 'A plan to help you sell the product to your customers: positioning, launch and sales materials.' },
  ];
  const byId = id => CATALOG.find(c => c.id === id);
  const itemName = it => byId(it.id)?.name || it.name || it.id;
  const itemKind = it => byId(it.id)?.kind || it.kind || 'goods';
  const STEPS = ['Request sent', 'Quote sent', 'In production', 'Shipped', 'Delivered'];

  // ---------- API (live accounts) ----------
  let CSRF = '', challenged = false;
  const RESET = (new URLSearchParams(location.search).get('reset') || '').match(/^[a-f0-9]{64}$/) ? new URLSearchParams(location.search).get('reset') : '';
  async function api(action, data, method = 'POST') {
    const headers = { 'X-Requested-With': 'ESPi' };
    if (CSRF) headers['X-ESPi-CSRF'] = CSRF;
    const opts = { method, credentials: 'same-origin', headers };
    if (method === 'POST') { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(data || {}); }
    let r;
    try { r = await fetch('api/index.php?action=' + encodeURIComponent(action), opts); }
    catch (e) { const er = new Error('We couldn’t reach the portal. Check your connection and try again.'); er.offline = true; throw er; }
    if (!(r.headers.get('content-type') || '').includes('application/json')) {
      const t = await r.text();
      const m = t.match(/document\.cookie\s*=\s*"([^"]+)"/); // host security check: set its cookie, retry once
      if (m && !challenged) { challenged = true; document.cookie = m[1] + '; path=/; secure; samesite=lax'; return api(action, data, method); }
      const er = new Error('The portal isn’t available on this copy of the site.'); er.offline = true; throw er;
    }
    const j = await r.json();
    if (!j.ok) { const er = new Error(j.error || 'Something went wrong. Please try again.'); er.signin = !!j.signin; throw er; }
    return j;
  }

  // ---------- State ----------
  const blank = () => ({ user: null, sample: false, profile: {}, orders: [], cart: [], pay: [] });
  let S = blank();

  const sampleData = () => ({
    user: { email: 'buyer@sample-company.example' }, sample: true,
    profile: { company: 'Sample Company (demo)', contact: 'Demo Buyer', email: 'buyer@sample-company.example', phone: '', ship: 'Sample Company Warehouse\n123 Example Way\nAnytown, USA', bill: 'Net terms per agreement. PO required on every order.' },
    orders: [
      { id: 'ESP-1063', date: '2026-10-22', status: 'Quote sent', po: 'PO-3318', pay: 'Secure payment link (Card)', message: 'Your quote is ready. We emailed it with the FCC testing timeline; reply to approve and we’ll schedule production.', items: [
        { id: 'headphones', qty: 800, opt: 'Headphones + matching stand' },
        { id: 'svc-cert', qty: 1, note: 'FCC review and third-party lab testing before the holiday shipment.' }] },
      { id: 'ESP-1057', date: '2026-10-06', status: 'In production', po: 'PO-3290', pay: 'Invoice (net terms)', items: [
        { id: 'umbrella', qty: 1200, opt: 'Monsoon' },
        { id: 'vest', qty: 300, opt: '' }] },
      { id: 'ESP-1042', date: '2026-09-18', status: 'Delivered', po: 'PO-3204', pay: 'Invoice (net terms)', items: [
        { id: 'lighter', qty: 2000, opt: 'Flexible-neck candle / BBQ' },
        { id: 'mini330', qty: 500, opt: 'Light wood' }] },
      { id: 'ESP-0998', date: '2026-06-30', status: 'Delivered', po: 'PO-3011', pay: 'Secure payment link (Card)', items: [
        { id: 'lighter', qty: 1500, opt: 'Pocket' },
        { id: 'umbrella', qty: 800, opt: 'Ripple Effect' }] },
    ],
    cart: [],
    pay: [
      { id: 1, type: 'link', via: 'Card', ap: 'ap@sample-company.example', isDefault: true, status: 'active' },
      { id: 2, type: 'terms', terms: 'Net 30', ap: 'ap@sample-company.example', po: 'Yes', status: 'active' }
    ]
  });

  // ---------- Helpers ----------
  const toast = msg => { const t = $('#pp-toast'); t.innerHTML = esc(msg).replace(/\bESPi\b/g, '<span class="espi">ESP<span>i</span></span>'); t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200); };
  const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const qtyLabel = it => itemKind(it) === 'services' ? 'Service' : Number(it.qty).toLocaleString('en-US') + ' units';
  const validEmail = v => /^\S+@\S+\.\S+$/.test(v);
  const pwProblem = p => p.length < 10 ? 'Use at least 10 characters for the password.' : (!/[A-Za-z]/.test(p) || !/\d/.test(p)) ? 'Use both letters and numbers in the password.' : '';
  const busy = (form, on) => { const b = form.querySelector('button[type=submit]'); if (b) { b.disabled = on; b.setAttribute('aria-busy', String(on)); } };
  const handleErr = (e, statusEl) => {
    if (e.signin && !S.sample) { S = blank(); CSRF = ''; showAuth(); toast(e.message); return; }
    if (statusEl) statusEl.textContent = e.message; else toast(e.message);
  };
  const addToCart = (item, quiet) => {
    const c = byId(item.id); if (!c) { if (!quiet) toast('That product is no longer in the catalog. Contact us to reorder it.'); return; }
    const ex = S.cart.find(x => x.id === item.id && (x.opt || '') === (item.opt || '') && c.kind === 'goods');
    if (ex) ex.qty = Number(ex.qty) + Number(item.qty);
    else S.cart.push({ id: item.id, qty: c.kind === 'services' ? 1 : Math.max(1, Number(item.qty) || 1), opt: item.opt || '', note: item.note || '' });
    renderCount(); if (!quiet) toast(c.name + ' added to your order request');
  };
  const thumb = it => { const c = byId(it.id);
    if (c && c.kind === 'goods') return `<img src="${c.img}" alt="" loading="lazy" width="96" height="72">`;
    const letter = c ? c.letter : (itemName(it)[0] || '•');
    return `<span class="pp-letter" aria-hidden="true">${esc(letter)}</span>`; };

  // ---------- Auth ----------
  function showAuth(view) {
    $('#pp-auth').hidden = false; $('#pp-app').hidden = true;
    $('#pp-signout').hidden = true; $('#pp-who').hidden = true;
    const v = view || (RESET ? 'reset' : ({ '#request': 'request', '#forgot': 'forgot' })[location.hash] || 'signin');
    $('#pp-signin').hidden = v !== 'signin'; $('#pp-request').hidden = v !== 'request';
    $('#pp-forgot').hidden = v !== 'forgot'; $('#pp-reset').hidden = v !== 'reset';
  }
  function showApp() {
    $('#pp-auth').hidden = true; $('#pp-app').hidden = false;
    $('#pp-signout').hidden = false; const w = $('#pp-who'); w.hidden = false;
    w.textContent = S.profile.company || S.user.email;
    renderAll(); const h = location.hash.replace('#', ''); go(h && h !== 'request' && h !== 'signin' ? h : 'overview', true);
  }
  async function loadLive() {
    const [o, p] = await Promise.all([api('orders'), api('pay_list')]);
    S.orders = o.orders; S.pay = p.pay;
  }
  $('#pp-to-request').addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', '#request'); showAuth('request'); $('#rq-company').focus(); });
  $('#pp-to-signin').addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', 'portal.html'); showAuth('signin'); $('#pp-email').focus(); });

  $('#pp-signin').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, em = $('#pp-email'), pw = $('#pp-pass'), st = $('#pp-signin .pc-status');
    const badE = !validEmail(em.value.trim()), badP = !pw.value;
    em.closest('.pfield').classList.toggle('err', badE); pw.closest('.pfield').classList.toggle('err', badP);
    if (badE || badP) { st.textContent = 'Please enter your business email and password.'; return; }
    st.textContent = 'Signing in…'; busy(f, true);
    try {
      const r = await api('login', { email: em.value.trim(), password: pw.value, keep: $('#pp-keep').checked });
      CSRF = r.csrf;
      if (r.role === 'admin') { window.location.href = 'admin.html'; return; }
      await boot(); pw.value = ''; st.textContent = '';
    } catch (err) { st.textContent = err.message; }
    finally { busy(f, false); }
  });

  $('#pp-request').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, st = f.querySelector('.pc-status');
    const v = id => $('#' + id).value.trim();
    const checks = [['rq-company', !v('rq-company')], ['rq-name', !v('rq-name')], ['rq-email', !validEmail(v('rq-email'))], ['rq-pass', !!pwProblem($('#rq-pass').value)], ['rq-pass2', $('#rq-pass2').value !== $('#rq-pass').value]];
    checks.forEach(([id, bad]) => $('#' + id).closest('.pfield').classList.toggle('err', bad));
    const firstBad = checks.find(c => c[1]);
    if (firstBad) {
      st.textContent = firstBad[0] === 'rq-pass' ? pwProblem($('#rq-pass').value) : firstBad[0] === 'rq-pass2' ? 'The two passwords don’t match.' : 'Please fill in the highlighted fields.';
      $('#' + firstBad[0]).focus(); return;
    }
    st.textContent = 'Sending…'; busy(f, true);
    try {
      await api('request_account', { company: v('rq-company'), name: v('rq-name'), email: v('rq-email'), phone: v('rq-phone'), password: $('#rq-pass').value, message: v('rq-msg'), website: $('#rq-website').value });
      f.reset(); st.textContent = 'Thank you. Your request was sent to the ESPi team. We’ll email you when your account is approved, then you can sign in with the password you chose.';
      st.innerHTML = esc(st.textContent).replace('ESPi', '<span class="espi">ESP<span>i</span></span>');
    } catch (err) { st.textContent = err.message; }
    finally { busy(f, false); }
  });

  $('#pp-to-forgot').addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', '#forgot'); showAuth('forgot'); const fe = $('#fg-email'); fe.value = $('#pp-email').value.trim(); fe.focus(); });
  document.querySelectorAll('.pp-back-signin').forEach(a => a.addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', 'portal.html'); showAuth('signin'); $('#pp-email').focus(); }));
  $('#pp-forgot').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, st = f.querySelector('.pc-status'), em = $('#fg-email');
    const bad = !validEmail(em.value.trim()); em.closest('.pfield').classList.toggle('err', bad);
    if (bad) { st.textContent = 'Enter the email you use to sign in.'; em.focus(); return; }
    st.textContent = 'Sending…'; busy(f, true);
    try { await api('request_reset', { email: em.value.trim() }); st.textContent = 'If that email matches an active account, a reset link is on its way. Check your inbox and spam folder.'; }
    catch (err) { st.textContent = err.offline ? 'Password reset is available at espinnovations.com/portal.html.' : err.message; }
    finally { busy(f, false); }
  });
  $('#pp-reset').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, st = f.querySelector('.pc-status'), p1 = $('#rs-pass'), p2 = $('#rs-pass2');
    const prob = pwProblem(p1.value), mism = p1.value !== p2.value;
    p1.closest('.pfield').classList.toggle('err', !!prob); p2.closest('.pfield').classList.toggle('err', !prob && mism);
    if (prob || mism) { st.textContent = prob || 'The two passwords don’t match.'; return; }
    st.textContent = 'Saving…'; busy(f, true);
    try {
      await api('do_reset', { token: RESET, password: p1.value });
      f.reset(); history.replaceState(null, '', 'portal.html');
      showAuth('signin'); $('#pp-signin .pc-status').textContent = 'Your password was changed. Sign in with your new password.'; $('#pp-email').focus();
    } catch (err) { st.textContent = err.message; }
    finally { busy(f, false); }
  });

  $('#pp-demo').addEventListener('click', () => { S = sampleData(); showApp(); });
  $('#pp-signout').addEventListener('click', async () => {
    if (!S.sample) { try { await api('logout'); } catch (e) { /* ignore */ } }
    S = blank(); CSRF = '';
    history.replaceState(null, '', 'portal.html'); showAuth('signin');
  });

  // ---------- Tabs ----------
  function go(tab, noScroll) {
    if (!$(`.pp-panel[data-panel="${tab}"]`)) tab = 'overview';
    $$('.pp-panel').forEach(p => p.hidden = p.dataset.panel !== tab);
    $$('.pp-tabs button').forEach(b => { if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    history.replaceState(null, '', '#' + tab);
    if (tab === 'cart') renderCart();
    if (tab === 'reorder') renderReorder();
    if (tab === 'history') renderHistory();
    if (tab === 'overview') renderOverview();
    if (tab === 'payment') renderPay();
    if (tab === 'account') renderProfile();
    if (!noScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $$('.pp-tabs button').forEach(b => b.addEventListener('click', () => go(b.dataset.tab)));
  document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go); });

  // ---------- Renderers ----------
  function renderCount() { const n = S.cart.length; $('#pp-count').textContent = n; $('#pp-count').classList.toggle('has', n > 0); }

  function orderCard(o, compact) {
    const step = o.status === 'Cancelled' ? 5 : STEPS.indexOf(o.status);
    const items = o.items.map(it => `<li>${thumb(it)}<div><b>${esc(itemName(it))}</b><span>${esc(it.opt || (itemKind(it) === 'services' ? (byId(it.id)?.tag || 'Service') : ''))}</span></div><em>${qtyLabel(it)}</em></li>`).join('');
    return `<article class="pp-order">
      <header><div><h3>${esc(o.id)}</h3><p>${fmtDate(o.date)}${o.po ? ' · ' + esc(o.po) : ''}${o.pay ? ' · ' + esc(o.pay) : ''}</p></div>
        <span class="pp-status s${step}">${esc(o.status)}</span></header>
      ${compact || o.status === 'Cancelled' ? '' : `<ol class="pp-track" aria-label="Order progress">${STEPS.map((s, i) => `<li class="${i <= step ? 'done' : ''}">${s}</li>`).join('')}</ol>`}
      ${o.pay_url && o.status !== 'Cancelled' ? `<div class="pp-paybar"><span>A secure payment link is ready for this order.</span><a class="btn pp-btn-sm" href="${esc(o.pay_url)}" target="_blank" rel="noopener noreferrer">Pay now</a></div>` : ''}
      ${o.message ? `<div class="pp-msg"><b>Message from the <span class="espi">ESP<span>i</span></span> team</b>${esc(o.message)}</div>` : ''}
      <ul class="pp-lines">${items}</ul>
      <footer><button type="button" class="btn pp-btn-sm" data-reorder-order="${esc(o.id)}">Reorder all</button></footer>
    </article>`;
  }

  function renderOverview() {
    $('#pp-hello').textContent = 'Hello, ' + (S.profile.contact || S.profile.company || 'there') + '.';
    $('#pp-sample-note').hidden = !S.sample;
    $('#pp-pw-note').hidden = !(S.user && S.user.must_change);
    $('#st-open').textContent = S.orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    $('#st-total').textContent = S.orders.length;
    $('#st-items').textContent = reorderList().length;
    const r = $('#pp-recent');
    r.innerHTML = S.orders.length ? S.orders.slice(0, 2).map(o => orderCard(o, true)).join('')
      : `<div class="pp-empty"><p>No orders yet. Start your first order request and it will appear here.</p><button type="button" class="btn" data-go="order">Place a new order</button></div>`;
  }

  let cat = 'goods';
  function renderCatalog() {
    $$('.pp-filter button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.cat === cat)));
    $('#pp-catalog').innerHTML = CATALOG.filter(c => c.kind === cat).map(c => c.kind === 'goods' ? `
      <form class="pp-item" data-id="${c.id}">
        <div class="pp-item-img"><img src="${c.img}" alt="${esc(c.name)}" loading="lazy" width="400" height="300"></div>
        <div class="pp-item-body">
          <p class="pp-tag">${esc(c.tag)}</p><h3>${esc(c.name)}</h3>
          <div class="pp-item-row">
            ${c.opts.length ? `<div class="pfield"><label for="o-${c.id}">Option</label><select id="o-${c.id}" name="opt">${c.opts.map(o => `<option>${esc(o)}</option>`).join('')}</select></div>` : ''}
            <div class="pfield"><label for="q-${c.id}">Quantity (units)</label><input id="q-${c.id}" name="qty" type="number" min="1" step="1" inputmode="numeric" placeholder="e.g. 500" required></div>
          </div>
          <p class="pp-price">Price: quoted for your account</p>
          <button class="btn pp-btn-sm" type="submit">Add to order</button>
        </div>
      </form>` : `
      <form class="pp-item pp-svc" data-id="${c.id}">
        <div class="pp-item-body">
          <div class="pp-svc-head"><span class="pp-letter" aria-hidden="true">${c.letter}</span><div><p class="pp-tag">${esc(c.tag)}</p><h3>${esc(c.name)}</h3></div></div>
          <p class="pp-desc">${esc(c.desc)}</p>
          <div class="pfield"><label for="n-${c.id}">Project brief</label><textarea id="n-${c.id}" name="note" rows="3" placeholder="What do you need, and by when?"></textarea></div>
          <button class="btn pp-btn-sm" type="submit">Add to order</button>
        </div>
      </form>`).join('');
  }
  $$('.pp-filter button').forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat; renderCatalog(); }));
  $('#pp-catalog').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, c = byId(f.dataset.id);
    if (c.kind === 'goods') {
      const q = f.qty; const bad = !(Number(q.value) >= 1);
      q.closest('.pfield').classList.toggle('err', bad);
      if (bad) { q.focus(); toast('Enter a quantity first'); return; }
      addToCart({ id: c.id, qty: Number(q.value), opt: f.opt ? f.opt.value : '' }); q.value = '';
    } else { addToCart({ id: c.id, qty: 1, note: f.note.value.trim() }); f.note.value = ''; }
  });

  function reorderList() {
    const map = new Map();
    [...S.orders].filter(o => o.status !== 'Cancelled').sort((a, b) => a.date.localeCompare(b.date)).forEach(o => o.items.forEach(it => {
      const c = byId(it.id); if (!c || c.kind !== 'goods') return;
      const k = it.id + '|' + (it.opt || '');
      const prev = map.get(k);
      map.set(k, { id: it.id, opt: it.opt || '', qty: it.qty, last: o.date, times: (prev ? prev.times : 0) + 1 });
    }));
    return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  }
  function renderReorder() {
    const list = reorderList(), el = $('#pp-reorder');
    if (!list.length) { el.innerHTML = `<div class="pp-empty"><p>Products you order will be listed here for quick reordering.</p><button type="button" class="btn" data-go="order">Browse goods</button></div>`; return; }
    el.innerHTML = `<div class="pp-table" role="table" aria-label="Products you buy">
      <div class="pp-tr pp-th" role="row"><span role="columnheader">Product</span><span role="columnheader">Last ordered</span><span role="columnheader">Quantity</span><span role="columnheader"><span class="sr">Action</span></span></div>
      ${list.map((r, i) => { const c = byId(r.id); return `<form class="pp-tr" role="row" data-i="${i}">
        <span class="pp-prod" role="cell">${thumb(r)}<span><b>${esc(c.name)}</b><small>${esc(r.opt || c.tag)}${r.times > 1 ? ' · ordered ' + r.times + ' times' : ''}</small></span></span>
        <span role="cell" class="pp-last">${fmtDate(r.last)}</span>
        <span role="cell"><label class="sr" for="rq-${i}">Quantity</label><input id="rq-${i}" class="pp-qty" type="number" min="1" value="${r.qty}" inputmode="numeric"></span>
        <span role="cell"><button class="btn pp-btn-sm" type="submit">Reorder</button></span>
      </form>`; }).join('')}
    </div>`;
    el.querySelectorAll('form').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault(); const r = list[f.dataset.i], q = Number(f.querySelector('input').value);
      if (!(q >= 1)) { toast('Enter a quantity first'); return; }
      addToCart({ id: r.id, opt: r.opt, qty: q });
    }));
  }

  function renderHistory() {
    $('#pp-history').innerHTML = S.orders.length ? S.orders.map(o => orderCard(o)).join('')
      : `<div class="pp-empty"><p>No orders yet.</p><button type="button" class="btn" data-go="order">Place a new order</button></div>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-reorder-order]'); if (!b) return;
    const o = S.orders.find(x => x.id === b.dataset.reorderOrder); if (!o) return;
    o.items.forEach(it => addToCart(it, true));
    toast('Items from ' + o.id + ' added. Review quantities before sending.');
    go('cart');
  });

  function renderCart() {
    const el = $('#pp-cart'), ck = $('#pp-checkout');
    if (!S.cart.length) {
      el.innerHTML = `<div class="pp-empty"><p>Your order request is empty.</p><div class="pp-empty-btns"><button type="button" class="btn" data-go="order">Place a new order</button><button type="button" class="btn pp-ghost" data-go="reorder">Reorder products</button></div></div>`;
      ck.hidden = true; return;
    }
    el.innerHTML = `<ul class="pp-cartlist">${S.cart.map((it, i) => { const c = byId(it.id); return `<li>
      ${thumb(it)}
      <div class="pp-cl-main"><b>${esc(c.name)}</b><span>${esc(it.opt || c.tag)}</span>${it.note ? `<p>${esc(it.note)}</p>` : ''}</div>
      ${c.kind === 'goods' ? `<label class="pp-cl-q"><span>Units</span><input type="number" min="1" value="${it.qty}" data-q="${i}" inputmode="numeric"></label>` : `<span class="pp-cl-q pp-svc-l">Service</span>`}
      <button type="button" class="pp-x" data-rm="${i}" aria-label="Remove ${esc(c.name)}">&times;</button>
    </li>`; }).join('')}</ul>`;
    ck.hidden = false;
    if (!$('#ck-ship').value) $('#ck-ship').value = S.profile.ship || '';
    renderPayPick();
    el.querySelectorAll('[data-q]').forEach(inp => inp.addEventListener('change', () => { S.cart[inp.dataset.q].qty = Math.max(1, Number(inp.value) || 1); inp.value = S.cart[inp.dataset.q].qty; }));
    el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.cart.splice(Number(b.dataset.rm), 1); renderCount(); renderCart(); }));
  }
  $('#pp-checkout').addEventListener('submit', async e => {
    e.preventDefault(); if (!S.cart.length) return;
    const f = e.target;
    const picked = $('#ck-pay input[name=ckpay]:checked');
    if (!picked) { toast('Choose a payment method first'); $('#ck-pay').scrollIntoView({ block: 'center' }); return; }
    const pm = S.pay.find(x => String(x.id) === picked.value);
    const fields = { po: $('#ck-po').value.trim(), want: $('#ck-date').value, ship: $('#ck-ship').value.trim(), notes: $('#ck-notes').value.trim() };
    const items = S.cart.map(x => ({ ...x, name: byId(x.id).name, kind: byId(x.id).kind }));
    let order;
    if (S.sample) {
      const n = Math.max(1000, ...S.orders.map(o => parseInt(o.id.split('-')[1], 10) || 0)) + 1;
      order = { id: 'ESP-' + n, pay: pm ? payShort(pm) : 'To be chosen at quote approval', date: new Date().toISOString().slice(0, 10), status: 'Request sent', ...fields, items };
    } else {
      busy(f, true);
      try { order = (await api('order_create', { ...fields, items, pay_id: pm ? pm.id : 0 })).order; }
      catch (err) { handleErr(err); return; }
      finally { busy(f, false); }
    }
    S.orders.unshift(order); S.cart = []; renderCount();
    $('#ck-po').value = ''; $('#ck-date').value = ''; $('#ck-notes').value = '';
    toast(S.sample ? 'Sample order ' + order.id + ' saved. In a live account it goes straight to the ESPi team.' : 'Order request ' + order.id + ' sent to the ESPi team. We’ll reply with a confirmed quote.');
    go('history');
  });

  // Profile
  const PF = { company: 'pf-company', contact: 'pf-contact', email: 'pf-email', phone: 'pf-phone', ship: 'pf-ship', bill: 'pf-bill' };
  function renderProfile() {
    Object.entries(PF).forEach(([k, id]) => $('#' + id).value = S.profile[k] || ''); $('#pp-profile .pp-ok').textContent = '';
    const pwBlock = !S.sample; $('#pw-h').hidden = !pwBlock; $('#pp-password').hidden = !pwBlock;
    $('#pw-user').value = S.user ? S.user.email : '';
  }
  $('#pp-profile').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, st = $('#pp-profile .pp-ok');
    const co = $('#pf-company'), em = $('#pf-email');
    const badC = !co.value.trim(), badE = !validEmail(em.value.trim());
    co.closest('.pfield').classList.toggle('err', badC); em.closest('.pfield').classList.toggle('err', badE);
    if (badC || badE) { st.textContent = 'Company name and a valid email are required.'; return; }
    const data = {}; Object.entries(PF).forEach(([k, id]) => data[k] = $('#' + id).value.trim());
    if (S.sample) S.profile = { ...S.profile, ...data };
    else { busy(f, true); try { S.profile = (await api('profile_save', data)).profile; } catch (err) { handleErr(err, st); return; } finally { busy(f, false); } }
    $('#pp-who').textContent = S.profile.company; st.textContent = 'Profile saved.';
  });
  $('#pp-password').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, st = f.querySelector('.pp-ok');
    const cur = $('#pw-cur').value, nw = $('#pw-new').value, nw2 = $('#pw-new2').value;
    const prob = !cur ? 'Enter your current password.' : pwProblem(nw) || (nw !== nw2 ? 'The new passwords don’t match.' : '');
    if (prob) { st.textContent = prob; return; }
    busy(f, true);
    try { await api('change_password', { current: cur, password: nw }); f.reset(); st.textContent = 'Password updated.'; if (S.user) S.user.must_change = false; }
    catch (err) { handleErr(err, st); }
    finally { busy(f, false); }
  });

  // ---------- Payment methods ----------
  const payShort = p => p.type === 'link' ? `Secure payment link (${p.via === 'ACH' || p.via === 'ACH bank transfer' ? 'ACH' : 'Card'})` : p.type === 'terms' ? 'Invoice (net terms)' : p.type === 'wire' ? 'Wire transfer' : 'Payment method';
  const payDetail = p => p.type === 'link' ? `Links emailed to ${p.ap || ''}` : p.type === 'terms' ? `${p.terms || ''}${p.ap ? ' · Invoices to ' + p.ap : ''}` : `Remittance contact: ${p.ap || ''}`;
  const payIcon = t => ({ link: '<svg viewBox="0 0 32 22" aria-hidden="true"><rect x="1" y="1" width="30" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 7h30" stroke="currentColor" stroke-width="3"/><path d="M5 15h8" stroke="currentColor" stroke-width="1.5"/></svg>',
    terms: '<svg viewBox="0 0 32 22" aria-hidden="true"><path d="M8 1h12l5 5v15H8z M20 1v5h5 M11 11h10 M11 15h10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    wire: '<svg viewBox="0 0 32 22" aria-hidden="true"><path d="M2 7h24l-5-5M30 15H6l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' }[t] || '');
  const usable = p => p.status === 'active';
  const ensureDefault = () => { if (!S.pay.some(p => p.isDefault && usable(p))) { S.pay.forEach(p => p.isDefault = false); const f = S.pay.find(usable); if (f) f.isDefault = true; } };

  function renderPay() {
    const el = $('#pm-list');
    if (!S.pay.length) { el.innerHTML = `<div class="pp-empty"><p>No payment methods saved yet. Add a payment link, net terms or wire transfer below.</p></div>`; return; }
    el.innerHTML = S.pay.map(p => `<article class="pm-item${p.isDefault ? ' is-default' : ''}">
      <span class="pm-ico">${payIcon(p.type)}</span>
      <div class="pm-main"><b>${esc(payShort(p))}</b><span>${esc(payDetail(p))}</span></div>
      <div class="pm-flags">${p.isDefault ? '<span class="pm-tag pm-def">Default</span>' : ''}${p.status === 'pending' ? '<span class="pm-tag pm-pend">Pending approval</span>' : ''}${p.status === 'declined' ? '<span class="pm-tag pm-pend">Not approved</span>' : ''}</div>
      <div class="pm-acts">${!p.isDefault && usable(p) ? `<button type="button" class="pm-link" data-pm-default="${p.id}">Make default</button>` : ''}<button type="button" class="pm-link pm-rm" data-pm-rm="${p.id}" aria-label="Remove ${esc(payShort(p))}">Remove</button></div>
    </article>`).join('');
  }
  $('#pm-list').addEventListener('click', async e => {
    const d = e.target.closest('[data-pm-default]'), r = e.target.closest('[data-pm-rm]');
    const id = (d || r) ? (d || r).dataset[d ? 'pmDefault' : 'pmRm'] : null; if (!id) return;
    const p = S.pay.find(x => String(x.id) === id); if (!p) return;
    if (r && !confirm('Remove ' + payShort(p) + ' from your account?')) return;
    if (S.sample) {
      if (d) S.pay.forEach(x => x.isDefault = x === p); else S.pay = S.pay.filter(x => x !== p);
      ensureDefault();
    } else {
      try { S.pay = (await api(d ? 'pay_default' : 'pay_remove', { id: p.id })).pay; } catch (err) { handleErr(err); return; }
    }
    renderPay(); toast(d ? 'Default payment method updated' : payShort(p) + ' removed');
  });

  $$('.pm-types button').forEach(b => b.addEventListener('click', () => {
    $$('.pm-types button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('.pm-form').forEach(f => f.hidden = f.dataset.pmtype !== b.dataset.pmtype);
  }));
  const flag = (inp, bad) => { inp.closest('.pfield, .pm-check').classList.toggle('err', bad); return bad; };
  async function savePay(f, data, okMsg) {
    const st = f.querySelector('.pp-ok');
    if (S.sample) {
      if (S.pay.some(p => p.type === data.type)) { st.textContent = 'That payment type is already on this sample account.'; return; }
      const p = { id: Date.now(), status: data.type === 'terms' ? 'pending' : 'active', isDefault: false, ...data };
      if (data.make_default && usable(p)) { S.pay.forEach(x => x.isDefault = false); p.isDefault = true; }
      S.pay.push(p); ensureDefault();
    } else {
      busy(f, true);
      try { S.pay = (await api('pay_add', data)).pay; } catch (err) { handleErr(err, st); return; } finally { busy(f, false); }
    }
    f.reset(); $$('.err', f).forEach(x => x.classList.remove('err')); st.textContent = ''; renderPay(); toast(okMsg);
  }
  $('#pm-link').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, ap = $('#lk-ap').value.trim();
    if (flag($('#lk-ap'), !validEmail(ap))) { f.querySelector('.pp-ok').textContent = 'Enter the email that should receive payment links.'; return; }
    savePay(f, { type: 'link', ap, via: $('#lk-via').value, make_default: $('#lk-default').checked }, 'Secure payment link saved');
  });
  $('#pm-terms').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, ap = $('#nt-ap').value.trim();
    if (flag($('#nt-ap'), !validEmail(ap))) { f.querySelector('.pp-ok').textContent = 'Enter your accounts payable email.'; return; }
    savePay(f, { type: 'terms', ap, terms: $('#nt-terms').value, po: $('#nt-po').value, tax: $('#nt-tax').value.trim() }, 'Net terms requested. Our accounts team will review and confirm.');
  });
  $('#pm-wire').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, ap = $('#wr-ap').value.trim();
    if (flag($('#wr-ap'), !validEmail(ap))) { f.querySelector('.pp-ok').textContent = 'Enter a remittance contact email.'; return; }
    savePay(f, { type: 'wire', ap, make_default: $('#wr-default').checked }, 'Wire transfer saved');
  });

  function renderPayPick() {
    const el = $('#ck-pay'); const def = S.pay.find(p => p.isDefault && usable(p));
    const opts = S.pay.filter(p => p.status !== 'declined').map(p => `<label class="pm-opt${usable(p) ? '' : ' is-off'}"><input type="radio" name="ckpay" value="${p.id}"${usable(p) ? '' : ' disabled'}${def && def.id === p.id ? ' checked' : ''}>
      <span class="pm-ico">${payIcon(p.type)}</span><span><b>${esc(payShort(p))}</b><small>${usable(p) ? esc(payDetail(p)) : 'Pending approval by our accounts team'}</small></span>${p.isDefault ? '<span class="pm-tag pm-def">Default</span>' : ''}</label>`).join('');
    el.innerHTML = opts + `<label class="pm-opt"><input type="radio" name="ckpay" value="later"${def ? '' : ' checked'}><span class="pm-ico">${payIcon('terms')}</span><span><b>Choose when I approve the quote</b><small>We&rsquo;ll ask for payment details with your quote</small></span></label>
      <button type="button" class="pm-link pm-add" data-go="payment">+ Add or manage payment methods</button>`;
  }

  function renderAll() { renderCount(); renderCatalog(); renderProfile(); renderOverview(); renderPay(); }

  // ---------- Boot ----------
  async function boot() {
    const me = await api('me', null, 'GET');
    if (!me.user) { showAuth(); return; }
    if (me.user.role === 'admin') { window.location.href = 'admin.html'; return; }
    CSRF = me.csrf;
    S = { ...blank(), user: me.user, profile: me.profile || {} };
    await loadLive();
    showApp();
  }
  showAuth();
  if (/(^|\.)espinnovations\.com$/.test(location.hostname)) api('hit', { page: '/portal.html', ref: /espinnovations/.test(document.referrer) ? '' : document.referrer, new: /espinnovations/.test(document.referrer) ? '0' : '1' }).catch(() => {});
  boot().catch(err => { if (err.offline) $('#pp-offline').hidden = false; showAuth(); });
})();
