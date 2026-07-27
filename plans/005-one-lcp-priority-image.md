# Plan 005: One LCP `priority` image per viewport

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/SingleImageView.tsx app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/SingleViewMobile.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx app/views/Home.tsx`
> On mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-mount-without-isready-gate.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

When `priorityImages` is true, two- and three-image layouts mark **every** image `priority` + `fetchPriority="high"`. Next.js expects roughly one LCP priority image; multiple high-priority Sanity CDN requests compete and delay the image the user actually sees. Only the primary image in a view should get high priority; siblings stay low.

## Current state

`Home` already passes `priorityImages={isActive || isSelectionTarget}` (good).

`TwoImagesView.tsx` / `ThreeImagesView.tsx` apply the same `priority` prop to all images, e.g.:

```tsx
priority={priority}
loading={priority ? 'eager' : 'lazy'}
fetchPriority={priority ? 'high' : 'low'}
```

Same pattern on mobile counterparts. `SingleImageView` correctly has only one image.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx` | exit 0 |

## Scope

**In scope**:
- `app/components/TwoImagesView.tsx`
- `app/components/ThreeImagesView.tsx`
- `app/components/TwoViewMobile.tsx`
- `app/components/ThreeViewMobile.tsx`

**Out of scope**:
- `Home.tsx` priority gating (already correct unless drift)
- `ArchiveProject.tsx` `fetchPriority`
- Changing layout/aspect math

## Git workflow

- Codex branch only. **No `main`.**
- Commit: `Limit high fetch priority to primary portfolio image`
- No push/PR unless asked.

## Steps

### Step 1: Two-image desktop

In `TwoImagesView.tsx`, for image A (first): keep `priority` / high fetch when `priority` prop is true. For image B: force `priority={false}`, `loading="lazy"`, `fetchPriority="low"` even when the prop is true.

**Verify**: second `<Image>` in the file does not use `priority={priority}` / high fetch.

### Step 2: Three-image desktop

In `ThreeImagesView.tsx`, only the first (or visually primary/center — if layout has a clear hero, use that; otherwise use index 0) gets high priority when prop is true. Other two always low.

**Verify**: at most one `fetchPriority={priority ? 'high' : 'low'}` (or equivalent high path) remains; others hardcode low.

### Step 3: Mobile counterparts

Apply the same rules in `TwoViewMobile.tsx` and `ThreeViewMobile.tsx`.

**Verify**: `rg -n "fetchPriority=\{priority \? 'high'" app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx` → at most one match per file.

### Step 4: Typecheck + lint

**Verify**: `npx tsc --noEmit` → 0; lint on four files → 0.

## Test plan

- Manual: open a two-view and three-view project as active. Network: only one image request starts with High priority; others Low.
- Manual: inactive adjacent project (priorityImages false) — all low / lazy.

## Done criteria

- [ ] Multi-image views: ≤1 high-priority image when `priority` true
- [ ] `npx tsc --noEmit` exits 0
- [ ] Lint in-scope exits 0
- [ ] Only the four view files modified
- [ ] `plans/README.md` 005 → DONE

## STOP conditions

- Layout marks a non-first image as the visual LCP and you cannot tell which — STOP and ask which index is primary rather than guessing.
- Changing priority causes Next/Image warning floods — report exact warning text.

## Maintenance notes

- Plan 004 prefetch should remain `fetchPriority: 'low'` so it does not undo this.
- Reviewer: confirm `sizes` attributes unchanged.
