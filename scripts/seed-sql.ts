// Genera supabase/seed.sql con la guía de glúteos. Uso: npx tsx scripts/seed-sql.ts
import { writeFileSync } from "node:fs";
import { GUIA_GLUTEOS } from "../lib/gluteos";
const json = JSON.stringify(GUIA_GLUTEOS).replace(/'/g, "''");
writeFileSync(
  "supabase/seed.sql",
  `insert into public.routine_templates (key, titulo, data) values ('gluteos', 'Guía de glúteos', '${json}'::jsonb)\non conflict (key) do update set titulo = excluded.titulo, data = excluded.data, updated_at = now();\n`,
);
