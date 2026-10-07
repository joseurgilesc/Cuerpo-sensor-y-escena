let video,bodyPose,poses=[],connections=[],playBtn,stopBtn,camBtn,pointsBtn,fullscreenBtn;
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
  fullscreenBtn=createFullscreenControl(150,60);
}
function mk(t,x,f,d=false,y=10){
  const b=createButton(t); b.position(x,y); b.mousePressed(f);
  if(d) b.attribute('disabled','');
  return b;
}
function startCam(){
  if(running) return;
  enterMobileSceneMode();
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
  leaveMobileSceneMode();
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
function fit(){const f=fitCameraToCanvas(width,height,SRC_W,SRC_H);return{s:f.scale,ox:f.x,oy:f.y};}
function mp(k){const {s,ox,oy}=fit();return{x:width-(k.x*s+ox),y:k.y*s+oy};}

function draw(){
  background(245,242,235);
  const {s,ox,oy}=fit();

  if(showCamera&&video){
    push(); tint(255,75); translate(width,0); scale(-1,1);
    image(video,ox,oy,SRC_W*s,SRC_H*s); pop();
  }

  let x=width*.5,y=height*.5,scaleFactor=1,angle=0;
  if(running&&poses.length){
    const pose=poses[0];
    if(showPoints) drawBodySkeletonOverlay(pose,connections,mp,'#202020AA','#202020FF');
    const rw=pose.keypoints.find(k=>k.name==='right_wrist');
    const rs=pose.keypoints.find(k=>k.name==='right_shoulder');

    if(rw&&rw.confidence>.25){
      const p=mp(rw);
      x=p.x; y=p.y;
      scaleFactor=map(y,height,0,.65,1.35,true);

      if(rs&&rs.confidence>.25){
        const q=mp(rs);
        angle=atan2(y-q.y,x-q.x)*.25;
      }
    }
  }

  drawPoster(x,y,scaleFactor,angle);
  hud();
}

function drawPosePoints(pose){
  noStroke(); fill(255,255,255,220);
  for(const k of pose.keypoints){if(k.confidence>.25){const p=mp(k);circle(p.x,p.y,7);}}
}

function drawPoster(x,y,s,a){
  push();
  translate(x,y); rotate(a); scale(s);
  rectMode(CENTER); noStroke();

  fill('#0B132B'); rect(0,0,220,150,18);
  fill('#5BC0BE'); circle(-62,-28,54);
  fill('#FDE74C'); rect(38,-22,70,28,8);
  fill('#FF6B6B'); triangle(-28,52,22,10,68,58);
  fill('#FFFFFF'); rect(-8,42,54,16,8);

  fill('#0B132B'); textAlign(CENTER,CENTER); textSize(12);
  text('CUERPO / IMAGEN',35,-22);
  pop();
}

function hud(){if(isMobileSceneModeActive())return;
  noStroke(); fill(11,19,43,220);
  rect(12,112,min(360,width-24),62,10);
  fill(255); textSize(13);
  text('Movimiento corporal controlando una imagen',24,133);
  textSize(11);
  text('Mano derecha: posición | altura: escala',24,151);
  text('Brazo: ligera rotación del cartel',24,167);
}

function gotPoses(r){poses=r;if(!connections.length)connections=bodyPose.getConnections();}
function windowResized(){deviceProfile=resizeResponsiveCanvas();if(video){const dims=configureVideoElement(video,deviceProfile);SRC_W=dims.width;SRC_H=dims.height;}else{SRC_W=deviceProfile.cameraWidth;SRC_H=deviceProfile.cameraHeight;}}
