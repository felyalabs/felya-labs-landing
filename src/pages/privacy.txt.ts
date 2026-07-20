import { legalPages } from '../data/legal.js';

export function GET() {
  return new Response(legalPages.privacy.rawContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}
