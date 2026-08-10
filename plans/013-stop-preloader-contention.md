# Plan 013: Stop preloader frames competing with the portfolio hero

> **Executor instructions**: Follow every step and verification. Update `plans/README.md` when complete. Do not modify application files outside Scope.
>
> **Drift check**: `git diff --stat 0426b50..HEAD -- app/components/Preloader.tsx app/components/PreloaderGate.tsx`
> Compare the live code to Current state. STOP on a material mismatch.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

The deployed homepage emits ten `<link rel="preload" as="image">` directives for 57×72 preloader frames before the actual Sanity hero. They compete with the photograph that determines perceived readiness. The animation should remain smooth, but only its first frame should receive document-level priority.

## Current state

`app/components/Preloader.tsx:91-105` renders all ten local PNGs in a hidden stack with `priority` and `loading="eager"`. The visible frame at lines 106-116 is also eager. Files in `public/preloader_images/` total roughly 450 KB.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/Preloader.tsx app/components/PreloaderGate.tsx` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: `app/components/Preloader.tsx`; `app/components/PreloaderGate.tsx` only if coordination with the hero is necessary.

**Out of scope**: changing animation artwork/timing; Sanity queries; portfolio view priority; deleting source frames.

## Steps

1. Remove the hidden ten-`priority` `<Image>` stack. Keep `priority` only on the initially visible frame.
   **Verify**: `rg -n "priority" app/components/Preloader.tsx` shows at most one unconditional/first-frame priority path.
2. Warm frames 2–10 after first paint using bounded JavaScript `Image` requests with normal/low priority. Start warming only after the first visible frame has loaded; retain references until completion. Do not append preload links.
   **Verify**: source has no hidden priority map and no dynamically inserted `rel=preload` links.
3. If throttled testing shows the 108ms sequence outruns network, decode the next one or two frames ahead and pause on the current decoded frame instead of showing blank content. Do not make all ten high priority.
   **Verify**: cache-disabled Fast 3G shows no blank frame.
4. Build and inspect server HTML.
   **Verify**: `npm run build` succeeds; after deployment, `curl -sS https://cole-ferguson-staging.vercel.app/ | rg -o 'rel="preload" as="image"' | wc -l` is no more than 2.

## Test plan

- Hard refresh desktop and mobile with cache disabled.
- Fast 3G: preloader remains visually continuous and the portfolio hero starts before background frames finish.
- Reduced motion behavior remains unchanged.

## Done criteria

- [ ] No ten-frame priority/preload burst
- [ ] First frame and hero remain reliable
- [ ] Typecheck, lint, and build pass
- [ ] Only in-scope files changed

## STOP conditions

- A smooth sequence appears to require changing duration/art direction.
- More than two preloader frames must be high priority.
- Fix requires changes to portfolio image components; leave those to 017.

## Maintenance notes

Do not reintroduce `priority` across the frame map. Review network priority, not only visual smoothness on a warm cache.
