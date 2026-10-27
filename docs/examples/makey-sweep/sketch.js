let sweeps=[];
let particles=[];
let synth,reverb,delay,audioReady=false;
const COLORS=['#00BBF9','#9B5DE5','#F15BB5','#FEE440','#00F5D4'];

function setup(){
  setupResponsiveCanvas();
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

    reverb=new Tone.Reverb({decay:3.4,wet:.34}).toDestination();
    delay=new Tone.FeedbackDelay({delayTime:'8n.',feedback:.28,wet:.24}).connect(reverb);

    synth=new Tone.FMSynth({
      harmonicity:1.7,
      modulationIndex:5,
      oscillator:{type:'sine'},
      modulation:{type:'triangle'},
      envelope:{attack:.03,decay:.35,sustain:.18,release:1.2},
      modulationEnvelope:{attack:.02,decay:.3,sustain:.12,release:.8}
    }).connect(delay);

    synth.volume.value=-7;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#07111A');

  const cols=max(28,floor(width/16));
  const cw=width/cols;

  for(let i=0;i<cols;i++){
    const n=noise(i*.15,frameCount*.012);
    const base=map(n,0,1,height*.18,height*.52);

    noStroke();
    fill(255,235);
    rect(i*cw,height-base,cw-2,base,2);
  }

  for(let s of sweeps){
    s.x+=s.dir*s.speed;
    s.life-=1.65;

    for(let i=0;i<cols;i++){
      const cx=i*cw+cw/2;
      const d=abs(cx-s.x);
      if(d<width*.20){
        const amp=1-d/(width*.20);
        const n=noise(i*.20,s.seed+frameCount*.018);
        const h=map(n,0,1,height*.24,height*.86)*amp;
        const a=90+165*amp;

        noStroke();
        fill(colorWithAlpha(s.color,a));
        rect(i*cw,height-h,cw-2,h,2);

        if(random()<.06*amp){
          particles.push(new SweepParticle(cx,height-h,s.dir,s.color));
        }
      }
    }
  }

  for(let i=particles.length-1;i>=0;i--){
    particles[i].update();
    particles[i].show();
    if(particles[i].life<=0)particles.splice(i,1);
  }

  sweeps=sweeps.filter(s=>s.life>0&&s.x>-width*.25&&s.x<width*1.25);

  fill(255);
  textAlign(LEFT,TOP);
  textSize(14);
  text('← izquierda → derecha   |   → derecha → izquierda',14,58);
}

function colorWithAlpha(hexColor,alpha){
  const c=color(hexColor);
  c.setAlpha(alpha);
  return c;
}

function launchSweep(dir){
  const c=random(COLORS);
  sweeps.push({
    x:dir>0?-width*.12:width*1.12,
    dir,
    speed:max(6,width/95),
    life:120,
    seed:random(1000),
    color:c
  });

  if(audioReady){
    synth.triggerAttackRelease(dir>0?'C4':'G4','4n');
    setTimeout(()=>synth.triggerAttackRelease(dir>0?'G4':'C5','8n'),110);
  }
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;
    if(e.code==='ArrowLeft')launchSweep(1);
    if(e.code==='ArrowRight')launchSweep(-1);
  },{passive:false});
}

function createClearButton(){
  const b=createButton('✕ Limpiar');
  b.position(160,10);
  b.mousePressed(()=>{sweeps=[];particles=[];});
}

class SweepParticle{
  constructor(x,y,dir,c){
    this.x=x;this.y=y;
    this.vx=random(.4,2.4)*dir;
    this.vy=random(-1.8,1.8);
    this.r=random(2,6);
    this.life=100;
    this.c=c;
  }
  update(){
    this.x+=this.vx;
    this.y+=this.vy;
    this.vx*=.985;
    this.vy*=.985;
    this.life-=2.5;
  }
  show(){
    noStroke();
    fill(colorWithAlpha(this.c,this.life*2.2));
    circle(this.x,this.y,this.r);
  }
}

function windowResized(){resizeResponsiveCanvas();}
