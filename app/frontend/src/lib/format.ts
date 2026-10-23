/** Formatting helpers shared by the calculators and tables. */

export function formatUsd(value: number, options: { compact?: boolean; digits?: number } = {}) {
  const { compact = false, digits } = options;
  if (!Number.isFinite(value)) return '—';
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  const decimals = digits ?? (value !== 0 && Math.abs(value) < 1 ? 4 : 2);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number, digits = 0) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatGb(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)} GB`;
}

export function formatBytesAsTokens(count: number) {
  return new Intl.NumberFormat('en-US').format(count);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Parse a number from a URL param with a safe fallback. */
export function readNumber(raw: string | null, fallback: number, min: number, max: number) {
  if (raw === null || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}
