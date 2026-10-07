let video,bodyPose,poses=[],connections=[];
let playBtn,stopBtn,camBtn,pointsBtn,clearBtn;
let ambientBtn,pulseBtn,arpBtn,silenceBtn,volumeSlider,volumeLabel;
let running=false,showCamera=false,showPoints=true,paintLayer,deviceProfile;
let SRC_W=640,SRC_H=480;

let audioReady=false,currentPreset='ambient',audioEnergy=0;
let master,analyser,musicGain,gestureGain,reverb,delay,gestureReverb;
let padSynth,bassSynth,leadSynth,kickSynth,chimeSynth,riseSynth,impactSynth;
let activeEvents=[];
let gestureName='Sin gesto';
let gestureVisual=0;
let gestureEventText='';
let gestureEventLife=0;
let gestureEventColor='#FF8F5C';
const musicBaseGain=.34;
let gestureState={handsTogether:false,armsUp:false,armsOpen:false};
let presetBpm={ambient:72,pulse:96,arp:108};

const palette={
  left_wrist:'#FF6B6B',
  right_wrist:'#4ECDC4',
  left_ankle:'#FFD166',
  right_ankle:'#5C6AC4'
};

let previous={};

async function setup(){
  deviceProfile=setupResponsiveCanvas();
  SRC_W=deviceProfile.cameraWidth;
  SRC_H=deviceProfile.cameraHeight;

  paintLayer=createGraphics(width,height);
  paintLayer.clear();

  bodyPose=await ml5.bodyPose();

  playBtn=mk('▶ Play',10,startCam);
  stopBtn=mk('■ Stop',96,stopCam,true);
  camBtn=mk('👁 Vista: OFF',182,toggleCam,true);

  pointsBtn=mk('● Esqueleto: ON',10,togglePoints,false,60);
  clearBtn=mk('✕ Limpiar',146,clearPainting,false,60);

  

  ambientBtn=mk('♪ Ambiental',10,()=>startPreset('ambient'),true,160);
  pulseBtn=mk('♪ Pulso',112,()=>startPreset('pulse'),true,160);
  arpBtn=mk('♪ Arpegio',204,()=>startPreset('arp'),true,160);

  silenceBtn=mk('■ Silencio',10,stopMusic,true,210);

  volumeSlider=createSlider(0,100,26,1);
  volumeSlider.position(112,220);
  volumeSlider.style('width','132px');
  volumeSlider.input(updateVolume);

  volumeLabel=createDiv('Vol: 26%');
  volumeLabel.position(250,212);
  volumeLabel.style('font-size','12px');
  volumeLabel.style('padding','4px 6px');
  volumeLabel.style('border-radius','7px');
  volumeLabel.style('background','rgba(30,25,22,.75)');
  volumeLabel.style('color','#fff');

  createControlsVisibilityButton();
}

function mk(t,x,f,d=false,y=10){
  const b=createButton(t);
  b.position(x,y);
  b.mousePressed(f);
  if(d)b.attribute('disabled','');
  return b;
}

async function startCam(){
  if(running)return;

  showCamera=true;
  showPoints=true;
  camBtn.html('👁 Vista: ON');
  pointsBtn.html('● Esqueleto: ON');

  

  if(typeof Tone!=='undefined'){
    try{
      await Tone.start();
      if(!audioReady)setupAudio();
      startPreset(currentPreset||'ambient');
    }catch(err){
      console.warn('No se pudo iniciar Tone.js',err);
    }
  }

  video=createCapture(getResponsiveCameraConstraints(deviceProfile),()=>{
    const dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;
    bodyPose.detectStart(video,gotPoses);
    running=true;
  });

  video.hide();

  playBtn.attribute('disabled','');
  stopBtn.removeAttribute('disabled');
  camBtn.removeAttribute('disabled');
  setMusicControls(true);
}

function stopCam(){
  
  bodyPose.detectStop();

  if(video){
    video.remove();
    video=null;
  }

  poses=[];
  previous={};
  gestureState={handsTogether:false,armsUp:false,armsOpen:false};
  gestureName='Sin gesto';
  gestureEventLife=0;
  gestureEventText='';
  running=false;
  showCamera=false;
  camBtn.html('👁 Vista: OFF');

  stopMusic();

  playBtn.removeAttribute('disabled');
  stopBtn.attribute('disabled','');
  camBtn.attribute('disabled','');
  setMusicControls(false);
}

