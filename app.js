// BCC Shield — логика приложения (клиентский режим + режим разработчика)
{
const D = window.DATA, KEY = 'bccshield-v2';
const $ = s => document.querySelector(s);
const fmt = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('ru-RU') + ' ₸';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const dt = ts => new Date(ts).toLocaleString('ru-RU', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
const IC = {
  home:'<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/>', send:'<path d="M4 12l16-8-6 17-3-7z"/>', list:'<path d="M5 6h14M5 12h14M5 18h9"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', shield:'<path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z"/>',
  pay:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18"/>', wallet:'<path d="M4 7h15a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h12"/><circle cx="16" cy="14" r="1.5"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  phone:'<path d="M5 3h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A18 18 0 013 5a2 2 0 012-2z"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
  play:'<path d="M7 4l13 8-13 8z"/>', lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', bell:'<path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>', qr:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  swap:'<path d="M5 8h13l-3-3M19 16H6l3 3"/>', globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
  gov:'<path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>', card:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/>',
  down:'<path d="M12 4v13M6 11l6 6 6-6M5 20h14"/>', cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  mobile:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', car:'<path d="M4 16v-4l2-5h12l2 5v4z"/><circle cx="8" cy="16.5" r="1.8"/><circle cx="16" cy="16.5" r="1.8"/><path d="M4 12h16"/>',
  house:'<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>', wifi:'<path d="M3 9a13 13 0 0118 0M6 12.5a8.5 8.5 0 0112 0M9 16a4 4 0 016 0"/><circle cx="12" cy="19" r="1"/>',
  doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>', edu:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  bus:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M8 21v-3M16 21v-3"/>', percent:'<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  umbrella:'<path d="M3 12a9 9 0 0118 0z"/><path d="M12 12v7a2 2 0 01-4 0"/>', med:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
  ticket:'<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M14 6v12"/>',
  bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 016 0"/>', plane:'<path d="M2.5 13l19-8-6 15-3.5-6z"/><path d="M12 14l9.5-9"/>',
  heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>', safe:'<rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.5"/><path d="M12 8v1M6 19v2M18 19v2"/>',
  chart:'<path d="M4 20V4M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/>', gold:'<path d="M3 18l3-6h6l3 6zM9 12l3-6h6l3 6"/>', cashbag:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.5M18 14.5v.5"/>',
  gift:'<rect x="3" y="8" width="18" height="5"/><path d="M5 13v8h14v-8M12 8v13M12 8c-2-4-6-3-5 0M12 8c2-4 6-3 5 0"/>', briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 12h18"/>',
  pin:'<path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>', key:'<circle cx="8" cy="14" r="4"/><path d="M11 11l9-9M17 5l2 2M15 7l2 2"/>'
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const CASES = D.genCases();
const now = Date.now(), DAY = 864e5;

const DEF = () => ({
  mode:'user', ai:true, scr:'home', dtab:'map', city:null, ftype:'all', fper:90, csearch:'', hfilter:'all',
  user:{name:'Арман Касымов', first:'Арман', age:34, city:'Алматы', score:86, balance:1248300, deposit:3500000, frozen:0, arrested:false, avg:40000,
        guardian:{name:'Ерлан Касымов', rel:'брат', phone:'+7 777 ••• 18 03'}},
  contacts:[{n:'Мама (Сауле К.)', to:'+7 701 ••• 45 12'}, {n:'Ерлан Касымов', to:'+7 777 ••• 18 03'}, {n:'Айжан (жена)', to:'+7 705 ••• 77 21'}],
  known:['+7 701 ••• 45 12','+7 777 ••• 18 03','+7 705 ••• 77 21'],
  ops:[
    {id:1, ts:now-2*36e5, title:'Magnum Cash&Carry', sub:'Покупка', amt:-18450, st:'ok'},
    {id:9, ts:now-5*36e5, title:'Кешбэк BCC Club', sub:'Начисление кешбэка', amt:3120, st:'ok'},
    {id:2, ts:now-DAY, title:'ТОО «Тех Сервис»', sub:'Зарплата', amt:620000, st:'ok'},
    {id:3, ts:now-DAY*1.3, title:'Яндекс Go', sub:'Такси', amt:-2350, st:'ok'},
    {id:4, ts:now-DAY*2, title:'Мама (Сауле К.)', sub:'Перевод по номеру', amt:-50000, st:'ok'},
    {id:5, ts:now-DAY*3, title:'Beeline', sub:'Мобильная связь', amt:-3990, st:'ok'},
    {id:6, ts:now-DAY*4, title:'Алсеко', sub:'Коммунальные услуги', amt:-27800, st:'ok'},
    {id:7, ts:now-DAY*12, title:'Данияр Т.', sub:'Перевод на карту', amt:-95000, st:'warn', risk:45, hits:['newRecipient','newDevice','amountAnomaly']},
    {id:8, ts:now-DAY*41, title:'4400 43•• 5521', sub:'Перевод на карту', amt:-260000, st:'blocked', risk:75, hits:['newRecipient','bigShare','amountAnomaly','night','newDevice']}
  ],
  pts:[
    {id:1, ts:now-DAY*12, delta:-5, reason:'Перевод 95 000 ₸ с нового устройства (риск 45)', opId:7, st:'auto'},
    {id:2, ts:now-DAY*35, delta:1, reason:'30 дней без инцидентов', st:'auto'},
    {id:3, ts:now-DAY*41, delta:-10, reason:'Ночной перевод 260 000 ₸ новому получателю (риск 75)', opId:8, st:'auto'}
  ],
  appeals:[], events:[],
  notes:[{ts:now-DAY, text:'Зачислена зарплата 620 000 ₸'}, {ts:now-DAY*3, text:'Рейтинг доверия: 86 из 100 — уровень «Надёжный»'}],
  w:Object.fromEntries(Object.entries(D.FACTORS).map(([k, v]) => [k, v[1]])), thr:{block:70, warn:40}, seq:100,
  card:{design:'gold', blocked:false, online:true, limit:1000000}, cb:{sel:['Супермаркеты','Такси','Рестораны'], acc:12480},
  autopay:[{id:91, name:'Beeline', amt:3990, day:5, on:true}, {id:92, name:'Алсеко', amt:27800, day:15, on:true}, {id:93, name:'Казахтелеком', amt:8990, day:20, on:false}],
  autotr:[{id:94, to:'Мама (Сауле К.)', amt:50000, day:1, on:true}], invest:420000, usd:0, sec:{dcvv:true, loginNotify:true, selfban:false}, psearch:'', hsearch:''
});
let S;
try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); S = saved ? Object.assign(DEF(), saved) : DEF(); } catch (e) { S = DEF(); }
for (const [k, v] of Object.entries(D.FACTORS)) if (S.w[k] == null) S.w[k] = v[1];
if (S.personaBackup) { Object.assign(S.user, S.personaBackup); delete S.personaBackup; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const id = () => ++S.seq;

/* ---------- общие помощники ---------- */
const level = s => s >= 80 ? ['Надёжный','t-ok','#2fbf71'] : s >= 50 ? ['Внимание','t-warn','#d4af37'] : ['Риск','t-bad','#e5484d'];
function ring(s, size = 150) {
  const [, , c] = level(s), r = 52, C = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="#8883" stroke-width="11"/><circle class="arc" cx="60" cy="60" r="${r}" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C * s / 100} ${C}"/></svg><div class="v"><b style="font-size:${size / 3.6}px">${s}</b><span class="xs mute">из 100</span></div></div>`;
}
let animNext = true, flashBal = false, aiAnim = false, shownBal = null, balRaf;
function countBal() {
  const el = document.querySelector('.bankcard .bal'), to = S.user.balance;
  if (!el) { shownBal = to; return; }
  const from = shownBal == null ? to : shownBal; shownBal = to;
  if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  cancelAnimationFrame(balRaf); const t0 = performance.now();
  const f = t => { const p = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(from + (to - from) * e); if (p < 1) balRaf = requestAnimationFrame(f); };
  el.textContent = fmt(from); balRaf = requestAnimationFrame(f);
}
let toastT;
function toast(m) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.append(t); } t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800); }
let modalT;
function modal(html, wide) { clearTimeout(modalT); $('#layer').innerHTML = `<div class="ov" data-act="ovbg"><div class="box ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`; }
function closeModal() { const ov = $('#layer .ov'); if (!ov) return; ov.classList.add('out'); clearTimeout(modalT); modalT = setTimeout(() => { $('#layer').innerHTML = ''; }, 200); }
function note(text) { S.notes.unshift({ts:Date.now(), text}); S.notes = S.notes.slice(0, 30); }
function addPts(delta, reason, opId) {
  const before = S.user.score;
  S.user.score = Math.max(0, Math.min(100, S.user.score + delta));
  const p = {id:id(), ts:Date.now(), delta:S.user.score - before, reason, opId, st:'auto'};
  if (p.delta) S.pts.unshift(p);
  return p;
}
function logEvent(e) { S.events.unshift(Object.assign({id:id(), ts:Date.now(), city:S.user.city, ai:S.ai}, e)); S.events = S.events.slice(0, 200); }
const facName = k => D.FACTORS[k]?.[0] || k;
function facList(hits) { return hits.map(k => `<div class="fac"><span>${facName(k)}</span><b>+${S.w[k] ?? 0}</b></div>`).join(''); }
function riskBar(r) { const c = r >= S.thr.block ? 'var(--bad)' : r >= S.thr.warn ? 'var(--warn)' : 'var(--ok)'; return `<div class="meter"><i style="width:${r}%;background:${c}"></i></div>`; }

/* ---------- ИИ-скоринг ---------- */
function score(op, bal = S.user.balance) {
  const h = new Set(Object.keys(op.ctx || {}));
  if (op.kind !== 'payment' && !S.known.includes(op.to)) h.add('newRecipient');
  if (op.amount > bal * 0.5) h.add('bigShare');
  if (op.amount > S.user.avg * 3) h.add('amountAnomaly');
  if (new Date().getHours() < 6) h.add('night');
  const hits = [...h].filter(k => S.w[k] != null).sort((a, b) => S.w[b] - S.w[a]);
  return {risk:Math.min(100, hits.reduce((s, k) => s + S.w[k], 0)), hits};
}
const protectedAge = a => (a >= 6 && a <= 18) || a >= 55;

function runOp(op) {
  return new Promise(res => {
    op.amount = Math.round(op.amount);
    if (S.user.arrested) { modal(`<h2>Операции ограничены</h2><p>Счёт заблокирован до окончания проверки.</p><button class="btn full" data-act="close">Понятно</button>`); return res('denied'); }
    if (S.card.blocked && op.kind !== 'transfer') { modal(`<h2>Карта заблокирована</h2><p class="small">Разблокируйте #картакарта в настройках карты, чтобы оплачивать покупки и услуги.</p><button class="btn full" data-act="close">Понятно</button>`); return res('denied'); }
    if (op.amount > S.card.limit) { modal(`<h2>Превышен лимит</h2><p class="small">Лимит на одну операцию — ${fmt(S.card.limit)}. Изменить его можно в настройках карты.</p><button class="btn full" data-act="close">Понятно</button>`); return res('denied'); }
    if (!(op.amount > 0) || op.amount > S.user.balance) { modal(`<h2>Недостаточно средств</h2><p class="mute">Доступно ${fmt(S.user.balance)}.</p><button class="btn full" data-act="close">Понятно</button>`); return res('denied'); }
    const sc = score(op);
    if (!S.ai) return afterAI(op, sc, 0, res);
    modal(`<div style="text-align:center"><div class="spin"></div><h3>BCC AI проверяет операцию</h3><div class="scan"></div><p class="mute small">Анализ получателя, суммы, устройства и поведения</p></div>`);
    setTimeout(() => {
      if (sc.risk >= S.thr.block) blockOp(op, sc, res);
      else if (sc.risk >= S.thr.warn) warnOp(op, sc, res);
      else { closeModal(); afterAI(op, sc, 0, res); }
    }, 1300);
  });
}
function afterAI(op, sc, pts, res) {
  if (protectedAge(S.user.age) && op.amount > S.user.balance * 0.7) return guardianFlow(op, sc, pts, res);
  complete(op, sc, pts, res);
}
function complete(op, sc, pts, res) {
  S.user.balance -= op.amount;
  const o = {id:id(), ts:Date.now(), title:op.toName || op.to, sub:op.kind === 'payment' ? op.sub : op.kind === 'card' ? 'Оплата картой' : 'Перевод', amt:-op.amount, st:pts ? 'warn' : 'ok', risk:S.ai ? sc.risk : null, hits:S.ai ? sc.hits : []};
  S.ops.unshift(o);
  if (pts) addPts(pts, `Подозрительная операция ${fmt(op.amount)} (риск ${sc.risk})`, o.id);
  if (op.kind !== 'payment' && !S.known.includes(op.to)) S.known.push(op.to);
  note(`${op.kind === 'payment' ? 'Оплата' : 'Перевод'} ${fmt(op.amount)} — ${op.toName || op.to}`);
  logEvent({type:op.scen || 'manual', title:`${o.sub}: ${o.title}`, amount:op.amount, risk:sc.risk, hits:sc.hits, result:S.ai ? (pts ? 'warn' : 'passed') : 'passed (ИИ выключен)'});
  save(); render();
  modal(`<div style="text-align:center"><div class="okmark"><svg class="ic" style="width:30px;height:30px" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>${op.kind === 'payment' ? 'Оплачено' : 'Перевод выполнен'}</h2><p class="bal" style="font-size:32px">${fmt(op.amount)}</p><p class="mute">${esc(op.toName || '')} ${esc(op.to)}</p>${!S.ai ? '<p class="small" style="color:var(--bad)">ИИ-защита выключена — операция не проверялась.</p>' : ''}<button class="btn full" data-act="close">Готово</button></div>`); res('passed');
}
function blockOp(op, sc, res) {
  const pen = op.ctx?.transit ? -25 : -15;
  const o = {id:id(), ts:Date.now(), title:op.toName || op.to, sub:op.kind === 'card' ? 'Оплата картой' : 'Перевод', amt:-op.amount, st:'blocked', risk:sc.risk, hits:sc.hits};
  S.ops.unshift(o);
  const p = addPts(pen, `Заблокирована операция ${fmt(op.amount)} (риск ${sc.risk})`, o.id);
  let frozenTxt = '';
  if (op.ctx?.transit && RUN && RUN.incomes) { S.user.balance -= RUN.incomes; S.user.frozen += RUN.incomes; frozenTxt = `<p class="small"><b>Заморожено ${fmt(RUN.incomes)}</b> — входящие от незнакомых лиц, до проверки службой безопасности.</p>`; RUN.incomes = 0; }
  note(`BCC AI заблокировал операцию ${fmt(op.amount)}. ${p.delta} баллов доверия`);
  logEvent({type:op.scen || 'manual', title:`${o.sub}: ${o.title}`, amount:op.amount, risk:sc.risk, hits:sc.hits, result:'blocked'});
  save(); render();
  modal(`<div class="aibox"><div style="display:flex;gap:10px;align-items:center;color:var(--bad)">${ic('shield')}<h2 style="margin:0">BCC AI остановил операцию</h2></div>
    <p class="small" style="margin-top:10px">${fmt(op.amount)} → ${esc(op.toName || '')} ${esc(op.to)}</p>
    <div class="small" style="display:flex;justify-content:space-between"><span>Оценка риска</span><b>${sc.risk} / 100</b></div>${riskBar(sc.risk)}
    <div style="margin-top:12px">${facList(sc.hits)}</div></div>
    ${frozenTxt}<p class="small" style="margin-top:12px">Снято <b>${-p.delta} баллов</b> доверия (сейчас ${S.user.score}). Если операция настоящая — оспорьте списание и приложите доказательства.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-act="close">Понятно</button><button class="btn sec" data-act="appeal" data-id="${p.id}">Оспорить</button></div>`);
  res('blocked');
}
function warnOp(op, sc, res) {
  modal(`<div style="display:flex;gap:10px;align-items:center;color:#d4af37">${ic('alert')}<h2 style="margin:0">Проверьте операцию</h2></div>
    <p class="small" style="margin-top:10px">Перевод ${fmt(op.amount)} → ${esc(op.toName || op.to)} похож на мошеннический.</p>
    <div class="small" style="display:flex;justify-content:space-between"><span>Оценка риска</span><b>${sc.risk} / 100</b></div>${riskBar(sc.risk)}
    <div style="margin:10px 0">${facList(sc.hits)}</div>
    <label style="display:flex;gap:10px;align-items:flex-start;font-weight:500"><input type="checkbox" id="wOk" style="width:22px;min-height:22px;margin-top:2px">Меня никто не торопит и не диктует по телефону, что делать</label>
    <p class="xs mute">Если продолжить, снимется ${5} баллов доверия. Их можно вернуть через апелляцию.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ok" id="wCancel">Отменить перевод</button><button class="btn sec" id="wGo" disabled>Всё равно перевести</button></div>`);
  $('#wOk').onchange = e => $('#wGo').disabled = !e.target.checked;
  $('#wCancel').onclick = () => { closeModal(); logEvent({type:op.scen || 'manual', title:'Отмена после предупреждения: ' + (op.toName || op.to), amount:op.amount, risk:sc.risk, hits:sc.hits, result:'cancelled'}); save(); toast('Перевод отменён'); res('cancelled'); };
  $('#wGo').onclick = () => { closeModal(); afterAI(op, sc, -5, res); };
}
function guardianFlow(op, sc, pts, res) {
  const g = S.user.guardian, pct = Math.round(op.amount / S.user.balance * 100);
  modal(`<h2>Нужно подтверждение доверенного лица</h2>
    <p class="small">Для клиентов 6–18 и 55+ переводы больше 70% баланса подтверждает близкий человек. Этот перевод — <b>${pct}% баланса</b>.</p>
    <p class="small mute">Запрос отправлен: ${esc(g.name)} (${esc(g.rel)}), ${esc(g.phone)}. Ожидание до 30 минут.</p>
    <div class="gphone"><div class="xs" style="opacity:.7">Телефон: ${esc(g.name)}</div>
      <div style="background:#ffffff14;border-radius:12px;padding:12px;margin:8px 0"><b>BCC Shield · нужно ваше решение</b>
      <p class="small" style="margin:6px 0">${esc(S.user.first)} хочет перевести <b>${fmt(op.amount)}</b> → ${esc(op.toName || op.to)}.</p>
      ${S.ai && sc.hits.length ? `<p class="xs" style="margin:0;color:#e8c766">ИИ: ${sc.hits.slice(0, 2).map(facName).join('; ')}. Позвоните близкому перед подтверждением.</p>` : ''}</div>
      <div style="display:flex;gap:10px"><button class="btn ok sm" id="gYes">Подтвердить</button><button class="btn bad sm" id="gNo">Отклонить</button></div></div>`);
  $('#gYes').onclick = () => { closeModal(); note(`${g.name} подтвердил перевод ${fmt(op.amount)}`); complete(op, sc, pts, res); };
  $('#gNo').onclick = () => {
    S.ops.unshift({id:id(), ts:Date.now(), title:op.toName || op.to, sub:'Перевод', amt:-op.amount, st:'guardian', risk:S.ai ? sc.risk : null, hits:sc.hits});
    note(`${g.name} отклонил перевод ${fmt(op.amount)}`);
    logEvent({type:op.scen || 'manual', title:'Отклонено доверенным лицом: ' + (op.toName || op.to), amount:op.amount, risk:sc.risk, hits:sc.hits, result:'guardian_declined'});
    save(); render();
    modal(`<h2>Перевод отклонён</h2><p>${esc(g.name)} не подтвердил перевод. Деньги остались на счёте, служба безопасности перезвонит вам.</p><button class="btn full" data-act="close">Понятно</button>`);
    res('guardian_declined');
  };
}

