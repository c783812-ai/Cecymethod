import Link from "next/link";
import { requireNutri } from "@/lib/auth";
import { dinero, porMoneda, textoMonedas, type Moneda } from "@/lib/pagos";
import { linkDescarga, mensajeGuia, preciosTexto, type Compra, type Guia } from "@/lib/guias";
import { borrarCompra, borrarGuia, guardarGuia, marcarCompraPagada } from "../actions";
import SubirPdf from "./SubirPdf";
import Copiar from "./Copiar";

export const metadata = { title: "Guías · Mi consultorio" };

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

function FormGuia({ g }: { g?: Guia }) {
  return (
    <form action={guardarGuia} className="pagoform">
      {g && <input type="hidden" name="id" value={g.id} />}
      <label className="field" style={{ gridColumn: "1 / -1" }}>Título<input name="titulo" defaultValue={g?.titulo ?? ""} required placeholder="Meal prep en 1 hora" /></label>
      <label className="field" style={{ gridColumn: "1 / -1" }}>Descripción (la ven en tu página)<textarea name="descripcion" defaultValue={g?.descripcion ?? ""} placeholder="Qué incluye, para quién es, cuántas recetas…" /></label>
      <label className="field">Precio EUR<input name="precio_eur" inputMode="decimal" defaultValue={g ? String(g.precio_eur) : ""} /></label>
      <label className="field">Precio USD<input name="precio_usd" inputMode="decimal" defaultValue={g ? String(g.precio_usd) : ""} /></label>
      <label className="field">Precio MXN<input name="precio_mxn" inputMode="decimal" defaultValue={g ? String(g.precio_mxn) : ""} /></label>
      <label className="field">Orden en la página<input name="orden" inputMode="numeric" defaultValue={g ? String(g.orden) : "0"} /></label>
      <label className="check"><input type="checkbox" name="gratis" defaultChecked={g?.gratis} /><span>Es gratis (se descarga al dejar su correo)</span></label>
      <label className="check"><input type="checkbox" name="activa" defaultChecked={g?.activa} /><span>Mostrarla en mi página</span></label>
      <div><button className="btn primary">{g ? "Guardar cambios" : "Crear guía"}</button></div>
    </form>
  );
}

export default async function GuiasConsultorio() {
  const { sb } = await requireNutri();
  const [{ data: gs, error }, { data: cs }] = await Promise.all([
    sb.from("guias").select("*").order("orden").order("titulo"),
    sb.from("compras").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  if (error) return <section className="main" style={{ padding: 20 }}><div className="card"><h3>Guías</h3><p className="note">Falta pegar en Supabase el código 0011 de guías para usar esta parte.</p></div></section>;
  const guias = (gs ?? []) as Guia[];
  const compras = (cs ?? []) as Compra[];
  const titulo = (id: string) => guias.find((g) => g.id === id)?.titulo ?? id;
  const pendientes = compras.filter((c) => c.estado === "pendiente");
  const pagadas = compras.filter((c) => c.estado === "pagada" && Number(c.monto) > 0);
  const gratis = compras.filter((c) => c.estado === "pagada" && Number(c.monto) === 0);
  const mes = new Date().toISOString().slice(0, 7);
  const cobradoMes = textoMonedas(porMoneda(pagadas.filter((c) => (c.pagada_at ?? "").startsWith(mes)), (c) => c.moneda, (c) => c.monto));

  const Venta = ({ c }: { c: Compra }) => {
    const tel = (c.telefono ?? "").replace(/[^\d]/g, "");
    const msg = mensajeGuia(c, titulo(c.guia_id));
    return (
      <li className="venta">
        <div>
          <b>{c.nombre}</b> · {titulo(c.guia_id)} · <b className="num">{dinero(Number(c.monto), c.moneda as Moneda)}</b>
          <br /><span className="note">{fecha(c.created_at)}{c.email ? ` · ${c.email}` : ""}{c.telefono ? ` · ${c.telefono}` : ""}{c.estado === "pagada" && c.monto > 0 ? ` · descargó ${c.descargas} ${c.descargas === 1 ? "vez" : "veces"}` : ""}</span>
        </div>
        <div className="venta-btns">
          {c.estado === "pendiente" ? (
            <>
              <form action={marcarCompraPagada.bind(null, c.id)}><button className="btn primary">Ya pagó</button></form>
              <form action={borrarCompra.bind(null, c.id)}><button className="linklike">Quitar</button></form>
            </>
          ) : (
            <>
              <a className="btn primary" href={`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener">Mandarle su guía por WhatsApp</a>
              {c.email && <a className="btn" href={`mailto:${c.email}?subject=${encodeURIComponent(`Tu guía: ${titulo(c.guia_id)}`)}&body=${encodeURIComponent(msg)}`}>Por correo</a>}
              <Copiar texto={linkDescarga(c.token)} />
            </>
          )}
        </div>
      </li>
    );
  };

  return (
    <section className="main" style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <div className="phead"><div><div className="eyebrow">Venta por transferencia</div><h1>Mis guías</h1></div><Link className="btn" href="/guias" target="_blank">Ver en mi página</Link></div>
      <div className="grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Por confirmar pago ({pendientes.length})</h3>
          {pendientes.length ? <ul className="ventas">{pendientes.map((c) => <Venta key={c.id} c={c} />)}</ul> : <p className="note" style={{ margin: 0 }}>Nadie esperando. Cuando alguien pida una guía te aparece aquí; tocas “Ya pagó” cuando veas su transferencia.</p>}
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Vendidas</h3>
          <p className="note" style={{ margin: "0 0 8px" }}>Cobrado este mes: <b>{cobradoMes}</b> · {pagadas.length} vendidas en total · {gratis.length} descargas de guías gratis</p>
          {pagadas.length ? <ul className="ventas">{pagadas.slice(0, 30).map((c) => <Venta key={c.id} c={c} />)}</ul> : <p className="note" style={{ margin: 0 }}>Todavía ninguna.</p>}
          {gratis.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary className="note" style={{ cursor: "pointer" }}>Correos de quienes descargaron una guía gratis ({gratis.length})</summary>
              <p className="note" style={{ wordBreak: "break-all" }}>{[...new Set(gratis.map((c) => c.email))].join(", ")}</p>
              <Copiar texto={[...new Set(gratis.map((c) => c.email))].join(", ")} label="Copiar correos" />
            </details>
          )}
        </div>
        {guias.map((g) => (
          <div key={g.id} className="card">
            <div className="pq-head" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div><h3 style={{ margin: 0 }}>{g.gratis ? "🎁" : "📘"} {g.titulo}</h3><span className="note">{preciosTexto(g)} · {g.activa ? "Se ve en tu página" : "Oculta"}</span></div>
              <SubirPdf id={g.id} listo={!!g.storage_path} />
            </div>
            <details style={{ marginTop: 8 }}>
              <summary className="note" style={{ cursor: "pointer" }}>Cambiar</summary>
              <div style={{ marginTop: 8 }}><FormGuia g={g} /></div>
              <form action={borrarGuia.bind(null, g.id)} style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input name="confirmar" placeholder="Escribe BORRAR" aria-label="Escribe BORRAR para confirmar" />
                <button className="btn">Borrar guía</button>
              </form>
            </details>
          </div>
        ))}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Agregar una guía</h3>
          <FormGuia />
          <p className="note" style={{ margin: "8px 0 0" }}>Después de crearla, sube su PDF y marca “Mostrarla en mi página”.</p>
        </div>
      </div>
    </section>
  );
}
