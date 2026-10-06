let video;
let bodyPose;
let poses = [];
let connections = [];
let trails = [];
let bursts = [];
let showCamera = false;
let prevRW = null;
let prevLW = null;

async function setup() {
  createCanvas(640, 480);
  colorMode(HSB, 360, 100, 100, 100);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodyPose = await ml5.bodyPose();
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getConnections();
}

function draw() {
  background(240, 35, 8, 18);

  if (showCamera) {
    push();
    tint(255, 35);
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
  }

  if (poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    updateGestures(pose);
  }

  updateTrails();
  updateBursts();
  drawHUD();
}

function drawSkeleton(pose) {
  push();
  translate(width, 0);
  scale(-1, 1);

  for (let i = 0; i < connections.length; i++) {
    const a = pose.keypoints[connections[i][0]];
    const b = pose.keypoints[connections[i][1]];
    if (a.confidence > 0.25 && b.confidence > 0.25) {
      const hue = map((a.x + b.x) * 0.5, 0, width, 180, 330);
      stroke(hue, 75, 100, 55);
      strokeWeight(2.5);
      line(a.x, a.y, b.x, b.y);
    }
  }

  noStroke();
  for (const kp of pose.keypoints) {
    if (kp.confidence > 0.25) {
      const hue = map(kp.y, 0, height, 30, 320);
      fill(hue, 80, 100, 85);
      circle(kp.x, kp.y, 8);
    }
  }
  pop();
}

function updateGestures(pose) {
  const rw = getKP(pose, "right_wrist");
  const lw = getKP(pose, "left_wrist");
  const nose = getKP(pose, "nose");

  if (rw && rw.confidence > 0.25) {
    const x = width - rw.x;
    const y = rw.y;
    const speed = prevRW ? dist(x, y, prevRW.x, prevRW.y) : 0;
    trails.push(new TrailPoint(x, y, frameCount * 3 % 360, speed));
    if (speed > 22) burst(x, y, frameCount * 3 % 360, 10);
    prevRW = { x, y };
  }

  if (lw && lw.confidence > 0.25) {
    const x = width - lw.x;
    const y = lw.y;
    const speed = prevLW ? dist(x, y, prevLW.x, prevLW.y) : 0;
    trails.push(new TrailPoint(x, y, (frameCount * 3 + 140) % 360, speed));
    if (speed > 22) burst(x, y, (frameCount * 3 + 140) % 360, 10);
    prevLW = { x, y };
  }

  if (rw && lw && rw.confidence > 0.25 && lw.confidence > 0.25) {
    const rx = width - rw.x;
    const lx = width - lw.x;
    const d = dist(rx, rw.y, lx, lw.y);
    const midX = (rx + lx) / 2;
    const midY = (rw.y + lw.y) / 2;

    noFill();
    stroke((frameCount * 2) % 360, 70, 100, 40);
    strokeWeight(map(d, 30, 500, 1, 10, true));
    circle(midX, midY, d * 0.5);

    if (d > 320 && frameCount % 8 === 0) {
      burst(midX, midY, frameCount * 2 % 360, 18);
    }
  }

  if (nose && nose.confidence > 0.25) {
    const nx = width - nose.x;
    const ny = nose.y;
    noStroke();
    fill((frameCount * 2) % 360, 40, 100, 18);
    circle(nx, ny, 80 + 20 * sin(frameCount * 0.08));
  }
}

function getKP(pose, name) {
  return pose.keypoints.find(k => k.name === name);
}

class TrailPoint {
  constructor(x, y, hue, speed) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.life = 100;
    this.size = constrain(map(speed, 0, 45, 8, 34), 8, 34);
  }
  update() { this.life -= 2.4; }
  display() {
    noStroke();
    fill(this.hue, 80, 100, this.life);
    circle(this.x, this.y, this.size);
  }
}

function updateTrails() {
  for (let i = trails.length - 1; i >= 0; i--) {
    trails[i].update();
    trails[i].display();
    if (trails[i].life <= 0) trails.splice(i, 1);
  }
  if (trails.length > 450) trails.splice(0, trails.length - 450);
}

function burst(x, y, hue, n) {
  for (let i = 0; i < n; i++) {
    bursts.push({
      x, y,
      vx: random(-4, 4),
      vy: random(-4, 4),
      hue: (hue + random(-35, 35) + 360) % 360,
      life: 100,
      size: random(5, 16)
    });
  }
}

function updateBursts() {
  for (let i = bursts.length - 1; i >= 0; i--) {
    const p = bursts[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.life -= 2.2;
    noStroke();
    fill(p.hue, 85, 100, p.life);
    circle(p.x, p.y, p.size);
    if (p.life <= 0) bursts.splice(i, 1);
  }
  if (bursts.length > 500) bursts.splice(0, bursts.length - 500);
}

function drawHUD() {
  colorMode(RGB, 255);
  noStroke();
  fill(0, 150);
  rect(12, 12, 285, 72, 10);
  fill(255);
  textSize(14);
  text("BodyPose — color y movimiento", 24, 34);
  textSize(12);
  text("Muñecas: trazos de color", 24, 53);
  text("Movimiento rápido: explosiones", 24, 68);
  text("Brazos abiertos: pulso central", 24, 82);

  fill(0, 150);
  rect(width - 165, 12, 153, 38, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  text("C: cámara on/off", width - 88, 31);
  textAlign(LEFT, BASELINE);
  colorMode(HSB, 360, 100, 100, 100);
}

function keyPressed() {
  if (key === "c" || key === "C") showCamera = !showCamera;
}

function gotPoses(results) {
  poses = results;
}
