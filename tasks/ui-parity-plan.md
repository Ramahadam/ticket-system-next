# UI Structure Parity Plan

Parent epic: https://github.com/Ramahadam/ticket-system-next/issues/4

Principle: match the Claude Design prototype's information architecture and workflow sections, not pixel-perfect styling. Use current production data honestly; create separate data-model issues for prototype-only concepts such as sentiment and historical trend series.

## Implementation Order

1. [x] Dashboard operations overview: https://github.com/Ramahadam/ticket-system-next/issues/7
   - Add shared dashboard primitives: metric cards, segmented SLA bar, attention list.
   - Use current counts, SLA deadlines, priorities, owner, requester, and status.
   - Use "Attention needed" instead of "Frustrated users" until real sentiment exists.
   - Show neutral trend fallback where historical trend data does not exist.

2. [x] Staff list screens: https://github.com/Ramahadam/ticket-system-next/issues/6
   - Align incidents, service requests, and changes to the prototype list structure.
   - Keep shared queue filter/table shell.

3. [x] Ticket detail pages: https://github.com/Ramahadam/ticket-system-next/issues/5
   - Align header, facts, internal notes, and activity structure.
   - Explicitly map current notes to activity until a richer activity model exists.

4. [x] Create flows: https://github.com/Ramahadam/ticket-system-next/issues/8
   - Compare incident/request/change create forms before abstracting.
   - Preserve current validation and submission behavior.

5. [x] Requester My tickets: https://github.com/Ramahadam/ticket-system-next/issues/9
   - Align requester tabs, summaries, and ticket entry points.
   - Preserve requester-only visibility.

6. [x] Supporting surfaces: https://github.com/Ramahadam/ticket-system-next/issues/10
   - Users, profile, shell, and login structural parity.

## Verification

- Add unit tests for any derived dashboard/list/detail logic.
- Run `npm test` after behavior changes.
- Run `npm run lint`.
- Run safe compile gate: `npx next build`.
