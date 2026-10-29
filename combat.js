/* Isekai Online - combate animado y habilidades (v0.15.0) */
(function () {
  const $ = id => document.getElementById(id);
  const PI = Math.PI, TAU = PI * 2, rnd = Math.random;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);
  const qa = (v, a) => new THREE.Quaternion().setFromAxisAngle(v, a);
  const mul = (a, b, c) => { const r = a.multiply(b); return c ? r.multiply(c) : r; };

  /* ---------- habilidades (se desbloquean por nivel) ---------- */
  const SK = [
    { id: 'jump', lv: 1, n: 'Salto', ic: '⬆️', d: 'Toca ⬆️ para saltar.' },
    { id: 'dash', lv: 2, n: 'Dash', ic: '💨', d: 'Impulso veloz. Mientras dura, esquivas todo golpe.' },
    { id: 'dj', lv: 3, n: 'Doble salto', ic: '🦅', d: 'Toca ⬆️ otra vez en el aire.' },
    { id: 'plunge', lv: 4, n: 'Golpe aéreo', ic: '☄️', d: 'Ataca en el aire: caes con una onda de choque.' },
    { id: 'spin', lv: 6, n: 'Torbellino', ic: '🌀', d: 'Giro de espada que golpea a todos a tu alrededor.' },
    { id: 'wave', lv: 8, n: 'Onda de espada', ic: '🌙', d: 'Lanzas un tajo de energía hacia adelante.' },
    { id: 'ult', lv: 12, n: 'Corte Celeste', ic: '🌟', d: 'Tu técnica final: lluvia de cortes devastadora.' }
  ];
  const CD = { dash: 1.1, spin: 6, wave: 8, ult: 25 };
  const cdL = { dash: 0, spin: 0, wave: 0, ult: 0 };
  const lvOf = id => SK.find(k => k.id == id).lv;
  const has = id => !!S && (S.lv || 1) >= lvOf(id);
  const dmgB = () => 8 + (S.lv || 1) * 2 + (S.axe ? 5 : 0) + Math.floor(((S.st && S.st.fue) || 0) / 12);

  /* ---------- interfaz ---------- */
  const css = document.createElement('style');
  css.textContent = `
#skl{position:fixed;z-index:6;right:calc(env(safe-area-inset-right,0px) + 262px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px);width:140px;height:200px;pointer-events:none}
#skl .skb{position:absolute;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;border:2px solid rgba(255,255,255,.8);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7);box-shadow:0 4px 10px rgba(0,0,0,.35);padding:0;line-height:1;touch-action:none;user-select:none;-webkit-user-select:none;transition:transform .08s,opacity .15s}
#skl .skb:active{transform:scale(.9);filter:brightness(1.2)}
#skl .skb .ic{font-size:24px}#skl .skb .lb{font-size:9px;font-weight:700;margin-top:1px}
#skn{display:none;position:fixed;z-index:30;left:50%;top:calc(env(safe-area-inset-top,0px) + 70px);transform:translateX(-50%);text-align:center;padding:10px 22px;border-radius:16px;background:linear-gradient(160deg,rgba(40,28,100,.95),rgba(20,14,60,.95));border:2px solid #ffd25e;color:#fff;box-shadow:0 0 22px rgba(255,210,94,.6);pointer-events:none;max-width:80vw}
#skn small{display:block;color:#ffd25e;font-size:11px;letter-spacing:1px}#skn b{font-size:20px}#skn div{font-size:12px;opacity:.9;margin-top:2px}
#cflash{position:fixed;inset:0;z-index:24;background:#fff;opacity:0;pointer-events:none;transition:opacity .25s}
`;
  document.head.appendChild(css);
  const box = document.createElement('div'); box.id = 'skl'; document.body.appendChild(box);
  const bn = document.createElement('div'); bn.id = 'skn'; document.body.appendChild(bn);
  const fl = document.createElement('div'); fl.id = 'cflash'; document.body.appendChild(fl);
  const BT = {};
  let qJump = false, qDash = false, qAtk = false, qSpin = false, qWave = false, qUlt = false;
  function mkb(id, ic, lb, l, b, sz, bg, fn) {
    const e = document.createElement('button');
    e.style.cssText = 'left:' + l + 'px;bottom:' + b + 'px;width:' + sz + 'px;height:' + sz + 'px;background:' + bg + ';display:none';
    e.className = 'skb'; e.innerHTML = '<span class="ic">' + ic + '</span><span class="lb">' + lb + '</span>';
    e.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); fn(); });
    box.appendChild(e); BT[id] = { e, lb: e.querySelector('.lb'), n: lb };
  }
  mkb('jump', '⬆️', 'Salto', 74, 0, 62, 'linear-gradient(160deg,#8fd0ff,#4a78ff)', () => { qJump = true; });
  mkb('dash', '💨', 'Dash', 74, 70, 56, 'linear-gradient(160deg,#b9f0ff,#3fb6d9)', () => { qDash = true; });
  mkb('spin', '🌀', 'Torbellino', 8, 0, 56, 'linear-gradient(160deg,#9af0c8,#1aa57a)', () => { qSpin = true; });
  mkb('wave', '🌙', 'Onda', 8, 64, 56, 'linear-gradient(160deg,#c9b8ff,#7a5cff)', () => { qWave = true; });
  mkb('ult', '🌟', 'Corte', 40, 128, 62, 'linear-gradient(160deg,#ffe27a,#ff6a8a)', () => { qUlt = true; });
  const atkBtn = $('atk');
  if (atkBtn) atkBtn.addEventListener('click', () => { qAtk = true; });
  addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code == 'Space') qJump = true; else if (e.code == 'ShiftLeft') qDash = true; else if (e.code == 'KeyJ') qAtk = true;
    else if (e.code == 'KeyK') qSpin = true; else if (e.code == 'KeyL') qWave = true; else if (e.code == 'KeyU') qUlt = true;
  });

  const bq = []; let bt = 0;
  function checkUnlock() {
    if (!Array.isArray(S.skn)) S.skn = [];
    const nw = [];
    SK.forEach(k => { if ((S.lv || 1) >= k.lv && S.skn.indexOf(k.id) < 0) { S.skn.push(k.id); nw.push(k); } });
    if (nw.length) { dirty = true; bq.push(nw.length == 1 ? nw[0] : { ic: '✨', n: '¡' + nw.length + ' habilidades!', d: nw.map(k => k.ic + ' ' + k.n).join(' · ') }); }
    SK.forEach(k => { const b = BT[k.id]; if (b) b.e.style.display = has(k.id) ? 'flex' : 'none'; });
  }
  function banner(dt) {
    if (bt > 0) { bt -= dt; if (bt <= 0) bn.style.display = 'none'; return; }
    const k = bq.shift(); if (!k) return;
    bn.innerHTML = '<small>✨ NUEVA HABILIDAD</small><b>' + k.ic + ' ' + k.n + '</b><div>' + k.d + '</div>';
    bn.style.display = 'block'; bt = 3.2; say('[Sistema] ✨ Habilidad desbloqueada: ' + k.n);
  }

  /* ---------- efectos: partículas, anillos, cortes ---------- */
  const gt = document.createElement('canvas'); gt.width = gt.height = 32;
  { const x = gt.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); }
  const GT = new THREE.CanvasTexture(gt);
  const PS = [];
  for (let i = 0; i < 60; i++) {
    const m = new THREE.SpriteMaterial({ map: GT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const s = new THREE.Sprite(m); s.visible = false; scene.add(s);
    PS.push({ s, m, life: 0, max: 1, vx: 0, vy: 0, vz: 0, sz: 1, grow: 0, g: 0 });
  }
  function puff(x, y, z, col, sz, vx, vy, vz, life, grow, g) {
    const p = PS.find(q => q.life <= 0); if (!p) return;
    p.life = p.max = life; p.vx = vx; p.vy = vy; p.vz = vz; p.sz = sz; p.grow = grow; p.g = g || 0;
    p.m.color.setHex(col); p.s.position.set(x, y, z); p.s.scale.set(sz, sz, 1); p.s.visible = true;
  }
  function burst(x, y, z, col, n, spd) {
    for (let i = 0; i < n; i++) { const a = rnd() * TAU, u = (rnd() * .8 + .2) * spd; puff(x, y, z, col, .5 + rnd() * .4, Math.cos(a) * u, rnd() * spd * .8, Math.sin(a) * u, .3 + rnd() * .25, -.8, 8); }
  }
  const RG = new THREE.RingGeometry(.85, 1, 36).rotateX(-PI / 2);
  const RS = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const o = new THREE.Mesh(RG, m); o.visible = false; scene.add(o);
    RS.push({ o, m, life: 0, max: 1, r: 1 });
  }
  function ring(x, y, z, col, r, life) {
    const q = RS.find(v => v.life <= 0); if (!q) return;
    q.life = q.max = life; q.r = r; q.m.color.setHex(col); q.o.position.set(x, y, z); q.o.visible = true;
  }
  const CG = new THREE.RingGeometry(1.9, 2.5, 20, 1, 0, 2.1);
  const CS = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const o = new THREE.Mesh(CG, m); o.visible = false; scene.add(o);
    CS.push({ o, m, life: 0, max: 1 });
  }
  function slashFx(x, y, z, yaw, tilt, col, life, sc) {
    const q = CS.find(v => v.life <= 0); if (!q) return;
    q.life = q.max = life; q.sc = sc || 1; q.m.color.setHex(col);
    q.o.position.set(x, y, z); q.o.rotation.order = 'YXZ'; q.o.rotation.set(0, yaw, tilt - 1);
    q.o.visible = true;
  }
  function fxUpdate(dt) {
    PS.forEach(p => {
      if (p.life <= 0) return;
      p.life -= dt;
      if (p.life <= 0) { p.s.visible = false; return; }
      p.vy -= p.g * dt; const k = p.life / p.max;
      p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
      p.sz = Math.max(.05, p.sz + p.grow * dt); p.s.scale.set(p.sz, p.sz, 1); p.m.opacity = Math.min(1, k * 1.6);
    });
    RS.forEach(q => {
      if (q.life <= 0) return;
      q.life -= dt; if (q.life <= 0) { q.o.visible = false; return; }
      const k = 1 - q.life / q.max; q.o.scale.setScalar(.4 + q.r * (1 - (1 - k) * (1 - k))); q.m.opacity = (1 - k) * .85;
    });
    CS.forEach(q => {
      if (q.life <= 0) return;
      q.life -= dt; if (q.life <= 0) { q.o.visible = false; return; }
      const k = 1 - q.life / q.max; q.o.scale.setScalar(q.sc * (.7 + k * .6)); q.m.opacity = (1 - k) * .9;
    });
  }

  /* ---------- daño en área (usa los ganchos AOE_* de los demás archivos) ---------- */
  function aoe(x, z, r, dmg, kb) {
    let n = 0;
    try {
      if (window.DGON) { if (window.AOE_DG) n += window.AOE_DG(x, z, r, dmg, kb || 0); }
      else { if (window.AOE_SL) n += window.AOE_SL(x, z, r, dmg, kb || 0); if (window.AOE_SS) n += window.AOE_SS(x, z, r, dmg); }
    } catch (e) { }
    return n;
  }

  /* ---------- partes del personaje ---------- */
  let arms = [], legs = [], back = null, capeG = null, held = null, trPiv = null, trM = null, trMesh = null, spR = null, spM = null, aura = null;
  function findParts() {
    const gs = player.children.filter(c => c.isGroup && !c.userData.cb);
    legs = gs.filter(g => Math.abs(g.position.y - .66) < .02).sort((a, b) => a.position.x - b.position.x);
    arms = gs.filter(g => Math.abs(g.position.y - 1.3) < .02 && Math.abs(Math.abs(g.position.x) - .42) < .02).sort((a, b) => a.position.x - b.position.x);
    back = gs.find(g => Math.abs(g.position.z + .5) < .02 && Math.abs(g.position.y - 1.2) < .05) || null;
    capeG = gs.find(g => Math.abs(g.position.y - 1.35) < .02 && Math.abs(g.position.x) < .01) || null;
  }
  function buildExtras() {
    if (held || arms.length < 2) return;
    const g = new THREE.Group(); g.userData.cb = 1;
    const add = (geo, c, x, y, z) => { const o = new THREE.Mesh(geo, toon(c)); o.position.set(x, y, z); g.add(o); return o; };
    add(new THREE.CylinderGeometry(.04, .04, .3, 6), 0x5a3a22, 0, -.5, 0);
    add(new THREE.BoxGeometry(.34, .06, .08), 0xffd25e, 0, -.68, 0);
    add(new THREE.BoxGeometry(.1, 1.15, .03), 0xdfe8ff, 0, -1.27, 0);
    add(new THREE.ConeGeometry(.05, .18, 4), 0xdfe8ff, 0, -1.93, 0).rotation.x = PI;
    g.visible = false; arms[0].add(g); held = g;
    if (window.outlineGroup) window.outlineGroup(g, 1.08);
    trM = new THREE.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    trMesh = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.95, 24, 1, 0, 1.05), trM);
    trPiv = new THREE.Group(); trPiv.userData.cb = 1; trPiv.add(trMesh); trPiv.position.set(-.42, 1.3, 0); player.add(trPiv);
    spM = new THREE.MeshBasicMaterial({ color: 0x9af0ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    spR = new THREE.Mesh(new THREE.RingGeometry(1.2, 2.7, 32, 1, 0, 5), spM); spR.rotation.x = -PI / 2 + .12; spR.position.y = 1.15; spR.userData.cb = 1; player.add(spR);
    aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, color: 0xffd25e, opacity: 0 }));
    aura.scale.set(5, 5, 1); aura.position.y = 1.4; aura.userData.cb = 1; player.add(aura);
    player.rotation.order = 'YXZ';
  }

  /* ---------- estado ---------- */
  let tm = 0, gy = 0, vy = 0, air = false, jumps = 0, sq = 0, plunge = 0;
  let acd = 0, since = 9, step = 0, hold = 0, ln = 0, shk = 0, fovAdd = 0, hpPrev = null, inv = 0, fy0 = 0;
  let tw = 0, lastRy = null, dashT = 0, dashX = 0, dashZ = 0, dashFx = 0;
  const atk = { on: false, t: 0, dur: .3, P: null, hit: false, fin: false };
  const sk = { on: false, id: '', t: 0, dur: 1, n: 0, fired: false };
  const PR = [];
  const STEPS = [
    { type: 'h', tilt: -.45, a: -1.35, b: 1.35, dur: .3, lunge: 3.4, hitAt: .35 },
    { type: 'h', tilt: .45, a: 1.35, b: -1.35, dur: .3, lunge: 3.4, hitAt: .35 },
    { type: 'c', tilt: .5, a: -3.4, b: -.35, dur: .48, lunge: 5.5, hitAt: .5, fin: true }
  ];
  const cam0 = cam.fov;

  function moveBy(dx, dz) {
    const nx = S.x + dx, nz = S.z + dz;
    if (window.DGON) { if (Math.hypot(nx, nz) < 24.5) { S.x = nx; S.z = nz; } }
    else if (Math.hypot(nx, nz) < R && H(nx, nz) > -1.9) { S.x = nx; S.z = nz; }
    player.position.x = S.x; player.position.z = S.z; dirty = true;
  }
  function startAtk() {
    since < .95 ? step = (step + 1) % 3 : step = 0;
    atk.P = STEPS[step]; atk.on = true; atk.t = 0; atk.dur = atk.P.dur; atk.hit = false; atk.fin = false;
    acd = .45; since = 0; hold = 1.8;
  }
  function endAll() { atk.on = false; sk.on = false; plunge = 0; dashT = 0; }
  function startPlunge() { plunge = 1; vy = -24; acd = .5; hold = 1.8; atk.on = false; say('☄️ ¡Golpe aéreo!'); }
  function doJump() {
    if (S.hp <= 0 || sk.on && sk.id == 'ult') return;
    const x = S.x, z = S.z, gyw = player.position.y;
    if (!air) { vy = 9.5; air = true; jumps = 1; sq = 1; burst(x, gyw + .15, z, 0xffffff, 5, 2.5); }
    else if (has('dj') && jumps < 2 && !plunge) { vy = 8.3; jumps = 2; sq = .8; ring(x, gyw + gy, z, 0x9fe8ff, 2.2, .35); burst(x, gyw + gy, z, 0x9fe8ff, 6, 3); }
  }
  function doDash() {
    if (!has('dash') || cdL.dash > 0 || S.hp <= 0 || (sk.on && sk.id == 'ult')) return;
    let dx, dz;
    if (Math.hypot(jx, jy) > .1) { const f = -jy, rg = jx, mx = Math.sin(camYaw) * f - Math.cos(camYaw) * rg, mz = Math.cos(camYaw) * f + Math.sin(camYaw) * rg, l = Math.hypot(mx, mz) || 1; dx = mx / l; dz = mz / l; }
    else { dx = Math.sin(fy0); dz = Math.cos(fy0); }
    endAll(); dashT = .2; dashX = dx; dashZ = dz; inv = .34; cdL.dash = CD.dash; hold = .8;
    player.rotation.y = Math.atan2(dx, dz); fy0 = player.rotation.y;
    sq = .6; burst(S.x, player.position.y + .3, S.z, 0xbdefff, 7, 3);
  }
  function doSpin() {
    if (!has('spin') || cdL.spin > 0 || S.hp <= 0 || sk.on) return;
    endAll(); sk.on = true; sk.id = 'spin'; sk.t = 0; sk.dur = .75; sk.n = 0; cdL.spin = CD.spin; hold = 1.8; say('🌀 ¡Torbellino!');
  }
  function doWave() {
    if (!has('wave') || cdL.wave > 0 || S.hp <= 0 || sk.on) return;
    endAll(); sk.on = true; sk.id = 'wave'; sk.t = 0; sk.dur = .55; sk.fired = false; cdL.wave = CD.wave; hold = 1.8; say('🌙 ¡Onda de espada!');
  }
  function doUlt() {
    if (!has('ult') || cdL.ult > 0 || S.hp <= 0 || sk.on) return;
    endAll(); sk.on = true; sk.id = 'ult'; sk.t = 0; sk.dur = 1.5; sk.n = 0; sk.fired = false; cdL.ult = CD.ult; hold = 2.5; inv = 1.6;
    vy = 10; air = true; jumps = 2; say('🌟 ¡CORTE CELESTE!');
  }

  function slam(mult, r) {
    const gp = player.position.y;
    aoe(S.x, S.z, r, dmgB() * mult, 1.6);
    ring(S.x, gp + .15, S.z, 0xfff0a0, r + 1, .45); ring(S.x, gp + .15, S.z, 0xffffff, r * .6, .3);
    burst(S.x, gp + .3, S.z, 0xffe9a0, 10, 5); shk = Math.max(shk, .5);
  }
  function hitProbe(dist, r) {
    const fx = Math.sin(fy0), fz = Math.cos(fy0), cx = S.x + fx * dist, cz = S.z + fz * dist;
    return { n: aoe(cx, cz, r, 0, 0), cx, cz };
  }

  /* ---------- bucle ---------- */
  const _uv = window.updVisuals;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    if (arms.length < 2 || legs.length < 2 || arms[0].parent !== player) { findParts(); buildExtras(); }
    if (arms.length < 2 || legs.length < 2 || !held) return;
    if (lastRy !== null && tw !== 0 && player.rotation.y === lastRy) player.rotation.y -= tw;
    tw = 0;
    tm += dt; fy0 = player.rotation.y;
    checkUnlock(); banner(dt);
    const gnd = player.position.y;
    Object.keys(cdL).forEach(k => { cdL[k] = Math.max(0, cdL[k] - dt); const b = BT[k]; if (b) { b.lb.textContent = cdL[k] > 0 ? Math.ceil(cdL[k]) + 's' : b.n; b.e.style.opacity = cdL[k] > 0 ? .5 : 1; } });
    acd = Math.max(0, acd - dt); since += dt; hold = Math.max(0, hold - dt); inv = Math.max(0, inv - dt);
    /* invulnerabilidad (dash y ultimate): se devuelve la vida perdida */
    if (hpPrev !== null && inv > 0 && S.hp < hpPrev && S.hp > 0) { S.hp = hpPrev; puff(S.x, gnd + 1.4, S.z, 0xbdefff, 1.6, 0, 0, 0, .3, 6, 0); }
    /* entradas */
    if (qJump) { qJump = false; doJump(); }
    if (qDash) { qDash = false; doDash(); }
    if (qSpin) { qSpin = false; doSpin(); }
    if (qWave) { qWave = false; doWave(); }
    if (qUlt) { qUlt = false; doUlt(); }
    if (qAtk) {
      qAtk = false;
      if (S.hp > 0 && acd <= 0 && !(sk.on && sk.id == 'ult')) {
        if (air && has('plunge') && !plunge && !sk.on) startPlunge(); else if (!sk.on && !plunge) startAtk();
      }
    }
    const fx = Math.sin(fy0), fz = Math.cos(fy0);

    /* física del salto */
    if (air) {
      vy -= (plunge ? 0 : 27) * dt; gy += vy * dt;
      if (gy <= 0) {
        gy = 0; air = false; jumps = 0;
        if (plunge) { slam(1.4, 4.6); plunge = 0; sq = -1; vy = 0; }
        else if (vy < -4) { sq = -.8; burst(S.x, gnd + .15, S.z, 0xffffff, 5, 2.5); }
        vy = 0;
      }
    }
    /* dash */
    if (dashT > 0) {
      dashT -= dt; moveBy(dashX * 24 * dt, dashZ * 24 * dt);
      dashFx -= dt; if (dashFx <= 0) { dashFx = .03; puff(S.x, gnd + gy + 1.1, S.z, 0x9fe8ff, 1.7, 0, 0, 0, .28, -4, 0); }
    }
    /* ataque básico */
    let armPose = null, legStance = false;
    if (atk.on) {
      atk.t += dt; const P = atk.P, p = clamp(atk.t / atk.dur, 0, 1);
      const f = p < .2 ? -.12 * Math.sin(p / .2 * PI) : 1 - Math.pow(1 - (p - .2) / .8, 3);
      const v = lerp(P.a, P.b, f), dir = P.b > P.a ? 1 : -1;
      if (p < .6) moveBy(fx * P.lunge * dt, fz * P.lunge * dt);
      armPose = { type: P.type, tilt: P.tilt, v };
      legStance = true;
      const al = v - PI / 2;
      trPiv.quaternion.copy(P.type == 'h' ? mul(qa(AZ, P.tilt), qa(AX, -PI / 2)) : mul(qa(AZ, P.tilt), qa(AY, PI / 2)));
      trMesh.rotation.z = dir > 0 ? al - 1.05 : al;
      trM.color.setHex(P.fin ? 0xffe9a0 : 0xcfeaff);
      trM.opacity = p > .2 && p < .98 ? .85 * (p > .8 ? (1 - p) / .2 : 1) : 0;
      if (!atk.hit && p >= P.hitAt) {
        atk.hit = true;
        const pr = hitProbe(1.5, P.fin ? 3.2 : 2.4);
        if (P.fin) { aoe(pr.cx, pr.cz, 3.6, dmgB() * .9, 1.4); ring(pr.cx, gnd + .15, pr.cz, 0xffe9a0, 3.4, .35); shk = Math.max(shk, .35); }
        if (pr.n > 0 || P.fin) { burst(pr.cx, gnd + 1.2, pr.cz, P.fin ? 0xffe9a0 : 0xffffff, P.fin ? 10 : 6, 4); shk = Math.max(shk, .12); }
        slashFx(S.x + fx * 1.6, gnd + gy + 1.3, S.z + fz * 1.6, fy0, P.tilt * 2, P.fin ? 0xffe9a0 : 0xd8f0ff, .22, P.fin ? 1.2 : .8);
      }
      if (atk.t >= atk.dur) { atk.on = false; trM.opacity = 0; }
    } else trM.opacity = 0;

    /* habilidades con animación propia */
    spM.opacity = 0; aura.material.opacity = 0;
    if (sk.on) {
      sk.t += dt; const p = clamp(sk.t / sk.dur, 0, 1);
      if (sk.id == 'spin') {
        tw = (1 - Math.pow(1 - p, 2)) * TAU * 2.2;
        armPose = { type: 'h', tilt: .1, v: 0 };
        spM.opacity = .6 * (1 - p * .5); spR.rotation.z = now / 60;
        if (sk.n < 3 && sk.t >= .12 + sk.n * .18) {
          sk.n++; const c = aoe(S.x, S.z, 4.4, dmgB() * .9, 1.2);
          ring(S.x, gnd + .2, S.z, 0x9af0ff, 4.4, .35); burst(S.x, gnd + 1.2, S.z, 0xbdf5ff, c > 0 ? 8 : 4, 5);
          if (c > 0) shk = Math.max(shk, .2);
        }
      } else if (sk.id == 'wave') {
        const f = p < .3 ? -.15 * Math.sin(p / .3 * PI) : 1 - Math.pow(1 - (p - .3) / .7, 3);
        armPose = { type: 'c', tilt: .35, v: lerp(-3.4, -.35, f) };
        if (!sk.fired && p >= .5) {
          sk.fired = true; shk = Math.max(shk, .15);
          const m = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.65, 20, 1, -.8, 1.6), new THREE.MeshBasicMaterial({ color: 0xaaf0ff, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
          m.rotation.order = 'YXZ'; m.rotation.set(0, fy0, 0); m.rotation.z = .35;
          m.position.set(S.x + fx * 1.6, gnd + gy + 1.3, S.z + fz * 1.6); scene.add(m);
          PR.push({ m, x: S.x + fx * 1.6, z: S.z + fz * 1.6, dx: fx, dz: fz, life: .85, tk: 0, y: gnd + gy + 1.3 });
        }
      } else if (sk.id == 'ult') {
        aura.material.opacity = .85; aura.scale.setScalar(4 + Math.sin(now / 60) * .6);
        armPose = { type: 'c', tilt: 0, v: p < .8 ? -PI + .25 : lerp(-PI + .25, -.2, clamp((p - .66) / .34, 0, 1)) };
        const ts = [.3, .5, .7];
        if (sk.n < 3 && sk.t >= ts[sk.n]) {
          const t2 = sk.n % 2 ? .9 : -.9; sk.n++;
          const cx = S.x + fx * 2.2, cz = S.z + fz * 2.2;
          aoe(cx, cz, 6, dmgB() * 1.4, 1.6);
          slashFx(cx, gnd + gy + 1.4, cz, fy0, t2, sk.n == 2 ? 0xff9ad0 : 0xffe9a0, .35, 1.7);
          burst(cx, gnd + gy + 1.3, cz, 0xffffff, 10, 5); shk = Math.max(shk, .4);
          fl.style.opacity = .35; setTimeout(() => { fl.style.opacity = 0; }, 60);
        }
        if (sk.n == 3 && sk.t >= 1.0 && !sk.fired) {
          sk.fired = true; slam(2.5, 7.5); fl.style.opacity = .7; setTimeout(() => { fl.style.opacity = 0; }, 90);
          shk = 1; sq = -1;
        }
      }
      if (sk.t >= sk.dur) { sk.on = false; sk.id = ''; }
    }
    /* proyectiles de onda de espada */
    for (let i = PR.length - 1; i >= 0; i--) {
      const o = PR[i]; o.life -= dt;
      o.x += o.dx * 17 * dt; o.z += o.dz * 17 * dt; o.m.position.set(o.x, o.y, o.z); o.m.scale.multiplyScalar(1 + dt * .6);
      o.m.material.opacity = Math.min(.9, o.life * 2);
      puff(o.x, o.y, o.z, 0x9fe8ff, 1, 0, 0, 0, .3, -2, 0);
      o.tk -= dt; if (o.tk <= 0) { o.tk = .2; if (aoe(o.x, o.z, 2.4, dmgB() * 1.1, .6) > 0) burst(o.x, o.y, o.z, 0xffffff, 5, 4); }
      if (o.life <= 0) { scene.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); PR.splice(i, 1); }
    }

    /* ---------- aplicar pose al personaje ---------- */
    const sw = Math.sin(now / 600);
    arms[1].rotation.y = 0; arms[1].rotation.z = .06 + .03 * sw; arms[0].rotation.y = 0; arms[0].rotation.z = -(.06 + .03 * Math.sin(now / 600 + 1));
    const inHand = hold > 0 || atk.on || sk.on || plunge || dashT > 0;
    held.visible = inHand; if (back) back.visible = !inHand;
    let lt = Math.hypot(jx, jy) > .1 ? .1 : 0;
    if (armPose) {
      const P = armPose;
      arms[0].quaternion.copy(P.type == 'h' ? mul(qa(AZ, P.tilt), qa(AX, -PI / 2), qa(AZ, P.v)) : mul(qa(AZ, P.tilt), qa(AX, P.v)));
      arms[1].rotation.set(-.55, 0, .35);
      if (sk.on && sk.id == 'spin') arms[1].rotation.set(0, 0, 1.45);
    } else if (plunge) {
      arms[0].rotation.set(.15, 0, -.1); arms[1].rotation.set(-2.6, 0, .3);
    } else if (dashT > 0) {
      arms[0].rotation.set(1.1, 0, -.2); arms[1].rotation.set(1.1, 0, .2);
    } else if (air) {
      const up = vy > 0;
      arms[0].rotation.set(up ? -2.4 : -1.2, 0, up ? -.3 : -.9); arms[1].rotation.set(up ? -2.4 : -1.2, 0, up ? .3 : .9);
    }
    if (legStance) { legs[0].rotation.x = -.5; legs[1].rotation.x = .5; }
    else if (plunge) { legs[0].rotation.x = .1; legs[1].rotation.x = .1; }
    else if (dashT > 0) { legs[0].rotation.x = -.9; legs[1].rotation.x = .9; }
    else if (air) { legs[0].rotation.x = vy > 0 ? -.8 : -.3; legs[1].rotation.x = vy > 0 ? .4 : .6; }
    if (dashT > 0) lt = .55; else if (plunge) lt = .6; else if (atk.on && atk.P.type == 'c') lt = .3; else if (atk.on) lt = .15;
    ln += (lt - ln) * Math.min(1, dt * 14); player.rotation.x = ln;
    if (capeG && (dashT > 0 || air)) capeG.rotation.x += dashT > 0 ? .7 : .35;
    /* estiramiento y aplastamiento */
    sq += (0 - sq) * Math.min(1, dt * 9);
    player.scale.set(1 - sq * .12, 1 + sq * .2, 1 - sq * .12);
    /* giro del torbellino */
    if (tw !== 0) { player.rotation.y += tw; lastRy = player.rotation.y; } else lastRy = null;
    /* salto: altura */
    player.position.y = gnd + gy;
    /* cámara: sacudida y FOV */
    fovAdd += ((dashT > 0 ? 9 : (sk.on && sk.id == 'ult') ? 8 : 0) - fovAdd) * Math.min(1, dt * 12);
    const tf = cam0 + fovAdd; if (Math.abs(cam.fov - tf) > .05) { cam.fov = tf; cam.updateProjectionMatrix(); }
    if (shk > .01) { cam.position.x += (rnd() - .5) * shk; cam.position.y += (rnd() - .5) * shk; cam.position.z += (rnd() - .5) * shk; shk *= Math.pow(.02, dt); } else shk = 0;
    fxUpdate(dt);
    hpPrev = S.hp;
  };
})();
