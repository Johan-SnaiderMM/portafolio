# Portafolio de Johan Moreno

Sitio personal con proyectos, laboratorio de IA, un asistente y contacto. Oscuro, técnico y minimalista («fósforo ámbar»), en español e inglés.

> **Estado:** fase 1 de 8 (esqueleto). El plan completo, las decisiones y el estado de cada fase están en [`docs/PLAN.md`](docs/PLAN.md).

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
  content/projects.ts  datos de proyectos que no dependen del idioma (enlaces, stack)
  i18n/              diccionarios es/en tipados, idioma por defecto y negociación
  proxy.ts           redirige «/» a /es o /en según Accept-Language
docs/PLAN.md         plan, decisiones y fases
```

## Decisiones técnicas

- **Next.js 16 con `cacheComponents`.** Antes de tocar nada de Next, leer `AGENTS.md`: esta versión cambia convenciones (por ejemplo `middleware` se llama `proxy`).
- **Idiomas por ruta (`/es`, `/en`).** Los textos viven en `src/i18n/es.ts` y `en.ts`; `Dictionary` obliga a que tengan las mismas claves y una prueba lo comprueba. Las cifras medidas usan el formato de cada idioma (`98,1 %` / `98.1%`).
- **Datos de proyectos separados de los textos.** Enlaces y tecnologías están en `src/content/projects.ts`; agregar un proyecto sin texto en los dos idiomas no compila.
- **Animación con CSS.** La entrada de la portada y la aparición al hacer scroll usan CSS (`animation-timeline: view()` donde existe); si el navegador no lo soporta, todo queda visible. `prefers-reduced-motion` las apaga.
- **Sin firma de Claude en los commits** (pedido de Johan).

## Diseño

Negro cálido y un solo color vivo. Tokens en `src/app/globals.css`: Tinta `#0B0A08`, Hollín `#13110E`, Trazo `#2A261F`, Ceniza `#8C8576`, Hueso `#ECE7DA`, Ámbar `#FFB020`. Tipografías: Martian Mono (nombre, titulares, datos) e Instrument Sans (texto).
