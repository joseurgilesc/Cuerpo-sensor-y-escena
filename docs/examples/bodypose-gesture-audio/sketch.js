let video,bodyPose,poses=[],connections=[],particles=[];
let playBtn,stopBtn,camBtn,pointsBtn,fullscreenBtn,volumeSlider,volumeLabel;
let running=false,showCamera=false,showPoints=true,audioReady=false,soundOn=false;
let synth,gain,reverb;
let SRC_W=640,SRC_H=480,deviceProfile;const NUM_PARTICLES=180;

async function setup(){
  deviceProfile=setupResponsiveCanvas();
  SRC_W=deviceProfile.cameraWidth;
  SRC_H=deviceProfile.cameraHeight;
  colorMode(HSB,360,100,100,100);
  bodyPose=await ml5.bodyPose();

  playBtn=mk('▶ Play',10,startExperience);
  stopBtn=mk('■ Stop',96,stopExperience,true);
  camBtn=mk('👁 Vista: OFF',182,toggleCam,true);
  pointsBtn=mk('● Esqueleto: ON',10,togglePoints,false,60);
  fullscreenBtn=createFullscreenControl(150,60);

  volumeSlider=createSlider(0,100,18,1);
  volumeSlider.position(12,120);
  volumeSlider.style('width','160px');
  volumeSlider.input(updateVolume);

  volumeLabel=createDiv('Volumen: 18%');
  volumeLabel.position(182,115);
  volumeLabel.style('color','#fff');
  volumeLabel.style('font-size','13px');
  volumeLabel.style('background','rgba(0,0,0,.55)');
  volumeLabel.style('padding','4px 7px');
  volumeLabel.style('border-radius','7px');

  for(let i=0;i<NUM_PARTICLES;i++)particles.push(new Particle());
}

function mk(t,x,f,d=false,y=10){
  const b=createButton(t);b.position(x,y);b.mousePressed(f);
  if(d)b.attribute('disabled','');
  return b;
}

async function startExperience(){
  if(running)return;
  enterMobileSceneMode();
  await Tone.start();
  if(!audioReady)setupAudio();

  video=createCapture(getResponsiveCameraConstraints(deviceProfile),()=>{
    const dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;
    bodyPose.detectStart(video,gotPoses);
    running=true;
  });
  video.hide();

  playBtn.attribute('disabled','');
  stopBtn.removeAttribute('disabled');
  camBtn.removeAttribute('disabled');
}

function setupAudio(){
  gain=new Tone.Gain(0).toDestination();
  reverb=new Tone.Reverb({decay:3,wet:.35}).connect(gain);
  synth=new Tone.PolySynth(Tone.Synth,{
    oscillator:{type:'sine'},
    envelope:{attack:.35,decay:.5,sustain:.25,release:1.6}
  }).connect(reverb);
  audioReady=true;
}

function stopExperience(){
  leaveMobileSceneMode();
  bodyPose.detectStop();
  if(video){video.remove();video=null;}
  poses=[];running=false;showCamera=false;
  camBtn.html('👁 Vista: OFF');
  releaseSound();
  playBtn.removeAttribute('disabled');
  stopBtn.attribute('disabled','');
  camBtn.attribute('disabled','');
}

function toggleCam(){showCamera=!showCamera;camBtn.html(showCamera?'👁 Vista: ON':'👁 Vista: OFF');}
function togglePoints(){showPoints=!showPoints;pointsBtn.html(showPoints?'● Esqueleto: ON':'○ Esqueleto: OFF');}
function updateVolume(){
  const v=Number(volumeSlider.value());
  volumeLabel.html('Volumen: '+v+'%');
  if(audioReady&&soundOn)gain.gain.rampTo((v/100)*.12,.12);
}

function fit(){const f=fitCameraToCanvas(width,height,SRC_W,SRC_H);return{s:f.scale,ox:f.x,oy:f.y};}
function mp(k){const {s,ox,oy}=fit();return{x:width-(k.x*s+ox),y:k.y*s+oy};}
function kp(p,n){return p.keypoints.find(k=>k.name===n);}

