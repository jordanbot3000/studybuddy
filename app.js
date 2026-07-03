/* ============ Study Buddy ============ */
(function(){
  "use strict";

  const ICON_PLAY  = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

  const notes  = ["C","C\u266F","D\u266D","D","D\u266F","E\u266D","E","F","F\u266F","G\u266D","G","G\u266F","A\u266D","A","A\u266F","B\u266D","B"];
  const dirs   = [{t:"Ascending",a:"\u2191"},{t:"Descending",a:"\u2193"}];
  const perms  = ["1-2-3","1-3-2","2-1-3","2-3-1","3-1-2","3-2-1"];
  const minors = ["PD 2m","PD 3m","PD 6m","Open 2m","Open 3m","Open 6m","B+C 2m","B+C 3m","B+C 6m"];
  const NUMWORDS = ["zero","One","Two","Three","Four","Five","Six","Seven","Eight"];

  const pick = a => a[Math.floor(Math.random()*a.length)];
  const rand = (lo,hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const $ = id => document.getElementById(id);
  const mascot = $("mascot");
  function hop(){ mascot.classList.remove("hop"); void mascot.offsetWidth; mascot.classList.add("hop"); }

  /* ---------- Dice: pips for <=6 sides, numerals above; roll shows sum ---------- */
  const PIPS = { 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };
  let dice = [6];
  function pipDie(v, sz){
    const p = PIPS[v] || [4];
    const pip = Math.max(3, Math.round(sz*0.15)), pad = Math.round(sz*0.14);
    let cells="";
    for(let k=0;k<9;k++) cells += '<span style="width:'+pip+'px;height:'+pip+'px;border-radius:50%;background:'+(p.indexOf(k)>-1?'var(--fill)':'transparent')+';align-self:center;justify-self:center;"></span>';
    return '<span style="display:inline-grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);width:'+sz+'px;height:'+sz+'px;gap:2px;padding:'+pad+'px;box-sizing:border-box;background:var(--ink);border-radius:'+Math.round(sz*0.2)+'px;">'+cells+'</span>';
  }
  function numeralDie(v, sz){
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:'+sz+'px;height:'+sz+'px;background:var(--ink);border-radius:'+Math.round(sz*0.2)+'px;color:var(--fill);font-weight:700;font-size:'+Math.round(sz*0.44)+'px;box-sizing:border-box;">'+v+'</span>';
  }
  function renderDie(v, sides, sz){ return sides<=6 ? pipDie(v,sz) : numeralDie(v,sz); }
  function renderDiceRow(pairs){
    const n=pairs.length, sz = n===1?44:n<=2?36:n<=4?30:24;
    return '<span class="drow">'+pairs.map(p=>'<span class="dcell">'+renderDie(p.v,p.s,sz)+'</span>').join('')+'</span>';
  }
  function diceCaption(){
    const same = dice.every(s=>s===dice[0]);
    if(same){ const c = dice.length<=8?NUMWORDS[dice.length]:dice.length; return c+' '+dice[0]+'-sided '+(dice.length===1?'die':'dice'); }
    return dice.map(s=>s+'-sided').join(' \u00B7 ');
  }
  function diceDefault(){
    $("die-out").innerHTML = renderDiceRow(dice.map(s=>({v:1,s})));
    const t=$("die-total"); t.textContent=""; t.classList.remove("show");
  }
  diceDefault();
  function rollDice(){
    const el=$("die-out"), tot=$("die-total");
    if(el._spin) return;
    el._spin=true; hop();
    const pairs = dice.map(s=>({v:rand(1,s), s}));
    tot.textContent=""; tot.classList.remove("show");
    let i=0; const n=6;
    const step=()=>{
      if(i<n){ el.innerHTML = renderDiceRow(dice.map(s=>({v:rand(1,s),s}))); i++; setTimeout(step,40); }
      else{ el.innerHTML = renderDiceRow(pairs); tot.textContent = pairs.reduce((a,p)=>a+p.v,0); tot.classList.add("show"); el._spin=false; }
    };
    step();
  }

  /* ---------- Reel for text tiles ---------- */
  function reel(id, sampleHTML){
    const el = $(id);
    if(el._spin) return;
    el._spin = true;
    const final = sampleHTML();
    let i=0; const n=6;
    hop();
    const step=()=>{ if(i<n){ el.innerHTML = sampleHTML(); i++; setTimeout(step, 40); } else { el.innerHTML = final; el._spin=false; } };
    step();
  }
  $("key-tile").onclick  = () => reel("key-out", ()=>pick(notes));
  $("fret-tile").onclick = () => reel("fret-out", ()=>String(rand(fmin,fmax)));
  $("die-tile").onclick  = () => rollDice();
  $("perm-tile").onclick = () => reel("perm-out", ()=>pick(perms));
  $("min-tile").onclick  = () => reel("min-out", ()=>pick(minors));
  $("dir-tile").onclick  = () => { const d=pick(dirs); $("dir-out").textContent = d.a+" "+d.t; };

  /* ---------- Shape rings (inline SVG, fixed geometry) ---------- */
  const shapes = ["C","A","G","E","D"];
  let order = shuffle([0,1,2,3,4]), sPos = -1;
  const shapeOut = $("shape-out");
  (function(){
    const R=10, cw=28, W=5*cw, H=28;
    let s='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="overflow:visible">';
    for(let i=0;i<5;i++){
      const cx=i*cw+11, cy=H/2;
      s+='<g style="transition:opacity .16s ease">'
        +'<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" style="stroke:var(--ink);stroke-width:1.5px;transition:fill .16s ease"/>'
        +'<text x="'+cx+'" y="'+cy+'" text-anchor="middle" dominant-baseline="central" style="font-size:11px;font-weight:600;transition:fill .16s ease">'+shapes[i]+'</text>'
        +'</g>';
    }
    s+='</svg>';
    shapeOut.innerHTML = s;
  })();
  const gEls = [].slice.call(shapeOut.querySelectorAll('g'));
  function paintShape(){
    gEls.forEach((g,i)=>{
      const circ=g.querySelector('circle'), txt=g.querySelector('text');
      const cur=(i===order[sPos]), done=(order.indexOf(i)<sPos);
      if(cur||done){ circ.style.fill='var(--ink)'; txt.style.fill='var(--fill)'; g.style.opacity=cur?1:0.55; }
      else{ circ.style.fill='transparent'; txt.style.fill='var(--ink)'; g.style.opacity=0.3; }
    });
  }
  paintShape();
  $("shape-tile").onclick = () => { sPos++; if(sPos>=5){ order = shuffle([0,1,2,3,4]); sPos=0; } paintShape(); hop(); };

  $("ps-toggle").addEventListener("change", e => $("drawer").classList.toggle("open", e.target.checked));

  /* ---------- Bottom-sheet ---------- */
  const overlay=$("overlay"), sheet=$("sheet");
  function openSheet(html){ sheet.innerHTML=html; overlay.classList.add("open"); }
  function closeSheet(){ overlay.classList.remove("open"); }
  overlay.addEventListener("click", e=>{ if(e.target===overlay) closeSheet(); });

  /* ---------- Reusable swipe wheel ---------- */
  function makeWheel(el, values, current, onChange){
    const CELL=52;
    el.innerHTML = values.map(v=>'<div class="wcell">'+v+'</div>').join('');
    const idx = Math.max(0, values.indexOf(current));
    function mark(){ const i=Math.round(el.scrollLeft/CELL); for(let j=0;j<el.children.length;j++) el.children[j].classList.toggle('mid', j===i); }
    let t;
    el.addEventListener('scroll', ()=>{ mark(); clearTimeout(t); t=setTimeout(()=>{ const i=Math.max(0,Math.min(values.length-1,Math.round(el.scrollLeft/CELL))); onChange(values[i]); }, 110); });
    setTimeout(()=>{ el.scrollLeft = idx*CELL; mark(); }, 60);
  }

  /* ---------- Settings (frets + dice + timer sound) ---------- */
  let fmin=1, fmax=12, alarmKind="chime";
  function openSettings(){
    openSheet(
      '<h3>Settings</h3>'+
      '<div class="sect"><div class="sect-h">Frets</div>'+
        '<div class="rangelabel">Frets <b id="frText">'+fmin+'\u2013'+fmax+'</b></div>'+
        '<div class="rangewrap"><div class="rangetrack"><div class="rangefill" id="rangefill"></div></div>'+
          '<input type="range" id="frLo" min="0" max="24" value="'+fmin+'"><input type="range" id="frHi" min="0" max="24" value="'+fmax+'"></div>'+
      '</div>'+
      '<div class="sect"><div class="sect-h">Dice</div>'+
        '<div class="dicePrev t-amber" id="dicePrev"></div><div class="diceCap" id="diceCap"></div>'+
        '<div id="diceList"></div><button class="addDie" id="addDie">+ Add die</button>'+
      '</div>'+
      '<div class="sect"><div class="sect-h">Timer sound</div><div class="pills left" id="almPills">'+
        ['chime','beeps','bell'].map(k=>'<button class="pill'+(k===alarmKind?' sel':'')+'" data-k="'+k+'">'+k.charAt(0).toUpperCase()+k.slice(1)+'</button>').join('')+
      '</div></div>'+
      '<button class="done" id="setDone">Done</button>'
    );
    const lo=$("frLo"), hi=$("frHi"), fill=$("rangefill"), txt=$("frText");
    const updFret=(who)=>{ let a=+lo.value,b=+hi.value; if(a>b){ if(who==="lo"){b=a;hi.value=a;}else{a=b;lo.value=b;} } fmin=a;fmax=b; fill.style.left=(fmin/24*100)+'%'; fill.style.width=((fmax-fmin)/24*100)+'%'; txt.textContent=fmin+'\u2013'+fmax; };
    lo.oninput=()=>updFret("lo"); hi.oninput=()=>updFret("hi"); updFret();
    function renderDiceList(){ $("diceList").innerHTML = dice.map((s,i)=>'<div class="dieRow"><span class="dieRowLabel">Die '+(i+1)+'</span><div class="stp"><button data-act="m" data-i="'+i+'">&minus;</button><span class="v">'+s+'</span><button data-act="p" data-i="'+i+'">+</button></div>'+(dice.length>1?'<button class="rm" data-act="rm" data-i="'+i+'">\u00D7</button>':'<span style="width:30px;flex:0 0 30px"></span>')+'</div>').join(''); }
    function refreshDice(){ renderDiceList(); $("dicePrev").innerHTML = renderDiceRow(dice.map(s=>({v:s,s}))); $("diceCap").textContent = diceCaption(); }
    $("diceList").onclick=e=>{ const b=e.target.closest("button"); if(!b)return; const i=+b.dataset.i,act=b.dataset.act; if(act==="m")dice[i]=Math.max(2,dice[i]-1); else if(act==="p")dice[i]=Math.min(100,dice[i]+1); else if(act==="rm"&&dice.length>1)dice.splice(i,1); refreshDice(); };
    $("addDie").onclick=()=>{ if(dice.length<8){ dice.push(6); refreshDice(); } };
    refreshDice();
    $("almPills").onclick=e=>{ const b=e.target.closest("button"); if(!b)return; alarmKind=b.dataset.k; [].forEach.call(e.currentTarget.children,c=>c.classList.toggle("sel",c===b)); playAlarm(alarmKind); };
    $("setDone").onclick=()=>{ diceDefault(); closeSheet(); };
  }
  $("settings-btn").onclick = openSettings;

  /* ---------- Time signature ---------- */
  let tsNum=4, tsDen=4;
  function applyTS(){ beatsPerBar=tsNum; $("tsig").textContent=tsNum+"/"+tsDen; buildBeats(); }
  function openTimeSig(){
    openSheet('<h3>Time signature</h3><div class="tsface"><div class="wheel-wrap"><div class="wheel" id="wheelNum"></div></div><div class="tsline"></div><div class="wheel-wrap"><div class="wheel" id="wheelDen"></div></div></div><button class="done" id="tsDone">Done</button>');
    const nums=[]; for(let i=1;i<=51;i++) nums.push(i);
    makeWheel($("wheelNum"), nums, tsNum, v=>{ tsNum=v; applyTS(); });
    makeWheel($("wheelDen"), [1,2,4,8,16,32,64], tsDen, v=>{ tsDen=v; applyTS(); });
    $("tsDone").onclick = closeSheet;
  }
  $("tsig").onclick = openTimeSig;

  /* ---------- Timers ---------- */
  let timers=[], timerTick=null, tMin=5, tSec=0;
  function fmtTime(sec){ sec=Math.max(0,Math.ceil(sec)); const m=Math.floor(sec/60), s=sec%60; return m+':'+(s<10?'0':'')+s; }
  function renderTimers(){
    const strip=$("timers-strip");
    if(timers.length===0){ strip.innerHTML=""; strip.classList.remove("show"); return; }
    strip.classList.add("show");
    strip.innerHTML = timers.map(t=>{
      const rem=(t.endTime-Date.now())/1000, frac=Math.max(0,Math.min(1,rem/t.total));
      return '<div class="tchip"><span class="ttime">'+fmtTime(rem)+'</span><button class="tx" data-id="'+t.id+'">\u00D7</button><div class="tbar"><div class="tbar-fill" style="width:'+(frac*100)+'%"></div></div></div>';
    }).join('');
  }
  function ensureTimerTick(){
    if(timerTick) return;
    timerTick=setInterval(()=>{
      const now=Date.now();
      timers.forEach(t=>{ if(!t.done && t.endTime<=now){ t.done=true; playAlarm(alarmKind); if(navigator.vibrate) try{navigator.vibrate([200,120,200]);}catch(e){} } });
      timers = timers.filter(t=>!t.done);
      renderTimers();
      if(timers.length===0){ clearInterval(timerTick); timerTick=null; }
    }, 250);
  }
  function addTimer(total){ if(total<=0) return; timers.push({id:'t'+Date.now()+Math.floor(Math.random()*999), total:total, endTime:Date.now()+total*1000}); renderTimers(); ensureTimerTick(); }
  $("timers-strip").addEventListener("click", e=>{ const b=e.target.closest(".tx"); if(!b)return; timers=timers.filter(t=>t.id!==b.dataset.id); renderTimers(); });
  function openTimer(){
    openSheet('<h3>Timer</h3><div class="tpick"><div class="tcol"><div class="wheel-wrap"><div class="wheel" id="wMin"></div></div><span class="tunit">min</span></div><div class="tcolon">:</div><div class="tcol"><div class="wheel-wrap"><div class="wheel" id="wSec"></div></div><span class="tunit">sec</span></div></div><button class="done" id="tAdd">Add timer</button>');
    const mins=[]; for(let i=0;i<=90;i++) mins.push(i);
    const secs=[]; for(let i=0;i<=59;i++) secs.push(i);
    makeWheel($("wMin"), mins, tMin, v=>{ tMin=v; });
    makeWheel($("wSec"), secs, tSec, v=>{ tSec=v; });
    $("tAdd").onclick=()=>{ addTimer(tMin*60+tSec); closeSheet(); };
  }
  $("timer-btn").onclick = openTimer;

  /* ---------- Audio core ---------- */
  let ctx=null, master=null, playing=false, bpm=100, mult=1, beatsPerBar=4, nextTime=0, tick=0, timer=null;
  const queue=[]; let beatEls=[];
  const metEl=$("met");
  const playIcon=$("play-icon"), playText=$("play-text");
  playIcon.innerHTML = ICON_PLAY;

  function ensureCtx(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.75; master.connect(ctx.destination);
      ctx.onstatechange = ()=>{ if(ctx.state==="interrupted" || ctx.state==="suspended"){ ctx.resume(); } };
    }
    if(ctx.state!=="running") ctx.resume();
    return ctx;
  }
  function unlockAudio(){ try{ ensureCtx(); const b=ctx.createBuffer(1,1,22050); const s=ctx.createBufferSource(); s.buffer=b; s.connect(master); s.start(0); }catch(e){} }
  document.addEventListener("pointerdown", unlockAudio, {once:true});

  // recover audio when returning from another app (iOS interrupts the session)
  function recover(){ if(ctx){ if(ctx.state!=="running") ctx.resume(); if(playing){ nextTime = ctx.currentTime + 0.06; queue.length=0; } } }
  document.addEventListener("visibilitychange", ()=>{ if(!document.hidden) recover(); });
  window.addEventListener("focus", recover);
  window.addEventListener("pageshow", recover);

  function tone(freq, start, dur, type, peak){
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type||"sine"; o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001,start);
    g.gain.exponentialRampToValueAtTime(peak||0.6,start+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
    o.connect(g); g.connect(master); o.start(start); o.stop(start+dur+0.02);
  }
  function playAlarm(kind){
    ensureCtx(); const t=ctx.currentTime+0.03;
    if(kind==="beeps"){ [0,0.18,0.36].forEach(dt=>tone(880,t+dt,0.12,"square",0.5)); }
    else if(kind==="bell"){ tone(660,t,1.3,"sine",0.6); tone(990,t,1.3,"sine",0.25); tone(1320,t,0.9,"sine",0.12); }
    else { [523.25,659.25,783.99].forEach((f,i)=>tone(f,t+i*0.16,0.5,"sine",0.5)); }
  }

  /* ---------- Tempo colour ---------- */
  function tempoRGB(v){
    const stops=[[40,[47,169,138]],[90,[74,144,217]],[130,[142,134,232]],[180,[224,152,42]],[240,[224,96,122]]];
    v=Math.max(40,Math.min(240,v));
    for(let i=0;i<stops.length-1;i++){ const p0=stops[i][0],c0=stops[i][1],p1=stops[i+1][0],c1=stops[i+1][1]; if(v<=p1){ const f=(v-p0)/(p1-p0); return c0.map((c,j)=>Math.round(c+(c1[j]-c)*f)); } }
    return [224,96,122];
  }
  const rgbStr = c => 'rgb('+c[0]+','+c[1]+','+c[2]+')';
  function updateTempo(){ metEl.style.setProperty('--tempo', rgbStr(tempoRGB(bpm))); }

  /* ---------- Beat dots ---------- */
  function buildBeats(){
    const c=$("beats"); c.innerHTML="";
    const n=beatsPerBar; let sz,gp;
    if(n<=6){sz=14;gp=10;} else if(n<=10){sz=11;gp=7;} else if(n<=16){sz=9;gp=5;} else if(n<=28){sz=7;gp=4;} else {sz=5;gp=3;}
    c.style.gap=gp+"px";
    for(let i=0;i<n;i++){ const d=document.createElement("div"); d.className="beat"; d.style.width=sz+"px"; d.style.height=sz+"px"; c.appendChild(d); }
    beatEls=[].slice.call(c.children);
  }
  buildBeats();

  /* ---------- Metronome click (deeper + louder: attack tone + low body) ---------- */
  function clickSound(time, kind){
    const cfg = kind==="accent"?{f:1150,v:1.0} : kind==="med"?{f:980,v:0.78} : kind==="main"?{f:820,v:0.7} : {f:640,v:0.34};
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type="triangle"; o.frequency.value=cfg.f;
    g.gain.setValueAtTime(0.0001,time);
    g.gain.exponentialRampToValueAtTime(cfg.v,time+0.001);
    g.gain.exponentialRampToValueAtTime(0.0001,time+0.07);
    o.connect(g); g.connect(master); o.start(time); o.stop(time+0.08);
    const o2=ctx.createOscillator(), g2=ctx.createGain();
    o2.type="sine"; o2.frequency.value=cfg.f*0.5;
    g2.gain.setValueAtTime(0.0001,time);
    g2.gain.exponentialRampToValueAtTime(cfg.v*0.6,time+0.002);
    g2.gain.exponentialRampToValueAtTime(0.0001,time+0.1);
    o2.connect(g2); g2.connect(master); o2.start(time); o2.stop(time+0.11);
  }
  function schedule(){
    if(ctx.currentTime - nextTime > 0.2){ nextTime = ctx.currentTime + 0.06; queue.length=0; }  // avoid burst after a gap
    const group = (tsDen===8 && tsNum%3===0 && tsNum>3) ? 3 : tsNum;
    while(nextTime < ctx.currentTime + 0.1){
      const isMain = tick % mult === 0;
      const mainBeat = Math.floor(tick/mult) % beatsPerBar;
      const kind = !isMain ? "sub" : (mainBeat===0 ? "accent" : (mainBeat%group===0 ? "med" : "main"));
      clickSound(nextTime, kind);
      queue.push({time:nextTime, isMain, b:mainBeat, accent:(isMain && mainBeat===0)});
      nextTime += (60/bpm)/mult;
      tick++;
    }
  }
  function draw(){
    if(!playing) return;
    const now = ctx.currentTime;
    while(queue.length && queue[0].time <= now){
      const nx = queue.shift();
      if(nx.isMain){
        beatEls.forEach(e=>e.classList.remove("on","accent"));
        const el = beatEls[nx.b];
        if(el){ el.classList.add("on"); if(nx.accent) el.classList.add("accent"); setTimeout(()=>el.classList.remove("on","accent"),110); }
      }
    }
    requestAnimationFrame(draw);
  }
  function startMet(){ ensureCtx(); playing=true; tick=0; nextTime=ctx.currentTime+0.08; queue.length=0; playIcon.innerHTML=ICON_PAUSE; playText.textContent="Stop"; timer=setInterval(schedule,25); requestAnimationFrame(draw); }
  function stopMet(){ playing=false; clearInterval(timer); beatEls.forEach(e=>e.classList.remove("on","accent")); playIcon.innerHTML=ICON_PLAY; playText.textContent="Start"; }
  $("play-btn").onclick = () => playing?stopMet():startMet();

  const multBtn=$("mult");
  multBtn.addEventListener("click", () => { const on = multBtn.classList.toggle("active"); multBtn.setAttribute("aria-pressed", on); $("subind").classList.toggle("on", on); mult = on ? 2 : 1; });

  /* ---------- Rotary tempo knob ---------- */
  const knob=$("knob"), num=$("bpm-num");
  const R=40;
  function pt(deg){ const r=deg*Math.PI/180; return {x:50+R*Math.sin(r), y:50-R*Math.cos(r)}; }
  function arcPath(d0,d1){ const p0=pt(d0),p1=pt(d1),large=(d1-d0)>180?1:0; return 'M '+p0.x.toFixed(2)+' '+p0.y.toFixed(2)+' A '+R+' '+R+' 0 '+large+' 1 '+p1.x.toFixed(2)+' '+p1.y.toFixed(2); }
  $("knobTrack").setAttribute('d', arcPath(-135,135));
  function updateKnob(){
    const f=Math.max(0,Math.min(1,(bpm-40)/200)), cur=-135+Math.max(f,0.0001)*270;
    $("knobArc").setAttribute('d', arcPath(-135,cur));
    const h=pt(cur); const hd=$("knobHandle"); hd.setAttribute('cx',h.x.toFixed(2)); hd.setAttribute('cy',h.y.toFixed(2));
  }
  const clamp = v => Math.max(40,Math.min(240,v));
  function setBpm(v){ bpm=clamp(Math.round(v)); num.value=bpm; updateTempo(); updateKnob(); }

  let dragging=false, lastAng=0;
  function angOf(e){ const r=knob.getBoundingClientRect(); return Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2)); }
  knob.addEventListener("pointerdown", e=>{ if(e.target.closest("#bpm-num")) return; dragging=true; lastAng=angOf(e); try{knob.setPointerCapture(e.pointerId);}catch(_){} e.preventDefault(); });
  knob.addEventListener("pointermove", e=>{ if(!dragging)return; const a=angOf(e); let d=a-lastAng; if(d>Math.PI)d-=2*Math.PI; if(d<-Math.PI)d+=2*Math.PI; setBpm(bpm + d*(200/(1.5*Math.PI))); lastAng=a; });
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>knob.addEventListener(ev, ()=>{ dragging=false; }));

  num.addEventListener("input", () => { const v=parseInt(num.value,10); if(!isNaN(v)){ bpm=clamp(v); updateTempo(); updateKnob(); } });
  num.addEventListener("change", () => { let v=parseInt(num.value,10); if(isNaN(v)) v=100; setBpm(v); });
  num.addEventListener("keydown", e => { if(e.key==="Enter") num.blur(); });

  function holdRepeat(btn, fn){ let iv,to; const go=e=>{ e.preventDefault(); fn(); to=setTimeout(()=>{ iv=setInterval(fn,70); },400); }; const end=()=>{ clearTimeout(to); clearInterval(iv); }; btn.addEventListener("pointerdown",go); ["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,end)); }
  holdRepeat($("minus"), ()=>setBpm(bpm-1));
  holdRepeat($("plus"),  ()=>setBpm(bpm+1));

  let taps=[];
  $("tap-btn").onclick = () => { const t=performance.now(); taps.push(t); taps=taps.filter(x=>t-x<3000); if(taps.length>=2){ let sum=0; for(let i=1;i<taps.length;i++) sum+=taps[i]-taps[i-1]; setBpm(60000/(sum/(taps.length-1))); } };

  updateTempo(); updateKnob();

  if("serviceWorker" in navigator){ window.addEventListener("load", ()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }); }
})();
