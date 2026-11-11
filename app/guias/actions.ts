"use server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MONEDAS } from "@/lib/pagos";
import { precioDe, type Guia } from "@/lib/guias";

const str = (f: FormData, k: string, max = 120) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
};

/** Pide una guía: si es gratis se descarga ya; si es de pago queda pendiente hasta que Cecy vea la transferencia. */
export async function comprarGuia(id: string, f: FormData) {
  if (str(f, "web")) redirect(`/guias/${id}`); // campo trampa
  const nombre = str(f, "nombre", 80);
  const email = str(f, "email")?.toLowerCase() ?? "";
  const telefono = str(f, "telefono", 30);
  if (!nombre || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) redirect(`/guias/${id}?error=${encodeURIComponent("Revisa tu nombre y tu correo.")}`);
  const admin = supabaseAdmin();
  const { data: g } = await admin.from("guias").select("*").eq("id", id).eq("activa", true).maybeSingle<Guia>();
  if (!g) redirect("/guias");
  if (g.gratis ? !email : !telefono) redirect(`/guias/${id}?error=${encodeURIComponent(g.gratis ? "Escribe tu correo." : "Escribe tu WhatsApp.")}`);
  const moneda = MONEDAS.find((m) => m === str(f, "moneda")) ?? "EUR";
  const { data: c, error } = await admin.from("compras").insert({
    guia_id: id, nombre, email, telefono, moneda, monto: g.gratis ? 0 : precioDe(g, moneda),
    ...(g.gratis ? { estado: "pagada", pagada_at: new Date().toISOString() } : {}),
  }).select("id, token").single();
  if (error || !c) redirect(`/guias/${id}?error=${encodeURIComponent("No se pudo guardar. Intenta otra vez.")}`);
  redirect(g.gratis ? `/descarga/${c.token}` : `/guias/${id}/listo?c=${c.id}`);
}
