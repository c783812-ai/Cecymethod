import Link from "next/link";
import { notFound } from "next/navigation";
import Cuentas from "@/components/Cuentas";
import { GUIAS, precioTexto, whatsGuia } from "@/lib/guiasCatalogo";

export const generateStaticParams = () => GUIAS.map((g) => ({ id: g.id }));
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = GUIAS.find((x) => x.id === id);
  return { title: g ? `${g.titulo} · Cecy Method` : "Guía · Cecy Method", description: g?.texto };
}

export default async function GuiaPag({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = GUIAS.find((x) => x.id === id);
  if (!g) notFound();
  return (
    <div className="auth">
      <div className="card">
        <div className="eyebrow">{g.precio ? "Guía en PDF" : "Guía gratis en PDF"}</div>
        <h1>{g.titulo}</h1>
        <p style={{ margin: 0 }}>{g.texto}</p>
        <div>
          <b>Qué encuentras</b>
          <ul className="fuera-l" style={{ marginTop: 4 }}>{g.incluye.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <p className="num" style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{precioTexto(g)}</p>
        <a className="btn primary lg" href={whatsGuia(g)} target="_blank" rel="noopener">{g.precio ? "Pedirla por WhatsApp" : "Pedirla gratis por WhatsApp"}</a>
        {g.precio && (
          <>
            <h3 style={{ margin: "6px 0 0" }}>Datos para tu pago</h3>
            <p className="note" style={{ margin: 0 }}>Transfiere y mándame tu comprobante en el mismo chat. En cuanto lo vea, te envío tu guía.</p>
            <Cuentas que={`la guía “${g.titulo}”`} />
          </>
        )}
        <Link className="btn" href="/guias">Ver todas las guías</Link>
      </div>
    </div>
  );
}
