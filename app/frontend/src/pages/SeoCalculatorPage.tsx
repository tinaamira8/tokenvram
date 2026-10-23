import { useCallback, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { Breadcrumbs, ToolLayout } from '@/components/site/layout';
import { ToolSidebar } from '@/components/site/tool-sidebar';
import {
  API_COST_DEFAULTS,
  API_COST_SCHEMA,
  ApiCostCalculator,
  type ApiCostState,
} from '@/components/calc/api-cost-calculator';
import { ApiCostGuide } from '@/components/content/api-cost-guide';
import {
  VRAM_DEFAULTS,
  VRAM_SCHEMA,
  VramCalculator,
  type VramState,
} from '@/components/calc/vram-calculator';
import { VramGuide } from '@/components/content/vram-guide';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { useUrlState } from '@/hooks/use-url-state';
import {
  TOOL_LABEL,
  getRelatedPages,
  getSeoPage,
  seoPagePath,
  type SeoPage,
  type ToolKey,
} from '@/lib/seo-pages';
import { StatusBadge } from '@/components/calc/status-badge';
import { computeVram } from '@/lib/vram';
import { computeCost } from '@/lib/cost';
import { MODEL_BY_ID } from '@/data/models';
import { formatGb, formatUsd } from '@/lib/format';

interface SeoCalculatorPageProps {
  tool: ToolKey;
}

export default function SeoCalculatorPage({ tool }: SeoCalculatorPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getSeoPage(tool, slug) : undefined;

  if (!page) {
    return <Navigate to={tool === 'vram' ? '/vram-calculator' : '/api-calculator'} replace />;
  }

  return <SeoCalculatorView key={page.slug} page={page} />;
}

function SeoCalculatorView({ page }: { page: SeoPage }) {
  const path = seoPagePath(page);
  const related = getRelatedPages(page);
  const basePath = page.tool === 'vram' ? '/vram-calculator' : '/api-calculator';

  return (
    <>
      <Seo
        title={page.title}
        description={page.description}
        path={path}
        application={{
          name: page.h1,
          description: page.description,
          category: 'DeveloperApplication',
        }}
        faq={page.faq}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: TOOL_LABEL[page.tool], path: basePath },
          { name: page.h1, path },
        ]}
      />

      <ToolLayout sidebar={<ToolSidebar tool={page.tool} currentSlug={page.slug} title="Related answers" />}>
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: TOOL_LABEL[page.tool], to: basePath },
            { label: page.h1 },
          ]}
        />

        <header className="border-b border-border pb-6">
          <div className="flex items-center gap-2">
            <span className="h-[6px] w-[6px] bg-accent" aria-hidden="true" />
            <p className="micro">{page.kicker}</p>
          </div>
          <h1 className="mt-3 font-display text-[30px] font-bold leading-[1.08] tracking-[-0.025em] text-foreground sm:text-[40px]">
            {page.h1}
          </h1>
          <p className="mt-3 max-w-[68ch] text-[14.5px] leading-[1.7] text-muted-foreground">{page.intro}</p>
          <div className="mt-5 border-l-2 border-accent bg-card px-4 py-3">
            <p className="micro">Verdict</p>
            <p className="mt-1.5 text-[13.5px] leading-[1.7] text-foreground">{page.verdict}</p>
          </div>
          <QuickAnswer page={page} />
        </header>

        <div className="mt-6">
          <ToolPrefilledCalculator page={page} />
        </div>

        <div className="mt-6">
          <AdSlot id={`seo-${page.slug}`} format="horizontal" />
        </div>

        {page.alternative ? (
          <section aria-labelledby="alternative-heading" className="mt-6 border border-ok/35 bg-ok/[0.06] px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="h-[6px] w-[6px] bg-ok" aria-hidden="true" />
              <p id="alternative-heading" className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ok">
                What runs on this machine instead
              </p>
            </div>
            <p className="mt-1.5 text-[13.5px] leading-[1.7] text-foreground">
              <Link
                to={`/vram-calculator/${page.alternative.slug}`}
                className="underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {page.alternative.label}
              </Link>{' '}
              fits comfortably here at roughly {page.alternative.tps} tokens per second — open that calculation for the full
              memory breakdown.
            </p>
          </section>
        ) : null}

        {page.summary ? (
          <section aria-labelledby="analysis-heading" className="mt-10 border-t border-border pt-6">
            <p className="micro">Analysis</p>
            <h2
              id="analysis-heading"
              className="mt-1.5 font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-[24px]"
            >
              {page.h1.replace(/\?$/, '')} — the detailed answer
            </h2>
            <p className="mt-3 max-w-[74ch] text-[14px] leading-[1.8] text-foreground/80">{page.summary}</p>
          </section>
        ) : null}

        {page.tool === 'vram' ? <VramGuide /> : <ApiCostGuide />}
        <FaqAccordion items={page.faq} heading={`${page.h1} — questions`} />

        {related.length > 0 ? (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="micro">Related calculations</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={seoPagePath(item)}
                    className="group flex min-h-[60px] items-center justify-between gap-3 border border-border bg-card px-3.5 py-2.5 transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-[13px] leading-[1.45] text-foreground">{item.h1}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/directory"
              className="mt-4 inline-block font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              Browse all guides →
            </Link>
          </section>
        ) : null}
      </ToolLayout>

      <div className="mx-auto mt-10 w-full max-w-[1240px] px-4 sm:px-6">
        <AdSlot id={`seo-footer-${page.slug}`} format="horizontal" />
      </div>
    </>
  );
}

