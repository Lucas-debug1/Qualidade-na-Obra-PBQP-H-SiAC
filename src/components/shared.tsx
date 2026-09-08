import { ClipboardCheck, X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Metric({ a, b, c = 'Indicador atualizado' }: { a: string; b: string; c?: string }) {
  return (
    <div className="metric">
      <span>{a}</span>
      <strong>{b}</strong>
      <small>{c}</small>
    </div>
  );
}

export function Status({ v }: { v: string }) {
  const cls = /Reprov|Crítica|Alto|Aberta|Atrasad|Quarentena/.test(v)
    ? 'bad'
    : /análise|Atenção|Médio|Atualizar|andamento|A fazer|Monitorar/.test(v)
      ? 'warn'
      : 'good';
  return <span className={`status ${cls}`}>{v}</span>;
}

export function Empty({ text, action }: { text: string; action: () => void }) {
  return (
    <div className="empty">
      <ClipboardCheck size={28} />
      <strong>{text}</strong>
      <button onClick={action}>Criar primeiro registro</button>
    </div>
  );
}

export function Modal({
  title,
  close,
  wide,
  children,
}: {
  title: string;
  close: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="modal">
      <div className={`op-modal ${wide ? 'wide' : ''}`}>
        <div className="modal-title">
          <div>
            <small>REGISTRO OPERACIONAL</small>
            <h2>{title}</h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

export function Actions({
  cancel,
  label = 'Salvar registro',
  disabled,
}: {
  cancel: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="modal-actions">
      <button type="button" onClick={cancel}>
        Cancelar
      </button>
      <button className="primary" disabled={disabled}>
        {disabled ? 'Salvando...' : label}
      </button>
    </div>
  );
}

export function formatDate(v?: string | null) {
  if (!v) return '—';
  return new Date(`${v}T12:00:00`).toLocaleDateString('pt-BR');
}

export const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
