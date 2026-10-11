import { GRUPOS, TIEMPOS, type Color, type Lab, type Measurement, type Plan } from "@/lib/types";

export const tint = (c: Color | string) => ({ rosa: "t-pink", azul: "t-blue", amarillo: "t-yellow", verde: "t-green", lila: "t-lilac" })[c as Color] ?? "t-blue";
export const pillFor = (l: string) => ({ Baja: "p-warn", Alta: "p-warn", Límite: "p-mid", "En rango": "p-ok" })[l] ?? "p-info";

export function fechaCorta(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export function LabsTable({ labs }: { labs: Lab[] }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr><th>Marcador</th><th>Resultado</th><th>Referencia del laboratorio</th><th>Lectura</th></tr>
        </thead>
        <tbody>
          {labs.map((l, i) => (
            <tr key={i}>
              <td>{l.marcador}</td>
              <td className="num"><b>{l.resultado}</b> {l.unidad}</td>
              <td className="num">{l.referencia}</td>
              <td>{l.lectura && <span className={`pill ${pillFor(l.lectura)}`}>{l.lectura}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PorcionesTable({ plan }: { plan: Plan }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>Grupo</th>
            {TIEMPOS.map((t, i) => (
              <th key={t[0]} className="c">{t[0]}<br /><span style={{ letterSpacing: 0 }}>{plan.horarios?.[i] ?? t[1]}</span></th>
            ))}
            <th className="c">Total</th>
          </tr>
        </thead>
        <tbody>
          {GRUPOS.map((g) => {
            const v = plan.porciones?.[g] ?? [];
            return (
              <tr key={g}>
                <td>{g}</td>
                {TIEMPOS.map((_, i) => <td key={i} className="c num">{v[i] ?? "·"}</td>)}
                <td className="c num"><b>{v.reduce<number>((s, n) => s + (n ?? 0), 0)}</b></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const MED_ROWS: [keyof Measurement, string, number][] = [
  ["peso", "Peso (kg)", -1],
  ["cintura", "Cintura (cm)", -1],
  ["cadera", "Cadera (cm)", -1],
  ["musculo", "Músculo esquelético (kg)", 1],
  ["grasa", "Grasa corporal (%)", -1],
  ["visceral", "Grasa visceral", -1],
];

export function MedTable({ med }: { med: Measurement[] }) {
  const b = med[med.length - 1];
  const a = med.length > 1 ? med[med.length - 2] : null;
  if (!b) return null;
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>Medida</th>
            {a && <th className="c">{fechaCorta(a.fecha)}</th>}
            <th className="c">{fechaCorta(b.fecha)}</th>
            {a && <th className="c">Cambio</th>}
          </tr>
        </thead>
        <tbody>
          {MED_ROWS.map(([k, label, good]) => {
            const bv = b[k] as number | null;
            const av = a ? (a[k] as number | null) : null;
            const d = av != null && bv != null ? +(Number(bv) - Number(av)).toFixed(1) : null;
            const cls = d == null || d === 0 ? "p-info" : Math.sign(d) === good ? "p-ok" : "p-warn";
            return (
              <tr key={k}>
                <td>{label}</td>
                {a && <td className="c num">{av ?? "—"}</td>}
                <td className="c num"><b>{bv ?? "—"}</b></td>
                {a && <td className="c">{d != null && <span className={`pill ${cls} num`}>{d > 0 ? "+" : ""}{d}</span>}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TrendChart({ med }: { med: Measurement[] }) {
  const M = med.filter((r) => r.peso != null && r.musculo != null && r.grasa != null);
  if (M.length < 2) return null;
  const series: [keyof Measurement, string, string, [number, number]][] = [
    ["peso", "Peso (kg)", "var(--accent)", [0, 0.3]],
    ["musculo", "Músculo (kg)", "var(--ok)", [0.38, 0.62]],
    ["grasa", "Grasa (%)", "var(--warn)", [0.7, 1]],
  ];
  const W = 440, H = 230, pl = 44, pr = 50, pt = 16, pb = 30;
  const x = (i: number) => pl + (i * (W - pl - pr)) / (M.length - 1);
  return (
    <>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Tendencia de peso, músculo y grasa">
        {series.map(([k, , c, band]) => {
          const v = M.map((r) => Number(r[k]));
          const mn = Math.min(...v), mx = Math.max(...v), rng = mx - mn || 1;
          const y = (val: number) => pt + (band[0] + (1 - (val - mn) / rng) * (band[1] - band[0])) * (H - pt - pb);
          return (
            <g key={k}>
              <polyline points={v.map((val, i) => `${x(i)},${y(val)}`).join(" ")} fill="none" stroke={c} strokeWidth={2.5} strokeLinejoin="round" />
              {v.map((val, i) => <circle key={i} cx={x(i)} cy={y(val)} r={i === v.length - 1 ? 5 : 3.5} fill={c} />)}
              <text x={x(v.length - 1) + 10} y={y(v[v.length - 1]) + 4}>{v[v.length - 1]}</text>
              <text x={x(0) - 8} y={y(v[0]) + 4} textAnchor="end">{v[0]}</text>
            </g>
          );
        })}
        {M.map((r, i) => (
          <text key={r.id} x={x(i)} y={H - 8} textAnchor="middle">{fechaCorta(r.fecha).replace(/ de \d{4}|\s\d{4}/, "")}</text>
        ))}
      </svg>
      <div className="legend">
        {series.map((s) => <span key={s[0]}><i style={{ background: s[2] }} />{s[1]}</span>)}
      </div>
    </>
  );
}
