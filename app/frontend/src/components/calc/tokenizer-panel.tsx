import { useState } from 'react';
import { Trash2, Code2 } from 'lucide-react';
import { estimateTokens } from '@/lib/tokenize';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

const SAMPLE = `You are a senior support engineer for a SaaS billing product.
Answer only from the documentation below. If the answer is not present,
say you do not know and offer to escalate.

Documentation:
Invoices are generated on the first day of each month...
`;

interface TokenizerPanelProps {
  /** Called when the user applies the estimated token count to the workload inputs */
  onApply?: (tokens: number) => void;
}

export function TokenizerPanel({ onApply }: TokenizerPanelProps) {
  const [text, setText] = useState(SAMPLE);
  const [codeMode, setCodeMode] = useState(false);
  const estimate = estimateTokens(text, codeMode);

  const metrics = [
    { label: 'Characters', value: formatNumber(estimate.chars) },
    { label: 'Words', value: formatNumber(estimate.words) },
    { label: 'Lines', value: formatNumber(estimate.lines) },
    { label: 'Est. tokens', value: formatNumber(estimate.tokens) },
    { label: 'Chars / token', value: estimate.charsPerToken.toFixed(1) },
  ];

  return (
    <div className="border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">Prompt tokenizer</h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCodeMode((mode) => !mode)}
            aria-pressed={codeMode}
            className={cn(
              'inline-flex min-h-[32px] items-center gap-1.5 border px-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              codeMode
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
            )}
          >
            <Code2 className="h-3 w-3" aria-hidden="true" />
            Code text
          </button>
          <button
            type="button"
            onClick={() => setText('')}
            aria-label="Clear prompt text"
            className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <label htmlFor="prompt-text" className="micro">
          Paste a system prompt or document
        </label>
        <textarea
          id="prompt-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          spellCheck={false}
          placeholder="Paste your prompt, document or code sample…"
          className="mt-2 w-full resize-y border border-input bg-background p-3 font-mono text-[12.5px] leading-[1.7] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        />

        <dl className="mt-3 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-5">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-card px-3 py-2.5">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{metric.label}</dt>
              <dd className="tnum mt-1 font-mono text-[16px] font-semibold leading-none text-foreground">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[52ch] text-[11.5px] leading-[1.6] text-muted-foreground">
            Heuristic: {estimate.charsPerToken.toFixed(1)} characters per token
            {codeMode ? ' for source code' : ' for English prose'}. Real tokenizers vary by ±10%.
          </p>
          {onApply ? (
            <button
              type="button"
              onClick={() => onApply(Math.max(1, estimate.tokens))}
              className="inline-flex min-h-[34px] items-center border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Use as input tokens
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
