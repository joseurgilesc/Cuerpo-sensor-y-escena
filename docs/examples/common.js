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

  let cameraWidth = 960;
  let cameraHeight = 720;
  let density = Math.min(window.devicePixelRatio || 1, 1.5);

  if (type === 'mobile') {
    cameraWidth = 480;
    cameraHeight = 360;
    density = 1;
  } else if (type === 'tablet') {
    cameraWidth = 640;
    cameraHeight = 480;
    density = 1;
  }

  return {
    type,
    canvasWidth: w,
    canvasHeight: h,
    cameraWidth,
    cameraHeight,
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
