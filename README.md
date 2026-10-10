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
| Proyectos destacados (link + miniatura) | `src/data/projects.ts` + imágenes en `src/assets/projects/` |
| WhatsApp, Instagram, email | `src/config/site.ts` |

## Deploy

Deployado en Vercel (proyecto `vfxby-flex` → `https://vfxby-flex.vercel.app`). Build: `npm run build`, publish: `dist`. No necesita variables de entorno.

`site` en `astro.config.mjs` es la fuente de verdad del dominio: alimenta canonical, `og:image`, `robots.txt` y `sitemap.xml`. Para usar otro dominio, cambiá `site` y volvé a deployar.
