# Relay Design System

## Source

Relay is the visual system for the ticketing app redesign. The repo-local handover is `DESIGN.md`; the upstream Claude Design prototype lives at `/Users/ram/Downloads/ticket system`.

The prototype files should be read as component and behavior references:

- `app.jsx` -> shell, sidebar, topbar, persona routing.
- `screens.jsx` -> dashboard, list, detail, login, requester, and user-management surfaces.
- `ui.jsx` -> reusable primitives for avatar, status, priority, SLA, sentiment, buttons, and cards.
- `styles*.css` -> tokens, density, table, chip, timeline, and shell styling.
- `uploads/` -> inspiration images for density and product-quality bar, not literal app assets.

## Principles

- Build an operational service-desk UI, not a marketing or gallery page.
- Keep screens compact, scannable, and data-forward.
- Surface ticket ID, summary, priority, status, SLA, requester, and owner consistently.
- Use tokens and shared primitives for semantic UI.
- Preserve existing auth, permissions, route structure, and data behavior.

## Tokens

Relay tokens live in `src/app/globals.css` and are exposed as CSS variables:

- Surfaces: `--relay-bg`, `--relay-bg-soft`, `--relay-surface`, `--relay-surface-2`, `--relay-hover`.
- Borders: `--relay-border`, `--relay-border-soft`, `--relay-border-strong`.
- Text: `--relay-text`, `--relay-text-soft`, `--relay-text-muted`, `--relay-text-faint`.
- Accent: `--relay-accent`, `--relay-accent-soft`, `--relay-accent-text`, `--relay-accent-strong`.
- Layout: `--relay-sidebar-w`, `--relay-topbar-h`, `--relay-row-h`, `--relay-pad-x`, `--relay-pad-y`.
- Priority: `--relay-p1`, `--relay-p1-soft`, through `--relay-p4`, `--relay-p4-soft`.
- SLA/status: `--relay-good`, `--relay-good-soft`, `--relay-warn`, `--relay-warn-soft`, `--relay-bad`, `--relay-bad-soft`.

## Shared Primitives

Use `src/components/ticket-primitives.tsx` instead of ad hoc badge markup:

```tsx
<PriorityBadge priority={ticket.priority} />
<StatusPill status={ticket.status} />
<SlaBadge deadline={ticket.deadline} status={ticket.status} />
<SentimentChip sentiment={ticket.sentiment} />
<FilterChip active={currentStatus === "progress"}>In progress</FilterChip>
```

Semantic mappings:

- Priority: `P1 · Critical`, `P2 · High`, `P3 · Normal`, `P4 · Low`.
- Status: new/requested violet, in-progress/approved indigo, hold/pending amber, resolved/implemented emerald, cancelled slate.
- SLA: on-track muted with green dot, soon amber, imminent/breached red, closed muted.
- Sentiment: frustrated red, neutral slate, calm green/teal.

## What Not To Do

- Do not follow the old Apple-style design direction.
- Do not hardcode semantic colors in route files.
- Do not use decorative orbs, bokeh, or marketing hero composition.
- Do not use uploaded inspiration screenshots as literal assets.
- Do not let badge, nav, button, or table text clip or overlap.
- Do not introduce negative letter-spacing in final CSS.

## Verification

For each implementation slice:

- Run `npm run lint`.
- Manually check changed pages at desktop and mobile widths.
- Confirm light and dark token combinations remain readable.
- Confirm existing route links, filters, pagination, auth, and role gates still work.
