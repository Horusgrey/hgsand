// THE DEFECTS A DIRECTOR RUN FOUND.
//
// Every assertion here exists because using the app front to back surfaced something that
// 87 green assertions could not see. None of these were found by reasoning about the code;
// all five were found by driving it and then looking at what came out.
import { suite } from './lib.mjs';
const t=suite('qc');
const page=await t.open(1440,900);

t.head('1. the slate may never sit on top of the status pill');
{
  // Found in a stage screenshot: the flat-earth warning read "…so no building g" because
  // the slate is centred, the pill is left-anchored, both live at top:14px with z-index:6,
  // and the slate is later in the DOM. CLAUDE.md: never truncate a warning. A warning
  // painted over is truncated in the only way that matters.
  const widths=[1600,1440,1200,1000,860];
  const r=await page.evaluate(async(ws)=>{
    const out=[];
    gmapz.setEarthMode('flat');
    for(const w of ws){
      // the stage reflows with the window; drive it the way a resize does
      window.dispatchEvent(new Event('resize'));
      await new Promise(r=>setTimeout(r,120));
      gmapz.placeStageChrome();
      await new Promise(r=>setTimeout(r,260));   // let the lowering transition settle
      const a=document.getElementById('loadstat').getBoundingClientRect();
      const s=document.getElementById('slate').getBoundingClientRect();
      out.push({w, hit:!(a.right<=s.left||s.right<=a.left||a.bottom<=s.top||s.bottom<=a.top),
                lowered:document.getElementById('slate').classList.contains('lowered')});
    }
    return out;
  },widths);
  t.ok(r.every(x=>!x.hit),'pill and slate never overlap: '+r.map(x=>x.w+(x.lowered?'↓':'')).join(' '));
  t.ok(await page.evaluate(()=>{
    const p=document.getElementById('loadstat');
    return getComputedStyle(p).textOverflow!=='ellipsis'&&p.scrollWidth<=Math.ceil(p.getBoundingClientRect().width)+1;
  }),'and the pill itself still never clips its own text');
  // Lowering must be a response to a real collision, not a permanent displacement — a
  // slate parked 38px down for ever would be me fixing one layout bug by shipping another.
  const cond=await page.evaluate(async()=>{
    const out={};
    for(const m of ['photoreal','terrain','flat','rejected']){
      gmapz.setEarthMode(m,m==='rejected'?'x':'');
      await new Promise(r=>setTimeout(r,280));
      gmapz.placeStageChrome(); await new Promise(r=>setTimeout(r,240));
      out[m]=document.getElementById('slate').classList.contains('lowered');
    }
    return out;
  });
  t.ok(cond.photoreal===false&&cond.terrain===false,
    'a short pill leaves the slate where it belongs (photoreal/terrain stay put)');
  t.ok(cond.flat===true,'and the long flat-earth warning — the one that got covered — moves it');
}

t.head('2. one number, one value — everywhere the panel quotes it');
{
  // The Length slider wrote S.pathDuration and its own label and nothing else, so the
  // panel summary and the dot-list header went on saying 4.0s while the slider said 7.0.
  const r=await page.evaluate(async()=>{
    gmapz.startPath(-95.5590,45.7973); gmapz.addPathPoint(-95.5540,45.7980);
    gmapz.openSectionByLabel('Path');
    document.querySelector('#pathKind button[data-k="move"]').click();
    const d=document.getElementById('durSlider');
    const read=()=>({slider:document.getElementById('durVal').textContent,
      summary:document.getElementById('pathSummaryTxt').textContent,
      header:[...document.querySelectorAll('#pathList .phdr .tag')].map(x=>x.textContent).join('|')});
    const seen=[];
    for(const v of ['7','2.5','9']){
      d.value=v; d.dispatchEvent(new Event('input',{bubbles:true}));
      d.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(r=>setTimeout(r,160));
      seen.push({v, ...read(), state:gmapz.S.pathDuration});
    }
    return seen;
  });
  const agree=r.every(x=>x.slider===(+x.v).toFixed(1)+'s'
    && x.summary.includes((+x.v).toFixed(1)+'s') && x.header.includes((+x.v).toFixed(1)+'s'));
  t.ok(agree,'slider, summary and dot-list header all quote the same length: '+
    r.map(x=>x.v+'→'+x.slider+'/'+(x.summary.match(/[\d.]+s/)||['?'])[0]).join(' '));
  t.ok(r.every(x=>x.state===+x.v),'and state holds it too');
}

t.head('3. only a name may ellipsis — the One Road law, at panel width');
{
  // "→ 3 CAST RID…" in the path header at the real 320px panel. Values that share a row
  // get SHORTENED to fit; the only thing allowed to truncate is a name.
  const r=await page.evaluate(async()=>{
    for(let i=0;i<7;i++)gmapz.addMarker(-95.5588+i*0.0004,45.7976,0,'person','w'+i,1,0);
    gmapz.S.markers.forEach(m=>m.travels=true);
    gmapz.renderPathList();
    await new Promise(r=>setTimeout(r,200));
    const chip=document.querySelector('.ridechip'), row=chip.closest('.t');
    const rr=row.getBoundingClientRect();
    return {text:chip.textContent.trim(),
            rowOverflow:row.scrollWidth>Math.ceil(rr.width)+1,
            wraps:getComputedStyle(row).flexWrap,
            anyTruncated:[...row.children].some(c=>c.scrollWidth>Math.ceil(c.getBoundingClientRect().width)+1)};
  });
  t.ok(!r.rowOverflow,'the path header row does not overflow its panel');
  t.ok(!r.anyTruncated,'and nothing in it is cut off');
  t.ok(r.wraps==='wrap','it wraps instead, because all four facts have to survive');
  t.ok(/^→ \d+ riding$/.test(r.text),'the riding chip is shortened, not truncated: "'+r.text+'"');
}

