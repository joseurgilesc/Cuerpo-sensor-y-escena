let video=null;
let cameraActive=false;
let deviceProfile;
let SRC_W=640,SRC_H=480;
let synth,reverb,delay,audioReady=false;
let zoomPulse=0,zoomTarget=0;
let lastHit=0;
const INPUTS=[
  {code:'ArrowLeft',note:'C4',label:'←'},
  {code:'Space',note:'E4',label:'SPACE'},
  {code:'ArrowRight',note:'G4',label:'→'}
];
const FIB=[1,1,2,3,5,8,13,8,5,3,2,1];

function setup(){
  deviceProfile=setupResponsiveCanvas();
  createExampleVersionBadge('V8');
  createAudioButton();
  createStopButton();
  installKeyboard();
  createControlsVisibilityButton();
}

function createAudioButton(){
  const b=createButton('🔊 Activar sonido');
  b.position(10,10);
  b.mousePressed(async()=>{
    await Tone.start();
    reverb=new Tone.Reverb({decay:3.4,wet:.32}).toDestination();
    delay=new Tone.FeedbackDelay({delayTime:'8n',feedback:.24,wet:.22}).connect(reverb);
    synth=new Tone.PolySynth(Tone.Synth,{
      oscillator:{type:'triangle8'},
      envelope:{attack:.01,decay:.18,sustain:.08,release:.7}
    }).connect(delay);
    synth.volume.value=-7;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function createStopButton(){
  const b=createButton('■ Cámara OFF');
  b.position(160,10);
  b.mousePressed(stopCamera);
}

async function ensureCamera(){
  if(cameraActive)return;
  video=createCapture(getNaturalCameraConstraints(deviceProfile),async()=>{
    let dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;
    await setMinimumCameraZoom(video);
    dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;
    cameraActive=true;
  });
  keepVideoCaptureActive(video);
}

function stopCamera(){
  if(video){
    try{
      const stream=video.elt&&video.elt.srcObject;
      if(stream&&stream.getTracks)stream.getTracks().forEach(t=>t.stop());
    }catch(err){}
    video.remove();
    video=null;
  }
  cameraActive=false;
  zoomPulse=0;
  zoomTarget=0;
}

function trigger(index){
  ensureCamera();

  const now=millis();
  const dt=max(80,now-lastHit);
  lastHit=now;

  const speed=constrain(map(dt,900,90,.2,1),.2,1);
  zoomTarget=max(zoomTarget,.08+.22*speed);

  if(audioReady){
    const input=INPUTS[index];
    synth.triggerAttackRelease([input.note,Tone.Frequency(input.note).transpose(7).toNote()],'8n');
  }
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;
    const index=INPUTS.findIndex(i=>i.code===e.code);
    if(index>=0)trigger(index);
  },{passive:false});
}

function fitZoomedCamera(){
  const base=fitCameraCoverCrop(width,height,SRC_W,SRC_H);
  const z=1+zoomPulse;
  const sw=base.sw/z;
  const sh=base.sh/z;
  const sx=base.sx+(base.sw-sw)/2;
  const sy=base.sy+(base.sh-sh)/2;
  return{sx,sy,sw,sh,dx:0,dy:0,dw:width,dh:height};
}

function draw(){
  pumpHiddenVideoFrame(video);
  background('#050505');

  zoomPulse=lerp(zoomPulse,zoomTarget,.16);
  zoomTarget*=.91;

  if(cameraActive&&video){
    const f=fitZoomedCamera();

    push();
    translate(width,0);
    scale(-1,1);
    image(video,f.dx,f.dy,f.dw,f.dh,f.sx,f.sy,f.sw,f.sh);
    pop();

    drawFibonacciBars();
  }else{
    fill(255);
    noStroke();
    textAlign(CENTER,CENTER);
    textSize(18);
    text('Toca ←, SPACE o → para activar la cámara',width/2,height/2);
    textSize(12);
    text('El primer contacto solicita permiso de cámara',width/2,height/2+28);
  }

  fill(255);
  noStroke();
  textAlign(CENTER,TOP);
  textSize(12);
  text('←   SPACE   →   ·   contacto = sonido + zoom',width/2,58);
}

function drawFibonacciBars(){
  const total=FIB.reduce((a,b)=>a+b,0);
  const unit=width/total;
  let x=0;

  noStroke();
  for(let i=0;i<FIB.length;i++){
    const w=FIB[i]*unit;
    const wobble=1+.08*sin(frameCount*.02+i*.7);
    fill(0,235);
    rect(x,0,w*wobble,height);
    x+=w;
  }
}

function windowResized(){
  deviceProfile=resizeResponsiveCanvas();
  if(video){
    const dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;
  }
}
