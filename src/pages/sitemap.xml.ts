import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL(SITE.url);
  const url = new URL('/', base).href;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
