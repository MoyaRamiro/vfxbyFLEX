# VFXBYFLEX — Sitio de cotización para editor de VFX

**Fecha:** 2026-10-08
**Estado:** Aprobado en diseño (secciones 1-4), pendiente de revisión del spec
**Ruta:** `D:\PAGINAS WEB` → proyecto `vfxbyflex`

## Objetivo

Sitio de una sola página para **Flex** (editor de VFX, Instagram [@vfxbyflex](https://www.instagram.com/vfxbyflex/)) donde un artista pueda:

1. Ver los proyectos destacados de Flex
2. Configurar su pedido (visualizer, croma, VFX, montaje, extras) viendo el precio en vivo
3. Dejar notas detalladas
4. Enviar todo por **WhatsApp** al editor, con el mensaje completo y el total armado

El sitio no tiene backend: es Astro estático, el carrito vive en el navegador y el "checkout" abre WhatsApp con el pedido pre-cargado. El MP3 de la canción lo envía el cliente por el mismo chat de WhatsApp (recordatorio incluido en el mensaje).

## Contacto (config del sitio)

| Dato | Valor |
|---|---|
| Instagram | https://www.instagram.com/vfxbyflex/ |
| WhatsApp | +54 9 3794 27-0276 → `https://wa.me/5493794270276` |
| Email | negocioyocio808@gmail.com (solo visible en footer, `mailto:`) |
| Moneda | USD |

## Dirección visual

- **Base:** fondo blanco (`#FFFFFF` / blanco cálido `#FAFAFA`), texto negro `#0A0A0A`, superficies gris claras para tarjetas. Mucho espacio en blanco.
- **Acentos (los únicos):** verde lima `#B7FF2E` y celeste `#2EE6FF` — botones, bordes, glows, links, momentos de motion. Sin magenta ni otros colores.
- **Tipografía:** Space Grotesk (display bold + cuerpo), vía `@fontsource` sin Google CDN.
- **Detalles editoriales:** timecodes, barras de timeline en línea negra fina (estilo storyboard), scanlines muy sutiles.
- **Tokens:** CSS variables con derivación OKLCH desde un `--brand-hue` (skills `design-taste-frontend`, `tailwindcss`, `ui-styling`).

## Estructura de la página (single page `/`)

1. **Hero** — "VFXBYFLEX", tagline, CTA "Cotizar ahora" (scroll al configurador), link Instagram
2. **Destacados** — grid de cards (miniatura + título) con link a Instagram/YouTube en nueva pestaña; datos en `src/data/projects.ts` con placeholders editables
3. **Configurador** — tarjetas de los 6 servicios con opciones y precios visibles
4. **Cotización** — botón flotante "Ver carrito (n)" + drawer lateral
5. **Footer** — Instagram, WhatsApp, email

## Modelo de datos (`src/data/services.ts`)

| Servicio | Tipo | Opciones y precios default (USD) |
|---|---|---|
| Visualizer | single-select | Lettering/Lyrics 15 · Imagen en movimiento 20 · Con videos 25 · Full 30 |
| Croma | doble selector | Entornos: 2 = 35, +15 por entorno extra (3, 4, ...). Nivel: VFX Pro (base) / VFX Full (+25) |
| VFX Básico | paquete on/off | 20 — cámara lenta, transiciones, shakes/golpes, título |
| VFX Pro | paquete on/off | 45 — zoom ins/outs, transiciones, luces, glitches, 1-frames, desenfoques, IA 3D, rotoscopias |
| Montaje | paquete on/off | 15 — color, cámara lenta, cortes |
| Extras | multi-select | 1 Reel 10 · 2 Reels 17 (excluyente con "1 Reel") · 1 Portada 8 |

Los precios y textos se editan solo en `services.ts`. `site.config.ts` guarda WhatsApp, IG y email.

## Flujo del carrito

- Elegir opción = agregar al carrito (o actualizar item existente, ej. cambiar entornos del Croma)
- Paquetes: botón Agregar/Quitar on-off
- Exclusividad: "1 Reel" y "2 Reels" no pueden estar juntos
- Estado en `localStorage`; drawer reabre con el carrito intacto
- Drawer: items con precio y quitar, edición inline del Croma, **total con counter animado**, campos Nombre y @Instagram, textarea de Notas, recordatorio visible del MP3
- Botón "Enviar pedido por WhatsApp" → construye mensaje y abre `wa.me/5493794270276?text=...`

### Formato del mensaje WhatsApp

```
🎬 Pedido de VFX — vfxbyflex
👤 Nombre: {nombre}
📷 Instagram: @{handle}

SERVICIOS:
• {servicio} ({variantes}) — USD {precio}
...

EXTRAS:
• {extra} — USD {precio}

📝 NOTAS:
"{notas}"

🎵 Canción: enviá el MP3 por este chat.

💰 TOTAL: USD {total}
```

Secciones vacías se omiten (sin "EXTRAS:" si no hay extras). Salto de línea real (`%0A`).

## Animaciones (GSAP + ScrollTrigger + SplitText — 100% gratis)

| Momento | Efecto |
|---|---|
| Hero load | SplitText por caracteres con RGB-split verde/celeste + flash de frame |
| Scroll | Reveals escalonados por sección, parallax en miniaturas, barra de progreso tipo timeline arriba |
| Cards destacados | Hover: zoom + glitch de 1 frame + timecode; magnetic pull al cursor |
| Agregar servicio | Chip viaja hacia el botón del carrito; badge con punch |
| Drawer | Entra con wipe/clip-path, stagger de items, backdrop blur |
| Total | Counter animado |
| Micro | Botones con spinner breve "render" al agregar, marquee de servicios, footer reveal |

Restricciones (skills `fixing-motion-performance`, `accessibility`):

- Respetar `prefers-reduced-motion`
- Animar solo `transform`/`opacity`
- Focus trap en el drawer, aria-live en el total, labels en todos los campos, contraste verificado

## Estructura de archivos

```
vfxbyflex/
├── src/
│   ├── data/services.ts       # catálogo + precios
│   ├── data/projects.ts       # destacados
│   ├── config/site.ts         # WhatsApp, IG, email
│   ├── lib/cart.ts            # estado + localStorage
│   ├── lib/whatsapp.ts        # builder mensaje + link wa.me
│   ├── components/            # Hero, Destacados, Configurador, Drawer, Footer...
│   ├── styles/global.css      # tokens OKLCH, tipografía
│   └── pages/index.astro
├── tests/                     # vitest: cart.test.ts, whatsapp.test.ts
├── astro.config.mjs
└── package.json
```

## Testing

- **Vitest:** suma de precios, exclusividad Reel/2 Reels, actualización del Croma, formato del mensaje (saltos, omisión de secciones vacías, escaping), persistencia localStorage
- **Playwright (smoke):** cargar página → agregar servicio → abrir drawer → verificar link `wa.me` contiene servicios y total
- **QA manual:** responsive (mobile-first), teclado completo, reduced-motion

## Deploy

Build estático (`npm run build` → `dist/`). Netlify o Cloudflare Pages (config incluida). Sin variables de entorno requeridas.

## Fuera de alcance (YAGNI)

- Backend, base de datos, cuentas de usuario, panel admin
- Subida real de MP3 (se envía por WhatsApp)
- Formulario con adjunto por email (solo `mailto:` en footer)
- Toggle claro/oscuro
- Multi-idioma
