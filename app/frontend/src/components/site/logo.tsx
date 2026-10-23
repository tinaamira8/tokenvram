import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background', className)}
      aria-label="Modelmath home"
    >
      <span className="relative flex h-7 w-7 items-center justify-center border border-foreground/80 bg-foreground text-background">
        <span className="font-mono text-[11px] font-semibold leading-none tracking-tight">mm</span>
        <span className="absolute -right-[3px] -top-[3px] h-[6px] w-[6px] bg-accent ring-2 ring-background" />
      </span>
      <span className="font-display text-[17px] font-bold leading-none tracking-[-0.02em]">
        Modelmath
      </span>
    </Link>
  );
}
