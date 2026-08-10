# Plan 020: Add repeatable image performance and reliability gates

> **Executor instructions**: Make regressions measurable. Do not tune code inside this plan; failures should point back to 013–019.
>
> **Drift check**: `git diff --stat 0426b50..HEAD -- package.json README.md next.config.ts scripts tests .github`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 013, 014, 015, 016, 017, 018, 019
- **Category**: tests
- **Planned at**: commit `0426b50`, 2026-07-11
- **Measured (local build, 2026-07-11)**: `npm run test:images -- --url=http://localhost:3010` passes (58.2 KB HTML, 2 preloads). Staging still reflects pre-change deployment until this branch ships.

## Why this matters

Image performance has been tuned through manual changes that later contradicted one another. The site needs repeatable checks for preload count, payload size, candidate size, broken images, and navigation completeness so visual-quality fixes do not silently regress reliability.

## Current state

`package.json` has build/lint scripts but no tests or performance checks. Baseline staging observations: homepage HTML ≈135 KB, 11 image preloads, and candidate lists reaching 3840px.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | exit 0 |
| New audit | `npm run test:images` | exit 0 and budget summary |

## Scope

**In scope**: `package.json`, a new `scripts/` or `tests/` audit, README documentation, optional CI workflow if one already exists.

**Out of scope**: modifying portfolio components; introducing a paid monitoring service; production deployment.

## Steps

1. Add a deterministic audit that accepts a base URL (default local, explicit staging in CI/manual use), fetches `/`, and asserts:
   - image preload count ≤2;
   - HTML transfer/body ≤105 KB (25% below baseline; tighten after 015 measurement);
   - no Sanity candidate above 2000px unless allowlisted;
   - every initial `<img>` has non-empty `sizes` where required;
   - no initial image response is 4xx/5xx.
2. Add browser-level tests if the existing environment supports them; otherwise provide a documented manual matrix for Slow/Fast 3G, cache disabled, desktop/mobile DPR, next/previous navigation, and blocked CDN response.
3. Report selected resource URL, width, content type, encoded bytes, preload priority, and duplicate asset downloads without exposing environment secrets.
4. Document an upload checklist: sRGB, high-quality JPEG/WebP, typically 2400–3200px long edge for new hero work, no TIFF/huge PNG unless transparency requires it, reuse Sanity assets.
5. Run against staging and attach the summary to the plan/index.

## Test plan

- Deliberately lower each budget locally to prove the audit fails with a clear message.
- Run twice to distinguish cold transformation timing from warm CDN timing.
- Verify AVIF/WebP negotiation with an appropriate `Accept` header.

## Done criteria

- [ ] `npm run test:images` exists and fails on budget violations
- [ ] Budgets cover preload count, payload, candidate width, response status, duplicates
- [ ] Quality/upload checklist documented
- [ ] Typecheck/build/audit pass against staging

## STOP conditions

- The test requires authenticated production access or secrets.
- Network timing is too noisy for a stable hard threshold; record timing informationally and keep deterministic byte/count/status assertions.

## Maintenance notes

Update baselines intentionally in review; never silence a regression by broadly raising every budget.
