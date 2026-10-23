import {
  QUANTIZATION_BY_ID,
  HARDWARE_BY_ID,
  resolveArchitecture,
  type ArchitectureProfile,
  type Hardware,
  type Quantization,
} from '@/data/hardware';

export interface VramInputs {
  paramsB: number;
  quantId: string;
  /** Context length in tokens (total prompt + generation budget) */
  contextTokens: number;
  hardwareId: string;
  /** Quantize the KV cache to 8-bit, halving its footprint */
  kvQuantized: boolean;
}

export type FitStatus = 'comfortable' | 'tight' | 'oom';

export interface VramResult {
  architecture: ArchitectureProfile;
  quantization: Quantization;
  hardware: Hardware;
  weightsGB: number;
  kvCacheGB: number;
  overheadGB: number;
  totalGB: number;
  usableMemoryGB: number;
  /** Positive when the model fits, negative when it exceeds usable memory */
  headroomGB: number;
  utilisationPct: number;
  status: FitStatus;
  statusLabel: string;
  /** Roughly how much GPU offload a llama.cpp setup could achieve */
  gpuOffloadPct: number;
  /** Memory that would have to live on the CPU */
  cpuSpillGB: number;
  estimatedTokensPerSec: number;
  speedTier: string;
  maxContextTokens: number;
  /** Minimum quantisation label that would fit at this context */
  maxQuantFitLabel: string | null;
  notes: string[];
}

/** Fixed runtime reserve: CUDA context, activations, display, framework slack. */
export const RUNTIME_OVERHEAD_GB = 1.5;

/** KV cache in GB = 2 × layers × kvHeads × headDim × bytes × tokens. */
export function kvCacheGB(
  layers: number,
  kvHeads: number,
  headDim: number,
  tokens: number,
  bytesPerElement = 2,
): number {
  return (2 * layers * kvHeads * headDim * bytesPerElement * tokens) / 1024 ** 3;
}

export function estimateWeightsGB(paramsB: number, bits: number, moe: boolean): number {
  // MoE checkpoints carry router/gate tensors and shared experts on top of the
  // nominal parameter count; the 3% uplift keeps estimates honest.
  const slack = moe ? 1.03 : 1;
  return (paramsB * 1e9 * bits * slack) / 8 / 1024 ** 3;
}

