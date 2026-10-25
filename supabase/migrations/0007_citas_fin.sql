-- Fecha y hora de la próxima consulta (se ve en la hora de cada quien) y fecha en que termina cada paquete.
-- Copia todo y pégalo en Supabase > SQL Editor > Run (una sola vez).
alter table public.patients add column if not exists cita_at timestamptz;
alter table public.paquetes add column if not exists fin date;
