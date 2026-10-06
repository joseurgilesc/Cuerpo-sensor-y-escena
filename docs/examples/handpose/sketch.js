let handPose;
let video;
let hands = [];
let playBtn, stopBtn, camBtn, pointsBtn;
let showCam = false;
let showPoints = true;
let particles = [];
const NUM_PARTICLES = 400;

async function setup() {
  createCanvas(windowWidth, windowHeight);
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

  // Botón mostrar/ocultar cámara
  camBtn = createButton('👁 Cámara');
  camBtn.position(190, 10);
  camBtn.mousePressed(toggleCam);
  camBtn.attribute('disabled', '');

  pointsBtn = createButton('● Puntos: ON');
  pointsBtn.position(10, 60);
  pointsBtn.mousePressed(togglePoints);

  // Crea las partículas
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle());
  }
}

function startCam() {
  video = createCapture({ video: { facingMode: 'user' }, audio: false }, videoReady);
  video.size(640, 480);
  video.hide();

  playBtn.attribute('disabled', '');
  stopBtn.removeAttribute('disabled');
  camBtn.removeAttribute('disabled');
}

function videoReady() {
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
  playBtn.removeAttribute('disabled');
  stopBtn.attribute('disabled', '');
  camBtn.attribute('disabled', '');
}

function toggleCam() {
  showCam = !showCam;
}

function togglePoints() {
  showPoints = !showPoints;
  pointsBtn.html(showPoints ? '● Puntos: ON' : '○ Puntos: OFF');
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(0, 25); // estela suave de las partículas

  // Mapeo "contain" (sin zoom)
  let s = min(width / 640, height / 480);
  let ox = (width - 640 * s) / 2;
  let oy = (height - 480 * s) / 2;

  // Puntas de los dedos (índices 4, 8, 12, 16, 20) como atractores
  let attractors = [];
  for (let hand of hands) {
    for (let idx of [4, 8, 12, 16, 20]) {
      let kp = hand.keypoints[idx];
      if (kp) attractors.push(createVector(kp.x * s + ox, kp.y * s + oy));
    }
  }

  // Dibuja la cámara solo si está activada
  if (showCam && video) {
    image(video, ox, oy, 640 * s, 480 * s);
  }

  if (showPoints) drawHandPoints(s, ox, oy);

  // Actualiza y dibuja las partículas
  for (let p of particles) {
    p.update(attractors);
    p.show();
  }

  // Estado de la cámara
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  text(showCam ? 'Cámara: ON' : 'Cámara: OFF', 10, 50);
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
  resizeCanvas(windowWidth, windowHeight);
}
