# Spec: Ticket System UI/UX Redesign Alignment

## Assumptions

1. `/Users/ram/Downloads/ticket system` is the UI/UX redesign handover/reference to use for this pass.
2. Open GitHub issues #3 and #4 define the implementation scope for this pass.
3. `DESIGN.md` has been rewritten as the current Beacon/Relay handover derived from the React prototype and should be used as the repo-local design summary.
4. The current uncommitted UI edits are in-progress work and should be preserved, reviewed, and refined rather than reverted, but any remaining Apple-style direction should be reconciled back to Beacon/Relay.
5. This change is presentation/UI only: no Prisma schema changes, auth changes, ticket workflow changes, or data model changes.
6. Project rules override external design references. In particular, frontend implementation must avoid decorative gradient/orb backgrounds and keep letter spacing at `0`, even where reference files describe tracking adjustments.

## Objective

Create a coherent, production-ready Beacon/Relay visual system for the ticketing app by translating the UI/UX redesign prototype in `/Users/ram/Downloads/ticket system` into the real Next.js codebase, guided by the open GitHub design issues:

- Issue #3: Relay design system tokens, priority badges, status pills, SLA badge tokenization, and feature guide.
- Issue #4: Beacon/Relay UI polish across dashboard, sidebar, site header, list filtering, login page, global layout tokens, and small reusable primitives.

Users are service desk staff and ticket requesters who need a clear, dense, operational interface for scanning ticket status, priority, SLA risk, and next actions. Success means the app feels cohesive and efficient without turning operational screens into a marketing landing page.

## Redesign Reference

Primary reference folder: `/Users/ram/Downloads/ticket system`

- `index.html` -> prototype entrypoint; loads React 18, Babel, Inter, JetBrains Mono, and the JSX files in order.
- `app.jsx` -> app shell, hash routing, staff vs standard-user route behavior, sidebar, topbar, persona banner, tweak application.
- `data.jsx` -> active Beacon mock domain model: priorities, statuses, sentiment, users, incidents, requests, changes, SLA rules.
- `mock-data.jsx` -> alternate/sample Relay data set; useful for naming and domain examples, but `data.jsx` appears to drive the active Beacon prototype.
- `styles.css` -> Relay tokens: `--accent`, priority colors, SLA semantic colors, density values, `--sidebar-w`, `--topbar-h`, row height, shadows, light/dark themes.
- `styles-shell.css` -> app shell, sidebar, brand mark, navigation counts, top bar, search input, notification icon button.
- `styles-components.css` -> page layout, buttons, cards, stat cards, tables, badges, SLA cell, form fields.
- `styles-extra.css` -> tabs, filter chips, detail layout, timeline, bar charts, empty state, modal, AI strip.
- `screens.jsx` -> target screen behavior and composition for login, dashboard, tables, details, and operational cards.
- `ui.jsx` -> reusable primitive behavior for avatar, status pill, priority pill, SLA cell, button variants, and formatting helpers.
- `tweaks-panel.jsx` -> Claude Design tweak controls for accent, density, persona, dark mode, and sidebar collapse.
- `uploads/*.png` -> inspiration screenshots provided to Claude Design; use for layout quality and density, not literal assets.

Design direction to carry forward:

- Dense operational SaaS interface, not a landing page.
- Geist/system font stack, compact 13-14px UI text, strong tabular numerics.
- Light neutral surfaces, subtle borders, restrained shadows, rounded 6-10px controls.
- Indigo Relay accent from `--accent: oklch(0.52 0.21 265)`.
- Tokenized priority, status, SLA, hover, border, and dark-mode colors.
- Sidebar width around `240px`, topbar around `56px`, row height around `52px`, with compact/comfy density support where practical.
- Filters as chips, status/priority/SLA as semantic pills, charts as quiet horizontal bars.
- React component behavior matters: preserve persona-aware navigation, staff/requester route differences, dashboard KPI composition, SLA calculations, ticket row anatomy, and reusable domain pills when translating into the Next.js app.

## Tech Stack

- Next.js `16.2.4` App Router
- React `19.2.4`
- TypeScript `^5`
- Tailwind CSS `^4`
- Prisma `^7.7.0`
- next-auth `5.0.0-beta.31`
- lucide-react icons
- Recharts for charts
- shadcn/Base UI-style local components under `src/components/ui`

Before implementation, read the relevant Next.js guide in `node_modules/next/dist/docs/` because project instructions note this Next.js version differs from older conventions.

## Commands

- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Start: `npm run start`
- Seed: `npm run seed`

Notes:

- `npm run build` runs `prisma generate && prisma migrate deploy && next build`; it may require a valid database environment.
- If build cannot run because local DB/env is unavailable, run `npm run lint` and document the build blocker.

## Project Structure

