import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, Trash2 } from 'lucide-react';

type DialogTone = 'primary' | 'danger';
type ToastTone = 'neutral' | 'success' | 'danger';

type ConfirmDialogRequest = {
  kind: 'confirm';
  id: number;
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  tone: DialogTone;
  onConfirm: () => void;
  onCancel?: () => void;
};

type InputDialogRequest = {
  kind: 'input';
  id: number;
  title: string;
  label: string;
  initialValue: string;
  placeholder?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
};

type TimedDialogRequest = {
  kind: 'timed';
  id: number;
  title: string;
  message?: string;
  summaryLabel?: string;
  summaryValue?: string;
  seconds: number;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

type DialogRequest = ConfirmDialogRequest | InputDialogRequest | TimedDialogRequest;

type ToastItem = {
  id: number;
  text: string;
  tone: ToastTone;
};

type ConfirmOptions = Omit<ConfirmDialogRequest, 'kind' | 'id' | 'cancelText' | 'tone'> & {
  cancelText?: string;
  tone?: DialogTone;
};

type InputOptions = Omit<InputDialogRequest, 'kind' | 'id' | 'cancelText'> & {
  cancelText?: string;
};

type TimedOptions = Omit<TimedDialogRequest, 'kind' | 'id' | 'cancelText'> & {
  cancelText?: string;
};

type DialogContextValue = {
  dialog: DialogRequest | null;
  toasts: ToastItem[];
  confirm: (options: ConfirmOptions) => void;
  input: (options: InputOptions) => void;
  timed: (options: TimedOptions) => void;
  toast: (text: string, tone?: ToastTone, duration?: number) => void;
  dismissDialog: (invokeCancel?: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);
let nextId = 1;

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogRequest | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimers = useRef(new Map<number, number>());

  useEffect(() => () => {
    toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    toastTimers.current.clear();
  }, []);

  const dismissDialog = useCallback((invokeCancel = false) => {
    setDialog((current) => {
      if (invokeCancel) current?.onCancel?.();
      return null;
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setDialog({ ...options, id: nextId++, kind: 'confirm', cancelText: options.cancelText ?? '取消', tone: options.tone ?? 'primary' });
  }, []);

  const input = useCallback((options: InputOptions) => {
    setDialog({ ...options, id: nextId++, kind: 'input', cancelText: options.cancelText ?? '取消' });
  }, []);

  const timed = useCallback((options: TimedOptions) => {
    setDialog({ ...options, id: nextId++, kind: 'timed', cancelText: options.cancelText ?? '恢复原设置' });
  }, []);

  const toast = useCallback((text: string, tone: ToastTone = 'neutral', duration = 1800) => {
    const id = nextId++;
    setToasts((current) => [...current.slice(-2), { id, text, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
      toastTimers.current.delete(id);
    }, duration);
    toastTimers.current.set(id, timer);
  }, []);

  const value = useMemo(() => ({ dialog, toasts, confirm, input, timed, toast, dismissDialog }), [dialog, toasts, confirm, input, timed, toast, dismissDialog]);
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function useDialogSystem() {
  const value = useContext(DialogContext);
  if (!value) throw new Error('useDialogSystem must be used inside DialogProvider.');
  return value;
}

export function DialogHost() {
  const { dialog, dismissDialog } = useDialogSystem();
  if (!dialog) return null;
  if (dialog.kind === 'input') return <InputDialogView key={dialog.id} request={dialog} onDismiss={() => dismissDialog(false)} />;
  if (dialog.kind === 'timed') return <TimedDialogView key={dialog.id} request={dialog} onDismiss={() => dismissDialog(false)} />;
  return <ConfirmDialogView key={dialog.id} request={dialog} onDismiss={() => dismissDialog(false)} />;
}

export function NotificationHost() {
  const { toasts } = useDialogSystem();
  return (
    <div className="notification-host" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => <div key={toast.id} className={`ui-toast is-${toast.tone}`} role="status">{toast.tone === 'success' && <Check size={14} />}<span>{toast.text}</span></div>)}
    </div>
  );
}

function DialogFrame({ title, message, tone = 'primary', children, actions }: { title: string; message?: string; tone?: DialogTone; children?: ReactNode; actions: ReactNode }) {
  return (
    <div className="ui-modal-layer" role="presentation">
      <div className="ui-modal-backdrop" />
      <section className={`ui-dialog is-${tone}`} role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title">
        <header className="ui-dialog__header"><h2 id="ui-dialog-title">{title}</h2>{message && <p>{message}</p>}</header>
        {children && <div className="ui-dialog__body">{children}</div>}
        <footer className="ui-dialog__actions">{actions}</footer>
      </section>
    </div>
  );
}

function ConfirmDialogView({ request, onDismiss }: { request: ConfirmDialogRequest; onDismiss: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    (request.tone === 'danger' ? cancelRef.current : confirmRef.current)?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); request.onCancel?.(); onDismiss(); }
      else if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); request.onConfirm(); onDismiss(); }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [request, onDismiss]);

  const confirmAction = () => { request.onConfirm(); onDismiss(); };
  const cancelAction = () => { request.onCancel?.(); onDismiss(); };
  return (
    <DialogFrame title={request.title} message={request.message} tone={request.tone} actions={<><button ref={cancelRef} type="button" className="ui-dialog-button is-secondary" onClick={cancelAction}>{request.cancelText}</button><button ref={confirmRef} type="button" className={`ui-dialog-button ${request.tone === 'danger' ? 'is-danger' : 'is-primary'}`} onClick={confirmAction}>{request.tone === 'danger' && <Trash2 size={14} />}{request.confirmText}</button></>} />
  );
}

