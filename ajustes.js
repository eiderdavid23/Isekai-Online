/* Isekai Online - ajustes (v0.17.0): cámara 3ª / 1ª persona y calidad gráfica. Botones dentro del menú 🎒 */
(function () {
  const $ = id => document.getElementById(id);
  const K_CAM = 'isekai_cam', K_Q = 'isekai_q';
  const ld = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const sv = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { } };
  let fp = ld(K_CAM) == '1', low = ld(K_Q) == 'low', fpP = 0;
  const PREF = .65;

  const st = document.createElement('style');
  st.textContent = '#xh{display:none;position:fixed;z-index:5;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 0 0 1.5px rgba(0,0,0,.45);pointer-events:none}';
  document.head.appendChild(st);
  const xh = document.createElement('div'); xh.id = 'xh'; document.body.appendChild(xh);

  /* botones en el menú, antes de "Salir" */
  const pan = $('mpan'), out = $('out');
  function mk(id) {
    const b = document.createElement('button'); b.id = id; b.className = 'b';
    if (pan) { if (out) pan.insertBefore(b, out); else pan.appendChild(b); }
    return b;
  }
  const bc = mk('camb'), bq = mk('qb');
  function label() {
    bc.innerHTML = '<span>📷 Cámara</span><small>' + (fp ? '1ª persona' : '3ª persona') + '</small>';
    bq.innerHTML = '<span>🖥️ Calidad</span><small>' + (low ? 'Baja (rápida)' : 'Alta') + '</small>';
  }
  function setCam(v) {
    fp = v; sv(K_CAM, v ? '1' : '0');
    xh.style.display = fp ? 'block' : 'none';
    if (fp) { fpP = 0; pitch = PREF; } else { player.visible = true; pitch = .3; }
    label(); say('📷 Cámara en ' + (fp ? '1ª persona' : '3ª persona'));
  }
  function setQ(v) {
    low = v; sv(K_Q, v ? 'low' : 'high');
    renderer.setPixelRatio(low ? 1 : Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
    label(); say('🖥️ Calidad ' + (low ? 'baja: más fluido' : 'alta'));
  }
  bc.addEventListener('click', () => { setCam(!fp); pan.classList.remove('on'); });
  bq.addEventListener('click', () => { setQ(!low); pan.classList.remove('on'); });
  addEventListener('keydown', e => { if (e.code == 'KeyV' && !e.repeat) setCam(!fp); });
  label();
  if (low) { renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight); }
  if (fp) { xh.style.display = 'block'; pitch = PREF; }

  /* 1ª persona: el cuerpo mira hacia donde apunta la cámara (antes de que combat.js lea la dirección) */
  const _ue = window.updEnemies;
  window.updEnemies = function (dt, now) {
    if (fp && S && started) player.rotation.y = camYaw;
    if (_ue) _ue(dt, now);
  };
  /* 1ª persona: la cámara va en la cabeza (después de todos los demás efectos) */
  const _uv = window.updVisuals;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!fp || !S || !started) return;
    player.visible = false;
    const d = pitch - PREF; pitch = PREF;
    fpP = Math.max(-1.2, Math.min(1.2, fpP + d * 2));
    const sy = Math.sin(camYaw), cy = Math.cos(camYaw), ca = Math.cos(fpP);
    const px = player.position.x + sy * .25, pz = player.position.z + cy * .25, py = player.position.y + 1.6;
    cam.position.set(px, py, pz);
    cam.lookAt(px + sy * ca * 10, py - Math.sin(fpP) * 10, pz + cy * ca * 10);
  };
})();