function draw(){
  background(210,45,7,22);
  const {s,ox,oy}=fit();

  if(showCamera&&video){
    push();tint(255,28);translate(width,0);scale(-1,1);
    image(video,ox,oy,SRC_W*s,SRC_H*s);pop();
  }

  let left=null,right=null,handsClose=false,handDistance=999;

  if(running&&poses.length){
    const pose=poses[0];
    if(showPoints)drawBodySkeletonOverlay(pose,connections,mp);
    const lw=kp(pose,'left_wrist'),rw=kp(pose,'right_wrist');
    if(lw&&rw&&lw.confidence>.25&&rw.confidence>.25){
      left=mp(lw);right=mp(rw);
      handDistance=dist(left.x,left.y,right.x,right.y);
      const threshold=min(width,height)*.22;
      handsClose=handDistance<threshold;

      if(handsClose)activateSound((left.y+right.y)/2);
      else releaseSound();

      drawHands(left,right,handsClose,threshold);
    }else releaseSound();
  }else releaseSound();

  for(const p of particles){p.update(left,right,handsClose);p.show(handsClose);}
  hud(handsClose,handDistance);
}

function drawPosePoints(pose){
  noStroke();fill(0,0,100,85);
  for(const k of pose.keypoints){if(k.confidence>.25){const p=mp(k);circle(p.x,p.y,7);}}
}

function activateSound(avgY){
  if(!audioReady)return;
  if(!soundOn){
    synth.triggerAttack(['C4','G4','D5']);
    soundOn=true;
  }
  gain.gain.rampTo((Number(volumeSlider.value())/100)*.12,.12);
  const trans=map(avgY,height,0,-7,7,true);
  synth.set({detune:trans*10});
}

function releaseSound(){
  if(!audioReady||!soundOn)return;
  synth.releaseAll();
  gain.gain.rampTo(0,.25);
  soundOn=false;
}

function drawHands(L,R,on,threshold){
  stroke(on?50:195,80,100,80);strokeWeight(2);
  line(L.x,L.y,R.x,R.y);
  noFill();circle(L.x,L.y,30);circle(R.x,R.y,30);
  const mx=(L.x+R.x)/2,my=(L.y+R.y)/2;
  stroke(on?50:195,60,100,on?70:25);
  circle(mx,my,on?threshold*1.15:threshold*.65);
}

class Particle{
  constructor(){this.x=random(width);this.y=random(height);this.vx=random(-.5,.5);this.vy=random(-.5,.5);this.r=random(2,6);this.seed=random(1000);}
  update(L,R,on){
    let target=null;
    if(L&&R)target=random()<.5?L:R;
    if(target){
      const dx=target.x-this.x,dy=target.y-this.y,d=max(18,sqrt(dx*dx+dy*dy));
      const force=on?.28:.10;
      this.vx+=(dx/d)*force;this.vy+=(dy/d)*force;
      if(on){this.vx+=(-dy/d)*.09;this.vy+=(dx/d)*.09;}
    }else{
      this.vx+=map(noise(this.seed,frameCount*.01),0,1,-.025,.025);
      this.vy+=map(noise(this.seed+30,frameCount*.01),0,1,-.025,.025);
    }
    this.vx*=.97;this.vy*=.97;this.x+=this.vx;this.y+=this.vy;
    if(this.x<0)this.x=width;if(this.x>width)this.x=0;if(this.y<0)this.y=height;if(this.y>height)this.y=0;
  }
  show(on){noStroke();fill(on?45:195,on?80:55,100,on?80:50);circle(this.x,this.y,on?this.r*1.35:this.r);}
}

function hud(on,d){if(isMobileSceneModeActive())return;
  colorMode(RGB,255);noStroke();fill(0,155);rect(12,160,min(355,width-24),76,10);
  fill(255);textSize(13);text('BodyPose — gesto sonoro',24,181);
  textSize(11);text('Junta las manos para activar el sonido',24,199);
  text('Sepáralas para apagarlo',24,215);
  fill(on?120:210,on?255:210,on?170:255);text(on?'SONIDO ACTIVO':'SONIDO EN ESPERA',24,232);
  colorMode(HSB,360,100,100,100);
}

function gotPoses(r){poses=r;if(!connections.length)connections=bodyPose.getConnections();}
function windowResized(){deviceProfile=resizeResponsiveCanvas();if(video){const dims=configureVideoElement(video,deviceProfile);SRC_W=dims.width;SRC_H=dims.height;}else{SRC_W=deviceProfile.cameraWidth;SRC_H=deviceProfile.cameraHeight;}}
