"use client";
import { useEffect, useState } from "react";

const WA = "971556889063";
const wa = (texto: string) => `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
const diasDesde = (iso?: string | null) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 864e5) : -1);

/** Cuando su plan va por la semana 4 (y aún no tiene próxima consulta), un botón para agendar su seguimiento. */
export function Renovar({ nombre, desde, proxima }: { nombre: string; desde?: string | null; proxima?: string | null }) {
  const dias = diasDesde(desde);
  if (proxima || dias < 23) return null;
  const msg = `Hola Cecy, soy ${nombre.split(" ")[0]} 🙂 Quiero agendar mi consulta de seguimiento. ¿Qué horarios tienes y me pasas los datos para pagar?`;
  return (
    <div className="card renovar">
      <div className="eyebrow">Tu plan ya va por la semana {Math.min(Math.floor(dias / 7) + 1, 8)}</div>
      <h4>📅 Agenda tu seguimiento</h4>
      <p className="note">En la consulta revisamos cómo vas y ajustamos tu plan para que sigas avanzando. Escríbeme y te paso horarios y los datos para pagar por transferencia.</p>
      <a className="btn primary" href={wa(msg)} target="_blank" rel="noopener">Agendar por WhatsApp</a>
    </div>
  );
}

const CARITAS: [number, string][] = [[1, "😞"], [2, "😕"], [3, "😐"], [4, "🙂"], [5, "😍"]];
const FACIL = ["Muy fácil", "Fácil", "Regular", "Difícil"];

/** Encuesta de 1 minuto a las 3 semanas del plan. Las respuestas se las manda a Cecy por WhatsApp; no se guardan en la página. */
export function Encuesta({ nombre, desde, planId }: { nombre: string; desde?: string | null; planId: string | null }) {
  const key = `encuesta-${planId ?? "plan"}`;
  const [estado, setEstado] = useState<"" | "lista" | "luego">("lista");
  const [cal, setCal] = useState<number>();
  const [facil, setFacil] = useState<string>();
  const [gusto, setGusto] = useState("");
  const [cambiar, setCambiar] = useState("");
  const [testimonio, setTestimonio] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      setEstado(v === "lista" ? "lista" : v && Number(v) > Date.now() ? "luego" : "");
    } catch { setEstado(""); }
  }, [key]);
  if (estado || diasDesde(desde) < 21) return null;
  const guardar = (v: string) => { try { localStorage.setItem(key, v); } catch {} };
  const msg = [
    `Hola Cecy, soy ${nombre.split(" ")[0]}. Mi encuesta de cómo voy con mi plan:`,
    cal ? `• ¿Qué tan contenta estoy?: ${CARITAS.find(([n]) => n === cal)?.[1]} (${cal} de 5)` : "",
    facil ? `• ¿Qué tan fácil es seguirlo?: ${facil}` : "",
    gusto.trim() ? `• Lo que más me ha gustado: ${gusto.trim()}` : "",
    cambiar.trim() ? `• Lo que cambiaría: ${cambiar.trim()}` : "",
    testimonio ? "• Puedes usar mi comentario como testimonio, sin mi nombre completo ni foto." : "",
  ].filter(Boolean).join("\n");
  return (
    <div className="card encuesta">
      <div className="eyebrow">1 minuto · Tu opinión</div>
      <h4>💬 ¿Cómo te va con tu plan?</h4>
      <p className="q">¿Qué tan contenta estás?</p>
      <div className="caritas" role="group" aria-label="Qué tan contenta estás">
        {CARITAS.map(([n, e]) => <button key={n} aria-pressed={cal === n} aria-label={`${n} de 5`} onClick={() => setCal(n)}>{e}</button>)}
      </div>
      <p className="q">¿Qué tan fácil se te hace seguirlo?</p>
      <div className="chips" role="group" aria-label="Qué tan fácil">
        {FACIL.map((f) => <button key={f} aria-pressed={facil === f} onClick={() => setFacil(f)}>{f}</button>)}
      </div>
      <p className="q">¿Qué es lo que más te ha gustado?</p>
      <input className="medtxt" maxLength={200} value={gusto} onChange={(e) => setGusto(e.target.value)} placeholder="Por ejemplo: las recetas, los cambios…" />
      <p className="q">¿Qué cambiarías?</p>
      <input className="medtxt" maxLength={200} value={cambiar} onChange={(e) => setCambiar(e.target.value)} placeholder="Algo que se te complique o que no te guste" />
      <label className="check" style={{ marginTop: 10 }}><input type="checkbox" checked={testimonio} onChange={(e) => setTestimonio(e.target.checked)} /> Cecy puede usar mi comentario como testimonio, sin mi nombre completo ni foto (opcional)</label>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <a className={`btn primary ${!cal || !facil ? "disabled" : ""}`} aria-disabled={!cal || !facil} href={cal && facil ? wa(msg) : undefined} target="_blank" rel="noopener"
          onClick={(e) => { if (!cal || !facil) { e.preventDefault(); return; } guardar("lista"); setEstado("lista"); }}>Mandar a Cecy por WhatsApp</a>
        <button className="btn" onClick={() => { guardar(String(Date.now() + 3 * 864e5)); setEstado("luego"); }}>Ahora no</button>
      </div>
    </div>
  );
}
