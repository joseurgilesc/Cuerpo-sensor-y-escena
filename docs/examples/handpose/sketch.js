let handPose;
let video;
let hands = [];
let playBtn, stopBtn, camBtn, pointsBtn;
let deviceProfile;
let SRC_W = 640, SRC_H = 480;
let showCam = false;
let showPoints = true;
let particles = [];
const NUM_PARTICLES = 400;

async function setup() {
  deviceProfile = setupResponsiveCanvas();
  SRC_W = deviceProfile.cameraWidth;
  SRC_H = deviceProfile.cameraHeight;
  colorMode(HSB, 360, 100, 100, 100);

  handPose = await ml5.handPose();

  // Botón Play
  playBtn = createButton('▶ Play');
  playBtn.position(10, 10);
  playBtn.mousePressed(startCam);

  // Botón Stop
  stopBtn = createButton('■ Stop');
  stopBtn.position(100, 10);
  stopBtn.mousePressed(stopCam);
  stopBtn.attribute('disabled', '');

  // Botón mostrar/ocultar solo la vista de cámara
  camBtn = createButton('👁 Vista: OFF');
  camBtn.position(190, 10);
  camBtn.mousePressed(toggleCam);
  camBtn.attribute('disabled', '');

  pointsBtn = createButton('● Esqueleto: ON');
  pointsBtn.position(10, 60);
  pointsBtn.mousePressed(togglePoints);

  
  createExampleVersionBadge('V8');
  createControlsVisibilityButton();

  // Crea las partículas
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle());
  }
}

function startCam() {
  showCam = true;
  showPoints = true;
  camBtn.html('👁 Vista: ON');
  pointsBtn.html('● Esqueleto: ON');
  
  video = createCapture(getNaturalCameraConstraints(deviceProfile), videoReady);
  keepVideoCaptureActive(video);

  playBtn.attribute('disabled', '');
  stopBtn.removeAttribute('disabled');
  camBtn.removeAttribute('disabled');
}

async function videoReady() {
  let dims = configureVideoElement(video, deviceProfile);
  SRC_W = dims.width;
  SRC_H = dims.height;

  await setMinimumCameraZoom(video);

  dims = configureVideoElement(video, deviceProfile);
  SRC_W = dims.width;
  SRC_H = dims.height;

  handPose.detectStart(video, gotHands);
}

function stopCam() {
  
  handPose.detectStop();
  if (video) {
    video.remove();
    video = null;
  }
  hands = [];
  showCam = false;
  camBtn.html('👁 Vista: OFF');
  playBtn.removeAttribute('disabled');
  stopBtn.attribute('disabled', '');
  camBtn.attribute('disabled', '');
}

function toggleCam() {
  showCam = !showCam;
  camBtn.html(showCam ? '👁 Vista: ON' : '👁 Vista: OFF');
  if (video) keepVideoCaptureActive(video);
}

function togglePoints() {
  showPoints = !showPoints;
  pointsBtn.html(showPoints ? '● Esqueleto: ON' : '○ Esqueleto: OFF');
}

function gotHands(results) {
  hands = results;
}

function draw() {
  pumpHiddenVideoFrame(video);
  background(0, 25);

  const cameraFit = fitCameraCoverCrop(width, height, SRC_W, SRC_H);

  // Puntas de los dedos como atractores, usando exactamente el mismo recorte.
  let attractors = [];
  for (let hand of hands) {
    for (let idx of [4, 8, 12, 16, 20]) {
      let kp = hand.keypoints[idx];
      if (kp) {
        const p = mapPointToCameraCrop(kp, cameraFit, false);
        attractors.push(createVector(p.x, p.y));
      }
    }
  }

  if (showCam && video) {
    image(
      video,
      cameraFit.dx, cameraFit.dy, cameraFit.dw, cameraFit.dh,
      cameraFit.sx, cameraFit.sy, cameraFit.sw, cameraFit.sh
    );
  }

  if (showPoints) {
    drawHandSkeletonOverlay(
      hands,
      kp => mapPointToCameraCrop(kp, cameraFit, false)
    );
  }

  for (let p of particles) {
    p.update(attractors);
    p.show();
  }

  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  text(showCam ? 'Vista cámara: ON' : 'Vista cámara: OFF', 10, 50);
}

function drawHandPoints(s, ox, oy) {
  noStroke();
  fill(0, 0, 100, 90);
  for (const hand of hands) {
    for (const kp of hand.keypoints) {
      if (kp && (kp.confidence === undefined || kp.confidence > 0.2)) {
        circle(kp.x * s + ox, kp.y * s + oy, 7);
      }
    }
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.size = random(1.5, 5);
    this.hue = random(120, 210); // verde → cian
  }

  update(attractors) {
    if (attractors.length > 0) {
      let a = attractors[int(random(attractors.length))];
      let force = p5.Vector.sub(a, this.pos);
      let d = force.mag();
      force.setMag(0.5);
      if (d < 50) force.mult(-2); // orbita cerca de la punta del dedo
      this.vel.add(force);
    }

    this.vel.add(p5.Vector.random2D().mult(0.1));
    this.vel.limit(3);
    this.pos.add(this.vel);

    // Envuelve los bordes
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  show() {
    noStroke();
    fill(this.hue, 70, 100, 70);
    circle(this.pos.x, this.pos.y, this.size);
  }
}

function windowResized() {
  deviceProfile = resizeResponsiveCanvas();
  if (video) {
    const dims = configureVideoElement(video, deviceProfile);
    SRC_W = dims.width;
    SRC_H = dims.height;
  } else {
    SRC_W = deviceProfile.cameraWidth;
    SRC_H = deviceProfile.cameraHeight;
  }
}