/* ---------- клиентский режим: по мотивам приложения bcc.kz ---------- */
const NAV = [['home','Главная','home'], ['pay','Платежи','pay'], ['transfer','Переводы','send'], ['history','История','list'], ['services','Сервисы','grid']];
const PAL = ['#FFEDBE','#E7E4FF','#E6F3FF','#E3FFD9','#FBE1BA','#FFF9D6'];
const CATS = [
  ['mobile','Мобильная связь','phone',[['Beeline',3990],['Kcell / activ',2990],['Tele2 / Altel',2490],['Izi',1990]]],
  ['util','Коммунальные услуги','house',[['Алсеко',27800],['Астана ЕРЦ',21400],['АлматыЭнергоСбыт',9800]]],
  ['net','Интернет и ТВ','wifi',[['Казахтелеком',8990],['Beeline Home',7490],['ID TV',3990]]],
  ['fines','Штрафы','car',[]],
  ['tax','Налоги','doc',[['Налог на транспорт',12300],['Налог на имущество',8400],['Земельный налог',2100]]],
  ['gov','Госуслуги и пошлины','gov',[['Госпошлина за права',4325],['Госпошлина за паспорт',6488]]],
  ['budget','Бюджетные платежи','gov',[['ОСМС',4600],['Пенсионные взносы',19500]]],
  ['edu','Образование','edu',[['Детский сад',32000],['Оплата обучения',450000]]],
  ['transport','Транспорт','bus',[['Onay',2000],['Парковка',500],['Платные дороги',600]]],
  ['loans','Кредиты','percent',[['Погашение кредита BCC',58000],['Кредит в другом банке',30000]]],
  ['ins','Страхование','umbrella',[['ОГПО ВТС',14000],['Страхование квартиры',9000]]],
  ['estate','Аренда и КСК','house',[['КСК / ОСИ',6500],['Аренда квартиры',220000]]],
  ['sec','Охрана и домофон','lock',[['Домофон',600],['Охранная сигнализация',5000]]],
  ['med','Медицина','med',[['Клиника',12000],['Аптека',4500]]],
  ['sport','Спорт','star',[['Фитнес-клуб',18000]]],
  ['ent','Кино и театры','ticket',[['Кинотеатр',2800],['Театр',6000]]],
  ['games','Игры и подписки','play',[['Steam',5000],['PlayStation Store',10000],['Подписка на музыку',1490]]],
  ['ecom','Интернет-магазины','bag',[['Маркетплейс',0]]],
  ['travel','Путешествия','plane',[['Туроператор',0]]],
  ['charity','Благотворительность','heart',[['Благотворительный фонд',2000]]]
];
const CAT = Object.fromEntries(CATS.map(c => [c[0], c]));
const STORIES = [
  ['Кешбэк ноября','#FFDF8E','Раз в месяц выбирайте 3 категории с повышенным кешбэком — прямо на главном экране. Больше всего кешбэка по #картакарта и премиальной #IronCard.'],
  ['Осторожно, мошенники','#CFB2FF','Банк никогда не звонит с просьбой перевести деньги на «безопасный счёт» и не просит коды из SMS. Если во время звонка вы открыли приложение — BCC AI насторожится и остановит перевод.'],
  ['CVV раз в час','#84C4FF','Включите динамический CVV: код меняется раз в час, и украденные данные карты быстро становятся бесполезны.'],
  ['#IronCard','#B5F4C5','Премиальная металлическая карта с повышенным кешбэком у партнёров BCC Club.'],
  ['BCC Invest','#FBE1BA','Брокерский счёт в приложении: акции казахстанских и зарубежных компаний, ETF и драгметаллы.'],
  ['Путешествия','#E6F3FF','Авиабилеты, туры и международные переводы без визита в отделение.']
];
const QUICK = [['По номеру','phone','go','transfer','phone'],['Связь','mobile','paycat','mobile'],['Госуслуги','gov','svc','gov'],['QR-оплата','qr','svc','qr'],['Обмен валют','swap','svc','fx'],['Штрафы','car','paycat','fines']];
const CBCATS = ['Супермаркеты','Такси','Рестораны','АЗС','Аптеки','Одежда','Электроника','Кино','Путешествия'];
const CARD_D = {gold:'Золото', mint:'Мята', graphite:'Графит', lavender:'Лаванда'};
const RATES = [['USD',512.4,518.9],['EUR',548.1,556.3],['RUB',6.12,6.48],['CNY',70.2,72.6]];
const catOf = o => o.amt > 0 ? (o.sub === 'Зарплата' ? 'Зарплата' : 'Поступления') : /Перевод/.test(o.sub) ? 'Переводы' : ({'Покупка':'Супермаркеты','Такси':'Транспорт','Мобильная связь':'Связь','Коммунальные услуги':'Коммунальные','Интернет':'Связь','Оплата картой':'Покупки'}[o.sub] || 'Платежи');
const CAT_IC = {'Супермаркеты':'bag','Транспорт':'bus','Связь':'phone','Коммунальные':'house','Покупки':'card','Переводы':'send','Зарплата':'wallet','Поступления':'down','Платежи':'pay'};
const astanaOpen = () => { const d = new Date(Date.now() + 5 * 36e5), m = d.getUTCHours() * 60 + d.getUTCMinutes(), wd = d.getUTCDay(); return wd > 0 && wd < 6 && m >= 630 && m < 1080; };
function opRow(o) {
  const tag = {blocked:'<span class="tag t-bad">Заблокирована ИИ</span>', warn:'<span class="tag t-warn">Предупреждение ИИ</span>', guardian:'<span class="tag t-info">Отклонено близким</span>', frozen:'<span class="tag t-warn">Заморожено</span>'}[o.st] || '';
  const strike = ['blocked','guardian'].includes(o.st), cat = catOf(o);
  return `<div class="op" ${o.risk != null ? `data-act="opinfo" data-id="${o.id}" style="cursor:pointer"` : ''}><div class="av" style="background:${PAL[cat.length % PAL.length]}">${ic(CAT_IC[cat] || 'pay')}</div><div class="t"><b>${esc(o.title)}</b><span class="xs mute">${esc(o.sub)} · ${dt(o.ts)}</span> ${tag}</div><div class="a ${o.amt > 0 ? 'plus' : ''}" style="${strike ? 'text-decoration:line-through;opacity:.6' : ''}">${o.amt > 0 ? '+' : ''}${fmt(o.amt)}</div></div>`;
}
function bankCard(big) {
  return `<div class="bankcard d-${S.card.design} ${S.card.blocked ? 'blocked' : ''} ${big ? 'big' : ''}" ${big ? '' : 'data-act="card" role="button" tabindex="0"'}>
    <div class="cr"><b class="cname">#картакарта</b><span class="vis">VISA</span></div>
    <div><div class="xs" style="opacity:.75">${S.card.blocked ? 'Карта заблокирована' : 'Доступно'}</div><div class="bal">${fmt(S.user.balance)}</div></div>
    <div class="cr xs"><span>•• 4417</span><span>Кешбэк ${fmt(S.cb.acc)}</span></div></div>`;
}
function vHome() {
  const u = S.user, [ln, lc] = level(u.score), total = u.balance + u.deposit + S.invest;
  return `${u.arrested ? `<div class="banner b-bad"><b>Операции по счёту ограничены.</b> Карта участвовала в цепочке вывода похищенных денег (дропперство). <button class="btn sm sec" data-act="unarrest" style="margin-left:8px">Восстановить счёт</button></div>` : ''}
  ${u.frozen ? `<div class="banner b-warn"><b>${fmt(u.frozen)} заморожено</b> до проверки службой безопасности: входящие переводы от незнакомых лиц.</div>` : ''}
  <div class="hello"><button class="ava" data-act="go" data-v="profile" aria-label="Профиль">${esc((u.first[0] || '') + (u.name.split(' ')[1]?.[0] || ''))}</button>
    <div style="flex:1"><b>${esc(u.first)}</b><br><button class="lnk" data-act="go" data-v="profile">Профиль ›</button></div>
    <button class="hic" data-act="search" aria-label="Поиск">${ic('search')}</button><button class="hic" data-act="notes" aria-label="Уведомления">${ic('bell')}<i class="dotb"></i></button><button class="hic" data-act="support" aria-label="Чат с банком">${ic('chat')}</button></div>
  <div class="stories" role="list">${STORIES.map((s, i) => `<button class="story" style="--c:${s[1]}" data-act="story" data-v="${i}" role="listitem"><span>${s[0]}</span></button>`).join('')}</div>
  <div class="qrow">${QUICK.map((q, i) => `<button data-act="${q[2]}" data-v="${q[3]}" ${q[4] ? `data-t="${q[4]}"` : ''}><span class="qi" style="background:${PAL[i]}">${ic(q[1])}</span>${q[0]}</button>`).join('')}</div>
  <div class="hgrid">
    <section class="panel"><div class="sh"><h2>Мои финансы</h2><span class="mute small">${fmt(total)}</span></div>
      ${bankCard()}
      <div class="acc">
        <button data-act="svc" data-v="dep"><span class="qi" style="background:#E3FFD9">${ic('safe')}</span><span><b>Депозит «Чемпион»</b><br><span class="xs mute">Пополнение и снятие онлайн</span></span><b>${fmt(u.deposit)}</b></button>
        <button data-act="svc" data-v="invest"><span class="qi" style="background:#FBE1BA">${ic('chart')}</span><span><b>Брокерский счёт</b><br><span class="xs mute">BCC Invest</span></span><b>${fmt(S.invest)}</b></button>
        <button data-act="svc" data-v="credit"><span class="qi" style="background:#E7E4FF">${ic('percent')}</span><span><b>Кредитный лимит</b><br><span class="xs mute">по #картакарта</span></span><b>${fmt(500000)}</b></button>
        ${S.usd ? `<button data-act="svc" data-v="fx"><span class="qi" style="background:#E6F3FF">${ic('swap')}</span><span><b>Счёт в долларах</b><br><span class="xs mute">FX-обменник</span></span><b>${S.usd.toLocaleString('ru-RU', {maximumFractionDigits:2})} $</b></button>` : ''}
      </div>
      <button class="addp" data-act="svc" data-v="newprod">+ Открыть карту, депозит или счёт</button></section>
    <div class="stackv">
      <section class="panel shield" data-act="go" data-v="profile" role="button" tabindex="0"><div style="display:flex;gap:16px;align-items:center">${ring(u.score, 96)}
        <div><div class="xs mute">BCC Shield · рейтинг доверия</div><h3 style="margin:4px 0 6px">${ln}</h3><span class="tag ${lc}">${u.score >= 80 ? 'Без ограничений' : u.score >= 50 ? 'Доп. проверка крупных переводов' : 'Лимит 100 000 ₸ в сутки'}</span></div></div></section>
      <section class="panel"><div class="sh"><h3>Курсы валют</h3><button class="lnk" data-act="svc" data-v="fx">Обменять ›</button></div>
        <table class="rates"><thead><tr><th></th><th>Покупка</th><th>Продажа</th></tr></thead><tbody>${RATES.map(r => `<tr><td><b>${r[0]}</b></td><td class="n">${r[1].toLocaleString('ru-RU')}</td><td class="n">${r[2].toLocaleString('ru-RU')}</td></tr>`).join('')}</tbody></table><p class="xs mute" style="margin:6px 0 0">Демо-курсы прототипа</p></section>
      <section class="panel"><div class="sh"><h3>Кешбэк на декабрь</h3><span class="xs mute">${S.cb.sel.length} из 3</span></div>
        <div class="chips">${CBCATS.map(c => `<button class="chip ${S.cb.sel.includes(c) ? 'on' : ''}" data-act="cbcat" data-v="${c}">${c}</button>`).join('')}</div></section>
    </div>
  </div>
  <section class="panel" style="margin-top:16px"><div class="sh"><h3>Последние операции</h3><button class="lnk" data-act="go" data-v="history">Все ›</button></div>${S.ops.slice(0, 6).map(opRow).join('')}</section>
  <div class="tiles3" style="margin-top:16px">${[['cash','Заказ наличных','от 2 млн ₸','cashbag'],['gold','Золотые слитки','5–1000 г в сутки','gold'],['safe','Сейфовая ячейка','Аренда в отделении','lock']].map(t => `<button data-act="svc" data-v="${t[0]}"><span class="qi">${ic(t[3])}</span><span><b>${t[1]}</b><br><span class="xs mute">${t[2]}</span></span></button>`).join('')}</div>`;
}
let tTab = 'phone';
const TTYPES = [['phone','По номеру телефона','phone'],['own','Между своими счетами','swap'],['card','На карту','card'],['intl','Международные','globe'],['req','Запросить деньги','down'],['auto','Автоперевод','cal']];
const INTL = [['SWIFT','В любую страну, по реквизитам'],['Western Union','Наличными или на карту, от 500 ₸'],['KoronaPay','Переводы в СНГ и Европу'],['Visa+','На карту Visa по номеру телефона'],['Узбекистан','По номеру телефона получателя']];
function vTransfer() {
  let form;
  if (!TTYPES.some(x => x[0] === tTab)) tTab = 'phone';
  const ph = tTab === 'phone';
  if (ph || tTab === 'card') form = `<form id="tf">
      ${ph ? `<label for="tTo">Номер телефона</label><input id="tTo" placeholder="+7 7__ ___ __ __" inputmode="tel" required>` : `<label for="tTo">Номер карты получателя</label><input id="tTo" placeholder="0000 0000 0000 0000" inputmode="numeric" required>`}
      <label for="tName">Получатель</label><input id="tName" placeholder="Определится автоматически">
      <label for="tAmt">Сумма, ₸</label><input id="tAmt" type="number" min="1" inputmode="numeric" required placeholder="0">
      <label for="tMsg">Сообщение получателю</label><input id="tMsg" placeholder="Необязательно">
      <p class="xs mute" style="margin:10px 0 0">Списание с #картакарта •• 4417 · комиссия 0 ₸ внутри BCC</p>
      <button class="btn full" style="margin-top:12px">Перевести</button></form>
      ${ph ? `<div class="recent ${S.recentOpen === false ? '' : 'open'}" id="recentBox"><button type="button" class="rhead" data-act="recenttog" aria-expanded="${S.recentOpen !== false}" aria-controls="recentBody"><b>Недавние</b><span class="xs mute">${S.contacts.length}</span><span class="chev" aria-hidden="true">⌄</span></button>
        <div class="pbody" id="recentBody"><div><div class="contact">${S.contacts.map((c, i) => `<button type="button" data-act="ct" data-i="${i}"><span class="mini">${esc(c.n[0])}</span>${esc(c.n)}</button>`).join('')}</div></div></div></div>` : ''}`;
  else if (tTab === 'own') form = `<form id="ownf"><label for="oDir">Направление</label><select id="oDir"><option value="toDep">С карты на депозит «Чемпион»</option><option value="fromDep">С депозита на карту</option><option value="toInv">С карты на брокерский счёт</option></select>
      <label for="oAmt">Сумма, ₸</label><input id="oAmt" type="number" min="1" required placeholder="0"><button class="btn full" style="margin-top:14px">Перевести</button></form>`;
  else if (tTab === 'intl') form = `<h3>Международные переводы</h3>${INTL.map((x, i) => `<button class="row" data-act="intl" data-v="${i}"><span class="qi" style="background:${PAL[i]}">${ic('globe')}</span><span><b>${x[0]}</b><br><span class="xs mute">${x[1]}</span></span>›</button>`).join('')}`;
  else if (tTab === 'req') form = `<form id="reqf"><p class="small mute">Клиент BCC получит запрос в приложении и сможет оплатить его в одно касание.</p><label for="rTo">У кого запросить</label><select id="rTo">${S.contacts.map(c => `<option>${esc(c.n)}</option>`).join('')}</select><label for="rAmt">Сумма, ₸</label><input id="rAmt" type="number" min="1" required><button class="btn full" style="margin-top:14px">Отправить запрос</button></form>`;
  else form = `<h3>Автопереводы по расписанию</h3>${S.autotr.map(a => `<div class="row"><span class="qi" style="background:#E3FFD9">${ic('cal')}</span><span><b>${esc(a.to)}</b><br><span class="xs mute">${fmt(a.amt)} · каждое ${a.day} число</span></span><button class="sw ${a.on ? 'on' : ''}" data-act="atr" data-id="${a.id}" role="switch" aria-checked="${a.on}" aria-label="Включить"><i></i></button></div>`).join('')}
    <form id="atf" class="inline"><select id="atTo" aria-label="Получатель">${S.contacts.map(c => `<option>${esc(c.n)}</option>`).join('')}</select><input id="atAmt" type="number" min="1" placeholder="Сумма" required aria-label="Сумма"><input id="atDay" type="number" min="1" max="28" value="10" aria-label="Число месяца"><button class="btn">Добавить</button></form>`;
  return `<h1>Переводы</h1>
  <div class="ttypes">${TTYPES.map(([k, n, i]) => `<button class="${tTab === k ? 'on' : ''}" data-act="ttab" data-v="${k}"><span class="qi">${ic(i)}</span>${n}</button>`).join('')}</div>
  <div class="grid2"><div class="panel">${form}</div>
  <div class="stackv"><div class="panel shieldnote"><h3>${ic('shield')} BCC Shield проверяет каждый перевод</h3>
    <p class="small">Оценка риска 0–100: от ${S.thr.warn} — попросим подтвердить, от ${S.thr.block} — остановим перевод. Баллы доверия, снятые по ошибке, можно вернуть через апелляцию.</p>
    <p class="small">${protectedAge(S.user.age) ? `<span class="tag t-info">Защита близких включена</span> Переводы больше 70% баланса подтверждает ${esc(S.user.guardian.name)}.` : 'Для клиентов 6–18 и 55+ крупные переводы подтверждает доверенное лицо.'}</p></div>
    <div class="panel"><h3>Лимиты</h3><div class="fac"><span>Доступно на карте</span><b>${fmt(S.user.balance)}</b></div><div class="fac"><span>Лимит на операцию</span><b>${fmt(S.card.limit)}</b></div><button class="lnk" data-act="card">Изменить в настройках карты ›</button></div></div></div>`;
}
function vPay() {
  const q = (S.psearch || '').trim().toLowerCase(), list = CATS.filter(c => !q || c[1].toLowerCase().includes(q) || c[3].some(b => b[0].toLowerCase().includes(q)));
  return `<h1>Платежи</h1><input class="search" placeholder="Поиск: Beeline, штрафы, Алсеко…" value="${esc(S.psearch || '')}" data-in="psearch" id="ps" aria-label="Поиск платежей">
  <div class="cats">${list.map((c, i) => `<button data-act="paycat" data-v="${c[0]}"><span class="qi" style="background:${PAL[i % PAL.length]}">${ic(c[2])}</span>${c[1]}</button>`).join('') || '<div class="empty">Ничего не найдено</div>'}</div>
  <div class="panel" style="margin-top:16px"><div class="sh"><h3>Автоплатежи</h3><button class="lnk" data-act="autopay">+ Добавить</button></div>
  ${S.autopay.map(a => `<div class="row"><span class="qi" style="background:#FFF9D6">${ic('cal')}</span><span><b>${esc(a.name)}</b><br><span class="xs mute">${fmt(a.amt)} · ${a.day} числа каждого месяца</span></span><button class="sw ${a.on ? 'on' : ''}" data-act="apay" data-id="${a.id}" role="switch" aria-checked="${a.on}" aria-label="Включить"><i></i></button></div>`).join('')}</div>`;
}
function vHistory() {
  const f = S.hfilter, q = (S.hsearch || '').toLowerCase(), list = S.ops.filter(o => (f === 'all' || (f === 'in' && o.amt > 0) || (f === 'out' && o.amt < 0) || (f === 'ai' && o.risk != null)) && (!q || (o.title + o.sub).toLowerCase().includes(q)));
  const exp = {}; S.ops.filter(o => o.amt < 0 && !['blocked','guardian'].includes(o.st)).forEach(o => { const c = catOf(o); exp[c] = (exp[c] || 0) - o.amt; });
  const rows = Object.entries(exp).sort((a, b) => b[1] - a[1]), tot = rows.reduce((s, r) => s + r[1], 0), inc = S.ops.filter(o => o.amt > 0).reduce((s, o) => s + o.amt, 0);
  return `<h1>История</h1><div class="grid2 hist"><div><div class="tabs">${[['all','Все'], ['in','Поступления'], ['out','Списания'], ['ai','Проверенные ИИ']].map(([k, n]) => `<button class="${f === k ? 'on' : ''}" data-act="hf" data-v="${k}">${n}</button>`).join('')}</div>
  <input class="search" placeholder="Поиск по операциям" value="${esc(S.hsearch || '')}" data-in="hsearch" id="hs" aria-label="Поиск по операциям">
  <div class="panel">${list.length ? list.map(opRow).join('') : '<div class="empty">Операций нет</div>'}</div></div>
  <div class="panel"><h3>Анализ</h3><div class="grid2" style="gap:10px"><div class="kpi"><span>Доходы</span><b class="plus">+${fmt(inc)}</b></div><div class="kpi"><span>Расходы</span><b>${fmt(-tot)}</b></div></div>
    <div class="spend">${rows.map(([c, v], i) => `<div class="r"><span class="qi" style="background:${PAL[i % PAL.length]}">${ic(CAT_IC[c] || 'pay')}</span><span>${c}<div class="meter"><i style="width:${v / tot * 100}%;background:var(--green)"></i></div></span><b>${fmt(v)}</b></div>`).join('')}</div></div></div>`;
}
const SVC = [
  ['Госуслуги и документы', [['gov','Госуслуги','gov'],['docs','Цифровые документы','doc'],['ip','Регистрация ИП','briefcase']]],
  ['Кредиты', [['credit','Наличными','cashbag'],['pledge','Под залог недвижимости','house'],['salary','До зарплаты','wallet'],['auto','Автокредит','car'],['mortgage','Ипотека','house']]],
  ['Сбережения и инвестиции', [['dep','Депозиты','safe'],['invest','BCC Invest','chart'],['fx','FX-обменник','swap'],['gold','Золото','gold']]],
  ['Покупки и отдых', [['mall','BCC Mall','bag'],['club','BCC Club — кешбэк','gift'],['travel','Авиабилеты','plane'],['tickets','Кино и театры','ticket'],['tours','Туры','globe'],['ins','Страхование','umbrella']]],
  ['В отделении', [['cash','Заказ наличных','cashbag'],['safe','Сейфовая ячейка','lock'],['branches','Отделения и банкоматы','pin']]]
];
function vServices() {
  return `<h1>Сервисы</h1>${SVC.map(([h, items]) => `<h3 class="sech">${h}</h3><div class="cats">${items.map(([k, n, i], j) => `<button data-act="svc" data-v="${k}"><span class="qi" style="background:${PAL[(j + h.length) % PAL.length]}">${ic(i)}</span>${n}</button>`).join('')}</div>`).join('')}`;
}
function vProfile() {
  const u = S.user, [ln, lc] = level(u.score), prot = protectedAge(u.age);
  const ptag = {auto:'', appeal:'<span class="tag t-info">Апелляция</span>', restored:'<span class="tag t-ok">Возвращено</span>', rejected:'<span class="tag t-bad">Отклонено</span>'};
  return `<button class="lnk" data-act="go" data-v="home">‹ Главная</button><h1>Профиль и безопасность</h1>
  <div class="grid2">
    <div class="panel"><h3>BCC Shield · рейтинг доверия</h3><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${ring(u.score)}<div><span class="tag ${lc}" style="font-size:15px">${ln}</span>
      <p class="small" style="margin-top:10px">80–100 — без ограничений<br>50–79 — доп. проверка крупных переводов<br>0–49 — лимит 100 000 ₸ в сутки</p><p class="xs mute">+1 балл за каждые 30 дней без инцидентов</p></div></div></div>
    <div class="panel"><h3>Личные данные</h3>
      <label for="pName">ФИО</label><input id="pName" value="${esc(u.name)}" data-in="name">
      <div class="grid2" style="gap:12px"><div><label for="pAge">Возраст</label><input id="pAge" type="number" min="6" max="100" value="${u.age}" data-in="age"></div><div><label>Город</label><input value="${esc(u.city)}" disabled></div></div>
      <p class="xs mute" style="margin-top:8px">${prot ? '<span class="tag t-info">Защита близких активна</span> по возрасту' : 'Защита близких включается автоматически для 6–18 и 55+'}</p></div>
  </div>
  <div class="panel" style="margin-top:16px"><h3>Безопасность</h3>
    ${[['dcvv','Динамический CVV','Код меняется раз в час'],['loginNotify','Уведомления о входе','Push при входе с нового устройства'],['selfban','Добровольный отказ от займов','Самозапрет через eGov: мошенники не смогут оформить кредит на вас']].map(([k, n, d]) => `<div class="row"><span class="qi" style="background:#E3FFD9">${ic('shield')}</span><span><b>${n}</b><br><span class="xs mute">${d}</span></span><button class="sw ${S.sec[k] ? 'on' : ''}" data-act="sec" data-v="${k}" role="switch" aria-checked="${!!S.sec[k]}" aria-label="${n}"><i></i></button></div>`).join('')}
    <h3 style="margin-top:14px">Устройства</h3>${[['iPhone 15 · это устройство','Алматы · сейчас'],['MacBook · веб-банкинг','Алматы · 3 дня назад']].map(d => `<div class="row"><span class="qi" style="background:#E6F3FF">${ic('phone')}</span><span><b>${d[0]}</b><br><span class="xs mute">${d[1]}</span></span></div>`).join('')}</div>
  <div class="panel" style="margin-top:16px"><h3>История баллов</h3><div class="scroll"><table class="stack"><thead><tr><th>Дата</th><th>Причина</th><th>Баллы</th><th>Статус</th><th></th></tr></thead><tbody>
    ${S.pts.map(p => `<tr><td>${dt(p.ts)}</td><td>${esc(p.reason)}</td><td class="n" style="color:${p.delta < 0 ? 'var(--bad)' : 'var(--ok)'}">${p.delta > 0 ? '+' : ''}${p.delta}</td><td>${ptag[p.st] || ''}</td><td>${p.delta < 0 && p.st === 'auto' ? `<button class="btn sm sec" data-act="appeal" data-id="${p.id}">Оспорить</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="grid2" style="margin-top:16px">
    <div class="panel"><h3>Доверенное лицо</h3><p class="small mute">Подтверждает переводы больше 70% баланса, если вам 6–18 или 55+ лет.</p>
      <label for="gN">Имя</label><input id="gN" value="${esc(u.guardian.name)}" data-in="gname">
      <div class="grid2" style="gap:12px"><div><label for="gR">Кем приходится</label><input id="gR" value="${esc(u.guardian.rel)}" data-in="grel"></div><div><label for="gP">Телефон</label><input id="gP" value="${esc(u.guardian.phone)}" data-in="gphone"></div></div></div>
    <div class="panel"><h3>Мои апелляции</h3>${S.appeals.length ? S.appeals.map(a => `<div class="op"><div class="t"><b>${esc(a.reason)}</b><span class="xs mute">${esc(a.ptsReason)} · ${dt(a.ts)}</span></div>${{pending:'<span class="tag t-info">На рассмотрении</span>', restored:'<span class="tag t-ok">Баллы возвращены</span>', rejected:'<span class="tag t-bad">Отклонена</span>'}[a.st]}</div>`).join('') : '<div class="empty">Апелляций нет. Оспорить списание можно в истории баллов.</div>'}</div>
  </div>`;
}
function userView() {
  const views = {home:vHome, transfer:vTransfer, pay:vPay, history:vHistory, services:vServices, profile:vProfile};
  if (!views[S.scr]) S.scr = 'home';
  const pend = S.appeals.filter(a => a.st === 'pending').length;
  const side = NAV.concat([['profile','Безопасность','shield']]);
  return `<div class="ushell ${animNext ? 'anim' : ''}"><nav class="side"><div class="sidebrand"><b>bcc</b><span>.kz</span><small>концепт BCC Shield</small></div>${side.map(([k, n, i]) => `<button class="${S.scr === k ? 'on' : ''}" data-act="go" data-v="${k}">${ic(i)}${n}${k === 'profile' && pend ? `<span class="badge">${pend}</span>` : ''}</button>`).join('')}
    <div class="sidecard"><b>Связь с банком</b><span class="xs mute">505 — бесплатно с мобильного по Казахстану</span></div></nav>
  <main>${views[S.scr]()}<p class="proto xs mute">Прототип BCC Shield для ITU Hackathon по мотивам приложения bcc.kz. Все данные, курсы и ставки — демонстрационные.</p></main></div>
  <nav class="bottomnav">${NAV.map(([k, n, i]) => `<button class="${S.scr === k ? 'on' : ''}" data-act="go" data-v="${k}">${ic(i)}${n}</button>`).join('')}</nav>
  <button class="btn fab" data-act="scenlist">${ic('play')}Ситуации</button>`;
}

/* ---------- окна клиентских сервисов ---------- */
const head = (t, sub) => `<div class="mh"><div><h2>${t}</h2>${sub ? `<p class="small mute" style="margin:0">${sub}</p>` : ''}</div><button class="btn sm sec" data-act="close" aria-label="Закрыть">${ic('x')}</button></div>`;
const ann = (P, r, n) => { const i = r / 1200; return i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n; };
function payCat(k) {
  const c = CAT[k]; if (!c) return;
  if (k === 'fines') {
    modal(`${head('Штрафы', 'Поиск по ИИН или госномеру автомобиля (ГРНЗ)')}<form id="ff"><label for="fQ">Госномер</label><input id="fQ" placeholder="123 ABC 02" required><button class="btn full" style="margin-top:12px">Найти штрафы</button></form><div id="fRes"></div>`);
    $('#ff').onsubmit = e => { e.preventDefault(); const n = $('#fQ').value.toUpperCase();
      $('#fRes').innerHTML = `<div class="row" style="margin-top:14px"><span class="qi" style="background:#FBE1BA">${ic('car')}</span><span><b>Превышение скорости</b><br><span class="xs mute">${esc(n)} · КоАП ст. 592 · демо</span></span><b>14 745 ₸</b></div><button class="btn full" id="fPay">Оплатить 14 745 ₸</button>`;
      $('#fPay').onclick = () => { closeModal(); runOp({kind:'payment', to:'Штрафы МВД', toName:'Штраф ' + n, sub:'Штрафы', amount:14745, ctx:{}}); }; };
    return;
  }
  modal(`${head(c[1])}${c[3].map((b, i) => `<button class="row" data-act="biller" data-c="${k}" data-i="${i}"><span class="qi" style="background:${PAL[i]}">${ic(c[2])}</span><span><b>${esc(b[0])}</b><br><span class="xs mute">${c[1]}</span></span>›</button>`).join('')}`);
}
function billerPay(k, i) {
  const c = CAT[k], b = c[3][i];
  modal(`${head(esc(b[0]), c[1])}<form id="bf">${k === 'mobile' ? '<label for="bN">Номер телефона</label><input id="bN" value="+7 701 ••• 45 12" inputmode="tel">' : '<label for="bN">Лицевой счёт</label><input id="bN" value="1204556" inputmode="numeric">'}
    <label for="bA">Сумма, ₸</label><input id="bA" type="number" min="1" value="${b[1] || ''}" required>
    <label style="display:flex;gap:10px;align-items:center;font-weight:500"><input type="checkbox" id="bAuto" style="width:22px;min-height:22px">Сделать автоплатежом каждый месяц</label>
    <button class="btn full" style="margin-top:14px">Оплатить</button></form>`);
  $('#bf').onsubmit = ev => { ev.preventDefault(); const amt = +$('#bA').value;
    if ($('#bAuto').checked) S.autopay.push({id:id(), name:b[0], amt, day:new Date().getDate() > 28 ? 1 : new Date().getDate(), on:true});
    closeModal(); runOp({kind:'payment', to:b[0], toName:b[0], sub:c[1], amount:amt, ctx:{}}); };
}
function cardModal() {
  const c = S.card;
  modal(`${head('#картакарта', 'Visa •• 4417')}${bankCard(true)}
    <div class="cact">${[['req','Реквизиты','doc'],['cvv','CVV','lock'],['pin','Сменить PIN','key'],['wallet','Apple / Google Pay','phone'],['topup','Пополнить','down']].map(a => `<button data-act="cop" data-v="${a[0]}"><span class="qi">${ic(a[2])}</span>${a[1]}</button>`).join('')}</div>
    <div id="cOut"></div>
    <div class="row"><span><b>Заблокировать карту</b><br><span class="xs mute">Временно, можно разблокировать здесь же</span></span><button class="sw ${c.blocked ? 'on' : ''}" data-act="cblock" role="switch" aria-checked="${c.blocked}" aria-label="Блокировка"><i></i></button></div>
    <div class="row"><span><b>Покупки в интернете</b><br><span class="xs mute">Оплата онлайн и 3D Secure</span></span><button class="sw ${c.online ? 'on' : ''}" data-act="conline" role="switch" aria-checked="${c.online}" aria-label="Онлайн"><i></i></button></div>
    <label for="cLim">Лимит на одну операцию: <b id="cLimV">${fmt(c.limit)}</b></label><input id="cLim" type="range" min="50000" max="3000000" step="50000" value="${c.limit}">
    <label>Дизайн карты</label><div class="designs">${Object.entries(CARD_D).map(([k, n]) => `<button class="d-${k} ${c.design === k ? 'on' : ''}" data-act="cdes" data-v="${k}" aria-label="${n}"></button>`).join('')}</div>`, true);
  $('#cLim').oninput = e => { c.limit = +e.target.value; $('#cLimV').textContent = fmt(c.limit); save(); };
}
function cardOp(v) {
  const o = $('#cOut'); if (!o) return;
  if (v === 'req') o.innerHTML = `<div class="panel inset"><div class="fac"><span>IBAN</span><b>KZ•• 8562 2031 •••• 4417</b></div><div class="fac"><span>Банк</span><b>АО «Банк ЦентрКредит»</b></div><div class="fac"><span>БИК</span><b>KCJBKZKX</b></div></div>`;
  if (v === 'cvv') { const m = 60 - new Date().getMinutes(); o.innerHTML = `<div class="panel inset" style="text-align:center"><div class="xs mute">${S.sec.dcvv ? 'Динамический CVV' : 'CVV'}</div><div class="bal" style="font-size:34px;letter-spacing:.2em">${S.sec.dcvv ? String(100 + (Math.floor(Date.now() / 36e5) * 7919) % 900) : '•••'}</div><div class="xs mute">${S.sec.dcvv ? `Обновится через ${m} мин. Никому не сообщайте код.` : 'Включите динамический CVV в разделе «Безопасность».'}</div></div>`; }
  if (v === 'pin') o.innerHTML = `<div class="panel inset small">Новый PIN задаётся после подтверждения кодом из SMS. В прототипе PIN не вводится. <button class="btn sm" data-act="toast" data-v="PIN-код изменён (демо)">Подтвердить</button></div>`;
  if (v === 'wallet') { toast('Карта добавлена в кошелёк (демо)'); o.innerHTML = ''; }
  if (v === 'topup') o.innerHTML = `<div class="panel inset small">Пополнить можно переводом с карты другого банка, в банкомате BCC или с депозита «Чемпион» — раздел «Переводы → Между своими».</div>`;
}
function svcModal(k) {
  const u = S.user;
  const credit = (title, sub, rate, max, terms) => { modal(`${head(title, sub)}<label for="kA">Сумма: <b id="kAv">${fmt(max / 4)}</b></label><input id="kA" type="range" min="${max / 20}" max="${max}" step="${max / 100}" value="${max / 4}">
    <label for="kT">Срок</label><select id="kT">${terms.map(t => `<option value="${t}">${t} мес.</option>`).join('')}</select>
    <div class="calc"><span>Платёж в месяц</span><b id="kP"></b><span class="xs mute">Условная ставка ${rate}% годовых, только для демо</span></div>
    <div class="banner b-warn small" style="margin:12px 0">BCC Shield: если вас торопят оформить кредит по телефону «для защиты денег» — это мошенники. Банк так не делает.</div>
    <button class="btn full" id="kGo">Подать заявку</button>`);
    const upd = () => { $('#kAv').textContent = fmt(+$('#kA').value); $('#kP').textContent = fmt(ann(+$('#kA').value, rate, +$('#kT').value)); };
    $('#kA').oninput = upd; $('#kT').onchange = upd; upd();
    $('#kGo').onclick = () => { if (S.sec.selfban) { modal(`${head('Заявка не принята')}<p>У вас включён добровольный отказ от займов. Отключите его в разделе «Безопасность», если это действительно вы.</p><button class="btn full" data-act="close">Понятно</button>`); return; } closeModal(); note(`Заявка на «${title}» отправлена`); toast('Заявка отправлена — решение придёт в приложение (демо)'); save(); }; };
  switch (k) {
    case 'credit': return credit('Кредит наличными', 'Деньги на карту после одобрения', 24, 7000000, [12, 24, 36, 60]);
    case 'pledge': return credit('Кредит под залог недвижимости', 'Крупная сумма на длительный срок', 19, 50000000, [36, 60, 120, 180]);
    case 'salary': return credit('До зарплаты', 'Небольшая сумма до ближайшей зарплаты', 30, 300000, [1, 2, 3]);
    case 'auto': return credit('Автокредит', 'Новые и подержанные автомобили', 21, 30000000, [12, 36, 60, 84]);
    case 'mortgage': return credit('Ипотека', 'Заявка онлайн, сделка в отделении', 17, 80000000, [120, 180, 240]);
    case 'dep': modal(`${head('Депозит «Чемпион»', `На депозите ${fmt(u.deposit)}`)}<label for="dA">Сумма пополнения, ₸</label><input id="dA" type="number" min="1000" value="100000">
      <label for="dT">Срок</label><select id="dT"><option value="6">6 мес.</option><option value="12" selected>12 мес.</option><option value="24">24 мес.</option></select>
      <div class="calc"><span>Доход за срок</span><b id="dP"></b><span class="xs mute">Условная ставка 13,5% годовых, только для демо. Мин. сумма 1 000 ₸</span></div><button class="btn full" id="dGo">Пополнить с карты</button>`);
      { const upd = () => { $('#dP').textContent = '+' + fmt((u.deposit + (+$('#dA').value || 0)) * .135 * (+$('#dT').value) / 12); }; $('#dA').oninput = upd; $('#dT').onchange = upd; upd();
        $('#dGo').onclick = () => { const a = +$('#dA').value; if (!(a >= 1000) || a > u.balance) return toast('Проверьте сумму: от 1 000 ₸ и не больше остатка'); u.balance -= a; u.deposit += a; S.ops.unshift({id:id(), ts:Date.now(), title:'Депозит «Чемпион»', sub:'Перевод между своими счетами', amt:-a, st:'ok'}); save(); render(); closeModal(); toast('Депозит пополнен'); }; }
      return;
    case 'invest': { const P = [['Kaspi.kz','KSPI',41250,'+1,2%'],['Народный банк','HSBK',268,'+0,4%'],['Казатомпром','KZAP',22100,'−0,8%'],['KEGOC','KEGC',1520,'+0,1%'],['S&P 500 ETF','SPY',318400,'+0,6%'],['Золото','XAU',52300,'+0,3%']];
      modal(`${head('BCC Invest', `Брокерский счёт: ${fmt(S.invest)}`)}<p class="xs mute">Демо-котировки за 1 бумагу/грамм. Не является инвестиционной рекомендацией.</p>${P.map((p, i) => `<div class="row"><span class="qi" style="background:${PAL[i]}">${ic('chart')}</span><span><b>${p[0]}</b><br><span class="xs mute">${p[1]}</span></span><span style="text-align:right"><b>${fmt(p[2])}</b><br><span class="xs ${p[3][0] === '+' ? 'plus' : 'neg'}">${p[3]}</span></span></div>`).join('')}
        <label for="iA">Пополнить брокерский счёт, ₸</label><input id="iA" type="number" min="1000" value="50000"><button class="btn full" id="iGo" style="margin-top:12px">Пополнить с карты</button>`, true);
      $('#iGo').onclick = () => { const a = +$('#iA').value; if (!(a > 0) || a > u.balance) return toast('Недостаточно средств'); u.balance -= a; S.invest += a; S.ops.unshift({id:id(), ts:Date.now(), title:'BCC Invest', sub:'Перевод между своими счетами', amt:-a, st:'ok'}); save(); render(); closeModal(); toast('Брокерский счёт пополнен'); }; return; }
    case 'fx': { const open = astanaOpen(), r = RATES[0];
      modal(`${head('FX-обменник', 'Обмен валют с доступом к биржевым сделкам')}<span class="tag ${open ? 't-ok' : 't-warn'}">${open ? 'Биржа открыта' : 'Биржа закрыта'}</span> <span class="xs mute">Пн–пт 10:30–18:00 по времени Астаны</span>
        <label for="xA">Отдаю, ₸</label><input id="xA" type="number" min="1" value="100000"><div class="calc"><span>Получу</span><b id="xP"></b><span class="xs mute">Демо-курс продажи ${r[2]} ₸ за $1</span></div>
        <button class="btn full" id="xGo">${open ? 'Купить доллары' : 'Купить по курсу банка'}</button>`);
      const upd = () => { $('#xP').textContent = ((+$('#xA').value || 0) / r[2]).toLocaleString('ru-RU', {maximumFractionDigits:2}) + ' $'; }; $('#xA').oninput = upd; upd();
      $('#xGo').onclick = () => { const a = +$('#xA').value; if (!(a > 0) || a > u.balance) return toast('Недостаточно средств'); u.balance -= a; S.usd = (S.usd || 0) + a / r[2]; S.ops.unshift({id:id(), ts:Date.now(), title:'Покупка USD', sub:'Обмен валют', amt:-a, st:'ok'}); save(); render(); closeModal(); toast('Валюта зачислена на долларовый счёт'); }; return; }
    case 'mall': { const G = [['Смартфон',459990],['Ноутбук',689000],['Робот-пылесос',189990],['Наушники',99990]];
      modal(`${head('BCC Mall', 'Товары от официальных представителей брендов, рассрочка на 4 месяца')}<div class="mall">${G.map((g, i) => `<div class="good"><span class="qi" style="background:${PAL[i]}">${ic('bag')}</span><b>${g[0]}</b><span>${fmt(g[1])}</span><span class="xs mute">${fmt(g[1] / 4)} × 4 мес.</span><button class="btn sm" data-act="buy" data-v="${i}">В рассрочку</button></div>`).join('')}</div><p class="xs mute">Товары и цены — демо.</p>`, true);
      window._mall = G; return; }
    case 'travel': modal(`${head('Авиабилеты')}<div class="grid2" style="gap:10px"><div><label for="tvF">Откуда</label><select id="tvF"><option>Алматы</option><option>Астана</option><option>Шымкент</option></select></div><div><label for="tvT">Куда</label><select id="tvT"><option>Астана</option><option>Алматы</option><option>Актау</option><option>Стамбул</option></select></div></div>
      <button class="btn full" id="tvGo" style="margin-top:12px">Найти рейсы</button><div id="tvR"></div>`);
      $('#tvGo').onclick = () => { const f = $('#tvF').value, t = $('#tvT').value; if (f === t) return toast('Выберите разные города');
        $('#tvR').innerHTML = [['07:10','08:55',38900],['13:40','15:25',31500],['21:05','22:50',27400]].map(([a, b, p]) => `<div class="row"><span class="qi" style="background:#E6F3FF">${ic('plane')}</span><span><b>${a} → ${b}</b><br><span class="xs mute">${esc(f)} — ${esc(t)} · прямой · демо</span></span><button class="btn sm" data-act="flight" data-v="${p}" data-r="${esc(f)} — ${esc(t)}">${fmt(p)}</button></div>`).join(''); }; return;
    case 'cash': modal(`${head('Заказ наличных', 'Для сумм от 2 000 000 ₸ — заранее, в выбранном отделении')}<form id="cf"><label for="cA">Сумма, ₸</label><input id="cA" type="number" min="2000000" value="2000000" required><label for="cB">Отделение</label><select id="cB"><option>Алматы, пр. Аль-Фараби</option><option>Алматы, ул. Панфилова</option><option>Астана, пр. Мәңгілік Ел</option></select><label for="cD">Дата</label><input id="cD" type="date" required><button class="btn full" style="margin-top:12px">Заказать</button></form>`);
      $('#cf').onsubmit = e => { e.preventDefault(); closeModal(); note(`Заказ наличных ${fmt(+$('#cA').value)} оформлен`); save(); toast('Заказ принят — придёт уведомление, когда деньги будут готовы'); }; return;
    case 'gold': modal(`${head('Золотые слитки', 'Можно заказать от 5 до 1000 граммов в сутки')}<form id="gf"><label for="gG">Вес, г</label><select id="gG">${[5, 10, 20, 50, 100, 1000].map(g => `<option>${g}</option>`).join('')}</select><div class="calc"><span>Стоимость</span><b id="gP"></b><span class="xs mute">Демо-цена 52 300 ₸ за грамм</span></div><button class="btn full">Заказать</button></form>`);
      { const upd = () => $('#gP').textContent = fmt(+$('#gG').value * 52300); $('#gG').onchange = upd; upd(); }
      { const g = $('#gG'); $('#gf').onsubmit = e => { e.preventDefault(); const w = +g.value; closeModal(); runOp({kind:'payment', to:'BCC Gold', toName:`Слиток ${w} г`, sub:'Покупка золота', amount:w * 52300, ctx:{}}); }; } return;
    case 'safe': modal(`${head('Сейфовая ячейка')}<form id="sf"><label for="sS">Размер</label><select id="sS"><option>Малая</option><option>Средняя</option><option>Большая</option></select><label for="sM">Срок</label><select id="sM"><option>1 месяц</option><option>6 месяцев</option><option>12 месяцев</option></select><button class="btn full" style="margin-top:12px">Забронировать</button></form>`);
      $('#sf').onsubmit = e => { e.preventDefault(); closeModal(); toast('Ячейка забронирована — договор подпишете в отделении'); }; return;
    case 'club': modal(`${head('BCC Club', `Накоплено кешбэка: ${fmt(S.cb.acc)}`)}${[['Супермаркеты','до 5%'],['Такси','до 7%'],['Рестораны','до 10%'],['АЗС','до 3%'],['Кино','до 15%']].map((p, i) => `<div class="row"><span class="qi" style="background:${PAL[i]}">${ic('gift')}</span><span><b>${p[0]}</b><br><span class="xs mute">Партнёры BCC Club · ${S.cb.sel.includes(p[0]) ? 'повышенный в этом месяце' : 'обычный'}</span></span><b class="plus">${p[1]}</b></div>`).join('')}<p class="xs mute">Проценты — демо.</p>`); return;
    case 'newprod': modal(`${head('Открыть продукт')}${[['ironcard','#IronCard','Премиальная металлическая карта','card'],['dep','Депозит','Онлайн, без визита в банк','safe'],['invest','Брокерский счёт','BCC Invest','chart'],['ins','Страховка','Авто, жильё, путешествия','umbrella']].map((p, i) => `<button class="row" data-act="svc" data-v="${p[0]}"><span class="qi" style="background:${PAL[i]}">${ic(p[3])}</span><span><b>${p[1]}</b><br><span class="xs mute">${p[2]}</span></span>›</button>`).join('')}`); return;
    case 'ironcard': modal(`${head('#IronCard')}<div class="bankcard d-iron big"><div class="cr"><b class="cname">#IronCard</b><span class="vis">VISA</span></div><div class="bal" style="font-size:22px">Металлическая карта</div><div class="cr xs"><span>Повышенный кешбэк</span><span>Премиум</span></div></div><p class="small" style="margin-top:12px">Доставка курьером по городу. Условия обслуживания — в тарифах банка.</p><button class="btn full" data-act="toast" data-v="Заявка на #IronCard принята (демо)">Заказать карту</button>`); return;
    case 'qr': modal(`${head('QR-оплата', 'Наведите камеру на QR-код на кассе')}<div class="qrbox">${ic('qr')}</div><p class="small mute">В прототипе камера не используется. Оплата по QR проходит ту же проверку BCC Shield, что и переводы.</p><button class="btn full" id="qGo">Оплатить демо-покупку 4 590 ₸</button>`);
      $('#qGo').onclick = () => { closeModal(); runOp({kind:'payment', to:'Кофейня', toName:'Кофейня по QR', sub:'Оплата по QR', amount:4590, ctx:{}}); }; return;
    case 'gov': case 'docs': modal(`${head('Госуслуги', 'Цифровые документы и справки в приложении')}${[['Удостоверение личности','Цифровой документ'],['Водительское удостоверение','Цифровой документ'],['Техпаспорт','Цифровой документ'],['Справка об отсутствии судимости','Заказать'],['Адресная справка','Заказать']].map((d, i) => `<button class="row" data-act="toast" data-v="${d[0]}: открыто (демо)"><span class="qi" style="background:${PAL[i]}">${ic('doc')}</span><span><b>${d[0]}</b><br><span class="xs mute">${d[1]}</span></span>›</button>`).join('')}`); return;
    case 'ip': modal(`${head('Регистрация ИП', 'Онлайн, с открытием текущего счёта')}<form id="ipf"><label for="ipA">Вид деятельности</label><select id="ipA"><option>Розничная торговля</option><option>IT-услуги</option><option>Общепит</option><option>Перевозки</option></select><label for="ipN">Налоговый режим</label><select id="ipN"><option>Упрощённая декларация</option><option>Розничный налог</option><option>Самозанятый</option></select><button class="btn full" style="margin-top:12px">Зарегистрировать</button></form>`);
      $('#ipf').onsubmit = e => { e.preventDefault(); closeModal(); toast('Заявление на регистрацию ИП отправлено (демо)'); }; return;
    case 'ins': modal(`${head('Страхование')}${[['ОГПО ВТС','Обязательная автостраховка'],['Каско','Автомобиль от ущерба и угона'],['Квартира','Жильё и имущество'],['Путешествия','Медицинская страховка за рубежом']].map((d, i) => `<button class="row" data-act="toast" data-v="Расчёт «${d[0]}» отправлен (демо)"><span class="qi" style="background:${PAL[i]}">${ic('umbrella')}</span><span><b>${d[0]}</b><br><span class="xs mute">${d[1]}</span></span>›</button>`).join('')}`); return;
    case 'tickets': case 'tours': modal(`${head(k === 'tickets' ? 'Кино и театры' : 'Туры')}<p class="small">Подборка партнёров с кешбэком BCC Club. В прототипе покупка не выполняется.</p><button class="btn full" data-act="close">Понятно</button>`); return;
    case 'branches': modal(`${head('Отделения и банкоматы')}${['Алматы, пр. Аль-Фараби — до 19:00','Алматы, ул. Панфилова — до 18:00','Астана, пр. Мәңгілік Ел — до 19:00'].map(b => `<div class="row"><span class="qi" style="background:#E3FFD9">${ic('pin')}</span><span><b>${b}</b><br><span class="xs mute">Банкомат с пополнением · демо</span></span></div>`).join('')}`); return;
  }
}

/* ---------- сценарии ---------- */
let RUN = null;
function scenList() {
  modal(`<div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0">Ситуации</h2><button class="btn sm sec" data-act="close" aria-label="Закрыть">${ic('x')}</button></div>
  <p class="small mute">Запустите реальную схему мошенничества и посмотрите, что сделает BCC AI. ИИ-защита сейчас <b style="color:${S.ai ? 'var(--ok)' : 'var(--bad)'}">${S.ai ? 'включена' : 'выключена'}</b> — переключатель вверху.</p>
  ${D.SCEN.map(s => `<button class="scen" data-act="scen" data-v="${s.id}"><span class="dot" style="background:${s.color}"></span><span><b>${s.title}</b><br><span class="small mute">${s.sub}</span></span></button>`).join('')}`, true);
}
function startScen(sid) {
  closeModal(); endScen(true); clearTimeout(chatT);
  const sc = D.SCEN.find(s => s.id === sid);
  RUN = {sc, incomes:0, aborted:false, done:false};
  if (sc.persona) { S.personaBackup = {name:S.user.name, first:S.user.first, age:S.user.age}; Object.assign(S.user, sc.persona); save(); render(); }
  if (sc.intro.some(x => x[0] === 'vcall' || x[0] === 'say')) { audio(); try { speechSynthesis.getVoices(); } catch (e) {} }
  const c = sc.contact;
  $('#chat').innerHTML = `<div class="chat"><div class="hd"><div class="av" style="background:${c.bg}">${esc(c.name[0])}</div><div style="flex:1"><b>${esc(c.name)}</b><div class="xs" style="opacity:.8">${esc(c.app)}</div></div><button class="btn sm" style="background:#ffffff26" data-act="endscen" aria-label="Закрыть">${ic('x')}</button></div><div class="body" id="cBody"></div><div class="ft" id="cFt"><span class="xs" style="color:#8d8a80">Сценарий: ${esc(sc.title)} · ИИ ${S.ai ? 'вкл' : 'выкл'}</span></div></div>`;
  (async () => {
    await play(sc.intro);
    if (!RUN || RUN.sc !== sc) return;
    if (RUN.aborted) return outcome('refuse');
    askButtons();
  })();
}
let chatT;
function endScen(instant) { if (RUN) RUN.dead = true; RUN = null; $('#call').innerHTML = ''; stopVoice();
  if (S.personaBackup) { Object.assign(S.user, S.personaBackup); delete S.personaBackup; save(); render(); } const c = $('#chat .chat'); clearTimeout(chatT); if (!c || instant) { $('#chat').innerHTML = ''; return; } c.classList.add('out'); chatT = setTimeout(() => { $('#chat').innerHTML = ''; }, 300); }
function addMsg(cls, html) { const b = $('#cBody'); if (!b) return; const d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = html; b.append(d); b.scrollTop = b.scrollHeight; }
async function play(steps) {
  const me = RUN;
  for (const st of steps) {
    if (!RUN || RUN !== me || me.dead || me.aborted) return;
    await step(st, me);
  }
}
async function step([k, a, b], me) {
  const amt = me.amount ? fmt(me.amount) : '';
  const txt = typeof a === 'string' ? esc(a).replace('{amt}', amt) : '';
  if (k === 'them') { const b2 = $('#cBody'); const t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>'; b2?.append(t); if (b2) b2.scrollTop = b2.scrollHeight; await sleep(700 + Math.min(1400, a.length * 12)); t.remove(); if (!me.dead) { addMsg('', txt); } }
  else if (k === 'me') { await sleep(600); addMsg('me', txt); }
  else if (k === 'sys') { await sleep(500); addMsg('sys', txt); }
  else if (k === 'bank') { await sleep(500); addMsg('bank', `<b>BCC</b><br>${txt}`); }
  else if (k === 'link') { await sleep(500); addMsg('link', txt); }
  else if (k === 'wait') await sleep(a);
  else if (k === 'income') {
    S.user.balance += a; me.incomes += a; flashBal = true;
    S.ops.unshift({id:id(), ts:Date.now(), title:b, sub:'Входящий перевод', amt:a, st:'ok'});
    note(`Поступление ${fmt(a)} от ${b}`); save(); render();
    addMsg('bank', `<b>BCC</b><br>Поступление <b>+${fmt(a)}</b> от ${esc(b)}`); toast(`+${fmt(a)} от ${b}`);
  }
  else if (k === 'call') await callScreen(a, me);
  else if (k === 'vcall') await voiceCall(a, me);
  else if (k === 'aiNote') { if (S.ai) { await sleep(500); addMsg('bank', `<b>BCC</b><br>${txt}`); } }
  else if (k === 'say') { await sleep(500); addMsg('sys real', `📞 <b>Настоящий Арман:</b> «${txt}»`); await speak(a, {male:true, rate:1, pitch:1}); }
  else if (k === 'effect') {
    if (a === 'arrest') { S.user.arrested = true; note('Операции по счёту ограничены'); }
    if (a === 'refund' && me.incomes) { S.user.balance -= me.incomes; S.ops.unshift({id:id(), ts:Date.now(), title:'Возврат отправителям', sub:'Возврат ошибочных поступлений', amt:-me.incomes, st:'ok'}); me.incomes = 0; }
    if (a === 'plus3') addPts(3, 'Бдительность: отказ от мошеннической схемы');
    save(); render();
  }
}
function callScreen(c, me) {
  return new Promise(res => {
    const el = $('#call');
    const finish = (declined) => { el.innerHTML = ''; if (declined) { me.aborted = true; } else me.duringCall = true; res(); };
    el.innerHTML = `<div class="call"><div><div class="ava">${ic('phone')}</div><h2>${esc(c.name)}</h2><div style="opacity:.7">${esc(c.num)}</div><div style="opacity:.6" class="small" id="callSt">Входящий вызов…</div></div>
      <div class="sub" id="callSub"></div><div class="row" id="callBtns"><button class="rb" style="background:var(--bad)" id="cDecl" aria-label="Отклонить">${ic('x')}</button><button style="background:var(--ok)" id="cAcc" class="rb acc" aria-label="Принять">${ic('phone')}</button></div></div>`;
    $('#cDecl').onclick = () => finish(true);
    $('#cAcc').onclick = async () => { $('#callSt').textContent = 'Идёт разговор';
      $('#callBtns').innerHTML = `<button class="btn bad" id="cHang">Положить трубку</button>`;
      $('#cHang').onclick = () => finish(true);
      for (const line of c.lines) { if (me.dead || me.aborted || !$('#callSub')) return; $('#callSub').innerHTML = '<span>«' + esc(line) + '»</span>'; await sleep(2600); }
      if (me.dead || me.aborted || !$('#callBtns')) return;
      $('#callBtns').innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;width:min(340px,90vw)"><button class="btn" id="cGo">Открыть приложение, не кладя трубку</button><button class="btn bad" id="cHang2">Положить трубку</button></div>`;
      $('#cGo').onclick = () => finish(false);
      $('#cHang2').onclick = () => finish(true);
    };
  });
}
/* ---------- голосовой звонок с дипфейком ---------- */
let AC = null, stopAmbG = null;
function audio() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; } return AC; }
function noise(ac, sec, brown) { const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { l = (l + .02 * w) / 1.02; d[i] = l * 3.5; } else d[i] = w; } return b; }
function ambience() {
  const ac = audio(); if (!ac) return () => {};
  const g = ac.createGain(); g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(.2, ac.currentTime + 1.2); g.connect(ac.destination);
  const n = ac.createBufferSource(); n.buffer = noise(ac, 4, true); n.loop = true; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 450; n.connect(f).connect(g); n.start();
  const o = ac.createOscillator(), og = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(), sf = ac.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.value = 720; lfo.frequency.value = .4; lg.gain.value = 170; lfo.connect(lg).connect(o.frequency); sf.type = 'lowpass'; sf.frequency.value = 1500; og.gain.value = .0; o.connect(sf).connect(og).connect(g); o.start(); lfo.start();
  og.gain.linearRampToValueAtTime(.025, ac.currentTime + 6); og.gain.linearRampToValueAtTime(.008, ac.currentTime + 16);
  const car = setInterval(() => { const t = ac.currentTime; f.frequency.cancelScheduledValues(t); f.frequency.setValueAtTime(420, t); f.frequency.linearRampToValueAtTime(1300 + Math.random() * 500, t + 1.3); f.frequency.linearRampToValueAtTime(420, t + 3.2); }, 4700);
  const stop = () => { clearInterval(car); const t = ac.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + .35); setTimeout(() => { try { n.stop(); o.stop(); lfo.stop(); g.disconnect(); } catch (e) {} }, 450); };
  stopAmbG = stop; return stop;
}
function breath(vol = .09) { const ac = audio(); if (!ac) return; const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
  n.buffer = noise(ac, .7); f.type = 'bandpass'; f.frequency.value = 1100 + Math.random() * 500; f.Q.value = .7; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .18); g.gain.linearRampToValueAtTime(0, t + .55);
  n.connect(f).connect(g).connect(ac.destination); n.start(t); n.stop(t + .7); }
