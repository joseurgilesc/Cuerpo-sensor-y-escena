let video;
let bodyPose;
let poses = [];
let connections = [];
let particles = [];
let showCamera = true;

const MAX_PARTICLES = 220;

async function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodyPose = await ml5.bodyPose();
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getConnections();

  for (let i = 0; i < 80; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function draw() {
  background(12);

  if (showCamera) {
    push();
    translate(width, 0);
    scale(-1, 1);
    tint(255, 120);
    image(video, 0, 0, width, height);
    pop();
  }

  drawParticles();
  drawBody();
  drawInfo();
}

function drawBody() {
  if (poses.length === 0) return;

  const pose = poses[0];

  push();
  translate(width, 0);
  scale(-1, 1);

  stroke(255);
  strokeWeight(2);

  for (let i = 0; i < connections.length; i++) {
    const a = pose.keypoints[connections[i][0]];
    const b = pose.keypoints[connections[i][1]];

    if (a.confidence > 0.2 && b.confidence > 0.2) {
      line(a.x, a.y, b.x, b.y);
    }
  }

  noStroke();
  fill(255);
  for (const kp of pose.keypoints) {
    if (kp.confidence > 0.2) {
      circle(kp.x, kp.y, 8);
    }
  }
  pop();

  const rw = keypointByName(pose, "right_wrist");
  const lw = keypointByName(pose, "left_wrist");

  if (rw && rw.confidence > 0.2) {
    const mx = width - rw.x;
    const my = rw.y;
    emitParticles(mx, my, 3);
  }

  if (rw && lw && rw.confidence > 0.2 && lw.confidence > 0.2) {
    const rx = width - rw.x;
    const lx = width - lw.x;
    const d = dist(rx, rw.y, lx, lw.y);
    const target = floor(map(d, 40, 500, 40, MAX_PARTICLES, true));

    while (particles.length < target) {
      particles.push(new Particle(random(width), random(height)));
    }
    if (particles.length > target) {
      particles.splice(0, particles.length - target);
    }
  }
}

function keypointByName(pose, name) {
  return pose.keypoints.find(k => k.name === name);
}

function emitParticles(x, y, amount) {
  for (let i = 0; i < amount && particles.length < MAX_PARTICLES; i++) {
    particles.push(new Particle(x, y));
  }
}

function drawParticles() {
  for (const p of particles) {
    p.update();
    p.display();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1.5, 1.5);
    this.vy = random(-1.5, 1.5);
    this.r = random(5, 14);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  display() {
    noStroke();
    fill(255, 210);
    circle(this.x, this.y, this.r);
  }
}

function drawInfo() {
  noStroke();
  fill(0, 170);
  rect(12, 12, 270, 66, 8);

  fill(255);
  textSize(14);
  text("BodyPose + partículas", 24, 36);
  textSize(12);
  text("Mano derecha: genera partículas", 24, 55);
  text("Distancia entre manos: cantidad", 24, 70);

  fill(0, 170);
  rect(width - 154, 12, 142, 36, 8);
  fill(255);
  textAlign(CENTER, CENTER);
  text("C: cámara on/off", width - 83, 30);
  textAlign(LEFT, BASELINE);
}

function keyPressed() {
  if (key === "c" || key === "C") {
    showCamera = !showCamera;
  }
}

function gotPoses(results) {
  poses = results;
}
