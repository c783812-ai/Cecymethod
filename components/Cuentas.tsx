"use client";
import { useState } from "react";
import { CUENTAS } from "@/lib/cuentas";

/** Las cuentas de Cecy para transferir, con botón de copiar, y el botón para mandarle el comprobante por WhatsApp. */
export default function Cuentas({ que, nombre }: { que?: string; nombre?: string }) {
  const [copiado, setCopiado] = useState("");
  const copiar = async (v: string) => { try { await navigator.clipboard.writeText(v.replace(/\s/g, "")); setCopiado(v); setTimeout(() => setCopiado(""), 2000); } catch {} };
  const msg = `Hola Cecy${nombre ? `, soy ${nombre}` : ""}. Ya hice mi transferencia${que ? ` de ${que}` : ""}. Te mando el comprobante 🙂`;
  return (
    <div className="cuentas-pago">
      {CUENTAS.map((c) => (
        <div key={c.pais} className="cuenta">
          <div className="eyebrow">{c.bandera} {c.pais}</div>
          {c.filas.map(([k, v]) => (
            <div key={k} className="cfila">
              <span><small>{k}</small><b className="num">{v}</b></span>
              {k !== "Titular" && <button type="button" className="btn" onClick={() => copiar(v)}>{copiado === v ? "✓" : "Copiar"}</button>}
            </div>
          ))}
        </div>
      ))}
      <a className="btn primary" style={{ width: "100%", textAlign: "center" }} href={`https://wa.me/971556889063?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener">Mandar mi comprobante por WhatsApp</a>
    </div>
  );
}
