import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Enlace del correo: inicia sesión y manda a cada quien a su lugar.
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const sb = await supabaseServer();
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await sb.auth.exchangeCodeForSession(code)
    : token_hash && type
      ? await sb.auth.verifyOtp({ token_hash, type })
      : { error: new Error("missing") };
  if (error) return NextResponse.redirect(new URL("/entrar?error=1", url.origin));

  const { data: nutri } = await sb.rpc("is_nutri");
  if (nutri === true) return NextResponse.redirect(new URL("/consultorio", url.origin));
  await sb.rpc("claim_patient");
  return NextResponse.redirect(new URL("/mi-plan", url.origin));
}
