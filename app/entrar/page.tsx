import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar · Cecy" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="auth">
      <div className="card">
        <div className="eyebrow">Para mis pacientes</div>
        <h1>Entra a tu plan</h1>
        <p className="note" style={{ margin: 0 }}>Escribe el correo que le diste a Cecy. Te mandamos un enlace y un código para entrar, sin contraseña.</p>
        {error && <div className="msg err">Ese enlace ya no sirve. Pide uno nuevo aquí abajo y, en lugar de abrir el enlace, escribe el código que viene en el correo.</div>}
        <LoginForm />
        <Link className="btn" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
