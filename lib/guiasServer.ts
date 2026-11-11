import "server-only";
import { supabaseAdmin } from "./supabase/admin";
import type { Guia } from "./guias";

/** Las guías que Cecy tiene activas, para la página (si aún no existe la tabla, ninguna). */
export async function guiasActivas() {
  try {
    const { data } = await supabaseAdmin().from("guias").select("*").eq("activa", true).order("orden").order("titulo");
    return (data ?? []) as Guia[];
  } catch { return []; }
}
