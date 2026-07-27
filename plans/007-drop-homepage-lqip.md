# Plan 007: Drop non-visible LQIP from homepage GROQ

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- sanity/lib/client.ts app/components/SingleImageView.tsx`
> On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/006-slim-homepage-payload.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Even after plan 006, each remaining image embeds `asset->metadata.lqip` (base64) into the RSC payload. LQIP helps placeholders but dominates JSON size vs refs/dimensions. For reliability under slow networks, prefer empty placeholder on non-LCP images and keep LQIP only on the first image of each project (or drop all homepage LQIPs if placeholders look acceptable).

## Current state

Homepage query (after 006) still includes:

```groq
"blurDataURL": asset->metadata.lqip,
```

View components use:

```tsx
placeholder={image?.blurDataURL ? 'blur' : 'empty'}
blurDataURL={image?.blurDataURL}
```

So omitting `blurDataURL` safely falls back to `empty`.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 sanity/lib/client.ts` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**:
- `sanity/lib/client.ts` (`homepageProjectsQuery` / `getHomepageProjectsCached` only)

**Out of scope**:
- Gallery / archive / highlights / by-slug queries (keep LQIP there)
- Changing Image components’ placeholder logic

## Git workflow

- Codex branch. **No `main`.**
- Commit: `Omit homepage LQIP to shrink RSC payload`
- Bump cache key `sanity-homepage-projects-v2` → `v3` (or `v2` → `v3` if 006 landed).
- No push/PR unless asked.

## Steps

### Step 1: Remove LQIP from homepage projection

In `homepageProjectsQuery` only, delete the `"blurDataURL": asset->metadata.lqip,` lines from `images` and `views` projections. Keep `width` / `height` / `alt`.

Bump unstable_cache key to the next version (`v3` if 006 used `v2`).

**Verify**: `rg -n "blurDataURL" sanity/lib/client.ts` → matches remain for non-homepage queries only; homepage query block has none. `rg -n "sanity-homepage-projects-v3" sanity/lib/client.ts` → match (adjust if versioning differs — must be newer than pre-007 key).

### Step 2: Build + typecheck

**Verify**: `npx tsc --noEmit` → 0; `npm run build` → 0.

### Step 3: Visual check

Hard refresh `/`. Images may show empty → decode without blur-up. Confirm no runtime errors from missing `blurDataURL`.

## Test plan

- Manual: active project image still loads.
- Manual: gallery page still has blur placeholders (unchanged query).

## Done criteria

- [ ] Homepage query has no `lqip` / `blurDataURL`
- [ ] Cache key bumped
- [ ] Other queries still include LQIP
- [ ] `tsc` + `build` exit 0
- [ ] Only `sanity/lib/client.ts` modified
- [ ] `plans/README.md` 007 → DONE

## STOP conditions

- Design requires blur-up on homepage LCP — then keep LQIP **only** on `views[0].images[0]` / `images[0]`, not all images; do not restore full LQIP set.
- Cache key not bumped (would serve stale fat payloads) — fix before done.

## Maintenance notes

- If progressive full-project fetch (006 option B) lands later, that endpoint may include LQIP again for the active project only.
