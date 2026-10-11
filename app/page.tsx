import Image from "next/image";
import Link from "next/link";

const WHATSAPP = "+971 55 688 9063";
const WA_LINK = "https://wa.me/971556889063?text=" + encodeURIComponent("Hola Cecy, quiero agendar una consulta 🙂");
const CORREO = "cecilia.nutdxb@gmail.com";

const pasos = [
  ["Tus análisis", "Te mando la lista de estudios al agendar. Con biometría, ferritina y vitamina D ya podemos empezar.", "t-pink"],
  ["Primera consulta", "Videollamada de 60 minutos: tu salud, tu ciclo, cómo comes y qué dicen tus análisis.", "t-blue"],
  ["Tu plan, en 2 o 3 días", "Menú con productos de tu súper, porciones y lista de equivalentes, todo en tu página.", "t-yellow"],
  ["Seguimiento", "Revisamos cada 4 semanas y ajustamos. Entre consultas, me escribes por WhatsApp.", "t-green"],
];
const nutrientes = [
  ["🩸 Hierro", "Se pierde con la regla y baja cuando comemos menos carne roja y tomamos mucho café."],
  ["☀️ Vitamina D", "Aquí hay menos sol, los inviernos son largos y la piel morena necesita más."],
  ["🧠 Vitamina B12", "Baja con poca proteína animal, con metformina o con anticonceptivos."],
  ["🥬 Folato", "Falta cuando comemos pocas hojas verdes y leguminosas."],
  ["🧂 Yodo", "Falta porque en Alemania y Suiza no toda la sal lo trae."],
  ["🦴 Calcio", "Baja cuando dejamos los lácteos y no los reemplazamos."],
  ["🐟 Omega-3", "Falta cuando comemos poco pescado azul en la semana."],
  ["🌾 Fibra", "Baja cuando comemos más pan blanco y menos frijoles y fruta."],
];
const precios: { titulo: string; etiqueta: string; items: string[]; destacado: boolean; precio: [string, string, string]; nota?: string }[] = [
  {
    titulo: "Consulta nutricional online personalizada",
    etiqueta: "Consulta 100% en línea",
    items: [
      "Historia clínica completa",
      "Evaluación personalizada de hábitos, alimentación y estilo de vida",
      "Definición y planificación de objetivos individuales",
      "Plan nutricional adaptado a tus necesidades y preferencias",
      "Acceso a la app exclusiva para pacientes, donde ves tu plan",
      "Lista de compras organizada",
      "Recomendaciones personalizadas",
      "Seguimiento y resolución de dudas vía WhatsApp",
    ],
    destacado: false,
    precio: ["€130", "$150 USD", "$2,570 MXN"],
  },
  {
    titulo: "Programa de 3 meses",
    etiqueta: "Lo que más recomiendo",
    items: ["Todo lo de la consulta nutricional personalizada", "3 meses de acompañamiento", "Tu plan ajustado en cada seguimiento", "Visualización de tu plan desde la app", "Seguimiento y resolución de dudas vía WhatsApp"],
    destacado: true,
    precio: ["€300", "$350 USD", "$5,930 MXN"],
  },
  {
    titulo: "Guía de glúteos",
    etiqueta: "Rutina en la app",
    items: [
      "Acceso completo desde la app para pacientes",
      "Rutina estructurada paso a paso",
      "Videos demostrativos de cada ejercicio",
      "Series, repeticiones y tiempos de descanso detallados",
      "Progresión diseñada para desarrollar glúteos de forma efectiva",
      "Corrección de técnica con videos que tú me mandas",
      "Acompañamiento y dudas por WhatsApp",
    ],
    destacado: false,
    precio: ["€20", "$23 USD", "$440 MXN"],
    nota: "Pacientes activas: €10 · $12 USD · ≈ $220 MXN",
  },
];
const faq = [
  ["¿Necesito análisis de sangre para empezar?", "Sí, mi trabajo parte de ahí. Al agendar te mando la lista. Si no consigues todos, con biometría, ferritina y vitamina D ya podemos empezar."],
  ["¿Atiendes en cualquier país?", "Sí, todo es en línea. Agendamos en tu zona horaria y el menú se arma con lo que hay en tu súper."],
  ["¿Cómo pago?", "Por transferencia. Tengo cuenta en México y en Europa, así pagas en pesos o en euros. Te mando los datos al agendar."],
  ["¿Cuándo recibo mi plan?", "De 2 a 3 días después de tu primera consulta, en tu página y con una nota de voz para empezar."],
  ["¿Quién ve mis datos?", "Tu historia clínica y tus análisis los guardo yo, fuera de la página. En tu página solo están tu plan y tu rutina, y solo tú entras con tu correo."],
];

