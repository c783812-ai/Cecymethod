"use client";
import { useEffect, useMemo, useState } from "react";
import { buscar, cantidad, cargarAlimentos, icono, nombreSubgrupo, type Alimento, type Sistema } from "@/lib/alimentos";

/** Buscador de la biblioteca para agregar un ingrediente a una comida. */
export default function BuscarAlimento({ sistema, onPick }: { sistema: Sistema; onPick: (a: Alimento) => void }) {
  const [lista, setLista] = useState<Alimento[] | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => { cargarAlimentos(sistema).then(setLista, () => setLista([])); }, [sistema]);
  const res = useMemo(() => (lista && q.trim().length > 1 ? buscar(lista, q).slice(0, 12) : []), [lista, q]);
  return (
    <div className="buscaal">
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={lista ? "Buscar alimento…" : "Cargando alimentos…"} aria-label="Buscar alimento" />
      {res.length > 0 && (
        <div className="buscaal-res">
          {res.map((a) => (
            <button key={a.id} type="button" onClick={() => { onPick(a); setQ(""); }}>
              <span>{icono(a.g)} {a.n}</span>
              <small>{nombreSubgrupo(a.g)} · 1 eq = {cantidad(a, 1)}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
