import { QuantizationTable } from './reference-tables';

/** 800+ word technical guide rendered below the VRAM calculator. */
export function VramGuide() {
  return (
    <article className="mt-12 max-w-[76ch]">
      <header className="border-t border-border pt-8">
        <p className="micro">Reference</p>
        <h2 className="mt-2 font-display text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[32px]">
          How local LLM memory math works
        </h2>
        <p className="mt-3 text-[14.5px] leading-[1.75] text-foreground/80">
          Running a model locally is a memory problem before it is a compute problem. Three numbers decide whether a
          model fits: the size of the quantized weights, the KV cache that grows with context length, and a fixed
          runtime reserve for activations, the CUDA context and the display. Get those three right and the rest of the
          configuration follows.
        </p>
      </header>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          1. Model weights
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Weight memory is a direct multiplication of parameter count and precision:
        </p>
        <div className="mt-3 border border-border bg-card p-4 font-mono text-[12.5px] leading-[1.9] text-foreground">
          <p>weights_GB = params × bits_per_weight / 8 / 1024³</p>
          <p className="text-muted-foreground">7B × 4.83 bits ≈ 4.2 GB &nbsp;|&nbsp; 70B × 4.83 bits ≈ 42.2 GB</p>
        </div>
        <p className="mt-3 text-[14px] leading-[1.75] text-foreground/80">
          The nominal label is not the real number. "Q4_K_M" is a 4-bit scheme, but the effective average is about 4.83
          bits per weight because each block of 32 weights stores scale and minimum values in higher precision. That
          overhead is why a 70B Q4 model is 42 GB rather than the 35 GB a naive 4-bit division suggests. The table
          below lists the effective bits per weight for the GGUF quantizations you will actually encounter.
        </p>
        <div className="mt-4">
          <QuantizationTable />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          2. The KV cache is the hidden cost
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Every generated token needs the attention keys and values of all previous tokens. That cache is held in
          memory for the whole session and scales linearly with context length:
        </p>
        <div className="mt-3 border border-border bg-card p-4 font-mono text-[12.5px] leading-[1.9] text-foreground">
          <p>kv_GB = 2 × layers × kv_heads × head_dim × bytes_per_element × tokens / 1024³</p>
          <p className="text-muted-foreground">
            70B, 80 layers, 8 KV heads, 128 dim, FP16: 0.3125 MB / token → 2.5 GB at 8K, 40 GB at 128K
          </p>
        </div>
        <p className="mt-3 text-[14px] leading-[1.75] text-foreground/80">
          Two modern techniques keep this manageable. Grouped-query attention (GQA) reduces KV heads from the full
          attention-head count — often 64 down to 8 — cutting the cache by eight times. KV cache quantization stores
          the cache at 8 bits instead of 16, halving it again with almost no measurable quality loss. Together they
          turn a 40 GB cache into about 2.5 GB, which is why a 128K-context model can fit on a 24 GB card at all.
        </p>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Note that long-reasoning models read the same math differently: a chain-of-thought trace of 20,000 tokens
          occupies cache as surely as a 20,000-token prompt. Budgeting context for a reasoning model means budgeting
          for its thinking, not just its input.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          3. Runtime overhead and usable memory
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          A model never gets the whole card. The graphics driver, the CUDA context, attention workspace and the
          compositor on a desktop system consume roughly 1–2 GB before inference starts. On Windows with a browser open
          it is usually worse. We reserve a flat 1.5 GB, and we apply a usable-memory ratio — 90% on consumer GPUs,
          95% on workstation cards, and 70–72% on Apple silicon, where macOS itself needs headroom to stay responsive.
        </p>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          This is the difference between "the math says 24 GB" and "it runs". A 70B Q4 model at 42 GB is not going to
          fit on a 48 GB card with a 32K context even though 42 is less than 48, because the cache and reserve add
          another 12 GB.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          4. Speed comes from memory bandwidth
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Token generation is memory-bandwidth bound, not compute bound. To emit one token, the GPU must read every
          active weight once. Theoretical throughput is therefore bandwidth divided by bytes read per token:
        </p>
        <div className="mt-3 border border-border bg-card p-4 font-mono text-[12.5px] leading-[1.9] text-foreground">
          <p>tokens_per_sec ≈ bandwidth_GB/s ÷ weights_GB</p>
          <p className="text-muted-foreground">
            RTX 4090 (1008 GB/s) with 8B Q4 (4.8 GB) ≈ 210 tok/s theoretical, ~40–70 measured
          </p>
        </div>
        <p className="mt-3 text-[14px] leading-[1.75] text-foreground/80">
          Real throughput lands at 40–70% of the theoretical ceiling because of kernel launch overhead, prompt
          processing, sampling and batch effects. This is why an RTX 5090 with 32 GB and 1792 GB/s is the strongest
          single-card option: it wins on both capacity and bandwidth at once. It is also why a 192 GB Mac Studio, with
          only about 819 GB/s, feels slow despite its enormous capacity.
        </p>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          When a model does not fit, llama.cpp offloads layers to system RAM and streams them over PCIe. Throughput
          collapses to single digits, because PCIe offers 16–64 GB/s against a GPU's 500–3000 GB/s. Partial offload is
          a way to run a model you cannot otherwise load — not a way to run it well.
        </p>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          5. Practical sizing rules
        </h3>
        <ul className="mt-3 space-y-2.5">
          {[
            '8 GB runs 3B–8B at Q4 with a modest context; good for autocomplete and small assistants.',
            '12–16 GB is the 8B sweet spot, or 14B at Q4 with 8K context.',
            '24 GB comfortably runs 32B at Q4 with 16K context — the best quality-per-dollar tier today.',
            '48 GB (dual 24 GB or one workstation card) reaches 70B at Q4 with a short context.',
            '80 GB+ handles 70B at Q8 or 120B-class MoE at Q4 with real context for serving.',
            'Every doubling of context roughly doubles KV cache; check that before buying a bigger model.',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-[14px] leading-[1.7] text-foreground/80">
              <span className="mt-[7px] h-[5px] w-[5px] shrink-0 bg-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.015em] text-foreground">
          Methodology and limitations
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.75] text-foreground/80">
          Weight estimates use effective bits per weight for GGUF quantization plus a 3% uplift for mixture-of-experts
          checkpoints, which carry router and shared-expert tensors on top of the nominal parameter count. KV cache uses
          GQA-aware layer and head counts matched to the nearest known architecture profile — if your model is not in
          the table, a custom parameter count is interpolated to the closest profile and can be off by 20–30%. Speed
          estimates assume single-stream decoding with full GPU offload. Actual performance depends on your runtime,
          batch size, power limits and driver version. Treat every number as a planning estimate, not a benchmark.
        </p>
      </section>
    </article>
  );
}
