/* Isekai Online - Bendición de Aluria + Gremio de Lumeria (v0.9.0) */
(function () {
  const $ = id => document.getElementById(id);
  const STATS = [['fue', '💪', 'Fuerza'], ['res', '🛡️', 'Resistencia'], ['des', '🎯', 'Destreza'], ['agi', '⚡', 'Agilidad'], ['mag', '✨', 'Magia']];
  const RANK = 'IHGFEDCBAS', RCOL = ['#9aa3b8', '#8fd0a8', '#6fd0e0', '#6fa8ff', '#9b7bff', '#e07bff', '#ff7ab0', '#ff9a5a', '#ffc84a', '#fff07a'];
  const rk = v => Math.min(9, Math.floor(v / 100));
  const GD = { x: 12.1, z: -12.1 };            /* puerta del gremio (CITY.guild mira al centro) */

  /* ---------- misiones del Sistema ---------- */
  const ORDER = ['wood', 'kills', 'stone', 'craft', 'food', 'floor', 'boss'];
  const QT = {
    wood: { t: q => 'Recolecta ' + q.g + ' madera 🪵', p: q => S.gt.wood - q.b },
    stone: { t: q => 'Recolecta ' + q.g + ' piedra 🪨', p: q => S.gt.stone - q.b },
    food: { t: q => 'Recolecta ' + q.g + ' bayas 🫐', p: q => S.gt.food - q.b },
    kills: { t: q => 'Derrota ' + q.g + ' monstruos ⚔️', p: q => (S.kills || 0) - q.b },
    floor: { t: q => 'Alcanza el piso ' + q.g + ' de la mazmorra 🕳️', p: q => S.dmax || 0 },
    boss: { t: q => 'Derrota ' + (q.g == 1 ? 'a un jefe' : q.g + ' jefes') + ' de la mazmorra 👑', p: q => (S.bosses || 0) - q.b },
    craft: { t: q => 'Fabrica ' + (q.k == 'axe' ? 'el hacha 🪓' : q.k == 'pick' ? 'el pico ⛏️' : 'una fogata 🔥'), p: q => q.k == 'axe' ? (S.axe ? 1 : 0) : q.k == 'pick' ? (S.pick ? 1 : 0) : (S.fires.length > q.b ? 1 : 0) }
  };
  function mkQuest() {
    for (let i = 0; i < 20; i++) {
      const n = S.qn || 0; S.qn = n + 1;
      const ty = ORDER[n % ORDER.length], T = Math.floor(n / ORDER.length);
      if (S.qs.some(q => q.ty == ty)) continue;
      const q = { ty, b: 0, g: 1, xp: 2 + T, val: 15 + 10 * T, k: null };
      if (ty == 'wood') { q.g = 5 + 3 * T; q.b = S.gt.wood; }
      else if (ty == 'stone') { q.g = 4 + 2 * T; q.b = S.gt.stone; }
      else if (ty == 'food') { q.g = 4 + 2 * T; q.b = S.gt.food; }
      else if (ty == 'kills') { q.g = 3 + 2 * T; q.b = S.kills || 0; q.xp += 1; }
      else if (ty == 'floor') { q.g = Math.max(1, (S.dmax || 0) + 1); q.xp += 3; q.val += 20; }
      else if (ty == 'boss') { q.g = 1; q.b = S.bosses || 0; q.xp += 6; q.val += 60; }
      else { q.k = !S.axe ? 'axe' : !S.pick ? 'pick' : 'fire'; q.b = S.fires.length; q.xp += 2; q.val += 10; }
      return q;
    }
    return { ty: 'kills', b: S.kills || 0, g: 5, xp: 3, val: 20, k: null };
  }
  function ensure() {
    if (!S.st) S.st = { fue: 0, res: 0, des: 0, agi: 0, mag: 0 };
    if (!S.gt) S.gt = { wood: 0, stone: 0, food: 0 };
    if (!Array.isArray(S.qs)) S.qs = [];
    if (S.val == null) S.val = 0;
  }
  function receive() {
    ensure(); S.bl = true; S.qs = [];
    while (S.qs.length < 3) S.qs.push(mkQuest());
    dirty = true; say('[Sistema] ✨ Has recibido la Bendición de Aluria. Tus hazañas harán crecer tus habilidades.');
  }
  function claim(i) {
    const q = S.qs[i]; if (!q || QT[q.ty].p(q) < q.g) return;
    for (let k = 0; k < q.xp; k++) gain();
    S.val += q.val; S.qs[i] = mkQuest(); hud(); dirty = true;
    say('[Sistema] ✅ Misión completada: +' + q.val + ' 💰 y +' + q.xp + ' XP.');
  }

  /* ---------- crecimiento por hazañas ---------- */
  let pv = null;
  function add(k, n) {
    const before = rk(S.st[k]); S.st[k] += n;
    const a = rk(S.st[k]);
    if (a > before) { const nm = STATS.find(s => s[0] == k)[2]; say('[Sistema] ✨ ¡Tu ' + nm + ' subió al rango ' + RANK[a] + '!'); }
  }
  function track(dt) {
    const cur = { hp: S.hp, k: S.kills || 0, w: S.wood, s: S.stone, f: S.food, gel: S.gel || 0, fires: S.fires.length, axe: !!S.axe, pick: !!S.pick, dmax: S.dmax || 0, x: S.x, z: S.z };
    if (!pv) { pv = cur; return; }
    if (S.bl) {
      ensure();
      if (cur.hp < pv.hp) add('res', (pv.hp - cur.hp) * .4);
      if (cur.k > pv.k) add('fue', (cur.k - pv.k) * 2.5);
      const dd = Math.hypot(cur.x - pv.x, cur.z - pv.z); if (dd < 3) add('agi', dd * .02);
      [['w', 'wood'], ['s', 'stone'], ['f', 'food']].forEach(([a, nm]) => {
        const d = cur[a] - pv[a];
        if (d > 0) {
          S.gt[nm] += d; add('des', d * .8);
          if (Math.random() < Math.min(.6, S.st.des / 600)) { S[nm] += 1; S.gt[nm] += 1; cur[a] += 1; }
        }
      });
      if (cur.gel < pv.gel) add('mag', 3);
      if (cur.dmax > pv.dmax) add('mag', 6);
      if ((cur.axe && !pv.axe) || (cur.pick && !pv.pick) || cur.fires > pv.fires) add('des', 3);
      if (S.hp < 100 && S.st.res > 0) S.hp = Math.min(100, S.hp + Math.min(1.5, S.st.res / 300) * dt);
    }
    pv = cur;
  }

  /* ---------- ventanas ---------- */
  const st = document.createElement('style');
  st.textContent = `
#gm{display:none;position:fixed;inset:0;z-index:20;align-items:center;justify-content:center;background:rgba(8,12,34,.6);backdrop-filter:blur(3px);padding:8px}
#gm.on{display:flex}
#gc{position:relative;width:min(94vw,560px);max-height:92vh;overflow:auto;padding:14px 16px;border-radius:18px;background:linear-gradient(160deg,#1c2656,#121a40);border:2px solid #ffd25e;box-shadow:0 8px 30px rgba(0,0,0,.5);color:#fff;font-size:13px;touch-action:pan-y}
#gc h3{margin:0 0 8px;font-size:17px;color:#ffd25e}
#gc .x{position:absolute;top:8px;right:10px;width:34px;height:34px;border-radius:50%;font-size:16px;padding:0}
#gc .cols{display:flex;gap:14px;flex-wrap:wrap}
#gc .cols>div{flex:1 1 220px}
.srow{display:flex;align-items:center;gap:8px;margin:5px 0}
.srow .nm{width:92px;font-size:13px}
.srow .rk{width:26px;font-size:22px;font-weight:800;text-align:center;text-shadow:0 0 8px currentColor}
.srow .nu{width:28px;text-align:right;font-weight:700}
.bar2{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.15);overflow:hidden}
.bar2 i{display:block;height:100%;background:linear-gradient(90deg,#6fa8ff,#ffd25e)}
.inf{margin:3px 0;opacity:.92}.inf small{opacity:.7}
.q{margin:7px 0;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.08)}
.q .t{font-weight:700}.q .r{font-size:12px;opacity:.85;margin-top:2px}
.q .row2{display:flex;align-items:center;gap:8px;margin-top:5px}
.q button{padding:7px 12px;font-size:13px}
.q button[disabled]{opacity:.35}
.say{font-style:italic;opacity:.9;margin:6px 0 10px;line-height:1.35}
#ctxb{display:none;position:fixed;z-index:7;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);padding:12px 20px;border-radius:26px;font-size:15px;font-weight:700;background:linear-gradient(160deg,#ffd25e,#ff9a4a);color:#2a1a00;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4)}
`;
  document.head.appendChild(st);
  const gm = document.createElement('div'); gm.id = 'gm'; gm.innerHTML = '<div id="gc"></div>';
  document.body.appendChild(gm);
  const gc = $('gc'); let mode = null;
  const ctxb = document.createElement('button'); ctxb.id = 'ctxb'; ctxb.textContent = '📜 Entrar al Gremio'; document.body.appendChild(ctxb);

  function close() { gm.classList.remove('on'); mode = null; }
  gm.addEventListener('pointerdown', e => { if (e.target === gm) close(); });
  gc.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    const act = a.dataset.a;
    if (act == 'x') close();
    else if (act == 'rec') { receive(); show('bless'); }
    else if (act == 'claim') { claim(+a.dataset.i); render(); }
    else if (act == 'bless') show('bless');
    else if (act == 'guild') show('guild');
  });
  function show(m) { mode = m; gm.classList.add('on'); render(); }
  function bonus(k, v) {
    return k == 'fue' ? '+' + Math.floor(v / 12) + ' de daño' : k == 'res' ? '+' + Math.min(1.5, v / 300).toFixed(2) + ' vida/s' :
      k == 'des' ? Math.round(Math.min(60, v / 6)) + '% recolección extra' : k == 'agi' ? '+' + Math.min(2, v / 250).toFixed(1) + ' velocidad' : '+' + Math.floor(v / 12) + ' a la curación';
  }
  function render() {
    if (!mode) return;
    if (mode == 'bless') {
      ensure();
      const rows = STATS.map(([k, ic, nm]) => {
        const v = S.st[k], r = rk(v);
        return '<div class="srow"><span class="nm">' + ic + ' ' + nm + '</span><span class="rk" style="color:' + RCOL[r] + '">' + RANK[r] + '</span><span class="nu">' + Math.floor(v % 100) + '</span><span class="bar2"><i style="width:' + (v % 100) + '%"></i></span></div>';
      }).join('');
      const bon = STATS.map(([k, ic, nm]) => '<div class="inf"><small>' + ic + ' ' + nm + ':</small> ' + bonus(k, S.st[k]) + '</div>').join('');
      gc.innerHTML = '<button class="b x" data-a="x">✕</button><h3>✨ Bendición de Aluria</h3><div class="cols"><div>' + rows +
        '</div><div><div class="inf">⭐ Nivel <b>' + S.lv + '</b> <small>(' + S.xp + '/' + S.lv * 5 + ' XP)</small></div><div class="inf">💰 Valis: <b>' + S.val + '</b></div><div class="inf">🕳️ Piso máximo: <b>' + (S.dmax || 0) + '</b></div><div class="inf">⚔️ Derrotados: <b>' + (S.kills || 0) + '</b></div>' +
        '<div class="inf" style="margin-top:8px;opacity:.7"><small>Bonos actuales</small></div>' + bon + '</div></div>';
    } else {
      let h = '<button class="b x" data-a="x">✕</button><h3>📜 Gremio de Lumeria</h3>';
      if (!S.bl) {
        h += '<div class="say">Mirelle, la recepcionista: «¡Bienvenido al Gremio de Lumeria! Quienes despiertan sin recuerdos, como tú, son llamados Reencarnados. La diosa Aluria concede su Bendición a quien se atreve a subir la Torre Celeste… ¿la aceptas?»</div><button class="b" data-a="rec" style="width:100%;padding:12px;font-size:15px;background:linear-gradient(160deg,#ffd25e,#ff9a4a);color:#2a1a00">✨ Recibir la Bendición</button>';
      } else {
        ensure();
        h += '<div class="say">Mirelle: «Estas son las misiones del Sistema. Tienes ' + S.val + ' 💰 valis.»</div>';
        S.qs.forEach((q, i) => {
          const p = Math.min(q.g, QT[q.ty].p(q)), ok = p >= q.g;
          h += '<div class="q"><div class="t">' + QT[q.ty].t(q) + '</div><div class="r">Premio: +' + q.val + ' 💰 · +' + q.xp + ' XP</div><div class="row2"><span class="bar2"><i style="width:' + (p / q.g * 100) + '%"></i></span><span>' + p + '/' + q.g + '</span><button class="b" data-a="claim" data-i="' + i + '"' + (ok ? '' : ' disabled') + '>' + (ok ? '🎁 Reclamar' : 'En curso') + '</button></div></div>';
        });
        h += '<button class="b" data-a="bless" style="width:100%;margin-top:6px">✨ Ver mi Bendición</button>';
      }
      gc.innerHTML = h;
    }
  }
  setInterval(() => { if (mode && S) render(); }, 1000);

  /* botón en el menú 🎒 */
  const pan = $('mpan'), out = $('out');
  if (pan) {
    const bb = document.createElement('button'); bb.className = 'b'; bb.textContent = '✨ Bendición';
    bb.addEventListener('click', () => { pan.classList.remove('on'); if (!S || !started) return; if (!S.bl) say('Visita el Gremio de Lumeria para recibir tu Bendición.'); else show('bless'); });
    pan.insertBefore(bb, out || null);
  }
  ctxb.addEventListener('click', () => { if (S && started) show('guild'); });

  /* ---------- cada frame ---------- */
  const _uv = window.updVisuals;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    track(dt);
    const near = !window.DGON && Math.hypot(S.x - GD.x, S.z - GD.z) < 3.6;
    ctxb.style.display = near && !mode ? 'block' : 'none';
    if (!near && mode == 'guild') close();
  };
})();
