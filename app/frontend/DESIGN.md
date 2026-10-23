# Modelmath — Design Specification

## Direction & Layout

**Product:** Modelmath is a client-side instrument panel for AI compute economics. Two calculators (LLM API cost, local VRAM feasibility) plus a programmatic comparison directory for developers who are choosing a model or a GPU.

**Mood:** Precision lab equipment, not a SaaS marketing site. Calm bone-white surfaces, hairline rules, dense numeric tables, one acid-lime signal color used only where the eye must land (active state, cheapest row, accent bars). It should feel like a well-printed reference card and a calculator strapped together. It must **not** feel like a dark blue-purple AI startup, a crypto dashboard, or a generic card grid.

**Defining visual idea:** Every number is set in tabular monospace and framed by 1px hairlines on a warm bone field; results read like a lab readout at the top of the page, documentation follows underneath like an instrument manual. The hero pairs a typographic claim with a real, live-computed cost readout — no illustration.

**Visual reference:** Vercel/Linear information architecture (restraint, hairline borders, mono labels) filtered through a technical-manual palette (bone paper, graphite ink, lime signal) rather than a dark gradient.

**Layout:** Max content width 1240px, 24px gutters. Homepage hero is asymmetric 7/5 (`lg:grid-cols-[minmax(0,1fr)_420px]`) with the claim left and the live readout right. Calculator pages use a 70/30 split: content column plus a 320px sticky sidebar (sticky from `lg` up). Section rhythm 40px mobile / 64px desktop; card gaps 16px; table row height 44px.

**Breakpoints:** `sm` 640 / `md` 768 / `lg` 1024 (sidebar appears, hero splits) / `xl` 1280. Below `lg` the sidebar stacks after the primary result block and the ad rectangle sits between results and documentation. Navigation collapses into a full-width sheet below `md`; calculator preset grids go 3-up on mobile, 5-up on desktop.

**Do / Don't**

- Do: hairline 1px borders, tabular numerals, uppercase mono micro-labels with 0.12em tracking, flat surfaces, generous line height in prose blocks, a single lime accent per viewport.
- Don't: drop shadows on cards, gradients, rounded-full pills for primary actions, glassmorphism, colored left borders on cards, icon grids, or hero illustrations.
- Don't hide content behind scroll-triggered reveals; all primary numbers render immediately.

## Tokens

**Color (HSL variables, light / dark)**

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| background | `45 20% 96%` (#F7F6F1) | `90 5% 6%` (#0F100E) | page field |
| card | `0 0% 100%` | `90 5% 9%` (#171814) | calculator surfaces |
| foreground | `60 6% 9%` | `48 20% 94%` | ink |
| muted | `45 14% 92%` | `90 4% 14%` | input wells, table stripes |
| muted-foreground | `60 4% 38%` | `60 5% 62%` | secondary copy |
| border | `48 10% 84%` (#DCD9CF) | `90 5% 19%` | all hairlines |
| primary | `60 6% 10%` | `48 20% 94%` | primary buttons, headline |
| primary-foreground | `45 20% 96%` | `90 5% 8%` | text on primary |
| accent | `74 86% 63%` (#C6F24E) | `74 82% 55%` | signal fill, active nav, key bars |
| accent-foreground | `60 8% 10%` | `90 8% 8%` | text on accent |
| ok | `148 45% 32%` | `148 45% 58%` | comfortable fit |
| warn | `38 82% 40%` | `38 82% 60%` | tight fit |
| bad | `5 68% 46%` | `5 70% 62%` | OOM |

Provider accents (data only, never chrome): OpenAI `#10A37F`, Anthropic `#C6613A`, Google `#2C6BE0`, DeepSeek `#6F5BD6`, Meta `#0A7CFF` (light) / `#63B3FF` (dark use same). Accent lime is reserved for: active tab/segment, cheapest-result marker, focus rings, primary progress fill, the logo dot. Never for large background fields.

**Typography**

- Display / headings: **Bricolage Grotesque** (Google Fonts), weights 600–800, tight tracking (-0.02em). H1 40/44 mobile → 56/58 desktop, weight 700. H2 28/34, weight 700. H3 18/26, weight 600.
- Body: **IBM Plex Sans** 400/500, 16/27; secondary copy 14/23 muted.
- Data / labels: **IBM Plex Mono** 400/500/600. Micro-labels 11/16 uppercase 0.14em; table numerals 13/20 with `font-variant-numeric: tabular-nums`; big readouts 30–44px weight 600 tracking -0.03em.
- Buttons 13px mono uppercase-ish weight 500, tracking 0.04em.

**Spacing & shapes:** 4px scale (4/8/12/16/24/32/40/64). Radii: cards and inputs 3px, buttons 3px, badges 2px, segmented controls 2px. No fully rounded pills except the status dot. Icon buttons are square 36×36 with 3px radius.

**Elevation:** no shadows anywhere. Hierarchy from hairlines, surface tint (card on background), and type scale. The only translucent layer is the sticky header (`bg-background/85`, `backdrop-blur`, `border-b`). Sticky sidebar has a top hairline and a mono label, not a floating panel.

## Shared Patterns & States

- **PrimaryButton:** ink background, bone text, 3px radius, 40px height, mono 13px; hover lightens ink by one step; focus 2px lime ring offset 2px. **SecondaryButton:** transparent with 1px border; hover fills muted. **Ghost:** text only, underline on hover.
- **DataCard:** card background, 1px border, 3px radius, 20px padding, optional mono header row with a right-aligned action.
- **MetricReadout:** uppercase mono label, 32px tabular value, muted sub-line.
- **NumberField / LogSlider:** label row (mono label + numeric input right-aligned, 88px wide), slider 4px track with 12px square thumb, lime fill left of thumb.
- **StatusBadge:** 2px radius, 1px border in status color, tinted background at 12% alpha, uppercase mono 11px with a 6px square dot: 🟢 ok / 🟡 warn / 🔴 bad (dot only, no emoji glyphs).
- **AdSlot:** dashed 1px border, muted 4% fill, centered mono label `ADVERTISEMENT · 970×90`, explicit `min-height` (90/250/600) so layout never shifts. Always ≥24px from any button.
- **ResultTable:** sticky header row in mono uppercase, hairline row dividers, hover row tint, cheapest row marked with a lime left tick and `LOWEST` micro-label.
- **Accordion (FAQ):** hairline dividers, mono plus/minus indicator, 200ms height animation, 16px body.
- **Motion:** 120ms ease-out on hover/active, 200ms on accordion and theme swap. No entrance animations, no parallax.
- **Accessibility:** 44px minimum row/control height, 4.5:1 text contrast (muted text checked against card), visible lime focus ring on every interactive element, `aria-label` on icon-only buttons, real `<table>`/`<th scope>` semantics, form errors announced with `aria-live`, accordion fully keyboard operable.

## Media

No photography or illustration — this is an operational tool, and imagery would dilute the readout-first hierarchy. The only visuals are data graphics: provider-colored cost bars, a memory-composition meter (weights / KV cache / overhead segments), and a hardware-fit mini table. All drawn with CSS/SVG, no raster assets. The logo is a 20px typographic mark (mono `mm` inside a 1px square with a lime dot) rendered inline as SVG.
