import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import type { Imovel } from "@/types/calibrador";

interface Pam2ChartProps {
  comparaveis: Imovel[];
  mediana: number;
  piso: number;
  teto: number;
  scoreMinimo: number;
}

export function Pam2Chart({ comparaveis, mediana, piso, teto, scoreMinimo }: Pam2ChartProps) {
  const data = comparaveis
    .filter((c) => c.pam2 != null)
    .map((c) => ({
      id: c.id.replace("comp-", ""),
      pam2: Math.round(c.pam2!),
      outlier: c.outlier,
      scoreBaixo: (c.score || 0) < scoreMinimo,
    }));

  const getColor = (entry: typeof data[0]) => {
    if (entry.outlier) return "hsl(0, 65%, 50%)";
    if (entry.scoreBaixo) return "hsl(35, 100%, 55%)";
    return "hsl(160, 100%, 45%)";
  };

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-medium text-foreground mb-3">PAM² por Comparável</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 35%, 25%)" />
          <XAxis
            dataKey="id"
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(215, 35%, 25%)" }}
          />
          <YAxis
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(215, 35%, 25%)" }}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(215, 55%, 15%)",
              border: "1px solid hsl(215, 35%, 25%)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(210, 20%, 95%)" }}
            formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "PAM²"]}
          />
          {mediana > 0 && (
            <ReferenceLine
              y={Math.round(mediana)}
              stroke="hsl(185, 100%, 50%)"
              strokeDasharray="5 3"
              label={{ value: "Mediana", fill: "hsl(185, 100%, 50%)", fontSize: 10, position: "right" }}
            />
          )}
          {piso > 0 && (
            <ReferenceLine
              y={Math.round(piso)}
              stroke="hsl(0, 65%, 50%)"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{ value: "Piso", fill: "hsl(0, 65%, 50%)", fontSize: 10, position: "right" }}
            />
          )}
          {teto > 0 && (
            <ReferenceLine
              y={Math.round(teto)}
              stroke="hsl(0, 65%, 50%)"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{ value: "Teto", fill: "hsl(0, 65%, 50%)", fontSize: 10, position: "right" }}
            />
          )}
          <Bar dataKey="pam2" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getColor(entry)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
