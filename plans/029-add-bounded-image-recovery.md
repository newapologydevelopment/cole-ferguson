# Plan 029: Add bounded image recovery and race-safe Archive replacement

> **Executor instructions**: Reliability must be quiet, finite, and layout-stable. Preserve current fallbacks, crossfade timing, image placement, and visual design. Never add random/cache-busting query strings. Run every gate and update `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/PortfolioSanityImage.tsx app/components/GridRevealImage.tsx app/components/ArchiveProject.tsx sanity/lib/image.ts tests scripts/audit-images.mjs`
> Compare current uncommitted code with the excerpts below. This plan reopens runtime intent from completed plan 018; do not restore its old cache-buster implementation.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`, `plans/028-unify-all-sanity-image-delivery.md`
- **Category**: bug
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

One transient portfolio image error permanently replaces the current source with a fallback until remount, while grid/list images lack shared recovery. Archive immediately hides the active image when a replacement is requested, then can remain blank forever if `onLoadingComplete` never fires. A shared finite recovery state and latest-request ownership will make failures survivable without loops, layout shifts, or design changes.

## Current state

- `PortfolioSanityImage.tsx:22-26` stores `failed` and resets only when `src` changes.
- `PortfolioSanityImage.tsx:38-46` marks the first error permanently failed; no retry exists.
- `GridRevealImage.tsx:40-44` currently renders `Image` without shared fallback/recovery.
- `ArchiveProject.tsx:86-95` sets `isFading`, `pendingImage`, and `isPendingVisible` as soon as a new prop arrives.
- `ArchiveProject.tsx:143-145/205-207` makes the active image opacity zero before pending load completes.
- `ArchiveProject.tsx:160/222` commits only through `onLoadingComplete`; pending images have no `onError`.
- Existing plan 018 forbade cache-busting but its intended deterministic bounded recovery is not present in the current runtime.

Convention: stable canonical Sanity URLs, source-change resets, cancellation guards, neutral aspect-preserving fallback, caller `onError` composition, and no user-facing toast.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit/component | `npm run test:unit -- image-recovery archive-replacement` | pass |
| Browser | `npm run test:e2e -- image-failure archive-rapid-navigation` | pass twice |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/PortfolioSanityImage.tsx app/components/GridRevealImage.tsx app/components/ArchiveProject.tsx sanity/lib/image.ts` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: shared Sanity image wrapper/recovery logic, grid integration, Archive replacement state, focused tests and failure audit.

**Out of scope**: service workers, global offline mode, notifications, random query params, unlimited retries, changing transition timing/easing, changing fallback color/layout, or modifying Sanity assets.

## Git workflow

Use `codex/029-bounded-image-recovery`; commit `Add bounded image recovery`. Do not deploy or target `main` without instruction.

## Steps

### Step 1: Characterize existing success and fallback semantics

Mock `next/image`/network events. Cover valid source, empty source, caller `onError`, empty/nonempty alt, failure fallback, source change after failure, and unmount. Archive tests must cover slow pending load, permanent failure, three rapid next clicks with out-of-order completions, previous after next, and project change during animation.

**Verify**: recovery and Archive failure tests fail against current code; existing success/fallback tests pass.

### Step 2: Implement one finite recovery state machine

Use explicit states such as loading/retrying/loaded/failed plus a request generation token. Permit at most one delayed retry for retryable load failures. Prefer retrying the exact canonical URL only if the browser can issue a real second attempt; otherwise use one deterministic lower-width canonical fallback defined by shared image policy. Never append timestamps, random values, or `cb=`. Cancel timers and ignore callbacks after source change/unmount.

**Verify**: tests show at most two total attempts, no unique cache-busting URL, and stale callbacks are ignored.

### Step 3: Apply recovery consistently

Use the shared state for portfolio, Gallery grid/list, and Archive images migrated in plan 028. Preserve each existing placeholder and final neutral fallback. Grid reveal ordering must remain deterministic and no item may remain opacity zero after final failure; recovery must not serialize image requests.

**Verify**: blocked-image browser test ends in a stable visible shell, no broken-image icon, no loop, and all grid wrappers complete their reveal.

### Step 4: Make Archive replacement latest-request-wins

Keep the active image visible and opaque until the latest pending image has loaded and decoded. Only then begin the existing 200 ms opacity transition/commit. Associate pending callbacks with an asset ref or generation ID; stale completion/error events must not change current state. On pending failure, discard pending state and retain/restore the active image. Rapid clicks should update desired target without waiting for the previous transition.

**Verify**: out-of-order and failure tests always finish on the most recently requested Archive project with a nonblank active image.

### Step 5: Add live failure and loop guards

Extend browser/audit coverage to abort one candidate request and permanently fail another. Assert bounded attempts, final stable state, and no repeated network loop over a fixed observation window. Do not make staging CDN transient failures an unbounded automatic retry source.

**Verify**: unit/browser suites pass twice; typecheck/lint/build/audits pass.

## Test plan

- First-attempt success.
- Transient failure then one stable recovery.
- Permanent failure after bounded attempts.
- Source changes during retry and unmount during timer.
- Caller error handler invoked predictably.
- Archive slow success, permanent failure, rapid next/prev, and out-of-order callbacks.
- Grid final failure still completes reveal/fallback.

## Done criteria

- [ ] Each image performs at most one deterministic recovery attempt
- [ ] No cache-busting/random query parameters exist
- [ ] Source changes/unmount cancel or invalidate old work
- [ ] Grid/list/portfolio/Archive end in loaded or stable fallback states
- [ ] Archive never hides the active image before replacement readiness
- [ ] Latest rapid Archive action wins despite stale callbacks
- [ ] Motion/design/fallback appearance remain unchanged
- [ ] Tests, typecheck, lint, build, and failure audit pass

## STOP conditions

- The browser cannot retry the exact URL and no deterministic lower-width fallback can preserve acceptable quality.
- Shared recovery changes the DOM/layout contract required by `fill` images.
- Archive's current transition cannot keep the active image visible without altering timing/easing.
- Any implementation needs more than one retry or a unique cache-busting URL.

## Maintenance notes

Review future image wrappers for finite state and generation guards. Never treat retry count as a substitute for canonical cache reuse; reliability and cache concentration must be preserved together.

