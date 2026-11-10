# Portafolio de Johan Moreno · plan (cerrado el 9-nov-2026)

**Objetivo:** una página fuera de GitHub que, en menos de un minuto, le demuestre a un reclutador que Johan construye cosas con cifras reales, usa IA y cuida los detalles. Oscura, técnica y minimalista, con un 3D ligero.

## Decisiones cerradas (respuestas de Johan, 9-nov)
| Tema | Decisión |
|---|---|
| Estilo | Oscuro, técnico y minimalista, con 3D |
| Color de acento | **Ámbar** |
| Fotos | Ninguna por ahora: solo texto y gráficos hechos por Claude |
| Contacto | Formulario con **Resend** (correo gratis); el correo de Johan va solo en una variable de entorno, no se publica |
| Proyectos destacados | Los 5: Mesa de ayuda TI, Red neuronal desde cero, Clasificador de hojas de banano, Orígenes y Comanda |
| Nombre en la página | **Johan Moreno** (sin «Snaider»; «La ficha» no aparece) |
| Repositorio | **Privado hasta el lanzamiento** (decisión mía, Johan dijo «como lo veas mejor» y autorizó crearlo el 9-nov): `Johan-SnaiderMM/portafolio`; se hace público en la fase 8 |
| Dirección | https://johan-moreno.vercel.app (proyecto de Vercel `johan-moreno`, $0); el dominio propio queda como opción futura |
| Agente | API gratuita (Groq con Gemini de respaldo), con límites; sin pagar nada |

## Dirección visual: «fósforo ámbar»
Un monitor de fósforo ámbar de los de antes, y también el amarillo del banano de Urabá (las hojas del clasificador). El ámbar no es un adorno: es el único color vivo sobre un negro cálido.

- **Paleta:** Tinta `#0B0A08` (fondo) · Hollín `#13110E` (superficies) · Trazo `#2A261F` (líneas finas) · Ceniza `#8C8576` (texto secundario) · Hueso `#ECE7DA` (texto) · Ámbar `#FFB020` (acento).
- **Tipografía:** **Martian Mono** para el nombre, los titulares y los datos; **Instrument Sans** para los párrafos. Sin las combinaciones de siempre.
- **Firma de la página:** la red neuronal ámbar de la portada (fase 2): trazos finos que brillan como fósforo y reaccionan al cursor. El resto se queda quieto y sin decoración.
- **Estructura:** todo alineado a la izquierda, mucho espacio vacío, proyectos en **filas con líneas finas** (no tarjetas), sin numeración decorativa.
- **Movimiento:** una sola secuencia de entrada en la portada, apariciones suaves al hacer scroll y microinteracciones al pasar el cursor. Todo respeta `prefers-reduced-motion`.
- **Textos:** salen de las descripciones que Johan ya aprobó en LinkedIn y GitHub; las cifras son las medidas (ver nota abajo).

## Piezas
| Pieza | Qué es |
|---|---|
| **Portada 3D** | Red neuronal de puntos y líneas en ámbar. Al bajar se ordena en capas (entrada → ocultas → salida) y en el contacto se enciende la salida. Ligera; con alternativa estática si el equipo es débil, no hay WebGL o se pidió menos movimiento. |
| **Proyectos** | 5 destacados con el problema que resuelven, stack, **una cifra real** y enlaces a demo y código. El resto, en una lista corta. |
| **Laboratorio** | Dibujas un dígito y la red hecha con NumPy lo reconoce en el navegador. Luego el clasificador de hojas. |
| **Agente** | Chat que responde sobre la experiencia y los proyectos de Johan, con su información como único contexto. |
| **Contacto como ticket** | Formulario con asunto, prioridad y mensaje; llega por correo (Resend). |
| **Extras** | Español e inglés, descarga de CV (decidir en la fase 6 si el PDF va público, porque trae teléfono y correo) y enlace «Versión rápida» sin animaciones. |

