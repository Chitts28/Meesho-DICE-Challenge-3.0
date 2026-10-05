/* ================= LIVE DEMO · one order, every side =================
   Same logic as the deck: Commit-to-COD (P1 door refusal + P2 refused parcel's trip back)
   and Sure-Meet (P4 genuine unreachability + P3 fake attempts). One shared order object moves
   through Priya's phone, Ramesh's rider app, the hub tablet, the Valmo Point shop and a nearby buyer. */

const WHO = {
  cust: ["Priya's phone", 'Customer'], arjun: ["Arjun's phone", 'Customer'], rider: ["Ramesh's rider app", 'Valmo rider'],
  hub: ['LMDC Kanpur-04 tablet', 'Valmo hub'], shop: ['Sharma General Store app', 'Valmo Point'],
  backup: ["Sunita's phone", 'Backup receiver'], buyer: ["Neha's phone, 1 km away", 'Nearby buyer'], sys: ['Meesho + Valmo', 'System'],
};
const NODES = ['Seller', 'Sort hubs', 'LMDC Kanpur-04', 'Out for delivery', 'At the door'];
const LEAKS = ['COD checkout', 'Wrong hub', 'Unclear address', 'Unreachable', 'Fake attempts', 'Door refusal', 'Back to seller'];

const STORY = {
  refuser: { n: 1, title: 'Priya, a repeat refuser', sol: 'Commit-to-COD', solK: 's1', prob: 'P1 Door refusal · P2 Back to seller', len: '3 min',
    blurb: 'She has refused 2 COD parcels. Watch the warning, the ₹70 advance, the 8 am choice, and what happens to the parcel if she still refuses.',
    init: { buyer: 'Priya', flagged: true }, start: 'r_warn' },
  normal: { n: 2, title: 'Arjun, a normal COD buyer', sol: 'Commit-to-COD', solK: 's1', prob: 'Guardrail: no friction for 82%', len: '1 min',
    blurb: 'No refusals on record. Proof that a normal buyer pays nothing extra and only sees one helpful morning card.',
    init: { buyer: 'Arjun', flagged: false }, start: 'n_pay' },
  away: { n: 3, title: "Priya won't be home", sol: 'Sure-Meet', solK: 's2', prob: 'P4 Genuine unreachability', len: '2 min',
    blurb: 'She is at work 2–5 pm. Watch her choose a trusted neighbour or a Valmo Point before the rider even leaves.',
    init: { buyer: 'Priya', flagged: false }, start: 'a_addr' },
  ghost: { n: 4, title: 'Nobody answers the door', sol: 'Sure-Meet', solK: 's2', prob: 'P3 Fake attempts · P4 Unreachable', len: '2 min',
    blurb: 'Is the rider honest or skipping? Play both. "Not reachable" only unlocks once the visit is proven.',
    init: { buyer: 'Priya', flagged: false }, start: 'g_door' },
};

const newOrder = o => Object.assign({ id: 'MS-90214', price: 349, adv: 0, pay: 'COD', slot: '2–5 pm', plan: null, backup: null, node: 0,
  clock: 'Thu 10:02', ev: [], leaks: [], end: null, reason: null, photo: false, seal: true, dispute: false }, o);

const L = {
  story: null, scene: null, O: null, tour: true, played: [],
  start(k) { L.story = k; L.O = newOrder(STORY[k].init); L.go(STORY[k].start); scrollTo(0, 0); },
  go(id) { clearT(); L.scene = id; const sc = LS[id]; if (sc.clock) L.O.clock = sc.clock; if (sc.node != null) L.O.node = sc.node; if (sc.enter) sc.enter(L.O); render(); },
  do(a, arg) { const r = LA[a](L.O, arg); if (r) L.go(r); else render(); },
  set(k, v) { L.O[k] = v; render(); },
  ev(who, txt, leak) { L.O.ev.unshift({ t: L.O.clock, who, txt }); if (leak && !L.O.leaks.includes(leak)) L.O.leaks.push(leak); },
  finish(kind) { L.O.end = kind; if (!['resold', 'cancelResold', 'unsold', 'sellerFault'].includes(kind)) L.O.node = 4; if (!L.played.find(p => p.story === L.story && p.kind === kind)) L.played.push({ story: L.story, kind }); L.go('end'); },
  tourT() { L.tour = !L.tour; render(); },
  menu() { L.story = null; render(); scrollTo(0, 0); },
};
window.L = L;

/* ---------- live phone helpers ---------- */
const b = (label, act, cls = 'o', hl = '') => `<button class="btn ${cls}" ${hl ? `data-hl="${hl}"` : ''} onclick="${act}">${label}</button>`;
const qrL = arr => `<div class="qr">${arr.map(([l, act, hl]) => `<button ${hl ? `data-hl="${hl}"` : ''} onclick="${act}">↩ ${l}</button>`).join('')}</div>`;
const ff = (label, act, hl = 'ff') => `<div class="demo-k">Time skip</div><button class="btn demo" data-hl="${hl}" onclick="${act}">⏩ ${label}</button>`;
const riderHead = (t, sub) => appHead(t, sub || 'Ramesh · Kanpur-04', true);
const hubHead = sub => `${sb()}<div class="ab"><div class="av v">V</div><div class="t">LMDC Kanpur-04<small>${sub}</small></div></div>`;
const shopHead = () => `${sb()}<div class="ab"><div class="av v">V</div><div class="t">Valmo Point · Sharma Store<small>वाल्मो पॉइंट · Kalyanpur</small></div></div>`;
const dueL = O => O.pay === 'UPI' ? 0 : O.price - O.adv;

/* ---------- outcomes: cost of this one parcel to Valmo, today vs with our fix (deck unit economics) ---------- */
const OUT = {
  accepted: { t: 'Delivered · refusal prevented', sol: 'S1', today: [['Forward', 50], ['Reverse trip (if she refused, as before)', 120]], now: [['Forward', 50]],
    line: 'A repeat refuser committed ₹70 up front and accepted the parcel. The ₹120 trip back never happens.' },
  resold: { t: 'Refused, then resold 1 km away', sol: 'S1', today: [['Forward', 50], ['Reverse trip, 7 nodes', 120]], now: [['Forward', 50], ['20% off for the buyer', 32], ['New last mile', 21], ['Hub fee', 7]],
    line: 'The seller is paid in full, Neha gets a deal, and the parcel never rides back. Net ~₹60 better than today.' },
  cancelResold: { t: 'Cancelled at 8 am, resold locally', sol: 'S1', today: [['Forward', 50], ['Reverse trip after a 4 pm refusal', 120]], now: [['Forward', 50], ['20% off for the buyer', 32], ['New last mile', 21], ['Hub fee', 7]],
    line: 'Cancelling at 8 am cost Priya ₹0 and kept the parcel at the hub, where it went straight into the resale pool.' },
  unsold: { t: 'Not sold in 48 h → back to seller', sol: 'S1', today: [['Forward', 50], ['Reverse trip', 120]], now: [['Forward', 50], ['Reverse trip', 120]],
    line: 'Same as today, but only after a 48 h local try. The ₹70 advance stays with Valmo and covers part of the trip.' },
  sellerFault: { t: 'Wrong / damaged item → seller fault', sol: 'S1', today: [['Forward', 50], ['Reverse trip', 120]], now: [['Forward', 50], ['Reverse trip (charged as seller fault)', 120]],
    line: 'Not counted against Priya. Wrong or damaged items never feed the flag, and the advance is refunded.' },
  normal: { t: 'Delivered · nothing changed for Arjun', sol: 'S1', today: [['Forward', 50]], now: [['Forward', 50]],
    line: 'No advance, no warning, no new fee. A normal buyer only ever sees the day-of card. That is the guardrail.' },
  backup: { t: 'Handed to Sunita with code 7316', sol: 'S2', today: [['Forward', 50], ['Reverse trip after 3 failed tries', 120]], now: [['Forward', 50]],
    line: 'Priya chose before the rider left. Prepaid + a code means no cash disputes and no fake "not received".' },
  point: { t: 'Collected at the Valmo Point', sol: 'S2', today: [['Forward', 50], ['Reverse trip after 3 failed tries', 120]], now: [['Forward', 50], ['Shop fee', 12]],
    line: 'A shop 600 m away held the parcel. Valmo pays ₹12 instead of ₹120.' },
  pointAfterFail: { t: 'Verified fail → collected at the Valmo Point', sol: 'S2', today: [['Forward', 50], ['Reverse trip after 3 failed tries', 120]], now: [['Forward', 50], ['Verified-attempt fee to rider', 3], ['Shop fee', 12]],
    line: 'The rider proved the visit and was paid ₹3. Priya picked the parcel up on her way home.' },
  retry: { t: 'Delivered on the retry', sol: 'S2', today: [['Forward', 50], ['Reverse trip after 3 failed tries', 120]], now: [['Forward', 50], ['Verified-attempt fee to rider', 3]],
    line: 'One proven miss, one planned retry, delivered. Nobody was marked "unavailable" without proof.' },
  resched: { t: 'Delivered on the day she chose', sol: 'S2', today: [['Forward', 50], ['Reverse trip after 3 failed tries', 120]], now: [['Forward', 50]],
    line: 'The rider never made a wasted trip: the day changed before dispatch.' },
  fakeCaught: { t: 'Fake attempt caught → delivered', sol: 'S2', today: [['Forward', 50], ['Reverse trip ("customer unavailable")', 120]], now: [['Forward', 50]],
    line: 'Today this parcel is marked "unavailable" and rides back. The gate refused the skip, re-queued it, and Priya got it the same evening.' },
  home: { t: 'Delivered · Priya was home', sol: 'S2', today: [['Forward', 50]], now: [['Forward', 50]],
    line: 'The verified "Valmo Delivery" call got answered. Nothing extra for anyone.' },
};
const sum = a => a.reduce((s, [, v]) => s + v, 0);

