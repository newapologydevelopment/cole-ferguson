# Plan 025: Defer information video and duplicate data work until the panel opens

> **Executor instructions**: Keep the Information panel mounted if its existing transition needs that, but prevent hidden media transfer. Preserve all visual layout, animation timing, hover behavior, video controls, and copy. Update the plan index when complete.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/InfoShell.tsx app/components/InformationMobile.tsx app/components/MenuMobile.tsx sanity/lib/client.ts app/layout.tsx tests`
> Compare uncommitted current code with the excerpts below.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

Normal portfolio visits fetch Information data twice and can autoplay a hidden video while critical photographs and adjacent compositions are loading. Removing that invisible contention improves first-image reliability on constrained connections. Opening Information must still feel the same, so data may be prefetched cheaply while the heavy video source waits for explicit intent.

## Current state

- `app/layout.tsx:107-112` mounts `InfoShell` and `MenuMobile` on every route.
- `app/components/InfoShell.tsx:40-92` fetches the Information document on mount.
- `InfoShell.tsx:360-367` keeps the desktop panel mounted at height zero when closed.
- `InfoShell.tsx:427-449` sets `<video src={info.videoUrl} autoPlay ...>` whenever data arrives, even while closed.
- `MenuMobile.tsx:150-154` always mounts `InformationMobile`.
- `InformationMobile.tsx:25-52` independently fetches the same Information document on mount; lines 128-137 mount an autoplay video even when `isOpen` is false and visibility is hidden.
- `sanity/lib/client.ts:274-289` already has a cached server-side Information query, but it does not currently expose every cover/video-file field used by both components.

Convention: use existing cached Sanity client utilities where possible; swallow-free error state should preserve fallback copy without logging secrets or URLs.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit tests | `npm run test:unit -- information-media` | pass |
| Browser tests | `npm run test:e2e -- information-media` | pass desktop/mobile |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/InfoShell.tsx app/components/InformationMobile.tsx app/components/MenuMobile.tsx sanity/lib/client.ts app/layout.tsx` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: files above and focused tests.

**Out of scope**: redesigning Information, changing text/credits, transition timings, video crop/object-fit, replacing the video asset, or removing autoplay after the panel is intentionally opened.

## Git workflow

Use `codex/025-defer-information-media`; commit `Defer hidden information media`. Do not push/deploy without instruction and never target `main`.

## Steps

### Step 1: Add request-boundary tests

At desktop and mobile widths, assert no video/media URL is requested on initial homepage, Gallery, or Archive load. Open Information and assert exactly one appropriate video request begins. Close it and assert playback pauses and the resource is released or at minimum no longer actively downloading. Reopen and confirm playback resumes without duplicate component ownership.

**Verify**: initial-request assertions fail against current code.

### Step 2: Create one Information data source

Extend the existing cached Information projection only with fields actually needed by both surfaces, and pass/share that data through the layout/context rather than issuing two client fetches. If keeping a single client fetch is materially simpler, centralize it in one provider with in-flight dedupe. Preserve fallback copy for unavailable data.

**Verify**: browser test records at most one Information document request per fresh load.

### Step 3: Gate heavy media on intent

Keep markup required for the existing transition, but withhold the `<video>` element or its `src` until `open`/`isOpen` becomes true. On close, pause and remove the source/load state in a cleanup-safe way. Guard rapid open/close so stale promises or play calls do not throw or restart hidden playback.

**Verify**: no media request before open; exactly one begins after open; closing stops hidden playback.

### Step 4: Confirm portfolio priorities are unaffected

Under a throttled browser profile, load the homepage without opening Information. Assert the active portfolio image and adjacent prefetches are the only relevant large media requests. Confirm all existing Information transitions/classes remain unchanged.

**Verify**: browser suite passes twice, typecheck/lint/build pass, and no motion/CSS diff exists.

## Test plan

- Desktop closed/open/close/reopen.
- Mobile closed/open/close/reopen.
- Route change while open.
- Missing video URL uses the current fallback behavior.
- `play()` rejection does not produce an unhandled promise.
- No duplicate Information data request.

## Done criteria

- [ ] No information video request occurs before explicit open intent
- [ ] Desktop/mobile share one data request/source
- [ ] Closing pauses/releases hidden media
- [ ] Existing visual and motion behavior is unchanged
- [ ] Unit/browser tests, typecheck, lint, and build pass

## STOP conditions

- Sharing data requires moving unpublished/draft content into public server HTML.
- Releasing the source makes the existing reopen transition visibly blank beyond its current placeholder behavior.
- The video provider forbids safe pause/source removal semantics; report the provider behavior.

## Maintenance notes

Future heavy Information media must follow the same intent gate. Keep the browser test checking request absence, since a hidden element can regress without a visible UI change.

