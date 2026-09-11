// Shared harness. Lives in the repo, NOT in a scratchpad — the suites have now been lost
// twice to a container recycle, once taking sixteen of them with it. A test you cannot
// re-run after a restart is a test you do not have.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

export const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
export const FLAGS=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--no-proxy-server'];
export const URL=process.env.GMAPZ_URL||'http://127.0.0.1:8123/gmapz_local.html';

export function suite(name){
  let pass=0, fail=0; const errs=[];
  return {
    errs,
    ok(c,m){ c?(pass++,console.log('  ✓ '+m)):(fail++,console.log('  ✗ '+m)); },
    head(t){ console.log('\n'+t); },
    async open(vw=1200,vh=900){
      const browser=await chromium.launch({executablePath:CHROME,args:FLAGS});
      const page=await browser.newPage({viewport:{width:vw,height:vh}});
      page.on('pageerror',e=>errs.push(String(e)));
      await page.goto(URL,{waitUntil:'load'});
      await page.waitForFunction(()=>window.gmapz&&window.gmapz.viewer,null,{timeout:45000});
      await page.waitForTimeout(2500);
      // The welcome card covers the stage and swallows clicks until it is dismissed.
      await page.evaluate(()=>{const go=[...document.querySelectorAll('button')]
        .find(x=>/Start scouting/i.test(x.textContent)); if(go)go.click();});
      this.browser=browser; this.page=page; return page;
    },
    async done(){
      if(this.browser)await this.browser.close();
      console.log('\npage errors: '+errs.length);
      errs.slice(0,6).forEach(e=>console.log('   ! '+e.split('\n')[0]));
      console.log(`\n${pass} passed, ${fail} failed, ${errs.length} page errors`);
      process.exit(fail||errs.length?1:0);
    }
  };
}
// startPath/addPathPoint take (lon, lat) as two NUMBERS, not an object. Passing an object
// gives NaN silently and the failure surfaces three functions away. Twice bitten; wrapped.
export const PATH_ARGS_ARE_LON_LAT_NUMBERS=true;