function toggleCam(){
  showCamera=!showCamera;
  camBtn.html(showCamera?'👁 Vista: ON':'👁 Vista: OFF');
}

function togglePoints(){
  showPoints=!showPoints;
  pointsBtn.html(showPoints?'● Esqueleto: ON':'○ Esqueleto: OFF');
}

function clearPainting(){
  paintLayer.clear();
  previous={};
}

function setupAudio(){
  master=new Tone.Gain(0).toDestination();
  analyser=new Tone.Analyser('fft',64);
  master.connect(analyser);

  // La música de fondo queda deliberadamente más baja que los sonidos gestuales.
  musicGain=new Tone.Gain(musicBaseGain).connect(master);
  gestureGain=new Tone.Gain(.95).connect(master);

  reverb=new Tone.Reverb({decay:4.2,wet:.38}).connect(musicGain);
  delay=new Tone.FeedbackDelay({delayTime:'8n',feedback:.24,wet:.32}).connect(musicGain);
  gestureReverb=new Tone.Reverb({decay:3.4,wet:.46}).connect(gestureGain);

  padSynth=new Tone.PolySynth(Tone.Synth,{
    oscillator:{type:'triangle8'},
    envelope:{attack:.45,decay:.6,sustain:.45,release:2.2}
  }).connect(reverb);

  bassSynth=new Tone.MonoSynth({
    oscillator:{type:'sine'},
    filter:{Q:2,type:'lowpass',rolloff:-12},
    envelope:{attack:.02,decay:.2,sustain:.35,release:.45},
    filterEnvelope:{attack:.01,decay:.18,sustain:.15,release:.35,baseFrequency:90,octaves:2.3}
  }).connect(musicGain);

  leadSynth=new Tone.FMSynth({
    harmonicity:1.5,
    modulationIndex:4,
    envelope:{attack:.02,decay:.18,sustain:.18,release:.7},
    modulation:{type:'sine'}
  }).connect(delay);

  kickSynth=new Tone.MembraneSynth({
    pitchDecay:.05,
    octaves:5,
    envelope:{attack:.001,decay:.22,sustain:0,release:.1}
  }).connect(musicGain);

  // Instrumentos reservados para los gestos.
  chimeSynth=new Tone.PolySynth(Tone.FMSynth,{
    harmonicity:2.4,
    modulationIndex:7,
    oscillator:{type:'sine'},
    envelope:{attack:.008,decay:.45,sustain:.08,release:1.8},
    modulation:{type:'sine'},
    modulationEnvelope:{attack:.005,decay:.28,sustain:.04,release:.8}
  }).connect(gestureReverb);

  riseSynth=new Tone.FMSynth({
    harmonicity:1.8,
    modulationIndex:5,
    oscillator:{type:'sine'},
    envelope:{attack:.01,decay:.16,sustain:.14,release:.65},
    modulation:{type:'triangle'}
  }).connect(gestureGain);

  impactSynth=new Tone.MembraneSynth({
    pitchDecay:.12,
    octaves:7,
    envelope:{attack:.001,decay:.65,sustain:0,release:.45}
  }).connect(gestureGain);

  audioReady=true;
  updateVolume();
}
function startPreset(name){
  if(!audioReady)return;

  currentPreset=name;
  clearMusicalEvents();

  const transport=Tone.getTransport();

  if(name==='ambient'){
    transport.bpm.value=presetBpm.ambient;

    const chords=[
      ['C4','E4','G4','B4'],
      ['A3','C4','E4','G4'],
      ['F3','A3','C4','E4'],
      ['G3','C4','D4','G4']
    ];

    const seq=new Tone.Sequence((time,chord)=>{
      padSynth.triggerAttackRelease(chord,'1m',time,.42);
    },chords,'1m').start(0);

    activeEvents.push(seq);
  }

  if(name==='pulse'){
    transport.bpm.value=presetBpm.pulse;

    const bassNotes=['C3','C3','G2','A2','F2','F2','G2','G2'];

    const bassSeq=new Tone.Sequence((time,note)=>{
      bassSynth.triggerAttackRelease(note,'8n',time,.48);
    },bassNotes,'8n').start(0);

    const kickLoop=new Tone.Loop(time=>{
      kickSynth.triggerAttackRelease('C1','8n',time,.4);
    },'4n').start(0);

    activeEvents.push(bassSeq,kickLoop);
  }

  if(name==='arp'){
    transport.bpm.value=presetBpm.arp;

    const notes=['C4','E4','G4','B4','A4','G4','E4','D4'];

    const arpSeq=new Tone.Sequence((time,note)=>{
      leadSynth.triggerAttackRelease(note,'16n',time,.34);
    },notes,'8n').start(0);

    const chordLoop=new Tone.Loop(time=>{
      padSynth.triggerAttackRelease(['C3','G3','D4'],'2n',time,.22);
    },'1m').start(0);

    activeEvents.push(arpSeq,chordLoop);
  }

  transport.start('+0.03');
  updateVolume();
  updatePresetButtons();
}

