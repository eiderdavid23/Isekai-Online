/* Isekai Online - Arco 3: Lo que Duerme Abajo (v0.14.0): 3 capitulos + jefe El Durmiente (piso 15) */
(function () {
  const CH = window.STORY_CH, FL = window.STORY_FL;
  const DUR = () => (S.dur ? 1 : 0);
  if (CH && !CH.some(c => c.arc == 3)) {
    CH.push(
      {
        arc: 3, n: 1, f: 'orvin', to: 'eldara', g: 12, p: () => S.dmax || 0, base: null, t: 'Alcanza el piso 12 de la mazmorra 🕳️',
        intro: ['Los tres Sellos brillan, pero la Torre sigue temblando. Lo que vimos en las ruinas era una sombra encadenada: el Durmiente.', 'Las cadenas se rompen desde el fondo. Para saber cuánto aguantan, baja hasta el piso 12 y siente la oscuridad.', 'Llévate gelatina y comida de sobra. Cuando vuelvas, cuéntale todo a Eldara.'],
        pend: ['Aún no llegas al piso 12. Sigue bajando; Eldara espera tu informe.'],
        outro: ['¿Piso 12? Tienes los ojos de quien vio algo grande. Dime todo.', 'Entonces es cierto: el Durmiente despierta en el piso 15. La Guardia no puede bajar tan hondo… tú sí.'], val: 400, xp: 15, st: ['fue', 'res'], sn: 12
      },
      {
        arc: 3, n: 2, f: 'eldara', to: 'orvin', g: 1, p: DUR, base: null, t: 'Derrota a El Durmiente en el piso 15 👑',
        intro: ['Baja al piso 15. Allí duerme El Durmiente, encadenado por los Sellos que acabas de despertar.', 'Prepárate bien: sus golpes duelen y tiene mucha vida. Si caes, vuelves a Lumeria y puedes intentarlo de nuevo.'],
        pend: ['El Durmiente te espera en el piso 15 de la mazmorra. Derrótalo y vuelve con Orvin.'],
        outro: ['¿Lo derrotaste? Orvin, ¡el Reencarnado lo logró!', 'Su cadena cayó convertida en polvo de luz. La Torre dejó de temblar.'], val: 900, xp: 30, st: ['fue', 'res', 'des', 'agi', 'mag'], sn: 15
      },
      {
        arc: 3, n: 3, f: 'orvin', to: 'eldara', g: 25, p: () => (S.kills || 0) - S.arc.b, base: () => S.kills || 0, t: 'Derrota 25 monstruos ⚔️',
        intro: ['El Durmiente cayó, pero sus sombras quedaron sueltas por Lumeria y la mazmorra. Se ven más monstruos que nunca.', 'Derrota 25 monstruos para limpiar la zona y luego avisa a Eldara.'],
        pend: ['Aún quedan sombras sueltas. Derrota monstruos y avisa a Eldara.'],
        outro: ['¡La Guardia respira tranquila! Lumeria te lo agradece, Reencarnado.', '📖 Fin del Arco 3: «Lo que Duerme Abajo». Pronto: el mundo online… y nuevos horizontes.'], val: 1500, xp: 50, st: ['fue', 'res', 'des', 'agi', 'mag'], sn: 20, end: true
      }
    );
  }
  if (FL) {
    FL.orvin = ['El Durmiente ya no vigila la Torre. Pero el mundo es grande, Reencarnado…', 'La luz de los Sellos te protege. Descansa, héroe de Lumeria.'];
    FL.eldara = ['La Guardia te debe mucho, héroe de Lumeria.', 'Mientras la Torre brille, las puertas estarán a salvo.'];
  }

  /* detectar la derrota de El Durmiente (piso 15) */
  let lb = null, said = 0;
  const _uv = window.updVisuals;
  window.updVisuals = function (dt, now) {
    if (_uv) _uv(dt, now);
    if (!S || !started) return;
    const b = S.bosses || 0;
    if (lb === null) lb = b;
    if (b > lb) {
      if (window.DGON && window.DG && window.DG.floor == 15 && !S.dur) {
        S.dur = 1; dirty = true;
        say('[Sistema] 👑 ¡El Durmiente cayó! Sus cadenas se vuelven polvo de luz. Vuelve con Orvin o Eldara.');
      }
      lb = b;
    }
    if (window.DGON && window.DG && window.DG.floor == 15 && !said) { said = 1; say('🌑 Piso 15: una enorme sombra encadenada respira en el centro…'); }
    if (!window.DGON) said = 0;
  };
})();
