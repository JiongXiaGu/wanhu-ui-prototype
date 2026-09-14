type UtilityBehavior = 'momentary' | 'mode' | 'toggle';

type UtilityTool = {
  id: string;
  label: string;
  shortcut?: string;
  behavior: UtilityBehavior;
  icon: string;
};

const svgOpen = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">';
const svgClose = '</svg>';

const tools: UtilityTool[] = [
  { id:'unlock', label:'地图解锁', behavior:'toggle', icon:`${svgOpen}<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M9 10V7a3 3 0 0 1 5.7-1.3"/>${svgClose}` },
  { id:'area', label:'编辑区域', behavior:'mode', icon:`${svgOpen}<rect x="4" y="4" width="16" height="16" rx="1.5" stroke-dasharray="2.5 2.5"/><path d="m13 15 5-5 2 2-5 5-3 1 1-3Z"/>${svgClose}` },
  { id:'terrain', label:'修改地形', behavior:'mode', icon:`${svgOpen}<path d="m3 18 6-9 4 5 2-3 6 7"/><path d="M3 18h18"/>${svgClose}` },
  { id:'color', label:'修改颜色', behavior:'mode', icon:`${svgOpen}<path d="M12 3a9 9 0 1 0 0 18h1.3a1.7 1.7 0 0 0 0-3.4h-.6a1.6 1.6 0 0 1 0-3.2H15a6 6 0 0 0-3-11.4Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.8" r=".8"/><circle cx="15.2" cy="7.6" r=".8"/>${svgClose}` },
  { id:'copy', label:'范围复制', behavior:'mode', icon:`${svgOpen}<rect x="9" y="9" width="10" height="10" rx="1.5"/><path d="M15 7V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2"/>${svgClose}` },
  { id:'move', label:'范围移动', behavior:'mode', icon:`${svgOpen}<path d="M12 3v18M3 12h18"/><path d="m9 6 3-3 3 3M18 9l3 3-3 3M9 18l3 3 3-3M6 9l-3 3 3 3"/>${svgClose}` },
  { id:'undo', label:'撤销', shortcut:'Ctrl+Z', behavior:'momentary', icon:`${svgOpen}<path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>${svgClose}` },
  { id:'redo', label:'重做', shortcut:'Ctrl+Y', behavior:'momentary', icon:`${svgOpen}<path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6"/>${svgClose}` },
];

const packageIcons = {
  grid: `${svgOpen}<path d="M4 4h16v16H4z"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>${svgClose}`,
  undo: `${svgOpen}<path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>${svgClose}`,
  redo: `${svgOpen}<path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6"/>${svgClose}`,
  complete: `${svgOpen}<path d="m5 12 4 4 10-10"/>${svgClose}`,
  cancel: `${svgOpen}<path d="M6 6l12 12M18 6 6 18"/>${svgClose}`,
};

function addSeparator(parent: HTMLElement, className = 'command-utility__separator') {
  const divider = document.createElement('i');
  divider.className = className;
  parent.appendChild(divider);
}

function makeUtilityButton(tool: UtilityTool) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'command-utility__button';
  button.dataset.tool = tool.id;
  button.dataset.behavior = tool.behavior;
  button.dataset.tooltip = tool.shortcut ? `${tool.label} · ${tool.shortcut}` : tool.label;
  button.setAttribute('aria-label', tool.label);
  button.innerHTML = tool.icon;
  return button;
}

function createUtilityToolbar() {
  const utility = document.createElement('div');
  utility.className = 'command-utility';
  utility.setAttribute('aria-label', '场景工具');
  const buttons = document.createElement('div');
  buttons.className = 'command-utility__buttons';
  tools.forEach((tool, index) => {
    if (index === 4 || index === 6) addSeparator(buttons);
    buttons.appendChild(makeUtilityButton(tool));
  });
  utility.appendChild(buttons);
  utility.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('.command-utility__button');
    if (!target) return;
    const behavior = target.dataset.behavior as UtilityBehavior;
    if (behavior === 'momentary') {
      target.classList.add('is-pressed');
      window.setTimeout(() => target.classList.remove('is-pressed'), 120);
      return;
    }
    if (behavior === 'toggle') {
      target.classList.toggle('is-active');
      return;
    }
    const wasActive = target.classList.contains('is-active');
    utility.querySelectorAll<HTMLButtonElement>('.command-utility__button[data-behavior="mode"]').forEach((button) => button.classList.remove('is-active'));
    if (!wasActive) target.classList.add('is-active');
  });
  return utility;
}

