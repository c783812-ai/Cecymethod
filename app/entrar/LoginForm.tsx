"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { reenviarAcceso } from "../consultorio/actions";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "codigo" | "error">("idle");
  const [error, setError] = useState("");
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [errCodigo, setErrCodigo] = useState("");

  // El código del correo sirve en cualquier navegador y dentro de la app instalada, sin abrir el enlace.
  async function entrarConCodigo(e: React.FormEvent) {
    e.preventDefault();
    const token = codigo.replace(/\D/g, "");
    if (token.length < 6) { setErrCodigo("Escribe los números del código."); return; }
    setVerificando(true);
    setErrCodigo("");
    const sb = supabaseBrowser();
    let { error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    if (error) ({ error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: "invite" })); // si era su primera invitación
    if (error) {
      setVerificando(false);
      setErrCodigo("Ese código no funciona o ya caducó. Revisa que sea el del correo más reciente, o pide uno nuevo.");
      return;
    }
    window.location.href = "/auth/listo";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    // Si nunca abrió su invitación, Supabase dice que no existe: se la mandamos otra vez.
    if (error && /not found|signups not allowed/i.test(error.message) && (await reenviarAcceso(email).catch(() => false))) {
      setState("sent");
      return;
    }
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

  if (state === "sent" || state === "codigo")
    return (
      <>
        {state === "codigo" ? (
          <label className="note" style={{ display: "flex", flexDirection: "column", gap: 6 }}>Tu correo
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        ) : <div className="msg ok">
          Te mandamos un correo a <b>{email}</b> con un enlace y un código. Si el enlace se abre en otro navegador, mejor escribe aquí el código. Si no llega en unos minutos, revisa tu carpeta de spam.
        </div>}
        <form onSubmit={entrarConCodigo} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label htmlFor="codigo" className="note">Código del correo</label>
          <input id="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={10} placeholder="123456" value={codigo} onChange={(e) => setCodigo(e.target.value)} style={{ fontSize: 22, letterSpacing: ".25em", textAlign: "center" }} />
          {errCodigo && <div className="msg err">{errCodigo}</div>}
          <button className="btn primary lg" disabled={verificando}>{verificando ? "Entrando…" : "Entrar con el código"}</button>
          <button type="button" className="linklike" onClick={() => { setState("idle"); setCodigo(""); setErrCodigo(""); }}>Pedir otro correo</button>
        </form>
      </>
    );

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label htmlFor="email" className="note">Tu correo</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {state === "error" && <div className="msg err">{error}</div>}
      <button className="btn primary lg" disabled={state === "sending"}>{state === "sending" ? "Mandando…" : "Mandarme el enlace y el código"}</button>
      <button type="button" className="linklike" onClick={() => setState("codigo")}>Ya tengo un código</button>
    </form>
  );
}
