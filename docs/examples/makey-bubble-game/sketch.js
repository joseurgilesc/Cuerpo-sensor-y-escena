let bubbles=[];
let synth,reverb,audioReady=false;
let lastPress={left:0,right:0};
const COLORS=['#00E5FF','#FFEA00','#FF4D8D','#A66CFF','#58D68D','#FF8C42'];

function setup(){
  setupResponsiveCanvas();
  for(let i=0;i<16;i++)bubbles.push(new Bubble(random(width),random(height*.25,height*.8),random(22,48),0));
  createExampleVersionBadge('V10');
  createAudioButton();
  createClearButton();
  installKeyboard();
  createControlsVisibilityButton();
}

function createAudioButton(){
  const b=createButton('🔊 Activar sonido');
  b.position(10,10);
  b.mousePressed(async()=>{
    await Tone.start();
    reverb=new Tone.Reverb({decay:3.2,wet:.34}).toDestination();
    synth=new Tone.Synth({
      oscillator:{type:'triangle8'},
      envelope:{attack:.005,decay:.12,sustain:.04,release:.55}
    }).connect(reverb);
    synth.volume.value=-7;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#0D1530');

  for(const b of bubbles)b.update();
  resolveCollisions();
  for(const b of bubbles)b.show();

  fill(255);
  noStroke();
  textAlign(LEFT,TOP);
  textSize(14);
  text('← / →: pulsa más rápido = burbuja más grande y potente',14,58);
  text('las burbujas cambian de forma con el tiempo',14,79);
}

function launch(side){
  const now=millis();
  const dt=max(70,now-lastPress[side]);
  lastPress[side]=now;

  const speedFactor=constrain(map(dt,900,90,.2,1),.2,1);
  const r=lerp(30,105,speedFactor);
  const impulse=lerp(4.8,11.5,speedFactor);

  const x=side==='left'?r*.45:width-r*.45;
  const b=new Bubble(x,height*.72,r,speedFactor);
  b.vx=side==='left'?impulse:-impulse;
  b.vy=-lerp(4.5,9.5,speedFactor);
  b.mass=b.r*.14;
  bubbles.push(b);

  if(bubbles.length>48)bubbles.splice(0,bubbles.length-48);

  if(audioReady){
    const freq=lerp(300,850,speedFactor);
    synth.triggerAttackRelease(freq,'16n');
  }
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;
    if(e.code==='ArrowLeft')launch('left');
    if(e.code==='ArrowRight')launch('right');
  },{passive:false});
}

function createClearButton(){
  const b=createButton('✕ Limpiar');
  b.position(160,10);
  b.mousePressed(()=>{
    bubbles=[];
    lastPress={left:0,right:0};
    for(let i=0;i<16;i++)bubbles.push(new Bubble(random(width),random(height*.25,height*.8),random(22,48),0));
  });
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

        const push=.26;
        a.vx-=nx*push*b.mass;
        a.vy-=ny*push*b.mass;
        b.vx+=nx*push*a.mass;
        b.vy+=ny*push*a.mass;
      }
    }
  }
}

class Bubble{
  constructor(x,y,r,energy){
    this.x=x;this.y=y;this.r=r;
    this.vx=random(-1.2,1.2);
    this.vy=random(-1.2,1.2);
    this.mass=r*.1;
    this.c=random(COLORS);
    this.birth=millis();
    this.phase=random(TWO_PI);
    this.energy=energy;
  }

  update(){
    this.vy+=.032;
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
    const age=(millis()-this.birth)/1000;
    const mode=floor(age/5)%4;

    push();
    translate(this.x,this.y);
    rotate(this.phase+age*.08);

    fill(this.c+'66');
    stroke(this.c+'EE');
    strokeWeight(2);

    if(mode===0){
      circle(0,0,this.r);
    }else if(mode===1){
      beginShape();
      for(let a=0;a<TWO_PI;a+=TWO_PI/18){
        const rr=this.r*.5*(1+.16*sin(a*3+age*2+this.phase));
        vertex(cos(a)*rr,sin(a)*rr);
      }
      endShape(CLOSE);
    }else if(mode===2){
      beginShape();
      for(let a=0;a<TWO_PI;a+=TWO_PI/14){
        const rr=this.r*.5*(1+.22*sin(a*5+age*1.7));
        vertex(cos(a)*rr,sin(a)*rr);
      }
      endShape(CLOSE);
    }else{
      ellipse(0,0,this.r*(1+.18*sin(age*2)),this.r*(1-.12*sin(age*2)));
    }

    noStroke();
    fill('#FFFFFF88');
    circle(-this.r*.12,-this.r*.14,max(4,this.r*.11));
    pop();
  }
}

function windowResized(){resizeResponsiveCanvas();}
