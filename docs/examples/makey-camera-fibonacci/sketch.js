let video=null;
let cameraActive=false;
let cameraStarting=false;
let spaceHeld=false;
let barLight=0;
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
  createExampleVersionBadge('V11');
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
  const b=createButton('■ Apagar cámara');
  b.position(160,10);
  b.mousePressed(stopCamera);
}

function ensureCamera(){
  if(cameraActive || cameraStarting)return;
  cameraStarting=true;
  try{
    video=createCapture(getNaturalCameraConstraints(deviceProfile),async()=>{
      try{
        let dims=configureVideoElement(video,deviceProfile);
        SRC_W=dims.width;
        SRC_H=dims.height;
        await setMinimumCameraZoom(video);
        dims=configureVideoElement(video,deviceProfile);
        SRC_W=dims.width;
        SRC_H=dims.height;
        cameraActive=true;
      }catch(err){
        console.error('Error al configurar la cámara:',err);
      }finally{
        cameraStarting=false;
      }
    });
    keepVideoCaptureActive(video);
  }catch(err){
    cameraStarting=false;
    console.error('No se pudo abrir la cámara:',err);
  }
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
  cameraStarting=false;
  zoomPulse=0;
  zoomTarget=0;
}

function trigger(index){
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

    if(e.code==='Space'){
      spaceHeld=true;
      ensureCamera();
      trigger(1);
    }else if(spaceHeld){
      const index=INPUTS.findIndex(i=>i.code===e.code);
      if(index>=0)trigger(index);
    }
  },{passive:false});

  window.addEventListener('keyup',e=>{
    if(e.code==='Space'){
      e.preventDefault();
      spaceHeld=false;
    }
  },{passive:false});

  window.addEventListener('blur',()=>{spaceHeld=false;});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)spaceHeld=false;
  });
}

function fitZoomedCamera(){
  const base=fitCameraCoverCrop(width,height,SRC_W,SRC_H);
  const organicZoom=map(noise(millis()*.00032),0,1,.004,.045);
  const z=1+zoomPulse+organicZoom;
  const sw=base.sw/z;
  const sh=base.sh/z;
  const sx=base.sx+(base.sw-sw)/2;
  const sy=base.sy+(base.sh-sh)/2;
  return {sx,sy,sw,sh,dx:0,dy:0,dw:width,dh:height};
}

function draw(){
  background(0);
  // La cámara sigue capturando para evitar demoras, pero nunca se dibuja sin SPACE.
  barLight=lerp(barLight,spaceHeld?255:0,.14);
  zoomPulse=lerp(zoomPulse,zoomTarget,.16);
  zoomTarget*=.91;

  if(!spaceHeld)return; // Sin SPACE: pantalla completamente negra, sin rejas ni HUD.

  if(cameraActive && video && video.elt.readyState>=2){
    const f=fitZoomedCamera();
    push();
    translate(width,0);
    scale(-1,1);
    image(video,f.dx,f.dy,f.dw,f.dh,f.sx,f.sy,f.sw,f.sh);
    pop();
  }else{
    noStroke();
    fill(230);
    textAlign(CENTER,CENTER);
    textSize(16);
    text('Activando cámara… permite el acceso si se solicita.',width/2,height/2);
  }

  drawFibonacciBars();

  noStroke();
  fill(255);
  textAlign(CENTER,TOP);
  textSize(12);
  text('Mantén SPACE para ver la cámara · ← y → generan pulsos',width/2,58);
}

function drawFibonacciBars(){
  const total=FIB.reduce((a,b)=>a+b,0);
  const cycleW=width*1.14;
  const unit=cycleW/total;
  const globalDrift=
    sin(frameCount*.008)*width*.022+
    (noise(frameCount*.0022)-.5)*width*.035;
  let x=-width*.07+globalDrift;

  noStroke();
  for(let i=0;i<FIB.length;i++){
    const cellW=FIB[i]*unit;
    const breathe=.50+.09*sin(frameCount*.014+i*.63);
    const localDrift=sin(frameCount*.011+i*1.17)*min(18,cellW*.18);
    const barW=max(2,cellW*breathe);
    const barX=x+(cellW-barW)/2+localDrift;

    // Las rejas pasan suavemente de negro a blanco mientras SPACE esté presionado.
    fill(barLight,barLight,barLight,235);
    rect(barX,-8,barW,height+16);
    x+=cellW;
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
