/* Isekai Online - Mundo más vivo: animales y clima (v0.11.0) */
(function () {
  const $ = id => document.getElementById(id);
  const CR = (window.CITY && CITY.r) || 30, RB = 82, rnd = Math.random;

  /* ---------- animales ---------- */
  const N = 22, A = [], COLS = [0xf5e6d0, 0xc9a27a, 0x9a8a7a, 0xffffff];
  const ok = (x, z) => { const d = Math.hypot(x, z); return d > CR + 6 && d < RB && H(x, z) > -1.2; };
  function spot() {
    for (let i = 0; i < 40; i++) { const a = rnd() * 6.283, d = CR + 10 + rnd() * (RB - CR - 10), x = Math.cos(a) * d, z = Math.sin(a) * d; if (ok(x, z)) return [x, z]; }
    return [CR + 14, 0];
  }
  function mk() {
    const g = new THREE.Group(), c = COLS[Math.floor(rnd() * COLS.length)];
    const add = (geo, col, x, y, z, s) => { const m = new THREE.Mesh(geo, toon(col)); m.position.set(x, y, z); if (s) m.scale.set(s[0], s[1], s[2]); g.add(m); return m; };
    add(new THREE.SphereGeometry(.4, 10, 8), c, 0, .4, 0, [1, .85, 1.3]);
    add(new THREE.SphereGeometry(.26, 10, 8), c, 0, .65, .5);
    [-.1, .1].forEach(x => add(new THREE.CylinderGeometry(.05, .07, .55, 6), c, x, 1.05, .45));
    add(new THREE.SphereGeometry(.14, 8, 6), 0xffffff, 0, .45, -.5);
    const em = new THREE.MeshBasicMaterial({ color: 0x222244 });
    [-.1, .1].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 6), em); e.position.set(x, .72, .72); g.add(e); });
    if (window.outlineGroup) window.outlineGroup(g, 1.08);
    scene.add(g); return g;
  }
  for (let i = 0; i < N; i++) { const p = spot(); A.push({ g: mk(), x: p[0], z: p[1], tx: p[0], tz: p[1], w: rnd() * 4, alive: true, rt: 0 }); }

  const btn = document.createElement('button');
  btn.style.cssText = 'display:none;position:fixed;z-index:7;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 84px);padding:11px 18px;border-radius:26px;font-size:15px;font-weight:700;background:linear-gradient(160deg,#ffe29a,#ffb457);color:#3a2200;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4)';
  btn.textContent = '🏹 Atrapar 🐇'; document.body.appendChild(btn);
  let cand = null;
  btn.addEventListener('click', () => {
    if (!S || !started || !cand || !cand.alive) return;
    cand.alive = false; cand.g.visible = false; cand.rt = 45; cand = null;
    S.food += 3; S.hunt = (S.hunt || 0) + 1; gain(); hud(); dirty = true;
    say('🐇 Atrapaste un conejo: +3 🫐 de comida.');
  });

  /* ---------- clima ---------- */
  const ND = 380, rx = new Float32Array(ND), rz = new Float32Array(ND), ry = new Float32Array(ND);
  for (let i = 0; i < ND; i++) { rx[i] = (rnd() * 2 - 1) * 16; rz[i] = (rnd() * 2 - 1) * 16; ry[i] = rnd() * 18; }
  const rp = new Float32Array(ND * 6);
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xbcd6ff, transparent: true, opacity: .55 }));
  rain.frustumCulled = false; rain.visible = false; scene.add(rain);
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;background:rgb(70,90,125);opacity:0';
  document.body.appendChild(ov);
  let wt = 60, wTarget = 0, wr = 0, wf = 0;   /* 0 despejado, 1 lluvia, 2 niebla */
  function nextWeather() {
    const r = rnd(); wTarget = r < .5 ? 0 : r < .8 ? 1 : 2; wt = 70 + rnd() * 70;
    say(wTarget == 1 ? '🌧️ Empieza a llover.' : wTarget == 2 ? '🌫️ Se levanta la niebla.' : '☀️ El cielo se despeja.');
  }

  /* ---------- cada frame ---------- */
  const _uv = window.updVisuals;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    const dg = !!window.DGON;
    /* animales */
    cand = null; let bd = 2.2;
    A.forEach((a, i) => {
      if (dg) { a.g.visible = false; return; }
      if (!a.alive) {
        a.rt -= dt;
        if (a.rt <= 0) { const p = spot(); a.x = a.tx = p[0]; a.z = a.tz = p[1]; a.alive = true; }
        return;
      }
      const dx = a.x - S.x, dz = a.z - S.z, d = Math.hypot(dx, dz);
      let sp = 0;
      if (d < 6) { const l = d || 1; a.tx = a.x + dx / l * 8; a.tz = a.z + dz / l * 8; sp = 4.2; }
      else if (a.w > 0) a.w -= dt;
      else {
        const e = Math.hypot(a.tx - a.x, a.tz - a.z);
        if (e < .3) { a.w = 2 + rnd() * 5; const nx = a.x + (rnd() * 2 - 1) * 7, nz = a.z + (rnd() * 2 - 1) * 7; if (ok(nx, nz)) { a.tx = nx; a.tz = nz; } }
        else sp = 1.3;
      }
      let hop = 0;
      if (sp > 0) {
        const ux = a.tx - a.x, uz = a.tz - a.z, l = Math.hypot(ux, uz) || 1;
        const nx = a.x + ux / l * sp * dt, nz = a.z + uz / l * sp * dt;
        if (ok(nx, nz)) { a.x = nx; a.z = nz; a.g.rotation.y = Math.atan2(ux, uz); hop = Math.abs(Math.sin(now / 110 + i)) * .22; }
        else { a.tx = a.x; a.tz = a.z; a.w = .4; }
      }
      a.g.visible = d < 75;
      a.g.position.set(a.x, H(a.x, a.z) + hop, a.z);
      if (d < bd) { bd = d; cand = a; }
    });
    btn.style.display = cand && !dg ? 'block' : 'none';
    /* clima */
    wt -= dt; if (wt <= 0) nextWeather();
    const k = Math.min(1, dt * .25);
    wr += ((wTarget == 1 ? 1 : 0) - wr) * k; wf += ((wTarget == 2 ? 1 : 0) - wf) * k;
    if (dg) { rain.visible = false; ov.style.opacity = 0; return; }
    scene.fog.near = 40 - 30 * wf - 12 * wr; scene.fog.far = 140 - 85 * wf - 45 * wr;
    ov.style.opacity = (.2 * wr + .1 * wf).toFixed(3);
    rain.visible = wr > .05; rain.material.opacity = .55 * wr;
    if (rain.visible) {
      for (let i = 0; i < ND; i++) {
        ry[i] -= 30 * dt; if (ry[i] < 0) { ry[i] += 18; rx[i] = (rnd() * 2 - 1) * 16; rz[i] = (rnd() * 2 - 1) * 16; }
        const x = S.x + rx[i], z = S.z + rz[i], y = player.position.y + ry[i], j = i * 6;
        rp[j] = x; rp[j + 1] = y; rp[j + 2] = z; rp[j + 3] = x + .06; rp[j + 4] = y + .75; rp[j + 5] = z;
      }
      rg.attributes.position.needsUpdate = true;
    }
  };
})();
