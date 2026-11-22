let invitationLocked = true;
function preventLockedScroll(event) { if (invitationLocked) event.preventDefault(); }
function preventLockedKeys(event) {
  if (!invitationLocked) return;
  const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
  if (keys.includes(event.key)) {
    if (event.key === ' ' && event.target.closest('button')) return;
    event.preventDefault();
  }
}
window.addEventListener('wheel', preventLockedScroll, { passive: false });
window.addEventListener('touchmove', preventLockedScroll, { passive: false });
window.addEventListener('keydown', preventLockedKeys);

function returnToOpening() {
  if (invitationLocked) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}
window.addEventListener('pageshow', returnToOpening);
window.addEventListener('hashchange', returnToOpening);
returnToOpening();

function unlockInvitation() {
  if (!invitationLocked) return;
  invitationLocked = false;
  document.documentElement.classList.remove('intro-locked');
  for (const el of document.querySelectorAll('#invitation-content,.family-closing,.continue')) {
    el.inert = false;
    el.removeAttribute('aria-hidden');
  }
  window.removeEventListener('wheel', preventLockedScroll);
  window.removeEventListener('touchmove', preventLockedScroll);
  window.removeEventListener('keydown', preventLockedKeys);
  window.removeEventListener('pageshow', returnToOpening);
  window.removeEventListener('hashchange', returnToOpening);

  // Immediately launch continuous red flower petal & leaf shower across the invitation!
  startRoseLeafShower();
}

/* --- Scratch Chime Sound Feedback (Web Audio API) --- */
let scratchAudioCtx = null;
let lastChimeTime = 0;
function playScratchChime() {
  try {
    const now = performance.now();
    if (now - lastChimeTime < 45) return;
    lastChimeTime = now;
    if (!scratchAudioCtx) {
      scratchAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (scratchAudioCtx.state === 'suspended') {
      scratchAudioCtx.resume();
    }
    const osc = scratchAudioCtx.createOscillator();
    const gain = scratchAudioCtx.createGain();
    osc.type = 'triangle';
    const baseFreq = 1600 + Math.random() * 900;
    osc.frequency.setValueAtTime(baseFreq, scratchAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, scratchAudioCtx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.015, scratchAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, scratchAudioCtx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(scratchAudioCtx.destination);
    osc.start();
    osc.stop(scratchAudioCtx.currentTime + 0.06);
  } catch (e) {}
}

/* --- Scratching Golden Particle & Star Dust Sparkles --- */
let particleCanvas = null;
let particleContext = null;
let lightParticles = [];
let particleFrame = 0;
let lastSpark = 0;
let lastParticleTime = 0;

function sparkles(x, y, count) {
  const now = performance.now();
  if (count < 8 && now - lastSpark < 18) return;
  lastSpark = now;

  if (!particleCanvas) {
    particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'scratch-light-particles';
    particleCanvas.style.position = 'fixed';
    particleCanvas.style.inset = '0';
    particleCanvas.style.width = '100%';
    particleCanvas.style.height = '100%';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.zIndex = '9999';
    particleCanvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(particleCanvas);
    particleContext = particleCanvas.getContext('2d');
  }

  const isBurst = count > 10;
  const numSparks = isBurst ? 45 : (count || 6);

  for (let i = 0; i < numSparks; i++) {
    if (lightParticles.length >= 240) break;
    const angle = Math.random() * Math.PI * 2;
    const speed = (isBurst ? 50 : 20) + Math.random() * (isBurst ? 160 : 80);
    const isStar = Math.random() < 0.42;

    lightParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBurst ? 40 : 20),
      age: 0,
      life: 0.35 + Math.random() * 0.65,
      r: isStar ? (1.5 + Math.random() * 2) : (0.8 + Math.random() * 1.6),
      isStar,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 8,
      tone: Math.random() > 0.4 ? '255, 225, 120' : (Math.random() > 0.5 ? '255, 255, 255' : '230, 175, 60')
    });
  }

  if (!particleFrame) {
    lastParticleTime = now;
    particleFrame = requestAnimationFrame(drawLightParticles);
  }
}