function ringtone() { const ac = audio(); if (!ac) return () => {}; let on = true;
  const ring = () => { if (!on) return; const t0 = ac.currentTime; for (let k = 0; k < 2; k++) for (let i = 0; i < 8; i++) { const t = t0 + k * .55 + i * .055, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = i % 2 ? 1046 : 784; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .01); g.gain.linearRampToValueAtTime(0, t + .05); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + .06); } };
  ring(); const iv = setInterval(ring, 2600); return () => { on = false; clearInterval(iv); }; }
const MALE = /dmitr|pavel|yuri|maxim|ivan|sergey|artem|male|мужск|aleksandr|alexander/i;
function ruVoice(male) { try { const vs = speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang)); return (male && vs.find(v => MALE.test(v.name))) || vs.find(v => /google/i.test(v.name)) || vs[0] || null; } catch (e) { return null; } }
function speak(text, o = {}) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return setTimeout(res, 500 + text.length * 55);
    const u = new SpeechSynthesisUtterance(text.replace(/…/g, '...')), v = ruVoice(o.male); if (v) u.voice = v;
    u.lang = 'ru-RU'; u.rate = o.rate || 1; u.pitch = o.pitch ?? 1; if (o.male && !(v && MALE.test(v.name))) u.pitch = Math.min(u.pitch, .78);
    let done = false; const fin = () => { if (!done) { done = true; clearTimeout(tm); res(); } }, tm = setTimeout(fin, 2500 + text.length * 120);
    u.onend = fin; u.onerror = fin; if (o.onword) u.onboundary = o.onword;
    try { speechSynthesis.speak(u); } catch (e) { fin(); }
  });
}
function stopVoice() { try { speechSynthesis.cancel(); } catch (e) {} if (stopAmbG) { stopAmbG(); stopAmbG = null; } }
function voiceCall(c, me) {
  return new Promise(res => {
    const el = $('#call'), ai = S.ai; let stopRing = ringtone(), alive = true, raf = 0, clock = 0, lvl = 0, bump = 0;
    const finish = declined => { if (!alive) return; alive = false; stopRing(); stopVoice(); cancelAnimationFrame(raf); clearInterval(clock); el.innerHTML = ''; if (declined) me.aborted = true; else me.duringCall = true; res(); };
    el.innerHTML = `<div class="call vcall"><div class="ctop"><div class="ava">${esc(c.name[0])}</div><h2>${esc(c.name)}</h2><div style="opacity:.7">${esc(c.num)}</div><div class="small" style="opacity:.6" id="callSt">Входящий вызов · мобильный</div></div>
      <div class="wave" id="wave" aria-hidden="true">${'<i></i>'.repeat(36)}</div><div class="sub" id="callSub"></div>
      <div class="vg" id="vg" hidden></div>
      <div class="row" id="callBtns"><button class="rb" style="background:var(--bad)" id="cDecl" aria-label="Отклонить">${ic('x')}</button><button style="background:var(--ok)" id="cAcc" class="rb acc" aria-label="Принять">${ic('phone')}</button></div></div>`;
    const bars = [...el.querySelectorAll('.wave i')];
    const anim = () => { if (!alive) return; lvl += ((bump ? 1 : 0) - lvl) * .25; bump = Math.max(0, bump - .04);
      bars.forEach((b, i) => { const env = Math.sin(i / bars.length * Math.PI); b.style.height = (4 + env * lvl * (14 + Math.random() * 40)) + 'px'; }); raf = requestAnimationFrame(anim); };
    $('#cDecl').onclick = () => finish(true);
    $('#cAcc').onclick = async () => {
      stopRing(); audio(); ambience(); anim();
      const t0 = Date.now(); clock = setInterval(() => { const s2 = Math.floor((Date.now() - t0) / 1000), st = $('#callSt'); if (st) st.textContent = `Идёт разговор ${String(Math.floor(s2 / 60)).padStart(2, '0')}:${String(s2 % 60).padStart(2, '0')}`; }, 500);
      $('#callBtns').innerHTML = `<button class="rb" style="background:var(--bad)" id="cHang" aria-label="Положить трубку">${ic('x')}</button>`;
      $('#cHang').onclick = () => finish(true);
      const vg = $('#vg'); vg.hidden = false;
      vg.innerHTML = ai ? `<div class="vgh">${ic('shield')}<b>BCC AI · Voice Guard<br><span class="xs" style="opacity:.7;font-weight:500" id="vgSt">Анализирую голос…</span></b><span id="vgPct">0%</span></div><div class="vgm"><i id="vgBar"></i></div><div class="xs" style="opacity:.6;margin-top:4px">Вероятность, что голос синтезирован нейросетью</div><ul id="vgList"></ul>`
        : `<div class="vgh">${ic('shield')}<b>BCC AI · Voice Guard</b></div><p class="small" style="margin:6px 0 0;color:#ff8b8f">ИИ-защита выключена — голос не анализируется.</p>`;
      await sleep(600);
      for (let i = 0; i < c.lines.length; i++) {
        const L = c.lines[i]; if (!alive || me.dead) return;
        $('#callSub').innerHTML = '<span>«' + esc(L.t) + '»</span>';
        const parts = L.t.split(/(?<=[.,!?…])\s+/);
        for (const ch of parts) { if (!alive) return; bump = 1;
          await speak(ch, {male:true, rate:L.r * (.94 + Math.random() * .14), pitch:L.p + (Math.random() - .5) * .12, onword:() => { bump = 1; }});
          bump = 0; if (!alive) return; if (/[.…?!]$/.test(ch)) breath(.06 + Math.random() * .06); await sleep(160 + Math.random() * 260); }
        if (ai && c.guard[i]) { const [pct, txt] = c.guard[i], li = document.createElement('li'); li.textContent = txt; $('#vgList')?.append(li);
          $('#vgPct').textContent = pct + '%'; $('#vgBar').style.width = pct + '%'; $('#vgBar').style.background = pct >= 70 ? 'var(--bad)' : pct >= 40 ? 'var(--gold)' : 'var(--ok)';
          if (pct >= 70) { vg.classList.add('alarm'); $('#vgSt').textContent = 'Высокий риск: признаки дипфейка'; } }
        await sleep(300);
      }
      if (!alive) return;
      if (ai) {
        vg.insertAdjacentHTML('beforeend', `<div class="verdict">Голос сгенерирован нейросетью — это не ваш сын. Положите трубку и перезвоните Арману на номер из контактов.</div>`);
        $('#vgSt').textContent = 'Дипфейк распознан';
        setTimeout(() => vg.lastElementChild?.scrollIntoView({behavior:'smooth', block:'center'}), 120);
        try { const ac = audio(); if (ac) { const t = ac.currentTime; [0, .18].forEach(d => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.0, t + d); g.gain.linearRampToValueAtTime(.06, t + d + .02); g.gain.linearRampToValueAtTime(0, t + d + .14); o.connect(g).connect(ac.destination); o.start(t + d); o.stop(t + d + .16); }); } } catch (e) {}
        $('#callBtns').innerHTML = `<div class="cbtns"><button class="btn ok" id="cHang2">${ic('x')}Положить трубку</button><button class="btn sec" id="cGo">Продолжить разговор</button></div>`;
      } else $('#callBtns').innerHTML = `<div class="cbtns"><button class="btn" id="cGo">Открыть приложение, не кладя трубку</button><button class="btn bad" id="cHang2">Положить трубку</button></div>`;
      $('#cGo').onclick = () => finish(false); $('#cHang2').onclick = () => finish(true);
    };
  });
}
function askButtons() {
  const sc = RUN.sc;
  $('#cFt').innerHTML = `<button class="btn" data-act="scgo">${esc(sc.ask.go)}</button><button class="btn sec" data-act="screfuse">${esc(sc.ask.refuse)}</button>`;
}
function scenOp() {
  const sc = RUN.sc;
  const amount = sc.op.amount || Math.round(S.user.balance * sc.op.share / 1000) * 1000;
  RUN.amount = amount;
  return {kind:sc.op.kind || 'transfer', to:sc.op.to, toName:sc.op.toName, amount, ctx:Object.assign({}, sc.op.ctx), scen:sc.id};
}
function scGo() {
  const sc = RUN.sc, op = scenOp();
  $('#cFt').innerHTML = '<span class="xs" style="color:#8d8a80">Ожидание…</span>';
  if (sc.phish) {
    modal(`<div class="phish"><div class="url">${ic('lock')}bazar24-safe-pay.top/get/85000</div><div style="padding:18px"><h3 style="color:#2fbf71">Безопасная сделка Bazar24</h3><p class="small">Покупатель оплатил товар. Для получения <b>85 000 ₸</b> подтвердите карту.</p>
      <label>Номер карты</label><input value="4417 •••• •••• 4417" readonly><div class="grid2" style="gap:10px"><div><label>Срок</label><input value="••/••" readonly></div><div><label>CVV</label><input value="•••" readonly></div></div>
      <label>Код из SMS</label><input value="••••" readonly><p class="xs" style="color:#888">Демо-данные: в прототипе ничего не вводится и никуда не отправляется.</p>
      <button class="btn ok full" id="phGo">Получить 85 000 ₸</button><button class="btn sec full" style="margin-top:8px" id="phNo">Закрыть страницу</button></div></div>`);
    $('#phGo').onclick = () => { closeModal(); doScenOp(op); };
    $('#phNo').onclick = () => { closeModal(); outcome('refuse'); };
    return;
  }
  modal(`<h2>Подтвердите перевод</h2><div class="op"><div class="t"><span class="xs mute">Получатель</span><b>${esc(op.toName)}</b><span class="small">${esc(op.to)}</span></div></div>
    <div class="op"><div class="t"><span class="xs mute">Сумма</span><b class="bal" style="font-size:30px">${fmt(op.amount)}</b></div></div><div class="op"><div class="t"><span class="xs mute">Комиссия</span><b>0 ₸</b></div></div>
    ${RUN.duringCall ? `<p class="small" style="color:var(--bad)">📞 Идёт звонок: ${esc(RUN.sc.intro.find(x => x[0] === 'call' || x[0] === 'vcall')?.[1].name || '')}</p>` : ''}
    <div style="display:flex;gap:10px;margin-top:12px"><button class="btn" id="cfGo">Перевести</button><button class="btn sec" id="cfNo">Отмена</button></div>`);
  $('#cfGo').onclick = () => { closeModal(); doScenOp(op); };
  $('#cfNo').onclick = () => { closeModal(); outcome('refuse'); };
}
async function doScenOp(op) {
  const me = RUN;
  const r = await runOp(op);
  if (!RUN || RUN !== me) return;
  await sleep(400);
  if (r === 'cancelled') { addMsg('bank', '<b>BCC</b><br>Вы отменили перевод после предупреждения ИИ — правильное решение.'); return finishScen(); }
  if (r === 'denied') { addMsg('sys', 'Операция не выполнена.'); return finishScen(); }
  outcome(r);
}
async function outcome(r) {
  const me = RUN; if (!me) return;
  me.aborted = false;
  $('#cFt').innerHTML = '<span class="xs" style="color:#8d8a80">…</span>';
  logEventIfRefuse(r, me);
  await play(me.sc.after[r] || []);
  if (RUN === me) finishScen();
}
function logEventIfRefuse(r, me) { if (r === 'refuse') { logEvent({type:me.sc.id, title:'Клиент отказался: ' + me.sc.title, amount:me.amount || 0, risk:null, hits:[], result:'refused'}); save(); } }
function finishScen() { if (!$('#cFt')) return; $('#cFt').innerHTML = `<button class="btn blue" data-act="endscen">Завершить</button><button class="btn sec" data-act="scenlist">Другая ситуация</button>`; }

