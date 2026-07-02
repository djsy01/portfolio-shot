import { defineConfig } from 'portfolio-shot';

/**
 * Captures every page across desktop, mobile, and tablet, in both light and
 * dark mode — 6 files per page (e.g. home-desktop-light.webp ... home-tablet-dark.webp).
 */
export default defineConfig({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
  ],
  devices: ['desktop', 'mobile', 'tablet'],
  colorSchemes: ['light', 'dark'],
});
