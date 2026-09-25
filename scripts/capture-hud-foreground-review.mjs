import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const out='review-screenshots';
const baseUrl=process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const retiredAliases=[
  '--hud-text','--hud-text-secondary','--hud-icon','--hud-accent','--hud-accent-text',
  '--wanhu-hud-paper','--wanhu-hud-text','--wanhu-hud-muted','--wanhu-hud-faint','--wanhu-hud-gold',
];
const report={source:process.env.GITHUB_SHA || null,checks:[],screenshots:[],errors:[]};
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
page.setDefaultTimeout(15000);
page.on('pageerror',error=>report.errors.push(error.message));

// 等字体与既有 Motion 完成后读样式，不在 transition 中途采样。
async function settle(){
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(340);
}
async function idle(){
  await page.locator(':focus').evaluateAll(nodes=>nodes.forEach(node=>node.blur()));
  await page.mouse.move(20,200);
  await settle();
}
async function style(locator){
  return locator.evaluate(node=>{
    const css=getComputedStyle(node);
    return {color:css.color,background:css.backgroundColor,outline:css.outlineColor,
      outlineStyle:css.outlineStyle,outlineWidth:css.outlineWidth,
      width:css.width,height:css.height,focusVisible:node.matches(':focus-visible')};
  });
}
async function checkColor(label,locator,expected){
  const actual=await style(locator);
  report.checks.push({label,expected,actual});
  assert.equal(actual.color,expected,label);
  return actual;
}
async function shot(name){
  await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
  report.screenshots.push(name+'.png');
}
async function setNight(){
  // 使用正式环境控制交互，不直接改 data-time-of-day 冒充业务状态。
  await page.getByRole('button',{name:'环境控制',exact:true}).click();
  await page.waitForSelector('.gameplay-context-panel--weather');
  await page.getByRole('button',{name:'场景模拟',exact:true}).click();
  const time=page.getByRole('slider',{name:'日内时间',exact:true});
  await time.focus();
  await time.press('End');
  await page.waitForSelector('.gameplay-screen[data-time-of-day="night"]');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.gameplay-left-context-surface',{state:'detached'});
  await idle();
}

