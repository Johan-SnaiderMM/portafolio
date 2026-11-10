# Portafolio de Johan Moreno

Sitio personal con proyectos, laboratorio de IA, un asistente y contacto. Oscuro, técnico y minimalista («fósforo ámbar»), en español e inglés.

> **Estado:** fase 1 de 8 hecha (esqueleto). En línea, sin indexar: https://johan-moreno.vercel.app. El plan completo, las decisiones y el estado de cada fase están en [`docs/PLAN.md`](docs/PLAN.md).

## Despliegue

- Repositorio **privado** `Johan-SnaiderMM/portafolio`; cada push a `main` despliega solo en Vercel (proyecto `johan-moreno`, equipo `johan-moreno-s-projects`, Node 24, Vercel Authentication apagada para que la vista previa sea pública).
- Mientras `SITE_INDEXABLE` no sea `true`, todas las páginas llevan `noindex, nofollow`.
- **Al lanzar (fase 8):** poner `SITE_INDEXABLE=true` en las variables de Vercel (producción), hacer público el repositorio y revisar el enlace en LinkedIn, GitHub y el CV.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:3000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compilación y servidor de producción |
| `npm run verificar` | Lint + tipos + pruebas (correrlo antes de cada commit) |
| `npm test` | Pruebas (Vitest) |
| `npm run enlaces` | Revisa que todos los enlaces de `src/content/projects.ts` respondan (LinkedIn devuelve 999 a los robots y se acepta) |
| `npm run portadas [id…]` | Regenera las portadas 1200×630 de `public/projects` desde `scripts/portadas/portada.html` y las capturas de `scripts/portadas/fuentes` |

Requiere Node 24 (el mismo de Vercel).

## Variables de entorno

| Variable | Para qué | Por defecto |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública, para metas de compartir y enlaces canónicos | `VERCEL_PROJECT_PRODUCTION_URL` en Vercel; `http://localhost:3000` en local |
| `SITE_INDEXABLE` | `true` permite que los buscadores indexen el sitio | vacío = `noindex` (hasta el lanzamiento) |

Las fases 5 y 6 sumarán las claves de Groq/Gemini y de Resend; **solo van en variables de entorno del servidor**, nunca en el código ni en el navegador.

## Estructura

```
src/
  app/[lang]/        layout raíz (html lang) y página; /es y /en
  app/globals.css    tema (colores, animaciones) en Tailwind 4
  components/        Header, Hero, Projects, NetworkDiagram, etc.
  components/network/  fondo 3D: escena de Three.js, shaders y carga diferida
  content/projects.ts  datos de proyectos que no dependen del idioma (enlaces, stack)
  i18n/              diccionarios es/en tipados, idioma por defecto y negociación
  lib/network/       lógica pura de la red 3D: diseño, colocación según el scroll, capacidad, control de rendimiento
  proxy.ts           redirige «/» a /es o /en según Accept-Language
scripts/probar-navegador.mjs  prueba el sitio en Chrome/Edge sin cabeza (capturas, consola, cuadros por segundo);
                     escenarios `demo` (captura cualquier URL) y `guion` (sigue un JSON de pasos: scripts/portadas/guiones)
scripts/copiar-wasm.mjs  copia el WebAssembly de onnxruntime-web a public/lab/ort (postinstall y build; ignorado por git)
scripts/portadas/    plantilla de las portadas, guiones y capturas de origen (demos reales de los proyectos)
docs/PLAN.md         plan, decisiones y fases
```

## Red 3D de la portada

Un fondo fijo con una red neuronal de puntos y líneas ámbar (Three.js directo, un solo juego de *shaders*). Nace como nube suelta en el hueco de la portada, se ordena en capas al bajar, se acopla al lado como fondo tenue y, en el contacto, enciende la salida. Reacciona al cursor.

- **Carga diferida:** `NetworkBackdrop` importa la escena después de `load`; el *chunk* de Three.js (~132 kB gzip) no entra en la primera carga.
- **Alternativa siempre disponible:** el esquema SVG de la portada (`NetworkDiagram`) es lo que se ve sin JavaScript, mientras carga la escena y cuando no se usa 3D. Quien pide «menos movimiento» o «ahorro de datos» nunca recibe 3D; tampoco los equipos de ≤ 2 GB, ≤ 2 núcleos o sin WebGL con aceleración por hardware (la sonda usa `failIfMajorPerformanceCaveat`, así no se descarga la escena para dibujarla por software).
- **Control de rendimiento:** si el promedio pasa de ~28 ms por cuadro (90 cuadros), baja primero la resolución y apaga el empuje del cursor; si sigue lento, la escena se retira sola y queda el SVG. Las pausas largas (pestaña oculta) no cuentan y cada cuadro pesa como máximo 100 ms.
- **Medido:** 144 cuadros por segundo (6,9 ms) en la GPU Intel UHD del equipo de desarrollo, a 1280×800 y también emulando un celular de 390×844 con el procesador 4× más lento. En un teléfono real de gama baja se comprueba abriendo el sitio con `?fps`.
- **Direcciones de prueba:** `?3d=off` fuerza la versión estática, `?3d=on` se salta las pruebas de equipo y el control de rendimiento (no las preferencias de la persona) y `?fps` muestra un contador de cuadros por segundo.
- **Código:** la lógica pura (red, colocación según el scroll, capacidad, control) está en `src/lib/network/` con pruebas; lo que toca WebGL, en `src/components/network/`.
- **Probarla en un navegador real:** con el sitio corriendo (`npm run build && npm start`), `BASE=http://localhost:3000 node scripts/probar-navegador.mjs escritorio` (o `movil`, `puntero`, `alternativas`, `gobernador`) deja capturas en `capturas/` y muestra los cuadros por segundo. `GPU=1` usa la tarjeta gráfica real; sin eso, WebGL por software, que es mucho más lento y sirve para probar la alternativa de equipos lentos.

## Decisiones técnicas

- **Next.js 16 con `cacheComponents`.** Antes de tocar nada de Next, leer `AGENTS.md`: esta versión cambia convenciones (por ejemplo `middleware` se llama `proxy`).
- **Idiomas por ruta (`/es`, `/en`).** Los textos viven en `src/i18n/es.ts` y `en.ts`; `Dictionary` obliga a que tengan las mismas claves y una prueba lo comprueba. Las cifras medidas usan el formato de cada idioma (`98,1 %` / `98.1%`).
- **Datos de proyectos separados de los textos.** Enlaces y tecnologías están en `src/content/projects.ts`; agregar un proyecto sin texto en los dos idiomas no compila.
- **Animación con CSS.** La entrada de la portada y la aparición al hacer scroll usan CSS (`animation-timeline: view()` donde existe); si el navegador no lo soporta, todo queda visible. `prefers-reduced-motion` las apaga.
- **Sin firma de Claude en los commits** (pedido de Johan).

## Diseño

Negro cálido y un solo color vivo. Tokens en `src/app/globals.css`: Tinta `#0B0A08`, Hollín `#13110E`, Trazo `#2A261F`, Ceniza `#8C8576`, Hueso `#ECE7DA`, Ámbar `#FFB020`. Tipografías: Martian Mono (nombre, titulares, datos) e Instrument Sans (texto).