/* ---------- режим разработчика ---------- */
let feedPaused = false, feed = [], feedStats = {n:0, b:0, w:0};
const cityBy = n => D.CITIES.find(c => c.name === n);
function eventCases() {
  return S.events.filter(e => D.TYPE[e.type]).map(e => ({id:'EV-' + e.id, city:e.city, district:'Клиент BCC Shield', type:e.type, channel:'Клиентский режим', age:S.user.age, gender:'М', amount:e.amount, status:e.result === 'blocked' || e.result === 'guardian_declined' || e.result === 'refused' || e.result === 'cancelled' ? 'prevented' : 'loss', risk:e.risk ?? 0, ts:e.ts, fact:e.hits, tl:['Запуск сценария в клиентском режиме', 'Результат: ' + e.result], dx:Math.sin(e.id * 7.1), dy:Math.cos(e.id * 3.3), drops:0, live:true}));
}
function allCases() {
  const lim = Date.now() - S.fper * DAY;
  return eventCases().concat(CASES).filter(c => c.ts >= lim && (S.ftype === 'all' || c.type === S.ftype));
}
function stats(list) {
  const prev = list.filter(c => c.status === 'prevented'), loss = list.filter(c => c.status !== 'prevented');
  return {n:list.length, prev:prev.length, pct:list.length ? Math.round(prev.length / list.length * 100) : 0, saved:prev.reduce((s, c) => s + c.amount, 0), lost:loss.reduce((s, c) => s + c.amount, 0)};
}
const stTag = s => ({prevented:'<span class="tag t-ok">Предотвращено ИИ</span>', loss:'<span class="tag t-bad">Ущерб</span>', investigating:'<span class="tag t-warn">Расследуется</span>'}[s]);
const fmtM = n => n >= 1e6 ? (n / 1e6).toLocaleString('ru-RU', {maximumFractionDigits:1}) + ' млн ₸' : fmt(n);
function bars(rows, total) { return `<div class="bars">${rows.map(([n, v, c]) => `<div class="r"><span>${n}</span><div class="meter"><i style="width:${total ? v / total * 100 : 0}%;background:${c || 'var(--deep2)'}"></i></div><b>${v}</b></div>`).join('')}</div>`; }

