/**
 * Catálogo de tareas evaluables y sus "rasgos".
 *
 * Un rasgo es algo que esperamos ver en un .py que resuelve la tarea. Se
 * puede reconocer de dos maneras (basta una):
 *
 *   palabras  nombres de variables o funciones, en español o inglés. Se
 *             comparan sin acentos ni mayúsculas, y también contra las
 *             partes de nombres compuestos: "gScore", "g_score" y
 *             "costoAcumulado" se separan en sus palabras. Las palabras de 5
 *             o más letras también aceptan terminaciones ("vecin" no, pero
 *             "parent" reconoce "parents", "parentNode"...).
 *   formas    expresiones regulares sobre la ESTRUCTURA del código, que no
 *             dependen de cómo se llamen las variables (por ejemplo,
 *             "1/d - 1/d0" o "(f(q+h) - f(q-h)) / (2*h)").
 *
 * Además:
 *   peso     cuánto aporta a la coincidencia (1 = débil, 3 = fuerte)
 *   nucleo   true si demuestra que el algoritmo SÍ está implementado; define
 *            cuántos casos se aprueban
 *   alcance  "todo" para buscar también en comentarios (solo los nombres
 *            del algoritmo); por defecto se ignoran comentarios y docstrings
 *
 * Los textos que ve el alumno (nombre, descripcion y texto de cada rasgo)
 * van en los dos idiomas de la página: { es: "...", en: "..." }.
 *
 * Los rasgos genéricos (mapas, pesos, sensores...) pesan 1 o 2 para que no
 * basten por sí solos; lo que distingue a cada algoritmo pesa 3.
 *
 * FACTORES DE DECISIÓN QUE SE DEFINEN AQUÍ (ver README, «Factores»):
 *   [F6]  qué se busca: cada rasgo por nombre (palabras) o por estructura
 *         (formas). Encima de cada lista de formas hay un comentario que
 *         explica, en orden, qué detecta cada expresión regular.
 *   [F7]  peso de cada rasgo (1 a 3): con ellos se calcula el parecido.
 *   [F10] nucleo: true marca los rasgos esenciales; definen qué tan
 *         completo está el algoritmo y cuántos casos se aprueban.
 */
