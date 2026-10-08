# VFXBYFLEX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Astro site for VFX editor Flex where artists configure services, see a live total, and send a complete order via WhatsApp.

**Architecture:** Astro 5 static single-page site (project root = `D:\PAGINAS WEB`) with vanilla TypeScript modules for cart state and WhatsApp message building (unit-tested with Vitest). Tailwind CSS v4 for styling via OKLCH design tokens. GSAP (free, includes SplitText) for all motion, loaded client-side. No backend; checkout opens `wa.me` with a pre-filled message.

**Tech Stack:** Astro 5 · Tailwind CSS v4 (`@tailwindcss/vite`) · GSAP 3.13+ (SplitText, ScrollTrigger) · @fontsource/space-grotesk · Vitest · Playwright

**Spec:** `docs/superpowers/specs/2026-10-08-vfxbyflex-design.md`

## Global Constraints

- Palette: background `#FFFFFF`, text `#0A0A0A`, accents ONLY `#B7FF2E` (verde lima) and `#2EE6FF` (celeste). No magenta, no other accent colors.
- Currency: USD, prices editable only in `src/data/services.ts`.
- WhatsApp: `+54 9 3794 27-0276` → wa.me id `5493794270276`, defined in `src/config/site.ts`.
- Single page `/` only. No backend, no API routes, no env vars.
- The MP3 is NOT uploaded — the WhatsApp message contains the reminder "Canción: enviá el MP3 por este chat."
- Respect `prefers-reduced-motion` everywhere; animate only `transform` and `opacity` (except GSAP SplitText opacity reveals and the total counter textContent).
- Phone number, IG, email live only in `src/config/site.ts`.
- All commits: `git add <files> && git commit -m "..."` run from `D:\PAGINAS WEB`.

---

### Task 1: Scaffold Astro + Tailwind + Vitest

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces: runnable `npm run dev` / `npm run build` / `npm test`; `Base.astro` wraps every page with `<html>`, fonts, meta; `global.css` imported by Base holds all design tokens.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "vfxbyflex",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@fontsource/space-grotesk": "^5.1.0",
    "astro": "^5.1.0",
    "gsap": "^3.13.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: completes without errors.

- [ ] **Step 3: Create astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 5: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 6: Create src/styles/global.css with design tokens**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0a0a0a;
  --color-paper: #ffffff;
  --color-surface: #f5f5f4;
  --color-lime: #b7ff2e;
  --color-cyan: #2ee6ff;
  --color-muted: #6b7280;

  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body: "Space Grotesk", system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--color-ink);
  background: var(--color-paper);
}

::selection {
  background: var(--color-lime);
  color: var(--color-ink);
}
```

- [ ] **Step 7: Create src/layouts/Base.astro**

```astro
---
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 8: Create placeholder src/pages/index.astro**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="VFXBYFLEX — Servicios de VFX, Visualizers y Montaje" description="Cotizá tu VFX, visualizer o montaje con Flex. Configurá tu pedido y envialo directo por WhatsApp.">
  <main class="min-h-screen grid place-items-center">
    <p class="text-2xl font-bold">VFXBYFLEX</p>
  </main>
</Base>
```

- [ ] **Step 9: Create tests/smoke.test.ts**

```ts
import { describe, expect, it } from 'vitest';

