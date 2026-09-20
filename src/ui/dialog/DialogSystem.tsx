import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, CircleX, Info, Trash2, TriangleAlert } from '../icons/runtime-icons.generated';
import { TextInput } from '../Controls';
import { UiIcon } from '../icons/UiIcon';
import { usePresence, type MotionPhase } from '../motion';

type DialogTone = 'primary' | 'danger';
type DialogVisualTone = 'neutral' | 'warning' | 'danger';
type NotificationTone = 'neutral' | 'success' | 'warning' | 'error';
type ToastTone = NotificationTone | 'danger';
type InputMode = 'text' | 'numeric' | 'decimal';

type ConfirmDialogRequest = {
  kind: 'confirm'; id: number; title: string; message?: string;
  confirmText: string; cancelText: string; tone: DialogTone; visualTone: DialogVisualTone;
  onConfirm: () => void; onCancel?: () => void;
};
type InputDialogRequest = {
  kind: 'input'; id: number; title: string; label: string; initialValue: string;
  placeholder?: string; helperText?: string; inputMode?: InputMode; maxLength?: number;
  validate?: (value: string) => string | undefined;
  confirmText: string; cancelText: string;
  onConfirm: (value: string) => void; onCancel?: () => void;
};
type ChoiceInputDialogRequest = {
  kind: 'choice-input'; id: number; title: string; label: string; initialValue: string;
  choiceLabel: string; choices: string[]; initialChoice: string;
  choiceLayout?: 'dropdown' | 'grid';
  placeholder?: string; helperText?: string; maxLength?: number;
  validate?: (value: string) => string | undefined;
  confirmText: string; cancelText: string;
  onConfirm: (value: string, choice: string) => void; onCancel?: () => void;
};
type NumberDialogRequest = {
  kind: 'number'; id: number; title: string; label: string; initialValue: number;
  min: number; max: number; step: number; decimals: number;
  formatValue?: (value: number) => string;
  confirmText: string; cancelText: string;
  onConfirm: (value: number) => void; onCancel?: () => void;
};
type BindingDialogRequest = {
  kind: 'binding'; id: number; title: string; actionLabel: string; slotLabel: string;
  initialValue: string; confirmText: string; cancelText: string; clearText: string;
  validate?: (value: string) => string | undefined;
  onConfirm: (value: string) => void; onCancel?: () => void;
};
type TimedDialogRequest = {
  kind: 'timed'; id: number; title: string; message?: string; summaryLabel?: string;
  summaryValue?: string; seconds: number; confirmText: string; cancelText: string;
  onConfirm: () => void; onCancel: () => void;
};
type DialogRequest = ConfirmDialogRequest | InputDialogRequest | ChoiceInputDialogRequest | NumberDialogRequest | BindingDialogRequest | TimedDialogRequest;

type ToastItem = { id: number; text: string; tone: NotificationTone; exiting: boolean; actionLabel?: string; onAction?: () => void };
type ConfirmOptions = Omit<ConfirmDialogRequest,'kind'|'id'|'cancelText'|'tone'|'visualTone'> & { cancelText?: string; tone?: DialogTone; visualTone?: DialogVisualTone };
type InputOptions = Omit<InputDialogRequest,'kind'|'id'|'cancelText'> & { cancelText?: string };
type ChoiceInputOptions = Omit<ChoiceInputDialogRequest,'kind'|'id'|'cancelText'> & { cancelText?: string };
type NumberOptions = Omit<NumberDialogRequest,'kind'|'id'|'cancelText'|'decimals'> & { cancelText?: string; decimals?: number };
type BindingOptions = Omit<BindingDialogRequest,'kind'|'id'|'cancelText'|'clearText'> & { cancelText?: string; clearText?: string };
type TimedOptions = Omit<TimedDialogRequest,'kind'|'id'|'cancelText'> & { cancelText?: string };

type DialogContextValue = {
  dialog: DialogRequest | null; toasts: ToastItem[];
  confirm: (options: ConfirmOptions) => void;
  input: (options: InputOptions) => void;
  choiceInput: (options: ChoiceInputOptions) => void;
  number: (options: NumberOptions) => void;
  binding: (options: BindingOptions) => void;
  timed: (options: TimedOptions) => void;
  notify: (text: string, tone?: NotificationTone, duration?: number, actionLabel?: string, onAction?: () => void) => void;
  toast: (text: string, tone?: ToastTone, duration?: number, actionLabel?: string, onAction?: () => void) => void;
  dismissDialog: (invokeCancel?: boolean) => void;
};

