let sparks=[];
let embers=[];
let synth,reverb,noiseSynth,filter,audioReady=false;
const SOURCES=[
  {code:'ArrowLeft',x:.18,color:'#FF5A1F',note:'C3',label:'← izquierda'},
  {code:'Space',x:.50,color:'#FFB000',note:'E3',label:'SPACE centro'},
  {code:'ArrowRight',x:.82,color:'#FF2E63',note:'G3',label:'→ derecha'}
];

function setup(){
  setupResponsiveCanvas();
  createExampleVersionBadge('V8');
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

    reverb=new Tone.Reverb({decay:2.8,wet:.28}).toDestination();
    filter=new Tone.Filter({frequency:1800,type:'lowpass',rolloff:-12}).connect(reverb);

    synth=new Tone.MembraneSynth({
      pitchDecay:.035,octaves:2.5,
      envelope:{attack:.001,decay:.18,sustain:0,release:.18}
    }).connect(filter);
    synth.volume.value=-6;

    noiseSynth=new Tone.NoiseSynth({
      noise:{type:'brown'},
      envelope:{attack:.005,decay:.16,sustain:0,release:.1}
    }).connect(filter);
    noiseSynth.volume.value=-13;

    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#120705');

  for(const s of SOURCES){
    noStroke();
    fill(colorWithAlpha(s.color,52));
    ellipse(width*s.x,height*.94,130,32);
  }

  for(let i=sparks.length-1;i>=0;i--){
    const p=sparks[i];
    p.vx+=sin(frameCount*.035+p.phase)*.018;
    p.vy-=p.lift;
    p.x+=p.vx;
    p.y+=p.vy;
    p.life-=p.decay;
    p.r*=.996;

    const heat=constrain(map(p.life,0,100,0,1),0,1);
    const c=lerpColor(color('#6A0D00'),color(p.color),heat);

    noStroke();
    c.setAlpha(constrain(p.life*2.45,0,255));
    fill(c);
    ellipse(p.x,p.y,p.r*(1+.25*sin(frameCount*.05+p.phase)),p.r*1.6);

    if(p.life<=0||p.y<-40)sparks.splice(i,1);
  }

  for(let i=embers.length-1;i>=0;i--){
    const e=embers[i];
    e.x+=e.vx;
    e.y+=e.vy;
    e.life-=2.2;
    noStroke();
    fill(colorWithAlpha('#FFD166',e.life*2.5));
    circle(e.x,e.y,e.r);
    if(e.life<=0||e.y<0)embers.splice(i,1);
  }

  fill(255);
  noStroke();
  textAlign(CENTER,TOP);
  textSize(12);
  text(SOURCES.map(s=>s.label).join('   |   '),width/2,58);
}

function colorWithAlpha(hexColor,alpha){
  const c=color(hexColor);
  c.setAlpha(constrain(alpha,0,255));
  return c;
}

function flame(index){
  const s=SOURCES[index];

  for(let i=0;i<145;i++){
    sparks.push({
      x:width*s.x+random(-30,30),
      y:height*.92+random(-8,10),
      vx:random(-1.6,1.6),
      vy:random(-5.6,-2.2),
      lift:random(.018,.055),
      r:random(5,16),
      life:random(72,108),
      decay:random(.75,1.25),
      phase:random(TWO_PI),
      color:s.color
    });
  }

  for(let i=0;i<24;i++){
    embers.push({
      x:width*s.x+random(-28,28),
      y:height*.91,
      vx:random(-1.2,1.2),
      vy:random(-4.5,-1.4),
      r:random(2,5),
      life:random(45,85)
    });
  }

  if(sparks.length>2200)sparks.splice(0,sparks.length-2200);

  if(audioReady){
    filter.frequency.rampTo(1300+index*700,.08);
    synth.triggerAttackRelease(s.note,'8n');
    noiseSynth.triggerAttackRelease('16n');
  }
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;

    const index=SOURCES.findIndex(s=>s.code===e.code);
    if(index>=0)flame(index);
  },{passive:false});
}

function createClearButton(){
  const b=createButton('✕ Limpiar');
  b.position(160,10);
  b.mousePressed(()=>{sparks=[];embers=[];});
}

function windowResized(){resizeResponsiveCanvas();}