describe('vitest wiring', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 10: Run tests and build**

Run: `npm test && npm run build`
Expected: 1 test passes; Astro build succeeds.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts src tests
git commit -m "chore: scaffold astro + tailwind + vitest"
```

---

### Task 2: Config and catalog data (TDD)

**Files:**
- Create: `src/config/site.ts`
- Create: `src/data/services.ts`
- Create: `src/data/projects.ts`
- Test: `tests/services.test.ts`

**Interfaces:**
- Produces:
  - `SITE = { whatsapp: string; whatsappDisplay: string; instagram: string; instagramUrl: string; email: string; currency: 'USD' }`
  - `type SelectOption = { id: string; label: string; price: number }`
  - `type ServiceDef = { id: string; name: string; tagline: string; kind: 'select' | 'package'; options: SelectOption[] }`
  - `SERVICES: ServiceDef[]` — ids: `visualizer`, `croma`, `vfx-basico`, `vfx-pro`, `montaje`, `extras`
  - `cromaPrice(entornos: number, nivel: 'pro' | 'full'): number`
  - `type Project = { title: string; thumbnail: string; url: string }`
  - `PROJECTS: Project[]`

- [ ] **Step 1: Write failing tests for cromaPrice and catalog shape**

```ts
import { describe, expect, it } from 'vitest';
import { cromaPrice, SERVICES } from '../src/data/services';

describe('cromaPrice', () => {
  it('charges base price for 2 environments with VFX Pro', () => {
    expect(cromaPrice(2, 'pro')).toBe(35);
  });
  it('adds 15 per extra environment', () => {
    expect(cromaPrice(3, 'pro')).toBe(50);
    expect(cromaPrice(4, 'pro')).toBe(65);
  });
  it('adds 25 for VFX Full', () => {
    expect(cromaPrice(2, 'full')).toBe(60);
    expect(cromaPrice(4, 'full')).toBe(90);
  });
});

describe('SERVICES catalog', () => {
  it('has the six services with required ids', () => {
    const ids = SERVICES.map((s) => s.id);
    expect(ids).toEqual(['visualizer', 'croma', 'vfx-basico', 'vfx-pro', 'montaje', 'extras']);
  });
  it('every select service has priced options', () => {
    for (const s of SERVICES.filter((x) => x.kind === 'select')) {
      expect(s.options.length).toBeGreaterThan(0);
      for (const o of s.options) expect(o.price).toBeGreaterThan(0);
    }
  });
  it('extras contains reel-1, reel-2 and portada', () => {
    const extras = SERVICES.find((s) => s.id === 'extras')!;
    const ids = extras.options.map((o) => o.id);
    expect(ids).toContain('reel-1');
    expect(ids).toContain('reel-2');
    expect(ids).toContain('portada');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/data/services`.

- [ ] **Step 3: Implement src/config/site.ts**

```ts
export const SITE = {
  whatsapp: '5493794270276',
  whatsappDisplay: '+54 9 3794 27-0276',
  instagram: 'vfxbyflex',
  instagramUrl: 'https://www.instagram.com/vfxbyflex/',
  email: 'negocioyocio808@gmail.com',
  currency: 'USD',
} as const;
```

- [ ] **Step 4: Implement src/data/services.ts**

```ts
export interface SelectOption {
  id: string;
  label: string;
  price: number;
}

export interface ServiceDef {
  id: string;
  name: string;
  tagline: string;
  kind: 'select' | 'package';
  options: SelectOption[];
}

export function cromaPrice(entornos: number, nivel: 'pro' | 'full'): number {
  return 35 + (entornos - 2) * 15 + (nivel === 'full' ? 25 : 0);
}

export const CROMA_ENTORNOS_OPTIONS = [2, 3, 4, 5, 6];

export const SERVICES: ServiceDef[] = [
  {
    id: 'visualizer',
    name: 'Visualizer',
    tagline: 'Tu audio convertido en imagen en movimiento',
    kind: 'select',
    options: [
      { id: 'visualizer-lettering', label: 'Lettering / Lyrics', price: 15 },
      { id: 'visualizer-imagen', label: 'Visualizer con imagen en movimiento', price: 20 },
      { id: 'visualizer-videos', label: 'Visualizer con videos', price: 25 },
      { id: 'visualizer-full', label: 'Visualizer Full', price: 30 },
    ],
  },
  {
    id: 'croma',
    name: 'Croma',
    tagline: 'Entornos compuestos con croma a medida',
    kind: 'select',
    options: [],
  },
  {
    id: 'vfx-basico',
    name: 'VFX Básico',
    tagline: 'Cámara lenta, transiciones, shakes/golpes y título',
    kind: 'package',
    options: [],
  },
  {
    id: 'vfx-pro',
    name: 'VFX Pro',
    tagline: 'Zooms, luces, glitches, 1-frames, desenfoques, IA 3D y rotoscopias',
    kind: 'package',
    options: [],
  },
  {
    id: 'montaje',
    name: 'Montaje',
    tagline: 'Color, cámara lenta y cortes',
    kind: 'package',
    options: [],
  },
  {
    id: 'extras',
    name: 'Extras',
    tagline: 'Reels y portadas para redes',
    kind: 'select',
    options: [
      { id: 'reel-1', label: '1 Reel', price: 10 },
      { id: 'reel-2', label: '2 Reels', price: 17 },
      { id: 'portada', label: '1 Portada', price: 8 },
    ],
  },
];

export const PACKAGE_IDS = ['vfx-basico', 'vfx-pro', 'montaje'] as const;
```

- [ ] **Step 5: Implement src/data/projects.ts (placeholders)**

```ts
export interface Project {
  title: string;
  thumbnail: string;
  url: string;
}

export const PROJECTS: Project[] = [
  {
    title: 'Visualizer — Próximo ejemplo',
    thumbnail: '/projects/placeholder-1.svg',
    url: 'https://www.instagram.com/vfxbyflex/',
  },
  {
    title: 'VFX Pro — Próximo ejemplo',
    thumbnail: '/projects/placeholder-2.svg',
    url: 'https://www.instagram.com/vfxbyflex/',
  },
  {
    title: 'Croma — Próximo ejemplo',
    thumbnail: '/projects/placeholder-3.svg',
    url: 'https://www.instagram.com/vfxbyflex/',
  },
  {
    title: 'Montaje — Próximo ejemplo',
    thumbnail: '/projects/placeholder-4.svg',
    url: 'https://www.instagram.com/vfxbyflex/',
  },
];
```

- [ ] **Step 6: Create placeholder thumbnails**

Create 4 SVG files `public/projects/placeholder-{1..4}.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#0a0a0a"/>
  <rect x="24" y="24" width="592" height="312" fill="none" stroke="#b7ff2e" stroke-width="2"/>
  <text x="320" y="190" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle">VFXBYFLEX</text>
</svg>
```

(placeholder-2 uses `#2ee6ff` stroke, 3 uses both colors split diagonally, 4 mirrors 2 — variation only.)

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`
Expected: all services tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/config src/data tests/services.test.ts public/projects
git commit -m "feat: site config and services catalog with prices"
```

---

### Task 3: Cart state module (TDD)

**Files:**
- Create: `src/lib/cart.ts`
- Test: `tests/cart.test.ts`

**Interfaces:**
- Consumes: `cromaPrice` from `src/data/services.ts`
- Produces:
  - `interface CartItem { key: string; serviceId: string; label: string; price: number; meta?: Record<string, string | number> }`
  - `interface CustomerInfo { name: string; instagram: string; notes: string }`
  - `interface CartState { items: CartItem[]; customer: CustomerInfo }`
  - `addItem(state: CartState, item: CartItem): CartState`
  - `removeItem(state: CartState, key: string): CartState`
  - `updateCustomer(state: CartState, patch: Partial<CustomerInfo>): CartState`
  - `itemKeyFor(serviceId: string): string`
  - `total(state: CartState): number`
  - `emptyCart(): CartState`
  - `saveCart(state: CartState): void`
  - `loadCart(): CartState`
  - `dispatchCartChange(state: CartState): void` — dispatches `CustomEvent('cart:change')` on `window`
  - Event name constant: `CART_EVENT = 'cart:change'`

- [ ] **Step 1: Write failing tests**

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import {
  addItem,
  CART_EVENT,
  dispatchCartChange,
  emptyCart,
  itemKeyFor,
  loadCart,
  removeItem,
  saveCart,
  total,
  updateCustomer,
  type CartItem,
  type CartState,
} from '../src/lib/cart';

const visualizer: CartItem = {
  key: itemKeyFor('visualizer'),
  serviceId: 'visualizer',
  label: 'Visualizer Full',
  price: 30,
};
const reel1: CartItem = {
  key: itemKeyFor('reel-1'),
  serviceId: 'extras',
  label: '1 Reel',
  price: 10,
};
const reel2: CartItem = {
  key: itemKeyFor('reel-2'),
  serviceId: 'extras',
  label: '2 Reels',
  price: 17,
};
const portada: CartItem = {
  key: itemKeyFor('portada'),
  serviceId: 'extras',
  label: '1 Portada',
  price: 8,
};
const croma2pro: CartItem = {
  key: itemKeyFor('croma'),
  serviceId: 'croma',
  label: 'Croma (2 entornos, VFX Pro)',
  price: 35,
  meta: { entornos: 2, nivel: 'pro' },
};

function fakeLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
}

describe('cart', () => {
  beforeEach(() => {
    (globalThis as { localStorage?: unknown }).localStorage = fakeLocalStorage();
  });

  it('single-select services replace the previous choice', () => {
    let state = emptyCart();
    state = addItem(state, visualizer);
    state = addItem(state, { ...visualizer, label: 'Lettering / Lyrics', price: 15 });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].label).toBe('Lettering / Lyrics');
  });

  it('croma replaces itself and keeps meta', () => {
    let state = addItem(emptyCart(), croma2pro);
    state = addItem(state, {
      key: itemKeyFor('croma'),
      serviceId: 'croma',
      label: 'Croma (3 entornos, VFX Full)',
      price: 75,
      meta: { entornos: 3, nivel: 'full' },
    });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].price).toBe(75);
  });

  it('reel-1 and reel-2 are mutually exclusive; portada coexists', () => {
    let state = addItem(emptyCart(), reel1);
    state = addItem(state, reel2);
    expect(state.items.map((i) => i.key)).toEqual([reel2.key]);
    state = addItem(state, portada);
    expect(state.items).toHaveLength(2);
  });

  it('packages accumulate additively', () => {
    let state = addItem(emptyCart(), {
      key: itemKeyFor('vfx-basico'),
      serviceId: 'vfx-basico',
      label: 'VFX Básico',
      price: 20,
    });
    state = addItem(state, {
      key: itemKeyFor('montaje'),
      serviceId: 'montaje',
      label: 'Montaje',
      price: 15,
    });
    expect(state.items).toHaveLength(2);
    expect(total(state)).toBe(35);
  });

  it('removeItem deletes by key', () => {
    let state = addItem(addItem(emptyCart(), reel1), portada);
    state = removeItem(state, reel1.key);
    expect(state.items.map((i) => i.key)).toEqual([portada.key]);
  });

  it('updateCustomer patches customer fields only', () => {
    let state = updateCustomer(emptyCart(), { name: 'Juan', notes: 'todo oscuro' });
    expect(state.customer).toEqual({ name: 'Juan', instagram: '', notes: 'todo oscuro' });
  });

  it('save/load roundtrips through localStorage', () => {
    let state = addItem(emptyCart(), visualizer);
    state = updateCustomer(state, { name: 'Ana' });
    saveCart(state);
    expect(loadCart()).toEqual(state);
  });

  it('loadCart returns empty cart on corrupt data', () => {
    (globalThis as { localStorage: ReturnType<typeof fakeLocalStorage> }).localStorage.setItem(
      'vfxbyflex-cart',
      '{broken'
    );
    expect(loadCart()).toEqual(emptyCart());
  });

  it('dispatchCartChange emits cart:change with the state', () => {
    const seen: CartState[] = [];
    if (typeof window !== 'undefined') {
      window.addEventListener(CART_EVENT, ((e: CustomEvent<CartState>) => {
        seen.push(e.detail);
      }) as EventListener);
    }
    const state = addItem(emptyCart(), visualizer);
    dispatchCartChange(state);
    expect(seen).toEqual([state]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `src/lib/cart.ts` not found.

- [ ] **Step 3: Implement src/lib/cart.ts**

```ts
import { cromaPrice } from '../data/services';

export const CART_EVENT = 'cart:change';
const STORAGE_KEY = 'vfxbyflex-cart';
const EXCLUSIVE_PAIRS = [
  ['reel-1', 'reel-2'],
];

export interface CartItem {
  key: string;
  serviceId: string;
  label: string;
  price: number;
  meta?: Record<string, string | number>;
}

export interface CustomerInfo {
  name: string;
  instagram: string;
  notes: string;
}

export interface CartState {
  items: CartItem[];
  customer: CustomerInfo;
}

export function itemKeyFor(id: string): string {
  return id;
}

export function emptyCart(): CartState {
  return { items: [], customer: { name: '', instagram: '', notes: '' } };
}

function isExclusive(a: string, b: string): boolean {
  return EXCLUSIVE_PAIRS.some((pair) => pair.includes(a) && pair.includes(b));
}

export function addItem(state: CartState, item: CartItem): CartState {
  const items = state.items
    .filter((i) => i.key !== item.key)
    .filter((i) => !(i.serviceId === item.serviceId && item.serviceId !== 'extras'))
    .filter((i) => !(i.serviceId === 'extras' && isExclusive(i.key, item.key)));
  return { ...state, items: [...items, item] };
}

export function removeItem(state: CartState, key: string): CartState {
  return { ...state, items: state.items.filter((i) => i.key !== key) };
}

export function updateCustomer(state: CartState, patch: Partial<CustomerInfo>): CartState {
  return { ...state, customer: { ...state.customer, ...patch } };
}

export function total(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.price, 0);
}

export function saveCart(state: CartState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadCart(): CartState {
  if (typeof localStorage === 'undefined') return emptyCart();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items) || typeof parsed.customer !== 'object' || parsed.customer === null) {
      return emptyCart();
    }
    return parsed;
  } catch {
    return emptyCart();
  }
}

export function dispatchCartChange(state: CartState): void {
  window.dispatchEvent(new CustomEvent<CartState>(CART_EVENT, { detail: state }));
}

export function buildCromaItem(entornos: number, nivel: 'pro' | 'full'): CartItem {
  return {
    key: itemKeyFor('croma'),
    serviceId: 'croma',
    label: `Croma (${entornos} entornos, VFX ${nivel === 'pro' ? 'Pro' : 'Full'})`,
    price: cromaPrice(entornos, nivel),
    meta: { entornos, nivel },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all cart tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cart.ts tests/cart.test.ts
git commit -m "feat: cart state with exclusivity rules and localStorage"
```

---

### Task 4: WhatsApp message builder (TDD)

**Files:**
- Create: `src/lib/whatsapp.ts`
- Test: `tests/whatsapp.test.ts`

**Interfaces:**
- Consumes: `CartItem`, `CustomerInfo` types from `src/lib/cart.ts`
- Produces:
  - `buildMessage(input: { items: CartItem[]; customer: CustomerInfo }): string`
  - `buildWhatsAppUrl(phone: string, message: string): string` — returns `https://wa.me/<digits>?text=<encoded>`
  - `sanitizePhone(phone: string): string` — strips everything except digits

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildMessage, buildWhatsAppUrl, sanitizePhone } from '../src/lib/whatsapp';
import type { CartItem, CustomerInfo } from '../src/lib/cart';

const customer: CustomerInfo = { name: 'Juan', instagram: 'juanbeats', notes: 'todo en rojo' };

const items: CartItem[] = [
  { key: 'visualizer', serviceId: 'visualizer', label: 'Visualizer Full', price: 30 },
  { key: 'croma', serviceId: 'croma', label: 'Croma (3 entornos, VFX Full)', price: 75 },
  { key: 'montaje', serviceId: 'montaje', label: 'Montaje', price: 15 },
  { key: 'reel-2', serviceId: 'extras', label: '2 Reels', price: 17 },
];

describe('buildMessage', () => {
  it('formats services, extras, notes and total', () => {
    const msg = buildMessage({ items, customer });
    expect(msg).toContain('🎬 Pedido de VFX — vfxbyflex');
    expect(msg).toContain('👤 Nombre: Juan');
    expect(msg).toContain('📷 Instagram: @juanbeats');
    expect(msg).toContain('SERVICIOS:');
    expect(msg).toContain('• Visualizer Full — USD 30');
    expect(msg).toContain('• Croma (3 entornos, VFX Full) — USD 75');
    expect(msg).toContain('• Montaje — USD 15');
    expect(msg).toContain('EXTRAS:');
    expect(msg).toContain('• 2 Reels — USD 17');
    expect(msg).toContain('📝 NOTAS:');
    expect(msg).toContain('"todo en rojo"');
    expect(msg).toContain('🎵 Canción: enviá el MP3 por este chat.');
    expect(msg).toContain('💰 TOTAL: USD 137');
  });

  it('omits extras and notes sections when empty', () => {
    const msg = buildMessage({
      items: [items[0]],
      customer: { name: 'Ana', instagram: '', notes: '' },
    });
    expect(msg).not.toContain('EXTRAS:');
    expect(msg).not.toContain('📝 NOTAS:');
    expect(msg).not.toContain('📷 Instagram:');
    expect(msg).toContain('👤 Nombre: Ana');
  });

  it('uses — when name is empty', () => {
    const msg = buildMessage({ items: [items[0]], customer: { name: '', instagram: '', notes: '' } });
    expect(msg).toContain('👤 Nombre: —');
  });
});

describe('buildWhatsAppUrl', () => {
  it('builds wa.me link with encoded message', () => {
    const url = buildWhatsAppUrl('5493794270276', 'hola\nmundo');
    expect(url).toBe('https://wa.me/5493794270276?text=hola%0Amundo');
  });
});

describe('sanitizePhone', () => {
  it('strips spaces, dashes and plus', () => {
    expect(sanitizePhone('+54 9 3794 27-0276')).toBe('5493794270276');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `src/lib/whatsapp.ts` not found.

- [ ] **Step 3: Implement src/lib/whatsapp.ts**

```ts
import type { CartItem, CustomerInfo } from './cart';

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildMessage({
  items,
  customer,
}: {
  items: CartItem[];
  customer: CustomerInfo;
}): string {
  const services = items.filter((i) => i.serviceId !== 'extras');
  const extras = items.filter((i) => i.serviceId === 'extras');
  const sum = items.reduce((acc, i) => acc + i.price, 0);

  const lines: string[] = [];
  lines.push('🎬 Pedido de VFX — vfxbyflex');
  lines.push(`👤 Nombre: ${customer.name.trim() || '—'}`);
  if (customer.instagram.trim()) {
    lines.push(`📷 Instagram: @${customer.instagram.trim().replace(/^@/, '')}`);
  }

  if (services.length > 0) {
    lines.push('');
    lines.push('SERVICIOS:');
    for (const i of services) lines.push(`• ${i.label} — USD ${i.price}`);
  }

  if (extras.length > 0) {
    lines.push('');
    lines.push('EXTRAS:');
    for (const i of extras) lines.push(`• ${i.label} — USD ${i.price}`);
  }

  if (customer.notes.trim()) {
    lines.push('');
    lines.push('📝 NOTAS:');
    lines.push(`"${customer.notes.trim()}"`);
  }

  lines.push('');
  lines.push('🎵 Canción: enviá el MP3 por este chat.');
  lines.push('');
  lines.push(`💰 TOTAL: USD ${sum}`);

  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${sanitizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS (services + cart + whatsapp).

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp.ts tests/whatsapp.test.ts
git commit -m "feat: whatsapp message builder and wa.me link"
```

---

### Task 5: Base layout polish, meta and favicon

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/styles/global.css`
- Create: `public/favicon.svg`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SITE` from `src/config/site.ts`
- Produces: finished `<head>` (OG, favicon), body classes, scanline overlay CSS utility `.scanlines`, container utility, and `index.astro` with empty section anchors (`#destacados`, `#servicios`).

- [ ] **Step 1: Create public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0a0a0a"/>
  <path d="M18 46 L18 18 L46 18" fill="none" stroke="#b7ff2e" stroke-width="8" stroke-linecap="square"/>
  <circle cx="42" cy="42" r="7" fill="#2ee6ff"/>
</svg>
```

- [ ] **Step 2: Update global.css — add scanlines utility and marquee keyframes**

Append to `src/styles/global.css`:

```css
.scanlines {
  position: relative;
}
.scanlines::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgb(10 10 10 / 0.03) 3px,
    rgb(10 10 10 / 0.03) 4px
  );
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 22s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .animate-marquee { animation: none; }
}
```

- [ ] **Step 3: Update Base.astro head**

Replace the head block in `src/layouts/Base.astro` with:

```astro
---
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '../styles/global.css';
import { SITE } from '../config/site';

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
const ogImage = new URL('/og.svg', Astro.site ?? 'https://vfxbyflex.netlify.app/');
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="theme-color" content="#ffffff" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={ogImage} />
  </head>
  <body class="bg-paper text-ink antialiased">
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Create public/og.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#0a0a0a" stroke-width="4"/>
  <text x="600" y="300" fill="#0a0a0a" font-family="sans-serif" font-weight="700" font-size="110" text-anchor="middle">VFXBYFLEX</text>
  <text x="600" y="380" fill="#6b7280" font-family="sans-serif" font-size="36" text-anchor="middle">VFX · Visualizers · Montaje</text>
  <rect x="480" y="440" width="240" height="14" fill="#b7ff2e"/>
  <rect x="620" y="440" width="100" height="14" fill="#2ee6ff"/>
</svg>
```

- [ ] **Step 5: Update index.astro with section anchors**

```astro
---
import Base from '../layouts/Base.astro';
import { SITE } from '../config/site';
---

<Base
  title="VFXBYFLEX — Servicios de VFX, Visualizers y Montaje"
  description="Cotizá tu VFX, visualizer o montaje con Flex. Configurá tu pedido y envialo directo por WhatsApp."
>
  <main>
    <section id="hero" class="min-h-screen grid place-items-center"></section>
    <section id="destacados"></section>
    <section id="servicios"></section>
  </main>
  <footer id="footer">
    <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
  </footer>
</Base>
```

- [ ] **Step 6: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src public
git commit -m "feat: layout meta, favicon and og image"
```

---

### Task 6: Hero with GSAP SplitText glitch intro

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SITE` from config; Base layout
- Produces: `<Hero />` renders full-screen hero (title, tagline, CTA scrolling to `#servicios`, IG link) and registers GSAP intro animation on load, guarded by `prefers-reduced-motion`.

- [ ] **Step 1: Create src/components/Hero.astro**

```astro
---
import { SITE } from '../config/site';
---

<header class="relative min-h-screen flex flex-col justify-between p-6 md:p-10 scanlines overflow-hidden">
  <div class="flex items-center justify-between text-sm font-medium">
    <span class="flex items-center gap-2">
      <span class="inline-block w-2 h-2 bg-lime"></span> EDITANDO DESDE {SITE.instagram.toUpperCase()}
    </span>
    <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" class="hover:text-cyan transition-colors">
      @{SITE.instagram}
    </a>
  </div>

  <div class="max-w-6xl">
    <p class="hero-eyebrow text-sm font-medium tracking-[0.3em] uppercase text-muted mb-4">Servicios de VFX · Visualizers · Montaje</p>
    <h1 class="hero-title font-bold leading-[0.9] text-[clamp(3.5rem,14vw,11rem)] tracking-tight">
      VFXBY<span class="text-lime">FLEX</span>
    </h1>
    <p class="hero-tagline mt-6 text-lg md:text-2xl max-w-xl">
      Elegí tus servicios, armá tu pedido y mandámelo directo por WhatsApp. Sin vueltas.
    </p>
  </div>

  <div class="flex flex-wrap items-center gap-4">
    <a href="#servicios" class="hero-cta group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 font-bold text-lg rounded-none border-2 border-ink hover:bg-lime hover:text-ink hover:border-lime transition-colors">
      COTIZAR AHORA
      <span class="group-hover:translate-x-1 transition-transform">→</span>
    </a>
    <span class="text-sm text-muted font-mono">00:00:00 · REC</span>
  </div>

  <div class="hero-flash pointer-events-none absolute inset-0 bg-paper opacity-0"></div>
</header>

<script>
  import gsap from 'gsap';
  import { SplitText } from 'gsap/SplitText';

  gsap.registerPlugin(SplitText);

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const title = document.querySelector<HTMLElement>('.hero-title');
    const flash = document.querySelector<HTMLElement>('.hero-flash');
    if (!title || !flash) return;

    const split = new SplitText(title, { type: 'chars' });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.set(flash, { opacity: 0.9 })
      .to(flash, { opacity: 0, duration: 0.18 })
      .from(split.chars, {
        opacity: 0,
        y: 40,
        rotateX: -40,
        stagger: 0.045,
        duration: 0.6,
      }, 0.05)
      .from(['.hero-eyebrow', '.hero-tagline', '.hero-cta'], {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 0.5,
      }, '-=0.3');

    // RGB-split style: brief cyan/lime offset on a couple of chars
    const chars = split.chars;
    chars.forEach((c, i) => {
      if (i % 5 === 0) {
        gsap.fromTo(c, { textShadow: '3px 0 0 #2ee6ff, -3px 0 0 #b7ff2e' }, {
          textShadow: '0px 0 0 transparent, 0px 0 0 transparent',
          duration: 0.5,
          delay: 0.3 + i * 0.045,
        });
      }
    });

    return () => {
      split.revert();
    };
  });
</script>
```

- [ ] **Step 2: Wire Hero into index.astro**

Replace the `#hero` section in `src/pages/index.astro` with `<Hero />` (import `Hero` from `../components/Hero.astro`).

- [ ] **Step 3: Manual check + build**

Run: `npm run dev` and open the page — title should animate in with glitch flash; with OS reduced-motion enabled it should appear statically. Then `npm run build`.
Expected: no console errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: hero with splittext glitch intro"
```

---

### Task 7: Destacados grid with hover glitch and parallax

**Files:**
- Create: `src/components/Destacados.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `PROJECTS` from `src/data/projects.ts`
- Produces: `<Destacados />` — section `#destacados` with heading and responsive card grid; each card is an `<a>` to `project.url` (new tab); hover reveals timecode + glitch flash; ScrollTrigger parallax on thumbnails.

- [ ] **Step 1: Create src/components/Destacados.astro**

```astro
---
import { PROJECTS } from '../data/projects';
---

<section id="destacados" class="px-6 md:px-10 py-24 md:py-32">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-end justify-between mb-12">
      <h2 class="destacados-title text-4xl md:text-6xl font-bold">Destacados</h2>
      <span class="hidden md:block font-mono text-sm text-muted">SELECTS · 2026</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {PROJECTS.map((p, i) => (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          class="project-card group relative block overflow-hidden border-2 border-ink bg-surface aspect-video magnetic"
        >
          <div class="project-thumb absolute inset-0 overflow-hidden">
            <img
              src={p.thumbnail}
              alt={p.title}
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div class="project-glitch absolute inset-0 opacity-0 bg-cyan mix-blend-multiply transition-opacity duration-100 group-hover:opacity-30"></div>
          <div class="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 bg-paper/90 backdrop-blur-sm border-t-2 border-ink">
            <span class="font-bold">{p.title}</span>
            <span class="project-timecode font-mono text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
              00:{String(i * 7 + 12).padStart(2, '0')}:0{i + 3}
            </span>
          </div>
          <span class="absolute top-3 right-3 bg-lime text-ink text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">VER REEL ↗</span>
        </a>
      ))}
    </div>
  </div>
</section>

<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.destacados-title', {
      opacity: 0,
      y: 40,
      scrollTrigger: { trigger: '#destacados', start: 'top 75%' },
      duration: 0.7,
      ease: 'power3.out',
    });

    gsap.from('.project-card', {
      opacity: 0,
      y: 60,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#destacados', start: 'top 70%' },
    });

    document.querySelectorAll<HTMLElement>('.project-thumb img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: img, scrub: true },
      });
    });

    // magnetic pull on cards
    document.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.03, y: y * 0.03, duration: 0.3, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  });
</script>
```

- [ ] **Step 2: Wire into index.astro (replace empty `#destacados` section)**

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Destacados.astro src/pages/index.astro
git commit -m "feat: destacados grid with hover glitch and parallax"
```

---

### Task 8: Configurador UI wired to cart

**Files:**
- Create: `src/components/Configurador.astro`
- Create: `src/lib/configurator-ui.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SERVICES`, `CROMA_ENTORNOS_OPTIONS`, `cromaPrice` from `src/data/services.ts`; `addItem`, `removeItem`, `loadCart`, `saveCart`, `dispatchCartChange`, `itemKeyFor`, `buildCromaItem`, `CART_EVENT`, `CartState` from `src/lib/cart.ts`
- Produces: section `#servicios` with one card per service; `configurator-ui.ts` attaches behavior and writes all cart mutations through the cart module (UI never holds its own state). Selected state is derived from the cart on every `cart:change`.

- [ ] **Step 1: Create src/components/Configurador.astro (markup only)**

```astro
---
import { SERVICES, CROMA_ENTORNOS_OPTIONS } from '../data/services';
---

<section id="servicios" class="px-6 md:px-10 py-24 md:py-32 bg-surface">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-end justify-between mb-4">
      <h2 class="servicios-title text-4xl md:text-6xl font-bold">Configurá tu pedido</h2>
      <span class="hidden md:block font-mono text-sm text-muted">TIMELINE · SERVICIOS</span>
    </div>
    <p class="text-muted mb-12 max-w-xl">Elegí los servicios que necesitás. El total se actualiza en vivo y al terminar lo mandás por WhatsApp.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {SERVICES.map((service) => (
        <article
          class="service-card border-2 border-ink bg-paper p-6 flex flex-col gap-4"
          data-service={service.id}
        >
          <header>
            <h3 class="text-2xl font-bold">{service.name}</h3>
            <p class="text-sm text-muted mt-1">{service.tagline}</p>
          </header>

          {service.kind === 'select' && service.id !== 'croma' && service.id !== 'extras' && (
            <div class="flex flex-col gap-2" role="radiogroup" aria-label={service.name}>
              {service.options.map((o) => (
                <button
                  type="button"
                  class="service-option flex items-center justify-between border-2 border-ink/20 px-4 py-3 text-left hover:border-ink transition-colors"
                  data-service={service.id}
                  data-option={o.id}
                  data-label={o.label}
                  data-price={o.price}
                  role="radio"
                  aria-checked="false"
                >
                  <span>{o.label}</span>
                  <span class="font-mono font-bold">USD {o.price}</span>
                </button>
              ))}
            </div>
          )}

          {service.id === 'croma' && (
            <div class="flex flex-col gap-4" data-croma>
              <label class="flex flex-col gap-1 text-sm font-medium">
                Cantidad de entornos
                <select
                  class="croma-entornos border-2 border-ink px-3 py-2 bg-paper"
                  aria-label="Cantidad de entornos"
                >
                  {CROMA_ENTORNOS_OPTIONS.map((n) => (
                    <option value={n}>{n} entornos</option>
                  ))}
                </select>
              </label>
              <div class="flex gap-2" role="radiogroup" aria-label="Nivel de VFX del croma">
                <button type="button" class="croma-nivel flex-1 border-2 border-ink px-3 py-2 font-bold" data-nivel="pro" role="radio" aria-checked="true">VFX Pro</button>
                <button type="button" class="croma-nivel flex-1 border-2 border-ink/20 px-3 py-2 font-bold" data-nivel="full" role="radio" aria-checked="false">VFX Full <span class="text-muted font-normal">(+25)</span></button>
              </div>
              <button
                type="button"
                class="croma-add bg-ink text-paper font-bold py-3 hover:bg-lime hover:text-ink transition-colors"
                data-service="croma"
              >
                Agregar — <span class="croma-price font-mono">USD 35</span>
              </button>
            </div>
          )}

          {service.kind === 'package' && (
            <button
              type="button"
              class="package-toggle mt-auto border-2 border-ink px-4 py-3 font-bold hover:bg-ink hover:text-paper transition-colors"
              data-service={service.id}
              data-label={service.name}
              data-price={service.id === 'vfx-basico' ? 20 : service.id === 'vfx-pro' ? 45 : 15}
              aria-pressed="false"
            >
              Agregar
            </button>
          )}

          {service.id === 'extras' && (
            <div class="flex flex-col gap-2">
              {service.options.map((o) => (
                <button
                  type="button"
                  class="service-option flex items-center justify-between border-2 border-ink/20 px-4 py-3 text-left hover:border-ink transition-colors"
                  data-service="extras"
                  data-option={o.id}
                  data-label={o.label}
                  data-price={o.price}
                  aria-pressed="false"
                >
                  <span>{o.label}</span>
                  <span class="font-mono font-bold">USD {o.price}</span>
                </button>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create src/lib/configurator-ui.ts**

```ts
import {
  addItem,
  buildCromaItem,
  dispatchCartChange,
  itemKeyFor,
  loadCart,
  removeItem,
  saveCart,
  type CartState,
} from './cart';

function current(): CartState {
  return loadCart();
}

function commit(state: CartState): void {
  saveCart(state);
  dispatchCartChange(state);
}

function syncUI(state: CartState): void {
  document.querySelectorAll<HTMLElement>('.service-option[data-service]').forEach((btn) => {
    const service = btn.dataset.service!;
    const option = btn.dataset.option!;
    const inCart =
      service === 'extras'
        ? state.items.some((i) => i.key === option)
        : state.items.some((i) => i.key === itemKeyFor(service));
    btn.classList.toggle('border-ink', inCart);
    btn.classList.toggle('border-ink/20', !inCart);
    if (btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', String(inCart));
    if (btn.getAttribute('role') === 'radio') btn.setAttribute('aria-checked', String(inCart));
  });

  document.querySelectorAll<HTMLElement>('.package-toggle').forEach((btn) => {
    const key = itemKeyFor(btn.dataset.service!);
    const active = state.items.some((i) => i.key === key);
    btn.setAttribute('aria-pressed', String(active));
    btn.textContent = active ? 'Agregado ✓' : 'Agregar';
    btn.classList.toggle('bg-ink', active);
    btn.classList.toggle('text-paper', active);
  });

  updateCromaPriceLabel();
}

function updateCromaPriceLabel(): void {
  const wrap = document.querySelector<HTMLElement>('[data-croma]');
  if (!wrap) return;
  const entornos = Number(wrap.querySelector<HTMLSelectElement>('.croma-entornos')!.value);
  const nivel = wrap.querySelector<HTMLButtonElement>('.croma-nivel[aria-checked="true"]')!.dataset.nivel as 'pro' | 'full';
  const item = buildCromaItem(entornos, nivel);
  const priceEl = wrap.querySelector<HTMLElement>('.croma-price')!;
  priceEl.textContent = `USD ${item.price}`;
}

function flyChip(from: HTMLElement): void {
  const target = document.getElementById('cart-button');
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const chip = document.createElement('div');
  chip.className = 'fixed z-[70] bg-lime text-ink font-bold px-3 py-1 text-sm pointer-events-none';
  chip.textContent = from.textContent?.split('—')[0]?.trim() ?? '+';
  const r = from.getBoundingClientRect();
  chip.style.left = `${r.left}px`;
  chip.style.top = `${r.top}px`;
  document.body.appendChild(chip);
  chip.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      {
        transform: `translate(${target.getBoundingClientRect().left - r.left}px, ${target.getBoundingClientRect().top - r.top}px) scale(0.4)`,
        opacity: 0.2,
      },
    ],
    { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
  ).onfinish = () => chip.remove();
}

export function initConfigurator(): void {
  syncUI(current());

  document.querySelectorAll<HTMLElement>('.service-option[data-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.service!;
      const label = btn.dataset.label!;
      const price = Number(btn.dataset.price);
      const option = btn.dataset.option!;
      const key = service === 'extras' ? option : itemKeyFor(service);
      const state = current();
      const exists = state.items.some((i) => i.key === key);
      const next = exists
        ? removeItem(state, key)
        : addItem(state, { key, serviceId: service, label, price });
      commit(next);
    });
  });

  document.querySelectorAll<HTMLElement>('.package-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = itemKeyFor(btn.dataset.service!);
      const state = current();
      const exists = state.items.some((i) => i.key === key);
      const next = exists
        ? removeItem(state, key)
        : addItem(state, {
            key,
            serviceId: btn.dataset.service!,
            label: btn.dataset.label!,
            price: Number(btn.dataset.price),
          });
      commit(next);
    });
  });

  const cromaWrap = document.querySelector<HTMLElement>('[data-croma]');
  if (cromaWrap) {
    cromaWrap.querySelector<HTMLSelectElement>('.croma-entornos')!.addEventListener('change', updateCromaPriceLabel);
    cromaWrap.querySelectorAll<HTMLElement>('.croma-nivel').forEach((btn) => {
      btn.addEventListener('click', () => {
        cromaWrap.querySelectorAll('.croma-nivel').forEach((b) => {
          b.setAttribute('aria-checked', 'false');
          b.classList.add('border-ink/20');
          b.classList.remove('border-ink');
        });
        btn.setAttribute('aria-checked', 'true');
        btn.classList.remove('border-ink/20');
        btn.classList.add('border-ink');
        updateCromaPriceLabel();
      });
    });
    cromaWrap.querySelector<HTMLButtonElement>('.croma-add')!.addEventListener('click', (e) => {
      const entornos = Number(cromaWrap.querySelector<HTMLSelectElement>('.croma-entornos')!.value);
      const nivel = cromaWrap.querySelector<HTMLButtonElement>('.croma-nivel[aria-checked="true"]')!.dataset.nivel as 'pro' | 'full';
      commit(addItem(current(), buildCromaItem(entornos, nivel)));
      flyChip(e.currentTarget as HTMLElement);
    });
  }

  window.addEventListener('cart:change', ((e: CustomEvent<CartState>) => {
    syncUI(e.detail);
  }) as EventListener);
}
```

- [ ] **Step 3: Wire component + init script in index.astro**

In `src/pages/index.astro`: import and render `<Configurador />`, and add:

```astro
<script>
  import { initConfigurator } from '../lib/configurator-ui';
  initConfigurator();
