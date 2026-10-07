// Utilidades compartidas para los ejemplos interactivos.
function getDeviceProfile() {
  const vv = window.visualViewport;
  const w = Math.max(1, Math.round(
    (vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || 640
  ));
  const h = Math.max(1, Math.round(
    (vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 480
  ));
  const shortSide = Math.min(w, h);
  const touch = (navigator.maxTouchPoints || 0) > 0 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  let type = 'desktop';
  if (touch && shortSide < 600) type = 'mobile';
  else if (touch && shortSide < 1100) type = 'tablet';

  let maxCameraLongSide = 960;
  let density = Math.min(window.devicePixelRatio || 1, 1.5);

  if (type === 'mobile') {
    maxCameraLongSide = 640;
    density = 1;
  } else if (type === 'tablet') {
    maxCameraLongSide = 800;
    density = 1;
  }

  // En móvil/tablet vertical solicitamos una relación 3:4, que suele ser
  // más compatible con cámaras frontales que la relación extrema de la pantalla.
  const screenAspect = w / h;
  const portraitTouch = touch && h > w;
  const aspect = portraitTouch ? 0.75 : screenAspect;
  let cameraWidth;
  let cameraHeight;

  if (aspect >= 1) {
    cameraWidth = maxCameraLongSide;
    cameraHeight = Math.max(240, Math.round(maxCameraLongSide / aspect));
  } else {
    cameraHeight = maxCameraLongSide;
    cameraWidth = Math.max(240, Math.round(maxCameraLongSide * aspect));
  }

  return {
    type,
    canvasWidth: w,
    canvasHeight: h,
    canvasAspect: aspect,
    cameraWidth,
    cameraHeight,
    maxCameraLongSide,
    pixelDensity: density
  };
}

function setupResponsiveCanvas() {
  const profile = getDeviceProfile();
  pixelDensity(profile.pixelDensity);
  createCanvas(profile.canvasWidth, profile.canvasHeight);
  return profile;
}

function resizeResponsiveCanvas() {
  const profile = getDeviceProfile();
  pixelDensity(profile.pixelDensity);
  resizeCanvas(profile.canvasWidth, profile.canvasHeight);
  return profile;
}

function getResponsiveCameraConstraints(profile = getDeviceProfile()) {
  return {
    video: {
      facingMode: 'user',
      width: { ideal: profile.cameraWidth },
      height: { ideal: profile.cameraHeight },
      aspectRatio: { ideal: profile.canvasAspect }
    },
    audio: false
  };
}

// Conserva la proporción real que entrega la cámara y limita la resolución
// para que BodyPose / HandPose no procese más píxeles de los necesarios.
function configureVideoElement(video, profile = getDeviceProfile()) {
  const rawW = video && video.elt && video.elt.videoWidth
    ? video.elt.videoWidth
    : profile.cameraWidth;
  const rawH = video && video.elt && video.elt.videoHeight
    ? video.elt.videoHeight
    : profile.cameraHeight;

  const ratio = rawW / Math.max(1, rawH);
  const maxLong = profile.maxCameraLongSide;

  let w;
  let h;

  if (ratio >= 1) {
    w = Math.min(rawW, maxLong);
    h = Math.round(w / ratio);
  } else {
    h = Math.min(rawH, maxLong);
    w = Math.round(h * ratio);
  }

  w = Math.max(240, w);
  h = Math.max(240, h);

  video.size(w, h);

  return {
    width: w,
    height: h,
    aspect: w / h
  };
}

function fitContain(containerW, containerH, mediaW, mediaH) {
  const safeW = Math.max(1, mediaW);
  const safeH = Math.max(1, mediaH);
  const scale = Math.min(containerW / safeW, containerH / safeH);

  return {
    scale,
    width: safeW * scale,
    height: safeH * scale,
    x: (containerW - safeW * scale) / 2,
    y: (containerH - safeH * scale) / 2
  };
}

function createFullscreenControl(x = 132, y = 60) {
  const mobile = isMobileSceneDevice(getDeviceProfile());
  const button = createButton(mobile ? '▣ Modo amplio' : '⛶ Pantalla completa');
  button.position(x, y);
  button.mousePressed(toggleFullscreenSafe);
  return button;
}

async function toggleFullscreenSafe() {
  const profile = getDeviceProfile();

  // En móvil evitamos Fullscreen API porque algunos navegadores producen
  // un pantallazo blanco al reconstruir el viewport.
  if (isMobileSceneDevice(profile)) {
    if (sceneModeActive) {
      await leaveMobileSceneMode();
    } else {
      enterMobileSceneMode();
    }
    return;
  }

  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (typeof fullscreen === 'function') {
      fullscreen(!fullscreen());
    }
  } catch (err) {}

  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 180);
}


