let columns=[];
let synth,audioReady=false;
const PALETTE=['#7BDFF2','#B2F7EF','#EFF7F6','#F7D6E0','#F2B5D4','#CDB4DB'];
const INPUTS=[
  {code:'ArrowLeft',label:'←'},
  {code:'ArrowUp',label:'↑'},
  {code:'ArrowRight',label:'→'},
  {code:'ArrowDown',label:'↓'},
  {code:'Space',label:'SPACE'},
  {code:'KeyW',label:'W'}
];

function setup(){
  setupResponsiveCanvas();
  columns=INPUTS.map((_,i)=>({level:0,target:0,i}));
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
    synth=new Tone.Synth({
      oscillator:{type:'sine'},
      envelope:{attack:.01,decay:.12,sustain:.08,release:.28}
    }).toDestination();
    synth.volume.value=-13;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#0B1020');
  const gap=10;
  const usable=width-gap*(columns.length+1);
  const cw=max(20,usable/columns.length);

  for(let i=0;i<columns.length;i++){
    const c=columns[i];
    c.level=lerp(c.level,c.target,.18);
    c.target*=.94;

    const x=gap+i*(cw+gap);
    const h=map(c.level,0,1,height*.08,height*.78);
    const y=height-h-40;

    noStroke();
    fill('#FFFFFF18');
    rect(x,80,cw,height-120,10);

    fill(PALETTE[i]);
    rect(x,y,cw,h,10);

    fill(255);
    textAlign(CENTER,CENTER);
    textSize(12);
    text(INPUTS[i].label,x+cw/2,height-22);
  }

  fill(255);
  textAlign(LEFT,TOP);
  textSize(15);
  text('Cada contacto enciende una columna',14,54);
}

function triggerInput(index){
  if(index<0||index>=columns.length)return;
  columns[index].target=1;
  if(audioReady){
    const notes=['C4','D4','E4','G4','A4','C5'];
    synth.triggerAttackRelease(notes[index],'16n');
  }
}

function installKeyboard(){
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;

    const index=INPUTS.findIndex(input=>input.code===e.code);
    if(index>=0)triggerInput(index);
  },{passive:false});
}

function createClearButton(){
  const b=createButton('✕ Limpiar');
  b.position(160,10);
  b.mousePressed(()=>{
    for(const c of columns){c.level=0;c.target=0;}
  });
}

function windowResized(){resizeResponsiveCanvas();}
