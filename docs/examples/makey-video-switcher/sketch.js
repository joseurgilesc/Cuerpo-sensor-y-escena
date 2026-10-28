let videos=[];
let currentIndex=0;
let transition=0;
let audioReady=false;
let synth,reverb;
let loadedCount=0;

const VIDEO_FILES=[
  'videos/12773175_3840_2160_24fps.mp4',
  'videos/19201294-hd_1080_1920_50fps.mp4',
  'videos/5382693-hd_1920_1080_24fps.mp4',
  'videos/855734-hd_1920_1080_30fps.mp4'
];

function setup(){
  setupResponsiveCanvas();
  loadVideos();
  createExampleVersionBadge('V8');
  createAudioButton();
  createControlsVisibilityButton();
  installKeyboard();
}

function loadVideos(){
  for(let i=0;i<VIDEO_FILES.length;i++){
    const v=createVideo(VIDEO_FILES[i],()=>{
      loadedCount++;
      v.volume(0);
      v.elt.muted=true;
      v.elt.loop=true;
      v.elt.playsInline=true;
      v.elt.setAttribute('playsinline','');
      v.hide();

      if(i===0){
        v.loop();
        v.play().catch(()=>{});
      }
    });
    videos.push(v);
  }
}

function createAudioButton(){
  const b=createButton('🔊 Activar sonido');
  b.position(10,10);
  b.mousePressed(async()=>{
    await Tone.start();
    reverb=new Tone.Reverb({decay:2.8,wet:.34}).toDestination();
    synth=new Tone.PolySynth(Tone.Synth,{
      oscillator:{type:'triangle8'},
      envelope:{attack:.008,decay:.14,sustain:.05,release:.55}
    }).connect(reverb);
    synth.volume.value=-7;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;

    if(e.code==='ArrowLeft')changeVideo(-1);
    if(e.code==='ArrowRight')changeVideo(1);
    if(e.code==='Space')togglePlayback();
  },{passive:false});
}

function changeVideo(dir){
  if(!videos.length)return;

  const old=videos[currentIndex];
  if(old){
    old.pause();
    old.time(0);
  }

  currentIndex=(currentIndex+dir+videos.length)%videos.length;
  const next=videos[currentIndex];

  if(next){
    next.time(0);
    next.loop();
    const p=next.play();
    if(p&&p.catch)p.catch(()=>{});
  }

  transition=1;

  if(audioReady){
    const notes=['C4','E4','G4','B4'];
    const root=notes[currentIndex];
    synth.triggerAttackRelease(
      [root,Tone.Frequency(root).transpose(7).toNote()],
      '8n'
    );
  }
}

function togglePlayback(){
  const v=videos[currentIndex];
  if(!v)return;

  if(v.elt.paused){
    v.loop();
    const p=v.play();
    if(p&&p.catch)p.catch(()=>{});
  }else{
    v.pause();
  }
}

function draw(){
  background('#05070c');

  const v=videos[currentIndex];

  if(v&&v.elt.readyState>=2){
    drawVideoCover(v);
  }else{
    fill(255);
    noStroke();
    textAlign(CENTER,CENTER);
    textSize(16);
    text('Cargando videos… '+loadedCount+'/'+VIDEO_FILES.length,width/2,height/2);
  }

  if(transition>.01){
    noStroke();
    fill(255,transition*150);
    rect(0,0,width,height);
    transition*=.84;
  }

  drawHUD();
}

function drawVideoCover(v){
  const vw=v.elt.videoWidth||1920;
  const vh=v.elt.videoHeight||1080;
  const fit=fitCameraCoverCrop(width,height,vw,vh);

  image(
    v,
    fit.dx,fit.dy,fit.dw,fit.dh,
    fit.sx,fit.sy,fit.sw,fit.sh
  );
}

function drawHUD(){
  noStroke();
  fill(0,150);
  rect(12,52,min(420,width-24),72,10);

  fill(255);
  textAlign(LEFT,TOP);
  textSize(14);
  text('Video '+(currentIndex+1)+' / '+VIDEO_FILES.length,24,68);

  textSize(12);
  text('← anterior   ·   → siguiente   ·   SPACE pausa/play',24,91);
  text('Compatible con Makey Makey',24,108);
}

function windowResized(){
  resizeResponsiveCanvas();
}
