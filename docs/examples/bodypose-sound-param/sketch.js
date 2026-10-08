let video,bodyPose,poses=[],connections=[];
let playBtn,stopBtn,camBtn,pointsBtn,volumeSlider,volumeLabel;
let running=false,showCamera=false,showPoints=true,audioReady=false;
let osc,filter,gain;
let SRC_W=640,SRC_H=480,deviceProfile;

async function setup(){
  deviceProfile=setupResponsiveCanvas();
  SRC_W=deviceProfile.cameraWidth;
  SRC_H=deviceProfile.cameraHeight;
  colorMode(HSB,360,100,100,100);

  bodyPose=await ml5.bodyPose();

  playBtn=mk('▶ Play',10,startExample);
  stopBtn=mk('■ Stop',96,stopExample,true);
  camBtn=mk('👁 Vista: OFF',182,toggleCam,true);
  pointsBtn=mk('● Esqueleto: ON',10,togglePoints,false,60);

  volumeSlider=createSlider(0,100,20,1);
  volumeSlider.position(12,120);
  volumeSlider.style('width','160px');
  volumeSlider.input(updateVolume);

  volumeLabel=createDiv('Volumen: 20%');
  volumeLabel.position(182,115);
  volumeLabel.style('color','#fff');
  volumeLabel.style('font-size','13px');
  volumeLabel.style('background','rgba(0,0,0,.55)');
  volumeLabel.style('padding','4px 7px');
  volumeLabel.style('border-radius','7px');

  createExampleVersionBadge('V8');
  createControlsVisibilityButton();
}

function mk(t,x,f,d=false,y=10){
  const b=createButton(t);
  b.position(x,y);
  b.mousePressed(f);
  if(d)b.attribute('disabled','');
  return b;
}

async function startExample(){
  if(running)return;

  showCamera=true;
  showPoints=true;
  camBtn.html('👁 Vista: ON');
  pointsBtn.html('● Esqueleto: ON');

  await Tone.start();

  if(!audioReady){
    osc=new Tone.Oscillator({type:'sine',frequency:180});
    filter=new Tone.Filter({frequency:900,type:'lowpass',rolloff:-12});
    gain=new Tone.Gain(0).toDestination();
    osc.connect(filter);
    filter.connect(gain);
    osc.start();
    audioReady=true;
  }

  video=createCapture(getNaturalCameraConstraints(deviceProfile),async()=>{
    let dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;

    await setMinimumCameraZoom(video);

    dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;

    bodyPose.detectStart(video,gotPoses);
    running=true;
    updateVolume();
  });

  keepVideoCaptureActive(video);

  playBtn.attribute('disabled','');
  stopBtn.removeAttribute('disabled');
  camBtn.removeAttribute('disabled');
}

function stopExample(){
  bodyPose.detectStop();

  if(video){
    video.remove();
    video=null;
  }

  poses=[];
  running=false;
  showCamera=false;
  camBtn.html('👁 Vista: OFF');

  if(audioReady)gain.gain.rampTo(0,.08);

  playBtn.removeAttribute('disabled');
  stopBtn.attribute('disabled','');
  camBtn.attribute('disabled','');
}

function toggleCam(){
  showCamera=!showCamera;
  camBtn.html(showCamera?'👁 Vista: ON':'👁 Vista: OFF');
  if(video)keepVideoCaptureActive(video);
}

function togglePoints(){
  showPoints=!showPoints;
  pointsBtn.html(showPoints?'● Esqueleto: ON':'○ Esqueleto: OFF');
}

function updateVolume(){
  const v=Number(volumeSlider.value());
  volumeLabel.html('Volumen: '+v+'%');
  if(audioReady&&running)gain.gain.rampTo((v/100)*.08,.08);
}

function fit(){
  return fitCameraCoverCrop(width,height,SRC_W,SRC_H);
}

function mp(k){
  return mapPointToCameraCrop(k,fit(),true);
}

function draw(){
  pumpHiddenVideoFrame(video);
  background(225,35,8);

  const f=fit();

  if(showCamera&&video){
    push();
    translate(width,0);
    scale(-1,1);
    tint(255,115);
    image(video,f.dx,f.dy,f.dw,f.dh,f.sx,f.sy,f.sw,f.sh);
    pop();
  }

  let cutoff=900;
  let wristPoint=null;

  if(running&&poses.length){
    const pose=poses[0];

    if(showPoints){
      drawBodySkeletonOverlay(
        pose,
        connections,
        mp,
        '#FFFFFFAA',
        '#FFFFFFFF'
      );
    }

    const rw=pose.keypoints.find(k=>k.name==='right_wrist');

    if(rw&&rw.confidence>.25){
      wristPoint=mp(rw);
      cutoff=map(wristPoint.y,height,0,250,4000,true);

      if(audioReady){
        filter.frequency.rampTo(cutoff,.10);
        gain.gain.rampTo((Number(volumeSlider.value())/100)*.08,.08);
      }

      drawWristIndicator(wristPoint,cutoff);
    }else if(audioReady){
      gain.gain.rampTo(0,.12);
    }
  }else if(audioReady){
    gain.gain.rampTo(0,.12);
  }

  hud(cutoff,wristPoint);
}

function drawWristIndicator(p,cutoff){
  push();
  noFill();
  stroke(48,70,100,85);
  strokeWeight(3);
  circle(p.x,p.y,44);

  noStroke();
  fill(48,65,100,80);
  circle(p.x,p.y,12);

  fill(0,0,100,90);
  textSize(12);
  textAlign(CENTER,BOTTOM);
  text(round(cutoff)+' Hz',p.x,p.y-28);
  pop();
}

function hud(cutoff,wristPoint){
  colorMode(RGB,255);
  noStroke();
  fill(0,165);
  rect(12,160,min(360,width-24),76,10);

  fill(255);
  textSize(13);
  text('BodyPose — altura de mano controla filtro',24,181);

  textSize(11);
  text('Mano derecha arriba → filtro más abierto',24,200);
  text('Mano derecha abajo → filtro más cerrado',24,216);
  text(wristPoint?'Filtro: '+round(cutoff)+' Hz':'Buscando mano derecha…',24,232);

  colorMode(HSB,360,100,100,100);
}

function gotPoses(r){
  poses=r;
  if(!connections.length)connections=bodyPose.getConnections();
}

function windowResized(){
  deviceProfile=resizeResponsiveCanvas();

  if(video){
    const dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;
  }else{
    SRC_W=deviceProfile.cameraWidth;
    SRC_H=deviceProfile.cameraHeight;
  }
}
