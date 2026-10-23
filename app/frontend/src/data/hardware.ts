/**
 * Local inference reference data: hardware, quantization levels and model
 * architecture profiles used to size the KV cache.
 *
 * Memory bandwidth is in GB/s and is the single biggest driver of token
 * throughput, because autoregressive decoding is memory-bandwidth bound.
 */

export type HardwareVendor = 'nvidia' | 'amd' | 'apple';

export interface Hardware {
  id: string;
  name: string;
  /** Total memory in GB (VRAM or unified memory) */
  memoryGB: number;
  /** Peak memory bandwidth in GB/s */
  bandwidth: number;
  vendor: HardwareVendor;
  /** Share of total memory actually addressable by the model */
  usableRatio: number;
  group: 'consumer' | 'workstation' | 'multi' | 'apple';
  note: string;
}

export const HARDWARE: Hardware[] = [
  {
    id: 'rtx-3060-12',
    name: 'RTX 3060 12GB',
    memoryGB: 12,
    bandwidth: 360,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'consumer',
    note: 'Entry-level 12GB card; strong value for 7B–8B Q4.',
  },
  {
    id: 'rtx-4060-ti-16',
    name: 'RTX 4060 Ti 16GB',
    memoryGB: 16,
    bandwidth: 288,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'consumer',
    note: '16GB capacity, narrow bus — capacity before speed.',
  },
  {
    id: 'rtx-4070-ti-12',
    name: 'RTX 4070 Ti 12GB',
    memoryGB: 12,
    bandwidth: 504,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'consumer',
    note: '12GB on a fast bus — speed over capacity.',
  },
  {
    id: 'rtx-4070-ti-super-16',
    name: 'RTX 4070 Ti Super 16GB',
    memoryGB: 16,
    bandwidth: 672,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'consumer',
    note: 'Fast 16GB card for 14B Q4–Q5.',
  },
  {
    id: 'rtx-3090-24',
    name: 'RTX 3090 24GB',
    memoryGB: 24,
    bandwidth: 936,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'consumer',
    note: 'Popular used-market pick for 32B Q4.',
  },
  {
    id: 'rtx-4090-24',
    name: 'RTX 4090 24GB',
    memoryGB: 24,
    bandwidth: 1008,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'consumer',
    note: 'Fastest consumer 24GB card.',
  },
  {
    id: 'rtx-5090-32',
    name: 'RTX 5090 32GB',
    memoryGB: 32,
    bandwidth: 1792,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'consumer',
    note: '32GB and ~1.8TB/s: the best single-GPU local LLM card.',
  },
  {
    id: 'rtx-a6000-48',
    name: 'RTX A6000 48GB',
    memoryGB: 48,
    bandwidth: 768,
    vendor: 'nvidia',
    usableRatio: 0.95,
    group: 'workstation',
    note: '48GB workstation card with ECC memory.',
  },
  {
    id: 'a100-80',
    name: 'A100 80GB',
    memoryGB: 80,
    bandwidth: 2039,
    vendor: 'nvidia',
    usableRatio: 0.95,
    group: 'workstation',
    note: 'Datacenter card; handles 70B at Q8.',
  },
  {
    id: 'h100-80',
    name: 'H100 80GB',
    memoryGB: 80,
    bandwidth: 3350,
    vendor: 'nvidia',
    usableRatio: 0.95,
    group: 'workstation',
    note: 'Highest bandwidth in this list.',
  },
  {
    id: 'dual-3090',
    name: 'Dual RTX 3090 (48GB)',
    memoryGB: 48,
    bandwidth: 936,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'multi',
    note: 'Tensor-parallel 48GB pool, NVLink optional.',
  },
  {
    id: 'dual-4090',
    name: 'Dual RTX 4090 (48GB)',
    memoryGB: 48,
    bandwidth: 1008,
    vendor: 'nvidia',
    usableRatio: 0.9,
    group: 'multi',
    note: '48GB pool without NVLink; PCIe transfer adds latency.',
  },
  {
    id: 'mac-m4-pro-48',
    name: 'MacBook Pro M4 Pro 48GB',
    memoryGB: 48,
    bandwidth: 273,
    vendor: 'apple',
    usableRatio: 0.7,
    group: 'apple',
    note: 'Quiet and power efficient, but bandwidth-limited.',
  },
  {
    id: 'mac-m4-max-128',
    name: 'MacBook Pro M4 Max 128GB',
    memoryGB: 128,
    bandwidth: 546,
    vendor: 'apple',
    usableRatio: 0.7,
    group: 'apple',
    note: '128GB unified memory runs 70B Q4 on one machine.',
  },
  {
    id: 'mac-m2-ultra-64',
    name: 'Mac Studio M2 Ultra 64GB',
    memoryGB: 64,
    bandwidth: 800,
    vendor: 'apple',
    usableRatio: 0.72,
    group: 'apple',
    note: 'Desktop-class unified memory at 800GB/s.',
  },
  {
    id: 'mac-m3-ultra-192',
    name: 'Mac Studio M3 Ultra 192GB',
    memoryGB: 192,
    bandwidth: 819,
    vendor: 'apple',
    usableRatio: 0.72,
    group: 'apple',
    note: 'Largest unified memory here; fits 405B at low bits.',
  },
  {
    id: 'mac-mini-m4-pro-64',
    name: 'Mac Mini M4 Pro 64GB',
    memoryGB: 64,
    bandwidth: 273,
    vendor: 'apple',
    usableRatio: 0.7,
    group: 'apple',
    note: 'Compact 64GB unified memory; capacity without bandwidth.',
  },
];