const DialogContext=createContext<DialogContextValue|null>(null);
let nextId=1;

export function DialogProvider({children}:{children:ReactNode}){
  const [dialog,setDialog]=useState<DialogRequest|null>(null);
  const [toasts,setToasts]=useState<ToastItem[]>([]);
  const toastTimers=useRef(new Map<number,number[]>());

  useEffect(()=>()=>{toastTimers.current.forEach(timers=>timers.forEach(timer=>window.clearTimeout(timer)));toastTimers.current.clear()},[]);

  const dismissDialog=useCallback((invokeCancel=false)=>{setDialog(current=>{if(invokeCancel)current?.onCancel?.();return null})},[]);
  const confirm=useCallback((options:ConfirmOptions)=>{
    const tone=options.tone??'primary';
    setDialog({...options,id:nextId++,kind:'confirm',cancelText:options.cancelText??'取消',tone,visualTone:options.visualTone??(tone==='danger'?'danger':'neutral')});
  },[]);
  const input=useCallback((options:InputOptions)=>setDialog({...options,id:nextId++,kind:'input',cancelText:options.cancelText??'取消'}),[]);
  const choiceInput=useCallback((options:ChoiceInputOptions)=>setDialog({...options,id:nextId++,kind:'choice-input',cancelText:options.cancelText??'取消'}),[]);
  const number=useCallback((options:NumberOptions)=>setDialog({...options,id:nextId++,kind:'number',cancelText:options.cancelText??'取消',decimals:options.decimals??0}),[]);
  const binding=useCallback((options:BindingOptions)=>setDialog({...options,id:nextId++,kind:'binding',cancelText:options.cancelText??'取消',clearText:options.clearText??'清除绑定'}),[]);
  const timed=useCallback((options:TimedOptions)=>setDialog({...options,id:nextId++,kind:'timed',cancelText:options.cancelText??'恢复原设置'}),[]);

  const pushNotification=useCallback((text:string,tone:NotificationTone,duration:number,actionLabel?:string,onAction?:()=>void)=>{
    const id=nextId++;
    setToasts(current=>[...current.filter(item=>!item.exiting).slice(-2),{id,text,tone,exiting:false,actionLabel,onAction}]);
    const beginExit=window.setTimeout(()=>{
      setToasts(current=>current.map(item=>item.id===id?{...item,exiting:true}:item));
      const remove=window.setTimeout(()=>{setToasts(current=>current.filter(item=>item.id!==id));toastTimers.current.delete(id)},220);
      const timers=toastTimers.current.get(id)??[];toastTimers.current.set(id,[...timers,remove]);
    },duration);
    toastTimers.current.set(id,[beginExit]);
  },[]);
  const notify=useCallback((text:string,tone:NotificationTone='neutral',duration=2200,actionLabel?:string,onAction?:()=>void)=>pushNotification(text,tone,duration,actionLabel,onAction),[pushNotification]);
  const toast=useCallback((text:string,tone:ToastTone='neutral',duration=2200,actionLabel?:string,onAction?:()=>void)=>pushNotification(text,tone==='danger'?'error':tone,duration,actionLabel,onAction),[pushNotification]);

  const value=useMemo(()=>({dialog,toasts,confirm,input,choiceInput,number,binding,timed,notify,toast,dismissDialog}),[dialog,toasts,confirm,input,choiceInput,number,binding,timed,notify,toast,dismissDialog]);
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function useDialogSystem(){const value=useContext(DialogContext);if(!value)throw new Error('useDialogSystem must be used inside DialogProvider.');return value}

export function DialogHost(){
  const {dialog,dismissDialog}=useDialogSystem();
  const presence=usePresence(dialog!==null);
  const retained=useRef<DialogRequest|null>(dialog);
  if(dialog)retained.current=dialog;
  const request=dialog??retained.current;
  if(!presence.mounted||!request)return null;
  const interactive=dialog!==null&&presence.phase!=='exiting';
  const onDismiss=()=>dismissDialog(false);
  const shared={onDismiss,interactive,motionPhase:presence.phase};
  if(request.kind==='input')return <InputDialogView key={request.id} request={request} {...shared}/>;
  if(request.kind==='choice-input')return <ChoiceInputDialogView key={request.id} request={request} {...shared}/>;
  if(request.kind==='number')return <NumberDialogView key={request.id} request={request} {...shared}/>;
  if(request.kind==='binding')return <BindingDialogView key={request.id} request={request} {...shared}/>;
  if(request.kind==='timed')return <TimedDialogView key={request.id} request={request} {...shared}/>;
  return <ConfirmDialogView key={request.id} request={request} {...shared}/>;
}

export function NotificationHost(){
  const {toasts}=useDialogSystem();
  return <div className="notification-host" aria-live="polite" aria-atomic="false">{toasts.map((toast,index)=>{
    const offset=(toasts.length-1-index)*46;
    const Icon=toast.tone==='success'?Check:toast.tone==='warning'?TriangleAlert:toast.tone==='error'?CircleX:Info;
    return <div key={toast.id} className={`ui-toast ui-notification is-${toast.tone} ${toast.exiting?'is-exiting':''}`} style={{transform:`translate(-50%, -${offset}px)`}} role={toast.tone==='warning'||toast.tone==='error'?'alert':'status'}><div className="ui-toast__surface"><Icon size={14}/><span>{toast.text}</span>{toast.actionLabel&&toast.onAction&&<button type="button" className="ui-toast__action" onClick={toast.onAction}>{toast.actionLabel}</button>}</div></div>;
  })}</div>;
}

function DialogFrame({title,message,visualTone='neutral',motionPhase='steady',children,actions}:{title:string;message?:string;visualTone?:DialogVisualTone;motionPhase?:MotionPhase;children?:ReactNode;actions:ReactNode}){
  const ToneIcon=visualTone==='warning'?TriangleAlert:visualTone==='danger'?CircleX:null;
  return <div className={`ui-modal-layer is-${motionPhase}`} role="presentation"><div className="ui-modal-backdrop"/><section className={`ui-dialog is-tone-${visualTone} motion-center-surface is-${motionPhase}`} role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title"><header className="ui-dialog__header"><div className="ui-dialog__heading">{ToneIcon&&<ToneIcon className="ui-dialog__tone-icon" size={16}/>}<h2 id="ui-dialog-title">{title}</h2></div>{message&&<p>{message}</p>}</header>{children&&<div className="ui-dialog__body">{children}</div>}<footer className="ui-dialog__actions">{actions}</footer></section></div>;
}

function ConfirmDialogView({request,onDismiss,interactive,motionPhase}:{request:ConfirmDialogRequest;onDismiss:()=>void;interactive:boolean;motionPhase:MotionPhase}){
  const cancelRef=useRef<HTMLButtonElement>(null),confirmRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!interactive)return;(request.tone==='danger'?cancelRef.current:confirmRef.current)?.focus();const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();request.onCancel?.();onDismiss()}else if(event.key==='Enter'){event.preventDefault();event.stopPropagation();request.onConfirm();onDismiss()}};window.addEventListener('keydown',handleKey,true);return()=>window.removeEventListener('keydown',handleKey,true)},[request,onDismiss,interactive]);
  const cancelAction=()=>{request.onCancel?.();onDismiss()};
  return <DialogFrame title={request.title} message={request.message} visualTone={request.visualTone} motionPhase={motionPhase} actions={<><button ref={cancelRef} type="button" className="ui-dialog-button is-secondary" onClick={cancelAction}>{request.cancelText}</button><button ref={confirmRef} type="button" className={`ui-dialog-button ${request.tone==='danger'?'is-danger':'is-primary'}`} onClick={()=>{request.onConfirm();onDismiss()}}>{request.tone==='danger'&&<Trash2 size={14}/>} {request.confirmText}</button></>}/>;
}

