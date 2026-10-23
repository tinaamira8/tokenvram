import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: ReactNode;
  /** Optional sidebar content rendered only on large screens */
  sidebar?: ReactNode;
  className?: string;
}

/**
 * 70/30 calculator layout: content column plus a sticky desktop sidebar that
 * stacks below the content on smaller screens.
 */
export function ToolLayout({ children, sidebar, className }: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
      <div className={cn('grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10', className)}>
        <div className="min-w-0">{children}</div>
        {sidebar ? (
          <div className="min-w-0">
            <div className="lg:sticky lg:top-[72px]">{sidebar}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SimpleLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[820px] px-4 sm:px-6', className)}>{children}</div>
  );
}

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 py-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden="true" /> : null}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground/80"
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function PageHeader({
  kicker,
  title,
  lede,
  meta,
}: {
  kicker: string;
  title: string;
  lede?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="border-b border-border pb-6">
      <div className="flex items-center gap-2">
        <span className="h-[6px] w-[6px] bg-accent" aria-hidden="true" />
        <p className="micro">{kicker}</p>
      </div>
      <h1 className="mt-3 font-display text-[30px] font-bold leading-[1.08] tracking-[-0.025em] text-foreground sm:text-[38px]">
        {title}
      </h1>
      {lede ? <p className="mt-3 max-w-[68ch] text-[14.5px] leading-[1.65] text-muted-foreground">{lede}</p> : null}
      {meta ? <div className="mt-4">{meta}</div> : null}
    </header>
  );
}

export function SectionHeading({
  index,
  title,
  description,
}: {
  index?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-[70ch]">
      <div className="flex items-baseline gap-3">
        {index ? <span className="font-mono text-[10.5px] tracking-[0.14em] text-accent-foreground/70">{index}</span> : null}
        <h2 className="font-display text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[26px]">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="mt-2.5 text-[14px] leading-[1.7] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
