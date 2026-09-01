import { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, Boxes, CheckCircle2, ClipboardCheck,
  Menu, Plus, ShieldCheck, Target, Users, Workflow,
} from 'lucide-react';
import { MaterialsOperational, FvsOperational } from './operational';
import { NonConformitiesPage, AuditsPage, ProcessesPage, RisksPage, TeamPage, ScenariosPage } from './modules';
import { TasksPage } from './tasks-page';
import { useSupabaseTable } from './hooks/useSupabaseTable';
import { Metric } from './components/shared';
import type { Inspection, Material } from './operational';
import { useAuth } from './auth';

const nav = [
  ['dash', 'Dashboards', BarChart3],
  ['fvs', 'FVS de serviços', ClipboardCheck],
  ['nc', 'Não conformidades', AlertTriangle],
  ['mat', 'Materiais', Boxes],
  ['cen', 'Análise de cenários', Target],
  ['aud', 'Auditorias', ShieldCheck],
  ['proc', 'Gestão de processos', Workflow],
  ['risk', 'Riscos e oportunidades', Activity],
  ['tasks', 'Gestão de tarefas', CheckCircle2],
  ['team', 'Equipe e competências', Users],
] as const;

type Nc = { id: string; code: string; description: string; location: string; severity: string; status: string; date: string };
type TaskRow = { id: string; status: string; deadline: string };

export default function Home() {
  const { session, signOut } = useAuth();
  const [page, setPage] = useState('dash');
  const [open, setOpen] = useState(false);
  const label = nav.find((x) => x[0] === page)?.[1] ?? 'Visão geral';
  const go = (p: string) => {
    setPage(p);
    setOpen(false);
  };

  return (
    <div className="shell">
      <aside className={open ? 'open' : ''}>
        <div className="brand">
          <b>Q</b>
          <div>
            <strong>Qualidade na Obra</strong>
            <small>PBQP-H • SiAC</small>
          </div>
        </div>
        <div className="project">
          <em>OBRA ATIVA</em>
          <strong>Res. Maria do Carmo</strong>
          <small>Alto Bonito • PE</small>
        </div>
        <nav>
          {nav.map(([id, n, Icon]) => (
            <button className={page === id ? 'active' : ''} key={id} onClick={() => go(id)}>
              <Icon size={17} />
              {n}
            </button>
          ))}
        </nav>
        <footer>
          <strong>GLAUCIO ALMEIDA DE ANDRADE LTDA</strong>
          <small>CNPJ 24.763.309/0001-00</small>
        </footer>
      </aside>
      {open && <button className="scrim" onClick={() => setOpen(false)} />}
      <main>
        <header>
          <button className="menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <small>RESIDENCIAL RES. MARIA DO CARMO</small>
            <strong>{label}</strong>
          </div>
          <section>
            <span>● Dados em nuvem</span>
            <button className="user-menu" title={session.user.email} onClick={signOut}>
              <b>{(session.user.user_metadata?.full_name || session.user.email || 'US').slice(0, 2).toUpperCase()}</b>
              <small>Sair</small>
            </button>
          </section>
        </header>
        {page === 'dash' && <Dashboard go={go} />}
        {page === 'fvs' && <FvsOperational />}
        {page === 'mat' && <MaterialsOperational />}
        {page === 'nc' && <NonConformitiesPage />}
        {page === 'cen' && <ScenariosPage />}
        {page === 'aud' && <AuditsPage />}
        {page === 'proc' && <ProcessesPage />}
        {page === 'risk' && <RisksPage />}
        {page === 'tasks' && <TasksPage />}
        {page === 'team' && <TeamPage />}
      </main>
    </div>
  );
}

