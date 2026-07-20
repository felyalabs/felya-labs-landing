import type { APIRoute } from 'astro';
import { localePath, locales } from '../i18n/config';

export const prerender = true;

const routes = [
  ...locales.map(localePath),
  '/terms/',
  '/privacy/',
  '/impressum/'
];

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Astro site URL is required to generate sitemap.xml');
  const urls = routes
    .map(route => `  <url><loc>${escapeXml(new URL(route, site).toString())}</loc></url>`)
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
