import Link from "next/link";

export const metadata = { title: "Aviso de privacidad · Cecy" };

export default function Privacidad() {
  return (
    <div className="legal">
      <Link href="/" className="note">← Volver al inicio</Link>
      <h1>Aviso de privacidad</h1>
      <p className="note">Última actualización: octubre de 2026</p>
      <h2>Quién cuida tus datos</h2>
      <p>Cecilia Rivera, nutrióloga (@cecy.method). Contacto: cecilia.nutdxb@gmail.com.</p>
      <h2>Qué datos guardo</h2>
      <p>Tus datos de contacto, tu historia clínica nutricional, tus análisis de laboratorio, tus mediciones, tu plan de alimentación y tu rutina.</p>
      <h2>Para qué</h2>
      <p>Solo para darte tu consulta, armar tu plan y darte seguimiento. No los vendo ni los comparto con nadie para publicidad.</p>
      <h2>Dónde se guardan</h2>
      <p>En servidores de la Unión Europea, cifrados. Solo tú y yo podemos verlos. Tú ves tu plan, tu rutina y tu avance; tu historia clínica y mis notas solo las veo yo.</p>
      <h2>Tu autorización</h2>
      <p>Te pido tu autorización por escrito en la primera consulta antes de guardar tus datos de salud. Puedes retirarla cuando quieras.</p>
      <h2>Tus derechos</h2>
      <p>Puedes pedirme ver, corregir, descargar o borrar tus datos, u oponerte a que los use, escribiendo a cecilia.nutdxb@gmail.com. Si vives en la Unión Europea aplica el RGPD; si vives en México, la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
    </div>
  );
}