try{
  for(const [width,height] of [[1920,1080],[3840,2160]]){
    await page.setViewportSize({width,height});
    const url=new URL(baseUrl);url.searchParams.set('review','gameplay');
    await page.goto(url.toString(),{waitUntil:'networkidle'});
    await page.waitForSelector('.gameplay-screen[data-time-of-day="day"]');
    await settle();
    for(const period of ['day','night']){
      if(period==='night')await setNight();
      const label=`${height}/${period}`;
      const normal=page.getByRole('button',{name:'正常速度',exact:true});
      const accelerated=page.getByRole('button',{name:'加速时间',exact:true});
      await normal.click();await idle();

      const aliases=await page.locator('.game-canvas,.gameplay-screen').evaluateAll((nodes,names)=>
        nodes.map(node=>Object.fromEntries(names.map(name=>[name,getComputedStyle(node).getPropertyValue(name).trim()]))),retiredAliases);
      assert.equal(aliases.length,2,'必须检查 Theme 与 Gameplay 两层作用域');
      assert(aliases.every(values=>Object.values(values).every(value=>value==='')),label+': 旧前景别名不得仍被定义');
      report.checks.push({label:label+'/retired-aliases',aliases});

      const values=await page.locator('.gameplay-top-resource-shortcut b').evaluateAll(nodes=>
        nodes.map(node=>({text:node.textContent,color:getComputedStyle(node).color})));
      assert(values.length>0 && values.every(value=>value.color==='rgb(238, 233, 223)'),label+': 指标数值保持 Paper Primary');
      report.checks.push({label:label+'/resources',values});
      await checkColor(label+'/speed-default',accelerated,'rgb(127, 133, 131)');
      await checkColor(label+'/speed-default-icon',accelerated.locator('.ui-icon'),'rgb(127, 133, 131)');
      await checkColor(label+'/speed-selected',normal,'rgb(197, 164, 105)');

      const tray=await style(page.locator('.gameplay-top-navigation'));
      assert.equal(tray.width,'400px',label+': Top Tray 逻辑宽度');
      assert.equal(tray.height,'38px',label+': Top Tray 逻辑高度');
      const status=await style(page.locator('.gameplay-top-status'));
      assert.equal(status.background,period==='night'?'rgba(28, 34, 36, 0.52)':'rgba(25, 31, 33, 0.5)',label+': 不改变昼夜 Surface 密度');
      report.checks.push({label:label+'/surface-and-geometry',tray,status});
      await shot(`hud-foreground-${period}-${height}`);

      if(height===1080 && period==='day'){
        const environment=page.getByRole('button',{name:'环境控制',exact:true});
        await environment.click();
        await page.waitForSelector('.gameplay-context-panel--weather');
        await settle();
        const activeLine=environment.locator('.gameplay-top-navigation__active-line');
        assert.equal(await activeLine.count(),1,'Control Tray Active 必须使用真实结构线');
        const activeLineStyle=await activeLine.evaluate(node=>{
          const css=getComputedStyle(node);
          const rect=node.getBoundingClientRect();
          return {display:css.display,opacity:css.opacity,backgroundColor:css.backgroundColor,width:rect.width,height:rect.height};
        });
        const retiredPseudo=await environment.evaluate(node=>getComputedStyle(node,'::before').display);
        assert.equal(activeLineStyle.opacity,'1','Control Tray Active 结构线必须可见');
        assert.equal(activeLineStyle.height,2,'Control Tray Active 结构线高度必须保持 2px');
        assert(activeLineStyle.width>=18 && activeLineStyle.width<=24,'Control Tray Active 结构线宽度不得偏离既有比例');
        assert.equal(activeLineStyle.backgroundColor,'rgb(169, 132, 75)','Control Tray Active 必须消费当前熟铜状态线');
        assert.equal(retiredPseudo,'none','Control Tray Active 不得继续依赖 ::before');
        report.checks.push({label:'1080/day/control-tray-real-active-line',activeLineStyle,retiredPseudo});
        await shot('hud-control-tray-active');
        await page.keyboard.press('Escape');
        await page.waitForSelector('.gameplay-left-context-surface',{state:'detached'});
        await idle();
      }

      await accelerated.hover();await settle();
      await checkColor(label+'/speed-hover',accelerated,'rgb(216, 211, 202)');
      await checkColor(label+'/speed-hover-icon',accelerated.locator('.ui-icon'),'rgb(216, 211, 202)');
      if(height===1080 && period==='day')await shot('hud-foreground-day-hover');

      await accelerated.click();await settle();
      await checkColor(label+'/speed-selected-hover',accelerated,'rgb(197, 164, 105)');
      assert.equal(await page.locator('.gameplay-top-speed-button.is-active').count(),1,label+': 速度选中仍唯一');
      await page.mouse.move(20,200);
      // 通过键盘往返产生真实 focus-visible，而不是手工注入状态类。
      await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await settle();
      const focused=await checkColor(label+'/speed-selected-focus',accelerated,'rgb(197, 164, 105)');
      assert(focused.focusVisible,label+': 选中速度按钮必须实际获得键盘焦点');
      assert.equal(focused.outline,'rgb(209, 180, 122)',label+': Focus 与 Selected 独立');
      assert.equal(focused.outlineStyle,'solid');assert.equal(focused.outlineWidth,'1px');
      if(height===1080 && period==='night')await shot('hud-foreground-night-focus');

      const resource=page.locator('.gameplay-top-resource-shortcut').first();
      await idle();await resource.hover();await settle();
      await checkColor(label+'/resource-hover-value',resource.locator('b'),'rgb(238, 233, 223)');
      await idle();await page.keyboard.press('Tab');await resource.focus();await settle();
      const resourceFocus=await style(resource);
      assert(resourceFocus.focusVisible,label+': 指标快捷入口键盘焦点');
      assert.equal(resourceFocus.outline,'rgb(209, 180, 122)');
      await checkColor(label+'/resource-focus-value',resource.locator('b'),'rgb(238, 233, 223)');
      report.checks.push({label:label+'/resource-focus',actual:resourceFocus});
      await idle();
    }
  }
  assert.deepEqual(report.errors,[],'HUD Review 不得有页面脚本异常');
  console.log(`HUD foreground review: ${report.checks.length} checks, ${report.screenshots.length} screenshots`);
}catch(error){
  report.errors.push(error instanceof Error?error.message:String(error));
  throw error;
}finally{
  await writeFile(`${out}/hud-foreground-report.json`,JSON.stringify(report,null,2));
  await browser.close();
}
