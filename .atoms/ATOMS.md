---
last_updated: 2026-10-21T13:40:00Z
status: active
---

# Project Context

## Project Overview

Modelmath — a static, client-side hub for AI compute economics: LLM API cost/token calculator + local VRAM feasibility calculator, wrapped in a pSEO page network and AdSense-ready layout.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|
| 2026-10-21 | Frontend-only, no backend | Alex | All math is deterministic and client-side; static output is fastest and best for AdSense/SEO. |
| 2026-10-21 | URL query params as source of truth for calculator state | Alex | Shareable quote links required; also lets pSEO pages pre-fill state. |
| 2026-10-21 | pSEO pages stored in `src/data/seo-pages.json` | Alex | Single dataset drives routes, sitemap, directory and prefill. |
| 2026-10-21 | Google Fonts: Bricolage Grotesque + IBM Plex Sans/Mono | Alex | Technical-manual voice without the generic dark-AI look. |

## Constraints

- No backend, no auth, no third-party API calls at runtime.
- Ad slots must reserve height (CLS-safe) and stay ≥24px from buttons.
- Don't modify `.mgx/config.yaml`; preview reloads automatically.