function drawLightParticles(time) {
  const dt = Math.min((time - lastParticleTime) / 1000, 0.04);
  lastParticleTime = time;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (particleCanvas.width !== Math.round(w * dpr) || particleCanvas.height !== Math.round(h * dpr)) {
    particleCanvas.width = Math.round(w * dpr);
    particleCanvas.height = Math.round(h * dpr);
  }

  const c = particleContext;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);

  lightParticles = lightParticles.filter(p => p.age < p.life);

  for (const p of lightParticles) {
    p.age += dt;
    p.vy += 70 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.rot += p.spin * dt;

    const fade = Math.max(0, 1 - p.age / p.life);
    const alpha = fade * (0.4 + 0.6 * Math.sin(p.age * 18));

    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.rot);

    if (p.isStar) {
      c.fillStyle = `rgba(${p.tone}, ${alpha})`;
      c.shadowColor = '#d4af37';
      c.shadowBlur = 4;
      c.beginPath();
      const r = p.r * 2.2;
      c.moveTo(0, -r);
      c.quadraticCurveTo(0, 0, r, 0);
      c.quadraticCurveTo(0, 0, 0, r);
      c.quadraticCurveTo(0, 0, -r, 0);
      c.quadraticCurveTo(0, 0, 0, -r);
      c.fill();
    } else {
      const glow = c.createRadialGradient(0, 0, 0, 0, 0, p.r * 3.5);
      glow.addColorStop(0, `rgba(${p.tone}, ${alpha})`);
      glow.addColorStop(0.3, `rgba(${p.tone}, ${alpha * 0.45})`);
      glow.addColorStop(1, `rgba(${p.tone}, 0)`);
      c.fillStyle = glow;
      c.fillRect(-p.r * 3.5, -p.r * 3.5, p.r * 7, p.r * 7);

      c.fillStyle = `rgba(255, 255, 240, ${alpha})`;
      c.beginPath();
      c.arc(0, 0, p.r * 0.7, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }

  if (lightParticles.length) {
    particleFrame = requestAnimationFrame(drawLightParticles);
  } else {
    if (particleCanvas) {
      particleCanvas.remove();
      particleCanvas = null;
      particleContext = null;
    }
    particleFrame = 0;
  }
}

/* --- Opening Video & Audio Controls --- */
const video = document.querySelector('#temple');
if (video) {
  const music = document.querySelector('#music');
  const sound = document.querySelector('#sound');
  const scrollButton = document.querySelector('#scroll-down');
  const message = document.querySelector('#film-message');

  function updateSoundButton() {
    if (!music || !sound) return;
    const audible = !music.paused && !music.muted;
    sound.classList.toggle('audible', audible);
    sound.title = audible ? 'Mute music' : 'Play music';
    sound.setAttribute('aria-label', audible ? 'Mute music' : 'Play music');
  }

  // Mobile video setup
  video.defaultMuted = true;
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      video.controls = true;
      if (scrollButton) scrollButton.hidden = false;
    });
  }

  // Audio autoplay & interaction unlocking
  function tryStartMusic() {
    if (music && music.paused) {
      music.play().then(updateSoundButton).catch(() => {});
    }
  }

  if (music) {
    music.play().then(updateSoundButton).catch(() => {
      updateSoundButton();
      const unlockAudio = () => {
        tryStartMusic();
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };
      window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
      window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
      window.addEventListener('click', unlockAudio, { once: true });
    });
  }

  if (sound && music) {
    sound.addEventListener('click', (e) => {
      e.stopPropagation();
      if (music.paused) {
        music.muted = false;
        music.play().then(updateSoundButton).catch(updateSoundButton);
      } else {
        music.muted = !music.muted;
        updateSoundButton();
      }
    });
    for (const event of ['playing', 'pause', 'volumechange']) {
      music.addEventListener(event, updateSoundButton);
    }
  }

  // Tap anywhere on opening film to play video and start music
  const filmFrame = video.closest('.film-frame');
  if (filmFrame) {
    filmFrame.style.cursor = 'pointer';
    filmFrame.addEventListener('click', (e) => {
      if (e.target.closest('#scroll-down') || e.target.closest('#sound')) return;
      if (video.paused) {
        video.play().catch(() => {});
      }
      tryStartMusic();
    });
  }

  // Show "Scroll down" button quickly (after 2s) so user has complete control
  setTimeout(() => {
    if (scrollButton) scrollButton.hidden = false;
  }, 2000);

  // Safety timer: unlock page after 5s if video is loading slowly or ended event missed
  setTimeout(() => {
    if (scrollButton) scrollButton.hidden = false;
    unlockInvitation();
  }, 5000);

  // Also unlock when user interacts by wheel or touch after 2.5s
  setTimeout(() => {
    const handleEarlyScroll = () => {
      unlockInvitation();
      window.removeEventListener('wheel', handleEarlyScroll);
      window.removeEventListener('touchmove', handleEarlyScroll);
    };
    window.addEventListener('wheel', handleEarlyScroll, { passive: true });
    window.addEventListener('touchmove', handleEarlyScroll, { passive: true });
  }, 2500);

  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= 2 && scrollButton) {
      scrollButton.hidden = false;
    }
  });

  video.addEventListener('ended', () => {
    const lastImg = document.querySelector('#last-frame');
    if (lastImg) lastImg.hidden = false;
    video.parentElement.classList.add('film-finished');
    if (scrollButton) scrollButton.hidden = false;
    unlockInvitation();
  });

  const handleVideoError = () => {
    if (message) message.textContent = 'You can scroll down to the invitation.';
    if (scrollButton) scrollButton.hidden = false;
    unlockInvitation();
  };

  video.addEventListener('error', handleVideoError);
  const srcEl = video.querySelector('source');
  if (srcEl) srcEl.addEventListener('error', handleVideoError);

  if (scrollButton) {
    scrollButton.addEventListener('click', () => {
      unlockInvitation();
      tryStartMusic();
      window.scrollBy({
        top: Math.min(window.innerHeight * 0.7, 520),
        behavior: 'smooth'
      });
    });
  }
}

