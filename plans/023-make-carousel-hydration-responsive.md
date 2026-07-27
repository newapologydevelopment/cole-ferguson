# Plan 023: Make every first carousel action survive progressive hydration

> **Executor instructions**: Preserve the current 0.72-second linear crossfade, controls, layout, and image composition. This plan changes data readiness and input accounting only. Run every verification and update `plans/README.md` on completion.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- sanity/lib/client.ts app/views/Home.tsx app/components/Project.tsx app/components/ProjectMobile.tsx app/hooks/useHydratedProjectViews.ts types/project.ts tests`
> The live working tree contains uncommitted changes in these paths; compare it with the excerpts below before editing.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`, `plans/022-fix-homepage-lqip-projection.md`
- **Category**: bug
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

Progressive homepage data sends one view per project, then hydrates the full project only after it becomes active. Previous/next currently computes modulo the loaded length, so a click made while only one view exists is silently reduced to index zero. The interaction must acknowledge exactly one action immediately and settle on the requested view once data arrives, without making every project or image eager.

## Current state

- `sanity/lib/client.ts:63-94`: every homepage project receives `views[0...1]`, plus `viewCount` and `imageCount`.
- `app/hooks/useHydratedProjectViews.ts:60-109`: full data fetch begins only when `enabled` is true.
- `app/views/Home.tsx:290-302`: live-window projects render, but `priorityImages`—also used as the hydration flag—is true only for the active/selection-target project.
- `app/components/Project.tsx:88-96` and `ProjectMobile.tsx:104-112` currently do:

  ```ts
  setIndex((i) => (i + 1) % views.length);
  ```

  With `views.length === 1`, the action is lost.
- `priorityImages` currently couples three distinct concerns: whether data hydrates, whether adjacent views prefetch, and whether active images are eager/high priority.
- Staging hydration endpoints measured 125-500 ms and returned `max-age=0`; plan 024 separately addresses HTTP caching, but navigation correctness must not depend on fast networking.

Conventions: use functional React state updates for burst input, keep module-level hydration dedupe bounded, and preserve `AnimatePresence mode="sync"` with the existing motion constants.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit tests | `npm run test:unit -- hydration carousel` | all pass |
| Browser tests | `npm run test:e2e -- carousel-hydration` | all pass twice |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/views/Home.tsx app/components/Project.tsx app/components/ProjectMobile.tsx app/hooks/useHydratedProjectViews.ts` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: files in the drift check and focused tests.

**Out of scope**: changing transition duration/easing; rendering all projects permanently; eager-loading all project images; changing controls, indicators, spacing, layouts, or project order; replacing progressive loading with the former full homepage payload.

## Git workflow

Use `codex/023-carousel-hydration` if needed. Commit message: `Preserve carousel input during hydration`. Do not push/deploy without instruction; never target `main`.

## Steps

### Step 1: Add delayed-hydration characterization

Create tests with a project whose server payload has one loaded view and `viewCount` of at least three. Delay the API response. Assert one next click before resolution eventually selects view 1 exactly once; one previous selects the final expected view; three rapid next clicks settle at index 0 for a three-view project; alternating input preserves net direction. Cover desktop and mobile.

**Verify**: at least the single-click tests fail against the current modulo-one implementation.

### Step 2: Decouple hydration readiness from image priority

Introduce an explicit prop/state boundary such as `hydrateViews` or `dataActive`, separate from `priorityImages`. In `Home`, hydrate only a tightly bounded live window (the existing radius or a smaller documented radius), while retaining high/eager image policy only for the active or explicit selection target. Hydrating nearby metadata must not add document-level preloads or eager image requests.

**Verify**: a browser network assertion shows bounded project API calls and no additional high-priority images beyond the active composition.

### Step 3: Represent pending navigation intent

In desktop and mobile carousel logic, do not reduce navigation against incomplete `views.length`. Track a logical requested index/delta using `viewCount` when full views are incomplete. When hydrated views arrive, resolve the request once against the complete list. Guard project changes so intent from project A cannot apply to project B. Avoid a blank intermediate view: keep the current image visible until the requested view exists.

**Verify**: delayed-response unit tests pass and never render an undefined current view.

### Step 4: Preserve burst responsiveness

Ensure rapid next/previous actions use functional updates and remain interruptible during the existing crossfade. Maintain one index change per click/tap. For mobile, ensure a recognized swipe suppresses any follow-up synthetic click from the same gesture sequence without weakening normal tap or keyboard activation.

**Verify**: `npm run test:e2e -- carousel-hydration` passes twice at desktop and mobile sizes.

### Step 5: Verify payload and image budgets

Confirm the homepage still returns only bounded initial data and does not revert to full catalog views. API prehydration count must be bounded by the live window. Existing image audit budgets remain unchanged.

**Verify**: build and homepage image audit pass; record homepage bytes, image preload count, hydration request count, and high-priority image count.

## Test plan

- One loaded view with expected counts 2, 3, and 8.
- Delayed success, transient retry, permanent failure, and project change while pending.
- One click, 2-5 rapid clicks, alternating directions, wraparound, indicator jump.
- Mobile tap, short drag, recognized swipe, and synthetic-click suppression.
- Ensure no stale request changes the newly active project.

## Done criteria

- [ ] A first next/previous action during hydration is never discarded
- [ ] Burst input settles on the mathematically correct final view
- [ ] Nearby metadata hydration is bounded and adds no eager/high image work
- [ ] Current image remains visible until the requested view exists
- [ ] Desktop/mobile tests, typecheck, lint, build, and image audit pass
- [ ] Motion and design values are unchanged

## STOP conditions

- Correctness requires returning full views for every homepage project.
- Pending intent cannot be represented without rendering an undefined/blank view.
- Bounded nearby hydration causes additional image preloads/eager requests.
- Fixing mobile gesture ownership requires removing swipe or tap support.

## Maintenance notes

Keep expected counts distinct from loaded arrays in future code. A progressive collection must never use the partial array length as the authoritative navigation modulus.