function devView() {
  const list = allCases(), st = stats(list);
  const tabs = [['map','3D-карта городов'], ['analytics','Аналитика'], ['feed','Поток транзакций'], ['appeals','Апелляции' + (S.appeals.filter(a => a.st === 'pending').length ? ` (${S.appeals.filter(a => a.st === 'pending').length})` : '')], ['model','Модель ИИ'], ['log','Журнал клиента']];
  return `<div class="dshell ${animNext ? 'anim' : ''}">
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:end"><div><h1 style="margin:0">Ситуационный центр антифрода</h1><p class="small mute" style="margin:4px 0 12px">Синтетические данные для прототипа · ${D.CITIES.length} городов РК · за ${S.fper} дней</p></div>
  <div class="tabs" style="margin:0 0 12px">${tabs.map(([k, n]) => `<button class="${S.dtab === k ? 'on' : ''}" data-act="dtab" data-v="${k}">${n}</button>`).join('')}</div></div>
  ${liveStrip()}
  <div class="kpis"><div class="kpi"><span>Подтверждённых случаев за ${S.fper} дн.</span><b ${animNext ? `data-count="${st.n}"` : ''}>${st.n.toLocaleString('ru-RU')}</b></div><div class="kpi"><span>Предотвращено ИИ</span><b style="color:var(--ok)" ${animNext ? `data-count="${st.pct}" data-f="p"` : ''}>${st.pct}%</b></div>
  <div class="kpi"><span>Сохранено по этим случаям</span><b ${animNext ? `data-count="${st.saved}" data-f="m"` : ''}>${fmtM(st.saved)}</b></div><div class="kpi"><span>Ущерб</span><b style="color:#e5484d" ${animNext ? `data-count="${st.lost}" data-f="m"` : ''}>${fmtM(st.lost)}</b></div><div class="kpi"><span>ИИ-защита</span><b style="color:${S.ai ? 'var(--ok)' : '#e5484d'}">${S.ai ? 'Включена' : 'Выключена'}</b></div></div>
  ${({map:dMap, analytics:dAnalytics, feed:dFeed, appeals:dAppeals, model:dModel, log:dLog}[S.dtab] || dMap)(list)}</div>`;
}
function dMap(list) {
  const city = S.city && cityBy(S.city);
  const byCity = {}; list.forEach(c => (byCity[c.city] ||= []).push(c));
  const sorted = D.CITIES.slice().sort((a, b) => (byCity[b.name]?.length || 0) - (byCity[a.name]?.length || 0));
  const q = S.csearch.trim().toLowerCase();
  let right;
  if (!city) {
    const tcount = D.TYPES.map(t => [t.name, list.filter(c => c.type === t.id).length, t.color]);
    right = `<div class="panel"><h2>Казахстан</h2><p class="small mute">Приблизьте карту к городу или выберите его в списке — откроется 3D-модель с улицами, главными зданиями и случаями по районам.</p><h3>По типам схем</h3>${bars(tcount, Math.max(...tcount.map(x => x[1]), 1))}
      <h3 style="margin-top:16px">Города</h3><input placeholder="Поиск города" value="${esc(S.csearch)}" data-in="csearch" id="cs">
      <div class="clist">${sorted.filter(c => !q || c.name.toLowerCase().includes(q)).map(c => { const s = stats(byCity[c.name] || []); return `<button class="crow" data-act="city" data-v="${c.name}"><span><b>${c.name}</b><br><span class="xs mute">${c.region}</span></span><span style="text-align:right">${s.n}<br><span class="xs" style="color:var(--ok)">${s.pct}% предотвр.</span></span></button>`; }).join('')}</div></div>`;
  } else {
    const cl = byCity[city.name] || [], s = stats(cl);
    const dcount = {}; cl.forEach(c => dcount[c.district] = (dcount[c.district] || 0) + 1);
    const tcount = D.TYPES.map(t => [t.name, cl.filter(c => c.type === t.id).length, t.color]).filter(x => x[1]);
    right = `<div class="panel"><button class="btn sm sec" data-act="city" data-v="">← Вся страна</button><h2 style="margin-top:12px">${city.name}</h2><p class="small mute">${city.region} · население ≈ ${city.pop.toLocaleString('ru-RU')} тыс.</p>
      <div class="grid2" style="gap:10px"><div class="kpi"><span>Случаев</span><b>${s.n}</b></div><div class="kpi"><span>Предотвращено</span><b style="color:var(--ok)">${s.pct}%</b></div><div class="kpi"><span>Сохранено</span><b>${fmtM(s.saved)}</b></div><div class="kpi"><span>Ущерб</span><b style="color:#e5484d">${fmtM(s.lost)}</b></div></div>
      <h3 style="margin-top:16px">Главные здания на модели</h3><div class="lmlist" id="lmList"><span class="xs mute">Загрузка модели…</span></div>
      <h3 style="margin-top:16px">Схемы</h3>${bars(tcount, Math.max(...tcount.map(x => x[1]), 1))}
      <h3 style="margin-top:16px">Районы</h3>${bars(Object.entries(dcount).sort((a, b) => b[1] - a[1]).map(([n, v]) => [n, v]), Math.max(...Object.values(dcount), 1))}
      <h3 style="margin-top:16px">Случаи</h3><div class="clist">${cl.length ? cl.slice(0, 80).map(c => `<button class="crow" data-act="case" data-v="${c.id}"><span><b>${D.TYPE[c.type].name}</b>${c.live ? ' <span class="tag t-info">клиент</span>' : ''}<br><span class="xs mute">${c.id} · ${c.district} · ${dt(c.ts)}</span></span><span style="text-align:right">${fmt(c.amount)}<br>${stTag(c.status)}</span></button>`).join('') : '<div class="empty">Нет случаев по фильтру</div>'}</div></div>`;
  }
  return `<div class="dgrid"><div class="mapbox"><div class="maptools">
    <select data-in="city" aria-label="Город"><option value="">Перейти в город…</option>${D.CITIES.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru')).map(c => `<option ${S.city === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
    <select data-in="ftype" aria-label="Тип"><option value="all">Все схемы</option>${D.TYPES.map(t => `<option value="${t.id}" ${S.ftype === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}</select>
    <select data-in="fper" aria-label="Период">${[7, 30, 90].map(d => `<option value="${d}" ${S.fper == d ? 'selected' : ''}>${d} дней</option>`).join('')}</select></div>
    <div id="map3d" class="map3d" role="img" aria-label="3D-карта городов Казахстана со случаями мошенничества"></div>
    <div class="legend">${city ? D.TYPES.map(t => `<span><i style="background:${t.color}"></i>${t.name}</span>`).join('') + '<span>Шар с кольцом — предотвращено, светящийся — ущерб</span>' : '<span><i style="background:#00b975"></i>Большинство предотвращено</span><span><i style="background:#dca262"></i>Около половины</span><span><i style="background:#e5484d"></i>Чаще ущерб</span><span>Высота — число случаев</span>'}</div></div>${right}</div>`;
}
function fillLm() {
  const el = $('#lmList'); if (!el || !window.City3D) return;
  const l = City3D.landmarks();
  el.innerHTML = l.length ? l.map((n, i) => `<button class="chip" data-act="lm" data-v="${i}">${esc(n)}</button>`).join('') : '<span class="xs mute">Загрузка модели…</span>';
}
function mount3D() {
  const el = $('#map3d'); if (!el || !window.City3D) return;
  City3D.mount(el, {cities:D.CITIES, border:D.BORDER, cases:allCases(), city:S.city,
    cb:{onCity:n => { if ((n || null) === S.city) return; S.city = n || null; S.csearch = ''; save(); render(); },
        onCase:id => caseModal(id), typeColor:t => D.TYPE[t]?.color, onBuilt:fillLm}});
  fillLm();
}
function caseModal(cid) {
  const c = eventCases().concat(CASES).find(x => x.id === cid); if (!c) return;
  const t = D.TYPE[c.type];
  modal(`<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><span class="xs mute">${c.id}</span><h2 style="margin:2px 0 6px">${t.name}</h2>${stTag(c.status)}</div><button class="btn sm sec" data-act="close" aria-label="Закрыть">${ic('x')}</button></div>
    <p class="small" style="margin-top:12px">${t.d}</p>
    <div class="grid2" style="gap:10px">
      <div><div class="fac"><span>Город</span><b>${c.city}</b></div><div class="fac"><span>Район</span><b>${c.district}</b></div><div class="fac"><span>Дата и время</span><b>${new Date(c.ts).toLocaleString('ru-RU')}</b></div><div class="fac"><span>Канал</span><b>${c.channel}</b></div>
        <div class="fac"><span>Пострадавший</span><b>${c.gender}, ${c.age} лет${protectedAge(c.age) ? ' · защищ. группа' : ''}</b></div><div class="fac"><span>Сумма</span><b>${fmt(c.amount)}</b></div>${c.drops ? `<div class="fac"><span>Цепочка дропов</span><b>${c.drops} карт</b></div>` : ''}</div>
      <div><div class="small" style="display:flex;justify-content:space-between"><span>Риск по модели</span><b>${c.risk}/100</b></div>${riskBar(c.risk)}<h3 style="margin-top:12px">Сработавшие факторы</h3>${c.fact.length ? facList(c.fact) : '<p class="small mute">—</p>'}</div>
    </div>
    <h3 style="margin-top:14px">Хронология</h3><ul class="tl">${c.tl.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" data-act="toast" data-v="Реквизиты получателя добавлены в базу жалоб">В базу жалоб</button><button class="btn sm sec" data-act="toast" data-v="Материалы переданы в правоохранительные органы">Передать в полицию</button></div>`, true);
}
/* поток */
function genTx() {
  const tot = D.CITIES.reduce((s, c) => s + c.pop, 0); let x = Math.random() * tot, c = D.CITIES[0];
  for (const ci of D.CITIES) { if ((x -= ci.pop) < 0) { c = ci; break; } }
  const keys = Object.keys(D.FACTORS), hits = [];
  const sus = Math.random() < 0.02;
  keys.forEach(k => { if (Math.random() < (sus ? 0.32 : 0.006)) hits.push(k); });
  const risk = Math.min(100, hits.reduce((s, k) => s + S.w[k], 0));
  const kind = ['Перевод по номеру', 'Перевод на карту', 'Оплата картой', 'Платёж'][Math.floor(Math.random() * 4)];
  const amount = Math.round((sus ? 30000 : 9000) * (0.2 + Math.random() * 3) / 100) * 100;
  const dec = !S.ai ? 'pass' : risk >= S.thr.block ? 'block' : risk >= S.thr.warn ? 'warn' : 'pass';
  return {id:id(), ts:Date.now(), city:c.name, kind, amount, risk, hits:hits.sort((a, b) => S.w[b] - S.w[a]), dec, sus};
}
const decTag = d => ({block:'<span class="tag t-bad">Блок</span>', warn:'<span class="tag t-warn">Проверка</span>', pass:'<span class="tag t-ok">Пропуск</span>'}[d]);
function feedRows() { return feed.map(f => `<tr class="click" data-act="tx" data-v="${f.id}"><td>${new Date(f.ts).toLocaleTimeString('ru-RU')}</td><td>${f.city}</td><td>${f.kind}</td><td class="n">${fmt(f.amount)}</td><td class="n">${f.risk}</td><td>${decTag(f.dec)}</td></tr>`).join(''); }
function dFeed() {
  return `<div class="panel"><div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center"><h3 style="margin:0">Транзакции в реальном времени</h3>
    <div style="display:flex;gap:8px;align-items:center"><span class="small mute" id="fStat">${feedStatTxt()}</span><button class="btn sm sec" data-act="pause">${feedPaused ? 'Продолжить' : 'Пауза'}</button></div></div>
    <div class="scroll" style="margin-top:10px"><table class="stack"><thead><tr><th>Время</th><th>Город</th><th>Операция</th><th>Сумма</th><th>Риск</th><th>Решение ИИ</th></tr></thead><tbody id="feedBody">${feedRows()}</tbody></table></div></div>`;
}
const feedStatTxt = () => `Проверено ${feedStats.n} · блок ${feedStats.b} · проверка ${feedStats.w}`;
/* ---------- живой поток: симуляция транзакций с ускорением ---------- */
const SIM = {spd:1, t:Date.now(), n:0, b:0, w:0, saved:0, cm:{tp:0, fp:0, fn:0, tn:0}, bk:[], cur:{n:0, b:0, w:0}, bkT:0, tps:0, lastDraw:0};
{ const d = new Date(), sec = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  SIM.n = Math.round(sec * 2.4); SIM.b = Math.round(SIM.n * .008); SIM.w = Math.round(SIM.n * .006); SIM.saved = SIM.b * 31000;
  SIM.cm = {tp:SIM.b, fp:Math.round(SIM.b * .06), fn:Math.round(SIM.b * .09), tn:SIM.n - SIM.b}; }
const SHOWN = {};
function simTick() {
  const dt = 250 * SIM.spd; SIM.t += dt;
  if (document.hidden) return;
  let k = 2.4 * dt / 1000, made = 0; SIM._acc = (SIM._acc || 0) + k; const cnt = Math.min(8, Math.floor(SIM._acc)); SIM._acc -= cnt;
  for (let i = 0; i < cnt; i++) {
    const t = genTx(); made++; t.ts = SIM.t; SIM.n++; SIM.cur.n++;
    if (t.dec === 'block') { SIM.b++; SIM.cur.b++; if (t.sus) SIM.saved += t.amount; } if (t.dec === 'warn') { SIM.w++; SIM.cur.w++; }
    const flag = t.dec !== 'pass'; SIM.cm[t.sus ? (flag ? 'tp' : 'fn') : (flag ? 'fp' : 'tn')]++;
    if (!feedPaused) { feed.unshift(t); feedStats.n++; if (t.dec === 'block') feedStats.b++; if (t.dec === 'warn') feedStats.w++; }
    if (S.mode === 'dev' && t.dec !== 'pass' && window.City3D?.ping) City3D.ping(t.city, t.dec === 'block' ? '#e5484d' : '#dca262');
  }
  feed = feed.slice(0, 40);
  SIM.bkT += dt; if (SIM.bkT >= 10000) { SIM.bkT = 0; SIM.bk.push(SIM.cur); SIM.bk = SIM.bk.slice(-48); SIM.cur = {n:0, b:0, w:0}; drawLive(); }
  SIM.tps = SIM.tps * .9 + (cnt / .25) * .1;
  if (S.mode !== 'dev') return;
  const now = performance.now();
  if (S.dtab === 'feed' && now - SIM.lastDraw > 450) { SIM.lastDraw = now; const b = $('#feedBody'); if (b) b.innerHTML = feedRows(); const s = $('#fStat'); if (s) s.textContent = feedStatTxt(); }
  const c = $('#lvClock'); if (c) c.textContent = new Date(SIM.t).toLocaleTimeString('ru-RU');
  if (S.dtab === 'analytics') updQuality();
}
for (let i = 0; i < 48; i++) SIM.bk.push({n:Math.round(24 * (.85 + Math.random() * .3)), b:Math.random() < .45 ? 1 : 0, w:Math.random() < .3 ? 1 : 0});
setInterval(simTick, 250);
// плавный «бег» цифр
const LIVEF = {lvN:() => SIM.n, lvB:() => SIM.b, lvW:() => SIM.w, lvSaved:() => SIM.saved, lvTps:() => SIM.tps};
(function roll() {
  requestAnimationFrame(roll);
  if (S.mode !== 'dev') return;
  for (const [k, f] of Object.entries(LIVEF)) { const el = document.getElementById(k); if (!el) continue; const tgt = f(); SHOWN[k] = SHOWN[k] == null ? tgt : SHOWN[k] + (tgt - SHOWN[k]) * .12;
    const v = SHOWN[k]; el.textContent = k === 'lvSaved' ? fmtM(v) : k === 'lvTps' ? v.toLocaleString('ru-RU', {maximumFractionDigits:1}) : Math.round(v).toLocaleString('ru-RU'); }
  for (const el of document.querySelectorAll('[data-count]:not([data-done])')) { const tgt = +el.dataset.count, t0 = +(el.dataset.t0 ||= performance.now()), p = Math.min(1, (performance.now() - t0) / 1100), e = 1 - Math.pow(1 - p, 3), v = tgt * e;
    el.textContent = el.dataset.f === 'm' ? fmtM(v) : el.dataset.f === 'p' ? Math.round(v) + '%' : Math.round(v).toLocaleString('ru-RU'); if (p >= 1) el.dataset.done = 1; }
})();
function liveStrip() {
  return `<div class="live"><span class="ldot"></span><b>LIVE</b><span class="mute small">Время симуляции <b id="lvClock">${new Date(SIM.t).toLocaleTimeString('ru-RU')}</b></span>
    <div class="lvs"><span>Проверено сегодня<b id="lvN">—</b></span><span>Заблокировано<b id="lvB" style="color:#e5484d">—</b></span><span>На проверке<b id="lvW" style="color:var(--gold)">—</b></span><span>Сохранено сегодня<b id="lvSaved" style="color:var(--ok)">—</b></span><span>Операций/с<b id="lvTps">—</b></span></div>
    <div class="seg spd" role="group" aria-label="Скорость времени">${[1, 2, 4].map(x => `<button class="${SIM.spd === x ? 'on' : ''}" data-act="spd" data-v="${x}">${x}×</button>`).join('')}</div></div>`;
}
/* ---------- аналитика ---------- */
const svgBox = (id, h) => `<div class="fig" style="min-height:${h}px"><svg id="${id}"></svg></div>`;
function dAnalytics(list) {
  const byCh = {}, ages = [['До 18', 0, 17], ['18–25', 18, 25], ['26–35', 26, 35], ['36–54', 36, 54], ['55+', 55, 120]].map(a => [a[0], 0, 0, a[1], a[2]]);
  list.forEach(c => { byCh[c.channel] = (byCh[c.channel] || 0) + 1; const a = ages.find(x => c.age >= x[3] && c.age <= x[4]); if (a) { a[1]++; if (c.status === 'prevented') a[2]++; } });
  const ch = Object.entries(byCh).sort((a, b) => b[1] - a[1]).slice(0, 8), chMax = Math.max(1, ...ch.map(x => x[1]));
  const by = {}; list.forEach(c => (by[c.city] ||= []).push(c));
  const top = D.CITIES.map(c => { const l = by[c.name] || [], s = stats(l); return {c, s, per:s.lost / c.pop / 10}; }).filter(x => x.s.n).sort((a, b) => b.per - a.per).slice(0, 8);
  const types = D.TYPES.map(t => { const l = list.filter(c => c.type === t.id), s = stats(l); return {t, s, avg:l.length ? l.reduce((x, c) => x + c.amount, 0) / l.length : 0}; }).filter(x => x.s.n);
  return `<div class="agrid">
    <div class="panel a2"><div class="sh"><h3>Поток проверок в реальном времени</h3><span class="xs mute">каждые 10 с симуляции · <i class="lg" style="background:#8d8a80"></i>все <i class="lg" style="background:#e5484d"></i>блок <i class="lg" style="background:#dca262"></i>проверка</span></div>${svgBox('chLive', 220)}</div>
    <div class="panel"><h3>Качество модели · живое</h3><div class="qgrid" id="qBox">${qualityHtml()}</div><p class="xs mute" style="margin:10px 0 0">По синтетическому потоку: мошеннические операции размечены генератором.</p></div>
    <div class="panel a2"><div class="sh"><h3>Случаи по дням, последние 30 дней</h3><span class="xs mute"><i class="lg" style="background:#00b975"></i>предотвращено <i class="lg" style="background:#e5484d"></i>ущерб или расследование</span></div>${svgBox('chDays', 220)}</div>
    <div class="panel"><h3>Каналы атак</h3>${bars(ch.map(([n, v]) => [n, v]), chMax)}</div>
    <div class="panel"><h3>Пострадавшие по возрасту</h3><div class="bars">${ages.map(a => `<div class="r"><span>${a[0]}</span><div class="meter"><i style="width:${a[1] / Math.max(1, ...ages.map(x => x[1])) * 100}%;background:${a[3] >= 55 || a[4] < 18 ? '#c084fc' : 'var(--deep2)'}"></i></div><b>${a[1]}</b></div>`).join('')}</div><p class="xs mute" style="margin:8px 0 0">Фиолетовым — группы, где включается «Защита близких».</p></div>
    <div class="panel"><h3>Ущерб на 1 000 жителей</h3><table><thead><tr><th>Город</th><th>Случаев</th><th>₸ / 1 000 чел.</th></tr></thead><tbody>${top.map(x => `<tr class="click" data-act="city" data-v="${x.c.name}" data-go="map"><td>${x.c.name}</td><td class="n">${x.s.n}</td><td class="n">${Math.round(x.per).toLocaleString('ru-RU')}</td></tr>`).join('')}</tbody></table></div>
    <div class="panel a2"><h3>Схемы: средний чек и доля предотвращённых</h3><div class="scroll"><table class="stack"><thead><tr><th>Схема</th><th>Случаев</th><th>Средняя сумма</th><th>Предотвращено</th><th></th></tr></thead><tbody>${types.map(x => `<tr><td><i class="lg" style="background:${x.t.color}"></i>${x.t.name}</td><td class="n">${x.s.n}</td><td class="n">${fmt(x.avg)}</td><td class="n">${x.s.pct}%</td><td style="width:30%"><div class="meter"><i style="width:${x.s.pct}%;background:${x.t.color}"></i></div></td></tr>`).join('')}</tbody></table></div></div>
  </div>`;
}
function qualityHtml() {
  const {tp, fp, fn} = SIM.cm, pr = tp / Math.max(1, tp + fp), rc = tp / Math.max(1, tp + fn), f1 = 2 * pr * rc / Math.max(1e-9, pr + rc);
  return [['Точность', pr], ['Полнота', rc], ['F1', f1]].map(([n, v]) => `<div><span>${n}</span><b>${(v * 100).toFixed(1).replace('.', ',')}%</b><div class="meter"><i style="width:${v * 100}%;background:var(--ok);animation:none"></i></div></div>`).join('') + `<div><span>Ложные блокировки</span><b>${fp.toLocaleString('ru-RU')}</b></div>`;
}
function updQuality() { SIM._q = (SIM._q || 0) + 1; const q = $('#qBox'); if (q && SIM._q % 4 === 0) q.innerHTML = qualityHtml(); }
function drawLive() {
  const s = $('#chLive'); if (!s) return; const W = s.clientWidth, H = s.clientHeight; if (!W) return;
  const d = SIM.bk, mx = Math.max(4, ...d.map(x => x.n)), p = 26, x = i => p + i * (W - p - 6) / (d.length - 1), y = v => H - 22 - v / mx * (H - 36);
  const line = (k, c, area) => { const pts = d.map((v, i) => `${x(i).toFixed(1)},${y(v[k]).toFixed(1)}`).join(' '); return (area ? `<polygon points="${x(0)},${H - 22} ${pts} ${x(d.length - 1)},${H - 22}" fill="${c}" opacity=".12"/>` : '') + `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`; };
  const ticks = [0, mx / 2, mx].map(v => `<text x="${p - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text><line x1="${p}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#ffffff12"/>`).join('');
  s.innerHTML = ticks + line('n', '#8d8a80', 1) + line('w', '#dca262') + line('b', '#e5484d') + `<circle cx="${x(d.length - 1)}" cy="${y(d.at(-1).n)}" r="4" fill="#f2efe6" class="blink"/><text x="${W - 4}" y="${H - 6}" text-anchor="end">сейчас</text><text x="${p}" y="${H - 6}">−8 мин</text>`;
}
function drawDays() {
  const s = $('#chDays'); if (!s) return; const W = s.clientWidth, H = s.clientHeight; if (!W) return;
  const list = allCases(), days = [...Array(30)].map(() => [0, 0]), now0 = Date.now();
  list.forEach(c => { const i = 29 - Math.floor((now0 - c.ts) / DAY); if (i >= 0 && i < 30) days[i][c.status === 'prevented' ? 0 : 1]++; });
  const mx = Math.max(1, ...days.map(d => d[0] + d[1])), p = 26, bw = (W - p - 4) / 30, y = v => (H - 22) * v / mx * .92;
  s.innerHTML = [0, mx].map(v => `<text x="${p - 6}" y="${H - 22 - y(v) + 4}" text-anchor="end">${v}</text>`).join('') + days.map((d, i) => { const X = p + i * bw + 1, h0 = y(d[0]), h1 = y(d[1]);
    return `<rect class="gb" style="animation-delay:${i * 18}ms" x="${X}" y="${H - 22 - h0}" width="${Math.max(1, bw - 2)}" height="${h0}" fill="#00b975" rx="2"><title>${d[0]} предотвращено</title></rect><rect class="gb" style="animation-delay:${i * 18}ms" x="${X}" y="${H - 22 - h0 - h1}" width="${Math.max(1, bw - 2)}" height="${h1}" fill="#e5484d" rx="2"><title>${d[1]} ущерб</title></rect>`; }).join('')
    + `<text x="${p}" y="${H - 6}">30 дней назад</text><text x="${W - 4}" y="${H - 6}" text-anchor="end">сегодня</text>`;
}
let anaRO;
function mountAnalytics() { drawLive(); drawDays(); anaRO?.disconnect(); anaRO = new ResizeObserver(() => { drawLive(); drawDays(); }); ['#chLive', '#chDays'].forEach(q => $(q) && anaRO.observe($(q))); }

function txModal(tid) {
  const f = feed.find(x => x.id == tid); if (!f) return;
  modal(`<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h2>${f.kind} · ${fmt(f.amount)}</h2><button class="btn sm sec" data-act="close" aria-label="Закрыть">${ic('x')}</button></div><p class="small mute">${f.city} · ${new Date(f.ts).toLocaleTimeString('ru-RU')} · ${decTag(f.dec)}</p>
    <div class="small" style="display:flex;justify-content:space-between"><span>Риск</span><b>${f.risk}/100</b></div>${riskBar(f.risk)}<div style="margin-top:10px">${f.hits.length ? facList(f.hits) : '<p class="small mute">Факторы риска не обнаружены</p>'}</div>`);
}
/* апелляции */
function dAppeals() {
  return `<div class="panel"><h3>Очередь апелляций</h3><p class="small mute">ИИ проверяет доказательства и даёт рекомендацию, решение за сотрудником. Апелляции подаются в профиле клиента.</p>
  <div class="scroll"><table class="stack"><thead><tr><th>Списание</th><th>Довод клиента</th><th>Доказательства</th><th>Рекомендация ИИ</th><th>Решение</th></tr></thead><tbody>
  ${S.appeals.length ? S.appeals.map(a => `<tr><td>${esc(a.ptsReason)}<br><span class="xs mute">${a.delta} баллов · ${dt(a.ts)}</span></td><td>${esc(a.reason)}${a.text ? '<br><span class="xs mute">' + esc(a.text) + '</span>' : ''}</td><td>${a.files.length ? a.files.map(esc).join('<br>') : '<span class="mute">нет</span>'}</td><td>${a.rec}</td>
    <td>${a.st === 'pending' ? `<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm ok" data-act="apok" data-id="${a.id}">Вернуть баллы</button><button class="btn sm bad" data-act="apno" data-id="${a.id}">Отклонить</button></div>` : a.st === 'restored' ? '<span class="tag t-ok">Баллы возвращены</span>' : '<span class="tag t-bad">Отклонена</span>'}</td></tr>`).join('') : '<tr><td colspan="5" class="empty">Апелляций нет</td></tr>'}</tbody></table></div></div>`;
}
/* модель */
function scenRisk(sc) {
  const bal = 1248300 + (sc.id === 'dropper' ? 356500 : 0), amount = sc.op.amount || bal * sc.op.share;
  const h = new Set(Object.keys(sc.op.ctx)); h.add('newRecipient'); if (amount > bal * .5) h.add('bigShare'); if (amount > S.user.avg * 3) h.add('amountAnomaly'); if (sc.id === 'safe') h.add('duringCall');
  return Math.min(100, [...h].reduce((s, k) => s + (S.w[k] || 0), 0));
}
function dModel() {
  const caught = CASES.filter(c => Math.min(100, c.fact.reduce((s, k) => s + (S.w[k] || 0), 0)) >= S.thr.block).length;
  return `<div class="grid2"><div class="panel"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Веса факторов риска</h3><button class="btn sm sec" data-act="resetw">По умолчанию</button></div>
    ${Object.entries(D.FACTORS).map(([k, v]) => `<div class="rng"><span>${v[0]}</span><input type="range" min="0" max="60" value="${S.w[k]}" data-in="w" data-k="${k}" aria-label="${v[0]}"><b id="w-${k}">${S.w[k]}</b></div>`).join('')}
    <h3 style="margin-top:16px">Пороги</h3>
    <div class="rng"><span>Блокировка от</span><input type="range" min="40" max="100" value="${S.thr.block}" data-in="thr" data-k="block" aria-label="Порог блокировки"><b>${S.thr.block}</b></div>
    <div class="rng"><span>Проверка от</span><input type="range" min="10" max="${S.thr.block}" value="${S.thr.warn}" data-in="thr" data-k="warn" aria-label="Порог проверки"><b>${S.thr.warn}</b></div></div>
  <div class="stackv"><div class="panel"><h3>Как модель ведёт себя на сценариях</h3><table><thead><tr><th>Сценарий</th><th>Риск</th><th>Решение</th></tr></thead><tbody>${D.SCEN.map(sc => { const r = scenRisk(sc); return `<tr><td>${sc.title}</td><td class="n">${r}</td><td>${decTag(r >= S.thr.block ? 'block' : r >= S.thr.warn ? 'warn' : 'pass')}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="panel"><h3>Покрытие на исторических случаях</h3><div class="bal" style="font-size:36px">${Math.round(caught / CASES.length * 100)}%</div><p class="small mute">${caught.toLocaleString('ru-RU')} из ${CASES.length.toLocaleString('ru-RU')} синтетических случаев блокируются при текущих весах.</p>
    <p class="small">В продакшене правила заменяет градиентный бустинг (CatBoost) на транзакциях банка, а веса остаются объяснением решения для клиента и сотрудника.</p></div></div></div>`;
}
function dLog() {
  const rn = {passed:'<span class="tag t-bad">Прошла</span>', 'passed (ИИ выключен)':'<span class="tag t-bad">Прошла, ИИ выкл.</span>', warn:'<span class="tag t-warn">Прошла с предупр.</span>', blocked:'<span class="tag t-ok">Заблокирована</span>', cancelled:'<span class="tag t-ok">Отменена клиентом</span>', guardian_declined:'<span class="tag t-ok">Отклонил близкий</span>', refused:'<span class="tag t-ok">Клиент отказался</span>'};
  return `<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><h3 style="margin:0">Действия в клиентском режиме</h3><button class="btn sm bad" data-act="reset">Сбросить все данные</button></div>
  <p class="small mute">Сценарии из клиентского режима попадают на 3D-карту (Алматы) крупными метками.</p>
  <div class="scroll"><table class="stack"><thead><tr><th>Время</th><th>Событие</th><th>Сумма</th><th>Риск</th><th>ИИ</th><th>Итог</th></tr></thead><tbody>
  ${S.events.length ? S.events.map(e => `<tr><td>${dt(e.ts)}</td><td>${esc(e.title)}${D.TYPE[e.type] ? `<br><span class="xs mute">${D.TYPE[e.type].name}</span>` : ''}</td><td class="n">${e.amount ? fmt(e.amount) : '—'}</td><td class="n">${e.risk ?? '—'}</td><td>${e.ai ? 'вкл' : 'выкл'}</td><td>${rn[e.result] || esc(e.result)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">Пока пусто. Запустите «Ситуации» в клиентском режиме.</td></tr>'}</tbody></table></div></div>`;
}

/* ---------- апелляция ---------- */
function appealForm(pid) {
  const p = S.pts.find(x => x.id == pid); if (!p) return;
  modal(`<h2>Оспорить списание</h2><p class="small mute">${esc(p.reason)} · ${p.delta} баллов</p>
    <form id="apf"><label for="aR">Причина</label><select id="aR"><option>Перевод родственнику или знакомому</option><option>Оплата товара или услуги по договору</option><option>Перевод между своими счетами</option><option>Новое устройство — это мой телефон</option><option>Меня обманули, я пострадавший</option><option>Другое</option></select>
    <label for="aT">Комментарий</label><textarea id="aT" rows="3" placeholder="Например: перевёл деньги брату на покупку машины"></textarea>
    <label for="aF">Доказательства: чек, договор, переписка, скриншот</label><input id="aF" type="file" multiple accept="image/*,.pdf">
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn">Отправить</button><button class="btn sec" type="button" data-act="close">Отмена</button></div></form>`);
  $('#apf').onsubmit = e => {
    e.preventDefault();
    const files = [...$('#aF').files].map(f => f.name), reason = $('#aR').value;
    const op = S.ops.find(o => o.id === p.opId), transit = op?.hits?.includes('transit');
    const rec = transit ? '<span class="tag t-warn">Ручная проверка: признаки дропперства</span>' : files.length ? '<span class="tag t-ok">Вернуть: доказательства подтверждают операцию</span>' : '<span class="tag t-warn">Запросить документы</span>';
    S.appeals.unshift({id:id(), pid:p.id, ptsReason:p.reason, delta:p.delta, reason, text:$('#aT').value.trim(), files, ts:Date.now(), st:'pending', rec});
    p.st = 'appeal'; note('Апелляция отправлена в банк'); save(); render(); closeModal(); toast('Апелляция отправлена — её увидит сотрудник банка');
  };
}
function opInfo(oid) {
  const o = S.ops.find(x => x.id == oid); if (!o) return;
  const p = S.pts.find(x => x.opId === o.id);
  modal(`<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h2>${esc(o.title)}</h2><button class="btn sm sec" data-act="close" aria-label="Закрыть">${ic('x')}</button></div><p class="small mute">${esc(o.sub)} · ${dt(o.ts)} · ${fmt(o.amt)}</p>
   <div class="small" style="display:flex;justify-content:space-between"><span>Оценка риска BCC AI</span><b>${o.risk}/100</b></div>${riskBar(o.risk)}<div style="margin-top:10px">${o.hits?.length ? facList(o.hits) : '<p class="small mute">Факторы риска не обнаружены</p>'}</div>
   ${p ? `<p class="small" style="margin-top:10px">Баллы: <b>${p.delta}</b></p>${p.delta < 0 && p.st === 'auto' ? `<button class="btn" data-act="appeal" data-id="${p.id}">Оспорить списание</button>` : ''}` : ''}`);
}

/* ---------- режим презентации: 7 шагов, 3 минуты ---------- */
const PRES = [
  {t:'BCC Shield', dur:16, card:{h:'BCC Shield', p:'ИИ-защита клиентов Банка ЦентрКредит от мошенников', pts:['Проверяет каждую операцию','Распознаёт поддельный голос','Объясняет решение клиенту и банку']},
   say:'BCC Shield — защита клиентов Банка ЦентрКредит от мошенников. Сегодня мошенники звонят голосом близких, нанимают дропперов и представляются банком. Мы встроили в приложение ИИ, который проверяет каждую операцию и объясняет своё решение.',
   run:async () => { toView('user', 'home'); }},
  {t:'Клиент', dur:22, say:'Это клиентская часть в стиле приложения bcc.kz. У каждого клиента есть рейтинг доверия от 0 до 100. Каждый перевод получает оценку риска: от 40 мы просим подтвердить, от 70 — останавливаем. Для пожилых и подростков крупные переводы подтверждает близкий человек.',
   run:async tk => { toView('user', 'home'); await pw(900, tk); spot('.shield'); await pw(5000, tk); spot('.bankcard'); await pw(4500, tk); spot('.qrow'); }},
  {t:'Звонок «сына»', dur:50, say:'Ситуация первая. Маме звонит «сын»: авария, нужно срочно шестьсот тысяч. Голос похож один в один — его клонировали по видео из соцсетей. Voice Guard слушает разговор и в реальном времени находит признаки синтеза. Даже если мама решит перевести, перевод остановлен.',
   run:async tk => { toView('user', 'home'); await pw(500, tk); startScen('deepfake');
     if (!await waitFor('#cAcc', tk)) return; await pw(1600, tk); $('#cAcc')?.click();
     if (!await waitFor('#cGo', tk, 120000)) return; await pw(2600, tk); $('#cGo')?.click();
     if (!await waitFor('[data-act=scgo]', tk, 40000)) return; await pw(1400, tk); $('[data-act=scgo]')?.click();
     if (!await waitFor('#cfGo', tk)) return; await pw(1200, tk); $('#cfGo')?.click(); }},
  {t:'Дропперство', dur:35, say:'Ситуация вторая — дропперство. Студенту предлагают «подработку»: на карту приходят деньги незнакомых людей, их нужно переслать дальше. ИИ видит транзит и замораживает деньги. Клиент не становится соучастником, а пострадавшие получают деньги обратно.',
   run:async tk => { toView('user', 'home'); await pw(500, tk); startScen('dropper');
     if (!await waitFor('[data-act=scgo]', tk, 60000)) return; await pw(1200, tk); $('[data-act=scgo]')?.click();
     if (!await waitFor('#cfGo', tk)) return; await pw(1200, tk); $('#cfGo')?.click(); }},
  {t:'Ситуационный центр', dur:24, say:'Для банка — ситуационный центр. На 3D-карте видно, где и какие схемы работают, вплоть до района города. Поток транзакций идёт в реальном времени, а время можно ускорить в четыре раза.',
   run:async tk => { S.city = null; S.dtab = 'map'; SIM.spd = 4; toView('dev'); await pw(7000, tk); S.city = 'Алматы'; save(); render(); }},
  {t:'Аналитика', dur:18, say:'Аналитика показывает динамику атак, каналы, группы риска и качество модели — точность и полноту. Веса факторов можно менять и сразу видеть эффект.',
   run:async () => { S.dtab = 'analytics'; toView('dev'); }},
  {t:'Итог', dur:10, card:{h:'Спасибо!', p:'BCC Shield — ИИ, который не только блокирует, но и объясняет', pts:['Рейтинг доверия','Voice Guard против дипфейков','3D-ситуационный центр']},
   say:'BCC Shield — ИИ, который не только блокирует мошенников, но и объясняет своё решение. Спасибо!', run:async () => {}}
];
const PRES_TOTAL = PRES.reduce((s, x) => s + x.dur, 0);
let P = null;
const pw = (ms, tk) => new Promise(r => setTimeout(() => r(P && P.tk === tk), ms));
async function waitFor(sel, tk, max = 30000) { const t0 = Date.now(); while (P && P.tk === tk && Date.now() - t0 < max) { if ($(sel)) return true; await sleep(150); } return false; }
function toView(mode, scr) { closeModal(); if (S.mode !== mode || (scr && S.scr !== scr)) animNext = true; S.mode = mode; if (scr) S.scr = scr; save(); render(); scrollTo({top:0, behavior:'smooth'}); }
function spot(sel) { document.querySelectorAll('.spot').forEach(e => e.classList.remove('spot')); const el = $(sel); if (el) { el.classList.add('spot'); el.scrollIntoView({behavior:'smooth', block:'center'}); } }
function presStart() {
  audio(); try { speechSynthesis.getVoices(); } catch (e) {}
  S.ai = true; S.user.arrested = false; S.user.frozen = 0; S.card.blocked = false; S.card.limit = Math.max(S.card.limit, 1000000); S.user.balance = Math.max(S.user.balance, 1248300);
  P = {i:-1, tk:0, el:0, run:true, last:Date.now(), stepEl:0, done:false};
  document.body.classList.add('pres');
  let box = $('#pres'); if (!box) { box = document.createElement('div'); box.id = 'pres'; document.body.append(box); }
  presGo(0); clearInterval(P.iv); P.iv = setInterval(presTick, 200);
}
function presStop() { if (!P) return; clearInterval(P.iv); P.tk++; P = null; endScen(true); closeModal(); SIM.spd = 1; document.body.classList.remove('pres'); document.querySelectorAll('.spot').forEach(e => e.classList.remove('spot')); $('#pres')?.remove(); render(); }
async function presGo(i) {
  if (!P) return; if (i < 0) i = 0; if (i >= PRES.length) return presStop();
  const tk = ++P.tk; P.i = i; P.stepEl = 0; P.done = false;
  endScen(true); closeModal(); document.querySelectorAll('.spot').forEach(e => e.classList.remove('spot'));
  presDraw();
  try { await PRES[i].run(tk); } catch (e) {}
  if (P && P.tk === tk) P.done = true;
}
function presTick() {
  if (!P) return; const now = Date.now(), d = (now - P.last) / 1000; P.last = now;
  if (P.run) { P.el += d; P.stepEl += d; }
  const st = PRES[P.i];

}
function presDraw() {
  const st = PRES[P.i], box = $('#pres');
  box.innerHTML = `${st.card ? `<div class="pcard"><div><h1>${st.card.h}</h1><p>${st.card.p}</p><ul>${st.card.pts.map(x => `<li>${x}</li>`).join('')}</ul></div></div>` : ''}
    <div class="pbar"><div class="psteps">${PRES.map((x, j) => `<button class="${j === P.i ? 'on' : j < P.i ? 'past' : ''}" data-act="pgo" data-v="${j}"><span>${j + 1}</span>${x.t}</button>`).join('')}</div>
      <div class="pmain"><p class="psay">${st.say}</p>
        <div class="pctl"><span class="ptime">${P.i + 1} / ${PRES.length}</span><button data-act="pprev" aria-label="Назад" ${P.i ? '' : 'disabled'}>‹</button><button data-act="pnext" aria-label="${P.i === PRES.length - 1 ? 'Завершить' : 'Дальше'}">${P.i === PRES.length - 1 ? '✓' : '›'}</button><button data-act="pstop" aria-label="Выйти из презентации">✕</button></div></div></div>`;
  presTick();
}
document.addEventListener('click', e => { const b = e.target.closest('[data-act^=p]'); if (!b || !P) return; const a = b.dataset.act;
  if (a === 'pnext') presGo(P.i + 1); else if (a === 'pprev') presGo(P.i - 1); else if (a === 'pstop') presStop(); else if (a === 'pgo') presGo(+b.dataset.v); else if (a === 'ppause') { P.run = !P.run; b.textContent = P.run ? '❚❚' : '▶'; } });
document.addEventListener('keydown', e => { if (!P || e.target.matches('input,textarea,select')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); presGo(P.i + 1); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); presGo(P.i - 1); } else if (e.key === 'Escape' && !$('#layer').innerHTML) presStop(); });

/* ---------- отрисовка и события ---------- */
function render() {
  document.body.className = (S.mode === 'dev' ? 'dev' : 'user') + (typeof P !== 'undefined' && P ? ' pres' : '');
  const focus = document.activeElement?.id, sel = document.activeElement?.selectionStart;
  $('#app').innerHTML = `<div class="top"><div class="logo"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="#d4af37"/><path d="M8 12l3 3 5-6" stroke="#0b0b0c" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg><span>BCC <b>Shield</b></span></div>
    <div class="seg" role="group" aria-label="Режим"><button class="${S.mode === 'user' ? 'on' : ''}" data-act="mode" data-v="user">Клиент</button><button class="${S.mode === 'dev' ? 'on' : ''}" data-act="mode" data-v="dev">Разработчик</button></div>
    <button class="sw ${S.ai ? 'on' : ''}" data-act="ai" role="switch" aria-checked="${S.ai}"><i></i><span class="swl">ИИ-защита</span></button>
    <button class="btn sm presbtn" data-act="pres">${ic('play')}<span>Презентация</span></button></div>
    ${S.ai ? '' : '<div class="aioff" style="' + (aiAnim ? '' : 'animation:none') + '">ИИ-защита выключена: операции не проверяются, баллы не снимаются</div>'}
    ${S.mode === 'dev' ? devView() : userView()}`;
  if (S.mode === 'dev' && S.dtab === 'map') mount3D();
  if (S.mode === 'dev' && S.dtab === 'analytics') mountAnalytics();
  animNext = false; aiAnim = false;
  if (flashBal) { flashBal = false; document.querySelector('.bankcard .bal')?.classList.add('flash'); }
  countBal();
  for (const c of document.querySelectorAll('table.stack td')) { let i = 0, p = c; while (p = p.previousElementSibling) i += p.colSpan; c.dataset.l = c.closest('table').rows[0].cells[i]?.textContent || ''; }
  if (focus) { const el = document.getElementById(focus); if (el) { el.focus(); try { if (sel != null) el.setSelectionRange(sel, sel); } catch (e) {} } }
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act, v = t.dataset.v;
  if (a === 'ovbg') { if (e.target === t) closeModal(); return; }
  switch (a) {
    case 'close': closeModal(); break;
    case 'mode': if (S.mode !== v) { S.mode = v; animNext = true; } if (v === 'dev') endScen(); save(); render(); scrollTo({top:0, behavior:'smooth'}); break;
    case 'ai': S.ai = !S.ai; aiAnim = true; save(); render(); toast(S.ai ? 'ИИ-защита включена' : 'ИИ-защита выключена'); break;
    case 'go': if (S.scr !== v) animNext = true; S.scr = v; if (t.dataset.t) tTab = t.dataset.t; closeModal(); save(); render(); scrollTo({top:0, behavior:'smooth'}); break;
    case 'ttab': tTab = v; animNext = true; render(); break;
    case 'hf': S.hfilter = v; animNext = true; render(); break;
    case 'ct': { const c = S.contacts[t.dataset.i]; $('#tTo').value = c.to; $('#tName').value = c.n; $('#tAmt').focus(); break; }
    case 'recenttog': { S.recentOpen = S.recentOpen === false; $('#recentBox')?.classList.toggle('open', S.recentOpen); t.setAttribute('aria-expanded', S.recentOpen); save(); break; }
    case 'biller': billerPay(t.dataset.c, +t.dataset.i); break;
    case 'paycat': payCat(v); break;
    case 'svc': svcModal(v); break;
    case 'card': cardModal(); break;
    case 'cop': cardOp(v); break;
    case 'cblock': S.card.blocked = !S.card.blocked; save(); render(); cardModal(); toast(S.card.blocked ? 'Карта заблокирована' : 'Карта разблокирована'); break;
    case 'conline': S.card.online = !S.card.online; save(); cardModal(); break;
    case 'cdes': S.card.design = v; save(); render(); cardModal(); break;
    case 'cbcat': { const l = S.cb.sel, i = l.indexOf(v); if (i >= 0) l.splice(i, 1); else if (l.length < 3) l.push(v); else { toast('Можно выбрать только 3 категории в месяц'); break; } save(); render(); break; }
    case 'story': { const st = STORIES[v]; modal(`<div class="storyv" style="--c:${st[1]}"><h2>${st[0]}</h2><p>${st[2]}</p></div><button class="btn full" data-act="close" style="margin-top:14px">Понятно</button>`); break; }
    case 'search': modal(`${head('Поиск')}<input id="gs" placeholder="Платёж, перевод или сервис" autofocus><div id="gsR"></div>`);
      $('#gs').oninput = ev => { const q = ev.target.value.trim().toLowerCase(); const r = q ? CATS.filter(c => c[1].toLowerCase().includes(q) || c[3].some(b => b[0].toLowerCase().includes(q))).map(c => `<button class="row" data-act="paycat" data-v="${c[0]}"><span class="qi">${ic(c[2])}</span><span><b>${c[1]}</b></span>›</button>`).concat(SVC.flatMap(x => x[1]).filter(x => x[1].toLowerCase().includes(q)).map(x => `<button class="row" data-act="svc" data-v="${x[0]}"><span class="qi">${ic(x[2])}</span><span><b>${x[1]}</b></span>›</button>`)) : []; $('#gsR').innerHTML = r.join('') || (q ? '<div class="empty">Ничего не найдено</div>' : ''); }; break;
    case 'notes': modal(`${head('Уведомления')}${S.notes.slice(0, 12).map(n => `<div class="op"><div class="t"><span class="small">${esc(n.text)}</span><br><span class="xs mute">${dt(n.ts)}</span></div></div>`).join('')}`); break;
    case 'support': modal(`${head('Чат с банком', 'Ответим в течение пары минут')}<div class="msg bank" style="max-width:100%;animation:none"><b>BCC</b><br>Здравствуйте! Мы никогда не спрашиваем коды из SMS, CVV и PIN. Чем помочь?</div><p class="small mute" style="margin-top:12px">Также можно позвонить: 505 — бесплатно с мобильного по Казахстану.</p>`); break;
    case 'intl': { const x = INTL[v]; modal(`${head(x[0], x[1])}<form id="inf"><label for="inN">Получатель</label><input id="inN" placeholder="Имя и фамилия латиницей" required><label for="inC">Страна</label><select id="inC"><option>Узбекистан</option><option>Кыргызстан</option><option>Турция</option><option>Германия</option><option>ОАЭ</option></select><label for="inA">Сумма, ₸</label><input id="inA" type="number" min="1" required><p class="xs mute">Комиссия и срок зависят от системы — точные значения в тарифах банка.</p><button class="btn full">Продолжить</button></form>`);
      $('#inf').onsubmit = ev => { ev.preventDefault(); const nm = $('#inN').value, a = +$('#inA').value, cn = $('#inC').value; closeModal(); runOp({kind:'transfer', to:x[0] + ' · ' + cn, toName:nm, amount:a, ctx:{}}); }; break; }
    case 'atr': { const a = S.autotr.find(x => x.id == t.dataset.id); a.on = !a.on; save(); render(); break; }
    case 'apay': { const a = S.autopay.find(x => x.id == t.dataset.id); a.on = !a.on; save(); render(); toast(a.on ? 'Автоплатёж включён' : 'Автоплатёж приостановлен'); break; }
    case 'autopay': modal(`${head('Новый автоплатёж')}<form id="apf2"><label for="apB">Услуга</label><select id="apB">${CATS.flatMap(c => c[3].map(b => `<option data-a="${b[1]}">${esc(b[0])}</option>`)).join('')}</select><label for="apA">Сумма, ₸</label><input id="apA" type="number" min="1" required><label for="apD">Число месяца</label><input id="apD" type="number" min="1" max="28" value="10" required><button class="btn full" style="margin-top:12px">Сохранить</button></form>`);
      $('#apf2').onsubmit = ev => { ev.preventDefault(); S.autopay.push({id:id(), name:$('#apB').value, amt:+$('#apA').value, day:+$('#apD').value, on:true}); save(); closeModal(); render(); toast('Автоплатёж сохранён'); }; break;
    case 'sec': S.sec[v] = !S.sec[v]; note(`${{dcvv:'Динамический CVV', loginNotify:'Уведомления о входе', selfban:'Добровольный отказ от займов'}[v]}: ${S.sec[v] ? 'включено' : 'выключено'}`); save(); render(); break;
    case 'buy': { const g = window._mall[v]; closeModal(); runOp({kind:'payment', to:'BCC Mall', toName:g[0] + ' · рассрочка 1/4', sub:'BCC Mall', amount:Math.round(g[1] / 4), ctx:{}}); break; }
    case 'flight': closeModal(); runOp({kind:'payment', to:'Авиабилеты', toName:'Авиабилет ' + t.dataset.r, sub:'Путешествия', amount:+v, ctx:{}}); break;
    case 'opinfo': opInfo(v || t.dataset.id); break;
    case 'appeal': appealForm(t.dataset.id); break;
    case 'unarrest': S.user.arrested = false; note('Ограничения по счёту сняты'); save(); render(); break;
    case 'scenlist': scenList(); break;
    case 'scen': startScen(v); break;
    case 'endscen': endScen(); break;
    case 'scgo': scGo(); break;
    case 'screfuse': outcome('refuse'); break;
    case 'dtab': if (S.dtab !== v) animNext = true; S.dtab = v; save(); render(); break;
    case 'city': if (t.dataset.go) S.dtab = t.dataset.go; S.city = v || null; S.csearch = ''; save(); render(); if (innerWidth < 1000 && v) $('#map3d')?.scrollIntoView({behavior:'smooth'}); break;
    case 'lm': window.City3D && City3D.focus(+v); if (innerWidth < 1000) $('#map3d')?.scrollIntoView({behavior:'smooth'}); break;
    case 'case': caseModal(v); break;
    case 'tx': txModal(v); break;
    case 'pause': feedPaused = !feedPaused; render(); break;
    case 'spd': SIM.spd = +v; document.querySelectorAll('[data-act=spd]').forEach(b => b.classList.toggle('on', b === t)); toast(`Время ускорено: ${v}×`); break;
    case 'pres': presStart(); break;
    case 'toast': toast(v); closeModal(); break;
    case 'resetw': S.w = DEF().w; S.thr = DEF().thr; save(); render(); break;
    case 'apok': case 'apno': {
      const ap = S.appeals.find(x => x.id == t.dataset.id), p = S.pts.find(x => x.id === ap.pid);
      if (a === 'apok') { ap.st = 'restored'; if (p) p.st = 'restored'; addPts(-ap.delta, 'Возврат баллов по апелляции'); note(`Апелляция одобрена: возвращено ${-ap.delta} баллов`); toast('Баллы возвращены клиенту'); }
      else { ap.st = 'rejected'; if (p) p.st = 'rejected'; note('Апелляция отклонена банком'); toast('Апелляция отклонена'); }
      save(); render(); break; }
    case 'reset': modal(`<h2>Сбросить данные?</h2><p class="small">Баланс, история, баллы, апелляции и журнал вернутся к исходным.</p><div style="display:flex;gap:10px"><button class="btn bad" data-act="reset2">Сбросить</button><button class="btn sec" data-act="close">Отмена</button></div>`); break;
    case 'reset2': endScen(); S = DEF(); S.mode = 'dev'; save(); closeModal(); render(); toast('Данные сброшены'); break;
  }
});
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('button,.btn,[data-act]:not(.ov),select,input[type=checkbox]'); if (!el) return;
  if (el.matches('button,.btn') && !el.classList.contains('sw')) {
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, sp = document.createElement('span');
    sp.className = 'ripple'; sp.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    el.append(sp); setTimeout(() => sp.remove(), 600);
  }
}, {passive:true});
document.addEventListener('submit', e => {
  const fid = e.target.id;
  if (fid === 'ownf') { e.preventDefault(); const d = $('#oDir').value, a = +$('#oAmt').value, u = S.user;
    const from = d === 'fromDep' ? 'deposit' : 'balance'; if (!(a > 0) || a > u[from]) { toast('Недостаточно средств'); return; }
    u[from] -= a; if (d === 'toDep') u.deposit += a; else if (d === 'fromDep') u.balance += a; else S.invest += a;
    S.ops.unshift({id:id(), ts:Date.now(), title:{toDep:'На депозит «Чемпион»', fromDep:'С депозита «Чемпион»', toInv:'На брокерский счёт'}[d], sub:'Перевод между своими счетами', amt:d === 'fromDep' ? a : -a, st:'ok'}); save(); render(); toast('Перевод между своими счетами выполнен'); return; }
  if (fid === 'reqf') { e.preventDefault(); note(`Запрос ${fmt(+$('#rAmt').value)} отправлен: ${$('#rTo').value}`); save(); toast('Запрос денег отправлен'); e.target.reset(); return; }
  if (fid === 'atf') { e.preventDefault(); S.autotr.push({id:id(), to:$('#atTo').value, amt:+$('#atAmt').value, day:+$('#atDay').value, on:true}); save(); render(); toast('Автоперевод создан'); return; }
  if (fid !== 'tf' && fid !== 'tfp') return;
  e.preventDefault();
  const q = fid === 'tfp' ? 'p' : 't', to = $('#' + q + 'To').value.trim(), amount = +$('#' + q + 'Amt').value;
  const name = $('#' + q + 'Name').value.trim() || (S.contacts.find(c => c.to === to)?.n) || to;
  runOp({kind:'transfer', to, toName:name, amount, ctx:{}});
});
document.addEventListener('input', e => {
  const t = e.target, k = t.dataset.in; if (!k) return;
  const u = S.user;
  if (k === 'name') { u.name = t.value; u.first = t.value.split(' ')[0] || u.name; }
  else if (k === 'age') { const n = +t.value; if (n >= 6 && n <= 110) { u.age = n; save(); render(); return; } }
  else if (k === 'gname') u.guardian.name = t.value; else if (k === 'grel') u.guardian.rel = t.value; else if (k === 'gphone') u.guardian.phone = t.value;
  else if (k === 'csearch') { S.csearch = t.value; render(); return; }
  else if (k === 'psearch' || k === 'hsearch') { S[k] = t.value; render(); return; }
  else if (k === 'w') { S.w[t.dataset.k] = +t.value; const b = $('#w-' + t.dataset.k); if (b) b.textContent = t.value; save(); return; }
  else if (k === 'thr') { S.thr[t.dataset.k] = +t.value; if (S.thr.warn > S.thr.block) S.thr.warn = S.thr.block; t.nextElementSibling.textContent = t.value; save(); return; }
  save();
});
document.addEventListener('change', e => {
  const t = e.target, k = t.dataset.in; if (!k) return;
  if (k === 'city') { S.city = t.value || null; save(); render(); }
  if (k === 'ftype') { S.ftype = t.value; save(); render(); }
  if (k === 'fper') { S.fper = +t.value; save(); render(); }
  if (k === 'w' || k === 'thr') render();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#layer').innerHTML) closeModal(); if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-act]')) { e.preventDefault(); e.target.click(); } });

render();
try { if ('serviceWorker' in navigator && location.protocol.startsWith('http') && window.top === window) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
}
