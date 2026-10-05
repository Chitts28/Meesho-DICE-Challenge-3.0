/* Valmo RTO prototype · Team Shooters
   Two solutions, each shown from every side that touches it.
   Orange dashed outline = the new element on each screen. Grey dashed "Demo" buttons simulate real-world events. */

const $ = s => document.querySelector(s);
const V = { view: 'home', role: null, scr: null, st: {} };
let T = [];
const clearT = () => { T.forEach(clearInterval); T = []; };

/* ---------------- phone building blocks ---------------- */
const sb = (t = 'd') => `<div class="sb ${t}"><span>${window.CLK || '9:41'}</span><span>4G ▂▄▆ 82%</span></div>`;
const waHead = () => `${sb('w')}<div class="ab wa"><div class="av">m</div><div class="t">Meesho<span class="tick">✓</span><small>Official business account</small></div></div>`;
const appHead = (t, sub = '', v = false) => `${sb()}<div class="ab"><div class="av ${v ? 'v' : ''}">${v ? 'V' : 'm'}</div><div class="t">${t}${sub ? `<small>${sub}</small>` : ''}</div></div>`;
const msg = (h, tm = '8:05 am', cls = '') => `<div class="msg ${cls}">${h}<div class="tm">${tm}</div></div>`;
const out = (h, tm = '8:06 am') => msg(h, tm, 'out');
const qr = (arr, cls = '') => `<div class="qr ${cls}">${arr.map(([l, f]) => `<button onclick="${f}">↩ ${l}</button>`).join('')}</div>`;
const demo = (arr) => `<div class="demo-k">Demo · simulate what happens next</div>${arr.map(([l, f]) => `<button class="btn demo" onclick="${f}">${l}</button>`).join('')}`;
const ck = (txt, s = '', r = '') => `<div class="ck ${s}"><i></i>${txt}${r ? `<span class="r">${r}</span>` : ''}</div>`;
const prod = (price = '₹349') => `<div class="prod"><img src="img/kurti.png" alt="Kurti"><div><b>Kurti · Size M</b><div class="small">Pink printed rayon kurti</div><div class="v"><b>${price}</b></div></div></div>`;

/* ---------------- overlays ---------------- */
const A = {
  go(id) { V.scr = id; clearT(); render(); },
  set(k, v) { V.st[k] = v; },
  toast(m) { const o = $('#ov'); const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = m; o.appendChild(d); setTimeout(() => d.remove(), 2800); },
  sheet(h) { $('#ov').innerHTML = `<div class="dim" onclick="A.close()"></div><div class="sheet"><div class="grab"></div>${h}</div>`; },
  close() { $('#ov').innerHTML = ''; },
  tab(v, role) { V.view = v; const flat = !R[v]; V.role = flat ? null : (role || Object.keys(R[v])[0]); V.scr = flat ? null : R[v][V.role].start(); clearT(); render(); scrollTo(0, 0); },
  role(r) { V.role = r; V.scr = R[V.view][r].start(); clearT(); render(); },
  scen(n) { V.st = { normal: n }; V.scr = R.s1.cust.start(); clearT(); render(); },
};
window.A = A;

/* ---------------- side-panel copy (matches the deck wireframes) ---------------- */
const P = {
 s1: {
  c1: ['C1', 'Early warning on WhatsApp', 'After the 2nd verified refusal', 'No warning. COD stays free however often a buyer refuses.', 'Message from Meesho\'s <b>verified business number</b> with 3 quick replies: Got it · Dispute · Switch to prepaid', 'Warn before we ask for anything', 'Only 18.1% of shoppers refused 4+ orders in 6 months, so few buyers ever see this'],
  c2: ['C2', 'Checkout: flagged buyer', 'Next COD order (flagged only)', '"Cash on Delivery · Pay ₹349 when it arrives." Normal buyers keep exactly this.', '<b>₹70 now (20%, max ₹100), ₹279 at delivery.</b> UPI, pay-link for family, or cash at a Valmo Point. Refund rules shown up front', 'The advance is part of the price, not a fee', '₹100 cap ≈ ₹120 reverse cost; DoCA probes COD fees, so there is no extra charge'],
  c2n: ['C2', 'Checkout: normal buyer', 'Every COD order from a buyer with no flag', '"Cash on Delivery · Pay ₹349 when it arrives."', '<b>Nothing.</b> No advance, no warning. A normal buyer only ever sees the day-of card and the usual receipt', 'Most buyers never notice the change', 'Only 18.1% of shoppers refused 4+ orders in 6 months'],
  c3: ['C3', 'Day-of card', 'Delivery morning, 8 am', 'Only "Out for delivery". No way to back out before the rider comes.', '<b>Keep · Change time · Cancel</b> as quick replies, with a Hindi line', 'Cancel at 8 am costs ₹0. Refusal at 4 pm costs ₹170', '50.5% would cancel if asked that morning, +28.1% maybe'],
  c4: ['C4', 'Refusal recorded + dispute', 'Right after a refusal', 'Refusal logged by the rider alone; the customer never sees it.', 'Time, rider name and a <b>photo at the door</b>; one tap to dispute within <b>48 hours</b>', 'Every refusal is verified and disputable', '41.9% say a rider marked them unavailable while home: the rider\'s word alone can\'t count'],
  c5: ['C5', 'Receipt after accepting', 'After delivery', '"Delivered." Nothing about the flag or how to clear it.', '<b>₹279 cash + ₹70 advance = ₹349, nothing extra</b>, plus a progress bar to clear the flag', 'Shows the way out of the flag', 'Exit when the refusal rate drops below 20% or after 3 accepted in a row; old refusals age out'],
  r1: ['R1', 'Rider at the door', 'Every COD attempt', '"Collect ₹349." No proof he was really there.', '<b>Collect ₹279</b>; live checks for radius, 90 s dwell and two spaced calls', 'Less cash to carry; attempt checks shown live', '78.1% don\'t always answer unknown numbers, so calls come from Valmo\'s verified caller ID'],
  r2: ['R2', 'Rider refusal flow', 'After "Customer refused"', 'Free-text reason, no evidence.', 'Reason chips + <b>photo at the door</b>; customer confirms on WhatsApp; parcel goes to resale', 'Wrong / damaged reasons never count against the customer', 'Only verified, undisputed refusals count toward the flag'],
  h1: ['H1', 'LMDC hub tablet', 'Every refused parcel at the hub', 'Every refused parcel is sealed into the reverse bag.', 'Seal + weight check sends good parcels to a <b>48 h resale pool</b> instead of the ₹120 trip back', 'The hub gets paid to resell, so it won\'t resist', 'Tampered or under-weight parcels stay out of resale and return normally'],
  b1: ['B1', 'Resale push to nearby buyers', 'Parcel enters the resale pool', 'The refused parcel rides 7 nodes back to the seller.', 'App push to <b>LMDC-area users who viewed, carted or searched</b> this item + size; WhatsApp fallback, 1 nudge a day max', '75.2% of shoppers would buy this', 'The refuser\'s phone, device and address are blocked from buying it'],
  b2: ['B2', 'In-app bottom sheet', 'Next app open, within 48 h', 'No sign that a sealed copy is sitting 1 km away.', 'Slides up on app open: <b>sealed, 20% off, prepaid, next-day</b>, normal return rights, live countdown, "why you\'re seeing this"', 'Sold nearby, not trucked back', 'Seller paid full price; the 20% off is funded from the ₹120 saved: ~₹60 net per parcel'],
 },
 s2: {
  c1: ['C1', 'Optional backup receiver', 'Checkout', 'Only an address; nobody else can receive.', '<b>+ Add someone who can receive</b> (optional): name, phone, relation; within 3 km', 'Optional, set once, reused', '54.8% would name a backup receiver'],
  c2: ['C2', '"Won\'t be home?" card', 'Delivery morning', '"Out for delivery", then an unknown-number call.', 'Quick replies: <b>home · someone I trust · Valmo Point · change day</b>, plus a Hindi line', 'The buyer decides before the rider leaves', '58.6% have missed a delivery when not home'],
  c3: ['C3', 'Option A: leave with a backup', 'Taps "someone I trust"', 'No safe way to leave it with a neighbour.', 'COD → <b>pay ₹349 online</b>, then share <b>code 7316</b> with Sunita; no code = not delivered', 'Prepaid only; the code goes to the buyer', 'Stops cash disputes and fake "not received" claims'],
  c4: ['C4', 'Option B: Valmo Point', 'Taps "Valmo Point"', 'A missed parcel rides back to the seller.', 'Partner shop on a <b>map, 600 m away</b>, hours, 5-day hold, pickup <b>code 4821</b>', 'A shop down the lane holds it', '82.4% open to collecting from a shop ≤ 1 km'],
  c5: ['C5', 'Rider at the door', 'Rider inside the radius', 'Call from an unknown number, often ignored.', 'Auto WhatsApp / IVR <b>"Ramesh is at your door"</b> + the call shows "Valmo Delivery" with a tick', 'Verified caller + one-tap reply', '78.1% don\'t always answer unknown numbers'],
  c6: ['C6', 'After a failed attempt', 'Only if the gate passed', 'SMS: "Delivery failed. Customer not available."', 'Proof of the visit (<b>waited 2 min, called twice</b>), 3 next steps and <b>"Did a rider come?"</b>', 'Your "No" counts against the rider, not you', '41.9% say they were marked unavailable while home'],
  r1: ['R1', 'Rider navigation', 'Before each stop', 'A typed address only.', '<b>Last handover pin</b>, landmark, address-confidence tier and the buyer\'s plan', 'Knows the plan before arriving', 'High = 100 m · Medium = 300 m · Low ≤ 1 km'],
  r2: ['R2', 'Live attempt checklist', 'At the door', '"Not reachable" can be marked from anywhere.', '<b>100 m · 90 s · 2 calls · WhatsApp ping</b>; the button stays grey until all are green', 'No "not reachable" until the visit is proven', 'Dwell applies only on the failure path'],
  r3: ['R3', 'Result: verified', 'Gate passed', 'A failed attempt pays ₹0.', '<b>+₹3</b> per verified attempt; customer notified; retry queued', 'Paid when right', '~₹30 Cr a year in fees, already in the net impact'],
  r4: ['R4', 'Result: not verified', 'Gate failed', 'No check, no appeal, no feedback.', 'Parcel <b>re-queued</b>, no fee, <b>appeal with photo / note</b>, quality score shown', 'Appeal when wrong: fair to riders', 'If more than 10% of appeals in an area are upheld, that area\'s radius widens'],
  p1: ['P1', 'Valmo Point partner app', 'Drop-off and pickup', 'Local shops have no role in delivery.', 'Hindi-first, big buttons: <b>scan, ask for the code, collect by UPI QR</b> or cash', 'OTP handover; UPI first', 'Partner earns ~₹10–15 a parcel; liable for loss'],
  s1: ['S1', 'Backup consent SMS', 'After the buyer names a backup', 'The neighbour is never asked.', 'SMS to Sunita with the time window; <b>reply STOP</b> to decline', 'Consent first', 'DPDP Act: consent, purpose limit, deletion'],
 }
};