function InputDialogView({ request, onDismiss }: { request: InputDialogRequest; onDismiss: () => void }) {
  const [value, setValue] = useState(request.initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const canConfirm = value.trim().length > 0;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [request.id]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); request.onCancel?.(); onDismiss(); }
      else if (event.key === 'Enter' && canConfirm) { event.preventDefault(); event.stopPropagation(); request.onConfirm(value.trim()); onDismiss(); }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [request, onDismiss, value, canConfirm]);

  const confirmAction = () => { if (!canConfirm) return; request.onConfirm(value.trim()); onDismiss(); };
  const cancelAction = () => { request.onCancel?.(); onDismiss(); };
  return (
    <DialogFrame title={request.title} actions={<><button type="button" className="ui-dialog-button is-secondary" onClick={cancelAction}>{request.cancelText}</button><button type="button" className="ui-dialog-button is-primary" disabled={!canConfirm} onClick={confirmAction}>{request.confirmText}</button></>}>
      <label className="ui-dialog-input"><span>{request.label}</span><input ref={inputRef} value={value} placeholder={request.placeholder} onChange={(event) => setValue(event.target.value)} /></label>
    </DialogFrame>
  );
}

function TimedDialogView({ request, onDismiss }: { request: TimedDialogRequest; onDismiss: () => void }) {
  const [seconds, setSeconds] = useState(request.seconds);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); request.onCancel(); onDismiss(); }
      else if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); request.onConfirm(); onDismiss(); }
    };
    window.addEventListener('keydown', handleKey, true);
    const timer = window.setInterval(() => setSeconds((current) => current - 1), 1000);
    return () => { window.removeEventListener('keydown', handleKey, true); window.clearInterval(timer); };
  }, [request, onDismiss]);

  useEffect(() => {
    if (seconds > 0) return;
    request.onCancel();
    onDismiss();
  }, [seconds, request, onDismiss]);

  const confirmAction = () => { request.onConfirm(); onDismiss(); };
  const cancelAction = () => { request.onCancel(); onDismiss(); };
  return (
    <DialogFrame title={request.title} message={request.message} actions={<><button type="button" className="ui-dialog-button is-secondary" onClick={cancelAction}>{request.cancelText}</button><button type="button" className="ui-dialog-button is-primary" onClick={confirmAction}><Check size={14} />{request.confirmText}</button></>}>
      {(request.summaryLabel || request.summaryValue) && <div className="ui-dialog-change"><span>{request.summaryLabel}</span><b>{request.summaryValue}</b></div>}
      <div className="ui-dialog-countdown" aria-live="polite"><strong>{Math.max(0, seconds)}</strong><span>秒后自动恢复</span></div>
    </DialogFrame>
  );
}
