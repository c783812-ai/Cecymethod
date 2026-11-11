import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Link privado de descarga: solo funciona si la compra está pagada. Da un link firmado de 10 minutos al PDF. */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const fuera = (msg: string) => new NextResponse(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;padding:24px;max-width:440px;margin:auto"><h2>Cecy Method</h2><p>${msg}</p><p><a href="https://wa.me/971556889063">Escribir a Cecy por WhatsApp</a></p></body>`, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  if (!/^[0-9a-f]{32}$/.test(token)) return fuera("Este link no es válido.");
  const admin = supabaseAdmin();
  const { data: c } = await admin.from("compras").select("id, estado, descargas, guia_id").eq("token", token).maybeSingle();
  if (!c) return fuera("Este link no es válido.");
  if (c.estado !== "pagada") return fuera("Tu pago todavía no está confirmado. En cuanto Cecy lo vea, este link funciona.");
  const { data: g } = await admin.from("guias").select("titulo, storage_path").eq("id", c.guia_id).maybeSingle();
  if (!g?.storage_path) return fuera("La guía todavía no está lista para descargar. Escríbele a Cecy.");
  const nombre = `${g.titulo.replace(/[^\p{L}\p{N} ]/gu, "").trim() || "Guia"} - Cecy Method.pdf`;
  const { data: s } = await admin.storage.from("guias").createSignedUrl(g.storage_path, 600, { download: nombre });
  if (!s?.signedUrl) return fuera("No se pudo abrir la guía. Intenta otra vez en un momento.");
  await admin.from("compras").update({ descargas: (c.descargas ?? 0) + 1 }).eq("id", c.id);
  void req;
  return NextResponse.redirect(s.signedUrl, 302);
}
