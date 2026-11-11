import Link from "next/link";
import { notFound } from "next/navigation";
import Cuentas from "@/components/Cuentas";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dinero, type Moneda } from "@/lib/pagos";

export const metadata = { title: "Tu compra · Cecy Method", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Listo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ c?: string }> }) {
  const { id } = await params;
  const { c } = await searchParams;
  if (!c || !/^[0-9a-f-]{36}$/.test(c)) notFound();
  const admin = supabaseAdmin();
  const { data: compra } = await admin.from("compras").select("nombre, moneda, monto, guia_id").eq("id", c).eq("guia_id", id).maybeSingle();
  if (!compra) notFound();
  const { data: g } = await admin.from("guias").select("titulo").eq("id", id).maybeSingle();
  const que = `la guía “${g?.titulo ?? id}” (${dinero(Number(compra.monto), compra.moneda as Moneda)})`;
  const msg = `Hola Cecy, soy ${compra.nombre}. Solicité ${que}. En un momento te envío mi comprobante 🙂`;
  return (
    <div className="auth">
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44 }} aria-hidden="true">📘</div>
        <h1>¡Gracias, {compra.nombre.split(" ")[0]}!</h1>
        <p style={{ margin: 0 }}>Toca el botón para avisarme por WhatsApp que quieres {que}. El mensaje ya va listo.</p>
        <a className="btn primary lg" href={`https://wa.me/971556889063?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener">Avisar a Cecy por WhatsApp</a>
        <h3 style={{ margin: "8px 0 0" }}>Datos para tu pago</h3>
        <p className="note" style={{ margin: 0 }}>Transfiere y mándame tu comprobante en el mismo chat. En cuanto lo vea, te envío tu guía.</p>
        <Cuentas que={que} nombre={compra.nombre} />
        <Link className="btn" href="/guias">Ver más guías</Link>
      </div>
    </div>
  );
}
