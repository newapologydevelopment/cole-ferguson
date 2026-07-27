# Plan 014: Unify rendered and prefetched Sanity image URLs

> **Executor instructions**: Execute step by step and update the plan index. Do not broaden into layout redesign.
>
> **Drift check**: `git diff --stat 0426b50..HEAD -- sanity/lib/image.ts app/components/PortfolioSanityImage.tsx app/components/prefetchProjectViews.ts app/components/SingleImageView.tsx app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/SingleViewMobile.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: 013
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Rendered images use `sanityLoader` and browser-selected `srcset` widths, while `prefetchProjectViews.ts` independently guesses a width from viewport factors. A guessed prefetch URL is often not the URL subsequently rendered, causing two transformations/downloads for one photograph. One canonical policy must generate both paths.

## Current state

- `sanity/lib/image.ts:31-36`: loader appends `auto=format&fit=max&w=<width>&q=<quality>`.
- `app/components/prefetchProjectViews.ts:23-32`: separate builder uses factors 0.6/0.42/0.28 and quality 75.
- View files pass `sizes` strings that determine the browser candidate.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 sanity/lib/image.ts app/components/PortfolioSanityImage.tsx app/components/prefetchProjectViews.ts` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: the files in the drift check.

**Out of scope**: gallery/archive policy; changing composition geometry; prefetching every image in every project.

## Steps

1. In `sanity/lib/image.ts`, define named quality/defaults and one pure function that accepts source URL/ref, requested CSS width, DPR cap, and quality and returns a stable transformed CDN URL. Preserve crop/hotspot parameters already present in builder URLs.
   **Verify**: loader and prefetch helper call the same URL function; only one literal `auto=format` construction remains.
2. Define shared `sizes` constants or layout descriptors for single/two/three, desktop/mobile. Update view components to consume them without changing rendered layout.
   **Verify**: `rg -n 'sizes="'` across the nine view files returns no divergent duplicate literals except documented exceptions.
3. Update adjacent prefetch to calculate the candidate that the browser will choose for the active viewport/DPR from the same descriptor. Prefetch only adjacent views, low priority, and use the canonical URL exactly.
   **Verify**: in DevTools, a prefetched adjacent image URL is reused when navigating; no second request for another width.
4. Preserve the existing maximum-24 URL cache and cancellation/unmount safety.
   **Verify**: typecheck, lint, build pass.

## Test plan

- Test widths 390/DPR3, 1440/DPR2, and 2560/DPR2.
- Navigate next and previous across single/two/three views; record URL equality and transfer reuse.
- Confirm `auto=format`, bounded width, and quality remain present.

## Done criteria

- [ ] One canonical transformation policy
- [ ] Prefetch URL equals eventual render URL for tested layouts
- [ ] Adjacent prefetch remains bounded and low priority
- [ ] Typecheck, lint, build pass

## STOP conditions

- Hotspot/crop information would be lost.
- Exact candidate selection cannot be predicted reliably; prefer DOM `<link imageSrcSet/imageSizes>` or remove manual prefetch rather than guessing.
- Fix requires gallery/archive migration.

## Maintenance notes

Any new portfolio layout must add a descriptor instead of a new handwritten width factor.
