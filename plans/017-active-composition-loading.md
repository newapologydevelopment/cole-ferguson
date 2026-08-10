# Plan 017: Load active multi-image compositions as one unit

> **Executor instructions**: Improve completeness without turning every sibling into a document-level preload.
>
> **Drift check**: `git diff --stat 0426b50..HEAD -- app/components/Project.tsx app/components/ProjectMobile.tsx app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: 013, 014
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Only the first image of an active two/three-image view is eager/high; siblings are forced lazy/low even though they are simultaneously visible. This can leave half a composition blank. The correct distinction is one document-level LCP preload, with all visible siblings beginning promptly at normal priority.

## Current state

`TwoImagesView.tsx:126-139` and `ThreeImagesView.tsx:120-159` hardcode later images to `priority={false}`, `loading="lazy"`, `fetchPriority="low"`; mobile mirrors this.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: files in drift check.

**Out of scope**: changing grid/layout; eager-loading adjacent projects; more than one `priority`/preload image per active composition.

## Steps

1. Preserve `priority`/high only for the visual LCP image (index 0 unless evidence identifies another).
2. When the view is active, set visible siblings to `loading="eager"` with `fetchPriority="auto"`/normal, not high. When inactive, retain lazy/low.
   **Verify**: server HTML has at most one portfolio preload, while all active composition `<img>` elements are eager.
3. Optionally reveal the composition only after all active members have decoded, retaining LQIP during the wait; use a short safety timeout so one failed sibling cannot block forever.
   **Verify**: Slow 3G never shows a permanently half-empty composition.
4. Ensure rapid navigation ignores stale load completions from the prior view.
   **Verify**: click next/previous rapidly; current view is not replaced by an older completion.

## Test plan

- Active and inactive two/three views on desktop/mobile.
- One blocked sibling URL: fallback appears and transition completes.
- Network panel: exactly one High/preloaded portfolio image; siblings start promptly at normal priority.

## Done criteria

- [ ] One high-priority/preloaded image maximum
- [ ] Every currently visible sibling starts promptly
- [ ] Failed/stale sibling cannot wedge the view
- [ ] Typecheck, lint, build pass

## STOP conditions

- Browser/Next version maps normal eager siblings to high priority despite `fetchPriority="auto"`.
- Coordination requires changing animation design; report options.

## Maintenance notes

“One priority image” does not mean “only one visible image should load.” Preserve that distinction in reviews.
