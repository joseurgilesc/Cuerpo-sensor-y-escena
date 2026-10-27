let drops=[];
let synth,audioReady=false;
const SOURCES=[
  {code:'ArrowLeft',x:.18,color:'#54C6EB',note:'C5',label:'← izquierda'},
  {code:'Space',x:.50,color:'#FDE74C',note:'E5',label:'SPACE centro'},
  {code:'ArrowRight',x:.82,color:'#FF6B9A',note:'G5',label:'→ derecha'}
];

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
    synth=new Tone.PolySynth(Tone.Synth,{
      oscillator:{type:'sine'},
      envelope:{attack:.005,decay:.12,sustain:.03,release:.4}
    }).toDestination();
    synth.volume.value=-16;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#071926');

  for(const s of SOURCES){
    noStroke();
    fill(s.color+'28');
    ellipse(width*s.x,height*.93,90,28);
  }

  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];
    d.vy+=.16;
    d.x+=d.vx;
    d.y+=d.vy;
    d.life-=1.6;

    noStroke();
    fill(d.color+hex(floor(constrain(d.life,0,100)*2.55),2));
    circle(d.x,d.y,d.r);

    if(d.life<=0||d.y>height+30)drops.splice(i,1);
  }

  fill(255);
  textAlign(CENTER,TOP);
  textSize(12);
  text(SOURCES.map(s=>s.label).join('   |   '),width/2,58);
}

function fountain(index){
  const s=SOURCES[index];
  for(let i=0;i<34;i++){
    drops.push({
      x:width*s.x+random(-16,16),
      y:height*.91,
      vx:random(-2.6,2.6),
      vy:random(-9.5,-4.5),
      r:random(4,12),
      life:100,
      color:s.color
    });
  }

  if(audioReady)synth.triggerAttackRelease(s.note,'16n');
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
  b.mousePressed(()=>{drops=[];});
}

function windowResized(){resizeResponsiveCanvas();}
