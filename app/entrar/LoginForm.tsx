"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (error) {
      setState("error");
      setError(
        /not found|signups not allowed/i.test(error.message)
          ? "Ese correo no está registrado. Revisa que sea el mismo que le diste a Cecy, o escríbele por WhatsApp."
          : "No pudimos mandar el enlace. Intenta de nuevo en un minuto.",
      );
      return;
    }
    setState("sent");
  }

  if (state === "sent")
    return (
      <div className="msg ok">
        Te mandamos un enlace a <b>{email}</b>. Ábrelo desde este mismo celular o computadora. Si no llega en unos minutos, revisa tu carpeta de spam.
      </div>
    );

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label htmlFor="email" className="note">Tu correo</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {state === "error" && <div className="msg err">{error}</div>}
      <button className="btn primary lg" disabled={state === "sending"}>{state === "sending" ? "Mandando…" : "Mandarme el enlace"}</button>
    </form>
  );
}
