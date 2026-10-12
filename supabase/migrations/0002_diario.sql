-- Diario de la paciente: comidas listas, agua, baño, ánimo, sueño, estrés, ciclo y medicamentos nuevos.
-- Son datos de salud: solo se guardan si la paciente da su consentimiento, y solo ella y Cecy los ven.
-- Se borran al borrar a la paciente, o cuando ella retira su consentimiento.
-- Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).

alter table public.patients add column if not exists diario_consentido_at timestamptz;

create table if not exists public.diario (
  patient_id uuid not null references public.patients (id) on delete cascade,
  fecha date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (patient_id, fecha)
);

alter table public.diario enable row level security;

drop policy if exists nutri_all on public.diario;
create policy nutri_all on public.diario for all using (public.is_nutri()) with check (public.is_nutri());

-- La paciente lee y escribe solo lo suyo, y solo si aceptó
drop policy if exists own_rows on public.diario;
create policy own_rows on public.diario for all
  using (exists (select 1 from public.patients p where p.id = diario.patient_id and p.user_id = auth.uid() and p.diario_consentido_at is not null))
  with check (exists (select 1 from public.patients p where p.id = diario.patient_id and p.user_id = auth.uid() and p.diario_consentido_at is not null));

-- La paciente no puede editar su ficha; estas dos funciones solo tocan su consentimiento
create or replace function public.consentir_diario() returns void
language sql security definer set search_path = public as $$
  update public.patients set diario_consentido_at = now()
   where user_id = auth.uid() and diario_consentido_at is null;
$$;

create or replace function public.retirar_diario() returns void
language sql security definer set search_path = public as $$
  delete from public.diario where patient_id in (select id from public.patients where user_id = auth.uid());
  update public.patients set diario_consentido_at = null where user_id = auth.uid();
$$;

grant execute on function public.consentir_diario() to authenticated;
grant execute on function public.retirar_diario() to authenticated;
