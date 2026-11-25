// BCC Shield — 3D-карта: Казахстан → при приближении 3D-модель города с улицами и главными зданиями.
// Модели схематичные: сетка улиц и застройка генерируются, главные объекты расставлены приблизительно.
window.City3D = (() => {
  let THREE, R, scene, cam, ctl, wrap, cv, overlay, card, crumb, hint;
  let mode = 'none', curCity = null, cb = {}, cases = [], cities = [], borderPts = [];
  let world = null, pinsGroup = null, labels = [], picks = [], lms = [], flyAnim = null, raf = 0;
  let pings = [], lastSwitch = 0, prevDist = 1e9, outTicks = 0, showPins = true, sun, ro;
  const U = {}; // общие материалы
  const proj = (lon, lat) => [(lon - 46) * 24.1 - 500, (55.6 - lat) * 36 - 272];
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- описания городов: улицы (индекс проспекта → название), вода, рельеф, главные объекты ---------- */
  // Проспекты идут через каждые 4 квартала (≈720 м). x — с запада на восток, z — с севера на юг.
  const POOL_X = ['ул. Абая','ул. Байтурсынова','ул. Кунаева','ул. Сатпаева','ул. Ауэзова','ул. Жамбыла'];
  const POOL_Z = ['пр. Республики','пр. Тәуелсіздік','ул. Толе би','ул. Казыбек би','ул. Желтоксан','ул. Абылай хана'];
  const SPEC = {
    'Алматы': {size:260, mountains:'south', x:{'-3':'ул. Розыбакиева','-2':'ул. Ауэзова','-1':'ул. Сейфуллина','0':'пр. Абылай хана','1':'пр. Достык'},
      z:{'-3':'пр. Райымбека','-2':'ул. Жибек Жолы','-1':'ул. Толе би','0':'пр. Абая','1':'ул. Сатпаева','2':'ул. Тимирязева','3':'пр. Аль-Фараби'},
      lm:[['hotelkz','Гостиница «Казахстан»','Высотка 102 м с «короной» на крыше, символ Алматы с 1977 года.',81,9],
          ['stela','Монумент Независимости','Стела на площади Республики.',-20,40,{plaza:22}],
          ['cathedral','Вознесенский собор','Деревянный собор начала XX века в парке 28 гвардейцев-панфиловцев.',58,-112,{park:30}],
          ['esentai','Esentai Tower','Небоскрёб 162 м на углу Аль-Фараби и Достык.',82,226],
          ['koktobe','Кок-Тобе','Гора с телебашней высотой 372 м над городом.',200,150],
          ['stadium','Центральный стадион','Главный стадион города.',-96,150],
          ['bcc','Головной офис BCC','Здесь в 1988 году начинался Банк ЦентрКредит.',-60,-18]]},
    'Астана': {size:250, river:[[-300,-95],[-120,-72],[60,-82],[170,-62],[192,10],[204,120],[230,300]], rw:22,
      x:{'-2':'пр. Туран','-1':'пр. Кабанбай батыра','1':'пр. Мәңгілік Ел'}, z:{'-3':'пр. Абая','-4':'ул. Кенесары','2':'пр. Улы Дала','3':'ул. Сыганак'},
      lm:[['baiterek','Байтерек','Монумент 97 м, символ столицы; в золотом шаре — смотровая площадка.',0,0,{boulevard:[-150,150]}],
          ['khanshatyr','Хан Шатыр','Торгово-развлекательный центр в форме шатра высотой 150 м.',-172,0],
          ['akorda','Ак Орда','Резиденция Президента с голубым куполом.',150,0],
          ['pyramid','Дворец мира и согласия','Пирамида высотой 62 м по проекту Нормана Фостера.',246,-4],
          ['mosque','Мечеть Хазрет Султан','Одна из крупнейших мечетей Центральной Азии.',252,62,{dome:9,col:'white'}],
          ['tower','Abu Dhabi Plaza','Самое высокое здание Центральной Азии, 311 м.',40,-150,{h:31}],
          ['sphere','Нур Алем','Сферический павильон EXPO-2017, музей энергии будущего.',-120,160],
          ['arena','Астана Арена','Стадион с раздвижной крышей.',-215,120],
          ['bcc','Филиал BCC','Отделение банка на левом берегу.',60,40]]},
    'Шымкент': {size:220, x:{'0':'ул. Байтурсынова','2':'пр. Кунаева','-2':'ул. Мадели кожа'}, z:{'0':'пр. Тауке хана','-2':'пр. Республики','2':'ул. Казыбек би'},
      lm:[['stela','Площадь Ордабасы','Центральная площадь с монументом.',0,0,{plaza:22}],
          ['statue','Монумент Байдибек би','Памятник на холме у въезда в город.',-150,-120,{hill:1}],
          ['park','Дендропарк','Большой парк в центре города.',70,110,{park:40}],
          ['mosque','Центральная мечеть','Главная мечеть города.',-70,50,{col:'turq'}],
          ['akimat','Акимат','Здание городской администрации.',40,-50],['bcc','Филиал BCC','Отделение банка.',-30,-40]]},
    'Туркестан': {lm:[['yasawi','Мавзолей Ходжи Ахмеда Ясави','Памятник ЮНЕСКО конца XIV века.',0,-40,{plaza:34}],['karavan','Керуен-Сарай','Туристический комплекс у мавзолея.',80,40]]},
    'Тараз': {lm:[['mausoleum','Мавзолей Карахана','Средневековый мавзолей в центре Тараза.',60,-62]]},
    'Байконыр': {lm:[['rocket','Ракета «Союз»','Памятник ракете-носителю на въезде в город.',60,-60,{plaza:16}]]},
    'Актау': {sea:'west', lm:[['lighthouse','Маяк на жилом доме','Маяк установлен на крыше девятиэтажки.',-60,10]]},
    'Караганда': {lm:[['statue','Монумент «Шахтёрская слава»','Памятник шахтёрам — символ города.',-10,-90,{plaza:18}],['gothic','Собор Девы Марии Фатимской','Католический собор, освящён в 2012 году.',90,-40]]},
    'Павлодар': {river:[[-260,-180],[-200,-60],[-190,80],[-230,260]], rw:30, lm:[['mosque','Мечеть Машхур Жусупа','Мечеть с голубым куполом на берегу Иртыша.',-110,-10,{col:'blue',dome:7}],['cathedral','Благовещенский собор','Православный собор Павлодара.',30,-60]]},
    'Актобе': {lm:[['mosque','Мечеть Нур Гасыр','Главная мечеть Актобе.',30,-40,{dome:7,col:'turq'}]]},
    'Атырау': {river:[[-30,-300],[-10,-100],[-30,40],[0,300]], rw:28, lm:[['mosque','Мечеть Имангали','Центральная мечеть Атырау.',60,-50,{col:'turq'}],['bridge','Пешеходный мост через Урал','Мост соединяет европейский и азиатский берега.',-12,-30,{rot:Math.PI / 2}]]},
    'Семей': {river:[[-300,40],[-80,20],[80,50],[300,30]], rw:30, lm:[['bridge','Подвесной мост через Иртыш','Один из самых длинных подвесных мостов страны.',40,44],['stela','Монумент «Сильнее смерти»','Мемориал жертвам ядерных испытаний.',-60,-60,{plaza:20}]]},
    'Усть-Каменогорск': {mountains:'east', river:[[-300,-60],[-60,-30],[80,40],[300,80]], rw:30, lm:[['akimat','Акимат','Областная администрация.',0,-80]]},
    'Уральск': {river:[[-300,140],[-80,120],[100,160],[300,130]], rw:26, lm:[]},
    'Петропавловск': {river:[[-300,-150],[-120,-130],[60,-170],[300,-140]], rw:24, lm:[]},
    'Костанай': {river:[[-200,-300],[-170,0],[-190,300]], rw:22, lm:[]},
    'Кызылорда': {river:[[-300,-120],[-60,-100],[120,-140],[300,-110]], rw:30, lm:[]}
  };

  /* ---------- инициализация ---------- */
  function init() {
    THREE = window.THREE;
    wrap = document.createElement('div'); wrap.className = 'm3';
    R = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
    R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.outputEncoding = THREE.sRGBEncoding;
    cv = R.domElement; cv.className = 'm3cv'; wrap.append(cv);
    overlay = document.createElement('div'); overlay.className = 'm3lbl'; wrap.append(overlay);
    wrap.insertAdjacentHTML('beforeend', `<div class="m3hud"><div class="m3crumb" id="m3crumb"></div>
      <div class="m3btns"><button data-m3="in" aria-label="Приблизить">+</button><button data-m3="out" aria-label="Отдалить">−</button><button data-m3="top">Сверху</button><button data-m3="rot">Вращение</button><button data-m3="pins" class="on">Случаи</button></div></div>
      <div class="m3card" id="m3card" hidden></div><div class="m3hint" id="m3hint"></div>`);
    crumb = wrap.querySelector('#m3crumb'); card = wrap.querySelector('#m3card'); hint = wrap.querySelector('#m3hint');
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(45, 1, 1, 6000);
    ctl = new THREE.OrbitControls(cam, cv);
    ctl.enableDamping = true; ctl.dampingFactor = .08; ctl.maxPolarAngle = Math.PI * .47; ctl.screenSpacePanning = false; ctl.autoRotateSpeed = .6;
    scene.add(new THREE.HemisphereLight(0xf4efe4, 0x2a2b28, .75));
    sun = new THREE.DirectionalLight(0xffe2b8, 1.15); sun.position.set(-160, 260, 120);
    sun.shadow.mapSize.set(2048, 2048); scene.add(sun, sun.target);
    const S = (c, o) => new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.85}, o || {}));
    Object.assign(U, {
      ground:S(0x1b1d1c), road:S(0x2c2d30, {roughness:.95}), avenue:S(0x35363a, {roughness:.9}), line:new THREE.MeshBasicMaterial({color:0xdca262}),
      park:S(0x2f5a3e), tree:S(0x3f7a4f), trunk:S(0x5a4632), water:S(0x1f5268, {roughness:.25, metalness:.2}), sea:S(0x184559, {roughness:.2, metalness:.25}),
      plaza:S(0x8f8a80), concrete:S(0xd9d3c5), white:S(0xf1eee6), glass:S(0x8aa3ae, {roughness:.2, metalness:.45}), dglass:S(0x4d6a78, {roughness:.15, metalness:.6}),
      gold:S(0xdca262, {roughness:.3, metalness:.85, emissive:0x3a2206}), turq:S(0x2fb3b0, {roughness:.4}), blue:S(0x2f6fd0, {roughness:.4}),
      red:S(0xc8453b), dark:S(0x3a3a3c), sand:S(0xcdb98f), mount:S(0x6b665c, {flatShading:true}), snow:S(0xf4f4f0, {flatShading:true}),
      tent:S(0xe9dcc0, {transparent:true, opacity:.92, roughness:.5}), bld:S(0xffffff, {roughness:.8}),
      kz:S(0x141513, {roughness:.95}), kzside:S(0x6e5a3a, {roughness:.6, metalness:.3})
    });
    wrap.addEventListener('click', e => { const b = e.target.closest('[data-m3]'); if (b) hud(b.dataset.m3, b); });
    let down = null;
    cv.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; stopFly(); });
    cv.addEventListener('pointerup', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 6) pick(e); down = null; });
    cv.addEventListener('wheel', e => {
      if (flyAnim) return;
      if (e.deltaY < 0) { rc = rc || ray(); const r = cv.getBoundingClientRect(); rc.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), cam);
        const pt = new THREE.Vector3(); if (rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), mode === 'country' ? -7 : 0), pt)) { const mv = pt.sub(ctl.target).multiplyScalar(.14); mv.y = 0; ctl.target.add(mv); cam.position.add(mv); } }
      if (mode !== 'city') return;
      const d = cam.position.distanceTo(ctl.target);
      if (e.deltaY > 0 && d >= ctl.maxDistance * .88) { if (++outTicks >= 2) { outTicks = 0; cb.onCity?.(null); } }
      else if (e.deltaY < 0) outTicks = 0;
    }, {passive:true});
    ctl.addEventListener('start', () => { ctl.autoRotate && hud('rot', wrap.querySelector('[data-m3=rot]')); });
    ro = new ResizeObserver(size); ro.observe(wrap);
  }
  function size() { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }

  /* ---------- общий цикл ---------- */
  function loop() {
    if (!wrap.isConnected) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (flyAnim) flyAnim();
    if (pings.length) { const nw = performance.now(); pings = pings.filter(p => { const k = (nw - p.t0) / 1400; if (k >= 1 || !world || p.m.parent !== world) { p.m.parent?.remove(p.m); p.m.geometry.dispose(); p.m.material.dispose(); return false; } p.m.scale.setScalar(1 + k * p.s); p.m.material.opacity = (1 - k) * .9; return true; }); }
    ctl.update();
    if (mode === 'country' && !flyAnim && performance.now() - lastSwitch > 1200) {
      const d = cam.position.distanceTo(ctl.target);
      if (d < 70 && prevDist >= 70) { const n = nearest(ctl.target); if (n) cb.onCity?.(n.name); }
      prevDist = d;
    }
    R.render(scene, cam);
    placeLabels();
  }
  function nearest(t) { let best = null, bd = 48; for (const c of cities) { const [x, z] = proj(c.lon, c.lat), d = Math.hypot(x - t.x, z - t.z); if (d < bd) { bd = d; best = c; } } return best; }
  const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  function fly(pos, tgt, dur, done) {
    const p0 = cam.position.clone(), t0 = ctl.target.clone(), s = performance.now();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) dur = 1;
    ctl.enabled = false;
    flyAnim = () => { const p = Math.min(1, (performance.now() - s) / dur), e = ease(p);
      cam.position.lerpVectors(p0, pos, e); ctl.target.lerpVectors(t0, tgt, e);
      if (p >= 1) { flyAnim = null; ctl.enabled = true; done && done(); } };
  }
  function stopFly() { if (flyAnim) { flyAnim = null; ctl.enabled = true; } }

  /* ---------- подписи поверх сцены ---------- */
  function label(text, pos, cls, max, data) {
    const el = document.createElement('div'); el.className = 'l3 ' + (cls || ''); el.textContent = text;
    if (data) Object.assign(el.dataset, data);
    overlay.append(el); labels.push({el, pos, max:max || 1e9}); return el;
  }
  const _v = () => new THREE.Vector3();
  let tmp;
  function placeLabels() {
    tmp = tmp || _v(); const w = cv.clientWidth, h = cv.clientHeight;
    for (const l of labels) {
      tmp.copy(l.pos).project(cam);
      const d = cam.position.distanceTo(l.pos), vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1 && d < l.max;
      if (!vis) { if (l.on !== false) { l.el.style.display = 'none'; l.on = false; } continue; }
      if (l.on !== true) { l.el.style.display = ''; l.on = true; }
      l.el.style.transform = `translate(${((tmp.x + 1) / 2 * w).toFixed(1)}px,${((1 - tmp.y) / 2 * h).toFixed(1)}px) translate(-50%,-100%)`;
    }
  }
  overlayClick();
  function overlayClick() { document.addEventListener('click', e => { const l = e.target.closest('.l3[data-lm],.l3[data-city]'); if (!l || !wrap || !wrap.contains(l)) return; if (l.dataset.city) cb.onCity?.(l.dataset.city); else showLm(+l.dataset.lm, true); }); }

  /* ---------- очистка ---------- */
  function clearWorld() {
    if (world) { scene.remove(world); world.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    world = null; pinsGroup = null; labels = []; picks = []; lms = []; overlay.innerHTML = ''; card.hidden = true;
  }

  /* ---------- Казахстан ---------- */
  function buildCountry() {
    clearWorld(); mode = 'country'; world = new THREE.Group(); scene.add(world);
    scene.background = new THREE.Color(0x0e0f11); scene.fog = new THREE.Fog(0x0e0f11, 900, 2200);
    const g = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({color:0x121315, roughness:1}));
    g.rotation.x = -Math.PI / 2; g.position.y = -.1; g.receiveShadow = true; world.add(g);
    const sh = new THREE.Shape(borderPts.map(([lo, la]) => { const [x, z] = proj(lo, la); return new THREE.Vector2(x, -z); }));
    const kz = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, {depth:6, bevelEnabled:true, bevelSize:1.5, bevelThickness:1.5, bevelSegments:2}), [U.kz, U.kzside]);
    kz.rotation.x = -Math.PI / 2; kz.receiveShadow = true; world.add(kz);
    const lp = borderPts.map(([lo, la]) => { const [x, z] = proj(lo, la); return new THREE.Vector3(x, 7.6, z); }); lp.push(lp[0].clone());
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({color:0xdca262})));
    // сетка-«меридианы» под страной
    const grid = new THREE.GridHelper(1400, 28, 0x2a2a2e, 0x1c1c20); grid.position.y = 0; world.add(grid);
    const by = {}; cases.forEach(c => (by[c.city] ||= []).push(c));
    for (const c of cities) {
      const l = by[c.name] || [], n = l.length, prev = l.filter(x => x.status === 'prevented').length, pct = n ? prev / n * 100 : 0;
      const col = !n ? 0x55524a : pct >= 60 ? 0x00b975 : pct >= 45 ? 0xdca262 : 0xe5484d;
      const h = 4 + Math.sqrt(n) * 3.2, r = 2.4 + Math.sqrt(n) * .22, [x, z] = proj(c.lon, c.lat);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28), new THREE.MeshStandardMaterial({color:col, emissive:col, emissiveIntensity:.35, roughness:.4}));
      m.position.set(x, 7.5 + h / 2, z); m.castShadow = true; m.userData = {city:c.name}; world.add(m); picks.push(m);
      const base = new THREE.Mesh(new THREE.RingGeometry(r + 1, r + 2.2, 32), new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:.5, side:THREE.DoubleSide}));
      base.rotation.x = -Math.PI / 2; base.position.set(x, 7.7, z); world.add(base);
      if (c.pop >= (wrap.clientWidth < 600 ? 330 : 170)) label(c.name, new THREE.Vector3(x, 9 + h, z), 'l3c', 1500, {city:c.name});
    }
    sun.castShadow = false;
    ctl.minDistance = 30; ctl.maxDistance = 1300; ctl.maxPolarAngle = Math.PI * .45;
    crumb.innerHTML = '<b>Казахстан</b>';
    hint.textContent = 'Приблизьте колесом или щипком к городу — откроется его 3D-модель. Высота столбца — число случаев, цвет — доля предотвращённых.';
  }

  /* ---------- город ---------- */
  const add = (g, geo, mat, x, y, z, sh = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sh) { m.castShadow = true; m.receiveShadow = true; } g.add(m); return m; };
  const B = (g, w, h, d, mat, x, y, z) => add(g, new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z);
  const C = (g, rt, rb, h, mat, x, y, z, seg = 20) => add(g, new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y + h / 2, z);
  const Dm = (g, r, mat, x, y, z, sy = 1) => { const m = add(g, new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat, x, y, z); m.scale.y = sy; return m; };
  const Sp = (g, r, mat, x, y, z) => add(g, new THREE.SphereGeometry(r, 28, 18), mat, x, y, z);
  const Cn = (g, r, h, mat, x, y, z, seg = 20) => add(g, new THREE.ConeGeometry(r, h, seg), mat, x, y + h / 2, z);
  function minaret(g, x, z, h) { C(g, .35, .45, h, U.white, x, 0, z, 12); C(g, .6, .6, .3, U.white, x, h * .8, z, 12); Cn(g, .4, 1.4, U.gold, x, h, z, 12); }

  const BUILD = {
    hotelkz(g) { B(g, 5, 10.2, 2.6, U.concrete, 0, 0, 0); for (let i = 0; i < 9; i++) B(g, 5.05, .12, 2.65, U.dglass, 0, 1 + i, 0); const cr = add(g, new THREE.TorusGeometry(1.6, .22, 8, 24, Math.PI), U.gold, 0, 10.2, 0); cr.scale.set(1, 1.4, 1); C(g, .08, .08, 2.6, U.gold, 0, 10.2, 0, 6); return 13; },
    stela(g) { C(g, 4, 4.6, .8, U.white, 0, 0, 0, 32); C(g, .5, .7, 9, U.white, 0, .8, 0, 12); Sp(g, .7, U.gold, 0, 10.4, 0); Cn(g, .5, 1.4, U.gold, 0, 10.8, 0, 8); return 13; },
    statue(g, o) { if (o.hill) add(g, new THREE.ConeGeometry(16, 6, 24), U.mount, 0, 3, 0); const y = o.hill ? 6 : 0; C(g, 2.4, 2.8, 1.6, U.white, 0, y, 0, 24); C(g, .9, .9, 2.6, U.dark, 0, y + 1.6, 0, 16); Cn(g, 1, 2.2, U.gold, 0, y + 4.2, 0, 12); Sp(g, .55, U.gold, 0, y + 6.8, 0); return y + 9; },
    cathedral(g) { B(g, 6, 4, 9, U.white, 0, 0, 0); B(g, 6.1, .5, 9.1, U.red, 0, 4, 0); C(g, 1.2, 1.2, 3, U.sand, 0, 4.5, 0, 16); Sp(g, 1.4, U.gold, 0, 8.2, 0); Cn(g, .3, 1.6, U.gold, 0, 9.4, 0, 8);
      for (const [x, z] of [[-2.2,-3.4],[2.2,-3.4],[-2.2,3.4],[2.2,3.4]]) { C(g, .6, .6, 2, U.sand, x, 4.5, z, 12); Sp(g, .8, U.blue, x, 7, z); } C(g, 1, 1, 9, U.white, 0, 0, -5.6, 12); Cn(g, 1, 3, U.gold, 0, 9, -5.6, 8); return 14; },
    gothic(g) { B(g, 7, 5, 12, U.sand, 0, 0, 1); for (const x of [-2.4, 2.4]) { B(g, 2.2, 9, 2.2, U.sand, x, 0, -5.4); Cn(g, 1.6, 5, U.dark, x, 9, -5.4, 4).rotation.y = Math.PI / 4; } const r = add(g, new THREE.ConeGeometry(5, 3, 4), U.dark, 0, 6.5, 1); r.rotation.y = Math.PI / 4; r.scale.z = 1.7; return 16; },
    esentai(g) { B(g, 4.2, 14, 4.2, U.dglass, 0, 0, 0); const t = add(g, new THREE.ConeGeometry(3, 4, 4), U.glass, 0, 16, 0); t.rotation.y = Math.PI / 4; B(g, 9, 2.4, 7, U.glass, 4, 0, 3); return 19; },
    koktobe(g) { const hill = add(g, new THREE.ConeGeometry(46, 16, 40, 4), U.mount, 0, 8, 0); hill.scale.z = .8;
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, l = add(g, new THREE.CylinderGeometry(.18, .5, 30, 6), U.white, Math.cos(a) * 1.2, 31, Math.sin(a) * 1.2); l.rotation.z = Math.cos(a) * .04; l.rotation.x = -Math.sin(a) * .04; }
      C(g, .9, .9, .6, U.red, 0, 34, 0, 16); C(g, .12, .12, 10, U.red, 0, 34.6, 0, 6); for (let i = 1; i < 5; i++) C(g, .7, .7, .25, U.red, 0, 16 + i * 4, 0, 12); return 46; },
    stadium(g) { const s = add(g, new THREE.CylinderGeometry(13, 14, 3.4, 40, 1, true), U.white, 0, 1.7, 0); s.scale.z = .72; s.material = U.white.clone(); s.material.side = THREE.DoubleSide;
      const f = add(g, new THREE.CircleGeometry(10, 32), U.park, 0, .08, 0, false); f.rotation.x = -Math.PI / 2; f.scale.y = .62; return 6; },
    arena(g) { BUILD.stadium(g); const r = add(g, new THREE.SphereGeometry(14, 32, 10, 0, Math.PI * 2, 0, Math.PI / 6), U.glass, 0, -8.6, 0); r.scale.z = .72; return 9; },
    bcc(g) { B(g, 7, 5.6, 5, U.white, 0, 0, 0); B(g, 7.2, .5, 5.2, U.gold, 0, 5.6, 0); B(g, 3, 2.2, .3, U.dglass, 0, 0, 2.6); B(g, 2.4, 1.2, .2, U.gold, 0, 3.4, 2.6); return 8; },
    akimat(g) { B(g, 14, 5, 5, U.white, 0, 0, 0); for (let i = -3; i <= 3; i++) C(g, .25, .25, 4, U.white, i * 1.8, 0, 2.8, 8); Dm(g, 1.8, U.turq, 0, 5, 0); C(g, .06, .06, 4, U.dark, 6.5, 5, 0, 6); B(g, 1.6, .9, .05, U.turq, 7.3, 8, 0); return 9; },
    mosque(g, o) { const r = o.dome || 6, col = U[o.col] || U.turq; B(g, r * 2.6, r * .55, r * 2.6, U.white, 0, 0, 0); C(g, r * .95, r * .95, r * .35, U.white, 0, r * .55, 0, 28);
      Dm(g, r * .92, col, 0, r * .9, 0, 1.15); Cn(g, .25, 1.6, U.gold, 0, r * 1.95, 0, 8); const q = r * 1.5; for (const [x, z] of [[-q,-q],[q,-q],[-q,q],[q,q]]) minaret(g, x, z, r * 2.4); return r * 2.8; },
    baiterek(g, o) { if (o.boulevard) { const [a, b] = o.boulevard, p = add(g, new THREE.BoxGeometry(b - a, .12, 14), U.park, (a + b) / 2, .06, 0, false); p.receiveShadow = true; for (let x = a + 6; x < b; x += 9) for (const z of [-5, 5]) { C(g, .15, .15, 1, U.trunk, x, 0, z, 5); Sp(g, 1.1, U.tree, x, 1.8, z); } }
      C(g, 4, 4.4, .8, U.white, 0, 0, 0, 32); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, s = add(g, new THREE.CylinderGeometry(.08, .12, 8.4, 5), U.white, Math.cos(a) * .9, 4.8, Math.sin(a) * .9); s.rotation.z = Math.cos(a) * .12; s.rotation.x = -Math.sin(a) * .12; }
      C(g, .55, .9, 8, U.white, 0, .8, 0, 16); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, s = add(g, new THREE.CylinderGeometry(.06, .06, 2.6, 4), U.white, Math.cos(a) * 1.1, 8.9, Math.sin(a) * 1.1); s.rotation.z = Math.cos(a) * .55; s.rotation.x = -Math.sin(a) * .55; }
      Sp(g, 1.25, U.gold, 0, 9.9, 0); return 13; },
    khanshatyr(g) { const t = add(g, new THREE.ConeGeometry(11, 15, 3, 1), U.tent, 0, 7.5, 0); t.scale.z = .8; C(g, .1, .25, 3, U.dark, 0, 15, 0, 6); return 19; },
    akorda(g) { B(g, 12, 3.6, 7, U.white, 0, 0, 0); for (let i = -2; i <= 2; i++) C(g, .3, .3, 3.2, U.white, i * 2, 0, 3.8, 8); C(g, 2.4, 2.4, 1.4, U.white, 0, 3.6, 0, 24); Dm(g, 2.4, U.blue, 0, 5, 0, 1.1); C(g, .1, .1, 3.6, U.gold, 0, 7.6, 0, 6); Sp(g, .35, U.gold, 0, 11.2, 0); return 13; },
    pyramid(g) { const p = add(g, new THREE.ConeGeometry(4.4, 6.2, 4), U.glass, 0, 3.1, 0); p.rotation.y = Math.PI / 4; const t = add(g, new THREE.ConeGeometry(1.4, 2, 4), U.gold, 0, 5.2, 0); t.rotation.y = Math.PI / 4; return 9; },
    tower(g, o) { const h = o.h || 20; B(g, 4.4, h * .92, 4.4, U.dglass, 0, 0, 0); for (let i = 1; i < h; i += 3) B(g, 4.5, .1, 4.5, U.glass, 0, i, 0); C(g, 1.2, 2, h * .08, U.glass, 0, h * .92, 0, 4); return h + 3; },
    sphere(g) { C(g, 3, 3.6, 1.4, U.dark, 0, 0, 0, 24); Sp(g, 4.6, U.glass, 0, 5.8, 0); add(g, new THREE.TorusGeometry(4.64, .08, 6, 40), U.gold, 0, 5.8, 0).rotation.x = Math.PI / 2; return 12; },
    park(g, o) { const r = o.park || 30, p = add(g, new THREE.CircleGeometry(r, 36), U.park, 0, .07, 0, false); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; return 3; },
    yasawi(g) { B(g, 18, 9, 22, U.sand, 0, 0, 2); B(g, 14, 13, 3, U.sand, 0, 0, -10); B(g, 6, 9, 3.2, U.dark, 0, 0, -10.1); Dm(g, 6.2, U.turq, 0, 9, 4, 1.25); C(g, 4.2, 4.2, 1.4, U.sand, 0, 9, -2, 20); Dm(g, 3.8, U.turq, 0, 10.4, -2, 1.2);
      for (const x of [-7, 7]) { C(g, 1.4, 1.6, 13, U.sand, x, 0, -10, 12); } return 18; },
    karavan(g) { B(g, 20, 4, 12, U.sand, 0, 0, 0); for (const x of [-7, 0, 7]) Dm(g, 2, U.turq, x, 4, 0); return 7; },
    mausoleum(g) { B(g, 7, 5, 7, U.sand, 0, 0, 0); B(g, 7.4, 6.4, 1.4, U.sand, 0, 0, -3.6); Dm(g, 3, U.sand, 0, 5, .6, 1.3); return 10; },
    rocket(g) { C(g, 4, 4.2, 1, U.dark, 0, 0, 0, 24); C(g, .9, .9, 13, U.white, 0, 1, 0, 16); Cn(g, .9, 2.6, U.white, 0, 14, 0, 16); C(g, .7, .7, 3, U.dark, 0, 11, 0, 16);
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .4, x = Math.cos(a) * 1.5, z = Math.sin(a) * 1.5; C(g, .55, .55, 5.4, U.white, x, 1, z, 12); Cn(g, .55, 2.4, U.white, x, 6.4, z, 12); } return 18; },
    lighthouse(g) { B(g, 16, 8.5, 4, U.concrete, 0, 0, 0); for (let i = 0; i < 9; i++) B(g, 16.1, .1, 4.1, U.dglass, 0, .6 + i * .9, 0); C(g, .9, 1.2, 6, U.white, 0, 8.5, 0, 16); for (let i = 0; i < 3; i++) C(g, 1.05, 1.15, .8, U.red, 0, 9.2 + i * 1.8, 0, 16);
      const l = add(g, new THREE.SphereGeometry(.8, 16, 10), new THREE.MeshBasicMaterial({color:0xffe9a8}), 0, 15.2, 0, false); l.userData.blink = 1; Cn(g, 1, 1, U.red, 0, 15.8, 0, 16); return 18; },
    bridge(g) { const L = 70; B(g, 4.4, .5, L, U.white, 0, 1.6, 0); for (const z of [-L / 4, L / 4]) for (const x of [-2.4, 2.4]) C(g, .3, .4, 10, U.white, x, 0, z, 8);
      for (const x of [-2.4, 2.4]) { const pts = []; for (let i = 0; i <= 30; i++) { const z = -L / 2 + i * L / 30, k = Math.abs(z) < L / 4 ? (1 - Math.cos(z / (L / 4) * Math.PI)) * 3.2 : 0; pts.push(new THREE.Vector3(x, Math.abs(z) < L / 4 ? 10 - 4.2 + k * .65 : 10 - (Math.abs(z) - L / 4) / (L / 4) * 8, z)); } g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color:0xf1eee6}))); }
      return 12; },
    station(g) { B(g, 22, 3.6, 6, U.sand, 0, 0, 0); B(g, 3, 9, 3, U.sand, 0, 0, 0); C(g, 1, 1, .2, U.white, 0, 7.2, 1.55, 20).rotation.x = Math.PI / 2; Cn(g, 2, 2.4, U.turq, 0, 9, 0, 4).rotation.y = Math.PI / 4; return 12; }
  };
  
  let poolOff = 0;
  function streetName(axis, k, sp) { const m = sp[axis]; if (m && m[k] != null) return m[k]; if (m) return null; const pool = axis === 'x' ? POOL_X : POOL_Z; return Math.abs(k) <= 2 ? pool[(k + 2 + poolOff) % pool.length] : null; }
  function distSeg(px, pz, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - a[0] - t * dx, pz - a[1] - t * dz); }
  function riverDist(pl, x, z) { let d = 1e9; for (let i = 0; i < pl.length - 1; i++) d = Math.min(d, distSeg(x, z, pl[i], pl[i + 1])); return d; }

  function buildCity(c) {
    clearWorld(); mode = 'city'; world = new THREE.Group(); scene.add(world);
    scene.background = new THREE.Color(0x15171a); scene.fog = new THREE.Fog(0x15171a, 380, 900);
    const sp = SPEC[c.name] || {}, rnd = rng(hash(c.name)); poolOff = hash(c.name) % 6;
    const size = sp.size || (c.pop >= 500 ? 200 : c.pop >= 250 ? 170 : c.pop >= 100 ? 140 : 110);
    const block = 14, road = 4, step = block + road, N = Math.ceil(size / step), ext = N * step;
    const scale = c.pop >= 1000 ? 1.5 : c.pop >= 300 ? 1.15 : c.pop >= 100 ? .9 : .7;
    // земля
    const g0 = add(world, new THREE.PlaneGeometry(ext * 5, ext * 5), U.ground, 0, 0, 0, false); g0.rotation.x = -Math.PI / 2; g0.receiveShadow = true;
    // вода
    const river = sp.river, rw = sp.rw || 24;
    let rpts = null;
    if (river) { const pts = river.map(([x, z]) => new THREE.Vector3(x, 0, z)), curve = new THREE.CatmullRomCurve3(pts), n = 120, pos = [], idx = []; rpts = curve.getPoints(n);
      for (let i = 0; i <= n; i++) { const p = curve.getPoint(i / n), t = curve.getTangent(i / n), nx = -t.z, nz = t.x, l = Math.hypot(nx, nz) || 1; pos.push(p.x + nx / l * rw / 2, .14, p.z + nz / l * rw / 2, p.x - nx / l * rw / 2, .14, p.z - nz / l * rw / 2); if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      const w = new THREE.Mesh(geo, U.water); w.material.side = THREE.DoubleSide; world.add(w); }
    const seaX = sp.sea === 'west' ? -ext * .55 : null;
    if (seaX != null) { const s = add(world, new THREE.PlaneGeometry(ext * 3, ext * 5), U.sea, seaX - ext * 1.5, .06, 0, false); s.rotation.x = -Math.PI / 2; }
    const wet = (x, z, pad) => (river && riverDist(river, x, z) < rw / 2 + pad) || (seaX != null && x < seaX + pad);
    // горы
    if (sp.mountains) { for (let i = 0; i < 26; i++) { const t = i / 25 - .5, along = t * ext * 3.2, out = ext * 1.15 + rnd() * ext * .5, h = 40 + rnd() * 70, r = 50 + rnd() * 50;
      const [x, z] = sp.mountains === 'south' ? [along, out] : [out, along]; const m = add(world, new THREE.ConeGeometry(r, h, 7, 1), U.mount, x, h / 2, z, false); m.rotation.y = rnd() * 3;
      if (h > 70) { const s = add(world, new THREE.ConeGeometry(r * (h - 62) / h, h - 62, 7, 1), U.snow, x, h - (h - 62) / 2, z, false); s.rotation.y = m.rotation.y; } } }
    // главные объекты: резерв места
    const specs = (sp.lm || []).slice();
    const gen = [['akimat','Акимат','Здание городской администрации.',0,-30],['mosque','Центральная мечеть','Главная мечеть города.',-62,44,{dome:4.5}],['station','Железнодорожный вокзал','Вокзал на краю центра.',ext * .1,-ext * .78],['stadium','Стадион','Городской стадион.',ext * .45,ext * .32],['park','Центральный парк','Парк культуры и отдыха.',-ext * .42,-ext * .3,{park:26}],['bcc','Отделение BCC','Филиал банка в центре города.',32,24]];
    const have = new Set(specs.map(s => s[0]));
    if (!sp.lm || specs.length < 3) for (const g of gen) if (!have.has(g[0])) specs.push(g);
    const rr = s => (s[5]?.park || s[5]?.plaza || (s[0] === 'koktobe' ? 46 : s[0] === 'stadium' || s[0] === 'arena' ? 16 : s[0] === 'yasawi' ? 20 : s[0] === 'baiterek' ? 8 : s[0] === 'khanshatyr' ? 12 : s[0] === 'lighthouse' || s[0] === 'akimat' || s[0] === 'station' ? 12 : 8)) + 3;
    const OFF = [[0,0]]; for (let r = 24; r <= 120; r += 24) for (let a = 0; a < 8; a++) OFF.push([Math.round(Math.cos(a * Math.PI / 4) * r), Math.round(Math.sin(a * Math.PI / 4) * r)]);
    const placed = [];
    specs.forEach((s, i) => { const r = rr(s);
      const o = s[0] === 'bridge' ? [0, 0] : OFF.find(([dx, dz]) => !wet(s[3] + dx, s[4] + dz, Math.min(r, 16)) && !placed.some(p => Math.hypot(s[3] + dx - p[0], s[4] + dz - p[1]) < r + p[2] + 4)) || [0, 0];
      specs[i] = s.slice(); specs[i][3] += o[0]; specs[i][4] += o[1]; placed.push([specs[i][3], specs[i][4], r]); });
    const reserve = specs.map(s => [s[3], s[4], rr(s), s]);
    const busy = (x, z, pad) => reserve.some(([rx, rz, r, s]) => s[5]?.boulevard ? (x > s[5].boulevard[0] - pad && x < s[5].boulevard[1] + pad && Math.abs(z - rz) < 7 + pad) : Math.hypot(x - rx, z - rz) < r + pad);
    // дороги
    const roads = new THREE.Group(); world.add(roads);
    for (const axis of ['x', 'z']) for (let i = -N; i <= N; i++) {
      const av = i % 4 === 0, w = av ? road * 1.9 : road, L = ext * 2 + (av ? ext * .8 : 0);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(axis === 'x' ? w : L, axis === 'x' ? L : w), av ? U.avenue : U.road);
      m.rotation.x = -Math.PI / 2; m.position.set(axis === 'x' ? i * step : 0, av ? .1 : .09, axis === 'z' ? i * step : 0); m.receiveShadow = true; roads.add(m);
      if (av) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(axis === 'x' ? .25 : L, axis === 'x' ? L : .25), U.line); ln.rotation.x = -Math.PI / 2; ln.position.set(m.position.x, .12, m.position.z); roads.add(ln);
        if (rpts) for (let q = 0; q < rpts.length - 1; q++) { const A = rpts[q], Bp = rpts[q + 1], c0 = axis === 'x' ? A.x - i * step : A.z - i * step, c1 = axis === 'x' ? Bp.x - i * step : Bp.z - i * step;
          if (c0 * c1 > 0 || c0 === c1) continue; const t = c0 / (c0 - c1), along = axis === 'x' ? A.z + (Bp.z - A.z) * t : A.x + (Bp.x - A.x) * t; if (Math.abs(along) > ext * 1.3) continue;
          const len = rw * 1.9 + 6, bw = w + 1.6, bx = axis === 'x' ? i * step : along, bz = axis === 'x' ? along : i * step;
          B(world, axis === 'x' ? bw : len, .7, axis === 'x' ? len : bw, U.concrete, bx, .1, bz);
          for (const sd of [-1, 1]) B(world, axis === 'x' ? .3 : len, .6, axis === 'x' ? len : .3, U.gold, bx + (axis === 'x' ? sd * bw / 2 : 0), .8, bz + (axis === 'x' ? 0 : sd * bw / 2)); }
        const nm = streetName(axis, i / 4, sp);
        if (nm) for (const t of (size >= 200 ? [-.55, .25] : [-.3])) { const p = t * ext + (rnd() - .5) * step; label(nm, new THREE.Vector3(axis === 'x' ? i * step : p, .5, axis === 'z' ? i * step : p), 'l3s', 330); } }
    }
    // кварталы
    const inst = [], trees = [], pal = [0xd9d3c5, 0xe8e2d4, 0xcfc6b2, 0xbfb6a3, 0xe0d6c0, 0xc9c9c4, 0xd6cfc8];
    for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) {
      const cx = (i + .5) * step, cz = (j + .5) * step, d = Math.hypot(cx, cz) / size;
      if (d > 1.05 + (rnd() - .5) * .3) continue;
      if (wet(cx, cz, block * .7) || busy(cx, cz, block * .45)) { if (!wet(cx, cz, 2) && !busy(cx, cz, 0)) trees.push([cx, cz]); continue; }
      if (rnd() < .07) { const p = add(world, new THREE.PlaneGeometry(block, block), U.park, cx, .07, cz, false); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; for (let k = 0; k < 5; k++) trees.push([cx + (rnd() - .5) * block * .8, cz + (rnd() - .5) * block * .8]); continue; }
      const core = Math.max(0, 1 - d * 1.7), lots = d < .3 && rnd() < .5 ? 1 : rnd() < .5 ? 2 : 4;
      for (let k = 0; k < lots; k++) {
        const lw = lots === 1 ? block : block / 2, ox = lots === 1 ? 0 : ((k % 2) - .5) * lw, oz = lots === 4 ? (Math.floor(k / 2) - .5) * lw : 0, ldz = lots === 2 ? block : lw;
        let h = (1.1 + rnd() * 2.1) * (1 + core * 1.7) * scale; if (rnd() < .04 && d < .5) h *= 1.8;
        const tall = h > 8, col = tall ? (rnd() < .5 ? 0x8aa3ae : 0x6e8a97) : pal[Math.floor(rnd() * pal.length)];
        inst.push([cx + ox, cz + oz, lw * (.62 + rnd() * .26), ldz * (.6 + rnd() * .28), h, col]);
        if (lots < 4 && rnd() < .4) trees.push([cx + ox + lw * .42, cz + oz + ldz * .42]);
      }
    }
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, .5, 0);
    const im = new THREE.InstancedMesh(geo, U.bld, inst.length), M = new THREE.Matrix4(), col = new THREE.Color();
    inst.forEach(([x, z, w, dd, h, c], i) => { M.makeScale(w, h, dd); M.setPosition(x, 0, z); im.setMatrixAt(i, M); im.setColorAt(i, col.setHex(c)); });
    im.castShadow = im.receiveShadow = true; world.add(im);
    // крыши-«технички» на высоких домах
    const roofs = inst.filter(b => b[4] > 6), rim = new THREE.InstancedMesh(geo, U.dark, roofs.length);
    roofs.forEach(([x, z, w, dd, h], i) => { M.makeScale(w * .4, .9, dd * .4); M.setPosition(x, h, z); rim.setMatrixAt(i, M); }); rim.castShadow = true; world.add(rim);
    // деревья
    const tg = new THREE.SphereGeometry(1, 8, 6), ti = new THREE.InstancedMesh(tg, U.tree, trees.length);
    trees.forEach(([x, z], i) => { const s = .9 + rnd() * .9; M.makeScale(s, s * 1.2, s); M.setPosition(x, s * 1.2 + .4, z); ti.setMatrixAt(i, M); }); ti.castShadow = true; world.add(ti);
    // главные объекты
    specs.forEach((s, idx) => {
      const [type, name, desc, x, z, o = {}] = s, g = new THREE.Group(), fn = BUILD[type] || BUILD.akimat;
      if (o.plaza) { const p = add(g, new THREE.CircleGeometry(o.plaza, 40), U.plaza, 0, .11, 0, false); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; }
      if (o.park && type !== 'park') { const p = add(g, new THREE.CircleGeometry(o.park, 36), U.park, 0, .1, 0, false); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; for (let k = 0; k < 26; k++) { const a = rnd() * 6.28, r = 9 + rnd() * (o.park - 10); C(g, .15, .15, 1, U.trunk, Math.cos(a) * r, 0, Math.sin(a) * r, 5); Sp(g, 1.3, U.tree, Math.cos(a) * r, 2, Math.sin(a) * r); } }
      const top = fn(g, o) || 8; g.position.set(x, 0, z); g.rotation.y = o.rot || 0;
      g.traverse(m => { if (m.isMesh) m.userData.lm = idx; picks.push(m); }); world.add(g);
      lms.push({name, desc, x, z, top, type});
      label(name, new THREE.Vector3(x, top + 1.5, z), 'l3m', 700, {lm:String(idx)});
    });
    // районы и случаи
    buildPins(c, size);
    // свет и тени
    sun.castShadow = true; const sc = sun.shadow.camera; sc.left = sc.bottom = -size * 1.3; sc.right = sc.top = size * 1.3; sc.near = 10; sc.far = 900; sc.updateProjectionMatrix();
    sun.position.set(-size * .7, size * 1.1, size * .5); sun.target.position.set(0, 0, 0);
    ctl.minDistance = 18; ctl.maxDistance = size * 2.6; ctl.maxPolarAngle = Math.PI * .46;
    crumb.innerHTML = `<button data-m3="back">Казахстан</button> › <b>${esc(c.name)}</b>`;
    hint.textContent = 'Схематичная 3D-модель: сетка улиц и застройка сгенерированы, главные здания расставлены приблизительно. Отдалите колесом до упора, чтобы вернуться к карте страны.';
    return size;
  }

  function buildPins(c, size) {
    if (pinsGroup) { world.remove(pinsGroup); pinsGroup.traverse(o => o.geometry && o.geometry.dispose()); picks = picks.filter(p => p.userData.case == null); labels = labels.filter(l => { if (l.el.classList.contains('l3d')) { l.el.remove(); return false; } return true; }); }
    pinsGroup = new THREE.Group(); pinsGroup.visible = showPins; world.add(pinsGroup);
    const cl = cases.filter(x => x.city === c.name), dists = [...new Set(cl.map(x => x.district))];
    const dpos = {}; dists.forEach((d, i) => { const a = i / Math.max(1, dists.length) * Math.PI * 2 - Math.PI / 2 + .3, r = dists.length === 1 ? 0 : size * .52; dpos[d] = [Math.cos(a) * r, Math.sin(a) * r]; });
    const stick = new THREE.CylinderGeometry(.12, .12, 1, 6); stick.translate(0, .5, 0);
    const head = new THREE.SphereGeometry(1, 16, 12), ring = new THREE.TorusGeometry(1.35, .22, 8, 24);
    for (const d of dists) { const [x, z] = dpos[d], dc = cl.filter(k => k.district === d).length;
      const disc = new THREE.Mesh(new THREE.CircleGeometry(size * .2, 40), new THREE.MeshBasicMaterial({color:0xdca262, transparent:true, opacity:.07, depthWrite:false})); disc.rotation.x = -Math.PI / 2; disc.position.set(x, .2, z); pinsGroup.add(disc);
      const el = label(`${d.replace(/ ?р-н ?/, '')} · ${dc}`, new THREE.Vector3(x, 30, z), 'l3d', 900); el.hidden = !showPins; }
    cl.slice(0, 260).forEach(k => {
      const [dx, dz] = dpos[k.district], x = dx + k.dx * size * .16, z = dz + k.dy * size * .16, t = (cb.typeColor?.(k.type)) || '#e5484d', colr = new THREE.Color(t);
      const h = 17 + (hash(k.id) % 10) + (k.live ? 8 : 0), prev = k.status === 'prevented';
      const st = new THREE.Mesh(stick, new THREE.MeshBasicMaterial({color:colr, transparent:true, opacity:.55})); st.scale.y = h; st.position.set(x, 0, z); pinsGroup.add(st);
      const hd = new THREE.Mesh(head, new THREE.MeshStandardMaterial({color:prev ? 0xf1eee6 : colr, emissive:colr, emissiveIntensity:prev ? .15 : .8, roughness:.3})); hd.position.set(x, h + 1.6, z); hd.scale.setScalar(k.live ? 2.8 : 1.7); hd.userData.case = k.id; pinsGroup.add(hd); picks.push(hd);
      if (prev) { const rg = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({color:colr})); rg.position.copy(hd.position); rg.scale.copy(hd.scale); rg.userData.spin = 1; rg.userData.case = k.id; pinsGroup.add(rg); }
    });
  }

  /* ---------- выбор объектов ---------- */
  const ray = () => new THREE.Raycaster();
  let rc;
  function pick(e) {
    rc = rc || ray(); const r = cv.getBoundingClientRect(), v = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    rc.setFromCamera(v, cam); const hit = rc.intersectObjects(picks.filter(p => p.visible && (p.userData.case == null || showPins)), false)[0];
    if (!hit) { card.hidden = true; return; }
    const u = hit.object.userData;
    if (u.city) cb.onCity?.(u.city); else if (u.case) cb.onCase?.(u.case); else if (u.lm != null) showLm(u.lm, true);
  }
  function showLm(i, go) {
    const l = lms[i]; if (!l) return;
    card.hidden = false; card.innerHTML = `<b>${esc(l.name)}</b><p>${esc(l.desc)}</p><button data-m3="close" aria-label="Закрыть">×</button>`;
    if (go) { const r = Math.max(28, l.top * 2.4); fly(new THREE.Vector3(l.x + r * .8, l.top * 1.1 + r * .45, l.z + r), new THREE.Vector3(l.x, l.top * .45, l.z), 900); }
  }
  function hud(a, b) {
    if (a === 'in' || a === 'out') { const k = a === 'in' ? .7 : 1.4, off = cam.position.clone().sub(ctl.target).multiplyScalar(k), l = off.length();
      if (l < ctl.minDistance || l > ctl.maxDistance) { if (a === 'out' && mode === 'city') cb.onCity?.(null); else if (a === 'in' && mode === 'country') { const n = nearest(ctl.target); if (n) cb.onCity?.(n.name); } return; }
      fly(ctl.target.clone().add(off), ctl.target.clone(), 450); }
    else if (a === 'top') { const d = cam.position.distanceTo(ctl.target); fly(ctl.target.clone().add(new THREE.Vector3(0, d, .01)), ctl.target.clone(), 700); }
    else if (a === 'rot') { ctl.autoRotate = !ctl.autoRotate; b && b.classList.toggle('on', ctl.autoRotate); }
    else if (a === 'pins') { showPins = !showPins; b && b.classList.toggle('on', showPins); if (pinsGroup) pinsGroup.visible = showPins; overlay.querySelectorAll('.l3d').forEach(el => el.hidden = !showPins); }
    else if (a === 'back') cb.onCity?.(null);
    else if (a === 'close') card.hidden = true;
  }

  /* ---------- переходы ---------- */
  function goCountry(from) {
    buildCountry(); lastSwitch = performance.now(); prevDist = 1e9;
    const k = Math.max(1, 1.25 / Math.max(.3, cam.aspect)), home = new THREE.Vector3(0, 560 * k, 600 * k), tgt = new THREE.Vector3(0, 0, 30);
    if (from) { const [x, z] = proj(from.lon, from.lat); cam.position.set(x, 50, z + 55); ctl.target.set(x, 0, z); fly(home, tgt, 1100); }
    else { cam.position.copy(home); ctl.target.copy(tgt); }
  }
  function goCity(c) {
    const enter = () => { const s = buildCity(c); lastSwitch = performance.now(); outTicks = 0; cb.onBuilt?.();
      cam.position.set(s * .2, s * 2.2, s * 2.6); ctl.target.set(0, 0, 0); fly(new THREE.Vector3(s * .55, s * .55, s * .9), new THREE.Vector3(0, 0, 10), 1400); };
    if (mode === 'country') { const [x, z] = proj(c.lon, c.lat); fly(new THREE.Vector3(x, 26, z + 30), new THREE.Vector3(x, 0, z), 650, enter); }
    else enter();
  }

  /* ---------- публичный интерфейс ---------- */
  return {
    ok: () => !!(window.THREE && window.THREE.OrbitControls),
    mount(el, opts) {
      if (!this.ok()) { el.innerHTML = '<div class="empty" style="padding:60px 10px">Не удалось загрузить 3D-движок (нужен интернет при первом запуске).</div>'; return; }
      if (!R) init();
      Object.assign(cb, opts.cb || {}); cities = opts.cities; borderPts = opts.border;
      el.append(wrap); size();
      if (mode === 'none') { cases = opts.cases; curCity = opts.city || null; goCountry(); if (curCity) goCity(cities.find(c => c.name === curCity)); }
      else this.update(opts.cases, opts.city);
      if (!raf) loop();
    },
    update(list, city) {
      const changed = list !== cases && (list.length !== cases.length || list[0]?.id !== cases[0]?.id || list.at(-1)?.id !== cases.at(-1)?.id);
      cases = list; city = city || null;
      if (city !== curCity) { const prev = cities.find(c => c.name === curCity); curCity = city; if (city) goCity(cities.find(c => c.name === city)); else goCountry(prev); return; }
      if (!changed) return;
      if (mode === 'country') { const p = cam.position.clone(), t = ctl.target.clone(); buildCountry(); cam.position.copy(p); ctl.target.copy(t); }
      else if (mode === 'city') { const c = cities.find(x => x.name === curCity); buildPins(c, SPEC[c.name]?.size || (c.pop >= 500 ? 200 : c.pop >= 250 ? 170 : c.pop >= 100 ? 140 : 110)); }
    },
    ping(name, color) {
      if (!world || !THREE || pings.length > 40 || !wrap?.isConnected) return; let x, z, y, r;
      if (mode === 'country') { const c = cities.find(q => q.name === name); if (!c) return; [x, z] = proj(c.lon, c.lat); y = 8; r = 3; }
      else if (mode === 'city' && name === curCity) { const a = Math.random() * 6.28, d = Math.random() * 120; x = Math.cos(a) * d; z = Math.sin(a) * d; y = .6; r = 4; }
      else return;
      const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 1.4, 40), new THREE.MeshBasicMaterial({color, transparent:true, opacity:.9, side:THREE.DoubleSide, depthWrite:false}));
      m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); world.add(m); pings.push({m, t0:performance.now(), s:mode === 'country' ? 5 : 7});
    },
    landmarks: () => lms.map(l => l.name),
    focus(i) { showLm(i, true); }
  };
})();
