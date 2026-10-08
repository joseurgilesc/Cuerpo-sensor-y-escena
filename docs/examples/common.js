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

  // Solicitamos una relación cercana a la pantalla real.
  // En vertical esto favorece una captura más alta y reduce el recorte lateral.
  const screenAspect = w / h;
  const aspect = screenAspect;
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


// Mantiene el elemento <video> activo para ml5 aunque no se muestre como
// elemento HTML. Evitamos display:none porque algunos navegadores móviles
// pueden reducir o pausar la actualización de un video completamente oculto.
// La opción "Vista" de cada ejemplo solo controla si image(video, ...) se
// dibuja en el canvas; no modifica el stream ni la detección.
function keepVideoCaptureActive(video) {
  if (!video || !video.elt) return;

  const elt = video.elt;
  elt.setAttribute('playsinline', '');
  elt.setAttribute('autoplay', '');
  elt.setAttribute('aria-hidden', 'true');
  elt.muted = true;
  elt.playsInline = true;
  elt.autoplay = true;

  // Mantener el <video> técnicamente visible dentro del viewport evita que
  // algunos navegadores móviles suspendan sus fotogramas. Es solo 1x1 px y
  // prácticamente transparente: la vista grande sigue dependiendo
  // exclusivamente de showCamera + image(video, ...).
  Object.assign(elt.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '1px',
    height: '1px',
    opacity: '0.01',
    pointerEvents: 'none',
    zIndex: '-1',
    display: 'block',
    visibility: 'visible'
  });

  const playPromise = elt.play && elt.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {});
  }
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

  // video.size() puede modificar dimensiones del elemento HTML. Reaplicamos
  // el modo de captura activa para que ocultar la vista nunca afecte a ml5.
  keepVideoCaptureActive(video);

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

// Ajuste inteligente de cámara.
// - Si canvas y cámara son verticales, "cover" aprovecha toda la pantalla.
// - Si el canvas es vertical pero la cámara llega horizontal, limitamos el
//   aumento a 1.35x sobre "contain" para evitar un zoom/crop excesivo.
// - En horizontal conservamos el fotograma completo.
function fitCameraToCanvas(containerW, containerH, mediaW, mediaH) {
  const canvasPortrait = containerH > containerW;
  const mediaPortrait = mediaH > mediaW;

  if (canvasPortrait && mediaPortrait) {
    return fitCover(containerW, containerH, mediaW, mediaH);
  }

  if (canvasPortrait && !mediaPortrait) {
    const contain = fitContain(containerW, containerH, mediaW, mediaH);
    const cover = fitCover(containerW, containerH, mediaW, mediaH);
    const scale = Math.min(cover.scale, contain.scale * 1.35);

    return {
      scale,
      width: mediaW * scale,
      height: mediaH * scale,
      x: (containerW - mediaW * scale) / 2,
      y: (containerH - mediaH * scale) / 2
    };
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


// Botón manual para ocultar/mostrar controles sin alterar canvas ni cámara.
let exampleControlsHidden = false;

function createControlsVisibilityButton() {
  const button = createButton('Ocultar controles');
  button.elt.dataset.controlsToggle = 'true';

  Object.assign(button.elt.style, {
    position: 'fixed',
    right: '12px',
    bottom: '16px',
    zIndex: '10000',
    minWidth: 'auto',
    opacity: '0.9'
  });

  button.mousePressed(() => toggleExampleControls(button));
  return button;
}

function toggleExampleControls(toggleButton) {
  exampleControlsHidden = !exampleControlsHidden;

  const controls = document.querySelectorAll(
    'body > button, body > input, body > select, body > textarea, body > label, body > div'
  );

  controls.forEach(el => {
    if (el === toggleButton.elt) return;

    if (exampleControlsHidden) {
      if (!Object.prototype.hasOwnProperty.call(el.dataset, 'controlsDisplay')) {
        el.dataset.controlsDisplay = el.style.display || '';
      }
      el.style.display = 'none';
    } else if (Object.prototype.hasOwnProperty.call(el.dataset, 'controlsDisplay')) {
      el.style.display = el.dataset.controlsDisplay;
      delete el.dataset.controlsDisplay;
    }
  });

  toggleButton.html(
    exampleControlsHidden ? 'Mostrar controles' : 'Ocultar controles'
  );
}
