import re, sys

def rd(f):
    return open(f, encoding='utf-8', newline='').read()

def wr(f, s):
    open(f, 'w', encoding='utf-8', newline='').write(s)

def rep(f, old, new, tag):
    s = rd(f)
    if new in s:
        print('ya estaba', f, tag); return
    if s.count(old) != 1:
        print('FALLO', f, tag, 'coincidencias:', s.count(old)); sys.exit(1)
    wr(f, s.replace(old, new))
    print('OK', f, tag)

def region(f, ini, fin, new, tag):
    s = rd(f)
    if new and new in s:
        print('ya estaba', f, tag); return
    a = s.find(ini)
    if a < 0 and not new:
        print('ya estaba', f, tag); return
    b = s.find(fin, a + 1) if a >= 0 else -1
    if a < 0 or b < 0 or s.count(ini) != 1:
        print('FALLO', f, tag); sys.exit(1)
    wr(f, s[:a] + new + s[b:])
    print('OK', f, tag)

# ---------- index.html: correr con el joystick ----------
rep('index.html', "let jx=0,jy=0,jid=null;", "let jx=0,jy=0,jid=null;const RUN_T=.78;", 'RUN_T')
rep('index.html', "const mag=Math.hypot(jx,jy);let moving=false;", "const mag=Math.hypot(jx,jy);let moving=false;window.RUN=false;", 'RUN=false')
rep('index.html',
    "const l=Math.hypot(mx,mz)||1,sp=(5.5+Math.min(2,((S.st&&S.st.agi)||0)/250))*Math.min(1,mag);",
    "const l=Math.hypot(mx,mz)||1,ag=Math.min(2,((S.st&&S.st.agi)||0)/250),run=mag>=RUN_T,sp=run?7.2+ag:(3.4+ag*.5)*Math.max(.4,mag/RUN_T);window.RUN=run;",
    'velocidad')
rep('index.html', "if(moving)walk+=dt*10;", "if(moving)walk+=dt*(window.RUN?15:10);", 'walk')
rep('index.html',
    "$('grab').textContent='✋ Recolectar'+(o?' '+({T:'🌲',R:'🪨',B:'🫐'})[o.type]:'');",
    "$('grab').innerHTML='<span class=\"ic\">'+(o?({T:'🌲',R:'🪨',B:'🫐'})[o.type]:'✋')+'</span><span class=\"lb\">Recoger</span>';$('grab').style.opacity=o?1:.6;",
    'grab')
h = rd('index.html')
h2 = re.sub(r"const VERSION='[0-9.]+'", "const VERSION='0.16.0'", h)
if h2.count("const VERSION='0.16.0'") != 1:
    print('FALLO version'); sys.exit(1)
wr('index.html', h2); print('OK version index.html')
wr('version.json', '{"version":"0.16.0"}\n'); print('OK version.json')

# ---------- visuals.js: animación de carrera ----------
rep('visuals.js', "wph += dt * 10 * amp;", "wph += dt * (window.RUN ? 15 : 8.5) * amp;", 'wph')
rep('visuals.js', "const swg = Math.sin(wph) * .7 * amp;", "const swg = Math.sin(wph) * (window.RUN ? .95 : .7) * amp;", 'swg')

# ---------- combat.js: botones en #ctl, ataque continuo, correr ----------
rep('combat.js', '(v0.15.0)', '(v0.16.0)', 'version')
region('combat.js', '#skl{position:fixed', '#skn{display:none', '', 'css skl')
rep('combat.js', "const box = document.createElement('div'); box.id = 'skl'; document.body.appendChild(box);",
    "const box = $('ctl') || document.body;", 'box')
rep('combat.js', "const BT = {};", "const BT = {}; const joyEl = $('joy');", 'joyEl')

NUEVO = """  function mkb(id, ic, lb, bg, fn) {
    const e = document.createElement('button');
    e.className = 'b cb round skb'; e.style.background = bg; e.style.display = 'none';
    e.innerHTML = '<span class="ic">' + ic + '</span><span class="lb">' + lb + '</span>';
    e.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); fn(); });
    if (window.ctlAdd) window.ctlAdd(e, id); else box.appendChild(e);
    BT[id] = { e, lb: e.querySelector('.lb'), n: lb };
  }
  mkb('jump', '⬆️', 'Salto', 'linear-gradient(160deg,#8fd0ff,#4a78ff)', () => { qJump = true; });
  mkb('dash', '💨', 'Dash', 'linear-gradient(160deg,#b9f0ff,#3fb6d9)', () => { qDash = true; });
  mkb('spin', '🌀', 'Giro', 'linear-gradient(160deg,#9af0c8,#1aa57a)', () => { qSpin = true; });
  mkb('wave', '🌙', 'Onda', 'linear-gradient(160deg,#c9b8ff,#7a5cff)', () => { qWave = true; });
  mkb('ult', '🌟', 'Corte', 'linear-gradient(160deg,#ffe27a,#ff6a8a)', () => { qUlt = true; });
  /* Atacar: se activa al tocar (aunque otro dedo esté en el joystick) y repite el combo mientras lo mantienes */
  const atkBtn = $('atk');
  let attHeld = false, attPtr = null, bufAtk = 0;
  const legacyHit = () => { if (atkBtn) atkBtn.click(); };
  if (atkBtn) {
    atkBtn.addEventListener('click', e => { if (e.isTrusted) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    atkBtn.addEventListener('pointerdown', e => {
      e.preventDefault(); attPtr = e.pointerId; attHeld = true; qAtk = true;
      try { atkBtn.setPointerCapture(e.pointerId); } catch (_) { }
    });
    const rel = e => { if (e.pointerId === attPtr) { attHeld = false; attPtr = null; } };
    atkBtn.addEventListener('pointerup', rel); atkBtn.addEventListener('pointercancel', rel); atkBtn.addEventListener('lostpointercapture', rel);
  }
"""
region('combat.js', '  function mkb(', "  addEventListener('keydown'", NUEVO, 'botones')

