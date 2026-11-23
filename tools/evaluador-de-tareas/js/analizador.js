/**
 * Analizador de estructura de archivos .py.
 *
 * Revisa el TEXTO del archivo (no lo ejecuta) y busca los rasgos que cada
 * tarea declara en js/tareas.js. Con eso decide:
 *
 *   - qué tan parecido es el archivo a cada tarea (0 a 1),
 *   - si corresponde a la tarea que eligió el alumno,
 *   - qué fracción del "núcleo" del algoritmo está implementada.
 *
 * Para que no dependa de cómo escribe cada alumno:
 *   - ignora comentarios y docstrings (salvo para el nombre del algoritmo),
 *   - quita acentos (heurística = heuristica) y mayúsculas,
 *   - separa nombres compuestos: gScore, g_score y G_SCORE dan "g" y "score",
 *   - reconoce nombres en español e inglés, y además la FORMA del algoritmo
 *     (expresiones regulares que no dependen de los nombres).
 *
 * Todo es texto y expresiones regulares: un archivo de 1 MB se analiza en
 * unos 250 ms. La evaluación real deberá hacerse en el servidor.
 *
 * FACTORES DE DECISIÓN QUE SE APLICAN AQUÍ (ver README, «Factores»):
 *   [F4]  el archivo debe parecer código de Python
 *   [F5]  solo cuenta el código: sin comentarios, acentos ni mayúsculas, y
 *         con los nombres compuestos separados
 *   [F6]  cada rasgo se reconoce por nombre o por estructura
 *   [F7]  parecido = suma de pesos encontrados / suma total de pesos
 *   [F8]  parecido mínimo de 40 % con la tarea elegida
 *   [F9]  la tarea elegida no puede quedar más de 10 puntos debajo de la
 *         más parecida
 *   [F10] fracción de rasgos esenciales implementados («núcleo»); un
 *         rasgo esencial solo cuenta si se reconoce por su estructura
 * Busca «[F» en este archivo para ver dónde se aplica cada uno.
 *
 *   Analizador.analizar(texto, tareas)        → analisis
 *   Analizador.dictaminar(analisis, tareaId)  → dictamen
 *
 * Funciona igual en el navegador y en Node (para pruebas).
 */
