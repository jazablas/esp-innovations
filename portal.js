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
  const STEPS = ['Request sent', 'Quote sent', 'In production', 'Shipped', 'Delivered'];

  // ---------- State ----------
  const blank = () => ({ user: null, sample: false, profile: {}, orders: [], cart: [], pay: [] });
  let S;
  S = blank();
  const save = () => {}; // Preview: state is held in memory. A live portal saves to ESP's order system.

  const sampleData = () => ({
    user: { email: 'buyer@sample-company.example' }, sample: true,
    profile: { company: 'Sample Company (demo)', contact: 'Demo Buyer', email: 'buyer@sample-company.example', phone: '', ship: 'Sample Company Warehouse\n123 Example Way\nAnytown, USA', bill: 'Net terms per agreement. PO required on every order.' },
    orders: [
      { id: 'ESP-1063', date: '2026-10-22', status: 'Quote sent', po: 'PO-3318', pay: 'Visa •••• 4242', items: [
        { id: 'headphones', qty: 800, opt: 'Headphones + matching stand' },
        { id: 'svc-cert', qty: 1, note: 'FCC review and third-party lab testing before the holiday shipment.' }] },
      { id: 'ESP-1057', date: '2026-10-06', status: 'In production', po: 'PO-3290', pay: 'Invoice (net terms)', items: [
        { id: 'umbrella', qty: 1200, opt: 'Monsoon' },
        { id: 'vest', qty: 300, opt: '' }] },
      { id: 'ESP-1042', date: '2026-09-18', status: 'Delivered', po: 'PO-3204', pay: 'Invoice (net terms)', items: [
        { id: 'lighter', qty: 2000, opt: 'Flexible-neck candle / BBQ' },
        { id: 'mini330', qty: 500, opt: 'Light wood' }] },
      { id: 'ESP-0998', date: '2026-06-30', status: 'Delivered', po: 'PO-3011', pay: 'Visa •••• 4242', items: [
        { id: 'lighter', qty: 1500, opt: 'Pocket' },
        { id: 'umbrella', qty: 800, opt: 'Ripple Effect' }] },
    ],
    cart: [],
    pay: [
      { id: 'pm1', type: 'card', brand: 'Visa', last4: '4242', exp: '08/28', name: 'Demo Buyer', label: 'Purchasing card', isDefault: true, status: 'active' },
      { id: 'pm2', type: 'terms', terms: 'Net terms per agreement', ap: 'ap@sample-company.example', po: 'Yes', status: 'active' }
    ]
  });

  // ---------- Helpers ----------
  const toast = msg => { const t = $('#pp-toast'); t.innerHTML = esc(msg).replace(/\bESPi\b/g, '<span class="espi">ESP<span>i</span></span>'); t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); };
  const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const qtyLabel = it => byId(it.id)?.kind === 'services' ? 'Service' : Number(it.qty).toLocaleString('en-US') + ' units';
  const addToCart = (item, quiet) => {
    const c = byId(item.id); if (!c) return;
    const ex = S.cart.find(x => x.id === item.id && (x.opt || '') === (item.opt || '') && c.kind === 'goods');
    if (ex) ex.qty = Number(ex.qty) + Number(item.qty);
    else S.cart.push({ id: item.id, qty: c.kind === 'services' ? 1 : Math.max(1, Number(item.qty) || 1), opt: item.opt || '', note: item.note || '' });
    save(); renderCount(); if (!quiet) toast(c.name + ' added to your order request');
  };
  const thumb = c => c.kind === 'goods'
    ? `<img src="${c.img}" alt="" loading="lazy" width="96" height="72">`
    : `<span class="pp-letter" aria-hidden="true">${c.letter}</span>`;

  // ---------- Auth ----------
  function showAuth() {
    $('#pp-auth').hidden = false; $('#pp-app').hidden = true;
    $('#pp-signout').hidden = true; $('#pp-who').hidden = true;
  }
  function showApp() {
    $('#pp-auth').hidden = true; $('#pp-app').hidden = false;
    $('#pp-signout').hidden = false; const w = $('#pp-who'); w.hidden = false;
    w.textContent = S.profile.company || S.user.email;
    renderAll(); go(location.hash.replace('#', '') || 'overview', true);
  }
  $('#pp-signin').addEventListener('submit', e => {
    e.preventDefault();
    const em = $('#pp-email'), pw = $('#pp-pass'), st = $('#pp-signin .pc-status');
    const badE = !/^\S+@\S+\.\S+$/.test(em.value.trim()), badP = !pw.value;
    em.closest('.pfield').classList.toggle('err', badE); pw.closest('.pfield').classList.toggle('err', badP);
    if (badE || badP) { st.textContent = 'Please enter your business email and password.'; return; }
    const email = em.value.trim();
    if (!S.user || S.user.email !== email || S.sample) S = { ...blank(), user: { email }, profile: { email } };
    save(); showApp();
  });
  $('#pp-demo').addEventListener('click', () => { S = sampleData(); save(); showApp(); });
  $('#pp-signout').addEventListener('click', () => {
    if (S.sample) S = blank(); else S.user = null;
    save(); history.replaceState(null, '', 'portal.html'); showAuth();
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
    if (!noScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $$('.pp-tabs button').forEach(b => b.addEventListener('click', () => go(b.dataset.tab)));
  document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go); });

  // ---------- Renderers ----------
  function renderCount() { const n = S.cart.length; $('#pp-count').textContent = n; $('#pp-count').classList.toggle('has', n > 0); }

  function orderCard(o, compact) {
    const step = STEPS.indexOf(o.status);
    const items = o.items.map(it => { const c = byId(it.id); if (!c) return '';
      return `<li>${thumb(c)}<div><b>${esc(c.name)}</b><span>${esc(it.opt || (c.kind === 'services' ? c.tag : ''))}</span></div><em>${qtyLabel(it)}</em></li>`; }).join('');
    return `<article class="pp-order">
      <header><div><h3>${esc(o.id)}</h3><p>${fmtDate(o.date)}${o.po ? ' · ' + esc(o.po) : ''}${o.pay ? ' · ' + esc(o.pay) : ''}</p></div>
        <span class="pp-status s${step}">${esc(o.status)}</span></header>
      ${compact ? '' : `<ol class="pp-track" aria-label="Order progress">${STEPS.map((s, i) => `<li class="${i <= step ? 'done' : ''}">${s}</li>`).join('')}</ol>`}
      <ul class="pp-lines">${items}</ul>
      <footer><button type="button" class="btn pp-btn-sm" data-reorder-order="${esc(o.id)}">Reorder all</button></footer>
    </article>`;
  }

  function renderOverview() {
    $('#pp-hello').textContent = 'Hello, ' + (S.profile.contact || S.profile.company || 'there') + '.';
    $('#pp-sample-note').hidden = !S.sample;
    $('#st-open').textContent = S.orders.filter(o => o.status !== 'Delivered').length;
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
    [...S.orders].sort((a, b) => a.date.localeCompare(b.date)).forEach(o => o.items.forEach(it => {
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
        <span class="pp-prod" role="cell">${thumb(c)}<span><b>${esc(c.name)}</b><small>${esc(r.opt || c.tag)}${r.times > 1 ? ' · ordered ' + r.times + ' times' : ''}</small></span></span>
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
    toast('All items from ' + o.id + ' added. Review quantities before sending.');
    go('cart');
  });

  function renderCart() {
    const el = $('#pp-cart'), ck = $('#pp-checkout');
    if (!S.cart.length) {
      el.innerHTML = `<div class="pp-empty"><p>Your order request is empty.</p><div class="pp-empty-btns"><button type="button" class="btn" data-go="order">Place a new order</button><button type="button" class="btn pp-ghost" data-go="reorder">Reorder products</button></div></div>`;
      ck.hidden = true; return;
    }
    el.innerHTML = `<ul class="pp-cartlist">${S.cart.map((it, i) => { const c = byId(it.id); return `<li>
      ${thumb(c)}
      <div class="pp-cl-main"><b>${esc(c.name)}</b><span>${esc(it.opt || c.tag)}</span>${it.note ? `<p>${esc(it.note)}</p>` : ''}</div>
      ${c.kind === 'goods' ? `<label class="pp-cl-q"><span>Units</span><input type="number" min="1" value="${it.qty}" data-q="${i}" inputmode="numeric"></label>` : `<span class="pp-cl-q pp-svc-l">Service</span>`}
      <button type="button" class="pp-x" data-rm="${i}" aria-label="Remove ${esc(c.name)}">&times;</button>
    </li>`; }).join('')}</ul>`;
    ck.hidden = false;
    if (!$('#ck-ship').value) $('#ck-ship').value = S.profile.ship || '';
    renderPayPick();
    el.querySelectorAll('[data-q]').forEach(inp => inp.addEventListener('change', () => { S.cart[inp.dataset.q].qty = Math.max(1, Number(inp.value) || 1); inp.value = S.cart[inp.dataset.q].qty; save(); }));
    el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { S.cart.splice(Number(b.dataset.rm), 1); save(); renderCount(); renderCart(); }));
  }
  $('#pp-checkout').addEventListener('submit', e => {
    e.preventDefault(); if (!S.cart.length) return;
    const n = Math.max(1000, ...S.orders.map(o => parseInt(o.id.split('-')[1], 10) || 0)) + 1;
    const picked = $('#ck-pay input[name=ckpay]:checked');
    if (!picked) { toast('Choose a payment method first'); $('#ck-pay').scrollIntoView({ block: 'center' }); return; }
    const pm = S.pay.find(x => x.id === picked.value);
    const payText = pm ? payShort(pm) : 'To be chosen at quote approval';
    const order = { id: 'ESP-' + n, pay: payText, date: new Date().toISOString().slice(0, 10), status: 'Request sent',
      po: $('#ck-po').value.trim(), ship: $('#ck-ship').value.trim(), want: $('#ck-date').value, notes: $('#ck-notes').value.trim(),
      items: S.cart.map(x => ({ ...x })) };
    const lines = order.items.map(it => { const c = byId(it.id);
      return '- ' + c.name + (it.opt ? ' (' + it.opt + ')' : '') + ': ' + (c.kind === 'goods' ? it.qty + ' units' : 'service') + (it.note ? '\n  Brief: ' + it.note : ''); }).join('\n');
    const p = S.profile;
    const body = `Order request ${order.id}\n\nCompany: ${p.company || ''}\nContact: ${p.contact || ''}\nEmail: ${p.email || S.user.email}\nPhone: ${p.phone || ''}\nPO number: ${order.po}\nRequested delivery: ${order.want}\nPayment method: ${payText} (use only after quote approval)\n\nItems:\n${lines}\n\nShip to:\n${order.ship}\n\nNotes:\n${order.notes}`;
    S.orders.unshift(order); S.cart = []; save(); renderCount();
    $('#ck-po').value = ''; $('#ck-date').value = ''; $('#ck-notes').value = '';
    if (!S.sample) window.location.href = 'mailto:orders@espinnovations.com?subject=' + encodeURIComponent('Order request ' + order.id + ' from ' + (p.company || S.user.email)) + '&body=' + encodeURIComponent(body);
    toast(S.sample ? 'Sample order ' + order.id + ' saved. In a live account it goes straight to the ESPi team.' : 'Order request ' + order.id + ' saved. Your email app will open to send it.');
    go('history');
  });

  // Profile
  const PF = { company: 'pf-company', contact: 'pf-contact', email: 'pf-email', phone: 'pf-phone', ship: 'pf-ship', bill: 'pf-bill' };
  function renderProfile() { Object.entries(PF).forEach(([k, id]) => $('#' + id).value = S.profile[k] || ''); $('#pp-profile .pp-ok').textContent = ''; }
  $('#pp-profile').addEventListener('submit', e => {
    e.preventDefault();
    const co = $('#pf-company'), em = $('#pf-email');
    const badC = !co.value.trim(), badE = !/^\S+@\S+\.\S+$/.test(em.value.trim());
    co.closest('.pfield').classList.toggle('err', badC); em.closest('.pfield').classList.toggle('err', badE);
    if (badC || badE) { $('#pp-profile .pp-ok').textContent = 'Company name and a valid email are required.'; return; }
    Object.entries(PF).forEach(([k, id]) => S.profile[k] = $('#' + id).value.trim()); save();
    $('#pp-who').textContent = S.profile.company; $('#pp-profile .pp-ok').textContent = 'Profile saved.';
  });


  // ---------- Payment methods ----------
  // Preview: full card/bank numbers are validated, then discarded. Only type + last 4 are kept, in memory.
  // Live portal: fields are replaced by a PCI-compliant processor's hosted fields (e.g. Stripe Elements),
  // which return a token; ESP stores only the token, brand and last 4.
  const digits = v => String(v || '').replace(/\D/g, '');
  const luhn = n => { let sum = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return n.length >= 12 && sum % 10 === 0; };
  const brandOf = n => /^4/.test(n) ? 'Visa' : /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n) ? 'Mastercard' : /^3[47]/.test(n) ? 'American Express' : /^(6011|65|64[4-9])/.test(n) ? 'Discover' : '';
  const abaOk = r => { if (!/^\d{9}$/.test(r)) return false; const d = r.split('').map(Number); return (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0; };
  const payShort = p => p.type === 'card' ? `${p.brand} •••• ${p.last4}` : p.type === 'ach' ? `${p.bank} •••• ${p.last4} (ACH)` : p.type === 'terms' ? 'Invoice (net terms)' : 'Wire transfer';
  const payDetail = p => p.type === 'card' ? `Expires ${p.exp}${p.name ? ' · ' + p.name : ''}` : p.type === 'ach' ? `${p.acctType}${p.holder ? ' · ' + p.holder : ''}` : p.type === 'terms' ? `${p.terms}${p.ap ? ' · Invoices to ' + p.ap : ''}` : `Remittance contact: ${p.ap || ''}`;
  const payIcon = t => ({ card: '<svg viewBox="0 0 32 22" aria-hidden="true"><rect x="1" y="1" width="30" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 7h30" stroke="currentColor" stroke-width="3"/><path d="M5 15h8" stroke="currentColor" stroke-width="1.5"/></svg>',
    ach: '<svg viewBox="0 0 32 22" aria-hidden="true"><path d="M3 8 16 2l13 6M5 9v9m6-9v9m10-9v9m6-9v9M2 20h28" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    terms: '<svg viewBox="0 0 32 22" aria-hidden="true"><path d="M8 1h12l5 5v15H8z M20 1v5h5 M11 11h10 M11 15h10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    wire: '<svg viewBox="0 0 32 22" aria-hidden="true"><path d="M2 7h24l-5-5M30 15H6l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' }[t]);
  const usable = p => p.status === 'active';
  const ensureDefault = () => { if (!S.pay.some(p => p.isDefault && usable(p))) { S.pay.forEach(p => p.isDefault = false); const f = S.pay.find(usable); if (f) f.isDefault = true; } };
  const addPay = (p, makeDefault) => {
    p.id = 'pm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    if (makeDefault && usable(p)) S.pay.forEach(x => x.isDefault = false), p.isDefault = true;
    S.pay.push(p); ensureDefault(); save(); renderPay();
  };

  function renderPay() {
    const el = $('#pm-list');
    if (!S.pay.length) { el.innerHTML = `<div class="pp-empty"><p>No payment methods saved yet. Add a company card, bank account, net terms or wire transfer below.</p></div>`; return; }
    el.innerHTML = S.pay.map(p => `<article class="pm-item${p.isDefault ? ' is-default' : ''}">
      <span class="pm-ico">${payIcon(p.type)}</span>
      <div class="pm-main"><b>${esc(payShort(p))}${p.label ? ` <small>${esc(p.label)}</small>` : ''}</b><span>${esc(payDetail(p))}</span></div>
      <div class="pm-flags">${p.isDefault ? '<span class="pm-tag pm-def">Default</span>' : ''}${p.status === 'pending' ? '<span class="pm-tag pm-pend">Pending approval</span>' : ''}</div>
      <div class="pm-acts">${!p.isDefault && usable(p) ? `<button type="button" class="pm-link" data-pm-default="${p.id}">Make default</button>` : ''}<button type="button" class="pm-link pm-rm" data-pm-rm="${p.id}" aria-label="Remove ${esc(payShort(p))}">Remove</button></div>
    </article>`).join('');
  }
  $('#pm-list').addEventListener('click', e => {
    const d = e.target.closest('[data-pm-default]'), r = e.target.closest('[data-pm-rm]');
    if (d) { S.pay.forEach(p => p.isDefault = p.id === d.dataset.pmDefault); save(); renderPay(); toast('Default payment method updated'); }
    if (r) { const p = S.pay.find(x => x.id === r.dataset.pmRm); if (!p || !confirm('Remove ' + payShort(p) + ' from your account?')) return;
      S.pay = S.pay.filter(x => x.id !== p.id); ensureDefault(); save(); renderPay(); toast(payShort(p) + ' removed'); }
  });

  let pmType = 'card';
  $$('.pm-types button').forEach(b => b.addEventListener('click', () => {
    pmType = b.dataset.pmtype;
    $$('.pm-types button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('.pm-form').forEach(f => f.hidden = f.dataset.pmtype !== pmType);
  }));
  const flag = (inp, bad) => { inp.closest('.pfield, .pm-check').classList.toggle('err', bad); return bad; };
  const done = (f, msg) => { f.reset(); $$('.err', f).forEach(x => x.classList.remove('err')); f.querySelector('.pp-ok').textContent = ''; toast(msg); };

  // Card
  const ccNum = $('#cc-num');
  ccNum.addEventListener('input', () => {
    const d = digits(ccNum.value).slice(0, 19); const b = brandOf(d);
    ccNum.value = b === 'American Express' ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (m, a, b2, c) => [a, b2, c].filter(Boolean).join(' ')) : d.replace(/(\d{4})(?=\d)/g, '$1 ');
    $('#cc-brand').textContent = b;
  });
  $('#cc-exp').addEventListener('input', e => { const d = digits(e.target.value).slice(0, 4); e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; });
  $('#pm-card').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, st = f.querySelector('.pp-ok');
    const n = digits(ccNum.value), brand = brandOf(n), [mm, yy] = $('#cc-exp').value.split('/').map(Number), cvc = digits($('#cc-cvc').value), zip = $('#cc-zip').value.trim();
    const now = new Date(), expOk = mm >= 1 && mm <= 12 && yy >= 0 && new Date(2000 + yy, mm, 1) > now;
    const bad = [flag($('#cc-name'), !$('#cc-name').value.trim()), flag(ccNum, !luhn(n) || !brand), flag($('#cc-exp'), !expOk),
      flag($('#cc-cvc'), cvc.length !== (brand === 'American Express' ? 4 : 3)), flag($('#cc-zip'), !/^\d{5}(-?\d{4})?$/.test(zip))].some(Boolean);
    if (bad) { st.textContent = 'Please check the highlighted card details.'; return; }
    if (S.pay.some(p => p.type === 'card' && p.last4 === n.slice(-4) && p.brand === brand)) { st.textContent = 'This card is already saved.'; return; }
    addPay({ type: 'card', brand, last4: n.slice(-4), exp: $('#cc-exp').value, name: $('#cc-name').value.trim(), label: $('#cc-label').value.trim(), status: 'active' }, $('#cc-default').checked);
    $('#cc-brand').textContent = ''; done(f, brand + ' •••• ' + n.slice(-4) + ' saved');
  });
  // ACH
  $('#pm-ach').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, st = f.querySelector('.pp-ok');
    const r = digits($('#ach-routing').value), a = digits($('#ach-acct').value);
    const bad = [flag($('#ach-holder'), !$('#ach-holder').value.trim()), flag($('#ach-bank'), !$('#ach-bank').value.trim()),
      flag($('#ach-routing'), !abaOk(r)), flag($('#ach-acct'), a.length < 4 || a.length > 17), flag($('#ach-auth'), !$('#ach-auth').checked)].some(Boolean);
    if (bad) { st.textContent = !abaOk(r) && r.length === 9 ? 'That routing number isn’t valid. Please check it.' : 'Please check the highlighted fields and confirm the authorization.'; return; }
    addPay({ type: 'ach', bank: $('#ach-bank').value.trim(), holder: $('#ach-holder').value.trim(), acctType: $('#ach-type').value, last4: a.slice(-4), status: 'active' }, $('#ach-default').checked);
    done(f, 'Bank account •••• ' + a.slice(-4) + ' saved');
  });
  // Net terms
  $('#pm-terms').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, st = f.querySelector('.pp-ok'); const ap = $('#nt-ap').value.trim();
    if (flag($('#nt-ap'), !/^\S+@\S+\.\S+$/.test(ap))) { st.textContent = 'Enter your accounts payable email.'; return; }
    if (S.pay.some(p => p.type === 'terms')) { st.textContent = 'Your account already has a net terms request or approval.'; return; }
    addPay({ type: 'terms', terms: $('#nt-terms').value + ' requested', ap, po: $('#nt-po').value, tax: $('#nt-tax').value.trim(), status: S.sample ? 'active' : 'pending' });
    if (!S.sample) window.location.href = 'mailto:accounts@espinnovations.com?subject=' + encodeURIComponent('Net terms request from ' + (S.profile.company || S.user.email)) + '&body=' + encodeURIComponent(`Company: ${S.profile.company || ''}\nAccounts payable email: ${ap}\nTerms requested: ${$('#nt-terms').value}\nTax ID / EIN: ${$('#nt-tax').value.trim()}\nPO required on invoices: ${$('#nt-po').value}`);
    done(f, S.sample ? 'Sample net terms added' : 'Net terms requested. Our accounts team will confirm.');
  });
  // Wire
  $('#pm-wire').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, st = f.querySelector('.pp-ok'); const ap = $('#wr-ap').value.trim();
    if (flag($('#wr-ap'), !/^\S+@\S+\.\S+$/.test(ap))) { st.textContent = 'Enter a remittance contact email.'; return; }
    if (S.pay.some(p => p.type === 'wire')) { st.textContent = 'Wire transfer is already on your account.'; return; }
    addPay({ type: 'wire', ap, status: 'active' }, $('#wr-default').checked);
    done(f, 'Wire transfer saved');
  });

  function renderPayPick() {
    const el = $('#ck-pay'); const def = S.pay.find(p => p.isDefault && usable(p));
    const opts = S.pay.map(p => `<label class="pm-opt${usable(p) ? '' : ' is-off'}"><input type="radio" name="ckpay" value="${p.id}"${usable(p) ? '' : ' disabled'}${def && def.id === p.id ? ' checked' : ''}>
      <span class="pm-ico">${payIcon(p.type)}</span><span><b>${esc(payShort(p))}</b><small>${usable(p) ? esc(payDetail(p)) : 'Pending approval by our accounts team'}</small></span>${p.isDefault ? '<span class="pm-tag pm-def">Default</span>' : ''}</label>`).join('');
    el.innerHTML = opts + `<label class="pm-opt"><input type="radio" name="ckpay" value="later"${def ? '' : ' checked'}><span class="pm-ico">${payIcon('terms')}</span><span><b>Choose when I approve the quote</b><small>We&rsquo;ll ask for payment details with your quote</small></span></label>
      <button type="button" class="pm-link pm-add" data-go="payment">+ Add or manage payment methods</button>`;
  }

  function renderAll() { renderCount(); renderCatalog(); renderProfile(); renderOverview(); renderPay(); }

  if (S.user) showApp(); else showAuth();
})();
