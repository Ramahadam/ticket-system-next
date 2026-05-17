# Design Handover: Beacon / Relay Ticket System

## Source Of Truth

The current UI/UX redesign reference is the React prototype in:

`/Users/ram/Downloads/ticket system`

That folder was created in Claude Design. Treat its React components as the design handover, not just its CSS. The two images under `uploads/` were inspiration images sent into Claude Design; they should inform the product-quality bar, density, sidebar/table patterns, and layout discipline, but the React prototype is the direct target.

Primary files:

- `index.html` loads the prototype with React 18, Babel, Inter, and JetBrains Mono.
- `app.jsx` defines the app shell, routing, persona behavior, sidebar, topbar, and tweak controls.
- `screens.jsx` defines login, dashboard, list, detail, create, profile, my tickets, and users screens.
- `ui.jsx` defines reusable primitives such as avatar, status pill, priority pill, SLA cell, button, inputs, and cards.
- `data.jsx` defines the Beacon domain model, ticket statuses, priority labels, sentiment, SLA rules, users, incidents, service requests, and changes.
- `styles.css`, `styles-shell.css`, `styles-components.css`, and `styles-extra.css` define tokens and visual rules.
- `tweaks-panel.jsx` defines tweakable design controls for accent, density, persona, and sidebar collapse.

## Product Direction

Beacon / Relay is a dense operational IT ticketing interface. It should feel like a serious service desk console: quiet, structured, fast to scan, and clear under repeated daily use.

This is not a marketing page and not an Apple-style gallery. Avoid oversized hero composition, decorative visual effects, and loose editorial whitespace. Use compact SaaS layout, restrained surfaces, subtle borders, and high information clarity.

## Visual Personality

- Operational, calm, and precise.
- Neutral light canvas with indigo accent.
- Data-forward: tickets, SLA risk, priority, assignment, and status should be visible without hunting.
- Compact typography and rows, with tabular numerics for counts and IDs.
- Rounded but controlled: most controls sit in the 6-10px radius range.
- Shadows are restrained and functional, mainly for floating panels/modals.

## Core Tokens

Use these tokens as the basis for `src/app/globals.css`.

```css
:root {
  --relay-bg: oklch(0.992 0.002 255);
  --relay-bg-soft: oklch(0.975 0.003 255);
  --relay-surface: #ffffff;
  --relay-surface-2: oklch(0.985 0.003 255);
  --relay-hover: oklch(0.965 0.004 255);

  --relay-border: oklch(0.92 0.004 255);
  --relay-border-soft: oklch(0.945 0.004 255);
  --relay-border-strong: oklch(0.86 0.005 255);

  --relay-text: oklch(0.18 0.02 260);
  --relay-text-soft: oklch(0.32 0.015 260);
  --relay-text-muted: oklch(0.52 0.012 260);
  --relay-text-faint: oklch(0.68 0.008 260);

  --relay-accent: oklch(0.52 0.21 265);
  --relay-accent-soft: oklch(0.94 0.04 265);
  --relay-accent-text: oklch(0.42 0.21 265);
  --relay-accent-strong: oklch(0.46 0.22 265);
  --relay-on-accent: #ffffff;

  --relay-sidebar-w: 240px;
  --relay-topbar-h: 56px;
  --relay-row-h: 52px;
  --relay-pad-x: 16px;
  --relay-pad-y: 14px;
  --relay-radius: 10px;
  --relay-radius-sm: 6px;
}
```

Dark mode should mirror the prototype's `[data-theme="dark"]` values: dark neutral surfaces, lighter text, indigo accent, tokenized semantic soft backgrounds, and darker shadows.

## Semantic Tokens

Priority:

- P1 Critical: red foreground with red soft background.
- P2 High: orange foreground with orange soft background.
- P3 Normal: cyan/blue foreground with cyan soft background.
- P4 Low: slate foreground with slate soft background.

Status:

- New/requested: violet.
- In progress/approved: indigo.
- On hold/pending review: amber.
- Resolved/implemented: emerald.
- Cancelled/canceled: slate.

SLA:

- On track: green dot, neutral text.
- Soon: amber dot.
- Imminent: orange-tinted pill.
- Breached: red-tinted pill.
- Closed: muted text.

Sentiment:

- Frustrated: red.
- Neutral: slate.
- Calm: teal.

## Typography

Use a system-compatible Inter/Geist direction:

- Sans: Inter or Geist, falling back to `ui-sans-serif`, `system-ui`, `-apple-system`.
- Mono: JetBrains Mono or Geist Mono for IDs, shortcuts, roles, counts, and tabular values.
- Base UI text: 14px regular density.
- Compact density: 13px.
- Comfortable density: 15px.
- Page titles: around 26px, weight 600.
- Section/card titles: 14-15px, weight 600.
- Table headers: 11-12px uppercase, muted.
- Body/table rows: 13-14px.