/* --- Scratch Card Interactive Logic --- */
const canvas = document.querySelector('#scratch');
if (canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const wrap = canvas.parentElement;
  const button = document.querySelector('#reveal');
  let drawing = false;
  let revealed = false;
  let lastPoint = null;
  let heart;

  function heartPath(w, h) {
    const p = new Path2D();
    p.moveTo(w * 0.5, h * 0.19);
    p.bezierCurveTo(w * 0.25, -h * 0.12, 0, h * 0.02, 0, h * 0.29);
    p.bezierCurveTo(0, h * 0.53, w * 0.28, h * 0.76, w * 0.5, h * 0.98);
    p.bezierCurveTo(w * 0.72, h * 0.76, w, h * 0.53, w, h * 0.29);
    p.bezierCurveTo(w, h * 0.02, w * 0.75, -h * 0.12, w * 0.5, h * 0.19);
    p.closePath();
    return p;
  }

  function paint() {
    if (revealed) return;
    const r = wrap.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    heart = heartPath(w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Rich royal crimson gradient with glossy shimmer
    const g = ctx.createLinearGradient(0, h * 0.12, w, h * 0.88);
    g.addColorStop(0, '#9e1128');
    g.addColorStop(0.18, '#c91f3b');
    g.addColorStop(0.35, '#b3152f');
    g.addColorStop(0.48, '#e63251');
    g.addColorStop(0.53, '#f54a6b');
    g.addColorStop(0.60, '#c71c38');
    g.addColorStop(0.78, '#9e1027');
    g.addColorStop(1, '#730616');
    ctx.fillStyle = g;
    ctx.fill(heart);

    // Elegant gold border trim
    ctx.strokeStyle = '#f8dc96dd';
    ctx.lineWidth = 2.5;
    ctx.stroke(heart);

    // Calligraphy Text
    ctx.fillStyle = '#fffdf7';
    ctx.textAlign = 'center';
    ctx.font = '600 ' + Math.min(27, w * 0.078) + 'px Georgia, serif';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillText('A date to cherish', w / 2, h * 0.42);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = '600 10.5px Arial, sans-serif';
    ctx.fillStyle = '#fde2b8';
    ctx.fillText('✦ SCRATCH TO REVEAL ✦', w / 2, h * 0.54);
  }

  function triggerReveal() {
    if (revealed) return;
    revealed = true;
    wrap.classList.add('revealed');
    if (button) {
      button.textContent = '6 December 2026 · Save the date';
    }
    canvas.setAttribute('aria-hidden', 'true');

    // Shower erupts directly from the heart coordinates!
    const r = wrap.getBoundingClientRect();
    const hx = r.left + r.width / 2;
    const hy = r.top + r.height * 0.45;
    sparkles(hx, hy, 35);
    startRoseLeafShower(hx, hy);
  }

  function point(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * canvas.width / r.width,
      y: (e.clientY - r.top) * canvas.height / r.height
    };
  }

  function erase(e) {
    if (!drawing || revealed) return;
    const p = point(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 44;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint ? lastPoint.x : p.x, lastPoint ? lastPoint.y : p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint = p;
    sparkles(e.clientX, e.clientY, 7);
    playScratchChime();
  }

  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    lastPoint = point(e);
    canvas.setPointerCapture(e.pointerId);
    erase(e);
  });
  canvas.addEventListener('pointermove', erase);

  function finish() {
    drawing = false;
    lastPoint = null;
    if (revealed || !heart) return;
    const a = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    let total = 0;
    for (let y = 4; y < canvas.height; y += 6) {
      for (let x = 4; x < canvas.width; x += 6) {
        if (!ctx.isPointInPath(heart, x, y)) continue;
        total++;
        if (a[(y * canvas.width + x) * 4 + 3] < 128) clear++;
      }
    }
    if (total && clear / total > 0.33) {
      triggerReveal();
    }
  }

  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', () => { drawing = false; lastPoint = null; });
  if (button) {
    button.addEventListener('click', triggerReveal);
  }

  paint();
  new ResizeObserver(paint).observe(wrap);
}

