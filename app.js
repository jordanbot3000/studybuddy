/* ============ Study Buddy ============ */
(function(){
  "use strict";

  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
  const CHECK  = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const notes  = ["C","C\u266F","D\u266D","D","D\u266F","E\u266D","E","F","F\u266F","G\u266D","G","G\u266F","A\u266D","A","A\u266F","B\u266D","B"];
  const dirs   = [{t:"Ascending",a:"\u2191"},{t:"Descending",a:"\u2193"}];
  const perms  = ["1-2-3","1-3-2","2-1-3","2-3-1","3-1-2","3-2-1"];
  const minors = ["PD 2m","PD 3m","PD 6m","Open 2m","Open 3m","Open 6m","B+C 2m","B+C 3m","B+C 6m"];
  const SOUNDS = ["chime","beeps","bell","ping","marimba","arcade"];
  const VOICES = [["classic","Classic"],["warm","Warm"],["sharp","Sharp"],["wood","Wood"],["click","Click"],["pulse","Pulse"]];

  const pick = a => a[Math.floor(Math.random()*a.length)];
  const rand = (lo,hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
  const cap  = s => s.charAt(0).toUpperCase()+s.slice(1);
  const pad2 = n => (n<10?'0':'')+n;
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const $ = id => document.getElementById(id);
  const mascot = $("mascot");
  function hop(){ mascot.classList.remove("hop"); void mascot.offsetWidth; mascot.classList.add("hop"); }

  document.addEventListener('contextmenu', e=>e.preventDefault());

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
    const fs = v>99?0.34:v>9?0.42:0.46;
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:'+sz+'px;height:'+sz+'px;background:var(--ink);border-radius:'+Math.round(sz*0.2)+'px;color:var(--fill);font-weight:700;font-size:'+Math.round(sz*fs)+'px;box-sizing:border-box;">'+v+'</span>';
  }
  function renderDie(v, sides, sz){ return sides<=6 ? pipDie(v,sz) : numeralDie(v,sz); }
  function renderDiceRow(pairs){
    const n=pairs.length, sz = n===1?42:n<=2?34:n<=4?28:22;
    return '<span class="drow">'+pairs.map(p=>'<span class="dcell">'+renderDie(p.v,p.s,sz)+'</span>').join('')+'</span>';
  }
  function updateDiceChip(){ const c=$("die-cfg"); if(c) c.textContent = dice.length>1 ? "\u00B1" : "+"; }
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
  $("die-tile").onclick  = () => rollDice();
  $("perm-tile").onclick = () => reel("perm-out", ()=>pick(perms));
  $("min-tile").onclick  = () => reel("min-out", ()=>pick(minors));
  /* Direction: directional sweep — ascending rises from below, descending drops from above */
  $("dir-tile").onclick  = () => { const d=pick(dirs); const el=$("dir-out"); el.textContent=d.a+" "+d.t; el.style.animation='none'; void el.offsetWidth; el.style.animation=(d.t==="Ascending"?'dirUp':'dirDown')+' .48s ease'; hop(); };

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
  let sheetCancel=null;
  function openSheet(title, body, onCancel){
    sheetCancel = onCancel || null;
    sheet.innerHTML = '<div class="sheet-head"><h3>'+title+'</h3><button class="sheet-x" id="__sx" aria-label="Cancel">'+ICON_X+'</button></div>'+body;
    $("__sx").onclick = ()=>{ const c=sheetCancel; sheetCancel=null; if(c)c(); closeSheet(); };
    overlay.classList.add("open");
  }
  function closeSheet(){ sheetCancel=null; overlay.classList.remove("open"); }
  overlay.addEventListener("click", e=>{ if(e.target===overlay){ const c=sheetCancel; sheetCancel=null; if(c)c(); closeSheet(); } });

  function makeWheel(el, values, current, onChange){
    const CELL=52;
    el.innerHTML = values.map(v=>'<div class="wcell">'+v+'</div>').join('');
    const idx = Math.max(0, values.indexOf(current));
    function mark(){ const i=Math.round(el.scrollLeft/CELL); for(let j=0;j<el.children.length;j++) el.children[j].classList.toggle('mid', j===i); }
    let t;
    el.addEventListener('scroll', ()=>{ mark(); clearTimeout(t); t=setTimeout(()=>{ const i=Math.max(0,Math.min(values.length-1,Math.round(el.scrollLeft/CELL))); onChange(values[i]); }, 110); });
    setTimeout(()=>{ el.scrollLeft = idx*CELL; mark(); }, 60);
  }

  /* Vertical wheel: smooth momentum + tap/hold to type (placeholder, no text-selection). */
  function makeVWheel(el, values, current, onChange, opts){
    opts=opts||{};
    const CELL=44, H=176, baseline=H/2-CELL/2, n=values.length, speed=opts.speed||1, pad=!!opts.pad;
    const disp=v=>pad?pad2(v):(''+v);
    const list=document.createElement('div'); list.className='vlist';
    list.innerHTML = values.map(v=>'<div class="vcell">'+disp(v)+'</div>').join('');
    const input=document.createElement('input'); input.type='text'; input.inputMode='numeric'; input.className='vtype';
    el.innerHTML=''; el.appendChild(list); el.appendChild(input);
    const maxPos=(n-1)*CELL;
    let pos=Math.max(0,values.indexOf(current))*CELL, raf=0;
    const clampPos=p=>Math.max(0,Math.min(maxPos,p));
    const curIdx=()=>Math.max(0,Math.min(n-1,Math.round(pos/CELL)));
    function paint(anim){
      list.style.transition=anim?'transform .22s cubic-bezier(.2,.8,.3,1)':'none';
      list.style.transform='translateY('+(baseline-pos)+'px)';
      const ci=curIdx();
      for(let j=0;j<n;j++) list.children[j].classList.toggle('mid', j===ci);
    }
    function commit(){ onChange(values[curIdx()]); }
    function stopAnim(){ if(raf){cancelAnimationFrame(raf);raf=0;} }
    function snap(){ pos=clampPos(Math.round(pos/CELL)*CELL); paint(true); commit(); }
    paint(false);
    let dragging=false, moved=false, startY=0, startPos=0, lastY=0, lastT=0, pv=0;
    el.addEventListener('pointerdown', e=>{
      if(e.target===input) return;
      stopAnim(); dragging=true; moved=false; startY=e.clientY; startPos=pos; lastY=e.clientY; lastT=e.timeStamp; pv=0;
      try{el.setPointerCapture(e.pointerId);}catch(_){}
      e.preventDefault();
    });
    el.addEventListener('pointermove', e=>{
      if(!dragging) return;
      const dy=e.clientY-startY; if(Math.abs(dy)>6) moved=true;
      pos=clampPos(startPos - dy*speed);
      const dt=e.timeStamp-lastT; if(dt>0){ pv=Math.max(-2.4,Math.min(2.4,-((e.clientY-lastY)/dt)*speed)); }
      lastY=e.clientY; lastT=e.timeStamp;
      paint(false);
    });
    function fling(){
      let last=performance.now();
      function frame(now){
        const dt=Math.min(32, now-last); last=now;
        pos+=pv*dt;
        if(pos<0){pos=0;pv=0;} else if(pos>maxPos){pos=maxPos;pv=0;}
        paint(false);
        pv*=Math.pow(0.94, dt/16.67);
        if(Math.abs(pv)>0.03){ raf=requestAnimationFrame(frame); }
        else { raf=0; snap(); }
      }
      raf=requestAnimationFrame(frame);
    }
    el.addEventListener('pointerup', ()=>{
      if(!dragging) return; dragging=false;
      if(!moved){ openType(); return; }
      if(Math.abs(pv)>0.06) fling(); else snap();
    });
    el.addEventListener('pointercancel', ()=>{ if(dragging){ dragging=false; snap(); } });
    function openType(){ input.value=''; input.placeholder=disp(values[curIdx()]); input.style.display='block'; setTimeout(()=>{ input.focus(); },0); }
    input.addEventListener('input', ()=>{ const raw=input.value.replace(/\D/g,''); if(raw==='') return; let v=parseInt(raw,10); if(isNaN(v))return; v=Math.max(values[0],Math.min(values[n-1],v)); pos=clampPos((v-values[0])*CELL); paint(false); commit(); });
    input.addEventListener('blur', ()=>{ input.style.display='none'; snap(); });
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') input.blur(); });
    el._scrollTo=v=>{ const i=values.indexOf(v); if(i>=0){ stopAnim(); pos=i*CELL; paint(true); } };
    return el;
  }

  /* ---------- Dice config (type-able sides up to 999) ---------- */
  function openDiceCfg(){
    const snap=dice.slice();
    openSheet('Dice',
      '<div class="dicePrev t-amber" id="dicePrev"></div><div class="diceCap" id="diceCap"></div><div id="diceList"></div><button class="addDie" id="addDie">+ Add die</button><button class="done" id="setDone">Done</button>',
      ()=>{ dice=snap.slice(); diceDefault(); updateDiceChip(); });
    function renderList(){ $("diceList").innerHTML = dice.map((s,i)=>'<div class="dieRow"><span class="dieRowLabel">Die '+(i+1)+'</span><div class="stp"><button data-act="m" data-i="'+i+'">&minus;</button><input class="dieSides" type="text" inputmode="numeric" maxlength="3" data-i="'+i+'" value="'+s+'"><button data-act="p" data-i="'+i+'">+</button></div>'+(dice.length>1?'<button class="rm" data-act="rm" data-i="'+i+'">\u00D7</button>':'<span style="width:30px;flex:0 0 30px"></span>')+'</div>').join(''); }
    function preview(){ $("dicePrev").innerHTML = renderDiceRow(dice.map(s=>({v:s,s}))); $("diceCap").textContent = (dice.every(s=>s===dice[0])?(dice.length+' \u00D7 '+dice[0]+'-sided'):dice.map(s=>s+'-sided').join(' \u00B7 ')); updateDiceChip(); }
    function refresh(){ renderList(); preview(); }
    $("diceList").addEventListener('click', e=>{ const b=e.target.closest("button"); if(!b)return; const i=+b.dataset.i,act=b.dataset.act; if(act==="m")dice[i]=Math.max(2,dice[i]-1); else if(act==="p")dice[i]=Math.min(999,dice[i]+1); else if(act==="rm"&&dice.length>1)dice.splice(i,1); refresh(); });
    $("diceList").addEventListener('input', e=>{ const inp=e.target.closest('.dieSides'); if(!inp)return; const i=+inp.dataset.i; const raw=inp.value.replace(/\D/g,''); if(raw==='')return; dice[i]=Math.max(2,Math.min(999,parseInt(raw,10))); preview(); });
    $("diceList").addEventListener('blur', e=>{ const inp=e.target.closest('.dieSides'); if(!inp)return; const i=+inp.dataset.i; dice[i]=Math.max(2,Math.min(999,parseInt(inp.value.replace(/\D/g,''),10)||6)); refresh(); }, true);
    $("addDie").onclick=()=>{ if(dice.length<8){ dice.push(6); refresh(); } };
    refresh();
    $("setDone").onclick=()=>{ diceDefault(); updateDiceChip(); closeSheet(); };
  }
  $("die-cfg").onclick = e => { e.stopPropagation(); openDiceCfg(); };
  updateDiceChip();

  /* ---------- Fret: tap = roll, hold = options ---------- */
  let fmin=1, fmax=12;
  function openFretCfg(){
    const snap={a:fmin,b:fmax};
    openSheet('Fret range',
      '<div class="vwheels"><div class="vwheel-wrap"><span class="vwlabel">Low</span><div class="vwheel" id="frLoW"></div></div><div class="vwheel-wrap"><span class="vwlabel">High</span><div class="vwheel" id="frHiW"></div></div></div><button class="done" id="frDone">Done</button>',
      ()=>{ fmin=snap.a; fmax=snap.b; });
    const fr=[]; for(let i=0;i<=24;i++) fr.push(i);
    let loW, hiW;
    loW=makeVWheel($("frLoW"), fr, fmin, v=>{ fmin=v; if(fmin>fmax){ fmax=fmin; hiW&&hiW._scrollTo(fmax); } }, {speed:1});
    hiW=makeVWheel($("frHiW"), fr, fmax, v=>{ fmax=v; if(fmax<fmin){ fmin=fmax; loW&&loW._scrollTo(fmin); } }, {speed:1});
    $("frDone").onclick=closeSheet;
  }
  (function(){
    const ft=$("fret-tile"); let lp=null, longFired=false, dx=0, dy=0;
    ft.addEventListener('pointerdown', e=>{ longFired=false; dx=e.clientX; dy=e.clientY; lp=setTimeout(()=>{ longFired=true; if(navigator.vibrate)try{navigator.vibrate(10);}catch(_){}; openFretCfg(); }, 480); });
    ft.addEventListener('pointermove', e=>{ if(Math.hypot(e.clientX-dx,e.clientY-dy)>10){ clearTimeout(lp); } });
    ["pointerup","pointercancel","pointerleave"].forEach(ev=>ft.addEventListener(ev, ()=>clearTimeout(lp)));
    ft.addEventListener('click', ()=>{ if(longFired){ longFired=false; return; } reel("fret-out", ()=>String(rand(fmin,fmax))); });
  })();

  /* ---------- Time signature ---------- */
  let tsNum=4, tsDen=4;
  function applyTS(){ beatsPerBar=tsNum; $("tsig").textContent=tsNum+"/"+tsDen; buildBeats(); }
  function openTimeSig(){
    const snap={n:tsNum,d:tsDen};
    openSheet('Time signature',
      '<div class="tsface"><div class="wheel-wrap"><div class="wheel" id="wheelNum"></div></div><div class="tsline"></div><div class="wheel-wrap"><div class="wheel" id="wheelDen"></div></div></div><button class="done" id="tsDone">Done</button>',
      ()=>{ tsNum=snap.n; tsDen=snap.d; applyTS(); });
    const nums=[]; for(let i=1;i<=51;i++) nums.push(i);
    makeWheel($("wheelNum"), nums, tsNum, v=>{ tsNum=v; applyTS(); });
    makeWheel($("wheelDen"), [1,2,4,8,16,32,64], tsDen, v=>{ tsDen=v; applyTS(); });
    $("tsDone").onclick = closeSheet;
  }
  $("tsig").onclick = openTimeSig;

  /* ---------- Timer module ---------- */
  let timers=[], timerTick=null, tMin=5, tSec=0, activeTid=null;
  const remOf = t => t.running ? (t.endTime-Date.now())/1000 : t.remaining;
  function timeParts(sec){ sec=Math.max(0,Math.ceil(sec)); const m=Math.floor(sec/60), s=sec%60; return '<span class="tt-m">'+pad2(m)+'</span><span class="tt-c">:</span><span class="tt-s">'+pad2(s)+'</span>'; }
  function renderDots(nn, active){
    const el=$("timer-dots"); if(!el) return;
    if(nn<=1){ el.innerHTML=''; return; }
    active=Math.max(0,Math.min(nn-1,active));
    const MAX=7; let html='';
    if(nn<=MAX){ for(let i=0;i<nn;i++) html+='<span class="tdot'+(i===active?' on':'')+'"></span>'; }
    else{ let start=Math.max(0,Math.min(active-3,nn-MAX));
      for(let s=0;s<MAX;s++){ const i=start+s; let cls='tdot'; if(i===active)cls+=' on';
        if((s===0&&start>0)||(s===MAX-1&&start+MAX<nn)) cls+=' xs';
        else if((s===1&&start>0)||(s===MAX-2&&start+MAX<nn)) cls+=' sm';
        html+='<span class="'+cls+'"></span>'; } }
    el.innerHTML=html;
  }
  function renderTimerModule(){
    const host=$("timer-tile"); if(!host) return;
    if(timers.length===0){
      host.classList.add('empty'); activeTid=null;
      host.innerHTML='<span class="tile-label">Timer</span><span class="win"><span class="tile-out timer-time dim">'+timeParts(0)+'</span></span>';
      return;
    }
    host.classList.remove('empty');
    if(!activeTid || !timers.some(t=>t.id===activeTid)) activeTid=timers[0].id;
    const slides=timers.map(t=>'<div class="timer-slide'+(t.running?' running':' paused')+'" data-id="'+t.id+'"><span class="tile-out timer-time">'+timeParts(remOf(t))+'</span></div>').join('');
    host.innerHTML='<span class="timer-glyph cancel" id="timer-cancel" role="button" aria-label="Cancel timer">\u00D7</span>'
      +'<span class="timer-glyph add" id="timer-plus" role="button" aria-label="Add timer">+</span>'
      +'<span class="tile-label">Timer</span>'
      +'<span class="win"><div class="timer-track" id="timer-track">'+slides+'</div></span>'
      +'<div class="timer-dots" id="timer-dots"></div>';
    const track=$("timer-track");
    const startIdx=Math.max(0,timers.findIndex(t=>t.id===activeTid));
    track.addEventListener('scroll', ()=>{ const w=track.clientWidth||1; const i=Math.round(track.scrollLeft/w); activeTid=(timers[i]||timers[0]).id; renderDots(timers.length,i); });
    renderDots(timers.length, startIdx);
    if(startIdx>0) setTimeout(()=>{ track.scrollLeft=startIdx*(track.clientWidth||1); },0);
  }
  function updateTimerCounts(){
    timers.forEach(t=>{ const sl=document.querySelector('.timer-slide[data-id="'+t.id+'"]'); if(!sl) return; const sec=Math.max(0,Math.ceil(remOf(t))), m=Math.floor(sec/60), s=sec%60; const mm=sl.querySelector('.tt-m'), ss=sl.querySelector('.tt-s'); if(mm)mm.textContent=pad2(m); if(ss)ss.textContent=pad2(s); });
  }
  function tickTimers(){
    const now=Date.now(); let finished=false;
    timers.forEach(t=>{ if(t.running){ t.remaining=(t.endTime-now)/1000; if(t.remaining<=0 && !t.done){ t.done=true; finished=true; playAlarm(alarmKind); if(navigator.vibrate) try{navigator.vibrate([200,120,200]);}catch(e){} } } });
    if(finished){ timers=timers.filter(t=>!t.done); renderTimerModule(); }
    else updateTimerCounts();
    if(timers.length===0){ clearInterval(timerTick); timerTick=null; renderTimerModule(); }
  }
  function ensureTimerTick(){ if(!timerTick) timerTick=setInterval(tickTimers,250); }
  function addTimer(total){ if(total<=0) return; const id='t'+Date.now()+Math.floor(Math.random()*999); timers.push({id, total, remaining:total, endTime:Date.now()+total*1000, running:true}); activeTid=id; renderTimerModule(); ensureTimerTick(); }
  function removeTimer(id){ timers=timers.filter(x=>x.id!==id); if(timers.length===0 && timerTick){ clearInterval(timerTick); timerTick=null; } renderTimerModule(); }
  function togglePause(id){
    const t=timers.filter(x=>x.id===id)[0]; if(!t) return;
    if(t.running){ t.remaining=(t.endTime-Date.now())/1000; t.running=false; } else { t.endTime=Date.now()+Math.max(0,t.remaining)*1000; t.running=true; ensureTimerTick(); }
    const sl=document.querySelector('.timer-slide[data-id="'+id+'"]'); if(sl){ sl.classList.toggle('running',t.running); sl.classList.toggle('paused',!t.running); }
  }
  $("timer-tile").addEventListener('click', e=>{
    if(e.target.closest('#timer-plus')){ openTimer(); return; }
    if(e.target.closest('#timer-cancel')){ if(activeTid) removeTimer(activeTid); return; }
    const slide=e.target.closest('.timer-slide'); if(slide){ togglePause(slide.dataset.id); return; }
    if(timers.length===0){ openTimer(); }
  });
  let alarmKind="chime";
  function openTimer(){
    const soundList = SOUNDS.map(k=>'<button class="sound-opt'+(k===alarmKind?' sel':'')+'" data-k="'+k+'"><span>'+cap(k)+'</span><span class="chk">'+CHECK+'</span></button>').join('');
    openSheet('New timer',
      '<div class="vwheels tw"><div class="vwheel-wrap"><span class="vwlabel">min</span><div class="vwheel" id="wMin"></div></div>'
      +'<div class="vwsep">:</div>'
      +'<div class="vwheel-wrap"><span class="vwlabel">sec</span><div class="vwheel" id="wSec"></div></div></div>'
      +'<div class="sect-h">Sound</div><div class="sound-list" id="almList">'+soundList+'</div>'
      +'<button class="done" id="tAdd">Add timer</button>', null);
    const mins=[]; for(let i=0;i<=99;i++) mins.push(i);
    const secs=[]; for(let i=0;i<=59;i++) secs.push(i);
    makeVWheel($("wMin"), mins, tMin, v=>{ tMin=v; }, {speed:1, pad:true});
    makeVWheel($("wSec"), secs, tSec, v=>{ tSec=v; }, {speed:1, pad:true});
    $("almList").onclick=e=>{ const b=e.target.closest(".sound-opt"); if(!b)return; alarmKind=b.dataset.k; [].forEach.call(e.currentTarget.children,c=>c.classList.toggle("sel",c===b)); playAlarm(alarmKind); };
    $("tAdd").onclick=()=>{ if(tMin*60+tSec>0){ addTimer(tMin*60+tSec); closeSheet(); } };
  }
  renderTimerModule();

  /* ---------- Audio ---------- */
  let ctx=null, master=null, playing=false, bpm=100, mult=1, beatsPerBar=4, nextTime=0, tick=0, timer=null, clickVoice="sharp";
  const queue=[]; let beatEls=[];
  const metEl=$("met");
  const playIcon=$("play-icon"), playText=$("play-text");
  playIcon.innerHTML = ICON_PLAY;

  function ensureCtx(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 1.0; master.connect(ctx.destination);
      ctx.onstatechange = ()=>{ if(!document.hidden && (ctx.state==="interrupted"||ctx.state==="suspended")){ ctx.resume(); } };
    }
    if(ctx.state!=="running") ctx.resume();
    return ctx;
  }
  function unlockAudio(){ try{ ensureCtx(); const b=ctx.createBuffer(1,1,22050); const s=ctx.createBufferSource(); s.buffer=b; s.connect(master); s.start(0); }catch(e){} }
  function recover(){ if(ctx){ if(ctx.state!=="running") ctx.resume(); if(playing){ nextTime = ctx.currentTime + 0.06; queue.length=0; } } }
  document.addEventListener("visibilitychange", ()=>{ if(document.hidden){ if(ctx && ctx.state==="running"){ try{ctx.suspend();}catch(e){} } } else recover(); });
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

  function clickSound(time, kind){
    if(clickVoice==="classic"){
      const cfg=kind==="accent"?{f:1750,v:1.0}:kind==="med"?{f:1400,v:0.82}:kind==="main"?{f:1150,v:0.72}:{f:980,v:0.34};
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type="sine"; o.frequency.value=cfg.f;
      g.gain.setValueAtTime(0.0001,time); g.gain.exponentialRampToValueAtTime(cfg.v,time+0.001); g.gain.exponentialRampToValueAtTime(0.0001,time+0.05);
      o.connect(g); g.connect(master); o.start(time); o.stop(time+0.06);
    } else if(clickVoice==="warm"){
      const cfg=kind==="accent"?{f:1200,v:1.0}:kind==="med"?{f:1020,v:0.86}:kind==="main"?{f:860,v:0.78}:{f:660,v:0.4};
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type="triangle"; o.frequency.value=cfg.f;
      g.gain.setValueAtTime(0.0001,time); g.gain.exponentialRampToValueAtTime(cfg.v,time+0.001); g.gain.exponentialRampToValueAtTime(0.0001,time+0.07);
      o.connect(g); g.connect(master); o.start(time); o.stop(time+0.08);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type="sine"; o2.frequency.value=cfg.f*0.5;
      g2.gain.setValueAtTime(0.0001,time); g2.gain.exponentialRampToValueAtTime(cfg.v*0.55,time+0.002); g2.gain.exponentialRampToValueAtTime(0.0001,time+0.1);
      o2.connect(g2); g2.connect(master); o2.start(time); o2.stop(time+0.11);
    } else if(clickVoice==="wood"){
      const cfg=kind==="accent"?{f:1050,v:1.0}:kind==="med"?{f:860,v:0.86}:kind==="main"?{f:760,v:0.78}:{f:580,v:0.4};
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type="triangle"; o.frequency.setValueAtTime(cfg.f*1.5,time); o.frequency.exponentialRampToValueAtTime(cfg.f,time+0.02);
      g.gain.setValueAtTime(0.0001,time); g.gain.exponentialRampToValueAtTime(cfg.v,time+0.001); g.gain.exponentialRampToValueAtTime(0.0001,time+0.028);
      o.connect(g); g.connect(master); o.start(time); o.stop(time+0.04);
    } else if(clickVoice==="click"){
      const cfg=kind==="accent"?{f:2800,v:1.0}:kind==="med"?{f:2400,v:0.86}:kind==="main"?{f:2150,v:0.8}:{f:1650,v:0.46};
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type="sine"; o.frequency.value=cfg.f;
      g.gain.setValueAtTime(0.0001,time); g.gain.exponentialRampToValueAtTime(cfg.v,time+0.0004); g.gain.exponentialRampToValueAtTime(0.0001,time+0.014);
      o.connect(g); g.connect(master); o.start(time); o.stop(time+0.02);
    } else if(clickVoice==="pulse"){
      const cfg=kind==="accent"?{f:1300,v:0.98}:kind==="med"?{f:1080,v:0.8}:kind==="main"?{f:940,v:0.72}:{f:720,v:0.38};
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type="sine"; o.frequency.value=cfg.f;
      g.gain.setValueAtTime(0.0001,time); g.gain.linearRampToValueAtTime(cfg.v,time+0.006); g.gain.exponentialRampToValueAtTime(0.0001,time+0.09);
      o.connect(g); g.connect(master); o.start(time); o.stop(time+0.11);
    } else {
      const cfg=kind==="accent"?{f:2200,v:1.0}:kind==="med"?{f:1800,v:0.82}:kind==="main"?{f:1660,v:0.78}:{f:1245,v:0.42};
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type="square"; o.frequency.value=cfg.f;
      g.gain.setValueAtTime(0.0001,time); g.gain.exponentialRampToValueAtTime(cfg.v,time+0.0006); g.gain.exponentialRampToValueAtTime(0.0001,time+0.032);
      o.connect(g); g.connect(master); o.start(time); o.stop(time+0.04);
    }
  }
  function previewClick(){ ensureCtx(); const t=ctx.currentTime+0.04; ["accent","main","main","main"].forEach((k,i)=>clickSound(t+i*0.25,k)); }

  function openMetSound(){
    const snap=clickVoice;
    const list = VOICES.map(([k,label])=>'<button class="sound-opt'+(k===clickVoice?' sel':'')+'" data-k="'+k+'"><span>'+label+'</span><span class="chk">'+CHECK+'</span></button>').join('');
    openSheet('Metronome sound', '<div class="sound-list" id="voiceList">'+list+'</div><button class="done" id="msDone">Done</button>', ()=>{ clickVoice=snap; });
    $("voiceList").onclick=e=>{ const b=e.target.closest(".sound-opt"); if(!b)return; clickVoice=b.dataset.k; [].forEach.call(e.currentTarget.children,c=>c.classList.toggle("sel",c===b)); previewClick(); };
    $("msDone").onclick=closeSheet;
  }
  $("met-sound-btn").onclick = openMetSound;

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

  /* ---------- Circular knob ---------- */
  const dial=$("dial"), num=$("bpm-num");
  const clamp = v => Math.max(10,Math.min(500,v));
  function setBpm(v){ bpm=clamp(Math.round(v)); num.value=bpm; updateTempo(); }
  let wheelRot=0, dragging=false, lastAng=0;
  const GAIN = 14;
  function angOf(e){ const r=dial.getBoundingClientRect(); return Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2)); }
  dial.addEventListener("pointerdown", e=>{ if(e.target.closest("#play-btn")) return; dragging=true; lastAng=angOf(e); try{dial.setPointerCapture(e.pointerId);}catch(_){} e.preventDefault(); });
  dial.addEventListener("pointermove", e=>{ if(!dragging)return; const a=angOf(e); let d=a-lastAng; if(d>Math.PI)d-=2*Math.PI; if(d<-Math.PI)d+=2*Math.PI; wheelRot+=d*180/Math.PI; $("dialTicks").setAttribute("transform","rotate("+wheelRot.toFixed(1)+" 100 100)"); setBpm(bpm + d*GAIN); lastAng=a; });
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>dial.addEventListener(ev, ()=>{ dragging=false; }));

  num.addEventListener("focus", ()=>{ metEl.classList.add("editing"); });
  num.addEventListener("input", () => { const v=parseInt(num.value,10); if(!isNaN(v)){ bpm=clamp(v); updateTempo(); } });
  num.addEventListener("change", () => { let v=parseInt(num.value,10); if(isNaN(v)) v=100; setBpm(v); });
  num.addEventListener("blur", ()=>{ metEl.classList.remove("editing"); });
  num.addEventListener("keydown", e => { if(e.key==="Enter") num.blur(); });

  function holdRepeat(btn, fn){ let iv,to; const go=e=>{ e.preventDefault(); fn(); to=setTimeout(()=>{ iv=setInterval(fn,70); },400); }; const end=()=>{ clearTimeout(to); clearInterval(iv); }; btn.addEventListener("pointerdown",go); ["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,end)); }
  holdRepeat($("minus"), ()=>setBpm(bpm-1));
  holdRepeat($("plus"),  ()=>setBpm(bpm+1));

  let taps=[];
  $("tap-btn").onclick = () => { const t=performance.now(); taps.push(t); taps=taps.filter(x=>t-x<3000); if(taps.length>=2){ let sum=0; for(let i=1;i<taps.length;i++) sum+=taps[i]-taps[i-1]; setBpm(60000/(sum/(taps.length-1))); } };

  updateTempo();

  /* ---------- 180 flip ---------- */
  let flipReady=false, baseSign=null, pendSign=null, pendCount=0;
  function onMotion(e){
    const g=e.accelerationIncludingGravity; if(!g || g.y==null) return;
    const mag=Math.hypot(g.x||0,g.y||0,g.z||0)||1;
    if(Math.abs(g.y)/mag < 0.3) return;
    const sign = g.y>0 ? 1 : -1;
    if(baseSign===null){ baseSign=sign; return; }
    const want = (sign!==baseSign);
    if(want !== document.body.classList.contains('flipped')){
      if(pendSign===want) pendCount++; else { pendSign=want; pendCount=1; }
      if(pendCount>=3){ document.body.classList.toggle('flipped', want); pendCount=0; }
    } else pendCount=0;
  }
  function enableFlip(){
    if(flipReady) return;
    const DM=window.DeviceMotionEvent;
    if(!DM) return;
    if(typeof DM.requestPermission==='function'){
      DM.requestPermission().then(s=>{ if(s==='granted'){ window.addEventListener('devicemotion', onMotion); flipReady=true; } }).catch(()=>{});
    } else { window.addEventListener('devicemotion', onMotion); flipReady=true; }
  }
  document.addEventListener("pointerdown", ()=>{ unlockAudio(); enableFlip(); }, {once:true});

  if("serviceWorker" in navigator){ window.addEventListener("load", ()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }); }
})();
