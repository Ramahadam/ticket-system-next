# Implementation Plan: Beacon / Relay UI/UX Redesign

## Overview

Translate the Claude Design React prototype in `/Users/ram/Downloads/ticket system` into this Next.js ticket system. The work is UI-only: establish Relay tokens, add shared domain presentation primitives, then apply the design vertically across shell, dashboard, lists, details, requester views, login, docs, and verification.

## Architecture Decisions

- Use `DESIGN.md` as the repo-local handover, with the React prototype as the upstream source of truth.
- Keep the app's existing Next.js App Router, server components, auth, permissions, Prisma queries, and route structure.
- Implement shared token-backed primitives before page work: `PriorityBadge`, `StatusPill`, `SlaBadge`, `SentimentChip`, `FilterChip`, and small dashboard primitives.
- Map Relay tokens into `src/app/globals.css` and existing `src/components/ui/*` primitives instead of scattering one-off hex values in route files.
- Preserve project frontend constraints: compact operational UI, no marketing hero, no decorative orb/bokeh backgrounds, no negative letter-spacing in final CSS.

## Dependency Graph

```text
DESIGN.md / SPEC.md
  |
  |-- Relay CSS tokens and base primitive styling
  |     |
  |     |-- Domain UI primitives
  |     |     |-- Dashboard
  |     |     |-- Staff list pages
  |     |     |-- Staff detail pages
  |     |     |-- User my-tickets pages
  |     |
  |     |-- Shell primitives
  |           |-- Sidebar
  |           |-- Site header / topbar
  |
  |-- Login page
  |
  |-- Feature guide and verification
```

## Task List

### Phase 1: Foundation

## Task 1: Normalize Relay Tokens And Base UI Theme

**Description:** Replace any remaining Apple-style global theme direction with Relay tokens from `DESIGN.md`, mapping surfaces, borders, text, accent, priority, status, SLA, spacing, row height, sidebar width, topbar height, and light/dark values into the app theme.

**Acceptance criteria:**
- [ ] `globals.css` exposes Relay tokens with light and dark variants.
- [ ] Final CSS uses `letter-spacing: 0` for global/base styles.
- [ ] Button/card/table/sidebar primitives still render with existing class APIs.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: no obvious Apple `#0066cc`/SF Pro-only direction remains in global theme.

**Dependencies:** None

**Files likely touched:**
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/table.tsx`

**Estimated scope:** M

## Task 2: Add Domain Presentation Primitives

**Description:** Add reusable primitives for repeated ticket metadata presentation based on `ui.jsx`: priority, status, SLA, sentiment, and filter chips. These become the single rendering path for badges and chips.

**Acceptance criteria:**
- [ ] Priority renders as `P1 · Critical` through `P4 · Low`.
- [ ] Status maps workflow states to violet/indigo/amber/emerald/slate token-backed pills.
- [ ] SLA renders on-track, soon, imminent, breached, and closed states with token-backed colors.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check primitives in an existing page after first integration task.

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/ticket-primitives.tsx`
- `src/lib/constants.ts`
- `src/lib/helpers.ts`
- `src/components/ui/badge.tsx`

**Estimated scope:** M

## Task 3: Document Relay Feature Contract

**Description:** Create the feature guide requested by issue #3 so future work knows the source, token names, semantic mappings, and usage rules.

**Acceptance criteria:**
- [ ] `docs/features/relay-design-system.md` exists.
- [ ] Guide references `DESIGN.md`, the prototype folder, semantic token mappings, and usage examples.
- [ ] Guide names what not to do: hardcoded badge colors, Apple-style gallery UI, decorative gradients/orbs.

**Verification:**
- [ ] Read the doc for consistency with `DESIGN.md` and `SPEC.md`.

**Dependencies:** Task 1, Task 2

**Files likely touched:**
- `docs/features/relay-design-system.md`

**Estimated scope:** XS

### Checkpoint: Foundation

