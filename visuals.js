/* Isekai Online - estilo anime (v0.6.0) */
(function () {
  const OUT = new THREE.MeshBasicMaterial({ color: 0x140c2e, side: THREE.BackSide });
  const tmpC = new THREE.Color(), ccol = new THREE.Color();
  const dir = new THREE.Vector3(), ld = new THREE.Vector3();

  function mk(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    return new THREE.CanvasTexture(c);
  }
  function seeded(s) {
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- contornos ---------- */
  function outlineGroup(g, k) {
    k = k || 1.07;
    const list = [];
    g.traverse(m => {
      if (m.isMesh && m.material && m.material.isMeshToonMaterial && !m.userData.noOutline) list.push(m);
    });
    list.forEach(m => {
      const o = new THREE.Mesh(m.geometry, OUT);
      o.position.copy(m.position); o.quaternion.copy(m.quaternion);
      o.scale.copy(m.scale).multiplyScalar(k);
      o.userData.noOutline = true;
      m.parent.add(o);
    });
  }
  window.outlineGroup = outlineGroup;

  /* ---------- árboles redondos ---------- */
  function merge(list) {
    let n = 0; list.forEach(g => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3); let o = 0;
    list.forEach(g => {
      P.set(g.attributes.position.array, o * 3);
      N.set(g.attributes.normal.array, o * 3);
      o += g.attributes.position.count;
    });
    const r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.BufferAttribute(P, 3));
    r.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    return r;
  }
  function blob(r, x, y, z) { const g = new THREE.IcosahedronGeometry(r, 1); g.translate(x, y, z); return g; }
  const crownGeo = merge([blob(1.25, 0, 0, 0), blob(.85, .8, -.35, .3), blob(.8, -.75, -.3, -.25), blob(.7, .1, .6, -.5)]);
  const crownMats = [0x52c26e, 0x7ae08a, 0x44b86a, 0xffb3d1, 0xffc85a].map(c => toon(c));

  function decorateTrees() {
    objs.forEach(o => {
      if (o.type !== 'T' || o.dec) return;
      const g = o.g;
      g.children.slice(1).forEach(k => g.remove(k));
      const v = (o.id * 37) % 20, mi = v < 9 ? 0 : v < 14 ? 1 : v < 17 ? 2 : v < 19 ? 3 : 4;
      const c = new THREE.Mesh(crownGeo, crownMats[mi]);
      c.position.y = 2.6; g.add(c); o.dec = true;
    });
  }
  const _build = window.build;
  if (typeof _build === 'function') {
    window.build = function (seed) { _build(seed); decorateTrees(); };
  }
  if (typeof started !== 'undefined' && started) decorateTrees();

  /* ---------- hierba y flores ---------- */
  (function scatter() {
    const r = seeded(777);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const sc = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();

    const gg = new THREE.ConeGeometry(.11, .75, 4); gg.translate(0, .375, 0);
    const N = 5200, gi = new THREE.InstancedMesh(gg, toon(0xffffff), N);
    let i = 0, tries = 0;
    while (i < N && tries < N * 4) {
      tries++;
      const x = (r() * 2 - 1) * 96, z = (r() * 2 - 1) * 96, h = H(x, z);
      if (h < -1.3 || Math.hypot(x, z) < 32) continue;
      e.set((r() - .5) * .4, r() * 6.28, (r() - .5) * .4); q.setFromEuler(e);
      const s = .8 + r() * .9;
      sc.set(s, s * (.8 + r() * .7), s); p.set(x, h, z);
      m4.compose(p, q, sc); gi.setMatrixAt(i, m4);
      col.setHSL(.26 + r() * .07, .55 + r() * .15, .46 + r() * .14 + Math.max(0, h) * .015);
      gi.setColorAt(i, col); i++;
    }
    gi.count = i; gi.frustumCulled = false;
    gi.instanceMatrix.needsUpdate = true;
    if (gi.instanceColor) gi.instanceColor.needsUpdate = true;
    scene.add(gi);

    const fg = new THREE.SphereGeometry(.12, 6, 4);
    const FN = 700, fi = new THREE.InstancedMesh(fg, toon(0xffffff), FN);
    const pal = [0xff7ac6, 0xffe45e, 0xffffff, 0x8ab4ff, 0xff9a5e];
    let j = 0; tries = 0;
    while (j < FN && tries < FN * 4) {
      tries++;
      const x = (r() * 2 - 1) * 96, z = (r() * 2 - 1) * 96, h = H(x, z);
      if (h < -1.3 || Math.hypot(x, z) < 32) continue;
      q.identity(); sc.set(1, 1, 1); p.set(x, h + .32, z);
      m4.compose(p, q, sc); fi.setMatrixAt(j, m4);
      col.setHex(pal[Math.floor(r() * pal.length)]); fi.setColorAt(j, col); j++;
    }
    fi.count = j; fi.frustumCulled = false;
    fi.instanceMatrix.needsUpdate = true;
    if (fi.instanceColor) fi.instanceColor.needsUpdate = true;
    scene.add(fi);
  })();

  /* ---------- cielo: sol, luna, nubes, estrellas, luciérnagas ---------- */
  const sunTex = mk(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(.25, 'rgba(255,235,160,.9)');
    g.addColorStop(.5, 'rgba(255,200,120,.25)'); g.addColorStop(1, 'rgba(255,200,120,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  const moonTex = mk(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(235,240,255,1)'); g.addColorStop(.3, 'rgba(210,225,255,.9)');
    g.addColorStop(.5, 'rgba(170,190,255,.25)'); g.addColorStop(1, 'rgba(170,190,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, depthWrite: false, fog: false }));
  sunS.scale.set(70, 70, 1); scene.add(sunS);
  const moonS = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, depthWrite: false, fog: false }));
  moonS.scale.set(40, 40, 1); scene.add(moonS);

  const cloudTex = mk(256, 128, (c, w, h) => {
    for (let i = 0; i < 22; i++) {
      const x = 40 + Math.random() * 176, y = 45 + Math.random() * 40, rr = 18 + Math.random() * 26;
      const g = c.createRadialGradient(x, y, 2, x, y, rr);
      g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    }
  });
  const cloudG = new THREE.Group(); scene.add(cloudG);
  const clouds = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: .9 });
    const s = new THREE.Sprite(m);
    const a = i / 14 * 6.283 + Math.random() * .4, d = 80 + Math.random() * 70;
    s.position.set(Math.cos(a) * d, 42 + Math.random() * 20, Math.sin(a) * d);
    const w = 60 + Math.random() * 50; s.scale.set(w, w * .45, 1);
    cloudG.add(s); clouds.push(m);
  }

  const sp = new Float32Array(450 * 3);
  for (let i = 0; i < 450; i++) {
    const a = Math.random() * 6.283, b = Math.acos(Math.random() * .9 + .05), rr = 250;
    sp[i * 3] = rr * Math.sin(b) * Math.cos(a); sp[i * 3 + 1] = rr * Math.cos(b); sp[i * 3 + 2] = rr * Math.sin(b) * Math.sin(a);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starM = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const stars = new THREE.Points(sg, starM); stars.frustumCulled = false; scene.add(stars);

  const ffTex = mk(32, 32, c => {
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,250,170,1)'); g.addColorStop(.4, 'rgba(255,240,120,.5)'); g.addColorStop(1, 'rgba(255,240,120,0)');
    c.fillStyle = g; c.fillRect(0, 0, 32, 32);
  });
  const FN = 18, ffOff = [], ffArr = new Float32Array(FN * 3);
  for (let i = 0; i < FN; i++) ffOff.push({ x: Math.random() * 30, z: Math.random() * 30, y: .8 + Math.random() * 3, p: Math.random() * 6.28 });
  const ffG = new THREE.BufferGeometry(); ffG.setAttribute('position', new THREE.BufferAttribute(ffArr, 3));
  const ffM = new THREE.PointsMaterial({ map: ffTex, size: 10, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const ff = new THREE.Points(ffG, ffM); ff.frustumCulled = false; scene.add(ff);

  /* ---------- agua con ondas ---------- */
  const wtex = mk(128, 128, (c, w, h) => {
    c.fillStyle = '#b9d9ff'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      [[0, 0], [-w, 0], [0, -h]].forEach(o => {
        c.beginPath(); c.moveTo(x + o[0], y + o[1]);
        c.quadraticCurveTo(x + o[0] + 14, y + o[1] - 6, x + o[0] + 30, y + o[1]); c.stroke();
      });
    }
  });
  wtex.wrapS = wtex.wrapT = THREE.RepeatWrapping; wtex.repeat.set(40, 40);
  water.material.map = wtex; water.material.opacity = .88; water.material.needsUpdate = true;

  /* ---------- viñeta ---------- */
  const vig = document.createElement('div');
  vig.style.cssText = 'position:fixed;inset:0;z-index:4;pointer-events:none;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(15,8,40,.38) 100%)';
  document.body.appendChild(vig);

  /* ---------- personaje anime ---------- */
  let legs, arms, capeG;
  function buildPlayer() {
    while (player.children.length) player.remove(player.children[0]);
    const skin = toon(0xffd9b8), hairM = toon(0xff7ac6), tun = toon(0x4a6cf7), pants = toon(0x2b3a67);
    const boot = toon(0x5a3a22), capeMat = toon(0x7c5cff), metal = toon(0xdfe8ff);
    capeMat.side = THREE.DoubleSide;
    const add = (geo, m, x, y, z, par) => {
      const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); (par || player).add(o); return o;
    };
    legs = [-1, 1].map(s => {
      const l = new THREE.Group(); l.position.set(s * .17, .66, 0); player.add(l);
      add(new THREE.CylinderGeometry(.13, .12, .55, 8), pants, 0, -.3, 0, l);
      add(new THREE.BoxGeometry(.26, .16, .38), boot, 0, -.6, .05, l);
      return l;
    });
    add(new THREE.CylinderGeometry(.3, .36, .7, 10), tun, 0, 1.02, 0);
    add(new THREE.CylinderGeometry(.37, .37, .09, 10), toon(0x8a5a2b), 0, .74, 0);
    arms = [-1, 1].map(s => {
      const a = new THREE.Group(); a.position.set(s * .42, 1.3, 0); player.add(a);
      add(new THREE.CylinderGeometry(.09, .08, .5, 8), tun, 0, -.25, 0, a);
      add(new THREE.SphereGeometry(.09, 8, 6), skin, 0, -.52, 0, a);
      return a;
    });
    add(new THREE.SphereGeometry(.42, 16, 12), skin, 0, 1.78, 0);
    [-1, 1].forEach(s => {
      const e = add(new THREE.SphereGeometry(.09, 10, 8), toon(0x2a1b8a), s * .16, 1.74, .36);
      e.scale.set(1, 1.5, .5);
      const h = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      h.position.set(s * .14, 1.79, .41); player.add(h);
    });
    const cap = add(new THREE.SphereGeometry(.46, 16, 10, 0, 6.283, 0, 1.9), hairM, 0, 1.82, -.03);
    cap.rotation.x = -.3;
    [-.3, -.15, 0, .15, .3].forEach(x => {
      const b = add(new THREE.ConeGeometry(.1, .34, 5), hairM, x, 1.98 - Math.abs(x) * .25, .34 - Math.abs(x) * .3);
      b.rotation.set(Math.PI + .2, 0, -x * .6);
    });
    [-1, 1].forEach(s => {
      const l = add(new THREE.ConeGeometry(.09, .5, 5), hairM, s * .43, 1.55, .05);
      l.rotation.z = Math.PI + s * .12;
    });
    const aho = add(new THREE.ConeGeometry(.045, .38, 5), hairM, .04, 2.32, .05);
    aho.rotation.z = -.5;
    capeG = new THREE.Group(); capeG.position.set(0, 1.35, 0); player.add(capeG);
    const cm = add(new THREE.CylinderGeometry(.34, .5, 1, 10, 1, true, 1.44, 3.4), capeMat, 0, -.35, 0, capeG);
    cm.userData.noOutline = true;
    const sw = new THREE.Group(); sw.position.set(.1, 1.2, -.5); sw.rotation.z = -.7; player.add(sw);
    add(new THREE.BoxGeometry(.09, .95, .025), metal, 0, .15, 0, sw);
    add(new THREE.BoxGeometry(.3, .06, .06), toon(0xffd25e), 0, -.35, 0, sw);
    add(new THREE.CylinderGeometry(.04, .04, .28, 6), toon(0x5a3a22), 0, -.52, 0, sw);
    outlineGroup(player, 1.07);
  }
  buildPlayer();
  pitch = .3;

  /* ---------- actualización por frame ---------- */
  let wph = 0, amp = 0;
  window.updVisuals = function (dt, now) {
    if (!S || !started) return;
    const a = (S.t / CYC) % 1 * 6.2832;
    const k = Math.max(0, Math.min(1, .5 + .7 * Math.cos(a)));
    dir.set(Math.sin(a) * .95, Math.cos(a) * .8, -.35).normalize();
    const cp = cam.position;
    sunS.position.copy(cp).addScaledVector(dir, 230);
    moonS.position.copy(cp).addScaledVector(dir, -230);
    sunS.material.opacity = Math.max(0, Math.min(1, (dir.y + .08) * 6));
    moonS.material.opacity = Math.max(0, Math.min(1, (-dir.y + .08) * 6)) * .95;
    stars.position.copy(cp);
    starM.opacity = Math.max(0, Math.min(1, (.45 - k) * 3));

    const L = dir.y >= 0 ? dir : ld.copy(dir).negate();
    sun.position.copy(L).multiplyScalar(60);
    sun.position.y = Math.max(sun.position.y, 15);
    sun.color.setHex(0xfff2cc).lerp(tmpC.setHex(0x8aa0ff), 1 - k);

    cloudG.position.set(S.x, 0, S.z);
    cloudG.rotation.y += dt * .006;
    const dusk = 1 - Math.abs(2 * k - 1);
    ccol.setHex(0x222a55).lerp(tmpC.setHex(0xffffff), k).lerp(tmpC.setHex(0xffc08a), dusk * .35);
    clouds.forEach(m => m.color.copy(ccol));

    water.material.color.setHex(0x2a3d88).lerp(tmpC.setHex(0x86d4ff), k);
    wtex.offset.x += dt * .015; wtex.offset.y += dt * .01;
    water.position.y = -2 + Math.sin(now / 900) * .05;

    const fo = Math.max(0, Math.min(1, (.6 - k) * 2.2));
    ffM.opacity = fo * .95;
    if (fo > 0) {
      for (let i = 0; i < FN; i++) {
        const f = ffOff[i];
        const ox = f.x + Math.sin(now / 1500 + f.p) * 1.5, oz = f.z + Math.cos(now / 1300 + f.p) * 1.5;
        const dx = (((ox - S.x) % 30) + 45) % 30 - 15, dz = (((oz - S.z) % 30) + 45) % 30 - 15;
        ffArr[i * 3] = S.x + dx;
        ffArr[i * 3 + 1] = H(S.x + dx, S.z + dz) + f.y + Math.sin(now / 700 + f.p) * .4;
        ffArr[i * 3 + 2] = S.z + dz;
      }
      ffG.attributes.position.needsUpdate = true;
    }

    const mv = Math.hypot(jx, jy) > .1 && S.hp > 0;
    amp += ((mv ? 1 : 0) - amp) * Math.min(1, dt * 10);
    wph += dt * (window.RUN ? 15 : 8.5) * amp;
    const swg = Math.sin(wph) * (window.RUN ? .95 : .7) * amp;
    legs[0].rotation.x = swg; legs[1].rotation.x = -swg;
    arms[0].rotation.x = -swg * .8; arms[1].rotation.x = swg * .8;
    capeG.rotation.x = .08 + amp * .3 * (.6 + .4 * Math.sin(wph * 2));
  };
})();
