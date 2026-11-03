-- Lo que la paciente acomoda en su menú (los "Cambiar" y el orden de las comidas), guardado en su cuenta.
-- Así no se pierde si borra el acceso de su pantalla de inicio, cambia de navegador o de celular.
-- No son datos de salud. Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).
create table if not exists public.preferencias (
  patient_id uuid not null references public.patients (id) on delete cascade,
  clave text not null,                      -- p. ej. "cambios-<plan>" u "orden-<plan>"
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (patient_id, clave)
);
alter table public.preferencias enable row level security;
drop policy if exists nutri_all on public.preferencias;
create policy nutri_all on public.preferencias for all using (public.is_nutri()) with check (public.is_nutri());
-- La paciente ve y cambia solo lo suyo
drop policy if exists own_rows on public.preferencias;
create policy own_rows on public.preferencias for all
  using (exists (select 1 from public.patients p where p.id = preferencias.patient_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.patients p where p.id = preferencias.patient_id and p.user_id = auth.uid()));
