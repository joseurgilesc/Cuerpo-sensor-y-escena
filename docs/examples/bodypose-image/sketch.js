let video,bodyPose,poses=[],connections=[],playBtn,stopBtn,camBtn,pointsBtn;
let running=false,showCamera=false,showPoints=true,deviceProfile;
let SRC_W=640,SRC_H=480;
const EXAMPLE_VERSION='V7';

async function setup(){
  deviceProfile=setupResponsiveCanvas();
  SRC_W=deviceProfile.cameraWidth;
  SRC_H=deviceProfile.cameraHeight;
  bodyPose=await ml5.bodyPose();
  playBtn=mk('▶ Play',10,startCam);
  stopBtn=mk('■ Stop',96,stopCam,true);
  camBtn=mk('👁 Vista: OFF',182,toggleCam,true);
  pointsBtn=mk('● Esqueleto: ON',10,togglePoints,false,60);
  createVersionBadge();
  createControlsVisibilityButton();
}
function mk(t,x,f,d=false,y=10){
  const b=createButton(t); b.position(x,y); b.mousePressed(f);
  if(d) b.attribute('disabled','');
  return b;
}

function createVersionBadge(){
  const badge=createDiv(EXAMPLE_VERSION);
  badge.elt.dataset.persistentUi='true';
  Object.assign(badge.elt.style,{
    position:'fixed',
    left:'14px',
    bottom:'16px',
    zIndex:'10001',
    padding:'5px 9px',
    borderRadius:'8px',
    background:'rgba(11,19,43,.82)',
    color:'#fff',
    fontFamily:'system-ui,sans-serif',
    fontSize:'13px',
    fontWeight:'700',
    letterSpacing:'.04em',
    pointerEvents:'none'
  });
}
function startCam(){
  if(running) return;
  showCamera=true;
  showPoints=true;
  camBtn.html('👁 Vista: ON');
  pointsBtn.html('● Esqueleto: ON');
  
  video=createCapture(getResponsiveCameraConstraints(deviceProfile),()=>{
    const dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width; SRC_H=dims.height;
    bodyPose.detectStart(video,gotPoses); running=true;
  });
  keepVideoCaptureActive(video);
  playBtn.attribute('disabled','');
  stopBtn.removeAttribute('disabled');
  camBtn.removeAttribute('disabled');
}
function stopCam(){
  
  bodyPose.detectStop();
  if(video){video.remove();video=null;}
  poses=[]; running=false; showCamera=false;
  camBtn.html('👁 Vista: OFF');
  playBtn.removeAttribute('disabled');
  stopBtn.attribute('disabled','');
  camBtn.attribute('disabled','');
}
function toggleCam(){
  showCamera=!showCamera;
  camBtn.html(showCamera?'👁 Vista: ON':'👁 Vista: OFF');

  // Vista solo afecta el dibujo. La captura y BodyPose permanecen activos.
  if(video) keepVideoCaptureActive(video);
}
function togglePoints(){showPoints=!showPoints;pointsBtn.html(showPoints?'● Esqueleto: ON':'○ Esqueleto: OFF');}
// V7: encuadre a pantalla completa con recorte moderado.
// En móvil vertical recortamos una zona central más ancha que la proporción
// final de la pantalla. Así evitamos el zoom extremo de un cover puro.
function fitCamera410(){
  const portrait=height>width;

  if(!portrait){
    return{
      sx:0, sy:0, sw:SRC_W, sh:SRC_H,
      dx:0, dy:0, dw:width, dh:height
    };
  }

  // Mantener aprox. 72% del ancho original de una cámara horizontal 4:3.
  // Esto da una vista más abierta que un cover 9:16 convencional.
  const keepWidth=SRC_W*0.72;
  const sx=(SRC_W-keepWidth)/2;

  return{
    sx,
    sy:0,
    sw:keepWidth,
    sh:SRC_H,
    dx:0,
    dy:0,
    dw:width,
    dh:height
  };
}

// Coordenadas para dibujar el esqueleto exactamente sobre la cámara principal.
function mpCamera(k){
  const f=fitCamera410();
  const nx=(k.x-f.sx)/max(1,f.sw);
  const ny=(k.y-f.sy)/max(1,f.sh);
  return{
    x:width-nx*f.dw,
    y:ny*f.dh
  };
}

// Coordenadas independientes para usar toda la pantalla como espacio interactivo.
function mpStage(k){
  return mpCamera(k);
}

function drawFullScreenCamera(){
  if(!video)return;

  const f=fitCamera410();

  push();
  translate(width,0);
  scale(-1,1);
  tint(255,210);

  // p5 image con rectángulo de origen: recorte central moderado,
  // dibujado como una sola imagen que llena todo el canvas.
  image(
    video,
    f.dx,f.dy,f.dw,f.dh,
    f.sx,f.sy,f.sw,f.sh
  );
  pop();
}

function drawVideoHeartbeat(){
  if(!video || !video.elt || video.elt.readyState<2) return;

  // Fuerza al navegador a entregar un fotograma nuevo incluso con Vista OFF.
  // Se dibuja antes del background, por lo que nunca queda visible.
  push();
  image(video,0,0,2,2);
  pop();
}

function draw(){
  drawVideoHeartbeat();
  background(245,242,235);
  if(showCamera&&video){
    drawFullScreenCamera();
  }

  let x=width*.5;
  let y=height*.5;
  let circleSize=min(width,height)*.22;

  if(running&&poses.length){
    const pose=poses[0];

    if(showPoints){
      drawBodySkeletonOverlay(
        pose,
        connections,
        mpCamera,
        '#202020AA',
        '#202020FF'
      );
    }

    const rw=pose.keypoints.find(k=>k.name==='right_wrist');

    if(rw&&rw.confidence>.25){
      const p=mpStage(rw);
      x=p.x;
      y=p.y;

      // La altura de la mano modifica suavemente el tamaño del círculo.
      circleSize=map(
        y,
        height,
        0,
        min(width,height)*.14,
        min(width,height)*.34,
        true
      );
    }
  }

  drawInteractiveCircle(x,y,circleSize);
  hud();
}

function drawPosePoints(pose){
  noStroke(); fill(255,255,255,220);
  for(const k of pose.keypoints){
    if(k.confidence>.25){
      const p=mpCamera(k);
      circle(p.x,p.y,7);
    }
  }
}

function drawInteractiveCircle(x,y,size){
  push();

  noStroke();

  // Halo exterior sutil.
  fill(91,192,190,38);
  circle(x,y,size*1.35);

  // Círculo principal semitransparente.
  fill(91,192,190,125);
  circle(x,y,size);

  pop();
}

function hud(){
  noStroke(); fill(11,19,43,220);
  rect(12,112,min(360,width-24),62,10);
  fill(255); textSize(13);
  text('Movimiento corporal controlando un círculo',24,133);
  textSize(11);
  text('Mano derecha: posición',24,151);
  text('Altura de la mano: tamaño del círculo',24,167);
}

function gotPoses(r){poses=r;if(!connections.length)connections=bodyPose.getConnections();}
function windowResized(){deviceProfile=resizeResponsiveCanvas();if(video){const dims=configureVideoElement(video,deviceProfile);SRC_W=dims.width;SRC_H=dims.height;}else{SRC_W=deviceProfile.cameraWidth;SRC_H=deviceProfile.cameraHeight;}}
