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
- **Mundo procedural:** siempre hay algo nuevo por explorar.

## 3. Reglas de trabajo (importante)
1. **El usuario trabaja desde el teléfono con Termux.** Nada de pasos que requieran PC.
2. **Respuestas cortas y claras**, fáciles de leer en pantalla pequeña.
3. **El código se entrega SIEMPRE en bloques para copiar y pegar en Termux** con `cat > archivo << 'EOF'` ... `EOF`, archivos completos.
4. **Cada vez que se termine algo, se marca como HECHO** en la sección 6 y se actualiza este archivo.
5. Al final de cada tarea, entregar el **CONTEXTO.md actualizado** (también en formato cat/EOF).
6. Primero lo simple y jugable; el online (lo más difícil y caro) viene después.
7. Si hay dudas de diseño, proponer una opción recomendada en vez de muchas preguntas.

## 4. Plan realista (por fases)
- **Fase 1 — Base jugable (web 2D, sin online):** personaje, mapa, recolección, crafteo, hambre.
- **Fase 2 — Historia y sistema:** misiones, ventana de stats/"sistema", primer arco de historia.
- **Fase 3 — Mundo vivo:** generación procedural, clima, enemigos, jefes, clases.
- **Fase 4 — Online:** cuentas, chat en tiempo real, gremios, comercio, eventos.

## 5. Decisiones tomadas
- Plataforma inicial: **web (HTML/JS), pensada para jugarse y programarse desde el teléfono**.
- Empezar sin online; añadirlo en la Fase 4.
- Repo en GitHub (privado): **Isekai-Online**
- Archivos creados con Termux (cat/EOF) y subidos con git (add, commit, push).
- Guardado local con localStorage (clave `isekai_save_v1`).

## 6. Registro de progreso

### ✅ HECHO
- [x] Definir la idea general del juego
- [x] Crear este CONTEXTO.md con reglas de trabajo
- [x] Crear el repo en GitHub (Isekai-Online)
- [x] `index.html` v0.1: mapa procedural 60x60, movimiento con botones, recolección (madera, piedra, bayas), hambre, vida, nivel/XP, día, mensajes del "Sistema", reencarnar al morir
- [x] Subir v0.1 al repo con Termux
- [x] `index.html` v0.2: crafteo (hacha, pico, fogata), guardado automático, botón de nueva partida

### 🔧 EN CURSO
- [ ] Subir v0.2 al repo y probar el juego en el navegador

### 📋 PENDIENTE
- [ ] Probar/publicar el juego para jugarlo desde el teléfono (servidor local o GitHub Pages)
- [ ] Enemigos y combate básico
- [ ] Misiones y primer arco de historia (Fase 2)
- [ ] Diseño detallado: mundo, clases, primer arco de historia

## 7. Notas para el siguiente chat
*(Aquí se anota cualquier detalle importante al cerrar cada sesión.)*
