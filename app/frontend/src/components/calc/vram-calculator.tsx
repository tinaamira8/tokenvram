import { useMemo, useState } from 'react';
import { Check, Copy, RotateCcw, Trash2 } from 'lucide-react';
import { NumberField } from './number-field';
import { Segmented } from './segmented';
import { MemoryMeter } from './memory-meter';
import { computeVram } from '@/lib/vram';
import {
  CONTEXT_OPTIONS,
  HARDWARE,
  HARDWARE_BY_ID,
  HARDWARE_GROUPS,
  PARAM_PRESETS,
  QUANTIZATIONS,
  resolveArchitecture,
} from '@/data/hardware';
import { formatNumber } from '@/lib/format';
import { usePresets } from '@/hooks/use-presets';
import { cn } from '@/lib/utils';

export interface VramState extends Record<string, number | string> {
  paramsB: number;
  quant: string;
  context: number;
  hardware: string;
}

export const VRAM_DEFAULTS: VramState = {
  paramsB: 70,
  quant: 'q4_k_m',
  context: 8192,
  hardware: 'rtx-4090-24',
};

export const VRAM_SCHEMA = {
  paramsB: { key: 'p', fallback: VRAM_DEFAULTS.paramsB, min: 0.5, max: 1000 },
  quant: { key: 'q', fallback: VRAM_DEFAULTS.quant },
  context: { key: 'ctx', fallback: VRAM_DEFAULTS.context, min: 512, max: 1_000_000 },
  hardware: { key: 'hw', fallback: VRAM_DEFAULTS.hardware },
} as const;

interface VramCalculatorProps {
  state: VramState;
  update: (patch: Partial<VramState>) => void;
  shareUrl: string;
}

