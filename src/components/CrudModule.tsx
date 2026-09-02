import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSupabaseTable } from '../hooks/useSupabaseTable';
import { canEdit, useAuth } from '../auth';
import { Actions, Empty, Field, Metric, Modal, Status, formatDate, uid } from './shared';

export type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

export type ColumnDef = {
  key: string;
  header: string;
  isStatus?: boolean;
  isDate?: boolean;
  secondaryKey?: string; // renders as <small> under the main value
};

export type Record0 = { id: string; [key: string]: unknown };

export function buildBlank(fields: FieldDef[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'date') obj[f.key] = new Date().toISOString().slice(0, 10);
    else if (f.type === 'select') obj[f.key] = f.options?.[0] ?? '';
    else obj[f.key] = '';
  }
  return obj;
}

export function CrudModule({
  table,
  eyebrow,
  title,
  description,
  addLabel,
  fields,
  columns,
  metrics,
  emptyText,
  modalTitle,
}: {
  table: string;
  eyebrow: string;
  title: string;
  description: string;
  addLabel: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  metrics: (records: Record0[]) => { a: string; b: string; c?: string }[];
  emptyText: string;
  modalTitle: (editing: Record0, isNew: boolean) => string;
}) {
  const { records, loading, create, update, remove } = useSupabaseTable<Record0>(table);
  const { session, role } = useAuth();
  const [editing, setEditing] = useState<Record0 | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const open = () => {
    setEditing({ id: uid(), ...buildBlank(fields) });
    setIsNew(true);
  };
  const openEdit = (r: Record0) => {
    setEditing(r);
    setIsNew(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { id, ...payload } = editing;
    if (isNew) await create(payload);
    else await update(id, payload);
    setSaving(false);
    setEditing(null);
  };

  return (
    <div className="page operational">
      <div className="title-row">
        <div>
          <small className="eyebrow">{eyebrow}</small>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="primary" onClick={open}>
          <Plus size={17} />
          {addLabel}
        </button>
      </div>
      <div className="metrics compact">
        {metrics(records).map((m, i) => (
          <Metric key={i} a={m.a} b={m.b} c={m.c} />
        ))}
      </div>
      <div className="panel table op-table">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.header}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + 1}>Carregando...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={columns.length + 1}><Empty text={emptyText} action={open} /></td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.isStatus ? (
                        <Status v={String(r[c.key] ?? '')} />
                      ) : c.isDate ? (
                        formatDate(r[c.key] as string)
                      ) : (
                        <>
                          <strong>{String(r[c.key] ?? '')}</strong>
                          {c.secondaryKey && <small>{String(r[c.secondaryKey] ?? '')}</small>}
                        </>
                      )}
                    </td>
                  ))}
                  <td className="row-actions">
                    {canEdit(role, session.user.id, r.user_id) ? (
                      <>
                        <button onClick={() => openEdit(r)}>Editar</button>
                        <button aria-label="Excluir" onClick={() => confirm('Excluir este registro?') && remove(r.id)}>
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <small className="readonly-tag">Somente leitura</small>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal title={modalTitle(editing, isNew)} close={() => setEditing(null)}>
          <form onSubmit={save} className="op-form">
            <div className="form-grid">
              {fields.map((f) => (
                <Field label={f.label} key={f.key}>
                  {f.type === 'textarea' ? (
                    <textarea
                      placeholder={f.placeholder}
                      value={String(editing[f.key] ?? '')}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={String(editing[f.key] ?? '')}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    >
                      {f.options?.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : 'text'}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={String(editing[f.key] ?? '')}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    />
                  )}
                </Field>
              ))}
            </div>
            <Actions cancel={() => setEditing(null)} disabled={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}
