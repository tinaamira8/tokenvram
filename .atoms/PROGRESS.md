---
last_updated: 2026-10-21T13:40:00Z
---

# Requirements & Progress

## Requirements Overview

Client-side "AI Compute & Token Economics Hub" with an LLM API cost/token calculator, a local VRAM feasibility calculator, pSEO landing pages, AdSense-safe layouts and full legal/trust pages.

## User Stories

- As a developer, I can estimate monthly API spend for a workload across providers and share the exact scenario by link or CSV.
- As a local-LLM user, I can check whether a quantized model fits my GPU / Apple unified memory and see the memory breakdown.
- As a search visitor, I can land on a pre-configured high-intent page (e.g. "Llama 3 70B Q4 on RTX 4090") and immediately see the answer.
- As a site owner, I can drop AdSense `<ins>` tags into reserved, CLS-safe slots.

## Task Breakdown
| ID | Task | Assignee | Status | Deps |
|----|------|----------|--------|------|
| 1 | Template init + design tokens (fonts, palette, slider styling) | Alex | done | - |
| 2 | Data layer: model pricing, hardware, quantization, architectures, 18 pSEO pages | Alex | done | 1 |
| 3 | Pure calc libs (cost, vram, tokenizer) + URL state sync + presets | Alex | done | 2 |
| 4 | Shell: header/footer/theme toggle/AdSlot/Seo head manager | Alex | done | 1 |
| 5 | API cost calculator page with table, bar chart, CSV, share link | Alex | done | 3,4 |
| 6 | VRAM calculator page with breakdown meter, status badge, speed tier | Alex | done | 3,4 |
| 7 | Homepage hero + live readout + searchable pSEO directory | Alex | done | 4 |
| 8 | pSEO page renderer + below-the-fold guide, reference table, FAQ schema | Alex | done | 5,6 |
| 9 | Legal pages, ads.txt, robots.txt, sitemap | Alex | done | 4 |
| 10 | Validation: lint, build, UI check | Alex | done | 5-9 |
| 11 | pSEO generator script (150 model × hardware pages, ~200-word summaries) | Alex | done | 8 |
| 12 | Validation: generator self-checks, tsc, lint, build, sitemap count | Alex | done | 11 |
| 13 | Build-time prerender of all routes with real head tags + JSON-LD; dedupe template meta; split seo-data chunk | Alex | done | 12 |

## Progress Log
- 2026-10-21: Frontend template initialized; DESIGN.md written (bone/lime instrument-panel direction).
- 2026-10-21: Built data layer, both calculators, 18 pSEO pages, legal pages; lint + build green, homepage render check passed.
- 2026-10-21: Added scripts/generate-seo-pages.mjs (`pnpm run generate:seo`): 150 generated VRAM pages (168 total), summaries 185–207 words; added RTX 4070 Ti 12GB, Mac Mini M4 Pro 64GB, R1 distill/Gemma 2/Mistral Large profiles; directory paginated; sitemap 178 URLs.
- 2026-10-21: prerender/app.js renders all 177 routes to static HTML (title/meta/canonical/JSON-LD from <Seo> capture); plugins/dedupe-head-tags.js removes template duplicates; app chunk 637→181 KB, seo-data split (456 KB / 31 KB gz).
- 2026-10-21: Generator now uses 4 summary shapes (distinct first sentences 39→115 of 150), article grammar fixed, 83 OOM pages get a "what runs here instead" card linking to the largest comfortable fit; tsc/lint/build green.