ATK_OLD = """    if (qAtk) {
      qAtk = false;
      if (S.hp > 0 && acd <= 0 && !(sk.on && sk.id == 'ult')) {
        if (air && has('plunge') && !plunge && !sk.on) startPlunge(); else if (!sk.on && !plunge) startAtk();
      }
    }
"""
ATK_NEW = """    if (qAtk) { qAtk = false; bufAtk = .5; }
    bufAtk = Math.max(0, bufAtk - dt);
    /* ataque continuo: lo tocado se guarda .5 s (aunque estés en una habilidad) y mantener pulsado repite el combo */
    if (S.hp > 0 && acd <= 0 && !sk.on && !plunge && (bufAtk > 0 || (attHeld && !air))) {
      bufAtk = 0; legacyHit(); fy0 = player.rotation.y;
      if (air && has('plunge')) startPlunge(); else startAtk();
    }
"""
rep('combat.js', ATK_OLD, ATK_NEW, 'ataque continuo')
rep('combat.js', "checkUnlock(); banner(dt);", "checkUnlock(); banner(dt); joyEl.classList.toggle('run', !!window.RUN);", 'joy run')
rep('combat.js', "let lt = Math.hypot(jx, jy) > .1 ? .1 : 0;", "let lt = Math.hypot(jx, jy) > .1 ? (window.RUN ? .26 : .1) : 0;", 'inclinacion')

# ---------- CONTEXTO.md ----------
c = rd('CONTEXTO.md')
if 'v0.16.0' in c:
    print('ya estaba CONTEXTO.md')
else:
    out = []
    for ln in c.split('\n'):
        if ln.startswith('- `controls.js`'):
            ln = ("- `controls.js`: controles tactiles (v0.16.0). Tabla de diseno `L` arriba del archivo: [tamano, x, y] de cada boton (centro medido desde la esquina inferior derecha de #ctl). "
                  "Expone `window.ctlAdd(el, id)` (combat.js lo usa para colocar sus habilidades). Atacar, Curar, Comer y Recoger se activan con pointerdown (funcionan con otro dedo en el joystick; el click real se bloquea para no duplicar). "
                  "Menu 🎒 con Fabricar y Salir. Anillo punteado en el joystick = umbral de correr. Va despues de enemies.js y dungeon.js.")
        if ln.startswith('- `combat.js`'):
            ln = ln.replace('(botones en #skl)', '(botones en #ctl)') + (" v0.16.0: botones en #ctl (ya no existe #skl); ataque continuo (mantener Atacar repite el combo, tocar durante una habilidad se guarda 0.5 s); correr = empujar el joystick a fondo (mag >= RUN_T=.78 en index.html, window.RUN), andar = menos de eso.")
        out.append(ln)
        if ln.startswith('9. Si hay dudas'):
            out.append("10. **Archivos o parches largos (mas de ~80 lineas): dividir en partes.** Parte 1 con `cat > archivo << 'EOF'` y las siguientes con `cat >> archivo << 'EOF'`; despues de cada parte, `wc -l archivo` diciendo cuantas lineas deben salir. Si un pegado se corta, reescribir el archivo completo.")
            out.append("11. Para cambios en varios archivos grandes, preferir un script `parche_vX.py` (en partes si es largo) que haga los reemplazos con verificacion, en vez de muchos `sed`.")
        if ln.startswith('- [x] v0.15.0'):
            out.append("- [x] v0.16.0: controles rediseñados (botones compactos en arco abajo a la derecha, tabla L en controls.js), correr con el joystick (anillo punteado, window.RUN), ataque continuo (mantener Atacar, buffer durante habilidades, botones por pointerdown para multitoque)")
    wr('CONTEXTO.md', '\n'.join(out)); print('OK CONTEXTO.md')
