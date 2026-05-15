# Feature: SLA Deadline Visibility

## What it does

Surfaces the existing `deadline` field on every ticket list and detail page so staff and end-users can see SLA status at a glance. A color-coded badge shows whether a ticket is **On Track**, **At Risk**, or **Breached**, together with a human-readable time label ("3h 20m left", "1d 4h overdue").

**User flows:**
- Staff opens the Incidents list → every row has an SLA column.
- Staff opens a ticket detail → the Deadline metadata field shows the formatted date plus the badge inline.
- End-user opens My Tickets → same SLA column on their incidents and service requests.

## How it works

### Data flow

`deadline DateTime?` already exists on `Incident` and `ServiceRequest` in the Prisma schema. The existing `calculateDeadline(priority)` helper in `src/lib/helpers.ts` sets it on creation. No schema changes were made.

At render time (server-side), each ticket's `deadline` and `priority` are passed to `<SlaBadge>`. The badge calls two pure functions from `src/lib/sla.ts`:

```
getSlaStatus(deadline, priority, now?)  →  SlaStatus
getTimeLabel(deadline, now?)            →  string
```

`SlaBadge` is a plain server component — it renders once per request and the time label is a snapshot. The `now` parameter defaults to `new Date()` on the server, making both functions fully deterministic and testable without mocking globals.

### SLA windows (must match `calculateDeadline`)

| Priority | Constant | Window |
|---|---|---|
| 1 | `PRIORITY.HIGH` | 4 hours |
| 2 | `PRIORITY.MEDIUM` | 1 day |
| 3 | `PRIORITY.NORMAL` | 3 days |
| 4 | `PRIORITY.LOW` | 4 days |

### Status thresholds

| Status | Condition |
|---|---|
| `none` | `deadline` is null/undefined |
| `breached` | `now >= deadline` |
| `at_risk` | `remaining / window < 0.25` (strictly less than 25%) |
| `on_track` | everything else |

### Files changed

| File | Role |
|---|---|
| `src/lib/sla.ts` | Pure helper functions + `SlaStatus` type |
| `src/lib/sla.test.ts` | 18 unit tests |
| `src/components/sla-badge.tsx` | Badge UI component |
| `src/app/(staff)/incidents/page.tsx` | SLA column in staff incident list |
| `src/app/(staff)/requests/page.tsx` | SLA column in staff service request list |
| `src/app/(staff)/incidents/[id]/page.tsx` | Badge on staff incident detail |
| `src/app/(staff)/requests/[id]/page.tsx` | Badge on staff service request detail |
| `src/app/(user)/my-tickets/page.tsx` | SLA column in user incident + request lists |
| `src/app/(user)/my-tickets/incidents/[id]/page.tsx` | Badge on user incident detail |
| `src/app/(user)/my-tickets/requests/[id]/page.tsx` | Badge on user service request detail |

## Tradeoffs

| Decision | Chosen | Alternative | Rationale |
|---|---|---|---|
| Server-rendered snapshot vs. live clock | Server snapshot | `useEffect` + `setInterval` | v1 scope; refreshing on navigation is acceptable. Adding a ticker would require `'use client'` and a rerender loop, which adds complexity for marginal UX gain at this stage. |
| No schema migration | Reuse existing `deadline` field | Add `firstResponseAt`, `resolvedAt` | Keeps v1 focused on visibility. True SLA tracking (time-to-first-response, time-to-resolution) requires schema changes and is a separate feature. |
| ChangeRequest excluded | Badge omitted | Add `deadline`/`priority` to `ChangeRequest` | `ChangeRequest` has neither field in the schema. A migration is out of scope for v1. |
| `at_risk` threshold | Strictly `< 25%` | `<= 25%` | Spec says "less than", so the boundary itself is on-track. |

## Known limitations

- **Stale label on long sessions.** The time label ("2h 15m left") is rendered server-side on page load. It won't tick down without a page refresh or navigation. A ticket can flip from At Risk to Breached during a session without the UI reflecting it.
- **ChangeRequest has no SLA.** The change request list and detail pages show no SLA badge because the model lacks `deadline` and `priority`.
- **Detail vs. list inconsistency.** List pages show a gray "No SLA" badge when deadline is null. Detail pages render nothing for null deadline. Minor UX inconsistency.
- **No auto-escalation.** The badge is display-only. No notifications, emails, or status transitions are triggered when a deadline is breached.

## What I would do next

**Short-term**
- Add a live ticker to `SlaBadge` via `useEffect`/`setInterval` so the label updates every minute without a page reload.
- Align the null-deadline display between list (shows "No SLA") and detail (shows nothing).

**Medium-term**
- Add `deadline` and `priority` to `ChangeRequest` so all three ticket types have SLA visibility.
- Add `firstResponseAt DateTime?` to `Incident` and `ServiceRequest` and track time-to-first-response separately from deadline.
- Add a dashboard widget showing the count of at-risk and breached tickets across all types.

**Long-term**
- Configurable SLA policies per ticket type or category (instead of hardcoded windows).
- Automated escalation: flag or reassign tickets when they breach SLA.
- SLA compliance reporting: percentage of tickets resolved within SLA by agent, team, or time period.
