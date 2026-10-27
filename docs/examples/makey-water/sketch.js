let drops=[];
let ripples=[];
let synth,reverb,delay,grainSynth,grainFilter,audioReady=false;
let waterPhase=0;
const SOURCES=[
  {code:'ArrowLeft',x:.18,color:'#00A8FF',notes:['C5','G5'],label:'← izquierda'},
  {code:'Space',x:.50,color:'#00F5D4',notes:['E5','B5'],label:'SPACE centro'},
  {code:'ArrowRight',x:.82,color:'#7A5CFF',notes:['G5','D6'],label:'→ derecha'}
];

function setup(){
  setupResponsiveCanvas();
  createExampleVersionBadge('V11');
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

    reverb=new Tone.Reverb({decay:5.2,wet:.48}).toDestination();
    delay=new Tone.FeedbackDelay({delayTime:'16n',feedback:.22,wet:.22}).connect(reverb);

    synth=new Tone.PolySynth(Tone.FMSynth,{
      harmonicity:2.2,
      modulationIndex:4,
      oscillator:{type:'sine'},
      modulation:{type:'sine'},
      envelope:{attack:.005,decay:.22,sustain:.05,release:1.1},
      modulationEnvelope:{attack:.005,decay:.18,sustain:.03,release:.7}
    }).connect(delay);
    synth.volume.value=-5;

    grainFilter=new Tone.Filter({frequency:2600,type:'bandpass',Q:1.4}).connect(reverb);
    grainSynth=new Tone.PolySynth(Tone.Synth,{
      oscillator:{type:'sine'},
      envelope:{attack:.001,decay:.035,sustain:0,release:.025}
    }).connect(grainFilter);
    grainSynth.volume.value=-10;

    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#03131E');
  waterPhase+=.006;

  for(const s of SOURCES){
    noStroke();
    fill(colorWithAlpha(s.color,72));
    ellipse(width*s.x,height*.92,126,34);
  }

  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];
    d.vy+=d.gravity;
    d.vx+=sin(frameCount*.018+d.phase)*.018;
    d.x+=d.vx;
    d.y+=d.vy;
    d.life-=d.decay;
    d.r*=.9992;

    if(d.y>height*.92&&d.vy>0&&d.bounces>0){
      d.y=height*.92;
      d.vy*=-.33;
      d.vx*=.75;
      d.bounces--;
      ripples.push({x:d.x,y:d.y,r:4,life:58,color:d.color});
    }

    noStroke();
    const shimmer=18*sin(frameCount*.03+d.phase);
    fill(colorWithAlpha(d.color,constrain(d.life*2.45+shimmer,35,255)));
    ellipse(d.x,d.y,d.r,d.r*(1.2+.25*sin(frameCount*.025+d.phase)));

    if(d.life<=0||d.y>height+40)drops.splice(i,1);
  }

  for(let i=ripples.length-1;i>=0;i--){
    const r=ripples[i];
    r.r+=1.9;
    r.life-=1.8;
    noFill();
    stroke(colorWithAlpha(r.color,r.life*3.4));
    strokeWeight(1.7);
    ellipse(r.x,r.y,r.r*2,r.r*.72);
    if(r.life<=0)ripples.splice(i,1);
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

function granularCloud(sourceIndex){
  if(!audioReady)return;
  const s=SOURCES[sourceIndex];
  const base=Tone.Frequency(s.notes[0]).toFrequency();
  const now=Tone.now();

  for(let i=0;i<20;i++){
    const t=now+i*.018+Math.random()*.014;
    const freq=base*(.82+Math.random()*.55);
    const note=Tone.Frequency(freq).toNote();
    grainSynth.triggerAttackRelease(note,.028,t,0.18+Math.random()*.24);
  }

  grainFilter.frequency.rampTo(1800+sourceIndex*950,.12);
}

function fountain(index){
  const s=SOURCES[index];
  const amount=150;

  for(let i=0;i<amount;i++){
    const angle=random(-PI*.80,-PI*.20);
    const speed=random(4.8,13.8);
    drops.push({
      x:width*s.x+random(-30,30),
      y:height*.91,
      vx:cos(angle)*speed*.58,
      vy:sin(angle)*speed,
      gravity:random(.11,.20),
      r:random(3.2,12.5),
      life:random(76,110),
      decay:random(.7,1.22),
      bounces:random()<.44?1:0,
      color:s.color,
      phase:random(TWO_PI)
    });
  }

  for(let i=0;i<9;i++){
    ripples.push({
      x:width*s.x+random(-42,42),
      y:height*.92,
      r:random(5,20),
      life:random(50,78),
      color:s.color
    });
  }

  if(drops.length>2200)drops.splice(0,drops.length-2200);

  if(audioReady){
    synth.triggerAttackRelease(s.notes,'8n');
    granularCloud(index);
  }
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;
    const index=SOURCES.findIndex(s=>s.code===e.code);
    if(index>=0)fountain(index);
  },{passive:false});
}

function createClearButton(){
  const b=createButton('✕ Limpiar');
  b.position(160,10);
  b.mousePressed(()=>{drops=[];ripples=[];});
}

function windowResized(){resizeResponsiveCanvas();}
