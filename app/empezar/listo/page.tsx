import Link from "next/link";
import Cuentas from "@/components/Cuentas";

export const metadata = { title: "¡Listo! · Cecy Method" };

export default async function Listo({ searchParams }: { searchParams: Promise<{ n?: string; p?: string; m?: string; r?: string; ya?: string }> }) {
  const { n, p, m, r, ya } = await searchParams;
  const nombre = (n ?? "").split(" ")[0];
  const texto = ya
    ? `Hola Cecy, soy ${n ?? ""}. Quiero empezar con ${p ?? "una consulta"}, pero mi correo ya estaba registrado.`
    : `Hola Cecy, soy ${n ?? ""}. Acabo de registrarme en tu página para ${p ?? "una consulta"}${m ? ` (pago en ${m})` : ""}${r ? ", con el código de una amiga" : ""}. ¿Agendamos? 🙂`;
  const wa = `https://wa.me/971556889063?text=${encodeURIComponent(texto)}`;
  return (
    <div className="auth">
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44 }} aria-hidden="true">💛</div>
        <h1>{ya ? `${nombre ? `${nombre}, ya` : "Ya"} tienes registro` : `¡Gracias${nombre ? `, ${nombre}` : ""}!`}</h1>
        <p style={{ margin: 0 }}>{ya ? "Tu correo ya está con Cecy. Escríbele para seguir." : "Escríbeme por WhatsApp para agendar tu consulta. El mensaje ya va listo."}</p>
        <a className="btn primary lg" href={wa} target="_blank" rel="noopener">Escribir a Cecy por WhatsApp</a>
        {r && !ya && <p className="note" style={{ margin: 0 }}>Usaste el código de una amiga: tienes 10 % de descuento en tu primer pago.</p>}
        {!ya && (
          <>
            <h3 style={{ margin: "8px 0 0" }}>Datos para tu pago</h3>
            <p className="note" style={{ margin: 0 }}>Transfiere y mándame tu comprobante por WhatsApp. En cuanto lo vea, te llega el correo para entrar a tu app.</p>
            <Cuentas que={p} nombre={n} />
          </>
        )}
        <Link className="btn" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