export function VramCalculator({ state, update, shareUrl }: VramCalculatorProps) {
  const [kvQuantized, setKvQuantized] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [copied, setCopied] = useState(false);
  const { presets, save, remove } = usePresets<VramState & { kvQuantized?: boolean }>('vram');

  const result = useMemo(
    () =>
      computeVram({
        paramsB: state.paramsB,
        quantId: state.quant,
        contextTokens: state.context,
        hardwareId: state.hardware,
        kvQuantized,
      }),
    [state.paramsB, state.quant, state.context, state.hardware, kvQuantized],
  );

  const architecture = resolveArchitecture(state.paramsB);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="model-heading" className="border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 id="model-heading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            Model & quantization
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {architecture.label}
          </span>
        </div>

        <div className="space-y-5 p-4">
          <div>
            <p className="micro">Parameter size</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PARAM_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => update({ paramsB: preset })}
                  aria-pressed={state.paramsB === preset}
                  className={cn(
                    'min-h-[32px] min-w-[54px] border px-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    state.paramsB === preset
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                  )}
                >
                  {preset >= 100 ? `${preset}B` : `${preset}B`}
                  {preset === 671 ? ' MoE' : ''}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <NumberField
                id="param-size"
                label="Custom parameter count"
                value={state.paramsB}
                onChange={(value) => update({ paramsB: value })}
                min={0.5}
                max={1000}
                step={0.5}
                suffix="B"
                scale="log"
                hint={`Nearest architecture profile: ${architecture.label} — ${architecture.layers} layers, ${architecture.kvHeads} KV heads.`}
              />
            </div>
          </div>

          <div>
            <p className="micro">Quantization</p>
            <div className="mt-2">
              <Segmented
                ariaLabel="Quantization level"
                columns="grid-cols-2 sm:grid-cols-4"
                size="sm"
                options={QUANTIZATIONS.map((quant) => ({
                  value: quant.id,
                  label: quant.label,
                  title: `${quant.quality} — ${quant.note}`,
                }))}
                value={state.quant}
                onChange={(value) => update({ quant: value })}
              />
            </div>
            <p className="mt-2 text-[11.5px] leading-[1.6] text-muted-foreground">
              {result.quantization.bits.toFixed(2)} bits/weight · {result.quantization.quality}. {result.quantization.note}
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <p className="micro">Context window</p>
              <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={kvQuantized}
                  onChange={(event) => setKvQuantized(event.target.checked)}
                  className="h-3.5 w-3.5 accent-foreground"
                />
                Q8 KV cache
              </label>
            </div>
            <div className="mt-2">
              <Segmented
                ariaLabel="Context window length"
                columns="grid-cols-4 sm:grid-cols-7"
                size="sm"
                options={CONTEXT_OPTIONS.map((option) => ({ value: option.tokens, label: option.label }))}
                value={state.context}
                onChange={(value) => update({ context: value })}
              />
            </div>
            <p className="mt-2 text-[11.5px] leading-[1.6] text-muted-foreground">
              KV cache at {formatNumber(state.context)} tokens: <span className="font-mono text-foreground">{result.kvCacheGB.toFixed(2)} GB</span>
              {kvQuantized ? ' (8-bit)' : ' (FP16)'} — scales linearly with context.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="hardware-heading" className="border border-border bg-card">
        <div className="border-b border-border px-4 py-2.5">
          <h2 id="hardware-heading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            Target hardware
          </h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="space-y-3">
            {HARDWARE_GROUPS.map((group) => {
              const items = HARDWARE.filter((hardware) => hardware.group === group.key);
              return (
                <div key={group.key}>
                  <p className="micro">{group.label}</p>
                  <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((hardware) => {
                      const active = hardware.id === state.hardware;
                      return (
                        <button
                          key={hardware.id}
                          type="button"
                          onClick={() => update({ hardware: hardware.id })}
                          aria-pressed={active}
                          className={cn(
                            'flex min-h-[52px] flex-col justify-center border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            active
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-card text-foreground hover:border-foreground/40',
                          )}
                        >
                          <span className="text-[12px] font-medium leading-tight">{hardware.name}</span>
                          <span
                            className={cn(
                              'mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]',
                              active ? 'text-background/70' : 'text-muted-foreground',
                            )}
                          >
                            {hardware.memoryGB} GB · {hardware.bandwidth} GB/s
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="border-t border-border pt-3 text-[11.5px] leading-[1.6] text-muted-foreground">
            {HARDWARE_BY_ID[state.hardware]?.note}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                update(VRAM_DEFAULTS);
                setKvQuantized(false);
              }}
              className="inline-flex min-h-[34px] items-center gap-1.5 border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex min-h-[34px] items-center gap-1.5 border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
              {copied ? 'Link copied' : 'Share this config'}
            </button>
          </div>
        </div>
      </section>

      <MemoryMeter result={result} />

      <section aria-labelledby="context-heading" className="border border-border bg-card">
        <div className="border-b border-border px-4 py-2.5">
          <h2 id="context-heading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            Fitting headroom
          </h2>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2">
          <div className="bg-card px-4 py-3">
            <p className="micro">Max context at this quant</p>
            <p className="tnum mt-1 font-mono text-[18px] font-semibold text-foreground">
              {result.maxContextTokens > 0 ? `${formatNumber(result.maxContextTokens)} tokens` : '0 — weights alone exceed memory'}
            </p>
            <p className="mt-1 text-[11.5px] leading-[1.6] text-muted-foreground">
              Largest KV cache that still fits after weights and the {result.overheadGB} GB runtime reserve.
            </p>
          </div>
          <div className="bg-card px-4 py-3">
            <p className="micro">Highest quant that fits</p>
            <p className="mt-1 font-mono text-[18px] font-semibold text-foreground">
              {result.maxQuantFitLabel ?? 'Nothing fits — reduce parameters'}
            </p>
            <p className="mt-1 text-[11.5px] leading-[1.6] text-muted-foreground">
              At the current {formatNumber(state.context)} token context on {result.hardware.name}.
            </p>
          </div>
        </div>
        {result.status === 'oom' ? (
          <div className="border-t border-border bg-bad/5 px-4 py-3">
            <p className="text-[12.5px] leading-[1.6] text-foreground">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bad">Short by </span>
              {Math.abs(result.headroomGB).toFixed(1)} GB. Reduce context, drop to{' '}
              {result.maxQuantFitLabel ?? 'a smaller model'}, or choose a card with more memory.
            </p>
          </div>
        ) : null}
      </section>

      {/* Presets */}
      <section aria-labelledby="vram-presets-heading" className="border border-border bg-card">
        <div className="border-b border-border px-4 py-2.5">
          <h2 id="vram-presets-heading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
            Saved configurations
          </h2>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="Name this config (e.g. Home rig 70B)"
              aria-label="Configuration name"
              className="min-h-[36px] flex-1 border border-input bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <button
              type="button"
              onClick={() => {
                if (!presetName.trim()) return;
                const payload = { ...state, kvQuantized } as unknown as VramState & { kvQuantized?: boolean };
                save(presetName, payload);
                setPresetName('');
              }}
              disabled={!presetName.trim()}
              className="inline-flex min-h-[36px] items-center bg-primary px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Save
            </button>
          </div>
          {presets.length === 0 ? (
            <p className="mt-3 text-[12.5px] text-muted-foreground">
              Configurations are stored in this browser only.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border border-t border-border">
              {presets.map((preset) => (
                <li key={preset.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const values = preset.values as VramState & { kvQuantized?: boolean };
                      update({
                        paramsB: values.paramsB,
                        quant: values.quant,
                        context: values.context,
                        hardware: values.hardware,
                      });
                      setKvQuantized(Boolean(values.kvQuantized));
                    }}
                    className="text-left text-[13px] text-foreground transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {preset.name}
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {(preset.values as VramState).paramsB}B · {(preset.values as VramState).quant} ·{' '}
                      {formatNumber((preset.values as VramState).context / 1024)}K
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(preset.id)}
                    aria-label={`Delete configuration ${preset.name}`}
                    className="inline-flex h-7 w-7 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-bad/10 hover:text-bad focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
