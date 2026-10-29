# CONTEXTO — Isekai Online

> Pega este archivo completo al inicio de cualquier chat nuevo. Claude debe leerlo y seguir las secciones 3, 4 y 5 al pie de la letra.

## 0. Cómo usar este archivo
- Es la memoria del proyecto. Al terminar cada tarea, Claude entrega este archivo actualizado (sección 7) en formato cat/EOF.
- Si algo de aquí contradice lo que el usuario pide ahora, manda lo que pide el usuario.

## 1. Qué es el proyecto
Juego de **supervivencia + mundo abierto + historia infinita + online ligero**, con vibra **anime isekai**.
El jugador despierta reencarnado en otro mundo, con un "Sistema" que le da misiones, stats y habilidades.
**Objetivo:** que entretenga siempre. La historia avanza por arcos/temporadas y nunca se acaba.

## 2. Estilo y prioridades
- **Prioridades del usuario (mayor a menor):** 1) gráficos estilo anime, 2) historia y misiones del Sistema, 3) mundo más vivo (aldeas, NPCs, animales, clima, mazmorras), 4) online con otros jugadores.
- **Referencia de estilo: DanMachi** (inspiración, sin copiar nombres ni personajes): paleta clara y luminosa (azul cielo, piedra blanca, luz cálida), ciudad amurallada con una torre gigante en el centro, mazmorra bajo la torre con pisos y monstruos, gremio de aventureros con misiones, y una "bendición" que muestra las estadísticas del jugador (fuerza, resistencia, destreza, agilidad, magia) y sube de nivel por hazañas.
- **Look actual:** 3D estilizado (Three.js, cel-shading), cielo con sol/luna/nubes/estrellas, hierba y flores, personaje anime con contornos, juego en **horizontal**.
- **Pilares:** historia infinita, supervivencia (hambre, fogata, crafteo), progresión RPG, mundo procedural por semilla, online ligero al final.

## 3. Reglas de trabajo (OBLIGATORIAS para Claude)
1. El usuario trabaja **solo desde el teléfono con Termux**. Nada de pasos que requieran PC.
2. Respuestas cortas y claras, en español, para pantalla pequeña. Todo debe ser **gratis**.
3. **Código siempre en bloques para copiar y pegar en Termux**:
   - Archivo nuevo o cambio grande: `cat > archivo << 'EOF'` ... `EOF`, **archivo completo**.
   - Cambio pequeño en un archivo grande: comandos `sed -i` y justo después `grep -c` para verificar, **indicando qué número debe salir**. Si el número no sale, el usuario avisa y se corrige.
   - Cada comando o archivo en su propio bloque de código. No mezclar explicaciones dentro del bloque.
4. Cada entrega termina con: (a) subir el número de versión, (b) actualizar este CONTEXTO (marcar HECHO), (c) `git add .`, `git commit`, `git push`.
5. Después de cada entrega, decir qué probar y esperar la respuesta del usuario. Si algo falla, el usuario manda **capturas** (Actions, Termux, pantalla del juego).
6. Los sistemas nuevos van en **archivos .js propios** dentro de una IIFE, para no engordar index.html y no chocar con las variables globales (ver sección 5).
7. Nunca pedir ni guardar claves secretas (service_role, contraseñas, tokens, la llave isekai.keystore). La clave `sb_publishable` sí es pública y está bien en el código.
8. Antes de afirmar algo sobre precios, límites o planes de servicios, comprobarlo (buscar en la web).
9. Si hay dudas de diseño, proponer una opción recomendada y preguntar una sola cosa a la vez.

## 4. Flujo de publicación
- `git push` a la rama main → **GitHub Pages** publica en 1 a 2 minutos → el juego muestra el aviso "Nueva versión disponible" si el número cambió.
- **Versión:** subir el número en **dos sitios**: `const VERSION='x.y.z';` en index.html y `version.json`. (Si no, el aviso no aparece.)
- La **APK** carga el juego desde Pages, así que **casi nunca se recompila**. Solo si cambia el envoltorio (ícono, nombre, orientación, capacitor.config.json, package.json, www/, o .github/workflows/apk.yml): el push de esos archivos dispara el workflow "Build APK" solo.
- Descargar la APK: https://github.com/eiderdavid23/Isekai-Online/releases/latest/download/Isekai-Online.apk
- Se instala encima de la anterior sin desinstalar, porque se firma con una llave fija.

