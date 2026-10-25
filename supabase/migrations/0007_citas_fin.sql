-- Fecha y hora de la próxima consulta (se ve en la hora de cada quien), fecha en que termina cada paquete y estado de cada paciente.
-- Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).
alter table public.patients add column if not exists cita_at timestamptz;
alter table public.paquetes add column if not exists fin date;
-- Estado de cada paciente: activa, en pausa o terminó (las que terminaron no salen en tu lista ni en Pendientes).
alter table public.patients add column if not exists estado text not null default 'activa' check (estado in ('activa', 'pausa', 'termino'));
-- De dónde llegó cada paciente (para "Mi mes").
alter table public.patients add column if not exists origen text;
