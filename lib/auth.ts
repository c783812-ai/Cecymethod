import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export async function getUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return { sb, user: data.user };
}

export async function isNutri(sb: Awaited<ReturnType<typeof supabaseServer>>) {
  const { data } = await sb.rpc("is_nutri");
  return data === true;
}

export async function requireNutri() {
  const { sb, user } = await getUser();
  if (!user) redirect("/entrar");
  if (!(await isNutri(sb))) redirect("/mi-plan");
  return { sb, user };
}