(function (raiz) {
  "use strict";

  const UMBRAL_MINIMO = 0.40; // [F8] parecido mínimo para aceptar la tarea elegida
  const MARGEN = 0.10;        // [F9] tolerancia frente a la tarea más parecida
  const PREFIJO_MINIMO = 5;   // [F6] palabras de 5+ letras aceptan terminaciones

  /* [F5] Quita acentos sin cambiar la longitud del texto (las posiciones
     sirven para calcular el número de línea): heurística = heuristica. */
  const SIN_ACENTO = { "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ü": "u", "ñ": "n",
                       "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U", "Ü": "U", "Ñ": "N" };
  function quitarAcentos(texto) {
    return texto.replace(/[áéíóúüñÁÉÍÓÚÜÑ]/g, function (c) { return SIN_ACENTO[c]; });
  }

  /**
   * [F5] Separa el archivo en código y comentarios/docstrings, conservando
   * la longitud original (lo que se quita se cambia por espacios). Los
   * rasgos se buscan solo en el código; los comentarios únicamente cuentan
   * para el rasgo «menciona el algoritmo» (alcance: "todo").
   */
  function separar(texto) {
    const n = texto.length;
    const codigo = new Array(n);
    const comentarios = new Array(n);
    let i = 0;

    function copiar(destino, otro, desde, hasta) {
      for (let k = desde; k < hasta; k++) {
        const c = texto[k];
        destino[k] = c;
        otro[k] = c === "\n" ? "\n" : " ";
      }
    }

    while (i < n) {
      const c = texto[i];
      const tres = texto.substr(i, 3);

      if (c === "#") {                                  // comentario de línea
        let fin = texto.indexOf("\n", i);
        if (fin === -1) fin = n;
        copiar(comentarios, codigo, i, fin);
        i = fin;
      } else if (tres === '"""' || tres === "'''") {    // docstring
        let fin = texto.indexOf(tres, i + 3);
        fin = fin === -1 ? n : fin + 3;
        copiar(comentarios, codigo, i, fin);
        i = fin;
      } else if (c === '"' || c === "'") {              // cadena normal: es código
        let k = i + 1;
        while (k < n && texto[k] !== c && texto[k] !== "\n") {
          k += texto[k] === "\\" ? 2 : 1;
        }
        k = Math.min(k + 1, n);
        copiar(codigo, comentarios, i, k);
        i = k;
      } else {
        codigo[i] = c;
        comentarios[i] = c === "\n" ? "\n" : " ";
        i++;
      }
    }
    return { codigo: codigo.join(""), comentarios: comentarios.join("") };
  }

  /**
   * [F5] Índice de identificadores: para cada nombre (completo y por partes,
   * en minúsculas) guarda la posición de su primera aparición. Así gScore,
   * g_score y G_SCORE se reconocen igual.
   *   gScore → "gscore", "g", "score"
   *   costo_acumulado2 → "costo_acumulado2", "costo", "acumulado", "2"
   */
  function indexar(fuente) {
    const indice = new Map();
    const re = /[A-Za-z_][A-Za-z0-9_]*/g;
    let m;
    while ((m = re.exec(fuente)) !== null) {
      const id = m[0];
      const completo = id.toLowerCase();
      if (!indice.has(completo)) indice.set(completo, m.index);
      const partes = id
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/([A-Za-z])([0-9])/g, "$1_$2")
        .toLowerCase()
        .split("_");
      for (let k = 0; k < partes.length; k++) {
        const p = partes[k];
        if (p && !indice.has(p)) indice.set(p, m.index);
      }
    }
    return indice;
  }

  /* [F6] Reconocimiento POR NOMBRE: posición de la primera palabra
     encontrada, o -1. Las de 5+ letras aceptan terminaciones
     ("parent" reconoce "parents"); las cortas deben ser exactas ("pq"). */
  function buscarPalabras(indice, palabras) {
    let mejor = -1;
    for (let i = 0; i < palabras.length; i++) {
      const p = palabras[i];
      let pos = indice.has(p) ? indice.get(p) : -1;
      if (pos < 0 && p.length >= PREFIJO_MINIMO) {
        indice.forEach(function (posicion, clave) {
          if (clave.length > p.length && clave.startsWith(p) && (pos < 0 || posicion < pos)) pos = posicion;
        });
      }
      if (pos >= 0 && (mejor < 0 || pos < mejor)) mejor = pos;
    }
    return mejor;
  }

  /* [F6] Reconocimiento POR ESTRUCTURA: posición de la primera forma
     (expresión regular) encontrada, o -1. */
  function buscarFormas(fuente, formas) {
    let mejor = -1;
    for (let i = 0; i < formas.length; i++) {
      const m = formas[i].exec(fuente);
      if (m && (mejor < 0 || m.index < mejor)) mejor = m.index;
    }
    return mejor;
  }

  function contadorDeLineas(texto) {
    const inicios = [0];
    for (let k = 0; k < texto.length; k++) if (texto.charCodeAt(k) === 10) inicios.push(k + 1);
    return function (indice) {
      let bajo = 0, alto = inicios.length - 1;
      while (bajo < alto) {
        const medio = (bajo + alto + 1) >> 1;
        if (inicios[medio] <= indice) bajo = medio; else alto = medio - 1;
      }
      return bajo + 1;
    };
  }

  function analizar(textoOriginal, tareas) {
    // [F5] Saltos de línea de Windows, acentos y comentarios fuera
    const texto = quitarAcentos(textoOriginal.replace(/\r\n?/g, "\n"));
    const codigo = separar(texto).codigo;
    const fuentes = {
      codigo: { texto: codigo, indice: indexar(codigo) },
      todo:   { texto: texto,  indice: indexar(texto) }
    };
    const lineaDe = contadorDeLineas(texto);

    // [F4] ¿Es código de Python? Basta con una línea típica: def, class,
    // import, for, while, if, print(...) o una asignación simple.
    const esPython = /^[ \t]*((def|class|import|from|for|while|if|with|return)\b[^\n]*|print\s*\(|[A-Za-z_]\w*(\s*,\s*[A-Za-z_]\w*)*\s*[+\-*/]?=[^=])/m.test(codigo);
    const lineas = texto.length ? texto.split("\n").length : 0;

    const resultados = tareas.map(function (tarea) {
      let total = 0, obtenido = 0, totalNucleo = 0, nucleo = 0;

      const rasgos = tarea.rasgos.map(function (r) {
        const fuente = r.alcance === "todo" ? fuentes.todo : fuentes.codigo;
        // [F6] Cada rasgo se busca por estructura y por nombre
        const porForma = r.formas ? buscarFormas(fuente.texto, r.formas) : -1;
        const porNombre = r.palabras ? buscarPalabras(fuente.indice, r.palabras) : -1;
        const reconocido = porForma >= 0 || porNombre >= 0;

        // [F10] Un rasgo ESENCIAL solo cuenta como hecho si se ve el código
        //       que lo implementa (estructura). Las plantillas ya traen los
        //       nombres (attraction_force, jacobian, max_iter...) sin resolver;
        //       el nombre ayuda a reconocer la tarea, pero no aprueba casos.
        const encontrado = r.nucleo ? porForma >= 0 : reconocido;
        const soloNombre = Boolean(r.nucleo) && porForma < 0 && porNombre >= 0;

        // [F7] Pesos para el parecido (estructura o nombre)
        total += r.peso;
        if (reconocido) obtenido += r.peso;
        // [F10] Pesos esenciales para el núcleo (solo estructura)
        if (r.nucleo) {
          totalNucleo += r.peso;
          if (encontrado) nucleo += r.peso;
        }
        // Si se reconoce por forma, se reporta así: es la evidencia más fuerte
        const posicion = porForma >= 0 ? porForma : porNombre;
        return {
          id: r.id,
          texto: r.texto,
          nucleo: Boolean(r.nucleo),
          encontrado: encontrado,
          soloNombre: soloNombre,
          via: encontrado ? (porForma >= 0 ? "forma" : "nombre") : null,
          linea: reconocido ? lineaDe(posicion) : null
        };
      });

      return {
        tarea: tarea,
        parecido: total ? obtenido / total : 0,            // [F7] 0 a 1
        nucleo: totalNucleo ? nucleo / totalNucleo : 0,    // [F10] 0 a 1
        rasgos: rasgos
      };
    });

    const masParecida = resultados.reduce(function (a, b) {
      return b.parecido > a.parecido ? b : a;
    });

    return { esPython: esPython, lineas: lineas, resultados: resultados, masParecida: masParecida };
  }

  /**
   * motivo:
   *   "coincide"        el archivo corresponde a la tarea elegida
   *   "no-es-python"    no se encontró estructura de Python
   *   "otra-tarea"      se parece más a otra tarea del catálogo
   *   "sin-reconocer"   no se parece lo suficiente a ninguna tarea
   */
  function dictaminar(analisis, tareaId) {
    const elegida = analisis.resultados.find(function (r) { return r.tarea.id === tareaId; });
    const mejor = analisis.masParecida;
    let motivo;

    if (!analisis.esPython) {
      motivo = "no-es-python";                                  // [F4]
    } else if (elegida.parecido >= UMBRAL_MINIMO &&             // [F8]
               elegida.parecido >= mejor.parecido - MARGEN) {   // [F9]
      motivo = "coincide";
    } else if (mejor.parecido >= UMBRAL_MINIMO) {
      motivo = "otra-tarea";        // [F9] se parece más a otra tarea
    } else {
      motivo = "sin-reconocer";     // [F8] no llega al 40 % con ninguna
    }

    return { coincide: motivo === "coincide", motivo: motivo, elegida: elegida, masParecida: mejor };
  }

  const Analizador = {
    analizar: analizar,
    dictaminar: dictaminar,
    separar: separar,
    indexar: indexar,
    UMBRAL_MINIMO: UMBRAL_MINIMO
  };
  raiz.Analizador = Analizador;
  if (typeof module !== "undefined" && module.exports) module.exports = Analizador;
})(globalThis);
