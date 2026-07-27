# Plan 009: Gate or defer portfolio CDN under the preloader

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/layout.tsx app/components/Preloader.tsx app/views/Home.tsx`
> On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/008-eager-preloader-frames.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

`SHOW_PRELOADER` renders a full-screen overlay but `onDone` is never wired in `layout.tsx`. Homepage RSC data and Sanity CDN image requests run underneath and compete with preloader frame fetches on slow networks. Either wire a “ready” gate so portfolio images do not claim high bandwidth until the preloader finishes, or shorten/skip contention another explicit way — but do not leave the overlay purely cosmetic while fighting LCP.

## Current state

`app/layout.tsx:22,96`:

```ts
const SHOW_PRELOADER = true;
// ...
{SHOW_PRELOADER && <Preloader />}
```

`Preloader` accepts `onDone?: () => void` and calls it after fade-out (`Preloader.tsx:58-60`).

`Home` mounts projects independently (after plan 001, without `isReady` gate).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/layout.tsx app/components/Preloader.tsx app/views/Home.tsx` | exit 0 |

## Scope

**In scope**:
- `app/layout.tsx`
- `app/components/Preloader.tsx` (only if needed for callback/context)
- `app/views/Home.tsx` (gate image mounts / priority until ready)
- Optional small client provider under `app/components/` if context is cleaner than prop drilling

**Out of scope**:
- Removing the preloader entirely
- Changing Sanity queries
- Mobile menu / InfoShell

## Git workflow

- Codex branch. **No `main`.**
- Commit: `Defer portfolio image mounts until preloader completes`
- No push/PR unless asked.

## Steps

### Step 1: Client gate for preloader completion

Because `layout.tsx` is a Server Component, introduce a tiny client wrapper, e.g. `app/components/PreloaderGate.tsx`:

```tsx
'use client'
// provides React context { preloaderDone: boolean }
// renders <Preloader onDone={() => setDone(true)} /> when SHOW_PRELOADER
// if !SHOW_PRELOADER, done=true immediately
```

Use it from `layout.tsx` instead of raw `<Preloader />`. Export a hook `usePreloaderDone()`.

When `SHOW_PRELOADER` is false, context must default to `done: true`.

**Verify**: `rg -n "PreloaderGate|usePreloaderDone" app/` → present; layout no longer mounts bare `<Preloader />` without the gate.

### Step 2: Home respects the gate for mounts

In `Home.tsx`:

```ts
const preloaderDone = usePreloaderDone();
const shouldRender =
  preloaderDone && (/* existing live window / sticky / selection conditions */);
```

Still allow snap section wrappers to render (preserve scroll metrics). Only inner `Project` / `ProjectMobile` wait on `preloaderDone`.

If preloader is disabled, mounts proceed immediately.

**Verify**: `rg -n "usePreloaderDone|preloaderDone" app/views/Home.tsx` → present.

### Step 3: Safety timeout

In `PreloaderGate`, if `onDone` has not fired within `durationMs + fadeOutMs + 500` (read defaults 1400+320), force `done=true` so a preloader bug cannot brick the site.

**Verify**: timeout path exists in gate component.

### Step 4: Typecheck + lint + manual

**Verify**: `npx tsc --noEmit` → 0; lint in-scope → 0.

Manual: cold load — preloader runs; portfolio Sanity image requests mostly start after overlay fade (document/RSC may still load — that is OK). If `SHOW_PRELOADER` flipped false locally, homepage images load immediately.

## Test plan

- Manual: complete preloader → first project visible.
- Manual: DevTools block `/preloader_images/*` — timeout still reveals content.
- Manual: no double-scroll jump when projects mount after done (call plan 002 `refreshMetrics` if present when `preloaderDone` flips).

## Done criteria

- [ ] `onDone` wired through a client gate
- [ ] Home defers project image mounts until done (or preloader disabled)
- [ ] Failsafe timeout exists
- [ ] `tsc` + lint exit 0
- [ ] No `main` involvement; only in-scope files
- [ ] `plans/README.md` 009 → DONE

## STOP conditions

- Gate causes hydration mismatch — fix by ensuring server render assumes `done=false` only inside client children, not by reading window in server layout.
- Feels necessary to block **all** `children` rendering (white screen under overlay with no HTML) — STOP; only defer Home project mounts, not the whole app shell.

## Maintenance notes

- Reviewer: brand link / Index still usable under overlay? Overlay is full-screen pointer-blocking today — leave that behavior.
- Coordinate with 001/003 `shouldRender` boolean composition carefully.
