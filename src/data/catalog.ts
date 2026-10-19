export type CategoryId = 'visual' | 'croma' | 'vfx' | 'montaje' | 'extras';

export interface CatalogOption {
  id: string;
  label: string;
  note?: string;
  price: number;
  promo?: boolean;
}

export interface CatalogGroup {
  id: string;
  name: string;
  kind: 'single' | 'multi';
  options: CatalogOption[];
  showWhen?: string;
}

export interface EntornosConfig {
  priceEach: number;
  min: number;
  max: number;
  defaultValue: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  groups: CatalogGroup[];
  entornos?: EntornosConfig;
  preview?: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'visual',
    name: 'Visual',
    tagline: 'Lyrics y visuales en movimiento',
    groups: [
      {
        id: 'visual-tipo',
        name: 'Tipo de visual',
        kind: 'single',
        options: [
          { id: 'visual-only-lyrics', label: 'Only Lyrics', price: 57 },
          { id: 'visual-lyrics-pro', label: 'Lyrics Pro', price: 99 },
          { id: 'visual-25d-imagen', label: 'Visual con una sola imagen 2.5D', note: 'Una imagen en movimiento 2.5D', price: 45, promo: true },
        ],
      },
    ],
  },
  {
    id: 'croma',
    name: 'Croma',
    tagline: 'Entornos compuestos con croma a medida',
    groups: [
      {
        id: 'croma-modalidad',
        name: 'Modalidad',
        kind: 'single',
        options: [
          { id: 'croma-25d-3d', label: 'Croma 2.5D y 3D', price: 119, promo: true },
          { id: 'croma-mezclado', label: 'Croma mezclado', price: 119 },
          { id: 'croma-video-full', label: 'Video Full (fondo blanco) con VFX Full', price: 179, promo: true },
          { id: 'croma-2d', label: 'Croma 2D', note: 'Imagen o video atrás, sin profundidad', price: 135 },
        ],
      },
    ],
    entornos: { priceEach: 10, min: 1, max: 6, defaultValue: 1 },
  },
  {
    id: 'vfx',
    name: 'VFX',
    tagline: 'Cámaras lentas, transiciones, efectos y título',
    groups: [
      {
        id: 'vfx-paquete',
        name: 'Paquete',
        kind: 'single',
        options: [
          { id: 'vfx-basico', label: 'VFX Básico', price: 85 },
          { id: 'vfx-pro', label: 'VFX Pro', price: 149 },
          { id: 'vfx-full', label: 'VFX Full', price: 199, promo: true },
        ],
      },
      {
        id: 'vfx-complementos-basico',
        name: 'Complementos',
        kind: 'multi',
        showWhen: 'vfx-basico',
        options: [
          { id: 'vfx-basico-transiciones', label: 'Transiciones', price: 45 },
          { id: 'vfx-basico-camaras', label: 'Cámaras lentas', price: 45 },
        ],
      },
      {
        id: 'vfx-complementos-pro',
        name: 'Complementos',
        kind: 'multi',
        showWhen: 'vfx-pro',
        options: [
          { id: 'vfx-pro-idea', label: 'Idea / dirección creativa', price: 10 },
          { id: 'vfx-pro-transiciones', label: 'Transiciones', price: 45 },
          { id: 'vfx-pro-camaras', label: 'Cámaras lentas', price: 15 },
          { id: 'vfx-pro-titulo', label: 'Título 3D / 2D', price: 20 },
          { id: 'vfx-pro-rotoscopia', label: 'Efectos de rotoscopia', price: 65 },
        ],
      },
      {
        id: 'vfx-complementos-full',
        name: 'Complementos',
        kind: 'multi',
        showWhen: 'vfx-full',
        options: [
          { id: 'vfx-full-idea', label: 'Idea / dirección creativa', price: 10 },
          { id: 'vfx-full-transiciones', label: 'Transiciones', price: 45 },
          { id: 'vfx-full-camaras', label: 'Cámaras lentas', price: 15 },
          { id: 'vfx-full-titulo', label: 'Título 3D / 2D', price: 20 },
          { id: 'vfx-full-rotoscopia', label: 'Efectos de rotoscopia', price: 65 },
          { id: 'vfx-full-ia', label: 'IA', price: 20 },
          { id: 'vfx-full-3d', label: '3D', price: 20 },
          { id: 'vfx-full-composicion', label: 'Composición', price: 10 },
        ],
      },
    ],
  },
  {
    id: 'montaje',
    name: 'Montaje / Color',
    tagline: 'Montaje, color y transiciones',
    groups: [
      {
        id: 'montaje-servicios',
        name: 'Servicios',
        kind: 'multi',
        options: [
          { id: 'montaje-montaje', label: 'Montaje', price: 33 },
          { id: 'montaje-color', label: 'Color', price: 5 },
          { id: 'montaje-transiciones', label: 'Transiciones', price: 19 },
        ],
      },
    ],
  },
  {
    id: 'extras',
    name: 'Extras',
    tagline: 'Sumá piezas y servicios sueltos',
    groups: [
      {
        id: 'extras-servicios',
        name: 'Extras',
        kind: 'multi',
        options: [
          { id: 'extra-correccion', label: 'Corrección extra', price: 15 },
          { id: 'extra-miniatura', label: 'Miniatura', price: 3 },
          { id: 'extra-titulo', label: 'Título', price: 10, promo: true },
          { id: 'extra-reel', label: 'Reel', price: 3 },
          { id: 'extra-cupo', label: 'Cupo prioritario', price: 10, promo: true },
          { id: 'extra-rodaje', label: 'Rodaje (Mar del Plata)', price: 35 },
          { id: 'extra-visuales-show', label: 'Visuales para show', price: 55 },
          { id: 'extra-portada', label: 'Portada', price: 30 },
        ],
      },
    ],
  },
];

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);

export function getCategory(id: CategoryId): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getOption(categoryId: CategoryId, optionId: string): CatalogOption | undefined {
  const category = getCategory(categoryId);
  if (!category) return undefined;
  for (const group of category.groups) {
    const option = group.options.find((o) => o.id === optionId);
    if (option) return option;
  }
  return undefined;
}

export function getGroup(categoryId: CategoryId, groupId: string): CatalogGroup | undefined {
  return getCategory(categoryId)?.groups.find((g) => g.id === groupId);
}

export function groupOfOption(categoryId: CategoryId, optionId: string): CatalogGroup | undefined {
  return getCategory(categoryId)?.groups.find((g) => g.options.some((o) => o.id === optionId));
}

export function isExtra(categoryId: CategoryId): boolean {
  return categoryId === 'extras';
}