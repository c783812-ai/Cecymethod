-- Recordatorio diario a las 8 p.m. (hora de cada paciente) para llenar su registro.
-- Cada celular que activa el recordatorio se guarda aquí. Las llaves para mandar notificaciones las crea la página sola.
-- Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).
create table if not exists public.push_subs (
  endpoint text primary key,
  patient_id uuid not null references public.patients (id) on delete cascade,
  sub jsonb not null,
  tz text not null default 'America/Mexico_City',
  ultimo date,                                   -- último día que se le mandó (para no repetir)
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists nutri_all on public.push_subs;
create policy nutri_all on public.push_subs for all using (public.is_nutri()) with check (public.is_nutri());
drop policy if exists own_rows on public.push_subs;
create policy own_rows on public.push_subs for all
  using (exists (select 1 from public.patients p where p.id = push_subs.patient_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.patients p where p.id = push_subs.patient_id and p.user_id = auth.uid()));

-- Llaves de notificaciones: nadie las ve desde la página (sin políticas = solo el servidor).
create table if not exists public.push_config (
  id int primary key default 1 check (id = 1),
  publica text not null,
  privada text not null
);
alter table public.push_config enable row level security;
