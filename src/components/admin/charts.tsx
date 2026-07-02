// Leichtgewichtige SVG-Charts (server-renderbar, keine externe Lib).

export function AreaChart({
  values, labels, height = 220, stroke = "#5d8a34", fill = "rgba(93,138,52,0.14)",
}: {
  values: number[]; labels: string[]; height?: number; stroke?: string; fill?: string;
}) {
  const w = 640, h = height, pad = 28;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Umsatzverlauf">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)} stroke="#eee" strokeWidth={1} />
      ))}
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#fff" stroke={stroke} strokeWidth={2} />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={pad + i * stepX} y={h - 6} textAnchor="middle" className="fill-neutral-400" fontSize={11}>{l}</text>
      ))}
    </svg>
  );
}

export function BarChart({
  groups, height = 220, colors = ["#5d8a34", "#c8d9b4"], legend,
}: {
  groups: { label: string; values: number[] }[];
  height?: number;
  colors?: string[];
  legend?: string[];
}) {
  const w = 640, h = height, pad = 28;
  const max = Math.max(...groups.flatMap((g) => g.values), 1);
  const gW = (w - pad * 2) / groups.length;
  const nBars = groups[0]?.values.length || 1;
  const barW = Math.min(18, (gW * 0.6) / nBars);
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Balkendiagramm">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)} stroke="#eee" strokeWidth={1} />
        ))}
        {groups.map((g, gi) => {
          const cx = pad + gi * gW + gW / 2;
          return (
            <g key={g.label}>
              {g.values.map((v, bi) => {
                const bh = (v / max) * (h - pad * 2);
                const x = cx - (nBars * barW) / 2 + bi * barW + bi * 2;
                return <rect key={bi} x={x} y={h - pad - bh} width={barW} height={bh} rx={3} fill={colors[bi % colors.length]} />;
              })}
              <text x={cx} y={h - 6} textAnchor="middle" className="fill-neutral-400" fontSize={11}>{g.label}</text>
            </g>
          );
        })}
      </svg>
      {legend && (
        <div className="mt-2 flex items-center justify-center gap-4">
          {legend.map((l, i) => (
            <span key={l} className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="size-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />{l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Donut/Progress-Ring für Anteile.
export function DonutStat({ value, max, label, color = "#5d8a34" }: { value: number; max: number; label: string; color?: string }) {
  const r = 42, c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 110 110" className="size-28">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#eef1ea" strokeWidth="12" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 55 55)" />
        <text x="55" y="60" textAnchor="middle" fontSize="20" fontWeight="700" className="fill-neutral-900">{Math.round(pct * 100)}%</text>
      </svg>
      <span className="mt-1 text-xs text-neutral-500">{label}</span>
    </div>
  );
}