</script>
```

- [ ] **Step 4: Manual verification**

Run `npm run dev`: click options/packages — selected styles toggle, croma price label updates (3 entornos pro = 50), clicking an option twice deselects, reel-1 then reel-2 keeps only reel-2.

- [ ] **Step 5: Commit**

```bash
git add src/components/Configurador.astro src/lib/configurator-ui.ts src/pages/index.astro
git commit -m "feat: configurator UI wired to cart state"
```

---

### Task 9: Cart drawer with total counter, fields and focus trap

**Files:**
- Create: `src/components/CartDrawer.astro`
- Create: `src/lib/drawer-ui.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: cart module + `SITE` from config; `buildMessage`, `buildWhatsAppUrl` from `src/lib/whatsapp.ts`
- Produces: fixed cart button `#cart-button` (badge with count), drawer `#cart-drawer` (role=dialog, aria-modal), item list `#cart-items`, totals `#cart-total`, customer inputs `#cart-name` / `#cart-instagram` / `#cart-notes`, submit anchor `#cart-submit`. `initDrawer()` exports from `drawer-ui.ts`. aria-live polite on total.

- [ ] **Step 1: Create src/components/CartDrawer.astro**

```astro
---
import { SITE } from '../config/site';
---

<button
  id="cart-button"
  type="button"
  class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink text-paper px-6 py-4 font-bold border-2 border-ink hover:bg-lime hover:text-ink hover:border-lime transition-colors"
  aria-haspopup="dialog"
  aria-controls="cart-drawer"
>
  <span id="cart-badge" class="bg-lime text-ink text-sm font-mono px-2 py-0.5">0</span>
  Ver carrito
</button>

<div id="cart-overlay" class="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity"></div>

<aside
  id="cart-drawer"
  role="dialog"
  aria-modal="true"
  aria-labelledby="cart-drawer-title"
  class="fixed top-0 right-0 z-[60] h-full w-full max-w-md bg-paper border-l-2 border-ink flex flex-col translate-x-full"
>
  <header class="flex items-center justify-between border-b-2 border-ink p-5">
    <h2 id="cart-drawer-title" class="text-xl font-bold">Tu pedido</h2>
    <button id="cart-close" type="button" class="border-2 border-ink w-10 h-10 font-bold hover:bg-ink hover:text-paper transition-colors" aria-label="Cerrar carrito">✕</button>
  </header>

  <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
    <ul id="cart-items" class="flex flex-col gap-3"></ul>
    <p id="cart-empty" class="text-muted text-sm">Todavía no agregaste servicios. Elegí abajo en el configurador.</p>

    <div class="border-t-2 border-ink pt-4 mt-auto">
      <div class="flex items-center justify-between text-2xl font-bold">
        <span>TOTAL</span>
        <span id="cart-total" aria-live="polite" class="font-mono">USD 0</span>
      </div>
    </div>

    <label class="flex flex-col gap-1 text-sm font-medium">
      Nombre *
      <input id="cart-name" type="text" required autocomplete="name" class="border-2 border-ink px-3 py-2 bg-paper" placeholder="Tu nombre" />
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Instagram
      <input id="cart-instagram" type="text" autocomplete="off" class="border-2 border-ink px-3 py-2 bg-paper" placeholder="@tuusuario" />
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Notas — especificá todo con detalle
      <textarea id="cart-notes" rows="5" class="border-2 border-ink px-3 py-2 bg-paper" placeholder="Colores, fechas, referencias, todo lo que quieras contarle a Flex..."></textarea>
    </label>

    <p class="text-xs text-muted border-2 border-dashed border-ink/30 p-3">
      🎵 La canción (MP3) la mandás por el mismo chat de WhatsApp después de enviar el pedido.
    </p>
  </div>

  <footer class="border-t-2 border-ink p-5">
    <a
      id="cart-submit"
      href={SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}` : '#'}
      target="_blank"
      rel="noopener noreferrer"
      class="block w-full bg-lime text-ink text-center font-bold text-lg py-4 border-2 border-lime hover:bg-ink hover:text-paper hover:border-ink transition-colors"
    >
      Enviar pedido por WhatsApp →
    </a>
  </footer>
