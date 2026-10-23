import { useMemo, useState } from 'react';
import { Check, Copy, Download, Link2, RotateCcw, Save, Trash2 } from 'lucide-react';
import { NumberField } from './number-field';
import { CostChart } from './cost-chart';
import { CostTable } from './cost-table';
import { TokenizerPanel } from './tokenizer-panel';
import { computeAllCosts, toCsv } from '@/lib/cost';
import { MODELS, PROVIDER_BY_KEY, PROVIDERS, type ProviderKey } from '@/data/models';
import { formatUsd, formatNumber } from '@/lib/format';
import { usePresets } from '@/hooks/use-presets';
import { cn } from '@/lib/utils';

export interface ApiCostState extends Record<string, number | string> {
  requestsPerDay: number;
  inputTokens: number;
  outputTokens: number;
  cacheHitRate: number;
}

export const API_COST_DEFAULTS: ApiCostState = {
  requestsPerDay: 2000,
  inputTokens: 1500,
  outputTokens: 800,
  cacheHitRate: 40,
};

export const API_COST_SCHEMA = {
  requestsPerDay: { key: 'rpd', fallback: API_COST_DEFAULTS.requestsPerDay, min: 1, max: 1_000_000 },
  inputTokens: { key: 'in', fallback: API_COST_DEFAULTS.inputTokens, min: 1, max: 1_000_000 },
  outputTokens: { key: 'out', fallback: API_COST_DEFAULTS.outputTokens, min: 1, max: 1_000_000 },
  cacheHitRate: { key: 'cache', fallback: API_COST_DEFAULTS.cacheHitRate, min: 0, max: 100 },
} as const;

interface ApiCostCalculatorProps {
  state: ApiCostState;
  update: (patch: Partial<ApiCostState>) => void;
  shareUrl: string;
}

