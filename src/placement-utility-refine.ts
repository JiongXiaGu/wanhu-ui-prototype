const utilitySvgOpen = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">';
const utilitySvgClose = '</svg>';

const snapIcon = `${utilitySvgOpen}<path d="M5 5v5M5 5h5M19 5h-5M19 5v5M5 19v-5M5 19h5M19 19h-5M19 19v-5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 7.5v2M12 14.5v2M7.5 12h2M14.5 12h2"/>${utilitySvgClose}`;

function createSnapButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bp-icon-action is-active';
  button.dataset.action = 'grid-snap';
  button.dataset.tooltip = '网格吸附';
  button.setAttribute('aria-label', '网格吸附');
  button.setAttribute('aria-pressed', 'true');
  button.innerHTML = snapIcon;

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const next = !button.classList.contains('is-active');
    button.classList.toggle('is-active', next);
    button.setAttribute('aria-pressed', String(next));
  });

  return button;
}

function refinePlacementUtility() {
  const utility = document.querySelector<HTMLElement>('.building-placement-toolbar-cluster .tool-bottom-cluster__utility');
  if (!utility) return;

  const grid = utility.querySelector<HTMLButtonElement>('[data-action="grid"]');
  if (!grid) return;

  grid.dataset.tooltip = '网格显示';
  grid.setAttribute('aria-label', '网格显示');
  grid.setAttribute('aria-pressed', String(grid.classList.contains('is-active')));

  if (!utility.querySelector('[data-action="grid-snap"]')) {
    utility.insertBefore(createSnapButton(), grid);
  }

  utility.classList.add('placement-utility-strip');
}

const placementUtilityObserver = new MutationObserver(refinePlacementUtility);
placementUtilityObserver.observe(document.body, { childList: true, subtree: true });
queueMicrotask(refinePlacementUtility);

export {};
