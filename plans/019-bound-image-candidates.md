# Plan 019: Bound responsive candidates to portfolio display sizes

> **Executor instructions**: Preserve high-DPR photographic quality while eliminating impossible/unused candidates.
>
> **Drift check**: `git diff --stat 0426b50..HEAD -- next.config.ts sanity/lib/image.ts app/components/PortfolioSanityImage.tsx app/components/GalleryGridView.tsx app/components/GalleryGridViewMobile.tsx`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: MED
- **Depends on**: 014
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Current custom-loader `srcset`s advertise widths through 3840px even though sampled originals top out around 2000px and portfolio layouts render narrower. Too many variants reduce CDN cache concentration and can encourage oversized selection. A small stable candidate set improves reuse without sacrificing Retina quality.

## Current state

Next defaults generate candidates 384 through 3840 for fill images. `next.config.ts` does not set `deviceSizes`/`imageSizes`. Sanity loader uses whatever width Next requests.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: files in drift check.

**Out of scope**: recompressing or replacing source assets; lowering all quality below 75; layout redesign.

## Steps

1. Inventory actual CSS rendered widths at 390, 768, 1440, 1920, and 2560 viewports with DPR 1/2/3. Record the largest justified resource width per layout.
2. Configure a stable set close to `320, 480, 640, 960, 1280, 1600, 2000`, adjusting only from measured evidence. Clamp requested width to source width when source dimensions are known; never upscale.
3. Keep photographic quality at 75 initially. Run side-by-side crops at 1× and 2×; only change quality with approval based on visible results and measured byte savings.
4. Ensure thumbnail candidates remain materially smaller than portfolio heroes.
   **Verify**: built HTML has no 3840 Sanity candidate; 2× large-screen image remains sharp.

## Test plan

- Chrome/Safari desktop and iPhone DPR3; portrait texture, fine grain, gradients, dark tonal image.
- Compare selected candidate width to rendered pixels × DPR; overshoot should normally be under 25%.

## Done criteria

- [ ] Candidate set is measured and bounded
- [ ] No upscaling beyond source dimensions
- [ ] Retina quality approved visually
- [ ] Typecheck and build pass

## STOP conditions

- A source is smaller than its required displayed pixel size; report asset ID/dimensions without replacing it.
- Candidate changes degrade visible grain, texture, or edge detail.

## Maintenance notes

Revisit the set only when layout breakpoints or typical upload dimensions change. Stable URLs improve Sanity CDN hits.
