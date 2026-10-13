import { CATEGORIAS, POR_META, categoriasDe } from "@/lib/tienda";

const cat = (id: string) => CATEGORIAS.find((c) => c.id === id)!;

/** Ideas de suplementos según las metas de la paciente. Solo la ve Cecy. */
export default function IdeasSuplementos({ metas }: { metas: string[] }) {
  const suyas = categoriasDe(metas);
  const Meta = ({ m }: { m: (typeof POR_META)[number] }) => (
    <div className="idea">
      <h4>{m.meta}</h4>
      {m.nota && <p className="note" style={{ margin: "0 0 6px" }}>{m.nota}</p>}
      <ul>
        {m.cats.map((id) => { const c = cat(id); return (
          <li key={id}><b>{c.emoji} {c.nombre}:</b> {c.sirve} <span className="note">{c.como} {c.cuando}{c.separar ? ` ${c.separar}` : ""}{c.ojo ? ` Ojo: ${c.ojo}` : ""}</span></li>
        ); })}
      </ul>
    </div>
  );
  return (
    <div className="card ideas">
      <h3 style={{ marginTop: 0 }}>💊 Ideas de suplementos según sus metas <span className="note">· solo tú lo ves</span></h3>
      {suyas.length ? suyas.map((m) => <Meta key={m.meta} m={m} />) : <p className="note">Sus metas no coinciden con ninguna idea. Abajo están todas.</p>}
      <details>
        <summary>Ver ideas para todas las metas</summary>
        {POR_META.filter((m) => !suyas.includes(m)).map((m) => <Meta key={m.meta} m={m} />)}
      </details>
      <p className="note" style={{ marginBottom: 0 }}>Lo que pongas en sus suplementos del plan le sale arriba en su pestaña Suplementos, con dónde comprarlo en su país.</p>
    </div>
  );
}
