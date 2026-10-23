#!/usr/bin/env node
/**
 * Programmatic SEO page generator.
 *
 * Builds model × quantization × hardware landing pages for the VRAM calculator
 * and merges them into src/data/seo-pages.json. Hand-written pages (no
 * `generated` flag) are preserved; previously generated pages are replaced, so
 * the script is idempotent.
 *
 * Numbers come from the app's own calculator (src/lib/vram.ts, loaded through
 * Vite's SSR module loader), so every page agrees with what the live
 * calculator renders after prefill.
 *
 * Usage: pnpm run generate:seo
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'src/data/seo-pages.json');
const WORD_MIN = 185;
const WORD_MAX = 230;
const RUNTIME_RESERVE_GB = 1.5;

const QUANT_SHORT = { fp16: 'FP16', q8_0: 'Q8_0', q5_k_m: 'Q5_K_M', q4_k_m: 'Q4_K_M' };

/** Models to pair. paramsB must resolve to the matching profile in ARCHITECTURES. */
const MODELS = [
  {
    key: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    fullName: 'Llama 3.3 70B Instruct',
    paramsB: 70,
    context: 8192,
    maxContext: 131072,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "Meta's 70-billion-parameter dense instruction model and the strongest openly licensed generalist in its class for chat, tool calling and multilingual work",
    useCase: 'a private general-purpose assistant or agent backend',
    extras: [
      'Its 128K-token native window is generous, but on local hardware the KV cache rather than the weights usually decides how much of it you can use.',
      'Because it is dense, every weight is read for each generated token, which is why memory bandwidth sets its speed ceiling.',
      'Grouped-query attention with eight KV heads keeps its cache roughly eight times smaller than full multi-head attention would.',
    ],
  },
  {
    key: 'deepseek-r1-7b',
    name: 'DeepSeek R1 7B',
    fullName: 'DeepSeek R1 Distill Qwen 7B',
    paramsB: 7.6,
    context: 16384,
    maxContext: 131072,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "the smallest practical member of DeepSeek's reasoning distills, a Qwen 2.5 7B base fine-tuned on R1 chain-of-thought traces",
    useCase: 'lightweight local reasoning on math and code problems',
    extras: [
      'Reasoning distills think out loud, so a single answer can consume several thousand tokens of chain-of-thought before the final reply appears.',
      'With only four KV heads across 28 layers, its cache is unusually light, which makes long reasoning traces affordable even on small cards.',
      "It inherits R1's step-by-step style on math and code, though it cannot match the full 671B model on breadth of knowledge.",
    ],
  },
  {
    key: 'deepseek-r1-14b',
    name: 'DeepSeek R1 14B',
    fullName: 'DeepSeek R1 Distill Qwen 14B',
    paramsB: 14.8,
    context: 16384,
    maxContext: 131072,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "DeepSeek's mid-sized reasoning distill, built on Qwen 2.5 14B and trained to reproduce R1's long chain-of-thought answers",
    useCase: 'local step-by-step reasoning for coding and analysis',
    extras: [
      'At roughly 14.8 billion parameters it is the smallest distill that reliably holds multi-step math and coding chains together.',
      'Its 48-layer stack carries a heavier KV cache per token than the 7B distill, so context length matters more here.',
      'Every answer is preceded by visible thinking tokens, so the wait for a final reply is longer than raw throughput suggests.',
    ],
  },
  {
    key: 'deepseek-r1-32b',
    name: 'DeepSeek R1 32B',
    fullName: 'DeepSeek R1 Distill Qwen 32B',
    paramsB: 32.8,
    context: 16384,
    maxContext: 131072,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "the largest Qwen-based R1 distill, widely regarded as the best quality-per-gigabyte local reasoning model",
    useCase: 'serious local reasoning work on math, code and planning',
    extras: [
      'Many practitioners consider it the strongest reasoning model that still fits on a single high-end consumer card.',
      'Its 64 layers make the KV cache a real budget item once reasoning traces run past 16K tokens.',
      'Thinking tokens are generated before every answer, so effective latency is far longer than the tokens-per-second figure alone implies.',
    ],
  },
  {
    key: 'deepseek-r1-70b',
    name: 'DeepSeek R1 70B',
    fullName: 'DeepSeek R1 Distill Llama 70B',
    paramsB: 70,
    context: 16384,
    maxContext: 131072,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "the largest R1 distill, which transplants DeepSeek's reasoning behaviour onto the Llama 3.3 70B architecture",
    useCase: 'the highest-quality local reasoning short of the full R1',
    extras: [
      'Because it shares the Llama 70B architecture, its memory profile matches Llama 3.3 70B while its outputs follow R1-style reasoning.',
      'Long chain-of-thought traces on a 70B model make capacity and bandwidth matter at the same time.',
      'Expect visibly better reasoning than the 32B distill, at roughly twice the memory and half the speed.',
    ],
  },
  {
    key: 'qwen-2-5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    fullName: 'Qwen 2.5 Coder 32B Instruct',
    paramsB: 32,
    context: 16384,
    maxContext: 131072,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "Alibaba's code-specialised 32B model, which scores close to frontier hosted models on code generation and repair benchmarks",
    useCase: 'a local coding assistant wired into an editor',
    extras: [
      'It is the default local coding model for many teams because it handles completion, refactoring and explanation in one checkpoint.',
      'Code tokenizes densely and repository context grows quickly, so budgeting 16K tokens or more is realistic for editor integrations.',
      'Fill-in-the-middle support makes it suitable for inline autocomplete as well as chat-style edits.',
    ],
  },
  {
    key: 'mistral-large-2',
    name: 'Mistral Large 2',
    fullName: 'Mistral Large 2 (123B)',
    paramsB: 123,
    context: 8192,
    maxContext: 131072,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "Mistral's 123-billion-parameter dense flagship, one of the largest open-weight models people seriously attempt to run outside a data centre",
    useCase: 'frontier-class quality on private hardware',
    extras: [
      'Its 88 layers make each thousand tokens of context noticeably more expensive than on 70B-class models.',
      "Mistral's research licence restricts commercial use, so check the terms before deploying it in a product.",
      'At this size, quantization choice moves the memory bill by tens of gigabytes rather than a few.',
    ],
  },
  {
    key: 'gemma-2-27b',
    name: 'Gemma 2 27B',
    fullName: 'Gemma 2 27B Instruct',
    paramsB: 27,
    context: 8192,
    maxContext: 8192,
    quants: ['q4_k_m', 'q5_k_m', 'q8_0'],
    blurb:
      "Google's 27B open model, distilled from larger Gemini-family teachers and strong on writing and reasoning for its size",
    useCase: 'a capable mid-sized writing and analysis assistant',
    extras: [
      'Gemma 2 is limited to an 8K-token context window, so its KV cache stays bounded however the runtime is configured.',
      'Its 16 KV heads make the cache per token larger than Llama-style models with eight heads, despite the smaller parameter count.',
      'Distillation training lets it punch above its 27B size on reasoning and long-form writing.',
    ],
  },
];

