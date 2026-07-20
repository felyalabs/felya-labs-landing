import { createLegalRedirect } from '../utils/legalRedirect';

export const prerender = true;

export const GET = createLegalRedirect({
  destination: '/terms/',
  lang: 'en',
  title: 'Redirecting…',
  linkLabel: 'Continue'
});
