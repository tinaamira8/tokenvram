import type { LlmModel } from '@/data/models';

export interface CostInputs {
  requestsPerDay: number;
  inputTokens: number;
  outputTokens: number;
  /** 0–100 */
  cacheHitRate: number;
  /** Days of usage per month */
  daysPerMonth?: number;
}

export interface CostBreakdown {
  model: LlmModel;
  cachedInputCost: number;
  uncachedInputCost: number;
  outputCost: number;
  monthlyTotal: number;
  dailyTotal: number;
  perRequest: number;
  /** Dollars saved this month by cache hits, versus no caching */
  cacheSavings: number;
  /** Effective blended cost per 1M input+output tokens */
  blendedPerMillion: number;
  supportsCaching: boolean;
}

const MILLION = 1_000_000;

export function computeCost(model: LlmModel, inputs: CostInputs): CostBreakdown {
  const days = inputs.daysPerMonth ?? 30;
  const requests = Math.max(0, inputs.requestsPerDay) * days;
  const hitRate = Math.min(100, Math.max(0, inputs.cacheHitRate)) / 100;
  const cacheable = model.cachedInput !== null;
  const effectiveHitRate = cacheable ? hitRate : 0;

  const totalInputTokens = requests * Math.max(0, inputs.inputTokens);
  const totalOutputTokens = requests * Math.max(0, inputs.outputTokens);

  const cachedTokens = totalInputTokens * effectiveHitRate;
  const uncachedTokens = totalInputTokens - cachedTokens;

  const cachedInputCost = (cachedTokens / MILLION) * (model.cachedInput ?? model.input);
  const uncachedInputCost = (uncachedTokens / MILLION) * model.input;
  const outputCost = (totalOutputTokens / MILLION) * model.output;

  const monthlyTotal = cachedInputCost + uncachedInputCost + outputCost;
  const withoutCache = (totalInputTokens / MILLION) * model.input + outputCost;
  const cacheSavings = Math.max(0, withoutCache - monthlyTotal);

  const monthlyTokens = totalInputTokens + totalOutputTokens;
  const blendedPerMillion = monthlyTokens > 0 ? (monthlyTotal / monthlyTokens) * MILLION : 0;

  return {
    model,
    cachedInputCost,
    uncachedInputCost,
    outputCost,
    monthlyTotal,
    dailyTotal: monthlyTotal / days,
    perRequest: requests > 0 ? monthlyTotal / requests : 0,
    cacheSavings,
    blendedPerMillion,
    supportsCaching: cacheable,
  };
}

export function computeAllCosts(models: LlmModel[], inputs: CostInputs): CostBreakdown[] {
  return models
    .map((model) => computeCost(model, inputs))
    .sort((a, b) => a.monthlyTotal - b.monthlyTotal);
}

/**
 * Annualised saving from switching between two models at the same workload —
 * the number that actually justifies a migration.
 */
export function annualDelta(current: CostBreakdown, alternative: CostBreakdown) {
  return (current.monthlyTotal - alternative.monthlyTotal) * 12;
}

export function toCsv(rows: CostBreakdown[]): string {
  const header = [
    'Provider',
    'Model',
    'Input $/1M',
    'Cached Input $/1M',
    'Output $/1M',
    'Monthly Input Cost',
    'Monthly Output Cost',
    'Monthly Cache Savings',
    'Monthly Total (USD)',
    'Cost per Request (USD)',
  ];
  const body = rows.map((row) =>
    [
      row.model.provider,
      row.model.name,
      row.model.input.toFixed(2),
      row.model.cachedInput === null ? 'n/a' : row.model.cachedInput.toFixed(2),
      row.model.output.toFixed(2),
      (row.cachedInputCost + row.uncachedInputCost).toFixed(2),
      row.outputCost.toFixed(2),
      row.cacheSavings.toFixed(2),
      row.monthlyTotal.toFixed(2),
      row.perRequest.toFixed(6),
    ].join(','),
  );
  return [header.join(','), ...body].join('\n');
}
