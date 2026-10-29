import re, sys

def rd(f):
    return open(f, encoding='utf-8', newline='').read()

def wr(f, s):
    open(f, 'w', encoding='utf-8', newline='').write(s)

def ins_end(f, mark, code):
    s = rd(f)
    if mark in s:
        print('ya estaba', f); return
    i = s.rfind('})();')
    if i < 0:
        print('FALLO', f); sys.exit(1)
    wr(f, s[:i] + code + '\n' + s[i:])
    print('OK', f)

ins_end('enemies.js', 'AOE_SL',
"  window.AOE_SL = function (x, z, r, dmg, kb) { let n = 0; SL.slice().forEach(e => { const d = Math.hypot(e.x - x, e.z - z); if (d < r) { n++; if (dmg > 0) { e.hp -= dmg; e.fl = .12; e.m.color.setHex(0xffffff); const k = d || 1, nx = e.x + (e.x - x) / k * kb, nz = e.z + (e.z - z) / k * kb; if (H(nx, nz) > -1.6) { e.x = nx; e.z = nz; } if (e.hp <= 0) kill(e); } } }); return n; };")

ins_end('dungeon.js', 'AOE_DG',
"  window.AOE_DG = function (x, z, r, dmg, kb) { let n = 0; mons.slice().forEach(e => { const d = Math.hypot(e.x - x, e.z - z) - (e.boss ? 1.2 : 0); if (d < r) { n++; if (dmg > 0) { e.hp -= dmg; e.fl = .12; e.mats.forEach(m => m.color.setHex(0xffffff)); const k = Math.hypot(e.x - x, e.z - z) || 1, f = e.boss ? .15 : 1; e.x += (e.x - x) / k * kb * f; e.z += (e.z - z) / k * kb * f; if (e.hp <= 0) kill(e); } } }); return n; };")

ins_end('sellos.js', 'AOE_SS',
"  window.AOE_SS = function (x, z, r, dmg) { let n = 0; if (window.DGON || !act()) return 0; SITE.forEach(s => s.gs.forEach(e => { if (!e.alive) return; if (Math.hypot(e.x - x, e.z - z) < r) { n++; if (dmg > 0) { e.hp -= dmg; e.fl = .12; e.bm.color.setHex(0xffffff); if (e.hp <= 0) kill(e); } } })); return n; };")

h = rd('index.html')
if 'combat.js' not in h:
    i = h.rfind('</body>')
    if i < 0:
        print('FALLO index.html'); sys.exit(1)
    h = h[:i] + '<script src="combat.js"></script>\n' + h[i:]
h2 = re.sub(r"const VERSION='[0-9.]+'", "const VERSION='0.15.0'", h)
if h2.count("const VERSION='0.15.0'") != 1:
    print('FALLO version'); sys.exit(1)
wr('index.html', h2); print('OK index.html')
wr('version.json', '{"version":"0.15.0"}\n'); print('OK version.json')

c = rd('CONTEXTO.md')
if 'combat.js' not in c:
    lines = c.split('\n'); out = []; done1 = done2 = False
    for ln in lines:
        out.append(ln)
        if not done1 and (ln.startswith('- [x] v0.14.0') or (ln.startswith('- [x] v0.13.0') and not any(l.startswith('- [x] v0.14.0') for l in lines))):
            out.append('- [x] v0.15.0: combate animado (combat.js): combo de 3 golpes, salto, dash con esquiva, doble salto, golpe aereo, Torbellino, Onda de espada y Corte Celeste; se desbloquean por nivel (S.skn)'); done1 = True
        if not done2 and (ln.startswith('- `arco3.js`') or (ln.startswith('- `sellos.js`') and not any(l.startswith('- `arco3.js`') for l in lines))):
            out.append('- `combat.js`: animaciones y habilidades (botones en #skl). Usa window.AOE_SL (enemies.js), AOE_DG (dungeon.js) y AOE_SS (sellos.js), agregados por parche_v15.py. Habilidades por nivel: Dash 2, Doble salto 3, Golpe aereo 4, Torbellino 6, Onda 8, Corte Celeste 12. Va al final, despues de arco3.js.'); done2 = True
    wr('CONTEXTO.md', '\n'.join(out)); print('OK CONTEXTO.md')
