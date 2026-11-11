"use client";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { guardarPdfGuia } from "../actions";

/** Sube el PDF de la guía a la carpeta privada. */
export default function SubirPdf({ id, listo }: { id: string; listo: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"idle" | "subiendo" | "ok" | "error">(listo ? "ok" : "idle");
  const [err, setErr] = useState("");
  async function subir(f: File) {
    if (f.size > 45 * 1024 * 1024) { setEstado("error"); setErr("Pesa más de 45 MB."); return; }
    setEstado("subiendo");
    const path = `${id}-${Date.now()}.pdf`;
    const { error } = await supabaseBrowser().storage.from("guias").upload(path, f, { contentType: "application/pdf" });
    if (error) { setEstado("error"); setErr("No se pudo subir. Intenta otra vez."); return; }
    await guardarPdfGuia(id, path);
    setEstado("ok");
  }
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])} />
      {estado === "ok" && <span className="pill p-ok">PDF listo</span>}
      {estado === "idle" && <span className="pill p-mid">Falta el PDF</span>}
      {estado === "error" && <span className="pill p-warn">{err}</span>}
      <button type="button" className="btn" disabled={estado === "subiendo"} onClick={() => input.current?.click()}>{estado === "subiendo" ? "Subiendo…" : estado === "ok" ? "Cambiar PDF" : "Subir PDF"}</button>
    </div>
  );
}
