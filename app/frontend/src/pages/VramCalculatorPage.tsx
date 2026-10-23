import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { Breadcrumbs, PageHeader, ToolLayout } from '@/components/site/layout';
import { ToolSidebar } from '@/components/site/tool-sidebar';
import { VramCalculator, VRAM_DEFAULTS, VRAM_SCHEMA, type VramState } from '@/components/calc/vram-calculator';
import { VramGuide } from '@/components/content/vram-guide';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { useUrlState } from '@/hooks/use-url-state';

const FAQ = [
  {
    q: 'How much VRAM does a 7B model need?',
    a: 'A 7B model at Q4_K_M needs about 4.2 GB of weights, roughly 0.5 GB of KV cache at an 8K context, and about 1.5 GB of runtime overhead — call it 6.2 GB total. FP16 would need about 14.4 GB of weights alone, which is why quantization is the norm for consumer GPUs.',
  },
  {
    q: 'Why is my model using more memory than the weights suggest?',
    a: 'Three things add up. GGUF quantizations store block scales, so Q4_K_M is effectively 4.83 bits per weight rather than 4. The KV cache grows linearly with context length and can easily exceed the weights at long contexts. And the driver, CUDA context and attention workspace reserve 1–2 GB before inference begins.',
  },
  {
    q: 'What is KV cache quantization and should I use it?',
    a: 'It stores the attention keys and values at 8 bits instead of 16, halving KV cache memory with negligible quality impact. Enable it when you are within a few gigabytes of your memory ceiling, or when you want a long context on a card that is already mostly full.',
  },
  {
    q: 'Does mixture-of-experts reduce VRAM requirements?',
    a: 'No. MoE reduces the compute per token because only a fraction of experts activate, which improves throughput. But every expert must still be resident in memory, so a 671B MoE model needs the same memory as a dense 671B model.',
  },
  {
    q: 'How accurate are the tokens-per-second estimates?',
    a: 'They use a bandwidth-bound model: peak memory bandwidth divided by bytes read per token, tempered by a 0.65 efficiency factor. Real throughput depends on your runtime, prompt processing time, batch size and power limits, so treat the figure as a tier indicator rather than a benchmark.',
  },
  {
    q: 'Can I run a model that does not fit by offloading to CPU?',
    a: 'Yes — llama.cpp will move layers to system RAM and stream them over PCIe. It works, but throughput falls to single-digit tokens per second because PCIe delivers 16–64 GB/s against a GPU\'s 500–3000 GB/s. It is a way to run something you cannot load, not a way to run it well.',
  },
];

export default function VramCalculatorPage() {
  const handleExternalChange = useCallback(() => undefined, []);
  const { state, update, shareUrl } = useUrlState<VramState>(VRAM_SCHEMA as never, handleExternalChange);

  return (
    <>
      <Seo
        title="Can I Run This LLM? VRAM & GPU Memory Calculator"
        description="Calculate the VRAM needed to run any LLM locally: model weights, KV cache and runtime overhead, with a fit verdict for RTX, A100, dual-GPU and Apple unified memory setups."
        path="/vram-calculator"
        application={{
          name: 'LLM VRAM Calculator',
          description:
            'Interactive calculator that estimates model weight, KV cache and overhead memory for local LLM inference across GPUs and Apple unified memory.',
          category: 'DeveloperApplication',
        }}
        faq={FAQ}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'VRAM calculator', path: '/vram-calculator' },
        ]}
      />

      <ToolLayout sidebar={<ToolSidebar tool="vram" title="Popular hardware checks" />}>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'VRAM calculator' }]} />
        <PageHeader
          kicker="Tool 02 — Hardware feasibility"
          title="Can I run this LLM?"
          lede="Pick a parameter count, a quantization and a context length, then see the exact memory bill: weights, KV cache and runtime overhead against the card you actually own. The verdict is colour-coded, and the shortfall is quantified in gigabytes."
          meta={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
              <span>15 hardware targets</span>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span>7 quantization levels</span>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span>KV cache aware</span>
            </div>
          }
        />

        <div className="mt-6">
          <VramCalculator state={state} update={update} shareUrl={shareUrl} />
        </div>

        <div className="mt-6">
          <AdSlot id="vram-inline" format="horizontal" />
        </div>

        <VramGuide />
        <FaqAccordion items={FAQ} />

        <div className="mt-10 border border-border bg-muted/40 p-4">
          <p className="micro">Next</p>
          <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted-foreground">
            Wondering whether self-hosting is worth it?{' '}
            <Link
              to="/api-calculator"
              className="text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Compare against hosted API pricing
            </Link>{' '}
            at your real request volume and find the break-even point.
          </p>
        </div>
      </ToolLayout>

      <div className="mx-auto mt-10 w-full max-w-[1240px] px-4 sm:px-6">
        <AdSlot id="vram-footer" format="horizontal" />
      </div>
    </>
  );
}

export { VRAM_DEFAULTS };