</aside>
```

- [ ] **Step 2: Create src/lib/drawer-ui.ts**

```ts
import {
  dispatchCartChange,
  loadCart,
  removeItem,
  saveCart,
  updateCustomer,
  CART_EVENT,
  type CartState,
} from './cart';
import { SITE } from '../config/site';
import { buildMessage, buildWhatsAppUrl } from './whatsapp';

let lastTrigger: HTMLElement | null = null;
let renderedKey = '';

function els() {
  return {
    button: document.getElementById('cart-button')!,
    badge: document.getElementById('cart-badge')!,
    overlay: document.getElementById('cart-overlay')!,
    drawer: document.getElementById('cart-drawer')!,
    close: document.getElementById('cart-close')!,
    list: document.getElementById('cart-items')!,
    empty: document.getElementById('cart-empty')!,
    total: document.getElementById('cart-total')!,
    name: document.getElementById('cart-name') as HTMLInputElement,
    instagram: document.getElementById('cart-instagram') as HTMLInputElement,
    notes: document.getElementById('cart-notes') as HTMLTextAreaElement,
    submit: document.getElementById('cart-submit') as HTMLAnchorElement,
  };
}

function animateTotal(from: number, to: number): void {
  const el = els().total;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || from === to) {
    el.textContent = `USD ${to}`;
    return;
  }
  const start = performance.now();
  const dur = 400;
  function frame(now: number): void {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = `USD ${Math.round(from + (to - from) * eased)}`;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderItems(state: CartState): void {
  const e = els();
  const key = JSON.stringify(state.items);
  if (key === renderedKey) return;
  const prevTotal = Number(e.total.textContent?.replace(/\D/g, '') ?? 0);

  e.list.innerHTML = state.items
    .map(
      (i) => `
      <li class="flex items-center justify-between gap-3 border-2 border-ink/20 px-4 py-3">
        <div>
          <p class="font-bold">${i.label}</p>
          <p class="font-mono text-sm text-muted">USD ${i.price}</p>
        </div>
        <button type="button" class="cart-remove border-2 border-ink w-8 h-8 text-sm hover:bg-ink hover:text-paper transition-colors" data-key="${i.key}" aria-label="Quitar ${i.label}">✕</button>
      </li>`
    )
    .join('');

  e.empty.hidden = state.items.length > 0;
  e.badge.textContent = String(state.items.length);
  const sum = state.items.reduce((a, i) => a + i.price, 0);
  animateTotal(prevTotal, sum);

  e.list.querySelectorAll<HTMLButtonElement>('.cart-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = removeItem(loadCart(), btn.dataset.key!);
      saveCart(next);
      dispatchCartChange(next);
    });
  });

  renderedKey = key;
}

