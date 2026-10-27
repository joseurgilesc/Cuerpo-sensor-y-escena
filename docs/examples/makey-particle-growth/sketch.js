let particles=[];
let hits=0,energy=0,lastHit=0,audioPulse=0;
let synth,reverb,filter,audioReady=false;
const COLORS=['#00F5D4','#00BBF9','#9B5DE5','#F15BB5','#FEE440','#FF7A00'];
const SCALE=['C4','D4','E4','G4','A4','C5','D5'];

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

    reverb=new Tone.Reverb({decay:3.8,wet:.38}).toDestination();
    filter=new Tone.Filter({frequency:1800,type:'lowpass',rolloff:-12}).connect(reverb);

    synth=new Tone.PolySynth(Tone.Synth,{
      oscillator:{type:'triangle8'},
      envelope:{attack:.015,decay:.28,sustain:.16,release:1.1}
    }).connect(filter);

    synth.volume.value=-7;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background(10,16,30,30);
  energy*=.994;
  audioPulse*=.91;

  const target=min(900,24+hits*22);
  while(particles.length<target)particles.push(new Particle());
  if(particles.length>target+80)particles.splice(0,particles.length-target);

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

  hits=min(40,hits+1);
  energy=constrain(energy+(dt<420?.24:.12),0,1);
  audioPulse=1;

  for(let i=0;i<18+floor(energy*42);i++)particles.push(new Particle(true));

  if(audioReady){
    const idx=hits%SCALE.length;
    const root=SCALE[idx];
    const chord=[root,Tone.Frequency(root).transpose(7).toNote()];
    filter.frequency.rampTo(900+energy*4200,.08);
    synth.triggerAttackRelease(chord,'8n');
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
    audioPulse=0;
    lastHit=0;
  });
}

class Particle{
  constructor(burst=false){
    this.x=width*.5+random(-55,55);
    this.y=height*.55+random(-40,40);
    const a=random(TWO_PI);
    const sp=(burst?random(2.5,8):random(.25,1.6))*(1+energy*1.4);
    this.vx=cos(a)*sp;
    this.vy=sin(a)*sp;
    this.r=random(3,11);
    this.c=random(COLORS);
    this.phase=random(TWO_PI);
  }
  update(){
    const mult=1+energy*1.9;
    this.x+=this.vx*mult;
    this.y+=this.vy*mult;
    this.vx+=sin(frameCount*.02+this.phase)*.012;
    this.vy+=cos(frameCount*.018+this.phase)*.012;

    if(this.x<-14)this.x=width+14;
    if(this.x>width+14)this.x=-14;
    if(this.y<-14)this.y=height+14;
    if(this.y>height+14)this.y=-14;
  }
  show(){
    const soundScale=1+audioPulse*1.8;
    const energyScale=1+energy*.55;
    noStroke();
    fill(this.c+'C8');
    circle(this.x,this.y,this.r*soundScale*energyScale);
  }
}

function windowResized(){resizeResponsiveCanvas();}
