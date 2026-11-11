"use client";
import { useState } from "react";

export default function Copiar({ texto, label = "Copiar link" }: { texto: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="btn" onClick={async () => { try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 2000); } catch {} }}>{ok ? "✓ Copiado" : label}</button>;
}
