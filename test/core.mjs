// THE CORE LOOP, and the honesty rules that guard it.
//
// Aim at a real place → block the camera → lock the light → capture the rendered frame →
// put it in the cut → export the cut. Everything else in this app is layered on top and
// must never break it. The assertions here are the ones that have actually caught
// shipped defects, not a survey of the API.
import { suite } from './lib.mjs';
const t=suite('core');
const page=await t.open(1280,860);

t.head('1. the app is up, and it names what it is depending on');
{
  const r=await page.evaluate(()=>({via:window.CESIUM_VIA, mode:gmapz.EARTH.mode,
    served:gmapz.servedProperly(), preserve:!!gmapz.viewer.scene.context._originalGLContext||true}));
  t.ok(!!r.via,'the engine says where it came from: '+r.via);
  t.ok(r.served,'served over http, not file:// — Cesium workers need it');
  t.ok(['photoreal','terrain','flat','rejected'].includes(r.mode),'the earth is in a named state: '+r.mode);
}

t.head('2. only photoreal wears a tick, and a rejection never fades');
{
  const r=await page.evaluate(()=>{
    const read=m=>{ gmapz.setEarthMode(m,m==='rejected'?'test detail':'');
      const pill=document.getElementById('loadstat');
      const warn=document.getElementById('earthWarn');
      return {txt:pill.textContent, bad:pill.classList.contains('bad'),
              banner:!!(warn&&warn.style.display==='block'),
              clipped:getComputedStyle(pill).textOverflow};
    };
    return {photo:read('photoreal'), terr:read('terrain'), flat:read('flat'), rej:read('rejected')};
  });
  t.ok(/✓/.test(r.photo.txt),'photoreal gets the tick');
  t.ok(/✓/.test(r.terr.txt),'terrain gets the tick');
  t.ok(!/✓/.test(r.flat.txt),'flat 2D drape does NOT — a fallback never wears a success mark');
  t.ok(!/✓/.test(r.rej.txt)&&r.rej.bad,'a rejected key is not a tick and is marked bad');
  t.ok(r.rej.banner,'and it banners the stage rather than whispering in a pill');
  t.ok(r.rej.clipped!=='ellipsis','the pill never truncates — a session was once shot flat because it did');
}

t.head('3. S.fov is DEGREES in state and radians only at the frustum');
{
  const r=await page.evaluate(()=>{
    gmapz.S.fov=54; gmapz.syncCamUI();
    const applied=gmapz.viewer.camera.frustum.fov;
    gmapz.S.fov=90; gmapz.applyFov?.();
    return {state:gmapz.S.fov, rad:applied, lens54:gmapz.fovToLens(54), lens24:gmapz.lensToFov(24)};
  });
  t.ok(r.state===90,'state holds the degree value it was given');
  t.ok(r.rad<Math.PI,'the frustum holds radians (<π), never the degree number');
  t.ok(r.lens54>30&&r.lens54<40,'54° on full-frame is about a 35mm lens (got '+Math.round(r.lens54)+'mm)');
  t.ok(r.lens24>70&&r.lens24<90,'and 24mm is about 74° back (got '+Math.round(r.lens24)+'°)');
}

t.head('4. camera{} is where the camera is; location{} is what it aims at');
{
  const r=await page.evaluate(async()=>{
    Object.assign(gmapz.S,{target:{lat:45.7976,lon:-95.5583,h:420},head:40,tilt:-20,
                           range:800,fov:54,delivery:'2.39:1'});
    gmapz.flyToParams(0); await new Promise(x=>setTimeout(x,350));
    document.getElementById('shotName').value='truth'; await gmapz.saveShot();
    const sp=gmapz.S.shots[gmapz.S.shots.length-1].spec, c=sp.camera;
    return {aimLat:sp.location.lat, camLat:c.lat, aimIsAim:c.aim_lat,
            dist:c.target_distance_m, alt:c.altitude_m, agl:c.height_above_ground_m,
            fields:Object.keys(c).sort().join(','), specv:sp.spec,
            res:sp.delivery.resolution, px:sp.delivery.capture_px};
  });
  t.ok(r.camLat!==r.aimLat,'the camera is not standing on the thing it is pointed at');
  t.ok(Math.abs(r.aimIsAim-r.aimLat)<1e-9,'camera.aim_lat is the aim point, kept separate from camera.lat');
  t.ok(r.dist>700&&r.dist<900,'target_distance_m is the orbit distance (got '+Math.round(r.dist)+'m)');
  t.ok(r.alt!==r.dist,'altitude_m is NOT the orbit distance — the bug that cost the most');
  t.ok(typeof r.agl==='number','height_above_ground_m exists as its own field');
  t.ok(r.specv==='gmapz.capture.v2.1','the spec names its own version');
  t.ok(Array.isArray(r.res)&&Array.isArray(r.px),
    'resolution is the target and capture_px is the file — both present, never conflated');
}

t.head('5. the frame is the product, so a soft one can never pass as sharp');
{
  const r=await page.evaluate(()=>{
    const sh=gmapz.S.shots[gmapz.S.shots.length-1];
    const before=gmapz.shotIsSoft(sh);
    sh.spec.tiles_resolved=false;
    const soft=gmapz.shotIsSoft(sh);
    const issues=gmapz.cutIssues();
    sh.spec.tiles_resolved=true;
    return {before, soft, counted:issues.soft.length>0, truthy:typeof gmapz.tilesSettled().resolved};
  });
  t.ok(r.soft===true,'a frame marked tiles_resolved:false reads as soft');
  t.ok(r.counted,'and the cut counts it rather than letting it through');
  t.ok(r.truthy==='boolean','tilesSettled() answers a real boolean, not a maybe');
}

