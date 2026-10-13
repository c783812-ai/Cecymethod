"use client";
import { useEffect, useMemo, useState } from "react";
import { BANDERA, PAIS } from "@/lib/alimentos";
import { CATEGORIAS, MERCADOS, MERCADO_DE, PARA, PRODUCTOS, enMercado, linkAmazon, linkML, type Categoria } from "@/lib/tienda";
import type { Suplemento } from "@/lib/types";

/** Suplementos por categoría, con para qué sirven, cómo tomarlos y dónde comprarlos en su país. */
export default function Suplementos({ recomendados }: { recomendados: Suplemento[] }) {
  const [pais, setPais] = useState("");
  const [para, setPara] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);
  useEffect(() => { try { setPais(localStorage.getItem("pais") || ""); } catch {} }, []);
  const elegirPais = (c: string) => { setPais(c); try { localStorage.setItem("pais", c); } catch {} };

  const suyas = useMemo(() => CATEGORIAS.filter((c) => recomendados.some((s) => c.r.test(s.que))), [recomendados]);
  const lista = CATEGORIAS.filter((c) => !para || c.para.includes(para));
  const m = MERCADO_DE[pais];

  return (
    <>
      <div className="card tienda-pais">
        <div className="eyebrow">¿Dónde vives?</div>
        <div className="chips" role="group" aria-label="País">
          {Object.keys(BANDERA).map((c) => <button key={c} aria-pressed={pais === c} onClick={() => elegirPais(c)}>{BANDERA[c]} {PAIS[c]}</button>)}
        </div>
        {m && <p className="note" style={{ margin: "6px 0 0" }}>Te mostramos {MERCADOS[m].nombre}{pais === "MX" ? " y Mercado Libre" : ""}{(pais === "CH" || pais === "EU") ? ", que envía a tu país" : ""}.</p>}
      </div>

      {suyas.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 4 }}>Los que te recomendó Cecy</div>
          {suyas.map((c) => <Tarjeta key={c.id} c={c} pais={pais} abierta={abierta === c.id} onAbrir={() => setAbierta(abierta === c.id ? null : c.id)} dosis={recomendados.find((s) => c.r.test(s.que))} />)}
        </>
      )}

      <div className="eyebrow" style={{ marginTop: 4 }}>Todos, según para qué te sirven</div>
      <div className="chips scroll" role="group" aria-label="Para qué">
        <button aria-pressed={!para} onClick={() => setPara("")}>Todos</button>
        {PARA.map((p) => <button key={p} aria-pressed={para === p} onClick={() => setPara(para === p ? "" : p)}>{p}</button>)}
      </div>
      {lista.map((c) => <Tarjeta key={c.id} c={c} pais={pais} abierta={abierta === c.id} onAbrir={() => setAbierta(abierta === c.id ? null : c.id)} />)}

      <p className="note tienda-aviso">
        Antes de empezar un suplemento nuevo, pregúntale a Cecy, sobre todo si tomas medicamentos, estás embarazada o tienes alguna enfermedad.
        Algunos links son de afiliada: si compras con ellos, Cecy gana una pequeña comisión y a ti no te cuesta más.
        Como Afiliado de Amazon, percibo dinero con las compras elegibles.{["DE", "CH", "EU"].includes(pais) && " Als Amazon-Partner verdiene ich an qualifizierten Verkäufen."}
      </p>
    </>
  );
}

function Tarjeta({ c, pais, abierta, onAbrir, dosis }: { c: Categoria; pais: string; abierta: boolean; onAbrir: () => void; dosis?: Suplemento }) {
  const m = MERCADO_DE[pais];
  const prods = m ? PRODUCTOS.filter((p) => p.cat === c.id && (enMercado(p, m) || (pais === "MX" && !!p.ml))).sort((a, b) => (a.nota ? -1 : 0) - (b.nota ? -1 : 0) || (a.nivel === "premium" ? 1 : 0) - (b.nivel === "premium" ? 1 : 0)) : [];
  return (
    <div className={`card supcat ${abierta ? "abierta" : ""}`}>
      <button className="supcat-top" onClick={onAbrir} aria-expanded={abierta}>
        <span className="supcat-ic" aria-hidden="true">{c.emoji}</span>
        <span className="supcat-t"><b>{c.nombre}</b><span>{c.para.join(" · ")}</span></span>
        <span className="supcat-fl" aria-hidden="true">{abierta ? "−" : "+"}</span>
      </button>
      {abierta && (
        <div className="supcat-body">
          <p>{c.sirve}</p>
          {dosis && <p className="tuya"><b>Lo que te indicó Cecy:</b> {[dosis.cuanto, dosis.cuando].filter(Boolean).join(" · ")}</p>}
          <dl>
            <dt>Cuánto</dt><dd>La dosis de la etiqueta viene abajo en cada producto. Si Cecy te indicó otra, sigue la de Cecy.</dd>
            <dt>Cuándo</dt><dd>{c.cuando}</dd>
            {c.separar && <><dt>No juntar</dt><dd>{c.separar}</dd></>}
            {c.ojo && <><dt>Ojo</dt><dd>{c.ojo}</dd></>}
          </dl>
          {!m ? <p className="note">Elige tu país arriba para ver dónde comprarlo.</p> : prods.length === 0 ? <p className="note">Pronto agregaremos opciones para tu país. Mientras, pregúntale a Cecy.</p> : (
            <div className="prods">
              {prods.map((p) => (
                <div key={p.n + p.marca} className="prod">
                  <div><b>{p.marca}</b> · {p.n}{p.pres && <span className="note"> · {p.pres}</span>}{p.nota && <span className="nivel cecy">{p.nota}</span>}{p.nivel && <span className={`nivel ${p.nivel}`}>{p.nivel === "accesible" ? "Accesible" : "Premium"}</span>}</div>
                  <div className="etq">{p.dosis ? <><b>Dice la etiqueta:</b> {p.dosis}</> : "Revisa la dosis en la etiqueta del producto."}</div>
                  <div className="prod-btns">
                    {enMercado(p, m) && <a className="btn amz" href={linkAmazon(p, m)} target="_blank" rel="sponsored noopener">Amazon</a>}
                    {pais === "MX" && p.ml && <a className="btn ml" href={linkML(p)} target="_blank" rel="sponsored noopener">Mercado Libre</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
