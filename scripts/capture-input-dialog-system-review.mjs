import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4173';
const outDir='review-screenshots';
await mkdir(outDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});

async function open(review,waitFor){
  const url=new URL(baseUrl);
  url.searchParams.set('review',review);
  await page.goto(url.toString(),{waitUntil:'networkidle'});
  await page.waitForSelector(waitFor);
  await page.waitForTimeout(180);
}

async function expectDialogTone(dialog,tone){
  const expected=`is-tone-${tone}`;
  if(!(await dialog.evaluate((node,className)=>node.classList.contains(className),expected)))throw new Error(`Dialog must use ${tone} visual tone.`);
  const iconCount=await dialog.locator('.ui-dialog__tone-icon').count();
  if(tone==='neutral'&&iconCount!==0)throw new Error('Neutral Dialog must not show a semantic status icon.');
  if(tone!=='neutral'&&iconCount!==1)throw new Error(`${tone} Dialog must show one semantic status icon.`);
  const header=dialog.locator('.ui-dialog__header');
  const headerStyle=await header.evaluate(node=>({backgroundImage:getComputedStyle(node).backgroundImage,backgroundColor:getComputedStyle(node).backgroundColor}));
  if(tone!=='neutral'&&headerStyle.backgroundImage==='none')throw new Error(`${tone} Dialog header must use a semantic tint.`);
  const accent=await dialog.evaluate(node=>getComputedStyle(node,'::before').backgroundColor);
  if(tone!=='neutral'&&(accent==='transparent'||accent==='rgba(0, 0, 0, 0)'))throw new Error(`${tone} Dialog must expose a top semantic accent line.`);
}

async function expectDialogMaterial(dialog,label){
  const backdrop=page.locator('.ui-modal-backdrop');
  await backdrop.waitFor();
  const backdropMaterial=await backdrop.evaluate(node=>{
    const style=getComputedStyle(node);
    return {
      backdropFilter:style.backdropFilter||style.webkitBackdropFilter||'',
      backgroundColor:style.backgroundColor,
    };
  });
  const material=await dialog.evaluate(node=>{
    const style=getComputedStyle(node);
    return {
      backdropFilter:style.backdropFilter||style.webkitBackdropFilter||'',
      radius:Number.parseFloat(style.borderTopLeftRadius||'0'),
      backgroundColor:style.backgroundColor,
    };
  });
  const noBlur=value=>value===''||value==='none';
  if(!noBlur(backdropMaterial.backdropFilter))throw new Error(`${label} backdrop must not blur background UI. filter=${backdropMaterial.backdropFilter}`);
  const backdropMatch=backdropMaterial.backgroundColor.match(/rgba?\(([^)]+)\)/);
  if(!backdropMatch)throw new Error(`${label} backdrop must expose a stable near-black tint. background=${backdropMaterial.backgroundColor}`);
  const backdropParts=backdropMatch[1].split(',').map(value=>Number.parseFloat(value.trim()));
  const [backdropR,backdropG,backdropB,backdropA=1]=backdropParts;
  if(backdropA<.86||backdropA>.92)throw new Error(`${label} backdrop must use the high-opacity modal range. alpha=${backdropA}`);
  if(Math.max(backdropR,backdropG,backdropB)>12||Math.max(backdropR,backdropG,backdropB)===0)throw new Error(`${label} backdrop must remain near-black rather than pure black or grey. background=${backdropMaterial.backgroundColor}`);
  if(!noBlur(material.backdropFilter))throw new Error(`${label} surface must not use backdrop blur. filter=${material.backdropFilter}`);
  if(material.radius<10)throw new Error(`${label} must use the current rounded dialog language. radius=${material.radius}`);
  const match=material.backgroundColor.match(/rgba?\(([^)]+)\)/);
  if(!match)throw new Error(`${label} must expose a stable graphite background. background=${material.backgroundColor}`);
  const parts=match[1].split(',').map(value=>Number.parseFloat(value.trim()));
  const [r,g,b,a=1]=parts;
  if(Math.max(r,g,b)-Math.min(r,g,b)>6)throw new Error(`${label} surface must remain neutral Smoked Graphite. background=${material.backgroundColor}`);
  if(a>=1||a<.82)throw new Error(`${label} surface must be semi-transparent but self-readable. alpha=${a}`);
}

// Confirm Dialog shares the same Elevated shell and no-blur material.
await open('menu','.main-menu-screen');
await page.getByRole('button',{name:'退出游戏',exact:true}).click();
let dialog=page.getByRole('dialog',{name:'退出游戏？'});
await dialog.waitFor();
await expectDialogMaterial(dialog,'Confirm Dialog');
await expectDialogTone(dialog,'neutral');
await page.screenshot({path:`${outDir}/dialog-confirm.png`});
await page.keyboard.press('Escape');

// Number Dialog: validation + shared material.
await open('camera','.gameplay-context-panel--camera');
if((await page.locator('.ui-value-field').count())!==0)throw new Error('Legacy output-style Numeric ValueField must be removed.');
const cameraValue=page.getByRole('button',{name:/精确输入视野角度/});
if(await cameraValue.evaluate(node=>getComputedStyle(node).justifyContent)!=='center')throw new Error('Numeric ValueButton text must be centered.');
await cameraValue.click();
dialog=page.getByRole('dialog',{name:'输入视野角度'});
await dialog.waitFor();
await expectDialogMaterial(dialog,'Number Dialog');
if((await dialog.locator('.ui-text-input').count())!==1)throw new Error('Number Dialog must use shared TextInput.');
let input=dialog.getByLabel('视野角度');
await input.fill('55');
await page.keyboard.press('Enter');
await dialog.waitFor({state:'detached'});
if(Number(await page.getByRole('slider',{name:'视野角度'}).inputValue())!==55)throw new Error('Number Dialog must commit to Slider.');
if(!(await cameraValue.textContent())?.includes('55°'))throw new Error('ValueButton must update after Number Dialog commit.');
await cameraValue.click();
dialog=page.getByRole('dialog',{name:'输入视野角度'});
await dialog.waitFor();
input=dialog.getByLabel('视野角度');
await input.fill('999');
if((await input.getAttribute('aria-invalid'))!=='true')throw new Error('Out-of-range Number Dialog value must be invalid.');
if(!(await dialog.getByRole('button',{name:'确认'}).isDisabled()))throw new Error('Invalid number must disable confirm.');
await page.screenshot({path:`${outDir}/dialog-number-invalid.png`});
await page.keyboard.press('Escape');

