import Link from "next/link";
import { preciosTexto } from "@/lib/guias";
import { guiasActivas } from "@/lib/guiasServer";

export const metadata = { title: "Mis guías · Cecy Method", description: "Guías de Cecy para comer bien lejos de casa." };
export const revalidate = 600;

export default async function Guias() {
  const gs = await guiasActivas();
  return (
    <div className="auth guias-pag">
      <div className="card">
        <div className="eyebrow">Cecy Method</div>
        <h1>Mis guías</h1>
        {gs.length === 0 && <p className="note" style={{ margin: 0 }}>Muy pronto. Sígueme en Instagram @cecy.method para enterarte cuando salgan.</p>}
        {gs.map((g) => (
          <Link key={g.id} href={`/guias/${g.id}`} className="guia-item">
            <b>{g.gratis ? "🎁 " : "📘 "}{g.titulo}</b>
            {g.descripcion && <span className="note">{g.descripcion}</span>}
            <span className="num">{preciosTexto(g)}</span>
            <span className="btn" style={{ marginTop: 6, alignSelf: "flex-start" }}>{g.gratis ? "Descargar gratis" : "Quiero esta guía"}</span>
          </Link>
        ))}
        <Link className="btn" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
