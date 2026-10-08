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

export const PACKAGE_PRICES: Record<'vfx-basico' | 'vfx-pro' | 'montaje', number> = {
  'vfx-basico': 20,
  'vfx-pro': 45,
  montaje: 15,
};
