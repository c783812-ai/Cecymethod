-- Pagos de las pacientes: qué paquete compró cada una, cuánto cuesta y lo que te va pagando.
-- Solo Cecy lo ve. Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).

create table if not exists public.paquetes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  nombre text not null,
  moneda text not null default 'EUR' check (moneda in ('EUR', 'USD', 'MXN')),
  total numeric(10, 2) not null default 0,
  inicio date not null default current_date,
  nota text,
  created_at timestamptz not null default now()
);
alter table public.paquetes enable row level security;
drop policy if exists nutri_all on public.paquetes;
create policy nutri_all on public.paquetes for all using (public.is_nutri()) with check (public.is_nutri());

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  paquete_id uuid not null references public.paquetes (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  fecha date not null default current_date,
  monto numeric(10, 2) not null check (monto > 0),
  nota text,
  created_at timestamptz not null default now()
);
alter table public.pagos enable row level security;
drop policy if exists nutri_all on public.pagos;
create policy nutri_all on public.pagos for all using (public.is_nutri()) with check (public.is_nutri());
