import { SITE } from '../config/site';

export interface Project {
  title: string;
  thumbnail: string;
  url: string;
}

export const PROJECTS: Project[] = [
  {
    title: 'Visualizer — Próximo ejemplo',
    thumbnail: '/projects/placeholder-1.svg',
    url: SITE.instagramUrl,
  },
  {
    title: 'VFX Pro — Próximo ejemplo',
    thumbnail: '/projects/placeholder-2.svg',
    url: SITE.instagramUrl,
  },
  {
    title: 'Croma — Próximo ejemplo',
    thumbnail: '/projects/placeholder-3.svg',
    url: SITE.instagramUrl,
  },
  {
    title: 'Montaje — Próximo ejemplo',
    thumbnail: '/projects/placeholder-4.svg',
    url: SITE.instagramUrl,
  },
];
