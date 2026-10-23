/**
 * Heuristic token estimation.
 *
 * There is no universal characters-per-token ratio, but two rules hold
 * surprisingly well across BPE tokenizers: English prose averages ~4 characters
 * per token, while source code and YAML/JSON average ~3.2 because identifiers,
 * punctuation and indentation fragment into many small tokens.
 */

export interface TokenEstimate {
  chars: number;
  words: number;
  lines: number;
  tokens: number;
  charsPerToken: number;
}

export const CHARS_PER_TOKEN = {
  prose: 4,
  code: 3.2,
} as const;

export function estimateTokens(text: string, codeMode = false): TokenEstimate {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const charsPerToken = codeMode ? CHARS_PER_TOKEN.code : CHARS_PER_TOKEN.prose;
  // Whitespace-heavy pastes compress slightly better than the plain ratio.
  const whitespaceDiscount = chars > 0 ? 1 - Math.min(0.1, (text.match(/\s/g)?.length ?? 0) / chars / 10) : 1;
  const tokens = Math.round((chars / charsPerToken) * whitespaceDiscount);
  return { chars, words, lines, tokens, charsPerToken };
}
