import { ui, type Lang } from './utils';
import type { Category, CategoryId } from '../data/catalog';
import { MOODS, type MoodOption } from '../config/order';

type Key = keyof typeof ui.es;

const categoryKeys: Record<CategoryId, { name: Key; tag: Key }> = {
  croma: { name: 'catCroma', tag: 'catCromaTag' },
  vfx: { name: 'catVfx', tag: 'catVfxTag' },
  montaje: { name: 'catMontaje', tag: 'catMontajeTag' },
  visual: { name: 'catVisual', tag: 'catVisualTag' },
  extras: { name: 'catExtras', tag: 'catExtrasTag' },
};

const groupKeys: Record<string, Key> = {
  'croma-modalidad': 'groupModalidad',
  'vfx-paquete': 'groupPaquete',
  'montaje-servicios': 'groupServicios',
  'visual-tipo': 'groupTipoVisual',
  'extras-servicios': 'groupExtras',
};

const optionKeys: Record<string, Key> = {
  'croma-25d-3d': 'optCroma25d',
  'croma-mezclado': 'optCromaMezclado',
  'croma-video-full': 'optCromaVideoFull',
  'croma-2d': 'optCroma2d',
  'vfx-basico': 'optVfxBasico',
  'vfx-pro': 'optVfxPro',
  'vfx-full': 'optVfxFull',
  'montaje-montaje': 'optMontaje',
  'montaje-color': 'optColor',
  'montaje-transiciones': 'optTransiciones',
  'visual-only-lyrics': 'optOnlyLyrics',
  'visual-lyrics-pro': 'optLyricsPro',
  'visual-25d-imagen': 'optVisual25d',
  'extra-correccion': 'optExtraCorreccion',
  'extra-miniatura': 'optExtraMiniatura',
  'extra-titulo': 'optExtraTitulo',
  'extra-reel': 'optExtraReel',
  'extra-cupo': 'optExtraCupo',
  'extra-rodaje': 'optExtraRodaje',
  'extra-visuales-show': 'optExtraVisualesShow',
  'extra-portada': 'optExtraPortada',
  'extra-quitar-marca': 'optExtraQuitarMarca',
};

const noteKeys: Record<string, Key> = {
  'croma-2d': 'optCroma2dNote',
  'visual-25d-imagen': 'optVisual25dNote',
};

const componentKeys: Record<string, Key> = {
  'vfx-pro-idea': 'bundleIdea',
  'vfx-full-idea': 'bundleIdea',
  'vfx-basico-transiciones': 'bundleTransiciones',
  'vfx-pro-transiciones': 'bundleTransiciones',
  'vfx-full-transiciones': 'bundleTransiciones',
  'vfx-basico-camaras': 'bundleCamaras',
  'vfx-pro-camaras': 'bundleCamaras',
  'vfx-full-camaras': 'bundleCamaras',
  'vfx-pro-titulo': 'bundleTitulo',
  'vfx-full-titulo': 'bundleTitulo',
  'vfx-pro-rotoscopia': 'bundleRotoscopia',
  'vfx-full-rotoscopia': 'bundleRotoscopia',
  'vfx-full-ia': 'bundleIa',
  'vfx-full-3d': 'bundle3d',
  'vfx-full-composicion': 'bundleComposicion',
};

const moodKeys: Record<string, Key> = {
  meme: 'moodMeme',
  trap: 'moodTrap',
  alegre: 'moodAlegre',
  conceptual: 'moodConceptual',
};

function tr(lang: Lang, key: Key | undefined, fallback: string): string {
  return key ? ui[lang][key] : fallback;
}

export function categoryName(lang: Lang, categoryId: CategoryId, fallback = ''): string {
  return tr(lang, categoryKeys[categoryId]?.name, fallback || categoryId);
}

export function categoryTagline(lang: Lang, categoryId: CategoryId, fallback = ''): string {
  return tr(lang, categoryKeys[categoryId]?.tag, fallback);
}

export function groupName(lang: Lang, groupId: string, fallback = ''): string {
  return tr(lang, groupKeys[groupId], fallback);
}

export function optionLabel(lang: Lang, optionId: string, fallback = ''): string {
  return tr(lang, optionKeys[optionId], fallback || optionId);
}

export function componentLabel(lang: Lang, componentId: string, fallback = ''): string {
  return tr(lang, componentKeys[componentId], fallback || componentId);
}

export function moodLabel(lang: Lang, moodId: string, fallback = ''): string {
  return tr(lang, moodKeys[moodId], fallback || moodId);
}

export function localizeCatalog(lang: Lang, categories: Category[]): Category[] {
  return categories.map((cat) => ({
    ...cat,
    name: categoryName(lang, cat.id, cat.name),
    tagline: categoryTagline(lang, cat.id, cat.tagline),
    groups: cat.groups.map((g) => ({
      ...g,
      name: groupName(lang, g.id, g.name),
      options: g.options.map((o) => ({
        ...o,
        label: optionLabel(lang, o.id, o.label),
        note: noteKeys[o.id] ? ui[lang][noteKeys[o.id]] : o.note,
        bundle: o.bundle?.map((c) => ({
          ...c,
          label: componentLabel(lang, c.id, c.label),
        })),
      })),
    })),
  }));
}

export function localizeMoods(lang: Lang): MoodOption[] {
  return MOODS.map((m) => ({ ...m, label: moodLabel(lang, m.id, m.label) }));
}

export function getClientLang(): Lang {
  if (typeof document === 'undefined') return 'es';
  return document.documentElement.lang === 'en' ? 'en' : 'es';
}
