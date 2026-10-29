/* Isekai Online - controles táctiles rediseñados (v0.8.1) */
(function () {
  const $ = id => document.getElementById(id);
  const css = `
#acts{display:none!important}
#joy{width:124px;height:124px;left:calc(env(safe-area-inset-left,0px) + 26px);bottom:calc(env(safe-area-inset-bottom,0px) + 20px);background:radial-gradient(circle,rgba(255,255,255,.3),rgba(255,255,255,.1));border:2px solid rgba(255,255,255,.6);box-shadow:0 3px 12px rgba(0,0,0,.25)}
#knob{left:32px;top:32px;width:56px;height:56px;background:radial-gradient(circle at 35% 30%,#fff,rgba(220,230,255,.85));box-shadow:0 2px 8px rgba(0,0,0,.35)}
#ctl{position:fixed;z-index:6;right:calc(env(safe-area-inset-right,0px) + 14px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px);width:236px;height:176px;pointer-events:none}
#ctl .cb{position:absolute;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;margin:0;padding:0;line-height:1;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.75);box-shadow:0 4px 10px rgba(0,0,0,.35);transition:transform .08s}
#ctl .cb:active{transform:scale(.9);filter:brightness(1.15)}
#ctl .ic{font-size:26px}
#ctl .lb{font-size:10px;font-weight:700;letter-spacing:.3px}
#ctl .round{border-radius:50%}
#ctl .atk{right:0;bottom:0;width:88px;height:88px;background:linear-gradient(160deg,#ff7a63,#d92f50)}
#ctl .atk .ic{font-size:34px}
#ctl .heal{right:6px;bottom:100px;width:58px;height:58px;background:linear-gradient(160deg,#4fe0a8,#169a72)}
#ctl .eat{right:96px;bottom:70px;width:58px;height:58px;background:linear-gradient(160deg,#ffc24f,#ee8a1a)}
#ctl .grab{right:100px;bottom:6px;width:134px;height:52px;border-radius:26px;font-size:14px;font-weight:700;white-space:nowrap;flex-direction:row;background:linear-gradient(160deg,#9a85ff,#5a78ff)}
#mbtn{position:fixed;z-index:12;top:calc(env(safe-area-inset-top,0px) + 8px);right:calc(env(safe-area-inset-right,0px) + 12px);width:48px;height:48px;border-radius:50%;font-size:22px;padding:0;background:rgba(20,30,70,.6);border:2px solid rgba(255,255,255,.7)}
#mpan{display:none;position:fixed;z-index:12;top:calc(env(safe-area-inset-top,0px) + 64px);right:calc(env(safe-area-inset-right,0px) + 12px);width:210px;flex-direction:column;gap:6px;padding:10px;border-radius:18px;background:rgba(15,22,55,.88);border:1px solid rgba(255,255,255,.35);box-shadow:0 6px 18px rgba(0,0,0,.4)}
#mpan.on{display:flex}
#mpan .ttl{font-size:12px;opacity:.7;text-align:center}
#mpan .b{position:static!important;display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;font-size:14px;padding:10px 12px;border-radius:12px}
#mpan .b small{font-size:11px;opacity:.85}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* botones de acción: grupo abajo a la derecha */
  const ctl = document.createElement('div'); ctl.id = 'ctl'; document.body.appendChild(ctl);
  function round(b, cls, ic, lb) {
    if (!b) return;
    b.className = 'b cb round ' + cls; b.removeAttribute('style');
    b.innerHTML = '<span class="ic">' + ic + '</span><span class="lb">' + lb + '</span>';
    ctl.appendChild(b);
  }
  round($('atk'), 'atk', '⚔️', 'Atacar');
  round($('heal'), 'heal', '🧪', 'Curar (2)');
  round($('eat'), 'eat', '🫐', 'Comer');
  const grab = $('grab');
  if (grab) { grab.className = 'b cb grab'; grab.removeAttribute('style'); ctl.appendChild(grab); }

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

  /* etiqueta de la mazmorra: a la izquierda del botón de menú */
  const t = $('dgt');
  if (t && t.parentNode) {
    const l = t.parentNode.style;
    l.left = 'auto'; l.transform = 'none'; l.textAlign = 'right';
    l.right = 'calc(env(safe-area-inset-right,0px) + 70px)';
  }
})();