function fitCover(containerW, containerH, mediaW, mediaH) {
  const safeW = Math.max(1, mediaW);
  const safeH = Math.max(1, mediaH);
  const scale = Math.max(containerW / safeW, containerH / safeH);

  return {
    scale,
    width: safeW * scale,
    height: safeH * scale,
    x: (containerW - safeW * scale) / 2,
    y: (containerH - safeH * scale) / 2
  };
}

// En vertical intentamos conservar un encuadre natural sin "zoom" excesivo.
// Si la cámara realmente entrega formato vertical, ocupa el canvas.
// Si el navegador devuelve una señal horizontal (común en móviles),
// se conserva el fotograma completo con "contain" en vez de recortarlo.
function fitCameraToCanvas(containerW, containerH, mediaW, mediaH) {
  const canvasPortrait = containerH > containerW;
  const mediaPortrait = mediaH > mediaW;

  if (canvasPortrait && mediaPortrait) {
    return fitContain(containerW, containerH, mediaW, mediaH);
  }

  return fitContain(containerW, containerH, mediaW, mediaH);
}


const HAND_SKELETON_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [17,0]
];

function drawBodySkeletonOverlay(pose, connections, mapPoint, lineColor = '#FFFFFFAA', pointColor = '#FFFFFFFF') {
  if (!pose || !pose.keypoints || !connections || !connections.length) return;

  push();
  stroke(lineColor);
  strokeWeight(2);

  for (const pair of connections) {
    const a = pose.keypoints[pair[0]];
    const b = pose.keypoints[pair[1]];
    if (a && b && a.confidence > 0.25 && b.confidence > 0.25) {
      const A = mapPoint(a);
      const B = mapPoint(b);
      line(A.x, A.y, B.x, B.y);
    }
  }

  noStroke();
  fill(pointColor);
  for (const kp of pose.keypoints) {
    if (kp && kp.confidence > 0.25) {
      const p = mapPoint(kp);
      circle(p.x, p.y, 7);
    }
  }
  pop();
}

function drawHandSkeletonOverlay(hands, mapPoint, lineColor = '#FFFFFFAA', pointColor = '#FFFFFFFF') {
  if (!hands || !hands.length) return;

  push();
  stroke(lineColor);
  strokeWeight(2);

  for (const hand of hands) {
    for (const pair of HAND_SKELETON_CONNECTIONS) {
      const a = hand.keypoints[pair[0]];
      const b = hand.keypoints[pair[1]];
      if (a && b) {
        const A = mapPoint(a);
        const B = mapPoint(b);
        line(A.x, A.y, B.x, B.y);
      }
    }

    noStroke();
    fill(pointColor);
    for (const kp of hand.keypoints) {
      if (kp) {
        const p = mapPoint(kp);
        circle(p.x, p.y, 7);
      }
    }
  }
  pop();
}


// ─────────────────────────────────────────────────────────────
// Modo escena móvil: fullscreen + interfaz oculta
// ─────────────────────────────────────────────────────────────
let sceneModeActive = false;
let sceneControlsVisible = true;
let sceneHideTimer = null;

function isMobileSceneDevice(profile = getDeviceProfile()) {
  return profile.type === 'mobile' || profile.type === 'tablet';
}

function isMobileSceneModeActive() {
  return sceneModeActive;
}

function getSceneUiElements() {
  return Array.from(document.body.children).filter(el => {
    const tag = el.tagName;
    if (tag === 'CANVAS' || tag === 'SCRIPT' || tag === 'VIDEO') return false;
    if (el.dataset && el.dataset.sceneExempt === 'true') return false;
    return true;
  });
}

