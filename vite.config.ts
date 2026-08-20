import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs : le site est servi sous /galacticrush/ (GitHub Pages,
  // project page) et pas à la racine du domaine.
  base: './',
  plugins: [svelte()],
});
