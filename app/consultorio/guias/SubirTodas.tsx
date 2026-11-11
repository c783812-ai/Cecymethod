"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { guardarPdfGuia, mostrarGuia } from "../actions";

// Qué guía es cada archivo, por palabras de su nombre (Guia_Meal_prep_en_1_hora.pdf -> meal-prep).
const CLAVES: [RegExp, string][] = [
  [/desayun/i, "desayunos-proteina"], [/meal/i, "meal-prep"], [/air/i, "air-fryer"], [/cena/i, "cenas-15"],
  [/sabor|mexican/i, "sabor-a-casa"], [/lunch/i, "lunch-box"], [/antojo|colacion/i, "antojos"],
  [/dinero|economic/i, "poco-dinero"], [/insulina|sop/i, "ri-sop"], [/fuera|viaje/i, "comer-fuera"],
];

/** Sube varios PDF de una vez: reconoce cada guía por el nombre del archivo y la deja visible en la página. */
export default function SubirTodas({ ids }: { ids: string[] }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [trabajando, setTrabajando] = useState(false);
  async function subir(files: FileList) {
    setTrabajando(true);
    const ok: string[] = [], sinGuia: string[] = [];
    for (const f of Array.from(files)) {
      const id = CLAVES.find(([r]) => r.test(f.name.normalize("NFD").replace(/[̀-ͯ]/g, "")))?.[1];
      if (!id || !ids.includes(id)) { sinGuia.push(f.name); continue; }
      setMsg(`Subiendo ${ok.length + 1} de ${files.length}…`);
      const path = `${id}-${Date.now()}.pdf`;
      const { error } = await supabaseBrowser().storage.from("guias").upload(path, f, { contentType: "application/pdf" });
      if (error) { sinGuia.push(f.name); continue; }
      await guardarPdfGuia(id, path);
      await mostrarGuia(id);
      ok.push(id);
    }
    setTrabajando(false);
    setMsg(`✓ ${ok.length} ${ok.length === 1 ? "guía lista y visible" : "guías listas y visibles"} en tu página.${sinGuia.length ? ` No reconocí: ${sinGuia.join(", ")}. Súbela en su guía con “Subir PDF”.` : ""}`);
    router.refresh();
  }
  return (
    <div className="card" style={{ border: "2px solid var(--accent)" }}>
      <h3 style={{ marginTop: 0 }}>Subir todas las guías de una vez</h3>
      <p className="note" style={{ margin: "0 0 8px" }}>Elige los PDF que guardaste (puedes seleccionar los 10 juntos). Cada uno se acomoda en su guía y queda visible en tu página.</p>
      <input ref={input} type="file" accept="application/pdf" multiple hidden onChange={(e) => e.target.files?.length && subir(e.target.files)} />
      <button type="button" className="btn primary" disabled={trabajando} onClick={() => input.current?.click()}>{trabajando ? "Subiendo…" : "Subir todas"}</button>
      {msg && <p className="note" style={{ margin: "8px 0 0" }}>{msg}</p>}
    </div>
  );
}
