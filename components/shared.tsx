import { GRUPOS, TIEMPOS, type Color, type Plan } from "@/lib/types";

export const tint = (c: Color | string) => ({ rosa: "t-pink", azul: "t-blue", amarillo: "t-yellow", verde: "t-green", lila: "t-lilac" })[c as Color] ?? "t-blue";
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
