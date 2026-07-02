import { defineConfig } from 'portfolio-shot';

export default defineConfig({
  url: 'https://example.vercel.app',

  output: './public/screenshots',

  pages: [
    { path: '/', name: 'home' },
    { path: '/projects', name: 'projects' },
    { path: '/contact', name: 'contact' },
  ],

  format: 'webp',

  quality: 90,

  fullPage: true,

  // Optional overrides:
  // viewport: { width: 1440, height: 900 },
  // resize: { width: 1280 },
  // waitUntil: "networkidle",
  // timeout: 30000,

  // Capture each page across multiple devices/color schemes — see mobile-dark.config.ts
  // devices: ["desktop", "mobile", "tablet"],
  // colorSchemes: ["light", "dark"],

  // Capture pages behind a login — see auth-login.config.ts
  // auth: { storageStatePath: "./storage-state.json" },
});
