let videos=[];
let currentIndex=0;
let transition=0;
let backgroundMusic=null;
let musicButton=null;
let musicStatus='';
let localMusicURL=null;
const STOCK_MUSIC_URL='https://upload.wikimedia.org/wikipedia/commons/2/28/Horizon_Flare_by_Alexander_Nakarada.ogg';
const STOCK_MUSIC_PAGE='https://commons.wikimedia.org/wiki/File:Horizon_Flare_by_Alexander_Nakarada.ogg';
let loadedCount=0;
let failedFiles=[];
let loadStartedAt=0;
let localURLs=[];
let wantsPlayback=true;
let playbackWarning='';

const VIDEO_FILES=[
  'videos/19201294-hd_1080_1920_50fps.mp4',
  'videos/5382693-hd_1920_1080_24fps.mp4',
  'videos/855734-hd_1920_1080_30fps.mp4'
];

function setup(){
  setupResponsiveCanvas();
  createExampleVersionBadge('V13');
  createMusicControls();
  createVideoPicker();
  createControlsVisibilityButton();
  installKeyboard();
  loadVideos(VIDEO_FILES,VIDEO_FILES.map(p=>p.split('/').pop()));
}

function createVideoPicker(){
  // Los MP4 pueden no estar publicados en GitHub Pages: permite usarlos
  // directamente desde el ordenador, sin subirlos ni modificar el repositorio.
  const input=document.createElement('input');
  input.type='file';
  input.accept='video/mp4,video/webm,video/ogg,video/*';
  input.multiple=true;
  input.style.display='none';
  document.body.appendChild(input);

  const button=createButton('📁 Seleccionar videos (MP4)');
  button.position(10,58);
  button.style('z-index','100');
  button.mousePressed(()=>input.click());
  input.addEventListener('change',()=>{
    const files=Array.from(input.files||[]).filter(f=>
      f.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(f.name)
    );
    if(files.length)loadLocalFiles(files);
    input.value='';
  });

  window.addEventListener('dragover',e=>e.preventDefault());
  window.addEventListener('drop',e=>{
    e.preventDefault();
    const files=Array.from(e.dataTransfer?.files||[]).filter(f=>
      f.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(f.name)
    );
    if(files.length)loadLocalFiles(files);
  });
}

function loadLocalFiles(files){
  const urls=files.map(f=>URL.createObjectURL(f));
  loadVideos(urls,files.map(f=>f.name),urls);
}

function clearVideos(){
  videos.forEach(item=>{
    try{item.video.elt.pause();item.video.remove();}catch(err){}
  });
  videos=[];
  localURLs.forEach(url=>URL.revokeObjectURL(url));
  localURLs=[];
}

function loadVideos(sources,names,objectURLs=[]){
  clearVideos();
  localURLs=objectURLs;
  currentIndex=0;
  loadedCount=0;
  failedFiles=[];
  playbackWarning='';
  wantsPlayback=true;
  loadStartedAt=millis();

  sources.forEach((src,index)=>{
    const video=createVideo(src);
    const item={video,name:names[index],ready:false,failed:false};
    videos.push(item);
    const elt=video.elt;
    elt.muted=true;
    elt.volume=0;
    elt.loop=true;
    elt.preload='auto';
    elt.playsInline=true;
    elt.setAttribute('playsinline','');
    video.hide();

    const onReady=()=>{
      if(item.ready||item.failed)return;
      item.ready=true;
      loadedCount++;
      // Si el video inicial falló, selecciona el primero disponible.
      if(videos[currentIndex]?.failed){
        currentIndex=videos.findIndex(v=>v.ready);
      }
      if(index===currentIndex)playSelected();
    };
    elt.addEventListener('loadeddata',onReady);
    elt.addEventListener('error',()=>{
      if(item.failed)return;
      item.failed=true;
      failedFiles.push(item.name);
      if(index===currentIndex){
        const available=videos.findIndex(v=>v.ready&&!v.failed);
        if(available>=0){
          currentIndex=available;
          playSelected();
        }
      }
    });
    if(elt.readyState>=2)onReady();
    elt.load();
  });
}

