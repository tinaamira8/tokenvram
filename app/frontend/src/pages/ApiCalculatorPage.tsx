import { useCallback } from 'react';
import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { Breadcrumbs, PageHeader, ToolLayout } from '@/components/site/layout';
import { ToolSidebar } from '@/components/site/tool-sidebar';
import { ApiCostCalculator, API_COST_DEFAULTS, API_COST_SCHEMA, type ApiCostState } from '@/components/calc/api-cost-calculator';
import { ApiCostGuide } from '@/components/content/api-cost-guide';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { useUrlState } from '@/hooks/use-url-state';
import { Link } from 'react-router-dom';

const FAQ = [
  {
    q: 'How accurate is this LLM cost calculator?',
    a: 'It multiplies your traffic assumptions by published list prices, so the arithmetic is exact and the uncertainty is entirely in the inputs. Production prompts are usually longer than demo prompts because they include retrieved context and conversation history. Expect the estimate to land within about 15% of a real invoice once you measure actual token usage.',
  },
  {
    q: 'What is prompt caching and why does the hit-rate slider matter so much?',
    a: 'Providers keep the KV cache for an identical prompt prefix warm between calls and bill the repeated portion at a discount — typically 50% on OpenAI, about 90% on Anthropic and 74% on DeepSeek. If your app sends the same instructions and documents on every request, changing the hit rate from 0% to 80% can cut your input bill by two thirds or more.',
  },
  {
    q: 'Why are output tokens so much more expensive than input tokens?',
    a: 'A prompt is processed in one parallel pass, while each output token requires its own forward pass through the model. Generation is sequential and memory-bandwidth bound, so providers price output three to five times higher. Controlling max_tokens and using structured output are the most effective cost levers for chat workloads.',
  },
  {
    q: 'Should I calculate tokens per request or per conversation?',
    a: 'Use per-request totals including the full prompt. In a multi-turn chat, resending history means turn ten carries nine prior exchanges — a conversation that starts at 800 tokens can reach 8,000 by the end. Either summarize history after six to eight turns or model the average across the conversation.',
  },
  {
    q: 'Do these prices include batch discounts or provisioned throughput?',
    a: 'No. Both OpenAI and Anthropic offer roughly 50% discounts for asynchronous batch jobs, and provisioned throughput trades a commitment for a lower per-token rate. If your workload is batchable, halve the token costs shown here as a first approximation.',
  },
  {
    q: 'How do reasoning models change the calculation?',
    a: 'Reasoning models like o3-mini or DeepSeek R1 generate hidden thinking tokens that are billed at the output rate. A request with a 400-token visible answer can bill 3,000–6,000 output tokens. Enter total billable output, not visible answer length, or the estimate will be far too optimistic.',
  },
];

export default function ApiCalculatorPage() {
  const handleExternalChange = useCallback(() => undefined, []);
  const { state, update, shareUrl } = useUrlState<ApiCostState>(
    API_COST_SCHEMA as never,
    handleExternalChange,
  );

  return (
    <>
      <Seo
        title="LLM API Cost Calculator — GPT-4o, Claude, Gemini, DeepSeek, Llama"
        description="Calculate monthly LLM API spend across OpenAI, Anthropic, Google Gemini, DeepSeek and Meta Llama. Model input, output and prompt-cache savings, then share the exact scenario by link."
        path="/api-calculator"
        application={{
          name: 'LLM API Cost Calculator',
          description:
            'Interactive calculator that compares monthly token costs across major LLM providers with prompt caching, shareable links and CSV export.',
          category: 'DeveloperApplication',
        }}
        faq={FAQ}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'API cost calculator', path: '/api-calculator' },
        ]}
      />

      <ToolLayout
        sidebar={<ToolSidebar tool="api" title="Popular cost comparisons" />}
      >
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'API cost calculator' }]} />
        <PageHeader
          kicker="Tool 01 — Token economics"
          title="LLM API cost calculator"
          lede="Model your real workload once and compare fifteen models across five providers. Input, cached input and output tokens are priced separately, with cache savings isolated so you can see what a warm prompt prefix is worth."
          meta={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
              <span>15 models · 5 providers</span>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span>Shareable via URL</span>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span>CSV export</span>
            </div>
          }
        />

        <div className="mt-6">
          <ApiCostCalculator state={state} update={update} shareUrl={shareUrl} />
        </div>

        <div className="mt-6">
          <AdSlot id="api-inline" format="horizontal" />
        </div>

        <ApiCostGuide />
        <FaqAccordion items={FAQ} />

        <div className="mt-10 border border-border bg-muted/40 p-4">
          <p className="micro">Next</p>
          <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted-foreground">
            Deciding whether to self-host instead?{' '}
            <Link
              to="/vram-calculator"
              className="text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Check the local hardware requirements
            </Link>{' '}
            for the same model and compare the break-even point against API pricing.
          </p>
        </div>
      </ToolLayout>

      <div className="mx-auto mt-10 w-full max-w-[1240px] px-4 sm:px-6">
        <AdSlot id="api-footer" format="horizontal" />
      </div>
    </>
  );
}

export { API_COST_DEFAULTS };
