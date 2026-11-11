import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { preciosTexto, type Guia } from "@/lib/guias";
import { comprarGuia } from "../actions";

export const revalidate = 600;

async function guia(id: string) {
  const { data } = await supabaseAdmin().from("guias").select("*").eq("id", id).eq("activa", true).maybeSingle<Guia>();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const g = await guia((await params).id).catch(() => null);
  return { title: g ? `${g.titulo} · Cecy Method` : "Guía · Cecy Method", description: g?.descripcion ?? undefined };
}

export default async function GuiaPag({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const g = await guia(id).catch(() => null);
  if (!g) notFound();
  return (
    <div className="auth">
      <div className="card">
        <div className="eyebrow">{g.gratis ? "Guía gratis" : "Guía"}</div>
        <h1>{g.titulo}</h1>
        {g.descripcion && <p style={{ margin: 0, whiteSpace: "pre-line" }}>{g.descripcion}</p>}
        <p className="num" style={{ margin: 0, fontWeight: 700 }}>{preciosTexto(g)}</p>
        {error && <div className="msg err">{error}</div>}
        <form action={comprarGuia.bind(null, g.id)} className="empezar-form">
          <label className="field">Tu nombre<input name="nombre" required autoComplete="name" /></label>
          {!g.gratis && <label className="field">Tu WhatsApp, con lada<input name="telefono" type="tel" required autoComplete="tel" placeholder="+52 55 1234 5678" /></label>}
          <label className="field">Tu correo{g.gratis ? "" : " (opcional)"}<input name="email" type="email" required={g.gratis} autoComplete="email" /></label>
          {!g.gratis && <label className="field">¿En qué moneda pagas?<select name="moneda" defaultValue="EUR"><option value="EUR">Euros</option><option value="USD">Dólares</option><option value="MXN">Pesos mexicanos</option></select></label>}
          <input name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="trampa" />
          <button className="btn primary lg">{g.gratis ? "Descargar gratis" : "Quiero esta guía"}</button>
          {!g.gratis && <p className="note" style={{ margin: 0 }}>Después se abre WhatsApp con tu mensaje listo para mí. Pagas por transferencia, me mandas el comprobante y te envío tu guía por WhatsApp.</p>}
        </form>
        <Link className="btn" href="/guias">Ver todas las guías</Link>
      </div>
    </div>
  );
}
