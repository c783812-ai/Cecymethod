-- cecymethod.com · esquema inicial
-- Aquí solo vive lo que la paciente ve: su nombre, correo, plan y rutina.
-- La historia clínica, análisis y mediciones NO se guardan aquí (Cecy los lleva en su tablet).
-- Aun así, el proyecto de Supabase se crea en una región de la UE.

-- Quién es nutrióloga (acceso total). Las pacientes solo ven lo suyo.
create table public.app_admins (
  email text primary key
);
insert into public.app_admins (email) values ('cecilia.nutdxb@gmail.com');

create or replace function public.is_nutri() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.app_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Ficha de la paciente: solo datos de contacto y lo que ve en su página
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  email text not null unique,
  nombre text not null,
  ciudad text,
  proxima_cita text,
  metas jsonb not null default '[]'::jsonb,
  plan_visible boolean not null default false,
  routine_key text,
  routine_visible boolean not null default false,
  invitada_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  data jsonb not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plans_patient_idx on public.plans (patient_id, activo);

create table public.routine_templates (
  key text primary key,
  titulo text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.exercise_videos (
  nombre text primary key,
  storage_path text not null,
  updated_at timestamptz not null default now()
);

-- Une a la paciente con su cuenta cuando entra por primera vez
create or replace function public.claim_patient() returns void
language sql security definer set search_path = public as $$
  update public.patients
     set user_id = auth.uid()
   where user_id is null
     and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));
$$;
grant execute on function public.claim_patient() to authenticated;

-- RLS
alter table public.app_admins enable row level security;
alter table public.patients enable row level security;
alter table public.plans enable row level security;
alter table public.routine_templates enable row level security;
alter table public.exercise_videos enable row level security;

create policy nutri_all on public.patients for all using (public.is_nutri()) with check (public.is_nutri());
create policy own_row on public.patients for select using (user_id = auth.uid());

create policy nutri_all on public.plans for all using (public.is_nutri()) with check (public.is_nutri());
create policy own_visible on public.plans for select using (
  activo and exists (select 1 from public.patients p where p.id = plans.patient_id and p.user_id = auth.uid() and p.plan_visible)
);

create policy nutri_all on public.routine_templates for all using (public.is_nutri()) with check (public.is_nutri());
create policy read_assigned on public.routine_templates for select using (
  exists (select 1 from public.patients p where p.user_id = auth.uid() and p.routine_visible and p.routine_key = routine_templates.key)
);

create policy nutri_all on public.exercise_videos for all using (public.is_nutri()) with check (public.is_nutri());
create policy read_auth on public.exercise_videos for select to authenticated using (true);

-- Videos de ejercicios (privados; se ven con enlace firmado)
insert into storage.buckets (id, name, public) values ('videos', 'videos', false)
on conflict (id) do nothing;
create policy videos_nutri_write on storage.objects for all
  using (bucket_id = 'videos' and public.is_nutri())
  with check (bucket_id = 'videos' and public.is_nutri());
create policy videos_read on storage.objects for select to authenticated
  using (bucket_id = 'videos');