## Datos reales que se usan (de `Johan-SnaiderMM/README.md`)
1. **Mesa de ayuda TI** · Angular · NestJS · Prisma · PostgreSQL · **294 pruebas** automáticas (108 de integración contra PostgreSQL real), CI, Vercel + Neon · demo con datos ficticios https://mesa-ayuda-ti-sandy.vercel.app · código https://github.com/Johan-SnaiderMM/mesa-ayuda-ti
2. **Red neuronal desde cero** · NumPy, sin PyTorch ni TensorFlow · **98,1 %** en las 10 000 imágenes de prueba de MNIST · https://red-neuronal-desde-cero.vercel.app · https://github.com/Johan-SnaiderMM/red-neuronal-desde-cero
3. **Clasificador de hojas de banano** · MobileNetV2 → ONNX en el navegador · **98,5 %** en 134 fotos de prueba (fotos de Bangladesh; sin validar aún con hojas de Urabá) · https://clasificador-hojas-banano.vercel.app · https://github.com/Johan-SnaiderMM/clasificador-hojas-banano
4. **Orígenes** · memoria histórica de Urabá: escenas 360°, realidad aumentada y «Aruma», una avatar con IA (Llama 3.3 vía Groq) · React · Express · Three.js · https://www.aruma-origenes.com/login · https://github.com/Johan-SnaiderMM/origenes
5. **Comanda** · restaurantes pequeños, versión real en uso; funciona sin conexión · Next.js · Supabase · demo https://comandacomi.vercel.app · https://github.com/Johan-SnaiderMM/comandacomi

> **Honestidad en los números:** 98,1 % es con un dígito aislado; la lectura de números completos se midió con secuencias **sintéticas** (86,5 % bien). Las demos usan datos inventados, también las cifras del panel de la mesa de ayuda; de ese proyecto lo medido es el conteo de pruebas. El texto de la página dice esto.

Secundarios (lista corta): Polo Air Cool (en uso real), Barberías, Servitecas, Consultorio psicológico, Reporte ambiental.

## Cómo se construye
- **Base:** Next.js 16 (App Router, `cacheComponents`) + TypeScript + Tailwind 4. La animación de la fase 1 es solo CSS; `motion` (Framer Motion) se suma únicamente si una fase posterior lo necesita. Despliegue en Vercel como el resto de sus apps (equipo `johan-moreno-s-projects`).
- **Idiomas:** `/es` y `/en` (segmento `[lang]`), `/` redirige según el idioma del navegador; diccionarios tipados y una prueba de que ambos tienen las mismas claves.
- **3D:** **Three.js directo** (cambio respecto al plan inicial: es una sola escena movida por *shaders* y React Three Fiber solo agregaba una capa), cargado de forma diferida (~132 kB gzip, fuera de la primera carga), con el esquema SVG como alternativa. Detalles en el README.
- **Laboratorio (ahorro de trabajo):** ya existe código y prueba de paridad en `red-neuronal-desde-cero/web` (`red.ts`, `modelo.json` de 570 KB, `preprocesar.ts`); se reutiliza. El clasificador de hojas pesa **8,7 MB (modelo) + 14,5 MB (runtime WASM)**: solo se descarga cuando el visitante pulsa «Probar» o se enlaza a la demo existente.
- **Agente (gratis):** ruta `/api/chat` en el servidor que llama a Groq (Llama 3.3, capa gratuita) con Gemini gratuito de respaldo. La clave solo vive en variables de entorno de Vercel. Contexto cerrado (CV y proyectos), «no lo sé» como respuesta válida, límite por visitante y tope diario, mensaje de cortesía cuando se acabe la cuota, aviso de que es una IA y sin guardar conversaciones. Los límites vigentes se verifican antes de construirlo.
- **Contacto:** Resend (plan gratuito) desde una ruta del servidor; el destinatario va en una variable de entorno. Mientras no haya dominio propio, Resend solo permite enviar al correo de la cuenta; para esto basta.
- **Commits:** sin firma de Claude (pedido de Johan) y con el correo noreply de GitHub.