function InputDialogView({request,onDismiss,interactive,motionPhase}:{request:InputDialogRequest;onDismiss:()=>void;interactive:boolean;motionPhase:MotionPhase}){
  const [value,setValue]=useState(request.initialValue);
  const inputRef=useRef<HTMLInputElement>(null);
  const trimmed=value.trim();
  const error=trimmed.length===0?'请输入内容。':request.validate?.(trimmed)??'';
  const canConfirm=!error;
  useEffect(()=>{if(interactive){inputRef.current?.focus();inputRef.current?.select()}},[request.id,interactive]);
  useEffect(()=>{if(!interactive)return;const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();request.onCancel?.();onDismiss()}else if(event.key==='Enter'&&canConfirm){event.preventDefault();event.stopPropagation();request.onConfirm(trimmed);onDismiss()}};window.addEventListener('keydown',handleKey,true);return()=>window.removeEventListener('keydown',handleKey,true)},[request,onDismiss,trimmed,canConfirm,interactive]);
  return <DialogFrame title={request.title} motionPhase={motionPhase} actions={<><button type="button" className="ui-dialog-button is-secondary" onClick={()=>{request.onCancel?.();onDismiss()}}>{request.cancelText}</button><button type="button" className="ui-dialog-button is-primary" disabled={!canConfirm} onClick={()=>{if(canConfirm){request.onConfirm(trimmed);onDismiss()}}}>{request.confirmText}</button></>}><label className={`ui-dialog-input ${error?'is-invalid':''}`}><span>{request.label}</span><TextInput ref={inputRef} className="ui-dialog-input__field" value={value} inputMode={request.inputMode??'text'} maxLength={request.maxLength} placeholder={request.placeholder} aria-invalid={Boolean(error)} onChange={event=>setValue(event.target.value)}/><small className={error?'is-error':''}>{error||request.helperText||''}</small></label></DialogFrame>;
}

