/**
 * Reference pricing for hosted LLM APIs.
 * All prices are USD per 1,000,000 tokens and reflect published list pricing
 * at the time of writing. Cached input price is the discounted rate for
 * provider-side prompt caching; `null` means caching is not offered.
 */

export type ProviderKey = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'meta';

export type ModelTier = 'flagship' | 'balanced' | 'budget' | 'reasoning';

export interface ProviderMeta {
  key: ProviderKey;
  label: string;
  color: string;
}

export interface LlmModel {
  id: string;
  name: string;
  provider: ProviderKey;
  tier: ModelTier;
  /** USD per 1M uncached input tokens */
  input: number;
  /** USD per 1M cached input tokens, null when no prompt caching */
  cachedInput: number | null;
  /** USD per 1M output tokens */
  output: number;
  /** Context window, in thousands of tokens */
  contextK: number;
  note: string;
}

export const PROVIDERS: ProviderMeta[] = [
  { key: 'openai', label: 'OpenAI', color: '#10A37F' },
  { key: 'anthropic', label: 'Anthropic', color: '#C6613A' },
  { key: 'google', label: 'Google', color: '#2C6BE0' },
  { key: 'deepseek', label: 'DeepSeek', color: '#6F5BD6' },
  { key: 'meta', label: 'Meta Llama', color: '#0A7CFF' },
];

export const PROVIDER_BY_KEY = Object.fromEntries(
  PROVIDERS.map((provider) => [provider.key, provider]),
) as Record<ProviderKey, ProviderMeta>;

export const MODELS: LlmModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    tier: 'flagship',
    input: 2.5,
    cachedInput: 1.25,
    output: 10,
    contextK: 128,
    note: 'General-purpose multimodal flagship.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    tier: 'budget',
    input: 0.15,
    cachedInput: 0.075,
    output: 0.6,
    contextK: 128,
    note: 'Cheap classification, extraction and routing.',
  },
  {
    id: 'gpt-4-1',
    name: 'GPT-4.1',
    provider: 'openai',
    tier: 'flagship',
    input: 2,
    cachedInput: 0.5,
    output: 8,
    contextK: 1000,
    note: 'Long-context engineering model, 1M token window.',
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'openai',
    tier: 'reasoning',
    input: 1.1,
    cachedInput: 0.55,
    output: 4.4,
    contextK: 200,
    note: 'Reasoning model; output tokens include hidden reasoning.',
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    tier: 'flagship',
    input: 3,
    cachedInput: 0.3,
    output: 15,
    contextK: 200,
    note: 'Balanced coding and agent workhorse.',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    tier: 'budget',
    input: 0.8,
    cachedInput: 0.08,
    output: 4,
    contextK: 200,
    note: 'Fast, low-cost Claude tier.',
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    tier: 'reasoning',
    input: 15,
    cachedInput: 1.5,
    output: 75,
    contextK: 200,
    note: 'Deep reasoning at flagship pricing.',
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    tier: 'flagship',
    input: 1.25,
    cachedInput: 0.31,
    output: 10,
    contextK: 1000,
    note: 'Long-context multimodal reasoning.',
  },
  {
    id: 'gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    tier: 'balanced',
    input: 0.1,
    cachedInput: 0.025,
    output: 0.4,
    contextK: 1000,
    note: 'High-volume generation and extraction.',
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    tier: 'budget',
    input: 0.075,
    cachedInput: 0.019,
    output: 0.3,
    contextK: 1000,
    note: 'Cheapest mainstream multimodal tier.',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    tier: 'balanced',
    input: 0.27,
    cachedInput: 0.07,
    output: 1.1,
    contextK: 64,
    note: 'Open-weight MoE, exceptional price/quality.',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    tier: 'reasoning',
    input: 0.55,
    cachedInput: 0.14,
    output: 2.19,
    contextK: 64,
    note: 'Open reasoning model with visible chain-of-thought.',
  },
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'meta',
    tier: 'balanced',
    input: 0.27,
    cachedInput: 0.27,
    output: 0.85,
    contextK: 1000,
    note: 'Hosted pricing average across inference providers.',
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'meta',
    tier: 'budget',
    input: 0.59,
    cachedInput: 0.59,
    output: 0.79,
    contextK: 128,
    note: 'Hosted pricing average across inference providers.',
  },
  {
    id: 'llama-3-1-405b',
    name: 'Llama 3.1 405B',
    provider: 'meta',
    tier: 'flagship',
    input: 3.5,
    cachedInput: 3.5,
    output: 3.5,
    contextK: 128,
    note: 'Largest open dense model; symmetric token pricing.',
  },
];

export const MODEL_BY_ID = Object.fromEntries(
  MODELS.map((model) => [model.id, model]),
) as Record<string, LlmModel>;

export const MODEL_TIER_LABEL: Record<ModelTier, string> = {
  flagship: 'Flagship',
  balanced: 'Balanced',
  budget: 'Budget',
  reasoning: 'Reasoning',
};
