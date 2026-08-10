# Plan 016: Restore targeted LQIP placeholders

> **Executor instructions**: Add placeholders only where they improve first/imminent paint; do not restore LQIP to the entire catalog payload.
>
> **Drift check**: `git diff --stat 0426b50..HEAD -- sanity/lib/client.ts app/components/SingleImageView.tsx app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/SingleViewMobile.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 015
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Sanity automatically supplies a tiny LQIP, but the homepage projection currently omits it. Under slow or interrupted image delivery users see an empty grey shell. After payload slimming, LQIP can be restored for the bounded initial view and active-project response without bloating every project record.

## Current state

View components already use `placeholder={blurDataURL ? 'blur' : 'empty'}`. `homepageProjectsQuery` omits `asset->metadata.lqip`; full project queries vary.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: homepage and project-view projections in `sanity/lib/client.ts`; six portfolio view components only if placeholder passthrough drifted.

**Out of scope**: LQIP for every catalog image; custom blur generation; upload reprocessing.

## Steps

1. Add `asset->metadata.lqip` only to the first-view media shipped by the homepage and to the active-project endpoint response. Preserve dimensions.
   **Verify**: homepage query has LQIP inside sliced first view only; it is not projected across unsliced catalog arrays.
2. Confirm each single/two/three active composition uses its available LQIP until decoded.
   **Verify**: Slow 3G shows a correctly shaped blurred placeholder rather than blank grey.
3. Bump affected cache keys and measure HTML. LQIP must not erase most of plan 015’s savings.
   **Verify**: deployed HTML remains at least 25% below the 135 KB baseline.

## Test plan

- Slow 3G and disabled cache for portrait, landscape, two-image, three-image views.
- Missing LQIP safely uses `empty` without exceptions.

## Done criteria

- [ ] Active/imminent images have placeholders
- [ ] Catalog-wide payload does not regain all LQIPs
- [ ] Cache keys bumped
- [ ] Typecheck and build pass

## STOP conditions

- LQIP metadata is absent on newly uploaded assets after a reasonable metadata-processing delay.
- Placeholder causes visible aspect/crop mismatch.

## Maintenance notes

Sanity metadata is asynchronous after upload; missing LQIP must remain a supported state.