/* ================= SCENES ================= */
const LS = {
 /* ---------- Story 1 · repeat refuser ---------- */
 r_warn: { a: 'cust', clock: 'Thu 10:02', node: 0, pk: ['s1', 'c1'], hl: 'got', tip: 'Priya has 2 verified refusals. Before any charge, she gets a warning. Tap <b>Got it</b> (or try Dispute / Switch to prepaid).',
   enter: O => L.ev('sys', '2nd verified refusal → early warning on WhatsApp. No charge yet.', 6),
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px">${msg('Hi Priya, your last <b>2 COD orders</b> were returned at the door.<br><br>One more refusal and Cash on Delivery will need a <b>small advance (20%, max ₹100)</b>, part of the price, not a fee.<br><br>Not right? You can dispute it.', '10:02 am')}</div>
   ${qrL([['Got it', "L.do('warnOk')", 'got'], ['Dispute a refusal', "L.do('warnDispute')"], ['Switch to prepaid', "L.do('warnPrepaid')"]])}</div>` },
 r_shop: { a: 'cust', clock: 'Wed 9:15', node: 0, pk: ['s1', 'c2'], hl: 'buy', tip: 'A week later Priya shops again. Tap <b>Buy now</b>.',
   h: O => `${appHead('Meesho', 'Kurtis · Under ₹499')}<div class="body"><img src="img/kurti.png" style="display:block;margin:0 auto;width:150px" alt="Kurti">
   <b style="font-size:16px">Pink printed rayon kurti</b><div class="row"><span class="big">₹349</span><span class="pill g">Free delivery</span></div>
   <div class="small">Size M selected · ★ 4.1 (2,318)</div><div class="chips" style="margin:8px 0"><span class="chip">S</span><span class="chip on">M</span><span class="chip">L</span><span class="chip">XL</span></div>
   ${b('Buy now', "L.go('r_pay')", 'o', 'buy')}</div>` },
 r_pay: { a: 'cust', clock: 'Wed 9:16', node: 0, pk: ['s1', 'c2'], hl: 'upi', tip: 'Because she is flagged, COD now needs <b>₹70 up front</b>, deducted from the ₹349. Tap <b>Pay ₹70 by UPI</b>. Family pay-link and cash at a Valmo Point also work.',
   h: O => O.pay === 'UPI' ? `${appHead('Payment', 'Step 3 of 3')}<div class="body"><div class="card">${prod()}</div><div class="card" style="background:var(--greenL)"><b>UPI</b> · your default since you switched. Prepaid orders never need an advance.</div>
     ${b('Pay ₹349 by UPI', "L.do('payFull')", 'o', 'upi')}</div>` :
   `${appHead('Payment', 'Step 3 of 3')}<div class="body"><div class="card">${prod()}</div>
   <div class="card new" style="background:var(--orgL)"><b style="color:var(--plum)">Cash on Delivery needs a small advance on your account</b>
    <div class="row b"><span>Pay now (20%)</span><span class="v">₹70</span></div><div class="row"><span>Pay at delivery</span><span class="v">₹279</span></div><div class="small">Total stays ₹349. No extra fee.</div></div>
   ${b('Pay ₹70 by UPI', "L.do('payAdv','UPI')", 'o', 'upi')}${b('Send payment link to family', "L.do('payAdv','family link')", 'ln')}${b('Pay cash at a Valmo Point', "L.do('payAdv','cash at Valmo Point')", 'ln')}
   <div class="small" style="margin-top:6px">Fully refunded if you cancel before dispatch, or the item is wrong, damaged or late.</div></div>` },
 r_placed: { a: 'cust', clock: 'Wed 9:17', node: 0, pk: ['s1', 'c2'], hl: 'ff', tip: 'Order placed. Skip ahead to the delivery morning.',
   h: O => `${appHead('Order placed', 'Meesho')}<div class="body"><div class="done"><div class="ok">✓</div><b>${O.pay === 'UPI' ? '₹349 paid by UPI' : '₹70 paid · ₹279 at delivery'}</b><div class="small">Order #${O.id} · arrives Sat</div></div><div class="card">${prod()}</div>
   ${ff('Seller ships → parcel reaches LMDC Kanpur-04 (Sat 8 am)', "L.do('ship','r_day')")}</div>` },
 r_day: { a: 'cust', clock: 'Sat 8:05', node: 2, pk: ['s1', 'c3'], hl: 'keep', tip: 'Delivery morning. Priya can still back out for free. Tap <b>Keep it</b>, or try <b>Cancel</b> to see the ₹0 path.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px">${msg(`<b>Your order arrives today, ${O.slot}</b><br>Kurti, size M<br>${O.pay === 'UPI' ? 'Already paid. Just be there.' : `₹${dueL(O)} to pay in cash${O.adv ? ' (₹70 already paid)' : ''}`}<br><br>आज ${O.slot} आएगा`)}</div>
   ${qrL([['Keep it', "L.do('keep')", 'keep'], ['Change time', "L.go('r_time')"], ['Cancel order', "L.do('cancel')"]])}
   ${msg("Cancel now? <b>You won't be charged.</b> Cancelling at the door may count as a refusal.")}</div>` },
 r_time: { a: 'cust', clock: 'Sat 8:06', node: 2, pk: ['s1', 'c3'], hl: 'slot', tip: 'Same rider, no charge. Pick a slot.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('Pick a new time. Same rider, no charge.')}
   <div class="slot">${['Today 5–8 pm', 'Tomorrow 10–1', 'Tomorrow 2–5 pm'].map((s, i) => `<button class="chip" ${i == 0 ? 'data-hl="slot"' : ''} onclick="L.do('slot','${s}')">${s}</button>`).join('')}</div></div>` },
 r_kept: { a: 'cust', clock: 'Sat 8:06', node: 2, pk: ['s1', 'c3'], hl: 'refuse', tip: 'The rider arrives. What does Priya do? Play <b>refuses</b> first to see the parcel resold; replay to see her accept.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg(`<b>Your order arrives today, ${O.slot}</b>`)}${out('Keep it')}${msg(`Great. Ramesh will bring it ${O.slot}. ${O.pay === 'UPI' ? 'Already paid.' : `Keep ₹${dueL(O)} ready, or pay by UPI at the door.`}`, '8:06 am')}
   ${ff('Rider reaches the door · Priya refuses', "L.do('door','refuse')", 'refuse')}<button class="btn demo" onclick="L.do('door','accept')">⏩ Rider reaches the door · Priya accepts</button></div>` },
 r_door: { a: 'rider', clock: 'Sat 3:38', node: 4, pk: ['s1', 'r1'], hl: 'act', tip: O => O.intent === 'refuse' ? 'Ramesh is at the door. Priya says she doesn\'t want it. Tap <b>Customer refused</b>.' : 'Priya takes it. Ramesh collects only ₹279. Tap <b>Delivered</b>.',
   h: O => `${riderHead('Valmo Rider · Stop 14 / 52')}<div class="body"><div class="row"><span>${O.buyer} · Kurti M</span><span class="pill o">${O.pay === 'UPI' ? 'PREPAID' : 'COD'}</span></div>
   <div class="card new ctr"><div class="big">${O.pay === 'UPI' ? 'Collect ₹0' : `Collect ₹${dueL(O)}`}</div><div class="small">${O.adv ? '₹70 already prepaid by the buyer' : O.pay === 'UPI' ? 'Prepaid order' : 'Cash on delivery'}</div></div>
   ${ck('Call 1 placed · verified caller ID', 'ok')}${ck('Buyer at the door', 'ok')}
   ${b('Delivered', "L.do('delivered')", 'g', O.intent === 'accept' ? 'act' : '')}${b('Customer refused', "L.go('r_reason')", 'rd', O.intent === 'refuse' ? 'act' : '')}</div>` },
 r_reason: { a: 'rider', clock: 'Sat 3:41', node: 4, pk: ['s1', 'r2'], hl: O => !O.reason ? 'reason' : !O.photo ? 'photo' : 'submit', tip: O => !O.reason ? 'Pick the reason Priya gave: <b>Changed mind</b>. (Wrong item / Damaged never count against her.)' : !O.photo ? 'Proof is required: <b>take the photo</b> at the door.' : 'Now <b>Submit refusal</b>.',
   h: O => { const free = O.reason === 'Wrong item' || O.reason === 'Damaged'; return `${riderHead('Why was it refused?', 'Stop 14 · ' + O.buyer)}<div class="body">
   <div class="chips new" style="padding:6px">${['Changed mind', 'No cash', 'Ordered elsewhere', 'Wrong item', 'Damaged', 'Other'].map(c => `<button class="chip ${O.reason === c ? 'on' : ''}" ${c === 'Changed mind' ? 'data-hl="reason"' : ''} onclick="L.set('reason','${c}')">${c}</button>`).join('')}</div>
   ${free ? `<div class="card" style="background:var(--greenL);margin-top:8px"><b>Won't count against the customer.</b><div class="small">Goes back as a seller fault.</div></div>` : ''}
   ${O.photo ? `<img src="img/door.png" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-top:8px" alt="">${ck('Photo saved with time + location', 'ok')}` : b('Take photo of parcel at door', "L.set('photo',true)", 'pl', 'photo')}
   ${b('Submit refusal', "L.do('submitRefusal')", 'o', 'submit').replace('<button', O.reason && O.photo ? '<button' : '<button disabled')}</div>`; } },
 r_refused: { a: 'cust', clock: 'Sat 3:43', node: 4, pk: ['s1', 'c4'], hl: 'right', tip: 'Priya sees exactly what was recorded, with the photo. Tap <b>This is right</b>, or try the dispute.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px"><div class="msg"><img src="img/door.png" style="width:100%;height:110px;object-fit:cover;border-radius:6px" alt=""><b>Order marked as refused</b><br>at 3:42 pm by rider Ramesh, at your address. Reason: ${O.reason}.<div class="tm">3:43 pm</div></div></div>
   ${O.dispute ? out("I didn't refuse: dispute", '3:50 pm') + msg('Dispute opened. Photo, GPS and call log checked within 24 h. It does not count while we check; if upheld, ₹70 is refunded.', '3:50 pm') + ff('Meanwhile the parcel returns to the LMDC', "L.go('h_check')") :
   qrL([['This is right', "L.do('refAccept')", 'right'], ["I didn't refuse: dispute", "L.do('refDispute')"]]) + msg('You have <b>48 hours</b> to dispute.', '3:43 pm')}</div>` },
 h_check: { a: 'hub', clock: 'Sat 6:20', node: 2, pk: ['s1', 'h1'], hl: 'pool', tip: 'Back at the hub. Instead of the reverse bag: seal + weight check. Tap <b>Resale pool</b>, or mark the seal torn to see the normal return.',
   h: O => `${hubHead('Refused parcels · today 11')}<div class="body">
   <div class="card"><div class="prod"><img src="img/parcel.png" alt=""><div><b>#VAL-48213 · Kurti M</b><div class="small">${O.cancelled ? 'Cancelled 8:07 am, never left the hub' : 'Refused 3:42 pm · Ramesh · photo ✓'}</div></div></div></div>
   <div class="small">Seal check</div><div class="chips" style="margin:4px 0 6px"><button class="chip ${O.seal ? 'on' : ''}" onclick="L.set('seal',true)">Seal intact</button><button class="chip ${O.seal ? '' : 'on'}" onclick="L.set('seal',false)">Torn / tampered</button></div>
   ${ck('Weight 412 g vs 410 g on manifest', 'ok')}${ck('Seal intact', O.seal ? 'ok' : 'no')}
   ${O.seal ? b('→ Resale pool (48 h) · hub earns ₹7 if sold', "L.do('pool')", 'o new', 'pool') : b('Send back to seller (normal return)', "L.do('sealFail')", 'ln')}</div>` },
 b_push: { a: 'buyer', clock: 'Sat 6:30', node: 2, pk: ['s1', 'b1'], hl: 'notif', tip: 'Neha viewed this exact kurti in size M last week and lives in the hub\'s pincodes. <b>Tap the notification.</b> (Priya\'s phone, device and address are blocked from it.)',
   h: O => `${sb('k')}<div class="lock"><div class="clk">6:30</div><div>Saturday, 3 October</div>
   <div class="notif new" data-hl="notif" onclick="L.go('b_sheet')"><div class="small">m Meesho · now</div><div class="prod"><div style="flex:1"><b>The kurti you saved is near you, 20% off</b><div class="small">Sealed · size M · delivered tomorrow</div></div><img src="img/kurti.png" alt=""></div></div>
   <div class="small" style="color:#ddd;margin-top:auto;margin-bottom:24px">Tap the notification</div></div>` },
 b_sheet: { a: 'buyer', clock: 'Sat 6:31', node: 2, pk: ['s1', 'b2'], hl: 'buy2', tip: 'Sealed, 20% off, prepaid, next-day, normal returns. Tap <b>Buy for ₹279</b>, or let the 48 h run out.',
   h: O => `${appHead('Meesho · Home')}<div class="body" style="background:#f3eef2;position:relative;padding:0">
   <div class="sheet" style="position:static;border-radius:0;box-shadow:none;animation:none"><div class="pill o new" style="display:block;text-align:center">Near you · delivering tomorrow</div>
    <div class="prod" style="margin:10px 0"><img src="img/kurti.png" alt=""><div><b>Kurti, size M</b><div><b style="font-size:18px;color:var(--plum)">₹279</b> <s class="small">₹349</s></div><div class="small" style="color:var(--green);font-weight:600">20% off · 1 left</div></div></div>
    <div class="chips"><span class="pill g">Sealed, never delivered</span><span class="pill">Prepaid only</span><span class="pill">Normal returns</span></div>
    <div class="small ctr" style="margin-top:10px">Offer ends in <b id="cd" style="color:var(--red)">47:59:12</b></div>
    ${b('Buy for ₹279', "L.do('buyResale')", 'o', 'buy2')}<button class="btn demo" onclick="L.do('noBuy')">⏩ Nobody buys in 48 h</button>
    <div class="small ctr" style="margin-top:6px">Why you're seeing this: you viewed this item in size M on 26 Sep</div></div></div>`,
   m: () => { let s = 47 * 3600 + 59 * 60 + 12; T.push(setInterval(() => { s--; const e = $('#cd'); if (e) e.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000)); } },
 r_receipt: { a: 'cust', clock: 'Sat 3:40', node: 4, pk: ['s1', 'c5'], hl: 'fin', tip: 'Priya sees she paid nothing extra, and how to clear the flag. Tap <b>See the outcome</b>.',
   h: O => `${appHead('Order delivered', 'Meesho')}<div class="body"><div class="ctr" style="color:var(--green);font-weight:700;font-size:18px">Delivered</div><img src="img/kurti.png" style="display:block;margin:0 auto 8px;width:80px" alt="">
   ${O.pay === 'UPI' ? `<div class="row b"><span>Paid by UPI</span><span class="v">₹349</span></div>` : `<div class="row b"><span>Cash paid</span><span class="v">₹279</span></div><div class="row b"><span>Advance</span><span class="v">₹70</span></div><div class="row"><span>Total</span><span class="v">₹349</span></div>
   <div class="card new" style="background:var(--greenL)"><b>Nothing extra.</b> The advance was part of the price.</div>`}
   <div class="new" style="padding:8px"><div class="small"><b>2 more</b> accepted deliveries and the flag goes away</div><div class="bar"><i style="width:33%"></i></div></div>
   ${b('See the outcome →', "L.finish('accepted')", 'pl', 'fin')}</div>` },

 /* ---------- Story 2 · normal buyer ---------- */
 n_pay: { a: 'arjun', clock: 'Wed 9:16', node: 0, pk: ['s1', 'c2n'], hl: 'place', tip: 'Arjun has never refused. His checkout is <b>exactly</b> today\'s. Tap <b>Place order</b>.',
   h: O => `${appHead('Payment', 'Step 3 of 3')}<div class="body"><div class="card">${prod()}</div>
   <div class="card"><div class="row"><span><b>Cash on Delivery</b><div class="small">Pay ₹349 when it arrives</div></span><span class="pill g">Selected</span></div></div>
   <div class="card"><div class="row"><span><b>UPI</b><div class="small">PhonePe, GPay, Paytm</div></span></div></div>
   ${b('Place order · ₹349', "L.do('nPlace')", 'o', 'place')}<div class="small ctr" style="margin-top:8px">No advance, no warning.</div></div>` },
 n_day: { a: 'arjun', clock: 'Sat 8:05', node: 2, pk: ['s1', 'c3'], hl: 'keep', tip: 'The one new thing a normal buyer sees: the day-of card. Tap <b>Keep it</b>.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div><div class="new" style="margin-bottom:10px">${msg('<b>Your order arrives today, 2–5 pm</b><br>Kurti, size M<br>₹349 to pay in cash<br><br>आज 2–5 बजे आएगा · ₹349 नकद')}</div>
   ${qrL([['Keep it', "L.do('nKeep')", 'keep'], ['Change time', "A.toast('Same rider, new slot, no charge.')"], ['Cancel order', "A.toast('Cancelling now costs ₹0 and is not a refusal.')"]])}</div>` },
 n_door: { a: 'rider', clock: 'Sat 3:30', node: 4, pk: ['s1', 'r1'], hl: 'del', tip: 'Ramesh collects ₹349 as usual. Tap <b>Delivered</b>.',
   h: O => `${riderHead('Valmo Rider · Stop 9 / 52')}<div class="body"><div class="row"><span>Arjun · Kurti M</span><span class="pill o">COD</span></div><div class="card ctr"><div class="big">Collect ₹349</div></div>
   ${ck('Call 1 placed · verified caller ID', 'ok')}${b('Delivered', "L.do('nDel')", 'g', 'del')}${b('Customer refused', "A.toast('In this story Arjun takes it. Play Priya\\'s story to see a refusal.')", 'rd')}</div>` },

 /* ---------- Story 3 · won't be home ---------- */
 a_addr: { a: 'cust', clock: 'Wed 9:15', node: 0, pk: ['s2', 'c1'], hl: 'save', tip: 'Optional, set once: Priya names her neighbour Sunita as a backup. Tap <b>Save & continue</b>.',
   h: O => `${appHead('Checkout · Address', 'Step 2 of 3')}<div class="body"><div class="row"><span class="small">Deliver to</span><b>Priya, Kanpur</b></div><div class="small" style="margin-bottom:8px">H-12, Shastri Nagar, near Hanuman Mandir</div>
   <div class="card new" style="background:var(--orgL)"><b style="color:var(--plum)">+ Add someone who can receive for you</b> <span class="small">(optional)</span>
   <label class="fl">Name</label><input class="f" value="Sunita"><label class="fl">Phone</label><input class="f" value="98•• ••410"><div class="chips"><span class="chip on">Neighbour</span><span class="chip">Family</span><span class="chip">Guard</span></div>
   <div class="small" style="margin-top:6px">Must be within 3 km. We'll ask them to confirm.</div></div>
   ${b('Save & continue', "L.do('saveBackup')", 'o', 'save')}${b('Skip', "L.do('skipBackup')", 'ln')}</div>` },
 a_consent: { a: 'backup', clock: 'Wed 9:16', node: 0, pk: ['s2', 's1'], hl: 'ok', tip: 'Sunita is asked first (DPDP: consent, purpose, deletion). Tap <b>OK</b>, or STOP to see the option disappear.',
   h: O => `${sb()}<div class="ab" style="background:#3c3c3c"><div class="av">M</div><div class="t">VM-MEESHO<small>SMS</small></div></div><div class="body" style="background:#f2f2f2"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px">${msg('<b>Priya</b> named you to receive her Meesho parcels when she is out. She will share a code each time.<br><br>Reply <b>STOP</b> to decline.', '9:16 am')}</div>
   <div class="chips"><button class="chip" data-hl="ok" onclick="L.do('consent',1)">OK, happy to help</button><button class="chip" onclick="L.do('consent',0)">STOP</button></div></div>` },
 a_morning: { a: 'cust', clock: 'Sat 8:05', node: 2, pk: ['s2', 'c2'], hl: O => O.backup ? 'trust' : 'point', tip: O => `Priya will be at work 2–5 pm. She decides <b>before the rider leaves</b>. Tap <b>${O.backup ? 'Leave with someone I trust' : 'Collect from a Valmo Point'}</b>, or explore the others.`,
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg("<b>Arriving today, 2–5 pm</b><br>Rider: Ramesh · ₹349 COD<br><br><b>Won't be home?</b> घर पर नहीं होंगे?")}
   ${qrL([["I'll be home", "L.go('g_door')"], ...(O.backup ? [['Leave with someone I trust', "L.go('a_backup')", 'trust']] : []), ['Collect from a Valmo Point', "L.go('a_point')", 'point'], ['Change day', "L.go('a_day')"]])}
   ${O.backup ? '' : msg('<span class="small">"Leave with someone" is hidden: no consenting backup on file.</span>')}</div>` },
 a_backup: { a: 'cust', clock: 'Sat 8:06', node: 2, pk: ['s2', 'c3'], hl: O => O.pay === 'UPI' ? 'share' : 'pay', tip: O => O.pay === 'UPI' ? 'Share the code with Sunita. Tap <b>Share code</b>.' : 'A backup can only receive <b>prepaid</b> parcels, so Sunita never handles cash. Tap <b>Pay ₹349</b>.',
   h: O => `${appHead('Leave with someone', 'Order #' + O.id)}<div class="body"><div class="row b"><span><b>Leave with Sunita</b><div class="small">Neighbour · consented</div></span><span class="v">120 m away</span></div>
   ${O.pay === 'UPI' ? `<div class="card ctr" style="margin-top:10px"><div class="small">Share this code with Sunita</div><div class="big" style="letter-spacing:8px;font-size:32px">7316</div><div class="small">She shows it to the rider. No code = not delivered.</div></div>${b('Share code 7316 with Sunita', "L.do('shareCode')", 'o new', 'share')}` :
   `<div class="card new" style="background:var(--orgL);margin-top:10px">This order is COD. <b>Pay ₹349 online</b> to hand it to someone else.</div>${b('Pay ₹349 & confirm', "L.do('prepay')", 'o', 'pay')}`}</div>` },
 a_point: { a: 'cust', clock: 'Sat 8:06', node: 2, pk: ['s2', 'c4'], hl: 'choose', tip: 'A partner shop 600 m away holds it for 5 days. Tap <b>Choose this</b>.',
   h: O => `${appHead('Collect from a Valmo Point', 'Order #' + O.id)}<div class="body"><div class="map new"><div class="ring" style="left:40%;top:30%;width:90px;height:90px"></div><div class="pin" style="left:58%;top:22%"></div><div class="lb" style="left:52%;top:6%">Sharma General Store</div><div class="lb" style="left:8%;top:78%;background:var(--plumL)">You · H-12</div></div>
   <div class="row b"><span>Distance</span><span class="v">600 m</span></div><div class="row b"><span>Open</span><span class="v">9 am – 9 pm</span></div><div class="row b"><span>Holds your parcel</span><span class="v">5 days</span></div>
   ${b('Choose this', "L.do('choosePoint')", 'o', 'choose')}</div>` },
 a_pointok: { a: 'cust', clock: 'Sat 8:07', node: 2, pk: ['s2', 'c4'], hl: 'ff', tip: 'Priya has her pickup code. Skip to the rider dropping it at the shop.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${out('Collect from a Valmo Point')}${msg('Done. Your parcel will be at <b>Sharma General Store</b> (600 m) from 1 pm today, held for 5 days.<br><br>Your pickup code: <b style="font-size:18px;letter-spacing:3px">4821</b>', '8:07 am')}
   ${ff('Ramesh drops it at the shop on his route', "L.go('s_drop')")}</div>` },
 a_day: { a: 'cust', clock: 'Sat 8:06', node: 2, pk: ['s2', 'c2'], hl: 'd1', tip: 'The day moves before dispatch, so no wasted trip. Pick a day.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${out('Change day')}${msg('Pick another day. Same rider, no charge.')}
   <div class="slot">${['Sun 10–1', 'Sun 5–8 pm', 'Mon 10–1', 'Mon 5–8 pm'].map((s, i) => `<button class="chip" ${i == 1 ? 'data-hl="d1"' : ''} onclick="L.do('day','${s}')">${s}</button>`).join('')}</div></div>` },
 a_nav: { a: 'rider', clock: 'Sat 2:10', node: 3, pk: ['s2', 'r1'], hl: 'nav', tip: 'Ramesh sees the buyer\'s plan before he arrives, plus the last handover pin. Tap <b>Start navigation</b>.',
   h: O => `${riderHead('Stop 14 · Priya')}<div class="body"><div class="map new"><div class="ring" style="left:34%;top:18%;width:100px;height:100px"></div><div class="pin" style="left:46%;top:36%"></div><div class="lb" style="left:6%;top:6%">Last handover point</div></div>
   <div class="row b"><span>Landmark</span><span class="v">Hanuman Mandir</span></div>
   <div class="card" style="background:var(--greenL)">Address confidence: <b>High</b> · delivered here 3 times</div>
   <div class="card new" style="background:var(--orgL)">Plan: <b>Leave with Sunita</b> (120 m) · code needed · prepaid</div>${b('Start navigation', "L.go('a_hand')", 'pl', 'nav')}</div>` },
 a_hand: { a: 'rider', clock: 'Sat 2:24', node: 4, pk: ['s2', 'c3'], hl: 'otp', tip: 'Sunita reads out the code Priya shared. <b>Type 7316</b>.',
   h: O => `${riderHead('Hand to backup · Sunita')}<div class="body"><div class="card ctr"><b>Ask Sunita for Priya's code</b><div class="otp" data-hl="otp">${[0, 1, 2, 3].map(i => `<input maxlength="1" inputmode="numeric" id="o${i}" oninput="LX.otp(${i},'7316','handBackup')">`).join('')}</div><div id="oerr"></div><div class="small">Hint for the demo: 7316</div></div>
   ${ck('Prepaid · nothing to collect', 'ok')}</div>`, m: () => $('#o0').focus() },
 s_drop: { a: 'shop', clock: 'Sat 1:05', node: 3, pk: ['s2', 'p1'], hl: 'recv', tip: 'Sharma Store scans the parcel in. Tap <b>Scan parcel in</b>.',
   h: O => `${shopHead()}<div class="body"><div class="slot" style="grid-template-columns:repeat(3,1fr);margin-bottom:10px">${[['6', 'to receive'], ['4', 'waiting'], ['₹72', 'this week']].map(([a, c]) => `<div class="card ctr" style="margin:0"><div class="big">${a}</div><div class="small">${c}</div></div>`).join('')}</div>
   <div class="card"><div class="prod"><img src="img/parcel.png" alt=""><div><b>#VAL-48213 · for Priya</b><div class="small">Hold 5 days · COD ₹349</div></div></div></div>${b('Scan parcel in · पार्सल स्कैन करें', "L.do('shopIn')", 'o', 'recv')}</div>` },
 s_pick: { a: 'shop', clock: 'Sat 7:40', node: 4, pk: ['s2', 'p1'], hl: 'otp', tip: 'Priya walks in after work. Ask for her code: <b>type 4821</b>, then collect by UPI QR.',
   h: O => `${shopHead()}<div class="body">${ck('Parcel on shelf · #VAL-48213', 'ok')}
   <div class="new" style="padding:8px;margin-top:6px"><b>ग्राहक से कोड पूछें · Ask for the code</b><div class="otp" data-hl="otp">${[0, 1, 2, 3].map(i => `<input maxlength="1" inputmode="numeric" id="o${i}" oninput="LX.otp(${i},'4821','shopCode')">`).join('')}</div><div id="oerr"></div><div class="small ctr">Hint for the demo: 4821</div></div><div id="pay"></div></div>`, m: () => $('#o0').focus() },

 /* ---------- Story 4 · nobody answers ---------- */
 g_door: { a: 'cust', clock: 'Sat 3:38', node: 4, pk: ['s2', 'c5'], hl: 'miss', tip: 'Ramesh is at the door. Priya gets a verified "Valmo Delivery" call and a WhatsApp ping. Today she is in a meeting: tap <b>Priya doesn\'t see it</b>.',
   enter: O => L.ev('rider', 'Arrived at the address · auto WhatsApp + verified "Valmo Delivery" call', 4),
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg("<b>Ramesh is at your door now.</b><br>Tap if you can't come out.", '3:38 pm')}
   ${qrL([["I'm coming", "L.do('coming')"], ['Send to Valmo Point', "L.go('a_point')"]])}
   <div class="call new"><div class="dot">✆</div><div><div class="small" style="color:#bbb">Incoming call</div><b>Valmo Delivery</b> <span class="tick">✓</span></div></div>
   ${ff("Priya is in a meeting and doesn't see it", "L.go('g_choice')", 'miss')}</div>` },
 g_choice: { a: 'rider', clock: 'Sat 3:39', node: 4, pk: ['s2', 'r2'], hl: 'honest', tip: 'Now the rider decides. Play <b>the honest rider</b> first, then replay and try skipping.',
   h: O => `${riderHead('Stop 14 · Priya', 'No answer at the door')}<div class="body"><div class="card"><b>Nobody at the door.</b><div class="small">What does Ramesh do?</div></div>
   ${b('Wait and call properly (honest rider)', "L.go('g_gate')", 'pl', 'honest')}${b('Mark "not reachable" and ride on (skip)', "L.do('skip')", 'rd')}</div>` },
 g_gate: { a: 'rider', clock: 'Sat 3:40', node: 4, pk: ['s2', 'r2'], hl: 'mnr', tip: 'Watch the gate: GPS at the address, 90 s wait, 2 calls 2 min apart, a WhatsApp ping. The button stays grey until every tick is green.',
   h: O => `${riderHead('Attempt checks', 'Stop 14 · Priya')}<div class="body"><div id="cks"></div>
   <button class="btn new" id="mnr" data-hl="mnr" disabled onclick="L.do('gatePass')">Mark not reachable</button><div class="small ctr" id="mnrh" style="margin-top:8px">Unlocks when every tick is green</div></div>`,
   m: () => { let t = 0; const draw = () => { const w = Math.min(t, 90), all = t >= 90; $('#cks').innerHTML = ck('At the address · GPS verified', 'ok') + ck('Waiting', all ? 'ok' : '', `${Math.floor(w / 60)}:${String(w % 60).padStart(2, '0')} / 1:30`) + ck('Call 1 · verified caller ID', t >= 15 ? 'ok' : '') + ck('Call 2 · 2 min later', t >= 75 ? 'ok' : '') + ck('WhatsApp ping sent', t >= 20 ? 'ok' : ''); const bt = $('#mnr'); if (!bt) return; bt.disabled = !all; bt.classList.toggle('rd', all); $('#mnrh').textContent = all ? 'All green: the visit is proven' : 'Unlocks when every tick is green'; }; draw(); T.push(setInterval(() => { t += 3; draw(); if (t > 95) clearT(); }, 160)); } },
 g_pass: { a: 'rider', clock: 'Sat 3:42', node: 4, pk: ['s2', 'r3'], hl: 'next', tip: 'Verified: Ramesh earns ₹3 for a proven miss. See what Priya gets.',
   h: O => `${riderHead('Attempt result', 'Stop 14 · Priya')}<div class="body"><div class="ctr" style="color:var(--green);font-weight:700;font-size:18px">Attempt verified</div><div class="card new ctr" style="margin-top:10px"><b>+₹3 added to today's pay</b></div>
   ${ck('Customer notified on WhatsApp', 'ok')}${ck('Next step: customer chooses', 'ok')}<div class="row b"><span>Today</span><span class="v">₹9 · 3 verified</span></div>${b("See Priya's phone →", "L.go('g_after')", 'pl', 'next')}</div>` },
 g_after: { a: 'cust', clock: 'Sat 3:43', node: 4, pk: ['s2', 'c6'], hl: 'vp', tip: 'Proof of the visit and three next steps. Tap <b>Valmo Point</b>; she\'ll collect on the way home.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div><div class="new" style="margin-bottom:10px">${msg("We couldn't reach you at 3:40 pm. <b>Ramesh waited 2 min and called twice.</b>", '3:43 pm')}</div>
   ${qrL([['Retry tomorrow', "L.do('retry')"], ['Valmo Point · 600 m · code 4821', "L.do('gPoint')", 'vp'], ['Cancel', "A.toast('Cancelled before return: not counted as a refusal.')"]])}${msg('Did a rider come to your address today? Reply Yes / No.', '3:43 pm')}</div>` },
 g_fail: { a: 'rider', clock: 'Sat 3:39', node: 4, pk: ['s2', 'r4'], hl: 'next', tip: 'The gate refused the skip: he left after 40 s with no calls. No fee, parcel re-queued, quality score drops.',
   h: O => `${riderHead('Attempt result', 'Stop 14 · Priya')}<div class="body"><div class="ctr" style="color:var(--red);font-weight:700;font-size:18px">Attempt not verified</div>
   <div class="card" style="margin-top:10px">${ck('Left after 40 s', 'no')}${ck('No calls placed', 'no')}</div><div class="small">Parcel re-queued for a real attempt today. No fee.</div>
   ${b('Appeal with photo / note', "A.toast('Appeal sent. If more than 10% of appeals in an area are upheld, its radius widens.')", 'ln')}
   <div class="small" style="margin-top:12px">Quality score <b>74 / 100</b> (was 82)</div><div class="bar"><i style="width:74%"></i></div>${b("See Priya's phone →", "L.go('g_failc')", 'pl', 'next')}</div>` },
 g_failc: { a: 'cust', clock: 'Sat 3:45', node: 3, pk: ['s2', 'c6'], hl: 'no', tip: 'Priya is <b>not</b> marked unavailable. Asked if a rider came, she says <b>No</b>: it counts against the rider, not her.',
   h: O => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('Your parcel is still out for delivery. New attempt today, <b>5–8 pm</b>.', '3:45 pm')}${msg('Did a rider come to your address today?', '3:45 pm')}
   ${qrL([['Yes', "A.toast('Thanks. Pick a time that suits you.')"], ['No', "L.do('saidNo')", 'no']])}</div>` },

 /* ---------- shared end ---------- */
 end: { a: 'sys', pk: null, hl: 'again', tip: 'That is one order, end to end. Play another story, or see what this adds up to across Valmo.',
   h: O => { const o = OUT[O.end]; const t = sum(o.today), n = sum(o.now); return `${sb()}<div class="ab"><div class="av v">✓</div><div class="t">Outcome<small>Order #${O.id} · ${O.buyer}</small></div></div><div class="body">
   <div class="done" style="padding:14px 6px"><div class="ok" style="${o.sol === 'S2' ? 'background:var(--org)' : ''}">✓</div><b style="font-size:16px">${o.t}</b><div class="small">${o.line}</div></div>
   <div class="card"><div class="row b"><span>Cost to Valmo today</span><span class="v">₹${t}</span></div><div class="row b"><span>With ${o.sol === 'S1' ? 'Commit-to-COD' : 'Sure-Meet'}</span><span class="v">₹${n}</span></div>
   <div class="row"><b>${t - n > 0 ? 'Saved on this parcel' : 'Difference'}</b><b style="color:${t - n > 0 ? 'var(--green)' : 'var(--mute)'}">₹${t - n}</b></div></div>
   ${b('Play another story', 'L.menu()', 'o', 'again')}${b('See the impact at Valmo scale →', "A.tab('impact')", 'ln')}</div>`; } },
};

/* ================= ACTIONS (each one moves the shared order and writes to the log) ================= */
const LA = {
  warnOk: O => { L.ev('cust', 'Tapped "Got it" on the warning'); return 'r_shop'; },
  warnDispute: O => { L.ev('cust', 'Disputed a past refusal → it stops counting while photo + GPS are checked'); A.toast('Dispute opened. That refusal does not count while we check.'); return 'r_shop'; },
  warnPrepaid: O => { O.pay = 'UPI'; L.ev('cust', 'Switched to prepaid → no advance ever needed', 1); return 'r_shop'; },
  payAdv: (O, how) => { O.adv = 70; L.ev('cust', `Paid ₹70 advance (20%, cap ₹100) by ${how}; ₹279 due at the door`, 1); L.ev('sys', 'Order confirmed · flagged-cohort COD with advance'); return 'r_placed'; },
  payFull: O => { L.ev('cust', 'Paid ₹349 by UPI · prepaid order', 1); return 'r_placed'; },
  ship: (O, to) => { L.O.clock = 'Fri 6:00'; L.ev('sys', 'Seller dispatched · FM hub → sort hubs'); L.O.clock = 'Sat 6:40'; L.ev('hub', 'Arrived at LMDC Kanpur-04 · day-of card queued for 8 am'); return to; },
  keep: O => { L.ev('cust', `Kept the order for ${O.slot}`, 6); return 'r_kept'; },
  slot: (O, s) => { O.slot = s; L.ev('cust', `Changed time to ${s} · same rider, ₹0`, 6); return L.story === 'refuser' ? 'r_kept' : null; },
  cancel: O => { O.cancelled = true; L.ev('cust', 'Cancelled at 8:07 am · ₹0 · not a refusal' + (O.adv ? ' · ₹70 refunded' : ''), 6); L.ev('hub', 'Parcel never leaves the LMDC → seal check for resale', 7); return 'h_check'; },
  door: (O, intent) => { O.intent = intent; L.ev('rider', 'Out for delivery → at the door · verified caller ID call'); return 'r_door'; },
  delivered: O => { L.ev('rider', `Delivered · collected ₹${dueL(O)}${O.adv ? ' (₹70 prepaid)' : ''}`, 6); return 'r_receipt'; },
  submitRefusal: O => { const free = O.reason === 'Wrong item' || O.reason === 'Damaged'; L.ev('rider', `Refusal: "${O.reason}" + photo with time and GPS`, 6);
    if (free) { L.ev('sys', 'Wrong / damaged → seller fault · not counted against the buyer · advance refunded'); L.finish('sellerFault'); return null; }
    L.ev('sys', 'Customer asked to confirm on WhatsApp · 48 h dispute window'); return 'r_refused'; },
  refAccept: O => { L.ev('cust', 'Confirmed the refusal · ₹70 advance kept (covers part of the return)'); return 'h_check'; },
  refDispute: O => { O.dispute = true; L.ev('cust', 'Disputed · refusal does not count while we check'); return null; },
  pool: O => { L.ev('hub', 'Seal intact + weight matches → 48 h resale pool (not the reverse bag)', 7); L.ev('sys', 'Nudging 23 nearby users who viewed/carted this item + size · refuser blocked'); return 'b_push'; },
  sealFail: O => { L.ev('hub', 'Seal torn → normal return to seller'); L.finish('unsold'); return null; },
  buyResale: O => { L.ev('buyer', 'Neha bought it for ₹279 prepaid · delivered tomorrow from 1 km away', 7); L.ev('sys', 'Seller paid full ₹349 · the ₹70 off is funded from the ₹120 not spent'); L.finish(O.cancelled ? 'cancelResold' : 'resold'); return null; },
  noBuy: O => { L.ev('sys', '48 h passed, not sold → normal return to seller'); L.finish('unsold'); return null; },
  nPlace: O => { L.ev('cust', 'Placed a normal COD order · no advance, no warning'); LA.ship(O); return 'n_day'; },
  nKeep: O => { L.ev('cust', 'Kept the order (day-of card)', 6); return 'n_door'; },
  nDel: O => { L.ev('rider', 'Delivered · collected ₹349'); L.finish('normal'); return null; },
  saveBackup: O => { L.ev('cust', 'Named Sunita (neighbour, 120 m) as an optional backup', 4); return 'a_consent'; },
  skipBackup: O => { L.ev('cust', 'Skipped the backup receiver'); LA.ship(O); return 'a_morning'; },
  consent: (O, ok) => { if (ok) { O.backup = 'Sunita'; L.ev('backup', 'Sunita replied OK · consent stored'); } else L.ev('backup', 'Sunita replied STOP · number deleted, option hidden'); LA.ship(O); return 'a_morning'; },
  prepay: O => { O.pay = 'UPI'; L.ev('cust', 'Paid ₹349 online so Sunita never handles cash', 4); return null; },
  shareCode: O => { O.plan = 'backup'; L.ev('cust', 'Plan: leave with Sunita · code 7316 shared', 4); L.ev('sys', 'Rider app updated with the plan before dispatch'); return 'a_nav'; },
  choosePoint: O => { O.plan = 'point'; L.ev('cust', 'Plan: Valmo Point, Sharma General Store (600 m) · code 4821', 4); return 'a_pointok'; },
  day: (O, d) => { L.ev('cust', `Moved delivery to ${d} before dispatch · no wasted trip`, 4); L.O.clock = d.split(' ')[0] + ' 6:10'; L.ev('rider', 'Delivered on the chosen day'); L.finish('resched'); return null; },
  handBackup: O => { L.ev('rider', 'Code 7316 matched · handed to Sunita · prepaid, nothing collected', 4); L.finish('backup'); return null; },
  shopIn: O => { L.ev('shop', 'Parcel scanned in at Sharma General Store · 5-day hold', 4); L.ev('sys', 'Priya notified: ready for pickup, code 4821'); return 's_pick'; },
  shopCode: (O, pm) => { L.ev('shop', `Code 4821 matched · ₹349 collected by ${pm} · shop earns ₹12`, 4); L.finish(O.failed ? 'pointAfterFail' : 'point'); return null; },
  coming: O => { L.ev('cust', '"I\'m coming" · delivered at the door'); L.finish('home'); return null; },
  skip: O => { L.ev('rider', 'Tried to mark "not reachable" after 40 s, no calls', 5); L.ev('sys', 'Gate failed → attempt not counted, no fee, re-queued'); return 'g_fail'; },
  gatePass: O => { O.failed = true; L.ev('rider', 'Gate passed: at the address, 90 s, 2 calls, WhatsApp ping → verified miss, +₹3', 5); return 'g_pass'; },
  retry: O => { L.ev('cust', 'Retry tomorrow'); L.O.clock = 'Sun 11:20'; L.ev('rider', 'Delivered on the retry'); L.finish('retry'); return null; },
  gPoint: O => { O.plan = 'point'; L.ev('cust', 'Send to Valmo Point · code 4821', 4); return 's_drop'; },
  saidNo: O => { L.ev('cust', 'Said "No rider came" → logged against the rider, not Priya', 5); L.O.clock = 'Sat 6:10'; L.ev('rider', 'Real attempt in the evening · delivered'); L.finish('fakeCaught'); return null; },
};
const LX = {
  otp(i, code, act) { const e = $('#o' + i); e.value = e.value.replace(/\D/g, ''); if (e.value && i < 3) $('#o' + (i + 1)).focus();
    const c = [0, 1, 2, 3].map(k => $('#o' + k).value).join(''); if (c.length < 4) return;
    if (c !== code) { $('#oerr').innerHTML = '<div class="err">Wrong code. Do not hand over.</div>'; return; }
    if (act === 'shopCode') { $('#oerr').innerHTML = '<div class="ck ok" style="justify-content:center"><i></i>Code ✓ · COD ₹349</div>'; $('#pay').innerHTML = b('Collect by UPI QR', "L.do('shopCode','UPI QR')", 'o', 'upiqr') + b('Collect cash', "L.do('shopCode','cash')", 'ln'); hl('upiqr'); }
    else L.do(act); },
};
window.LX = LX;

/* ================= RENDER ================= */
const hl = k => { if (!L.tour || !k) return; document.querySelectorAll('[data-hl].hlon').forEach(e => e.classList.remove('hlon')); const e = document.querySelector(`.phone [data-hl="${k}"]`); if (e) e.classList.add('hlon'); };
const val = (v, O) => typeof v === 'function' ? v(O) : v;

const LIVE = {
  view() {
    if (!L.story) return LIVE.menu();
    const O = L.O, sc = LS[L.scene], st = STORY[L.story], who = WHO[sc.a], p = sc.pk ? P[sc.pk[0]][sc.pk[1]] : null;
    window.CLK = O.clock.split(' ').pop();
    const endK = O.end && OUT[O.end];
    const nodes = NODES.map((n, i) => `<div class="jn ${i < O.node ? 'past' : i === O.node && !O.end ? 'now' : ''} ${O.end && i <= O.node ? 'past' : ''}"><i></i><span>${n}</span></div>`).join('');
    const endNode = O.end ? `<div class="jn now end"><i></i><span>${{ accepted: 'Delivered', normal: 'Delivered', home: 'Delivered', retry: 'Delivered', resched: 'Delivered', fakeCaught: 'Delivered', backup: 'With Sunita', point: 'Valmo Point', pointAfterFail: 'Valmo Point', resold: 'Resold nearby', cancelResold: 'Resold nearby', unsold: 'Back to seller', sellerFault: 'Back to seller' }[O.end]}</span></div>` : '';
    return `<div class="livebar"><button class="lnk2" onclick="L.menu()">← All stories</button><b>${st.n} · ${st.title}</b><span class="pill">${st.sol}</span><span class="small">${st.prob}</span>
      <label class="tg"><input type="checkbox" ${L.tour ? 'checked' : ''} onchange="L.tourT()"> Guided tour</label></div>
     <div class="stage">
      <div>${L.tour ? `<div class="tip tipm"><div class="k">What to do</div><div>${val(sc.tip, O)}</div></div>` : ''}<div class="who"><span class="pill ${sc.a === 'cust' || sc.a === 'arjun' || sc.a === 'buyer' || sc.a === 'backup' ? '' : 'o'}">${who[1]}</span> Now on: <b>${who[0]}</b> · <span class="small">${O.clock}</span></div>
       <div class="phone"><div class="scr">${sc.h(O)}</div><div id="ov"></div></div></div>
      <aside class="side live">
       ${L.tour ? `<div class="tip"><div class="k">What to do</div><div>${val(sc.tip, O)}</div></div>` : ''}
       ${p ? `<div class="hd"><div class="tag">${p[0]}</div><div><h2>${p[1]}</h2><div class="when">${p[2]}</div></div></div>
        <div class="bd"><div><div class="k">Today</div><div class="today">${p[3]}</div></div><div><div class="k">What's new</div><div>${p[4]}</div></div><div class="stat"><div class="h">${p[5]}</div><div class="small">${p[6]}</div></div></div>` : ''}
       <div class="sec"><div class="k">Where the parcel is</div><div class="journey">${nodes}${endNode}</div></div>
       ${endK ? `<div class="sec money"><div class="k">This parcel, today vs with our fix</div><div class="mcols"><div><b>Today · ₹${sum(endK.today)}</b>${endK.today.map(([l, v]) => `<div class="row"><span>${l}</span><span>₹${v}</span></div>`).join('')}</div><div><b>With ${endK.sol === 'S1' ? 'Commit-to-COD' : 'Sure-Meet'} · ₹${sum(endK.now)}</b>${endK.now.map(([l, v]) => `<div class="row"><span>${l}</span><span>₹${v}</span></div>`).join('')}</div></div></div>` : ''}
       <div class="sec"><div class="k">Leak points this order touched (deck slide 2)</div><div class="leaks">${LEAKS.map((l, i) => `<span class="lk ${O.leaks.includes(i + 1) ? 'on' : ''}">${i + 1} · ${l}</span>`).join('')}</div></div>
       <div class="sec"><div class="k">Valmo control log · every side, one order</div><div class="log">${O.ev.map(e => `<div class="le"><span class="lt">${e.t}</span><span class="la ${e.who}">${WHO[e.who][1]}</span><span>${e.txt}</span></div>`).join('') || '<div class="small">Events appear here as you tap.</div>'}</div></div>
      </aside></div>`;
  },
  menu() {
    const done = k => L.played.filter(p => p.story === k).length;
    return `<section class="hero" style="margin-bottom:14px"><h1>Play one order, end to end</h1><p>Each story follows a single Meesho order across every side it touches: the buyer's phone, the rider app, the hub, a Valmo Point shop and a nearby buyer. Every tap moves the parcel, writes to the control log, and ends with what this parcel costs Valmo today vs with our fix. Turn the guided tour off any time to explore freely.</p></section>
     <div class="stories">${Object.entries(STORY).map(([k, s]) => `<div class="story ${s.solK}"><div class="sn">${s.n}</div><div style="flex:1"><div class="small">${s.sol} · ${s.len}</div><h3>${s.title}</h3><div class="pr">${s.prob}</div><p>${s.blurb}</p>
       <button onclick="L.start('${k}')">${done(k) ? 'Play again' : '▶ Play'}</button>${done(k) ? `<span class="pill g" style="margin-left:8px">✓ played</span>` : ''}</div></div>`).join('')}</div>
     ${L.played.length ? `<div class="foot"><button class="btn o" style="max-width:320px;margin:0 auto" onclick="A.tab('impact')">See the impact at Valmo scale →</button></div>` : ''}`;
  },
  mount() { if (!L.story) return; const sc = LS[L.scene]; if (sc.m) sc.m(); hl(val(sc.hl, L.O)); },
};
window.LIVE = LIVE;

/* ================= IMPACT ================= */
const GRID = { s1: [10, 20, 30, 40], s2: [15, 25, 35, 45], v: [[283, 344, 404, 465], [380, 440, 501, 561], [471, 537, 597, 658], [572, 633, 694, 754]] };
const IMPACT = {
  s1: 1, s2: 1,
  view() {
    const i = IMPACT.s1, j = IMPACT.s2, net = GRID.v[i][j], a = GRID.s1[i], c = GRID.s2[j];
    const pp = 0.0597 * a + 0.08 * c - 0.2, after = (17 - pp).toFixed(1), base = i === 1 && j === 1;
    const bars = [['Commit-to-COD', 228, 'var(--plum)'], ['Sure-Meet', 282, 'var(--org)'], ['Running cost', -70, 'var(--red)'], ['Net a year', 440, '#3a0d32']];
    return `<section class="hero"><h1>What one order adds up to across Valmo</h1><p>Reverse-cost savings only, so conservative: forward ₹50 and the kept sale are upside we don't count. Base case from deck slide 9; move the sliders to stress-test the two assumptions that matter most.</p>
     <div class="kpis"><div><b>17% → ~14%</b><span>RTO rate (−3.0 pp)</span></div><div><b>₹440 Cr</b><span>net a year (₹510 Cr gross − ₹70 Cr running cost)</span></div><div><b>₹84.8 → ₹78.1</b><span>cost per delivered order</span></div><div><b>0.43 pp</b><span>break-even RTO drop (base is 7× that)</span></div></div></section>
     <div class="sols">
      <div class="sol"><h3>Base case · ₹ Cr a year</h3><div class="sub">Each saves the ₹120 reverse leg on a parcel that would have come back</div>
       ${bars.map(([l, v, col]) => `<div class="ibar"><span>${l}</span><div><i style="width:${Math.abs(v) / 5.1}%;background:${col}"></i></div><b>${v > 0 ? '' : '−'}₹${Math.abs(v)}</b></div>`).join('')}
       <table><tr><td>Refusal prevented (S1)</td><td>+₹120 a parcel · ₹193 Cr</td></tr><tr><td>48 h local resale (S1)</td><td>+₹60 a parcel · ₹35 Cr</td></tr><tr><td>Unreachable prevented (S2)</td><td>+₹120 a parcel · ₹151 Cr</td></tr><tr><td>Collected at a Valmo Point (S2)</td><td>+₹108 a parcel · ₹41 Cr</td></tr><tr><td>Fake attempt → delivered (S2)</td><td>+₹120 a parcel · ₹90 Cr</td></tr><tr><td>Messages + fees</td><td>−₹17.5 a prevented RTO · −₹70 Cr</td></tr></table></div>
      <div class="sol"><h3>Stress test</h3><div class="sub">Net ₹ Cr a year from the deck's sensitivity grid</div>
       <label class="fl">Commit-to-COD: share of refusals cut · <b>${a}%</b></label><input type="range" min="0" max="3" step="1" value="${i}" onchange="IMPACT.s1=+this.value;render()" class="rng">
       <label class="fl">Sure-Meet: share of unreachable RTOs prevented · <b>${c}%</b></label><input type="range" min="0" max="3" step="1" value="${j}" onchange="IMPACT.s2=+this.value;render()" class="rng">
       <div class="kpis" style="grid-template-columns:1fr 1fr"><div><b>₹${net} Cr</b><span>net a year${base ? ' · base case' : ''}</span></div><div><b>~${after}%</b><span>RTO after (−${pp.toFixed(1)} pp)</span></div></div>
       <div class="card" style="margin-top:12px;background:var(--orgL)"><b>Worst corner still pays:</b> ₹283 Cr a year at 10% / 15%, about 20× the ₹10–15 Cr one-time build.</div>
       ${L.played.length ? `<div class="k" style="margin-top:12px">Orders you played</div>${L.played.map(p => { const o = OUT[p.kind]; return `<div class="row b"><span>${STORY[p.story].title} → ${o.t}</span><b style="color:var(--green)">₹${sum(o.today) - sum(o.now)} saved</b></div>`; }).join('')}` : `<button class="btn o" onclick="A.tab('live')">▶ Play a story first</button>`}</div>
     </div>`;
  },
  mount() {},
};
window.IMPACT = IMPACT;