export function computeVram(inputs: VramInputs): VramResult {
  const quantization = QUANTIZATION_BY_ID[inputs.quantId] ?? QUANTIZATION_BY_ID.q4_k_m;
  const hardware = HARDWARE_BY_ID[inputs.hardwareId] ?? HARDWARE_BY_ID['rtx-4090-24'];
  const architecture = resolveArchitecture(inputs.paramsB);

  const weightsGB = estimateWeightsGB(inputs.paramsB, quantization.bits, architecture.moe);
  const caseBytes = inputs.kvQuantized ? 1 : 2;
  const kvGB = kvCacheGB(
    architecture.layers,
    architecture.kvHeads,
    architecture.headDim,
    Math.max(1, inputs.contextTokens),
    caseBytes,
  );
  const totalGB = weightsGB + kvGB + RUNTIME_OVERHEAD_GB;
  const usableMemoryGB = hardware.memoryGB * hardware.usableRatio;
  const headroomGB = usableMemoryGB - totalGB;
  const utilisationPct = (totalGB / usableMemoryGB) * 100;

  let status: FitStatus;
  if (headroomGB < 0) status = 'oom';
  else if (headroomGB < usableMemoryGB * 0.08) status = 'tight';
  else status = 'comfortable';

  const statusLabel =
    status === 'comfortable'
      ? 'Runs comfortably'
      : status === 'tight'
        ? 'Tight fit — offload or quantize KV cache'
        : 'Out of memory — hardware upgrade needed';

  const gpuOffloadPct = status === 'oom' ? Math.max(0, Math.min(100, (usableMemoryGB / totalGB) * 100)) : 100;
  const cpuSpillGB = Math.max(0, totalGB - usableMemoryGB);

  // Decoding is bandwidth bound: tokens/sec ≈ bandwidth / bytes touched per
  // token. Every parameter must be read once per token, plus the KV cache.
  const weightsBytes = weightsGB * 1024 ** 3;
  const kvBytes = kvGB * 1024 ** 3;
  const bytesPerToken = weightsBytes + kvBytes * 0.5;
  const rawTps = (hardware.bandwidth * 1e9) / Math.max(1, bytesPerToken);
  const offloadPenalty = status === 'oom' ? Math.max(0.06, gpuOffloadPct / 100) : 1;
  const estimatedTokensPerSec = rawTps * 0.65 * offloadPenalty;

  const speedTier =
    estimatedTokensPerSec >= 40
      ? 'Very fast — faster than reading speed'
      : estimatedTokensPerSec >= 20
        ? 'Fast — comfortable chat'
        : estimatedTokensPerSec >= 8
          ? 'Usable — single-stream chat'
          : estimatedTokensPerSec >= 2
            ? 'Slow — patience required'
            : 'Impractical — below usable speed';

  // Largest context that still fits in usable memory at this quantization.
  const budgetForKv = usableMemoryGB - weightsGB - RUNTIME_OVERHEAD_GB;
  const perTokenGB = kvCacheGB(architecture.layers, architecture.kvHeads, architecture.headDim, 1, caseBytes);
  const maxContextTokens = budgetForKv > 0 && perTokenGB > 0 ? Math.floor(budgetForKv / perTokenGB) : 0;

  const maxQuantFitLabel = findLargestQuantThatFits(weightsGB, kvGB, usableMemoryGB, quantization);

  const notes: string[] = [];
  if (architecture.moe) {
    notes.push(
      `${architecture.label}: ${architecture.activeShare ?? 5}% of parameters are active per token, so compute stays modest — but every expert still occupies memory.`,
    );
  }
  if (status === 'oom') {
    notes.push(
      `About ${cpuSpillGB.toFixed(1)} GB would have to live in system RAM. llama.cpp will still run, but throughput drops to the speed of your CPU/PCIe path.`,
    );
  }
  if (status === 'tight') {
    notes.push(
      'Within 8% of the memory ceiling. Lower the context, quantize the KV cache to 8-bit, or expect the driver to spill layers.',
    );
  }
  if (hardware.vendor === 'apple') {
    notes.push(
      `Unified memory on macOS: roughly ${(hardware.usableRatio * 100).toFixed(0)}% is realistically addressable before the system starts swapping.`,
    );
  }
  if (!inputs.kvQuantized && kvGB > weightsGB * 0.15) {
    notes.push('8-bit KV cache quantization would roughly halve the KV cache with negligible quality loss.');
  }

  return {
    architecture,
    quantization,
    hardware,
    weightsGB,
    kvCacheGB: kvGB,
    overheadGB: RUNTIME_OVERHEAD_GB,
    totalGB,
    usableMemoryGB,
    headroomGB,
    utilisationPct,
    status,
    statusLabel,
    gpuOffloadPct,
    cpuSpillGB,
    estimatedTokensPerSec,
    speedTier,
    maxContextTokens,
    maxQuantFitLabel,
    notes,
  };
}

function findLargestQuantThatFits(
  currentWeights: number,
  kvGB: number,
  usableGB: number,
  current: Quantization,
): string | null {
  const PARAMS_PER_GB_BITS = 1;
  void PARAMS_PER_GB_BITS;
  // Recompute the weight side for each candidate quant, keeping the same KV cache.
  const perBitGB = currentWeights / current.bits;
  const candidates = ['fp16', 'q8_0', 'q6_k', 'q5_k_m', 'q4_k_m', 'iq3_xs', 'q2_k']
    .map((id) => QUANTIZATION_BY_ID[id])
    .filter((quant) => perBitGB * quant.bits + kvGB + RUNTIME_OVERHEAD_GB <= usableGB)
    .sort((a, b) => b.bits - a.bits);
  return candidates[0]?.label ?? null;
}
