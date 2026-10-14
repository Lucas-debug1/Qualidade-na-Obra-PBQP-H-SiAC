-- Qualidade na Obra — Patch v3: transforma "Materiais" em FVM completa
-- (checklist de 8 itens do plano de inspeção + responsável pelo recebimento).
-- Rode em: Supabase Dashboard > SQL Editor > New query > Run
-- Seguro rodar mesmo com dados já existentes — só adiciona colunas novas.

alter table materials add column if not exists answers jsonb not null default '[]';
alter table materials add column if not exists responsible text;

-- Registros antigos (criados antes deste patch) ficam com status "Em análise"
-- e sem checklist preenchida — basta abrir e preencher normalmente.