- `src/app/` -> Next.js App Router routes and layouts.
- `src/app/(staff)/` -> staff-facing dashboard, incident, request, change, user, and knowledge-base pages.
- `src/app/(user)/` -> requester-facing ticket views.
- `src/app/globals.css` -> global theme tokens, Tailwind theme mapping, base styles.
- `src/components/` -> shared application components such as sidebar, header, forms, providers.
- `src/components/ui/` -> reusable primitive components.
- `src/lib/` -> constants, helpers, permissions, ticket helpers.
- `docs/features/` -> feature guides such as `relay-design-system.md`.
- `/Users/ram/Downloads/ticket system` -> external UI/UX redesign prototype/reference.
- `DESIGN.md` -> repo-local Beacon/Relay handover distilled from the external React prototype.
- `SPEC.md` -> this living specification.

## Code Style

Prefer small reusable UI primitives for repeated status/priority/SLA presentation. Components should accept domain values, map them to token-backed classes, and avoid hardcoded visual language scattered through pages.

Example target style:

```tsx
const priorityTone = {
  P1: "bg-[color:var(--relay-p1-bg)] text-[color:var(--relay-p1-fg)]",
  P2: "bg-[color:var(--relay-p2-bg)] text-[color:var(--relay-p2-fg)]",
  P3: "bg-[color:var(--relay-p3-bg)] text-[color:var(--relay-p3-fg)]",
  P4: "bg-[color:var(--relay-p4-bg)] text-[color:var(--relay-p4-fg)]",
} as const;

export function PriorityBadge({ priority }: { priority: keyof typeof priorityTone }) {
  return (
    <Badge className={cn("rounded-full px-2.5 py-1 text-xs font-medium", priorityTone[priority])}>
      {priorityLabel[priority]}
    </Badge>
  );
}
```

Conventions:

- Use CSS variables for design tokens instead of repeated hex values.
- Use lucide icons for buttons and utility actions when an icon exists.
- Keep operational screens compact, scannable, and data-forward.
- Avoid nested cards and decorative page-section cards.
- Keep `letter-spacing: 0` in final CSS, even if prototype files use negative or positive tracking.

## Testing Strategy

- Static verification: `npm run lint`.
- Build verification: `npm run build` when database/env are available.
- Manual UI verification:
  - Dashboard at desktop and mobile widths.
  - Sidebar collapsed/expanded and off-canvas states.
  - Site header sticky behavior.
  - Staff list pages for incidents, requests, changes, users, and knowledge base.
  - User ticket pages under `(user)`.
  - Login page.
  - Light and dark theme rendering for badges and tokens.
- Browser verification should confirm there is no incoherent text overlap, clipped button labels, blank charts, or unreadable dark-mode combinations.

## Boundaries

- Always:
  - Preserve user/uncommitted changes unless explicitly told otherwise.
  - Use the codebase knowledge graph before code discovery.
  - Keep UI changes token-backed and consistent across staff and user surfaces.
  - Run `npm run lint` before presenting implementation as complete.
  - Document any build/test command that cannot run and why.

- Ask first:
  - Replacing the current handover direction with a different visual system.
  - Adding dependencies.
  - Changing Prisma schema or migrations.
  - Changing auth/session behavior.
  - Removing or rewriting existing in-progress UI work.
  - Reintroducing the old Apple-style direction that previously lived in `DESIGN.md`.

- Never:
  - Commit secrets or environment files.
  - Edit generated/vendor directories.
  - Hide failing tests or remove failing coverage without approval.
  - Add decorative gradient/orb/bokeh backgrounds.
  - Let UI text overlap, clip, or resize layout unexpectedly.

## Success Criteria

- Priority renders as `P1 · Critical` through `P4 · Low` with token-backed severity colors.
- Status renders as color-coded pills for workflow states rather than plain text or outline-only badges.
- SLA badge uses shared token colors in both light and dark mode.
- Dashboard has a cohesive stats area, improved priority visualization, and a polished recent-incidents table without becoming visually noisy.
- Sidebar has coherent brand treatment, active navigation affordance, and optional badge/search behavior if supported by available data.
- Site header supports title/breadcrumb/search/notification affordances only where they serve real workflows.
- List filters use reusable chip-style controls rather than ad hoc button rows.
- Login page matches the Beacon/Relay prototype direction while replacing decorative gradients with flat/tokenized surfaces if final project rules remain unchanged.
- Feature guide exists at `docs/features/relay-design-system.md`.
- `npm run lint` passes.
- `npm run build` passes when required env/database are available, or the blocker is documented.

## Open Questions

1. Should the final user-facing design name be Beacon, Relay, or Ticket System with Relay used only internally for tokens?
2. Issue #4 and the prototype include gradients in places, but project frontend rules disallow decorative gradient/orb backgrounds. Should we replace those with flat token surfaces and subtle borders?
3. Should `.codebase-memory/graph.db.zst` be committed to share the fresh knowledge graph artifact with future agents?
4. Should the existing uncommitted Apple-style UI changes be adapted to Beacon/Relay, or should implementation restart from the current committed baseline while preserving them separately?
