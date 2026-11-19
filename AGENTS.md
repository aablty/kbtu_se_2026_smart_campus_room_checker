## Project

Smart Campus room availability checker — a fictional frontend prototype
(React + TypeScript + Vite) that checks whether a study room is free, filters
a small room catalog, and generates a template-based "explain availability"
note. No real bookings, accounts, backend or production data exist.

## Architecture

```
src/
  lib/
    types.ts            Room/Booking/Filters types, MAX_DURATION
    availability.ts      AC1-AC6 booking rules (source of truth for availability)
    filtering.ts          F1-F2 room-catalog filtering
    time.ts                time parsing, formatting, fixed demo clock
    sampleData.ts          4 fictional rooms + equipment options
    explainAdapter.ts      mock explanation adapter (see "Explain-adapter boundary")
  components/             RoomCard, RoomFilters, EmptyState, ResultBanner,
                          ExplanationPanel, Timeline, RoomBookings
  App.tsx                 state + wiring only; no new domain rules here
```

## Setup

```
npm install
npm run dev       # dev server at http://localhost:5173
npm run build
npm run preview
```

## Scope

Preserve the existing booking contract (AC1-AC6) and the catalog filters
(F1-F5). Do not add login, a backend, a database, a real external API, or
real booking creation/persistence.

## Constraints

Preserve AC1-AC6:
- reject invalid and past booking intervals;
- enforce the 120-minute maximum;
- reject blocked rooms;
- reject overlaps and allow endpoint-touching intervals;
- do not mutate booking fixtures;
- preserve clear desktop and mobile feedback.

## Coding conventions

- Booking/availability rules stay in `src/lib`; `App.tsx` holds state and
  event wiring only, never new domain rules.
- Any input that invalidates the current availability result (room switch,
  time edit, reset) must clear it through the single `clearResult` helper in
  `App.tsx`, not a repeated inline `setResult(null)`/`setExplanation(null)` pair.
- Use Strategy or Adapter only if the code already contains multiple real
  policies or inconsistent data shapes — never for demonstration.
- Do not weaken, skip or delete existing tests to make a change pass.

## Explain-adapter boundary (LLM-shaped feature)

`src/lib/explainAdapter.ts` is a MOCK adapter: deterministic templates, no
network call, no API key. `checkAvailability` remains the only source of
truth for availability — the adapter must never decide it. If a real LLM
backend is ever wired in:
- it must run server-side only; never ship an API key to the browser;
- the existing input validation (length limits) and timeout/error fallback
  must be preserved;
- this is a scope change and needs an explicit human-reviewed diff plus an
  update to this section — it is NOT pre-approved.

## Forbidden actions

- No secrets, API keys or credentials in any file, default value or commit.
- No production deployment, publishing, or pushing to a shared/remote branch.
- No destructive git command (`reset --hard`, force-push, history rewrite)
  without explicit human confirmation.
- No new or upgraded dependency without a human-reviewed diff of
  `package.json` / `package-lock.json`.
- No login, backend server, database, real external API call or real
  booking persistence (see Scope).
- No weakening, skipping or deleting existing tests.

## Verification

Run and report the exact output:

```
npm test
npm run typecheck
npm run lint
npm run build
npm run audit:prod
```

## Reporting

List the pattern decision, rationale, changed files, test results and UI
evidence for every change.

## Background-agent safety

Work only in an isolated branch or worktree. Allowed commands are the
verification commands above and read-only inspection. Do not push, deploy,
change remotes, access secrets, create a database, or call external
production services.

Before accepting any agent change, require a human-reviewed diff, exact test
output, typecheck/lint/build output and a short review note. Automatic merge
and automatic deployment are not allowed.
