# Tools: herramientas del sitio de LIRA

Esta carpeta junta las herramientas web del laboratorio. Cada herramienta
vive en su propia subcarpeta y es una página más del sitio, hecha como las
demás (`contact/`, `projects/`...): un `index.md` con la plantilla `default`,
que le pone el encabezado, el pie, los estilos y el modo oscuro de LIRA.

Las herramientas **no aparecen en el menú del sitio**: se entra escribiendo
su dirección en el navegador. Ningún otro archivo del sitio se modifica.

```
tools/
├── README.md               esta guía
└── evaluador-de-tareas/    Assignment Evaluator
    ├── index.md            la página
    ├── css/evaluador.css   estilos propios
    └── js/                 i18n.js, tareas.js, analizador.js, evaluador.js, app.js
```

## Herramientas

| Herramienta | Carpeta | Dirección |
|---|---|---|
| Assignment Evaluator | `evaluador-de-tareas/` | https://lira.unam.mx/tools/evaluador-de-tareas/ |

## Agregar una herramienta

1. **Crear la carpeta** `tools/<carpeta>/` con un `index.md` que empiece así:

   ```markdown
   ---
   title: Tool Name
   description: One line about the tool.
   sitemap: false
   ---

   # {% include icon.html icon="fa-solid fa-wrench" %}Tool Name
   ```

   - Sin `nav`, la página no sale en el menú.
   - `sitemap: false` la deja fuera de `sitemap.xml`. Quítalo si quieres que
     los buscadores la encuentren.
2. **Escribir el contenido** debajo, en Markdown o HTML. Las secciones con
   fondo alternado se separan con `{% include section.html %}`, como en las
   demás páginas.
3. **Enlazar los archivos propios** desde la misma página, con la ruta de su
   carpeta:

   ```liquid
   <link href="{{ page.dir | append: 'css/estilos.css' | relative_url }}" rel="stylesheet">
   <script src="{{ page.dir | append: 'js/app.js' | relative_url }}"></script>
   ```

   No los pongas en `_styles/` ni en `_scripts/`: el sitio carga todo lo que
   hay ahí en todas sus páginas.
4. **Probarla** con el sitio en marcha (`.docker/run.sh` o
   `bundle exec jekyll serve`) en `http://localhost:4000/tools/<carpeta>/`.
5. **Agregarla a la tabla** de este README.

Para quitar una herramienta, basta con borrar su carpeta y su fila de la tabla.

## Assignment Evaluator

Revisa que un archivo `.py` corresponda a la tarea elegida de Robots Móviles
y lo prueba con 100 casos. Todo corre en el navegador; hoy los casos son
simulados (ver `js/evaluador.js`).

- **Tareas que reconoce y sus rasgos:** `evaluador-de-tareas/js/tareas.js`.
- **Cómo decide si el código corresponde a la tarea:** `js/analizador.js`
  (factores F1 a F13, marcados en comentarios).
- **Calificación y color de semáforo:** `js/evaluador.js` y `js/app.js`.
- **Textos en inglés y español:** `js/i18n.js`. Este archivo también agrega
  el interruptor EN/ES junto al de modo oscuro, solo en esta página y sin
  tocar el encabezado del sitio.
- **Estilos:** `css/evaluador.css`, acotados a `.evaluador`; usan las
  variables del tema de LIRA (`--primary`, `--surface`, `--light-gray`...).