## Fases
| Fase | Entregable | Cómo sabemos que está listo | Estado |
|---|---|---|---|
| 0. Ajustes | Plan cerrado | Johan respondió las 6 preguntas | **Hecha** |
| 1. Esqueleto | Proyecto Next.js, tema fósforo ámbar, navegación, secciones con textos reales, español/inglés, despliegue de prueba | Se ve bien en escritorio y celular; URL pública de vista previa; lint, tipos, pruebas y build en verde | **Hecha** (9-nov): 15 pruebas, lint, tipos y build en verde; revisada a 1280 px y 390 px; menú móvil y redirección de idioma probados. En línea en https://johan-moreno.vercel.app (sin indexar), repositorio privado `Johan-SnaiderMM/portafolio` y despliegue automático en cada push a `main`. |
| 2. Portada 3D | Red neuronal interactiva + narración con el scroll + alternativa estática | 60 fps en el computador de Johan y buen rendimiento en un celular de gama baja | **Hecha** (9-nov). Medido en este computador (GPU Intel UHD) con Edge sin cabeza y el contador `?fps`: **144 cuadros por segundo** (6,9 ms; el máximo de la pantalla) a 1280×800, arriba y en el contacto, y lo mismo emulando un celular de 390×844 con el procesador 4× más lento. Alternativas probadas: «menos movimiento», `?3d=off`, sin WebGL, sin aceleración por hardware, y el control de rendimiento que baja la calidad y retira la escena si va lenta. **No probado en un celular real de gama baja:** se confirma abriendo el sitio con `?fps` en ese teléfono. |
| 3. Proyectos | 5 destacados + lista, portadas nuevas, páginas de detalle cortas | Todos los enlaces funcionan | Hecha (2026-11-09): `/[lang]/projects/[slug]` ×5, portadas sin texto (sirven a es y en) generadas con `npm run portadas`, enlaces revisados con `npm run enlaces` (todos 200; LinkedIn responde 999 a los robots). Orígenes usa un gráfico (esfera de alambre), sin capturas reales. |
| 4. Laboratorio | Dibujar un dígito → predicción; 4b: hojas de banano con carga diferida | Prueba de paridad JS vs. NumPy | Hecha (2026-11-10): sección «Laboratorio» de la portada con las dos demos. Dígitos: red de NumPy portada a TypeScript (`src/lib/lab/digitos`, 34 pruebas, paridad de logits con NumPy) y modelo de 570 KB que se descarga al acercarse el scroll. Hojas: onnxruntime-web (`src/lib/lab/hojas`, paridad con PyTorch); modelo 8,9 MB + WebAssembly 14,8 MB solo al analizar una foto (el `.wasm` lo copia `scripts/copiar-wasm.mjs` en `postinstall` y `build`; no está en git). Límites del modelo y crédito CC BY 4.0 del dataset visibles. |
| 5. Agente | Chat con API gratuita, límites y respaldo | Pruebas con preguntas fuera de tema, intentos de saltarse las reglas y cuota agotada | Hecha y encendida en producción (2026-11-10): claves de Groq y Gemini en Vercel (sensibles, solo producción). Probada con el modelo real: datos correctos, sin teléfono/correo, rechaza código y roles («DAN»), no filtra el prompt, «no sé» sobre el grado, responde en el idioma del usuario. 26 pruebas automáticas (validación, límites, respaldo, cuota agotada, ruta completa, el conocimiento no trae teléfono/correo/fecha de grado). Cifras de las capas gratuitas: no verificables en la documentación oficial (son por cuenta); el diseño no depende de ellas. |
| 6. Contacto y CV | Formulario tipo ticket y descarga del CV | Llega un correo de prueba | |
| 7. Pulido | Rendimiento, accesibilidad, SEO, imagen para compartir (Open Graph), «Versión rápida» | Lighthouse móvil ≥ 90 en rendimiento y ≥ 95 en accesibilidad; navegable con teclado | |
| 8. Lanzamiento | Repositorio público y enlace en LinkedIn, GitHub, CV y firmas | URL final en todos lados | |

Revisión con Johan al final de las fases 2, 4 y 5.

## Gráficos que hace Claude
Portadas de los 5 proyectos (HTML renderizado a PNG, como las de LinkedIn), imagen para compartir 1200×630, favicon, alternativa estática de la portada 3D y capturas de las demos. Sin fotos de Johan.

## Costos y riesgos
- **Costo $0:** Vercel gratis, Groq/Gemini/Resend en capas gratuitas, dirección `.vercel.app`.
- Límites gratuitos que cambian → respaldo y mensaje elegante; el portafolio funciona aunque el agente falle.
- 3D pesado en celulares viejos → carga diferida, alternativa estática y presupuesto de peso.
- El agente dice algo falso o se sale del tema → contexto cerrado y pruebas de abuso.
- Un reclutador no técnico se pierde → «Versión rápida» y el CV a un clic.
- La carpeta está dentro de OneDrive: `node_modules` y `.next` sincronizan miles de archivos; si molesta, se mueve el proyecto fuera de OneDrive.
