/* Signal MVP — configure a server-side endpoint below for live provider calls. Never expose LLM keys in this file. */
const API_ENDPOINT = ''; // e.g. '/api/check-visibility'
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSweep() {
  const mount = document.getElementById('hero-sweep');
  if (!window.THREE || !mount || prefersReduced || window.matchMedia('(max-width: 767px)').matches) return;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
  camera.position.z = 8; const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); mount.appendChild(renderer.domElement);
  const group = new THREE.Group(), geo = new THREE.SphereGeometry(.065, 12, 12);
  for(let i=0;i<52;i++){ const a=i/52*Math.PI*2, r=3.1+(i%3)*.14; const lit=[4,17,31,43].includes(i); const mat=new THREE.MeshBasicMaterial({color:lit?0x3d2fff:0xe4e4e7}); const n=new THREE.Mesh(geo,mat); n.position.set(Math.cos(a)*r,Math.sin(a)*r,(i%5-2)*.08); if(lit) n.scale.setScalar(1.45); group.add(n) }
  scene.add(group); let running=false, targetX=0,targetY=0;
  function resize(){const {width,height}=mount.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()} resize(); addEventListener('resize',resize);
  addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5)*.13;targetY=(e.clientY/innerHeight-.5)*.13});
  function render(){if(!running)return;group.rotation.z+=.002;group.rotation.x+=(targetY-group.rotation.x)*.03;group.rotation.y+=(targetX-group.rotation.y)*.03;renderer.render(scene,camera);requestAnimationFrame(render)}
  new IntersectionObserver(([entry])=>{running=entry.isIntersecting;if(running)render()},{threshold:.08}).observe(mount);
}
function initMotion(){if(!window.gsap||prefersReduced)return; gsap.from('.hero-in',{y:28,opacity:0,stagger:.08,duration:.5,ease:'power3.out',delay:.15}); if(window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger); gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{opacity:0,y:35,duration:.7,scrollTrigger:{trigger:el,start:'top 82%'}})); gsap.to('.scan-line span',{left:'100%',ease:'none',scrollTrigger:{trigger:'.process',start:'top 65%',end:'bottom 40%',scrub:true}})}}
function demoResult(brand,topic){const hash=[...(`${brand}${topic}`)].reduce((a,c)=>a+c.charCodeAt(0),0);const mentioned=hash%3!==0;return {mentioned,model:['ChatGPT','Perplexity','Gemini'][hash%3],excerpt:mentioned?`${brand} appears as a relevant option in responses about ${topic}.`:`${brand} was not surfaced in a representative answer about ${topic}.`}}
function setButtonLabel(button,label){button.querySelector('.button-label').textContent=label}
function showResult(result,data){const model=String(data.model||'Model unavailable'),status=data.mentioned?'MENTION DETECTED':'NOT DETECTED';result.className=`result ${data.mentioned?'':'not-detected'}`;result.innerHTML=`<span class="mono">${status} / ${model.toUpperCase()}</span><strong>${data.mentioned?'Your signal is present.':'Your signal is missing.'}</strong><p>${data.excerpt||'No additional detail was returned.'}</p>`;result.hidden=false}
async function runCheck(e){e.preventDefault();const form=e.currentTarget,brand=document.getElementById('brand').value.trim(),topic=document.getElementById('topic').value.trim(),visual=document.querySelector('.check-visual'),result=document.getElementById('result'),button=form.querySelector('button');if(!brand||!topic){form.reportValidity();return}button.disabled=true;setButtonLabel(button,'Scanning answers');visual.classList.add('scanning');result.hidden=true;let data;try{if(API_ENDPOINT){const response=await fetch(API_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brand,topic})});if(!response.ok)throw Error();data=await response.json()}else{await new Promise(resolve=>setTimeout(resolve,1900));data=demoResult(brand,topic)}}catch{data={mentioned:false,model:'Model unavailable',excerpt:'We could not complete this check. Please try again.'}}finally{visual.classList.remove('scanning');button.disabled=false;setButtonLabel(button,'Scan AI answers')}showResult(result,data);result.scrollIntoView({block:'nearest',behavior:'smooth'})}
function initSound(){const btn=document.getElementById('sound-toggle');let ctx,gain,source;function start(){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;ctx=new AudioContext();gain=ctx.createGain();gain.gain.value=0;const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.13;source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=260;source.connect(filter).connect(gain).connect(ctx.destination);source.start();gain.gain.linearRampToValueAtTime(.045,ctx.currentTime+.8)}function stop(){if(!ctx)return;gain.gain.linearRampToValueAtTime(0,ctx.currentTime+.8);const activeSource=source,activeContext=ctx;ctx=null;setTimeout(()=>{activeSource.stop();activeContext.close()},850)}btn.addEventListener('click',()=>{const on=!btn.classList.contains('playing');if(on)start();btn.classList.toggle('playing',on);btn.setAttribute('aria-label',on?'Turn ambient sound off':'Turn ambient sound on');btn.setAttribute('aria-pressed',String(on));localStorage.setItem('signal-sound',on?'on':'off')})}
function initTheme(){
  const btn=document.getElementById('theme-toggle');
  const saved=localStorage.getItem('signal-theme');
  const systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  function setTheme(theme){
    const dark=theme==='dark';
    document.documentElement.dataset.theme=theme;
    btn.setAttribute('aria-pressed',String(dark));
    btn.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
    btn.querySelector('.theme-label').textContent=dark?'Light':'Dark';
  }
  setTheme(saved || (systemDark?'dark':'light'));
  btn.addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    setTheme(next);
    localStorage.setItem('signal-theme',next);
  });
}
document.addEventListener('DOMContentLoaded',()=>{initTheme();initSweep();initMotion();initSound();const form=document.getElementById('check-form');form.addEventListener('submit',runCheck);form.addEventListener('input',()=>document.getElementById('result').hidden=true)});
