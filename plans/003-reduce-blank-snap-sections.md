# Plan 003: Reduce blank snap sections during fast scroll

> **Executor instructions**: Follow step by step. Verify each step. On STOP conditions, report — do not improvise. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/views/Home.tsx`
> On mismatch with excerpts, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/001-mount-without-isready-gate.md, plans/002-cache-scroll-metrics.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Virtualization only mounts `Project` when `Math.abs(i - activeIndex) <= 1` (plus selection target). Outer `snap-start h-full` wrappers always exist, so fast scroll or mid-snap positions show empty full-viewport frames. That feels like broken loading. Widening the live window slightly and keeping recently visited indices mounted briefly preserves the CDN win without blank snaps.

## Current state

`app/views/Home.tsx:137-168` (post-001 `shouldRender` must not use `isReady`):

```ts
const shouldRender =
  Math.abs(i - activeIndex) <= 1 || isSelectionTarget;
// ...
{shouldRender && (isMobile ? <ProjectMobile ... /> : <Project ... />)}
```

Snap wrappers always mount; only inner project is gated.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/views/Home.tsx` | exit 0 |

## Scope

**In scope**:
- `app/views/Home.tsx`

**Out of scope**:
- Prefetch inside `Project` (plan 004)
- Priority flag policy (plan 005)
- Changing snap CSS / Lenis
- Mounting all projects (regression vs staging)

## Git workflow

- Branch: `codex/portfolio-performance-and-info-motion` (or advisor cut). **No `main`.**
- Commit: `Keep nearby projects mounted during fast scroll`
- No push/PR unless asked.

## Steps

### Step 1: Widen live window to ±2

Change the distance check to:

```ts
const LIVE_RADIUS = 2;
const isInLiveWindow = Math.abs(i - activeIndex) <= LIVE_RADIUS;
```

Use `isInLiveWindow` in `shouldRender` along with `isSelectionTarget`.

**Verify**: `rg -n "LIVE_RADIUS|<= 2" app/views/Home.tsx` → present; `rg -n "<= 1" app/views/Home.tsx` → no stale ±1 mount gate (selection logic may still compare equality).

### Step 2: Keep-alive recently active indices

Add a ref/state set of “sticky” indices that remain mounted for a short TTL after leaving the live window:

1. `const stickyRef = useRef<Map<number, number>>(new Map());` // index → expiry timestamp
2. On `activeIndex` change, mark previous index (and optionally ±1) with `Date.now() + 800` (800ms TTL).
3. `shouldRender = isInLiveWindow || isSelectionTarget || (stickyRef has i and now < expiry)`.
4. Force a cheap re-render when TTL expires: single `setTimeout` that calls `setStickyVersion(v => v+1)` or clear expired entries — do not poll every frame.

Cap sticky size: never keep more than 5 sticky indices; drop oldest expiries first.

**Verify**: `rg -n "sticky" app/views/Home.tsx` → keep-alive logic present; max sticky cap exists.

### Step 3: Priority only for true active / selection

Do **not** set `priorityImages` true for entire ±2 window. Keep:

```ts
priorityImages={isActive || isSelectionTarget}
```

Adjacent/sticky mounts must stay low priority (plan 005 will refine further).

**Verify**: `rg -n "priorityImages=" app/views/Home.tsx` → only `isActive || isSelectionTarget`.

### Step 4: Refresh scroll metrics after window policy

If plan 002 added `refreshMetrics`, call it when sticky mounts appear/disappear only if section heights can change. With empty wrappers already `h-full`, heights should be stable — skip unless you observe drift.

**Verify**: `npx tsc --noEmit` → 0; lint Home → 0.

### Step 5: Manual fast-scroll check

On desktop, fling-scroll through many projects. Blank full-viewport snaps should be rare/absent. Concurrent CDN requests should stay far below “all projects” (spot-check Network: only a handful of Sanity image requests active).

## Test plan

- Manual: programmatic nav jump from index 0 to last via title click — destination + neighbors mount; intermediates may briefly mount via activeIndex travel (acceptable); no permanent blanks at rest.
- Manual: after settling, sticky entries expire and distant projects unmount (React DevTools or logging once during dev is OK; remove logs before commit).

## Done criteria

- [ ] Live radius is 2 (named constant)
- [ ] Keep-alive TTL with cap ≤5 exists
- [ ] `priorityImages` still only active/selection
- [ ] Does not mount all projects unconditionally
- [ ] `npx tsc --noEmit` exits 0; lint Home exits 0
- [ ] Only `app/views/Home.tsx` modified
- [ ] `plans/README.md` 003 → DONE

## STOP conditions

- Network tab shows unbounded image requests (all projects) — shrink radius / sticky before shipping.
- Scroll-snap becomes unreliable with more mounts — STOP and report.
- Feels necessary to remove virtualization entirely — STOP; that reverts the branch’s main win.

## Maintenance notes

- Plan 012 clears `selectionTarget`; sticky is separate.
- Reviewer: confirm memory stays bounded on long sessions (sticky cap).