## 5. Estructura de archivos y cómo se conectan
- `index.html`: núcleo del juego (Three.js r128 + Supabase JS por CDN). Globales que usan los demás archivos: `S` (partida), `scene`, `cam`, `renderer`, `player`, `water`, `objs`, `sun`, `hemi`, `H(x,z)` (altura del terreno), `toon(color)`, `build(seed)`, `hud()`, `say(msg)`, `gain()`, `nearFire()`, `nearest()`, `CYC`, `R`, `jx`, `jy`, `pitch`, `started`, `dirty`. **No redeclarar** estos nombres en otros archivos.
- `enemies.js`: slimes y combate. Se engancha con `window.updEnemies(dt, now)` y crea los botones de atacar y curar.
- `visuals.js`: estilo anime. Se engancha con `window.updVisuals(dt, now)`, expone `window.outlineGroup(grupo)` y envuelve `window.build` para redondear los árboles.
- `city.js`: ciudad Lumeria y Torre Celeste. Exporta `window.CITY` (r=30 muralla, tr=7 torre, sx/sz=punto de inicio, door=entrada de la mazmorra, guild=gremio). Se engancha envolviendo `window.build` y `window.updVisuals`; maneja colisiones con muralla, torre y casas.
- `dungeon.js`: mazmorra. Vive en el mismo x,z que la ciudad pero 300 unidades mas abajo (DY=-300), arena circular de radio 25. Pone `window.DGON=true` dentro (city.js se pausa). Usa el boton Atacar de enemies.js agregando su propio click. Envuelve `window.updVisuals` y `window.die`.
- `controls.js`: reacomoda los botones (mueve los nodos existentes a #ctl y al menu #mpan, no se crean botones nuevos) y activa setPointerCapture en el canvas. Va al final: debe cargar despues de enemies.js y dungeon.js.
- `guild.js`: bendicion (S.st = fue,res,des,agi,mag; rango = letra por cada 100 puntos) y gremio (boton contextual cerca de la puerta del gremio, S.bl = ya recibio la bendicion, S.qs = misiones, S.val = valis, S.gt = totales recolectados). Sube stats comparando S cada frame, sin tocar otros archivos. Efectos: fuerza=dano, agilidad=velocidad, magia=cura (con sed en enemies.js, dungeon.js, index.html); resistencia=regeneracion y destreza=recoleccion extra (dentro de guild.js).
- `story.js`: arco de historia (S.arc = c capitulo, ph fase 0 hablar/1 objetivo, b base). NPCs Orvin (-10,4) y Eldara (0,25, puerta norte) con marcador ! ? y boton Hablar; dialogos por toque; diario arriba a la izquierda. Se engancha a updVisuals y va despues de guild.js.
- `world.js`: animales (conejos wander/huida, boton Atrapar) y clima (lluvia/niebla cada 70-140 s, solo cosmetico). Envuelve updVisuals; va despues de story.js. Cambia scene.fog.near/far cada frame fuera de la mazmorra.
- Orden en index.html antes de `</body>`: enemies.js, visuals.js, city.js, dungeon.js, controls.js, guild.js y luego story.js. En el bucle principal, justo antes de `renderer.render`: `updEnemies` y `updVisuals`.
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`: PWA instalable (horizontal).
- `version.json`: versión actual para el aviso de actualización.
- APK: `package.json`, `capacitor.config.json` (carga la URL de Pages), `www/index.html` (página de respaldo), `.github/workflows/apk.yml`, `.gitignore` (excluye node_modules, android, *.keystore, *.b64).
- **Datos de la partida (S):** seed, x, z, hp, hg, lv, xp, wood, stone, food, gel, kills, axe, pick, t (segundos de juego), got[] (ids de objetos recolectados), fires[]. El mundo se regenera con la semilla (igual en todos los dispositivos); los objetos recolectados se guardan por id.

## 6. Infraestructura (todo gratis)
- **GitHub:** repo `eiderdavid23/Isekai-Online`, **público** (necesario para Pages gratis). Pages en https://eiderdavid23.github.io/Isekai-Online/ (rama main, carpeta raíz). Si algún día se quiere repo privado o uso comercial, migrar a Cloudflare Pages.
- **Supabase:** proyecto https://hjyzemewygrornzmmmzx.supabase.co. Tabla `saves` (user_id, data jsonb, updated_at) con RLS: cada jugador solo ve y edita su partida. Login con correo y contraseña. Para pruebas está desactivado "Confirm email". Site URL = el link de Pages. El plan gratis pausa el proyecto tras una semana sin uso (se reactiva desde el panel).
- **Guardado:** nube si hay cuenta; localStorage si se juega como invitado.
- **APK:** Capacitor 6 compilado con GitHub Actions (Node 20, Java 17), bloqueada en horizontal (sensorLandscape), ícono propio. Firma con llave fija: secreto `DEBUG_KEYSTORE_BASE64` en GitHub (alias androiddebugkey). El archivo `~/isekai.keystore` vive **fuera del repo** y tiene copia de respaldo; si se pierde, hay que reinstalar la APK una vez. Los secretos se crean con `gh secret set`.

## 7. Registro de progreso

### ✅ HECHO
- [x] Idea del juego, repo, CONTEXTO inicial
- [x] v0.1 y v0.2 (2D): recolección, hambre, nivel, crafteo, guardado local
- [x] Proyecto Supabase, tabla `saves`, login y guardado en la nube
- [x] v0.3 (3D): terreno, día/noche, personaje, joystick, cámara, recursos, crafteo, aviso de nueva versión
- [x] v0.3.1: PWA instalable
- [x] Publicación en GitHub Pages
- [x] APK con GitHub Actions y llave fija (instalable encima de la anterior)
- [x] v0.4.0: diseño horizontal (HUD, joystick, botones, aviso para girar el teléfono, APK y PWA bloqueadas)
- [x] v0.5.0: slimes con IA, combate, gelatina para curarte, fogata como zona segura, más slimes de noche (enemies.js)
- [x] v0.6.0: estilo anime (visuals.js): cámara baja con horizonte, sol y luna, nubes, estrellas, luciérnagas, árboles redondos de colores, hierba y flores, agua con ondas, personaje anime animado, contornos, viñeta
- [x] v0.6.1: menos luciérnagas
- [x] v0.7.0: paleta DanMachi (cielo, pasto y arboles claros) + ciudad amurallada Lumeria con la Torre Celeste (city.js): 4 puertas, casas, gremio (solo el edificio), farolas, cerezos, zona segura sin slimes
- [x] v0.8.0: mazmorra bajo la torre (dungeon.js): entras por la puerta azul de la Torre Celeste; pisos infinitos, kobolds y goblins, jefe cada 3 pisos (Rey Goblin, Capitan Kobold, Golem), portal violeta para bajar y dorado para subir; S.dmax guarda el piso maximo
- [x] v0.8.1: controles rediseñados (controls.js): botones redondos abajo a la derecha (Atacar, Recolectar, Curar, Comer), menu 🎒 arriba con Fabricar y Salir, la camara sigue girando aunque el dedo pase sobre los botones
- [x] v0.9.0: Bendicion de Aluria (5 stats con rangos I..S que suben por hazanas) y Gremio de Lumeria con 3 misiones del Sistema, valis y recompensas (guild.js)

### 🔧 EN CURSO
- [x] Adaptar el estilo a DanMachi (paleta, ciudad, mazmorra, bendicion y gremio)
- [ ] Confirmar que la APK horizontal se instala encima de la anterior sin desinstalar

### 📋 PENDIENTE (orden propuesto)
- [x] v0.10.0: Primer arco "El Susurro de la Torre" (story.js): NPCs Orvin y Eldara, 3 capitulos, diario de mision
- [x] v0.11.0: mundo mas vivo (world.js): 22 conejos que huyen y se atrapan con boton Atrapar (+3 comida, S.hunt), clima aleatorio (despejado, lluvia, niebla) con gotas, niebla y filtro gris
- [ ] Mundo más vivo: aldeas y NPCs de aldea (animales y clima ya hechos en v0.11.0)
- [ ] Optimizar rendimiento si hace falta (bajar hierba: const N en visuals.js)
- [ ] Online en tiempo real (al final)

## 8. Notas para el siguiente chat
- El usuario prueba en el teléfono (Chrome, PWA o APK) y reporta cómo se ve y se siente; a veces manda capturas.
- Si el teléfono va lento: bajar `const N = 5200` (hierba) en visuals.js y `FN` (luciérnagas).
- v0.7.0: el terreno es plano hasta radio 34 (funcion H). Puertas en E, N, O, S. La entrada de la mazmorra (v0.8) esta en el lado sur de la torre (CITY.door). El gremio (v0.9) es el edificio azul junto a la plaza (CITY.guild).
- v0.8.0: en la mazmorra S.x,S.z son coordenadas de la arena (no del mundo). Si se guarda dentro, al cargar apareces en la ciudad. Jefes: piso multiplo de 3.
- v0.9.0: nuevos campos de S: st, bl, qs, qn, val, gt, dmax, bosses. Pendiente: tienda con valis, primer arco de historia, NPCs, aldeas, clima, online.
