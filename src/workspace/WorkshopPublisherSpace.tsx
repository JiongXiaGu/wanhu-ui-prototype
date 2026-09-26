import { useEffect, useState } from 'react';
import { ChevronLeft, Layers3, Plus, Store } from '../ui/icons/runtime-icons.generated';
import './workshop-publisher-space.css';

export type WorkshopPublisherSection = 'create' | 'drafts' | 'published';

interface WorkshopPublisherSpaceProps {
  onClose: () => void;
}

const SECTIONS = [
  { id: 'create' as const, label: '发布新内容', icon: Plus },
  { id: 'drafts' as const, label: '草稿', icon: Layers3 },
  { id: 'published' as const, label: '已发布', icon: Store },
];

const SECTION_COPY: Record<WorkshopPublisherSection, { title: string; detail: string }> = {
  create: {
    title: '发布新内容',
    detail: '把多个“我的蓝图”整理成一个工坊内容。下一阶段将接入蓝图多选、封面与内容信息编辑。',
  },
  drafts: {
    title: '草稿',
    detail: '尚未发布的内容包会保存在这里，可继续编辑后再发布。',
  },
  published: {
    title: '已发布',
    detail: '已经发布的工坊内容会在这里管理版本、可见性与后续更新。',
  },
};

export function WorkshopPublisherSpace({ onClose }: WorkshopPublisherSpaceProps) {
  const [section, setSection] = useState<WorkshopPublisherSection>('create');
  const copy = SECTION_COPY[section];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <section
      className="workshop-publisher-space wanhu-global-space"
      aria-label="创意工坊发布与管理"
      data-workshop-section={section}
    >
      <header className="global-space-header workshop-publisher-space__header">
        <div className="global-space-heading"><h1>创意工坊</h1></div>
      </header>

      <div className="workshop-publisher-space__body">
        <nav className="workshop-publisher-space__nav" aria-label="创意工坊管理">
          <div className="workshop-publisher-space__nav-heading">
            <Store size={18} aria-hidden="true" />
            <span>发布与管理</span>
          </div>
          <div className="workshop-publisher-space__nav-list">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={section === id ? 'is-active' : ''}
                aria-pressed={section === id}
                onClick={() => setSection(id)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
        </nav>

        <main className="workshop-publisher-space__content">
          <header className="workshop-publisher-space__content-header">
            <div>
              <small>创意工坊内容</small>
              <h2>{copy.title}</h2>
              <p>{copy.detail}</p>
            </div>
          </header>

          {section === 'create' ? (
            <section className="workshop-publisher-space__create-plan" aria-label="内容包创建流程">
              <article>
                <b>1</b>
                <span><strong>选择蓝图</strong><small>从“我的蓝图”中选择一个或多个内容。</small></span>
              </article>
              <article>
                <b>2</b>
                <span><strong>整理内容包</strong><small>设置标题、简介、标签、可见性与封面。</small></span>
              </article>
              <article>
                <b>3</b>
                <span><strong>发布版本</strong><small>明确发布后生成快照，本地修改不会自动改变已发布版本。</small></span>
              </article>
            </section>
          ) : (
            <section className="workshop-publisher-space__empty" aria-label={copy.title + '空状态'}>
              <Store size={24} aria-hidden="true" />
              <b>{section === 'drafts' ? '还没有工坊草稿' : '还没有已发布内容'}</b>
              <span>{section === 'drafts' ? '创建内容包后，可以先保存草稿再继续编辑。' : '发布完成的内容会显示在这里，并提供版本与更新管理。'}</span>
            </section>
          )}
        </main>
      </div>

      <footer className="global-space-footer workshop-publisher-space__footer" aria-label="页面操作">
        <div className="global-space-footer__left">
          <button type="button" className="global-space-secondary workshop-publisher-space__back" onClick={onClose}>
            <ChevronLeft size={14} aria-hidden="true" />
            返回蓝图
          </button>
        </div>
        <div className="global-space-footer__right" aria-hidden="true" />
      </footer>
    </section>
  );
}