Project rule: final implementation should keep CSS `letter-spacing: 0`, even where the prototype uses small tracking adjustments.

## Layout Shell

The target shell comes from `app.jsx`, `styles-shell.css`, and the uploaded inspiration images:

- Left sidebar: 240px expanded, about 64-72px collapsed.
- Topbar: 56px high.
- Main content: scrollable area with page padding around 24-32px.
- Sidebar: brand mark/name, optional search, primary navigation, notification shortcut, user card, collapse control.
- Topbar: persona/context banner or breadcrumbs, AI/utility button, notification icon with dot, avatar.
- Staff routes: dashboard, incidents, requests, changes, users for admins.
- Standard user routes: my tickets and profile.

## Components

### Sidebar

Use the prototype's sidebar as the implementation model:

- Brand: Beacon/Relay mark plus app name.
- Search: compact input with search icon and keyboard shortcut.
- Navigation: role-aware items with counts.
- Active state: subtle surface fill, border/inset treatment, accent icon/count.
- Collapsed state: icons remain, labels/counts/user metadata hide.
- User card: avatar, name, role/team, profile navigation.

### Topbar

- Sticky or fixed within the app shell.
- Light surface with bottom border.
- Room for breadcrumb/title or persona/context indicator.
- Icon buttons are 34px square, 8px radius, border-backed, with accessible titles/tooltips.
- Notification dot uses accent or priority red depending on context.

### Dashboard

Dashboard target from `DashboardScreen`:

- Page header: "Operations", short workload/date subtitle, export action, primary "New incident".
- Four stat cards: open incidents, open requests, open changes, active users.
- Stat cards include label, large tabular value, small delta, and optional mini bars.
- Middle grid: SLA compliance, open by priority, frustrated users.
- Recent incidents table: ID, summary, requester, priority, SLA, owner, status.

### Tables And Lists

- Dense rows around 52px regular density.
- IDs in mono/tabular style.
- Rows hover subtly and are clickable when they navigate.
- Priority, SLA, owner, and status should be visible in-row.
- Filter controls should use chips, not a row of generic buttons.
- Table headers are muted, small, and uppercase.

### Badges And Pills

Implement reusable primitives:

- `PriorityBadge` / `PriorityPill`
- `StatusPill`
- `SlaBadge` / `SlaCell`
- `SentimentChip`

These should be token-backed and reused across dashboard, lists, details, and user-facing ticket cards.

### Detail Screens

Use the prototype's `DetailScreen` patterns:

- Main detail column plus right aside on desktop.
- Aside rows for metadata.
- Timeline/activity with vertical connector and small icon dots.
- Notes use muted card-like blocks.
- Keep detail pages operational and scan-friendly.

### Login

The prototype uses a split login page with a form on the left and a branded aside on the right. Preserve the information structure:

- Beacon/Relay brand.
- Work email and password fields.
- Inline error state.
- Full-width primary sign-in button.
- Aside copy explaining the IT ticketing workspace.
- Replace purely decorative gradients with flat token surfaces or very subtle non-decorative surface treatments if needed to satisfy project frontend rules.

## Inspiration Images

The two images in `/Users/ram/Downloads/ticket system/uploads` are inspiration, not assets to copy literally.

Use them for:

- Clean sidebar/table density.
- Strong alignment and generous but controlled spacing.
- Minimal icon-led navigation.
- Rectangular operational panels.
- Clear active navigation states.
- Table-heavy SaaS visual rhythm.

Do not import their branding, customer names, avatars, or unrelated product concepts.

## Implementation Notes

- Translate inline prototype styles into shared Tailwind classes and CSS variables.
- Prefer existing local primitives under `src/components/ui`.
- Add small app-specific primitives only where repeated domain presentation needs them.
- Keep colors tokenized in `globals.css`.
- Avoid scattering hex values through route files.
- Do not add new dependencies unless approved.
- Preserve auth, permissions, and data behavior.
- Run lint before considering the redesign complete.

## Do

- Build the real app from the React prototype's component hierarchy and behavior.
- Keep staff and standard-user experiences role-aware.
- Show priority, status, SLA, owner, and requester consistently.
- Use compact tables and cards suitable for repeated service-desk work.
- Verify mobile and desktop layouts for clipping/overlap.

## Don't

- Don't follow the old Apple-style handover.
- Don't create a landing page.
- Don't add decorative orbs, bokeh, or marketing-style hero sections.
- Don't use the uploaded images as literal assets.
- Don't hardcode semantic colors in every page.
- Don't let display text clip inside badges, buttons, nav rows, or table cells.
