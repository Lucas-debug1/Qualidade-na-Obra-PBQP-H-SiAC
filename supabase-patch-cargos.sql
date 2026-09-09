-- Qualidade na Obra — Patch v2: cargos (engenheiro/inspetor) + correção de fotos
-- Rode em: Supabase Dashboard > SQL Editor > New query > Run
-- Pode rodar mesmo já tendo rodado o supabase-schema.sql antes (é seguro, não apaga dados).

-- 1) Tabela de perfis: guarda o CARGO de cada usuário.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'inspetor' check (role in ('inspetor', 'mestre_obras', 'engenheiro')),
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
drop policy if exists "profile_select_own" on profiles;
create policy "profile_select_own" on profiles for select to authenticated using (id = auth.uid());

-- 2) Sempre que alguém se cadastra, cria automaticamente o perfil dele como 'inspetor'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'inspetor')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cria perfil para usuários que já tinham se cadastrado antes deste script.
insert into public.profiles (id, full_name, role)
select id, raw_user_meta_data ->> 'full_name', 'inspetor'
from auth.users
on conflict (id) do nothing;

-- 3) Regra: dono do registro OU engenheiro pode editar/excluir. Qualquer logado pode ver.
do $$
declare
  t text;
begin
  for t in select unnest(array['materials','inspections','non_conformities','audit_items','processes','risks','tasks','team_members','scenarios'])
  loop
    execute format('drop policy if exists "owner_update" on %I', t);
    execute format('drop policy if exists "owner_delete" on %I', t);
    execute format(
      'create policy "owner_or_engineer_update" on %I for update to authenticated ' ||
      'using (user_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = ''engenheiro'')) ' ||
      'with check (user_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = ''engenheiro''))', t);
    execute format(
      'create policy "owner_or_engineer_delete" on %I for delete to authenticated ' ||
      'using (user_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = ''engenheiro''))', t);
  end loop;
end $$;

-- 4) Corrige o bug das fotos: agora qualquer pessoa da equipe (logada) pode
--    VISUALIZAR as fotos, mesmo as enviadas por outro colega. O envio continua
--    organizado na pasta do próprio usuário; editar/excluir segue dono-ou-engenheiro.
drop policy if exists "photo_select_owner" on storage.objects;
drop policy if exists "photo_update_owner" on storage.objects;
drop policy if exists "photo_delete_owner" on storage.objects;

create policy "photo_select_team" on storage.objects for select to authenticated
using (bucket_id = 'inspection-photos');

create policy "photo_update_owner_or_engineer" on storage.objects for update to authenticated
using (bucket_id = 'inspection-photos' and (
  (storage.foldername(name))[1] = auth.uid()::text
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'engenheiro')
));

create policy "photo_delete_owner_or_engineer" on storage.objects for delete to authenticated
using (bucket_id = 'inspection-photos' and (
  (storage.foldername(name))[1] = auth.uid()::text
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'engenheiro')
));

-- 5) IMPORTANTE — depois de rodar este script, promova a SUA conta a engenheiro
--    (troque o e-mail abaixo pelo seu e-mail de login) e rode só esta linha:
--
-- update profiles set role = 'engenheiro' where id = (select id from auth.users where email = 'seu-email@exemplo.com');
