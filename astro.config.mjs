import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.felyalabs.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  build: {
    format: 'file',
    inlineStylesheets: 'never'
  }
});