export const HARDWARE_BY_ID = Object.fromEntries(
  HARDWARE.map((hardware) => [hardware.id, hardware]),
) as Record<string, Hardware>;

export const HARDWARE_GROUPS: { key: Hardware['group']; label: string }[] = [
  { key: 'consumer', label: 'Consumer GPU' },
  { key: 'workstation', label: 'Workstation / datacenter' },
  { key: 'multi', label: 'Multi-GPU' },
  { key: 'apple', label: 'Apple unified memory' },
];

export interface Quantization {
  id: string;
  label: string;
  /** Effective bits per weight, including GGUF block metadata */
  bits: number;
  quality: string;
  note: string;
}

export const QUANTIZATIONS: Quantization[] = [
  {
    id: 'fp16',
    label: 'FP16 / BF16',
    bits: 16,
    quality: 'Lossless',
    note: 'Full-precision weights. Reference quality, 2× the memory of Q8.',
  },
  {
    id: 'q8_0',
    label: 'Q8_0',
    bits: 8.5,
    quality: 'Indistinguishable',
    note: '8-bit near-lossless; the safe choice when memory allows.',
  },
  {
    id: 'q6_k',
    label: 'Q6_K',
    bits: 6.56,
    quality: 'Excellent',
    note: 'Rarely worth it over Q5_K_M unless you have spare VRAM.',
  },
  {
    id: 'q5_k_m',
    label: 'Q5_K_M',
    bits: 5.67,
    quality: 'Very good',
    note: 'Sweet spot for long-context work where quality matters.',
  },
  {
    id: 'q4_k_m',
    label: 'Q4_K_M',
    bits: 4.83,
    quality: 'Good',
    note: 'Default community choice; best size/quality trade-off.',
  },
  {
    id: 'iq3_xs',
    label: 'IQ3_XS',
    bits: 3.3,
    quality: 'Degraded',
    note: 'Aggressive 3-bit; expect visible degradation on small models.',
  },
  {
    id: 'q2_k',
    label: '2-bit (Q2_K)',
    bits: 2.6,
    quality: 'Poor',
    note: 'Last resort for squeezing a large model into small memory.',
  },
];

export const QUANTIZATION_BY_ID = Object.fromEntries(
  QUANTIZATIONS.map((quant) => [quant.id, quant]),
) as Record<string, Quantization>;

