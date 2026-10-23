import { Link } from 'react-router-dom';
import { Seo } from '@/components/site/seo';
import { SimpleLayout } from '@/components/site/layout';

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found — Modelmath"
        description="The page you requested does not exist. Browse the LLM API cost calculator, the VRAM calculator, or the full guide directory."
        path="/404"
      />
      <SimpleLayout className="py-20">
        <p className="micro">Error 404</p>
        <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.025em] text-foreground sm:text-[40px]">
          This page does not exist
        </h1>
        <p className="mt-3 max-w-[52ch] text-[14px] leading-[1.7] text-muted-foreground">
          The calculator or guide you were looking for may have been renamed. Everything is indexed from the directory.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            to="/directory"
            className="inline-flex min-h-[40px] items-center bg-primary px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse all guides
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center border border-border px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back home
          </Link>
        </div>
      </SimpleLayout>
    </>
  );
}