/* --- Grand Red Flower Petal & Rose Leaf Celebration Shower --- */
let roseShowerCanvas = null;
let roseShowerCtx = null;
let roseParticles = [];
let roseShowerFrame = 0;
let lastShowerTime = 0;

function drawPetal(c, size, tone) {
  const colors = [
    ['#f43f5e', '#be123c', '#7a0c23'], // Royal Crimson
    ['#e11d48', '#9f1239', '#540410'], // Velvet Wine
    ['#fb7185', '#e11d48', '#881337'], // Ruby Rose
    ['#fda4af', '#f43f5e', '#be123c'], // Rose Blush
    ['#be123c', '#881337', '#4c0519']  // Deep Imperial Red
  ][tone % 5];

  c.beginPath();
  c.moveTo(0, -size * 0.95);
  c.bezierCurveTo(size * 0.85, -size * 0.75, size * 0.8, size * 0.45, 0, size * 0.92);
  c.bezierCurveTo(-size * 0.8, size * 0.45, -size * 0.85, -size * 0.75, 0, -size * 0.95);

  const grad = c.createLinearGradient(-size * 0.3, -size, size * 0.3, size);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.5, colors[1]);
  grad.addColorStop(1, colors[2]);
  c.fillStyle = grad;
  c.fill();

  c.strokeStyle = 'rgba(255, 230, 235, 0.35)';
  c.lineWidth = 0.7;
  c.beginPath();
  c.moveTo(0, -size * 0.7);
  c.quadraticCurveTo(size * 0.2, 0, 0, size * 0.65);
  c.stroke();
}

function drawLeaf(c, size, tone) {
  const leafColors = [
    ['#4d7c0f', '#365314', '#1a2e05'], // Olive emerald
    ['#15803d', '#166534', '#052e16'], // Rich forest green
    ['#65a30d', '#3f6212', '#1a2e05']  // Vibrant rose leaf
  ][tone % 3];

  // Stem
  c.strokeStyle = '#2d4a0f';
  c.lineWidth = 1.3;
  c.beginPath();
  c.moveTo(0, size * 0.85);
  c.lineTo(0, size * 1.18);
  c.stroke();

  // Leaf blade (pointed rose leaflet)
  c.beginPath();
  c.moveTo(0, -size);
  c.bezierCurveTo(size * 0.68, -size * 0.55, size * 0.65, size * 0.4, 0, size * 0.88);
  c.bezierCurveTo(-size * 0.65, size * 0.4, -size * 0.68, -size * 0.55, 0, -size);

  const grad = c.createLinearGradient(-size * 0.35, -size * 0.5, size * 0.35, size * 0.5);
  grad.addColorStop(0, leafColors[0]);
  grad.addColorStop(0.5, leafColors[1]);
  grad.addColorStop(1, leafColors[2]);
  c.fillStyle = grad;
  c.fill();

  // Central vein
  c.strokeStyle = 'rgba(190, 242, 100, 0.45)';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(0, -size * 0.85);
  c.lineTo(0, size * 0.8);
  c.stroke();

  // Lateral veins
  c.lineWidth = 0.5;
  for (let v = -0.55; v <= 0.45; v += 0.28) {
    c.beginPath();
    c.moveTo(0, size * v);
    c.lineTo(size * 0.26, size * (v - 0.16));
    c.moveTo(0, size * v);
    c.lineTo(-size * 0.26, size * (v - 0.16));
    c.stroke();
  }
}