function clearMusicalEvents(){
  if(typeof Tone==='undefined'||!audioReady)return;

  const transport=Tone.getTransport();
  transport.stop();
  transport.position=0;

  for(const ev of activeEvents){
    try{
      ev.stop();
      ev.dispose();
    }catch(err){}
  }

  activeEvents=[];

  try{padSynth.releaseAll();}catch(err){}
  try{bassSynth.triggerRelease();}catch(err){}
  try{leadSynth.triggerRelease();}catch(err){}
}

function stopMusic(){
  if(!audioReady)return;
  clearMusicalEvents();
  master.gain.rampTo(0,.15);
  updatePresetButtons(true);
}

function setMusicControls(enabled){
  for(const b of [ambientBtn,pulseBtn,arpBtn,silenceBtn]){
    if(enabled)b.removeAttribute('disabled');
    else b.attribute('disabled','');
  }
}

function updatePresetButtons(silent=false){
  ambientBtn.html(!silent&&currentPreset==='ambient'?'● Ambiental':'♪ Ambiental');
  pulseBtn.html(!silent&&currentPreset==='pulse'?'● Pulso':'♪ Pulso');
  arpBtn.html(!silent&&currentPreset==='arp'?'● Arpegio':'♪ Arpegio');
}

function updateVolume(){
  const v=Number(volumeSlider.value());
  volumeLabel.html('Vol: '+v+'%');
  if(audioReady&&master){
    master.gain.rampTo((v/100)*.75,.08);
  }
}

function fit(){
  const f=fitCameraToCanvas(width,height,SRC_W,SRC_H);
  return{s:f.scale,ox:f.x,oy:f.y};
}

function mp(k){
  const {s,ox,oy}=fit();
  return{x:width-(k.x*s+ox),y:k.y*s+oy};
}

function draw(){
  updateAudioEnergy();

  const warmPulse=audioEnergy;
  background(
    245,
    240-warmPulse*13,
    232-warmPulse*22
  );

  const {s,ox,oy}=fit();

  if(showCamera&&video){
    push();
    tint(255,55);
    translate(width,0);
    scale(-1,1);
    image(video,ox,oy,SRC_W*s,SRC_H*s);
    pop();
  }

  drawAudioPulse();
  drawGestureVisual();
  drawGestureEvent();
  gestureVisual*=.92;
  gestureEventLife=max(0,gestureEventLife-1);

  if(running&&poses.length){
    updateSoundGestures(poses[0]);
    paintPose(poses[0]);
  }else{
    resetGestureModulation();
  }

  image(paintLayer,0,0);

  if(showPoints&&running&&poses.length){
    drawBodySkeletonOverlay(
      poses[0],
      connections,
      mp,
      '#202020AA',
      '#202020FF'
    );
  }

  drawBrushMarkers();
  hud();
}

function updateAudioEnergy(){
  if(!audioReady||!analyser){
    audioEnergy=lerp(audioEnergy,0,.08);
    return;
  }

  const values=analyser.getValue();
  let peak=-100;

  for(const v of values){
    if(Number.isFinite(v)&&v>peak)peak=v;
  }

  const target=constrain(map(peak,-78,-18,0,1),0,1);
  audioEnergy=lerp(audioEnergy,target,.16);
}

