import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import PatientList from "./PatientList";

export default async function Sidebar({ current }: { current?: string }) {
  const sb = await supabaseServer();
  const { data } = await sb.from("patients").select("id, nombre, ciudad, etapa").order("nombre");
  return (
    <aside className="side">
      <h2>Mis pacientes <span className="note">({data?.length ?? 0})</span></h2>
      <PatientList rows={data ?? []} current={current} />
      <Link className="newp" href="/consultorio" style={{ textAlign: "center", textDecoration: "none" }}>+ Nueva paciente</Link>
    </aside>
  );
}
