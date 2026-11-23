/**
 * Servicio de evaluación.
 *
 * ESTADO ACTUAL (sin servidor):
 *   1. Lee el texto del .py y lo pasa por el analizador de estructura
 *      (js/analizador.js), que decide si el archivo corresponde a la tarea.
 *   2. Si NO corresponde, los 100 casos fallan (0 %).
 *   3. Si corresponde, los casos se simulan: con el núcleo completo pasan
 *      los 100 casos; sin nada del núcleo (p. ej. la plantilla sin resolver)
 *      no pasa ninguno; en medio, la probabilidad de aprobar cada caso crece
 *      con la parte del núcleo que sí está implementada.
 *      El código del alumno no se ejecuta. El mismo archivo siempre obtiene
 *      la misma calificación (la semilla sale de su contenido).
 *
 * A FUTURO (con servidor): sustituir el cuerpo de `evaluar` por llamadas al
 * servidor que corra las pruebas, por ejemplo:
 *
 *   POST /api/evaluaciones              (multipart: tarea, archivo) → { id }
 *   GET  /api/evaluaciones/{id}/eventos (Server-Sent Events)
 *        → { analisis } y luego { caso, total, aprobado } por cada caso
 *
 * Mientras se respete este contrato, la interfaz (app.js) no cambia:
 *
 *   Evaluador.evaluar({ tarea, archivo, alAnalizar, alProbarCaso, alTerminarCaso })
 *     → Promise<{ aprobados, total, porcentaje, fallidos, dictamen }>
 *
 *   alAnalizar({ analisis, dictamen })    al terminar el análisis del código
 *   alProbarCaso(caso, total)             al iniciar cada caso
 *   alTerminarCaso(caso, total, aprobado) al terminar cada caso
 *
 * FACTORES DE DECISIÓN QUE SE APLICAN AQUÍ (ver README, «Factores»):
 *   [F10] núcleo completo: 100 %; vacío: 0 %; en medio crece con el núcleo
 *   [F11] si el archivo no corresponde a la tarea, los 100 casos fallan
 *   [F12] el mismo archivo siempre obtiene la misma calificación
 */
globalThis.Evaluador = (function () {
  "use strict";

  const TOTAL_CASOS = 100;

  /* Hash FNV-1a de 32 bits: convierte un texto en una semilla numérica. */
  function hash(texto) {
    let h = 0x811c9dc5;
    for (let i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /* Generador pseudoaleatorio mulberry32 (reproducible a partir de la semilla). */
  function generador(semilla) {
    let a = semilla;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function esperar(ms) {
    return new Promise(function (resolver) { setTimeout(resolver, ms); });
  }

  async function evaluar({ tarea, archivo, alAnalizar, alProbarCaso, alTerminarCaso }) {
    const texto = await archivo.text();

    // 1. Análisis de estructura
    await esperar(700);
    const analisis = globalThis.Analizador.analizar(texto, globalThis.TAREAS);
    const dictamen = globalThis.Analizador.dictaminar(analisis, tarea.id);
    if (alAnalizar) alAnalizar({ analisis: analisis, dictamen: dictamen });
    await esperar(600);

    // 2. Casos de prueba (simulados)

    // [F12] La semilla sale de la tarea y del CONTENIDO del archivo (no del
    // nombre ni de la fecha): mismo código → misma calificación.
    const azar = generador(hash(tarea.id + "|" + texto));

    // [F10] Probabilidad de aprobar cada caso:
    //       núcleo = 1 (todos los esenciales) → 1, pasan los 100 casos
    //       núcleo = 0 (nada implementado, p. ej. la plantilla) → 0
    //       en medio → (0.15 + 0.80 × núcleo) × (0.94 a 1.00)
    //         p. ej. núcleo 0.5 → 52 a 55 %; núcleo 0.8 → 74 a 79 %
    // [F11] Si el archivo no corresponde a la tarea, la probabilidad es 0.
    const nucleo = dictamen.elegida.nucleo;
    const probabilidad = !dictamen.coincide || nucleo <= 0 ? 0
      : nucleo >= 1 ? 1
      : (0.15 + 0.8 * nucleo) * (0.94 + 0.06 * azar());

    let aprobados = 0;
    const fallidos = [];
    for (let caso = 1; caso <= TOTAL_CASOS; caso++) {
      if (alProbarCaso) alProbarCaso(caso, TOTAL_CASOS);

      // Un archivo que no corresponde "truena" rápido en cada caso.
      await esperar(dictamen.coincide ? 25 + azar() * 45 : 10 + azar() * 12);

      const aprobado = azar() < probabilidad;
      if (aprobado) aprobados++;
      else fallidos.push(caso);
      if (alTerminarCaso) alTerminarCaso(caso, TOTAL_CASOS, aprobado);
    }

    return {
      aprobados: aprobados,
      total: TOTAL_CASOS,
      porcentaje: Math.round((aprobados / TOTAL_CASOS) * 100),
      fallidos: fallidos,
      dictamen: dictamen
    };
  }

  return { evaluar: evaluar, TOTAL_CASOS: TOTAL_CASOS };
})();