/* ---------------- roles and their flows ---------------- */
const R = {
 s1: {
  cust: { name: 'Customer', steps: () => V.st.normal ? [['c2n', 'C2'], ['c3', 'C3'], ['c5', 'C5']] : [['c1', 'C1'], ['c2', 'C2'], ['c3', 'C3'], ['c4', 'C4'], ['c5', 'C5']], start: () => V.st.normal ? 'c2n' : 'c1', scen: true },
  rider: { name: 'Rider app', steps: () => [['r1', 'R1'], ['r2', 'R2']], start: () => 'r1' },
  hub: { name: 'LMDC hub', steps: () => [['h1', 'H1']], start: () => 'h1' },
  buyer: { name: 'Nearby buyer (resale)', steps: () => [['b1', 'B1'], ['b2', 'B2']], start: () => 'b1' },
 },
 s2: {
  cust: { name: 'Customer', steps: () => [['c1', 'C1'], ['c2', 'C2'], ['c3', 'C3'], ['c4', 'C4'], ['c5', 'C5'], ['c6', 'C6']], start: () => 'c1' },
  rider: { name: 'Rider app', steps: () => [['r1', 'R1'], ['r2', 'R2'], ['r3', 'R3'], ['r4', 'R4']], start: () => 'r1' },
  point: { name: 'Valmo Point shop', steps: () => [['p1', 'P1']], start: () => 'p1' },
  backup: { name: 'Backup receiver', steps: () => [['s1', 'S1']], start: () => 's1' },
 }
};

