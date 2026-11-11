import Link from "next/link";
import { GUIAS, precioTexto } from "@/lib/guiasCatalogo";

export const metadata = { title: "Mis guías · Cecy Method", description: "Guías de Cecy para comer bien lejos de casa." };

export default function Guias() {
  return (
    <div className="auth">
      <div className="card">
        <div className="eyebrow">Cecy Method</div>
        <h1>Mis guías</h1>
        <p className="note" style={{ margin: 0 }}>Elige tu guía y pídemela por WhatsApp. Pagas por transferencia, me mandas tu comprobante y te envío tu guía en PDF.</p>
        {GUIAS.map((g) => (
          <Link key={g.id} href={`/guias/${g.id}`} className="guia-item">
            <b>{g.precio ? "📘" : "🎁"} {g.titulo}</b>
            <span className="note">{g.texto}</span>
            <span className="num" style={{ fontWeight: 700 }}>{precioTexto(g)}</span>
          </Link>
        ))}
        <Link className="btn" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