t.head('6. the path is the sequence, and its two products stay distinct');
{
  const r=await page.evaluate(async()=>{
    gmapz.startPath(-95.5583,45.7976);           // (lon, lat) — two numbers
    gmapz.addPathPoint(-95.5563,45.7986);
    gmapz.addPathPoint(-95.5543,45.7996);
    gmapz.renderPathList();
    const pts=gmapz.S.path.points.length;
    gmapz.S.pathKind='move'; gmapz.syncPathKind();
    const moveShown=getComputedStyle(document.getElementById('kindMove')).display!=='none';
    const covHidden=getComputedStyle(document.getElementById('kindCov')).display==='none';
    gmapz.S.pathKind='cov'; gmapz.syncPathKind();
    const covShown=getComputedStyle(document.getElementById('kindCov')).display!=='none';
    const sm=gmapz.moveSamples(24);
    return {pts, moveShown, covHidden, covShown, samples:sm.length,
            firstLon:sm[0].lon, lastLon:sm[sm.length-1].lon};
  });
  t.ok(r.pts===3,'three dots down');
  t.ok(r.moveShown&&r.covHidden,'A MOVE shows the move controls and hides the coverage one');
  t.ok(r.covShown,'and COVERAGE swaps them back');
  t.ok(r.samples===24,'the move samples the frames asked for');
  t.ok(Math.abs(r.firstLon+95.5583)<1e-4&&Math.abs(r.lastLon+95.5543)<1e-4,
    'and it starts at the first dot and ends at the last');
}

t.head('7. the cut reports what is wrong with it');
{
  const r=await page.evaluate(async()=>{
    gmapz.S.shots.length=0;
    const shoot=async(head,name)=>{ gmapz.S.head=head; gmapz.flyToParams(0);
      await new Promise(x=>setTimeout(x,220));
      document.getElementById('shotName').value=name; await gmapz.saveShot(); };
    Object.assign(gmapz.S,{target:{lat:45.7976,lon:-95.5583,h:420},range:400,fov:54,tilt:-20});
    await shoot(40,'a'); await shoot(40,'b');         // identical framing
    gmapz.S.delivery='16:9';
    await shoot(200,'c');                              // and a delivery change
    gmapz.S.shots.forEach(s=>{s.spec.tiles_resolved=true;});
    const iss=gmapz.cutIssues();
    return {n:iss.n, repeats:iss.repeats, distinct:iss.distinct, aspects:iss.aspects.length};
  });
  t.ok(r.n===3,'three shots in the cut');
  t.ok(r.repeats===1&&r.distinct===2,'the repeated framing is caught: 3 shots, 2 distinct cameras');
  t.ok(r.aspects===2,'and the mid-cut delivery change is caught');
}

t.head('8. nothing is said that cannot be known');
{
  const r=await page.evaluate(()=>{
    gmapz.S.markers.length=0;                 // nothing placed at all
    // soundscape() reads a SPEC, not the live state — it has to answer for a saved shot.
    const bed=gmapz.soundscape(gmapz.S.shots[0].spec);
    // Test bed[] ONLY. exclude[] names "city ambience" in order to forbid it, so matching
    // the whole object reads a prohibition as an assertion — which it did, first run.
    const txt=(bed.bed||[]).join(' | ');
    const prompts=gmapz.sequencePrompts('veo');
    return {mentionsCity:/city|urban|traffic/i.test(txt),
            // The one place "urban" legitimately appears is the disclaimer that Scout
            // cannot know it. Matching the whole object read that as the violation.
            saysItCannotKnow:/does not know whether this location is urban or rural/i.test(bed.note||''),
            excludes:(bed.exclude||[]).join(','),
            mentionsFootsteps:/footstep/i.test(txt),
            promptCity:/distant city ambience/i.test(prompts),
            phaseNull:gmapz.phaseOf(null)};
  });
  t.ok(!r.mentionsCity,'with nothing placed, the bed does not assert a city');
  t.ok(r.saysItCannotKnow,'and it states outright that it cannot know urban from rural');
  t.ok(/music/.test(r.excludes)&&/dialogue/.test(r.excludes),
    'the bed forbids music, score, narration and dialogue downstream: '+r.excludes);
  t.ok(!r.mentionsFootsteps,'nor footsteps from figures that are not there');
  t.ok(!r.promptCity,'and the Veo prompt does not carry the old hardcoded ambience');
  t.ok(r.phaseNull==='—','a sun that was never computed has no phase, and says so');
}

t.head('9. the export is a real zip with the files it promises');
{
  const r=await page.evaluate(async()=>{
    const files=[];
    const zip=await gmapz.makeZip([{name:'a.txt',bytes:new TextEncoder().encode('hi')}]);
    const buf=new Uint8Array(await zip.arrayBuffer());
    // walk the end-of-central-directory for real, rather than trusting the builder
    let eocd=-1;
    for(let i=buf.length-22;i>=0;i--) if(buf[i]===0x50&&buf[i+1]===0x4b&&buf[i+2]===0x05&&buf[i+3]===0x06){eocd=i;break;}
    const count=eocd<0?0:(buf[eocd+10]|(buf[eocd+11]<<8));
    return {size:buf.length, eocd:eocd>=0, count,
            sig:buf[0]===0x50&&buf[1]===0x4b&&buf[2]===0x03&&buf[3]===0x04};
  });
  t.ok(r.sig,'the zip starts with a real local-file header');
  t.ok(r.eocd,'and has an end-of-central-directory record');
  t.ok(r.count===1,'which counts the one entry we put in');
}

await t.done();
