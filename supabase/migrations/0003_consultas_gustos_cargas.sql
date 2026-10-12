-- Consultas que Cecy registra (para contar consultas y renovaciones), platillos que le gustan o no a cada paciente,
-- y los pesos que carga en su rutina. No guarda nada clínico.
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

create table if not exists public.gustos (
  patient_id uuid not null references public.patients (id) on delete cascade,
  platillo text not null,
  valor smallint not null check (valor in (1, -1)), -- 1 = le gusta, -1 = no le gusta
  created_at timestamptz not null default now(),
  primary key (patient_id, platillo)
);
alter table public.gustos enable row level security;
drop policy if exists nutri_all on public.gustos;
create policy nutri_all on public.gustos for all using (public.is_nutri()) with check (public.is_nutri());
-- La paciente ve y cambia solo lo suyo
drop policy if exists own_rows on public.gustos;
create policy own_rows on public.gustos for all
  using (exists (select 1 from public.patients p where p.id = gustos.patient_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.patients p where p.id = gustos.patient_id and p.user_id = auth.uid()));

-- Pesos que la paciente carga en cada ejercicio, para recordar con cuánto lo hizo la vez pasada
create table if not exists public.cargas (
  patient_id uuid not null references public.patients (id) on delete cascade,
  ejercicio text not null,
  fecha date not null,
  data jsonb not null default '{}'::jsonb, -- { u: "kg" | "lb", s: [{ p: peso, r: repeticiones }] }
  updated_at timestamptz not null default now(),
  primary key (patient_id, ejercicio, fecha)
);
alter table public.cargas enable row level security;
drop policy if exists nutri_all on public.cargas;
create policy nutri_all on public.cargas for all using (public.is_nutri()) with check (public.is_nutri());
drop policy if exists own_rows on public.cargas;
create policy own_rows on public.cargas for all
  using (exists (select 1 from public.patients p where p.id = cargas.patient_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.patients p where p.id = cargas.patient_id and p.user_id = auth.uid()));