/** Compact numeric answer rendered above the calculator for scannability. */
function QuickAnswer({ page }: { page: SeoPage }) {
  if (page.tool === 'vram') {
    const result = computeVram({
      paramsB: Number(page.prefill.paramsB ?? VRAM_DEFAULTS.paramsB),
      quantId: String(page.prefill.quant ?? VRAM_DEFAULTS.quant),
      contextTokens: Number(page.prefill.context ?? VRAM_DEFAULTS.context),
      hardwareId: String(page.prefill.hardware ?? VRAM_DEFAULTS.hardware),
      kvQuantized: false,
    });
    return (
      <div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-card px-3.5 py-3">
          <p className="micro">Memory required</p>
          <p className="tnum mt-1 font-mono text-[19px] font-semibold text-foreground">{formatGb(result.totalGB, 1)}</p>
        </div>
        <div className="bg-card px-3.5 py-3">
          <p className="micro">{result.hardware.memoryGB} GB gives you</p>
          <p className="tnum mt-1 font-mono text-[19px] font-semibold text-foreground">
            {result.usableMemoryGB.toFixed(1)} GB
          </p>
        </div>
        <div className="bg-card px-3.5 py-3">
          <p className="micro">Verdict</p>
          <div className="mt-1.5">
            <StatusBadge status={result.status} />
          </div>
        </div>
      </div>
    );
  }

  // API page: pick a representative model mentioned in the headline.
  const modelId = page.slug.includes('gemini')
    ? 'gemini-1-5-flash'
    : page.slug.includes('deepseek-r1')
      ? 'deepseek-r1'
      : page.slug.includes('opus')
        ? 'claude-opus-4'
        : page.slug.includes('mini')
          ? 'gpt-4o-mini'
          : page.slug.includes('llama')
            ? 'llama-3-3-70b'
            : 'claude-sonnet-4';
  const model = MODEL_BY_ID[modelId] ?? MODEL_BY_ID['claude-sonnet-4'];
  const cost = computeCost(model, {
    requestsPerDay: Number(page.prefill.requestsPerDay ?? API_COST_DEFAULTS.requestsPerDay),
    inputTokens: Number(page.prefill.inputTokens ?? API_COST_DEFAULTS.inputTokens),
    outputTokens: Number(page.prefill.outputTokens ?? API_COST_DEFAULTS.outputTokens),
    cacheHitRate: Number(page.prefill.cacheHitRate ?? API_COST_DEFAULTS.cacheHitRate),
  });

  return (
    <div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-3">
      <div className="bg-card px-3.5 py-3">
        <p className="micro">{model.name} monthly</p>
        <p className="tnum mt-1 font-mono text-[19px] font-semibold text-foreground">{formatUsd(cost.monthlyTotal)}</p>
      </div>
      <div className="bg-card px-3.5 py-3">
        <p className="micro">Cost per request</p>
        <p className="tnum mt-1 font-mono text-[19px] font-semibold text-foreground">
          {formatUsd(cost.perRequest, { digits: 4 })}
        </p>
      </div>
      <div className="bg-card px-3.5 py-3">
        <p className="micro">Cache savings / month</p>
        <p className="tnum mt-1 font-mono text-[19px] font-semibold text-foreground">
          {formatUsd(cost.cacheSavings, { compact: true })}
        </p>
      </div>
    </div>
  );
}

function ToolPrefilledCalculator({ page }: { page: SeoPage }) {
  const prefill = page.prefill;
  const handleExternalChange = useCallback(() => undefined, []);

  const apiSchema = useMemo(
    () => ({
      requestsPerDay: {
        ...API_COST_SCHEMA.requestsPerDay,
        fallback: Number(prefill.requestsPerDay ?? API_COST_DEFAULTS.requestsPerDay),
      },
      inputTokens: {
        ...API_COST_SCHEMA.inputTokens,
        fallback: Number(prefill.inputTokens ?? API_COST_DEFAULTS.inputTokens),
      },
      outputTokens: {
        ...API_COST_SCHEMA.outputTokens,
        fallback: Number(prefill.outputTokens ?? API_COST_DEFAULTS.outputTokens),
      },
      cacheHitRate: {
        ...API_COST_SCHEMA.cacheHitRate,
        fallback: Number(prefill.cacheHitRate ?? API_COST_DEFAULTS.cacheHitRate),
      },
    }),
    [prefill],
  );

  const vramSchema = useMemo(
    () => ({
      paramsB: { ...VRAM_SCHEMA.paramsB, fallback: Number(prefill.paramsB ?? VRAM_DEFAULTS.paramsB) },
      quant: { ...VRAM_SCHEMA.quant, fallback: String(prefill.quant ?? VRAM_DEFAULTS.quant) },
      context: { ...VRAM_SCHEMA.context, fallback: Number(prefill.context ?? VRAM_DEFAULTS.context) },
      hardware: { ...VRAM_SCHEMA.hardware, fallback: String(prefill.hardware ?? VRAM_DEFAULTS.hardware) },
    }),
    [prefill],
  );

  if (page.tool === 'api') {
    return <ApiPrefilled schema={apiSchema} onChange={handleExternalChange} />;
  }
  return <VramPrefilled schema={vramSchema} onChange={handleExternalChange} />;
}

function ApiPrefilled({
  schema,
  onChange,
}: {
  schema: Record<string, { key: string; fallback: number }>;
  onChange: () => void;
}) {
  const { state, update, shareUrl } = useUrlState<ApiCostState>(schema as never, onChange);
  return <ApiCostCalculator state={state} update={update} shareUrl={shareUrl} />;
}

function VramPrefilled({
  schema,
  onChange,
}: {
  schema: Record<string, { key: string; fallback: number | string }>;
  onChange: () => void;
}) {
  const { state, update, shareUrl } = useUrlState<VramState>(schema as never, onChange);
  return <VramCalculator state={state} update={update} shareUrl={shareUrl} />;
}