function syncCustomer(state: CartState): void {
  const e = els();
  if (document.activeElement !== e.name) e.name.value = state.customer.name;
  if (document.activeElement !== e.instagram) e.instagram.value = state.customer.instagram;
  if (document.activeElement !== e.notes) e.notes.value = state.customer.notes;
}

function syncSubmit(state: CartState): void {
  els().submit.href = buildWhatsAppUrl(SITE.whatsapp, buildMessage(state));
  els().submit.classList.toggle('pointer-events-none', state.items.length === 0);
  els().submit.classList.toggle('opacity-40', state.items.length === 0);
  if (state.items.length === 0) els().submit.setAttribute('aria-disabled', 'true');
  else els().submit.removeAttribute('aria-disabled');
}

export function syncDrawer(state: CartState): void {
  renderItems(state);
  syncCustomer(state);
  syncSubmit(state);
}

function openDrawer(): void {
  const e = els();
  lastTrigger = document.activeElement as HTMLElement;
  e.drawer.classList.remove('translate-x-full');
  e.overlay.classList.remove('opacity-0', 'pointer-events-none');
  e.close.focus();
  document.body.style.overflow = 'hidden';
}

function closeDrawer(): void {
  const e = els();
  e.drawer.classList.add('translate-x-full');
  e.overlay.classList.add('opacity-0', 'pointer-events-none');
  document.body.style.overflow = '';
  lastTrigger?.focus();
}