export interface ArchitectureProfile {
  id: string;
  label: string;
  /** Parameter count in billions */
  paramsB: number;
  layers: number;
  /** Key/value heads (GQA), not attention heads */
  kvHeads: number;
  headDim: number;
  /** Whether this is a mixture-of-experts model */
  moe: boolean;
  /** Percent of parameters active per token (MoE only) */
  activeShare?: number;
}

/** KV cache in MB per 1K tokens = 2 (K+V) × layers × kvHeads × headDim × 2 bytes. */
export const ARCHITECTURES: ArchitectureProfile[] = [
  { id: 'tiny-1-5b', label: '1.5B dense (Qwen2.5-1.5B)', paramsB: 1.5, layers: 28, kvHeads: 2, headDim: 128, moe: false },
  { id: 'small-3b', label: '3B dense (Llama 3.2 3B)', paramsB: 3, layers: 28, kvHeads: 8, headDim: 128, moe: false },
  { id: 'mid-7b', label: '7B dense (Mistral 7B)', paramsB: 7.2, layers: 32, kvHeads: 8, headDim: 128, moe: false },
  { id: 'mid-8b', label: '8B dense (Llama 3.1 8B)', paramsB: 8, layers: 32, kvHeads: 8, headDim: 128, moe: false },
  { id: 'mid-14b', label: '14B dense (Qwen2.5 14B)', paramsB: 14, layers: 48, kvHeads: 8, headDim: 128, moe: false },
  { id: 'large-32b', label: '32B dense (Qwen2.5 32B)', paramsB: 32, layers: 64, kvHeads: 8, headDim: 128, moe: false },
  { id: 'large-70b', label: '70B dense (Llama 3.3 70B)', paramsB: 70, layers: 80, kvHeads: 8, headDim: 128, moe: false },
  { id: 'xl-405b', label: '405B dense (Llama 3.1 405B)', paramsB: 405, layers: 126, kvHeads: 8, headDim: 128, moe: false },
  { id: 'moe-671b', label: '671B MoE (DeepSeek V3 / R1)', paramsB: 671, layers: 61, kvHeads: 1, headDim: 576, moe: true, activeShare: 5.5 },
  { id: 'moe-400b', label: '400B MoE (Llama 4 Maverick)', paramsB: 400, layers: 48, kvHeads: 8, headDim: 128, moe: true, activeShare: 17 },
  { id: 'r1-distill-7b', label: '7.6B dense (DeepSeek R1 Distill 7B)', paramsB: 7.6, layers: 28, kvHeads: 4, headDim: 128, moe: false },
  { id: 'r1-distill-14b', label: '14.8B dense (DeepSeek R1 Distill 14B)', paramsB: 14.8, layers: 48, kvHeads: 8, headDim: 128, moe: false },
  { id: 'r1-distill-32b', label: '32.8B dense (DeepSeek R1 Distill 32B)', paramsB: 32.8, layers: 64, kvHeads: 8, headDim: 128, moe: false },
  { id: 'gemma-2-27b', label: '27B dense (Gemma 2 27B)', paramsB: 27, layers: 46, kvHeads: 16, headDim: 128, moe: false },
  { id: 'mistral-large-123b', label: '123B dense (Mistral Large 2)', paramsB: 123, layers: 88, kvHeads: 8, headDim: 128, moe: false },
];

export const PARAM_PRESETS = [1.5, 3, 7, 8, 14, 32, 70, 405, 671];

export const CONTEXT_OPTIONS = [
  { tokens: 2048, label: '2K' },
  { tokens: 4096, label: '4K' },
  { tokens: 8192, label: '8K' },
  { tokens: 16384, label: '16K' },
  { tokens: 32768, label: '32K' },
  { tokens: 65536, label: '64K' },
  { tokens: 131072, label: '128K' },
];

/** Pick the architecture profile that best matches a parameter count. */
export function resolveArchitecture(paramsB: number): ArchitectureProfile {
  return ARCHITECTURES.reduce((best, candidate) =>
    Math.abs(candidate.paramsB - paramsB) < Math.abs(best.paramsB - paramsB)
      ? candidate
      : best,
  );
}