function Dashboard({ go }: { go: (p: string) => void }) {
  const { records: inspections, loading: loadingInsp } = useSupabaseTable<Inspection>('inspections');
  const { records: materials } = useSupabaseTable<Material>('materials');
  const { records: ncs } = useSupabaseTable<Nc>('non_conformities');
  const { records: tasks } = useSupabaseTable<TaskRow>('tasks');

  const total = inspections.length;
  const aprovadas = inspections.filter((i) => i.general === 'Aprovado').length;
  const emAndamento = inspections.filter((i) => i.general === 'Em andamento').length;
  const naoIniciadas = 0; // não há conceito de "planejadas mas não iniciadas" no banco ainda
  const conformidade = total ? Math.round((aprovadas / total) * 100) : 0;
  const ncAbertas = ncs.filter((n) => n.status !== 'Concluída').length;
  const ncCriticas = ncs.filter((n) => n.severity === 'Crítica' && n.status !== 'Concluída').length;
  const today = new Date().toISOString().slice(0, 10);
  const acoesNoPrazo = tasks.length
    ? Math.round((tasks.filter((t) => t.status === 'Concluída' || t.deadline >= today).length / tasks.length) * 100)
    : 0;

  const bars = useMemo(() => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'short' }) });
    }
    return months.map(({ key, label }) => {
      const inMonth = inspections.filter((i) => i.date?.slice(0, 7) === key);
      const ok = inMonth.filter((i) => i.general === 'Aprovado').length;
      const pct = inMonth.length ? Math.round((ok / inMonth.length) * 100) : 0;
      return [label, pct] as const;
    });
  }, [inspections]);

  const recentInspections = [...inspections]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 4);
  const priorityNcs = [...ncs]
    .filter((n) => n.status !== 'Concluída')
    .sort((a, b) => (a.severity === 'Crítica' ? -1 : 1))
    .slice(0, 3);

  return (
    <div className="page">
      <div className="hero">
        <div>
          <small>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}
          </small>
          <h1>Visão geral da obra</h1>
          <p>
            {ncCriticas > 0
              ? `Há ${ncCriticas} não conformidade(s) crítica(s) que precisam de atenção.`
              : 'Nenhuma não conformidade crítica em aberto no momento.'}
          </p>
        </div>
        <button className="primary" onClick={() => go('fvs')}>
          <Plus size={18} />
          Nova inspeção
        </button>
      </div>
      <div className="metrics">
        <Metric a="Conformidade geral" b={`${conformidade}%`} c={`${aprovadas} de ${total} FVS aprovadas`} />
        <Metric a="FVS registradas" b={String(total)} c={`${emAndamento} em andamento`} />
        <Metric a="NC em aberto" b={String(ncAbertas).padStart(2, '0')} c={`${ncCriticas} crítica(s)`} />
        <Metric a="Ações no prazo" b={`${acoesNoPrazo}%`} c={`${tasks.length} tarefa(s) no total`} />
      </div>
      <div className="grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Evolução da conformidade</h2>
            <span>Últimos 6 meses ›</span>
          </div>
          <div className="chart">
            {bars.map(([m, v]) => (
              <div className="barbox" key={m}>
                <div className="bar" style={{ height: `${Math.max(Number(v), 2) * 1.65}px` }}>
                  <b>{v}%</b>
                </div>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>Status das FVS</h2>
            <b>{total}</b>
          </div>
          <Mini a="Aprovadas" b={`${aprovadas} registros`} />
          <Mini a="Em andamento" b={`${emAndamento} registros`} kind="warn" />
          <Mini a="Reprovadas" b={`${inspections.filter((i) => i.general === 'Reprovado').length} registros`} kind="bad" />
        </div>
      </div>
      <div className="grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Inspeções recentes</h2>
            <button onClick={() => go('fvs')}>Ver todas ›</button>
          </div>
          {loadingInsp ? (
            <p>Carregando...</p>
          ) : recentInspections.length === 0 ? (
            <p>Nenhuma inspeção registrada ainda.</p>
          ) : (
            recentInspections.map((r) => (
              <Mini
                key={r.id}
                a={r.service}
                b={`${r.code} • ${r.unit}`}
                c={r.general}
                kind={r.general === 'Reprovado' ? 'bad' : r.general === 'Em andamento' ? 'warn' : 'good'}
              />
            ))
          )}
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>Ações prioritárias</h2>
            <button onClick={() => go('nc')}>{ncAbertas} abertas ›</button>
          </div>
          {priorityNcs.length === 0 ? (
            <p>Nenhuma NC pendente.</p>
          ) : (
            priorityNcs.map((r) => (
              <Mini key={r.id} a={r.description} b={r.location} c={r.severity} kind={r.severity === 'Crítica' ? 'bad' : 'warn'} />
            ))
          )}
        </div>
      </div>
      {naoIniciadas === 0 && null}
    </div>
  );
}

function Mini({ a, b, c, kind = 'good' }: { a: string; b: string; c?: string; kind?: string }) {
  return (
    <div className="mini">
      <i className={kind} />
      <div>
        <strong>{a}</strong>
        <small>{b}</small>
      </div>
      {c && <span>{c}</span>}
    </div>
  );
}
