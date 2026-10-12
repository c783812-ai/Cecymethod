import { redirect } from "next/navigation";
import { getUser, isNutri } from "@/lib/auth";
import type { Patient, Plan, Rutina } from "@/lib/types";
import PatientApp from "./PatientApp";

export const metadata = { title: "Mi plan · Cecy" };
export const dynamic = "force-dynamic";

export default async function MiPlan({ searchParams }: { searchParams: Promise<{ como?: string }> }) {
  const { sb, user } = await getUser();
  if (!user) redirect("/entrar");
  const { como } = await searchParams;
  const nutri = await isNutri(sb);

  // Cecy puede ver la página como la ve una paciente (?como=<id>)
  let q = sb.from("patients").select("*");
  q = nutri && como ? q.eq("id", como) : q.eq("user_id", user.id);
  const { data: patient } = await q.maybeSingle<Patient>();
  if (!patient) {
    if (nutri) redirect("/consultorio");
    return (
      <div className="auth">
        <div className="card">
          <h1>Todavía no hay nada aquí</h1>
          <p style={{ margin: 0 }}>Cecy aún no te ha dado de alta con este correo. Escríbele por WhatsApp al +971 55 688 9063.</p>
          <form action="/salir" method="post"><button className="btn">Salir</button></form>
        </div>
      </div>
    );
  }

  const [planRes, rutRes, vidRes] = await Promise.all([
    sb.from("plans").select("id, data").eq("patient_id", patient.id).eq("activo", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    patient.routine_key ? sb.from("routine_templates").select("data").eq("key", patient.routine_key).maybeSingle() : Promise.resolve({ data: null }),
    sb.from("exercise_videos").select("nombre, storage_path"),
  ]);

  const plan = patient.plan_visible ? ((planRes.data?.data as Plan) ?? null) : null;
  const rutina = patient.routine_visible ? ((rutRes.data?.data as Rutina) ?? null) : null;

  let videos: Record<string, string> = {};
  const vids = vidRes.data ?? [];
  if (rutina && vids.length) {
    const { data: signed } = await sb.storage.from("videos").createSignedUrls(vids.map((v) => v.storage_path), 60 * 60 * 6);
    videos = Object.fromEntries(vids.map((v, i) => [v.nombre, signed?.[i]?.signedUrl ?? ""]).filter(([, u]) => u));
  }

  return (
    <PatientApp
      patient={patient}
      plan={plan}
      planId={plan ? (planRes.data?.id as string) : null}
      planExiste={!!planRes.data}
      rutina={rutina}
      videos={videos}
      vistaPrevia={nutri && !!como}
    />
  );
}
