// THE LINE — the cut knows it is one place.
//
// This is the feature that cannot be copied by a tool that only organises prompts: it
// needs every camera measured in one coordinate system. So the assertions come in two
// halves. First the arithmetic, checked against cases with a known right answer — if the
// projection is wrong, every sentence built on it is confidently wrong. Then the film
// grammar, checked against setups a DP would recognise.
import { suite } from './lib.mjs';
const t=suite('line');
const page=await t.open(1280,800);

// A two-hander on an east-west line, shot from the north and then from the south.
const setup=async()=>page.evaluate(async()=>{
  const S=gmapz.S;
  S.shots.length=0; S.captures.length=0; S.markers.length=0;
  gmapz.addMarker(-95.5583,45.7976,0,'person','Ana',1,0);
  gmapz.addMarker(-95.5578,45.7976,0,'person','Bo',1,0);
  Object.assign(S,{target:{lat:45.7976,lon:-95.55805,h:420},range:120,fov:40,
                   delivery:'2.39:1',tilt:-6,roll:0});
  const shoot=async(head,name)=>{ S.head=head; gmapz.flyToParams(0);
    await new Promise(r=>setTimeout(r,250));
    document.getElementById('shotName').value=name; await gmapz.saveShot(); };
  await shoot(180,'1 north');    // north of the line
  await shoot(0,  '2 south');    // south of it  -> crosses
  await shoot(12, '3 nudge');    // 12 degrees round from shot 2 -> jump
  S.shots.forEach(sh=>{sh.spec.tiles_resolved=true;});
  gmapz.renderShots();
});
await setup();

t.head('1. the projection is arithmetic, and it is right');
{
  const r=await page.evaluate(()=>{
    const A=gmapz.S.shots[0].spec, asp=A.delivery.aspect, C=A.camera;
    const at=gmapz.screenOf(C,gmapz.aimPoint(A),asp);
    const behind={lon:C.lng+(C.lng-A.location.lng),lat:C.lat+(C.lat-A.location.lat),
                  alt:A.location.ground_elevation_m};
    const off=(brg,m)=>{const q=gmapz.offsetLatLon(A.location.lat,A.location.lng,brg,m);
      return gmapz.screenOf(C,{lon:q.lon,lat:q.lat,alt:A.location.ground_elevation_m},asp);};
    const halfW=Math.tan(C.fov_deg*Math.PI/360)*C.target_distance_m;
    return {selfx:at.x, selfy:at.y, front:at.front,
            back:gmapz.screenOf(C,behind,asp).front,
            right:off((C.heading_deg+90)%360,40).x, left:off((C.heading_deg+270)%360,40).x,
            edge:off((C.heading_deg+90)%360,halfW).x,
            high:gmapz.screenOf(C,{lon:A.location.lng,lat:A.location.lat,
              alt:(A.location.ground_elevation_m||0)+60},asp).y};
  });
  t.ok(Math.abs(r.selfx)<0.02&&Math.abs(r.selfy)<0.02,
    'a shot\'s own aim point lands dead centre of its own frame ('+r.selfx.toFixed(3)+', '+r.selfy.toFixed(3)+')');
  t.ok(r.front===true&&r.back===false,'what is in front is in front; what is behind is behind');
  t.ok(r.right>0&&r.left<0,'camera-right is +x and camera-left is -x — the signs are not swapped');
  t.ok(Math.abs(r.right+r.left)<0.02,'and they are symmetric ('+r.right.toFixed(3)+' / '+r.left.toFixed(3)+')');
  t.ok(Math.abs(r.edge-1)<0.02,'a point at exactly half the fov lands on the frame edge ('+r.edge.toFixed(3)+')');
  t.ok(r.high>0.5,'raising a point 60m puts it high in frame ('+r.high.toFixed(3)+')');
}

t.head('2. the frame edge is the DELIVERY frame, not the window');
{
  const r=await page.evaluate(()=>{
    const A=gmapz.S.shots[0].spec, C=A.camera;
    // A point outside 2.39:1 but inside 1:1 must be out of frame in one and in the other.
    const q=gmapz.offsetLatLon(A.location.lat,A.location.lng,(C.heading_deg)%360,0);
    const up=(alt)=>({lon:A.location.lng,lat:A.location.lat,alt:(A.location.ground_elevation_m||0)+alt});
    const wide=gmapz.screenOf(C,up(40),'2.39:1'), tall=gmapz.screenOf(C,up(40),'1:1');
    return {wideY:wide.y, tallY:tall.y, wideIn:wide.inframe, tallIn:tall.inframe};
  });
  t.ok(Math.abs(r.wideY)>Math.abs(r.tallY),
    'the same point sits higher in a 2.39:1 frame than in a 1:1 one — the aspect is real');
  t.ok(r.tallIn,'and it is comfortably inside the taller frame');
}