function ChoiceInputDialogView({request,onDismiss,interactive,motionPhase}:{request:ChoiceInputDialogRequest;onDismiss:()=>void;interactive:boolean;motionPhase:MotionPhase}){
  const [value,setValue]=useState(request.initialValue);
  const [choice,setChoice]=useState(request.choices.includes(request.initialChoice)?request.initialChoice:(request.choices[0]??''));
  const [choiceOpen,setChoiceOpen]=useState(false);
  const inputRef=useRef<HTMLInputElement>(null);
  const trimmed=value.trim();
  const error=trimmed.length===0?'请输入内容。':request.validate?.(trimmed)??'';
  const canConfirm=!error&&Boolean(choice);
  const gridChoice=request.choiceLayout==='grid';
  useEffect(()=>{if(interactive){inputRef.current?.focus();inputRef.current?.select()}},[request.id,interactive]);
  useEffect(()=>{if(!interactive)return;const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(choiceOpen){setChoiceOpen(false);return}request.onCancel?.();onDismiss()}else if(event.key==='Enter'&&canConfirm&&!choiceOpen){event.preventDefault();event.stopPropagation();request.onConfirm(trimmed,choice);onDismiss()}};window.addEventListener('keydown',handleKey,true);return()=>window.removeEventListener('keydown',handleKey,true)},[request,onDismiss,trimmed,choice,canConfirm,interactive,choiceOpen]);
  return <DialogFrame title={request.title} motionPhase={motionPhase} actions={<><button type="button" className="ui-dialog-button is-secondary" onClick={()=>{request.onCancel?.();onDismiss()}}>{request.cancelText}</button><button type="button" className="ui-dialog-button is-primary" disabled={!canConfirm} onClick={()=>{if(canConfirm){request.onConfirm(trimmed,choice);onDismiss()}}}>{request.confirmText}</button></>}>
    <label className={`ui-dialog-input ${error?'is-invalid':''}`}><span>{request.label}</span><TextInput ref={inputRef} className="ui-dialog-input__field" value={value} maxLength={request.maxLength} placeholder={request.placeholder} aria-invalid={Boolean(error)} onChange={event=>setValue(event.target.value)}/><small className={error?'is-error':''}>{error||request.helperText||''}</small></label>
    <div className={`ui-dialog-choice-group ${gridChoice?'is-grid-choice':''}`}>
      <span>{request.choiceLabel}</span>
      {gridChoice?(
        <div className="ui-dialog-choice-grid" role="radiogroup" aria-label={request.choiceLabel}>
          {request.choices.map(item=><button key={item} type="button" role="radio" aria-checked={choice===item} className={choice===item?'is-active':''} onClick={()=>setChoice(item)}>{item}</button>)}
        </div>
      ):(
        <div className={`ui-dialog-choice-select ${choiceOpen?'is-open':''}`}>
          <button type="button" className="ui-dialog-choice-trigger" aria-label={request.choiceLabel} aria-haspopup="listbox" aria-expanded={choiceOpen} onClick={()=>setChoiceOpen(open=>!open)}>
            <span>{choice}</span><UiIcon icon="chevron-down" size={14} className="ui-dialog-choice-chevron" />
          </button>
          {choiceOpen&&<div className="ui-dialog-choice-menu" role="listbox" aria-label={request.choiceLabel}>{request.choices.map(item=><button key={item} type="button" role="option" aria-selected={choice===item} className={choice===item?'is-selected':''} onClick={()=>{setChoice(item);setChoiceOpen(false)}}><span>{item}</span>{choice===item&&<UiIcon icon="check" size={12} className="ui-dialog-choice-check" />}</button>)}</div>}
        </div>
      )}
    </div>
  </DialogFrame>;
}

