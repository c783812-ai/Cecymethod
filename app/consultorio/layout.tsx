import Link from "next/link";
import { requireNutri } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ConsultorioLayout({ children }: { children: React.ReactNode }) {
  await requireNutri();
  return (
    <div className="app-shell">
      <header className="top">
        <Link className="brand" href="/consultorio"><b>Cecilia Rivera</b><span>Mi consultorio</span></Link>
        <nav>
          <Link href="/consultorio">Pacientes</Link>
          <Link href="/consultorio/domingo">Domingo</Link>
          <Link href="/consultorio/alimentos">Alimentos</Link>
          <Link href="/consultorio/videos">Videos</Link>
          <Link href="/" target="_blank">Mi página</Link>
          <form action="/salir" method="post"><button className="btn" style={{ padding: "6px 12px" }}>Salir</button></form>
        </nav>
      </header>
      {children}
    </div>
  );
}
