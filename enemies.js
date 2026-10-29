/* Isekai Online - enemigos y combate (slimes) */
(function () {
  const SL = [];
  let spT = 0, atkCd = 0, tk = 0;
  const SG = new THREE.SphereGeometry(.6, 10, 8);
  const EG = new THREE.SphereGeometry(.07, 6, 6);
  const EM = new THREE.MeshBasicMaterial({ color: 0x1b1442 });
  const COLORS = [0x6fe08a, 0x6fd6e0, 0xa6e06f];

  const hurtEl = document.createElement('div');
  hurtEl.style.cssText = 'position:fixed;inset:0;z-index:6;background:rgba(255,0,0,.35);opacity:0;transition:opacity .25s;pointer-events:none';
  document.body.appendChild(hurtEl);

  const foodEl = document.getElementById('food');
  foodEl.parentNode.style.whiteSpace = 'nowrap';
  foodEl.parentNode.insertAdjacentHTML('beforeend', ' 🧪<b id="gel">0</b>');
  const gelEl = document.getElementById('gel');
  function showGel() { if (S) gelEl.textContent = S.gel || 0; }

  function dayK() {
    const ph = (S.t / CYC) % 1;
    return Math.max(0, Math.min(1, .5 + .7 * Math.cos(ph * 6.2832)));
  }

  function spawn() {
    for (let t = 0; t < 10; t++) {
      const a = Math.random() * 6.2832, d = 22 + Math.random() * 22;
      const x = S.x + Math.cos(a) * d, z = S.z + Math.sin(a) * d;
      if (Math.hypot(x, z) > R - 2 || Math.hypot(x, z) < 40 || H(x, z) < -1.4) continue;
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      const m = toon(c);
      const g = new THREE.Group();
      const b = new THREE.Mesh(SG, m); b.scale.y = .8; b.position.y = .5;
      const e1 = new THREE.Mesh(EG, EM); e1.position.set(-.2, .62, .52);
      const e2 = new THREE.Mesh(EG, EM); e2.position.set(.2, .62, .52);
      g.add(b, e1, e2);
      g.position.set(x, H(x, z), z);
      scene.add(g);
      if(window.outlineGroup)outlineGroup(g);
      const hp = 24 + S.lv * 3;
      SL.push({ g, m, c, x, z, hp, wa: Math.random() * 6.28, ph: Math.random() * 6.28, cd: .5, fl: 0 });
      return;
    }
  }

  function hurt(n) {
    S.hp -= n; dirty = true;
    hurtEl.style.opacity = 1;
    setTimeout(() => { hurtEl.style.opacity = 0; }, 120);
    say('💢 Un slime te golpea (-' + n + ')');
  }

  function kill(e) {
    scene.remove(e.g);
    const i = SL.indexOf(e); if (i >= 0) SL.splice(i, 1);
    S.gel = (S.gel || 0) + 1;
    S.kills = (S.kills || 0) + 1;
    let m = '🟢 ¡Slime derrotado! +1 🧪 gelatina';
    if (Math.random() < .4) { S.food += 1; m += ' y +1 🫐'; }
    gain(); gain(); hud(); showGel(); say(m); dirty = true;
  }

  function attack() {
    if (!started || S.hp <= 0 || atkCd > 0) return;
    atkCd = .45;
    player.scale.setScalar(1.15);
    setTimeout(() => player.scale.setScalar(1), 100);
    let best = null, bd = 3.4;
    SL.forEach(e => { const d = Math.hypot(e.x - S.x, e.z - S.z); if (d < bd) { bd = d; best = e; } });
    if (!best) { say('⚔️ Atacas al aire…'); return; }
    player.rotation.y = Math.atan2(best.x - S.x, best.z - S.z);
    const dmg = 8 + S.lv * 2 + (S.axe ? 5 : 0) + Math.floor(Math.random() * 4);
    best.hp -= dmg; best.fl = .12; best.m.color.setHex(0xffffff);
    const d = Math.hypot(best.x - S.x, best.z - S.z) || 1;
    const nx = best.x + (best.x - S.x) / d * .8, nz = best.z + (best.z - S.z) / d * .8;
    if (H(nx, nz) > -1.6) { best.x = nx; best.z = nz; }
    if (best.hp <= 0) kill(best); else say('⚔️ -' + dmg + ' al slime');
  }

  function heal() {
    if (!started) return;
    if ((S.gel || 0) < 2) { say('Necesitas 2 🧪 gelatina para curarte.'); return; }
    if (S.hp >= 100) { say('Ya tienes la vida llena.'); return; }
    S.gel -= 2; S.hp = Math.min(100, S.hp + 35);
    say('🧪 Te curas +35 de vida.'); hud(); showGel(); dirty = true;
  }

  /* botones */
  const acts = document.getElementById('acts');
  const grab = document.getElementById('grab');
  const atk = document.createElement('button');
  atk.className = 'b'; atk.id = 'atk'; atk.textContent = '⚔️ Atacar';
  atk.style.cssText = 'font-size:17px;padding:14px 18px;background:rgba(220,60,70,.92)';
  const hl = document.createElement('button');
  hl.className = 'b'; hl.id = 'heal'; hl.textContent = '🧪 Curar (2)';
  const row = document.createElement('div'); row.className = 'row';
  acts.insertBefore(hl, grab);
  acts.insertBefore(row, grab);
  row.appendChild(atk); row.appendChild(grab);
  atk.onclick = attack; hl.onclick = heal;

  /* se llama en cada frame desde el bucle principal */
  window.updEnemies = function (dt, now) {
    if (!S || !started) return;
    const k = dayK(), maxN = Math.round(5 + 7 * (1 - k));
    spT += dt;
    if (spT > 2.5) { spT = 0; if (SL.length < maxN) spawn(); }
    atkCd = Math.max(0, atkCd - dt);
    const safe = nearFire();
    for (let i = SL.length - 1; i >= 0; i--) {
      const e = SL[i], dx = S.x - e.x, dz = S.z - e.z, d = Math.hypot(dx, dz) || .01;
      if (d > 70) { scene.remove(e.g); SL.splice(i, 1); continue; }
      const px = e.x, pz = e.z;
      if (d < 12 && S.hp > 0) {
        const sp = 2.4 + (1 - k) * .8, stop = safe ? 3.5 : 1.3;
        if (d > stop) { e.x += dx / d * sp * dt; e.z += dz / d * sp * dt; }
        else if (!safe) { e.cd -= dt; if (e.cd <= 0) { e.cd = 1.1; hurt(5 + Math.floor(S.lv / 3)); } }
        e.g.rotation.y = Math.atan2(dx, dz);
      } else {
        e.wa += (Math.random() - .5) * dt * 3;
        e.x += Math.cos(e.wa) * .6 * dt; e.z += Math.sin(e.wa) * .6 * dt;
      }
      if (H(e.x, e.z) < -1.6 || Math.hypot(e.x, e.z) > R || Math.hypot(e.x, e.z) < 36) { e.x = px; e.z = pz; e.wa += 2; }
      const b = Math.sin(now / 200 + e.ph);
      e.g.position.set(e.x, H(e.x, e.z), e.z);
      e.g.scale.set(1 + b * .06, 1 - b * .06, 1 + b * .06);
      if (e.fl > 0) { e.fl -= dt; if (e.fl <= 0) e.m.color.setHex(e.c); }
    }
    tk += dt; if (tk > .5) { tk = 0; showGel(); }
  };
})();
