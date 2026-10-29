/* Isekai Online - Mazmorra bajo la Torre Celeste (v0.8.0) */
(function () {
  const DY = -300, AR = 25.5, PI = Math.PI, TAU = PI * 2;
  window.DG = { floor: 0 }; window.DGON = false;
  const grp = new THREE.Group(); grp.position.y = DY; grp.visible = false; scene.add(grp);
  const mons = [], cols = [], hidden = [];
  let up = null, dn = null, boss = null, locked = false, busy = false, stCd = 0, atkCd = 0, clearedMsg = false, rr = null, hurtT = 0, ph = 0;

  function rnd(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- interfaz ---------- */
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:25;background:#000;opacity:0;transition:opacity .35s;pointer-events:none';
  document.body.appendChild(ov);
  const hurtEl = document.createElement('div');
  hurtEl.style.cssText = 'position:fixed;inset:0;z-index:6;background:rgba(255,0,0,.35);opacity:0;transition:opacity .25s;pointer-events:none';
  document.body.appendChild(hurtEl);
  const lab = document.createElement('div');
  lab.style.cssText = 'display:none;position:fixed;z-index:5;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);text-align:center;font-size:13px;text-shadow:0 1px 3px #000;pointer-events:none;min-width:150px';
  lab.innerHTML = '<div id="dgt"></div><div id="dgb" style="display:none;height:9px;margin-top:3px;background:rgba(0,0,0,.55);border-radius:5px;overflow:hidden"><i style="display:block;height:100%;width:100%;background:#ff4a5a"></i></div>';
  document.body.appendChild(lab);
  const dgt = lab.querySelector('#dgt'), dgb = lab.querySelector('#dgb'), dgbi = dgb.querySelector('i');
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,200,120,1)'); g.addColorStop(.4, 'rgba(255,150,60,.45)'); g.addColorStop(1, 'rgba(255,150,60,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const EY = new THREE.MeshBasicMaterial({ color: 0xffe45e });

  /* ---------- piso ---------- */
  function mkPortal(x, z, color) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.9, 28).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, side: THREE.DoubleSide }));
    ring.position.y = .06;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7, 20, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    beam.position.y = 3.5;
    const st = toon(0x9aa0bd);
    [-2.2, 2.2].forEach(s => { const p = new THREE.Mesh(new THREE.BoxGeometry(.7, 4.4, .7), st); p.position.set(s, 2.2, 0); g.add(p); });
    const l = new THREE.Mesh(new THREE.BoxGeometry(5.1, .8, .8), st); l.position.y = 4.6; g.add(l);
    g.add(ring, beam); grp.add(g);
    return { x, z, ring, beam, mat: ring.material, bmat: beam.material };
  }
  function recolor(p, c) { p.mat.color.setHex(c); p.bmat.color.setHex(c); }

  function buildFloor(f) {
    while (grp.children.length) grp.remove(grp.children[0]);
    mons.length = 0; cols.length = 0; boss = null; clearedMsg = false;
    rr = rnd(f * 7919 + (S.seed % 1000));
    const R = rr, t = Math.floor((f - 1) / 3), hue = (.62 + t * .11) % 1;
    const cS = new THREE.Color().setHSL(hue, .22, .46), cW = new THREE.Color().setHSL(hue, .25, .3);
    grp.add(new THREE.Mesh(new THREE.CircleGeometry(27, 48).rotateX(-PI / 2), toon(cS.getHex())));
    const rune = new THREE.Mesh(new THREE.RingGeometry(9, 9.4, 48).rotateX(-PI / 2), new THREE.MeshBasicMaterial({ color: 0x6fa8ff, transparent: true, opacity: .5 }));
    rune.position.y = .03; grp.add(rune);
    const wm = toon(cW.getHex()); wm.side = THREE.BackSide;
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(27.5, 27.5, 10, 40, 1, true), wm); wall.position.y = 5; grp.add(wall);
    const rib = toon(new THREE.Color().setHSL(hue, .22, .5).getHex());
    for (let k = 0; k < 20; k++) {
      const a = k / 20 * TAU, b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 10, 1.6), rib);
      b.position.set(Math.cos(a) * 27, 5, Math.sin(a) * 27); b.rotation.y = -a; grp.add(b);
      if (k % 2 == 0) {
        const o = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb24a }));
        o.position.set(Math.cos(a) * 26, 4, Math.sin(a) * 26); grp.add(o);
        const s = new THREE.Sprite(glowMat); s.scale.set(4, 4, 1); s.position.copy(o.position); grp.add(s);
      }
    }
    up = mkPortal(0, -22, 0xffd25e);
    const da = PI / 2 + (R() - .5) * 1.2;
    dn = mkPortal(Math.cos(da) * 22, Math.sin(da) * 22, 0x9b7bff);
    const pm = toon(new THREE.Color().setHSL(hue, .2, .55).getHex());
    for (let n = 5 + Math.floor(R() * 4), i = 0; i < n; i++) {
      const a = R() * TAU, d = 7 + R() * 13, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - up.x, z - up.z) < 7 || Math.hypot(x - dn.x, z - dn.z) < 7) continue;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 8, 10), pm); p.position.set(x, 4, z); grp.add(p);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, .6, 10), pm); cap.position.set(x, 8, z); grp.add(cap);
      cols.push([x, z, 1.5]);
    }
    /* monstruos */
    const isBoss = f % 3 == 0, n = Math.min(12, 3 + f);
    for (let i = 0; i < n; i++) {
      const a = R() * TAU, d = 6 + R() * 17, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - up.x, z - up.z) < 9 || Math.hypot(x - dn.x, z - dn.z) < 5) { i--; if (R() < .02) break; continue; }
      spawn(R() < Math.min(.8, (f - 1) * .25) ? 'goblin' : 'kobold', f, x, z);
    }
    if (isBoss) {
      const B = f == 15 ? { n: 'El Durmiente', c: 0x4a2a7a, k: 0 } : [{ n: 'Rey Goblin', c: 0x4f9a35, k: 1 }, { n: 'Capitán Kobold', c: 0xb0502e, k: 0 }, { n: 'Gólem de Piedra', c: 0x7a82a8, k: 0 }][(f / 3 - 1) % 3];
      const kk = 1 + .16 * (f - 1), e = mk(B.k ? 'goblin' : 'kobold', B.c, f == 15 ? 3.3 : 2.3, B.k);
      boss = { g: e.g, mats: e.mats, base: e.base, arms: e.arms, x: 0, z: 8, hp: Math.round(200 * kk), max: Math.round(200 * kk), dmg: Math.round(12 + f * 1.6), sp: 2.7, xp: 10, reach: 3, acd: 1.3, cd: 1, name: B.n, boss: true, fl: 0, lunge: 0, ph: 0, wa: 0 };
      grp.add(e.g); mons.push(boss);
    }
    locked = isBoss; recolor(dn, locked ? 0xff4a4a : 0x9b7bff);
    dgb.style.display = isBoss ? 'block' : 'none'; dgbi.style.width = '100%';
  }

  function mk(type, col, sc, crown) {
    const g = new THREE.Group(), gob = type == 'goblin';
    const body = toon(col), skin = toon(gob ? 0x9bd65f : 0xd9905f), mats = [body, skin], base = [col, gob ? 0x9bd65f : 0xd9905f];
    const add = (geo, m, x, y, z, p) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); (p || g).add(o); return o; };
    add(new THREE.CylinderGeometry(.32, .4, .8, 8), body, 0, .75, 0);
    add(new THREE.SphereGeometry(.32, 10, 8), skin, 0, 1.35, 0);
    const eg = new THREE.SphereGeometry(.06, 6, 6);
    [-1, 1].forEach(s => {
      add(eg, EY, s * .12, 1.4, .27);
      const ear = add(new THREE.ConeGeometry(.1, gob ? .5 : .3, 5), skin, s * .36, 1.45, 0); ear.rotation.z = -s * (gob ? 1.3 : .4);
      add(new THREE.CylinderGeometry(.12, .11, .4, 6), body, s * .18, .2, 0);
    });
    if (gob) add(new THREE.ConeGeometry(.07, .2, 5), skin, 0, 1.32, .33).rotation.x = PI / 2;
    else add(new THREE.BoxGeometry(.2, .16, .28), skin, 0, 1.27, .32);
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * .45, 1.05, 0); g.add(a); add(new THREE.CylinderGeometry(.08, .07, .6, 6), skin, 0, -.28, 0, a); return a; });
    add(new THREE.CylinderGeometry(.09, .06, .9, 6), toon(0x6a4326), 0, -.5, .2, arms[1]).rotation.x = -.5;
    if (crown) { const cm = toon(0xffd25e); cm.side = THREE.DoubleSide; add(new THREE.CylinderGeometry(.3, .25, .22, 8, 1, true), cm, 0, 1.7, 0); }
    g.scale.setScalar(sc);
    if (window.outlineGroup) outlineGroup(g, 1.08);
    return { g, mats, base, arms };
  }
  function spawn(type, f, x, z) {
    const k = 1 + .16 * (f - 1), gob = type == 'goblin', e = mk(type, gob ? 0x6a8f3a : 0xb0502e, gob ? 1.15 : 1, false);
    const o = { g: e.g, mats: e.mats, base: e.base, arms: e.arms, x, z, type, hp: Math.round((gob ? 34 : 22) * k), dmg: Math.round((gob ? 7 : 5) + f * (gob ? 1.2 : .9)), sp: gob ? 3.3 : 3, xp: gob ? 3 : 2, reach: 1.5, acd: 1.1, cd: .6, name: gob ? 'goblin' : 'kobold', fl: 0, lunge: 0, ph: Math.random() * 6, wa: Math.random() * 6 };
    o.max = o.hp; grp.add(e.g); mons.push(o);
  }

  /* ---------- combate ---------- */
  function hurt(n, nm) {
    S.hp -= n; dirty = true; hurtEl.style.opacity = 1; setTimeout(() => { hurtEl.style.opacity = 0; }, 120);
    say('💢 ' + nm + ' te golpea (-' + n + ')');
  }
  function kill(e) {
    grp.remove(e.g); const i = mons.indexOf(e); if (i >= 0) mons.splice(i, 1);
    S.kills = (S.kills || 0) + 1;
    for (let k = 0; k < e.xp; k++) gain();
    let m = '☠️ ' + e.name + ' derrotado.';
    if (Math.random() < .35 || e.boss) { const n = e.boss ? 3 : 1; S.food += n; m += ' +' + n + ' 🫐'; }
    if (e.boss) { S.bosses = (S.bosses || 0) + 1; locked = false; recolor(dn, 0x9b7bff); dgb.style.display = 'none'; m = '👑 ¡' + e.name + ' derrotado! El portal violeta se abre. +' + e.xp + ' XP'; }
    hud(); say(m); dirty = true;
  }
  function attack() {
    if (!window.DGON || !started || S.hp <= 0 || atkCd > 0) return;
    atkCd = .45;
    let best = null, bd = 3.6;
    mons.forEach(e => { const d = Math.hypot(e.x - S.x, e.z - S.z) - (e.boss ? 1.2 : 0); if (d < bd) { bd = d; best = e; } });
    if (!best) return;
    player.rotation.y = Math.atan2(best.x - S.x, best.z - S.z);
    const dmg = 8 + S.lv * 2 + (S.axe ? 5 : 0) + Math.floor(((S.st && S.st.fue) || 0) / 12) + Math.floor(Math.random() * 4);
    best.hp -= dmg; best.fl = .12; best.mats.forEach(m => m.color.setHex(0xffffff));
    const d = Math.hypot(best.x - S.x, best.z - S.z) || 1, kb = best.boss ? .3 : .9;
    best.x += (best.x - S.x) / d * kb; best.z += (best.z - S.z) / d * kb;
    if (best.hp <= 0) kill(best); else say('⚔️ -' + dmg + ' al ' + best.name);
  }
  const atkBtn = document.getElementById('atk');
  if (atkBtn) atkBtn.addEventListener('click', attack);

  /* ---------- entrar y salir ---------- */
  function hideSky() {
    scene.traverse(o => { if ((o.isSprite || o.isPoints) && o.visible && !grpHas(o)) { o.visible = false; hidden.push(o); } });
  }
  function grpHas(o) { while (o) { if (o === grp) return true; o = o.parent; } return false; }
  function showSky() { hidden.forEach(o => { o.visible = true; }); hidden.length = 0; }
  function label() { dgt.textContent = '🕳️ Piso ' + window.DG.floor + (boss ? ' · ' + boss.name : '') + '  (máx. ' + (S.dmax || 0) + ')'; }
  function place(f, from) {
    window.DG.floor = f; if (f > (S.dmax || 0)) { S.dmax = f; dirty = true; }
    buildFloor(f);
    const p = from == 'down' ? dn : up, d = Math.hypot(p.x, p.z) || 1;
    S.x = p.x - p.x / d * 3.8; S.z = p.z - p.z / d * 3.8; stCd = 1.5;
    label();
    say('🕳️ Piso ' + f + (f % 3 == 0 ? ': ¡hay un jefe!' : '') + ' — encuentra el portal violeta para bajar.');
  }
  function enter() {
    if (busy) return; busy = true; ov.style.opacity = 1;
    setTimeout(() => {
      window.DGON = true; hideSky(); grp.visible = true; lab.style.display = 'block';
      place(1, 'up'); ov.style.opacity = 0; busy = false;
    }, 380);
  }
  function leave(msg) {
    if (busy) return; busy = true; ov.style.opacity = 1;
    setTimeout(() => {
      window.DGON = false; grp.visible = false; lab.style.display = 'none'; showSky();
      scene.fog.near = 40; scene.fog.far = 140; if (typeof updSky == 'function') updSky();
      S.x = 0; S.z = -13; dirty = true; ov.style.opacity = 0; busy = false;
      say(msg || '🏰 Vuelves a la superficie.');
    }, 380);
  }
  function go(f, from) {
    if (busy) return; busy = true; ov.style.opacity = 1;
    setTimeout(() => { place(f, from); ov.style.opacity = 0; busy = false; }, 380);
  }
  const _die = window.die;
  window.die = function () {
    const was = window.DGON; if (_die) _die();
    if (was) leave('[Sistema] Caíste en la mazmorra… despiertas en Lumeria.');
  };

  /* ---------- cada frame ---------- */
  const _uv = window.updVisuals;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    if (!window.DGON) {
      if (!busy && Math.hypot(S.x, S.z + 9.2) < 1.9 && S.hp > 0) enter();
      return;
    }
    atkCd = Math.max(0, atkCd - dt); stCd = Math.max(0, stCd - dt); ph += dt;
    hemi.intensity = .85; sun.intensity = .5;
    scene.fog.color.setHex(0x070a16); scene.fog.near = 12; scene.fog.far = 60;
    document.body.style.background = '#05070f';
    /* límites y pilares */
    let x = S.x, z = S.z; const d0 = Math.hypot(x, z);
    if (d0 > AR) { x *= AR / d0; z *= AR / d0; }
    cols.forEach(c => { const dx = x - c[0], dz = z - c[1], dd = Math.hypot(dx, dz), r = c[2] + .4; if (dd < r) { x = c[0] + dx / (dd || 1) * r; z = c[1] + dz / (dd || 1) * r; } });
    cam.position.x += x - S.x; cam.position.z += z - S.z;
    S.x = x; S.z = z;
    player.position.set(S.x, player.position.y + DY, S.z);
    cam.position.y += DY; cam.lookAt(S.x, player.position.y + 1.3, S.z);
    /* portales */
    [up, dn].forEach((p, i) => {
      const s = 1 + Math.sin(ph * 3 + i) * .06; p.ring.scale.set(s, s, s); p.beam.rotation.y += dt * .6;
    });
    if (!busy && stCd <= 0 && S.hp > 0) {
      if (Math.hypot(S.x - dn.x, S.z - dn.z) < 2) {
        if (locked) { stCd = 2; say('🔒 El portal está sellado: derrota al jefe.'); }
        else go(window.DG.floor + 1, 'up');
      } else if (Math.hypot(S.x - up.x, S.z - up.z) < 2) {
        if (window.DG.floor <= 1) leave(); else go(window.DG.floor - 1, 'down');
      }
    }
    /* monstruos */
    for (let i = 0; i < mons.length; i++) {
      const e = mons[i], dx = S.x - e.x, dz = S.z - e.z, d = Math.hypot(dx, dz) || .01, aggro = e.boss ? 24 : 13;
      if (d < aggro && S.hp > 0) {
        if (d > e.reach * .8) { e.x += dx / d * e.sp * dt; e.z += dz / d * e.sp * dt; }
        e.cd -= dt;
        if (d <= e.reach + .6 && e.cd <= 0) { e.cd = e.acd; e.lunge = .25; hurt(e.dmg, e.name); }
        e.g.rotation.y = Math.atan2(dx, dz);
      } else { e.wa += (Math.random() - .5) * dt * 3; e.x += Math.cos(e.wa) * .7 * dt; e.z += Math.sin(e.wa) * .7 * dt; }
      for (let j = i + 1; j < mons.length; j++) {
        const o = mons[j], ax = e.x - o.x, az = e.z - o.z, ad = Math.hypot(ax, az), mn = e.boss || o.boss ? 2.4 : 1;
        if (ad < mn && ad > .001) { const p = (mn - ad) / 2; e.x += ax / ad * p; e.z += az / ad * p; o.x -= ax / ad * p; o.z -= az / ad * p; }
      }
      cols.forEach(c => { const ex = e.x - c[0], ez = e.z - c[1], ed = Math.hypot(ex, ez), r = c[2] + .6; if (ed < r) { e.x = c[0] + ex / (ed || 1) * r; e.z = c[1] + ez / (ed || 1) * r; } });
      const ed = Math.hypot(e.x, e.z); if (ed > AR) { e.x *= AR / ed; e.z *= AR / ed; }
      e.lunge = Math.max(0, e.lunge - dt);
      const b = Math.abs(Math.sin(now / 160 + e.ph)) * .08;
      e.g.position.set(e.x, b, e.z);
      const sw = Math.sin(now / 120 + e.ph) * (d < aggro ? .8 : .2) + (e.lunge > 0 ? -1.6 : 0);
      e.arms[0].rotation.x = sw; e.arms[1].rotation.x = -sw - (e.lunge > 0 ? 1 : 0);
      if (e.fl > 0) { e.fl -= dt; if (e.fl <= 0) e.mats.forEach((m, k) => m.color.setHex(e.base[k])); }
    }
    if (boss) { dgbi.style.width = Math.max(0, boss.hp / boss.max * 100) + '%'; if (mons.indexOf(boss) < 0) boss = null; label(); }
    if (!boss && !mons.length && !clearedMsg) { clearedMsg = true; say('✅ Piso despejado. Baja por el portal violeta.'); }
  };
  window.AOE_DG = function (x, z, r, dmg, kb) { let n = 0; mons.slice().forEach(e => { const d = Math.hypot(e.x - x, e.z - z) - (e.boss ? 1.2 : 0); if (d < r) { n++; if (dmg > 0) { e.hp -= dmg; e.fl = .12; e.mats.forEach(m => m.color.setHex(0xffffff)); const k = Math.hypot(e.x - x, e.z - z) || 1, f = e.boss ? .15 : 1; e.x += (e.x - x) / k * kb * f; e.z += (e.z - z) / k * kb * f; if (e.hp <= 0) kill(e); } } }); return n; };
})();
