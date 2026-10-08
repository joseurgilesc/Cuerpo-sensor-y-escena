let video,bodyPose,poses=[],connections=[],playBtn,stopBtn,camBtn,pointsBtn;
let running=false,showCamera=false,showPoints=true,deviceProfile;
let SRC_W=640,SRC_H=480;

async function setup(){
  deviceProfile=setupResponsiveCanvas();
  SRC_W=deviceProfile.cameraWidth;
  SRC_H=deviceProfile.cameraHeight;
  bodyPose=await ml5.bodyPose();
  playBtn=mk('▶ Play',10,startCam);
  stopBtn=mk('■ Stop',96,stopCam,true);
  camBtn=mk('👁 Vista: OFF',182,toggleCam,true);
  pointsBtn=mk('● Esqueleto: ON',10,togglePoints,false,60);
  createControlsVisibilityButton();
}
function mk(t,x,f,d=false,y=10){
  const b=createButton(t); b.position(x,y); b.mousePressed(f);
  if(d) b.attribute('disabled','');
  return b;
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
  video.hide();
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
function toggleCam(){showCamera=!showCamera;camBtn.html(showCamera?'👁 Vista: ON':'👁 Vista: OFF');}
function togglePoints(){showPoints=!showPoints;pointsBtn.html(showPoints?'● Esqueleto: ON':'○ Esqueleto: OFF');}
// Encuadre propio del 4.10: prioriza ver más cuerpo y evita el zoom fuerte.
function fitCamera410(){
  const contain=fitContain(width,height,SRC_W,SRC_H);
  const cover=fitCover(width,height,SRC_W,SRC_H);
  const portrait=height>width;

  if(portrait && SRC_W>SRC_H){
    const s=min(cover.scale,contain.scale*1.12);
    return{
      s,
      ox:(width-SRC_W*s)/2,
      oy:(height-SRC_H*s)/2
    };
  }

  const f=portrait?cover:contain;
  return{s:f.scale,ox:f.x,oy:f.y};
}

// Coordenadas para dibujar el esqueleto exactamente sobre la cámara principal.
function mpCamera(k){
  const {s,ox,oy}=fitCamera410();
  return{x:width-(k.x*s+ox),y:k.y*s+oy};
}

// Coordenadas independientes para usar toda la pantalla como espacio interactivo.
function mpStage(k){
  return{
    x:width-(k.x/max(1,SRC_W))*width,
    y:(k.y/max(1,SRC_H))*height
  };
}

function drawCameraBackdrop(){
  if(!video)return;

  const f=fitCover(width,height,SRC_W,SRC_H);

  push();
  translate(width,0);
  scale(-1,1);
  tint(255,32);

  drawingContext.save();
  drawingContext.filter='blur(20px)';
  image(video,f.x,f.y,SRC_W*f.scale,SRC_H*f.scale);
  drawingContext.restore();

  pop();
}

function draw(){
  background(245,242,235);
  const {s,ox,oy}=fitCamera410();

  if(showCamera&&video){
    // Fondo suave para aprovechar toda la pantalla sin forzar el encuadre principal.
    drawCameraBackdrop();

    // Cámara principal con aumento limitado.
    push();
    tint(255,118);
    translate(width,0);
    scale(-1,1);
    image(video,ox,oy,SRC_W*s,SRC_H*s);
    pop();
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
