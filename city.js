/* Isekai Online - Lumeria: ciudad amurallada + Torre Celeste (v0.7.0) */
(function () {
  const CR = 30, TR = 7, GR = CR + 1.2, PI = Math.PI, TAU = PI * 2;
  const CITY = window.CITY = { r: CR, tr: TR, sx: 0, sz: -17, name: 'Lumeria', tower: 'Torre Celeste', door: { x: 0, z: -10 }, guild: { x: 14.5, z: -14.5 } };
  const WH = 0xf5f2ea, BL = 0x4f86f0, BD = 0x2f56c4, GO = 0xffd25e, DK = 0x1b2350;

  function rnd(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function tex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); return t;
  }

  /* ---------- texturas ---------- */
  const brick = tex(128, 128, (c, W) => {
    c.fillStyle = '#f7f4ec'; c.fillRect(0, 0, W, W);
    c.strokeStyle = '#d6d0c2'; c.lineWidth = 2;
    for (let r = 0; r < 8; r++) {
      const y = r * 16; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
      for (let x = (r % 2) * 32; x <= W; x += 64) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke(); }
    }
    const r = rnd(5);
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(150,165,200,.07)'; c.fillRect(r() * W, r() * W, 20 + r() * 30, 10); }
  });
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping;

  const gtex = tex(1024, 1024, (c, W) => {
    const s = W / (2 * GR), X = x => W / 2 + x * s, r = rnd(11), T = 2 * s;
    c.fillStyle = '#e6e1d3'; c.fillRect(0, 0, W, W);
    for (let j = 0; j * T < W; j++) for (let i = -1; i * T < W; i++) {
      c.fillStyle = ['#ece7db', '#e3ded0', '#f0ebdf'][Math.floor(r() * 3)];
      c.fillRect(i * T + (j % 2) * T / 2 + 1, j * T + 1, T - 2, T - 2);
    }
    c.fillStyle = '#f8f4e8';
    c.fillRect(X(-3.5), 0, 7 * s, W); c.fillRect(0, X(-3.5), W, 7 * s);
    c.strokeStyle = '#dcd6c6'; c.lineWidth = 2;
    for (let k = -GR; k < GR; k += 3) {
      c.beginPath(); c.moveTo(X(-3.5), X(k)); c.lineTo(X(3.5), X(k)); c.moveTo(X(k), X(-3.5)); c.lineTo(X(k), X(3.5)); c.stroke();
    }
    c.strokeStyle = '#8fb4f7'; c.lineWidth = 4;
    [-3.5, 3.5].forEach(e => { c.beginPath(); c.moveTo(X(e), 0); c.lineTo(X(e), W); c.moveTo(0, X(e)); c.lineTo(W, X(e)); c.stroke(); });
    const ring = (rad, col, lw, fill) => {
      c.beginPath(); c.arc(W / 2, W / 2, rad * s, 0, TAU);
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (col) { c.strokeStyle = col; c.lineWidth = lw; c.stroke(); }
    };
    ring(13, '#8fb4f7', 6, '#fbf8ee'); ring(12.2, '#d6e4ff', 3); ring(10.2, '#b9d0fa', 3);
    c.strokeStyle = '#c4d7fb'; c.lineWidth = 3;
    for (let k = 0; k < 24; k++) {
      const a = k / 24 * TAU; c.beginPath();
      c.moveTo(W / 2 + Math.cos(a) * 8.6 * s, W / 2 + Math.sin(a) * 8.6 * s);
      c.lineTo(W / 2 + Math.cos(a) * 12 * s, W / 2 + Math.sin(a) * 12 * s); c.stroke();
    }
    ring(8.6, '#8fb4f7', 5, '#f4f7ff');
    c.fillStyle = '#8fb4f7';
    for (let k = 0; k < 24; k++) { const a = (k + .5) / 24 * TAU; c.beginPath(); c.arc(W / 2 + Math.cos(a) * 11.2 * s, W / 2 + Math.sin(a) * 11.2 * s, 5, 0, TAU); c.fill(); }
  });

  const portalTex = tex(128, 192, (c, w, h) => {
    const g = c.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, 'rgba(200,235,255,.95)'); g.addColorStop(.6, 'rgba(110,170,255,.55)'); g.addColorStop(1, 'rgba(90,120,255,.25)');
    c.fillStyle = g; c.beginPath(); c.moveTo(8, h); c.lineTo(8, 64); c.arc(64, 64, 56, PI, 0); c.lineTo(120, h); c.closePath(); c.fill();
  });
  const glowTex = tex(64, 64, (c, w) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,250,200,1)'); g.addColorStop(.3, 'rgba(255,235,150,.55)'); g.addColorStop(1, 'rgba(255,235,150,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, w);
  });

  /* ---------- utilidades de geometría (todo se fusiona: pocas llamadas de dibujo) ---------- */
  const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler(), _q = new THREE.Quaternion(), _c = new THREE.Color();
  function M(x, y, z, ry, sx, sy, sz, rx) {
    _e.set(rx || 0, ry || 0, 0, 'YXZ'); _q.setFromEuler(_e);
    return new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz));
  }
  const acc = () => ({ p: [], n: [], u: [], c: [] });
  function put(a, geo, m, hex, ru, rv, par) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(par ? par.clone().multiply(m) : m);
    const p = g.attributes.position.array, n = g.attributes.normal.array, u = g.attributes.uv.array;
    _c.setHex(hex == null ? 0xffffff : hex);
    for (let i = 0; i < p.length; i++) { a.p.push(p[i]); a.n.push(n[i]); }
    for (let i = 0; i < u.length; i += 2) a.u.push(u[i] * (ru || 1), u[i + 1] * (rv || 1));
    for (let i = 0; i < p.length; i += 3) a.c.push(_c.r, _c.g, _c.b);
  }
  function geoOf(a) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(a.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(a.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(a.u, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(a.c, 3));
    return g;
  }
  function hull(g, t) {
    const p = g.attributes.position, n = g.attributes.normal, N = p.count, sum = new Map(), keys = new Array(N);
    for (let i = 0; i < N; i++) {
      const k = Math.round(p.getX(i) * 40) + ',' + Math.round(p.getY(i) * 40) + ',' + Math.round(p.getZ(i) * 40);
      keys[i] = k; let v = sum.get(k); if (!v) { v = [0, 0, 0]; sum.set(k, v); }
      v[0] += n.getX(i); v[1] += n.getY(i); v[2] += n.getZ(i);
    }
    const P = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = sum.get(keys[i]), l = Math.hypot(v[0], v[1], v[2]) || 1;
      P[i * 3] = p.getX(i) + v[0] / l * t; P[i * 3 + 1] = p.getY(i) + v[1] / l * t; P[i * 3 + 2] = p.getZ(i) + v[2] / l * t;
    }
    const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.BufferAttribute(P, 3)); return o;
  }

  const BOX = new THREE.BoxGeometry(1, 1, 1), CYL = new THREE.CylinderGeometry(1, 1, 1, 22), CYL8 = new THREE.CylinderGeometry(1, 1, 1, 8);
  const SPH = new THREE.SphereGeometry(1, 10, 8), ICO = new THREE.IcosahedronGeometry(1, 1);
  const PYR = new THREE.ConeGeometry(.7071, 1, 4, 1); PYR.rotateY(PI / 4);
  const PYRF = PYR.toNonIndexed(); PYRF.computeVertexNormals();
  const stone = acc(), paint = acc(), glow = acc(), cols = [];

  /* ---------- Torre Celeste ---------- */
  let y = 0;
  put(paint, CYL, M(0, .6, 0, 0, TR + .9, 1.2, TR + .9), BL);
  [[7, 15], [6.1, 13], [5.3, 11], [4.5, 10], [3.8, 9], [3.1, 7]].forEach(([r, h], i) => {
    put(stone, new THREE.CylinderGeometry(r * .96, r, h, 28), M(0, y + h / 2, 0), WH, TAU * r / 5, h / 5);
    if (i) put(paint, CYL, M(0, y + .35, 0, 0, r + .2, .7, r + .2), BL);
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU + (i % 2) * PI / 8;
      put(paint, CYL8, M(Math.cos(a) * (r + .1), y + h / 2, Math.sin(a) * (r + .1), 0, .36, h, .36), 0xe8eefa);
      const b = (k + .5) / 8 * TAU;
      put(glow, BOX, M(Math.cos(b) * (r * .98 + .1), y + h * .55, Math.sin(b) * (r * .98 + .1), PI / 2 - b, .9, 2.4, .5));
    }
    put(paint, CYL, M(0, y + h + .35, 0, 0, r + 1.25, .7, r + 1.25), BL);
    put(paint, CYL, M(0, y + h + .8, 0, 0, r + 1.05, .2, r + 1.05), GO);
    y += h;
  });
  put(paint, new THREE.CylinderGeometry(.1, 3.9, 11, 20), M(0, y + 6.2, 0), BL);
  put(paint, CYL8, M(0, y + 15.2, 0, 0, .12, 8, .12), GO);
  const TOP = y + 19;
  /* entrada (la mazmorra llega en v0.8) */
  put(stone, BOX, M(0, 4.4, -(TR + .1), 0, 6.4, 8.8, 1.6), WH, 1.3, 1.8);
  put(paint, BOX, M(0, 3, -(TR + .95), 0, 4, 6, .3), DK);
  put(paint, CYL, M(0, 6, -(TR + .95), 0, 2, .3, 2, PI / 2), DK);
  put(paint, BOX, M(0, .15, -(TR + 1.3), 0, 7, .3, 1), 0xece8dc);
  put(paint, BOX, M(0, .08, -(TR + 2.1), 0, 8.2, .16, 1), 0xe2ddd0);
  [-1, 1].forEach(s => {
    const x = s * Math.sin(.62) * 7.15, z = -Math.cos(.62) * 7.15, ry = Math.atan2(x, z);
    put(paint, BOX, M(x, 6.5, z, ry, 1.4, 5, .15), BL);
    put(paint, BOX, M(x, 9.1, z, ry, 1.7, .22, .25), GO);
  });

  /* ---------- muralla y puertas ---------- */
  const STEPS = 64, ds = TAU / STEPS;
  for (let i = 0; i < STEPS; i++) {
    if ([0, 16, 32, 48].some(g => Math.min(Math.abs(i - g), STEPS - Math.abs(i - g)) <= 1)) continue;
    const a = i * ds, x = Math.cos(a) * CR, z = Math.sin(a) * CR, ry = -a - PI / 2;
    put(stone, BOX, M(x, 3.25, z, ry, 3.3, 6.5, 2.4), WH, .66, 1.3);
    put(paint, BOX, M(x, 4.9, z, ry, 3.32, .55, 2.55), BL);
    [-.74, .74].forEach(s => put(stone, BOX, M(x - Math.sin(a) * s, 7.15, z + Math.cos(a) * s, ry, 1, 1.3, 2.6), WH, .2, .26));
  }
  for (let g = 0; g < 4; g++) {
    const ga = g * PI / 2, ux = Math.cos(ga), uz = Math.sin(ga), ry = -ga - PI / 2;
    put(stone, BOX, M(ux * CR, 6.6, uz * CR, ry, 10.8, 2, 2.6), WH, 2, .4);
    put(paint, BOX, M(ux * CR, 5.85, uz * CR, ry, 10.9, .4, 2.7), BL);
    [-1, 1].forEach(s => put(paint, CYL, M(ux * (CR + s * 1.35), 6.7, uz * (CR + s * 1.35), ry, 1, .16, 1, PI / 2), GO));
    put(paint, BOX, M(ux * 32.9, .03, uz * 32.9, ry, 7, .06, 3.4), 0xf1ecde);
    [-1, 1].forEach(s => {
      const a = ga + s * .18, x = Math.cos(a) * CR, z = Math.sin(a) * CR;
      put(stone, new THREE.CylinderGeometry(2.4, 2.6, 10.5, 16), M(x, 5.25, z), WH, 1.5, 2.1);
      put(paint, CYL, M(x, 8.2, z, 0, 2.7, .6, 2.7), BL);
      put(stone, CYL, M(x, 10.75, z, 0, 3, .5, 3), WH, 3.5, .2);
      put(paint, new THREE.ConeGeometry(3.4, 4.2, 16), M(x, 13.1, z), BD);
      put(paint, CYL8, M(x, 16.7, z, 0, .07, 3, .07), GO);
      put(paint, BOX, M(x + .8, 17.6, z, -a, 1.5, .9, .06), 0xffffff);
      [-1, 1].forEach(t => put(glow, BOX, M(x + Math.cos(a) * 2.45 * t, 7, z + Math.sin(a) * 2.45 * t, Math.atan2(Math.cos(a) * t, Math.sin(a) * t), .5, 1.5, .3)));
      cols.push([x, z, 2.9]);
    });
  }

  /* ---------- casas, gremio, farolas y cerezos ---------- */
  const R = rnd(2025), placed = [];
  const okSpot = (x, z, rr) => Math.abs(x) > 7.2 && Math.abs(z) > 7.2 && placed.every(p => Math.hypot(x - p[0], z - p[1]) > rr + p[2] + .4)
    && Math.hypot(x - CITY.guild.x, z - CITY.guild.z) > rr + 6.2;
  const WC = [0xf6f1e4, 0xf3ead6, 0xe9f0fb, 0xfbefe6, 0xf0f5ea], RC = [BL, 0xe8734a, 0x37b5a6, 0x8a6ee8, 0xf2b84b, 0xe05a7a];
  for (let t = 0, n = 0; t < 4000 && n < 30; t++) {
    const a = R() * TAU, d = 16 + R() * 9.3, x = Math.cos(a) * d, z = Math.sin(a) * d;
    const w = 3.6 + R() * 1.6, dp = 3.6 + R() * 1.4, fl = R() < .35 ? 2 : 1, h = 3 + fl * 1.3, rr = Math.max(w, dp) * .56 + .3;
    if (!okSpot(x, z, rr)) continue;
    placed.push([x, z, rr]); cols.push([x, z, rr]); n++;
    const P = M(x, 0, z, Math.atan2(-x, -z)), rh = 1.8 + R() * .8, wc = WC[Math.floor(R() * WC.length)], rc = RC[Math.floor(R() * RC.length)];
    put(paint, BOX, M(0, h / 2, 0, 0, w, h, dp), wc, 1, 1, P);
    put(paint, PYRF, M(0, h + rh / 2, 0, 0, w * 1.3, rh, dp * 1.3), rc, 1, 1, P);
    put(paint, BOX, M(0, .9, dp / 2 + .03, 0, .95, 1.8, .14), 0x7a4a2a, 1, 1, P);
    [-1, 1].forEach(s => {
      put(glow, BOX, M(s * w * .28, h * .62 + (fl - 1) * .2, dp / 2 + .03, 0, .8, .9, .12), 0xffffff, 1, 1, P);
      put(glow, BOX, M(s * (w / 2 + .03), h * .6, 0, 0, .12, .9, .8), 0xffffff, 1, 1, P);
      if (fl == 2) put(glow, BOX, M(s * w * .28, h * .25, dp / 2 + .03, 0, .8, .9, .12), 0xffffff, 1, 1, P);
    });
    if (R() < .5) put(paint, BOX, M(w * .25, h + rh * .45, dp * .15, 0, .5, 1.3, .5), 0xb88a6a, 1, 1, P);
  }
  { /* gremio (el interior llega en v0.9) */
    const gx = CITY.guild.x, gz = CITY.guild.z, P = M(gx, 0, gz, Math.atan2(-gx, -gz));
    put(stone, BOX, M(0, 2.6, 0, 0, 8.4, 5.2, 6.6), WH, 1.7, 1, P);
    put(paint, PYRF, M(0, 7.2, 0, 0, 10, 4, 8.4), BD, 1, 1, P);
    put(paint, BOX, M(0, 1.6, 3.35, 0, 2.2, 3.2, .2), DK, 1, 1, P);
    put(paint, CYL, M(0, 3.2, 3.35, 0, 1.1, .2, 1.1, PI / 2), DK, 1, 1, P);
    put(paint, CYL, M(0, 5, 3.4, 0, .9, .15, .9, PI / 2), GO, 1, 1, P);
    [-1, 1].forEach(s => {
      put(paint, CYL8, M(s * 4.4, 2.8, 3.5, 0, .45, 5.6, .45), 0xe8eefa, 1, 1, P);
      put(paint, CYL8, M(s * 4.4, 6.9, 3.5, 0, .06, 3, .06), GO, 1, 1, P);
      put(paint, BOX, M(s * 4.4 + .6, 7.6, 3.5, 0, 1.2, .8, .05), BL, 1, 1, P);
      put(glow, BOX, M(s * 2.8, 2.8, 3.35, 0, 1, 1.2, .12), 0xffffff, 1, 1, P);
    });
    cols.push([gx, gz, 5.3]); placed.push([gx, gz, 5.3]);
  }
  for (let g = 0; g < 4; g++) { /* farolas en las avenidas */
    const ga = g * PI / 2, ux = Math.cos(ga), uz = Math.sin(ga);
    for (let d = 15; d < 28; d += 6.5) [-4.2, 4.2].forEach(s => {
      const x = ux * d - uz * s, z = uz * d + ux * s;
      put(paint, CYL8, M(x, 1.7, z, 0, .09, 3.4, .09), DK); put(glow, SPH, M(x, 3.55, z, 0, .3, .3, .3));
    });
  }
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + PI / 8; put(paint, CYL8, M(Math.cos(a) * 13.6, 1.7, Math.sin(a) * 13.6, 0, .09, 3.4, .09), DK); put(glow, SPH, M(Math.cos(a) * 13.6, 3.55, Math.sin(a) * 13.6, 0, .3, .3, .3)); }
  for (let t = 0, n = 0; t < 2000 && n < 12; t++) {
    const a = R() * TAU, d = 15 + R() * 12, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (!okSpot(x, z, 1.8)) continue;
    placed.push([x, z, 1.8]); cols.push([x, z, .7]); n++;
    put(paint, CYL8, M(x, 1.2, z, 0, .28, 2.4, .28), 0x8a5a3a);
    put(paint, ICO, M(x, 3.5, z, 0, 2.1, 1.7, 2.1), 0xffb3d1);
    put(paint, ICO, M(x + .9, 3.1, z + .4, 0, 1.2, 1, 1.2), 0xffc9de);
  }

  /* ---------- mallas ---------- */
  const city = new THREE.Group(); scene.add(city);
  const stoneMat = new THREE.MeshToonMaterial({ map: brick, vertexColors: true, gradientMap: gm });
  const paintMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gm });
  const outMat = new THREE.MeshBasicMaterial({ color: 0x1d2447, side: THREE.BackSide });
  [[stone, stoneMat], [paint, paintMat]].forEach(([a, m]) => {
    const g = geoOf(a); city.add(new THREE.Mesh(g, m), new THREE.Mesh(hull(g, .16), outMat));
  });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xcfe6ff });
  city.add(new THREE.Mesh(geoOf(glow), glowMat));
  const groundMat = new THREE.MeshBasicMaterial({ map: gtex });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(GR, 64).rotateX(-PI / 2), groundMat); ground.position.y = .04; city.add(ground);
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshBasicMaterial({ map: portalTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  portal.position.set(0, 3.1, -(TR + 1.2)); city.add(portal);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.7, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff1b0 })); beacon.position.set(0, TOP, 0); city.add(beacon);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(0, TOP, 0); halo.scale.set(14, 14, 1); city.add(halo);

  /* ---------- al construir el mundo: despejar la ciudad y colocar al jugador ---------- */
  const _build = window.build;
  window.build = function (seed) {
    _build(seed);
    for (let i = objs.length - 1; i >= 0; i--) if (Math.hypot(objs[i].x, objs[i].z) < CR + 6) { worldGroup.remove(objs[i].g); objs.splice(i, 1); }
    if (Math.hypot(S.x, S.z) < TR + 2) { S.x = CITY.sx; S.z = CITY.sz; }
  };

  /* ---------- colisiones ---------- */
  function resolve(x, z, ox, oz) {
    for (let it = 0; it < 2; it++) {
      let d = Math.hypot(x, z);
      if (d < TR + 1.3) { if (d < .01) { x = 0; z = -(TR + 1.3); } else { x *= (TR + 1.3) / d; z *= (TR + 1.3) / d; } }
      d = Math.hypot(x, z);
      if (d > CR - 1.6 && d < CR + 1.6) {
        const a = Math.atan2(z, x), q = PI / 2;
        if (Math.abs(a - Math.round(a / q) * q) > .15) { const t = (Math.hypot(ox, oz) < CR ? CR - 1.6 : CR + 1.6) / d; x *= t; z *= t; }
      }
      for (const c of cols) {
        const dx = x - c[0], dz = z - c[1], dd = Math.hypot(dx, dz), rr = c[2] + .4;
        if (dd < rr) { if (dd < .01) { x = c[0] + rr; } else { x = c[0] + dx / dd * rr; z = c[1] + dz / dd * rr; } }
      }
    }
    return [x, z];
  }

  /* ---------- cada frame (se engancha a updVisuals) ---------- */
  const _uv = window.updVisuals;
  let t4 = 0, wasIn = null, doorCd = 0, px = null, pz = null;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    if (px === null || Math.hypot(S.x - px, S.z - pz) > 4) { px = S.x; pz = S.z; }
    const r = resolve(S.x, S.z, px, pz);
    if (r[0] !== S.x || r[1] !== S.z) {
      const dx = r[0] - S.x, dz = r[1] - S.z; S.x = r[0]; S.z = r[1]; dirty = true;
      player.position.x += dx; player.position.z += dz; cam.position.x += dx; cam.position.z += dz;
      cam.lookAt(S.x, player.position.y + 1.3, S.z);
    }
    px = S.x; pz = S.z;
    const d = Math.hypot(S.x, S.z);
    cam.rotateX(Math.max(.2 * Math.min(1, Math.max(0, (d - 24) / 40)), d < 32 ? .14 * (1 - d / 32) : 0));
    const inside = d < CR - 1.2;
    if (wasIn !== null && inside !== wasIn) say(inside ? '🏰 ' + CITY.name + ', ciudad de la ' + CITY.tower + '. Zona segura: aquí no entran los slimes.' : '🌿 Sales de ' + CITY.name + '. Cuidado con los slimes.');
    wasIn = inside;
    doorCd -= dt;
    if (doorCd <= 0 && Math.hypot(S.x - CITY.door.x, S.z - CITY.door.z) < 3) { doorCd = 12; say('🕳️ La puerta de la ' + CITY.tower + ' está sellada… (la mazmorra llega en la v0.8)'); }
    portal.material.opacity = .65 + .25 * Math.sin(now / 420);
    t4 += dt;
    if (t4 > .4) {
      t4 = 0;
      const k = Math.max(0, Math.min(1, .5 + .7 * Math.cos((S.t / CYC) % 1 * TAU))), nf = Math.max(0, Math.min(1, (.55 - k) * 2.5));
      glowMat.color.setHex(0xcfe6ff).lerp(_c.setHex(0xffd37a), nf);
      groundMat.color.setHex(0xffffff).lerp(_c.setHex(0x7d86b8), nf);
      halo.scale.setScalar(10 + 10 * nf); halo.material.opacity = .5 + .5 * nf;
    }
  };
})();
