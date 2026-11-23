---
title: Assignment Evaluator
description: Automatic evaluator for the Python programming assignments of the Mobile Robots course.
sitemap: false
---

{% comment %}
  Assignment Evaluator / Evaluador de tareas (Robots Móviles).
  Sin `nav` arriba, la página no sale en el menú: se entra escribiendo
  /tools/evaluador-de-tareas/. Sus archivos propios están en esta carpeta
  (css/ y js/). Los textos con data-i18n se traducen con js/i18n.js, que
  también agrega el interruptor EN/ES junto al de modo oscuro.
{% endcomment %}

# {% include icon.html icon="fa-solid fa-file-code" %}<span data-i18n="pagina.titulo">Assignment Evaluator</span>

A LIRA tool for checking the programming assignments of the Mobile Robots course. Upload your .py file: the evaluator checks that the code matches the selected assignment and tests it against 100 cases.
{: data-i18n="pagina.intro"}

{% include section.html %}

<link href="{{ page.dir | append: 'css/evaluador.css' | relative_url }}" rel="stylesheet">

<div class="evaluador" id="panel">
  <form class="formulario" id="formulario" novalidate>

    <!-- 1. Selección de tarea -->
    <div class="campo">
      <span class="campo__etiqueta" id="etiqueta-tarea" data-i18n="etiqueta.tarea">Select the assignment to evaluate</span>
      <div class="menu" id="menu-tareas">
        <button type="button" class="menu__boton" id="menu-boton"
                aria-haspopup="listbox" aria-expanded="false"
                aria-labelledby="etiqueta-tarea menu-valor">
          <span class="menu__valor menu__valor--vacio" id="menu-valor">Choose an assignment</span>
          <i class="icon fa-solid fa-chevron-down menu__flecha" aria-hidden="true"></i>
        </button>
        <!-- La "cortinita": se llena desde js/tareas.js -->
        <ul class="menu__lista" id="menu-lista" role="listbox" tabindex="-1"
            aria-labelledby="etiqueta-tarea"></ul>
      </div>
      <input type="hidden" name="tarea" id="tarea-seleccionada">
    </div>

    <!-- 2. Subida del archivo (.py únicamente) -->
    <div class="campo">
      <label class="campo__etiqueta" for="archivo-nombre" data-i18n="etiqueta.archivo">Upload file</label>
      <div class="subida" id="zona-subida">
        <input type="text" class="subida__nombre" id="archivo-nombre"
               placeholder="*.py" readonly aria-describedby="archivo-mensaje">
        <button type="button" class="button boton--secundario" id="boton-examinar">
          <i class="icon fa-solid fa-folder-open"></i><span data-i18n="boton.examinar">Browse</span>
        </button>
        <input type="file" id="archivo-entrada" name="archivo" accept=".py,text/x-python" hidden>
      </div>
      <p class="campo__mensaje" id="archivo-mensaje" aria-live="polite">Only .py files are accepted. You can also drag it here.</p>
    </div>

    <!-- 3. Evaluar -->
    <div class="acciones">
      <button type="submit" class="button boton--principal" id="boton-evaluar" disabled>
        <i class="icon fa-solid fa-play"></i><span data-i18n="boton.evaluar">Evaluate</span>
      </button>
      <p class="acciones__ayuda" id="ayuda-evaluar">Select an assignment and a .py file to evaluate.</p>
    </div>
  </form>

  <!-- 4. Análisis de la estructura del código
       (los títulos no llevan id para que anchors.js del sitio no les
       agregue el ícono de enlace; el id va en el span de adentro) -->
  <div class="bloque analisis" id="analisis" role="region" aria-labelledby="analisis-titulo" hidden>
    <h2 class="bloque__titulo"><span id="analisis-titulo" data-i18n="analisis.titulo">File analysis</span></h2>
    <div class="veredicto" id="veredicto" role="status"></div>

    <h3 class="analisis__subtitulo"><span id="rasgos-titulo">Expected features</span></h3>
    <ul class="rasgos" id="rasgos" aria-labelledby="rasgos-titulo"></ul>

    <h3 class="analisis__subtitulo"><span id="parecidos-titulo" data-i18n="analisis.parecidos">Similarity to each assignment</span></h3>
    <ul class="parecidos" id="parecidos" aria-labelledby="parecidos-titulo"></ul>
  </div>

  <!-- 5. Casos de prueba -->
  <div class="bloque progreso" id="progreso" role="region" aria-labelledby="progreso-titulo" hidden>
    <h2 class="bloque__titulo"><span id="progreso-titulo" data-i18n="casos.titulo">Test cases</span></h2>
    <div class="progreso__cabecera">
      <p class="progreso__texto" id="progreso-texto">Testing case 0 of 100</p>
      <p class="progreso__porcentaje" id="progreso-porcentaje">0%</p>
    </div>
    <div class="barra" id="barra" role="progressbar"
         aria-labelledby="progreso-texto" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
    <ul class="leyenda" aria-label="Legend" data-i18n-aria-label="leyenda">
      <li><span class="leyenda__muestra leyenda__muestra--aprobado"></span><span data-i18n="leyenda.aprobado">Passed</span></li>
      <li><span class="leyenda__muestra leyenda__muestra--fallido"></span><span data-i18n="leyenda.fallido">Failed</span></li>
      <li><span class="leyenda__muestra leyenda__muestra--pendiente"></span><span data-i18n="leyenda.pendiente">Pending</span></li>
    </ul>
  </div>

  <!-- 6. Resultado -->
  <div class="resultado" id="resultado" aria-live="polite" hidden>
    <p class="resultado__titulo"><span data-i18n="resultado.titulo">Result:</span> <span id="resultado-porcentaje">0%</span></p>
    <p class="resultado__detalle" id="resultado-detalle"></p>
    <p class="resultado__fallidos" id="resultado-fallidos"></p>
  </div>
</div>

<!-- Orden de carga: idiomas, catálogo, analizador, servicio de evaluación, interfaz -->
<script src="{{ page.dir | append: 'js/i18n.js' | relative_url }}"></script>
<script src="{{ page.dir | append: 'js/tareas.js' | relative_url }}"></script>
<script src="{{ page.dir | append: 'js/analizador.js' | relative_url }}"></script>
<script src="{{ page.dir | append: 'js/evaluador.js' | relative_url }}"></script>
<script src="{{ page.dir | append: 'js/app.js' | relative_url }}"></script>
