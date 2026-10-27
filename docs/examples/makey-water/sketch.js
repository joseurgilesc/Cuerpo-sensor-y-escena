let drops=[];
let synth,audioReady=false;
const SOURCES=[
  {code:LEFT_ARROW,x:.18,color:'#54C6EB',note:'C5',label:'← izquierda'},
  {code:32,x:.50,color:'#FDE74C',note:'E5',label:'SPACE centro'},
  {code:RIGHT_ARROW,x:.82,color:'#FF6B9A',note:'G5',label:'→ derecha'}
];

function setup(){
  setupResponsiveCanvas();
  createExampleVersionBadge('V8');
  createAudioButton();
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

function keyPressed(){
  for(let i=0;i<SOURCES.length;i++){
    if(keyCode===SOURCES[i].code){fountain(i);return false;}
  }
}

function windowResized(){resizeResponsiveCanvas();}
