/* Isekai Online - controles táctiles (v0.16.0): botones compactos en arco, acciones al tocar (multitoque) y correr */
(function () {
  const $ = id => document.getElementById(id);

  /* ---------- DISEÑO: [tamaño, x, y] = centro del botón medido desde la esquina inferior derecha de #ctl ---------- */
  const L = {
    atk: [82, 41, 41],
    jump: [52, 133, 41],
    grab: [50, 192, 38],
    dash: [46, 118, 90],
    spin: [44, 82, 124],
    wave: [44, 36, 136],
    ult: [52, 150, 140],
    heal: [40, 176, 92],
    eat: [40, 205, 138]
  };

  const css = `
#acts{display:none!important}
#joy{width:124px;height:124px;left:calc(env(safe-area-inset-left,0px) + 26px);bottom:calc(env(safe-area-inset-bottom,0px) + 20px);background:radial-gradient(circle,rgba(255,255,255,.3),rgba(255,255,255,.1));border:2px solid rgba(255,255,255,.6);box-shadow:0 3px 12px rgba(0,0,0,.25);transition:box-shadow .12s,border-color .12s}
#joy::after{content:'';position:absolute;left:50%;top:50%;width:81px;height:81px;margin:-41px 0 0 -41px;border-radius:50%;border:2px dashed rgba(255,255,255,.45);pointer-events:none}
#joy.run{border-color:#ffd25e;box-shadow:0 0 16px rgba(255,210,94,.8)}
#joy.run::after{border-color:#ffd25e}
#knob{left:32px;top:32px;width:56px;height:56px;background:radial-gradient(circle at 35% 30%,#fff,rgba(220,230,255,.85));box-shadow:0 2px 8px rgba(0,0,0,.35)}
#joy.run #knob{background:radial-gradient(circle at 35% 30%,#fffbe0,#ffd25e)}
#ctl{position:fixed;z-index:6;right:calc(env(safe-area-inset-right,0px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 6px);width:232px;height:172px;pointer-events:none;transform-origin:100% 100%}
@media (max-height:340px){#ctl{transform:scale(.88)}}
#ctl .cb{position:absolute;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;margin:0;padding:0;line-height:1;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.75);box-shadow:0 3px 8px rgba(0,0,0,.35);transition:transform .08s,opacity .15s;touch-action:none;-webkit-user-select:none;user-select:none;overflow:hidden}
#ctl .cb:active{transform:scale(.9);filter:brightness(1.15)}
#ctl .ic{font-size:var(--ic,22px)}
#ctl .lb{font-size:var(--lb,9px);font-weight:700;letter-spacing:.2px;white-space:nowrap}
#ctl .round{border-radius:50%}
#ctl .atk{background:linear-gradient(160deg,#ff7a63,#d92f50)}
#ctl .heal{background:linear-gradient(160deg,#4fe0a8,#169a72)}
#ctl .eat{background:linear-gradient(160deg,#ffc24f,#ee8a1a)}
#ctl .grab{background:linear-gradient(160deg,#9a85ff,#5a78ff)}
#mbtn{position:fixed;z-index:12;top:calc(env(safe-area-inset-top,0px) + 8px);right:calc(env(safe-area-inset-right,0px) + 12px);width:48px;height:48px;border-radius:50%;font-size:22px;padding:0;background:rgba(20,30,70,.6);border:2px solid rgba(255,255,255,.7)}
#mpan{display:none;position:fixed;z-index:12;top:calc(env(safe-area-inset-top,0px) + 64px);right:calc(env(safe-area-inset-right,0px) + 12px);width:210px;flex-direction:column;gap:6px;padding:10px;border-radius:18px;background:rgba(15,22,55,.88);border:1px solid rgba(255,255,255,.35);box-shadow:0 6px 18px rgba(0,0,0,.4)}
#mpan.on{display:flex}
#mpan .ttl{font-size:12px;opacity:.7;text-align:center}
#mpan .b{position:static!important;display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;font-size:14px;padding:10px 12px;border-radius:12px}
#mpan .b small{font-size:11px;opacity:.85}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* grupo de botones abajo a la derecha */
  const ctl = document.createElement('div'); ctl.id = 'ctl'; document.body.appendChild(ctl);

  /* coloca un botón según la tabla de diseño (combat.js lo usa para sus habilidades) */
  window.ctlAdd = function (el, id) {
    const p = L[id]; if (!p) { ctl.appendChild(el); return; }
    const s = p[0];
    el.style.width = s + 'px'; el.style.height = s + 'px';
    el.style.right = (p[1] - s / 2) + 'px'; el.style.bottom = (p[2] - s / 2) + 'px';
    el.style.setProperty('--ic', Math.round(s * (s > 60 ? .42 : .46)) + 'px');
    el.style.setProperty('--lb', (s >= 50 ? 10 : 8) + 'px');
    ctl.appendChild(el);
  };

  /* al tocar: se activa con pointerdown, así funciona aunque otro dedo esté en el joystick */
  function fast(b) {
    b.addEventListener('click', e => { if (e.isTrusted) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.click(); });
  }
  function round(b, id, ic, lb) {
    if (!b) return;
    b.className = 'b cb round ' + id; b.removeAttribute('style');
    b.innerHTML = '<span class="ic">' + ic + '</span><span class="lb">' + lb + '</span>';
    window.ctlAdd(b, id);
  }
  round($('atk'), 'atk', '⚔️', 'Atacar');
  round($('heal'), 'heal', '🧪', 'Curar');
  round($('eat'), 'eat', '🫐', 'Comer');
  round($('grab'), 'grab', '✋', 'Recoger');
  ['heal', 'eat', 'grab'].forEach(i => fast($(i)));

  /* menú de fabricar y salir */
  const mb = document.createElement('button'); mb.id = 'mbtn'; mb.className = 'b'; mb.textContent = '🎒';
  const pan = document.createElement('div'); pan.id = 'mpan';
  pan.innerHTML = '<div class="ttl">Fabricar</div>';
  const names = { axe: '🪓 Hacha', pick: '⛏️ Pico', fire: '🔥 Fogata' };
  document.querySelectorAll('[data-k]').forEach(b => {
    const cost = (b.innerHTML.split('<br>')[1] || '');
    b.innerHTML = '<span>' + (names[b.dataset.k] || b.dataset.k) + '</span><small>' + cost + '</small>';
    pan.appendChild(b);
    b.addEventListener('click', () => pan.classList.remove('on'));
  });
  const out = $('out');
  if (out) { out.textContent = '⚙️ Salir'; out.removeAttribute('style'); pan.appendChild(out); }
  document.body.appendChild(mb); document.body.appendChild(pan);
  mb.addEventListener('click', () => pan.classList.toggle('on'));
  document.addEventListener('pointerdown', e => { if (e.target !== mb && !pan.contains(e.target)) pan.classList.remove('on'); });

  /* cámara: el dedo sigue girando aunque pase por encima de los botones */
  if (typeof cv !== 'undefined') cv.addEventListener('pointerdown', e => { try { cv.setPointerCapture(e.pointerId); } catch (_) { } });
  /* sin menú de "mantener pulsado" del navegador */
  document.addEventListener('contextmenu', e => e.preventDefault());

  /* etiqueta de la mazmorra: a la izquierda del botón de menú */
  const t = $('dgt');
  if (t && t.parentNode) {
    const l = t.parentNode.style;
    l.left = 'auto'; l.transform = 'none'; l.textAlign = 'right';
    l.right = 'calc(env(safe-area-inset-right,0px) + 70px)';
  }
})();
