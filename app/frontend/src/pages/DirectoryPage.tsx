import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { Breadcrumbs, PageHeader, ToolLayout } from '@/components/site/layout';
import { ToolSidebar } from '@/components/site/tool-sidebar';
import { SEO_UPDATED, SEO_PAGES } from '@/lib/seo-pages';
import { DirectoryExplorer } from './Index';

export default function DirectoryPage() {
  return (
    <>
      <Seo
        title="All LLM Cost & VRAM Guides — Modelmath Directory"
        description="Every Modelmath guide in one searchable index: LLM API pricing comparisons, local VRAM requirements, quantization advice and hardware fit checks."
        path="/directory"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Directory', path: '/directory' },
        ]}
      />
      <ToolLayout sidebar={<ToolSidebar tool="api" title="Most searched" />}>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Directory' }]} />
        <PageHeader
          kicker="Index"
          title="Every guide, indexed"
          lede="Each page opens its calculator already configured for the question in the headline. Filter by tool or search by model, GPU or vendor."
          meta={
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
              {SEO_PAGES.length} guides · data reviewed {SEO_UPDATED}
            </p>
          }
        />
        <div className="mt-6">
          <DirectoryExplorer />
        </div>
        <div className="mt-8">
          <AdSlot id="directory-inline" format="horizontal" />
        </div>
      </ToolLayout>
      <div className="mx-auto mt-10 w-full max-w-[1240px] px-4 sm:px-6">
        <AdSlot id="directory-footer" format="horizontal" />
      </div>
    </>
  );
}
