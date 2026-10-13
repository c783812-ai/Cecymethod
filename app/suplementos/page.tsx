import Link from "next/link";
import Suplementos from "../mi-plan/Suplementos";

export const metadata = { title: "Suplementos recomendados · Cecy", description: "Para qué sirve cada suplemento, cómo tomarlo y dónde comprarlo en línea en tu país." };

/** Página pública de suplementos (Amazon pide que los links de afiliada estén en una página abierta). */
export default function Page() {
  return (
    <div className="patient">
      <div style={{ width: "100%", maxWidth: 430 }}>
      <div className="phone">
        <div className="ph-head">
          <div className="eyebrow">Cecy · Nutrióloga · @cecy.method</div>
          <h1>Mis <mark>suplementos</mark> recomendados</h1>
          <p className="note" style={{ margin: "4px 0 0" }}>Para qué sirve cada uno, cómo tomarlo y dónde comprarlo en línea en tu país. <Link href="/">Conoce mi consulta</Link></p>
        </div>
        <div className="ph-body" style={{ paddingBottom: 24 }}>
          <Suplementos recomendados={[]} />
        </div>
      </div>
      </div>
    </div>
  );
}
