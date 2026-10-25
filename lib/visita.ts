/** "Hoy", "Ayer", "Hace 3 días"… para la última vez que la paciente abrió la app. */
export function haceCuanto(iso: string | null | undefined, ahora = new Date()): string {
  if (!iso) return "Nunca";
  const d = new Date(iso);
  const dia = (x: Date) => Math.floor((x.getTime() - x.getTimezoneOffset() * 60000) / 86400000);
  const n = dia(ahora) - dia(d);
  if (n <= 0) return `Hoy, ${d.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}`;
  if (n === 1) return "Ayer";
  if (n < 30) return `Hace ${n} días`;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/** Días sin abrir la app; null si nunca la abrió. */
export function diasSinAbrir(iso: string | null | undefined, ahora = new Date()): number | null {
  return iso ? Math.floor((ahora.getTime() - new Date(iso).getTime()) / 86400000) : null;
}