- [ ] `npm run lint` passes.
- [ ] Relay tokens are available in CSS.
- [ ] Shared primitives compile.
- [ ] Human reviews token and primitive direction before broad page rollout.

### Phase 2: App Shell And Login

## Task 4: Adapt Sidebar To Beacon Shell

**Description:** Translate the prototype sidebar into the existing `AppSidebar` and local sidebar primitives while preserving role-aware navigation for staff and standard users.

**Acceptance criteria:**
- [ ] Sidebar uses 240px expanded / collapsed icon behavior consistent with the prototype where supported.
- [ ] Brand, search affordance, active nav state, counts/badges, and user card match Beacon/Relay direction.
- [ ] Staff/admin/user navigation permissions remain unchanged.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: staff layout and user layout sidebar navigation still routes correctly.

**Dependencies:** Task 1, Task 2

**Files likely touched:**
- `src/components/app-sidebar.tsx`
- `src/components/nav-main.tsx`
- `src/components/nav-user.tsx`
- `src/components/ui/sidebar.tsx`

**Estimated scope:** M

## Task 5: Adapt Site Header / Topbar

**Description:** Update the shared header from a simple title bar into a Beacon/Relay topbar surface with title/breadcrumb room, utility buttons where meaningful, notification affordance, and compact 56px behavior.

