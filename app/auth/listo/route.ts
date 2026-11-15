import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Después de entrar con el código de 6 números: manda a cada quien a su lugar (igual que el enlace del correo).
export async function GET(req: NextRequest) {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/entrar?error=1", req.nextUrl.origin));
  const { data: nutri } = await sb.rpc("is_nutri");
  if (nutri === true) return NextResponse.redirect(new URL("/consultorio", req.nextUrl.origin));
  await sb.rpc("claim_patient");
  return NextResponse.redirect(new URL("/mi-plan", req.nextUrl.origin));
}
