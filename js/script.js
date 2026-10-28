/**
 * STARGIRL UNIVERSE — CORE JAVASCRIPT ENGINE
 * Atmospheric Visuals, Celestial Particle Canvas, Web Audio Synthesizer,
 * Smooth Transitions & Interactive Editorial UI
 */

document.addEventListener('DOMContentLoaded', () => {
  initStarCanvas();
  initCursorAura();
  initNavigation();
  initAudioAmbiance();
  initPageTransitions();
  initUniverseFilters();
  initContactInteractions();
  initCurrentTimeDisplay();
});

/* ==========================================================================
   01. CELESTIAL STARFIELD & COSMIC DUST CANVAS
   ========================================================================== */
function initStarCanvas() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];
  const starCount = 140;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    createStars();
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      const isCrimson = Math.random() < 0.18; // 18% crimson celestial dust
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseSize: Math.random() * 1.6 + 0.4,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        isCrimson: isCrimson,
        color: isCrimson ? 'rgba(255, 30, 66, ' : 'rgba(240, 243, 250, '
      });
    }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX - width / 2) * 0.035;
    mouse.targetY = (e.clientY - height / 2) * 0.035;
  });

  resize();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse parallax interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      // Twinkle calculation
      star.twinklePhase += star.twinkleSpeed;
      const currentAlpha = star.alpha * (0.6 + 0.4 * Math.sin(star.twinklePhase));

      // Drift
      star.x += star.speedX;
      star.y += star.speedY;

      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;

      const posX = star.x + mouse.x;
      const posY = star.y + mouse.y;

      ctx.beginPath();
      ctx.arc(posX, posY, star.baseSize, 0, Math.PI * 2);
      ctx.fillStyle = star.color + currentAlpha + ')';
      ctx.fill();

      // Subtle glow aura on larger or crimson stars
      if (star.isCrimson && star.baseSize > 1.2) {
        ctx.beginPath();
        ctx.arc(posX, posY, star.baseSize * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 26, 64, ' + (currentAlpha * 0.25) + ')';
        ctx.fill();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   02. CURSOR AURA GLOW
   ========================================================================== */
function initCursorAura() {
  const aura = document.querySelector('.cursor-aura');
  if (!aura || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderAura() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    aura.style.left = `${currentX}px`;
    aura.style.top = `${currentY}px`;
    requestAnimationFrame(renderAura);
  }

  renderAura();
}

/* ==========================================================================
   03. NAVIGATION, SCROLLING & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const nav = document.querySelector('.site-nav');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  // Sticky Navbar Scroll State
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // Mobile Menu Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('open');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close on drawer link click
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Back to Top Button
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   04. WEB AUDIO AMBIENT SOUND GENERATOR (CELESTIAL DRONE)
   ========================================================================== */
let audioCtx = null;
let masterGain = null;
let isAudioPlaying = false;
let oscillators = [];

function initAudioAmbiance() {
  const audioBtn = document.querySelector('.nav-audio-btn');
  if (!audioBtn) return;

  audioBtn.addEventListener('click', () => {
    if (!audioCtx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
        buildCelestialDrone();
      } catch (e) {
        console.warn('Web Audio not supported or blocked:', e);
        return;
      }
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      // Fade In
      masterGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1.2);
      isAudioPlaying = true;
      audioBtn.classList.add('playing');
      const textSpan = audioBtn.querySelector('.audio-label');
      if (textSpan) textSpan.textContent = 'AMBIENCE: ON';
    } else {
      // Fade Out
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      isAudioPlaying = false;
      audioBtn.classList.remove('playing');
      const textSpan = audioBtn.querySelector('.audio-label');
      if (textSpan) textSpan.textContent = 'AMBIENCE: OFF';
    }
  });
}

function buildCelestialDrone() {
  // Low mysterious sub-frequencies & ethereal 5th chord harmonics
  const freqs = [65.41, 98.00, 130.81, 196.00, 392.00]; // C2, G2, C3, G3, G4
  
  freqs.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Subtle slow pitch modulation (chorus/drift)
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.15 + idx * 0.05;
    lfoGain.gain.value = 0.8;
    lfo.connect(osc.frequency);
    lfo.start();

    // Filter to keep it deep, dark and atmospheric
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450 - idx * 40, audioCtx.currentTime);

    oscGain.gain.setValueAtTime(0.18 / freqs.length, audioCtx.currentTime);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start();
    oscillators.push(osc);
  });
}

/* ==========================================================================
   05. CINEMATIC PAGE TRANSITIONS
   ========================================================================== */
function initPageTransitions() {
  const curtain = document.querySelector('.page-transition-curtain');
  if (!curtain) return;

  // Fade out curtain when page loads
  curtain.classList.remove('active');

  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (
      href &&
      !href.startsWith('#') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:') &&
      !link.getAttribute('target')
    ) {
      link.addEventListener('click', (e) => {
        // Allow ctrl/cmd + click to open in new tab
        if (e.metaKey || e.ctrlKey) return;

        e.preventDefault();
        curtain.classList.add('active');

        setTimeout(() => {
          window.location.href = href;
        }, 380);
      });
    }
  });
}

/* ==========================================================================
   06. INTERACTIVE UNIVERSE FILTERING & VIEW TOGGLE (things.html)
   ========================================================================== */
function initUniverseFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.activity-card');
  const universeGrid = document.querySelector('.universe-grid');
  const viewBtns = document.querySelectorAll('.view-btn');

  if (filterBtns.length > 0 && cards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        cards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 20);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  // Grid / List View Toggle
  if (viewBtns.length > 0 && universeGrid) {
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const viewType = btn.getAttribute('data-view');
        if (viewType === 'list') {
          universeGrid.classList.add('list-view');
        } else {
          universeGrid.classList.remove('list-view');
        }
      });
    });
  }
}

/* ==========================================================================
   07. CONTACT INTERACTIONS & COPY TO CLIPBOARD
   ========================================================================== */
function initContactInteractions() {
  const copyBtn = document.querySelector('.copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email') || 'stargirl@universe.space';
      navigator.clipboard.writeText(email).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          TRANSMISSION ADDRESS COPIED
        `;
        copyBtn.style.color = '#ff1a40';
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.color = '';
        }, 2500);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    });
  }

  const form = document.querySelector('.transmission-form');
  const statusMsg = document.querySelector('.form-status-msg');
  if (form && statusMsg) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      statusMsg.className = 'form-status-msg success';
      statusMsg.innerHTML = `
        <strong>TRANSMISSION LOGGED:</strong> Coordinates locked. Your frequency has been broadcasted into the Stargirl Universe.
      `;
      form.reset();
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 7000);
    });
  }
}

/* ==========================================================================
   08. SYSTEM TIME / CELESTIAL CLOCK
   ========================================================================== */
function initCurrentTimeDisplay() {
  const timeElement = document.querySelector('.system-clock-time');
  if (!timeElement) return;

  function updateClock() {
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
    timeElement.textContent = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