**Acceptance criteria:**
- [ ] Header height and surface match Relay topbar tokens.
- [ ] Existing `SiteHeader title` call sites keep working.
- [ ] Header does not introduce fake workflows beyond harmless visual affordances.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: dashboard, list, detail, and user routes have readable headers without overlap.

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/site-header.tsx`
- `src/components/ui/separator.tsx`

**Estimated scope:** S

## Task 6: Rework Login Page To Beacon Split Layout

**Description:** Align login with `LoginScreen`: form-first split layout, Beacon/Relay brand, compact form controls, inline errors, and branded aside content without decorative gradient/orb treatment.

**Acceptance criteria:**
- [ ] Login form remains functional with existing auth behavior.
- [ ] Split layout collapses cleanly on mobile.
- [ ] Decorative gradient in prototype is replaced with tokenized surface treatment if needed.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: login page at desktop and mobile widths.

**Dependencies:** Task 1

**Files likely touched:**
- `src/app/login/page.tsx`
- `src/components/login-form.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`

**Estimated scope:** M

### Checkpoint: Shell

- [ ] `npm run lint` passes.
- [ ] Staff and user layouts still render.
- [ ] Login remains usable.
- [ ] No text overlap in sidebar/header/login at desktop and mobile widths.

### Phase 3: Staff Workflows

## Task 7: Rebuild Staff Dashboard Composition

**Description:** Translate `DashboardScreen` into the real dashboard: stat cards, SLA compliance, open-by-priority bars, frustrated/user attention panel where supported by available data, and recent open incidents table.

**Acceptance criteria:**
- [ ] Dashboard stat row matches Beacon density and visual hierarchy.
- [ ] Priority chart uses tokenized priority colors.
- [ ] Recent incidents use `PriorityBadge`, `SlaBadge` where deadline data exists, and `StatusPill`.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: dashboard renders with and without incidents.

**Dependencies:** Task 1, Task 2

**Files likely touched:**
- `src/app/(staff)/dashboard/page.tsx`
- `src/app/(staff)/dashboard/data.ts`
- `src/components/ticket-primitives.tsx`
- `src/components/ui/table.tsx`

**Estimated scope:** M

## Task 8: Convert Staff Incident List To Relay Table

**Description:** Apply the prototype table/list pattern to the incident list as the first vertical list slice, proving filters, table density, badges, owner/requester rendering, and pagination.

**Acceptance criteria:**
- [ ] Status filters and sort controls render as chips.
- [ ] Incident rows show ID, summary, status pill, priority pill, requester, owner, and SLA/deadline where available.
- [ ] Existing query params, pagination, and links keep working.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: `/incidents` filters, sort links, pagination, and row links.

**Dependencies:** Task 2, Task 5

**Files likely touched:**
- `src/app/(staff)/incidents/page.tsx`
- `src/app/(staff)/incidents/data.ts`
- `src/components/ticket-primitives.tsx`
- `src/components/ui/table.tsx`

**Estimated scope:** M

## Task 9: Convert Staff Requests And Changes Lists

**Description:** Apply the validated incident list pattern to service requests and change requests, using the same primitives and chip controls.

**Acceptance criteria:**
- [ ] Requests and changes lists use the same table density and chip controls.
- [ ] Status/priority/classification values use token-backed primitives.
- [ ] Query params, pagination, and creation links keep working.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: `/requests` and `/change` filters, sort links, pagination, row links.

**Dependencies:** Task 8

**Files likely touched:**
- `src/app/(staff)/requests/page.tsx`
- `src/app/(staff)/change/page.tsx`
- `src/app/(staff)/requests/data.ts`
- `src/app/(staff)/change/data.ts`
- `src/components/ticket-primitives.tsx`

**Estimated scope:** M

## Task 10: Convert Staff Detail Pages To Relay Detail Layout

**Description:** Apply the prototype detail-page pattern to incident, service request, and change detail pages: main content, metadata aside, semantic pills, notes/timeline treatment, and update form placement.

**Acceptance criteria:**
- [ ] Detail header shows summary with status and priority/classification primitives.
- [ ] Metadata uses a right aside on desktop and stacks on mobile.
- [ ] Notes and update sections keep existing behavior.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: one incident, one request, and one change detail page.

**Dependencies:** Task 2, Task 8, Task 9

**Files likely touched:**
- `src/app/(staff)/incidents/[id]/page.tsx`
- `src/app/(staff)/requests/[id]/page.tsx`
- `src/app/(staff)/change/[id]/page.tsx`
- `src/components/ticket-primitives.tsx`
- `src/components/ui/card.tsx`

**Estimated scope:** M

### Checkpoint: Staff Core

- [ ] `npm run lint` passes.
- [ ] Dashboard, incidents, requests, changes render with shared primitives.
- [ ] Existing permissions, links, filters, and update forms still work.
- [ ] Human reviews staff workflow visuals before requester/admin polish.

### Phase 4: Requester And Admin Surfaces

## Task 11: Convert User My-Tickets Views

**Description:** Apply Beacon/Relay tabs, cards/tables, status/priority/SLA primitives, and compact pagination to the requester-facing `my-tickets` overview and sections.

**Acceptance criteria:**
- [ ] My Tickets tabs render as Relay tabs/chips.
- [ ] Incident, request, and change sections use the same semantic primitives as staff pages.
- [ ] New ticket links and pagination remain functional.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: `/my-tickets` with each tab selected.

**Dependencies:** Task 2, Task 9

**Files likely touched:**
- `src/app/(user)/my-tickets/page.tsx`
- `src/components/ticket-primitives.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/table.tsx`

**Estimated scope:** M

## Task 12: Convert User Detail Pages

**Description:** Bring requester-facing incident, request, and change detail pages into the same Relay detail language while preserving ownership permissions and available actions.

**Acceptance criteria:**
- [ ] User detail pages share status/priority/SLA treatment with staff pages.
- [ ] Owner/requester metadata, attachments, notes, and allowed updates remain intact.
- [ ] Mobile layout stacks cleanly.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: one user incident, request, and change detail page.

**Dependencies:** Task 10, Task 11

**Files likely touched:**
- `src/app/(user)/my-tickets/incidents/[id]/page.tsx`
- `src/app/(user)/my-tickets/requests/[id]/page.tsx`
- `src/app/(user)/my-tickets/change/[id]/page.tsx`
- `src/components/ticket-primitives.tsx`
- `src/components/ui/card.tsx`

**Estimated scope:** M

## Task 13: Convert Users/Admin List Surface

**Description:** Align the admin users list with Relay table/card density and semantic role/activity presentation without changing user management behavior.

**Acceptance criteria:**
- [ ] Users list uses compact table/card styling.
- [ ] Role and active state are rendered as clear pills/badges.
- [ ] Create/edit/delete behavior remains unchanged.

**Verification:**
- [ ] Run `npm run lint`.
- [ ] Manual check: `/users` list and user actions are visible and reachable.

**Dependencies:** Task 1, Task 2, Task 5

**Files likely touched:**
- `src/app/(staff)/users/page.tsx`
- `src/components/delete-user-button.tsx`
- `src/components/user-create-form.tsx`
- `src/components/user-edit-form.tsx`

**Estimated scope:** M

### Checkpoint: Requester/Admin

- [ ] `npm run lint` passes.
- [ ] Standard-user and admin surfaces are visually aligned.
- [ ] Role-based access behavior is unchanged.

### Phase 5: Final Verification And Cleanup

## Task 14: Browser QA And Responsive Pass

**Description:** Run the app locally, inspect key pages at desktop and mobile widths, and fix visual defects discovered during QA.

**Acceptance criteria:**
- [ ] Dashboard, sidebar, header, login, list, detail, my-tickets, and users pages have no obvious overlap/clipping.
- [ ] Light and dark mode badge/token combinations remain readable.
- [ ] Charts/bars and tables render nonblank.

**Verification:**
- [ ] Start dev server with `npm run dev`.
- [ ] Browser check desktop and mobile widths.
- [ ] Run `npm run lint` after any QA fixes.

**Dependencies:** Tasks 1-13

**Files likely touched:**
- Any previously touched UI file, scoped to visual bug fixes.

**Estimated scope:** M

## Task 15: Build, Issue Closure Notes, And Cleanup

**Description:** Run final verification, document any environment blockers, update issue/PR notes, and decide whether generated planning/index artifacts should be committed.

**Acceptance criteria:**
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes or blocker is documented.
- [ ] Issues #3 and #4 acceptance criteria are mapped to completed work.
- [ ] Decide whether to keep `SPEC.md`, `DESIGN.md`, `tasks/`, `.claude/`, and `.codebase-memory/` in the final commit.

**Verification:**
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual review of git diff for unrelated changes.

**Dependencies:** Task 14

**Files likely touched:**
- `docs/features/relay-design-system.md`
- `SPEC.md`
- `DESIGN.md`
- `tasks/plan.md`
- `tasks/todo.md`

**Estimated scope:** S

### Checkpoint: Complete

- [ ] All success criteria in `SPEC.md` are satisfied or explicitly deferred.
- [ ] Open questions are resolved or documented.
- [ ] Lint passes.
- [ ] Build passes or documented blocker is accepted.
- [ ] Human approves final UI before PR/merge.

## Risks And Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Existing uncommitted Apple-style edits conflict with Beacon/Relay | High | Adapt or overwrite only after human approval; avoid reverting unrelated work blindly. |
| Shared primitive changes affect many pages at once | Medium | Land primitives first, integrate one vertical slice, then repeat pattern. |
| Build requires database env because `npm run build` runs Prisma migrate deploy | Medium | Run lint consistently; document DB/env blocker if build cannot run locally. |
| Prototype uses decorative gradients and negative tracking that conflict with project rules | Medium | Preserve structure and hierarchy, but replace gradients with flat token surfaces and keep letter-spacing at 0. |
| List/detail pages have similar but separate code paths | Medium | Convert incidents first as canonical slice, then requests/change/user pages with the same primitives. |
| SLA data availability differs by ticket type | Low | Make `SlaBadge` accept missing deadlines and render a muted closed/unavailable state. |

## Open Questions

- Should the user-facing name be "Beacon", "Relay", or the existing "Ticket System" with Relay only as internal token naming?
- Should the already-created `.codebase-memory/graph.db.zst` be committed for future agents?
- Should `.claude/commands` remain in this repo, or were those installed only for local command convenience?
- Should we adapt the current uncommitted Apple-style UI edits in place, or restart implementation from the committed baseline while preserving those changes separately?
