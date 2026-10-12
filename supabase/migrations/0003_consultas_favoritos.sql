-- Consultas que Cecy registra (para contar consultas y renovaciones) y platillos favoritos de cada paciente.
-- No guarda nada clínico: solo la fecha y el tipo de consulta, y el nombre del platillo.
-- Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).

create table if not exists public.consultas (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  fecha date not null default current_date,
  tipo text not null default 'seguimiento' check (tipo in ('primera', 'seguimiento', 'renovacion')),
  created_at timestamptz not null default now()
);
alter table public.consultas enable row level security;
drop policy if exists nutri_all on public.consultas;
create policy nutri_all on public.consultas for all using (public.is_nutri()) with check (public.is_nutri());

create table if not exists public.favoritos (
  patient_id uuid not null references public.patients (id) on delete cascade,
  platillo text not null,
  created_at timestamptz not null default now(),
  primary key (patient_id, platillo)
);
alter table public.favoritos enable row level security;
drop policy if exists nutri_all on public.favoritos;
create policy nutri_all on public.favoritos for all using (public.is_nutri()) with check (public.is_nutri());
-- La paciente ve, agrega y quita solo sus favoritos
drop policy if exists own_rows on public.favoritos;
create policy own_rows on public.favoritos for all
  using (exists (select 1 from public.patients p where p.id = favoritos.patient_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.patients p where p.id = favoritos.patient_id and p.user_id = auth.uid()));
