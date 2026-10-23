import { MODELS, MODEL_TIER_LABEL, PROVIDER_BY_KEY } from '@/data/models';
import { QUANTIZATIONS } from '@/data/hardware';
import { formatUsd } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Pricing + context reference table shared by both calculator pages. */
export function ModelReferenceTable({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-x-auto border border-border bg-card', className)}>
      <table className="w-full min-w-[620px] border-collapse text-left">
        <caption className="sr-only">Hosted LLM list pricing and context windows, USD per million tokens</caption>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th scope="col" className="px-3 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Model
            </th>
            <th scope="col" className="px-3 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Tier
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Input /1M
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Cached
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Output /1M
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Context
            </th>
          </tr>
        </thead>
        <tbody>
          {MODELS.map((model) => {
            const provider = PROVIDER_BY_KEY[model.provider];
            return (
              <tr key={model.id} className="border-b border-border/70 last:border-0">
                <th scope="row" className="px-3 py-2.5 text-left font-sans text-[13px] font-medium text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-[7px] w-[7px] shrink-0" style={{ backgroundColor: provider.color }} aria-hidden="true" />
                    {model.name}
                  </span>
                  <span className="mt-0.5 block pl-[15px] font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {provider.label}
                  </span>
                </th>
                <td className="px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {MODEL_TIER_LABEL[model.tier]}
                </td>
                <td className="tnum px-3 py-2.5 text-right font-mono text-[12.5px] text-foreground">
                  {formatUsd(model.input, { digits: 3 })}
                </td>
                <td className="tnum px-3 py-2.5 text-right font-mono text-[12.5px] text-muted-foreground">
                  {model.cachedInput === null ? '—' : formatUsd(model.cachedInput, { digits: 3 })}
                </td>
                <td className="tnum px-3 py-2.5 text-right font-mono text-[12.5px] text-foreground">
                  {formatUsd(model.output, { digits: 3 })}
                </td>
                <td className="tnum px-3 py-2.5 text-right font-mono text-[12.5px] text-muted-foreground">
                  {model.contextK >= 1000 ? `${model.contextK / 1000}M` : `${model.contextK}K`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Bits-per-weight reference, the core table for the VRAM calculator. */
export function QuantizationTable({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-x-auto border border-border bg-card', className)}>
      <table className="w-full min-w-[520px] border-collapse text-left">
        <caption className="sr-only">GGUF quantization levels, effective bits per weight and quality impact</caption>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th scope="col" className="px-3 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Quant
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Bits/weight
            </th>
            <th scope="col" className="px-3 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Quality
            </th>
            <th scope="col" className="px-3 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              When to use
            </th>
          </tr>
        </thead>
        <tbody>
          {QUANTIZATIONS.map((quant) => (
            <tr key={quant.id} className="border-b border-border/70 last:border-0">
              <th scope="row" className="px-3 py-2.5 text-left font-mono text-[12px] font-medium text-foreground">
                {quant.label}
              </th>
              <td className="tnum px-3 py-2.5 text-right font-mono text-[12.5px] text-foreground">
                {quant.bits.toFixed(2)}
              </td>
              <td className="px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {quant.quality}
              </td>
              <td className="px-3 py-2.5 text-[12.5px] leading-[1.55] text-muted-foreground">{quant.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
