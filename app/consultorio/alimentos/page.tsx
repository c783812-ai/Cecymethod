import Biblioteca from "./Biblioteca";

export const metadata = { title: "Alimentos · Cecy" };

export default function Alimentos() {
  return (
    <section className="main" style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div className="phead">
        <div>
          <div className="eyebrow">Biblioteca</div>
          <h1>Alimentos</h1>
          <div className="meta">Tu SMAE sin los datos dudosos ni comida chatarra, más alimentos de súper europeo y la lista renal. Los cambios de tus pacientes salen de aquí, siempre dentro del mismo subgrupo.</div>
        </div>
      </div>
      <Biblioteca />
    </section>
  );
}
