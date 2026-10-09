# VFXBYFLEX

Sitio de cotización para el editor de VFX Flex. Astro estático, sin backend: el carrito vive en el navegador y el pedido se envía por WhatsApp.

## Comandos

- `npm run dev` — desarrollo
- `npm run build` — build estático en `dist/`
- `npm test` — tests unitarios (Vitest)
- `npm run test:e2e` — smoke test (Playwright)

## Para Flex — qué editar

| Qué | Dónde |
|---|---|
| Precios y servicios | `src/data/services.ts` |
| Proyectos destacados (link + miniatura) | `src/data/projects.ts` + archivos en `public/projects/` |
| WhatsApp, Instagram, email | `src/config/site.ts` |

## Deploy

Sube a Netlify o Cloudflare Pages apuntando al repo. Build: `npm run build`, publish: `dist`. No necesita variables de entorno.

Actualizá `site` en `astro.config.mjs` con el dominio real una vez deployado (se usa para canonical y `og:image`).