(function (raiz) {
  "use strict";

  // Nombres típicos de "la meta" para reconocer fórmulas que la usan
  const META = "(?:goal|meta|objetivo|destino|target|final|fin|end)";

  raiz.TAREAS = [
    /* ===================================================== A* */
    {
      id: "a-estrella",
      nombre: { es: "A*", en: "A*" },
      descripcion: { es: "Planeación de rutas sobre un mapa de celdas", en: "Path planning on a cell map" },
      rasgos: [
        {
          id: "nombre", peso: 2, alcance: "todo",
          texto: { es: "Menciona A* en nombres o comentarios", en: "Mentions A* in names or comments" },
          palabras: ["astar", "a_star", "a_estrella", "aestrella"],
          // [F6] Por estructura:
          //   «A*» escrito así (no «A * b»), «a estrella» o «a star»
          formas: [/\bA\*(?![\w(=*])/, /\ba[\s_-]?estrella\b/i, /\ba[\s_-]star\b/i]
        },
        {
          id: "abierta", peso: 3, nucleo: true,
          texto: { es: "Lista abierta: se saca el nodo de menor costo", en: "Open list: the lowest-cost node is taken out" },
          palabras: ["open_set", "openset", "open_list", "openlist", "open_nodes", "open_heap", "open_queue",
                     "abierta", "abiertas", "abierto", "abiertos", "frontier", "frontera", "fringe",
                     "pendientes", "por_visitar", "cola_prioridad", "cola_de_prioridad", "heapq", "monticulo", "pq",
                     "prioridad", "priority"],
          // [F6] Por estructura:
          //   1) heappush / heappop / PriorityQueue
          //   2) un while sobre una lista que en cada vuelta saca min(lista, key=...)
          //   3) un while sobre una lista que se ordena con .sort()
          formas: [/heappush|heappop|PriorityQueue/,
                   /while\s+(\w+)\s*:[\s\S]{0,400}?\bmin\(\s*\1\b[^)\n]*key\s*=/,
                   /while\s+(\w+)\s*:[\s\S]{0,400}?\1\.sort\(/]
        },
        {
          id: "cerrada", peso: 2, nucleo: true,
          texto: { es: "Conjunto cerrado de nodos ya expandidos", en: "Closed set of already expanded nodes" },
          palabras: ["closed", "closed_set", "closed_list", "cerrada", "cerradas", "cerrado", "cerrados",
                     "visited", "visitado", "visitados", "visitada", "visitadas", "explored", "explorado",
                     "explorados", "expandido", "expandidos", "expanded", "procesado", "procesados", "vistos"],
          // [F6] Por estructura:
          //   1) se crea un set() vacío y después se le agregan nodos con .add()
          //   2) se marca un arreglo con True: cerrados[r][c] = True (no slices)
          //   3) se crea una lista vacía y después se pregunta si un nodo está
          //      en ella: if/and/or ... (not) in cerrados (no cuenta un for)
          formas: [/\b(\w+)\s*=\s*set\(\s*\)[\s\S]*?\b\1\.add\(/,
                   /\w+\s*\[[^\]\n:]+\]\s*=\s*True\b/,
                   /\b(\w+)\s*=\s*\[\s*\][\s\S]*?\b(?:if|and|or)\b[^\n]*?\bin\s+\1\b/]
        },
        {
          id: "costo-g", peso: 2, nucleo: true,
          texto: { es: "Costo acumulado g y actualización si mejora", en: "Accumulated cost g, updated when it improves" },
          palabras: ["g_score", "gscore", "g_cost", "gcost", "g_values", "g_vals", "g_val", "costo_g",
                     "g_costo", "cost_so_far", "costo_acumulado", "costos_acumulados", "dist_inicio",
                     "distancia_inicio", "g_n"],
          // [F6] Por estructura:
          //   1) g[n] = ...
          //   2) relajación: if nuevo < costo[n]  /  if nuevo < costo.get(n, inf)
          //   3) nuevo = costo[actual] + paso
          formas: [/\bg\s*\[[^\]\n]+\]\s*=/,
                   /if\s+[\w.\[\]]+\s*<\s*[\w.]+\s*(?:\[[^\]\n]+\]|\.get\([^)\n]*\))/,
                   /\w+\s*=\s*[\w.]+\s*(?:\[[^\]\n]+\]|\.get\([^)\n]*\))\s*\+\s*[\w.(]/]
        },
        {
          id: "heuristica", peso: 3, nucleo: true,
          texto: { es: "Heurística: distancia estimada a la meta", en: "Heuristic: estimated distance to the goal" },
          palabras: ["heuristic", "heuristica", "heuristicas", "heur", "manhattan", "octile", "euclid",
                     "euclidiana", "chebyshev", "estimacion", "estimado", "h_score", "hscore", "h_cost",
                     "dist_meta", "distancia_meta", "dist_goal", "distance_to_goal", "to_goal", "h_n"],
          // [F6] Por estructura:
          //   1) distancia a la meta: hypot/dist/sqrt/norm(... meta ...)
          //   2) Manhattan a mano: abs(x - meta_x) + abs(...)
          //   3) + h(n)
          //   4) diferencia entre dos celdas, base de Manhattan y octil:
          //      abs(a[0] - b[0])
          formas: [new RegExp("(?:hypot|dist|sqrt|linalg\\.norm)\\s*\\([^\\n]*" + META, "i"),
                   new RegExp("abs\\([^)\\n]*" + META + "[^)\\n]*\\)\\s*\\+\\s*abs\\(", "i"),
                   /\+\s*h\s*\(/,
                   /abs\(\s*[\w.]+\s*\[\s*0\s*\]\s*-\s*[\w.]+\s*\[\s*0\s*\]\s*\)/]
        },
        {
          id: "costo-f", peso: 3, nucleo: true,
          texto: { es: "Prioridad f = g + h", en: "Priority f = g + h" },
          palabras: ["f_score", "fscore", "f_cost", "fcost", "f_values", "f_val", "costo_f", "costo_total",
                     "total_cost", "f_n"],
          // [F6] Por estructura:
          //   1) f = g + ...      2) f[n] = ... + ...
          //   3) heappush(cola, (g + h, ...))      4) cola.put((g + h, ...))
          //   5) prioridad = g + ...
          //   6) costo + h(nodo, meta), con cualquier nombre: f_score = g + heuristica(n, meta)
          formas: [/\bf\s*=\s*[\w.\[\]]+\s*\+/,
                   /\bf\s*\[[^\]\n]+\]\s*=\s*[^\n]*\+/,
                   /heappush\(\s*[\w.]+\s*,\s*\(\s*[^,\n]*\+/,
                   /\.put\(\s*\(\s*[^,\n]*\+/,
                   /(?:prioridad|priority)\w*\s*=\s*[\w.\[\]]+\s*\+/i,
                   new RegExp("=\\s*[\\w.\\[\\]]+\\s*\\+\\s*[\\w.]+\\s*\\([^\\n]*" + META, "i")]
        },
        {
          id: "vecinos", peso: 1,
          texto: { es: "Expansión de celdas vecinas", en: "Expansion of neighboring cells" },
          palabras: ["neighbor", "neighbors", "neighbour", "neighbours", "vecino", "vecinos", "vecina",
                     "vecinas", "adyacente", "adyacentes", "adjacent", "sucesor", "sucesores", "successor",
                     "successors", "expand", "expandir", "moves", "movimientos", "direcciones", "directions"],
          // [F6] Por estructura:
          //   1) desplazamientos (1, 0), (0, 1), ...   2) lo mismo con listas [1, 0], [0, 1]
          //   3) range(-1, 2) para recorrer las 8 celdas vecinas
          formas: [/\(\s*-?1\s*,\s*-?[01]\s*\)\s*,\s*\(\s*-?[01]\s*,\s*-?1\s*\)/,
                   /\[\s*-?1\s*,\s*-?[01]\s*\]\s*,\s*\[\s*-?[01]\s*,\s*-?1\s*\]/,
                   /range\(\s*-1\s*,\s*2\s*\)/]
        },
        {
          id: "padres", peso: 2, nucleo: true,
          texto: { es: "Reconstrucción de la ruta por nodos padre", en: "Path reconstruction through parent nodes" },
          palabras: ["parent", "parents", "padre", "padres", "previo", "previos", "predecesor", "predecesores",
                     "predecessor", "predecessors", "came_from", "camefrom", "viene_de", "de_donde",
                     "back_pointer", "backpointer"],
          // [F6] Por estructura:
          //   1) regresar por los padres: while n in padres: n = padres[n]
          //   2) invertir la ruta: [::-1], .reverse(), reversed() o lista.insert(0, ...)
          //      (se descarta sys.path.insert)
          formas: [/while\s+[\w.]+\s+(?:in\b|is\s+not\b|!=)[^\n:]*:\s*\n[^\n]*\n?[^\n]*=\s*[\w.]+\s*\[\s*[\w.]+\s*\]/,
                   /\[\s*::\s*-1\s*\]|\.reverse\(\s*\)|\breversed\(|(?:^|[^.\w])\w+\.insert\(\s*0\s*,/m]
        },
        {
          id: "mapa", peso: 1,
          texto: { es: "Mapa de celdas, de ocupación o de costos", en: "Cell, occupancy or cost map" },
          palabras: ["grid", "occupancy", "costmap", "cost_map", "grid_map", "static_map", "mapa", "mapas",
                     "rejilla", "cuadricula", "celda", "celdas", "cell", "cells", "laberinto", "maze", "tablero"],
          // [F6] Por estructura:
          //   OccupancyGrid de ROS
          formas: [/OccupancyGrid/]
        }
      ]
    },

    /* ===================================================== Suavizado */
    {
      id: "suavizado-rutas",
      nombre: { es: "Suavizado de rutas", en: "Path smoothing" },
      descripcion: { es: "Descenso del gradiente sobre la ruta planeada", en: "Gradient descent on the planned path" },
      rasgos: [
        {
          id: "nombre", peso: 3, alcance: "todo",
          texto: { es: "Menciona el suavizado en nombres o comentarios", en: "Mentions smoothing in names or comments" },
          palabras: ["smooth", "suaviz", "alisado", "alisar"],
          // [F6] Por estructura:
          //   «smooth» o «suaviz» en cualquier parte, comentarios incluidos
          formas: [/smooth|suaviz/i]
        },
        {
          id: "gradiente", peso: 2,
          texto: { es: "Gradiente de la función de costo", en: "Gradient of the cost function" },
          palabras: ["gradient", "gradiente", "gradientes", "nabla", "grad", "derivada", "derivadas",
                     "derivative", "djdp"],
          // [F6] Por estructura:
          //   dJ, grad_J o nabla_J
          formas: [/\b(?:d|grad_?|nabla_?)J\b/]
        },
        {
          id: "vecinos-ruta", peso: 3, nucleo: true,
          texto: { es: "Usa los puntos vecinos de la ruta (P[i−1] y P[i+1])", en: "Uses the neighboring path points (P[i−1] and P[i+1])" },
          // [F6] Por estructura:
          //   1) P[i-1] ... P[i+1] con cualquier índice (i, k, j...)   2) en orden inverso
          //   3) slices de numpy P[:-2] y P[2:]   4) np.roll
          formas: [/\[\s*(\w+)\s*-\s*1\s*\][\s\S]{0,160}?\[\s*\1\s*\+\s*1\s*\]/,
                   /\[\s*(\w+)\s*\+\s*1\s*\][\s\S]{0,160}?\[\s*\1\s*-\s*1\s*\]/,
                   /\[\s*:\s*-\s*2\s*\][\s\S]{0,160}?\[\s*2\s*:\s*\]|\[\s*2\s*:\s*\][\s\S]{0,160}?\[\s*:\s*-\s*2\s*\]/,
                   /(?:np|numpy)\.roll\(/]
        },
        {
          id: "termino-suave", peso: 2, nucleo: true,
          texto: { es: "Término de suavidad 2·P[i] − P[i−1] − P[i+1]", en: "Smoothness term 2·P[i] − P[i−1] − P[i+1]" },
          // [F6] Por estructura:
          //   1) 2*P[i]   2) P[i-1] + P[i+1] - 2...   3) 2*P[1:-1] (numpy)
          formas: [/\b2(?:\.0*)?\s*\*\s*[\w.]+\s*\[\s*\w+\s*[\],]/,
                   /\[\s*(\w+)\s*-\s*1\s*\][^\n]*\+[^\n]*\[\s*\1\s*\+\s*1\s*\][^\n]*-\s*2/,
                   /\b2(?:\.0*)?\s*\*\s*\w+\s*\[\s*1\s*:\s*-\s*1/]
        },
        {
          id: "termino-datos", peso: 2, nucleo: true,
          texto: { es: "Término de apego a la ruta original (P[i] − Q[i])", en: "Term that keeps the original path (P[i] − Q[i])" },
          // [F6] Por estructura:
          //   1) P[i] - Q[i]: dos arreglos distintos con el mismo índice (no números)
          //   2) alpha*(P - Q), w_data*(P - Q), peso_datos*(P - Q)
          formas: [/\b(\w+)\s*\[\s*([A-Za-z_]\w*)\s*[\],][^\]\n]*\]?\s*-\s*(?!\1\b)\w+\s*\[\s*\2\b/,
                   /\b(?:alpha|alfa|w1|w_?data|weight_?data|peso_?datos?|w_?d)\s*\*\s*\(\s*[\w.\[\]:,\s-]+-\s*[\w.\[\]:,\s]+\)/i]
        },
        {
          id: "actualizacion", peso: 3, nucleo: true,
          texto: { es: "Actualización por descenso (P ← P − ε·∇)", en: "Descent update (P ← P − ε·∇)" },
          // [F6] Por estructura:
          //   1) P = P - eps*...  o  P -= alpha*...  (también self.paso*...)
          //   2) estilo clásico: P[i] += w1*(Q - P) + w2*(...), acepta «\» de continuación
          formas: [/[\w\]]\s*(?:=\s*[\w.]+(?:\[[^\]\n]*\])?\s*-|-=)\s*\(?\s*(?:\w+\.)?(?:epsilon|eps|alpha|alfa|lr|eta|step\w*|paso\w*|delta|gamma|tasa\w*|mu|k|\d*\.\d+)\s*\*/i,
                   /\+=\s*[\w.]+\s*\*\s*\(\s*[\w.\[\]]+\s*-\s*[\w.\[\]]+\s*\)\s*\+\s*(?:\\\s*)?[\w.]+\s*\*\s*\(/]
        },
        {
          id: "pesos", peso: 1,
          texto: { es: "Pesos de suavidad y de apego a los datos", en: "Smoothness and data weights" },
          palabras: ["w1", "w2", "w_data", "w_smooth", "weight_data", "weight_smooth", "alpha", "alfa",
                     "beta", "peso", "pesos", "peso_datos", "peso_suavizado", "peso_suavidad"]
        },
        {
          id: "convergencia", peso: 1,
          texto: { es: "Criterio de paro por tolerancia o número de pasos", en: "Stop criterion by tolerance or number of steps" },
          palabras: ["tol", "tolerance", "tolerancia", "epsilon", "converge", "convergencia", "change",
                     "cambio", "max_steps", "max_iter", "max_iterations", "iteraciones", "pasos", "steps"],
          // [F6] Por estructura:
          //   while ... > tol  /  while ... > eps
          formas: [/while\s+[^\n]*(?:>|>=)\s*[\w.]*(?:tol|eps)/i]
        },
        {
          id: "ruta", peso: 1,
          texto: { es: "Trabaja sobre una ruta de puntos", en: "Works on a path of points" },
          palabras: ["path", "ruta", "rutas", "camino", "trayectoria", "waypoints", "poses", "trajectory"]
        }
      ]
    },

    /* ===================================================== Campos potenciales */
    {
      id: "campos-potenciales",
      nombre: { es: "Campos potenciales", en: "Potential fields" },
      descripcion: { es: "Evasión de obstáculos con fuerzas de atracción y repulsión", en: "Obstacle avoidance with attractive and repulsive forces" },
      rasgos: [
        {
          id: "nombre", peso: 3, alcance: "todo",
          texto: { es: "Menciona campos potenciales en nombres o comentarios", en: "Mentions potential fields in names or comments" },
          palabras: ["potential", "potencial", "potenciales", "pot_fields", "potfields", "apf"],
          // [F6] Por estructura:
          //   pot_fields, potential, potencial o «campos potenciales»
          formas: [/pot(?:ential)?_?fields?|campos?[\s_]?potencial|potential|potencial/i]
        },
        {
          id: "atractiva", peso: 3, nucleo: true,
          texto: { es: "Fuerza atractiva hacia la meta", en: "Attractive force toward the goal" },
          palabras: ["attraction", "attractive", "attract", "atraccion", "atractiva", "atractivo", "atrae",
                     "f_att", "fatt", "f_atr", "fatr", "k_att", "katt"],
          // [F6] Por estructura:
          //   1) -k*(q - meta)   2) k*(meta - q)   3) k*(q - meta) (gradiente)
          //   4) cónica: -k * componente / magnitud (norm, hypot, dist...)
          formas: [new RegExp("-\\s*[\\w.]+\\s*\\*\\s*\\(?\\s*[\\w.\\[\\]]+\\s*-\\s*[\\w.\\[\\]]*" + META, "i"),
                   new RegExp("[\\w.]+\\s*\\*\\s*\\(\\s*[\\w.\\[\\]]*" + META + "[\\w.\\[\\]]*\\s*-\\s*[\\w.\\[\\]]+\\s*\\)", "i"),
                   new RegExp("[\\w.]+\\s*\\*\\s*\\(\\s*[\\w.\\[\\]]+\\s*-\\s*[\\w.\\[\\]]*" + META + "[\\w.\\[\\]]*\\s*\\)", "i"),
                   /-\s*[\w.]+\s*\*\s*[^\n]*\/\s*\w*(?:mag|norm|dist|hypot|modulo|longitud)\w*/i]
        },
        {
          id: "repulsiva", peso: 3, nucleo: true,
          texto: { es: "Fuerza repulsiva de los obstáculos (1/d − 1/d₀)", en: "Repulsive force from obstacles (1/d − 1/d₀)" },
          palabras: ["repulsion", "repulsive", "repulsiva", "repulsivo", "repulsivas", "repel", "rejection",
                     "reject", "rechazo", "f_rep", "frep", "f_rej", "frej", "k_rep", "krep"],
          // [F6] Por estructura:
          //   1/d - 1/d0 (con o sin decimales: 1.0/d - 1.0/d0)
          formas: [/\b1(?:\.0*)?\s*\/\s*[\w.\[\]]+\s*-\s*1(?:\.0*)?\s*\/\s*[\w.\[\]]+/]
        },
        {
          id: "influencia", peso: 2, nucleo: true,
          texto: { es: "Distancia de influencia d₀", en: "Influence distance d₀" },
          palabras: ["d0", "d_0", "rho0", "rho_0", "d_max", "dmax", "influence", "influencia",
                     "radio_influencia", "distancia_segura", "safe_distance"],
          // [F6] Por estructura:
          //   comparar con la distancia de influencia, también dentro de and/or:
          //   if d < d0 / rho0 / dmax / radio / influencia
          formas: [/\b(?:if|elif|and|or|while)\s+[^\n]*?[\w.\])]\s*<=?\s*[\w.]*(?:d0|d_0|rho0|rho_0|dmax|d_max|influ|radio)\w*/i]
        },
        {
          id: "ganancias", peso: 1,
          texto: { es: "Ganancias de atracción y repulsión (η, ζ)", en: "Attraction and repulsion gains (η, ζ)" },
          palabras: ["eta", "zeta", "k_att", "k_rep", "ka", "kr", "ganancia", "ganancias", "gain", "gains"]
        },
        {
          id: "sensor", peso: 2,
          texto: { es: "Lecturas de distancia a los obstáculos", en: "Distance readings to obstacles" },
          palabras: ["laserscan", "laser", "lidar", "sonar", "ranges", "scan", "lectura", "lecturas",
                     "obstacle", "obstacles", "obstaculo", "obstaculos"],
          // [F6] Por estructura:
          //   1) ángulo de cada lectura: angle_min + k*angle_increment   2) LaserScan
          formas: [/angle_min\s*\+\s*[\w.]+\s*\*\s*[\w.]*angle_increment/, /LaserScan/]
        },
        {
          id: "fuerza", peso: 2, nucleo: true,
          texto: { es: "Suma de fuerzas en un vector resultante", en: "Sum of forces into a resulting vector" },
          palabras: ["force", "forces", "fuerza", "fuerzas", "resultante", "resultant", "f_total", "ftotal", "f_res"],
          // [F6] Por estructura:
          //   acumular componentes con cos/sin: fx += f*cos(angulo)
          formas: [/\+=\s*[^\n]*\b(?:cos|sin)\s*\(/]
        },
        {
          id: "velocidad", peso: 1,
          texto: { es: "Envía velocidades al robot", en: "Sends velocities to the robot" },
          palabras: ["cmd_vel", "twist", "velocidad", "velocidades", "velocity"],
          // [F6] Por estructura:
          //   cmd_vel, Twist, linear.x, angular.z
          formas: [/cmd_vel|\bTwist\b|linear\.x|angular\.z/]
        }
      ]
    },

    /* ===================================================== Cinemática inversa */
    {
      id: "cinematica-inversa",
      nombre: { es: "Cinemática inversa", en: "Inverse kinematics" },
      descripcion: { es: "Ángulos articulares del brazo para alcanzar una posición", en: "Joint angles of the arm to reach a position" },
      rasgos: [
        {
          id: "nombre", peso: 3, alcance: "todo",
          texto: { es: "Menciona la cinemática inversa en nombres o comentarios", en: "Mentions inverse kinematics in names or comments" },
          palabras: ["inverse_kinematics", "inversekinematics", "ik", "ikine", "cinematica_inversa", "cin_inversa"],
          // [F6] Por estructura:
          //   inverse kinematics, cinemática inversa, ik
          formas: [/inverse[\s_]?kinematics|cinem[aá]tica[\s_]?inversa|\bik\b|\bik_|_ik\b|\bikine/i]
        },
        {
          id: "directa", peso: 2, nucleo: true,
          texto: { es: "Cinemática directa (transformaciones homogéneas)", en: "Forward kinematics (homogeneous transformations)" },
          palabras: ["forward_kinematics", "fk", "fkine", "cinematica_directa", "cin_directa", "directa",
                     "denavit", "hartenberg", "dh", "homogeneous", "homogenea", "homogeneas", "htm"],
          // [F6] Por estructura:
          //   (Las matrices fijas con última fila [0, 0, 0, 1] no cuentan: la
          //   plantilla ya las trae. Cuenta multiplicarlas con los ángulos.)
          //   1) producto encadenado T = T @ Ti   2) T = np.dot(T, Ti)
          //   3) brazo plano: x += l*cos(angulo)
          //   4) brazo plano en una línea: l1*cos(q1) + l2*cos(q1 + q2)
          //   5) producto encadenado con *: T = T * H[i] (SymPy)
          formas: [/\b(\w+)\s*=\s*\1\s*@\s*\w+/,
                   /\b(\w+)\s*=\s*(?:np|numpy)\.(?:dot|matmul)\(\s*\1\s*,/,
                   /\+=\s*[\w.\[\]]+\s*\*\s*(?:np\.|numpy\.|math\.)?cos\s*\(/,
                   /[\w.]+\s*\*\s*(?:math\.|np\.|numpy\.)?cos\s*\([^)\n]*\)\s*\+\s*[\w.]+\s*\*\s*(?:math\.|np\.|numpy\.)?cos\s*\(/,
                   /\b(\w+)\s*=\s*\1\s*\*\s*[\w.]+\s*\[\s*\w+\s*\]/]
        },
        {
          id: "jacobiano", peso: 3, nucleo: true,
          texto: { es: "Jacobiano (analítico o por diferencias finitas)", en: "Jacobian (analytical or by finite differences)" },
          palabras: ["jacobian", "jacobiano", "jacobiana", "jac", "jacob"],
          // [F6] Por estructura:
          //   1) diferencias centrales: (f(q+h) - f(q-h)) / (2*h)
          //   2) diferencias hacia adelante: (f(q+h) - f(q)) / h
          //   3) llenar columnas: J[:, j] = ...   4) J = np.zeros(...) / sympy.Matrix(...)
          //   5) jacobiano simbólico de SymPy: X.jacobian(q) (no cuenta
          //      self.jacobian(q), que solo llama a la función de la plantilla)
          formas: [/\(\s*[\w.]+\s*\([^()\n]*\+[^()\n]*\)\s*-\s*[\w.]+\s*\([^()\n]*-[^()\n]*\)\s*\)\s*\/\s*\(?\s*2(?:\.0*)?\s*\*/,
                   /\(\s*[\w.]+\s*\([^()\n]*\+[^()\n]*\)\s*-\s*[\w.]+\s*\([^()\n]*\)\s*\)\s*\/\s*[\w.]+/,
                   /\bJ\s*\[\s*:\s*,\s*\w+\s*\]\s*=/,
                   /\bJ\s*=\s*(?:np|numpy|sympy|sp)\.(?:zeros|empty|Matrix)/,
                   /\b(?!self\b)\w+\.jacobian\s*\(/]
        },
        {
          id: "solucion", peso: 3, nucleo: true,
          texto: { es: "Newton-Raphson, pseudoinversa o solución geométrica", en: "Newton-Raphson, pseudoinverse or geometric solution" },
          palabras: ["newton", "raphson", "newton_raphson", "pinv", "pseudoinversa", "pseudoinverse",
                     "lstsq", "levenberg", "marquardt"],
          // [F6] Por estructura:
          //   1) np.linalg.pinv / lstsq
          //   2) Newton-Raphson: q = q - pinv(J) @ e  /  inv(...)  /  solve(...)
          //   3) transpuesta del jacobiano: q = q + k * J.T @ e
          //   4) geométrica, ley de cosenos: acos((x**2 + y**2 - l1**2 - l2**2) / ...)
          //   5) ley de cosenos sin acos: (x**2 + y**2 - l1**2 - l2**2) / (2*l1*l2)
          formas: [/(?:np|numpy)\.linalg\.(?:pinv|lstsq)/,
                   /\b(\w+)\s*(?:=\s*\1\s*[-+]|[-+]=)\s*[^\n]*(?:pinv|inv|solve|lstsq)\s*\(/,
                   /\b(\w+)\s*(?:=\s*\1\s*[-+]|[-+]=)\s*[^\n]*\.T\s*@/,
                   /\b(?:a?r?c?cos|acos)\s*\(\s*\(?[^\n]*\*\*\s*2[^\n]*-[^\n]*\*\*\s*2/,
                   /\(\s*[\w.]+\s*\*\*\s*2\s*\+\s*[\w.]+\s*\*\*\s*2\s*-\s*[\w.]+\s*\*\*\s*2\s*-\s*[\w.]+\s*\*\*\s*2\s*\)\s*\//]
        },
        {
          id: "articulaciones", peso: 2,
          texto: { es: "Ángulos articulares q", en: "Joint angles q" },
          palabras: ["q", "q0", "q1", "q2", "q3", "q4", "q5", "q6", "qs", "joint", "joints", "articulacion",
                     "articulaciones", "articular", "articulares", "theta1", "theta2", "theta3", "th1",
                     "th2", "th3", "eslabon", "eslabones", "dof", "gdl"]
        },
        {
          id: "iteracion", peso: 2, nucleo: true,
          texto: { es: "Iteración hasta reducir el error", en: "Iteration until the error is reduced" },
          palabras: ["max_iter", "max_iters", "max_iterations", "iteraciones", "iteracion", "iterations",
                     "max_intentos", "intentos"],
          // [F6] Por estructura:
          //   1) while ... norm / err / tol / abs ...   2) for ... in range(max_iter)
          formas: [/while[^\n]*(?:norm|err|error|tol|abs)/i,
                   /for\s+\w+\s+in\s+range\([^)\n]*(?:max|iter|intent)/i]
        },
        {
          id: "trigonometria", peso: 1,
          texto: { es: "Funciones trigonométricas de los eslabones", en: "Trigonometric functions of the links" },
          // [F6] Por estructura:
          //   cos, sin, atan2, acos
          formas: [/\b(?:cos|sin|arctan2|atan2|acos|arccos)\s*\(/]
        },
        {
          id: "pose-deseada", peso: 1,
          texto: { es: "Pose o posición deseada del efector", en: "Desired pose or position of the end effector" },
          palabras: ["xd", "x_d", "p_d", "pd", "x_des", "p_des", "desired", "deseada", "deseado",
                     "target", "target_pose", "goal_pose", "efector", "end_effector", "effector", "tcp"]
        }
      ]
    }
  ];
})(globalThis);
