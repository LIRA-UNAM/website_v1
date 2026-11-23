/**
 * Idiomas de la página (inglés y español).
 *
 * - Inglés es el predeterminado; la elección se guarda en localStorage
 *   (clave "lang"), igual que el sitio guarda el modo oscuro en "dark-mode".
 * - Textos fijos del HTML: atributos data-i18n (texto), data-i18n-aria-label
 *   y data-i18n-placeholder con la clave del diccionario de abajo.
 * - Textos que arma app.js: I18n.t("clave", { variables }).
 * - Textos del catálogo de tareas (js/tareas.js): objetos { es, en } que se
 *   leen con I18n.loc(objeto).
 * - El interruptor es cualquier <input type="checkbox" class="lang-toggle">:
 *   sin marcar = inglés, marcado = español. Si la página no trae uno y está
 *   dentro del sitio de LIRA, se agrega solo junto al de modo oscuro, para
 *   no tocar el encabezado del sitio.
 * - El título de la pestaña es el texto "doc.titulo".
 *
 *   I18n.t(clave, vars)   texto en el idioma actual
 *   I18n.loc(valor)       elige es/en de un objeto { es, en } (o deja un texto)
 *   I18n.porcentaje(n)    "87%" en inglés, "87 %" en español
 *   I18n.cambiar(idioma)  "es" o "en"
 *   I18n.alCambiar(fn)    avisa a fn cuando cambia el idioma
 */
