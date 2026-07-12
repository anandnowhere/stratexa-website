// --- Stratexa Main JS Interactivity ---

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFormHandler();
  initLiveChart();
  initStickyCTA();
});

// --- Navbar Interactivity ---
function initNavbar() {
  const header = document.querySelector('#main-header');
  const navToggle = document.querySelector('#nav-toggle');
  const navMenu = document.querySelector('#nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header scroll effect
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // Toggle mobile menu drawer
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Animate the hamburger button into an X
      const bars = navToggle.querySelectorAll('.bar');
      if (navMenu.classList.contains('active')) {
        bars[0].style.transform = 'translateY(8px) rotate(45deg)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });
  }

  // Close mobile menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const bars = navToggle.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });
  });

  // Theme Toggle Logic
  const themeToggleBtn = document.querySelector('#theme-toggle-btn');
  
  // Load and apply saved theme
  const currentTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(theme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      if (theme === 'light') {
        icon.className = 'fa-regular fa-sun';
      } else {
        icon.className = 'fa-regular fa-moon';
      }
    }
  }
}

// Configuration
// Paste your deployed Google Apps Script Web App URL below
const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxp4utuxkTKfW2VNY9PqZBKVfSD-n_s3bYQ81JbpJqcK4d-o9RQiswUPbZ2Vu7wHup8xw/exec";

