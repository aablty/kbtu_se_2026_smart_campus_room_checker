## Project

Smart Campus room availability checker based on the existing working prototype.
The project contains fictional room data and a room-selection flow.

## Scope

This practice focuses on repository instructions, a small justified refactoring decision,
regression verification and UI checks. Do not add new product features.

## Constraints

Preserve AC1–AC6:
- reject invalid and past booking intervals;
- enforce the 120-minute maximum;
- reject blocked rooms;
- reject overlaps and allow endpoint-touching intervals;
- do not mutate booking fixtures;
- preserve clear desktop and mobile feedback.

Do not add login, backend, database, external APIs or booking creation.

## Engineering rules

Prefer a simple function or existing module boundary.
Use Strategy or Adapter only if the current code contains multiple real policies
or inconsistent data shapes.

Do not introduce a pattern only for demonstration.
Do not weaken or delete existing tests.
Keep booking rules in src/lib.
App.tsx may contain UI state and event wiring, but new domain rules should stay in src/lib.

## Verification

Run:

npm test
npm run typecheck
npm run lint
npm run build
npm run audit:prod

Report exact commands, output, changed files and remaining limitations.

## Reporting

List the pattern decision, rationale, changed files, test results and UI evidence.

## Background-agent safety

Work only in an isolated branch or worktree.
Allowed commands are the verification commands above and read-only inspection.
Do not push, deploy, change remotes, access secrets, create a database, or call
external production services.

Before accepting any agent change, require a human-reviewed diff, exact test
output, typecheck/lint/build output and a short review note. Automatic merge and
automatic deployment are not allowed.
