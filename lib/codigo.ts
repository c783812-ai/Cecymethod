import "server-only";
import { supabaseAdmin } from "./supabase/admin";

/** Código para invitar amigas: su primer nombre en mayúsculas sin acentos + 2 números (ANA27). */
export async function codigoNuevo(nombre: string) {
  const admin = supabaseAdmin();
  const base = (nombre.split(" ")[0] || "AMIGA").normalize("NFD").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 8) || "AMIGA";
  for (let i = 0; i < 20; i++) {
    const c = `${base}${10 + Math.floor(Math.random() * 90)}`;
    const { data } = await admin.from("patients").select("id").eq("codigo", c).maybeSingle();
    if (!data) return c;
  }
  return `${base}${Date.now() % 10000}`;
}

/** Para la app de la paciente: su código (se crea la primera vez) y cuántos descuentos por amigas le tocan. */
export async function amigasDe(p: { id: string; nombre: string; codigo?: string | null; descuentos_usados?: number }) {
  const admin = supabaseAdmin();
  let codigo = p.codigo ?? null;
  if (!codigo) {
    codigo = await codigoNuevo(p.nombre);
    const { error } = await admin.from("patients").update({ codigo }).eq("id", p.id);
    if (error) return null; // falta pegar el SQL 0010
  }
  const { data } = await admin.from("patients").select("estado").eq("referida_por", p.id);
  const traidas = (data ?? []).filter((r) => r.estado !== "nueva").length;
  return { codigo, traidas, pendientes: Math.max(0, traidas - (p.descuentos_usados ?? 0)) };
}