function drawGoldFleck(c, size) {
  c.fillStyle = '#fde047';
  c.shadowColor = '#ca8a04';
  c.shadowBlur = 4;
  c.beginPath();
  c.rect(-size * 0.5, -size * 0.5, size, size);
  c.fill();
  c.shadowBlur = 0;
}

function renderRoseShower(now) {
  if (document.hidden) {
    roseShowerFrame = requestAnimationFrame(renderRoseShower);
    return;
  }

  const dt = Math.min((now - lastShowerTime) / 1000, 0.033);
  lastShowerTime = now;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (!roseShowerCanvas) return;

  if (roseShowerCanvas.width !== Math.round(w * dpr) || roseShowerCanvas.height !== Math.round(h * dpr)) {
    roseShowerCanvas.width = Math.round(w * dpr);
    roseShowerCanvas.height = Math.round(h * dpr);
  }

  const ctx = roseShowerCtx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  for (let i = roseParticles.length - 1; i >= 0; i--) {
    const p = roseParticles[i];

    if (p.isBurst) {
      // Fountain burst physics from heart
      p.vy += p.gravity * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx * dt + Math.sin(p.age * p.swayFreq + p.swayPhase) * (p.swayAmp * 0.4) * dt;
      p.y += p.vy * dt;
      p.age += dt;

      if (p.y > h + 40) {
        roseParticles.splice(i, 1);
        continue;
      }
    } else {
      // Continuous gentle ambient shower across the invitation
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(p.age * p.swayFreq + p.swayPhase) * p.swayAmp) * dt;
      p.age += dt;

      // When falling past screen bottom, recycle continuously to top!
      if (p.y > h + 35) {
        p.y = -35;
        p.x = Math.random() * w;
        p.age = 0;
      }
    }

    p.rot += p.rotSpeed * dt;
    p.tumble += p.tumbleSpeed * dt;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const scaleX = Math.cos(p.tumble);
    ctx.scale(Math.abs(scaleX) * 0.75 + 0.25, 1);
    ctx.globalAlpha = scaleX < 0 ? 0.78 : 0.95;

    if (p.kind === 'leaf') {
      drawLeaf(ctx, p.size, p.tone);
    } else if (p.kind === 'gold') {
      drawGoldFleck(ctx, p.size);
    } else {
      drawPetal(ctx, p.size, p.tone);
    }

    ctx.restore();
  }

  roseShowerFrame = requestAnimationFrame(renderRoseShower);
}

