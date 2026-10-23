import type { CostBreakdown } from '@/lib/cost';
import { PROVIDER_BY_KEY } from '@/data/models';
import { formatUsd } from '@/lib/format';
import { cn } from '@/lib/utils';

interface CostChartProps {
  rows: CostBreakdown[];
  /** Restrict the chart to the top N cheapest so it stays readable */
  limit?: number;
  className?: string;
}

/** Horizontal bar comparison on a log-ish scale, drawn with divs (no chart lib). */
export function CostChart({ rows, limit = 10, className }: CostChartProps) {
  const visible = rows.slice(0, limit);
  const max = Math.max(...visible.map((row) => row.monthlyTotal), 1);

  return (
    <div className={cn('border border-border bg-card', className)}>
      <div className="flex items-baseline justify-between border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
          Monthly burn — cheapest {visible.length}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">USD / month</span>
      </div>
      <ul className="divide-y divide-border/70">
        {visible.map((row, index) => {
          const provider = PROVIDER_BY_KEY[row.model.provider];
          const width = Math.max(2, (row.monthlyTotal / max) * 100);
          return (
            <li key={row.model.id} className="px-4 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="tnum w-4 shrink-0 font-mono text-[10px] text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate text-[12.5px] font-medium text-foreground">{row.model.name}</span>
                  <span className="hidden shrink-0 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground sm:inline">
                    {provider.label}
                  </span>
                </div>
                <span className="tnum shrink-0 font-mono text-[12.5px] font-semibold text-foreground">
                  {formatUsd(row.monthlyTotal, { compact: true })}
                </span>
              </div>
              <div
                className="mt-1.5 h-[6px] w-full bg-muted"
                role="img"
                aria-label={`${row.model.name}: ${formatUsd(row.monthlyTotal)} per month`}
              >
                <div
                  className="h-full transition-[width] duration-300 ease-out"
                  style={{ width: `${width}%`, backgroundColor: index === 0 ? 'hsl(var(--accent))' : provider.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
