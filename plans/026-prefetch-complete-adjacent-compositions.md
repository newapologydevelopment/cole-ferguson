# Plan 026: Prefetch complete adjacent compositions within a strict bandwidth budget

> **Executor instructions**: Warm every asset needed by only the immediately previous and next views. Do not expand the radius, raise document preload count, or change presentation. Run all gates and update `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/prefetchProjectViews.ts sanity/lib/image.ts app/components/Project.tsx app/components/ProjectMobile.tsx tests`
> Compare live uncommitted code with the excerpts below before editing.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`, `plans/023-make-carousel-hydration-responsive.md`
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

Current adjacent prefetch warms only the first photograph in a two- or three-image view. The composition then begins remaining image requests after the click, creating partial arrival despite successful prefetch. All members of the two adjacent compositions should be warmed at low priority with bounded concurrency and URL dedupe.

## Current state

- `app/components/prefetchProjectViews.ts:16-20` extracts only `v.images[0]`.
- `preloadProjectView` at lines 60-75 creates at most one `Image` request for a view.
- `preloadedUrls` is module-global and bounded to 24 URLs.
- `buildCdnUrl` at lines 33-51 derives view type/sizes but uses the first image's source width.
- `Project.tsx:162-170` and `ProjectMobile.tsx:175-183` call initial and adjacent prefetch after data/views change.
- Rendered two/three compositions start visible siblings eagerly at normal priority through `getPortfolioImageLoadProps`; the speculative requests must remain low priority and must not become `<link rel="preload">` entries.

Convention: use `buildCanonicalSanityUrl`, shared `PORTFOLIO_SIZES`, source-width clamping, low `fetchPriority`, and bounded module-level caches.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit tests | `npm run test:unit -- prefetch-composition` | pass |
| Browser tests | `npm run test:e2e -- adjacent-prefetch` | pass |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/prefetchProjectViews.ts sanity/lib/image.ts app/components/Project.tsx app/components/ProjectMobile.tsx` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: files in drift check and focused tests.

**Out of scope**: prefetching more than previous/next view; prefetching whole projects; increasing high-priority/preload count; changing image sizes, quality, crossfade, layouts, or active-image loading policy.

## Git workflow

Use `codex/026-complete-adjacent-prefetch`; commit `Prefetch complete adjacent compositions`. Do not deploy or target `main` without instruction.

## Steps

### Step 1: Add multi-image prefetch tests

Test single/two/three views; first/last wraparound; duplicate asset refs; one-view projects; source widths per image; DPR/viewport selection; and cache overflow. Assert every unique adjacent asset URL is requested once at low priority and no nonadjacent asset is requested.

**Verify**: two/three-view completeness tests fail against current code.

### Step 2: Build URLs per image

Replace the first-image-only extractor with iteration over each adjacent view's valid images. Generate each URL from that image's own asset ref and `width`, while using the composition's shared sizes descriptor. Preserve crop/hotspot information if present. Invalid refs should skip only that asset, not the whole view.

**Verify**: exact-URL unit tests pass for mixed source widths.

### Step 3: Bound scheduling and memory

Retain a small global URL history and add a strict concurrent speculative-request cap if all adjacent members could otherwise start at once. Queue at most the previous and next composition; active image requests must take precedence. Do not abort browser cacheable requests merely because index changes, but prevent unbounded queue growth during rapid clicks.

**Verify**: rapid-index test never exceeds the concurrency/queue bound and never requests a nonadjacent backlog after settling.

### Step 4: Prove render reuse

In a browser test, capture direct Sanity URLs for adjacent composition assets, navigate, and assert rendered requests reuse those exact URLs or browser cache entries. Confirm document image preloads remain ≤2 and speculative fetch priority is low.

**Verify**: browser test passes for single→two, two→three, and wraparound transitions.

## Test plan

- 1, 2, and 3 assets per view.
- Mixed aspect/source widths.
- Duplicate asset across previous/next.
- Rapid direction reversal.
- Invalid/missing second asset does not block the valid first/third.
- Mobile/desktop candidate equality.

## Done criteria

- [ ] All unique assets in immediate previous/next compositions are warmed
- [ ] No broader project prefetch is introduced
- [ ] Every URL uses its image's source width and canonical transform policy
- [ ] Speculative requests are low priority and concurrency bounded
- [ ] Render navigation reuses warmed URLs
- [ ] Tests, typecheck, lint, build, and existing image audit pass

## STOP conditions

- Browser-selected rendered URLs cannot be matched predictably with the current loader.
- Complete adjacent prefetch causes more than two document-level image preloads.
- A concurrency cap requires a permanent global queue that cannot be safely reset on navigation.

## Maintenance notes

Any new composition type must expose all asset refs and a shared sizes descriptor. Keep this adjacent-only; predictive expansion needs separate measured approval.

