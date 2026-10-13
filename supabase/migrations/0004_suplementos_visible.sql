-- Cecy decide por paciente si ya puede ver la pestaña de Suplementos (como el plan y la rutina).
alter table public.patients add column if not exists suplementos_visible boolean not null default false;
