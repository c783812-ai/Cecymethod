import { redirect } from "next/navigation";
import { getUser, isNutri } from "@/lib/auth";
import type { Patient, Plan, Rutina } from "@/lib/types";
import PatientApp from "./PatientApp";
import { CICLO, CICLO_KEY } from "@/lib/ciclo";

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

  // Para que Cecy vea cuándo abrió la app por última vez (no cuenta cuando Cecy la ve como paciente).
  if (patient.user_id === user.id) await sb.rpc("marcar_visita").then(() => {}, () => {});

  const [planRes, rutRes, vidRes] = await Promise.all([
    sb.from("plans").select("id, data, created_at").eq("patient_id", patient.id).eq("activo", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    patient.routine_key && patient.routine_key !== CICLO_KEY ? sb.from("routine_templates").select("key, data").in("key", [patient.routine_key]) : Promise.resolve({ data: null }),
    sb.from("exercise_videos").select("nombre, storage_path"),
  ]);

  const plan = patient.plan_visible ? ((planRes.data?.data as Plan) ?? null) : null;
  const filas = (rutRes.data ?? []) as { key: string; data: Rutina }[];
  // En la rutina del mes van todas las del ciclo, en orden, tal como están en la página (nombres en inglés); la paciente ve la de su mes.
  const ciclo = patient.routine_key === CICLO_KEY ? CICLO.map((c) => c.rutina) : null;
  const rutina = patient.routine_visible ? (ciclo ? ciclo[0] : (CICLO.find((c) => c.key === patient.routine_key)?.rutina ?? filas[0]?.data ?? null)) : null;

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
      planDesde={plan ? ((planRes.data?.created_at as string) ?? null) : null}
      rutina={rutina}
      ciclo={patient.routine_visible ? ciclo : null}
      videos={videos}
      vistaPrevia={nutri && !!como}
    />
  );
}
