import Link from "next/link";
import { PRESETS, dinero, type Moneda } from "@/lib/pagos";
import { ORIGENES } from "@/lib/mes";
import { solicitar } from "./actions";

export const metadata = { title: "Quiero empezar · Cecy Method", description: "Regístrate para tu consulta o programa con Cecy." };

const PAQUETES = PRESETS.filter((p) => !/gu[ií]a/i.test(p.nombre));
const MON: [Moneda, string][] = [["EUR", "Euros (Europa)"], ["USD", "Dólares (EE. UU., Canadá, otros)"], ["MXN", "Pesos mexicanos"]];

export default async function Empezar({ searchParams }: { searchParams: Promise<{ error?: string; codigo?: string; p?: string }> }) {
  const { error, codigo, p } = await searchParams;
  return (
    <div className="auth empezar">
      <div className="card">
        <div className="eyebrow">Cecy Method</div>
        <h1>Quiero empezar</h1>
        <p className="note" style={{ margin: 0 }}>Déjame tus datos y elige tu consulta. Después verás mis datos para el pago y me escribes por WhatsApp para agendar. Cuando reciba tu pago, te llega un correo para entrar a tu app.</p>
        {error && <div className="msg err">{error}</div>}
        <form action={solicitar} className="empezar-form">
          <label className="field">Tu nombre<input name="nombre" required autoComplete="name" /></label>
          <label className="field">Tu correo (con él entras a tu app)<input name="email" type="email" required autoComplete="email" /></label>
          <label className="field">Tu WhatsApp, con lada<input name="telefono" type="tel" autoComplete="tel" placeholder="+52 55 1234 5678" /></label>
          <label className="field">Ciudad y país donde vives<input name="ciudad" placeholder="Basilea, Suiza" /></label>
          <label className="field">¿Qué te gustaría lograr?<textarea name="objetivo" placeholder="Bajar de peso, más energía, mejorar mis análisis, comer sin culpa…" /></label>
          <fieldset className="field"><legend>Elige</legend>
            {PAQUETES.map((x, i) => (
              <label key={x.nombre} className="check opcion">
                <input type="radio" name="paquete" value={x.nombre} defaultChecked={p ? p === x.nombre : i === 1} required />
                <span><b>{x.nombre}</b><br /><span className="note">{dinero(x.precio.EUR, "EUR")} · {dinero(x.precio.USD, "USD")} · {dinero(x.precio.MXN, "MXN")}</span></span>
              </label>
            ))}
          </fieldset>
          <label className="field">¿En qué moneda pagas?<select name="moneda" defaultValue="EUR">{MON.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="field">¿Cómo me conociste?<select name="origen" defaultValue=""><option value="">Elige una opción</option>{ORIGENES.filter(([k]) => k !== "web").map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="field">Código de una amiga (si tienes)<input name="codigo" defaultValue={codigo ?? ""} placeholder="ANA27" autoCapitalize="characters" /></label>
          <input name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="trampa" />
          <label className="check"><input type="checkbox" name="acepto" required /><span>Acepto el <Link href="/privacidad" target="_blank">aviso de privacidad</Link>. Aquí solo guardo tus datos de contacto y lo que quieres lograr; tu historia clínica la vemos en consulta.</span></label>
          <button className="btn primary lg">Enviar</button>
        </form>
        <Link className="btn" href="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
