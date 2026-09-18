import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const baseUrl=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4173';
const outDir='review-screenshots';await mkdir(outDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
async function open(review,waitFor){const url=new URL(baseUrl);url.searchParams.set('review',review);await page.goto(url.toString(),{waitUntil:'networkidle'});await page.waitForSelector(waitFor);await page.waitForTimeout(180)}

await open('camera','.gameplay-context-panel--camera');
if((await page.locator('.ui-value-field').count())!==0)throw new Error('Legacy output-style Numeric ValueField must be removed.');
const cameraValue=page.getByRole('button',{name:/精确输入视野角度/});
if(await cameraValue.evaluate(node=>getComputedStyle(node).justifyContent)!=='center')throw new Error('Numeric ValueButton text must be centered.');
await cameraValue.click();
let dialog=page.getByRole('dialog',{name:'输入视野角度'});await dialog.waitFor();
let input=dialog.getByLabel('视野角度');await input.fill('55');await page.keyboard.press('Enter');await dialog.waitFor({state:'detached'});
if(Number(await page.getByRole('slider',{name:'视野角度'}).inputValue())!==55)throw new Error('Number Dialog must commit to Slider.');
if(!(await cameraValue.textContent())?.includes('55°'))throw new Error('ValueButton must update after Number Dialog commit.');
await cameraValue.click();dialog=page.getByRole('dialog',{name:'输入视野角度'});await dialog.waitFor();input=dialog.getByLabel('视野角度');await input.fill('999');
if((await input.getAttribute('aria-invalid'))!=='true')throw new Error('Out-of-range Number Dialog value must be invalid.');
if(!(await dialog.getByRole('button',{name:'确认'}).isDisabled()))throw new Error('Invalid number must disable confirm.');
await page.screenshot({path:`${outDir}/input-number-dialog.png`});await page.keyboard.press('Escape');

await open('settings','.settings-space');await page.getByRole('button',{name:'图形',exact:true}).click();
const renderValue=page.getByRole('button',{name:/精确输入渲染比例/});await renderValue.click();
dialog=page.getByRole('dialog',{name:'输入渲染比例'});await dialog.getByLabel('渲染比例').fill('90');await page.keyboard.press('Enter');
if(!(await renderValue.textContent())?.includes('90%'))throw new Error('Settings must use shared Number Dialog.');
await page.screenshot({path:`${outDir}/input-settings-value-button.png`});

await open('new-game','.new-game-space');
if((await page.locator('.new-game-plan input').count())!==0)throw new Error('New Game must not expose page-level editable inputs.');
const cityButton=page.getByRole('button',{name:/修改城市名称/});await cityButton.click();
dialog=page.getByRole('dialog',{name:'修改城市名称'});await dialog.getByLabel('城市名称').fill('云河城');await page.keyboard.press('Enter');
if(!(await cityButton.textContent())?.includes('云河城'))throw new Error('City name must use Text Input Dialog.');
await page.locator('.new-game-map-card[data-map-kind="random"]').click();
const seedButton=page.getByRole('button',{name:/修改随机种子/});await seedButton.click();
dialog=page.getByRole('dialog',{name:'输入随机种子'});input=dialog.getByLabel('随机种子');await input.fill('abc');
if(!(await dialog.getByRole('button',{name:'确认'}).isDisabled()))throw new Error('Seed Dialog must reject non-digits.');
await input.fill('12345678');await page.keyboard.press('Enter');
if(!(await seedButton.textContent())?.includes('12345678'))throw new Error('Seed must commit through Dialog.');
await page.screenshot({path:`${outDir}/input-new-game-values.png`});

await open('settings','.settings-space');await page.getByRole('button',{name:'操作',exact:true}).click();
const firstBinding=page.locator('.settings-binding-row .ui-binding-field').first();await firstBinding.click();
dialog=page.getByRole('dialog',{name:'修改按键绑定'});await dialog.waitFor();await page.keyboard.press('Control+K');
await dialog.getByRole('button',{name:'保存'}).click();
if(!(await firstBinding.textContent())?.includes('Ctrl + K'))throw new Error('Binding must commit through Binding Capture Dialog.');
await page.screenshot({path:`${outDir}/input-binding-dialog.png`});

await open('workspace-building','.workspace--design');
if((await page.locator('.workspace-search,.workspace-search__trigger,.workspace-search__field').count())!==0)throw new Error('Design Workspace search must be removed.');
if((await page.locator('.workspace--design input').count())!==0)throw new Error('Design Workspace must not contain inline text input.');
await page.screenshot({path:`${outDir}/workspace-without-search.png`});
await browser.close();
