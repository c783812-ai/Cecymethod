import { crearPaciente } from "./actions";
import Sidebar from "./Sidebar";

export const metadata = { title: "Mi consultorio · Cecy" };

export default async function Consultorio({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="office">
      <Sidebar />
      <section className="main">
        <div className="phead"><div><div className="eyebrow">Al agendar</div><h1>Nueva paciente</h1></div></div>
        {error && <div className="msg err" style={{ marginBottom: 12 }}>{error}</div>}
        <form action={crearPaciente} className="card grid">
          <div className="form-grid">
            <label className="field">Nombre<input name="nombre" required placeholder="Mariana G." /></label>
            <label className="field">Correo<input name="email" type="email" required placeholder="correo@ejemplo.com" /></label>
            <label className="field">Ciudad y país donde vive<input name="ciudad" placeholder="Stuttgart, Alemania (para su súper)" /></label>
            <label className="field">Primera consulta<input name="proxima_cita" placeholder="16 oct 2026, 18:00 (su hora)" /></label>
          </div>
          <p className="note" style={{ margin: 0 }}>Crearla no le manda nada. La invitas desde su ficha cuando su plan esté listo.</p>
          <div><button className="btn primary">Crear paciente</button></div>
        </form>
      </section>
    </div>
  );
}