function iconButton(action: string, tooltip: string, graphic: string, selected = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `building-tool-icon-action${selected ? ' is-active' : ''}`;
  button.dataset.action = action;
  button.dataset.tooltip = tooltip;
  button.setAttribute('aria-label', tooltip);
  button.innerHTML = graphic;
  return button;
}

function modeButton(id: string, text: string, tooltip: string, selected = false, disabled = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `building-tool-mode-action${selected ? ' is-active' : ''}`;
  button.dataset.mode = id;
  button.dataset.tooltip = tooltip;
  button.setAttribute('aria-label', tooltip);
  button.textContent = text;
  button.disabled = disabled;
  return button;
}

function selectExclusive(parent: HTMLElement, target: HTMLButtonElement, selector: string) {
  parent.querySelectorAll<HTMLButtonElement>(selector).forEach(button => button.classList.toggle('is-active', button === target));
}

function ensureTerrainEngineeringSection(overlay: HTMLElement) {
  const body = overlay.querySelector<HTMLElement>('.tool-body');
  if (!body || body.querySelector('.building-placement__terrain-engineering-section')) return;

  const section = document.createElement('section');
  section.className = 'building-placement__terrain-engineering-section is-hidden';
  section.innerHTML = `
    <div class="building-placement__manual-elevation-container is-hidden">
      <div class="building-placement__manual-label">相对自动标高</div>
      <div class="building-placement__manual-control">
        <button type="button" data-elevation-step="-0.1">−</button>
        <div class="building-placement__manual-track"><i style="width:50%"></i></div>
        <button type="button" data-elevation-step="0.1">＋</button>
        <output>0.0</output>
      </div>
    </div>
    <div class="building-placement__terrain-engineering-status">等待地形候选</div>`;
  body.prepend(section);

  section.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-elevation-step]');
    if (!button) return;
    const output = section.querySelector<HTMLOutputElement>('output');
    const fill = section.querySelector<HTMLElement>('.building-placement__manual-track i');
    if (!output || !fill) return;
    const next = Math.max(-3, Math.min(3, Number(output.value || output.textContent || 0) + Number(button.dataset.elevationStep)));
    output.value = next.toFixed(1);
    output.textContent = next.toFixed(1);
    fill.style.width = `${((next + 3) / 6) * 100}%`;
    markHistoryDirty(overlay);
  });
}

