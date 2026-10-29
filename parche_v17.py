import re, sys

def rd(f):
    return open(f, encoding='utf-8', newline='').read()

def wr(f, s):
    open(f, 'w', encoding='utf-8', newline='').write(s)

h = rd('index.html')
if 'ajustes.js' not in h:
    mk = '<script src="combat.js"></script>\n'
    if h.count(mk) != 1:
        print('FALLO: no encuentro combat.js en index.html'); sys.exit(1)
    h = h.replace(mk, mk + '<script src="ajustes.js"></script>\n')
    print('OK script ajustes.js')
else:
    print('ya estaba script ajustes.js')
h2 = re.sub(r"const VERSION='[0-9.]+'", "const VERSION='0.17.0'", h)
if h2.count("const VERSION='0.17.0'") != 1:
    print('FALLO version'); sys.exit(1)
wr('index.html', h2); print('OK version index.html')
wr('version.json', '{"version":"0.17.0"}\n'); print('OK version.json')

c = rd('CONTEXTO.md')
if 'ajustes.js' in c:
    print('ya estaba CONTEXTO.md')
else:
    out = []
    for ln in c.split('\n'):
        out.append(ln)
        if ln.startswith('- `combat.js`'):
            out.append("- `ajustes.js`: ajustes dentro del menu 🎒 (v0.17.0). Camara 3a/1a persona (boton 📷, tecla V; guarda en localStorage `isekai_cam`; en 1a persona oculta el cuerpo, pone la camara en la cabeza y muestra una mira; envuelve updEnemies para girar el cuerpo hacia camYaw y updVisuals para colocar la camara al final). Calidad alta/baja (boton 🖥️, `isekai_q`; baja = pixelRatio 1). Va despues de combat.js.")
        if ln.startswith('- [x] v0.16.0'):
            out.append("- [x] v0.17.0: ajustes (ajustes.js): camara en 1a persona o 3a persona y calidad grafica alta/baja, desde el menu 🎒")
    wr('CONTEXTO.md', '\n'.join(out)); print('OK CONTEXTO.md')
