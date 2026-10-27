let drops=[];
let ripples=[];
let synth,reverb,delay,audioReady=false;
const SOURCES=[
  {code:'ArrowLeft',x:.18,color:'#00C2FF',notes:['C5','G5'],label:'← izquierda'},
  {code:'Space',x:.50,color:'#54F2D2',notes:['E5','B5'],label:'SPACE centro'},
  {code:'ArrowRight',x:.82,color:'#8A7CFF',notes:['G5','D6'],label:'→ derecha'}
];

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

    reverb=new Tone.Reverb({decay:4.5,wet:.46}).toDestination();
    delay=new Tone.FeedbackDelay({delayTime:'16n',feedback:.18,wet:.20}).connect(reverb);

    synth=new Tone.PolySynth(Tone.FMSynth,{
      harmonicity:2.2,
      modulationIndex:4,
      oscillator:{type:'sine'},
      modulation:{type:'sine'},
      envelope:{attack:.005,decay:.22,sustain:.05,release:1.1},
      modulationEnvelope:{attack:.005,decay:.18,sustain:.03,release:.7}
    }).connect(delay);

    synth.volume.value=-6;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#041722');

  for(const s of SOURCES){
    noStroke();
    fill(s.color+'30');
    ellipse(width*s.x,height*.92,118,32);
  }

  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];
    d.vy+=d.gravity;
    d.x+=d.vx;
    d.y+=d.vy;
    d.life-=d.decay;

    if(d.y>height*.92&&d.vy>0&&d.bounces>0){
      d.y=height*.92;
      d.vy*=-.33;
      d.vx*=.75;
      d.bounces--;
      ripples.push({x:d.x,y:d.y,r:4,life:50,color:d.color});
    }

    noStroke();
    fill(colorWithAlpha(d.color,d.life*2.2));
    ellipse(d.x,d.y,d.r,d.r*1.35);

    if(d.life<=0||d.y>height+40)drops.splice(i,1);
  }

  for(let i=ripples.length-1;i>=0;i--){
    const r=ripples[i];
    r.r+=1.8;
    r.life-=2;
    noFill();
    stroke(colorWithAlpha(r.color,r.life*3.2));
    strokeWeight(1.5);
    ellipse(r.x,r.y,r.r*2,r.r*.7);
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

function fountain(index){
  const s=SOURCES[index];

  const amount=110;
  for(let i=0;i<amount;i++){
    const angle=random(-PI*.78,-PI*.22);
    const speed=random(4.5,12.5);

    drops.push({
      x:width*s.x+random(-24,24),
      y:height*.91,
      vx:cos(angle)*speed*.55,
      vy:sin(angle)*speed,
      gravity:random(.12,.20),
      r:random(3,10),
      life:random(70,100),
      decay:random(.8,1.35),
      bounces:random()<.38?1:0,
      color:s.color
    });
  }

  for(let i=0;i<6;i++){
    ripples.push({
      x:width*s.x+random(-35,35),
      y:height*.92,
      r:random(5,18),
      life:random(45,70),
      color:s.color
    });
  }

  if(drops.length>1800)drops.splice(0,drops.length-1800);

  if(audioReady){
    synth.triggerAttackRelease(s.notes,'8n');
    setTimeout(()=>{
      synth.triggerAttackRelease(
        s.notes.map(n=>Tone.Frequency(n).transpose(12).toNote()),
        '16n'
      );
    },80);
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
