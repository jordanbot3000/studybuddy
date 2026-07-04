/* ============ Study Buddy ============ */
(function(){
  "use strict";

  const ICON_PLAY  = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_STOP  = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
  const ICON_TP_PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const ICON_TP_PLAY  = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  const notes  = ["C","C\u266F","D\u266D","D","D\u266F","E\u266D","E","F","F\u266F","G\u266D","G","G\u266F","A\u266D","A","A\u266F","B\u266D","B"];
  const dirs   = [{t:"Ascending",a:"\u2191"},{t:"Descending",a:"\u2193"}];
  const perms  = ["1-2-3","1-3-2","2-1-3","2-3-1","3-1-2","3-2-1"];
  const minors = ["PD 2m","PD 3m","PD 6m","Open 2m","Open 3m","Open 6m","B+C 2m","B+C 3m","B+C 6m"];
  const NUMWORDS = ["zero","One","Two","Three","Four","Five","Six","Seven","Eight"];
  const SOUNDS = ["chime","beeps","bell","ping","marimba","arcade"];

  const pick = a => a[Math.floor(Math.random()*a.length)];
  const rand = (lo,hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
  const cap  = s => s.charAt(0).toUpperCase()+s.slice(1);
  const pad2 = n => (n<10?'0':'')+n;
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const $ = id => document.getElementById(id);
  const mascot = $("mascot");
  function hop(){ mascot.classList.remove("hop"); void mascot.offsetWidth; mascot.classList.add("hop"); }

  /* ---------- Dice ---------- */
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
  function showTotal(sum){ const t=$("die-total"); t.textContent=sum; t.classList.add("show"); }
  function diceDefault(){ $("die-out").innerHTML = renderDiceRow(dice.map(s=>({v:1,s}))); showTotal(dice.length); }
  diceDefault();
  function rollDice(){
    const el=$("die-out");
    if(el._spin) return;
    el._spin=true; hop();
    const pairs = dice.map(s=>({v:rand(1,s), s}));
    let i=0; const n=6;
    const step=()=>{
      if(i<n){ el.innerHTML = renderDiceRow(dice.map(s=>({v:rand(1,s),s}))); i++; setTimeout(step,40); }
      else{ el.innerHTML = renderDiceRow(pairs); showTotal(pairs.reduce((a,p)=>a+p.v,0)); el._spin=false; }
    };
    step();
  }

  /* ---------- Reel ---------- */
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

  /* ---------- Shape (SVG) ---------- */
  const shapes = ["C","A","G","E","D"];
  let order = shuffle([0,1,2,3,4]), sPos = -1;
  const shapeOut = $("shape-out");
  (function(){
    const R=10, cw=28, W=5*cw, H=28;
    let s='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="overflow:visible">';
    for(let i=0;i<5;i++){ const cx=i*cw+11, cy=H/2;
      s+='<g style="transition:opacity .16s ease"><circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" style="stroke:var(--ink);stroke-width:1.5px;transition:fill .16s ease"/><text x="'+cx+'" y="'+cy+'" text-anchor="middle" dominant-baseline="central" style="font-size:11px;font-weight:600;transition:fill .16s ease">'+shapes[i]+'</text></g>';
    }
    shapeOut.innerHTML = s+'</svg>';
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

  /* ---------- Sheet ---------- */
  const overlay=$("overlay"), sheet=$("sheet");
  function openSheet(html){ sheet.innerHTML=html; overlay.classList.add("open"); }
  function closeSheet(){ overlay.classList.remove("open"); }
  overlay.addEventListener("click", e=>{ if(e.target===overlay) closeSheet(); });

  /* Horizontal wheel (time signature) */
  function makeWheel(el, values, current, onChange){
    const CELL=52;
    el.innerHTML = values.map(v=>'<div class="wcell">'+v+'</div>').join('');
    const idx = Math.max(0, values.indexOf(current));
    function mark(){ const i=Math.round(el.scrollLeft/CELL); for(let j=0;j<el.children.length;j++) el.children[j].classList.toggle('mid', j===i); }
    let t;
    el.addEventListener('scroll', ()=>{ mark(); clearTimeout(t); t=setTimeout(()=>{ const i=Math.max(0,Math.min(values.length-1,Math.round(el.scrollLeft/CELL))); onChange(values[i]); }, 110); });
    setTimeout(()=>{ el.scrollLeft = idx*CELL; mark(); }, 60);
  }

  /* Vertical wheel (Apple-style: frets, timer) */
  function makeVWheel(el, values, current, onChange){
    const CELL=44;
    el.innerHTML = values.map(v=>'<div class="vcell">'+v+'</div>').join('');
    function mark(){ const i=Math.round(el.scrollTop/CELL); for(let j=0;j<el.children.length;j++) el.children[j].classList.toggle('mid', j===i); }
    let t;
    el.addEventListener('scroll', ()=>{ mark(); clearTimeout(t); t=setTimeout(()=>{ const i=Math.max(0,Math.min(values.length-1,Math.round(el.scrollTop/CELL))); onChange(values[i]); }, 110); });
    el._scrollTo = (v)=>{ const i=values.indexOf(v); if(i>=0){ el.scrollTop=i*CELL; mark(); } };
    setTimeout(()=>{ el.scrollTop = Math.max(0,values.indexOf(current))*CELL; mark(); }, 50);
    return el;
  }

  /* ---------- Settings (frets + dice) ---------- */
  let fmin=1, fmax=12, alarmKind="chime";
  function openSettings(){
    openSheet(
      '<h3>Settings</h3>'+
      '<div class="sect"><div class="sect-h">Fret range</div>'+
        '<div class="vwheels"><div class="vwheel-wrap"><span class="vwlabel">Low</span><div class="vwheel" id="frLoW"></div></div>'+
        '<div class="vwheel-wrap"><span class="vwlabel">High</span><div class="vwheel" id="frHiW"></div></div><div class="vwband"></div></div>'+
      '</div>'+
      '<div class="sect"><div class="sect-h">Dice</div>'+
        '<div class="dicePrev t-amber" id="dicePrev"></div><div class="diceCap" id="diceCap"></div>'+
        '<div id="diceList"></div><button class="addDie" id="addDie">+ Add die</button>'+
      '</div>'+
      '<button class="done" id="setDone">Done</button>'
    );
    const fr=[]; for(let i=0;i<=24;i++) fr.push(i);
    let loW, hiW;
    loW=makeVWheel($("frLoW"), fr, fmin, v=>{ fmin=v; if(fmin>fmax){ fmax=fmin; hiW&&hiW._scrollTo(fmax); } });
    hiW=makeVWheel($("frHiW"), fr, fmax, v=>{ fmax=v; if(fmax<fmin){ fmin=fmax; loW&&loW._scrollTo(fmin); } });
    function renderDiceList(){ $("diceList").innerHTML = dice.map((s,i)=>'<div class="dieRow"><span class="dieRowLabel">Die '+(i+1)+'</span><div class="stp"><button data-act="m" data-i="'+i+'">&minus;</button><span class="v">'+s+'</span><button data-act="p" data-i="'+i+'">+</button></div>'+(dice.length>1?'<button class="rm" data-act="rm" data-i="'+i+'">\u00D7</button>':'<span style="width:30px;flex:0 0 30px"></span>')+'</div>').join(''); }
    function refreshDice(){ renderDiceList(); $("dicePrev").innerHTML = renderDiceRow(dice.map(s=>({v:s,s}))); $("diceCap").textContent = diceCaption(); }
    $("diceList").onclick=e=>{ const b=e.target.closest("button"); if(!b)return; const i=+b.dataset.i,act=b.dataset.act; if(act==="m")dice[i]=Math.max(2,dice[i]-1); else if(act==="p")dice[i]=Math.min(100,dice[i]+1); else if(act==="rm"&&dice.length>1)dice.splice(i,1); refreshDice(); };
    $("addDie").onclick=()=>{ if(dice.length<8){ dice.push(6); refreshDice(); } };
    refreshDice();
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
  function fmtTime(sec){ sec=Math.max(0,Math.ceil(sec)); const m=Math.floor(sec/60), s=sec%60; return m+':'+pad2(s); }
  function renderTimers(){
    const strip=$("timers-strip");
    if(timers.length===0){ strip.innerHTML=""; strip.classList.remove("show"); return; }
    strip.classList.add("show");
    strip.innerHTML = timers.map(t=>{
      const rem = t.running ? (t.endTime-Date.now())/1000 : t.remaining;
      const frac = Math.max(0,Math.min(1,rem/t.total));
      return '<div class="tchip'+(t.running?'':' paused')+'" data-id="'+t.id+'">'
        +'<span class="tstate">'+(t.running?ICON_TP_PAUSE:ICON_TP_PLAY)+'</span>'
        +'<span class="ttime">'+fmtTime(rem)+'</span>'
        +'<button class="tx" data-id="'+t.id+'" aria-label="Cancel">\u00D7</button>'
        +'<div class="tbar"><div class="tbar-fill" style="width:'+(frac*100)+'%"></div></div>'
        +'</div>';
    }).join('');
  }
  function ensureTimerTick(){
    if(timerTick) return;
    timerTick=setInterval(()=>{
      const now=Date.now();
      timers.forEach(t=>{ if(t.running){ t.remaining=(t.endTime-now)/1000; if(t.remaining<=0){ t.done=true; playAlarm(alarmKind); if(navigator.vibrate) try{navigator.vibrate([200,120,200]);}catch(e){} } } });
      timers = timers.filter(t=>!t.done);
      renderTimers();
      if(timers.length===0){ clearInterval(timerTick); timerTick=null; }
    }, 250);
  }
  function addTimer(total){ if(total<=0) return; timers.push({id:'t'+Date.now()+Math.floor(Math.random()*999), total:total, remaining:total, endTime:Date.now()+total*1000, running:true}); renderTimers(); ensureTimerTick(); }
  $("timers-strip").addEventListener("click", e=>{
    const chip=e.target.closest(".tchip"); if(!chip) return;
    const t=timers.filter(x=>x.id===chip.dataset.id)[0]; if(!t) return;
    if(e.target.closest(".tx")){ timers=timers.filter(x=>x.id!==t.id); }
    else { // whole chip toggles pause (large target)
      if(t.running){ t.remaining=(t.endTime-Date.now())/1000; t.running=false; }
      else { t.endTime=Date.now()+Math.max(0,t.remaining)*1000; t.running=true; ensureTimerTick(); }
    }
    renderTimers();
  });
  function openTimer(){
    const soundList = SOUNDS.map(k=>'<button class="sound-opt'+(k===alarmKind?' sel':'')+'" data-k="'+k+'"><span>'+cap(k)+'</span><span class="chk">'+CHECK+'</span></button>').join('');
    openSheet('<h3>Timer</h3>'
      +'<div class="vwheels tw"><div class="vwheel-wrap"><span class="vwlabel">min</span><div class="vwheel" id="wMin"></div></div>'
      +'<div class="vwsep">:</div>'
      +'<div class="vwheel-wrap"><span class="vwlabel">sec</span><div class="vwheel" id="wSec"></div></div><div class="vwband"></div></div>'
      +'<div class="typerow">or type <input type="text" id="tmType" inputmode="numeric" maxlength="3">:<input type="text" id="tsType" inputmode="numeric" maxlength="2"></div>'
      +'<div class="sect-h">Sound</div><div class="sound-list" id="almList">'+soundList+'</div>'
      +'<button class="done" id="tAdd">Add timer</button>');
    const mins=[]; for(let i=0;i<=99;i++) mins.push(i);
    const secs=[]; for(let i=0;i<=59;i++) secs.push(i);
    const tmType=$("tmType"), tsType=$("tsType");
    let wMin, wSec;
    function syncType(){ if(document.activeElement!==tmType) tmType.value=tMin; if(document.activeElement!==tsType) tsType.value=pad2(tSec); }
    wMin=makeVWheel($("wMin"), mins, tMin, v=>{ tMin=v; syncType(); });
    wSec=makeVWheel($("wSec"), secs, tSec, v=>{ tSec=v; syncType(); });
    syncType();
    tmType.addEventListener("input", ()=>{ let v=parseInt(tmType.value.replace(/\D/g,''),10); if(isNaN(v))v=0; v=Math.max(0,Math.min(99,v)); tMin=v; wMin._scrollTo(v); });
    tsType.addEventListener("input", ()=>{ let v=parseInt(tsType.value.replace(/\D/g,''),10); if(isNaN(v))v=0; v=Math.max(0,Math.min(59,v)); tSec=v; wSec._scrollTo(v); });
    tmType.addEventListener("blur", ()=>{ tmType.value=tMin; });
    tsType.addEventListener("blur", ()=>{ tsType.value=pad2(tSec); });
    $("almList").onclick=e=>{ const b=e.target.closest(".sound-opt"); if(!b)return; alarmKind=b.dataset.k; [].forEach.call(e.currentTarget.children,c=>c.classList.toggle("sel",c===b)); playAlarm(alarmKind); };
    $("tAdd").onclick=()=>{ if(tMin*60+tSec>0){ addTimer(tMin*60+tSec); closeSheet(); } };
  }
  $("timer-btn").onclick = openTimer;

  /* ---------- Audio ---------- */
  let ctx=null, master=null, playing=false, bpm=100, mult=1, beatsPerBar=4, nextTime=0, tick=0, timer=null;
  const queue=[]; let beatEls=[];
  const metEl=$("met");
  const playIcon=$("play-icon"), playText=$("play-text");
  playIcon.innerHTML = ICON_PLAY;

  function ensureCtx(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      ctx.onstatechange = ()=>{ if(ctx.state==="interrupted" || ctx.state==="suspended"){ ctx.resume(); } };
    }
    if(ctx.state!=="running") ctx.resume();
    return ctx;
  }
  function unlockAudio(){ try{ ensureCtx(); const b=ctx.createBuffer(1,1,22050); const s=ctx.createBufferSource(); s.buffer=b; s.connect(master); s.start(0); }catch(e){} }
  document.addEventListener("pointerdown", unlockAudio, {once:true});
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
    else if(kind==="bell"){ tone(660,t,1.3,"sine",0.55); tone(990,t,1.3,"sine",0.22); tone(1320,t,0.9,"sine",0.1); }
    else if(kind==="ping"){ tone(1245,t,0.35,"sine",0.55); tone(1245,t+0.42,0.5,"sine",0.4); }
    else if(kind==="marimba"){ [523.25,783.99,1046.5].forEach((f,i)=>tone(f,t+i*0.13,0.35,"triangle",0.5)); }
    else if(kind==="arcade"){ [440,587,740,988].forEach((f,i)=>tone(f,t+i*0.08,0.1,"square",0.4)); }
    else { [523.25,659.25,783.99].forEach((f,i)=>tone(f,t+i*0.16,0.5,"sine",0.5)); }
  }

  function tempoRGB(v){
    const stops=[[40,[47,169,138]],[90,[74,144,217]],[130,[142,134,232]],[180,[224,152,42]],[240,[224,96,122]]];
    v=Math.max(40,Math.min(240,v));
    for(let i=0;i<stops.length-1;i++){ const p0=stops[i][0],c0=stops[i][1],p1=stops[i+1][0],c1=stops[i+1][1]; if(v<=p1){ const f=(v-p0)/(p1-p0); return c0.map((c,j)=>Math.round(c+(c1[j]-c)*f)); } }
    return [224,96,122];
  }
  const rgbStr = c => 'rgb('+c[0]+','+c[1]+','+c[2]+')';
  function updateTempo(){ metEl.style.setProperty('--tempo', rgbStr(tempoRGB(bpm))); }

  function buildBeats(){
    const c=$("beats"); c.innerHTML="";
    const n=beatsPerBar; let sz,gp;
    if(n<=6){sz=14;gp=10;} else if(n<=10){sz=11;gp=7;} else if(n<=16){sz=9;gp=5;} else if(n<=28){sz=7;gp=4;} else {sz=5;gp=3;}
    c.style.gap=gp+"px";
    for(let i=0;i<n;i++){ const d=document.createElement("div"); d.className="beat"; d.style.width=sz+"px"; d.style.height=sz+"px"; c.appendChild(d); }
    beatEls=[].slice.call(c.children);
  }
  buildBeats();

  /* Sharp, piercing click — original single tick, brighter + louder */
  function clickSound(time, kind){
    const cfg = kind==="accent"?{f:2200,v:1.0} : kind==="med"?{f:1800,v:0.82} : kind==="main"?{f:1660,v:0.78} : {f:1245,v:0.42};
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type="square"; o.frequency.value=cfg.f;
    g.gain.setValueAtTime(0.0001,time);
    g.gain.exponentialRampToValueAtTime(cfg.v,time+0.0006);   // very sharp attack
    g.gain.exponentialRampToValueAtTime(0.0001,time+0.032);   // tight decay
    o.connect(g); g.connect(master); o.start(time); o.stop(time+0.04);
  }
  function schedule(){
    if(ctx.currentTime - nextTime > 0.2){ nextTime = ctx.currentTime + 0.06; queue.length=0; }
    const group = (tsDen===8 && tsNum%3===0 && tsNum>3) ? 3 : tsNum;
    while(nextTime < ctx.currentTime + 0.1){
      const isMain = tick % mult === 0;
      const mainBeat = Math.floor(tick/mult) % beatsPerBar;
      const kind = !isMain ? "sub" : (mainBeat===0 ? "accent" : (mainBeat%group===0 ? "med" : "main"));
      clickSound(nextTime, kind);
      queue.push({time:nextTime, isMain, b:mainBeat, accent:(isMain && mainBeat===0)});
      nextTime += (60/bpm)/mult; tick++;
    }
  }
  function draw(){
    if(!playing) return;
    const now = ctx.currentTime;
    while(queue.length && queue[0].time <= now){
      const nx = queue.shift();
      if(nx.isMain){ beatEls.forEach(e=>e.classList.remove("on","accent")); const el = beatEls[nx.b]; if(el){ el.classList.add("on"); if(nx.accent) el.classList.add("accent"); setTimeout(()=>el.classList.remove("on","accent"),110); } }
    }
    requestAnimationFrame(draw);
  }
  function startMet(){ ensureCtx(); playing=true; tick=0; nextTime=ctx.currentTime+0.08; queue.length=0; playIcon.innerHTML=ICON_STOP; playText.textContent="Stop"; metEl.classList.add("running"); timer=setInterval(schedule,25); requestAnimationFrame(draw); }
  function stopMet(){ playing=false; clearInterval(timer); beatEls.forEach(e=>e.classList.remove("on","accent")); playIcon.innerHTML=ICON_PLAY; playText.textContent="Start"; metEl.classList.remove("running"); }
  $("play-btn").onclick = () => playing?stopMet():startMet();

  const multBtn=$("mult");
  multBtn.addEventListener("click", () => { const on = multBtn.classList.toggle("active"); multBtn.setAttribute("aria-pressed", on); $("subind").classList.toggle("on", on); mult = on ? 2 : 1; });

  /* ---------- Circular tempo dial (360° spinner, transport in center) ---------- */
  const dial=$("dial"), num=$("bpm-num");
  (function(){
    let tk='';
    for(let i=0;i<48;i++){
      const ang=i*(360/48), long=(i%4===0);
      const r1=long?74:81, r2=90, rad=(ang-90)*Math.PI/180;
      const x1=(100+r1*Math.cos(rad)).toFixed(1), y1=(100+r1*Math.sin(rad)).toFixed(1);
      const x2=(100+r2*Math.cos(rad)).toFixed(1), y2=(100+r2*Math.sin(rad)).toFixed(1);
      tk+='<line class="tick'+(long?' long':'')+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"/>';
    }
    $("dialTicks").innerHTML=tk;
  })();
  const clamp = v => Math.max(40,Math.min(240,v));
  function setBpm(v){ bpm=clamp(Math.round(v)); num.value=bpm; updateTempo(); }

  let wheelRot=0, dragging=false, lastAng=0;
  const GAIN = 20; // BPM per radian of spin
  function angOf(e){ const r=dial.getBoundingClientRect(); return Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2)); }
  dial.addEventListener("pointerdown", e=>{ if(e.target.closest("#play-btn")) return; dragging=true; lastAng=angOf(e); try{dial.setPointerCapture(e.pointerId);}catch(_){} e.preventDefault(); });
  dial.addEventListener("pointermove", e=>{ if(!dragging)return; const a=angOf(e); let d=a-lastAng; if(d>Math.PI)d-=2*Math.PI; if(d<-Math.PI)d+=2*Math.PI; wheelRot+=d*180/Math.PI; $("dialTicks").setAttribute("transform","rotate("+wheelRot.toFixed(1)+" 100 100)"); setBpm(bpm + d*GAIN); lastAng=a; });
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>dial.addEventListener(ev, ()=>{ dragging=false; }));

  num.addEventListener("input", () => { const v=parseInt(num.value,10); if(!isNaN(v)){ bpm=clamp(v); updateTempo(); } });
  num.addEventListener("change", () => { let v=parseInt(num.value,10); if(isNaN(v)) v=100; setBpm(v); });
  num.addEventListener("keydown", e => { if(e.key==="Enter") num.blur(); });

  function holdRepeat(btn, fn){ let iv,to; const go=e=>{ e.preventDefault(); fn(); to=setTimeout(()=>{ iv=setInterval(fn,70); },400); }; const end=()=>{ clearTimeout(to); clearInterval(iv); }; btn.addEventListener("pointerdown",go); ["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,end)); }
  holdRepeat($("minus"), ()=>setBpm(bpm-1));
  holdRepeat($("plus"),  ()=>setBpm(bpm+1));

  let taps=[];
  $("tap-btn").onclick = () => { const t=performance.now(); taps.push(t); taps=taps.filter(x=>t-x<3000); if(taps.length>=2){ let sum=0; for(let i=1;i<taps.length;i++) sum+=taps[i]-taps[i-1]; setBpm(60000/(sum/(taps.length-1))); } };

  updateTempo();

  if("serviceWorker" in navigator){ window.addEventListener("load", ()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }); }
})();
