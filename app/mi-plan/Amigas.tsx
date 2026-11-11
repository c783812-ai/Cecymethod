"use client";
import { useState } from "react";

export type AmigasData = { codigo: string; traidas: number; pendientes: number };

/** Invita a una amiga: su código, para compartir por WhatsApp. Las dos tienen 10 % de descuento. */
export default function InvitaAmiga({ d }: { d: AmigasData | null }) {
  const [copiado, setCopiado] = useState(false);
  if (!d) return null;
  const link = `https://cecymethod.com/empezar?codigo=${d.codigo}`;
  const texto = `Te comparto a mi nutrióloga, Cecy 💛 Con mi código ${d.codigo} tienes 10 % de descuento en tu primera consulta: ${link}`;
  const copiar = async () => { try { await navigator.clipboard.writeText(d.codigo); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch {} };
  return (
    <div className="card amiga" style={{ padding: 14 }}>
      <div className="eyebrow">Invita a una amiga</div>
      <p style={{ margin: "4px 0 8px" }}>Comparte tu código. Tu amiga tiene <b>10 % de descuento</b> en su primera consulta y tú <b>10 %</b> en tu siguiente pago.</p>
      <div className="amiga-cod">
        <b className="num">{d.codigo}</b>
        <button className="btn" onClick={copiar}>{copiado ? "✓ Copiado" : "Copiar"}</button>
      </div>
      <a className="btn primary" style={{ width: "100%", marginTop: 8, textAlign: "center" }} href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener">Compartir por WhatsApp</a>
      {d.pendientes > 0 && <p className="note" style={{ margin: "8px 0 0" }}>🎉 Tienes {d.pendientes === 1 ? "un descuento" : `${d.pendientes} descuentos`} del 10 % para tu siguiente pago. ¡Gracias por recomendarme!</p>}
    </div>
  );
}
