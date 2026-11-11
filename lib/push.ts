import "server-only";
import webpush from "web-push";
import { supabaseAdmin } from "./supabase/admin";

/** La llave pública para que el celular de la paciente acepte notificaciones. Si todavía no existen, se crean una sola vez. */
export async function clavePush(): Promise<string | null> {
  const admin = supabaseAdmin();
  const { data, error } = await admin.from("push_config").select("publica").eq("id", 1).maybeSingle();
  if (error) return null; // falta correr el SQL 0009
  if (data) return data.publica as string;
  const k = webpush.generateVAPIDKeys();
  await admin.from("push_config").insert({ id: 1, publica: k.publicKey, privada: k.privateKey });
  const { data: d2 } = await admin.from("push_config").select("publica").eq("id", 1).maybeSingle();
  return (d2?.publica as string) ?? null;
}
