let sweeps=[];
let synth,audioReady=false;
const COLORS=['#5BC0BE','#FDE74C','#FF6B6B','#9B5DE5','#00BBF9'];

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
    synth=new Tone.FMSynth({
      harmonicity:1.5,modulationIndex:3,
      envelope:{attack:.01,decay:.18,sustain:.05,release:.35}
    }).toDestination();
    synth.volume.value=-15;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#08131C');
  const cols=max(18,floor(width/22));
  const cw=width/cols;

  for(let i=0;i<cols;i++){
    const n=noise(i*.18,frameCount*.018);
    const base=map(n,0,1,height*.08,height*.42);

    noStroke();
    fill(255,18);
    rect(i*cw,height-base,cw-2,base);
  }

  for(let s of sweeps){
    s.x+=s.dir*s.speed;
    s.life-=2.2;

    for(let i=0;i<cols;i++){
      const cx=i*cw+cw/2;
      const d=abs(cx-s.x);
      if(d<width*.22){
        const amp=1-d/(width*.22);
        const n=noise(i*.22,s.seed+frameCount*.02);
        const h=map(n,0,1,height*.2,height*.8)*amp;
        fill(s.color+hex(floor(s.life*2.55),2));
        rect(i*cw,height-h,cw-2,h,5);
      }
    }
  }

  sweeps=sweeps.filter(s=>s.life>0&&s.x>-width*.25&&s.x<width*1.25);

  fill(255);
  textAlign(LEFT,TOP);
  textSize(14);
  text('← barrido izquierda → derecha   |   → barrido derecha → izquierda',14,58);
}

function launchSweep(dir){
  sweeps.push({
    x:dir>0?-width*.15:width*1.15,
    dir,
    speed:max(5,width/110),
    life:100,
    seed:random(1000),
    color:random(COLORS)
  });

  if(audioReady){
    synth.triggerAttackRelease(dir>0?'C4':'G4','8n');
  }
}

function keyPressed(){
  if(keyCode===LEFT_ARROW){launchSweep(1);return false;}
  if(keyCode===RIGHT_ARROW){launchSweep(-1);return false;}
}

function windowResized(){resizeResponsiveCanvas();}
