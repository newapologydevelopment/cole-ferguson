# Plan 001: Mount first projects without waiting on `isReady`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/views/Home.tsx app/hooks/useBreakpoint.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

`shouldRender` requires `isReady` from `useBreakpoint`, which stays `false` until a client `useEffect` runs. Server HTML and the first client paint therefore show empty full-viewport snap sections — no Sanity images start until after hydration. That blank flash is the most reliable “site feels broken” symptom on cold load. Mounting the active (and adjacent) projects immediately, then swapping mobile/desktop after ready, restores deterministic first paint without undoing virtualization.

## Current state

- `app/hooks/useBreakpoint.ts` — client-only width detection; `isReady` starts `false`.
- `app/views/Home.tsx` — portfolio scroll container; gates mounts on `isReady`.

Excerpt — `app/hooks/useBreakpoint.ts:12-30`:

```ts
const initialState: BreakpointState = {
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isReady: false,
}
// ...
useEffect(() => {
    const check = () => {
        const w = window.innerWidth
        setBreakpoint({
            isMobile: w < 640,
            // ...
            isReady: true,
        })
    }
    check()
    // ...
}, [])
```

Excerpt — `app/views/Home.tsx:141-168`:

```ts
const shouldRender =
  isReady && (Math.abs(i - activeIndex) <= 1 || isSelectionTarget);

return (
  <div /* snap section */>
    {shouldRender && (isMobile ? (
      <ProjectMobile ... priorityImages={isActive || isSelectionTarget} />
    ) : (
      <Project ... priorityImages={isActive || isSelectionTarget} />
    ))}
  </div>
);
```

Conventions: client components use `'use client'`; path aliases `@/app/...`. Commit style is short imperative (“Fix project selection and image loading”). No automated test suite exists — verification is lint + `tsc` + manual browser checks.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint Home | `npm run lint -- --max-warnings=0 app/views/Home.tsx` | exit 0 |
| Dev (manual) | `npm run dev` | homepage loads without blank first project |

## Scope

**In scope**:
- `app/views/Home.tsx`

**Out of scope**:
- `app/hooks/useBreakpoint.ts` — do not change the hook API; consumers elsewhere may rely on `isReady`.
- `app/components/Project.tsx` / `ProjectMobile.tsx` — priority / prefetch handled in later plans.
- Expanding the ±1 virtualization window (plan 003).

## Git workflow

- Branch: stay on `codex/portfolio-performance-and-info-motion` (or `advisor/001-mount-without-isready` cut from it). **Never touch `main`.**
- Commit message style: short imperative, e.g. `Mount first projects before breakpoint ready`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Decouple mount gate from `isReady`

In `app/views/Home.tsx`, change `shouldRender` so the ±1 / selection-target window does **not** require `isReady`:

```ts
const shouldRender =
  Math.abs(i - activeIndex) <= 1 || isSelectionTarget;
```

Keep using `isMobile` to choose `ProjectMobile` vs `Project`. Before `isReady`, `isMobile` is `false`, so desktop `Project` mounts first. That is acceptable: after `isReady` flips, React will remount the correct variant if needed. Do **not** render both.

**Verify**: `rg -n "isReady &&" app/views/Home.tsx` → no match for the `shouldRender` expression (other uses of `isReady` may remain only if still needed; prefer removing the unused `isReady` destructure if it becomes unused).

### Step 2: Clean unused binding

If `isReady` is unused after Step 1, change:

```ts
const { isMobile, isReady } = useBreakpoint();
```

to:

```ts
const { isMobile } = useBreakpoint();
```

**Verify**: `npx tsc --noEmit` → exit 0; `npm run lint -- --max-warnings=0 app/views/Home.tsx` → exit 0.

### Step 3: Manual cold-load check

With `npm run dev`, hard-refresh `/`. The first project’s image shell (or blur placeholder) must appear in the first viewport without waiting for a visible blank beat after hydration. Mobile viewport (`<640px`) may briefly show desktop layout until `isReady`, then swap — that is OK for this plan.

**Verify**: browser hard refresh on `/` shows project media in viewport 0 within the first paint cycle after HTML arrives (no multi-second empty snap).

## Test plan

- No test runner in repo. Do not add a Jest/Vitest harness in this plan.
- Manual: cold load desktop + one mobile-width resize after load to confirm remount to `ProjectMobile` still works.

## Done criteria

- [ ] `shouldRender` does not reference `isReady`
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run lint -- --max-warnings=0 app/views/Home.tsx` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for 001 set to DONE

## STOP conditions

- `Home.tsx` no longer uses `shouldRender` / virtualization as excerpted (drift).
- Fix appears to require changing `useBreakpoint` initial state for SSR (do that only if Step 1 is insufficient — report first).
- Hydration mismatch errors appear in the console after the change (report with stack).

## Maintenance notes

- Plan 003 may widen the mount window; keep the `isReady` independence.
- Reviewers: confirm mobile still gets `ProjectMobile` after resize/`isReady`, and that we did not reintroduce “mount all projects.”