function trapFocus(ev: KeyboardEvent): void {
  if (ev.key !== 'Tab') return;
  const e = els();
  if (e.drawer.classList.contains('translate-x-full')) return;
  const focusables = e.drawer.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (ev.shiftKey && document.activeElement === first) {
    ev.preventDefault();
    last.focus();
  } else if (!ev.shiftKey && document.activeElement === last) {
    ev.preventDefault();
    first.focus();
  }
}

export function initDrawer(): void {
  const e = els();
  syncDrawer(loadCart());

  e.button.addEventListener('click', openDrawer);
  e.close.addEventListener('click', closeDrawer);
  e.overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeDrawer();
    trapFocus(ev);
  });

  const customerFields: Array<[HTMLInputElement | HTMLTextAreaElement, 'name' | 'instagram' | 'notes']> = [
    [e.name, 'name'],
    [e.instagram, 'instagram'],
    [e.notes, 'notes'],
  ];
  customerFields.forEach(([el, field]) => {
    el.addEventListener('input', () => {
      const next = updateCustomer(loadCart(), { [field]: el.value });
      saveCart(next);
      dispatchCartChange(next);
    });
  });

  window.addEventListener(CART_EVENT, ((ev: CustomEvent<CartState>) => {
    syncDrawer(ev.detail);
  }) as EventListener);
}
```

- [ ] **Step 3: Wire into index.astro**

Import and render `<CartDrawer />` at the end of `<main>`'s parent (after `<Configurador />`), and add:

```astro
<script>
  import { initDrawer } from '../lib/drawer-ui';
  initDrawer();
