let video;
let bodyPose;
let poses = [];
let particles = [];
let hand = { x: 320, y: 240, active: false };
let showCamera = false;

let audioReady = false;
let osc, filter, gain, panner;
let audioButton;

const NUM_PARTICLES = 140;

async function setup() {
  createCanvas(640, 480);
  colorMode(HSB, 360, 100, 100, 100);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodyPose = await ml5.bodyPose();
  bodyPose.detectStart(video, gotPoses);

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle(random(width), random(height)));
  }

  audioButton = createButton("Activar audio");
  audioButton.position(16, 92);
  audioButton.style("padding", "8px 12px");
  audioButton.style("border-radius", "8px");
  audioButton.style("border", "0");
  audioButton.style("font-size", "13px");
  audioButton.mousePressed(startAudio);
}

function draw() {
  background(225, 35, 7, 24);

  if (showCamera) {
    push();
    tint(255, 25);
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
  }

  updateHand();
  updateParticles();
  drawHandMarker();
  updateAudio();
  drawHUD();
}

function updateHand() {
  hand.active = false;
  if (poses.length === 0) return;

  const pose = poses[0];
  const rw = pose.keypoints.find(k => k.name === "right_wrist");

  if (rw && rw.confidence > 0.25) {
    hand.x = width - rw.x;
    hand.y = rw.y;
    hand.active = true;
  }
}

function updateParticles() {
  for (const p of particles) {
    p.update(hand);
    p.display();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.8, 0.8);
    this.vy = random(-0.8, 0.8);
    this.seed = random(1000);
    this.size = random(3, 8);
  }

  update(target) {
    if (target.active) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const d = max(18, sqrt(dx * dx + dy * dy));

      const attraction = 0.22;
      this.vx += (dx / d) * attraction;
      this.vy += (dy / d) * attraction;

      const swirl = 0.11;
      this.vx += (-dy / d) * swirl;
      this.vy += (dx / d) * swirl;
    } else {
      this.vx += map(noise(this.seed, frameCount * 0.01), 0, 1, -0.03, 0.03);
      this.vy += map(noise(this.seed + 50, frameCount * 0.01), 0, 1, -0.03, 0.03);
    }

    this.vx *= 0.96;
    this.vy *= 0.96;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -10) this.x = width + 10;
    if (this.x > width + 10) this.x = -10;
    if (this.y < -10) this.y = height + 10;
    if (this.y > height + 10) this.y = -10;
  }

  display() {
    const hue = map(this.x, 0, width, 190, 320);
    noStroke();
    fill(hue, 65, 100, 65);
    circle(this.x, this.y, this.size);
  }
}

function drawHandMarker() {
  if (!hand.active) return;

  noFill();
  stroke(45, 70, 100, 80);
  strokeWeight(2);
  circle(hand.x, hand.y, 34 + sin(frameCount * 0.08) * 6);

  noStroke();
  fill(45, 40, 100, 90);
  circle(hand.x, hand.y, 7);
}

async function startAudio() {
  await Tone.start();

  if (!audioReady) {
    osc = new Tone.Oscillator({
      type: "sine",
      frequency: 220
    });

    filter = new Tone.Filter({
      frequency: 900,
      type: "lowpass",
      rolloff: -12
    });

    gain = new Tone.Gain(0.018);
    panner = new Tone.Panner(0).toDestination();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    osc.start();

    audioReady = true;
    audioButton.html("Audio activo");
  }
}

function updateAudio() {
  if (!audioReady || !hand.active) return;

  const freq = map(hand.y, height, 0, 140, 620, true);
  const cutoff = map(hand.y, height, 0, 500, 2600, true);
  const pan = map(hand.x, 0, width, -0.7, 0.7, true);

  osc.frequency.rampTo(freq, 0.12);
  filter.frequency.rampTo(cutoff, 0.15);
  panner.pan.rampTo(pan, 0.12);
}

function drawHUD() {
  colorMode(RGB, 255);
  noStroke();
  fill(0, 150);
  rect(12, 12, 330, 68, 10);

  fill(255);
  textSize(14);
  text("BodyPose — partículas + audio sutil", 24, 34);
  textSize(12);
  text("Mano derecha: atrae y hace girar las partículas", 24, 53);
  text("X = paneo | Y = altura y filtro", 24, 69);

  fill(0, 150);
  rect(width - 160, 12, 148, 38, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  text("C: cámara on/off", width - 86, 31);
  textAlign(LEFT, BASELINE);

  colorMode(HSB, 360, 100, 100, 100);
}

function keyPressed() {
  if (key === "c" || key === "C") {
    showCamera = !showCamera;
  }
}

function gotPoses(results) {
  poses = results;
}
