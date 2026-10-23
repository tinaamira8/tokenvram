import { ModelReferenceTable } from './reference-tables';

/**
 * 800+ word technical guide rendered below the API cost calculator. Written to
 * satisfy AdSense "high value content" expectations and to answer the exact
 * query intent behind the pSEO landing pages.
 */
export function ApiCostGuide() {
  return (
    <article className="mt-12 max-w-[76ch]">
      <header className="border-t border-border pt-8">
        <p className="micro">Reference</p>
        <h2 className="mt-2 font-display text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[32px]">
          How LLM API token math actually works
        </h2>
        <p className="mt-3 text-[14.5px] leading-[1.75] text-foreground/80">
          Every hosted LLM bill reduces to four multiplied quantities: the number of requests, the tokens in each
          request, the tokens returned, and the price per million tokens for each direction. The complexity is not in
          the arithmetic — it is in knowing which tokens are billed where, and why cached input changes the answer so
          dramatically.
        </p>
      </header>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          1. The core cost formula
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Providers price input and output separately because they cost different amounts to serve. A prompt is
          processed once in parallel, while each generated token requires a full forward pass. Output tokens are
          therefore typically three to five times the price of input tokens on every major provider.
        </p>
        <div className="mt-4 border border-border bg-card p-4 font-mono text-[12.5px] leading-[1.9] text-foreground">
          <p>monthly_input  = requests × days × input_tokens × (price_in / 1,000,000)</p>
          <p>monthly_output = requests × days × output_tokens × (price_out / 1,000,000)</p>
          <p className="text-muted-foreground">
            monthly_total  = monthly_input × (1 − hit_rate) + monthly_input × hit_rate × (price_cached / price_in) + monthly_output
          </p>
        </div>
        <p className="mt-3 text-[14px] leading-[1.75] text-foreground/80">
          Set the requested rate above to your real traffic and you get a defensible budget number. The single most
          common estimation error is using an average request size drawn from a demo, where prompts are short and
          rarely include retrieved documents. Production prompts usually grow: a system instruction of 300 tokens, a
          retrieved context of 2,000–6,000 tokens, and a conversation history that accumulates on every turn.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          2. Why prompt caching is the biggest lever
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Caching works because most production prompts begin with the same bytes: the same instructions, the same
          tool definitions, often the same document preamble. Providers detect an identical prefix, keep its KV cache
          warm, and bill the repeated portion at a discount — 50% on OpenAI, roughly 90% on Anthropic, and about 74%
          on DeepSeek.
        </p>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Two conditions must hold. The cached prefix has to be byte-identical between calls, so never interpolate a
          timestamp or user ID into your system prompt. And the prefix must be long enough to qualify — Anthropic
          requires roughly 1,024 tokens, OpenAI 1,024 tokens. Structure prompts as static-first, variable-last, and
          this calculator's cache slider becomes the difference between a $400 and a $90 monthly bill.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          3. Token-to-character conversion is a heuristic
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          A BPE tokenizer splits text into sub-word units, so there is no exact character-per-token constant. For
          English prose, an average of four characters per token is reliable within about ten percent. Source code
          runs closer to 3.2 characters per token because identifiers, brackets and indentation fragment into many
          small tokens. Non-Latin scripts are dramatically worse: a Japanese or Chinese sentence may use one token per
          character or even less, which is why the same feature costs meaningfully more in those markets.
        </p>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          JSON and YAML sit between prose and code, and they inflate badly with whitespace — a pretty-printed payload
          can cost 30% more than the same data minified. If your workload is dominated by structured output, measure
          once with the provider's token-counting endpoint and trust that number over any ratio.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          4. Reasoning models break the output estimate
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Reasoning models generate hidden thinking tokens before the visible answer, and every provider bills those
          at the output rate. A request whose answer is 400 tokens may bill 3,000–6,000 output tokens. If you are
          budgeting for o-series or DeepSeek R1 workloads, read the reasoning token count from the usage object for a
          sample of real traffic before committing to a monthly number. Treat the output field above as total billable
          output, not visible answer length.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          5. Strategies that cut spend without hurting quality
        </h3>
        <ul className="mt-3 space-y-2.5">
          {[
            'Route by difficulty. A cheap classifier sends 70–80% of traffic to a budget model and escalates only hard cases.',
            'Cap output aggressively. max_tokens is your cheapest insurance against a model that decides to write an essay.',
            'Cache the static prefix. Move instructions, tool schemas and long documents to the front of the prompt, unchanged.',
            'Trim retrieved context. Halving retrieved chunks usually halves input cost with little quality loss after reranking.',
            'Batch what can wait. Both major providers discount asynchronous batch jobs by roughly 50%.',
            'Log real usage. Your provider dashboard reports actual tokens billed; reconcile it against this estimate monthly.',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-[14px] leading-[1.7] text-foreground/80">
              <span className="mt-[7px] h-[5px] w-[5px] shrink-0 bg-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          6. Current list pricing reference
        </h3>
        <p className="mt-2.5 mb-3 text-[14px] leading-[1.75] text-foreground/80">
          Prices below are USD per million tokens on the standard (non-batch, non-provisioned) tier. Providers change
          pricing frequently; verify against official documentation before signing a budget.
        </p>
        <ModelReferenceTable />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          Methodology and limitations
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          This calculator multiplies your inputs by published list prices. It does not model minimum billing
          increments, rate limits, provisioned throughput, fine-tuning storage, or regional price differences. Token
          estimates in the tokenizer are heuristics rather than tokenizer-specific counts. Treat the result as a
          planning figure accurate to roughly ±15%, and reconcile against a real invoice once you have production
          traffic.
        </p>
      </section>
    </article>
  );
}
