-- Venta de guías: el catálogo, las compras (pago por transferencia) y la carpeta privada de los PDF.
-- Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).

create table if not exists public.guias (
  id text primary key,                 -- nombre corto para el link: meal-prep
  titulo text not null,
  descripcion text,
  precio_eur numeric(10, 2) not null default 0,
  precio_usd numeric(10, 2) not null default 0,
  precio_mxn numeric(10, 2) not null default 0,
  gratis boolean not null default false,
  activa boolean not null default false, -- solo las activas salen en la página
  orden int not null default 0,
  storage_path text,                    -- el PDF en la carpeta privada "guias"
  updated_at timestamptz not null default now()
);
alter table public.guias enable row level security;
drop policy if exists nutri_all on public.guias;
create policy nutri_all on public.guias for all using (public.is_nutri()) with check (public.is_nutri());

create table if not exists public.compras (
  id uuid primary key default gen_random_uuid(),
  guia_id text not null references public.guias (id) on delete cascade,
  nombre text not null,
  email text not null,
  telefono text,
  moneda text not null default 'EUR',
  monto numeric(10, 2) not null default 0,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagada')),
  token text not null unique default replace(gen_random_uuid()::text, '-', ''), -- su link privado de descarga
  descargas int not null default 0,
  created_at timestamptz not null default now(),
  pagada_at timestamptz
);
alter table public.compras enable row level security;
drop policy if exists nutri_all on public.compras;
create policy nutri_all on public.compras for all using (public.is_nutri()) with check (public.is_nutri());

-- Carpeta privada de los PDF: solo Cecy sube; las compradoras descargan con su link (firmado por la página).
insert into storage.buckets (id, name, public) values ('guias', 'guias', false) on conflict (id) do nothing;
drop policy if exists guias_nutri_write on storage.objects;
create policy guias_nutri_write on storage.objects for all
  using (bucket_id = 'guias' and public.is_nutri())
  with check (bucket_id = 'guias' and public.is_nutri());

-- Las 10 guías, ocultas hasta que subas su PDF y marques "Mostrarla en mi página" (precios cambiables en Consultorio > Guías).
insert into public.guias (id, titulo, descripcion, precio_eur, precio_usd, precio_mxn, gratis, orden) values
  ('desayunos-proteina', '7 desayunos altos en proteína', 'Siete desayunos rápidos y ricos en proteína para empezar bien el día.', 0, 0, 0, true, 1),
  ('meal-prep', 'Meal prep en 1 hora', 'Cocina tu semana en una hora, con lista del súper.', 15, 17, 290, false, 2),
  ('air-fryer', 'Air fryer: recetas fáciles', 'Recetas saludables y rápidas en tu air fryer.', 12, 14, 240, false, 3),
  ('cenas-15', 'Cenas listas en 15 minutos', 'Cenas con proteína para las noches sin tiempo.', 12, 14, 240, false, 4),
  ('sabor-a-casa', 'Sabor a casa', 'Comida mexicana saludable, con ingredientes que encuentras en tu súper.', 15, 17, 290, false, 5),
  ('lunch-box', 'Lunch box para llevar', 'Comidas para llevar al trabajo o a la escuela.', 12, 14, 240, false, 6),
  ('antojos', 'Antojos y colaciones sin culpa', 'Postres y snacks ligeros para tus antojos.', 12, 14, 240, false, 7),
  ('poco-dinero', 'Comer sano con poco dinero', 'Menús y compras para comer bien gastando menos.', 12, 14, 240, false, 8),
  ('ri-sop', 'Resistencia a la insulina y SOP: qué comer', 'Qué comer y cómo armar tus platos si tienes resistencia a la insulina o SOP.', 25, 29, 490, false, 9),
  ('comer-fuera', 'Comer fuera y de viaje', 'Qué pedir en restaurantes, fiestas y viajes sin salirte de tu plan.', 12, 14, 240, false, 10)
on conflict (id) do nothing;
