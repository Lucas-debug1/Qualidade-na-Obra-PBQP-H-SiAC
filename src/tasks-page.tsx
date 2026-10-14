import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSupabaseTable } from './hooks/useSupabaseTable';
import { canEdit, useAuth } from './auth';
import { Actions, Field, Metric, Modal, uid } from './components/shared';

type Task = { id: string; title: string; responsible: string; deadline: string; priority: string; status: string; user_id?: string };

const columns = ['A fazer', 'Em andamento', 'Concluída'] as const;

const blankTask = (): Omit<Task, 'id'> => ({
  title: '',
  responsible: '',
  deadline: new Date().toISOString().slice(0, 10),
  priority: 'Média',
  status: 'A fazer',
});

export function TasksPage() {
  const { records, loading, create, update, remove } = useSupabaseTable<Task>('tasks');
  const { session, role } = useAuth();
  const [editing, setEditing] = useState<(Task & { _isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  const open = () => setEditing({ id: uid(), _isNew: true, ...blankTask() });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { id, _isNew, ...payload } = editing;
    if (_isNew) await create(payload);
    else await update(id, payload);
    setSaving(false);
    setEditing(null);
  };

  const move = (task: Task, direction: 1 | -1) => {
    const idx = columns.indexOf(task.status as (typeof columns)[number]);
    const next = columns[idx + direction];
    if (next) update(task.id, { status: next });
  };

  return (
    <div className="page operational">
      <div className="title-row">
        <div>
          <small className="eyebrow">GESTÃO DE TAREFAS</small>
          <h1>Gestão de tarefas</h1>
          <p>Organize pendências, correções e ações do SGQ por status.</p>
        </div>
        <button className="primary" onClick={open}>
          <Plus size={17} />
          Nova tarefa
        </button>
      </div>
      <div className="metrics compact">
        <Metric a="Total" b={String(records.length)} />
        <Metric a="A fazer" b={String(records.filter((r) => r.status === 'A fazer').length)} />
        <Metric a="Em andamento" b={String(records.filter((r) => r.status === 'Em andamento').length)} />
        <Metric a="Concluídas" b={String(records.filter((r) => r.status === 'Concluída').length)} />
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="board">
          {columns.map((col, ci) => (
            <div className="column" key={col}>
              <h3>
                {col} <b>{records.filter((t) => t.status === col).length}</b>
              </h3>
              {records
                .filter((t) => t.status === col)
                .map((t) => (
                  <div className="task" key={t.id}>
                    <em className={ci === 0 ? 'warn' : ci === 1 ? 'active' : 'done'}>{t.priority.toUpperCase()}</em>
                    <strong>{t.title}</strong>
                    <small>
                      {t.responsible || 'Sem responsável'} • {t.deadline ? new Date(`${t.deadline}T12:00:00`).toLocaleDateString('pt-BR') : 'sem prazo'}
                    </small>
                    <div className="row-actions" style={{ marginTop: 8 }}>
                      {canEdit(role, session.user.id, t.user_id) ? (
                        <>
                          {ci > 0 && <button onClick={() => move(t, -1)}>← Voltar</button>}
                          {ci < columns.length - 1 && <button onClick={() => move(t, 1)}>Avançar →</button>}
                          <button onClick={() => setEditing(t)}>Editar</button>
                          <button aria-label="Excluir" onClick={() => confirm('Excluir esta tarefa?') && remove(t.id)}>
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <small className="readonly-tag">Somente leitura</small>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <Modal title={editing._isNew ? 'Nova tarefa' : 'Editar tarefa'} close={() => setEditing(null)}>
          <form onSubmit={save} className="op-form">
            <Field label="Título da tarefa">
              <input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>
            <div className="form-grid">
              <Field label="Responsável">
                <input value={editing.responsible} onChange={(e) => setEditing({ ...editing, responsible: e.target.value })} />
              </Field>
              <Field label="Prazo">
                <input type="date" value={editing.deadline} onChange={(e) => setEditing({ ...editing, deadline: e.target.value })} />
              </Field>
              <Field label="Prioridade">
                <select value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value })}>
                  <option>Baixa</option><option>Média</option><option>Alta</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {columns.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Actions cancel={() => setEditing(null)} disabled={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}