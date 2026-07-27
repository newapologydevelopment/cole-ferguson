# Plan 015: Make the homepage payload genuinely progressive

> **Executor instructions**: Follow all gates. Preserve the complete project-title navigation and all intra-project navigation after hydration.
>
> **Drift check**: `git diff --stat 0426b50..HEAD -- sanity/lib/client.ts app/page.tsx app/views/Home.tsx app/hooks/useHydratedProjectViews.ts app/api/project-views/[id]/route.ts types/project.ts`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: 014
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11
- **Measured (local build, 2026-07-11)**: homepage HTML 59.6 KB (56% below 135 KB baseline); Sanity catalog JSON ~16.7 KB for 38 projects with one first-view each

## Why this matters

The staging homepage HTML is about 135 KB and serializes roughly 268 image references. The current `homepageProjectsQuery` still returns full `views[]` and `images[]`; meanwhile `useHydratedProjectViews` expects `viewCount` to know when progressive fetching is needed, but the homepage query does not select `viewCount`. The intended progressive design therefore does not activate reliably.

## Current state

- `sanity/lib/client.ts:61-79`: returns every project and full media arrays.
- `app/hooks/useHydratedProjectViews.ts:21-28`: hydrates only when `viewCount > loadedViewCount` or a legacy condition applies.
- `app/api/project-views/[id]/route.ts`: existing endpoint for full views.
- `Home.tsx:275-303`: renders a ±2 project live window.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 sanity/lib/client.ts app/views/Home.tsx app/hooks/useHydratedProjectViews.ts app/api/project-views/[id]/route.ts` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: files in drift check.

**Out of scope**: highlights-only homepage; removing titles; gallery/archive queries; changing 1-hour cache policy beyond required cache-key bump.

## Steps

1. Change homepage GROQ to return all `_id`/`title`, `viewCount: count(views)`, total image count needed by navigation, and only the first renderable view (plus first legacy fallback). Include asset ref, alt, dimensions, ratio; LQIP is handled by 016.
   **Verify**: query contains `count(views)` and `[0...1]`; cache key increments.
2. Make `useHydratedProjectViews` request the full endpoint when an active/selection project has fewer loaded views than `viewCount`. Deduplicate concurrent requests by project ID and retain successful results in a module-level bounded cache.
   **Verify**: revisiting a project does not re-fetch `/api/project-views/<id>` during one session.
3. Ensure indicator counts and next/previous controls update after hydration without resetting the current image unexpectedly.
   **Verify**: a project with 3+ views starts usable, hydrates once, then navigates through all views.
4. Measure deployed HTML and initial RSC transfer before/after. Record results in the plan status note or PR description.
   **Verify**: initial HTML is at least 30% smaller than the measured 135 KB baseline, or STOP with measured explanation.

## Test plan

- First project with multiple views; legacy-images-only project; fast scroll to distant project; aborted selection; revisit hydrated project.
- Network failures leave the first view visible and allow a later retry.
- Build succeeds and gallery/archive are unchanged.

## Done criteria

- [ ] Full title navigation preserved
- [ ] Initial payload contains only bounded media
- [ ] Full active project hydrates once and remains navigable
- [ ] HTML payload reduction measured
- [ ] Typecheck, lint, build pass

## STOP conditions

- Current Sanity documents do not consistently use `views` or legacy `images`; report distribution before choosing a fallback.
- Progressive request causes current view to jump.
- Meeting payload target requires removing project titles.

## Maintenance notes

Bump the homepage cache key whenever projection changes. Keep endpoint response limited to one project.
