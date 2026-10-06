let video,bodyPose,poses=[],connections=[],particles=[],playBtn,stopBtn,camBtn;
let showCamera=true,running=false;const SRC_W=640,SRC_H=480,MAX_PARTICLES=220;
async function setup(){createCanvas(windowWidth,windowHeight);bodyPose=await ml5.bodyPose();playBtn=mk('▶ Play',10,startCam);stopBtn=mk('■ Stop',96,stopCam,true);camBtn=mk('👁 Cámara',182,toggleCam,true);for(let i=0;i<80;i++)particles.push(new Particle(random(width),random(height)));}
function mk(t,x,f,d=false){const b=createButton(t);b.position(x,10);b.mousePressed(f);if(d)b.attribute('disabled','');return b;}
function startCam(){if(running)return;video=createCapture({video:{facingMode:'user'},audio:false},()=>{bodyPose.detectStart(video,gotPoses);running=true;});video.size(SRC_W,SRC_H);video.hide();playBtn.attribute('disabled','');stopBtn.removeAttribute('disabled');camBtn.removeAttribute('disabled');}
function stopCam(){bodyPose.detectStop();if(video){video.remove();video=null;}poses=[];running=false;showCamera=false;playBtn.removeAttribute('disabled');stopBtn.attribute('disabled','');camBtn.attribute('disabled','');}
function toggleCam(){showCamera=!showCamera;}
function fit(){const s=min(width/SRC_W,height/SRC_H);return{s,ox:(width-SRC_W*s)/2,oy:(height-SRC_H*s)/2};}
function mp(k){const {s,ox,oy}=fit();return{x:width-(k.x*s+ox),y:k.y*s+oy};}
function draw(){background(12);const {s,ox,oy}=fit();if(showCamera&&video){push();translate(width,0);scale(-1,1);tint(255,120);image(video,ox,oy,SRC_W*s,SRC_H*s);pop();}for(const p of particles){p.update();p.display();}drawBody();hud();}
function drawBody(){if(!running||!poses.length)return;const pose=poses[0];stroke(255);strokeWeight(2);for(const c of connections){const a=pose.keypoints[c[0]],b=pose.keypoints[c[1]];if(a.confidence>.2&&b.confidence>.2){const A=mp(a),B=mp(b);line(A.x,A.y,B.x,B.y);}}noStroke();fill(255);for(const k of pose.keypoints){if(k.confidence>.2){const p=mp(k);circle(p.x,p.y,8);}}
const rw=pose.keypoints.find(k=>k.name==='right_wrist'),lw=pose.keypoints.find(k=>k.name==='left_wrist');
if(rw&&rw.confidence>.2){const p=mp(rw);for(let i=0;i<3&&particles.length<MAX_PARTICLES;i++)particles.push(new Particle(p.x,p.y));}
if(rw&&lw&&rw.confidence>.2&&lw.confidence>.2){const R=mp(rw),L=mp(lw),d=dist(R.x,R.y,L.x,L.y),target=floor(map(d,30,min(width,height)*.8,40,MAX_PARTICLES,true));while(particles.length<target)particles.push(new Particle(random(width),random(height)));if(particles.length>target)particles.splice(0,particles.length-target);}}
class Particle{constructor(x,y){this.x=x;this.y=y;this.vx=random(-1.5,1.5);this.vy=random(-1.5,1.5);this.r=random(5,14);}update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>width)this.vx*=-1;if(this.y<0||this.y>height)this.vy*=-1;}display(){noStroke();fill(255,210);circle(this.x,this.y,this.r);}}
function hud(){noStroke();fill(0,170);rect(12,64,min(310,width-24),58,8);fill(255);textSize(13);text('BodyPose + partículas',24,84);textSize(11);text('Mano derecha: genera partículas',24,101);text('Distancia entre manos: cantidad',24,116);}
function gotPoses(r){poses=r;if(!connections.length)connections=bodyPose.getConnections();}
function windowResized(){resizeCanvas(windowWidth,windowHeight);}