function NumberDialogView({request,onDismiss,interactive,motionPhase}:{request:NumberDialogRequest;onDismiss:()=>void;interactive:boolean;motionPhase:MotionPhase}){
  const [draft,setDraft]=useState(String(request.initialValue));
  const inputRef=useRef<HTMLInputElement>(null);
  const numeric=Number(draft.trim());
  const finite=draft.trim().length>0&&Number.isFinite(numeric);
  const inRange=finite&&numeric>=request.min&&numeric<=request.max;
  const units=inRange?(numeric-request.min)/request.step:0;
  const aligned=inRange&&Math.abs(units-Math.round(units))<0.000001;
  const format=request.formatValue??((value:number)=>String(value));
  const error=!finite?'请输入有效数字。':!inRange?`请输入 ${format(request.min)} – ${format(request.max)} 之间的数值。`:!aligned?`数值需符合步进 ${request.step}。`:'';
  const canConfirm=!error;
  const helper=`范围 ${format(request.min)} – ${format(request.max)} · 步进 ${request.step}`;
  const commit=()=>{if(!canConfirm)return;request.onConfirm(Number(numeric.toFixed(request.decimals)));onDismiss()};
  useEffect(()=>{if(interactive){inputRef.current?.focus();inputRef.current?.select()}},[request.id,interactive]);
  useEffect(()=>{if(!interactive)return;const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();request.onCancel?.();onDismiss()}else if(event.key==='Enter'&&canConfirm){event.preventDefault();event.stopPropagation();commit()}};window.addEventListener('keydown',handleKey,true);return()=>window.removeEventListener('keydown',handleKey,true)},[request,onDismiss,numeric,canConfirm,interactive]);
  return <DialogFrame title={request.title} motionPhase={motionPhase} actions={<><button type="button" className="ui-dialog-button is-secondary" onClick={()=>{request.onCancel?.();onDismiss()}}>{request.cancelText}</button><button type="button" className="ui-dialog-button is-primary" disabled={!canConfirm} onClick={commit}>{request.confirmText}</button></>}><label className={`ui-dialog-input ui-dialog-number-input ${error?'is-invalid':''}`}><span>{request.label}</span><TextInput ref={inputRef} className="ui-dialog-input__field" value={draft} inputMode="decimal" aria-invalid={Boolean(error)} onChange={event=>setDraft(event.target.value)}/><small className={error?'is-error':''}>{error||helper}</small></label></DialogFrame>;
}