function startRoseLeafShower(originX, originY) {
  if (!roseShowerCanvas) {
    roseShowerCanvas = document.createElement('canvas');
    roseShowerCanvas.id = 'rose-leaf-shower';
    roseShowerCanvas.style.position = 'fixed';
    roseShowerCanvas.style.inset = '0';
    roseShowerCanvas.style.width = '100%';
    roseShowerCanvas.style.height = '100%';
    roseShowerCanvas.style.zIndex = '99999';
    roseShowerCanvas.style.pointerEvents = 'none';
    roseShowerCanvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(roseShowerCanvas);
    roseShowerCtx = roseShowerCanvas.getContext('2d');
    lastShowerTime = performance.now();
  }

  const w = window.innerWidth;
  const h = window.innerHeight;

  const isFromPoint = (originX !== undefined && originY !== undefined && originX !== null);

  // If triggered from heart scratch, add a delicate celebration burst fountaining upward
  if (isFromPoint) {
    const cx = originX;
    const cy = originY;
    for (let i = 0; i < 22; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 100 + Math.random() * 200;
      const isLeaf = Math.random() < 0.32;
      const isGold = !isLeaf && Math.random() < 0.15;

      roseParticles.push({
        isBurst: true,
        kind: isLeaf ? 'leaf' : (isGold ? 'gold' : 'petal'),
        x: cx + (Math.random() - 0.5) * 20,
        y: cy + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: isLeaf ? 130 : (isGold ? 95 : 110),
        drag: 0.965,
        size: isLeaf ? (10 + Math.random() * 6) : (isGold ? (3 + Math.random() * 3) : (8 + Math.random() * 7)),
        rot: Math.random() * 6.28,
        rotSpeed: (Math.random() - 0.5) * 3,
        tumble: Math.random() * 6.28,
        tumbleSpeed: 1.6 + Math.random() * 2.2,
        swayAmp: 14 + Math.random() * 18,
        swayFreq: 1.0 + Math.random() * 1.2,
        swayPhase: Math.random() * 6.28,
        age: 0,
        tone: Math.floor(Math.random() * 5)
      });
    }
  }

  // Refined, gentle ambient shower across the invitation (18 floating petals & leaves)
  const currentAmbient = roseParticles.filter(p => !p.isBurst).length;
  if (currentAmbient < 18) {
    const needed = 18 - currentAmbient;
    for (let i = 0; i < needed; i++) {
      const isLeaf = Math.random() < 0.32;
      const isGold = !isLeaf && Math.random() < 0.15;

      roseParticles.push({
        isBurst: false,
        kind: isLeaf ? 'leaf' : (isGold ? 'gold' : 'petal'),
        x: Math.random() * w,
        // Distribute throughout the entire viewport height on initialization so it is immediately visible!
        y: (currentAmbient === 0) ? (Math.random() * h) : (-25 - Math.random() * 120),
        vx: (Math.random() - 0.5) * 22,
        vy: 35 + Math.random() * 35, // calm, graceful drift
        size: isLeaf ? (10 + Math.random() * 6) : (isGold ? (3 + Math.random() * 3) : (8 + Math.random() * 7)),
        rot: Math.random() * 6.28,
        rotSpeed: (Math.random() - 0.5) * 2,
        tumble: Math.random() * 6.28,
        tumbleSpeed: 1.2 + Math.random() * 2.2,
        swayAmp: 14 + Math.random() * 18,
        swayFreq: 0.7 + Math.random() * 1.0,
        swayPhase: Math.random() * 6.28,
        age: Math.random() * 10,
        tone: Math.floor(Math.random() * 5)
      });
    }
  }

  if (!roseShowerFrame) {
    lastShowerTime = performance.now();
    roseShowerFrame = requestAnimationFrame(renderRoseShower);
  }
}

/* --- Countdown Timer --- */
function tick() {
  const target = Date.parse('2026-12-06T09:30:00+05:30');
  let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  for (const [id, unit] of [['days', 86400], ['hours', 3600], ['minutes', 60], ['seconds', 1]]) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(Math.floor(s / unit)).padStart(2, '0');
    s %= unit;
  }
  if (Date.now() >= target) {
    const n = document.querySelector('#count-note');
    if (n) n.textContent = 'Our forever has begun · 6 December 2026';
  }
}
tick();
setInterval(tick, 1000);

/* --- Event Film Video Intersection Observer --- */
const eventFilms = document.querySelectorAll('.event-film');
const visibleFilms = new Set();
function updateEventPlayback(film) {
  if (document.hidden || !visibleFilms.has(film)) {
    film.pause();
  } else {
    film.defaultMuted = true;
    film.muted = true;
    film.play().catch(() => {});
  }
}

const eventObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const film = entry.target;
    if (entry.isIntersecting && entry.intersectionRatio > 0) {
      visibleFilms.add(film);
    } else {
      visibleFilms.delete(film);
    }
    updateEventPlayback(film);
  }
}, { threshold: [0, 0.01] });

for (const film of eventFilms) {
  film.defaultMuted = true;
  film.muted = true;
  film.setAttribute('playsinline', '');
  film.setAttribute('webkit-playsinline', '');
  eventObserver.observe(film);

  const card = film.closest('.event-card');
  if (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.map')) return;
      if (film.paused) {
        film.play().catch(() => {});
      } else {
        film.pause();
      }
    });
    card.addEventListener('mouseenter', () => {
      film.play().catch(() => {});
    });
  }
}
document.addEventListener('visibilitychange', () => eventFilms.forEach(updateEventPlayback));
