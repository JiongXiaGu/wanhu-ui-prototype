import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function open(review, waitFor) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(waitFor);
  await page.waitForTimeout(160);
}

const staticScenarios = [
  ['01-main-menu.png', 'menu', '.main-menu-screen'],
  ['02-gameplay.png', 'gameplay', '.command-utility'],
  ['03-workspace.png', 'workspace-building', '.workspace'],
  ['04-tool-position.png', 'building-position', '.gameplay-operation-hints'],
  ['05-tool-massing.png', 'building-massing', '.gameplay-operation-hints'],
  ['06-tool-roof.png', 'building-roof', '.bp-mode-content'],
  ['07-tool-height.png', 'building-height', '.bp-terrain-summary'],
  ['08-camera-flyout.png', 'camera', '.right-edge-flyout--camera'],
  ['09-weather-flyout.png', 'weather', '.right-edge-flyout--weather'],
  ['10-tool-camera.png', 'building-camera', '.right-edge-flyout--camera'],
  ['11-pause-layer.png', 'pause', '.pause-command-surface'],
  ['12-menu-settings.png', 'settings', '.settings-panel--menu'],
  ['13-pause-save.png', 'pause-save', '.save-game-space'],
  ['14-pause-settings.png', 'pause-settings', '.settings-panel--pause'],
  ['15-menu-load.png', 'load', '.archive-space--load'],
  ['16-new-game.png', 'new-game', '.new-game-space'],
];

for (const [file, review, waitFor] of staticScenarios) {
  await open(review, waitFor);
  await page.screenshot({ path: `${outDir}/${file}` });
}

// New Game: random-map state gets its own review frame.
await open('new-game', '.new-game-space');
await page.getByRole('button', { name: '随机地图', exact: true }).click();
const randomMapCard = page.locator('.new-game-map-card[data-map-kind="random"]').first();
await randomMapCard.click();
if (!(await randomMapCard.getAttribute('class'))?.includes('is-selected')) throw new Error('Random map card should become selected.');
if ((await page.locator('.new-game-detail__header h2').textContent())?.trim() !== '随机世界') throw new Error('Random map details should be visible.');
await page.screenshot({ path: `${outDir}/16b-new-game-random.png` });

// Main-menu exit confirmation.
await open('menu', '.main-menu-screen');
await page.getByRole('button', { name: '退出游戏', exact: true }).click();
await page.getByRole('dialog', { name: '退出游戏？' }).waitFor();
if ((await page.locator('.ui-dialog').count()) !== 1) throw new Error('Exit confirmation must use the unified dialog.');
await page.screenshot({ path: `${outDir}/17-dialog-exit-game.png` });
await page.keyboard.press('Escape');

// Pause -> main menu confirmation.
await open('pause', '.pause-command-surface');
await page.getByRole('button', { name: '返回主菜单', exact: true }).click();
await page.getByRole('dialog', { name: '返回主菜单？' }).waitFor();
await page.screenshot({ path: `${outDir}/18-dialog-return-main-menu.png` });
await page.keyboard.press('Escape');

// Save: unified group rename input dialog.
await open('pause-save', '.save-game-space');
if ((await page.locator('.archive-save-type-tabs button').count()) !== 4) throw new Error('Save Space must expose four save-type filters.');
await page.getByRole('button', { name: '更改存档组名称', exact: true }).click();
let dialog = page.getByRole('dialog', { name: '更改存档组名称' });
await dialog.waitFor();
await page.screenshot({ path: `${outDir}/19-dialog-save-group-rename.png` });
await dialog.getByRole('textbox').fill('昭平城测试组');
await page.keyboard.press('Enter');
if ((await page.locator('.save-current-game h2').textContent())?.trim() !== '昭平城测试组') throw new Error('Group rename should commit through InputDialog.');

// Save: quick save toast.
await page.getByRole('button', { name: '快速保存', exact: true }).click();
await page.locator('.ui-toast').waitFor();
if (!((await page.locator('.archive-save-card__title-row b').first().textContent()) ?? '').startsWith('快速存档.')) throw new Error('Quick Save must create a newest quick save.');
await page.screenshot({ path: `${outDir}/20-toast-quick-save.png` });

