"use client";
import { useState } from "react";

export default function Copiar({ texto }: { texto: string }) {
  const [listo, setListo] = useState(false);
  return (
    <button className="btn primary" onClick={async () => { try { await navigator.clipboard.writeText(texto); setListo(true); setTimeout(() => setListo(false), 2000); } catch {} }}>
      {listo ? "✓ Copiado" : "Copiar mensaje"}
    </button>
  );
}
