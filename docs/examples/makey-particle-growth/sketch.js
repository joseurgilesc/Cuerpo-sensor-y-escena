let particles=[];
let hits=0,energy=0,lastHit=0;
let synth,audioReady=false;
const COLORS=['#5BC0BE','#FDE74C','#FF6B6B','#CDB4DB','#90F1EF'];

function setup(){
  setupResponsiveCanvas();
  createExampleVersionBadge('V9');
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
    synth=new Tone.MembraneSynth({
      pitchDecay:.04,octaves:3,
      envelope:{attack:.001,decay:.2,sustain:0,release:.2}
    }).toDestination();
    synth.volume.value=-16;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background(12,18,32,28);
  energy*=.992;

  const target=min(650,20+hits*18);
  while(particles.length<target){
    particles.push(new Particle());
  }
  if(particles.length>target+40)particles.splice(0,particles.length-target);

  for(const p of particles){
    p.update();
    p.show();
  }

  fill(255);
  noStroke();
  textAlign(LEFT,TOP);
  textSize(14);
  text('SPACE = contacto',14,58);
  text('toques: '+hits+'   partículas: '+particles.length+'   energía: '+nf(energy,1,2),14,78);
}

function hit(){
  const now=millis();
  const dt=now-lastHit;
  lastHit=now;

  hits=min(35,hits+1);
  energy=constrain(energy+(dt<450?.28:.14),0,1);

  for(let i=0;i<10+floor(energy*28);i++)particles.push(new Particle(true));

  if(audioReady){
    synth.pitchDecay=.03;
    synth.triggerAttackRelease(90+energy*130,'16n');
  }
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(e.code==='Space'){
      e.preventDefault();
      if(!e.repeat)hit();
    }
  },{passive:false});
}

function createClearButton(){
  const b=createButton('✕ Limpiar');
  b.position(160,10);
  b.mousePressed(()=>{
    particles=[];
    hits=0;
    energy=0;
    lastHit=0;
  });
}

class Particle{
  constructor(burst=false){
    this.x=width*.5+random(-40,40);
    this.y=height*.55+random(-20,20);
    const a=random(TWO_PI);
    const sp=(burst?random(2,7):random(.3,2))*(1+energy*1.8);
    this.vx=cos(a)*sp;
    this.vy=sin(a)*sp;
    this.r=random(3,10);
    this.c=random(COLORS);
  }
  update(){
    const mult=1+energy*1.7;
    this.x+=this.vx*mult;
    this.y+=this.vy*mult;
    this.vx+=random(-.04,.04);
    this.vy+=random(-.04,.04);

    if(this.x<-10)this.x=width+10;
    if(this.x>width+10)this.x=-10;
    if(this.y<-10)this.y=height+10;
    if(this.y>height+10)this.y=-10;
  }
  show(){
    noStroke();
    fill(this.c+'B8');
    circle(this.x,this.y,this.r*(1+energy*.5));
  }
}

function windowResized(){resizeResponsiveCanvas();}
