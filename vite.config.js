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
        strategies: resolve(__dirname, 'strategies.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        refund: resolve(__dirname, 'refund.html'),
        cookie: resolve(__dirname, 'cookie.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        strategy: resolve(__dirname, 'trend-following-options-strategy.html'),
        blogs: resolve(__dirname, 'blogs.html'),
        market_pulse: resolve(__dirname, 'daily-market-pulse.html'),
        supertrend_backtest: resolve(__dirname, 'supertrend-vs-ema-nifty-backtest.html'),
        retail_latency: resolve(__dirname, 'why-retail-traders-lose-execution-latency.html'),
        broker_architecture: resolve(__dirname, 'zerodha-kite-angel-one-python-bot-architecture.html'),
        straddle_guide: resolve(__dirname, '920-straddle-automated-trailing-sl-guide.html'),
        server_execution: resolve(__dirname, 'server-side-execution-vs-browser-terminal-freezes.html'),
        login: resolve(__dirname, 'login.html'),
        analytics_dashboard: resolve(__dirname, 'analytics-dashboard.html'),
      }
    }
  }
});