t.head('3. the action line is established by the action, never invented');
{
  const r=await page.evaluate(()=>{
    const A=gmapz.S.shots[0].spec;
    const two=gmapz.axisOf(A);
    const one=gmapz.axisOf({subjects:[{lat:45.7976,lng:-95.558,type:'person',name:'solo'}]});
    const oneFacing=gmapz.axisOf({subjects:[{lat:45.7976,lng:-95.558,type:'person',name:'solo',facing_deg:270}]});
    const none=gmapz.axisOf({subjects:[]});
    const tooClose=gmapz.axisOf({subjects:[
      {lat:45.7976,lng:-95.55800,type:'person',name:'a'},
      {lat:45.7976,lng:-95.55801,type:'person',name:'b'}]});
    return {two:two.bearing, twoFrom:two.from, one:one.bearing, oneWhy:one.why,
            oneFacing:oneFacing.bearing, none:none.bearing, noneWhy:none.why,
            close:tooClose.bearing, closeWhy:tooClose.why};
  });
  t.ok(Math.abs(r.two-90)<1,'two people on an east-west line give a 90° axis (got '+r.two.toFixed(1)+'°)');
  t.ok(/between/.test(r.twoFrom),'and it names what established it: "'+r.twoFrom+'"');
  t.ok(r.one===null&&/facing/.test(r.oneWhy),
    'one subject with no facing gives NO line, and says why — not a made-up one');
  t.ok(r.oneFacing===270,'rotate that subject and the line is their facing (270°)');
  t.ok(r.none===null&&/nothing is placed/.test(r.noneWhy),'nothing placed, no line, stated plainly');
  t.ok(r.close===null&&/too close/.test(r.closeWhy),
    'two stand-ins a centimetre apart are one group, not a line across a scene');
}

t.head('4. crossing the line is detected, and so is its visible symptom');
{
  const r=await page.evaluate(()=>{
    const g=gmapz.cutGrammar(), p=g.pairs[0];
    const swap=p.anchors.filter(a=>a.crosses_frame).map(a=>a.what+':'+a.in_a.where+'>'+a.in_b.where);
    return {crossed:p.line.crossed, sa:p.line.side_a, sb:p.line.side_b, axis:p.line.axis_deg,
            swap, nSwap:swap.length, clause:gmapz.lineClause(p), total:g.crossed};
  });
  t.ok(r.crossed===true,'shooting from the far side of the line is flagged as crossing it');
  t.ok(r.sa===-1&&r.sb===1,'the two cameras are recorded on opposite sides ('+r.sa+' / '+r.sb+')');
  t.ok(r.nSwap>=2,'and both subjects are measured swapping sides of frame: '+r.swap.join(', '));
  t.ok(/crossed to the other side/.test(r.clause),'the prompt clause says so in words');
  t.ok(/either the intent or the error/.test(r.clause),
    'and it does not call it a mistake — crossing can be the intent');
  t.ok(r.total===1,'exactly one crossing in this cut, not one per shot');
}

t.head('5. the 30° rule is measured at the subject, not at the camera');
{
  const r=await page.evaluate(()=>{
    const g=gmapz.cutGrammar(), p=g.pairs[1];
    // Two cameras far apart both pointing north subtend nothing at any subject.
    const far=gmapz.subtendedDeg(
      {location:{lat:45.7976,lng:-95.558},camera:{lat:45.80,lng:-95.558}},
      {location:{lat:45.7976,lng:-95.558},camera:{lat:45.81,lng:-95.558}});
    return {jump:p.jump, sub:p.subtended_deg, clause:gmapz.lineClause(p), far, jumps:g.jumps};
  });
  t.ok(r.jump===true,'12° of separation on the same subject is a jump cut');
  t.ok(r.sub<30,'the subtended angle is measured and reported ('+r.sub+'°)');
  t.ok(r.far<1,'two cameras on the same bearing from the subject subtend ~0°, however far apart');
  t.ok(/reads as a jump, not a cut/.test(r.clause),'the clause names it in the language of the cut');
  t.ok(r.jumps===1,'one jump in this cut');
}

t.head('6. a cut with nothing shared says so — that is the finding');
{
  const r=await page.evaluate(async()=>{
    const S=gmapz.S;
    S.shots.length=0; S.markers.length=0;
    const shoot=async(lat,lon,head,name)=>{ Object.assign(S,{target:{lat,lon,h:420},head,
      range:140,fov:40,tilt:-6}); gmapz.flyToParams(0);
      await new Promise(r=>setTimeout(r,220));
      document.getElementById('shotName').value=name; await gmapz.saveShot(); };
    await shoot(45.7976,-95.5580,0,'here');
    await shoot(45.9500,-95.9000,180,'far away');   // a different place entirely
    S.shots.forEach(sh=>{sh.spec.tiles_resolved=true;});
    const g=gmapz.cutGrammar(), p=g.pairs[0];
    return {anchors:p.anchors.length, orphans:g.orphans, clause:gmapz.lineClause(p),
            jump:p.jump, same:p.same_target};
  });
  t.ok(r.anchors===0,'two shots of different places share no visible anchor');
  t.ok(r.orphans===1,'and the cut counts it');
  t.ok(/no shared anchor/.test(r.clause),'the clause tells the engine it is matching on description alone');
  t.ok(r.jump===false&&r.same===false,
    'a cut between two different places is never a jump cut, however small the angle');
}

