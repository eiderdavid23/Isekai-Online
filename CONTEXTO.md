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
- **Mundo procedural:** siempre hay algo nuevo por explorar (mundo generado por semilla, igual en todos los dispositivos de la cuenta).
- **Look:** 3D estilizado tipo anime isekai (cel-shading, cielo grande, colores vivos, ciclo día/noche).

## 3. Reglas de trabajo (importante)
1. **El usuario trabaja desde el teléfono con Termux.** Nada de pasos que requieran PC.
2. **Respuestas cortas y claras**, fáciles de leer en pantalla pequeña.
3. **El código se entrega SIEMPRE en bloques para copiar y pegar en Termux** con `cat > archivo << 'EOF'` ... `EOF`, archivos completos.
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
- Repo en GitHub (privado): **Isekai-Online**. Archivos creados con Termux (cat/EOF) y subidos con git add, commit, push.
- Base de datos y cuentas: **Supabase (plan gratis)**. URL del proyecto: https://hjyzemewygrornzmmmzx.supabase.co (la clave publishable está en index.html; NUNCA compartir la service_role ni la contraseña de la BD).
- Tabla `saves` (user_id, data jsonb, updated_at) con RLS: cada jugador solo ve y edita su partida.
- Guardado: nube (Supabase) si hay cuenta; localStorage si se juega como invitado.
- Hosting gratis: Cloudflare Pages o Netlify conectado al repo (pendiente de configurar).
- APK: envoltorio (Capacitor/WebView) compilado con GitHub Actions; carga el juego desde el hosting, así se actualiza con cada push. Aviso de versión nueva con version.json.
- Primero PWA (app instalable) y después la APK.

## 6. Registro de progreso

### ✅ HECHO
- [x] Definir la idea general del juego
- [x] Crear este CONTEXTO.md con reglas de trabajo
- [x] Crear el repo en GitHub (Isekai-Online)
- [x] index.html v0.1 y v0.2 (versión 2D: recolección, hambre, nivel, crafteo, guardado local)
- [x] Crear el proyecto en Supabase
- [x] index.html v0.3 (3D): terreno, cielo con día/noche, personaje, joystick y cámara, árboles/rocas/bayas, recolección, hambre, vida, nivel, crafteo (hacha, pico, fogata), login con Supabase, guardado en la nube, aviso de nueva versión

### 🔧 EN CURSO
- [ ] Confirmar que la tabla `saves` está creada en Supabase (SQL ejecutado) y desactivar "Confirm email" para pruebas
- [ ] Subir v0.3 al repo y probarla en el teléfono

### 📋 PENDIENTE
- [ ] Optimizar rendimiento si va lento (instancing de árboles y rocas)
- [ ] Publicar en Cloudflare Pages o Netlify
- [ ] PWA (instalable, con ícono)
- [ ] APK con GitHub Actions
- [ ] Mejorar estética anime: contornos, nubes, estrellas, flores, agua animada
- [ ] Enemigos y combate básico
- [ ] Misiones y primer arco de historia (Fase 2)
- [ ] Online en tiempo real (Fase 4)

## 7. Notas para el siguiente chat
- Los objetos del mundo se generan con la semilla guardada en la partida; los recolectados se guardan por id en `got`.
