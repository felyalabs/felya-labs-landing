import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL?.trim() || 'https://preview.felyalabs.com';

export default defineConfig({
  site,
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'never'
  }
});
