import type { VramResult } from '@/lib/vram';
import { StatusBadge } from './status-badge';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Stacked memory composition meter: weights + KV cache + runtime overhead. */
export function MemoryMeter({ result, className }: { result: VramResult; className?: string }) {
  const segments = [
    { key: 'weights', label: 'Weights', value: result.weightsGB, color: '#C6613A' },
    { key: 'kv', label: 'KV cache', value: result.kvCacheGB, color: '#2C6BE0' },
    { key: 'overhead', label: 'Overhead', value: result.overheadGB, color: '#8A8781' },
  ];
  const scale = Math.max(result.totalGB, result.usableMemoryGB);
  const capacityPct = (result.usableMemoryGB / scale) * 100;
  const overCapacity = result.headroomGB < 0;

  return (
    <div className={cn('border border-border bg-card', className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">Memory composition</h2>
        <StatusBadge status={result.status} />
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="micro">Total required</p>
            <p className="tnum mt-1 font-mono text-[34px] font-semibold leading-none tracking-[-0.03em] text-foreground">
              {result.totalGB.toFixed(1)}
              <span className="ml-1 font-mono text-[15px] font-normal text-muted-foreground">GB</span>
            </p>
          </div>
          <div className="text-right">
            <p className="micro">Usable on {result.hardware.name}</p>
            <p
              className={cn(
                'tnum mt-1 font-mono text-[15px] font-semibold leading-none',
                overCapacity ? 'text-bad' : 'text-ok',
              )}
            >
              {result.usableMemoryGB.toFixed(1)} GB
            </p>
          </div>
        </div>

        {/* Segment bar with capacity marker */}
        <div className="relative mt-5">
          <div className="flex h-8 w-full overflow-hidden border border-border bg-muted" role="img" aria-label={`Memory used: ${result.totalGB.toFixed(1)} gigabytes of ${result.usableMemoryGB.toFixed(1)} usable`}>
            {segments.map((segment) => (
              <div
                key={segment.key}
                style={{ width: `${(segment.value / scale) * 100}%`, backgroundColor: segment.color }}
                title={`${segment.label}: ${segment.value.toFixed(2)} GB`}
              />
            ))}
            {overCapacity ? (
              <div
                className="h-full"
                style={{
                  width: `${Math.max(0, (result.totalGB - scale) / scale) * 100}%`,
                  backgroundImage: 'repeating-linear-gradient(45deg, hsl(var(--bad) / 0.55) 0 6px, transparent 6px 12px)',
                }}
              />
            ) : null}
          </div>
          {/* Capacity divider */}
          <div
            className="pointer-events-none absolute -top-1 bottom-[-4px] w-px bg-foreground"
            style={{ left: `${capacityPct}%` }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -top-[18px]" style={{ left: `${capacityPct}%` }}>
            <span className="relative -left-1/2 whitespace-nowrap bg-background px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground">
              capacity
            </span>
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {segments.map((segment) => (
            <li key={segment.key} className="border border-border/70 bg-background/60 px-2.5 py-2">
              <div className="flex items-center gap-1.5">
                <span className="h-[7px] w-[7px]" style={{ backgroundColor: segment.color }} aria-hidden="true" />
                <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{segment.label}</span>
              </div>
              <p className="tnum mt-1 font-mono text-[14px] font-semibold text-foreground">{segment.value.toFixed(2)} GB</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-3">
          <div className="bg-card px-3 py-2.5">
            <p className="micro">Headroom</p>
            <p
              className={cn(
                'tnum mt-1 font-mono text-[16px] font-semibold',
                overCapacity ? 'text-bad' : 'text-foreground',
              )}
            >
              {overCapacity ? `−${Math.abs(result.headroomGB).toFixed(2)}` : `+${result.headroomGB.toFixed(2)}`} GB
            </p>
          </div>
          <div className="bg-card px-3 py-2.5">
            <p className="micro">Est. speed</p>
            <p className="tnum mt-1 font-mono text-[16px] font-semibold text-foreground">
              {result.estimatedTokensPerSec < 1
                ? '<1'
                : formatNumber(result.estimatedTokensPerSec, result.estimatedTokensPerSec < 10 ? 1 : 0)}{' '}
              <span className="text-[11px] font-normal text-muted-foreground">tok/s</span>
            </p>
          </div>
          <div className="bg-card px-3 py-2.5">
            <p className="micro">GPU offload</p>
            <p className="tnum mt-1 font-mono text-[16px] font-semibold text-foreground">
              {result.gpuOffloadPct.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="text-[12.5px] font-medium text-foreground">{result.speedTier}</p>
          {result.notes.map((note) => (
            <p key={note} className="text-[11.5px] leading-[1.6] text-muted-foreground">
              — {note}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