/* ================= SOLUTION 1 · COMMIT-TO-COD ================= */
const due = () => V.st.normal ? '₹349 to pay in cash' : V.st.prepaid ? 'Paid ₹349 by UPI. Nothing to pay at the door' : '₹279 to pay in cash (₹70 already paid)';
const dueHi = () => V.st.normal ? '₹349 नकद' : V.st.prepaid ? 'भुगतान हो चुका' : '₹279 नकद';
const S1 = {
 /* C1 · WhatsApp warning */
 c1: { p: 'c1', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px">${msg(`Hi Priya, your last <b>2 COD orders</b> were returned at the door.<br><br>One more refusal and Cash on Delivery will need a <b>small advance (20%, max ₹100)</b> on your next orders.<br><br>Not right? You can dispute it.`, '10:02 am')}</div>
   ${qr([['Got it', "A.go('c1ok')"], ['Dispute a refusal', "A.go('c1d')"], ['Switch to prepaid', "A.set('prepaid',1);A.go('c1p')"]])}</div>` },
 c1ok: { p: 'c1', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('Hi Priya, your last <b>2 COD orders</b> were returned at the door. One more refusal and Cash on Delivery will need a <b>small advance (20%, max ₹100)</b>.', '10:02 am')}
   ${out('Got it', '10:04 am')}${msg('Thanks, Priya. Nothing changes on orders you already placed. Accepting your next 3 deliveries clears this.', '10:04 am')}
   <button class="btn o" onclick="A.go('c2')">Next: Priya's next COD order →</button></div>` },
 c1p: { p: 'c1', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('Hi Priya, your last <b>2 COD orders</b> were returned at the door…', '10:02 am')}
   ${out('Switch to prepaid', '10:04 am')}${msg('Done. UPI is now your default at checkout. Prepaid orders never need an advance, and you get normal returns.', '10:04 am')}
   <button class="btn o" onclick="A.go('c2')">Next: Priya's next order →</button></div>` },
 c1d: { p: 'c1', h: () => `${appHead('Dispute a refusal', 'Meesho · Help')}<div class="body">
   <div class="small" style="margin-bottom:6px">Which order was wrongly marked refused?</div>
   <div class="card" onclick="A.set('dOrd',1);A.go('c1d')" style="cursor:pointer;${V.st.dOrd == 1 ? 'border-color:var(--plum)' : ''}"><div class="row"><span>Saree · 12 Sep</span><span class="pill r">Refused</span></div><div class="small">Rider photo: gate, 4:12 pm</div></div>
   <div class="card" onclick="A.set('dOrd',2);A.go('c1d')" style="cursor:pointer;${V.st.dOrd == 2 ? 'border-color:var(--plum)' : ''}"><div class="row"><span>Bedsheet · 26 Sep</span><span class="pill r">Refused</span></div><div class="small">Rider photo: none</div></div>
   <div class="small" style="margin:8px 0 6px">What happened?</div>
   <div class="chips">${['I was home, no one came', 'Wrong item', 'Damaged parcel', 'Late beyond promise'].map(c => `<button class="chip ${V.st.dWhy === c ? 'on' : ''}" onclick="A.set('dWhy','${c}');A.go('c1d')">${c}</button>`).join('')}</div>
   <button class="btn pl" ${V.st.dOrd && V.st.dWhy ? '' : 'disabled'} onclick="A.go('c1ds')">Submit dispute</button>
   <div class="small" style="margin-top:8px">The refusal does not count while we check the rider's photo, GPS and call log.</div></div>` },
 c1ds: { p: 'c1', h: () => `${appHead('Dispute submitted', 'Meesho · Help')}<div class="body"><div class="done"><div class="ok">✓</div><b>We're checking it</b><div class="small">Decision within 24 hours on WhatsApp. If upheld, the refusal is removed from your account.</div></div>
   <button class="btn o" onclick="A.go('c2')">Next: Priya's next COD order →</button></div>` },

 /* C2 · checkout */
 c2: { p: 'c2', h: () => V.st.prepaid ? `${appHead('Payment', 'Step 3 of 3')}<div class="body"><div class="card">${prod()}</div>
   <div class="card"><div class="row"><span><b>UPI</b><div class="small">Your default since you switched to prepaid</div></span><span class="pill g">Selected</span></div></div>
   <div class="card" style="background:var(--greenL)">Prepaid orders never need an advance.</div>
   <button class="btn o" onclick="A.sheet(S1x.upi(349))">Pay ₹349 by UPI</button>
   <button class="btn ln" onclick="A.set('prepaid',0);A.go('c2')">Use Cash on Delivery instead</button></div>` : `${appHead('Payment', 'Step 3 of 3')}<div class="body">
   <div class="card">${prod()}</div>
   <div class="card new" style="background:var(--orgL)"><b style="color:var(--plum)">Cash on Delivery needs a small advance on your account</b>
    <div class="row b"><span>Pay now (20%)</span><span class="v">₹70</span></div><div class="row"><span>Pay at delivery</span><span class="v">₹279</span></div>
    <div class="small">Total stays ₹349. No extra fee.</div></div>
   <button class="btn o" onclick="A.sheet(S1x.upi())">Pay ₹70 by UPI</button>
   <button class="btn ln" onclick="A.toast('Payment link sent to Rahul (brother) on WhatsApp. Order confirms when ₹70 is paid.')">Send payment link to family</button>
   <button class="btn ln" onclick="A.toast('Pay ₹70 cash at Sharma General Store (600 m) within 24 h. Your order is held till then.')">Pay cash at a Valmo Point</button>
   <div class="small" style="margin-top:8px">Fully refunded if you cancel before dispatch, or if the item is wrong, damaged or late.</div>
   <a class="lnk" href="javascript:A.sheet(S1x.why())">Why am I seeing this?</a></div>` },
 c2ok: { p: 'c2', h: () => `${appHead('Order placed', 'Meesho')}<div class="body"><div class="done"><div class="ok">✓</div><b>${V.st.prepaid ? '₹349 paid by UPI' : '₹70 paid · ₹279 at delivery'}</b><div class="small">Order #MS-90214 · arrives Sat, 3 Oct</div></div>
   <div class="card">${prod()}</div><button class="btn o" onclick="A.go('c3')">Next: delivery morning →</button></div>` },
 c2n: { p: 'c2n', h: () => `${appHead('Payment', 'Step 3 of 3')}<div class="body"><div class="card">${prod()}</div>
   <div class="card"><div class="row"><span><b>Cash on Delivery</b><div class="small">Pay ₹349 when it arrives</div></span><span class="pill g">Selected</span></div></div>
   <div class="card"><div class="row"><span><b>UPI</b><div class="small">PhonePe, GPay, Paytm</div></span></div></div>
   <button class="btn o" onclick="A.go('c3')">Place order · ₹349</button>
   <div class="small ctr" style="margin-top:8px">No advance, no warning: this buyer has no refusals.</div></div>` },

 /* C3 · day-of card */
 c3: { p: 'c3', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px">${msg(`<b>Your order arrives today, 2–5 pm</b><br>Kurti, size M<br>${due()}<br><br>आज 2–5 बजे आएगा · ${dueHi()}`)}</div>
   ${qr([['Keep it', "A.go('c3k')"], ['Change time', "A.go('c3t')"], ['Cancel order', "A.sheet(S1x.cancel())"]])}
   ${msg('Cancel now? <b>You won\'t be charged.</b> Cancelling at the door may count as a refusal.', '8:05 am')}</div>` },
 c3k: { p: 'c3', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('<b>Your order arrives today, ' + (V.st.slot || '2–5 pm') + '</b><br>Kurti, size M')}
   ${out(V.st.slot ? 'Change time → ' + V.st.slot : 'Keep it')}${msg('Great. Ramesh will bring it ' + (V.st.slot || '2–5 pm') + (V.st.prepaid && !V.st.normal ? '. Already paid, just be there.' : '. Keep ' + (V.st.normal ? '₹349' : '₹279') + ' ready, or pay by UPI at the door.'), '8:06 am')}
   ${demo([['Rider arrives → Priya accepts and pays', "A.go('c5')"], ['Rider arrives → Priya refuses at the door', "A.go('c4')"]])}</div>` },
 c3t: { p: 'c3', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('Pick a new time. Same rider, no charge.')}
   <div class="slot">${['Today 5–8 pm', 'Tomorrow 10–1', 'Tomorrow 2–5 pm', 'Sat 10–1'].map(s => `<button class="chip ${V.st.slot === s ? 'on' : ''}" onclick="A.set('slot','${s}');A.go('c3t')">${s}</button>`).join('')}</div>
   <button class="btn o" ${V.st.slot ? '' : 'disabled'} onclick="A.go('c3k')">Confirm new time</button></div>` },
 c3c: { p: 'c3', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${out('Cancel order')}
   ${msg(`Order cancelled at 8:07 am. ${V.st.normal ? '' : '<b>₹70 refunded</b> to your UPI in 2–3 days. '}This does <b>not</b> count as a refusal.`, '8:07 am')}
   <div class="card" style="margin-top:10px"><b style="color:var(--plum)">Why this matters</b><div class="small">Cancelled at 8 am: the parcel never leaves the hub, cost ₹0. Refused at 4 pm: forward + reverse trip, cost ₹170.</div></div></div>` },

 /* C4 · refusal recorded */
 c4: { p: 'c4', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px"><div class="msg"><img src="img/door.png" style="width:100%;height:120px;object-fit:cover;border-radius:6px" alt="Photo at the door"><b>Order marked as refused</b><br>at 3:42 pm by rider Ramesh, at your address.<div class="tm">3:43 pm</div></div></div>
   ${qr([['This is right', "A.go('c4r')"], ['I didn\'t refuse: dispute', "A.go('c4d')"]], 'new')}
   ${msg('You have <b>48 hours</b> to dispute.', '3:43 pm')}</div>` },
 c4r: { p: 'c4', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('<b>Order marked as refused</b> at 3:42 pm by rider Ramesh.', '3:43 pm')}${out('This is right', '3:50 pm')}
   ${msg(`Noted. ${V.st.normal ? 'Nothing is charged.' : 'The ₹70 advance covers the return trip.'} The kurti goes to a nearby buyer instead of travelling back.`, '3:50 pm')}
   ${demo([['See it from the rider\'s side', "A.tab('s1','rider')"], ['See the nearby buyer who gets it', "A.tab('s1','buyer')"]])}</div>` },
 c4d: { p: 'c4', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('<b>Order marked as refused</b> at 3:42 pm by rider Ramesh.', '3:43 pm')}${out('I didn\'t refuse: dispute', '3:51 pm')}
   ${msg('Dispute opened. We will check the rider\'s photo, GPS and call log within 24 h.<br><br>If upheld: the refusal is removed and the ₹70 is refunded. If not: it counts once.', '3:51 pm')}</div>` },

 /* C5 · receipt */
 c5: { p: 'c5', h: () => `${appHead('Order delivered', 'Meesho')}<div class="body"><div class="ctr" style="color:var(--green);font-weight:700;font-size:18px;margin:4px 0">Delivered</div>
   <img src="img/kurti.png" style="display:block;margin:0 auto 8px;width:90px" alt="">
   ${V.st.prepaid && !V.st.normal ? `<div class="row b"><span>Paid by UPI</span><span class="v">₹349</span></div><div class="card" style="background:var(--greenL)">Prepaid: no advance, normal returns.</div>` : V.st.normal ? `<div class="row b"><span>Cash paid</span><span class="v">₹349</span></div><div class="row"><span>Total</span><span class="v">₹349</span></div>` :
   `<div class="row b"><span>Cash paid</span><span class="v">₹279</span></div><div class="row b"><span>Advance</span><span class="v">₹70</span></div><div class="row"><span>Total</span><span class="v">₹349</span></div>
   <div class="card new" style="background:var(--greenL)"><b>Nothing extra.</b> The advance was part of the price.</div>
   <div class="new" style="padding:8px"><div class="small"><b>2 more</b> accepted deliveries and the advance goes away</div><div class="bar"><i style="width:33%"></i></div></div>`}
   <button class="btn ln" onclick="A.sheet(S1x.rate())">Rate delivery</button></div>` },

 /* R1 · rider at the door */
 r1: { p: 'r1', h: () => `${appHead('Valmo Rider · Stop 14 / 52', 'Ramesh · Kanpur-04', true)}<div class="body">
   <div class="row"><span>Priya · Kurti M</span><span class="pill o">COD</span></div>
   <div class="card new ctr"><div class="big">Collect ₹279</div><div class="small">₹70 already prepaid by the buyer</div></div>
   <div id="cks"></div>
   <button class="btn g" onclick="A.go('r1d')">Delivered</button>
   <button class="btn rd" onclick="A.go('r2')">Customer refused</button></div>`,
   m: () => { let t = 0; const draw = () => { const w = Math.min(t, 90); $('#cks').innerHTML = ck('Waiting', w >= 90 ? 'ok' : '', `${Math.floor(w / 60)}:${String(w % 60).padStart(2, '0')} (90 s needed)`) + ck('Call 1 placed · verified caller ID', t >= 10 ? 'ok' : '') + ck('Call 2', t >= 40 ? 'ok' : '', t >= 40 ? 'placed' : 'at 0:40'); }; draw(); T.push(setInterval(() => { t += 3; draw(); }, 300)); } },
 r1d: { p: 'r1', h: () => `${appHead('Valmo Rider · Stop 14 / 52', 'Ramesh · Kanpur-04', true)}<div class="body"><div class="done"><div class="ok">✓</div><b>Delivered · ₹279 collected</b><div class="small">Cash to carry today is ₹70 lower on this stop. Priya gets her receipt on WhatsApp.</div></div>
   <button class="btn pl" onclick="A.go('r1')">Next stop · 15 / 52</button></div>` },

 /* R2 · rider refusal flow */
 r2: { p: 'r2', h: () => { const r = V.st.rr, photo = V.st.rph, free = r === 'Wrong item' || r === 'Damaged'; return `${appHead('Why was it refused?', 'Stop 14 · Priya', true)}<div class="body">
   <div class="chips new" style="padding:6px">${['Changed mind', 'No cash', 'Ordered elsewhere', 'Wrong item', 'Damaged', 'Other'].map(c => `<button class="chip ${r === c ? 'on' : ''}" onclick="A.set('rr','${c}');A.go('r2')">${c}</button>`).join('')}</div>
   ${free ? `<div class="card" style="background:var(--greenL);margin-top:8px"><b>Won't count against the customer.</b><div class="small">Wrong or damaged items go back to the seller as a seller fault.</div></div>` : ''}
   <button class="btn pl" onclick="A.go('r2c')">${photo ? 'Retake photo' : 'Take photo of parcel at door'}</button>
   ${photo ? ck('Photo saved with time + location', 'ok') : ''}
   <div class="card" style="margin-top:8px;background:var(--plumL)"><div class="small">Customer will confirm on WhatsApp</div></div>
   ${free ? '' : `<div class="card new"><b>Parcel → Resale pool.</b> Bring it back to the LMDC.</div>`}
   <button class="btn o" ${r && photo ? '' : 'disabled'} onclick="A.go('r2s')">Submit refusal</button>
   ${r && photo ? '' : '<div class="small ctr" style="margin-top:6px">Pick a reason and take a photo to submit</div>'}</div>`; } },
 r2c: { p: 'r2', h: () => `${sb('k')}<div class="body" style="background:#111;color:#fff"><div class="small" style="color:#ccc;margin-bottom:8px">Show the parcel and the door in one frame</div>
   <div class="cam" style="height:420px"><button class="sh" onclick="A.set('rph',1);A.go('r2')" aria-label="Take photo"></button></div><div class="small ctr" style="color:#aaa;margin-top:10px">GPS 26.4499, 80.3319 · 3:42 pm</div></div>` },
 r2s: { p: 'r2', h: () => `${appHead('Refusal submitted', 'Stop 14 · Priya', true)}<div class="body"><div class="done"><div class="ok">✓</div><b>Refusal recorded · ${V.st.rr || 'Changed mind'}</b><div class="small">Photo, time and location attached. Priya can confirm or dispute on WhatsApp for 48 h.</div></div>
   ${ck('Photo saved with time + location', 'ok')}${ck('Attempt verified: counts once', 'ok')}
   <button class="btn pl" onclick="A.go('r1')">Next stop · 15 / 52</button>
   ${demo([['Follow the parcel to the hub', "A.tab('s1','hub')"]])}</div>` },

 /* H1 · hub tablet */
 h1: { p: 'h1', h: () => { const seal = V.st.seal !== 0; return `${sb()}<div class="ab"><div class="av v">V</div><div class="t">LMDC Kanpur-04<small>Refused parcels · today 11</small></div></div><div class="body">
   <div class="card"><div class="prod"><img src="img/parcel.png" alt=""><div><b>#VAL-48213 · Kurti M</b><div class="small">Refused 3:42 pm · Ramesh</div></div></div></div>
   <div class="small">Seal check</div><div class="chips" style="margin:4px 0 6px"><button class="chip ${seal ? 'on' : ''}" onclick="A.set('seal',1);A.go('h1')">Seal intact</button><button class="chip ${seal ? '' : 'on'}" onclick="A.set('seal',0);A.go('h1')">Torn / tampered</button></div>
   ${ck('Weight 412 g vs 410 g on manifest', 'ok')}${ck('Refusal verified (photo + GPS)', 'ok')}${ck('Seal intact', seal ? 'ok' : 'no')}
   ${seal ? `<button class="btn o new" onclick="A.go('h1p')">→ Resale pool (48 h) · hub earns ₹5–10 if sold</button>` : `<button class="btn ln" onclick="A.go('h1r')">Send back to seller (normal return)</button>`}
   <div class="small" style="margin-top:12px">Next in queue</div>
   <div class="row b"><span>#VAL-48219 · Bedsheet</span><span class="pill">To check</span></div><div class="row b"><span>#VAL-48230 · Earrings</span><span class="pill">To check</span></div></div>`; } },
 h1p: { p: 'h1', h: () => `${sb()}<div class="ab"><div class="av v">V</div><div class="t">LMDC Kanpur-04<small>Resale pool</small></div></div><div class="body"><div class="done"><div class="ok">✓</div><b>#VAL-48213 in the resale pool</b><div class="small">Listed sealed, 20% off, prepaid only, for 48 h. Not sold by then → normal return to seller.</div></div>
   <div class="row b"><span>Nearby buyers who viewed / carted</span><span class="v">23</span></div><div class="row b"><span>Blocked: refuser's phone, device, address</span><span class="v">3</span></div><div class="row"><span>Hub earns if sold</span><span class="v">₹5–10</span></div>
   ${demo([['See what a nearby buyer sees', "A.tab('s1','buyer')"]])}</div>` },
 h1r: { p: 'h1', h: () => `${sb()}<div class="ab"><div class="av v">V</div><div class="t">LMDC Kanpur-04<small>Reverse bag</small></div></div><div class="body"><div class="done"><div class="ok" style="background:var(--plum)">↩</div><b>Returned to seller</b><div class="small">Tampered or under-weight parcels never enter resale. They go back normally.</div></div><button class="btn ln" onclick="A.set('seal',1);A.go('h1')">Back to queue</button></div>` },

 /* B1 · lock-screen push */
 b1: { p: 'b1', h: () => `${sb('k')}<div class="lock"><div class="clk">6:10</div><div>Saturday, 3 October</div>
   <div class="notif new" onclick="A.go('b2')"><div class="small">m Meesho · now</div><div class="prod"><div style="flex:1"><b>Your saved kurti is near you, 20% off</b><div class="small">Sealed · size M · delivered tomorrow</div></div><img src="img/kurti.png" alt=""></div>
   <div class="row" style="margin-top:6px"><b style="color:var(--plum)">Buy now</b><b style="color:var(--plum)">View</b></div></div>
   <div class="notif" style="margin-top:10px;opacity:.85"><div class="small">WhatsApp · Meesho ✓ · 2 min</div>The kurti you saved is available near you, sealed, 20% off…</div>
   <div class="small" style="color:#ddd;margin-top:auto;margin-bottom:24px">Tap the notification</div></div>` },
 b2: { p: 'b2', h: () => `${appHead('Meesho · Home')}<div class="body" style="background:#f3eef2"><div class="chips"><span class="chip">Kurtis</span><span class="chip">Sarees</span><span class="chip">Kids</span><span class="chip">Home</span></div></div>`,
   m: () => { A.sheet(S1x.resale()); let s = 35 * 3600 + 59 * 60 + 12; T.push(setInterval(() => { s--; const e = $('#cd'); if (e) e.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000)); } },
 b3: { p: 'b2', h: () => `${appHead('Order placed', 'Meesho')}<div class="body"><div class="done"><div class="ok">✓</div><b>Paid ₹279 by UPI</b><div class="small">Arrives tomorrow from Valmo Kanpur-04, 1 km away. Normal return rights apply.</div></div>
   <div class="card">${prod('₹279 <s class="small">₹349</s>')}</div>
   <div class="card" style="background:var(--orgL)"><b style="color:var(--plum)">What just happened</b><div class="small">The seller is paid the full ₹349. The ₹70 off comes out of the ₹120 reverse trip Valmo no longer pays.</div></div></div>` },
};

