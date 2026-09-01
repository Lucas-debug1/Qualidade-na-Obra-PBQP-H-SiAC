-- Qualidade na Obra — Esquema do banco de dados (Supabase / Postgres)
-- Rode este script inteiro em: Supabase Dashboard > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

-- Materiais controlados
create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  supplier text not null,
  lot text not null,
  invoice text,
  quantity text,
  received date not null default current_date,
  status text not null default 'Em análise',
  notes text,
  created_at timestamptz not null default now()
);

-- Fichas de Verificação de Serviço (FVS)
create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  service text not null,
  unit text not null,
  environment text not null,
  date date not null default current_date,
  project text,
  procedure text,
  team text,
  inspector text not null,
  answers jsonb not null default '[]',
  general text not null default 'Em andamento',
  notes text,
  created_at timestamptz not null default now()
);

-- Não conformidades
create table if not exists non_conformities (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text not null,
  location text,
  severity text not null default 'Média',
  status text not null default 'Aberta',
  date date not null default current_date,
  treatment text,
  created_at timestamptz not null default now()
);

-- Auditorias (itens de checklist de auditoria)
create table if not exists audit_items (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  category text,
  status text not null default 'Conforme',
  score text,
  responsible text,
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- Gestão de processos
create table if not exists processes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  responsible text,
  effectiveness text,
  indicators text,
  notes text,
  created_at timestamptz not null default now()
);

-- Riscos e oportunidades
create table if not exists risks (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null default 'Risco',
  level text not null default 'Médio',
  treatment text,
  status text not null default 'Monitorar',
  created_at timestamptz not null default now()
);

-- Gestão de tarefas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  responsible text,
  deadline date,
  priority text not null default 'Média',
  status text not null default 'A fazer',
  created_at timestamptz not null default now()
);

-- Equipe e competências
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  training_status text not null default 'Regular',
  hours text,
  created_at timestamptz not null default now()
);

-- Análise de cenários (SWOT)
create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'Força',
  description text not null,
  action text,
  created_at timestamptz not null default now()
);

-- Habilita Row Level Security e permite leitura/escrita para todos que tenham
-- a chave pública (anon/publishable) do projeto — não há login neste app ainda.
alter table materials enable row level security;
alter table inspections enable row level security;
alter table non_conformities enable row level security;
alter table audit_items enable row level security;
alter table processes enable row level security;
alter table risks enable row level security;
alter table tasks enable row level security;
alter table team_members enable row level security;
alter table scenarios enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array['materials','inspections','non_conformities','audit_items','processes','risks','tasks','team_members','scenarios'])
  loop
    execute format('drop policy if exists "public_all" on %I', t);
    execute format('create policy "public_all" on %I for all using (true) with check (true)', t);
  end loop;
end $$;
