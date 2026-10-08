let video,bodyPose,poses=[],connections=[],playBtn,stopBtn,camBtn,pointsBtn;
let running=false,showCamera=false,showPoints=true,deviceProfile;
let SRC_W=640,SRC_H=480;
const EXAMPLE_VERSION='V8';

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
// V8: pedimos una relación de cámara estándar de retrato (9:16), que es
// mucho más habitual en teléfonos que intentar forzar exactamente la relación
// de toda la ventana del navegador.
function getCameraConstraints410(){
  return{
    video:{
      facingMode:{ideal:'user'},
      width:{ideal:720},
      height:{ideal:1280},
      aspectRatio:{ideal:9/16}
    },
    audio:false
  };
}

// Si el navegador expone control de zoom, usamos el mínimo disponible para
// conseguir el campo de visión más abierto posible, parecido a la app Cámara.
async function setMinimumCameraZoom(){
  try{
    const stream=video&&video.elt&&video.elt.srcObject;
    const track=stream&&stream.getVideoTracks?stream.getVideoTracks()[0]:null;
    if(!track||!track.getCapabilities)return;

    const caps=track.getCapabilities();
    if(!caps||!caps.zoom)return;

    const minZoom=Number(caps.zoom.min);
    if(!Number.isFinite(minZoom))return;

    await track.applyConstraints({advanced:[{zoom:minZoom}]});
  }catch(err){
    // El control de zoom no está disponible en todos los teléfonos/navegadores.
  }
}

function startCam(){
  if(running) return;
  showCamera=true;
  showPoints=true;
  camBtn.html('👁 Vista: ON');
  pointsBtn.html('● Esqueleto: ON');
  
  video=createCapture(getCameraConstraints410(),async ()=>{
    const dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width; SRC_H=dims.height;

    await setMinimumCameraZoom();

    // Volvemos a leer las dimensiones por si el navegador ajustó el stream.
    const refreshed=configureVideoElement(video,deviceProfile);
    SRC_W=refreshed.width; SRC_H=refreshed.height;

    bodyPose.detectStart(video,gotPoses);
    running=true;
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
// V8: pantalla completa SIN deformar la imagen.
// El rectángulo recortado del video tiene exactamente la misma proporción que
// el canvas. Por eso al dibujarlo a pantalla completa la cara mantiene su
// relación ancho/alto natural.
function fitCamera410(){
  const canvasAspect=width/max(1,height);
  const sourceAspect=SRC_W/max(1,SRC_H);

  let sx=0;
  let sy=0;
  let sw=SRC_W;
  let sh=SRC_H;

  if(sourceAspect>canvasAspect){
    // La cámara es más ancha que la pantalla: recortamos solo los laterales.
    sw=SRC_H*canvasAspect;
    sx=(SRC_W-sw)/2;
  }else if(sourceAspect<canvasAspect){
    // La cámara es más alta que la pantalla: recortamos arriba y abajo.
    sh=SRC_W/canvasAspect;
    sy=(SRC_H-sh)/2;
  }

  return{
    sx,sy,sw,sh,
    dx:0,dy:0,dw:width,dh:height
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

  // El recorte fuente y el canvas tienen la misma relación de aspecto:
  // ocupa toda la pantalla sin estirar ni achatar la imagen.
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
