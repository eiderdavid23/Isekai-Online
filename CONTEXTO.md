# CONTEXTO — Isekai Online

> Pega este archivo al inicio de cualquier chat nuevo para continuar donde nos quedamos.

## 1. Qué es el proyecto
Un juego de **supervivencia + mundo abierto + historia infinita + online ligero**, con vibra **anime isekai**.
El jugador despierta reencarnado en otro mundo, sin recuerdos, con un "sistema" que le da misiones, stats y habilidades.

**Objetivo del juego:** que entretenga siempre. Nunca se acaba: la historia avanza por arcos/temporadas.

## 2. Pilares de diseño
- **Historia infinita:** arcos narrativos por temporadas, jefes, facciones, misterios del mundo.
- **Supervivencia:** hambre, clima, recolección, crafteo, construir base/aldea.
- **Progresión RPG:** niveles, clases, habilidades que evolucionan, stats visibles.
- **Online ligero:** gremios, comercio, chat, eventos mundiales, mazmorras cooperativas (más adelante).
- **Mundo procedural:** mundo generado por semilla guardada en la partida (igual en todos los dispositivos de la cuenta).
- **Look:** 3D estilizado tipo anime isekai (cel-shading, cielo grande, colores vivos, ciclo día/noche).

## 3. Reglas de trabajo (importante)
1. **El usuario trabaja desde el teléfono con Termux.** Nada de pasos que requieran PC.
2. **Respuestas cortas y claras**, fáciles de leer en pantalla pequeña.
3. **El código se entrega SIEMPRE en bloques para copiar y pegar en Termux** con `cat > archivo << 'EOF'` ... `EOF`. Para cambios muy pequeños en archivos grandes se permite `sed` con verificación.
4. **Cada vez que se termine algo, se marca como HECHO** en la sección 6 y se actualiza este archivo.
5. Al final de cada tarea, entregar el **CONTEXTO.md actualizado** (también en formato cat/EOF).
6. **Todo debe ser gratis** (hosting, base de datos, compilación de la APK).
7. Primero lo simple y jugable; el online (lo más difícil) viene después.
8. Si hay dudas de diseño, proponer una opción recomendada en vez de muchas preguntas.
9. Al sacar una versión nueva, subir el número en `VERSION` de index.html y en `version.json` (así el juego avisa "Nueva versión disponible").

## 4. Plan realista (por fases)
- **Fase 1 — Base jugable:** personaje, mapa, recolección, crafteo, hambre. (en curso, ahora en 3D)
- **Fase 2 — Historia y sistema:** misiones, ventana de stats/"sistema", primer arco de historia.
- **Fase 3 — Mundo vivo:** clima, enemigos, jefes, clases, animales.
- **Fase 4 — Online:** otros jugadores en tiempo real, chat, gremios, comercio, eventos.

## 5. Decisiones tomadas
- Plataforma: **web (HTML/JS) en 3D con Three.js r128**, pensada para programarse y jugarse desde el teléfono.
- Prioridades del usuario (de mayor a menor): 1) gráficos estilo anime, 2) historia y misiones del Sistema, 3) mundo más vivo (aldeas, NPCs, animales, clima), 4) online.
- Código modular: index.html (núcleo) + enemies.js (slimes y combate, IIFE que se engancha con window.updEnemies). Los sistemas nuevos van en archivos .js aparte con IIFE y nombres que no choquen con los globales de index.html.
- Orientación: el juego es HORIZONTAL (landscape): CSS adaptado en index.html, manifest con orientation landscape y APK bloqueada con sensorLandscape en el workflow.
- Repo en GitHub (público, necesario para Pages gratis): **Isekai-Online**. Archivos creados con Termux (cat/EOF) y subidos con git add, commit, push.
- Base de datos y cuentas: **Supabase (plan gratis)**. URL del proyecto: https://hjyzemewygrornzmmmzx.supabase.co (la clave publishable está en index.html; NUNCA compartir la service_role ni la contraseña de la BD).
- Tabla `saves` (user_id, data jsonb, updated_at) con RLS: cada jugador solo ve y edita su partida.
- Guardado: nube (Supabase) si hay cuenta; localStorage si se juega como invitado.
- Hosting gratis: **GitHub Pages** (rama main, carpeta raíz). Link: https://eiderdavid23.github.io/Isekai-Online/ . Cada push publica solo. Si algún día se quiere repo privado o uso comercial, migrar a Cloudflare Pages.
- PWA: manifest.json + sw.js + íconos (instalable desde Chrome). sw.js: red primero para archivos propios, caché para librerías CDN; version.json nunca se cachea.
- APK: envoltorio (Capacitor/WebView) compilado con GitHub Actions; carga el juego desde el hosting, así se actualiza con cada push.
- Firma de la APK: llave fija (alias androiddebugkey) guardada como secreto DEBUG_KEYSTORE_BASE64 en GitHub; el workflow la restaura en ~/.android/debug.keystore. El archivo ~/isekai.keystore vive FUERA del repo; guardar copia de respaldo (si se pierde, hay que reinstalar la APK una vez). NUNCA subirlo al repo.

