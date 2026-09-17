import { ChevronRight } from 'lucide-react';
import { MANAGEMENT_PANELS, type ManagementSection } from './management-registry';

export function OverviewManagementView({ view }: { view: ManagementSection }) {
  const panel = MANAGEMENT_PANELS[view];

  return (
    <div className="management-overview-grid">
      <section className="management-section management-section--primary">
        <div className="management-section__title"><b>重点事项</b><i /></div>
        <div className="management-task-list">
          {panel.rows.map((row) => (
            <button key={row.label} type="button" className="management-task-row">
              <span>
                <b>{row.label}</b>
                <small>{row.description}</small>
              </span>
              <em>{row.value}</em>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>

      <section className="management-section management-section--aside">
        <div className="management-section__title"><b>本期观察</b><i /></div>
        <div className="management-note-list">
          {panel.notes.map((note) => (
            <div key={note.label} className="management-note-row">
              <small>{note.label}</small>
              <b>{note.value}</b>
            </div>
          ))}
        </div>
        <div className="management-space__quiet-graph" aria-hidden="true">
          <span style={{ height: '32%' }} />
          <span style={{ height: '45%' }} />
          <span style={{ height: '41%' }} />
          <span style={{ height: '58%' }} />
          <span style={{ height: '64%' }} />
          <span style={{ height: '72%' }} />
          <span style={{ height: '68%' }} />
          <span style={{ height: '82%' }} />
        </div>
      </section>
    </div>
  );
}
