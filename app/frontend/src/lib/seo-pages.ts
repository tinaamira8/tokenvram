import seoData from '@/data/seo-pages.json';
import type { FaqItem } from '@/components/site/seo';

export type ToolKey = 'api' | 'vram';

export interface SeoPage {
  slug: string;
  tool: ToolKey;
  h1: string;
  title: string;
  description: string;
  kicker: string;
  intro: string;
  verdict: string;
  /** Long-form comparison paragraph, present on generated pages */
  summary?: string;
  /** What actually runs on this hardware instead (generated pages) */
  alternative?: { slug: string; label: string; tps: string };
  /** True when produced by scripts/generate-seo-pages.mjs */
  generated?: boolean;
  prefill: Record<string, number | string>;
  faq: FaqItem[];
  related: string[];
}

interface SeoDataset {
  updated: string;
  pages: SeoPage[];
}

const dataset = seoData as SeoDataset;

export const SEO_PAGES: SeoPage[] = dataset.pages;
export const SEO_UPDATED = dataset.updated;

export function getSeoPage(tool: ToolKey, slug: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.tool === tool && page.slug === slug);
}

export function getSeoPagesForTool(tool: ToolKey): SeoPage[] {
  return SEO_PAGES.filter((page) => page.tool === tool);
}

export function seoPagePath(page: SeoPage): string {
  return `/${page.tool === 'vram' ? 'vram-calculator' : 'api-calculator'}/${page.slug}`;
}

export function getRelatedPages(page: SeoPage): SeoPage[] {
  return page.related
    .map((slug) => SEO_PAGES.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is SeoPage => Boolean(candidate));
}

export const TOOL_LABEL: Record<ToolKey, string> = {
  api: 'API cost',
  vram: 'VRAM fit',
};