/* S1 sheets */
const S1x = {
  upi: (a = 70) => `<b style="color:var(--plum)">Pay ₹${a} to Meesho</b><div class="small" style="margin-bottom:8px">${a === 70 ? 'Advance for' : 'Payment for'} order #MS-90214</div>
    ${['PhonePe', 'Google Pay', 'Paytm'].map(a => `<button class="btn ln" onclick="A.close();A.go('c2ok')">${a}</button>`).join('')}`,
  why: () => `<b style="color:var(--plum)">Why am I seeing this?</b><p class="small" style="margin:6px 0">Your last 2 COD orders were refused at the door (verified with the rider's photo and GPS).</p>
    <p class="small"><b>How it goes away:</b> accept 3 deliveries in a row, or your refusal rate drops below 20%. Old refusals age out.</p>
    <p class="small" style="margin-top:6px"><b>Never counted:</b> wrong item, damaged, late, cancelled before dispatch, or any upheld dispute.</p><button class="btn pl" onclick="A.close()">OK</button>`,
  cancel: () => `<b style="color:var(--plum)">Cancel this order?</b><p class="small" style="margin:6px 0">Cancelling now costs <b>₹0</b>${V.st.normal ? '' : ' and your ₹70 advance is refunded'}. It does not count as a refusal.</p>
    <button class="btn rd" onclick="A.close();A.go('c3c')">Yes, cancel</button><button class="btn ln" onclick="A.close()">Keep my order</button>`,
  rate: () => `<b style="color:var(--plum)">How was Ramesh?</b><div class="chips" style="margin:10px 0">${[1, 2, 3, 4, 5].map(n => `<button class="chip" onclick="A.close();A.toast('Thanks! ${n} star${n > 1 ? 's' : ''} for Ramesh.')">${'★'.repeat(n)}</button>`).join('')}</div>`,
  resale: () => `<div class="pill o new" style="display:block;text-align:center">Near you · delivering tomorrow</div>
    <div class="prod" style="margin:10px 0"><img src="img/kurti.png" alt=""><div><b>Kurti, size M</b><div><b style="font-size:18px;color:var(--plum)">₹279</b> <s class="small">₹349</s></div><div class="small" style="color:var(--green);font-weight:600">20% off · 1 left</div></div></div>
    <div class="chips"><span class="pill g">Sealed, never delivered</span><span class="pill">Prepaid only</span><span class="pill">Normal returns</span></div>
    <div class="small ctr" style="margin-top:10px">Offer ends in <b id="cd" style="color:var(--red)">35:59:12</b></div>
    <button class="btn o" onclick="A.close();A.go('b3')">Buy for ₹279</button>
    <div class="small ctr" style="margin-top:6px">Why you're seeing this: you added this to cart on 1 Oct</div>`,
};

