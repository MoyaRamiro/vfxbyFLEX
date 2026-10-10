import type { ImageMetadata } from 'astro';
import { SITE } from '../config/site';
import visualizer from '../assets/projects/visualizer.png';
import vfxPro from '../assets/projects/vfx-pro.png';
import croma from '../assets/projects/croma.png';
import montaje from '../assets/projects/montaje.png';

export interface Project {
  title: string;
  thumbnail: ImageMetadata;
  url: string;
}

export const PROJECTS: Project[] = [
  { title: 'Visualizer', thumbnail: visualizer, url: SITE.instagramUrl },
  { title: 'VFX Pro', thumbnail: vfxPro, url: SITE.instagramUrl },
  { title: 'Croma', thumbnail: croma, url: SITE.instagramUrl },
  { title: 'Montaje', thumbnail: montaje, url: SITE.instagramUrl },
];
