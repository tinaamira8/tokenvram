import { cn } from '@/lib/utils';
import type { FitStatus } from '@/lib/vram';

const STATUS_STYLE: Record<FitStatus, { dot: string; text: string; border: string; bg: string; label: string }> = {
  comfortable: {
    dot: 'bg-ok',
    text: 'text-ok',
    border: 'border-ok/35',
    bg: 'bg-ok/10',
    label: 'Runs comfortably',
  },
  tight: {
    dot: 'bg-warn',
    text: 'text-warn',
    border: 'border-warn/40',
    bg: 'bg-warn/10',
    label: 'Tight fit',
  },
  oom: {
    dot: 'bg-bad',
    text: 'text-bad',
    border: 'border-bad/40',
    bg: 'bg-bad/10',
    label: 'Out of memory',
  },
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: FitStatus;
  label?: string;
  className?: string;
}) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em]',
        style.border,
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn('h-[6px] w-[6px]', style.dot)} aria-hidden="true" />
      {label ?? style.label}
    </span>
  );
}

export function fitStatusLabel(status: FitStatus) {
  return STATUS_STYLE[status].label;
}
