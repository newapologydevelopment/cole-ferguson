# Plan 010: Non-passive nav wheel listener

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/NavigationHomePage.tsx`
> On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/002-cache-scroll-metrics.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

`NavigationHomePage` calls `event.preventDefault()` in React `onWheel` while driving a custom rAF scroll loop. React 17+ registers root wheel listeners as **passive**, so `preventDefault` is ignored. Native scroll then fights `clampScroll` / smooth targeting — unreliable wheel feel on the project rail.

## Current state

`app/components/NavigationHomePage.tsx:144-176,199-203`:

```tsx
const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
  // ...
  event.preventDefault();
  // updates smoothTargetRef + animateToSmoothTarget()
}, [...]);

<div
  ref={viewportRef}
  onScroll={clampScroll}
  onWheel={handleWheel}
  ...
>
```

React version: `19.1.0` (`package.json`).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/NavigationHomePage.tsx` | exit 0 |

## Scope

**In scope**:
- `app/components/NavigationHomePage.tsx`

**Out of scope**:
- Main page scroll container wheel behavior
- Replacing the custom easing loop with CSS scroll-snap on the nav
- Touch/pointer handlers (unless wheel fix reveals a related bug — report, don’t expand)

## Git workflow

- Codex branch. **No `main`.**
- Commit: `Use non-passive wheel listener on project nav`
- No push/PR unless asked.

## Steps

### Step 1: Replace React `onWheel` with native passive:false

1. Remove `onWheel={handleWheel}` from the viewport div.
2. Refactor `handleWheel` to accept `WheelEvent` (DOM) instead of `React.WheelEvent`.
3. In a `useEffect` depending on the stable handler:

```ts
useEffect(() => {
  const viewport = viewportRef.current;
  if (!viewport) return;
  const onWheel = (event: WheelEvent) => {
    handleWheel(event);
  };
  viewport.addEventListener('wheel', onWheel, { passive: false });
  return () => viewport.removeEventListener('wheel', onWheel);
}, [handleWheel]);
```

4. Keep `preventDefault()` only when you actually handle the gesture (deltaY !== 0), same as today.

**Verify**: `rg -n "onWheel=" app/components/NavigationHomePage.tsx` → no match; `rg -n "passive: false" app/components/NavigationHomePage.tsx` → match.

### Step 2: Lint + typecheck

**Verify**: `npx tsc --noEmit` → 0; lint file → 0.

### Step 3: Manual wheel check

Desktop: hover project nav list, wheel up/down. Page behind must not scroll; nav easing should move within clamp bounds. Leave nav — mouseleave still animates target to 0.

Confirm browser console has no “[Violation] Added non-passive event listener” flood that indicates a leak (one listener is fine).

## Test plan

- Manual: wheel at top and bottom bounds — no rubber-band fighting with main page.
- Manual: trackpad vs mouse wheel if available.

## Done criteria

- [ ] Wheel listener registered with `{ passive: false }`
- [ ] React `onWheel` prop removed
- [ ] Listener cleaned up on unmount
- [ ] `tsc` + lint exit 0
- [ ] Only `NavigationHomePage.tsx` modified
- [ ] `plans/README.md` 010 → DONE

## STOP conditions

- `preventDefault` still fails in target browsers after native listener — report browser + repro; do not add `touch-action` hacks across the app.
- Handler identity churn re-binds every render causing jank — stabilize with `useCallback` deps already present; if broken, STOP.

## Maintenance notes

- Plan 002 changed clamp subscription — do not reintroduce per-frame clamp via wheel.
- Reviewer: verify overscroll-contain still present on viewport class.
