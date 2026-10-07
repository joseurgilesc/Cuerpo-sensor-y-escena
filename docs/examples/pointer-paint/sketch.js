let paintLayer,clearBtn,pointerBtn,deviceProfile;
let showPointer=true,lastX=null,lastY=null,tNoise=0,currentColor;
const palette=['#E76F51','#F4A261','#E9C46A','#D97D54','#C8553D','#B85C38'];

function setup(){
  deviceProfile=setupResponsiveCanvas();
  paintLayer=createGraphics(width,height);
  paintLayer.clear();
  currentColor=random(palette);

  clearBtn=createButton('✕ Limpiar');
  clearBtn.position(10,10);
  clearBtn.mousePressed(clearPainting);

  pointerBtn=createButton('● Punto: ON');
  pointerBtn.position(108,10);
  pointerBtn.mousePressed(togglePointer);

  createControlsVisibilityButton();
}

function draw(){
  background('#F6EEE3');
  image(paintLayer,0,0);
  drawPaperGrain();
  if(showPointer&&mouseX>=0&&mouseY>=0&&mouseX<=width&&mouseY<=height)drawPointer(mouseX,mouseY);
  drawHUD();
}

function drawPaperGrain(){
  noStroke();
  for(let i=0;i<12;i++){
    const x=noise(i*.21,frameCount*.002)*width;
    const y=noise(i*.21+40,frameCount*.002)*height;
    fill(255,255,255,16);
    circle(x,y,18);
  }
}

function drawPointer(x,y){
  noFill();stroke(85,60);strokeWeight(1.5);circle(x,y,22);
  noStroke();fill(85,100);circle(x,y,5);
}

function paintStroke(x,y,px,py){
  const d=dist(x,y,px,py);
  const col=color(currentColor);
  const steps=max(1,floor(d/3));

  for(let i=0;i<=steps;i++){
    const a=i/steps,sx=lerp(px,x,a),sy=lerp(py,y,a);
    const nx=noise(tNoise+sx*.012,sy*.012);
    const ny=noise(900+tNoise+sx*.012,sy*.012);
    const ox=map(nx,0,1,-11,11),oy=map(ny,0,1,-11,11);
    const w=constrain(map(d,0,42,7,21),7,21);

    paintLayer.noStroke();
    paintLayer.fill(red(col),green(col),blue(col),72);
    paintLayer.circle(sx+ox*.38,sy+oy*.38,w);
    paintLayer.fill(red(col),green(col),blue(col),28);
    paintLayer.circle(sx-ox*.22,sy-oy*.22,w*1.65);
  }

  if(d>14)addSplashes(x,y,col,floor(map(d,14,45,2,7,true)));
  tNoise+=.012;
}

function addSplashes(x,y,col,n){
  for(let i=0;i<n;i++){
    const a=random(TWO_PI),r=random(7,27);
    paintLayer.noStroke();
    paintLayer.fill(red(col),green(col),blue(col),55);
    paintLayer.circle(x+cos(a)*r,y+sin(a)*r,random(3,10));
  }
}

function beginStroke(x,y){lastX=x;lastY=y;currentColor=random(palette);}
function continueStroke(x,y){
  if(lastX!==null&&lastY!==null)paintStroke(x,y,lastX,lastY);
  lastX=x;lastY=y;
}
function endStroke(){lastX=null;lastY=null;}

function mousePressed(){beginStroke(mouseX,mouseY);}
function mouseDragged(){continueStroke(mouseX,mouseY);return false;}
function mouseReleased(){endStroke();}
function touchStarted(){if(touches.length){beginStroke(touches[0].x,touches[0].y);}return false;}
function touchMoved(){if(touches.length)continueStroke(touches[0].x,touches[0].y);return false;}
function touchEnded(){endStroke();return false;}

function clearPainting(){paintLayer.clear();}
function togglePointer(){showPointer=!showPointer;pointerBtn.html(showPointer?'● Punto: ON':'○ Punto: OFF');}

function drawHUD(){
  noStroke();fill(45,34,28,195);rect(12,112,min(380,width-24),74,12);
  fill(255);textSize(13);text('Pintura táctil con Perlin Noise',24,133);
  textSize(11);text('Mouse o dedo: pinta | velocidad: grosor y salpicadura',24,151);
  text('El ruido Perlin da una variación orgánica al trazo',24,168);
}

function windowResized(){
  const old=paintLayer;
  deviceProfile=resizeResponsiveCanvas();
  paintLayer=createGraphics(width,height);
  paintLayer.image(old,0,0,width,height);
}
