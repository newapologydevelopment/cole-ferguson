# Plan 022: Restore the intended first-project LQIP without expanding homepage payloads

> **Executor instructions**: Follow every step and verification gate. This is a data-projection correction only; do not alter placeholder styling, transition behavior, image quality, or layout. Update `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- sanity/lib/client.ts tests scripts/audit-images.mjs`
> Also inspect uncommitted differences with `git diff -- sanity/lib/client.ts`; this plan targets the working-tree query excerpt below.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`
- **Category**: bug
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

The progressive homepage query intends to include a blur placeholder only for the initially active project. Its GROQ parent traversal is wrong, so staging serializes null for all homepage project-view LQIPs. Correcting that narrow scope restores slow-network resilience without returning placeholders for the full catalog.

## Current state

- `sanity/lib/client.ts:63-94` defines `homepageProjectsQuery` with one view per project.
- Current excerpt at `sanity/lib/client.ts:76-79`:

  ```groq
  "blurDataURL": select(
    ^._id == *[_type == "project"]|order(orderRank asc)[0]._id => asset->metadata.lqip,
    null
  )
  ```

  Inside `views[]{ images[]{ ... } }`, `^` reaches the view; it has no project `_id`. The full-project projection at `sanity/lib/client.ts:41-44` correctly uses `^.^._id` from the same nesting depth.
- `getHomepageProjectsCached` uses cache key `sanity-homepage-projects-v8`; a corrected query requires a new key.
- Live staging measurement during planning: one data-image placeholder exists elsewhere in the document, while all 42 serialized homepage `blurDataURL` values are null.

Convention: change GROQ projections narrowly and bump their explicit cache key whenever the response meaning changes.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit/query test | `npm run test:unit -- homepage-lqip` | all cases pass |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 sanity/lib/client.ts` | exit 0 |
| Build | `npm run build` | exit 0 |
| Live audit | `npm run test:images -- --url=https://cole-ferguson-staging.vercel.app` | exit 0 after deployment |

## Scope

**In scope**: `sanity/lib/client.ts`, focused tests under `tests/`, and an audit assertion if plan 021 established one.

**Out of scope**: returning LQIPs for every project; changing blur styling; changing image transforms/quality; changing homepage view counts or full-view hydration.

## Git workflow

Use `codex/022-homepage-lqip` if a short-lived branch is needed. Commit message: `Fix homepage LQIP projection`. Do not push or deploy without instruction and do not target `main`.

## Steps

### Step 1: Add a failing projection regression

Test the query contract using a fixture or exported query string: the first ordered project may contain non-null LQIPs in its initial composition; later projects must remain null. Assert the query reaches the project with the correct parent depth and that the cache key changes.

**Verify**: the new test fails against the current `^._id` projection.

### Step 2: Correct the GROQ scope and invalidate stale cache

Change only the nested parent traversal needed to reach the project document. Bump `sanity-homepage-projects-v8` to the next version. Do not change fields or array slice boundaries.

**Verify**: `npm run test:unit -- homepage-lqip` passes.

### Step 3: Verify payload targeting

Build and inspect homepage HTML from a local production server. Assert at least one non-null LQIP belongs to the initial project, later project placeholders remain null, homepage HTML remains under the existing 105 KB budget, and image preloads remain at most two.

**Verify**: `npm run build` and the local `test:images` command pass; report the measured HTML bytes and non-null placeholder count.

## Test plan

- First ordered project with single, two, and three-image initial views.
- Later projects always null.
- Missing Sanity LQIP remains null rather than throwing.
- Cache key is not the old `v8` value.

## Done criteria

- [ ] Initial project receives only its intended LQIP values
- [ ] Later projects do not regain LQIP payloads
- [ ] Homepage HTML remains under 105 KB and preloads remain ≤2
- [ ] Unit test, typecheck, lint, and build pass
- [ ] No visual classes or animation code changed

## STOP conditions

- Correct parent traversal returns LQIPs for projects beyond the initial ordered project.
- The query must include all project views to identify the first project.
- Homepage HTML exceeds 105 KB after only the intended placeholder is restored.

## Maintenance notes

Any future nesting change in the homepage GROQ projection must update this regression. Always bump the explicit `unstable_cache` key when changing projected data semantics.

