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
  {
    id: 'unlock', label: '地图解锁', behavior: 'toggle',
    icon: `${svgOpen}<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M9 10V7a3 3 0 0 1 5.7-1.3"/>${svgClose}`,
  },
  {
    id: 'area', label: '编辑区域', behavior: 'mode',
    icon: `${svgOpen}<rect x="4" y="4" width="16" height="16" rx="1.5" stroke-dasharray="2.5 2.5"/><path d="m13 15 5-5 2 2-5 5-3 1 1-3Z"/>${svgClose}`,
  },
  {
    id: 'terrain', label: '修改地形', behavior: 'mode',
    icon: `${svgOpen}<path d="m3 18 6-9 4 5 2-3 6 7"/><path d="M3 18h18"/>${svgClose}`,
  },
  {
    id: 'color', label: '修改颜色', behavior: 'mode',
    icon: `${svgOpen}<path d="M12 3a9 9 0 1 0 0 18h1.3a1.7 1.7 0 0 0 0-3.4h-.6a1.6 1.6 0 0 1 0-3.2H15a6 6 0 0 0-3-11.4Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.8" r=".8"/><circle cx="15.2" cy="7.6" r=".8"/>${svgClose}`,
  },
  {
    id: 'copy', label: '范围复制', behavior: 'mode',
    icon: `${svgOpen}<rect x="9" y="9" width="10" height="10" rx="1.5"/><path d="M15 7V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2"/>${svgClose}`,
  },
  {
    id: 'move', label: '范围移动', behavior: 'mode',
    icon: `${svgOpen}<path d="M12 3v18M3 12h18"/><path d="m9 6 3-3 3 3M18 9l3 3-3 3M9 18l3 3 3-3M6 9l-3 3 3 3"/>${svgClose}`,
  },
  {
    id: 'undo', label: '撤销', shortcut: 'Ctrl+Z', behavior: 'momentary',
    icon: `${svgOpen}<path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>${svgClose}`,
  },
  {
    id: 'redo', label: '重做', shortcut: 'Ctrl+Y', behavior: 'momentary',
    icon: `${svgOpen}<path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6"/>${svgClose}`,
  },
];

const toolActions = [
  { id: 'undo', label: '撤销', icon: `${svgOpen}<path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>${svgClose}` },
  { id: 'redo', label: '重做', icon: `${svgOpen}<path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6"/>${svgClose}` },
  { id: 'snap', label: '吸附', icon: `${svgOpen}<path d="M7 4v7a5 5 0 0 0 10 0V4"/><path d="M7 4h4M13 4h4"/><path d="M7 8h4M13 8h4"/>${svgClose}` },
  { id: 'grid', label: '网格', icon: `${svgOpen}<path d="M4 4h16v16H4z"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>${svgClose}` },
];

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

function addSeparator(parent: HTMLElement) {
  const divider = document.createElement('i');
  divider.className = 'command-utility__separator';
  parent.appendChild(divider);
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

function createToolBottomCluster() {
  const cluster = document.createElement('div');
  cluster.className = 'tool-bottom-cluster';
  cluster.setAttribute('aria-label', '当前工具操作');

  const utility = document.createElement('div');
  utility.className = 'tool-bottom-cluster__utility';
  toolActions.forEach((action, index) => {
    if (index === 2) addSeparator(utility);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool-bottom-action';
    button.dataset.action = action.id;
    button.innerHTML = `${action.icon}<span>${action.label}</span>`;
    utility.appendChild(button);
  });

  const primary = document.createElement('div');
  primary.className = 'tool-bottom-cluster__primary';
  primary.innerHTML = '<button type="button" class="tool-primary-action tool-primary-action--cancel" data-action="cancel">取消</button><button type="button" class="tool-primary-action" data-action="complete">完成</button>';

  cluster.append(utility, primary);

  cluster.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if (!target) return;
    const action = target.dataset.action;

    if (action === 'snap' || action === 'grid') {
      target.classList.toggle('is-active');
      return;
    }

    if (action === 'undo' || action === 'redo') {
      target.classList.add('is-pressed');
      window.setTimeout(() => target.classList.remove('is-pressed'), 120);
      return;
    }

    if (action === 'cancel' || action === 'complete') {
      document.querySelector<HTMLButtonElement>('.tool-overlay header .icon-button')?.click();
    }
  });

  return cluster;
}

function syncGameplayEnhancements() {
  const screen = document.querySelector<HTMLElement>('.gameplay-screen');
  if (!screen) return;

  if (!screen.querySelector(':scope > .command-utility')) {
    screen.appendChild(createUtilityToolbar());
  }

  const toolOpen = Boolean(screen.querySelector('.tool-overlay'));
  const cluster = screen.querySelector<HTMLElement>(':scope > .tool-bottom-cluster');
  if (toolOpen && !cluster) screen.appendChild(createToolBottomCluster());
  if (!toolOpen && cluster) cluster.remove();
}

const observer = new MutationObserver(syncGameplayEnhancements);
observer.observe(document.body, { childList: true, subtree: true });
queueMicrotask(syncGameplayEnhancements);
