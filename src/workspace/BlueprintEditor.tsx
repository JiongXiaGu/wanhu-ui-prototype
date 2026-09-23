import { useEffect, useMemo, useState } from 'react';
import type { BlueprintDockCategory } from '../app/ui-state';
import { Camera, Check } from '../ui/icons/runtime-icons.generated';
import { TextInput } from '../ui/Controls';
import {
  BLUEPRINT_CATEGORY_LABELS,
  BLUEPRINT_SIZE_LABELS,
  type BlueprintSize,
} from './blueprint-workspace-model';

export interface BlueprintEditorDraft {
  originalId?: string;
  name: string;
  category: Exclude<BlueprintDockCategory, 'all'>;
  size: Exclude<BlueprintSize, 'all'>;
  footprint: string;
  objectCount: number;
  estimatedCost: string;
  description: string;
  previewAsset: string;
  previewPosition: string;
  previewSize: string;
}

interface BlueprintEditorProps {
  draft: BlueprintEditorDraft;
  onCancel: () => void;
  onRephotograph: (draft: BlueprintEditorDraft) => void;
  onSave: (draft: BlueprintEditorDraft) => void;
}

const CATEGORY_ITEMS: ReadonlyArray<Exclude<BlueprintDockCategory, 'all'>> = [
  'residential',
  'commercial',
  'workshop',
  'administration',
  'science',
  'faith',
  'military',
  'palace',
];

export function BlueprintEditor({ draft, onCancel, onRephotograph, onSave }: BlueprintEditorProps) {
  const [name, setName] = useState(draft.name);
  const [category, setCategory] = useState(draft.category);
  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0;

  const workingDraft = useMemo<BlueprintEditorDraft>(() => ({
    ...draft,
    name: trimmedName || draft.name,
    category,
  }), [draft, trimmedName, category]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [onCancel]);

  return (
    <div className="ui-modal-layer blueprint-editor-layer" role="presentation">
      <div className="ui-modal-backdrop" />
      <section
        className="blueprint-editor ui-modal-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="blueprint-editor-title"
        data-blueprint-editor={draft.originalId ? 'edit' : 'create'}
      >
        <header className="blueprint-editor__header">
          <div>
            <h2 id="blueprint-editor-title">{draft.originalId ? '编辑蓝图' : '保存新蓝图'}</h2>
            <p>{draft.originalId ? '修改名称、分类或重新拍摄预览图。' : '确认预览图和蓝图信息后保存到“我的蓝图”。'}</p>
          </div>
        </header>

        <div className="blueprint-editor__body">
          <div className="blueprint-editor__preview-column">
            <div
              className="blueprint-editor__preview"
              style={{
                backgroundImage: `url(${draft.previewAsset})`,
                backgroundPosition: draft.previewPosition,
                backgroundSize: draft.previewSize,
              }}
              role="img"
              aria-label="蓝图预览图"
            >
              <span>4:3</span>
              <button
                type="button"
                className="blueprint-editor__rephoto"
                onClick={() => onRephotograph(workingDraft)}
              >
                <Camera size={15} aria-hidden="true" />
                <span>重新拍摄</span>
              </button>
            </div>
          </div>

          <div className="blueprint-editor__form">
            <label className="blueprint-editor__field">
              <span>蓝图名称</span>
              <TextInput
                value={name}
                maxLength={40}
                autoFocus
                aria-label="蓝图名称"
                onChange={(event) => setName(event.currentTarget.value)}
              />
              <small>{trimmedName ? '保存后会显示在蓝图 Card 左下。' : '请输入蓝图名称。'}</small>
            </label>

            <fieldset className="blueprint-editor__category">
              <legend>蓝图分类</legend>
              <div>
                {CATEGORY_ITEMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={category === item ? 'is-active' : ''}
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {BLUEPRINT_CATEGORY_LABELS[item].replace('蓝图', '')}
                  </button>
                ))}
              </div>
            </fieldset>

            <dl className="blueprint-editor__facts">
              <div><dt>规模</dt><dd>{BLUEPRINT_SIZE_LABELS[draft.size]}</dd></div>
              <div><dt>占地</dt><dd>{draft.footprint}</dd></div>
              <div><dt>构件</dt><dd>{draft.objectCount} 个</dd></div>
              <div><dt>预计造价</dt><dd>{draft.estimatedCost}</dd></div>
            </dl>

            <p className="blueprint-editor__note">规模、占地和构件统计来自蓝图内容，只读；摄影只负责预览图。</p>
          </div>
        </div>

        <footer className="blueprint-editor__actions">
          <button type="button" className="is-secondary" onClick={onCancel}>取消</button>
          <button
            type="button"
            className="is-primary"
            disabled={!canSave}
            onClick={() => canSave && onSave({ ...workingDraft, name: trimmedName })}
          >
            <Check size={15} aria-hidden="true" />
            <span>{draft.originalId ? '保存修改' : '保存蓝图'}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
