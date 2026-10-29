/* Isekai Online - Aldea Brisa: aldeanos, misiones repetibles y tienda (v0.12.0) */
(function () {
  const PI = Math.PI, TAU = PI * 2;
  /* ---------- sitio: el terreno más plano a 48-70 de la ciudad ---------- */
  let best = null;
  for (let d = 48; d <= 70; d += 4) for (let k = 0; k < 24; k++) {
    const a = k / 24 * TAU, x = Math.cos(a) * d, z = Math.sin(a) * d;
    let mn = 1e9, mx = -1e9;
    for (let i = 0; i < 12; i++) {
      const r = i ? (i % 2 ? 14 : 8) : 0, b = i / 12 * TAU, h = H(x + Math.cos(b) * r, z + Math.sin(b) * r);
      if (h < mn) mn = h; if (h > mx) mx = h;
    }
    const sc = (mx - mn) + (mn < -.5 ? 100 : 0);
    if (!best || sc < best.sc) best = { sc, x, z };
  }
  const CX = best.x, CZ = best.z, NAME = 'Aldea Brisa';

  /* ---------- aldeanos ---------- */
  const NP = {
    tomas: { n: 'Tomas', ic: '🌾', k: 'wood', ang: .7, rob: 0x8a6a3a, hair: 0x6b4a2a, skin: 0xf0c9a0 },
    lina: { n: 'Lina', ic: '🌿', k: 'food', ang: 2.8, rob: 0x4aa86a, hair: 0xf2b84b, skin: 0xffdcc0 },
    barto: { n: 'Barto', ic: '🛒', k: 'shop', ang: 4.9, rob: 0xb0402f, hair: 0xd9622b, skin: 0xe8b890 }
  };
  Object.keys(NP).forEach(id => { const d = NP[id]; d.x = CX + Math.cos(d.ang) * 4.2; d.z = CZ + Math.sin(d.ang) * 4.2; });
  const REQ = {
    tomas: n => ({ g: 6 + 2 * n, val: 30 + 15 * n, xp: 2 + n, it: '🪵 madera', k: 'wood', ask: 'Mis cercas se pudrieron con la lluvia. ¿Me traes ' }),
    lina: n => ({ g: 5 + 2 * n, val: 25 + 15 * n, xp: 2 + n, it: '🫐 bayas', k: 'food', ask: 'Preparo mermelada para el pueblo. ¿Me traes ' })
  };
  const SHOP = [
    { n: '🫐 Comida x5', c: 20, f: () => { S.food += 5; } },
    { n: '🧪 Gelatina x3 (curación)', c: 30, f: () => { S.gel = (S.gel || 0) + 3; } },
    { n: '🪵 Madera x8 + 🪨 Piedra x3', c: 35, f: () => { S.wood += 8; S.stone += 3; } },
    { n: '❤️ Curación completa', c: 15, f: () => { S.hp = 100; S.hg = Math.max(S.hg, 60); } }
  ];

  /* ---------- construcción ---------- */
  const V = new THREE.Group(); scene.add(V);
  const COL = [];
  function box(par, w, h, d, col, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(col)); m.position.set(x, y, z); par.add(m); return m; }
  const RC = [0xe8734a, 0x37b5a6, 0x8a6ee8, 0xf2b84b, 0xe05a7a], WC = [0xf6f1e4, 0xf3ead6, 0xe9f0fb, 0xfbefe6, 0xf0f5ea];
  for (let k = 0; k < 5; k++) {
    const a = k * TAU / 5 + .3, hx = CX + Math.cos(a) * 11.5, hz = CZ + Math.sin(a) * 11.5, g = new THREE.Group();
    g.position.set(hx, H(hx, hz), hz); g.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
    box(g, 4.5, 1.2, 4.1, 0x9aa3b5, 0, -.2, 0);
    box(g, 4.2, 2.6, 3.8, WC[k], 0, 1.5, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.9, 4), toon(RC[k])); roof.rotation.y = PI / 4; roof.position.y = 3.75; g.add(roof);
    box(g, .9, 1.6, .12, 0x7a4a2a, 0, 1.0, 1.92);
    [-1.3, 1.3].forEach(s => { const w = new THREE.Mesh(new THREE.BoxGeometry(.8, .8, .12), new THREE.MeshBasicMaterial({ color: 0xcfe6ff })); w.position.set(s, 1.8, 1.92); g.add(w); });
    box(g, .5, 1.2, .5, 0xb88a6a, 1.1, 4.2, -.6);
    if (window.outlineGroup) window.outlineGroup(g, 1.05);
    V.add(g); COL.push([hx, hz, 2.9]);
  }
  { /* pozo */
    const g = new THREE.Group(), y0 = H(CX, CZ); g.position.set(CX, y0, CZ);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, .9, 12), toon(0x9aa3b5)); b.position.y = .45; g.add(b);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, .05, 12), toon(0x3fa9ff)); w.position.y = .86; g.add(w);
    [-.9, .9].forEach(s => box(g, .12, 1.8, .12, 0x7a4a2a, s, 1.4, 0));
    const r = new THREE.Mesh(new THREE.ConeGeometry(1.4, .7, 4), toon(0xe05a7a)); r.rotation.y = PI / 4; r.position.y = 2.5; g.add(r);
    if (window.outlineGroup) window.outlineGroup(g, 1.05);
    V.add(g); COL.push([CX, CZ, 1.3]);
  }
  for (let k = 0; k < 3; k++) { /* farolas */
    const a = k * TAU / 3 + 1.6, x = CX + Math.cos(a) * 7.5, z = CZ + Math.sin(a) * 7.5, y = H(x, z);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 3, 6), toon(0x1b2350)); p.position.set(x, y + 1.5, z); V.add(p);
    const l = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe9a0 })); l.position.set(x, y + 3.1, z); V.add(l);
  }
  [[-1.2, 5.8], [1.3, 6.3]].forEach(([dx, dz]) => { const x = CX + dx + Math.cos(NP.barto.ang) * 2, z = CZ + dz * .2 + Math.sin(NP.barto.ang) * 6; const c = box(V, 1, 1, 1, 0xb98a55, x, H(x, z) + .5, z); COL.push([x, z, .8]); });

  /* ---------- NPCs ---------- */
  function mkTex(ch, col) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = col; x.beginPath(); x.arc(32, 32, 28, 0, 6.3); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 4; x.stroke();
    x.fillStyle = '#fff'; x.font = 'bold 36px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 32, 34);
    return new THREE.CanvasTexture(c);
  }
  const TX = { '!': mkTex('!', '#ffb22e'), '?': mkTex('?', '#3fc86f'), '$': mkTex('$', '#6f8cff') };
  const M = {};
  function mkNpc(id) {
    const d = NP[id], g = new THREE.Group();
    const add = (geo, col, x, y, z, s) => { const m = new THREE.Mesh(geo, toon(col)); m.position.set(x, y, z); if (s) m.scale.set(s[0], s[1], s[2]); g.add(m); return m; };
    add(new THREE.CylinderGeometry(.3, id == 'barto' ? .6 : .5, 1.25, 10), d.rob, 0, .65, 0);
    add(new THREE.SphereGeometry(.34, 12, 10), d.skin, 0, 1.65, 0);
    add(new THREE.SphereGeometry(.38, 12, 10, 0, TAU, 0, PI * .62), d.hair, 0, 1.72, 0);
    const em = new THREE.MeshBasicMaterial({ color: 0x222244 });
    [-.12, .12].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 6), em); e.position.set(x, 1.66, .31); g.add(e); });
    if (id == 'tomas') { add(new THREE.CylinderGeometry(.55, .55, .05, 12), 0xe8c86a, 0, 1.95, 0); add(new THREE.CylinderGeometry(.28, .3, .22, 10), 0xe8c86a, 0, 2.05, 0); add(new THREE.CylinderGeometry(.03, .03, 1.9, 5), 0x7a4a2a, .5, .95, .1); }
    else if (id == 'lina') { add(new THREE.SphereGeometry(.14, 8, 6), d.hair, 0, 1.45, -.36, [1, 1.8, 1]); add(new THREE.CylinderGeometry(.22, .18, .25, 8), 0xb98a55, .45, .75, .15); }
    else { add(new THREE.SphereGeometry(.3, 10, 8), d.hair, 0, 1.42, .16, [.9, 1, .55]); add(new THREE.BoxGeometry(.5, .08, .2), 0x777f94, .55, 1.1, .1); add(new THREE.BoxGeometry(.1, .5, .1), 0x7a4a2a, .55, .85, .1); }
    if (window.outlineGroup) window.outlineGroup(g, 1.07);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX['!'], transparent: true, depthTest: false }));
    sp.position.y = 3.1; sp.renderOrder = 5; g.add(sp);
    g.position.set(d.x, H(d.x, d.z), d.z); V.add(g); M[id] = { g, sp };
  }
  Object.keys(NP).forEach(mkNpc);

  /* ---------- ventanas ---------- */
  const $ = id => document.getElementById(id);
  const st = document.createElement('style');
  st.textContent = `
#vtb{display:none;position:fixed;z-index:7;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);padding:12px 20px;border-radius:26px;font-size:15px;font-weight:700;background:linear-gradient(160deg,#b6f0b0,#5fcf86);color:#0c3320;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4)}
#vh{display:none;position:fixed;z-index:5;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 150px);font-size:11px;padding:5px 8px;border-radius:10px;background:rgba(15,22,55,.6);border:1px solid rgba(255,255,255,.3);color:#fff;text-shadow:0 1px 2px #000;pointer-events:none}
#vh i{display:inline-block;font-style:normal;color:#ffd25e;font-size:14px}
#vdl{display:none;position:fixed;z-index:21;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);width:min(94vw,640px);padding:12px 16px 10px;border-radius:18px;background:linear-gradient(160deg,#1c3a3a,#12283a);border:2px solid #8fe0a8;box-shadow:0 8px 30px rgba(0,0,0,.5);color:#fff;font-size:14px;line-height:1.4}
#vdl b{color:#8fe0a8;font-size:15px}#vdl .tx{margin:5px 0 4px;min-height:42px}#vdl small{opacity:.65;float:right}
#vm{display:none;position:fixed;inset:0;z-index:20;align-items:center;justify-content:center;background:rgba(8,12,34,.6);padding:8px}
#vm.on{display:flex}
#vc{position:relative;width:min(94vw,520px);max-height:92vh;overflow:auto;padding:14px 16px;border-radius:18px;background:linear-gradient(160deg,#1c3a3a,#12283a);border:2px solid #8fe0a8;color:#fff;font-size:13px;touch-action:pan-y}
#vc h3{margin:0 0 8px;font-size:17px;color:#8fe0a8}
#vc .it{display:flex;align-items:center;gap:8px;margin:6px 0;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.08)}
#vc .it span{flex:1}#vc .it button{padding:7px 12px;font-size:13px}#vc .it button[disabled]{opacity:.35}
#vc .x{position:absolute;top:8px;right:10px;width:34px;height:34px;border-radius:50%;padding:0}
`;
  document.head.appendChild(st);
  const tb = document.createElement('button'); tb.id = 'vtb'; document.body.appendChild(tb);
  const hint = document.createElement('div'); hint.id = 'vh'; hint.innerHTML = '<i id="vha">▲</i> ' + NAME + ' <span id="vhd"></span>'; document.body.appendChild(hint);
  const dl = document.createElement('div'); dl.id = 'vdl'; document.body.appendChild(dl);
  const vm = document.createElement('div'); vm.id = 'vm'; vm.innerHTML = '<div id="vc"></div>'; document.body.appendChild(vm);
  const vc = vm.firstChild;
  let q = null, shop = false, cur = null;

  function dlg(id, lines, cb) { q = { id, lines, i: 0, cb }; showL(); }
  function showL() { dl.style.display = 'block'; tb.style.display = 'none'; dl.innerHTML = '<b>' + NP[q.id].n + '</b><small>' + (q.i + 1) + '/' + q.lines.length + ' · toca ▶</small><div class="tx">' + q.lines[q.i] + '</div>'; }
  dl.addEventListener('pointerdown', e => {
    e.stopPropagation(); if (!q) return;
    if (++q.i < q.lines.length) { showL(); return; }
    const cb = q.cb; q = null; dl.style.display = 'none'; if (cb) cb();
  });
  function closeShop() { shop = false; vm.classList.remove('on'); }
  function renderShop() {
    S.val = S.val || 0;
    vc.innerHTML = '<button class="b x" data-a="x">✕</button><h3>🛒 Herrería de Barto</h3><div style="margin-bottom:6px">Barto: «Pasa, pasa. Tus valis valen aquí.» Tienes <b>' + S.val + '</b> 💰</div>' +
      SHOP.map((it, i) => '<div class="it"><span>' + it.n + '</span><button class="b" data-a="buy" data-i="' + i + '"' + (S.val >= it.c ? '' : ' disabled') + '>' + it.c + ' 💰</button></div>').join('');
  }
  vc.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a == 'x') closeShop();
    else { const it = SHOP[+a.dataset.i]; if (it && S.val >= it.c) { S.val -= it.c; it.f(); hud(); dirty = true; say('Compraste ' + it.n + '.'); renderShop(); } }
  });
  vm.addEventListener('pointerdown', e => { if (e.target === vm) closeShop(); });

  function talk(id) {
    if (!S.vl) S.vl = { tomas: 0, lina: 0 };
    if (id == 'barto') { shop = true; vm.classList.add('on'); tb.style.display = 'none'; renderShop(); return; }
    const n = S.vl[id] || 0, r = REQ[id](n), have = S[r.k] >= r.g;
    if (!have) { dlg(id, [(n ? 'Gracias por la ayuda de antes. ' : '¡Hola, viajero! ') + r.ask + r.g + ' ' + r.it + '? Te pagaré ' + r.val + ' 💰. (Llevas ' + S[r.k] + ')']); return; }
    dlg(id, ['¡Justo lo que necesitaba! Aquí tienes tu pago: ' + r.val + ' 💰.'], () => {
      S[r.k] -= r.g; S.val = (S.val || 0) + r.val; for (let i = 0; i < r.xp; i++) gain();
      S.vl[id] = n + 1; hud(); dirty = true; say('[Aldea] ✅ +' + r.val + ' 💰 y +' + r.xp + ' XP por ayudar a ' + NP[id].n + '.');
    });
  }
  tb.addEventListener('click', () => { if (S && started && !q && !shop && cur) talk(cur); });

  /* ---------- el mundo: despejar árboles y rocas dentro de la aldea ---------- */
  const _build = window.build;
  window.build = function (seed) {
    _build(seed);
    for (let i = objs.length - 1; i >= 0; i--) if (Math.hypot(objs[i].x - CX, objs[i].z - CZ) < 17) { worldGroup.remove(objs[i].g); objs.splice(i, 1); }
  };

  /* ---------- cada frame ---------- */
  const _uv = window.updVisuals; let th = 0, seen = false;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    const dg = !!window.DGON; V.visible = !dg;
    if (dg) { tb.style.display = 'none'; hint.style.display = 'none'; if (q) { q = null; dl.style.display = 'none'; } if (shop) closeShop(); return; }
    for (const c of COL) {
      const dx = S.x - c[0], dz = S.z - c[1], d = Math.hypot(dx, dz), rr = c[2] + .4;
      if (d < rr && d > .01) { S.x = c[0] + dx / d * rr; S.z = c[1] + dz / d * rr; player.position.x = S.x; player.position.z = S.z; dirty = true; }
    }
    cur = null; let bd = 3.2;
    Object.keys(NP).forEach((id, i) => {
      const m = M[id], d = NP[id], dx = S.x - d.x, dz = S.z - d.z, dist = Math.hypot(dx, dz);
      if (dist < 9) m.g.rotation.y = Math.atan2(dx, dz);
      if (dist < .95 && dist > .01) { const k = .95 / dist; S.x = d.x + dx * k; S.z = d.z + dz * k; player.position.x = S.x; player.position.z = S.z; dirty = true; }
      if (dist < bd) { bd = dist; cur = id; }
      m.g.scale.y = 1 + Math.sin(now / 520 + i * 2) * .012;
      let mk = '$';
      if (id != 'barto') { const r = REQ[id]((S.vl && S.vl[id]) || 0); mk = S[r.k] >= r.g ? '?' : '!'; }
      m.sp.material.map = TX[mk]; m.sp.position.y = 3.1 + Math.sin(now / 300 + i) * .12;
    });
    tb.style.display = cur && !q && !shop ? 'block' : 'none';
    if (cur && !q && !shop) tb.textContent = (cur == 'barto' ? '🛒 Comprar a ' : '💬 Hablar con ') + NP[cur].n;
    if (q && !cur) { q = null; dl.style.display = 'none'; }
    if (shop && !cur) closeShop();
    th += dt;
    if (th > .2) {
      th = 0;
      const dx = CX - S.x, dz = CZ - S.z, dist = Math.hypot(dx, dz);
      if (!seen && dist < 22) { seen = true; say('🏘️ ' + NAME + ': aquí viven Tomas, Lina y Barto.'); }
      if (dist > 20) {
        const f = dx * Math.sin(camYaw) + dz * Math.cos(camYaw), r = -dx * Math.cos(camYaw) + dz * Math.sin(camYaw);
        $('vha').style.transform = 'rotate(' + Math.atan2(r, f) + 'rad)'; $('vhd').textContent = Math.round(dist) + ' m';
        hint.style.display = 'block';
      } else hint.style.display = 'none';
    }
  };
})();
