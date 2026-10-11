"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireNutri } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Plan } from "@/lib/types";

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const lines = (v: string | null) => (v ? v.split("\n").map((s) => s.trim()).filter(Boolean) : []);
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function crearPaciente(f: FormData) {
  const { sb } = await requireNutri();
  const nombre = str(f, "nombre");
  const email = str(f, "email")?.toLowerCase();
  if (!nombre || !email) throw new Error("Falta nombre o correo");
  const { data, error } = await sb
    .from("patients")
    .insert({ nombre, email, ciudad: str(f, "ciudad"), proxima_cita: str(f, "proxima_cita") })
    .select("id")
    .single();
  if (error) redirect(`/consultorio?error=${encodeURIComponent(error.code === "23505" ? "Ya hay una paciente con ese correo." : error.message)}`);
  redirect(`/consultorio/${data.id}`);
}

export async function invitar(id: string) {
  const { sb } = await requireNutri();
  const { data: p } = await sb.from("patients").select("email, user_id").eq("id", id).single();
  if (!p) return { ok: false, msg: "No encontré a la paciente." };
  const admin = supabaseAdmin();
  if (!p.user_id) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(p.email, { redirectTo: `${siteUrl()}/auth/confirm` });
    if (error && !/already been registered/i.test(error.message)) return { ok: false, msg: `No se pudo mandar: ${error.message}` };
    if (data?.user) await sb.from("patients").update({ user_id: data.user.id }).eq("id", id);
    if (error) {
      // Ya tenía cuenta: le mandamos un enlace de acceso normal.
      await admin.auth.signInWithOtp({ email: p.email, options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl()}/auth/confirm` } });
    }
  } else {
    await admin.auth.signInWithOtp({ email: p.email, options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl()}/auth/confirm` } });
  }
  await sb.from("patients").update({ invitada_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/consultorio/${id}`);
  return { ok: true, msg: `Invitación enviada a ${p.email}.` };
}

export async function guardarResumen(id: string, f: FormData) {
  const { sb } = await requireNutri();
  await sb
    .from("patients")
    .update({
      nombre: str(f, "nombre") ?? undefined,
      ciudad: str(f, "ciudad"),
      proxima_cita: str(f, "proxima_cita"),
      metas: lines(str(f, "metas")).slice(0, 3),
    })
    .eq("id", id);
  revalidatePath(`/consultorio/${id}`);
}

export async function cambiarAcceso(id: string, campo: "plan_visible" | "routine_visible", valor: boolean) {
  const { sb } = await requireNutri();
  await sb.from("patients").update({ [campo]: valor }).eq("id", id);
  revalidatePath(`/consultorio/${id}`);
}

export async function asignarRutina(id: string, f: FormData) {
  const { sb } = await requireNutri();
  await sb.from("patients").update({ routine_key: str(f, "routine_key") }).eq("id", id);
  revalidatePath(`/consultorio/${id}`);
}

export async function guardarPlan(id: string, planId: string | null, plan: Plan, nuevo: boolean) {
  const { sb } = await requireNutri();
  if (planId && !nuevo) {
    const { error } = await sb.from("plans").update({ data: plan, updated_at: new Date().toISOString() }).eq("id", planId);
    if (error) return { ok: false, msg: error.message };
  } else {
    await sb.from("plans").update({ activo: false }).eq("patient_id", id).eq("activo", true);
    const { error } = await sb.from("plans").insert({ patient_id: id, data: plan, activo: true });
    if (error) return { ok: false, msg: error.message };
  }
  revalidatePath(`/consultorio/${id}`);
  return { ok: true, msg: "Plan guardado." };
}

export async function guardarVideo(nombre: string, storage_path: string) {
  const { sb } = await requireNutri();
  const { data: old } = await sb.from("exercise_videos").select("storage_path").eq("nombre", nombre).maybeSingle();
  await sb.from("exercise_videos").upsert({ nombre, storage_path, updated_at: new Date().toISOString() });
  if (old && old.storage_path !== storage_path) await sb.storage.from("videos").remove([old.storage_path]);
  revalidatePath("/consultorio/videos");
}

export async function borrarPaciente(id: string, f: FormData) {
  const { sb } = await requireNutri();
  if (str(f, "confirmar") !== "BORRAR") return;
  const { data: p } = await sb.from("patients").select("user_id").eq("id", id).single();
  await sb.from("patients").delete().eq("id", id);
  if (p?.user_id) await supabaseAdmin().auth.admin.deleteUser(p.user_id);
  redirect("/consultorio");
}
