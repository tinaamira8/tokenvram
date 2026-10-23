import { Link } from 'react-router-dom';
import { AdSlot } from '@/components/site/ad-slot';
import { ADS_ENABLED } from '@/lib/site';
import { SEO_PAGES, seoPagePath, type ToolKey } from '@/lib/seo-pages';
import { getSeoPagesForTool } from '@/lib/seo-pages';

interface ToolSidebarProps {
  tool: ToolKey;
  /** Slug of the currently open guide, excluded from the list */
  currentSlug?: string;
  title?: string;
}

/**
 * Sticky desktop sidebar: one 300×600 ad slot plus internal links to the
 * highest-intent guide pages. Keeps the calculator column 70% of the width.
 */
export function ToolSidebar({ tool, currentSlug, title }: ToolSidebarProps) {
  const pages = getSeoPagesForTool(tool).filter((page) => page.slug !== currentSlug);
  const otherTool = tool === 'api' ? 'vram' : 'api';
  const otherPages = getSeoPagesForTool(otherTool).slice(0, 3);

  return (
    <aside className="space-y-5 lg:border-l lg:border-border lg:pl-6">
      {ADS_ENABLED ? (
        <div>
          <p className="micro">Sponsored</p>
          <div className="mt-2">
            <AdSlot id={`sidebar-${tool}`} format="sticky-sidebar" />
          </div>
        </div>
      ) : null}

      <div className={ADS_ENABLED ? 'border-t border-border pt-4' : ''}>
        <h2 className="micro">{title ?? 'Popular comparisons'}</h2>
        <ul className="mt-2.5 space-y-2">
          {pages.slice(0, 8).map((page) => (
            <li key={page.slug}>
              <Link
                to={seoPagePath(page)}
                className="group block text-[12.5px] leading-[1.45] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60 group-hover:text-accent-foreground">
                  →
                </span>
                {page.h1}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="micro">{otherTool === 'api' ? 'Cost calculators' : 'Hardware checks'}</h2>
        <ul className="mt-2.5 space-y-2">
          {otherPages.map((page) => (
            <li key={page.slug}>
              <Link
                to={seoPagePath(page)}
                className="block text-[12.5px] leading-[1.45] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {page.h1}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/directory"
          className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-foreground underline decoration-border decoration-1 underline-offset-4 hover:decoration-foreground"
        >
          All {SEO_PAGES.length} guides →
        </Link>
      </div>
    </aside>
  );
}
