let video,bodyPose,poses=[],connections=[],playBtn,stopBtn,camBtn,pointsBtn,fullscreenBtn,clearBtn;
let running=false,showCamera=false,showPoints=true,paintLayer,deviceProfile;
let SRC_W=640,SRC_H=480;
const palette={
  left_wrist:'#FF6B6B',
  right_wrist:'#4ECDC4',
  left_ankle:'#FFD166',
  right_ankle:'#5C6AC4'
};
let previous={};

async function setup(){
  deviceProfile=setupResponsiveCanvas();
  SRC_W=deviceProfile.cameraWidth;
  SRC_H=deviceProfile.cameraHeight;
  paintLayer=createGraphics(windowWidth,windowHeight);
  paintLayer.clear();

  bodyPose=await ml5.bodyPose();

  playBtn=mk('▶ Play',10,startCam);
  stopBtn=mk('■ Stop',96,stopCam,true);
  camBtn=mk('👁 Vista: OFF',182,toggleCam,true);
  pointsBtn=mk('● Esqueleto: ON',10,togglePoints,false,60);
  clearBtn=mk('✕ Limpiar',132,clearPainting,false,60);
  fullscreenBtn=createFullscreenControl(10,110);
}

function mk(t,x,f,d=false,y=10){
  const b=createButton(t); b.position(x,y); b.mousePressed(f);
  if(d) b.attribute('disabled','');
  return b;
}

function startCam(){
  if(running) return;
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
  poses=[]; previous={}; running=false; showCamera=false;
  camBtn.html('👁 Vista: OFF');

  playBtn.removeAttribute('disabled');
  stopBtn.attribute('disabled','');
  camBtn.attribute('disabled','');
}

function toggleCam(){showCamera=!showCamera;camBtn.html(showCamera?'👁 Vista: ON':'👁 Vista: OFF');}
function togglePoints(){showPoints=!showPoints;pointsBtn.html(showPoints?'● Esqueleto: ON':'○ Esqueleto: OFF');}
function clearPainting(){paintLayer.clear();previous={};}

function fit(){
  const f=fitCameraToCanvas(width,height,SRC_W,SRC_H);
  return{s:f.scale,ox:f.x,oy:f.y};
}
function mp(k){
  const {s,ox,oy}=fit();
  return{x:width-(k.x*s+ox),y:k.y*s+oy};
}

function draw(){
  background('#F5F0E8');

  const {s,ox,oy}=fit();
  if(showCamera&&video){
    push(); tint(255,55); translate(width,0); scale(-1,1);
    image(video,ox,oy,SRC_W*s,SRC_H*s); pop();
  }

  if(running&&poses.length) paintPose(poses[0]);

  image(paintLayer,0,0);
  if(showPoints&&running&&poses.length) drawBodySkeletonOverlay(poses[0],connections,mp,'#202020AA','#202020FF');
  drawBrushMarkers();
  hud();
}

function paintPose(pose){
  for(const name of Object.keys(palette)){
    const k=pose.keypoints.find(p=>p.name===name);

    if(!k||k.confidence<=.25){
      delete previous[name];
      continue;
    }

    const p=mp(k);
    const prev=previous[name];

    if(prev){
      const speed=dist(prev.x,prev.y,p.x,p.y);
      const weight=constrain(map(speed,0,40,18,6),6,18);

      paintLayer.stroke(palette[name]);
      paintLayer.strokeWeight(weight);
      paintLayer.strokeCap(ROUND);
      paintLayer.line(prev.x,prev.y,p.x,p.y);

      if(speed>18){
        paintLayer.noStroke();
        paintLayer.fill(palette[name]+'88');
        for(let i=0;i<3;i++){
          paintLayer.circle(
            p.x+random(-14,14),
            p.y+random(-14,14),
            random(4,12)
          );
        }
      }
    }

    previous[name]=p;
  }
}

function drawPosePoints(pose){
  noStroke();fill(25,25,30,190);
  for(const k of pose.keypoints){if(k.confidence>.25){const p=mp(k);circle(p.x,p.y,7);}}
}

function drawBrushMarkers(){
  for(const name of Object.keys(previous)){
    const p=previous[name];
    noFill();
    stroke(palette[name]);
    strokeWeight(2);
    circle(p.x,p.y,name.includes('ankle')?24:30);
  }
}

function hud(){
  noStroke();
  fill(18,22,31,220);
  rect(12,112,min(395,width-24),92,12);

  fill(255);
  textSize(13);
  text('BodyPose — pintura corporal',24,133);

  textSize(11);
  text('Mano izquierda: coral  |  Mano derecha: turquesa',24,152);
  text('Pie izquierdo: amarillo  |  Pie derecho: índigo',24,169);
  text('Muévete para dibujar; los gestos rápidos salpican',24,187);
}

function gotPoses(r){poses=r;if(!connections.length)connections=bodyPose.getConnections();}

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
  const old=paintLayer;
  paintLayer=createGraphics(windowWidth,windowHeight);
  paintLayer.image(old,0,0,windowWidth,windowHeight);
  previous={};
}