function ensureDesignControls(overlay: HTMLElement) {
  const body = overlay.querySelector<HTMLElement>('.tool-body');
  if (!body || body.dataset.packageControlsReady === 'true') return;
  body.dataset.packageControlsReady = 'true';

  const group = Array.from(body.children).find(element => element.classList.contains('segment')) as HTMLElement | undefined;
  if (group) {
    group.classList.add('building-placement__design-group-field');
    const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('button'));
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.classList.toggle('is-active', item === button));
      applyDesignGroup(body, button.textContent?.trim() || '整体');
      markHistoryDirty(overlay);
    }));
  }

  let section: 'massing' | 'roof' | null = null;
  Array.from(body.children).forEach((node) => {
    const element = node as HTMLElement;
    if (element.classList.contains('building-placement__terrain-engineering-section')) return;
    if (element === group) return;
    if (element.tagName === 'H3') {
      const text = element.textContent?.trim();
      if (text === '楼身比例') section = 'massing';
      else if (text === '屋顶轮廓') section = 'roof';
    }
    if (section && !element.classList.contains('icon-strip')) element.dataset.designSection = section;
  });

  const eaveRow = Array.from(body.querySelectorAll<HTMLElement>('.parameter-row')).find(row => row.querySelector('span')?.textContent?.trim() === '出檐尺度');
  if (eaveRow) {
    const output = eaveRow.querySelector('output');
    const fill = eaveRow.querySelector<HTMLElement>('.track i');
    if (output) output.textContent = '1.4';
    if (fill) fill.style.width = '36%';
    if (!body.querySelector('[data-design-control="wing-corner"]')) {
      const wing = document.createElement('div');
      wing.className = 'parameter-row';
      wing.dataset.designSection = 'roof';
      wing.dataset.designControl = 'wing-corner';
      wing.innerHTML = '<span>翼角起冲</span><button type="button">−</button><div class="track"><i style="width:45%"></i></div><button type="button">＋</button><output>0.45</output>';
      eaveRow.insertAdjacentElement('afterend', wing);
    }
  }

  body.querySelector<HTMLElement>('.icon-strip')?.classList.add('building-placement__legacy-quick-options');
  applyDesignGroup(body, '整体');
}

function applyDesignGroup(body: HTMLElement, group: string) {
  body.querySelectorAll<HTMLElement>('[data-design-section]').forEach(element => {
    const visible = group === '整体' || (group === '楼身' && element.dataset.designSection === 'massing') || (group === '屋顶' && element.dataset.designSection === 'roof');
    element.classList.toggle('is-group-hidden', !visible);
  });
}

function updateTerrainEngineering(overlay: HTMLElement, mode: string) {
  const section = overlay.querySelector<HTMLElement>('.building-placement__terrain-engineering-section');
  const manual = overlay.querySelector<HTMLElement>('.building-placement__manual-elevation-container');
  const status = overlay.querySelector<HTMLElement>('.building-placement__terrain-engineering-status');
  if (!section || !manual || !status) return;
  section.classList.remove('is-hidden');
  manual.classList.toggle('is-hidden', mode !== 'manual-elevation');
  if (mode === 'balanced-earthwork') status.textContent = '最终标高 12.40 米　最大挖深 0.42 米　最大填高 0.38 米';
  else if (mode === 'fill-only') status.textContent = '只填不挖　最终标高 12.68 米　最大填高 0.64 米';
  else status.textContent = '手动标高　相对自动标高 0.00 米';
}

function markHistoryDirty(overlay: HTMLElement) {
  const undo = overlay.parentElement?.querySelector<HTMLButtonElement>('.building-placement-toolbar-cluster [data-action="undo"]');
  const redo = overlay.parentElement?.querySelector<HTMLButtonElement>('.building-placement-toolbar-cluster [data-action="redo"]');
  if (undo) undo.disabled = false;
  if (redo) redo.disabled = true;
}

