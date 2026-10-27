let columns=[];
let synth,reverb,delay,audioReady=false;
const TOTAL_COLUMNS=34;
const PALETTE=['#00D1FF','#3A86FF','#8338EC','#FF006E','#FB5607','#FFBE0B'];
const INPUTS=[
  {code:'ArrowLeft',label:'←',center:2,notes:['C4','E4','G4']},
  {code:'ArrowUp',label:'↑',center:5,notes:['D4','F4','A4']},
  {code:'ArrowRight',label:'→',center:9,notes:['E4','G4','B4']},
  {code:'ArrowDown',label:'↓',center:14,notes:['G4','B4','D5']},
  {code:'Space',label:'SPACE',center:22,notes:['A4','C5','E5']},
  {code:'KeyW',label:'W',center:31,notes:['C5','E5','G5']}
];
const FIB_OFFSETS=[0,1,-1,2,-2,3,-3,5,-5];

function setup(){
  setupResponsiveCanvas();
  columns=Array.from({length:TOTAL_COLUMNS},(_,i)=>({level:0,target:0,i,color:'#FFFFFF'}));
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

    reverb=new Tone.Reverb({decay:2.6,wet:.32}).toDestination();
    delay=new Tone.FeedbackDelay({delayTime:'8n',feedback:.22,wet:.20}).connect(reverb);

    synth=new Tone.PolySynth(Tone.Synth,{
      oscillator:{type:'triangle8'},
      envelope:{attack:.02,decay:.22,sustain:.20,release:.85}
    }).connect(delay);

    synth.volume.value=-8;
    audioReady=true;
    b.html('🔊 Sonido activo');
    b.attribute('disabled','');
  });
}

function draw(){
  background('#09111F');

  const gap=3;
  const top=84;
  const bottom=38;
  const usable=width-gap*(TOTAL_COLUMNS+1);
  const cw=max(5,usable/TOTAL_COLUMNS);

  for(let i=0;i<columns.length;i++){
    const c=columns[i];
    c.level=lerp(c.level,c.target,.20);
    c.target*=.925;

    const x=gap+i*(cw+gap);
    const baseH=height-top-bottom;
    const activeH=baseH*(.36+.64*c.level);

    noStroke();
    fill(255,235);
    rect(x,top,cw,baseH,3);

    if(c.level>.01){
      const alpha=80+175*c.level;
      fill(colorWithAlpha(c.color,alpha));
      rect(x,height-bottom-activeH,cw,activeH,3);
    }
  }

  fill(255);
  textAlign(LEFT,TOP);
  textSize(14);
  text('Grupos de columnas con distancias Fibonacci',14,54);

  textAlign(CENTER,TOP);
  textSize(11);
  for(const input of INPUTS){
    const x=map(input.center,0,TOTAL_COLUMNS-1,0,width);
    text(input.label,x,height-24);
  }
}

function colorWithAlpha(hexColor,alpha){
  const c=color(hexColor);
  c.setAlpha(alpha);
  return c;
}

function triggerInput(index){
  if(index<0||index>=INPUTS.length)return;
  const input=INPUTS[index];
  const col=PALETTE[index];

  for(let j=0;j<FIB_OFFSETS.length;j++){
    const idx=input.center+FIB_OFFSETS[j];
    if(idx>=0&&idx<columns.length){
      const strength=max(.24,1-j*.085);
      columns[idx].target=max(columns[idx].target,strength);
      columns[idx].color=col;
    }
  }

  if(audioReady){
    synth.triggerAttackRelease(input.notes,'8n');
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
    for(const c of columns){c.level=0;c.target=0;c.color='#FFFFFF';}
  });
}

function windowResized(){resizeResponsiveCanvas();}
