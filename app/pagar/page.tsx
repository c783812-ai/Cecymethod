import Link from "next/link";
import Cuentas from "@/components/Cuentas";

export const metadata = { title: "Pagar · Cecy Method", robots: { index: false } };

/** Página para pagar por transferencia (consultas, programas o guías): /pagar?que=Guía%20de%20glúteos */
export default async function Pagar({ searchParams }: { searchParams: Promise<{ que?: string }> }) {
  const { que } = await searchParams;
  return (
    <div className="auth">
      <div className="card">
        <div className="eyebrow">Cecy Method</div>
        <h1>Datos para tu pago</h1>
        {que && <p style={{ margin: 0 }}>Para: <b>{que.slice(0, 80)}</b></p>}
        <p className="note" style={{ margin: 0 }}>Haz tu transferencia y mándame el comprobante por WhatsApp. En cuanto lo vea, te confirmo.</p>
        <Cuentas que={que?.slice(0, 80)} />
        <Link className="btn" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