function createBuildingPlacementToolbar(overlay: HTMLElement) {
  const cluster = document.createElement('div');
  cluster.className = 'tool-bottom-cluster building-placement-toolbar-cluster';
  cluster.setAttribute('aria-label', '建筑放置工具栏');

  const roofAnchor = document.createElement('div');
  roofAnchor.className = 'building-placement__roof-section-toolbar is-hidden';
  roofAnchor.innerHTML = `
    <button type="button" data-roof-section="terminal-roof" class="is-active">重檐上</button>
    <button type="button" data-roof-section="double-eave-lower">重檐下</button>
    <button type="button" data-roof-section="tier-eave">层檐</button>`;

  const utility = document.createElement('div');
  utility.className = 'tool-bottom-cluster__utility';
  utility.appendChild(iconButton('grid', '显示或隐藏地图网格', packageIcons.grid, true));
  addSeparator(utility, 'building-tool-divider');
  const undo = iconButton('undo', '撤销当前工具的上一步操作', packageIcons.undo);
  const redo = iconButton('redo', '重做当前工具的上一步操作', packageIcons.redo);
  undo.disabled = true;
  redo.disabled = true;
  utility.append(undo, redo);

  const primary = document.createElement('div');
  primary.className = 'tool-bottom-cluster__primary';
  const terrain = document.createElement('div');
  terrain.className = 'building-tool-mode-group building-tool-terrain-group';
  terrain.append(
    modeButton('balanced-earthwork', '平', '平衡挖填', true),
    modeButton('fill-only', '填', '只填不挖'),
    modeButton('manual-elevation', '高', '手动调整建筑标高'),
  );
  const adjustment = document.createElement('div');
  adjustment.className = 'building-tool-mode-group building-tool-adjustment-group';
  adjustment.append(
    modeButton('position', '位', '调整建筑位置', true),
    modeButton('massing', '层', '调整楼身高度、楼层收分和楼层数量'),
    modeButton('roof', '顶', '调整普通层檐举出与翼角起冲'),
    modeButton('facade', '面', '立面调整功能等待重新设计', false, true),
  );
  primary.appendChild(terrain);
  addSeparator(primary, 'building-tool-divider');
  primary.appendChild(adjustment);
  addSeparator(primary, 'building-tool-divider');
  primary.appendChild(iconButton('complete', '完成当前建筑并返回建筑目录', packageIcons.complete));
  addSeparator(primary, 'building-tool-divider');
  const cancel = iconButton('cancel', '放弃当前未提交建筑并返回建筑目录', packageIcons.cancel);
  cancel.classList.add('is-destructive');
  primary.appendChild(cancel);

  cluster.append(roofAnchor, utility, primary);

  cluster.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!target || target.disabled) return;

    if (target.dataset.roofSection) {
      selectExclusive(roofAnchor, target, 'button[data-roof-section]');
      markHistoryDirty(overlay);
      return;
    }

    const mode = target.dataset.mode;
    if (mode) {
      const group = target.closest<HTMLElement>('.building-tool-mode-group');
      if (!group) return;
      selectExclusive(group, target, 'button[data-mode]');
      if (group.classList.contains('building-tool-terrain-group')) updateTerrainEngineering(overlay, mode);
      if (group.classList.contains('building-tool-adjustment-group')) {
        roofAnchor.classList.toggle('is-hidden', mode !== 'roof');
      }
      markHistoryDirty(overlay);
      return;
    }

    const action = target.dataset.action;
    if (action === 'grid') {
      target.classList.toggle('is-active');
      markHistoryDirty(overlay);
      return;
    }
    if (action === 'undo') {
      target.disabled = true;
      redo.disabled = false;
      return;
    }
    if (action === 'redo') {
      target.disabled = true;
      undo.disabled = false;
      return;
    }
    if (action === 'complete') {
      overlay.classList.add('is-committing');
      cluster.classList.add('is-committing');
      window.setTimeout(() => overlay.querySelector<HTMLButtonElement>('header .icon-button')?.click(), 220);
      return;
    }
    if (action === 'cancel') {
      overlay.querySelector<HTMLButtonElement>('header .icon-button')?.click();
    }
  });

  return cluster;
}

function syncGameplayEnhancements() {
  const screen = document.querySelector<HTMLElement>('.gameplay-screen');
  if (!screen) return;

  if (!screen.querySelector(':scope > .command-utility')) screen.appendChild(createUtilityToolbar());

  const overlay = screen.querySelector<HTMLElement>('.tool-overlay');
  const cluster = screen.querySelector<HTMLElement>(':scope > .building-placement-toolbar-cluster');
  if (overlay) {
    overlay.classList.add('building-placement-prototype');
    ensureTerrainEngineeringSection(overlay);
    ensureDesignControls(overlay);
    if (!cluster) screen.appendChild(createBuildingPlacementToolbar(overlay));
  } else if (cluster) {
    cluster.remove();
  }
}

const observer = new MutationObserver(syncGameplayEnhancements);
observer.observe(document.body, { childList: true, subtree: true });
queueMicrotask(syncGameplayEnhancements);