// Save: manual save InputDialog.
await page.getByRole('button', { name: '保存存档', exact: true }).click();
dialog = page.getByRole('dialog', { name: '保存存档' });
await dialog.waitFor();
const saveName = dialog.getByRole('textbox', { name: '存档名称' });
if (!(await saveName.inputValue()).startsWith('手动存档.')) throw new Error('Manual save dialog must provide a generated default name.');
await saveName.fill('城西新市落成');
await page.screenshot({ path: `${outDir}/21-dialog-save-name.png` });
await dialog.getByRole('button', { name: '保存', exact: true }).click();
if ((await page.locator('.archive-save-card__title-row b').first().textContent())?.trim() !== '城西新市落成') throw new Error('Manual save should create the newest card.');

// Save: overwrite confirmation.
const manualCard = page.locator('.archive-save-card[data-save-kind="manual"]').first();
await manualCard.hover();
await manualCard.getByRole('button', { name: /^覆盖 / }).click();
dialog = page.getByRole('dialog', { name: '覆盖存档？' });
await dialog.waitFor();
await page.screenshot({ path: `${outDir}/22-dialog-overwrite-save.png` });
await page.keyboard.press('Escape');

// Save: destructive delete confirmation.
await manualCard.hover();
await manualCard.getByRole('button', { name: /^删除 / }).click();
dialog = page.getByRole('dialog', { name: '删除存档？' });
await dialog.waitFor();
if (!(await page.locator('.ui-dialog').getAttribute('class'))?.includes('is-danger')) throw new Error('Delete confirmation must use danger dialog tone.');
await page.screenshot({ path: `${outDir}/23-dialog-delete-save.png` });
await page.keyboard.press('Escape');

// Load: rename and delete use the same dialog framework.
await open('load', '.archive-space--load');
const loadCard = page.locator('.archive-save-card').nth(1);
await loadCard.hover();
await loadCard.getByRole('button', { name: /^重命名 / }).click();
dialog = page.getByRole('dialog', { name: '重命名存档' });
await dialog.waitFor();
await page.screenshot({ path: `${outDir}/24-dialog-load-rename.png` });
await page.keyboard.press('Escape');
await loadCard.hover();
await loadCard.getByRole('button', { name: /^删除 / }).click();
dialog = page.getByRole('dialog', { name: '删除存档？' });
await dialog.waitFor();
await page.screenshot({ path: `${outDir}/25-dialog-load-delete.png` });
await page.keyboard.press('Escape');

// Load: delete game group confirmation.
await page.getByRole('button', { name: '删除存档组', exact: true }).click();
await page.locator('.ui-dialog.is-danger').waitFor();
await page.screenshot({ path: `${outDir}/26-dialog-delete-group.png` });
await page.keyboard.press('Escape');

// Settings timed safe confirmation keeps the same visual language.
await open('settings', '.settings-panel--menu');
const scale = page.locator('[data-setting-id="ui-scale"] .settings-select-value');
await scale.click();
await page.getByRole('option', { name: '125%', exact: true }).click();
await page.waitForSelector('.settings-safe-layer');
await page.screenshot({ path: `${outDir}/27-dialog-safe-display.png` });
const countdown = Number((await page.locator('.settings-safe-dialog__countdown').textContent())?.trim());
if (!(countdown > 0 && countdown <= 15)) throw new Error('Timed display confirmation must show a countdown.');
await page.keyboard.press('Escape');

// Save/Load must retain the same shared card structure.
await open('pause-save', '.save-game-space');
const saveStructure = await page.locator('.archive-save-card').first().evaluate((node) => ({ image: !!node.querySelector('.archive-save-card__image'), copy: !!node.querySelector('.archive-save-card__copy'), status: !!node.querySelector('.archive-save-card__status'), actions: !!node.querySelector('.archive-save-card__actions') }));
await open('load', '.archive-space--load');
const loadStructure = await page.locator('.archive-save-card').first().evaluate((node) => ({ image: !!node.querySelector('.archive-save-card__image'), copy: !!node.querySelector('.archive-save-card__copy'), status: !!node.querySelector('.archive-save-card__status'), actions: !!node.querySelector('.archive-save-card__actions') }));
if (JSON.stringify(saveStructure) !== JSON.stringify(loadStructure)) throw new Error('Save and Load must share SaveEntryCard structure.');

await browser.close();