export function ApiCostCalculator({ state, update, shareUrl }: ApiCostCalculatorProps) {
  const [providerFilter, setProviderFilter] = useState<ProviderKey | 'all'>('all');
  const [presetName, setPresetName] = useState('');
  const [copied, setCopied] = useState(false);
  const { presets, save, remove } = usePresets<ApiCostState>('api-cost');

  const models = useMemo(
    () => (providerFilter === 'all' ? MODELS : MODELS.filter((model) => model.provider === providerFilter)),
    [providerFilter],
  );

  const rows = useMemo(
    () =>
      computeAllCosts(models, {
        requestsPerDay: state.requestsPerDay,
        inputTokens: state.inputTokens,
        outputTokens: state.outputTokens,
        cacheHitRate: state.cacheHitRate,
      }),
    [models, state.requestsPerDay, state.inputTokens, state.outputTokens, state.cacheHitRate],
  );

  const cheapest = rows[0];
  const priciest = rows[rows.length - 1];
  const monthlyRequests = state.requestsPerDay * 30;
  const monthlyInputTokens = monthlyRequests * state.inputTokens;
  const monthlyOutputTokens = monthlyRequests * state.outputTokens;
  const totalTokens = monthlyInputTokens + monthlyOutputTokens;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const exportCsv = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `modelmath-api-cost-${state.requestsPerDay}rpd.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <section aria-labelledby="workload-heading" className="border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 id="workload-heading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            Workload inputs
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {formatNumber(monthlyRequests)} req / 30 days
          </span>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2">
          <NumberField
            id="requests-per-day"
            label="Requests per day"
            value={state.requestsPerDay}
            onChange={(value) => update({ requestsPerDay: value })}
            min={1}
            max={1_000_000}
            step={100}
            scale="log"
          />
          <NumberField
            id="input-tokens"
            label="Input tokens / request"
            value={state.inputTokens}
            onChange={(value) => update({ inputTokens: value })}
            min={1}
            max={200_000}
            step={50}
            scale="log"
          />
          <NumberField
            id="output-tokens"
            label="Output tokens / request"
            value={state.outputTokens}
            onChange={(value) => update({ outputTokens: value })}
            min={1}
            max={100_000}
            step={50}
            scale="log"
          />
          <NumberField
            id="cache-hit-rate"
            label="Prompt cache hit rate"
            value={state.cacheHitRate}
            onChange={(value) => update({ cacheHitRate: value })}
            min={0}
            max={100}
            step={1}
            suffix="%"
            hint="Share of input tokens served from a warm cache. Providers cache a stable prompt prefix, so instructions and documents should come first."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => update(API_COST_DEFAULTS)}
            className="inline-flex min-h-[34px] items-center gap-1.5 border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-[34px] items-center gap-1.5 border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Link2 className="h-3 w-3" aria-hidden="true" />}
            {copied ? 'Link copied' : 'Copy quote link'}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex min-h-[34px] items-center gap-1.5 border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="h-3 w-3" aria-hidden="true" /> Export CSV
          </button>
        </div>
      </section>

      {/* Headline result */}
      <section aria-labelledby="result-heading" className="border border-foreground/15 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <h2 id="result-heading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            Cheapest option for this workload
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {formatNumber(totalTokens)} tokens / month
          </span>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-3">
          <div className="bg-card p-4">
            <p className="micro">Monthly spend</p>
            <p className="tnum mt-1.5 font-mono text-[30px] font-semibold leading-none tracking-[-0.03em] text-foreground">
              {formatUsd(cheapest.monthlyTotal)}
            </p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              {cheapest.model.name} · {PROVIDER_BY_KEY[cheapest.model.provider].label}
            </p>
          </div>
          <div className="bg-card p-4">
            <p className="micro">Cost per request</p>
            <p className="tnum mt-1.5 font-mono text-[30px] font-semibold leading-none tracking-[-0.03em] text-foreground">
              {formatUsd(cheapest.perRequest, { digits: 4 })}
            </p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              {formatUsd(cheapest.dailyTotal)} per day at {formatNumber(state.requestsPerDay)} req/day
            </p>
          </div>
          <div className="bg-card p-4">
            <p className="micro">Cache savings</p>
            <p className="tnum mt-1.5 font-mono text-[30px] font-semibold leading-none tracking-[-0.03em] text-foreground">
              {formatUsd(cheapest.cacheSavings, { compact: true })}
            </p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              vs. {formatUsd(priciest.monthlyTotal, { compact: true })} on {priciest.model.name}
            </p>
          </div>
        </div>
      </section>

      <TokenizerPanel onApply={(tokens) => update({ inputTokens: tokens })} />

      {/* Provider filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="micro mr-1">Filter</span>
        {(['all', ...PROVIDERS.map((provider) => provider.key)] as (ProviderKey | 'all')[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setProviderFilter(key)}
            aria-pressed={providerFilter === key}
            className={cn(
              'min-h-[30px] border px-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              providerFilter === key
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {key === 'all' ? 'All' : PROVIDER_BY_KEY[key].label}
          </button>
        ))}
      </div>

      <CostChart rows={rows} />
      <CostTable rows={rows} />

      {/* Presets */}
      <section aria-labelledby="presets-heading" className="border border-border bg-card">
        <div className="border-b border-border px-4 py-2.5">
          <h2 id="presets-heading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            Saved presets
          </h2>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="Name this scenario (e.g. Support bot v2)"
              aria-label="Preset name"
              className="min-h-[36px] flex-1 border border-input bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <button
              type="button"
              onClick={() => {
                if (!presetName.trim()) return;
                save(presetName, state);
                setPresetName('');
              }}
              disabled={!presetName.trim()}
              className="inline-flex min-h-[36px] items-center gap-1.5 bg-primary px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Save className="h-3 w-3" aria-hidden="true" /> Save
            </button>
          </div>
          {presets.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-muted-foreground">
              Presets are stored in this browser only — nothing is uploaded.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border border-t border-border">
              {presets.map((preset) => (
                <li key={preset.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <button
                    type="button"
                    onClick={() => update(preset.values as Partial<ApiCostState>)}
                    className="text-left text-[13px] text-foreground transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {preset.name}
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {formatNumber((preset.values as ApiCostState).requestsPerDay)} rpd ·{' '}
                      {(preset.values as ApiCostState).cacheHitRate}% cache
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => update(preset.values as Partial<ApiCostState>)}
                      className="inline-flex h-7 items-center gap-1 border border-border px-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Copy className="h-2.5 w-2.5" aria-hidden="true" /> Load
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(preset.id)}
                      aria-label={`Delete preset ${preset.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-bad/10 hover:text-bad focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
