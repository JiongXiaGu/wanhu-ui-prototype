type OperationHintRow = {
  binding: string;
  description: string;
  emphasis?: boolean;
};

type OperationHintPreset = {
  step: string;
  instruction: string;
  primary: OperationHintRow[];
  adjustment: OperationHintRow[];
};

const adjustmentPresets: Record<string, OperationHintPreset> = {
  position: {
    step: '位置调整',
    instruction: '移动建筑候选到目标位置，确认位置后继续调整或完成。',
    primary: [{ binding: '鼠标左键', description: '确认位置', emphasis: true }],
    adjustment: [
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
    ],
  },
  massing: {
    step: '楼身调整',
    instruction: '在左侧调整楼层、层高与柱网，世界候选会实时更新。',
    primary: [],
    adjustment: [
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
    ],
  },
  roof: {
    step: '屋顶调整',
    instruction: '选择屋顶区段后调整出檐与翼角，世界候选会实时更新。',
    primary: [],
    adjustment: [
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
    ],
  },
  facade: {
    step: '立面调整',
    instruction: '立面调整仍在设计中，当前不可用。',
    primary: [],
    adjustment: [],
  },
};

const terrainLabels: Record<string, string> = {
  'balanced-earthwork': '平衡挖填',
  'fill-only': '只填不挖',
  'manual-elevation': '手动标高',
};

function makeKeycaps(binding: string) {
  const container = document.createElement('span');
  container.className = 'operation-hints__binding';

  const parts = binding.split(/\s*\+\s*/g).filter(Boolean);
  parts.forEach((part, index) => {
    if (index > 0) {
      const plus = document.createElement('i');
      plus.textContent = '+';
      container.appendChild(plus);
    }
    const key = document.createElement('kbd');
    key.textContent = part;
    container.appendChild(key);
  });

  return container;
}

function makeHintRow(row: OperationHintRow) {
  const item = document.createElement('div');
  item.className = `operation-hints__row${row.emphasis ? ' is-primary' : ''}`;
  item.appendChild(makeKeycaps(row.binding));

  const description = document.createElement('span');
  description.className = 'operation-hints__description';
  description.textContent = row.description;
  item.appendChild(description);
  return item;
}

function createOperationHints() {
  const hints = document.createElement('aside');
  hints.className = 'gameplay-operation-hints';
  hints.setAttribute('aria-label', '当前操作提示');
  hints.setAttribute('aria-live', 'polite');
  hints.innerHTML = `
    <div class="operation-hints__header">
      <div class="operation-hints__heading">
        <span>当前操作</span>
        <b>建筑放置</b>
      </div>
      <div class="operation-hints__context">
        <span data-hint-terrain>平衡挖填</span>
        <i></i>
        <strong data-hint-step>位置调整</strong>
      </div>
    </div>
    <p class="operation-hints__instruction" data-hint-instruction></p>
    <div class="operation-hints__group operation-hints__group--primary" data-hint-primary></div>
    <div class="operation-hints__group operation-hints__group--adjustment" data-hint-adjustment></div>
    <div class="operation-hints__history">
      <div class="operation-hints__history-item" data-history="undo"></div>
      <div class="operation-hints__history-item" data-history="redo"></div>
    </div>
    <div class="operation-hints__exit" data-hint-exit></div>`;

  const undo = hints.querySelector<HTMLElement>('[data-history="undo"]')!;
  undo.appendChild(makeKeycaps('Ctrl + Z'));
  const undoText = document.createElement('span');
  undoText.textContent = '撤销';
  undo.appendChild(undoText);

  const redo = hints.querySelector<HTMLElement>('[data-history="redo"]')!;
  redo.appendChild(makeKeycaps('Ctrl + Y'));
  const redoText = document.createElement('span');
  redoText.textContent = '重做';
  redo.appendChild(redoText);

  const exit = hints.querySelector<HTMLElement>('[data-hint-exit]')!;
  exit.appendChild(makeKeycaps('Esc'));
  const exitText = document.createElement('span');
  exitText.textContent = '取消局部操作 / 完成建筑';
  exit.appendChild(exitText);

  return hints;
}

function currentMode(screen: HTMLElement) {
  return screen.querySelector<HTMLButtonElement>('.building-tool-adjustment-group [data-mode].is-active')?.dataset.mode || 'position';
}

function currentTerrain(screen: HTMLElement) {
  return screen.querySelector<HTMLButtonElement>('.building-tool-terrain-group [data-mode].is-active')?.dataset.mode || 'balanced-earthwork';
}

function renderRows(container: HTMLElement, rows: OperationHintRow[]) {
  container.replaceChildren(...rows.map(makeHintRow));
  container.classList.toggle('is-empty', rows.length === 0);
}

function updateOperationHints(screen: HTMLElement, hints: HTMLElement) {
  const mode = currentMode(screen);
  const terrain = currentTerrain(screen);
  const preset = adjustmentPresets[mode] || adjustmentPresets.position;

  const terrainLabel = hints.querySelector<HTMLElement>('[data-hint-terrain]');
  const step = hints.querySelector<HTMLElement>('[data-hint-step]');
  const instruction = hints.querySelector<HTMLElement>('[data-hint-instruction]');
  const primary = hints.querySelector<HTMLElement>('[data-hint-primary]');
  const adjustment = hints.querySelector<HTMLElement>('[data-hint-adjustment]');

  if (!terrainLabel || !step || !instruction || !primary || !adjustment) return;

  terrainLabel.textContent = terrainLabels[terrain] || '平衡挖填';
  step.textContent = preset.step;

  if (terrain === 'manual-elevation' && mode === 'position') {
    instruction.textContent = '先调整相对自动标高，再移动候选并确认建筑位置。';
  } else if (terrain === 'fill-only' && mode === 'position') {
    instruction.textContent = '当前只允许填高地形；移动候选并确认建筑位置。';
  } else {
    instruction.textContent = preset.instruction;
  }

  renderRows(primary, preset.primary);
  renderRows(adjustment, preset.adjustment);
}

function syncOperationHints() {
  const screen = document.querySelector<HTMLElement>('.gameplay-screen');
  if (!screen) return;

  const toolOpen = Boolean(screen.querySelector('.building-placement-prototype'));
  let hints = screen.querySelector<HTMLElement>(':scope > .gameplay-operation-hints');

  if (!toolOpen) {
    hints?.remove();
    return;
  }

  if (!hints) {
    hints = createOperationHints();
    screen.appendChild(hints);
  }

  updateOperationHints(screen, hints);
}

const observer = new MutationObserver(syncOperationHints);
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest('.building-tool-mode-action, .building-tool-icon-action');
  if (!target) return;
  queueMicrotask(syncOperationHints);
});

queueMicrotask(syncOperationHints);
