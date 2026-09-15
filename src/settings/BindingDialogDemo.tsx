import { useEffect, useRef, useState } from 'react';
import { useDialogSystem } from '../ui/dialog/DialogSystem';
import './binding-dialog-demo.css';

type BindingTarget = {
  element: HTMLButtonElement;
  action: string;
  slot: '主要按键' | '次要按键';
  current: string;
};

type CaptureResult = {
  value?: string;
  error?: string;
};

function readBindingTarget(element: HTMLButtonElement): BindingTarget | null {
  const row = element.closest('.settings-binding-row');
  const action = row?.querySelector<HTMLElement>('.settings-binding-row__label b')?.textContent?.trim();
  if (!action) return null;

  const slot = element.classList.contains('settings-binding-cell--primary') ? '主要按键' : '次要按键';
  const current = element.querySelector('kbd')?.textContent?.trim() ?? '';
  return { element, action, slot, current };
}

function formatCapturedKey(event: KeyboardEvent): CaptureResult {
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return {};

  const modifiers = [
    event.ctrlKey ? 'Ctrl' : '',
    event.shiftKey ? 'Shift' : '',
    event.altKey ? 'Alt' : '',
    event.metaKey ? 'Meta' : '',
  ].filter(Boolean);

  if (modifiers.length > 1) return { error: '演示版最多支持两个按键组成一个组合键。' };

  const aliases: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
  };
  const base = aliases[event.key] ?? (event.key.length === 1 ? event.key.toUpperCase() : event.key);
  return { value: [...modifiers, base].join(' + ') };
}

function findConflict(target: BindingTarget, value: string) {
  if (!value || value === target.current) return '';

  const cells = Array.from(document.querySelectorAll<HTMLButtonElement>('.settings-binding-cell'));
  const conflict = cells.find((cell) => cell !== target.element && cell.querySelector('kbd')?.textContent?.trim() === value);
  if (!conflict) return '';

  const owner = conflict.closest('.settings-binding-row')?.querySelector<HTMLElement>('.settings-binding-row__label b')?.textContent?.trim();
  return owner ? `“${value}”已用于“${owner}”。请换一个按键。` : `“${value}”已被其它操作使用。`;
}

function writeBinding(target: BindingTarget, value: string) {
  target.element.replaceChildren();

  if (value) {
    const key = document.createElement('kbd');
    key.textContent = value;
    target.element.append(key);
    target.element.classList.remove('is-empty');
  } else {
    const empty = document.createElement('span');
    empty.className = 'settings-binding-cell__empty';
    empty.textContent = '+ 添加';
    target.element.append(empty);
    target.element.classList.add('is-empty');
  }

  target.element.setAttribute('aria-label', `${target.action}${target.slot}：${value || '未设置'}`);
}

export function BindingDialogDemo() {
  const dialogs = useDialogSystem();
  const captureRef = useRef<HTMLButtonElement>(null);
  const [target, setTarget] = useState<BindingTarget | null>(null);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const interceptBindingCell = (event: MouseEvent) => {
      const node = event.target instanceof Element ? event.target.closest('.settings-binding-cell') : null;
      if (!(node instanceof HTMLButtonElement)) return;

      const nextTarget = readBindingTarget(node);
      if (!nextTarget) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      setTarget(nextTarget);
      setDraft(nextTarget.current);
      setMessage('');
      setListening(true);
    };

    window.addEventListener('click', interceptBindingCell, true);
    return () => window.removeEventListener('click', interceptBindingCell, true);
  }, []);

  useEffect(() => {
    if (!target) return;
    captureRef.current?.focus();

    const captureKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setTarget(null);
        return;
      }

      if (!listening) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (event.key === 'Backspace' || event.key === 'Delete') {
        setDraft('');
        setMessage('');
        setListening(false);
        return;
      }

      const result = formatCapturedKey(event);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      if (!result.value) return;

      setDraft(result.value);
      setMessage(findConflict(target, result.value));
      setListening(false);
    };

    window.addEventListener('keydown', captureKey, true);
    return () => window.removeEventListener('keydown', captureKey, true);
  }, [target, listening]);

  if (!target) return null;

  const save = () => {
    if (message) return;
    writeBinding(target, draft);
    setTarget(null);
    dialogs.toast('按键绑定已更新。', 'success');
  };

  return (
    <div className="ui-modal-layer binding-dialog-demo-layer" role="presentation">
      <div className="ui-modal-backdrop" />
      <section className="ui-dialog binding-dialog-demo" role="dialog" aria-modal="true" aria-labelledby="binding-dialog-demo-title">
        <header className="ui-dialog__header">
          <h2 id="binding-dialog-demo-title">修改按键绑定</h2>
          <p>{target.action} · {target.slot}</p>
        </header>

        <div className="ui-dialog__body binding-dialog-demo__body">
          <div className="binding-dialog-demo__current">
            <span>当前绑定</span>
            <b>{target.current || '未设置'}</b>
          </div>

          <button
            ref={captureRef}
            type="button"
            className={`binding-dialog-demo__capture ${listening ? 'is-listening' : ''}`}
            onClick={() => {
              setMessage('');
              setListening(true);
            }}
          >
            <span>{listening ? '正在等待输入' : '新的绑定'}</span>
            <strong>{listening ? '请按下新的按键组合…' : (draft || '未设置')}</strong>
            <small>{listening ? '支持单键，或两个按键组成的组合键' : '点击这里重新输入'}</small>
          </button>

          {message && <div className="binding-dialog-demo__message" role="alert">{message}</div>}
        </div>

        <footer className="ui-dialog__actions binding-dialog-demo__actions">
          <button type="button" className="ui-dialog-button is-secondary binding-dialog-demo__clear" onClick={() => {
            setDraft('');
            setMessage('');
            setListening(false);
          }}>清除绑定</button>
          <button type="button" className="ui-dialog-button is-secondary" onClick={() => setTarget(null)}>取消</button>
          <button type="button" className="ui-dialog-button is-primary" disabled={Boolean(message) || listening} onClick={save}>保存</button>
        </footer>
      </section>
    </div>
  );
}