function setSceneControlsVisible(visible) {
  sceneControlsVisible = visible;

  for (const el of getSceneUiElements()) {
    if (visible) {
      if (el.dataset && Object.prototype.hasOwnProperty.call(el.dataset, 'sceneDisplay')) {
        el.style.display = el.dataset.sceneDisplay;
        delete el.dataset.sceneDisplay;
      } else {
        el.style.display = '';
      }
    } else {
      if (el.dataset && !Object.prototype.hasOwnProperty.call(el.dataset, 'sceneDisplay')) {
        el.dataset.sceneDisplay = el.style.display || '';
      }
      el.style.display = 'none';
    }
  }
}

function ensureImmersiveStyles() {
  if (document.getElementById('scene-immersive-style')) return;

  const style = document.createElement('style');
  style.id = 'scene-immersive-style';
  style.textContent = `
    html.scene-immersive,
    body.scene-immersive {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      overscroll-behavior: none !important;
      background: #000 !important;
    }

    body.scene-immersive canvas,
    body.scene-immersive .p5Canvas {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100dvh !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      z-index: 1 !important;
    }
  `;
  document.head.appendChild(style);
}

function applyImmersiveLayout() {
  ensureImmersiveStyles();
  document.documentElement.classList.add('scene-immersive');
  document.body.classList.add('scene-immersive');

  // Recalcula el canvas con el viewport realmente visible.
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 40);
}

function removeImmersiveLayout() {
  document.documentElement.classList.remove('scene-immersive');
  document.body.classList.remove('scene-immersive');

  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 40);
}

function showSceneHint() {
  let hint = document.getElementById('scene-mode-hint');

  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'scene-mode-hint';
    hint.dataset.sceneExempt = 'true';
    hint.textContent = 'Toca la esquina superior derecha para mostrar controles';
    Object.assign(hint.style, {
      position: 'fixed',
      right: '12px',
      top: '12px',
      zIndex: '99999',
      maxWidth: '250px',
      padding: '8px 10px',
      borderRadius: '10px',
      background: 'rgba(0,0,0,.58)',
      color: '#fff',
      font: '12px system-ui, sans-serif',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity .25s ease'
    });
    document.body.appendChild(hint);
  }

  hint.style.display = 'block';
  requestAnimationFrame(() => { hint.style.opacity = '1'; });

  setTimeout(() => {
    hint.style.opacity = '0';
    setTimeout(() => { hint.style.display = 'none'; }, 280);
  }, 2200);
}

function hideSceneControlsSoon(delay = 420) {
  clearTimeout(sceneHideTimer);
  sceneHideTimer = setTimeout(() => {
    if (!sceneModeActive) return;
    setSceneControlsVisible(false);
  }, delay);
}

function showSceneControlsTemporarily(duration = 6000) {
  if (!sceneModeActive) return;

  setSceneControlsVisible(true);
  clearTimeout(sceneHideTimer);

  sceneHideTimer = setTimeout(() => {
    if (sceneModeActive) setSceneControlsVisible(false);
  }, duration);
}

function enterMobileSceneMode() {
  const profile = getDeviceProfile();
  if (!isMobileSceneDevice(profile)) return;

  sceneModeActive = true;
  applyImmersiveLayout();

  showSceneHint();
  hideSceneControlsSoon(520);
}

async function leaveMobileSceneMode() {
  sceneModeActive = false;
  clearTimeout(sceneHideTimer);
  setSceneControlsVisible(true);
  removeImmersiveLayout();
}

if (!window.__sceneModeRecoveryInstalled) {
  window.__sceneModeRecoveryInstalled = true;

  document.addEventListener('pointerdown', event => {
    if (!sceneModeActive || sceneControlsVisible) return;

    const hotspot = 78;
    const inTopRight =
      event.clientX >= window.innerWidth - hotspot &&
      event.clientY <= hotspot;

    if (!inTopRight) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    showSceneControlsTemporarily(6500);
  }, true);
}


if (!window.__sceneVisualViewportInstalled && window.visualViewport) {
  window.__sceneVisualViewportInstalled = true;

  const refreshSceneViewport = () => {
    if (!sceneModeActive) return;
    window.dispatchEvent(new Event('resize'));
  };

  window.visualViewport.addEventListener('resize', refreshSceneViewport);
  window.visualViewport.addEventListener('scroll', refreshSceneViewport);
}