globalThis.I18n = (function () {
  "use strict";

  const CLAVE = "lang";
  const PREDETERMINADO = "en";
  const NBSP = " ";

  const TEXTOS = {
    es: {
      "doc.titulo": "Evaluador de tareas | Laboratorio de Investigación en Robótica Avanzada",
      "pagina.titulo": "Evaluador de tareas",
      "pagina.intro": "Herramienta de LIRA para revisar las tareas de programación de la materia de Robots Móviles. Suba su archivo .py: el evaluador comprueba que el código corresponda a la tarea elegida y lo prueba con 100 casos.",
      "idioma.cambiar": "Cambiar idioma (English / Español)",

      "saltar": "Ir al evaluador",
      "sitio.menu": "Menú del sitio",
      "sitio.nav": "Sitio de LIRA",
      "sitio.oscuro": "Modo oscuro",

      "etiqueta.tarea": "Seleccione la tarea a evaluar",
      "menu.vacio": "Elija una tarea",
      "etiqueta.archivo": "Subir archivo",
      "boton.examinar": "Examinar",
      "boton.evaluar": "Evaluar",

      "archivo.inicial": "Solo se aceptan archivos .py. También puede arrastrarlo aquí.",
      "archivo.noPy": "«{nombre}» no es un archivo .py. Solo se aceptan archivos de Python (.py).",
      "archivo.vacio": "«{nombre}» está vacío. Elija el .py que contiene su solución.",
      "archivo.grande": "«{nombre}» pesa {tamano}. El máximo es 1 MB.",
      "archivo.varios": "Suelte un solo archivo .py a la vez.",
      "archivo.listo": "Archivo listo para evaluar ({tamano}).",

      "ayuda.ambos": "Seleccione una tarea y un archivo .py para evaluar.",
      "ayuda.tarea": "Falta seleccionar la tarea.",
      "ayuda.archivo": "Falta subir el archivo .py.",
      "ayuda.evaluando": "Evaluando {archivo}…",

      "analisis.titulo": "Análisis del archivo",
      "analisis.enCurso": "Analizando la estructura del archivo…",
      "analisis.rasgos": "Rasgos esperados de {tarea}",
      "analisis.parecidos": "Parecido con cada tarea",
      "veredicto.ok": "El archivo corresponde a {tarea}.",
      "veredicto.ok.detalle": "Tiene {n} de {total} rasgos esperados en {lineas} líneas.",
      "veredicto.incompleto": "El archivo tiene la estructura de {tarea}, pero el algoritmo parece incompleto.",
      "veredicto.incompleto.detalle": "Faltan rasgos esenciales; es probable que varios casos fallen.",
      "veredicto.vacio": "El archivo tiene la estructura de {tarea}, pero el algoritmo no está implementado.",
      "veredicto.vacio.detalle": "Ningún rasgo esencial tiene código, como en una plantilla sin resolver. Todos los casos se marcarán como fallidos.",
      "veredicto.otra": "El archivo no corresponde a {tarea}.",
      "veredicto.otra.detalle": "Su contenido se parece más a {otra}. Todos los casos se marcarán como fallidos.",
      "veredicto.sin": "No se reconoce {tarea} en el archivo.",
      "veredicto.sin.detalle": "El código no tiene los rasgos de ninguna tarea del curso. Todos los casos se marcarán como fallidos.",
      "veredicto.noPy": "El archivo no parece código de Python.",
      "veredicto.noPy.detalle": "No tiene definiciones, importaciones ni instrucciones de Python. Todos los casos se marcarán como fallidos.",
      "veredicto.error": "La evaluación se detuvo.",
      "rasgo.esencial": "esencial",
      "rasgo.forma": "por estructura",
      "rasgo.nombre": "por nombre",
      "rasgo.linea": "línea {linea}, {como}",
      "rasgo.noEncontrado": "no encontrado",
      "rasgo.soloNombre": "línea {linea}, solo el nombre, sin implementar",
      "rasgo.aria.si": "Encontrado {como}: {texto}, línea {linea}",
      "rasgo.aria.no": "No encontrado: {texto}",
      "rasgo.aria.soloNombre": "Sin implementar: {texto}. Solo aparece su nombre, en la línea {linea}",

      "casos.titulo": "Casos de prueba",
      "casos.probando": "Probando caso {caso} de {total}",
      "casos.terminado": "{total} de {total} casos probados",
      "leyenda": "Leyenda",
      "leyenda.aprobado": "Aprobado",
      "leyenda.fallido": "Fallido",
      "leyenda.pendiente": "Pendiente",

      "resultado.titulo": "Resultado:",
      "resultado.detalle": "{aprobados} de {total} casos aprobados, {fallidos}. {tarea} con ",
      "resultado.fallidos1": "1 fallido",
      "resultado.fallidosN": "{n} fallidos",
      "resultado.listaFallidos": "Casos fallidos: ",
      "resultado.yMas": " y {n} más",
      "resultado.ninguno": "Ningún caso se aprobó: ",
      "razon.otra": " parece de {otra}, no de {tarea}.",
      "razon.sin": " no tiene la estructura de {tarea}.",
      "razon.noPy": " no parece código de Python."
    },

    en: {
      "doc.titulo": "Assignment Evaluator | Laboratorio de Investigación en Robótica Avanzada",
      "pagina.titulo": "Assignment Evaluator",
      "pagina.intro": "A LIRA tool for checking the programming assignments of the Mobile Robots course. Upload your .py file: the evaluator checks that the code matches the selected assignment and tests it against 100 cases.",
      "idioma.cambiar": "Change language (English / Español)",

      "saltar": "Skip to the evaluator",
      "sitio.menu": "Site menu",
      "sitio.nav": "LIRA website",
      "sitio.oscuro": "Dark mode",

      "etiqueta.tarea": "Select the assignment to evaluate",
      "menu.vacio": "Choose an assignment",
      "etiqueta.archivo": "Upload file",
      "boton.examinar": "Browse",
      "boton.evaluar": "Evaluate",

      "archivo.inicial": "Only .py files are accepted. You can also drag it here.",
      "archivo.noPy": "“{nombre}” is not a .py file. Only Python files (.py) are accepted.",
      "archivo.vacio": "“{nombre}” is empty. Choose the .py file that contains your solution.",
      "archivo.grande": "“{nombre}” is {tamano}. The maximum is 1 MB.",
      "archivo.varios": "Drop one .py file at a time.",
      "archivo.listo": "File ready to evaluate ({tamano}).",

      "ayuda.ambos": "Select an assignment and a .py file to evaluate.",
      "ayuda.tarea": "Select an assignment.",
      "ayuda.archivo": "Upload a .py file.",
      "ayuda.evaluando": "Evaluating {archivo}…",

      "analisis.titulo": "File analysis",
      "analisis.enCurso": "Analyzing the file structure…",
      "analisis.rasgos": "Expected features of {tarea}",
      "analisis.parecidos": "Similarity to each assignment",
      "veredicto.ok": "The file matches {tarea}.",
      "veredicto.ok.detalle": "It has {n} of {total} expected features in {lineas} lines.",
      "veredicto.incompleto": "The file has the structure of {tarea}, but the algorithm looks incomplete.",
      "veredicto.incompleto.detalle": "Essential features are missing; several cases will probably fail.",
      "veredicto.vacio": "The file has the structure of {tarea}, but the algorithm is not implemented.",
      "veredicto.vacio.detalle": "No essential feature has code, as in an unsolved template. All cases will be marked as failed.",
      "veredicto.otra": "The file does not match {tarea}.",
      "veredicto.otra.detalle": "Its content is closer to {otra}. All cases will be marked as failed.",
      "veredicto.sin": "{tarea} was not recognized in the file.",
      "veredicto.sin.detalle": "The code does not have the features of any course assignment. All cases will be marked as failed.",
      "veredicto.noPy": "The file does not look like Python code.",
      "veredicto.noPy.detalle": "It has no Python definitions, imports or statements. All cases will be marked as failed.",
      "veredicto.error": "The evaluation stopped.",
      "rasgo.esencial": "essential",
      "rasgo.forma": "by structure",
      "rasgo.nombre": "by name",
      "rasgo.linea": "line {linea}, {como}",
      "rasgo.noEncontrado": "not found",
      "rasgo.soloNombre": "line {linea}, name only, not implemented",
      "rasgo.aria.si": "Found {como}: {texto}, line {linea}",
      "rasgo.aria.no": "Not found: {texto}",
      "rasgo.aria.soloNombre": "Not implemented: {texto}. Only its name appears, on line {linea}",

      "casos.titulo": "Test cases",
      "casos.probando": "Testing case {caso} of {total}",
      "casos.terminado": "{total} of {total} cases tested",
      "leyenda": "Legend",
      "leyenda.aprobado": "Passed",
      "leyenda.fallido": "Failed",
      "leyenda.pendiente": "Pending",

      "resultado.titulo": "Result:",
      "resultado.detalle": "{aprobados} of {total} cases passed, {fallidos}. {tarea} with ",
      "resultado.fallidos1": "1 failed",
      "resultado.fallidosN": "{n} failed",
      "resultado.listaFallidos": "Failed cases: ",
      "resultado.yMas": " and {n} more",
      "resultado.ninguno": "No case passed: ",
      "razon.otra": " looks like {otra}, not {tarea}.",
      "razon.sin": " does not have the structure of {tarea}.",
      "razon.noPy": " does not look like Python code."
    }
  };

  let idioma = leerGuardado();
  const oyentes = [];

  function leerGuardado() {
    try {
      const v = localStorage.getItem(CLAVE);
      if (v === "es" || v === "en") return v;
    } catch (e) { /* sin almacenamiento */ }
    return PREDETERMINADO;
  }

  function t(clave, vars) {
    let texto = TEXTOS[idioma][clave];
    if (texto === undefined) texto = TEXTOS.es[clave] !== undefined ? TEXTOS.es[clave] : clave;
    if (vars) {
      texto = texto.replace(/\{(\w+)\}/g, function (m, nombre) {
        return vars[nombre] !== undefined ? vars[nombre] : m;
      });
    }
    return texto;
  }

  function loc(valor) {
    if (valor === null || valor === undefined || typeof valor === "string") return valor;
    return valor[idioma] !== undefined ? valor[idioma] : valor.es;
  }

  function porcentaje(n) {
    return idioma === "es" ? n + NBSP + "%" : n + "%";
  }

  /* Interruptor de idioma dentro del sitio de LIRA: el encabezado es el de
     la plantilla del sitio, así que el interruptor se agrega aquí, junto al
     de modo oscuro. (La versión independiente ya lo trae en su HTML.) */
  function agregarInterruptor() {
    if (document.querySelector(".lang-toggle")) return;
    const oscuro = document.querySelector("header .dark-toggle");
    if (!oscuro) return;
    const el = document.createElement("input");
    el.type = "checkbox";
    el.className = "lang-toggle";
    el.id = "idioma";
    el.dataset.tooltip = "English / Español";   // lo muestra tooltip.js del sitio
    el.dataset.i18nAriaLabel = "idioma.cambiar";
    oscuro.after(el);
  }

  /* Textos fijos del HTML */
  function aplicarEstaticos() {
    document.documentElement.lang = idioma;
    document.title = t("doc.titulo");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });
    document.querySelectorAll(".lang-toggle").forEach(function (el) {
      el.checked = idioma === "es";
    });
  }

  function cambiar(nuevo) {
    if (nuevo !== "es" && nuevo !== "en") return;
    idioma = nuevo;
    try { localStorage.setItem(CLAVE, nuevo); } catch (e) { /* sin almacenamiento */ }
    aplicarEstaticos();
    oyentes.forEach(function (fn) { fn(idioma); });
  }

  // El interruptor: sin marcar = inglés, marcado = español. Se anima igual
  // que el de modo oscuro del sitio (transición de vista si se puede).
  agregarInterruptor();
  document.querySelectorAll(".lang-toggle").forEach(function (el) {
    el.addEventListener("input", function () {
      const nuevo = el.checked ? "es" : "en";
      const movimientoOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && movimientoOk) {
        document.startViewTransition(function () { cambiar(nuevo); });
      } else {
        cambiar(nuevo);
      }
    });
  });

  aplicarEstaticos();

  return {
    t: t,
    loc: loc,
    porcentaje: porcentaje,
    cambiar: cambiar,
    alCambiar: function (fn) { oyentes.push(fn); },
    get idioma() { return idioma; }
  };
})();
