-- Cuándo abrió la app cada paciente por última vez (Cecy lo ve en el consultorio).
alter table public.patients add column if not exists ultima_visita timestamptz;

create or replace function public.marcar_visita() returns void
language sql security definer set search_path = public as $$
  update public.patients set ultima_visita = now() where user_id = auth.uid();
$$;
grant execute on function public.marcar_visita() to authenticated;