function formatCapturedBinding(event:KeyboardEvent){
  if(['Control','Shift','Alt','Meta'].includes(event.key))return '';
  const aliases:Record<string,string>={' ':'Space',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'};
  const base=aliases[event.key]??(event.key.length===1?event.key.toUpperCase():event.key);
  const parts:string[]=[];if(event.ctrlKey)parts.push('Ctrl');if(event.shiftKey)parts.push('Shift');if(event.altKey)parts.push('Alt');if(event.metaKey)parts.push('Meta');parts.push(base);return parts.join(' + ');
}

function BindingDialogView({request,onDismiss,interactive,motionPhase}:{request:BindingDialogRequest;onDismiss:()=>void;interactive:boolean;motionPhase:MotionPhase}){
  const [draft,setDraft]=useState(request.initialValue),[listening,setListening]=useState(true);
  const captureRef=useRef<HTMLButtonElement>(null);
  const error=request.validate?.(draft)??'';
  const canConfirm=!listening&&!error;
  useEffect(()=>{if(interactive)captureRef.current?.focus()},[request.id,interactive]);
  useEffect(()=>{if(!interactive)return;const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();request.onCancel?.();onDismiss();return}if(!listening){if(event.key==='Enter'&&canConfirm){event.preventDefault();event.stopPropagation();request.onConfirm(draft);onDismiss()}return}event.preventDefault();event.stopPropagation();if(event.key==='Backspace'||event.key==='Delete'){setDraft('');setListening(false);return}const next=formatCapturedBinding(event);if(!next)return;setDraft(next);setListening(false)};window.addEventListener('keydown',handleKey,true);return()=>window.removeEventListener('keydown',handleKey,true)},[request,onDismiss,draft,listening,canConfirm,interactive]);
  return <DialogFrame title={request.title} message={`${request.actionLabel} · ${request.slotLabel}`} motionPhase={motionPhase} actions={<><button type="button" className="ui-dialog-button is-secondary ui-dialog-binding-clear" onClick={()=>{setDraft('');setListening(false)}}>{request.clearText}</button><button type="button" className="ui-dialog-button is-secondary" onClick={()=>{request.onCancel?.();onDismiss()}}>{request.cancelText}</button><button type="button" className="ui-dialog-button is-primary" disabled={!canConfirm} onClick={()=>{if(canConfirm){request.onConfirm(draft);onDismiss()}}}>{request.confirmText}</button></>}><div className="ui-binding-dialog-current"><span>当前绑定</span><b>{request.initialValue||'未设置'}</b></div><button ref={captureRef} type="button" className={`ui-binding-capture ${listening?'is-listening':''}`} aria-label="按键输入区域" onClick={()=>setListening(true)}><span>{listening?'正在等待输入':'新的绑定'}</span><strong>{listening?'请按下新的按键组合…':(draft||'未设置')}</strong><small>{listening?'按 Esc 取消，Backspace / Delete 清除':'点击这里重新输入'}</small></button>{error&&<div className="ui-dialog-validation-error" role="alert">{error}</div>}</DialogFrame>;
}

function TimedDialogView({request,onDismiss,interactive,motionPhase}:{request:TimedDialogRequest;onDismiss:()=>void;interactive:boolean;motionPhase:MotionPhase}){
  const [seconds,setSeconds]=useState(request.seconds);
  useEffect(()=>{const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();request.onCancel();onDismiss()}else if(event.key==='Enter'){event.preventDefault();event.stopPropagation();request.onConfirm();onDismiss()}};window.addEventListener('keydown',handleKey,true);const timer=window.setInterval(()=>setSeconds(current=>current-1),1000);return()=>{window.removeEventListener('keydown',handleKey,true);window.clearInterval(timer)}},[request,onDismiss,interactive]);
  useEffect(()=>{if(!interactive||seconds>0)return;request.onCancel();onDismiss()},[seconds,request,onDismiss,interactive]);
  return <DialogFrame title={request.title} message={request.message} visualTone="warning" motionPhase={motionPhase} actions={<><button type="button" className="ui-dialog-button is-secondary" onClick={()=>{request.onCancel();onDismiss()}}>{request.cancelText}</button><button type="button" className="ui-dialog-button is-primary" onClick={()=>{request.onConfirm();onDismiss()}}><Check size={14}/>{request.confirmText}</button></>}>{(request.summaryLabel||request.summaryValue)&&<div className="ui-dialog-change"><span>{request.summaryLabel}</span><b>{request.summaryValue}</b></div>}<div className="ui-dialog-countdown" aria-live="polite"><strong>{Math.max(0,seconds)}</strong><span>秒后自动恢复</span></div></DialogFrame>;
}
