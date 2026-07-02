import { defineConfig } from 'portfolio-shot';

/**
 * Captures pages behind a login. The login form is filled and submitted once;
 * the resulting session (cookies + localStorage) is reused for every page.
 *
 * Never hardcode real credentials — load them from the environment, and add
 * the saved storage-state file to .gitignore (it contains a live session).
 */
export default defineConfig({
  url: 'https://example.vercel.app',
  output: './public/screenshots',
  pages: [{ path: '/dashboard', name: 'dashboard' }],
  auth: {
    login: {
      url: 'https://example.vercel.app/login',
      fields: [
        { selector: '#email', value: process.env.DEMO_EMAIL ?? '' },
        { selector: '#password', value: process.env.DEMO_PASSWORD ?? '' },
      ],
      submitSelector: '#submit',
      waitForSelector: '#dashboard',
    },
    // Cache the session so future runs can skip the login flow entirely:
    // auth: { storageStatePath: "./storage-state.json" }
    saveStorageStatePath: './storage-state.json',
  },
});
