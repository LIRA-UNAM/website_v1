/**
 * Interfaz del evaluador: menú de tareas, selección del archivo .py,
 * análisis de estructura, casos y resultado. En inglés o español.
 *
 * Depende de:  globalThis.I18n       (js/i18n.js)
 *              globalThis.TAREAS     (js/tareas.js)
 *              globalThis.Analizador (js/analizador.js)
 *              globalThis.Evaluador  (js/evaluador.js)
 *
 * Todo texto visible sale de I18n.t(...) o I18n.loc(...). Lo que ya está en
 * pantalla se guarda en `estado` para volver a dibujarlo si se cambia de
 * idioma a mitad de una evaluación.
 */
(function () {
  "use strict";

  // FACTORES DE DECISIÓN QUE SE APLICAN AQUÍ (ver README, «Factores»):
  //   [F1] extensión .py   [F2] archivo no vacío   [F3] máximo 1 MB
  //   [F13] color de semáforo de la calificación
  const TAMANO_MAXIMO = 1024 * 1024; // [F3] 1 MB

  // [F13] Semáforo: color de la calificación según el porcentaje.
  //       Solo cambia el color; la calificación ya está decidida.
  //       Los colores están en el CSS, en [data-semaforo].
  const SEMAFORO = [
    { desde: 80, color: "verde" },
    { desde: 60, color: "amarillo" },
    { desde: 40, color: "naranja" },
    { desde: 0,  color: "rojo" }
  ];
  function colorSemaforo(porcentaje) {
    return SEMAFORO.find(function (s) { return porcentaje >= s.desde; }).color;
  }

  const I18n = globalThis.I18n;
  const t = I18n.t;
  const loc = I18n.loc;

  const $ = (id) => document.getElementById(id);

  const ui = {
    tema:          $("tema"),
    botonSitio:    $("boton-menu-sitio"),
    navegacion:    $("navegacion"),
    logo:          $("logo-lira"),
    formulario:    $("formulario"),
    menu:          $("menu-tareas"),
    menuBoton:     $("menu-boton"),
    menuValor:     $("menu-valor"),
    menuLista:     $("menu-lista"),
    tareaOculta:   $("tarea-seleccionada"),
    zonaSubida:    $("zona-subida"),
    archivoNombre: $("archivo-nombre"),
    archivoEntrada:$("archivo-entrada"),
    archivoMsj:    $("archivo-mensaje"),
    botonExaminar: $("boton-examinar"),
    botonEvaluar:  $("boton-evaluar"),
    ayudaEvaluar:  $("ayuda-evaluar"),
    analisis:      $("analisis"),
    veredicto:     $("veredicto"),
    rasgosTitulo:  $("rasgos-titulo"),
    rasgos:        $("rasgos"),
    parecidos:     $("parecidos"),
    progreso:      $("progreso"),
    progresoTexto: $("progreso-texto"),
    progresoPct:   $("progreso-porcentaje"),
    barra:         $("barra"),
    resultado:     $("resultado"),
    resultadoPct:  $("resultado-porcentaje"),
    resultadoDet:  $("resultado-detalle"),
    resultadoFal:  $("resultado-fallidos")
  };

  const estado = {
    tarea: null,        // objeto de TAREAS
    archivo: null,      // File
    evaluando: false,
    activo: -1,         // índice resaltado en el menú (teclado / ratón)
    // Lo que está en pantalla, para redibujarlo al cambiar de idioma:
    mensaje: { clave: "archivo.inicial", vars: null, tipo: null },
    analisisVisible: false,
    datosAnalisis: null,   // { analisis, dictamen } o null si sigue en curso
    progreso: null,        // { caso, total, terminado }
    resultado: null        // resultado de Evaluador.evaluar
  };

  /* Pequeño ayudante para crear elementos */
  function crear(etiqueta, clase, contenido) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (contenido !== undefined) el.append(contenido);
    return el;
  }

  function icono(trazo, vista) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", vista || "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = trazo;
    return svg;
  }

  const TRAZOS = {
    si:    '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    no:    '<path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    ok:    '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    falla: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    aviso: '<path d="M12 3.5L2.8 19.5h18.4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.2v.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    espera:'<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/>'
  };

  /* =======================================================
     0. Encabezado propio: modo oscuro, menú del sitio y logo
        Solo existe en la versión independiente (TrabajoExtra1PaginaWeb).
        Dentro del sitio de LIRA el encabezado, el menú y el modo oscuro
        son los del sitio (_scripts/dark-mode.js), así que este bloque
        no hace nada si esos elementos no están en la página.
     ======================================================= */

  function aplicarTema(oscuro) {
    document.documentElement.dataset.dark = String(oscuro);
    ui.tema.setAttribute("aria-checked", String(oscuro));
  }

  if (ui.tema) {
    aplicarTema(document.documentElement.dataset.dark === "true");

    ui.tema.addEventListener("click", function () {
      const oscuro = ui.tema.getAttribute("aria-checked") !== "true";
      const cambiar = function () {
        aplicarTema(oscuro);
        try { localStorage.setItem("dark-mode", String(oscuro)); } catch (e) { /* sin almacenamiento */ }
      };
      const movimientoOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && movimientoOk) document.startViewTransition(cambiar);
      else cambiar();
    });
  }

  if (ui.botonSitio && ui.navegacion) {
    ui.botonSitio.addEventListener("click", function () {
      const abierto = ui.botonSitio.getAttribute("aria-expanded") === "true";
      ui.botonSitio.setAttribute("aria-expanded", String(!abierto));
      ui.navegacion.classList.toggle("cabecera__nav--abierta", !abierto);
    });
  }

  // Sin internet el logo no carga: se muestra el nombre del laboratorio
  if (ui.logo) {
    const logoDeTexto = function () {
      ui.logo.replaceWith(crear("span", "marca__logo--texto", "LIRA"));
    };
    if (ui.logo.complete && ui.logo.naturalWidth === 0) logoDeTexto();
    else ui.logo.addEventListener("error", logoDeTexto);
  }

  /* =======================================================
     1. Menú desplegable de tareas (listbox accesible)
     ======================================================= */

  const opciones = globalThis.TAREAS.map(function (tarea, i) {
    const li = crear("li", "menu__opcion");
    li.id = "opcion-" + tarea.id;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");
    li.append(crear("span", "menu__nombre"), crear("span", "menu__descripcion"));

    li.addEventListener("click", function () {
      seleccionarTarea(i);
      cerrarMenu(true);
    });
    li.addEventListener("mousemove", function () { marcarActiva(i); });

    ui.menuLista.appendChild(li);
    return li;
  });

  /* Nombres y descripciones de las opciones, y el valor elegido */
  function pintarMenu() {
    globalThis.TAREAS.forEach(function (tarea, i) {
      opciones[i].querySelector(".menu__nombre").textContent = loc(tarea.nombre);
      opciones[i].querySelector(".menu__descripcion").textContent = loc(tarea.descripcion);
    });
    ui.menuValor.textContent = estado.tarea ? loc(estado.tarea.nombre) : t("menu.vacio");
    ui.menuValor.classList.toggle("menu__valor--vacio", !estado.tarea);
  }

  function menuAbierto() {
    return ui.menu.classList.contains("menu--abierto");
  }

  function abrirMenu(indice) {
    if (estado.evaluando) return;
    ui.menu.classList.add("menu--abierto");
    ui.menuBoton.setAttribute("aria-expanded", "true");
    const seleccionada = estado.tarea ? globalThis.TAREAS.indexOf(estado.tarea) : 0;
    marcarActiva(typeof indice === "number" ? indice : seleccionada);
    ui.menuLista.focus();
  }

  function cerrarMenu(devolverFoco) {
    if (!menuAbierto()) return;
    ui.menu.classList.remove("menu--abierto");
    ui.menuBoton.setAttribute("aria-expanded", "false");
    ui.menuLista.removeAttribute("aria-activedescendant");
    if (devolverFoco) ui.menuBoton.focus();
  }

  function marcarActiva(i) {
    const total = opciones.length;
    estado.activo = (i + total) % total;
    opciones.forEach(function (op, j) {
      op.classList.toggle("menu__opcion--activa", j === estado.activo);
    });
    const activa = opciones[estado.activo];
    ui.menuLista.setAttribute("aria-activedescendant", activa.id);
    activa.scrollIntoView({ block: "nearest" });
  }

  function seleccionarTarea(i) {
    const tarea = globalThis.TAREAS[i];
    if (estado.tarea === tarea) return;
    estado.tarea = tarea;
    ui.tareaOculta.value = tarea.id;
    opciones.forEach(function (op, j) {
      op.setAttribute("aria-selected", String(j === i));
    });
    pintarMenu();
    ocultarResultados();
    actualizarBotonEvaluar();
  }

  function sinAcentos(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  /* Escribir una letra salta a la siguiente opción que empieza con ella */
  function buscarPorLetra(letra) {
    const l = sinAcentos(letra);
    for (let k = 1; k <= opciones.length; k++) {
      const j = (estado.activo + k) % opciones.length;
      if (sinAcentos(loc(globalThis.TAREAS[j].nombre)).startsWith(l)) {
        marcarActiva(j);
        return;
      }
    }
  }

  ui.menuBoton.addEventListener("click", function () {
    if (menuAbierto()) cerrarMenu(true);
    else abrirMenu();
  });

  ui.menuBoton.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const base = estado.tarea ? globalThis.TAREAS.indexOf(estado.tarea) : 0;
      abrirMenu(e.key === "ArrowUp" && !estado.tarea ? opciones.length - 1 : base);
    }
  });

  ui.menuLista.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); marcarActiva(estado.activo + 1); break;
      case "ArrowUp":   e.preventDefault(); marcarActiva(estado.activo - 1); break;
      case "Home":      e.preventDefault(); marcarActiva(0); break;
      case "End":       e.preventDefault(); marcarActiva(opciones.length - 1); break;
      case "Enter":
      case " ":
        e.preventDefault();
        seleccionarTarea(estado.activo);
        cerrarMenu(true);
        break;
      case "Escape":
        e.preventDefault();
        cerrarMenu(true);
        break;
      case "Tab":
        cerrarMenu(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) buscarPorLetra(e.key);
    }
  });

  ui.menuLista.addEventListener("focusout", function (e) {
    if (!ui.menu.contains(e.relatedTarget)) cerrarMenu(false);
  });

  document.addEventListener("pointerdown", function (e) {
    if (menuAbierto() && !ui.menu.contains(e.target)) cerrarMenu(false);
  });

  /* =======================================================
     2. Selección del archivo (.py únicamente)
     ======================================================= */

  function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + " B";
    return (bytes / 1024).toFixed(1) + " KB";
  }

  /* Guarda el mensaje (clave + variables) para poder traducirlo después */
  function mostrarMensajeArchivo(clave, vars, tipo) {
    estado.mensaje = { clave: clave, vars: vars || null, tipo: tipo || null };
    pintarMensajeArchivo();
  }

  function pintarMensajeArchivo() {
    const m = estado.mensaje;
    ui.archivoMsj.textContent = t(m.clave, m.vars);
    ui.archivoMsj.className = "campo__mensaje" + (m.tipo ? " campo__mensaje--" + m.tipo : "");
    ui.zonaSubida.classList.toggle("subida--error", m.tipo === "error");
    ui.zonaSubida.classList.toggle("subida--ok", m.tipo === "ok");
  }

  function rechazarArchivo(clave, vars) {
    estado.archivo = null;
    ui.archivoEntrada.value = "";
    ui.archivoNombre.value = "";
    mostrarMensajeArchivo(clave, vars, "error");
    ocultarResultados();
    actualizarBotonEvaluar();
  }

  function procesarArchivo(archivo) {
    if (!archivo) return;

    // [F1] El atributo accept=".py" solo filtra el diálogo; aquí está el
    // filtro real: el nombre debe terminar en .py.
    if (!/\.py$/i.test(archivo.name)) {
      rechazarArchivo("archivo.noPy", { nombre: archivo.name });
      return;
    }
    if (archivo.size === 0) {                  // [F2] archivo vacío
      rechazarArchivo("archivo.vacio", { nombre: archivo.name });
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {        // [F3] más de 1 MB
      rechazarArchivo("archivo.grande", { nombre: archivo.name, tamano: formatearTamano(archivo.size) });
      return;
    }

    estado.archivo = archivo;
    ui.archivoNombre.value = archivo.name;
    mostrarMensajeArchivo("archivo.listo", { tamano: formatearTamano(archivo.size) }, "ok");
    ocultarResultados();
    actualizarBotonEvaluar();
  }

  function abrirSelector() {
    if (!estado.evaluando) ui.archivoEntrada.click();
  }

  ui.botonExaminar.addEventListener("click", abrirSelector);
  ui.archivoNombre.addEventListener("click", abrirSelector);
  ui.archivoNombre.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirSelector();
    }
  });

  ui.archivoEntrada.addEventListener("change", function () {
    procesarArchivo(ui.archivoEntrada.files[0]);
  });

  // Arrastrar y soltar sobre el campo
  ["dragenter", "dragover"].forEach(function (tipo) {
    ui.zonaSubida.addEventListener(tipo, function (e) {
      e.preventDefault();
      if (!estado.evaluando) ui.zonaSubida.classList.add("subida--arrastrando");
    });
  });
  ["dragleave", "drop"].forEach(function (tipo) {
    ui.zonaSubida.addEventListener(tipo, function () {
      ui.zonaSubida.classList.remove("subida--arrastrando");
    });
  });
  ui.zonaSubida.addEventListener("drop", function (e) {
    e.preventDefault();
    if (estado.evaluando) return;
    const archivos = e.dataTransfer.files;
    if (archivos.length > 1) {
      rechazarArchivo("archivo.varios");
      return;
    }
    procesarArchivo(archivos[0]);
  });

  // Evita que el navegador abra el archivo si se suelta fuera del campo
  ["dragover", "drop"].forEach(function (tipo) {
    window.addEventListener(tipo, function (e) { e.preventDefault(); });
  });

  /* =======================================================
     3. Análisis de estructura
     ======================================================= */

  function pintarVeredicto(tipo, titulo, texto) {
    ui.veredicto.className = "veredicto" + (tipo ? " veredicto--" + tipo : "");
    const cuerpo = crear("p");
    cuerpo.append(crear("strong", null, titulo));
    if (texto) cuerpo.append(" " + texto);
    ui.veredicto.replaceChildren(icono(TRAZOS[tipo || "espera"]), cuerpo);
  }

  function mostrarAnalisisEnCurso() {
    estado.analisisVisible = true;
    estado.datosAnalisis = null;
    pintarVeredicto(null, t("analisis.enCurso"), "");
    ui.rasgosTitulo.textContent = t("analisis.rasgos", { tarea: loc(estado.tarea.nombre) });
    ui.rasgos.replaceChildren();
    ui.parecidos.replaceChildren();
    ui.analisis.hidden = false;
  }

  /* animar = false al redibujar por cambio de idioma (las barras no
     vuelven a crecer desde cero) */
  function mostrarAnalisis(datos, animar) {
    estado.datosAnalisis = datos;
    const analisis = datos.analisis;
    const dictamen = datos.dictamen;
    const tarea = estado.tarea;
    const nombreTarea = loc(tarea.nombre);
    const elegida = dictamen.elegida;
    const encontrados = elegida.rasgos.filter(function (r) { return r.encontrado; }).length;

    ui.rasgosTitulo.textContent = t("analisis.rasgos", { tarea: nombreTarea });

    // Veredicto
    switch (dictamen.motivo) {
      case "coincide":
        if (elegida.nucleo >= 0.5) {
          pintarVeredicto("ok", t("veredicto.ok", { tarea: nombreTarea }),
            t("veredicto.ok.detalle", { n: encontrados, total: elegida.rasgos.length, lineas: analisis.lineas }));
        } else if (elegida.nucleo > 0) {
          pintarVeredicto("aviso", t("veredicto.incompleto", { tarea: nombreTarea }),
            t("veredicto.incompleto.detalle"));
        } else {
          // [F10] Núcleo vacío (p. ej. la plantilla sin resolver): 0 %
          pintarVeredicto("falla", t("veredicto.vacio", { tarea: nombreTarea }),
            t("veredicto.vacio.detalle"));
        }
        break;
      case "otra-tarea":
        pintarVeredicto("falla", t("veredicto.otra", { tarea: nombreTarea }),
          t("veredicto.otra.detalle", { otra: loc(dictamen.masParecida.tarea.nombre) }));
        break;
      case "sin-reconocer":
        pintarVeredicto("falla", t("veredicto.sin", { tarea: nombreTarea }), t("veredicto.sin.detalle"));
        break;
      default: // "no-es-python"
        pintarVeredicto("falla", t("veredicto.noPy"), t("veredicto.noPy.detalle"));
    }

    // Rasgos de la tarea elegida
    ui.rasgos.replaceChildren.apply(ui.rasgos, elegida.rasgos.map(function (r) {
      const textoRasgo = loc(r.texto);
      const li = crear("li", "rasgo " + (r.encontrado ? "rasgo--si" : "rasgo--no"));
      const marca = crear("span", "rasgo__icono", icono(r.encontrado ? TRAZOS.si : TRAZOS.no));
      const texto = crear("span", "rasgo__texto", textoRasgo);
      if (r.nucleo) texto.append(crear("span", "rasgo__etiqueta", t("rasgo.esencial")));
      // "por estructura" = se reconoció la forma del código; "por nombre" = por cómo se llaman las variables
      const como = t(r.via === "forma" ? "rasgo.forma" : "rasgo.nombre");
      // [F10] Esencial con solo el nombre: está en el archivo, pero sin el código
      const linea = crear("span", "rasgo__linea",
        r.encontrado ? t("rasgo.linea", { linea: r.linea, como: como })
          : r.soloNombre ? t("rasgo.soloNombre", { linea: r.linea })
          : t("rasgo.noEncontrado"));
      li.append(marca, texto, linea);
      li.setAttribute("aria-label", r.encontrado
        ? t("rasgo.aria.si", { como: como, texto: textoRasgo, linea: r.linea })
        : r.soloNombre ? t("rasgo.aria.soloNombre", { texto: textoRasgo, linea: r.linea })
        : t("rasgo.aria.no", { texto: textoRasgo }));
      return li;
    }));

    // Parecido con cada tarea
    ui.parecidos.replaceChildren.apply(ui.parecidos, analisis.resultados.map(function (res) {
      const li = crear("li", "parecido" + (res.tarea === tarea ? " parecido--elegida" : ""));
      const relleno = crear("span", "parecido__relleno");
      const ancho = Math.round(res.parecido * 100) + "%";
      if (animar === false) {
        relleno.style.width = ancho;
      } else {
        relleno.style.width = "0%";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { relleno.style.width = ancho; });
        });
      }
      li.append(
        crear("span", "parecido__nombre", loc(res.tarea.nombre)),
        crear("span", "parecido__pista", relleno),
        crear("span", "parecido__valor", I18n.porcentaje(Math.round(res.parecido * 100)))
      );
      return li;
    }));
  }

  /* =======================================================
     4. Evaluación
     ======================================================= */

  function actualizarBotonEvaluar() {
    const listo = Boolean(estado.tarea && estado.archivo) && !estado.evaluando;
    ui.botonEvaluar.disabled = !listo;

    if (estado.evaluando) {
      ui.ayudaEvaluar.textContent = t("ayuda.evaluando", { archivo: estado.archivo.name });
    } else if (!estado.tarea && !estado.archivo) {
      ui.ayudaEvaluar.textContent = t("ayuda.ambos");
    } else if (!estado.tarea) {
      ui.ayudaEvaluar.textContent = t("ayuda.tarea");
    } else if (!estado.archivo) {
      ui.ayudaEvaluar.textContent = t("ayuda.archivo");
    } else {
      ui.ayudaEvaluar.textContent = "";
    }
  }

  function bloquearControles(bloquear) {
    ui.menuBoton.disabled = bloquear;
    ui.botonExaminar.disabled = bloquear;
    ui.archivoNombre.disabled = bloquear;
  }

  function ocultarResultados() {
    if (estado.evaluando) return;
    ui.analisis.hidden = true;
    ui.progreso.hidden = true;
    ui.resultado.hidden = true;
    estado.analisisVisible = false;
    estado.datosAnalisis = null;
    estado.progreso = null;
    estado.resultado = null;
  }

  function pintarProgreso() {
    const p = estado.progreso;
    if (!p) return;
    ui.progresoTexto.textContent = p.terminado
      ? t("casos.terminado", { total: p.total })
      : t("casos.probando", { caso: p.caso, total: p.total });
    ui.progresoPct.textContent = I18n.porcentaje(Math.round((p.hechos / p.total) * 100));
  }

  function prepararBarra(total) {
    ui.barra.replaceChildren();
    for (let i = 0; i < total; i++) ui.barra.appendChild(crear("span", "seg"));
    ui.barra.setAttribute("aria-valuemax", String(total));
    ui.barra.setAttribute("aria-valuenow", "0");
    estado.progreso = { caso: 0, hechos: 0, total: total, terminado: false };
    pintarProgreso();
  }

  function alProbarCaso(caso, total) {
    ui.progreso.hidden = false;
    estado.progreso.caso = caso;
    pintarProgreso();
    ui.barra.children[caso - 1].classList.add("seg--actual");
  }

  function alTerminarCaso(caso, total, aprobado) {
    ui.barra.children[caso - 1].className = "seg " + (aprobado ? "seg--aprobado" : "seg--fallido");
    estado.progreso.hechos = caso;
    pintarProgreso();
    ui.barra.setAttribute("aria-valuenow", String(caso));
  }

  function mostrarResultado(r) {
    estado.resultado = r;
    estado.progreso.terminado = true;
    pintarProgreso();

    const tarea = estado.tarea;
    const nombreTarea = loc(tarea.nombre);
    const fallidos = r.total - r.aprobados;

    ui.resultadoPct.textContent = I18n.porcentaje(r.porcentaje);
    ui.resultado.dataset.semaforo = colorSemaforo(r.porcentaje);   // [F13]

    const archivo = crear("code", null, estado.archivo.name);

    if (r.dictamen.coincide) {
      ui.resultadoDet.replaceChildren(
        t("resultado.detalle", {
          aprobados: r.aprobados,
          total: r.total,
          fallidos: fallidos === 1 ? t("resultado.fallidos1") : t("resultado.fallidosN", { n: fallidos }),
          tarea: nombreTarea
        }),
        archivo, "."
      );
      if (r.fallidos.length) {
        const muestra = r.fallidos.slice(0, 20).join(", ");
        const resto = r.fallidos.length > 20 ? t("resultado.yMas", { n: r.fallidos.length - 20 }) : "";
        ui.resultadoFal.replaceChildren(t("resultado.listaFallidos"), crear("span", null, muestra + resto), ".");
      } else {
        ui.resultadoFal.replaceChildren();
      }
    } else {
      const razon = {
        "otra-tarea": t("razon.otra", { otra: loc(r.dictamen.masParecida.tarea.nombre), tarea: nombreTarea }),
        "sin-reconocer": t("razon.sin", { tarea: nombreTarea }),
        "no-es-python": t("razon.noPy")
      }[r.dictamen.motivo];
      ui.resultadoDet.replaceChildren(t("resultado.ninguno"), archivo, razon);
      ui.resultadoFal.replaceChildren();
    }

    ui.resultado.hidden = false;
  }

  ui.formulario.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!estado.tarea || !estado.archivo || estado.evaluando) return;

    cerrarMenu(false);
    estado.evaluando = true;
    bloquearControles(true);
    actualizarBotonEvaluar();

    ui.resultado.hidden = true;
    ui.progreso.hidden = true;
    estado.resultado = null;
    prepararBarra(globalThis.Evaluador.TOTAL_CASOS);
    mostrarAnalisisEnCurso();

    try {
      const r = await globalThis.Evaluador.evaluar({
        tarea: estado.tarea,
        archivo: estado.archivo,
        alAnalizar: mostrarAnalisis,
        alProbarCaso: alProbarCaso,
        alTerminarCaso: alTerminarCaso
      });
      mostrarResultado(r);
    } catch (error) {
      pintarVeredicto("falla", t("veredicto.error"), error.message);
    } finally {
      estado.evaluando = false;
      bloquearControles(false);
      actualizarBotonEvaluar();
    }
  });

  /* =======================================================
     5. Cambio de idioma: redibuja todo lo que está en pantalla
     ======================================================= */

  function redibujar() {
    pintarMenu();
    pintarMensajeArchivo();
    actualizarBotonEvaluar();
    if (estado.analisisVisible) {
      if (estado.datosAnalisis) mostrarAnalisis(estado.datosAnalisis, false);
      else mostrarAnalisisEnCurso();
    }
    pintarProgreso();
    if (estado.resultado) mostrarResultado(estado.resultado);
  }

  I18n.alCambiar(redibujar);
  redibujar();
})();
