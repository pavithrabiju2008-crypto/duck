// Sound Effects with Web Audio API (Zero external dependencies)
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playQuack() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      // Classic comical duck formant pitch modulation
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.16);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playEggPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      // Bright chime / shimmer for the golden egg
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  playCollectChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [659.25, 880, 1318.51]; // E5, A5, E6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }
}

// Duck Color Themes Palette
const DUCK_PALETTES = [
  {
    name: "Classic Mallard Gold",
    body: "#fbc531",
    wing: "#e1b12c",
    feather: "#f39c12",
    icon: "🟡"
  },
  {
    name: "Sunset Coral",
    body: "#ff6b6b",
    wing: "#ee5253",
    feather: "#ff9f43",
    icon: "🪸"
  },
  {
    name: "Emerald Teal",
    body: "#1dd1a1",
    wing: "#10ac84",
    feather: "#00d2d3",
    icon: "🌿"
  },
  {
    name: "Cosmic Lavender",
    body: "#9b59b6",
    wing: "#8e44ad",
    feather: "#e056fd",
    icon: "🔮"
  },
  {
    name: "Ocean Sapphire",
    body: "#48dbfb",
    wing: "#0abde3",
    feather: "#2e86de",
    icon: "🌊"
  },
  {
    name: "Cotton Candy Pink",
    body: "#ff9ff3",
    wing: "#f368e0",
    feather: "#ff6b81",
    icon: "🌸"
  },
  {
    name: "Electric Lime",
    body: "#badc58",
    wing: "#6ab04c",
    feather: "#2ecc71",
    icon: "🍋"
  },
  {
    name: "Flamingo Blush",
    body: "#ff7675",
    wing: "#d63031",
    feather: "#e17055",
    icon: "🦩"
  },
  {
    name: "Cyber Neon Cyan",
    body: "#00d2d3",
    wing: "#01a3a4",
    feather: "#54a0ff",
    icon: "💎"
  },
  {
    name: "Imperial Violet",
    body: "#6c5ce7",
    wing: "#575fcf",
    feather: "#a29bfe",
    icon: "👑"
  },
  {
    name: "Mango Sunrise",
    body: "#ff9f43",
    wing: "#ee5253",
    feather: "#feca57",
    icon: "🥭"
  },
  {
    name: "Arctic Mint",
    body: "#70a1ff",
    wing: "#1e90ff",
    feather: "#7bed9f",
    icon: "❄️"
  }
];

class GoldenDuckGame {
  constructor() {
    this.duckEl = document.getElementById('duck');
    this.gameArea = document.getElementById('game-canvas');
    this.eggsContainer = document.getElementById('eggs-container');
    this.particlesContainer = document.getElementById('particles-container');
    this.eggCounterEl = document.getElementById('egg-counter');
    this.colorNameEl = document.getElementById('color-name');
    this.colorPreviewIcon = document.getElementById('color-preview-icon');
    this.nestCollectionEl = document.getElementById('nest-collection');
    this.clickHintEl = document.getElementById('click-hint');

    this.sound = new SoundManager();
    this.eggsCount = 0;
    this.currentColorIndex = 0;

    // Flight physics & coordinates
    this.posX = window.innerWidth / 2 - 60;
    this.posY = 140;
    this.velX = 3.2;
    this.velY = 1.4;
    this.targetVelX = 3.2;
    this.targetVelY = 1.4;
    this.rotation = 0;
    this.facingRight = true;
    this.flightTime = 0;
    this.isLaying = false;

    // Active falling eggs
    this.activeEggs = [];

    this.init();
  }

  init() {
    this.applyColorTheme(this.currentColorIndex);
    this.setupEventListeners();
    this.startFlightLoop();
    this.startPhysicsLoop();
  }

  setupEventListeners() {
    // Duck click/tap to lay egg & change color
    const handleDuckInteraction = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.layGoldenEgg();
    };

    this.duckEl.addEventListener('click', handleDuckInteraction);
    this.duckEl.addEventListener('touchstart', handleDuckInteraction, { passive: false });

