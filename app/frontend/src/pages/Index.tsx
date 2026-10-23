import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { PageHeader, SectionHeading } from '@/components/site/layout';
import { computeCost } from '@/lib/cost';
import { computeVram } from '@/lib/vram';
import { MODEL_BY_ID, PROVIDER_BY_KEY } from '@/data/models';
import { formatNumber, formatUsd } from '@/lib/format';
import { StatusBadge } from '@/components/calc/status-badge';
import { SEO_PAGES, TOOL_LABEL, seoPagePath, getSeoPagesForTool } from '@/lib/seo-pages';
import { cn } from '@/lib/utils';

const HERO_WORKLOAD = {
  requestsPerDay: 2000,
  inputTokens: 1500,
  outputTokens: 800,
  cacheHitRate: 40,
};

const HERO_MODELS = ['gpt-4o-mini', 'gemini-1-5-flash', 'deepseek-v3', 'claude-sonnet-4', 'gpt-4o'];

export default function Index() {
  const heroRows = useMemo(
    () =>
      HERO_MODELS.map((id) => computeCost(MODEL_BY_ID[id], HERO_WORKLOAD)).sort(
        (a, b) => a.monthlyTotal - b.monthlyTotal,
      ),
    [],
  );

  const vramSample = useMemo(
    () =>
      computeVram({
        paramsB: 70,
        quantId: 'q4_k_m',
        contextTokens: 8192,
        hardwareId: 'rtx-4090-24',
        kvQuantized: false,
      }),
    [],
  );

  const cheapest = heroRows[0];
  const expensive = heroRows[heroRows.length - 1];

  return (
    <>
      <Seo
        title="Modelmath — LLM API Cost & Local VRAM Calculators"
        description="Two developer calculators for AI compute economics: compare LLM API token costs across OpenAI, Anthropic, Gemini, DeepSeek and Llama, and check whether a model fits your GPU or Mac."
        path="/"
        application={{
          name: 'Modelmath',
          description:
            'Client-side calculators for LLM API token costs and local inference VRAM requirements.',
          category: 'DeveloperApplication',
        }}
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-[6px] w-[6px] bg-accent" aria-hidden="true" />
                <p className="micro">AI compute economics · updated Oct 2026</p>
              </div>

              <h1 className="mt-4 font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] text-foreground sm:text-[56px]">
                Know what your tokens
                <br />
                <span className="relative inline-block">
                  actually cost.
                  <span
                    className="absolute inset-x-0 bottom-[6px] -z-10 h-[12px] bg-accent sm:bottom-[8px] sm:h-[16px]"
                    aria-hidden="true"
                  />
                </span>
              </h1>

              <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-muted-foreground">
                Two calculators, no accounts, no API keys. Model your production workload against fifteen hosted models
                across five providers, or check whether a quantized model fits the GPU you already own — including the
                KV cache everyone forgets.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link
                  to="/api-calculator"
                  className="group inline-flex min-h-[42px] items-center gap-2 bg-primary px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Calculate API cost
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  to="/vram-calculator"
                  className="group inline-flex min-h-[42px] items-center gap-2 border border-foreground/25 px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Check VRAM fit
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>

              <dl className="mt-9 grid max-w-[440px] grid-cols-3 gap-px border border-border bg-border">
                {[
                  { label: 'Models', value: '15' },
                  { label: 'Guides', value: String(SEO_PAGES.length) },
                  { label: 'Data leaves', value: 'never' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background px-3 py-2.5">
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{stat.label}</dt>
                    <dd className="tnum mt-1 font-mono text-[16px] font-semibold text-foreground">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Live readout card — the defining visual */}
            <div className="relative">
              <div className="grid-paper absolute -inset-x-4 -inset-y-4 -z-10 opacity-40" aria-hidden="true" />
              <div className="border border-foreground/15 bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground">
                    Live readout
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    <span className="h-[5px] w-[5px] animate-pulse bg-accent" aria-hidden="true" />
                    computed in-browser
                  </span>
                </div>

                <div className="border-b border-border px-4 py-3.5">
                  <p className="micro">Scenario</p>
                  <p className="tnum mt-1 font-mono text-[12.5px] leading-[1.7] text-foreground">
                    {formatNumber(HERO_WORKLOAD.requestsPerDay)} req/day · {formatNumber(HERO_WORKLOAD.inputTokens)} in ·{' '}
                    {formatNumber(HERO_WORKLOAD.outputTokens)} out · {HERO_WORKLOAD.cacheHitRate}% cached
                  </p>
                </div>

                <ul className="divide-y divide-border/70">
                  {heroRows.slice(0, 4).map((row, index) => {
                    const provider = PROVIDER_BY_KEY[row.model.provider];
                    const width = Math.max(3, (row.monthlyTotal / expensive.monthlyTotal) * 100);
                    return (
                      <li key={row.model.id} className="px-4 py-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-[7px] w-[7px] shrink-0" style={{ backgroundColor: provider.color }} aria-hidden="true" />
                            <span className="truncate text-[12.5px] font-medium text-foreground">{row.model.name}</span>
                          </span>
                          <span className="tnum shrink-0 font-mono text-[12.5px] font-semibold text-foreground">
                            {formatUsd(row.monthlyTotal, { compact: true })}
                            <span className="ml-1 font-mono text-[9px] font-normal text-muted-foreground">/mo</span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-[4px] w-full bg-muted">
                          <div
                            className="h-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor: index === 0 ? 'hsl(var(--accent))' : provider.color,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-baseline justify-between border-t border-border bg-muted/40 px-4 py-2.5">
                  <span className="micro">Spread</span>
                  <span className="tnum font-mono text-[12px] font-semibold text-foreground">
                    {(expensive.monthlyTotal / Math.max(cheapest.monthlyTotal, 0.0001)).toFixed(1)}× cheaper with {cheapest.model.name}
                  </span>
                </div>

                <div className="border-t border-border px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="micro">Same model, your GPU</p>
                    <StatusBadge status={vramSample.status} />
                  </div>
                  <p className="tnum mt-1.5 font-mono text-[12px] leading-[1.6] text-foreground">
                    Llama 70B Q4 needs {vramSample.totalGB.toFixed(0)} GB — an RTX 4090 gives{' '}
                    {vramSample.usableMemoryGB.toFixed(0)} GB usable.
                  </p>
                  <Link
                    to="/vram-calculator/llama-3-70b-q4-rtx-4090"
                    className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    See the full verdict →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading
          index="01"
          title="Two calculators, one job each"
          description="Both run entirely in your browser. Every input syncs to the URL, so a shared link reproduces the exact scenario."
        />
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <ToolCard
            to="/api-calculator"
            index="01"
            title="LLM API cost calculator"
            body="Price a workload across OpenAI, Anthropic, Gemini, DeepSeek and Llama. Isolate input, cached input and output costs, rank fifteen models, and export the comparison as CSV."
            bullets={['Live prompt tokenizer', 'Prompt-cache savings model', 'Shareable quote link + CSV']}
          />
          <ToolCard
            to="/vram-calculator"
            index="02"
            title="Can I run this LLM?"
            body="Break total memory into weights, KV cache and runtime overhead. Get a colour-coded verdict against 15 GPUs and Apple unified-memory configurations, plus an estimated token rate."
            bullets={['Weights + KV cache + overhead', '7 quantization levels', 'Fit verdict & speed tier']}
          />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        <AdSlot id="home-leaderboard" format="horizontal" />
      </div>

      {/* Directory */}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading
          index="02"
          title="Answer-first guides"
          description="Pre-configured landing pages for the questions developers actually search. Each one opens the calculator already set to the scenario in the headline."
        />
        <div className="mt-6">
          <DirectoryExplorer />
        </div>
      </section>

      {/* Method */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <SectionHeading index="03" title="How the numbers are produced" />
              <div className="mt-5 space-y-3.5">
                {[
                  {
                    title: 'Weights are bits, not labels',
                    body: 'Q4_K_M is not 4 bits per weight — block scales make it about 4.83. Every estimate uses effective bits, so a 70B Q4 model comes out at 42 GB rather than 35.',
                  },
                  {
                    title: 'KV cache is not optional',
                    body: 'Cache scales with layers × KV heads × context. At 128K tokens a 70B model needs roughly 40 GB of cache at FP16, which is more than most cards.',
                  },
                  {
                    title: 'Prices are list prices',
                    body: 'Batch discounts, provisioned throughput and regional rates are excluded. Treat results as planning figures accurate to about ±15%.',
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l border-border pl-4">
                    <h3 className="text-[13.5px] font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-[13px] leading-[1.65] text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                className="mt-5 inline-block font-mono text-[10.5px] uppercase tracking-[0.1em] text-foreground underline decoration-border decoration-1 underline-offset-4 hover:decoration-foreground"
              >
                Read the full methodology →
              </Link>
            </div>
            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground">
                  Memory formula
                </span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">GB</span>
              </div>
              <div className="mt-3 space-y-2 font-mono text-[12px] leading-[1.85] text-foreground">
                <p className="text-muted-foreground">weights = params × bits / 8 / 1024³</p>
                <p className="text-muted-foreground">kv = 2 × layers × kv_heads × head_dim × bytes × tokens</p>
                <p className="text-muted-foreground">overhead = 1.5 GB (runtime reserve)</p>
                <div className="mt-3 border-t border-border pt-3">
                  <p>
                    total = weights + kv + overhead
                    <br />
                    <span className="text-muted-foreground">fit = total ≤ memory × usable_ratio</span>
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground">Example: 70B Q4 · 8K ctx · 4090</span>
                  <span className="tnum text-[13px] font-semibold text-bad">
                    {vramSample.totalGB.toFixed(1)} / {vramSample.usableMemoryGB.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6">
        <AdSlot id="home-footer" format="horizontal" />
      </div>
    </>
  );
}

function ToolCard({
  to,
  index,
  title,
  body,
  bullets,
}: {
  to: string;
  index: string;
  title: string;
  body: string;
  bullets: string[];
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col border border-border bg-card p-5 transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{index}</span>
        <ArrowUpRight
          className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-3 font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-[13.5px] leading-[1.65] text-muted-foreground">{body}</p>
      <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            <span className="h-[4px] w-[4px] bg-accent" aria-hidden="true" />
            {bullet}
          </li>
        ))}
      </ul>
    </Link>
  );
}

const DIRECTORY_PAGE_SIZE = 24;

export function DirectoryExplorer() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'api' | 'vram'>('all');
  const [visibleCount, setVisibleCount] = useState(DIRECTORY_PAGE_SIZE);
  const updateQuery = (value: string) => {
    setQuery(value);
    setVisibleCount(DIRECTORY_PAGE_SIZE);
  };
  const updateFilter = (value: 'all' | 'api' | 'vram') => {
    setFilter(value);
    setVisibleCount(DIRECTORY_PAGE_SIZE);
  };

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SEO_PAGES.filter((page) => {
      const matchesTool = filter === 'all' || page.tool === filter;
      if (!matchesTool) return false;
      if (!needle) return true;
      return `${page.h1} ${page.description} ${page.slug}`.toLowerCase().includes(needle);
    });
  }, [query, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[340px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search guides — 70B, RTX 4090, Gemini…"
            aria-label="Search guide pages"
            className="min-h-[40px] w-full border border-input bg-card pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'api', 'vram'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => updateFilter(key)}
              aria-pressed={filter === key}
              className={cn(
                'min-h-[34px] border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                filter === key
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
            >
              {key === 'all' ? 'All' : key === 'api' ? 'API cost' : 'VRAM fit'}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-6 border border-border bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
          No guides match “{query}”. Try a model name or a GPU.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.slice(0, visibleCount).map((page) => (
            <li key={page.slug}>
              <Link
                to={seoPagePath(page)}
                className="group flex h-full min-h-[92px] flex-col justify-between border border-border bg-card p-3.5 transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  {TOOL_LABEL[page.tool]}
                </span>
                <span className="mt-1.5 text-[13px] font-medium leading-[1.4] text-foreground">{page.h1}</span>
                <span className="mt-2 flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground transition-colors group-hover:text-foreground">
                  Open calculator
                  <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {results.length > visibleCount ? (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + DIRECTORY_PAGE_SIZE)}
          className="mt-4 inline-flex min-h-[40px] items-center border border-border px-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Show more ({results.length - visibleCount} remaining)
        </button>
      ) : null}
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        Showing {Math.min(visibleCount, results.length)} · {results.length} of {SEO_PAGES.length} guides · {getSeoPagesForTool('api').length} cost ·{' '}
        {getSeoPagesForTool('vram').length} hardware
      </p>
    </div>
  );
}

export { PageHeader };
