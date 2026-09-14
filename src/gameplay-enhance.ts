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

function iconAction(action: string, tooltip: string, icon: string, selected = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `bp-icon-action${selected ? ' is-active' : ''}`;
  button.dataset.action = action;
  button.dataset.tooltip = tooltip;
  button.setAttribute('aria-label', tooltip);
  button.innerHTML = icon;
  return button;
}

function modeAction(id: string, label: string, tooltip: string, selected = false, disabled = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `bp-mode-action${selected ? ' is-active' : ''}`;
  button.dataset.mode = id;
  button.dataset.tooltip = tooltip;
  button.setAttribute('aria-label', tooltip);
  button.textContent = label;
  button.disabled = disabled;
  return button;
}

function selectExclusive(parent: HTMLElement, target: HTMLButtonElement, selector: string) {
  parent.querySelectorAll<HTMLButtonElement>(selector).forEach(button => button.classList.toggle('is-active', button === target));
}

function parameterRow(label: string, value: string, pct: number, step = 0.1) {
  return `<div class="bp-parameter-row" data-step="${step}">
    <span>${label}</span>
    <button type="button" data-delta="-${step}">−</button>
    <div class="bp-track"><i style="width:${pct}%"></i></div>
    <button type="button" data-delta="${step}">＋</button>
    <output>${value}</output>
  </div>`;
}

function segmentedRow(label: string, values: string[], activeIndex: number, key: string) {
  return `<div class="bp-segment-row"><span>${label}</span><div class="bp-segment" data-segment="${key}">${values.map((value, index) => `<button type="button" class="${index === activeIndex ? 'is-active' : ''}">${value}</button>`).join('')}</div></div>`;
}

function terrainSummary(mode: string) {
  if (mode === 'fill-only') {
    return `<div class="bp-terrain-summary__top"><b>只填不挖</b><span>地形关系</span></div><div class="bp-terrain-metrics"><span>最终标高 <b>12.68 m</b></span><span>最大填高 <b>0.64 m</b></span></div>`;
  }
  if (mode === 'manual-elevation') {
    return `<div class="bp-terrain-summary__top"><b>手动标高</b><span>地形关系</span></div>${parameterRow('相对自动标高','0.00 m',50,0.1)}`;
  }
  return `<div class="bp-terrain-summary__top"><b>平衡挖填</b><span>地形关系</span></div><div class="bp-terrain-metrics"><span>最终标高 <b>12.40 m</b></span><span>挖深 <b>0.42 m</b></span><span>填高 <b>0.38 m</b></span></div>`;
}

function modeContent(mode: string) {
  if (mode === 'massing') {
    return `<div class="bp-mode-heading"><div><b>楼身调整</b><span>楼层、层高与结构比例</span></div><em>层</em></div>
      <div class="bp-section-title">楼身参数</div>
      ${parameterRow('楼层数量','3',42,1)}
      ${parameterRow('单层高度','4.2',48,0.1)}
      ${segmentedRow('柱网布局',['疏朗','均衡','紧凑'],1,'columns')}
      ${parameterRow('楼层收分','0.12',34,0.01)}`;
  }
  if (mode === 'roof') {
    return `<div class="bp-mode-heading"><div><b>屋顶调整</b><span>当前区段与檐口轮廓</span></div><em>顶</em></div>
      ${segmentedRow('屋顶区段',['重檐上','重檐下','层檐'],0,'roof-section')}
      <div class="bp-section-title">屋顶参数</div>
      ${parameterRow('出檐尺度','1.4',36,0.1)}
      ${parameterRow('翼角起冲','0.45',45,0.05)}`;
  }
  return `<div class="bp-mode-heading"><div><b>位置调整</b><span>移动、旋转与放置吸附</span></div><em>位</em></div>
    ${segmentedRow('放置方式',['自由','道路吸附','网格'],0,'placement')}
    <div class="bp-section-title">空间参数</div>
    ${parameterRow('旋转角度','0°',0,15)}
    ${parameterRow('吸附距离','4.0 m',44,0.5)}`;
}

function renderPlacementPanel(overlay: HTMLElement) {
  const panel = overlay.querySelector<HTMLElement>('.bp-context-panel');
  if (!panel) return;
  const terrainMode = overlay.dataset.terrainMode || 'balanced-earthwork';
  const adjustmentMode = overlay.dataset.adjustmentMode || 'position';
  panel.innerHTML = `<section class="bp-terrain-summary">${terrainSummary(terrainMode)}</section><section class="bp-mode-content">${modeContent(adjustmentMode)}</section>`;
}