</script>
```

- [ ] **Step 4: Manual verification**

Run `npm run dev`: add services → badge counts, total animates, drawer opens/closes (Esc, overlay, ✕), focus moves into drawer and traps, name/IG/notes persist to localStorage on reload, submit link contains encoded message, button disabled-looking when empty.

- [ ] **Step 5: Commit**

```bash
git add src/components/CartDrawer.astro src/lib/drawer-ui.ts src/pages/index.astro
git commit -m "feat: cart drawer with live total, focus trap and wa.me submit"
```

---

### Task 10: Footer, marquee and micro-details

**Files:**
- Create: `src/components/Footer.astro`
- Create: `src/components/Marquee.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SITE` from config
- Produces: `<Marquee />` loop band between sections; `<Footer />` with Instagram, WhatsApp and email links + reveal animation.

- [ ] **Step 1: Create src/components/Marquee.astro**

```astro
---
const words = ['VFX', 'VISUALIZERS', 'CROMA', 'MONTAJE', 'REELS', 'PORTADAS', 'GLITCHES', 'ROTO', 'IA 3D'];
const strip = [...words, ...words];
---

<div class="border-y-2 border-ink bg-lime overflow-hidden py-3" aria-hidden="true">
  <div class="animate-marquee flex w-max gap-10 whitespace-nowrap font-bold text-xl">
    {strip.map((w) => (
      <span class="flex items-center gap-10">{w}<span class="text-cyan">✦</span></span>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Create src/components/Footer.astro**

```astro
---
import { SITE } from '../config/site';
---

<footer id="footer" class="border-t-2 border-ink px-6 md:px-10 py-16">
  <div class="max-w-6xl mx-auto grid gap-10 md:grid-cols-2">
    <div>
      <p class="footer-title text-3xl md:text-5xl font-bold">¿Listo para tu VFX?</p>
      <a
        href={`https://wa.me/${SITE.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        class="footer-cta mt-6 inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 font-bold border-2 border-ink hover:bg-cyan hover:text-ink hover:border-cyan transition-colors"
      >
        Escribir por WhatsApp →
      </a>
    </div>
    <div class="flex flex-col gap-3 md:items-end md:text-right justify-end text-sm">
      <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" class="hover:text-cyan transition-colors font-medium">Instagram @{SITE.instagram}</a>
      <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" class="hover:text-cyan transition-colors font-medium">WhatsApp {SITE.whatsappDisplay}</a>
      <a href={`mailto:${SITE.email}`} class="hover:text-cyan transition-colors font-medium">{SITE.email}</a>
      <p class="text-muted font-mono mt-4">© {new Date().getFullYear()} VFXBYFLEX</p>
    </div>
  </div>
</footer>

<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(['.footer-title', '.footer-cta'], {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#footer', start: 'top 80%' },
    });
  });
</script>
```

- [ ] **Step 3: Wire Marquee after Destacados and Footer at page end in index.astro**

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro src/components/Marquee.astro src/pages/index.astro
git commit -m "feat: footer and services marquee"
```

---

### Task 11: Playwright smoke test + deploy config + README

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/cotizador.spec.ts`
- Create: `netlify.toml`
- Create: `README.md`

**Interfaces:**
- Consumes: full site via dev server
- Produces: runnable `npm run test:e2e`; deploy-ready static build; README with edit instructions for Flex (prices, projects, contact).

- [ ] **Step 1: Create playwright.config.ts**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:4321',
    locale: 'es-AR',
  },
  webServer: {
    command: 'npm run dev',
    port: 4321,
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 2: Write failing e2e test tests/e2e/cotizador.spec.ts**

```ts
import { expect, test } from '@playwright/test';

test('agregar un servicio y enviar por WhatsApp', async ({ page }) => {
  await page.goto('/');
  await page.locator('.service-option[data-option="visualizer-full"]').click();
  await page.locator('#cart-button').click();
  await expect(page.locator('#cart-total')).toHaveText('USD 30');
  await page.locator('#cart-name').fill('Juan');
  const href = await page.locator('#cart-submit').getAttribute('href');
  expect(href).toContain('https://wa.me/5493794270276?text=');
  const decoded = decodeURIComponent(href!.split('text=')[1]);
  expect(decoded).toContain('Visualizer Full');
  expect(decoded).toContain('TOTAL: USD 30');
  expect(decoded).toContain('Nombre: Juan');
  expect(decoded).toContain('enviá el MP3');
});

test('2 Reels excluye 1 Reel', async ({ page }) => {
  await page.goto('/');
  await page.locator('.service-option[data-option="reel-1"]').click();
  await page.locator('.service-option[data-option="reel-2"]').click();
  await page.locator('#cart-button').click();
  const items = page.locator('#cart-items li');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText('2 Reels');
});
```

- [ ] **Step 3: Install browsers and run e2e**

Run: `npx playwright install chromium && npm run test:e2e`
Expected: both tests PASS. If dev server already running, `reuseExistingServer` reuses it.

- [ ] **Step 4: Create netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

- [ ] **Step 5: Create README.md**

```markdown
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
```

- [ ] **Step 6: Final full check**

Run: `npm test && npm run build`
Expected: all unit tests pass, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts tests/e2e netlify.toml README.md
git commit -m "feat: e2e smoke test, deploy config and readme"
```

---

## Self-Review

1. **Spec coverage:**
   - Hero/Destacados/Configurador/Drawer/Footer → Tasks 6-10 ✅
   - Modelo de datos y precios (incl. croma 35/+15/+25, extras 10/17/8) → Task 2 ✅
   - Cart exclusividad Reel/2 Reels, actualización Croma, localStorage → Task 3 ✅
   - Mensaje WhatsApp con formato del spec, omisión de secciones vacías, recordatorio MP3 → Task 4 ✅
   - Paleta blanco/negro + verde/celeste, sin magenta → Global Constraints + Task 2/5 tokens ✅
   - Motion (SplitText glitch, reveals, parallax, magnetic, chip flight, counter, marquee) → Tasks 6-10 ✅
   - prefers-reduced-motion, focus trap, aria-live → Tasks 6, 9 + Global Constraints ✅
   - Testing Vitest + Playwright → Tasks 3-4, 11 ✅
   - Deploy Netlify/Cloudflare + README → Task 11 ✅
   - Contacto (wa.me 5493794270276, IG, email) → Task 2 `site.ts` ✅
   - Gaps found: none.
2. **Placeholder scan:** SVG placeholder thumbnails are intentional deliverables (marked "Próximo ejemplo" until Flex supplies real work) — not plan placeholders. No TBD/TODO in steps.
3. **Type consistency:** `itemKeyFor`, `CartState`, `buildCromaItem`, `CART_EVENT`, `SERVICES` ids and option ids (`visualizer-full`, `reel-1`, `reel-2`, `portada`) used identically across Tasks 2-4, 8-9, 11. `flyChip` and drawer submit link both consume the same cart state.
