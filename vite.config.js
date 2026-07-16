import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Use '/' if deploying to a custom domain (like www.stratexa.in)
  // Use '/stratexa-website/' if deploying to the default GitHub Pages URL (anandnowhere.github.io/stratexa-website/)
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        faq: resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        refund: resolve(__dirname, 'refund.html'),
        cookie: resolve(__dirname, 'cookie.html'),
        strategy: resolve(__dirname, 'trend-following-options-strategy.html'),
        login: resolve(__dirname, 'login.html'),
      }
    }
  }
});