## 6. Registro de progreso

### ✅ HECHO
- [x] Definir la idea general del juego
- [x] Crear este CONTEXTO.md con reglas de trabajo
- [x] Crear el repo en GitHub (Isekai-Online)
- [x] index.html v0.1 y v0.2 (versión 2D: recolección, hambre, nivel, crafteo, guardado local)
- [x] Crear el proyecto en Supabase
- [x] index.html v0.3 (3D): terreno, cielo con día/noche, personaje, joystick y cámara, árboles/rocas/bayas, recolección, hambre, vida, nivel, crafteo (hacha, pico, fogata), login con Supabase, guardado en la nube, aviso de nueva versión
- [x] Subir v0.3 al repo
- [x] v0.3.1: archivos PWA creados (manifest.json, sw.js, icon-192.png, icon-512.png)
- [x] Archivos de la APK creados: package.json, capacitor.config.json, www/index.html, .gitignore y workflow .github/workflows/apk.yml
- [x] v0.6.0: estilo anime (visuals.js): cámara más baja con horizonte, sol y luna, nubes, estrellas, luciérnagas, árboles redondos de colores, hierba y flores, agua con ondas, personaje anime nuevo animado, contornos, viñeta
- [x] v0.5.0: slimes con IA (patrullan, persiguen, atacan), combate con botón de ataque, gelatina para curarte, fogata como zona segura, más slimes de noche (enemies.js)
- [x] v0.4.0: diseño horizontal (HUD, joystick y botones reacomodados, aviso para girar el teléfono, APK y PWA bloqueadas en horizontal)
- [x] APK con llave fija: secreto DEBUG_KEYSTORE_BASE64 creado y workflow Build APK compilando y publicando en Releases

### 🔧 EN CURSO
- [ ] Subir v0.3.1 y publicar en GitHub Pages
- [ ] Confirmar que la tabla `saves` existe y que login y guardado en la nube funcionan
- [ ] Poner el link de Pages como Site URL en Supabase (Authentication → URL Configuration)
- [ ] Instalar la PWA desde Chrome y probarla
- [ ] Instalar la APK (desinstalar la vieja solo esta vez) y probar login y guardado en la nube

### 📋 PENDIENTE
- [ ] Optimizar rendimiento si va lento (instancing de árboles y rocas)
- [ ] Seguir mejorando el look anime (animales y NPCs con estilo, hierba con viento, efectos de combate, modelos mejores)
- [ ] Más enemigos (lobos, jefe de zona), animales y más drops
- [ ] Misiones y primer arco de historia (Fase 2)
- [ ] Online en tiempo real (Fase 4)

## 7. Notas para el siguiente chat
- Los objetos del mundo se generan con la semilla guardada en la partida; los recolectados se guardan por id en `got`.
- Para probar en local: `python -m http.server 8080` y abrir http://localhost:8080
