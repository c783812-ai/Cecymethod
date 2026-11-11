-- Alta de pacientes desde la página y "Invita a una amiga".
-- Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).

-- Nuevo estado: "nueva" = llenó el formulario de la página y espera que Cecy confirme su pago.
alter table public.patients drop constraint if exists patients_estado_check;
alter table public.patients add constraint patients_estado_check check (estado in ('nueva', 'activa', 'pausa', 'termino'));

alter table public.patients add column if not exists telefono text;            -- su WhatsApp
alter table public.patients add column if not exists objetivo text;            -- lo que quiere lograr (lo escribe ella)
alter table public.patients add column if not exists paquete_pedido text;      -- el paquete y moneda que eligió en la página
alter table public.patients add column if not exists codigo text unique;       -- su código para invitar amigas
alter table public.patients add column if not exists referida_por uuid references public.patients (id) on delete set null;
alter table public.patients add column if not exists descuentos_usados int not null default 0; -- descuentos por amigas que Cecy ya le aplicó