function drawAudioPulse(){
  if(audioEnergy<.02)return;

  push();
  noFill();
  stroke(231,111,81,35+audioEnergy*90);
  strokeWeight(1+audioEnergy*4);

  const base=min(width,height)*(.18+audioEnergy*.12);
  circle(width*.5,height*.5,base);
  circle(width*.5,height*.5,base*1.35);

  pop();
}

function getPosePoint(pose,name){
  const k=pose.keypoints.find(p=>p.name===name);
  if(!k||k.confidence<=.28)return null;
  return mp(k);
}

function updateSoundGestures(pose){
  const lw=getPosePoint(pose,'left_wrist');
  const rw=getPosePoint(pose,'right_wrist');
  const ls=getPosePoint(pose,'left_shoulder');
  const rs=getPosePoint(pose,'right_shoulder');

  if(!lw||!rw||!ls||!rs){
    gestureName='Buscando brazos';
    resetGestureModulation();
    return;
  }

  const bodyScale=max(80,dist(ls.x,ls.y,rs.x,rs.y));
  const handDistance=dist(lw.x,lw.y,rw.x,rw.y);

  const handsTogether=handDistance<bodyScale*.72;
  const armsUp=lw.y<ls.y-bodyScale*.18 && rw.y<rs.y-bodyScale*.18;
  const armsOpen=handDistance>bodyScale*2.45 &&
    abs(lw.y-rw.y)<bodyScale*1.15;

  // Un solo evento sonoro por entrada de gesto para que la relación sea clara.
  if(armsUp&&!gestureState.armsUp){
    triggerArmsUp();
  }else if(handsTogether&&!gestureState.handsTogether){
    triggerHandsTogether();
  }else if(armsOpen&&!gestureState.armsOpen){
    triggerArmsOpen();
  }

  gestureState.handsTogether=handsTogether;
  gestureState.armsUp=armsUp;
  gestureState.armsOpen=armsOpen;

  if(armsUp){
    gestureName='Brazos arriba';
  }else if(handsTogether){
    gestureName='Manos juntas';
  }else if(armsOpen){
    gestureName='Brazos abiertos';
  }else{
    gestureName='Movimiento libre';
  }

  if(audioReady){
    const transport=Tone.getTransport();
    const base=presetBpm[currentPreset]||84;
    transport.bpm.rampTo(armsUp?base*1.18:base,.25);

    if(reverb&&reverb.wet){
      reverb.wet.rampTo(armsOpen?.72:.38,.18);
    }

    if(delay&&delay.wet){
      delay.wet.rampTo(armsUp?.52:.32,.18);
    }
  }
}

function duckBackground(duration=650){
  if(!audioReady||!musicGain)return;
  musicGain.gain.rampTo(.08,.025);
  setTimeout(()=>{
    if(audioReady&&musicGain)musicGain.gain.rampTo(musicBaseGain,.32);
  },duration);
}

function showGestureEvent(text,color){
  gestureEventText=text;
  gestureEventColor=color;
  gestureEventLife=52;
  gestureVisual=1;
}

function triggerHandsTogether(){
  if(!audioReady)return;

  duckBackground(720);

  const now=Tone.now();
  chimeSynth.triggerAttackRelease(
    ['C5','E5','G5','B5'],
    '2n',
    now,
    .95
  );

  showGestureEvent('SONIDO: CAMPANA / ACORDE','#FFD166');
}

function triggerArmsUp(){
  if(!audioReady)return;

  duckBackground(900);

  const now=Tone.now();
  const notes=['C5','E5','G5','B5','C6','E6'];

  notes.forEach((note,i)=>{
    riseSynth.triggerAttackRelease(
      note,
      '16n',
      now+i*.105,
      .88
    );
  });

  showGestureEvent('SONIDO: ASCENSO','#FF6B6B');
}

function triggerArmsOpen(){
  if(!audioReady)return;

  duckBackground(1000);

  const now=Tone.now();

  impactSynth.triggerAttackRelease('C2','4n',now,.95);
  chimeSynth.triggerAttackRelease(
    ['C4','G4','D5','A5'],
    '1m',
    now+.04,
    .82
  );

  showGestureEvent('SONIDO: IMPACTO + ACORDE','#4ECDC4');
}