// --- Consultation Form Handler ---
function initFormHandler() {
  const form = document.querySelector('#consultation-form');
  const successCard = document.querySelector('#form-success-message');
  const submitBtn = document.querySelector('#form-submit-btn');
  const resetBtn = document.querySelector('#form-reset-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic Validation
    const name = document.querySelector('#form-name').value.trim();
    const email = document.querySelector('#form-email').value.trim();
    const phone = document.querySelector('#form-phone').value.trim();
    const market = document.querySelector('#form-market').value;
    const preferredApi = document.querySelector('#form-api') ? document.querySelector('#form-api').value : 'Not decided';
    const message = document.querySelector('#form-message').value.trim();

    if (!name || !email || !phone || !market || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    if (GOOGLE_SHEET_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
      alert('Consultation request simulation successful! To save leads in Google Sheets, please set up the Apps Script and add the Web App URL to src/main.js.');
      // Fallback transition to mock success state
      form.classList.add('hidden');
      successCard.classList.remove('hidden');
      form.reset();
      return;
    }

    // Visual loading state on button
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="btn-text">Submitting Request...</span>
      <i class="fa-solid fa-circle-notch fa-spin btn-icon"></i>
    `;

    // Send data to Google Sheets via Apps Script Web App
    fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain' // Use text/plain to avoid CORS preflight issues with Apps Script
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        market: market,
        preferred_api: preferredApi,
        message: message
      })
    })
    .then(async (response) => {
      // Google Apps Script usually returns 200 even for redirects
      form.classList.add('hidden');
      successCard.classList.remove('hidden');
      form.reset();
    })
    .catch((error) => {
      console.error(error);
      alert('Form submission failed. Please check your internet connection.');
    })
    .finally(() => {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
  });

  // Reset form card back to input state
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      successCard.classList.add('hidden');
      form.classList.remove('hidden');
    });
  }
}

// --- Live Simulating Algorithmic Trading Chart ---
function initLiveChart() {
  const canvas = document.querySelector('#live-trading-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const pnlEl = document.querySelector('#live-pnl');
  const winrateEl = document.querySelector('#live-winrate');
  const signalLogEl = document.querySelector('#live-signal-log');
  const tickerEl = document.querySelector('#live-ticker');

  // Handle high-DPI retina displays
  function resizeCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 250 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `250px`;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Simulation Parameters
  let candles = [];
  const maxCandles = 24;
  let currentPrice = 24320.00;
  let currentPnL = 18.4;
  let currentWinRate = 67.8;
  let simulatedTradesCount = 84;
  let wonTradesCount = 57;
  
  // Tickers list for rotation to simulate multiple systems
  const tickers = ['NIFTY50 FUTURES', 'BANKNIFTY FUTURES', 'BTCUSDT PERP', 'ETHUSDT PERP', 'EURUSD SPOT'];
  let tickerIndex = 0;
  let tickerTickCount = 0;

  // Initialize starting candles (historical simulation buffer)
  for (let i = 0; i < maxCandles; i++) {
    const isUp = Math.random() > 0.42; // slight upward bias
    const bodySize = Math.random() * 30 + 10;
    const tailTop = Math.random() * 15;
    const tailBottom = Math.random() * 15;
    
    const open = currentPrice;
    const close = isUp ? open + bodySize : open - bodySize;
    const high = Math.max(open, close) + tailTop;
    const low = Math.min(open, close) - tailBottom;
    
    candles.push({ open, high, low, close, type: isUp ? 'bull' : 'bear' });
    currentPrice = close;
  }

  // Draw loop
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / window.devicePixelRatio;
    const h = 250;
    
    // Fetch theme colors dynamically
    const style = getComputedStyle(document.documentElement);
    const gridLineColor = style.getPropertyValue('--grid-line').trim() || 'rgba(255, 255, 255, 0.04)';
    const laserGreenColor = style.getPropertyValue('--laser-line-green').trim() || 'rgba(16, 185, 129, 0.35)';
    const laserRedColor = style.getPropertyValue('--laser-line-red').trim() || 'rgba(239, 68, 68, 0.35)';
    
    // Draw Grid Lines
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    const gridCols = 8;
    const gridRows = 5;
    
    for (let i = 0; i < gridCols; i++) {
      const x = (w / gridCols) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 0; i < gridRows; i++) {
      const y = (h / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Min and Max prices in our buffer for scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });
    
    // Add margin to min/max
    const priceDiff = maxPrice - minPrice || 10;
    minPrice -= priceDiff * 0.1;
    maxPrice += priceDiff * 0.1;

    // Helper to map price to Y-coordinate
    function mapY(price) {
      return h - 30 - ((price - minPrice) / (maxPrice - minPrice)) * (h - 60);
    }

    // Draw Moving Average Line (EMA 9)
    let emaPoints = [];
    let ema = candles[0].close;
    const k = 2 / (9 + 1);
    
    candles.forEach((c, index) => {
      ema = c.close * k + ema * (1 - k);
      const x = 20 + (index * ((w - 40) / maxCandles));
      const y = mapY(ema);
      emaPoints.push({ x, y });
    });

    // Draw EMA glow shadow
    ctx.beginPath();
    ctx.moveTo(emaPoints[0].x, emaPoints[0].y);
    for (let i = 1; i < emaPoints.length; i++) {
      ctx.lineTo(emaPoints[i].x, emaPoints[i].y);
    }
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Candlesticks
    const candleWidth = (w - 40) / maxCandles - 6;
    
    candles.forEach((c, index) => {
      const x = 20 + (index * ((w - 40) / maxCandles));
      const yOpen = mapY(c.open);
      const yClose = mapY(c.close);
      const yHigh = mapY(c.high);
      const yLow = mapY(c.low);
      
      const isBull = c.close >= c.open;
      const color = isBull ? '#10b981' : '#ef4444';
      
      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, yHigh);
      ctx.lineTo(x + candleWidth / 2, yLow);
      ctx.stroke();
      
      // Draw candle body
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(yClose - yOpen) || 2; // minimum body size
      ctx.fillRect(x, Math.min(yOpen, yClose), candleWidth, bodyHeight);

      // Draw Buy/Sell indicator marks (historical)
      if (c.signal) {
        ctx.font = 'bold 8px Outfit';
        ctx.textAlign = 'center';
        
        if (c.signal === 'BUY') {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(x + candleWidth / 2, yLow + 8, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillText('B', x + candleWidth / 2, yLow + 11);
        } else if (c.signal === 'SELL') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(x + candleWidth / 2, yHigh - 8, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillText('S', x + candleWidth / 2, yHigh - 5);
        }
      }
    });

    // Draw Current price laser line
    const lastCandle = candles[candles.length - 1];
    const laserY = mapY(lastCandle.close);
    ctx.strokeStyle = lastCandle.close >= lastCandle.open ? laserGreenColor : laserRedColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, laserY);
    ctx.lineTo(w, laserY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Live price label on laser
    ctx.fillStyle = lastCandle.close >= lastCandle.open ? '#10b981' : '#ef4444';
    ctx.fillRect(w - 60, laserY - 8, 60, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 9px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(lastCandle.close.toFixed(2), w - 30, laserY + 3);
  }

  // Update simulation state periodically
  let tickCount = 0;
  let signalTimer = 0;

  function updateState() {
    tickCount++;
    signalTimer++;
    tickerTickCount++;

    // Switch ticker every 30 ticks (~15 seconds) to simulate multiple bots
    if (tickerTickCount > 30) {
      tickerTickCount = 0;
      tickerIndex = (tickerIndex + 1) % tickers.length;
      tickerEl.textContent = tickers[tickerIndex];
      signalLogEl.innerHTML = `<i class="fa-solid fa-rotate"></i> Connecting to ${tickers[tickerIndex]} API...`;
    }

    // Add new price tick/candle movement
    const lastCandle = candles[candles.length - 1];
    
    // Simulate minor movement inside the current candle
    const fluctuation = (Math.random() - 0.48) * 8; // realistic movement
    lastCandle.close += fluctuation;
    
    if (lastCandle.close > lastCandle.high) lastCandle.high = lastCandle.close;
    if (lastCandle.close < lastCandle.low) lastCandle.low = lastCandle.close;
    
    // Confirm candle and spawn new one every 8 ticks (4 seconds)
    if (tickCount >= 8) {
      tickCount = 0;
      
      // Determine if next candle will start
      const isUp = Math.random() > 0.44;
      const bodySize = Math.random() * 15 + 3;
      const open = lastCandle.close;
      const close = isUp ? open + bodySize : open - bodySize;
      const high = Math.max(open, close) + Math.random() * 8;
      const low = Math.min(open, close) - Math.random() * 8;
      
      const newCandle = { open, high, low, close };
      
      // Periodic automated system signals (every 12 candles / ~48 seconds)
      if (signalTimer >= 12) {
        signalTimer = 0;
        const isBuy = Math.random() > 0.4; // buy bias for growth!
        newCandle.signal = isBuy ? 'BUY' : 'SELL';
        
        simulatedTradesCount++;
        if (isBuy) {
          wonTradesCount++;
          // Upward push
          currentPnL += Math.random() * 1.5 + 0.2;
          currentWinRate = (wonTradesCount / simulatedTradesCount) * 100;
          
          pnlEl.textContent = `+${currentPnL.toFixed(1)}%`;
          pnlEl.className = 'stat-val positive';
          winrateEl.textContent = `${currentWinRate.toFixed(1)}%`;
          
          signalLogEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> BUY Trigger at ${open.toFixed(2)}`;
        } else {
          // Normal exit/short execution
          currentPnL -= Math.random() * 0.5; // smaller losses
          currentWinRate = (wonTradesCount / simulatedTradesCount) * 100;
          
          pnlEl.textContent = (currentPnL >= 0 ? `+` : '') + `${currentPnL.toFixed(1)}%`;
          pnlEl.className = currentPnL >= 0 ? 'stat-val positive' : 'stat-val negative';
          winrateEl.textContent = `${currentWinRate.toFixed(1)}%`;
          
          signalLogEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> SELL Trigger at ${open.toFixed(2)}`;
        }
      }
      
      candles.shift(); // remove oldest
      candles.push(newCandle); // push new
    }
  }

  // Initial draw and kick off tick updates
  draw();
  setInterval(() => {
    updateState();
    draw();
  }, 500);
}

// --- Sticky Consultation CTA Interactivity ---
function initStickyCTA() {
  const stickyBtn = document.querySelector('#sticky-consultation');
  const consultationSection = document.querySelector('#consultation');
  
  if (!stickyBtn) return;
  
  window.addEventListener('scroll', () => {
    const scrolledPastThreshold = window.scrollY > 300;
    
    let inConsultation = false;
    if (consultationSection) {
      const rect = consultationSection.getBoundingClientRect();
      inConsultation = rect.top < window.innerHeight;
    }
    
    if (scrolledPastThreshold && !inConsultation) {
      stickyBtn.classList.add('visible');
    } else {
      stickyBtn.classList.remove('visible');
    }
  });

  stickyBtn.addEventListener('click', (e) => {
    if (consultationSection) {
      e.preventDefault();
      consultationSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
