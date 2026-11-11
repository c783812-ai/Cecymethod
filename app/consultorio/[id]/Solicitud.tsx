import Link from "next/link";
import { requireNutri } from "@/lib/auth";
import { PRESETS, MONEDAS, type Moneda } from "@/lib/pagos";
import type { Patient } from "@/lib/types";
import { activarSolicitud, asegurarCodigo, usarDescuento } from "../actions";

export const DESCUENTO_AMIGA = 0.1;

/** Llenó el formulario de la página: Cecy revisa su pago y la activa con un toque. */
export async function Solicitud({ p }: { p: Patient }) {
  const { sb } = await requireNutri();
  const [nombrePq, mon] = (p.paquete_pedido ?? "Consulta online · EUR").split(" · ");
  const preset = PRESETS.find((x) => x.nombre === nombrePq) ?? PRESETS[0];
  const moneda: Moneda = (MONEDAS as readonly string[]).includes(mon) ? (mon as Moneda) : "EUR";
  const amiga = p.referida_por ? (await sb.from("patients").select("nombre").eq("id", p.referida_por).maybeSingle()).data?.nombre : null;
  const total = Math.round(preset.precio[moneda] * (amiga ? 1 - DESCUENTO_AMIGA : 1) * 100) / 100;
  const tel = (p.telefono ?? "").replace(/[^\d]/g, "");
  return (
    <div className="card solicitud">
      <div className="pill p-info" style={{ alignSelf: "flex-start" }}>Nueva · se registró en tu página</div>
      <h3 style={{ margin: "8px 0 4px" }}>Quiere: {preset.nombre} ({moneda})</h3>
      {p.objetivo && <p style={{ margin: "0 0 6px" }}><b>Lo que quiere lograr:</b> {p.objetivo}</p>}
      <p className="note" style={{ margin: "0 0 10px" }}>
        {p.email}{p.telefono ? <> · WhatsApp {tel ? <a href={`https://wa.me/${tel}`} target="_blank" rel="noopener">{p.telefono}</a> : p.telefono}</> : null}
        {amiga ? <> · Llegó con el código de <b>{amiga}</b> (10 % de descuento ya aplicado abajo)</> : null}
      </p>
      <form action={activarSolicitud.bind(null, p.id)} className="pagoform">
        <label className="field">Paquete<select name="paquete" defaultValue={preset.nombre}>{PRESETS.map((x) => <option key={x.nombre}>{x.nombre}</option>)}</select></label>
        <label className="field">Moneda<select name="moneda" defaultValue={moneda}>{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="field">Total<input name="total" inputMode="decimal" defaultValue={String(total)} /></label>
        <label className="field">Recibiste<input name="monto" inputMode="decimal" defaultValue={String(total)} /></label>
        <label className="field">Nota (solo tú)<input name="nota" defaultValue={amiga ? `10 % por código de ${amiga}` : ""} /></label>
        <label className="check" style={{ alignSelf: "end" }}><input type="checkbox" name="invitar" defaultChecked /><span>Mandarle ya el correo para entrar</span></label>
        <div><button className="btn primary">Ya pagó: activar</button></div>
      </form>
      <p className="note" style={{ margin: "8px 0 0" }}>Si no va a seguir, bórrala abajo en “Borrar a esta paciente”.</p>
    </div>
  );
}

/** Su código para invitar amigas, a quién trajo y los descuentos que le tocan. */
export async function Amigas({ p }: { p: Patient }) {
  const { sb } = await requireNutri();
  const [{ data: refs }, amiga] = await Promise.all([
    sb.from("patients").select("id, nombre, estado").eq("referida_por", p.id),
    p.referida_por ? sb.from("patients").select("id, nombre").eq("id", p.referida_por).maybeSingle().then((r) => r.data) : Promise.resolve(null),
  ]);
  const activas = (refs ?? []).filter((r) => r.estado !== "nueva");
  const pendientes = Math.max(0, activas.length - (p.descuentos_usados ?? 0));
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Invita a una amiga</h3>
      {p.codigo ? <p style={{ margin: "0 0 6px" }}>Su código: <b className="num">{p.codigo}</b></p> : (
        <form action={async () => { "use server"; await asegurarCodigo(p.id); }}><button className="btn">Darle su código</button></form>
      )}
      {amiga && <p className="note" style={{ margin: "0 0 6px" }}>Ella llegó con el código de <Link href={`/consultorio/${amiga.id}`}>{amiga.nombre}</Link>.</p>}
      {refs?.length ? (
        <p className="note" style={{ margin: "0 0 6px" }}>Ha traído a: {refs.map((r, i) => <span key={r.id}>{i ? ", " : ""}<Link href={`/consultorio/${r.id}`}>{r.nombre}</Link>{r.estado === "nueva" ? " (aún no paga)" : ""}</span>)}</p>
      ) : <p className="note" style={{ margin: "0 0 6px" }}>Todavía no ha traído a nadie.</p>}
      {pendientes > 0 && (
        <form action={usarDescuento.bind(null, p.id)} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="pill p-ok">Le toca{pendientes > 1 ? `n ${pendientes} descuentos` : " 1 descuento"} del 10 %</span>
          <button className="btn">Ya se lo apliqué</button>
        </form>
      )}
    </div>
  );
}