function ensureBuildingPlacementPanel(overlay: HTMLElement) {
  const body = overlay.querySelector<HTMLElement>('.tool-body');
  if (!body || body.dataset.modeDrivenReady === 'true') return;
  body.dataset.modeDrivenReady = 'true';
  overlay.dataset.terrainMode = 'balanced-earthwork';
  overlay.dataset.adjustmentMode = 'position';
  overlay.classList.add('building-placement-prototype');

  Array.from(body.children).forEach(child => (child as HTMLElement).classList.add('bp-legacy-control'));
  const panel = document.createElement('div');
  panel.className = 'bp-context-panel';
  body.appendChild(panel);
  renderPlacementPanel(overlay);

  body.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!target) return;
    if (target.closest('.bp-segment')) {
      const segment = target.closest<HTMLElement>('.bp-segment');
      if (segment) selectExclusive(segment, target, 'button');
      markHistoryDirty(overlay);
      return;
    }
    if (target.dataset.delta) {
      const row = target.closest<HTMLElement>('.bp-parameter-row');
      const output = row?.querySelector<HTMLOutputElement>('output');
      const fill = row?.querySelector<HTMLElement>('.bp-track i');
      if (!row || !output || !fill) return;
      const raw = (output.textContent || '0').replace(/[^0-9+\-.]/g,'');
      const current = Number(raw || 0);
      const delta = Number(target.dataset.delta);
      const next = current + delta;
      const suffix = (output.textContent || '').includes('°') ? '°' : (output.textContent || '').includes('m') ? ' m' : '';
      const decimals = Math.abs(delta) < 0.1 ? 2 : Math.abs(delta) < 1 ? 1 : 0;
      output.textContent = `${next.toFixed(decimals)}${suffix}`;
      const width = Math.max(4, Math.min(96, Number.parseFloat(fill.style.width || '50') + Math.sign(delta) * 4));
      fill.style.width = `${width}%`;
      markHistoryDirty(overlay);
    }
  });
}

function markHistoryDirty(overlay: HTMLElement) {
  const cluster = overlay.parentElement?.querySelector<HTMLElement>('.building-placement-toolbar-cluster');
  const undo = cluster?.querySelector<HTMLButtonElement>('[data-action="undo"]');
  const redo = cluster?.querySelector<HTMLButtonElement>('[data-action="redo"]');
  if (undo) undo.disabled = false;
  if (redo) redo.disabled = true;
}

function createBuildingPlacementToolbar(overlay: HTMLElement) {
  const cluster = document.createElement('div');
  cluster.className = 'tool-bottom-cluster building-placement-toolbar-cluster';
  cluster.setAttribute('aria-label','建筑放置工具栏');

  const utility = document.createElement('div');
  utility.className = 'tool-bottom-cluster__utility';
  utility.appendChild(iconAction('grid','显示或隐藏地图网格',packageIcons.grid,true));
  addSeparator(utility,'bp-divider');
  const undo = iconAction('undo','撤销 · Ctrl+Z',packageIcons.undo);
  const redo = iconAction('redo','重做 · Ctrl+Y',packageIcons.redo);
  undo.disabled = true;
  redo.disabled = true;
  utility.append(undo,redo);

  const primary = document.createElement('div');
  primary.className = 'tool-bottom-cluster__primary';

  const terrain = document.createElement('div');
  terrain.className = 'bp-mode-group bp-terrain-group';
  terrain.append(
    modeAction('balanced-earthwork','平','平衡挖填',true),
    modeAction('fill-only','填','只填不挖'),
    modeAction('manual-elevation','高','手动调整建筑标高'),
  );

  const adjustment = document.createElement('div');
  adjustment.className = 'bp-mode-group bp-adjustment-group';
  adjustment.append(
    modeAction('position','位','位置调整',true),
    modeAction('massing','层','楼身调整'),
    modeAction('roof','顶','屋顶调整'),
    modeAction('facade','面','立面调整尚未开放',false,true),
  );

  const actions = document.createElement('div');
  actions.className = 'bp-submit-group';
  actions.innerHTML = '<button type="button" class="bp-submit bp-submit--complete" data-action="complete">完成</button><button type="button" class="bp-submit" data-action="cancel">取消</button>';

  primary.append(terrain);
  addSeparator(primary,'bp-divider');
  primary.append(adjustment);
  addSeparator(primary,'bp-divider');
  primary.append(actions);
  cluster.append(utility,primary);

  cluster.addEventListener('click',(event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!target || target.disabled) return;

    const mode = target.dataset.mode;
    if (mode) {
      const group = target.closest<HTMLElement>('.bp-mode-group');
      if (!group) return;
      selectExclusive(group,target,'button[data-mode]');
      if (group.classList.contains('bp-terrain-group')) overlay.dataset.terrainMode = mode;
      else overlay.dataset.adjustmentMode = mode;
      renderPlacementPanel(overlay);
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
    if (action === 'complete' || action === 'cancel') {
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
    ensureBuildingPlacementPanel(overlay);
    if (!cluster) screen.appendChild(createBuildingPlacementToolbar(overlay));
  } else if (cluster) {
    cluster.remove();
  }
}

const observer = new MutationObserver(syncGameplayEnhancements);
observer.observe(document.body,{childList:true,subtree:true});
queueMicrotask(syncGameplayEnhancements);