t.head('7. the subject carries which way it is pointed');
{
  const r=await page.evaluate(async()=>{
    const S=gmapz.S; S.shots.length=0; S.markers.length=0;
    gmapz.addMarker(-95.5580,45.7976,0,'person','walker',1,90);   // facing east
    Object.assign(S,{target:{lat:45.7976,lon:-95.5580,h:420},head:0,range:60,fov:40,tilt:-6});
    gmapz.flyToParams(0); await new Promise(r=>setTimeout(r,250));
    document.getElementById('shotName').value='on the walker'; await gmapz.saveShot();
    const su=gmapz.S.shots[0].spec.subjects[0], cam=gmapz.S.shots[0].spec.camera;
    return {facing:su.facing_deg, travels:su.travels,
            dirN:gmapz.screenDir(90,{heading_deg:0}),
            dirS:gmapz.screenDir(90,{heading_deg:180}),
            toward:gmapz.screenDir(180,{heading_deg:0}),
            away:gmapz.screenDir(0,{heading_deg:0}),
            unset:gmapz.screenDir(null,cam)};
  });
  t.ok(r.facing===90,'a rotated stand-in exports facing_deg (90°) — a field no prompt tool has');
  t.ok(r.travels===false,'and whether it rides the path, separately');
  t.ok(r.dirN==='facing screen-right','facing east, camera looking north → screen-right');
  t.ok(r.dirS==='facing screen-left','same subject, camera looking south → screen-left');
  t.ok(r.toward==='facing camera'&&r.away==='facing away from camera','toward and away are named, not guessed');
  t.ok(r.unset===null,'and an unset facing returns null rather than "due north"');
}

t.head('8. it reaches the product: the prompt, the report, and cut.json');
{
  await setup();
  const r=await page.evaluate(async()=>{
    const prompts=gmapz.sequencePrompts('runway');
    gmapz.checkContinuity();
    const rep=document.getElementById('modal').textContent;
    const zipish=JSON.parse(JSON.stringify({grammar:gmapz.cutGrammar()}));
    return {inPrompt:/SCREEN GEOMETRY/.test(prompts),
            promptNamesSwap:/crossing the frame/.test(prompts),
            inReport:/THE LINE — does this cut read as one place\?/.test(rep),
            // Match across the line break: the advice is wrapped to fit the report box,
            // so a phrase test that assumes one line breaks every time the box changes.
            reportAdvises:/cut through a neutral\s+shot sitting on the line/.test(rep.replace(/\s+/g,' ')),
            g:zipish.grammar,
            keys:Object.keys(zipish.grammar).sort().join(',')};
  });
  t.ok(r.inPrompt,'every engine prompt carries a SCREEN GEOMETRY line');
  t.ok(r.promptNamesSwap,'and it names the anchors that swap sides of the frame');
  t.ok(r.inReport,'Check the cut opens with THE LINE');
  t.ok(r.reportAdvises,'and gives the fix, not just the flag');
  t.ok(r.keys==='crossed,flips,jumps,n,orphans,pairs,undefinedLine',
    'cut.json grammar{} is machine-readable: '+r.keys);
  t.ok(r.g.pairs.every(p=>p.line.defined===(p.line.axis_deg!==null)),
    'a pair never claims a defined line without an axis to show for it');
  t.ok(r.g.pairs.every(p=>p.subtended_deg===null||p.same_target),
    'and never reports a subtended angle between two different places');
}

t.head('9. the room reads — the report fits its box, the next-move line is honest');
{
  const r=await page.evaluate(()=>{
    gmapz.checkContinuity();
    const pre=document.querySelector('#modal pre, #modal textarea');
    const txt=(pre&&(pre.value||pre.textContent))||'';
    const sec=txt.split('THE LINE')[1]||'';
    const body=sec.split('LIGHT CONTINUITY')[0];
    const longest=body.split('\n').reduce((a,l)=>Math.max(a,l.length),0);
    document.getElementById('modal').classList.remove('show');
    const nu=gmapz.nextUp();
    return {longest, nuText:nu.t, nuGo:nu.go, done:!!nu.done,
            over:body.split('\n').filter(l=>l.length>66)};
  });
  // The report is a fixed-width pre. Over-long advice wrapped mid-sentence and lost its
  // indent -- invisible to every assertion about its words, obvious in one screenshot.
  t.ok(r.longest<=66,'no line in THE LINE overflows the report box (longest '+r.longest+')');
  t.ok(r.over.length===0,'and none wrap mid-sentence'+(r.over.length?': '+r.over[0]:''));
  t.ok(r.done===true,'a cut whose shots all have frames is still reported complete');
  t.ok(/worth a decision/.test(r.nuText),
    'but the next-move line names the grammar flags rather than congratulating past them');
  t.ok(r.nuGo==='Check the cut','and it sends you to look, not straight to the render');
}

await t.done();