function resetGestureModulation(){
  if(!audioReady)return;
  const transport=Tone.getTransport();
  const base=presetBpm[currentPreset]||84;
  transport.bpm.rampTo(base,.3);

  if(reverb&&reverb.wet)reverb.wet.rampTo(.38,.2);
  if(delay&&delay.wet)delay.wet.rampTo(.32,.2);
}

function drawGestureVisual(){
  if(gestureVisual<.02)return;

  push();
  noFill();
  stroke(255,143,92,45+gestureVisual*120);
  strokeWeight(2+gestureVisual*5);

  const r=min(width,height)*(.20+gestureVisual*.24);
  circle(width*.5,height*.5,r);
  circle(width*.5,height*.5,r*1.35);

  pop();
}

function drawGestureEvent(){
  if(gestureEventLife<=0)return;

  const a=constrain(map(gestureEventLife,0,52,0,255),0,255);
  const progress=1-gestureEventLife/52;

  push();

  noStroke();
  fill(18,22,31,a*.78);
  rectMode(CENTER);
  rect(width*.5,height*.34,min(width*.88,440),76,14);

  textAlign(CENTER,CENTER);
  textStyle(BOLD);
  textSize(width<420?18:24);
  fill(gestureEventColor);
  text(gestureEventText,width*.5,height*.34);

  noFill();
  stroke(gestureEventColor);
  strokeWeight(3);
  circle(
    width*.5,
    height*.5,
    min(width,height)*(.22+progress*.58)
  );

  pop();
}

function paintPose(pose){
  for(const name of Object.keys(palette)){
    const k=pose.keypoints.find(p=>p.name===name);

    if(!k||k.confidence<=.25){
      delete previous[name];
      continue;
    }

    const p=mp(k);
    const prev=previous[name];

    if(prev){
      const speed=dist(prev.x,prev.y,p.x,p.y);
      const baseWeight=constrain(map(speed,0,40,18,6),6,18);
      const weight=baseWeight*(1+audioEnergy*.85);

      paintLayer.stroke(palette[name]);
      paintLayer.strokeWeight(weight);
      paintLayer.strokeCap(ROUND);
      paintLayer.line(prev.x,prev.y,p.x,p.y);

      const splashThreshold=18-audioEnergy*6;

      if(speed>splashThreshold){
        paintLayer.noStroke();
        paintLayer.fill(palette[name]+'88');

        const amount=3+floor(audioEnergy*5);

        for(let i=0;i<amount;i++){
          paintLayer.circle(
            p.x+random(-14-audioEnergy*16,14+audioEnergy*16),
            p.y+random(-14-audioEnergy*16,14+audioEnergy*16),
            random(4,12+audioEnergy*10)
          );
        }
      }
    }

    previous[name]=p;
  }
}

function drawBrushMarkers(){
  for(const name of Object.keys(previous)){
    const p=previous[name];
    const pulse=1+audioEnergy*.45;

    noFill();
    stroke(palette[name]);
    strokeWeight(2+audioEnergy*2);

    circle(
      p.x,
      p.y,
      (name.includes('ankle')?24:30)*pulse
    );
  }
}

function hud(){
  noStroke();
  fill(18,22,31,220);
  rect(12,270,min(420,width-24),122,12);

  fill(255);
  textSize(13);
  text('BodyPose — pintura corporal + música',24,291);

  textSize(11);
  text('Manos y pies: pinceles digitales',24,309);
  text('Ambiental / Pulso / Arpegio: cambia la escena musical',24,326);
  text('Cada gesto dispara un sonido claramente diferente',24,343);
  text('Gesto: '+gestureName,24,360);
  text('Música: '+currentPreset+'  |  energía: '+nf(audioEnergy,1,2),24,377);
}

function gotPoses(r){
  poses=r;
  if(!connections.length)connections=bodyPose.getConnections();
}

function windowResized(){
  deviceProfile=resizeResponsiveCanvas();

  if(video){
    const dims=configureVideoElement(video,deviceProfile);
    SRC_W=dims.width;
    SRC_H=dims.height;
  }else{
    SRC_W=deviceProfile.cameraWidth;
    SRC_H=deviceProfile.cameraHeight;
  }

  const old=paintLayer;
  paintLayer=createGraphics(width,height);
  paintLayer.image(old,0,0,width,height);
  previous={};
}