// Timed Confirmation also uses the same shell.
await open('settings','.settings-space');
const displayMode=page.getByRole('button',{name:'显示模式',exact:true});
await displayMode.click();
await page.getByRole('option',{name:'窗口',exact:true}).click();
dialog=page.getByRole('dialog',{name:'保留这些显示设置？'});
await dialog.waitFor();
await expectDialogMaterial(dialog,'Timed Confirmation');
await expectDialogTone(dialog,'warning');
await page.screenshot({path:`${outDir}/dialog-timed-confirmation.png`});
await page.keyboard.press('Escape');

// Settings NumericSliderField still routes precision editing through Number Dialog.
await open('settings','.settings-space');
await page.getByRole('button',{name:'图形',exact:true}).click();
const renderValue=page.getByRole('button',{name:/精确输入渲染比例/});
await renderValue.click();
dialog=page.getByRole('dialog',{name:'输入渲染比例'});
await dialog.getByLabel('渲染比例').fill('90');
await page.keyboard.press('Enter');
if(!(await renderValue.textContent())?.includes('90%'))throw new Error('Settings must use shared Number Dialog.');
await page.screenshot({path:`${outDir}/input-settings-value-button.png`});

// Text Input Dialog: New Game city / seed editing stays out of the page surface.
await open('new-game','.new-game-space');
if((await page.locator('.new-game-plan input').count())!==0)throw new Error('New Game must not expose page-level editable inputs.');
const cityButton=page.getByRole('button',{name:/修改城市名称/});
await cityButton.click();
dialog=page.getByRole('dialog',{name:'修改城市名称'});
await dialog.waitFor();
await expectDialogMaterial(dialog,'Text Input Dialog');
if((await dialog.locator('.ui-text-input').count())!==1)throw new Error('Text Input Dialog must use shared TextInput.');
await page.screenshot({path:`${outDir}/dialog-new-game-city-name.png`});
await dialog.getByLabel('城市名称').fill('云河城');
await page.keyboard.press('Enter');
if(!(await cityButton.textContent())?.includes('云河城'))throw new Error('City name must use Text Input Dialog.');
await page.locator('.new-game-map-card[data-map-kind="random"]').click();
const seedButton=page.getByRole('button',{name:/修改随机种子/});
await seedButton.click();
dialog=page.getByRole('dialog',{name:'输入随机种子'});
input=dialog.getByLabel('随机种子');
await input.fill('abc');
if(!(await dialog.getByRole('button',{name:'确认'}).isDisabled()))throw new Error('Seed Dialog must reject non-digits.');
await input.fill('12345678');
await page.keyboard.press('Enter');
if(!(await seedButton.textContent())?.includes('12345678'))throw new Error('Seed must commit through Dialog.');
await page.screenshot({path:`${outDir}/input-new-game-values.png`});

// Binding Capture Dialog shares the same material, with brass reserved for listening/focus state.
await open('settings','.settings-space');
await page.getByRole('button',{name:'操作',exact:true}).click();
const firstBinding=page.locator('.settings-binding-row .ui-binding-field').first();
await firstBinding.click();
dialog=page.getByRole('dialog',{name:'修改按键绑定'});
await dialog.waitFor();
await expectDialogMaterial(dialog,'Binding Capture Dialog');
await page.screenshot({path:`${outDir}/dialog-binding-capture.png`});
await page.keyboard.press('Control+K');
await dialog.getByRole('button',{name:'保存'}).click();
if(!(await firstBinding.textContent())?.includes('Ctrl + K'))throw new Error('Binding must commit through Binding Capture Dialog.');

await open('pause-save','.save-game-space');
const reviewSaveCard=page.locator('.archive-save-card').first();
await reviewSaveCard.locator('.archive-save-card__select').click();
await reviewSaveCard.getByRole('button',{name:/覆盖 /}).click();
dialog=page.getByRole('dialog',{name:'覆盖存档？'});
await dialog.waitFor();
await expectDialogMaterial(dialog,'Overwrite Warning Dialog');
await expectDialogTone(dialog,'warning');
await page.screenshot({path:`${outDir}/dialog-warning-overwrite.png`});
await page.keyboard.press('Escape');
await reviewSaveCard.locator('.archive-save-card__select').click();
await reviewSaveCard.getByRole('button',{name:/删除 /}).click();
dialog=page.getByRole('dialog',{name:'删除存档？'});
await dialog.waitFor();
await expectDialogMaterial(dialog,'Delete Danger Dialog');
await expectDialogTone(dialog,'danger');
await page.screenshot({path:`${outDir}/dialog-danger-delete.png`});
await page.keyboard.press('Escape');

await open('workspace-building','.workspace--design');
if((await page.locator('.workspace-search,.workspace-search__trigger,.workspace-search__field').count())!==0)throw new Error('Design Workspace search must be removed.');
if((await page.locator('.workspace--design input').count())!==0)throw new Error('Design Workspace must not contain inline text input.');
await page.screenshot({path:`${outDir}/workspace-without-search.png`});

await browser.close();