/** One extra variant brings the total to exactly 25 model/quant pairs × 6 targets = 150 pages. */
const EXTRA_VARIANTS = [{ model: 'deepseek-r1-7b', quant: 'fp16' }];

const HARDWARE_TARGETS = [
  {
    id: 'rtx-3060-12',
    slug: 'rtx-3060',
    kind: 'gpu',
    blurb: 'It remains the cheapest 12 GB NVIDIA card, but its 360 GB/s bus is slow by current standards.',
    extras: [
      'Twelve gigabytes is the practical floor for local LLM work, comfortably covering 7B and 8B models with room for context.',
      'CUDA support in llama.cpp, Ollama and vLLM is mature, so software compatibility is never the bottleneck on this card.',
      'Power draw around 170 W makes it an easy upgrade for older desktops without a new power supply.',
    ],
  },
  {
    id: 'rtx-4070-ti-12',
    slug: 'rtx-4070-ti',
    kind: 'gpu',
    blurb: 'It pairs 12 GB with a much faster 504 GB/s bus, trading capacity for speed relative to 16 GB cards.',
    extras: [
      'Its Ada Lovelace architecture is efficient, though local LLM speed still tracks memory bandwidth rather than compute.',
      'Twelve gigabytes means larger models hit the capacity wall long before they hit any compute limit.',
      'Many owners pair it with 64 GB of system RAM so partially offloaded models at least load.',
    ],
  },
  {
    id: 'rtx-4090-24',
    slug: 'rtx-4090',
    kind: 'gpu',
    blurb: 'At 1,008 GB/s it is the fastest 24 GB consumer card and the reference point for single-GPU local inference.',
    extras: [
      'Twenty-four gigabytes is where 27B to 32B models become comfortable rather than compromised.',
      'Its 450 W board power needs a serious power supply and good case airflow for sustained inference.',
      'Adding a second 4090 is the most common upgrade path once a single card runs out of memory.',
    ],
  },
  {
    id: 'rtx-5090-32',
    slug: 'rtx-5090',
    kind: 'gpu',
    blurb: 'Its 32 GB of GDDR7 at 1,792 GB/s make it the strongest single consumer card for local models.',
    extras: [
      'The extra 8 GB over a 4090 is precisely what lets 32B-class models run at higher quantizations with long context.',
      "Blackwell's bandwidth uplift translates almost directly into faster token generation on memory-bound decoding.",
      'At up to 575 W it needs a modern power supply with the 12V-2x6 connector.',
    ],
  },
  {
    id: 'mac-mini-m4-pro-64',
    slug: 'mac-mini-m4-pro-64gb',
    kind: 'mac',
    blurb: 'Its 64 GB of unified memory buys capacity no consumer GPU offers, but 273 GB/s of bandwidth limits speed.',
    extras: [
      'macOS reserves part of unified memory for the system, so roughly 45 GB is realistically available to a model.',
      'Drawing well under 100 W under load, it is the most power-efficient way to host a 30B-class model at home.',
      "MLX and llama.cpp's Metal backend both support it well, and MLX often decodes slightly faster on Apple silicon.",
    ],
  },
  {
    id: 'mac-m2-ultra-64',
    slug: 'mac-studio-m2-ultra',
    kind: 'mac',
    blurb: "It combines 64 GB of unified memory with 800 GB/s of bandwidth, nearly three times the Mac Mini M4 Pro's ceiling.",
    extras: [
      'Usable memory is still capped near 46 GB after macOS takes its share, so its capacity matches the Mac Mini while its speed does not.',
      'Its bandwidth puts it close to an RTX 3090 for token generation while drawing a fraction of the power.',
      'The wider GPU also accelerates prompt processing, which matters for long-context and retrieval workloads.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const fixed = (value, digits = 1) => value.toFixed(digits);
const ctxLabel = (tokens) => `${Math.round(tokens / 1024)}K`;
const floorK = (tokens) => Math.max(0, Math.floor(tokens / 1024) * 1024);
/** "an 8K context" / "a 16K context". */
const withArticle = (label) => `${/^(8|11|18)/.test(label) ? 'an' : 'a'} ${label}`;
const wordCount = (text) => text.trim().split(/\s+/).length;
const quantSlug = (id) => id.replace(/_/g, '-');

function formatTps(tps) {
  if (tps < 1) return 'under 1';
  return tps < 10 ? tps.toFixed(1) : String(Math.round(tps));
}

function speedPhrase(tps) {
  if (tps >= 40) return 'which is faster than most people read';
  if (tps >= 20) return 'which feels comfortably interactive';
  if (tps >= 8) return 'which is usable for single-user chat';
  if (tps >= 2) return 'slow enough that you will watch every word arrive';
  return 'which is too slow for interactive use';
}

// ---------------------------------------------------------------------------
// Copy builders
// ---------------------------------------------------------------------------

/**
 * Four opening structures. Picking one per page (deterministically, from the
 * model/hardware/verdict triple) keeps neighbouring pages from starting the same
 * way, which matters when a search engine sees 150 of them side by side.
 */
const SUMMARY_SHAPES = ['verdict-first', 'math-first', 'workload-first', 'machine-first'];

const SHAPE_CLOSERS = [
  (model, descriptor) => `For ${model.useCase}, this is ${descriptor}.`,
  (model, descriptor) => `Judged purely as hardware for ${model.useCase}, it is ${descriptor}.`,
  (model, descriptor) => `If ${model.useCase} is the goal, treat this machine as ${descriptor}.`,
  (model, descriptor) => `As a platform for ${model.useCase}, call it ${descriptor}.`,
];

function pickShape({ model, target, quant, result }) {
  const seed = `${model.key}|${target.id}|${quant.id}|${result.status}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  const bias = result.status === 'oom' ? 2 : result.status === 'tight' ? 1 : 0;
  return (hash + bias) % SUMMARY_SHAPES.length;
}

function openSentences({ model, target, hw, quant, result }) {
  const isMac = target.kind === 'mac';
  const memType = isMac ? 'unified memory' : 'VRAM';
  const qs = QUANT_SHORT[quant.id];
  const bits = fixed(quant.bits, 2);
  const w = fixed(result.weightsGB);
  const kv = fixed(result.kvCacheGB, 2);
  const total = fixed(result.totalGB);
  const usable = fixed(result.usableMemoryGB);
  const ctx = ctxLabel(model.context);
  // "an 8K-token context" but "a 16K-token context".
  const ctxArticle = /^(8|11|18)/.test(ctx) ? 'an' : 'a';

  const modelLines = [
    `On the ${hw.name}, the question is whether ${model.fullName} — ${model.blurb} — can stay in memory.`,
    `This pairing puts ${model.fullName} — ${model.blurb} — on the ${hw.name}.`,
    `The subject is ${model.fullName}, ${model.blurb}, measured against the ${hw.name}.`,
  ];
  const memoryLines = [
    `At ${qs} (${bits} bits per weight) its weights occupy ${w} GB, and ${ctxArticle} ${ctx}-token context adds ${kv} GB of KV cache, for roughly ${total} GB including the ${RUNTIME_RESERVE_GB} GB runtime reserve.`,
    `The arithmetic is ${w} GB of ${qs} weights, plus ${kv} GB of KV cache at ${ctx} tokens, plus ${RUNTIME_RESERVE_GB} GB of runtime overhead: ${total} GB in total.`,
    `Budget ${total} GB before anything is generated — ${w} GB for ${qs} weights, ${kv} GB for the KV cache across ${ctx} tokens, and ${RUNTIME_RESERVE_GB} GB of fixed overhead.`,
  ];
  const machineLines = [
    `The ${hw.name} provides ${hw.memoryGB} GB of ${memType}, of which about ${usable} GB is realistically usable by ${model.name}.`,
    `Against that, the ${hw.name} offers ${hw.memoryGB} GB of ${memType}; roughly ${usable} GB survives the driver or OS reservation.`,
    `For ${model.name}, the ${hw.name} contributes ${hw.memoryGB} GB of ${memType}, leaving about ${usable} GB for weights, cache and activations.`,
  ];
  const pair = `${model.name} at ${qs} on the ${hw.name}`;
  const verdictLines = {
    comfortable: [`Short answer for ${pair}: yes, comfortably.`, `${pair} fits, with room to spare.`, `${pair} works.`],
    tight: [`Short answer for ${pair}: it fits, but barely.`, `${pair} loads, though not comfortably.`, `${pair} is a marginal fit.`],
    oom: [`Short answer for ${pair}: no.`, `${pair} does not fit.`, `${pair} runs out of memory.`],
  };

  const shapeIndex = pickShape({ model, target, quant, result });
  const pick = (pool) => pool[shapeIndex % pool.length];
  const verdict = pick(verdictLines[result.status]);

  const orders = {
    'verdict-first': [verdict, pick(modelLines), pick(memoryLines), pick(machineLines)],
    'math-first': [pick(memoryLines), pick(machineLines), verdict, pick(modelLines)],
    'workload-first': [
      pick(modelLines),
      `In practice the target workload is ${model.useCase}.`,
      pick(memoryLines),
      pick(machineLines),
    ],
    'machine-first': [pick(machineLines), target.blurb, verdict, pick(memoryLines)],
  };

  return { sentences: orders[SUMMARY_SHAPES[shapeIndex]], shapeIndex };
}

function buildSummary({ model, target, hw, quant, result, altHardware, fitsInstead }) {
  const isMac = target.kind === 'mac';
  const memType = isMac ? 'unified memory' : 'VRAM';
  const home = isMac ? 'in unified memory' : 'on the GPU';
  const usableCtx = Math.min(floorK(result.maxContextTokens), model.maxContext);
  const qs = QUANT_SHORT[quant.id];

  const { sentences, shapeIndex } = openSentences({ model, target, hw, quant, result });
  void memType;

  if (result.status === 'comfortable') {
    sentences.push(
      usableCtx >= model.maxContext
        ? `That leaves ${fixed(result.headroomGB)} GB of headroom, so the whole model stays ${home} and even the full ${ctxLabel(model.maxContext)} native context window fits.`
        : `That leaves ${fixed(result.headroomGB)} GB of headroom, so the whole model stays ${home} and the context can stretch to about ${ctxLabel(usableCtx)} tokens before memory runs out.`,
    );
  } else if (result.status === 'tight') {
    sentences.push(
      `That is only ${fixed(result.headroomGB)} GB under the ceiling, so it loads, but extra context, an open browser or a second model can tip it into ${isMac ? 'swapping' : 'CPU offload'}.`,
    );
  } else {
    sentences.push(
      isMac
        ? `That overshoots usable memory by ${fixed(result.cpuSpillGB)} GB, so macOS starts swapping to the SSD and the model either refuses to load or crawls.`
        : `That overshoots usable memory by ${fixed(result.cpuSpillGB)} GB, so only about ${Math.round(result.gpuOffloadPct)}% of the model stays on the GPU and the rest spills to system RAM over PCIe.`,
    );
  }

  sentences.push(
    `Decoding is memory-bandwidth bound, so expect roughly ${formatTps(result.estimatedTokensPerSec)} tokens per second, ${speedPhrase(
      result.estimatedTokensPerSec,
    )}.`,
  );

  if (result.status === 'oom') {
    if (fitsInstead && fitsInstead.modelKey !== model.key) {
      sentences.push(
        `The largest model in this set that does run comfortably on the ${hw.name} is ${fitsInstead.label}, at about ${fitsInstead.tps} tokens per second — a far better use of this machine.`,
      );
    }
    if (result.maxQuantFitLabel) {
      sentences.push(`Dropping to ${result.maxQuantFitLabel} would bring it inside the limit at this context, at some cost in output quality.`);
    } else if (altHardware) {
      sentences.push(`No quantization in our table fits at this context, so the realistic upgrade is the ${altHardware.name} or larger.`);
    } else {
      sentences.push('Nothing in our hardware list holds it at this quantization, so a multi-GPU server is the realistic path.');
    }
  } else if (result.status === 'tight') {
    sentences.push(
      `Enabling an 8-bit KV cache or keeping prompts under about ${ctxLabel(Math.max(2048, floorK(result.maxContextTokens * 0.85)))} tokens restores a safe margin.`,
    );
  } else if (result.maxQuantFitLabel && result.maxQuantFitLabel !== quant.label) {
    sentences.push(`There is enough spare memory to step up to ${result.maxQuantFitLabel} for slightly better fidelity.`);
  } else {
    sentences.push('This is already the highest-fidelity quantization the machine can hold at this context.');
  }

  const descriptor =
    result.status === 'oom'
      ? 'a non-starter without a different quantization or more memory'
      : result.status === 'tight'
        ? 'workable but fragile'
        : result.estimatedTokensPerSec >= 20
          ? 'a genuinely responsive setup'
          : 'usable for one person at a time';
  const closing = SHAPE_CLOSERS[shapeIndex % SHAPE_CLOSERS.length](model, descriptor);

  // Pad with model- and hardware-specific detail until the paragraph reaches the
  // target length, then trim if this shape ran long. The closing sentence always
  // ends the paragraph, so every page finishes on its verdict.
  const pool = shapeIndex % 2 === 0 ? [...model.extras, ...target.extras] : [...target.extras, ...model.extras];
  const body = [...sentences];
  let text = [...body, closing].join(' ');
  while (wordCount(text) < WORD_MIN && pool.length > 0) {
    body.push(pool.shift());
    text = [...body, closing].join(' ');
  }
  while (wordCount(text) > WORD_MAX && body.length > sentences.length) {
    body.pop();
    text = [...body, closing].join(' ');
  }
  return text;
}

function buildFaq({ model, hw, quant, result }) {
  const qs = QUANT_SHORT[quant.id];
  const usableCtx = Math.min(floorK(result.maxContextTokens), model.maxContext);
  return [
    {
      q: `How much memory does ${model.name} need at ${qs}?`,
      a: `About ${fixed(result.weightsGB)} GB for the weights, plus ${fixed(result.kvCacheGB, 2)} GB of KV cache at ${withArticle(
        ctxLabel(model.context),
      )} context and a ${RUNTIME_RESERVE_GB} GB runtime reserve — roughly ${fixed(result.totalGB)} GB in total. Each additional 1K tokens of context adds about ${fixed(
        (result.kvCacheGB / model.context) * 1024 * 1024,
        0,
      )} MB of cache at FP16.`,
    },
    {
      q: `How fast is ${model.name} ${qs} on the ${hw.name}?`,
      a: `Around ${formatTps(result.estimatedTokensPerSec)} tokens per second in single-stream decoding, estimated from the ${hw.name}'s ${hw.bandwidth} GB/s memory bandwidth${
        result.status === 'oom' ? ' with the overflow streamed from system memory' : ''
      }. Real throughput varies with runtime, prompt length and power limits.`,
    },
    {
      q: `What is the longest context ${model.name} ${qs} supports on the ${hw.name}?`,
      a:
        usableCtx > 0
          ? `About ${ctxLabel(usableCtx)} tokens with an FP16 KV cache${
              usableCtx >= model.maxContext ? ', which is the model’s full native window' : ''
            }. An 8-bit KV cache roughly doubles that headroom with negligible quality loss.`
          : `None at this quantization — the weights alone exceed the ${fixed(result.usableMemoryGB)} GB of usable memory, so a smaller quantization or more memory is required before context even enters the picture.`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

async function loadCalculatorModules() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: { ignored: ['**/*'] } },
    resolve: { alias: { '@': path.join(ROOT, 'src') } },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const vram = await server.ssrLoadModule('/src/lib/vram.ts');
    const hardware = await server.ssrLoadModule('/src/data/hardware.ts');
    return { vram, hardware };
  } finally {
    await server.close();
  }
}

function buildCombos() {
  const combos = [];
  for (const model of MODELS) {
    const quants = [...model.quants, ...EXTRA_VARIANTS.filter((v) => v.model === model.key).map((v) => v.quant)];
    for (const quantId of quants) {
      for (const target of HARDWARE_TARGETS) combos.push({ model, quantId, target });
    }
  }
  return combos;
}

async function main() {
  const { vram, hardware } = await loadCalculatorModules();
  const { HARDWARE_BY_ID, QUANTIZATION_BY_ID, HARDWARE, resolveArchitecture } = hardware;

  for (const model of MODELS) {
    const arch = resolveArchitecture(model.paramsB);
    if (Math.abs(arch.paramsB - model.paramsB) > 1) {
      throw new Error(`${model.name}: no architecture profile near ${model.paramsB}B (got ${arch.label})`);
    }
  }
  for (const target of HARDWARE_TARGETS) {
    if (!HARDWARE_BY_ID[target.id]) throw new Error(`Unknown hardware id ${target.id}`);
  }

  const existing = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  const handWritten = existing.pages.filter((page) => !page.generated);
  const takenSlugs = new Set(handWritten.map((page) => page.slug));

  const compute = (model, quantId, hardwareId) =>
    vram.computeVram({ paramsB: model.paramsB, quantId, contextTokens: model.context, hardwareId, kvQuantized: false });

  const combos = buildCombos();

  /**
   * Largest model × quantization in this set that runs comfortably on a target —
   * the answer a searcher on an out-of-memory page actually wants.
   */
  const bestFitCache = new Map();
  const bestFitOn = (target) => {
    if (bestFitCache.has(target.id)) return bestFitCache.get(target.id);
    let best;
    for (const combo of combos) {
      if (combo.target.id !== target.id) continue;
      const fit = compute(combo.model, combo.quantId, target.id);
      if (fit.status !== 'comfortable') continue;
      const bits = QUANTIZATION_BY_ID[combo.quantId].bits;
      if (
        !best ||
        combo.model.paramsB > best.paramsB ||
        (combo.model.paramsB === best.paramsB && bits > best.bits)
      ) {
        best = {
          modelKey: combo.model.key,
          paramsB: combo.model.paramsB,
          bits,
          slug: `${combo.model.key}-${quantSlug(combo.quantId)}-${target.slug}`,
          label: `${combo.model.name} at ${QUANT_SHORT[combo.quantId]}`,
          tps: formatTps(fit.estimatedTokensPerSec),
        };
      }
    }
    bestFitCache.set(target.id, best);
    return best;
  };
  const generated = combos.map(({ model, quantId, target }) => {
    const quant = QUANTIZATION_BY_ID[quantId];
    if (!quant) throw new Error(`Unknown quantization ${quantId}`);
    const hw = HARDWARE_BY_ID[target.id];
    const result = compute(model, quantId, target.id);
    const qs = QUANT_SHORT[quantId];

    const altHardware =
      result.status === 'oom'
        ? [...HARDWARE]
            .filter((candidate) => compute(model, quantId, candidate.id).status !== 'oom')
            .sort((a, b) => a.memoryGB - b.memoryGB || b.bandwidth - a.bandwidth)[0]
        : undefined;
    const fitsInstead = result.status === 'oom' ? bestFitOn(target) : undefined;

    const verdictShort = { comfortable: 'Runs comfortably', tight: 'Tight fit', oom: 'Out of memory' }[result.status];
    const verdict =
      result.status === 'comfortable'
        ? `Yes. ${model.name} at ${qs} runs entirely on the ${hw.name} with ${fixed(result.headroomGB)} GB to spare at ${withArticle(
            ctxLabel(model.context),
          )} context, at roughly ${formatTps(result.estimatedTokensPerSec)} tokens per second.`
        : result.status === 'tight'
          ? `Barely. It fits with only ${fixed(result.headroomGB)} GB spare at ${withArticle(
              ctxLabel(model.context),
            )} context — quantize the KV cache or shorten prompts to keep it stable.`
          : `No. It needs about ${fixed(result.totalGB)} GB against ${fixed(result.usableMemoryGB)} GB usable — ${fixed(
              result.cpuSpillGB,
            )} GB short at ${withArticle(ctxLabel(model.context))} context${
              result.maxQuantFitLabel ? `; ${result.maxQuantFitLabel} would fit` : altHardware ? `; the ${altHardware.name} would fit` : ''
            }.${fitsInstead && fitsInstead.modelKey !== model.key ? ` What runs well here instead: ${fitsInstead.label}.` : ''}`;

    const slug = `${model.key}-${quantSlug(quantId)}-${target.slug}`;
    return {
      slug,
      tool: 'vram',
      generated: true,
      h1: `Can the ${hw.name} Run ${model.name} at ${qs}?`,
      title: `${model.name} ${qs} on ${hw.name} — VRAM, Speed & Fit`,
      description: `${model.name} at ${qs} needs ~${fixed(result.totalGB)} GB with ${withArticle(ctxLabel(model.context))} context; the ${hw.name} offers ${fixed(
        result.usableMemoryGB,
      )} GB usable. ${verdictShort}, ~${formatTps(result.estimatedTokensPerSec)} tok/s.`,
      kicker: 'Model × hardware fit',
      intro: `${model.fullName} at ${qs}, measured against the ${hw.name}: weights, KV cache and runtime overhead versus ${fixed(
        result.usableMemoryGB,
      )} GB of usable ${target.kind === 'mac' ? 'unified memory' : 'VRAM'}.`,
      verdict,
      summary: buildSummary({ model, target, hw, quant, result, altHardware, fitsInstead }),
      alternative:
        fitsInstead && fitsInstead.modelKey !== model.key
          ? { slug: fitsInstead.slug, label: fitsInstead.label, tps: fitsInstead.tps }
          : undefined,
      prefill: { paramsB: model.paramsB, quant: quantId, context: model.context, hardware: target.id },
      faq: buildFaq({ model, hw, quant, result }),
      related: [],
      _model: model.key,
      _quant: quantId,
      _hw: target.id,
    };
  });

  // Related links: same model/quant on three other targets + one other model on the same target.
  for (const page of generated) {
    const sameModel = generated.filter((p) => p._model === page._model && p._quant === page._quant && p._hw !== page._hw);
    const sameHw = generated.filter((p) => p._hw === page._hw && p._quant === page._quant && p._model !== page._model);
    const modelIndex = MODELS.findIndex((m) => m.key === page._model);
    const neighbour = sameHw.find((p) => p._model === MODELS[(modelIndex + 1) % MODELS.length].key) ?? sameHw[0];
    page.related = [...sameModel.slice(0, 3).map((p) => p.slug), neighbour?.slug].filter(Boolean);
  }

  // Validation: count, uniqueness, word counts.
  const errors = [];
  const seen = { slug: new Set(takenSlugs), title: new Set(), description: new Set(), summary: new Set(), h1: new Set() };
  const words = [];
  for (const page of generated) {
    for (const field of Object.keys(seen)) {
      if (seen[field].has(page[field])) errors.push(`Duplicate ${field}: ${page[field].slice(0, 80)}`);
      seen[field].add(page[field]);
    }
    const count = wordCount(page.summary);
    words.push(count);
    if (count < WORD_MIN || count > WORD_MAX) errors.push(`${page.slug}: summary is ${count} words`);
  }
  if (generated.length !== 150) errors.push(`Expected 150 generated pages, got ${generated.length}`);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  const cleaned = generated.map(({ _model, _quant, _hw, ...page }) => page);
  const output = { updated: new Date().toISOString().slice(0, 10), pages: [...handWritten, ...cleaned] };
  await fs.writeFile(DATA_FILE, `${JSON.stringify(output, null, 2)}\n`);

  const statusCounts = generated.reduce((acc, page) => {
    const key = page.verdict.split('.')[0];
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const avg = words.reduce((a, b) => a + b, 0) / words.length;
  console.log(`Generated ${generated.length} pages (+${handWritten.length} hand-written = ${output.pages.length} total).`);
  console.log(`Summary words: min ${Math.min(...words)}, avg ${avg.toFixed(0)}, max ${Math.max(...words)}.`);
  console.log(`Verdicts: ${JSON.stringify(statusCounts)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
