"use client";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { guardarVideo } from "../actions";

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function VideoRow({ nombre, dias, calentamiento, listo }: { nombre: string; dias: string; calentamiento: boolean; listo: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"idle" | "subiendo" | "ok" | "error">(listo ? "ok" : "idle");
  const [err, setErr] = useState("");

  async function subir(f: File) {
    if (f.size > 50 * 1024 * 1024) { setEstado("error"); setErr("Pesa más de 50 MB. Recórtalo o bájale la calidad."); return; }
    setEstado("subiendo");
    const ext = (f.name.split(".").pop() || "mp4").toLowerCase();
    const path = `${slug(nombre)}-${Date.now()}.${ext}`;
    const { error } = await supabaseBrowser().storage.from("videos").upload(path, f, { contentType: f.type || "video/mp4" });
    if (error) { setEstado("error"); setErr("No se pudo subir. Intenta otra vez."); return; }
    await guardarVideo(nombre, path);
    setEstado("ok");
  }

  return (
    <tr>
      <td>{nombre}{calentamiento && <span className="note"> · calentamiento</span>}</td>
      <td className="note">{dias}</td>
      <td style={{ whiteSpace: "nowrap" }}>
        <input ref={input} type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])} />
        {estado === "ok" && <span className="pill p-ok" style={{ marginRight: 6 }}>Listo</span>}
        {estado === "error" && <span className="pill p-warn" style={{ marginRight: 6 }}>{err}</span>}
        <button className="btn" style={{ padding: "4px 10px", fontSize: 13 }} disabled={estado === "subiendo"} onClick={() => input.current?.click()}>
          {estado === "subiendo" ? "Subiendo…" : estado === "ok" ? "Cambiar" : "Subir video"}
        </button>
      </td>
    </tr>
  );
}
