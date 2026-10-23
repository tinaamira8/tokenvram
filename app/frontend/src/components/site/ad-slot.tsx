import { cn } from '@/lib/utils';
import { ADS_ENABLED } from '@/lib/site';

type AdFormat = 'horizontal' | 'rectangle' | 'sticky-sidebar';

interface AdSlotProps {
  id: string;
  format?: AdFormat;
  /** Label shown above the reserved area */
  label?: string;
  className?: string;
}

const FORMAT_CONFIG: Record<
  AdFormat,
  { minHeight: string; dimension: string; defaultLabel: string }
> = {
  horizontal: { minHeight: 'min-h-[90px]', dimension: '970×90', defaultLabel: 'Leaderboard' },
  rectangle: { minHeight: 'min-h-[250px]', dimension: '300×250', defaultLabel: 'Medium rectangle' },
  'sticky-sidebar': { minHeight: 'min-h-[600px]', dimension: '300×600', defaultLabel: 'Half page' },
};

/**
 * CLS-safe advertisement placeholder.
 *
 * Height is reserved before any ad script runs, so inserting an AdSense <ins>
 * tag later cannot shift content. Drop the real tag inside the inner div and
 * keep the surrounding min-height.
 */
export function AdSlot({ id, format = 'horizontal', label, className }: AdSlotProps) {
  if (!ADS_ENABLED) return null;
  const config = FORMAT_CONFIG[format];
  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        'flex w-full flex-col items-center justify-center border border-dashed border-border bg-muted/40 px-4 py-3 text-center',
        config.minHeight,
        className,
      )}
      data-ad-slot={id}
      data-ad-format={format}
    >
      <span className="micro">Advertisement</span>
      <span className="mt-1 font-mono text-[11px] text-muted-foreground/70">
        {label ?? config.defaultLabel} · {config.dimension}
      </span>
      <div id={`ad-${id}`} className="w-full flex-1" />
    </aside>
  );
}