export default function Home() {
  return (
    <div className="land">
      <nav className="lnav" aria-label="Secciones">
        <a href="#como">Cómo trabajo</a>
        <a href="#precios">Precios</a>
        <a href="#preguntas">Preguntas</a>
        <a href="#contacto">Contacto</a>
        <Link href="/entrar">Entrar</Link>
      </nav>

      <section className="hero" style={{ paddingTop: 8 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Cecilia Rivera · Nutrióloga · @cecy.method</div>
          <h1>
            Nutrición basada en tus <mark>análisis de sangre</mark>, para latinas lejos de casa
          </h1>
          <p className="lead">Encuentro lo que te falta y lo corregimos con tu alimentación, con la comida de tu súper y sin dejar lo que te gusta.</p>
          <div className="cta">
            <a className="btn primary lg" href={WA_LINK} target="_blank" rel="noopener">Agenda tu consulta</a>
            <Link className="btn lg" href="/entrar">Ya soy paciente · Entrar</Link>
          </div>
        </div>
        <div className="blob">
          <span className="b" style={{ width: "30%", height: "24%", left: "2%", bottom: "4%", background: "var(--yellow)" }} aria-hidden="true" />
          <span className="b" style={{ width: "34%", height: "27%", right: 0, top: "2%", background: "var(--blue)" }} aria-hidden="true" />
          <div className="photo">
            <Image src="/cecilia.jpg" alt="Cecilia Rivera, nutrióloga" width={760} height={927} priority />
          </div>
          <div className="card" style={{ left: 0, top: "56%", width: "44%", padding: 12 }} aria-hidden="true">
            <div className="eyebrow">Ferritina</div>
            <div className="num" style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600 }}>14 → 32 µg/L</div>
            <span className="pill p-ok">En rango</span>
          </div>
          <div className="card" style={{ right: 0, bottom: "3%", width: "48%", padding: 12 }} aria-hidden="true">
            <div className="eyebrow">Comida · 14:00</div>
            <b style={{ fontFamily: "var(--display)" }}>Bowl de lentejas con pollo</b>
            <div className="note">con limón, para absorber mejor el hierro</div>
          </div>
        </div>
      </section>

      <section className="sec" id="como">
        <h2>Cómo trabajamos</h2>
        <p>Todo en línea, desde la ciudad donde vivas.</p>
        <ol className="steps">
          {pasos.map(([t, d, c], i) => (
            <li key={t} className={c}>
              <span className="k">{i + 1}</span>
              <h4>{t}</h4>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <h2>Lo que más nos falta lejos de casa</h2>
        <p>Lo veo todos los días en mis pacientes. Lo medimos, lo trabajamos con comida y lo volvemos a medir.</p>
        <div className="nutr">
          {nutrientes.map(([t, d]) => (
            <div key={t}>
              <b>{t}</b>
              {d}
            </div>
          ))}
        </div>
      </section>

      <section className="about">
        <div className="ph" style={{ overflow: "hidden" }}>
          <Image src="/cecilia.jpg" alt="" width={240} height={293} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(2.3)", transformOrigin: "50% 22%" }} />
        </div>
        <div>
          <q>Nutrióloga. Trabajo con tus análisis de sangre para encontrar lo que te falta y corregirlo con tu alimentación.</q>
          <p className="note" style={{ margin: "10px 0 0" }}>No diagnostico ni receto: lo que necesite tratamiento lo ve tu médico, y yo trabajo tu alimentación.</p>
        </div>
      </section>

      <section className="sec" id="precios">
        <h2>Consultas y precios</h2>
        <p>Todo en línea. Pago por transferencia a cuenta en México o en Europa. Precios claros: no se emiten facturas.</p>
        <div className="prices">
          {precios.map((p) => (
            <div key={p.titulo} className={`price ${p.destacado ? "star" : ""}`}>
              {p.destacado ? <span className="pill p-info" style={{ alignSelf: "flex-start" }}>{p.etiqueta}</span> : <span className="eyebrow">{p.etiqueta}</span>}
              <h4>{p.titulo}</h4>
              <div className="amt num">{p.precio[0]} <small>EUR</small></div>
              <div className="note num" style={{ marginTop: -8 }}>{p.precio[1]} · {p.precio[2]}</div>
              {p.nota && <span className="pill p-ok" style={{ alignSelf: "flex-start", whiteSpace: "normal" }}>{p.nota}</span>}
              <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <a className={`btn ${p.destacado ? "primary" : ""}`} href={WA_LINK} target="_blank" rel="noopener">Agendar</a>
            </div>
          ))}
        </div>
      </section>

      <section className="sec" id="preguntas">
        <h2>Preguntas frecuentes</h2>
        <div className="faq">
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="sec" id="contacto">
        <h2>Contacto</h2>
        <p>Escríbeme y te respondo con horarios disponibles en tu zona horaria.</p>
        <div className="contact">
          <a className="t-green" href={WA_LINK} target="_blank" rel="noopener" style={{ textDecoration: "none", borderRadius: 18, padding: 18 }}>
            <b>WhatsApp</b><span className="v num">{WHATSAPP}</span>
          </a>
          <a className="t-pink" href="https://instagram.com/cecy.method" target="_blank" rel="noopener" style={{ textDecoration: "none", borderRadius: 18, padding: 18 }}>
            <b>Instagram</b><span className="v">@cecy.method</span>
          </a>
          <a className="t-blue" href={`mailto:${CORREO}`} style={{ textDecoration: "none", borderRadius: 18, padding: 18 }}>
            <b>Correo</b><span className="v" style={{ wordBreak: "break-all" }}>{CORREO}</span>
          </a>
        </div>
      </section>

      <footer className="foot">
        <span>Lejos de casa, pero cuidándote ♥ · Cecilia Rivera · @cecy.method</span>
        <Link href="/privacidad">Aviso de privacidad</Link>
      </footer>
    </div>
  );
}