function playSelected(){
  const item=videos[currentIndex];
  if(!item||!item.ready||item.failed||!wantsPlayback)return;
  playbackWarning='';
  const p=item.video.elt.play();
  if(p && typeof p.catch==='function'){
    p.catch(err=>{
      playbackWarning=err?.name==='NotAllowedError'
        ? 'Pulsa SPACE para iniciar la reproducción.'
        : 'El navegador no pudo reproducir este archivo o códec.';
    });
  }
}

function createMusicControls(){
  // Música instrumental ambiental: una pista continua e independiente del video.
  // Los navegadores exigen interacción antes de reproducir audio.
  backgroundMusic=new Audio();
  backgroundMusic.src=STOCK_MUSIC_URL;
  backgroundMusic.preload='none';
  backgroundMusic.loop=true;
  backgroundMusic.volume=.26;
  backgroundMusic.addEventListener('error',()=>{
    musicStatus='No se pudo cargar la pista externa. Puedes elegir un audio local.';
    if(musicButton)musicButton.html('🎭 Reintentar música');
  });

  const bar=createDiv('');
  bar.position(10,10);
  bar.style('display','flex');
  bar.style('align-items','center');
  bar.style('gap','8px');
  bar.style('flex-wrap','wrap');
  bar.style('background','rgba(0,0,0,.66)');
  bar.style('padding','4px 8px');
  bar.style('border-radius','10px');
  bar.style('z-index','100');

  musicButton=createButton('🎭 Activar música');
  musicButton.parent(bar);
  musicButton.mousePressed(()=>{
    if(backgroundMusic.paused){
      musicStatus='';
      // Iniciar directamente en el clic, compatible con la política de autoplay.
      const promise=backgroundMusic.play();
      if(promise && promise.catch){
        promise.then(()=>musicButton.html('⏸ Pausar música')).catch(err=>{
          musicStatus='No se pudo iniciar la música: '+(err?.name||'error')+
            '. Prueba cargando una pista local.';
          musicButton.html('🎭 Reintentar música');
        });
      }else{
        musicButton.html('⏸ Pausar música');
      }
    }else{
      backgroundMusic.pause();
      musicButton.html('🎭 Reanudar música');
    }
  });

  const volumeLabel=createSpan('Vol. 26%');
  volumeLabel.parent(bar);
  volumeLabel.style('color','#fff');
  volumeLabel.style('font-size','12px');
  const volume=createSlider(0,100,26,1);
  volume.parent(bar);
  volume.style('width','110px');
  volume.input(()=>{
    backgroundMusic.volume=volume.value()/100;
    volumeLabel.html('Vol. '+volume.value()+'%');
  });

  const audioInput=document.createElement('input');
  audioInput.type='file';
  audioInput.accept='audio/*,.mp3,.ogg,.wav,.m4a';
  audioInput.style.display='none';
  document.body.appendChild(audioInput);

  const localButton=createButton('🎵 Cambiar pista');
  localButton.position(200,58);
  localButton.style('z-index','100');
  localButton.mousePressed(()=>audioInput.click());
  audioInput.addEventListener('change',()=>{
    const file=audioInput.files && audioInput.files[0];
    if(!file)return;
    const nextURL=URL.createObjectURL(file);
    const oldURL=localMusicURL;
    backgroundMusic.pause();
    backgroundMusic.src=nextURL;
    backgroundMusic.load();
    localMusicURL=nextURL;
    if(oldURL)URL.revokeObjectURL(oldURL);
    musicStatus='Pista local: '+file.name;
    credits.html('Música local: '+file.name.replace(/[&<>"']/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]))+' · comprueba su licencia antes de publicar');
    const promise=backgroundMusic.play();
    if(promise && promise.catch)promise.then(()=>{
      musicButton.html('⏸ Pausar música');
    }).catch(()=>{
      musicButton.html('🎭 Activar música');
      musicStatus='Seleccionada: '+file.name+'. Pulsa Activar música.';
    });
    audioInput.value='';
  });

  // La atribución CC BY 4.0 permanece visible en el ejemplo.
  const credits=createDiv(
    'Música de stock: <a href="'+STOCK_MUSIC_PAGE+'" target="_blank" rel="noopener noreferrer" style="color:#fff">Horizon Flare</a>'+
    ' · Alexander Nakarada · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style="color:#fff">CC BY 4.0</a>'
  );
  credits.position(12,0);
  credits.style('position','fixed');
  credits.style('left','12px');
  credits.style('bottom','52px');
  credits.style('top','auto');
  credits.style('color','#ddd');
  credits.style('background','rgba(0,0,0,.72)');
  credits.style('padding','5px 8px');
  credits.style('border-radius','8px');
  credits.style('font-size','11px');
  credits.style('z-index','100');
  credits.attribute('data-persistent-ui','true');
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
    old.video.elt.pause();
    try{old.video.elt.currentTime=0;}catch(err){}
  }

  // Saltar archivos inexistentes: solo navegar entre los que pueden mostrarse.
  let nextIndex=currentIndex;
  for(let n=0;n<videos.length;n++){
    nextIndex=(nextIndex+dir+videos.length)%videos.length;
    if(videos[nextIndex].ready&&!videos[nextIndex].failed)break;
  }
  if(!videos[nextIndex].ready||videos[nextIndex].failed){
    nextIndex=videos.findIndex(item=>item.ready&&!item.failed);
  }
  if(nextIndex<0)return;
  currentIndex=nextIndex;
  try{videos[currentIndex].video.elt.currentTime=0;}catch(err){}
  wantsPlayback=true;
  playSelected();
  transition=1;

}

function togglePlayback(){
  const item=videos[currentIndex];
  if(!item||!item.ready||item.failed)return;
  if(item.video.elt.paused){
    wantsPlayback=true;
    playSelected();
  }else{
    wantsPlayback=false;
    item.video.elt.pause();
  }
}

function draw(){
  background('#05070c');
  const item=videos[currentIndex];

  if(item&&item.ready&&item.video.elt.readyState>=2){
    drawVideoCover(item.video);
  }else{
    drawLoadingState();
  }

  if(transition>.01){
    noStroke();
    fill(255,transition*150);
    rect(0,0,width,height);
    transition*=.84;
  }

  drawHUD();
}

function drawLoadingState(){
  fill(255);
  noStroke();
  textAlign(CENTER,CENTER);
  const allFailed=videos.length>0&&failedFiles.length===videos.length;
  const waited=millis()-loadStartedAt;

  if(allFailed){
    textSize(width<500?14:17);
    text('No se pudieron reproducir los videos.',width/2,height/2-57);
    textSize(width<500?11:14);
    fill(220);
    text('Verifica los archivos MP4 o prueba «Seleccionar videos».',width/2,height/2-22);
    text('También puedes arrastrar videos a esta ventana.',width/2,height/2+8);
    textSize(11);
    fill(170);
    text('Comprueba que el navegador admita el códec de los videos.',width/2,height/2+47);
  }else{
    textSize(16);
    text('Cargando videos… '+loadedCount+'/'+videos.length,width/2,height/2-14);
    if(waited>5000){
      textSize(12);
      fill(190);
      text('Los archivos grandes pueden tardar. No cierres la página.',width/2,height/2+16);
      if(waited>20000){
        text('Si no avanzan, prueba Ctrl+F5 o selecciona archivos locales.',width/2,height/2+42);
      }
    }
  }
}

function drawVideoCover(video){
  const vw=video.elt.videoWidth||1920;
  const vh=video.elt.videoHeight||1080;
  const fit=fitCameraCoverCrop(width,height,vw,vh);
  image(video,fit.dx,fit.dy,fit.dw,fit.dh,fit.sx,fit.sy,fit.sw,fit.sh);
}

function drawHUD(){
  noStroke();
  fill(0,175);
  rect(12,112,min(510,width-24),playbackWarning||musicStatus?115:76,10);
  fill(255);
  textAlign(LEFT,TOP);
  textSize(14);
  const item=videos[currentIndex];
  text('Video '+(currentIndex+1)+' / '+videos.length+(item?' · '+item.name:''),24,124,width-45,22);
  textSize(12);
  text('← anterior  ·  → siguiente  ·  SPACE pausa/reproducción',24,148,width-45,25);
  text('Compatible con Makey Makey',24,169,width-45,22);
  if(playbackWarning){
    fill(255,200,125);
    text(playbackWarning,24,189,width-45,22);
  }
  if(musicStatus){
    fill(255,215,160);
    text(musicStatus,24,playbackWarning?210:189,width-45,35);
  }
}

function windowResized(){
  resizeResponsiveCanvas();
}
