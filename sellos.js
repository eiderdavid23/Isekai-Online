/* Isekai Online - Arco 2: Los Sellos Rotos (v0.13.0): 3 sitios de Sello con guardianes + capitulos */
(function () {
  const PI = Math.PI, TAU = PI * 2, rnd = Math.random, $ = id => document.getElementById(id);
  const SITE = [
    { n: 'Sello del Alba', c: 0x6fa8ff, cs: '111,168,255', ta: .6, gn: 2, v: ['Tocas la piedra y ves la Torre Celeste completa, bañada en luz, a la que nada rodea.', 'Una voz amable susurra: «Reencarnado… la primera luz regresa».'] },
    { n: 'Sello del Bosque', c: 0x6fe08a, cs: '111,224,138', ta: 2.5, gn: 2, v: ['La piedra late como un corazón y el bosque entero parece respirar contigo.', 'La voz repite tu nombre: «Quedan pocos sellos… sigue».'] },
    { n: 'Sello del Ocaso', c: 0xb07bff, cs: '176,123,255', ta: 5.5, gn: 3, v: ['Ves la Torre agrietada desde abajo y una sombra enorme, encadenada, que se mueve en lo profundo.', 'La voz se apaga: «Despierta… y no estará solo». ¿Qué hay en la mazmorra?'] }
  ];
  /* ---------- sitio: el terreno más plano en cada dirección ---------- */
  SITE.forEach(s => {
    let best = null;
    for (let da = -.25; da <= .26; da += .05) for (let d = 64; d <= 80; d += 4) {
      const a = s.ta + da, x = Math.cos(a) * d, z = Math.sin(a) * d; let mn = 1e9, mx = -1e9;
      for (let i = 0; i < 11; i++) { const r = i ? (i % 2 ? 11 : 6) : 0, b = i / 11 * TAU, h = H(x + Math.cos(b) * r, z + Math.sin(b) * r); if (h < mn) mn = h; if (h > mx) mx = h; }
      const sc = (mx - mn) + (mn < -.5 ? 100 : 0);
      if (!best || sc < best.sc) best = { sc, x, z };
    }
    s.x = best.x; s.z = best.z; s.gs = []; s.on = false;
  });

  /* ---------- construcción ---------- */
  const G = new THREE.Group(); scene.add(G); const COL = [];
  function glowTex(rgb) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(' + rgb + ',1)'); g.addColorStop(.35, 'rgba(' + rgb + ',.45)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  }
  const at = (par, m, x, z, dy) => { m.position.set(x, H(x, z) + dy, z); par.add(m); return m; };
  SITE.forEach((s, i) => {
    const st = new THREE.Group();
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6, x = s.x + Math.cos(a) * 6, z = s.z + Math.sin(a) * 6, broken = k % 3 == 1, h = broken ? 1.6 : 3.6;
      const p = at(st, new THREE.Mesh(new THREE.CylinderGeometry(.5, .6, h, 8), toon(0xf1eee4)), x, z, h / 2);
      if (broken) p.rotation.z = .25;
      else at(st, new THREE.Mesh(new THREE.BoxGeometry(1.3, .35, 1.3), toon(s.c)), x, z, h + .15);
      COL.push([x, z, .7]);
    }
    at(st, new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, .6, 12), toon(0xe3dfd2)), s.x, s.z, .3);
    at(st, new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, .5, 12), toon(0xf6f3ea)), s.x, s.z, .85);
    COL.push([s.x, s.z, 1.9]);
    for (let k = 0; k < 9; k++) {
      const a = rnd() * TAU, d = 8 + rnd() * 6, x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d, sc = .7 + rnd() * 1.1;
      const c = at(st, new THREE.Mesh(new THREE.ConeGeometry(.3, 1.5, 5), toon(s.c)), x, z, .7 * sc); c.scale.setScalar(sc); c.rotation.z = (rnd() - .5) * .4;
    }
    if (window.outlineGroup) window.outlineGroup(st, 1.05);
    G.add(st);
    const y0 = H(s.x, s.z);
    s.mat = new THREE.MeshBasicMaterial({ color: s.c });
    s.stone = new THREE.Mesh(new THREE.OctahedronGeometry(.85, 0), s.mat); s.stone.position.set(s.x, y0 + 2.4, s.z); G.add(s.stone);
    s.hm = new THREE.SpriteMaterial({ map: glowTex(s.cs), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    s.halo = new THREE.Sprite(s.hm); s.halo.scale.set(6, 6, 1); s.halo.position.copy(s.stone.position); G.add(s.halo);
    s.bm = new THREE.MeshBasicMaterial({ color: s.c, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    s.beam = new THREE.Mesh(new THREE.CylinderGeometry(.6, .9, 34, 12, 1, true), s.bm); s.beam.position.set(s.x, y0 + 17, s.z); G.add(s.beam);
    /* guardianes */
    for (let k = 0; k < s.gn; k++) {
      const a = k * TAU / s.gn + .5, hx = s.x + Math.cos(a) * 4, hz = s.z + Math.sin(a) * 4, g = new THREE.Group();
      const bm = toon(0x8d94a8); const add = (geo, mt, x, y, z) => { const m = new THREE.Mesh(geo, mt); m.position.set(x, y, z); g.add(m); return m; };
      add(new THREE.BoxGeometry(1.5, 1.7, 1), bm, 0, 1.2, 0);
      add(new THREE.BoxGeometry(.85, .75, .85), bm, 0, 2.4, 0);
      [-1, 1].forEach(sg => add(new THREE.BoxGeometry(.45, 1.4, .5), bm, sg * 1.05, 1.2, 0));
      add(new THREE.BoxGeometry(1.7, .3, 1.2), toon(0x6d7488), 0, .15, 0);
      const em = new THREE.MeshBasicMaterial({ color: 0x555566 });
      [-.2, .2].forEach(x => add(new THREE.BoxGeometry(.18, .12, .1), em, x, 2.45, .44));
      if (window.outlineGroup) window.outlineGroup(g, 1.06);
      g.position.set(hx, H(hx, hz), hz); G.add(g);
      s.gs.push({ s, g, bm, em, hx, hz, x: hx, z: hz, hp: 1, mhp: 1, cd: 1, fl: 0, alive: true, rt: 0 });
    }
  });

  /* ---------- ventanas ---------- */
  const css = document.createElement('style');
  css.textContent = `
#sbt{display:none;position:fixed;z-index:7;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);padding:12px 20px;border-radius:26px;font-size:15px;font-weight:700;background:linear-gradient(160deg,#d9c6ff,#8f7bff);color:#1c1050;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4)}
#sxh{display:none;position:fixed;z-index:5;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 190px);font-size:11px;padding:5px 8px;border-radius:10px;background:rgba(15,22,55,.6);border:1px solid rgba(255,255,255,.3);color:#fff;text-shadow:0 1px 2px #000;pointer-events:none}
#sxh i{display:inline-block;font-style:normal;color:#d9b8ff;font-size:14px}
#sxd{display:none;position:fixed;z-index:21;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);width:min(94vw,640px);padding:12px 16px 10px;border-radius:18px;background:linear-gradient(160deg,#2a1c56,#150f36);border:2px solid #b07bff;box-shadow:0 8px 30px rgba(0,0,0,.5);color:#fff;font-size:14px;line-height:1.4}
#sxd b{color:#d9b8ff;font-size:15px}#sxd .tx{margin:5px 0 4px;min-height:42px;font-style:italic}#sxd small{opacity:.65;float:right}
`;
  document.head.appendChild(css);
  const tb = document.createElement('button'); tb.id = 'sbt'; document.body.appendChild(tb);
  const hint = document.createElement('div'); hint.id = 'sxh'; hint.innerHTML = '<i id="sxa">▲</i> <span id="sxn"></span> <span id="sxm"></span>'; document.body.appendChild(hint);
  const dl = document.createElement('div'); dl.id = 'sxd'; document.body.appendChild(dl);
  const hurtEl = document.createElement('div');
  hurtEl.style.cssText = 'position:fixed;inset:0;z-index:6;background:rgba(255,0,0,.35);opacity:0;transition:opacity .25s;pointer-events:none';
  document.body.appendChild(hurtEl);
  let q = null;
  function showL() { dl.style.display = 'block'; tb.style.display = 'none'; dl.innerHTML = '<b>🔮 ' + q.t + '</b><small>' + (q.i + 1) + '/' + q.l.length + ' · toca ▶</small><div class="tx">' + q.l[q.i] + '</div>'; }
  dl.addEventListener('pointerdown', e => { e.stopPropagation(); if (!q) return; if (++q.i < q.l.length) { showL(); return; } q = null; dl.style.display = 'none'; });

  /* ---------- reglas ---------- */
  const act = () => !!(S.arc && S.arc.c >= 3);
  function ensure() { if (!Array.isArray(S.sl)) S.sl = [0, 0, 0]; }
  function hurt(n) { S.hp -= n; dirty = true; hurtEl.style.opacity = 1; setTimeout(() => { hurtEl.style.opacity = 0; }, 120); say('💢 Un guardián de piedra te golpea (-' + n + ')'); }
  function kill(e) {
    e.alive = false; e.rt = e.s.on ? 1e9 : 75; e.g.visible = false;
    S.gel = (S.gel || 0) + 1; S.kills = (S.kills || 0) + 1; for (let k = 0; k < 3; k++) gain(); hud(); dirty = true;
    say('🗿 ¡Guardián de piedra derrotado! +1 🧪');
  }
  let cd = 0;
  const atk = $('atk');
  if (atk) atk.addEventListener('click', () => {
    if (!S || !started || window.DGON || !act() || cd > 0) return;
    let best = null, bd = 3.4;
    SITE.forEach(s => s.gs.forEach(e => { if (!e.alive) return; const d = Math.hypot(e.x - S.x, e.z - S.z); if (d < bd) { bd = d; best = e; } }));
    if (!best) return;
    cd = .45;
    const dmg = 8 + S.lv * 2 + (S.axe ? 5 : 0) + Math.floor(((S.st && S.st.fue) || 0) / 12) + Math.floor(Math.random() * 4);
    best.hp -= dmg; best.fl = .12; best.bm.color.setHex(0xffffff);
    if (best.hp <= 0) kill(best); else say('🗿 -' + dmg + ' al guardián (' + Math.ceil(best.hp) + ' PV)');
  });
  function activate(i) {
    const s = SITE[i]; ensure(); S.sl[i] = 1; s.on = true;
    s.mat.color.setHex(0xffd25e); s.hm.color.setHex(0xffe08a); s.bm.color.setHex(0xffd25e); s.bm.opacity = .12;
    s.gs.forEach(e => { e.alive = false; e.rt = 1e9; e.g.visible = false; });
    S.val = (S.val || 0) + 60; for (let k = 0; k < 5; k++) gain();
    if (S.st) { S.st.fue += 6; S.st.res += 6; S.st.mag += 6; }
    hud(); dirty = true;
    const n = S.sl.reduce((a, b) => a + b, 0);
    say('[Sistema] ✨ ' + s.n + ' activo (' + n + '/3). +60 💰 y +5 XP.');
    q = { t: s.n, l: s.v, i: 0 }; showL();
  }
  let cur = -1;
  tb.addEventListener('click', () => {
    if (!S || !started || q || cur < 0) return; const s = SITE[cur]; ensure();
    if (!act()) { say('La piedra permanece inerte… Habla con Orvin en Lumeria.'); return; }
    if (s.gs.some(e => e.alive)) { say('🗿 Los guardianes de piedra protegen el Sello. ¡Derrótalos!'); return; }
    activate(cur);
  });

  /* ---------- capítulos del Arco 2 (se suman a story.js) ---------- */
  const CH = window.STORY_CH, FL = window.STORY_FL;
  const SC = () => (S.sl || []).reduce((a, b) => a + b, 0);
  if (CH && !CH.some(c => c.arc == 2)) {
    CH.push(
      {
        arc: 2, n: 1, f: 'orvin', to: 'orvin', g: 1, p: SC, base: null, t: 'Activa un Sello en las ruinas 🔮',
        intro: ['Tu Fragmento de Aluria vibra… y no es el único. Tres Piedras de Sello rodean Lumeria: el Alba, el Bosque y el Ocaso. Antes sostenían la luz de la Torre.', 'Desde que el sello se rompió, unos guardianes de piedra custodian las ruinas y no distinguen amigos de intrusos.', 'Tu brújula apuntará al Sello dormido más cercano. Derrota a sus guardianes y toca la piedra. Vuelve conmigo cuando lo hagas.'],
        pend: ['Sigue la brújula, Reencarnado. Derrota a los guardianes y toca una Piedra de Sello.'],
        outro: ['¡Siento la Torre más firme! La piedra aceptó tu Bendición. Justo lo que esperaba.'], val: 80, xp: 6
      },
      {
        arc: 2, n: 2, f: 'orvin', to: 'eldara', g: 3, p: SC, base: null, t: 'Activa los 3 Sellos 🔮',
        intro: ['Faltan dos Sellos. Si despiertan los tres, la Torre recuperará su luz. Actívalos y avisa a Eldara: la Guardia cubrirá las puertas mientras tanto.'],
        pend: ['Aún quedan Sellos dormidos. Mira tu brújula: apunta al más cercano.'],
        outro: ['¿Los tres Sellos activos? La Torre brilla como en las leyendas. Lumeria entera lo celebra.', 'Pero algo respondió desde abajo… La mazmorra se agita. Debemos saber qué hay más profundo.'], val: 200, xp: 10, st: ['fue', 'res', 'mag'], sn: 10
      },
      {
        arc: 2, n: 3, f: 'eldara', to: 'orvin', g: 9, p: () => S.dmax || 0, base: null, t: 'Alcanza el piso 9 de la mazmorra 🕳️',
        intro: ['Baja hasta el piso 9. Si la voz de la Torre viene de allí, debemos oírla.', 'Prepárate: compra gelatina y comida con Barto, en la Aldea Brisa, antes de bajar.'],
        pend: ['Desciende hasta el piso 9 de la mazmorra y luego vuelve con Orvin.'],
        outro: ['¿Piso 9? ¡Y volviste entero! Lo que sentiste allí es algo muy antiguo que fue sellado… y empieza a despertar.', '📖 Fin del Arco 2: «Los Sellos Rotos». El Arco 3 llegará pronto.'], val: 600, xp: 25, st: ['fue', 'res', 'des', 'agi', 'mag'], sn: 15, end: true
      }
    );
  }
  if (FL) { FL.orvin = ['La Torre guarda más secretos de los que un archivista alcanza a leer. El Arco 3 llegará pronto…', 'Los Sellos brillan de nuevo, Reencarnado. Pero lo que duerme abajo sigue despertando.']; FL.eldara = ['La Guardia vigila las puertas. Gracias a ti, Lumeria brilla otra vez.', 'Cuando la Torre vuelva a susurrar, serás el primero en saberlo.']; }

  /* ---------- cada frame ---------- */
  const _build = window.build;
  window.build = function (seed) {
    _build(seed);
    for (let i = objs.length - 1; i >= 0; i--) if (SITE.some(s => Math.hypot(objs[i].x - s.x, objs[i].z - s.z) < 13)) { worldGroup.remove(objs[i].g); objs.splice(i, 1); }
  };
  const _uv = window.updVisuals; let th = 0; const seen = [0, 0, 0];
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    const dg = !!window.DGON; G.visible = !dg; ensure();
    if (dg) { tb.style.display = 'none'; hint.style.display = 'none'; if (q) { q = null; dl.style.display = 'none'; } return; }
    cd = Math.max(0, cd - dt);
    for (const c of COL) {
      const dx = S.x - c[0], dz = S.z - c[1], d = Math.hypot(dx, dz), rr = c[2] + .4;
      if (d < rr && d > .01) { S.x = c[0] + dx / d * rr; S.z = c[1] + dz / d * rr; player.position.x = S.x; player.position.z = S.z; dirty = true; }
    }
    const on = act(); cur = -1;
    SITE.forEach((s, i) => {
      s.on = !!S.sl[i];
      const pd = Math.hypot(S.x - s.x, S.z - s.z);
      s.stone.rotation.y = now / 700; s.stone.position.y = H(s.x, s.z) + 2.4 + Math.sin(now / 600 + i) * .18;
      s.halo.position.copy(s.stone.position); s.halo.scale.setScalar(6 + Math.sin(now / 400 + i) * .6);
      if (s.on && s.mat.color.getHex() != 0xffd25e) { s.mat.color.setHex(0xffd25e); s.hm.color.setHex(0xffe08a); s.bm.color.setHex(0xffd25e); s.bm.opacity = .12; }
      if (!seen[i] && pd < 24) { seen[i] = 1; say('🗿 Ruinas del ' + s.n + (s.on ? '. Su luz brilla.' : on ? ': guardianes de piedra custodian el Sello.' : '. Una piedra inerte flota sobre el altar.')); }
      if (!s.on && pd < 3.8 && cur < 0) cur = i;
      s.gs.forEach(e => {
        if (s.on) { e.g.visible = false; return; }
        if (!e.alive) { e.rt -= dt; if (e.rt <= 0) { e.alive = true; e.x = e.hx; e.z = e.hz; } e.g.visible = e.alive; if (e.alive) { e.hp = e.mhp = 50 + S.lv * 8; } return; }
        if (e.mhp == 1) { e.mhp = e.hp = 50 + S.lv * 8; }
        e.g.visible = true; e.em.color.setHex(on ? s.c : 0x555566);
        const dx = S.x - e.x, dz = S.z - e.z, d = Math.hypot(dx, dz) || .01;
        if (on && d < 12 && pd < 20 && S.hp > 0) {
          if (d > 1.9) { e.x += dx / d * 2.3 * dt; e.z += dz / d * 2.3 * dt; }
          else { e.cd -= dt; if (e.cd <= 0) { e.cd = 1.4; hurt(6 + Math.floor(S.lv / 2)); } }
          e.g.rotation.y = Math.atan2(dx, dz);
        } else {
          const hx = e.hx - e.x, hz = e.hz - e.z, hd = Math.hypot(hx, hz);
          if (hd > .5) { e.x += hx / hd * 1.6 * dt; e.z += hz / hd * 1.6 * dt; }
          if (e.hp < e.mhp) e.hp = Math.min(e.mhp, e.hp + 6 * dt);
        }
        e.g.position.set(e.x, H(e.x, e.z) + Math.abs(Math.sin(now / 300 + i)) * .05, e.z);
        if (e.fl > 0) { e.fl -= dt; if (e.fl <= 0) e.bm.color.setHex(0x8d94a8); }
      });
    });
    tb.style.display = cur >= 0 && !q ? 'block' : 'none';
    if (cur >= 0 && !q) tb.textContent = '🔮 Tocar ' + SITE[cur].n;
    th += dt;
    if (th > .2) {
      th = 0; let bi = -1, bd = 1e9;
      SITE.forEach((s, i) => { if (!S.sl[i]) { const d = Math.hypot(s.x - S.x, s.z - S.z); if (d < bd) { bd = d; bi = i; } } });
      if (on && bi >= 0 && bd > 16) {
        const s = SITE[bi], dx = s.x - S.x, dz = s.z - S.z;
        const f = dx * Math.sin(camYaw) + dz * Math.cos(camYaw), r = -dx * Math.cos(camYaw) + dz * Math.sin(camYaw);
        $('sxa').style.transform = 'rotate(' + Math.atan2(r, f) + 'rad)'; $('sxn').textContent = s.n; $('sxm').textContent = Math.round(bd) + ' m';
        hint.style.display = 'block';
      } else hint.style.display = 'none';
    }
  };
})();
