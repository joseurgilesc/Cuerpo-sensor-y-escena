// Utilidades compartidas para los ejemplos interactivos.
function getDeviceProfile() {
  const w = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 640);
  const h = Math.max(320, window.innerHeight || document.documentElement.clientHeight || 480);
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

  // La relación objetivo parte del área real disponible del dispositivo.
  const aspect = w / h;
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
  const button = createButton('⛶ Pantalla completa');
  button.position(x, y);
  button.mousePressed(toggleFullscreenSafe);
  return button;
}

async function toggleFullscreenSafe() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (typeof fullscreen === 'function') {
      fullscreen(!fullscreen());
    }
  } catch (err) {
    // Algunos navegadores móviles no permiten fullscreen para documentos HTML.
  }

  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 180);
}