t.head('4. the SCREEN GEOMETRY clause is sentences, not one run-on');
{
  // Shipped three days ago: the bits were joined with a space and none of them ended, so
  // every engine prompt carried "…of the previous shot Person 2 is facing screen-left…".
  const r=await page.evaluate(async()=>{
    gmapz.clearPath(); gmapz.S.markers.length=0; gmapz.S.shots.length=0;
    gmapz.addMarker(-95.55600,45.79760,0,'person','Ana',1,90);
    gmapz.addMarker(-95.55520,45.79760,0,'person','Bo',1,270);
    const shoot=async(head,name)=>{
      Object.assign(gmapz.S,{target:{lat:45.79760,lon:-95.55560,h:0},head,tilt:-5,range:70,fov:gmapz.lensToFov(35)});
      gmapz.flyToParams(0); await new Promise(r=>setTimeout(r,260));
      document.getElementById('shotName').value=name; await gmapz.saveShot(); };
    await shoot(200,'a'); await shoot(20,'b');
    gmapz.S.shots.forEach(s=>{s.spec.tiles_resolved=true;});
    const clause=gmapz.lineClause(gmapz.cutGrammar().pairs[0]);
    const prompts=gmapz.sequencePrompts('runway');
    return {clause, inPrompt:prompts.includes('SCREEN GEOMETRY'),
      runOn:/previous shot [A-Z]/.test(clause),
      // every sentence in it ends before the next one starts
      unterminated:clause.split(/(?<=[.!?])\s+/).filter(x=>x.trim()&&!/[.!?:]$/.test(x.trim())).length};
  });
  t.ok(!r.runOn,'no clause runs into the next');
  t.ok(r.unterminated===0,'every sentence in the clause is terminated ('+r.unterminated+' loose)');
  t.ok(r.inPrompt,'and it is still reaching the engine prompt');
}

t.head('5. the exported spec describes the second pass it actually shipped with');
{
  // post{} was stamped by buildSpec at the shutter, so a shot graded afterwards in Frame
  // Forge exported a spec saying there was no second pass, beside a previs.gif that had one.
  const r=await page.evaluate(async()=>{
    const S=gmapz.S;
    S.shots[0].fx=['bw','grain']; S.shots[0].beat=1.2;
    const before=JSON.stringify(S.shots[0].spec.post);
    window.__blobs=[]; const oc=URL.createObjectURL.bind(URL);
    URL.createObjectURL=(o)=>{ try{ if(o instanceof Blob)window.__blobs.push(o);}catch(_){} return oc(o); };
    await gmapz.exportBundle();
    await new Promise(r=>setTimeout(r,500));
    return {before, after:S.shots[0].spec.post, other:S.shots[1].spec.post};
  });
  t.ok(r.before==='null','before export the spec knew nothing about the grade (the old bug)');
  t.ok(r.after&&r.after.this_shot,'exporting restamps it, so the package cannot disagree with the cut');
  t.ok(r.after.this_shot.fx.join()==='bw,grain','and it names THIS shot\'s grade: '+r.after.this_shot.fx.join('+'));
  t.ok(r.after.this_shot.hold_ms===1200,'with the hold it will actually be held for');
  t.ok(r.other&&r.other.this_shot.fx.length===0,'an ungraded shot says so rather than inheriting its neighbour\'s');
  t.ok(/ungraded plate/.test(r.after.note),'and the note says frames/ are the plate, not the graded frame');
}

t.head('6. the contact sheet may not lie about the shape of the frame');
{
  // It drew every thumb into a hardcoded 480x270 cell whatever the delivery was, so a
  // 2.39:1 plate came out squashed 1.35x. The contact sheet is how you check the framing
  // of a cut, and framing is the product.
  const r=await page.evaluate(async()=>{
    window.__dl=[]; const ac=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){ if(this.download)window.__dl.push(this.href); return ac.apply(this,arguments); };
    const out=[];
    for(const asp of ['2.39:1','16:9','9:16']){
      gmapz.S.shots.length=0; gmapz.S.delivery=asp;
      Object.assign(gmapz.S,{target:{lat:45.79760,lon:-95.55560,h:0},head:200,tilt:-5,range:70});
      gmapz.flyToParams(0); await new Promise(r=>setTimeout(r,300));
      document.getElementById('shotName').value='a'; await gmapz.saveShot();
      gmapz.S.shots.forEach(s=>{s.spec.tiles_resolved=true;});
      const px=gmapz.S.shots[0].spec.delivery.capture_px;
      window.__dl.length=0;
      document.getElementById('contactSheetBtn').click();
      await new Promise(r=>setTimeout(r,900));
      const href=window.__dl[window.__dl.length-1];
      const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=href;});
      // one shot → cols=1: width = cw + 2*pad(12); height = cell + label(26) + 2*pad
      const cellW=im.width-24, cellH=im.height-26-24;
      out.push({asp, plateAR:+(px[0]/px[1]).toFixed(3), cellAR:+(cellW/cellH).toFixed(3)});
    }
    return out;
  });
  r.forEach(x=>t.ok(Math.abs(x.plateAR-x.cellAR)/x.plateAR<0.02,
    x.asp+': the sheet cell matches the plate ('+x.plateAR+' vs '+x.cellAR+')'));
  t.ok(r.some(x=>x.asp==='9:16'&&x.cellAR<1),'a portrait delivery comes out portrait, not letterboxed into landscape');
}

await t.done();
