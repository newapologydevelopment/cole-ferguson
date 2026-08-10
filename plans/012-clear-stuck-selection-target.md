# Plan 012: Clear stuck `selectionTarget` on abort/timeout

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/views/Home.tsx`
> On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-mount-without-isready-gate.md, plans/003-reduce-blank-snap-sections.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

`handleSelect` sets `selectionTarget` then `scrollTo({ behavior: 'smooth' })`. Clearing only happens when `activeIndex === selectionTarget`. Interrupted smooth scroll, overlapping clicks, or snap settling on a neighbor can leave `selectionTarget` set — keeping an extra project mounted/prioritized outside the live window indefinitely.

## Current state

`app/views/Home.tsx:90-106`:

```ts
const handleSelect = useCallback((idx: number) => {
  // ...
  setSelectionTarget(idx);
  el.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
}, []);

useEffect(() => {
  if (selectionTarget === null || activeIndex !== selectionTarget) return;
  setSelectionTarget(null);
}, [activeIndex, selectionTarget]);
```

`shouldRender` includes `isSelectionTarget`; `priorityImages` uses it too.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/views/Home.tsx` | exit 0 |

## Scope

**In scope**:
- `app/views/Home.tsx`

**Out of scope**:
- Rewriting navigation to instant scroll only
- Nav component API changes (unless a cancel callback is essential — prefer timeout in Home)

## Git workflow

- Codex branch. **No `main`.**
- Commit: `Clear selection target if smooth scroll does not land`
- No push/PR unless asked.

## Steps

### Step 1: Timeout fallback

When setting `selectionTarget`, start a timeout (e.g. 1200ms). On fire: if `selectionTarget` is still that index, set it to `null`. Clear the timeout when `activeIndex` matches or on next select / unmount.

Use a ref for the timer id:

```ts
const selectionTimerRef = useRef<number | null>(null);
// clear helper
```

**Verify**: `rg -n "selectionTimerRef|setSelectionTarget\(null\)" app/views/Home.tsx` → timeout path present.

### Step 2: Clear on user scroll interrupt (optional but preferred)

If `selectionTarget !== null` and the user initiates a wheel/touch scroll on `scrollRef` that moves `activeIndex` away from the target for N frames, clear target. Minimal version: on scroll, if `selectionTarget !== null` and `Math.abs(activeIndex - selectionTarget) > 1` after the existing rAF update, clear. Do not clear on the first frame of programmatic scroll (activeIndex still old) — use a short `selectionArmedAt` timestamp and ignore clears for 100ms after select.

**Verify**: interrupt clear logic exists OR explicitly document timeout-only in commit if interrupt proves flaky — timeout alone is enough for done criteria.

### Step 3: Lint + typecheck + manual

**Verify**: `npx tsc --noEmit` → 0; lint Home → 0.

Manual: click a distant nav title — scrolls and clears target on arrive. Click then immediately scroll elsewhere — target clears within ~1.2s and extra priority mount drops.

## Test plan

- Manual: select last project from first — lands, target null, only live window mounted.
- Manual: rapid double-select different titles — last selection wins; no permanent dual priority.

## Done criteria

- [ ] `selectionTarget` cannot remain non-null longer than the timeout if scroll never lands
- [ ] Timer cleaned on unmount
- [ ] `tsc` + lint exit 0
- [ ] Only `Home.tsx` modified
- [ ] `plans/README.md` 012 → DONE

## STOP conditions

- Timeout fights smooth scroll on very long lists (scroll takes >1200ms) — raise to 2000ms once; if still insufficient, STOP and report list length / device.
- Removing `selectionTarget` entirely breaks nav highlight during scroll — do not remove the feature; only clear stuck state.

## Maintenance notes

- Works with plan 003 sticky mounts; clearing selection should not clear sticky.
- Reviewer: ensure `priorityImages` drops after clear.
