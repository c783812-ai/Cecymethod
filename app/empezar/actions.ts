"use server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MONEDAS, PRESETS } from "@/lib/pagos";
import { ORIGENES } from "@/lib/mes";

const str = (f: FormData, k: string, max = 200) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
};

/** Formulario público "Quiero empezar": crea a la paciente como "nueva" para que Cecy la active cuando reciba su pago. */
export async function solicitar(f: FormData) {
  if (str(f, "web")) redirect("/empezar/listo"); // campo trampa: solo lo llenan los robots
  const nombre = str(f, "nombre", 80);
  const email = str(f, "email", 120)?.toLowerCase();
  const telefono = str(f, "telefono", 30);
  const paquete = PRESETS.find((p) => p.nombre === str(f, "paquete"))?.nombre;
  const moneda = MONEDAS.find((m) => m === str(f, "moneda")) ?? "EUR";
  const back = (msg: string) => redirect(`/empezar?error=${encodeURIComponent(msg)}${str(f, "codigo") ? `&codigo=${encodeURIComponent(str(f, "codigo")!)}` : ""}`);
  if (!nombre || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back("Revisa tu nombre y tu correo.");
  if (!paquete) back("Elige tu consulta o programa.");
  if (!f.get("acepto")) back("Para continuar, acepta el aviso de privacidad.");

  const admin = supabaseAdmin();
  const { data: ya } = await admin.from("patients").select("id, estado").eq("email", email!).maybeSingle();
  if (ya) redirect(`/empezar/listo?ya=1&n=${encodeURIComponent(nombre!)}&p=${encodeURIComponent(paquete!)}`);

  const codigo = str(f, "codigo", 20)?.toUpperCase().replace(/\s/g, "");
  let referida_por: string | null = null;
  if (codigo) {
    const { data: r } = await admin.from("patients").select("id").eq("codigo", codigo).maybeSingle();
    referida_por = r?.id ?? null;
  }
  const origenElegido = str(f, "origen");
  const origen = referida_por ? "recomendacion" : ORIGENES.some(([k]) => k === origenElegido) ? origenElegido : null;

  const { error } = await admin.from("patients").insert({
    nombre, email, telefono, ciudad: str(f, "ciudad", 80), objetivo: str(f, "objetivo", 600),
    paquete_pedido: `${paquete} · ${moneda}`, estado: "nueva", origen, referida_por,
  });
  if (error) back(error.code === "42703" || error.code === "23514" ? "Esta parte aún no está lista. Escríbele a Cecy por WhatsApp." : "No se pudo guardar. Intenta otra vez.");
  redirect(`/empezar/listo?n=${encodeURIComponent(nombre!)}&p=${encodeURIComponent(paquete!)}&m=${moneda}${referida_por ? "&r=1" : ""}`);
}