/* ================= SOLUTION 2 · SURE-MEET ================= */
const S2 = {
 c1: { p: 'c1', h: () => `${appHead('Checkout · Address', 'Step 2 of 3')}<div class="body">
   <div class="row"><span class="small">Deliver to</span><b>Priya, Kanpur</b></div><div class="small" style="margin-bottom:8px">H-12, Shastri Nagar, near Hanuman Mandir</div>
   <div class="card new" style="background:var(--orgL)"><b style="color:var(--plum)">+ Add someone who can receive for you</b> <span class="small">(optional)</span>
    <label class="fl">Name</label><input class="f" value="Sunita"><label class="fl">Phone</label><input class="f" value="98•• ••410">
    <div class="chips">${['Neighbour', 'Family', 'Guard'].map(c => `<button class="chip ${(V.st.rel || 'Neighbour') === c ? 'on' : ''}" onclick="A.set('rel','${c}');A.go('c1')">${c}</button>`).join('')}</div>
    <div class="small" style="margin-top:6px">Must be within 3 km. We'll ask them to confirm.</div></div>
   <button class="btn o" onclick="A.toast('Saved. Sunita gets a one-time consent SMS.');setTimeout(()=>A.go('c2'),1400)">Save & continue</button>
   <button class="btn ln" onclick="A.go('c2')">Skip</button></div>` },
 c2: { p: 'c2', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   ${msg('<b>Arriving today, 2–5 pm</b><br>Rider: Ramesh<br><br><b>Won\'t be home?</b> घर पर नहीं होंगे?')}
   ${qr([['I\'ll be home', "A.go('c2h')"], ['Leave with someone I trust', "A.go('c3')"], ['Collect from a Valmo Point', "A.go('c4')"], ['Change day', "A.sheet(S2x.day())"]], 'new')}</div>` },
 c2h: { p: 'c2', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>${msg('<b>Arriving today, 2–5 pm</b><br>Rider: Ramesh')}${out('I\'ll be home')}
   ${msg('Great. Ramesh will call from <b>Valmo Delivery ✓</b> when he is at your door.')}${demo([['Rider reaches the door', "A.go('c5')"]])}</div>` },
 c3: { p: 'c3', h: () => `${appHead('Leave with someone', 'Order #MS-90214')}<div class="body">
   <div class="row b"><span><b>Leave with Sunita</b><div class="small">Neighbour</div></span><span class="v">120 m away</span></div>
   ${V.st.paid ? `<div class="card ctr" style="margin-top:10px"><div class="small">Share this code with Sunita</div><div class="big" style="letter-spacing:8px;font-size:32px">7316</div><div class="small">She shows it to the rider. No code = not delivered.</div></div>
     <button class="btn o new" onclick="A.toast('Code 7316 sent to Sunita on WhatsApp.')">Share code 7316 with Sunita</button>${demo([['See Sunita\'s consent SMS', "A.tab('s2','backup')"]])}` :
   `<div class="card new" style="background:var(--orgL);margin-top:10px">This order is COD. <b>Pay ₹349 online</b> to hand it to someone else.</div>
     <button class="btn o" onclick="A.set('paid',1);A.toast('₹349 paid by UPI.');A.go('c3')">Pay ₹349 & confirm</button>
     <div class="small" style="margin-top:8px">Prepaid only: Sunita never handles cash.</div>`}</div>` },
 c4: { p: 'c4', h: () => `${appHead('Collect from a Valmo Point', 'Order #MS-90214')}<div class="body">
   <div class="map new"><div class="ring" style="left:40%;top:30%;width:90px;height:90px"></div><div class="pin" style="left:58%;top:22%"></div><div class="lb" style="left:52%;top:6%">Sharma General Store</div><div class="lb" style="left:8%;top:78%;background:var(--plumL)">You · H-12</div></div>
   <img src="img/shop.png" alt="Valmo Point shop" style="width:100%;border-radius:8px;margin-bottom:6px">
   <div class="row b"><span>Distance</span><span class="v">600 m</span></div><div class="row b"><span>Open</span><span class="v">9 am – 9 pm</span></div><div class="row b"><span>Holds your parcel</span><span class="v">5 days</span></div>
   ${V.st.pt ? `<div class="card ctr new"><div class="small">Your pickup code</div><div class="big" style="letter-spacing:8px">4821</div></div><button class="btn ln" onclick="A.tab('s2','point')">See the shop's app →</button>` : `<button class="btn o" onclick="A.set('pt',1);A.go('c4')">Choose this</button>`}</div>` },
 c5: { p: 'c5', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   ${msg('<b>Ramesh is at your door now.</b><br>Tap if you can\'t come out.', '3:38 pm')}
   ${qr([['I\'m coming', "A.toast('Ramesh will wait. He can see your reply.')"], ['Leave with backup', "A.go('c3')"], ['Send to Valmo Point', "A.go('c4')"], ['Cancel', "A.toast('Order cancelled. The parcel goes back to the hub, not counted as a refusal.')"]])}
   <div class="call new"><div class="dot">✆</div><div><div class="small" style="color:#bbb">Incoming call</div><b>Valmo Delivery</b> <span class="tick">✓</span></div></div>
   ${demo([['Priya doesn\'t answer → rider completes the checks', "A.go('c6')"]])}</div>` },
 c6: { p: 'c6', h: () => `${waHead()}<div class="body wa"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px">${msg('We couldn\'t reach you at 3:40 pm. <b>Ramesh waited 2 min and called twice.</b>', '3:41 pm')}</div>
   ${qr([['Retry tomorrow', "A.toast('Booked: tomorrow 2–5 pm, same rider.')"], ['Valmo Point · 600 m · 4821', "A.go('c4')"], ['Cancel', "A.toast('Cancelled. Not counted as a refusal.')"]])}
   ${msg('Did a rider come to your address today?', '3:41 pm')}
   ${V.st.came == null ? qr([['Yes', "A.set('came',1);A.go('c6')"], ['No', "A.set('came',0);A.go('c6')"]], 'new') :
     out(V.st.came ? 'Yes' : 'No', '3:45 pm') + msg(V.st.came ? 'Thanks. Pick a next step above.' : 'Sorry about that. <b>Your "No" counts against the rider, not you.</b> We\'ll check his GPS and call log, and re-try tomorrow at no cost.', '3:45 pm')}</div>` },

 /* rider */
 r1: { p: 'r1', h: () => `${appHead('Stop 14 · Priya', 'Valmo Rider · Ramesh', true)}<div class="body">
   <div class="map new"><div class="ring" style="left:34%;top:18%;width:100px;height:100px"></div><div class="pin" style="left:46%;top:36%"></div><div class="lb" style="left:6%;top:6%">Last handover point</div></div>
   <div class="row b"><span>Landmark</span><span class="v">Hanuman Mandir</span></div>
   <div class="card new" style="background:var(--greenL)">Address confidence: <b>High</b> · delivered here 3 times</div>
   <div class="card new" style="background:var(--orgL)">Plan: <b>Leave with Sunita</b> · code needed</div>
   <button class="btn pl" onclick="A.go('r2')">Start navigation</button></div>` },
 r2: { p: 'r2', h: () => `${appHead('Attempt checks', 'Stop 14 · Priya', true)}<div class="body"><div id="cks"></div>
   <button class="btn new" id="mnr" disabled onclick="A.go('r3')">Mark not reachable</button><div class="small ctr" id="mnrh" style="margin-top:8px">Unlocks when every tick is green</div>
   <button class="btn g" onclick="A.toast('Delivered. Code 7316 checked.')">Customer came out → Delivered</button>
   ${demo([['Rider leaves early (skips the checks)', "A.go('r4')"]])}</div>`,
   m: () => { let t = 0; const draw = () => { const w = Math.min(t, 90), all = t >= 90; $('#cks').innerHTML = ck('At the address · GPS verified', 'ok') + ck('Waiting', all ? 'ok' : '', `${Math.floor(w / 60)}:${String(w % 60).padStart(2, '0')} / 1:30`) + ck('Call 1 · 3:38 pm', t >= 15 ? 'ok' : '') + ck('Call 2 at 3:40 pm', t >= 75 ? 'ok' : '', 'spaced 2 min') + ck('WhatsApp ping sent', t >= 20 ? 'ok' : ''); const b = $('#mnr'); b.disabled = !all; b.className = 'btn new ' + (all ? 'rd' : ''); $('#mnrh').textContent = all ? 'All checks green: visit proven' : 'Unlocks when every tick is green'; }; draw(); T.push(setInterval(() => { t += 3; draw(); if (t > 95) clearT(); }, 160)); } },
 r3: { p: 'r3', h: () => `${appHead('Attempt result', 'Stop 14 · Priya', true)}<div class="body"><div class="ctr" style="color:var(--green);font-weight:700;font-size:18px">Attempt verified</div>
   <div class="card new ctr" style="margin-top:10px"><b>+₹3 added to today's pay</b></div>${ck('Customer notified on WhatsApp', 'ok')}${ck('Parcel → retry tomorrow', 'ok')}
   <div class="row b"><span>Today</span><span class="v">₹9 · 3 verified</span></div><button class="btn pl" onclick="A.go('r1')">Next stop · 15 / 52</button>
   ${demo([['See what Priya receives', "A.tab('s2','cust');A.go('c6')"]])}</div>` },
 r4: { p: 'r4', h: () => `${appHead('Attempt result', 'Stop 14 · Priya', true)}<div class="body"><div class="ctr" style="color:var(--red);font-weight:700;font-size:18px">Attempt not verified</div>
   <div class="card" style="margin-top:10px">${ck('Left the radius after 40 s', 'no')}</div>
   <div class="small">Parcel re-queued for a real attempt. No fee.</div>
   <button class="btn ln new" onclick="A.sheet(S2x.appeal())">Appeal with photo / note</button>
   <div class="small" style="margin-top:12px">Quality score <b>82 / 100</b></div><div class="bar"><i style="width:82%"></i></div></div>` },

 /* Valmo Point partner app */
 p1: { p: 'p1', h: () => `${sb()}<div class="ab"><div class="av v">V</div><div class="t">Valmo Point · Sharma Store<small>वाल्मो पॉइंट</small></div></div><div class="body">
   <div class="slot" style="grid-template-columns:repeat(3,1fr);margin-bottom:10px">${[['6', 'to receive'], ['4', 'waiting'], ['₹72', 'this week']].map(([a, b]) => `<div class="card ctr" style="margin:0"><div class="big">${a}</div><div class="small">${b}</div></div>`).join('')}</div>
   ${ck('Parcel QR scanned · #VAL-48213', 'ok')}
   <div class="new" style="padding:8px;margin-top:6px"><b>ग्राहक से कोड पूछें · Ask for the code</b>
   <div class="otp">${[0, 1, 2, 3].map(i => `<input maxlength="1" inputmode="numeric" id="o${i}" oninput="S2x.otp(${i})">`).join('')}</div><div id="oerr"></div>
   <div class="small ctr">Hint for the demo: Priya's code is 4821</div></div>
   <div id="pay"></div></div>`, m: () => $('#o0').focus() },
 p1d: { p: 'p1', h: () => `${sb()}<div class="ab"><div class="av v">V</div><div class="t">Valmo Point · Sharma Store</div></div><div class="body"><div class="done"><div class="ok">✓</div><b>Handed over to Priya</b><div class="small">₹349 collected by ${V.st.pm || 'UPI QR'}. You earn ₹12 for this parcel.</div></div>
   <div class="row b"><span>This week</span><span class="v">₹84</span></div><button class="btn pl" onclick="A.go('p1')">Next parcel</button></div>` },

 /* backup consent SMS */
 s1: { p: 's1', h: () => `${sb()}<div class="ab" style="background:#3c3c3c"><div class="av">M</div><div class="t">VM-MEESHO<small>SMS</small></div></div><div class="body" style="background:#f2f2f2"><div class="day"><span>TODAY</span></div>
   <div class="new" style="margin-bottom:10px">${msg('<b>Priya</b> named you to receive a Meesho parcel <b>today, 2–5 pm</b>.<br>She will share a code with you.<br><br>Reply <b>STOP</b> to decline.', '8:06 am')}</div>
   ${V.st.cons == null ? `<div class="chips"><button class="chip" onclick="A.set('cons',1);A.go('s1')">OK, I'll be at home</button><button class="chip" onclick="A.set('cons',0);A.go('s1')">STOP</button></div>` :
     out(V.st.cons ? 'OK, I\'ll be at home' : 'STOP', '8:09 am') + msg(V.st.cons ? 'Thanks! Ramesh will ask you for Priya\'s code.' : 'Done. You won\'t be asked again, and your number is deleted from this order.', '8:09 am')}</div>` },
};
const S2x = {
  day: () => `<b style="color:var(--plum)">Pick another day</b><div class="slot" style="margin:10px 0">${['Tomorrow 10–1', 'Tomorrow 2–5', 'Mon 10–1', 'Mon 5–8 pm'].map(s => `<button class="chip" onclick="A.close();A.toast('Moved to ${s}. Same rider, no charge.')">${s}</button>`).join('')}</div>`,
  appeal: () => `<b style="color:var(--plum)">Appeal this result</b><div class="chips" style="margin:10px 0"><button class="chip">Gate was locked</button><button class="chip">GPS drift</button><button class="chip">Customer asked me to leave</button></div>
    <button class="btn ln">Add photo</button><button class="btn pl" onclick="A.close();A.toast('Appeal sent. Reviewed within 24 h.')">Send appeal</button>`,
  otp(i) { const e = $('#o' + i); e.value = e.value.replace(/\D/g, ''); if (e.value && i < 3) $('#o' + (i + 1)).focus();
    const c = [0, 1, 2, 3].map(k => $('#o' + k).value).join('');
    if (c.length === 4) { if (c === '4821') { $('#oerr').innerHTML = '<div class="ck ok" style="justify-content:center"><i></i>Code ✓ · COD ₹349</div>'; $('#pay').innerHTML = `<button class="btn o" onclick="A.set('pm','UPI QR');A.go('p1d')">Collect by UPI QR</button><button class="btn ln" onclick="A.set('pm','cash');A.go('p1d')">Collect cash</button>`; }
      else { $('#oerr').innerHTML = '<div class="err">Wrong code. Do not hand over.</div>'; $('#pay').innerHTML = ''; } } },
};
window.S1x = S1x; window.S2x = S2x;
const SC = { s1: S1, s2: S2 };

/* ---------------- landing ---------------- */
function home() {
  return `<section class="hero"><h1>17 of every 100 Valmo parcels come back. This prototype shows the two fixes we would ship first.</h1>
   <div class="cta"><button class="btn o" onclick="A.tab('live')">▶ Play the live demo · one order, every side (3 min)</button><button class="btn ln" onclick="A.tab('impact')">See the impact at Valmo scale</button></div>
   <p>Start with the <b>live demo</b>: four short stories, each following one order across the buyer, rider, hub, a Valmo Point shop and a nearby buyer, ending with what that parcel costs Valmo today vs with our fix. Or browse every screen by role below. Each solution is clickable from every side it touches: the buyer, the rider, the hub, the nearby shop. Screens follow the wireframes in our Round 2 deck. <b>Orange dashed outline</b> marks what is new on each screen; grey <b>Demo</b> buttons simulate what happens next.</p>
   <div class="kpis"><div><b>17%</b><span>RTO on Valmo (80% COD × 20% + 20% prepaid × 5%)</span></div><div><b>₹170</b><span>lost per RTO (₹50 forward + ₹120 reverse)</span></div><div><b>210</b><span>COD shoppers surveyed by the team</span></div><div><b>2</b><span>solutions, prototyped across 8 roles</span></div></div></section>
   <section class="sols">
    <div class="sol"><h3>1 · Commit-to-COD</h3><div class="sub">For buyers who <b>won't</b> take the parcel: refusal, changed mind, ordered elsewhere</div>
     <table><tr><td>Normal buyer</td><td>Sees only a day-of card to keep, move or cancel for free</td></tr><tr><td>Serial refuser</td><td>Warned first, then a 20% advance (max ₹100), part of the price, never a fee</td></tr><tr><td>Rider</td><td>Collects less cash; refusals need a reason + photo</td></tr><tr><td>Refused parcel</td><td>Sold sealed to a nearby buyer within 48 h instead of the ₹120 trip back</td></tr></table>
     <div class="go"><button onclick="A.tab('s1','cust')">Customer flow</button><button class="s" onclick="A.tab('s1','rider')">Rider</button><button class="s" onclick="A.tab('s1','hub')">Hub</button><button class="s" onclick="A.tab('s1','buyer')">Nearby buyer</button></div></div>
    <div class="sol"><h3>2 · Sure-Meet</h3><div class="sub">For buyers who <b>can't</b> be met: not home, unreachable, fake "not reachable" attempts</div>
     <table><tr><td>Buyer</td><td>Chooses before the trip: be home, leave with someone trusted, or a Valmo Point 600 m away</td></tr><tr><td>Rider</td><td>"Not reachable" unlocks only after 100 m, 90 s, 2 calls; +₹3 when verified</td></tr><tr><td>Valmo Point shop</td><td>Holds the parcel 5 days, OTP handover, UPI first</td></tr><tr><td>Backup receiver</td><td>Asked for consent by SMS first; can reply STOP</td></tr></table>
     <div class="go"><button onclick="A.tab('s2','cust')">Customer flow</button><button class="s" onclick="A.tab('s2','rider')">Rider</button><button class="s" onclick="A.tab('s2','point')">Valmo Point</button><button class="s" onclick="A.tab('s2','backup')">Backup receiver</button></div></div>
   </section>
   <div class="foot">Team Shooters · IIT Kanpur · Chitransh Gangwar, Atharva Katiyar, Abhay Kumar · Meesho DICE Challenge S3, Business Track (Valmo RTO). Front-end prototype with sample data; no real payments, messages or calls.</div>`;
}

/* ---------------- render ---------------- */
function render() {
  $('#tabs').innerHTML = [['home', 'Overview'], ['live', '▶ Live demo'], ['s1', 'Commit-to-COD screens'], ['s2', 'Sure-Meet screens'], ['impact', 'Impact']].map(([k, l]) => `<button class="${V.view === k ? 'on' : ''}" onclick="A.tab('${k}')">${l}</button>`).join('');
  const app = $('#app');
  window.CLK = null;
  if (V.view === 'home') { app.innerHTML = home(); return; }
  if (V.view === 'live') { app.innerHTML = LIVE.view(); LIVE.mount(); return; }
  if (V.view === 'impact') { app.innerHTML = IMPACT.view(); IMPACT.mount(); return; }
  const sol = V.view, roles = R[sol], role = roles[V.role], sc = SC[sol][V.scr], p = P[sol][sc.p];
  const steps = role.steps(), idx = steps.findIndex(s => s[0] === sc.p);
  const firstScr = k => k; // panel key == entry screen id
  app.innerHTML = `
   <div class="roles"><span class="lbl">View as</span>${Object.entries(roles).map(([k, r]) => `<button class="${k === V.role ? 'on' : ''}" onclick="A.role('${k}')">${r.name}</button>`).join('')}</div>
   <div class="stage">
    <div class="phone"><div class="scr">${sc.h()}</div><div id="ov"></div></div>
    <aside class="side">
     <div class="hd"><div class="tag">${p[0]}</div><div><h2>${p[1]}</h2><div class="when">${p[2]}</div></div></div>
     <div class="bd"><div><div class="k">Today</div><div class="today">${p[3]}</div></div><div class="new" style="outline:0"><div class="k">What's new</div><div>${p[4]}</div></div>
      <div class="stat"><div class="h">${p[5]}</div><div class="small">${p[6]}</div></div></div>
     ${role.scen ? `<div class="scen">Buyer type: <button class="${V.st.normal ? '' : 'on'}" onclick="A.scen(false)">Serial refuser (2 verified refusals)</button><button class="${V.st.normal ? 'on' : ''}" onclick="A.scen(true)">Normal buyer</button></div>` : ''}
     <div class="steps">${steps.map(([k, l]) => `<button class="${k === sc.p ? 'on' : ''}" onclick="A.go('${firstScr(k)}')">${l} · ${P[sol][k][1]}</button>`).join('')}</div>
     <div class="nav"><button ${idx <= 0 ? 'disabled' : ''} onclick="A.go('${idx > 0 ? steps[idx - 1][0] : ''}')">← Previous</button><button class="p" ${idx >= steps.length - 1 ? 'disabled' : ''} onclick="A.go('${idx < steps.length - 1 ? steps[idx + 1][0] : ''}')">Next screen →</button></div>
     <div class="hint">Tap the buttons inside the phone; they work. Data is sample data for one order: Priya, Kanpur, kurti size M, ₹349, rider Ramesh.</div>
    </aside></div>`;
  if (sc.m) sc.m();
}
render();
