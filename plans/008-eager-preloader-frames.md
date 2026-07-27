# Plan 008: Eager-load all preloader frames

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/Preloader.tsx`
> On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

The preloader cycles 10 local PNGs on a ~108ms interval, but only frame 0 is `priority`/`eager`; frames 2–10 use `loading="lazy"`. The browser often has not fetched the next frame before `idx` advances, causing flicker or stuck frame 0. These assets are tiny and local — eager-load (or preload) all of them.

## Current state

`app/components/Preloader.tsx:25-102`:

```tsx
durationMs = 1400,
fadeOutMs = 320,
// frameInterval ≈ (1400-320)/10
<Image
  src={images[idx]}
  priority={idx === 0}
  loading={idx === 0 ? 'eager' : 'lazy'}
  // ...
/>
```

Frames live under `/public/preloader_images/1.png` … `10.png` (referenced as `/preloader_images/...`).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/Preloader.tsx` | exit 0 |

## Scope

**In scope**:
- `app/components/Preloader.tsx`

**Out of scope**:
- `app/layout.tsx` gating (plan 009)
- Changing duration/fade timings (unless required for flicker after eager load)
- Remote/CMS preloader assets

## Git workflow

- Codex branch. **No `main`.**
- Commit: `Eager-load preloader frames to prevent flicker`
- No push/PR unless asked.

## Steps

### Step 1: Preload all frame URLs on mount

At the top of the existing `useEffect` (before `setInterval`), loop `images` and create `new Image()` (DOM) with `src = images[i]` for each path, or render a hidden preload stack.

Preferred approach — hidden preload row once:

```tsx
{images.map((src) => (
  <Image key={src} src={src} alt="" width={57} height={72} priority loading="eager" className="hidden" />
))}
```

Keep the visible `<Image src={images[idx]} ... />` without `lazy`. Set visible image to `priority` for idx 0 only is fine; all hidden ones use `priority` or at least `loading="eager"`.

Alternative acceptable approach: only change visible image to `loading="eager"` always and add the hidden preload map — do both for reliability.

**Verify**: `rg -n "loading=\{idx === 0 \? 'eager' : 'lazy'\}" app/components/Preloader.tsx` → no match; `rg -n "lazy" app/components/Preloader.tsx` → no match (unless unrelated).

### Step 2: Lint + typecheck

**Verify**: `npx tsc --noEmit` → 0; lint Preloader → 0.

### Step 3: Manual check

Hard refresh `/` with cache disabled. Preloader frames should advance smoothly through 1–10 without blank gaps.

## Test plan

- Manual: throttle Network to Fast 3G — frames should still advance (local assets); no console Next/Image warnings requiring `sizes` on hidden images — add `sizes="57px"` if warned.

## Done criteria

- [ ] No `loading="lazy"` on preloader frames
- [ ] All 10 URLs are requested before/during the sequence (Network)
- [ ] `tsc` + lint exit 0
- [ ] Only `Preloader.tsx` modified
- [ ] `plans/README.md` 008 → DONE

## STOP conditions

- Preloader images missing from `/public/preloader_images` — STOP.
- Using `priority` on 10 images triggers Next warnings you cannot silence without `unoptimized` — switch hidden preloads to raw `<link rel="preload" as="image">` in the component via `useEffect` inserting links; do not expand scope to layout yet.

## Maintenance notes

- Plan 009 may delay portfolio images until `onDone`; keep preload local-only.
