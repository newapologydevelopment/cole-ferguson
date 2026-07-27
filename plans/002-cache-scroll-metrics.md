# Plan 002: Cache scroll metrics and stop per-frame layout thrash

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/views/Home.tsx app/components/NavigationHomePage.tsx`
> On mismatch with "Current state" excerpts, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/001-mount-without-isready-gate.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Every coalesced scroll frame in `Home` re-reads `offsetTop` / `offsetHeight` / `scrollHeight` / `clientHeight`, then writes a fractional index into a Framer `MotionValue`. `NavigationHomePage` springs and `clampScroll`s on every change. That couples main scroll, layout, and nav animation into one jank path. Caching section metrics until layout actually changes, and only driving nav spring from values that need sub-index smoothness (or throttling clamp), makes long-portfolio scrolling reliable.

## Current state

- `app/views/Home.tsx:28-88` — `getScrollMetrics()` inside rAF `update()`; `navigationPosition.set(rawIndex)` every frame.
- `app/components/NavigationHomePage.tsx:77-94,184-188` — `position.on('change')` → spring `targetY` + `clampScroll` every change.

Excerpt — `Home.tsx` scroll update:

```ts
const getScrollMetrics = () => {
  const first = sectionRefs.current[0];
  const second = sectionRefs.current[1];
  // reads offsetTop / offsetHeight / clientHeight
};
const update = () => {
  const y = el.scrollTop;
  const { start, step } = getScrollMetrics();
  // ...
  navigationPosition.set(/* fractional rawIndex */);
  setActiveIndex(/* rounded */);
};
```

Excerpt — nav spring + clamp:

```ts
useEffect(() => {
  const update = (value: number) => { targetY.set(/* centering math */); };
  return position.on('change', update);
}, [/* metrics deps */]);

useEffect(() => {
  const unsubscribe = position.on('change', clampScroll);
  // ...
}, [clampScroll, position]);
```

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/views/Home.tsx app/components/NavigationHomePage.tsx` | exit 0 |

## Scope

**In scope**:
- `app/views/Home.tsx`
- `app/components/NavigationHomePage.tsx`

**Out of scope**:
- Wheel `passive` fix (plan 010)
- Virtualization window size (plan 003)
- InfoShell / GSAP motion
- `CursorLabel.tsx`

## Git workflow

- Stay on `codex/portfolio-performance-and-info-motion` (or advisor branch from it). **Never touch `main`.**
- Commit style: `Cache home scroll metrics during scroll`
- Do not push/PR unless asked.

## Steps

### Step 1: Cache metrics in `Home`

In `app/views/Home.tsx`, replace per-frame `getScrollMetrics()` with a ref updated only when layout can change:

1. Add `const metricsRef = useRef({ start: 0, step: 0 });`
2. Add `refreshMetrics()` that performs the current offset reads and writes `metricsRef.current`.
3. Call `refreshMetrics()` once on effect mount, on `resize`, and whenever `projects.length` changes.
4. In rAF `update()`, read `metricsRef.current` only — no DOM geometry reads for start/step.
5. Still read `el.scrollTop`, `el.scrollHeight`, and `el.clientHeight` for max-scroll end detection (needed for last-item clamp). If profiling shows those as hot, cache `maxScroll` in the same refresh path and invalidate on resize/length — preferred once Step 1 works.

**Verify**: `rg -n "offsetTop|offsetHeight" app/views/Home.tsx` → matches only inside `refreshMetrics` (or equivalent), not inside the rAF `update` body.

### Step 2: Keep fractional nav tracking, stop clamp thrash

In `NavigationHomePage.tsx`:

1. Keep spring `targetY` updates on every `position` change (needed for smooth highlight travel).
2. Change `clampScroll` so it does **not** subscribe to every `position.on('change')`. Instead:
   - call `clampScroll` from `onScroll` (already present),
   - call it after measure / resize / `titles.length` changes,
   - optionally call it when `Math.floor(position)` changes (subscribe but bail unless floor changed).

Do **not** remove `onScroll={clampScroll}`.

**Verify**: `rg -n "position\.on\('change', clampScroll\)" app/components/NavigationHomePage.tsx` → no match (or only a floor-gated wrapper).

### Step 3: Re-measure after mounts settle

After plan 001, first projects mount immediately and can change section heights. Call `refreshMetrics()` once via `requestAnimationFrame` (double-rAF is OK) after mount in the Home scroll effect so `step` matches real snap height.

**Verify**: `npx tsc --noEmit` → 0; lint on both files → 0.

### Step 4: Manual scroll check

Desktop `/`: scroll through ≥5 projects with trackpad. Nav highlight must stay aligned; last project must still activate at bottom. Wheel over nav list must still clamp (plan 010 may refine).

## Test plan

- No unit tests in repo. Manual: scroll to last project, resize window mid-scroll, select a mid-list title via nav click — active index and centering must stay correct.

## Done criteria

- [ ] Scroll `update()` does not call `getBoundingClientRect` / `offsetTop` for start/step every frame
- [ ] `clampScroll` is not invoked on every fractional `position` tick
- [ ] `npx tsc --noEmit` exits 0
- [ ] Lint on in-scope files exits 0
- [ ] Only in-scope files modified
- [ ] `plans/README.md` 002 → DONE

## STOP conditions

- Active project drifts one behind after this change (the original bug this math fixed) — revert Step 1 approach and report; do not “guess” offsets.
- Nav spring becomes visibly stepped (only updates on integer index) — restore fractional `targetY` updates; only clamp was supposed to throttle.
- Requires Lenis or rewriting the scroll container — STOP.

## Maintenance notes

- Plan 003 may add keep-alive mounts that change scrollHeight — ensure `refreshMetrics` runs when the mount window policy changes if section heights can change.
- Reviewer: confirm last-item `maxScroll - 1` behavior still works.
