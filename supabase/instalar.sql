-- Instalación completa: copia todo y pégalo en Supabase > SQL Editor > Run
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

insert into public.routine_templates (key, titulo, data) values ('gluteos', 'Guía de glúteos', '{"titulo":"Guía de glúteos","subtitulo":"3 días por semana","opciones":["Gimnasio","En casa","Mancuernas y bandas"],"dias":[{"dia":"Día 1","calentamiento":[["Estiramiento dinámico de flexores de cadera e isquiotibiales","2 × 8 por lado"],["Enhebrar la aguja","2 × 8 por lado"],["Limpiaparabrisas lumbar","2 × 10 por lado"],["Apretar glúteos de pie","2 × 30 s"]],"ejercicios":[{"a":{"nombre":"Peso muerto con piernas rígidas","series":"3 × 8","descanso":"3–5 min","aproximacion":["1 × 8 con ~60% de tu peso de trabajo","1 × 5 con ~80%"]},"b":{"nombre":"Peso muerto con piernas rígidas","series":"3 × 8","descanso":"3–5 min","aproximacion":["1 × 8 con ~60% de tu peso de trabajo","1 × 5 con ~80%"]},"c":{"nombre":"Peso muerto con piernas rígidas con mancuernas","series":"3 × 12","descanso":"2–4 min"}},{"a":{"nombre":"Sentadilla frontal","series":"3 × 5","descanso":"3–5 min","aproximacion":["1 × 8 con ~50% de tu peso de trabajo","1 × 5 con ~60%","1 × 3 con ~75%"]},"b":{"nombre":"Sentadilla frontal","series":"3 × 5","descanso":"3–5 min","aproximacion":["1 × 8 con ~50% de tu peso de trabajo","1 × 5 con ~60%","1 × 3 con ~75%"]},"c":{"nombre":"Sentadilla goblet","series":"3 × 12","descanso":"2–4 min"}},{"a":{"nombre":"Hip thrust con barra en pulsos","series":"3 × 15","descanso":"2–4 min"},"b":{"nombre":"Hip thrust con compañera","series":"3 × máximo de repeticiones","descanso":"2–4 min"},"c":{"nombre":"Hip thrust con mancuerna en pulsos","series":"3 × 20","descanso":"2–3 min"}},{"a":{"nombre":"Patada de glúteo en polea, de rodillas","series":"2 × 10 por lado","descanso":"1–2 min"},"b":{"nombre":"Extensión de cadera en cuadrupedia con banda","series":"2 × 20 por lado","descanso":"1–2 min"},"c":{"nombre":"Extensión de cadera en cuadrupedia con banda","series":"2 × 20 por lado","descanso":"1–2 min"}},{"a":{"nombre":"Abducción de cadera en máquina, inclinada al frente","series":"2 × 20","descanso":"1–2 min"},"b":{"nombre":"Abducción de cadera sentada con banda, inclinada al frente","series":"2 × 30","descanso":"1–2 min"},"c":{"nombre":"Abducción de cadera sentada con banda, inclinada al frente","series":"2 × 30","descanso":"1–2 min"}}],"cierre":"10 minutos libres"},{"dia":"Día 3","calentamiento":[["Gato-vaca","3 × 10 cada dirección"],["Rodilla al pecho con rotación","3 × 8 cada dirección"],["Caminata lateral con banda","3 × 10 cada dirección"]],"ejercicios":[{"a":{"nombre":"Hiperextensión a 45° con mancuerna","series":"3 × 12","descanso":"2–4 min","aproximacion":["1 × 8 con ~50% de tu peso de trabajo","1 × 5 con ~70%"]},"b":{"nombre":"Peso muerto rumano a una pierna con apoyo, con mancuerna","series":"3 × 12 por lado","descanso":"2–4 min"},"c":{"nombre":"Peso muerto rumano a una pierna con apoyo, con mancuerna","series":"3 × 12 por lado","descanso":"2–4 min"}},{"a":{"nombre":"Prensa de piernas","series":"3 × 8","descanso":"3–5 min","aproximacion":["1 × 8 con ~60% de tu peso de trabajo","1 × 5 con ~80%"]},"b":{"nombre":"Sentadilla skater","series":"3 × 10 por lado","descanso":"2–4 min"},"c":{"nombre":"Sentadilla skater","series":"3 × 10 por lado","descanso":"2–4 min"}},{"a":{"nombre":"Hip thrust a una pierna con mancuerna","series":"3 × 8 por lado","descanso":"2–4 min"},"b":{"nombre":"Hip thrust a una pierna con mancuerna","series":"3 × 8 por lado","descanso":"2–4 min"},"c":{"nombre":"Hip thrust a una pierna con mancuerna","series":"3 × 8 por lado","descanso":"2–4 min"}},{"a":{"nombre":"Patada de glúteo de pie con banda","series":"2 × 20 por lado","descanso":"1–2 min"},"b":{"nombre":"Patada de glúteo de pie con banda","series":"2 × 20 por lado","descanso":"1–2 min"},"c":{"nombre":"Patada de glúteo de pie con banda","series":"2 × 20 por lado","descanso":"1–2 min"}},{"a":{"nombre":"Abducción de cadera de pie con banda","series":"2 × 20 por lado","descanso":"1–2 min"},"b":{"nombre":"Abducción de cadera de pie con banda","series":"2 × 20 por lado","descanso":"1–2 min"},"c":{"nombre":"Abducción de cadera de pie con banda","series":"2 × 20 por lado","descanso":"1–2 min"}}],"cierre":"10 minutos libres"},{"dia":"Día 5","calentamiento":[["Bird dog","2 × 6 por lado"],["Balanceo de pierna adelante y atrás","2 × 12 por pierna"],["Balanceo de pierna de lado a lado","2 × 12 cada dirección"]],"ejercicios":[{"a":{"nombre":"Peso muerto sumo","series":"3 × 5","descanso":"3–5 min","aproximacion":["1 × 8 con ~60% de tu peso de trabajo","1 × 5 con ~70%","1 × 3 con ~80%"]},"b":{"nombre":"Peso muerto sumo","series":"3 × 5","descanso":"3–5 min","aproximacion":["1 × 8 con ~60% de tu peso de trabajo","1 × 5 con ~70%","1 × 3 con ~80%"]},"c":{"nombre":"Sentadilla sumo con mancuerna","series":"3 × 12","descanso":"2–4 min"}},{"a":{"nombre":"Zancada inversa con carga al frente","series":"3 × 5 por lado","descanso":"3–5 min","aproximacion":["1 × 8 con ~50% de tu peso de trabajo","1 × 5 con ~70%"]},"b":{"nombre":"Zancada inversa con carga al frente","series":"3 × 5 por lado","descanso":"3–5 min","aproximacion":["1 × 8 con ~50% de tu peso de trabajo","1 × 5 con ~70%"]},"c":{"nombre":"Zancada inversa en déficit con mancuernas","series":"3 × 10 por lado","descanso":"2–4 min"}},{"a":{"nombre":"Hip thrust con barra con pausa","series":"3 × 6 · 3 s arriba","descanso":"2–4 min","aproximacion":["1 × 8 con ~60% de tu peso de trabajo","1 × 5 con ~80%"]},"b":{"nombre":"Hip thrust con compañera con pausa","series":"3 × máximo de repeticiones · 3 s arriba","descanso":"2–4 min"},"c":{"nombre":"Hip thrust con mancuerna con pausa","series":"3 × 15 · 3 s arriba","descanso":"2–4 min"}},{"a":{"nombre":"Elevación de cadera de lado con apoyo, rango extra","series":"2 × 15 por lado","descanso":"1–2 min"},"b":{"nombre":"Elevación de cadera de lado con apoyo, rango extra","series":"2 × 15 por lado","descanso":"1–2 min"},"c":{"nombre":"Elevación de cadera de lado con apoyo, rango extra","series":"2 × 15 por lado","descanso":"1–2 min"}},{"a":{"nombre":"Caminata lateral con banda","series":"2 × 20 cada dirección","descanso":"1–2 min"},"b":{"nombre":"Caminata lateral con banda","series":"2 × 20 cada dirección","descanso":"1–2 min"},"c":{"nombre":"Caminata lateral con banda","series":"2 × 20 cada dirección","descanso":"1–2 min"}}],"cierre":"10 minutos libres"}]}'::jsonb)
on conflict (key) do update set titulo = excluded.titulo, data = excluded.data, updated_at = now();


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
