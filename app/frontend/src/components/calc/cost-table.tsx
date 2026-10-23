import { useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import type { CostBreakdown } from '@/lib/cost';
import { PROVIDER_BY_KEY } from '@/data/models';
import { formatUsd } from '@/lib/format';
import { cn } from '@/lib/utils';

type SortKey = 'monthlyTotal' | 'outputCost' | 'cacheSavings';

interface CostTableProps {
  rows: CostBreakdown[];
  className?: string;
}

export function CostTable({ rows, className }: CostTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('monthlyTotal');
  const [descending, setDescending] = useState(false);

  const sorted = [...rows].sort((a, b) =>
    descending ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey],
  );
  const lowest = Math.min(...rows.map((row) => row.monthlyTotal));

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setDescending((value) => !value);
    else {
      setSortKey(key);
      setDescending(false);
    }
  };

  return (
    <div className={cn('border border-border bg-card', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">Monthly cost by model with input, cache savings and output breakdown</caption>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-3 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Model
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Input
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <button
                  type="button"
                  onClick={() => toggleSort('cacheSavings')}
                  className="inline-flex items-center gap-1 uppercase tracking-[0.12em] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cache saved
                  {sortKey === 'cacheSavings' ? (
                    descending ? <ArrowDownWideNarrow className="h-3 w-3" /> : <ArrowUpWideNarrow className="h-3 w-3" />
                  ) : null}
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <button
                  type="button"
                  onClick={() => toggleSort('outputCost')}
                  className="inline-flex items-center gap-1 uppercase tracking-[0.12em] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Output
                  {sortKey === 'outputCost' ? (
                    descending ? <ArrowDownWideNarrow className="h-3 w-3" /> : <ArrowUpWideNarrow className="h-3 w-3" />
                  ) : null}
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <button
                  type="button"
                  onClick={() => toggleSort('monthlyTotal')}
                  className="inline-flex items-center gap-1 uppercase tracking-[0.12em] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Monthly total
                  {sortKey === 'monthlyTotal' ? (
                    descending ? <ArrowDownWideNarrow className="h-3 w-3" /> : <ArrowUpWideNarrow className="h-3 w-3" />
                  ) : null}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const provider = PROVIDER_BY_KEY[row.model.provider];
              const isLowest = row.monthlyTotal === lowest;
              const inputTotal = row.cachedInputCost + row.uncachedInputCost;
              return (
                <tr
                  key={row.model.id}
                  className={cn(
                    'border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40',
                    isLowest && 'bg-accent/[0.09]',
                  )}
                >
                  <th scope="row" className="relative px-3 py-2.5 text-left">
                    <div className="flex items-center gap-2">
                      {isLowest ? <span className="absolute inset-y-0 left-0 w-[3px] bg-accent" aria-hidden="true" /> : null}
                      <span className="h-[7px] w-[7px] shrink-0" style={{ backgroundColor: provider.color }} aria-hidden="true" />
                      <span className="text-[12.5px] font-medium text-foreground">{row.model.name}</span>
                      {isLowest ? (
                        <span className="border border-accent-foreground/20 bg-accent px-1 py-[1px] font-mono text-[8.5px] uppercase tracking-[0.1em] text-accent-foreground">
                          Lowest
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block pl-[15px] font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
                      {provider.label} · {formatUsd(row.model.input, { digits: 2 })} in / {formatUsd(row.model.output, { digits: 2 })} out
                      {row.supportsCaching ? '' : ' · no caching'}
                    </span>
                  </th>
                  <td className="tnum px-3 py-2.5 text-right font-mono text-[12px] text-foreground">
                    {formatUsd(inputTotal)}
                  </td>
                  <td className="tnum px-3 py-2.5 text-right font-mono text-[12px] text-muted-foreground">
                    {row.supportsCaching && row.cacheSavings > 0 ? `−${formatUsd(row.cacheSavings)}` : '—'}
                  </td>
                  <td className="tnum px-3 py-2.5 text-right font-mono text-[12px] text-foreground">
                    {formatUsd(row.outputCost)}
                  </td>
                  <td className="tnum px-3 py-2.5 text-right font-mono text-[13px] font-semibold text-foreground">
                    {formatUsd(row.monthlyTotal)}
                    <span className="mt-0.5 block font-mono text-[9.5px] font-normal text-muted-foreground">
                      {formatUsd(row.perRequest, { digits: 4 })}/req
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