    // Click anywhere else in the game area can make duck dive/swoop towards pointer
    this.gameArea.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#duck') || e.target.closest('.golden-egg')) return;
      this.directDuckTowards(e.clientX, e.clientY);
    });

    // Sound toggle button
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    soundBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      soundIcon.textContent = this.sound.enabled ? '🔊' : '🔇';
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetGame();
    });

    // Help Modal
    const helpModal = document.getElementById('help-modal');
    document.getElementById('how-to-play-btn').addEventListener('click', () => {
      helpModal.classList.remove('hidden');
    });
    document.getElementById('close-modal-btn').addEventListener('click', () => {
      helpModal.classList.add('hidden');
    });
    document.getElementById('help-start-btn').addEventListener('click', () => {
      helpModal.classList.add('hidden');
    });
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) helpModal.classList.add('hidden');
    });

    // Window resize handling
    window.addEventListener('resize', () => {
      this.clampDuckToBounds();
    });
  }

  directDuckTowards(targetX, targetY) {
    const rect = this.gameArea.getBoundingClientRect();
    const relX = targetX - rect.left;
    const relY = targetY - rect.top;

    const dx = relX - (this.posX + 65);
    const dy = relY - (this.posY + 50);
    const dist = Math.hypot(dx, dy) || 1;

    const speed = 4.8;
    this.targetVelX = (dx / dist) * speed;
    this.targetVelY = (dy / dist) * speed;

    this.createFeatherPuff(relX, relY, 2);
  }

  layGoldenEgg() {
    if (this.clickHintEl) {
      this.clickHintEl.style.opacity = '0';
      setTimeout(() => {
        if (this.clickHintEl && this.clickHintEl.parentNode) {
          this.clickHintEl.remove();
        }
      }, 500);
    }

    // Play sounds
    this.sound.playQuack();
    this.sound.playEggPop();

    // 1. Increment Egg Count
    this.eggsCount++;
    this.eggCounterEl.textContent = this.eggsCount;
    this.eggCounterEl.style.transform = 'scale(1.3)';
    setTimeout(() => {
      this.eggCounterEl.style.transform = 'scale(1)';
    }, 200);

    // 2. Lay golden egg at duck location
    const duckCenterX = this.posX + 65;
    const duckCenterY = this.posY + 60;
    this.spawnFallingGoldenEgg(duckCenterX, duckCenterY);

    // 3. Duck Animation Squish & Wing Flap
    this.duckEl.classList.add('laying-egg', 'jump-squash');
    setTimeout(() => {
      this.duckEl.classList.remove('jump-squash');
    }, 450);
    setTimeout(() => {
      this.duckEl.classList.remove('laying-egg');
    }, 700);

    // 4. Change Duck Color
    this.cycleNextColor();

    // 5. Spawn celebration sparkles & floating indicator
    this.createSparkleBurst(duckCenterX, duckCenterY);
    this.createFloatingText("+1 GOLDEN EGG!", duckCenterX, duckCenterY - 30);
    this.createFeatherPuff(duckCenterX, duckCenterY, 5);

    // 6. Give duck a boost of flight speed
    this.velY = -3.5;
    this.targetVelY = -2.0;
  }

  cycleNextColor() {
    this.currentColorIndex = (this.currentColorIndex + 1) % DUCK_PALETTES.length;
    this.applyColorTheme(this.currentColorIndex);
  }

  applyColorTheme(index) {
    const palette = DUCK_PALETTES[index];
    const root = document.documentElement;
    root.style.setProperty('--duck-body', palette.body);
    root.style.setProperty('--duck-wing', palette.wing);
    root.style.setProperty('--duck-feather', palette.feather);

    this.colorNameEl.textContent = palette.name;
    this.colorPreviewIcon.textContent = palette.icon;
  }

  spawnFallingGoldenEgg(startX, startY) {
    const egg = document.createElement('div');
    egg.className = 'golden-egg';
    egg.title = "Click to collect golden egg!";
    
    // Sparkle inside egg
    const sparkle = document.createElement('div');
    sparkle.className = 'egg-sparkle';
    egg.appendChild(sparkle);

    const initialVx = (Math.random() - 0.5) * 2;
    const initialVy = 1.0;

    const eggObj = {
      el: egg,
      x: startX - 22,
      y: startY,
      vx: initialVx,
      vy: initialVy,
      rotation: (Math.random() - 0.5) * 30,
      vRot: (Math.random() - 0.5) * 4,
      bounces: 0,
      maxBounces: 3,
      isGrounded: false
    };

    egg.style.transform = `translate(${eggObj.x}px, ${eggObj.y}px) rotate(${eggObj.rotation}deg)`;
    this.eggsContainer.appendChild(egg);
    this.activeEggs.push(eggObj);

    // Click egg to collect immediately into basket
    egg.addEventListener('click', (e) => {
      e.stopPropagation();
      this.collectEggToBasket(eggObj);
    });
  }

  collectEggToBasket(eggObj) {
    const index = this.activeEggs.indexOf(eggObj);
    if (index > -1) {
      this.activeEggs.splice(index, 1);
    }

    this.sound.playCollectChime();
    this.createSparkleBurst(eggObj.x + 22, eggObj.y + 28);
    this.createFloatingText("COLLECTED! ✨", eggObj.x + 22, eggObj.y);

    eggObj.el.style.transform = `scale(1.5) translate(${eggObj.x}px, ${eggObj.y}px)`;
    eggObj.el.style.opacity = '0';
    eggObj.el.style.transition = 'all 0.3s ease';

    setTimeout(() => {
      eggObj.el.remove();
      this.addToBasketShelf();
    }, 300);
  }

  addToBasketShelf() {
    const emptyTip = this.nestCollectionEl.querySelector('.empty-basket-tip');
    if (emptyTip) emptyTip.remove();

    const miniEgg = document.createElement('div');
    miniEgg.className = 'mini-egg';
    miniEgg.title = `Golden Egg #${this.eggsCount}`;
    this.nestCollectionEl.appendChild(miniEgg);

    // Auto scroll basket horizontally
    this.nestCollectionEl.scrollLeft = this.nestCollectionEl.scrollWidth;
  }

  createSparkleBurst(x, y) {
    const particleCount = 14;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle-burst';
      const angle = (Math.PI * 2 * i) / particleCount;
      const dist = 35 + Math.random() * 45;
      const dx = `${Math.cos(angle) * dist}px`;
      const dy = `${Math.sin(angle) * dist}px`;

      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const colors = ['#fbc531', '#ffeaa7', '#fff', '#e1b12c', '#00d2d3'];
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      this.particlesContainer.appendChild(p);
      setTimeout(() => p.remove(), 750);
    }
  }

  createFeatherPuff(x, y, count = 3) {
    const featherIcons = ['🪶', '✨', '💛', '⭐'];
    for (let i = 0; i < count; i++) {
      const f = document.createElement('div');
      f.className = 'feather-particle';
      f.textContent = featherIcons[Math.floor(Math.random() * featherIcons.length)];
      f.style.left = `${x + (Math.random() - 0.5) * 30}px`;
      f.style.top = `${y + (Math.random() - 0.5) * 20}px`;

      const tx = `${(Math.random() - 0.5) * 120}px`;
      const ty = `${40 + Math.random() * 80}px`;
      const rot = `${(Math.random() - 0.5) * 360}deg`;

      f.style.setProperty('--tx', tx);
      f.style.setProperty('--ty', ty);
      f.style.setProperty('--rot', rot);

      this.particlesContainer.appendChild(f);
      setTimeout(() => f.remove(), 1800);
    }
  }

  createFloatingText(text, x, y) {
    const textEl = document.createElement('div');
    textEl.className = 'float-text';
    textEl.textContent = text;
    textEl.style.left = `${x - 40}px`;
    textEl.style.top = `${y}px`;

    this.particlesContainer.appendChild(textEl);
    setTimeout(() => textEl.remove(), 1200);
  }

  startFlightLoop() {
    const updateDuck = () => {
      this.flightTime += 0.04;
      const bounds = this.gameArea.getBoundingClientRect();
      const maxX = bounds.width - 130;
      const maxY = bounds.height - 100;

      // Smoothly interpolate velocity towards target velocity
      this.velX += (this.targetVelX - this.velX) * 0.05;
      this.velY += (this.targetVelY - this.velY) * 0.05;

      // Add gentle sine wave undulating flight curve
      const waveOffset = Math.sin(this.flightTime * 2.2) * 1.2;

      this.posX += this.velX;
      this.posY += this.velY + waveOffset;

      // Bounce gracefully on walls
      if (this.posX > maxX) {
        this.posX = maxX;
        this.targetVelX = -Math.abs(this.targetVelX || 3);
      } else if (this.posX < 0) {
        this.posX = 0;
        this.targetVelX = Math.abs(this.targetVelX || 3);
      }

      // Ceiling and floor boundaries
      if (this.posY > maxY) {
        this.posY = maxY;
        this.targetVelY = -Math.abs(this.targetVelY || 1.8);
      } else if (this.posY < 20) {
        this.posY = 20;
        this.targetVelY = Math.abs(this.targetVelY || 1.8);
      }

      // Periodically shift direction randomly for organic playful motion
      if (Math.random() < 0.015) {
        this.targetVelX = (Math.random() * 3.6 + 1.2) * (Math.random() > 0.5 ? 1 : -1);
        this.targetVelY = (Math.random() * 2.4 - 1.2);
      }

      // Determine duck facing direction and body tilt
      this.facingRight = this.velX >= 0;
      const tilt = Math.max(-25, Math.min(25, this.velY * 5));
      const flipX = this.facingRight ? 1 : -1;

      // Position duck element
      this.duckEl.style.transform = `translate(${this.posX}px, ${this.posY}px) scaleX(${flipX}) rotate(${tilt * flipX}deg)`;

      requestAnimationFrame(updateDuck);
    };

    requestAnimationFrame(updateDuck);
  }

  startPhysicsLoop() {
    const updateEggs = () => {
      const bounds = this.gameArea.getBoundingClientRect();
      const floorY = bounds.height - 58; // Bottom ground level

      for (let i = this.activeEggs.length - 1; i >= 0; i--) {
        const egg = this.activeEggs[i];

        if (!egg.isGrounded) {
          // Gravity & air resistance
          egg.vy += 0.42; // Gravity
          egg.x += egg.vx;
          egg.y += egg.vy;
          egg.rotation += egg.vRot;

          // Ground bounce
          if (egg.y >= floorY) {
            egg.y = floorY;
            if (egg.bounces < egg.maxBounces) {
              egg.vy = -egg.vy * 0.45;
              egg.vx *= 0.7;
              egg.vRot *= 0.5;
              egg.bounces++;
              if (Math.abs(egg.vy) < 1.0) {
                egg.isGrounded = true;
                egg.vy = 0;
              }
            } else {
              egg.isGrounded = true;
              egg.vy = 0;
            }
          }

          egg.el.style.transform = `translate(${egg.x}px, ${egg.y}px) rotate(${egg.rotation}deg)`;
        }
      }

      requestAnimationFrame(updateEggs);
    };

    requestAnimationFrame(updateEggs);
  }

  clampDuckToBounds() {
    const bounds = this.gameArea.getBoundingClientRect();
    this.posX = Math.max(0, Math.min(bounds.width - 130, this.posX));
    this.posY = Math.max(20, Math.min(bounds.height - 100, this.posY));
  }

  resetGame() {
    this.eggsCount = 0;
    this.eggCounterEl.textContent = '0';
    this.currentColorIndex = 0;
    this.applyColorTheme(0);

    // Clear active eggs
    this.activeEggs.forEach(egg => egg.el.remove());
    this.activeEggs = [];

    // Clear basket
    this.nestCollectionEl.innerHTML = '<span class="empty-basket-tip">Click the duck to lay shiny golden eggs!</span>';

    // Show click hint again if reset
    if (!document.getElementById('click-hint')) {
      const hint = document.createElement('div');
      hint.id = 'click-hint';
      hint.className = 'click-hint';
      hint.textContent = 'Click me! 🪶';
      this.duckEl.prepend(hint);
      this.clickHintEl = hint;
    }

    this.createFloatingText("GAME RESET!", window.innerWidth / 2 - 50, window.innerHeight / 2 - 50);
  }
}

// Start game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new GoldenDuckGame();
});
