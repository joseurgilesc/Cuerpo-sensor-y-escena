let bubbles=[];
let synth,audioReady=false;
const COLORS=['#5BC0BE','#FDE74C','#FF6B6B','#CDB4DB','#74C0FC','#B9FBC0'];

function setup(){
  setupResponsiveCanvas();
  for(let i=0;i<16;i++)bubbles.push(new Bubble(random(width),random(height*.25,height*.8),random(18,42)));
  createExampleVersionBadge('V8');
  createAudioButton();
  createControlsVisibilityButton();
}

function createAudioButton(){
  const b=createButton('🔊 Activar sonido');
  b.position(10,10);
  b.mousePressed(async()=>{
    await Tone.start();
    synth=new Tone.Synth({
      oscillator:{type:'triangle'},
      envelope:{attack:.005,decay:.08,sustain:.03,release:.22}
    }).toDestination();
    synth.volume.value=-15;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#111A2E');

  for(const b of bubbles)b.update();
  resolveCollisions();
  for(const b of bubbles)b.show();

  fill(255);
  noStroke();
  textAlign(LEFT,TOP);
  textSize(14);
  text('← lanza burbuja desde la izquierda',14,58);
  text('→ lanza burbuja desde la derecha y empuja',14,79);
}

function launch(side){
  const x=side==='left'?20:width-20;
  const b=new Bubble(x,height*.72,random(28,46));
  b.vx=side==='left'?random(5,8):random(-8,-5);
  b.vy=random(-8,-5);
  b.mass=b.r*.12;
  bubbles.push(b);

  if(bubbles.length>45)bubbles.splice(0,bubbles.length-45);

  if(audioReady)synth.triggerAttackRelease(side==='left'?'C5':'G5','16n');
}

function keyPressed(){
  if(keyCode===LEFT_ARROW){launch('left');return false;}
  if(keyCode===RIGHT_ARROW){launch('right');return false;}
}

function resolveCollisions(){
  for(let i=0;i<bubbles.length;i++){
    for(let j=i+1;j<bubbles.length;j++){
      const a=bubbles[i],b=bubbles[j];
      const dx=b.x-a.x,dy=b.y-a.y;
      const d=sqrt(dx*dx+dy*dy);
      const minD=(a.r+b.r)*.5;

      if(d>0&&d<minD){
        const nx=dx/d,ny=dy/d;
        const overlap=minD-d;
        a.x-=nx*overlap*.5;
        a.y-=ny*overlap*.5;
        b.x+=nx*overlap*.5;
        b.y+=ny*overlap*.5;

        const push=.45;
        a.vx-=nx*push*b.mass;
        a.vy-=ny*push*b.mass;
        b.vx+=nx*push*a.mass;
        b.vy+=ny*push*a.mass;
      }
    }
  }
}

class Bubble{
  constructor(x,y,r){
    this.x=x;this.y=y;this.r=r;
    this.vx=random(-1.2,1.2);
    this.vy=random(-1.2,1.2);
    this.mass=r*.1;
    this.c=random(COLORS);
  }
  update(){
    this.vy+=.035;
    this.vx*=.995;
    this.vy*=.995;
    this.x+=this.vx;
    this.y+=this.vy;

    if(this.x<this.r/2){this.x=this.r/2;this.vx=abs(this.vx)*.9;}
    if(this.x>width-this.r/2){this.x=width-this.r/2;this.vx=-abs(this.vx)*.9;}
    if(this.y<this.r/2){this.y=this.r/2;this.vy=abs(this.vy)*.9;}
    if(this.y>height-this.r/2){this.y=height-this.r/2;this.vy=-abs(this.vy)*.85;}
  }
  show(){
    noStroke();
    fill(this.c+'55');
    circle(this.x,this.y,this.r);
    noFill();
    stroke(this.c+'CC');
    strokeWeight(2);
    circle(this.x,this.y,this.r);
    noStroke();
    fill('#FFFFFF77');
    circle(this.x-this.r*.12,this.y-this.r*.14,max(3,this.r*.13));
  }
}

function windowResized(){resizeResponsiveCanvas();}
