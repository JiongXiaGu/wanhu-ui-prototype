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
    id: 'undo', label: '撤销', shortcut: 'Ctrl+Z', behavior: 'momentary',
    icon: `${svgOpen}<path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>${svgClose}`,
  },
  {
    id: 'redo', label: '重做', shortcut: 'Ctrl+Y', behavior: 'momentary',
    icon: `${svgOpen}<path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6"/>${svgClose}`,
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
    id: 'unlock', label: '地图解锁', behavior: 'toggle',
    icon: `${svgOpen}<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M9 10V7a3 3 0 0 1 5.7-1.3"/>${svgClose}`,
  },
  {
    id: 'area', label: '编辑区域', behavior: 'mode',
    icon: `${svgOpen}<rect x="4" y="4" width="16" height="16" rx="1.5" stroke-dasharray="2.5 2.5"/><path d="m13 15 5-5 2 2-5 5-3 1 1-3Z"/>${svgClose}`,
  },
  {
    id: 'copy', label: '范围复制', behavior: 'mode',
    icon: `${svgOpen}<rect x="9" y="9" width="10" height="10" rx="1.5"/><path d="M15 7V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2"/>${svgClose}`,
  },
  {
    id: 'move', label: '范围移动', behavior: 'mode',
    icon: `${svgOpen}<path d="M12 3v18M3 12h18"/><path d="m9 6 3-3 3 3M18 9l3 3-3 3M9 18l3 3 3-3M6 9l-3 3 3 3"/>${svgClose}`,
  },
];

function toolButton(tool: UtilityTool) {
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

function mountCommandUtility() {
  const bar = document.querySelector<HTMLElement>('.gameplay-screen .command-bar');
  if (!bar || bar.querySelector(':scope > .command-utility')) return;

  const utility = document.createElement('div');
  utility.className = 'command-utility';
  utility.setAttribute('aria-label', '场景工具');

  const buttons = document.createElement('div');
  buttons.className = 'command-utility__buttons';

  tools.forEach((tool, index) => {
    if (index === 2 || index === 4) addSeparator(buttons);
    buttons.appendChild(toolButton(tool));
  });

  utility.appendChild(buttons);
  bar.insertBefore(utility, bar.firstChild);

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
    utility.querySelectorAll<HTMLButtonElement>('.command-utility__button[data-behavior="mode"]').forEach((button) => {
      button.classList.remove('is-active');
    });
    if (!wasActive) target.classList.add('is-active');
  });
}

const observer = new MutationObserver(mountCommandUtility);
observer.observe(document.body, { childList: true, subtree: true });
queueMicrotask(mountCommandUtility);
