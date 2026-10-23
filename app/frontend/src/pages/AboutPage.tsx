import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { Breadcrumbs, PageHeader, SimpleLayout } from '@/components/site/layout';

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Modelmath — How Our Calculators Are Verified"
        description="Modelmath builds transparent, client-side calculators for LLM API costs and local inference hardware. Read our mission, methodology and developer transparency commitments."
        path="/about"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
      />
      <SimpleLayout>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
        <PageHeader
          kicker="About"
          title="Numbers you can audit"
          lede="Modelmath exists because AI infrastructure decisions are routinely made on vibes. A team picks a model from a benchmark chart and discovers the invoice three weeks later, or buys a GPU that cannot hold the context window it needs."
        />

        <div className="prose-modelmath mt-8 space-y-8">
          <section>
            <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-foreground">Mission</h2>
            <p className="mt-2 text-[14px] leading-[1.75] text-foreground/80">
              Give developers a fast, honest instrument for two decisions that determine most of an AI product's
              operating cost: which model to call, and whether to run it yourself. Both answers are arithmetic, not
              opinion — so both should be visible, adjustable and shareable rather than buried in a sales deck.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-foreground">
              How the calculations are verified
            </h2>
            <p className="mt-2 text-[14px] leading-[1.75] text-foreground/80">
              Every formula on this site is deterministic and implemented in a small, readable module. There are no
              hidden fudge factors, and nothing is fetched from a third-party API at runtime.
            </p>
            <ul className="mt-3 space-y-2.5">
              {[
                'API costs use published list prices per million tokens, multiplied by explicit request and token counts. Cached input is priced separately using each provider\'s published cache rate.',
                'VRAM estimates use effective bits per weight for GGUF quantization — 4.83 for Q4_K_M, not 4 — because block scales genuinely consume memory.',
                'KV cache uses the real GQA layer and head counts of known architectures, so grouped-query models are not over-estimated by 8×.',
                'Usable memory applies a per-device ratio: 90% on consumer GPUs, 95% on workstation cards, and 70–72% on Apple silicon where macOS needs headroom.',
                'Speed tiers derive from memory bandwidth divided by bytes read per token, tempered by an efficiency factor rather than marketing claims.',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-[13.5px] leading-[1.7] text-foreground/80">
                  <span className="mt-[7px] h-[5px] w-[5px] shrink-0 bg-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[14px] leading-[1.75] text-foreground/80">
              Where an input is uncertain — token-to-character ratios, effective bandwidth under real workloads, list
              prices that change quarterly — we say so on the page rather than implying false precision.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-foreground">
              Developer transparency
            </h2>
            <p className="mt-2 text-[14px] leading-[1.75] text-foreground/80">
              Everything runs in your browser. Your prompts, token counts and hardware selections are never uploaded;
              saved presets live in your browser's local storage and can be deleted from the calculator at any time.
              There are no accounts, no analytics profiles and no cross-site tracking scripts.
            </p>
            <p className="mt-2 text-[14px] leading-[1.75] text-foreground/80">
              The site is supported by advertising. Ad slots are fixed-size, clearly labelled and never placed inside a
              calculator's result area or within 24 pixels of an interactive control. They load no scripts until an ad
              tag is installed, so the calculators stay fast.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-foreground">
              What we deliberately do not do
            </h2>
            <p className="mt-2 text-[14px] leading-[1.75] text-foreground/80">
              We do not publish benchmark leaderboards we have not run, we do not accept payment for ranking a provider
              higher in a comparison table, and we do not pretend a model fits when it would spill to system RAM. If a
              configuration is a bad idea, the verdict says so.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-foreground">Corrections</h2>
            <p className="mt-2 text-[14px] leading-[1.75] text-foreground/80">
              Pricing and hardware change constantly. If you spot an error, a stale price or a configuration we have
              modelled incorrectly, tell us through the contact page and we will correct it and credit the report where
              you want credit.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <AdSlot id="about-inline" format="horizontal" />
        </div>
      </SimpleLayout>
    </>
  );
}
