import type { APIRoute } from 'astro';

type LegalRedirectOptions = {
  destination: `/${string}/`;
  lang: string;
  title: string;
  linkLabel: string;
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export const createLegalRedirect = ({
  destination,
  lang,
  title,
  linkLabel
}: LegalRedirectOptions): APIRoute => ({ site }) => {
  const canonical = new URL(destination, site).toString();
  const safeDestination = escapeHtml(destination);

  return new Response(
    `<!doctype html><html lang="${escapeHtml(lang)}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${safeDestination}"><link rel="canonical" href="${escapeHtml(canonical)}"><title>${escapeHtml(title)}</title></head><body><a href="${safeDestination}">${escapeHtml(linkLabel)}</a></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
};
