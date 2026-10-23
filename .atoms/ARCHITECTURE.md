---
last_updated: 2026-10-21T00:00:00Z
---

# Architecture

## Overview

Modelmath is a 100% client-side React + Vite + Tailwind + shadcn/ui application. No backend: all calculations run in the browser, state is mirrored to URL query params for shareable links, and named presets persist in `localStorage`.

## Structure

- `src/data/models.ts` — LLM pricing/context dataset (OpenAI, Anthropic, Google, DeepSeek, Meta).
- `src/data/hardware.ts` — GPU / Apple unified-memory dataset, quantization table, model-architecture table for KV-cache math.
- `src/data/seo-pages.json` — pSEO page registry (slug, tool, H1, meta, intro, prefill state).
- `src/lib/*` — pure calculation modules (`cost`, `vram`, `tokenize`, `format`), URL-state hook, preset storage.
- `src/components/calc/*` — ApiCostCalculator, VramCalculator and their chart/table sub-views.
- `src/components/content/*` — below-the-fold guide, reference table, FAQ + JSON-LD.
- `src/components/site/*` — layout, header/footer, theme provider, AdSlot, Seo head manager.
- `src/pages/*` — Home, Tool pages, SEO page renderer, Directory, legal pages.

## Key Decisions

- Routing: React Router. `/api-calculator`, `/vram-calculator`, `/api-calculator/:slug`, `/vram-calculator/:slug`, `/directory`, legal routes.
- SEO: client-side `Seo` component sets title/description/canonical/OG and injects `FAQPage` + `SoftwareApplication` JSON-LD. Sitemap generated at build from `seo-pages.json` plus static routes via `vite-plugin-sitemap`.
- Calculations are pure functions with explicit unit tests by inspection; no external API calls, so pages are static and fast.
- Ads are layout-safe placeholders with fixed `min-height`; real `<ins>` tags can be dropped into `AdSlot` later.
