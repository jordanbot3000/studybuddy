/* ============ Study Buddy ============ */
(function(){
  "use strict";

  const ICON_PLAY  = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

  const notes  = ["C","C\u266F","D\u266D","D","D\u266F","E\u266D","E","F","F\u266F","G\u266D","G","G\u266F","A\u266D","A","A\u266F","B\u266D","B"];
  const dirs   = [{t:"Ascending",a:"\u2191"},{t:"Descending",a:"\u2193"}];
  const perms  = ["1-2-3","1-3-2","2-1-3","2-3-1","3-1-2","3-2-1"];
  const minors = ["2m PD","3m PD","6m PD","2m open","3m open","6m open","2m B+C","3m B+C","6m B+C"];
  const NUMWORDS = ["zero","One","Two","Three","Four","Five","Six","Seven","Eight"];

  const pick = a => a[Math.floor(Math.random()*a.length)];
  const rand = (lo,hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const $ = id => document.getElementById(id);
  const mascot = $("mascot");
  function hop(){ mascot.classList.remove("hop"); void mascot.offsetWidth; mascot.classList.add("hop"); }

  /* ---------- Dice (list of dice, each its own sides) ---------- */
  let dice = [6];
  function pipDie(v, sz){
    const pat = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]}[v] || [4];
    const pip = Math.max(4,Math.round(sz*0.15)), pad = Math.round(sz*0.12);
    let cells="";
    for(let k=0;k<9;k++) cells += '<span style="width:'+pip+'px;height:'+pip+'px;border-radius:50%;background:'+(pat.indexOf(k)>-1?'var(--fill)':'transparent')+';align-self:center;justify-self:center;"></span>';
    return '<span style="display:inline-grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);width:'+sz+'px;height:'+sz+'px;gap:2px;padding:'+pad+'px;box-sizing:border-box;background:var(--ink);border-radius:'+Math.round(sz*0.2)+'px;">'+cells+'</span>';
  }
  function numeralDie(v, sz){
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:'+sz+'px;height:'+sz+'px;background:var(--ink);border-radius:'+Math.round(sz*0.2)+'px;color:var(--fill);font-weight:700;font-size:'+Math.round(sz*0.46)+'px;box-sizing:border-box;">'+v+'</span>';
  }
  function renderDie(v, s, sz){ return s<=6 ? pipDie(v,sz) : numeralDie(v,sz); }
  function renderDiceRow(pairs){
    const n=pairs.length, sz = n===1?44:n<=2?36:n<=4?30:24;
    return '<span style="display:inline-flex;gap:5px;align-items:center;flex-wrap:wrap;justify-content:center;">'+pairs.map(p=>renderDie(p.v,p.s,sz)).join('')+'</span>';
  }
  function diceCaption(){
    const same = dice.every(s=>s===dice[0]);
    if(same){
      const c = dice.length<=8?NUMWORDS[dice.length]:dice.length;
      return c+' '+dice[0]+'-sided '+(dice.length===1?'die':'dice');
    }
    return dice.map(s=>s+'-sided').join(' \u00B7 ');
  }
  $("die-out").innerHTML = renderDiceRow(dice.map(s=>({v:1,s})));

  /* ---------- Reel (fast digital cycle) ---------- */
  function reel(id, sampleHTML){
    const el = $(id);
    if(el._spin) return;
    el._spin = true;
    const final = sampleHTML();
    let i=0; const n=6;
    hop();
    const step=()=>{
      if(i<n){ el.innerHTML = sampleHTML(); i++; setTimeout(step, 40); }
      else { el.innerHTML = final; el._spin=false; }
    };
    step();
  }

  $("key-tile").onclick  = () => reel("key-out", ()=>pick(notes));
  $("fret-tile").onclick = () => reel("fret-out", ()=>String(rand(fmin,fmax)));
  $("die-tile").onclick  = () => reel("die-out", ()=>renderDiceRow(dice.map(s=>({v:rand(1,s),s}))));
  $("perm-tile").onclick = () => reel("perm-out", ()=>pick(perms));
  $("min-tile").onclick  = () => reel("min-out", ()=>pick(minors));
  $("dir-tile").onclick  = () => { const d=pick(dirs); $("dir-out").textContent = d.a+" "+d.t; };

  /* ---------- Shape cycle (clean fill states, no scaling) ---------- */
  const shapes = ["C","A","G","E","D"];
  let order = shuffle([0,1,2,3,4]), sPos = -1;
  function renderShape(){
    $("shape-out").innerHTML = shapes.map((s,i)=>{
      let cls="scir";
      if(i===order[sPos]) cls+=" cur";
      else if(order.indexOf(i) < sPos) cls+=" done";
      return '<span class="'+cls+'">'+s+'</span>';
    }).join("");
  }
  renderShape();
  $("shape-tile").onclick = () => {
    sPos++; if(sPos>=5){ order = shuffle([0,1,2,3,4]); sPos=0; }
    renderShape(); hop();
  };

  $("ps-toggle").addEventListener("change", e => $("drawer").classList.toggle("open", e.target.checked));

  /* ---------- Bottom-sheet ---------- */
  const overlay=$("overlay"), sheet=$("sheet");
  function openSheet(html){ sheet.innerHTML=html; overlay.classList.add("open"); }
  function closeSheet(){ overlay.classList.remove("open"); }
  overlay.addEventListener("click", e=>{ if(e.target===overlay) closeSheet(); });

  /* ---------- Settings (frets + dice) ---------- */
  let fmin=1, fmax=12;
  function openSettings(){
    openSheet(
      '<h3>Settings</h3>'+
      '<div class="sect"><div class="sect-h">Frets</div>'+
        '<div class="rangelabel">Frets <b id="frText">'+fmin+'\u2013'+fmax+'</b></div>'+
        '<div class="rangewrap">'+
          '<div class="rangetrack"><div class="rangefill" id="rangefill"></div></div>'+
          '<input type="range" id="frLo" min="0" max="24" value="'+fmin+'">'+
          '<input type="range" id="frHi" min="0" max="24" value="'+fmax+'">'+
        '</div>'+
      '</div>'+
      '<div class="sect"><div class="sect-h">Dice</div>'+
        '<div class="dicePrev t-amber" id="dicePrev"></div>'+
        '<div class="diceCap" id="diceCap"></div>'+
        '<div id="diceList"></div>'+
        '<button class="addDie" id="addDie">+ Add die</button>'+
      '</div>'+
      '<button class="done" id="setDone">Done</button>'
    );
    // Frets: dual-thumb range
    const lo=$("frLo"), hi=$("frHi"), fill=$("rangefill"), txt=$("frText");
    const updFret=(who)=>{
      let a=+lo.value, b=+hi.value;
      if(a>b){ if(who==="lo"){ b=a; hi.value=a; } else { a=b; lo.value=b; } }
      fmin=a; fmax=b;
      fill.style.left=(fmin/24*100)+'%';
      fill.style.width=((fmax-fmin)/24*100)+'%';
      txt.textContent=fmin+'\u2013'+fmax;
    };
    lo.oninput=()=>updFret("lo"); hi.oninput=()=>updFret("hi"); updFret();
    // Dice list
    function renderDiceList(){
      $("diceList").innerHTML = dice.map((s,i)=>
        '<div class="dieRow">'+
          '<span class="dieRowLabel">Die '+(i+1)+'</span>'+
          '<div class="stp"><button data-act="m" data-i="'+i+'">&minus;</button><span class="v">'+s+'</span><button data-act="p" data-i="'+i+'">+</button></div>'+
          (dice.length>1?'<button class="rm" data-act="rm" data-i="'+i+'" aria-label="Remove die">\u00D7</button>':'<span style="width:30px;flex:0 0 30px"></span>')+
        '</div>'
      ).join('');
    }
    function refreshDice(){
      renderDiceList();
      $("dicePrev").innerHTML = renderDiceRow(dice.map(s=>({v:s,s})));
      $("diceCap").textContent = diceCaption();
    }
    $("diceList").onclick = e=>{
      const b=e.target.closest("button"); if(!b) return;
      const i=+b.dataset.i, act=b.dataset.act;
      if(act==="m") dice[i]=Math.max(2,dice[i]-1);
      else if(act==="p") dice[i]=Math.min(100,dice[i]+1);
      else if(act==="rm" && dice.length>1) dice.splice(i,1);
      refreshDice();
    };
    $("addDie").onclick = ()=>{ if(dice.length<8){ dice.push(6); refreshDice(); } };
    refreshDice();
    $("setDone").onclick=()=>{ $("die-out").innerHTML=renderDiceRow(dice.map(s=>({v:1,s}))); closeSheet(); };
  }
  $("settings-btn").onclick = openSettings;

  /* ---------- Time signature ---------- */
  let tsNum=4, tsDen=4;
  function openTimeSig(){
    openSheet(
      '<h3>Time signature</h3>'+
      '<div style="text-align:center;margin-bottom:20px;"><span class="frac"><span id="tsN">'+tsNum+'</span><span class="bar"></span><span id="tsD">'+tsDen+'</span></span></div>'+
      '<div class="row"><span class="lbl">Beats per bar</span><div class="stp"><button id="tsNm">&minus;</button><span class="v" id="tsNv">'+tsNum+'</span><button id="tsNp">+</button></div></div>'+
      '<div class="row" style="align-items:flex-start;"><span class="lbl">Note value</span><div class="pills" id="tsDp">'+[1,2,4,8,16,32,64].map(d=>'<button class="pill'+(d===tsDen?' sel':'')+'" data-d="'+d+'">'+d+'</button>').join('')+'</div></div>'+
      '<button class="done" id="tsDone">Done</button>'
    );
    const upd=()=>{ $("tsN").textContent=tsNum; $("tsD").textContent=tsDen; $("tsNv").textContent=tsNum; };
    $("tsNm").onclick=()=>{ tsNum=Math.max(1,tsNum-1); upd(); };
    $("tsNp").onclick=()=>{ tsNum=Math.min(51,tsNum+1); upd(); };
    $("tsDp").onclick=e=>{ const b=e.target.closest("button"); if(!b)return; tsDen=+b.dataset.d; [].forEach.call(e.currentTarget.children,c=>c.classList.toggle("sel",c===b)); upd(); };
    $("tsDone").onclick=()=>{ beatsPerBar=tsNum; $("tsig").textContent=tsNum+"/"+tsDen; buildBeats(); closeSheet(); };
  }
  $("tsig").onclick = openTimeSig;

  /* ---------- Metronome ---------- */
  let ctx=null, playing=false, bpm=100, mult=1, beatsPerBar=4, nextTime=0, tick=0, timer=null;
  const queue=[]; let beatEls=[];
  const metEl=$("met");
  const playIcon=$("play-icon"), playText=$("play-text");
  playIcon.innerHTML = ICON_PLAY;

  function tempoColor(v){
    const stops=[[40,[47,169,138]],[90,[74,144,217]],[130,[142,134,232]],[180,[224,152,42]],[240,[224,96,122]]];
    v=Math.max(40,Math.min(240,v));
    for(let i=0;i<stops.length-1;i++){
      const p0=stops[i][0],c0=stops[i][1],p1=stops[i+1][0],c1=stops[i+1][1];
      if(v<=p1){ const f=(v-p0)/(p1-p0); return 'rgb('+c0.map((c,j)=>Math.round(c+(c1[j]-c)*f)).join(',')+')'; }
    }
    return 'rgb(224,96,122)';
  }
  function updateTempo(){ metEl.style.setProperty('--tempo', tempoColor(bpm)); }
  updateTempo();

  function buildBeats(){
    const c=$("beats"); c.innerHTML="";
    const n=beatsPerBar;
    let sz,gp;
    if(n<=6){sz=14;gp=10;} else if(n<=10){sz=11;gp=7;} else if(n<=16){sz=9;gp=5;} else if(n<=28){sz=7;gp=4;} else {sz=5;gp=3;}
    c.style.gap=gp+"px";
    for(let i=0;i<n;i++){ const d=document.createElement("div"); d.className="beat"; d.style.width=sz+"px"; d.style.height=sz+"px"; c.appendChild(d); }
    beatEls=[].slice.call(c.children);
  }
  buildBeats();

  function clickSound(time, kind){
    const o=ctx.createOscillator(), g=ctx.createGain();
    const cfg = kind==="accent"?{f:1600,v:0.7} : kind==="med"?{f:1300,v:0.5} : kind==="main"?{f:1050,v:0.45} : {f:900,v:0.16};
    o.frequency.value=cfg.f;
    g.gain.setValueAtTime(0.0001,time);
    g.gain.exponentialRampToValueAtTime(cfg.v, time+0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, time+0.045);
    o.connect(g); g.connect(ctx.destination);
    o.start(time); o.stop(time+0.06);
  }
  function schedule(){
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
  function startMet(){
    if(!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==="suspended") ctx.resume();
    playing=true; tick=0; nextTime=ctx.currentTime+0.05; queue.length=0;
    playIcon.innerHTML = ICON_PAUSE; playText.textContent="Stop";
    timer=setInterval(schedule,25); requestAnimationFrame(draw);
  }
  function stopMet(){
    playing=false; clearInterval(timer);
    beatEls.forEach(e=>e.classList.remove("on","accent"));
    playIcon.innerHTML = ICON_PLAY; playText.textContent="Start";
  }
  $("play-btn").onclick = () => playing?stopMet():startMet();

  const multBtn=$("mult");
  multBtn.addEventListener("click", () => {
    const on = multBtn.classList.toggle("active");
    multBtn.setAttribute("aria-pressed", on);
    $("subind").classList.toggle("on", on);   // indicator blinks on its own clock via CSS
    mult = on ? 2 : 1;
  });

  const slider=$("bpm"), num=$("bpm-num");
  const clamp = v => Math.max(40,Math.min(240,v));
  function setBpm(v){ bpm=clamp(Math.round(v)); num.value=bpm; slider.value=bpm; updateTempo(); }
  slider.oninput = e => setBpm(+e.target.value);
  num.addEventListener("input", () => { const v=parseInt(num.value,10); if(!isNaN(v)){ bpm=clamp(v); slider.value=bpm; updateTempo(); } });
  num.addEventListener("change", () => { let v=parseInt(num.value,10); if(isNaN(v)) v=100; setBpm(v); });
  num.addEventListener("keydown", e => { if(e.key==="Enter") num.blur(); });

  function holdRepeat(btn, fn){
    let iv, to;
    const go=e=>{ e.preventDefault(); fn(); to=setTimeout(()=>{ iv=setInterval(fn,70); },400); };
    const end=()=>{ clearTimeout(to); clearInterval(iv); };
    btn.addEventListener("pointerdown",go);
    ["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,end));
  }
  holdRepeat($("minus"), ()=>setBpm(bpm-1));
  holdRepeat($("plus"),  ()=>setBpm(bpm+1));

  let taps=[];
  $("tap-btn").onclick = () => {
    const t=performance.now(); taps.push(t); taps=taps.filter(x=>t-x<3000);
    if(taps.length>=2){ let sum=0; for(let i=1;i<taps.length;i++) sum+=taps[i]-taps[i-1]; setBpm(60000/(sum/(taps.length-1))); }
  };

  /* ---------- PWA service worker ---------- */
  if("serviceWorker" in navigator){
    window.addEventListener("load", ()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); });
  }
})();
