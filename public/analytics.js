/**
 * Stratexa Real-Time Analytics & Telemetry Engine (analytics.js)
 * Privacy-friendly, zero-dependency analytics for tracking:
 * 1. Unique Visitors & Sessions (New vs Returning)
 * 2. Device Types (Mobile, Desktop, Tablet)
 * 3. Operating Systems (Android, iOS, Windows, macOS, Linux)
 * 4. Active Dwell Time (Real reading duration, pauses on tab blur)
 * 5. Scroll Depth Funnel (25%, 50%, 75%, 90%)
 * 6. High-Intent Conversions (Consultation bookings, Backtest sheet downloads, WhatsApp clicks, Live Demo)
 * 7. Page Readership (Daily Market Pulse, Blog Teardowns, Strategy pages)
 * 8. Geography (Country, City, Language, Timezone)
 */

(function () {
  'use strict';

  // Supabase Telemetry Endpoint
  const SUPABASE_URL = 'https://suidnqsvuxaoqoyuqpys.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWRucXN2dXhhb3FveXVxcHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTI1MTYsImV4cCI6MjEwODMyODUxNn0.uB0A3hVBCDuCkXz5fJFt3eMlpLjcyEbrLL17rWc1ILg';

  // Identity & Session Helpers
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getOrSetVisitorId() {
    try {
      let vid = localStorage.getItem('stratexa_visitor_id');
      if (!vid) {
        vid = 'v_' + generateUUID();
        localStorage.setItem('stratexa_visitor_id', vid);
        localStorage.setItem('stratexa_first_visit', new Date().toISOString());
      }
      return vid;
    } catch (e) {
      return 'v_temp_' + generateUUID();
    }
  }

  function getOrSetSessionId() {
    try {
      let sid = sessionStorage.getItem('stratexa_session_id');
      if (!sid) {
        sid = 's_' + generateUUID();
        sessionStorage.setItem('stratexa_session_id', sid);
        sessionStorage.setItem('stratexa_session_start', Date.now().toString());
      }
      return sid;
    } catch (e) {
      return 's_temp_' + generateUUID();
    }
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
    if (ua.includes('win')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    return 'Unknown';
  }

  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/') && !ua.includes('Chromium/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('Firefox/')) return 'Firefox';
    return 'Other';
  }

  function getCleanPath() {
    let p = window.location.pathname || '/';
    if (p.endsWith('/index.html')) p = '/';
    return p;
  }

  function getCleanReferrer() {
    const ref = document.referrer;
    if (!ref) return 'direct';
    try {
      const url = new URL(ref);
      if (url.hostname.includes('google')) return 'google';
      if (url.hostname.includes('whatsapp') || url.protocol === 'whatsapp:') return 'whatsapp';
      if (url.hostname.includes('t.co') || url.hostname.includes('twitter') || url.hostname.includes('x.com')) return 'x_twitter';
      if (url.hostname.includes('linkedin')) return 'linkedin';
      if (url.hostname.includes('youtube')) return 'youtube';
      if (url.hostname.includes('stratexa.in')) return 'internal';
      return url.hostname;
    } catch (e) {
      return ref;
    }
  }

  function getUTMParams() {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source') || null,
      utm_medium: p.get('utm_medium') || null,
      utm_campaign: p.get('utm_campaign') || null,
      utm_content: p.get('utm_content') || null
    };
  }

  // Lightweight Geo Resolver (Cloudflare trace + fallback)
  let cachedCountry = 'IN';
  async function resolveCountry() {
    try {
      const stored = sessionStorage.getItem('stratexa_geo_country');
      if (stored) {
        cachedCountry = stored;
        return stored;
      }
      const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'force-cache' });
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('loc=')) {
            cachedCountry = line.split('=')[1] || 'IN';
            sessionStorage.setItem('stratexa_geo_country', cachedCountry);
            break;
          }
        }
      }
    } catch (e) {
      // fallback to India
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) {
        cachedCountry = 'IN';
      }
    }
    return cachedCountry;
  }

  // Supabase Ingestion
  async function sendToSupabase(table, payload) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (err) {
      // Graceful offline degradation
      try {
        const localQueue = JSON.parse(localStorage.getItem('stratexa_analytics_queue') || '[]');
        localQueue.push({ table, payload, time: Date.now() });
        if (localQueue.length > 50) localQueue.shift();
        localStorage.setItem('stratexa_analytics_queue', JSON.stringify(localQueue));
      } catch (e) {}
    }
  }

  // State
  const visitorId = getOrSetVisitorId();
  const sessionId = getOrSetSessionId();
  const isReturning = !!localStorage.getItem('stratexa_first_visit') && 
    (Date.now() - new Date(localStorage.getItem('stratexa_first_visit')).getTime() > 24 * 3600 * 1000);

  let activeSeconds = 0;
  let isTabActive = document.visibilityState === 'visible';
  let maxScrollPct = 0;
  const milestonesReached = new Set();

  // 1. Log Initial Pageview
  async function logPageview() {
    await resolveCountry();
    const utm = getUTMParams();

    const pageviewData = {
      visitor_id: visitorId,
      session_id: sessionId,
      url: window.location.href,
      path: getCleanPath(),
      title: document.title || 'Stratexa',
      referrer: getCleanReferrer(),
      country: cachedCountry,
      device: detectDevice(),
      os: detectOS(),
      browser: detectBrowser(),
      screen_res: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      is_returning: isReturning,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content
    };

    sendToSupabase('analytics_pageviews', pageviewData);

    // Initial event log
    trackEvent('page_view', {
      site: 'stratexa.in',
      path: getCleanPath(),
      title: document.title,
      device: detectDevice(),
      os: detectOS(),
      country: cachedCountry
    });
  }

  // 2. Generic Event Tracker
  function trackEvent(eventName, eventData = {}) {
    const payload = {
      session_id: sessionId,
      event_name: eventName,
      event_data: {
        site: 'stratexa.in',
        path: getCleanPath(),
        visitor_id: visitorId,
        device: detectDevice(),
        os: detectOS(),
        country: cachedCountry,
        active_seconds: activeSeconds,
        max_scroll: maxScrollPct,
        timestamp: new Date().toISOString(),
        ...eventData
      }
    };
    sendToSupabase('analytics_events', payload);
  }

  // 3. Active Dwell Time Tracker (Pauses when tab blurred)
  setInterval(() => {
    if (isTabActive) {
      activeSeconds += 1;
      // Periodic heartbeat every 30 seconds
      if (activeSeconds % 30 === 0) {
        trackEvent('dwell_update', { seconds: activeSeconds, final: false });
      }
    }
  }, 1000);

  document.addEventListener('visibilitychange', () => {
    isTabActive = document.visibilityState === 'visible';
    if (!isTabActive) {
      trackEvent('dwell_update', { seconds: activeSeconds, paused: true });
    }
  });

  window.addEventListener('beforeunload', () => {
    trackEvent('session_exit', { total_active_seconds: activeSeconds, max_scroll: maxScrollPct });
  });

  // 4. Scroll Depth Tracker (25%, 50%, 75%, 90%)
  function checkScrollDepth() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const currentPct = Math.round((window.scrollY / docHeight) * 100);
    if (currentPct > maxScrollPct) maxScrollPct = currentPct;

    const milestones = [25, 50, 75, 90];
    milestones.forEach(m => {
      if (currentPct >= m && !milestonesReached.has(m)) {
        milestonesReached.add(m);
        trackEvent('scroll_depth', { percent: m });
      }
    });
  }
  window.addEventListener('scroll', checkScrollDepth, { passive: true });

  // 5. High-Intent Conversion Listeners
  function attachConversionListeners() {
    // A. WhatsApp Clicks
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(el => {
      el.addEventListener('click', () => {
        trackEvent('whatsapp_click', {
          cta_text: el.innerText.trim(),
          context: el.closest('.lead-magnet-card') ? 'lead_magnet' : 'navigation'
        });
      });
    });

    // B. Lead Magnet / Backtest Downloads
    const modalForm = document.querySelector('#modal-download-form');
    if (modalForm) {
      modalForm.addEventListener('submit', () => {
        trackEvent('backtest_download_submit', {
          page: getCleanPath()
        });
      });
    }

    const openModalBtns = document.querySelectorAll('#open-modal-btn, .open-modal-btn');
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        trackEvent('backtest_modal_open', { page: getCleanPath() });
      });
    });

    // C. Free Consultation Submissions
    const consultForm = document.querySelector('#consultation-form');
    if (consultForm) {
      consultForm.addEventListener('submit', () => {
        trackEvent('consultation_submit', { page: getCleanPath() });
      });
    }

    // D. Live Demo Clicks
    document.querySelectorAll('a[href*="login.html"]').forEach(el => {
      el.addEventListener('click', () => {
        trackEvent('demo_click', { text: el.innerText.trim() });
      });
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      logPageview();
      attachConversionListeners();
    });
  } else {
    logPageview();
    attachConversionListeners();
  }

  // Public API
  window.stratexaAnalytics = {
    track: trackEvent,
    getVisitorId: () => visitorId,
    getSessionId: () => sessionId,
    getActiveSeconds: () => activeSeconds
  };
})();
