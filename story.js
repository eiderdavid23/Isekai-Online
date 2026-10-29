/* Isekai Online - Arco 1: El Susurro de la Torre (v0.10.0) */
(function () {
  const $ = id => document.getElementById(id);
  /* ---------- NPCs ---------- */
  const NP = {
    orvin: { n: 'Orvin', x: -10, z: 4, rob: 0x6f5bd6, hair: 0xeceef5, skin: 0xf3d2b3 },
    eldara: { n: 'Eldara', x: 0, z: 25, rob: 0xdfe8ff, hair: 0xc83a54, skin: 0xffd9b8 }
  };
  const FL = {
    orvin: ['La Torre guarda más secretos de los que un archivista alcanza a leer. El Arco 2 llegará pronto…', 'Descansa, Reencarnado. La luz de la Torre brilla un poco más fuerte desde que volviste.'],
    eldara: ['La Guardia vigila las puertas. Gracias a ti, dormimos más tranquilos.', 'Cuando la Torre vuelva a susurrar, serás el primero en saberlo.']
  };

  /* ---------- capítulos ---------- */
  const P0 = () => (S.kills || 0) - S.arc.b, P1 = () => (S.bosses || 0) - S.arc.b, P2 = () => S.dmax || 0;
  const CH = [
    {
      f: 'orvin', to: 'eldara', g: 5, p: P0, base: () => S.kills || 0, t: 'Derrota 5 monstruos ⚔️', need: () => S.bl,
      hint: ['Veo que aún no recibiste la Bendición de Aluria. Visita el Gremio (el edificio azul junto a la plaza) y vuelve conmigo.'],
      intro: ['Así que tú eres el Reencarnado que despertó cerca de la Torre. Soy Orvin, archivista de la Torre Celeste.', 'Hace cien años su luz se veía desde el horizonte. Hoy parpadea… y los monstruos se vuelven más audaces cada noche.', 'Antes de contarte más, debo saber si tu Bendición es auténtica. Sal de los muros y derrota 5 monstruos. Después busca a Eldara, capitana de la Guardia, en la puerta norte.'],
      pend: ['Aún no son cinco. Sal de los muros y derrota monstruos; Eldara te espera en la puerta norte cuando termines.'],
      outro: ['¿Cinco monstruos? Entonces la Bendición de Aluria te eligió de verdad. Soy Eldara, capitana de la Guardia.'], val: 40, xp: 3
    },
    {
      f: 'eldara', to: 'orvin', g: 1, p: P1, base: () => S.bosses || 0, t: 'Derrota a un jefe de la mazmorra 👑',
      intro: ['Los kobolds suben desde la mazmorra como si alguien les diera órdenes. Cada tres pisos hay un jefe que custodia algo.', 'Baja por la puerta azul de la Torre, llega al piso 3 y derrota a ese jefe. Luego cuéntaselo a Orvin.'],
      pend: ['Entra por la puerta azul de la Torre. Cada tres pisos hay un jefe; derrota a uno y vuelve con Orvin.'],
      outro: ['Un Fragmento de Aluria… lo sentía en el aire. Déjame verlo.', 'El sello de la Torre se rompe desde abajo, y este fragmento es parte de él. Tómalo: tu Bendición lo hace brillar.'], val: 120, xp: 8, st: ['fue', 'res'], sn: 10
    },
    {
      f: 'orvin', to: 'eldara', g: 5, p: P2, base: null, t: 'Alcanza el piso 5 de la mazmorra 🕳️',
      intro: ['Hay más fragmentos, y algo los reúne en lo profundo. Desciende hasta el piso 5 y mira qué hay allí.', 'Cuando vuelvas, cuéntale a Eldara lo que viste. La Guardia debe saberlo.'],
      pend: ['Sigue descendiendo por la mazmorra. Necesito que llegues al piso 5; luego habla con Eldara.'],
      outro: ['¿Piso 5? Entonces era cierto: la Torre susurra… y pronunció tu nombre.', 'Orvin y yo investigaremos esos susurros. Lumeria te debe mucho, Reencarnado.', '📖 Fin del Arco 1: «El Susurro de la Torre». El Arco 2 llegará pronto.'], val: 300, xp: 15, st: ['fue', 'res', 'des', 'agi', 'mag'], sn: 10, end: true
    }
  ];

  function ensure() {
    if (!S.arc) S.arc = { c: 0, ph: 0, b: 0 };
    return S.arc;
  }

  /* ---------- estilos y ventanas ---------- */
  const st = document.createElement('style');
  st.textContent = `
#stb{display:none;position:fixed;z-index:7;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);padding:12px 20px;border-radius:26px;font-size:15px;font-weight:700;background:linear-gradient(160deg,#9ad0ff,#6f8cff);color:#10204a;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4)}
#stq{display:none;position:fixed;z-index:5;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 92px);max-width:26vw;font-size:11px;line-height:1.25;padding:6px 8px;border-radius:10px;background:rgba(15,22,55,.6);border:1px solid rgba(255,255,255,.3);color:#fff;text-shadow:0 1px 2px #000;pointer-events:none}
#sdl{display:none;position:fixed;z-index:21;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);width:min(94vw,640px);padding:12px 16px 10px;border-radius:18px;background:linear-gradient(160deg,#1c2656,#121a40);border:2px solid #ffd25e;box-shadow:0 8px 30px rgba(0,0,0,.5);color:#fff;font-size:14px;line-height:1.4}
#sdl b{color:#ffd25e;font-size:15px}#sdl .tx{margin:5px 0 4px;min-height:42px}#sdl small{opacity:.65;float:right}
`;
  document.head.appendChild(st);
  const tb = document.createElement('button'); tb.id = 'stb'; document.body.appendChild(tb);
  const tq = document.createElement('div'); tq.id = 'stq'; document.body.appendChild(tq);
  const dl = document.createElement('div'); dl.id = 'sdl'; document.body.appendChild(dl);

  let q = null; /* diálogo activo: {id, lines, i, cb} */
  function dlg(id, lines, cb) { q = { id, lines, i: 0, cb }; showL(); }
  function showL() {
    dl.style.display = 'block'; tb.style.display = 'none';
    dl.innerHTML = '<b>' + NP[q.id].n + '</b><small>' + (q.i + 1) + '/' + q.lines.length + ' · toca ▶</small><div class="tx">' + q.lines[q.i] + '</div>';
  }
  dl.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (!q) return;
    if (++q.i < q.lines.length) { showL(); return; }
    const cb = q.cb, id = q.id; q = null; dl.style.display = 'none';
    if (cb) cb(id);
  });

  /* ---------- lógica de la historia ---------- */
  function reward(c) {
    S.val = (S.val || 0) + c.val;
    for (let k = 0; k < c.xp; k++) gain();
    if (c.st && S.st) c.st.forEach(k => { S.st[k] += c.sn; });
    hud(); dirty = true;
    say('[Sistema] 📖 Capítulo completado: +' + c.val + ' 💰, +' + c.xp + ' XP' + (c.st ? ' y tus stats crecen.' : '.'));
  }
  function talk(id) {
    const a = ensure(), c = CH[a.c];
    if (!c) { dlg(id, [FL[id][Math.floor(Math.random() * FL[id].length)]]); return; }
    if (a.ph == 0) {
      if (c.f != id) { dlg(id, ['Habla con ' + NP[c.f].n + '. Te espera.']); return; }
      if (c.need && !c.need()) { dlg(id, c.hint); return; }
      dlg(id, c.intro, () => { a.ph = 1; a.b = c.base ? c.base() : 0; dirty = true; upTrack(); });
    } else {
      if (c.to != id) { dlg(id, ['Mejor ve con ' + NP[c.to].n + ' cuando termines.']); return; }
      if (c.p() < c.g) { dlg(id, c.pend); return; }
      dlg(id, c.outro, () => {
        reward(c); a.c++; a.ph = 0; a.b = 0; dirty = true; upTrack();
        if (!c.end && CH[a.c] && CH[a.c].f == id) talk(id);
      });
    }
  }
  tb.addEventListener('click', () => { if (S && started && !q && cur) talk(cur); });

  function upTrack() {
    if (!S || !started) { tq.style.display = 'none'; return; }
    const a = ensure(), c = CH[a.c];
    if (!c) { tq.style.display = 'none'; return; }
    let t = '📖 Arco 1 · Cap. ' + (a.c + 1) + '/' + CH.length + '<br>';
    if (a.ph == 0) t += c.need && !c.need() ? 'Recibe la Bendición en el Gremio' : 'Habla con ' + NP[c.f].n + ' 💬';
    else { const p = Math.min(c.g, Math.max(0, c.p())); t += p >= c.g ? 'Vuelve con ' + NP[c.to].n + ' 💬' : c.t + ' (' + p + '/' + c.g + ')'; }
    tq.innerHTML = t; tq.style.display = 'block';
  }

  /* ---------- modelos de los NPCs ---------- */
  function mkTex(ch, col) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = col; x.beginPath(); x.arc(32, 32, 28, 0, 6.3); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 4; x.stroke();
    x.fillStyle = '#fff'; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 32, 34);
    return new THREE.CanvasTexture(c);
  }
  const TX = { '!': mkTex('!', '#ffb22e'), '?': mkTex('?', '#3fc86f'), '💬': mkTex('…', '#6f8cff') };
  const meshes = {};
  function mk(id) {
    const d = NP[id], g = new THREE.Group();
    const add = (geo, col, x, y, z, s) => { const m = new THREE.Mesh(geo, toon(col)); m.position.set(x, y, z); if (s) m.scale.set(s[0], s[1], s[2]); g.add(m); return m; };
    add(new THREE.CylinderGeometry(.3, .5, 1.25, 10), d.rob, 0, .65, 0);
    add(new THREE.SphereGeometry(.34, 12, 10), d.skin, 0, 1.65, 0);
    add(new THREE.SphereGeometry(.38, 12, 10, 0, Math.PI * 2, 0, Math.PI * .62), d.hair, 0, 1.72, 0);
    const em = new THREE.MeshBasicMaterial({ color: 0x222244 });
    [-.12, .12].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 6), em); e.position.set(x, 1.66, .31); g.add(e); });
    if (id == 'orvin') {
      add(new THREE.SphereGeometry(.3, 10, 8), d.hair, 0, 1.4, .16, [.9, 1, .55]);
      add(new THREE.ConeGeometry(.42, .75, 8), 0x4a3aa0, 0, 2.15, 0);
      add(new THREE.CylinderGeometry(.04, .04, 2.2, 6), 0x7a4a2a, .55, 1.1, .1);
      add(new THREE.SphereGeometry(.12, 8, 6), 0xffd25e, .55, 2.25, .1);
    } else {
      const cp = add(new THREE.CylinderGeometry(.3, .5, 1, 8, 1, true), 0xc83a54, 0, .8, -.25); cp.material.side = THREE.DoubleSide;
      add(new THREE.SphereGeometry(.16, 8, 6), d.hair, 0, 1.55, -.38, [1, 1.6, 1]);
      [-1, 1].forEach(s => add(new THREE.SphereGeometry(.17, 8, 6), 0xffd25e, s * .4, 1.2, 0));
      add(new THREE.CylinderGeometry(.04, .04, 1.4, 6), 0xdfe6f5, -.5, .9, .1);
      add(new THREE.BoxGeometry(.3, .06, .08), 0xffd25e, -.5, .25, .1);
    }
    if (window.outlineGroup) window.outlineGroup(g, 1.07);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX['!'], transparent: true, depthTest: false }));
    sp.scale.set(1, 1, 1); sp.position.y = 3.2; sp.renderOrder = 5; g.add(sp);
    g.position.set(d.x, H(d.x, d.z), d.z);
    scene.add(g); meshes[id] = { g, sp };
  }
  Object.keys(NP).forEach(mk);

  /* ---------- cada frame ---------- */
  let cur = null, t5 = 0;
  const _uv = window.updVisuals;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    const dg = !!window.DGON, a = ensure(), c = CH[a.c];
    cur = null; let bd = 3.4;
    Object.keys(NP).forEach((id, i) => {
      const m = meshes[id], d = NP[id]; m.g.visible = !dg;
      if (dg) return;
      const dx = S.x - d.x, dz = S.z - d.z, dist = Math.hypot(dx, dz);
      if (dist < 9) m.g.rotation.y = Math.atan2(dx, dz);
      if (dist < .95 && dist > .01) { const k = .95 / dist; S.x = d.x + dx * k; S.z = d.z + dz * k; player.position.x = S.x; player.position.z = S.z; dirty = true; }
      if (dist < bd) { bd = dist; cur = id; }
      m.g.scale.y = 1 + Math.sin(now / 520 + i * 2) * .012;
      let mk2 = null;
      if (c) {
        if (a.ph == 0 && c.f == id) mk2 = '!';
        else if (a.ph == 1 && c.to == id) mk2 = c.p() >= c.g ? '?' : '💬';
      }
      m.sp.visible = !!mk2; if (mk2) { m.sp.material.map = TX[mk2]; m.sp.position.y = 3.2 + Math.sin(now / 300 + i) * .12; }
    });
    tb.style.display = cur && !q ? 'block' : 'none';
    if (cur && !q) tb.textContent = '💬 Hablar con ' + NP[cur].n;
    if (q && (dg || !cur)) { q = null; dl.style.display = 'none'; }
    t5 += dt; if (t5 > .5) { t5 = 0; upTrack(); }
  };
})();
