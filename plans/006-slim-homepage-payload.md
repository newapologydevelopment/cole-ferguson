# Plan 006: Slim homepage project payload (keep full title list)

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/page.tsx sanity/lib/client.ts types/`
> On mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Staging homepage used `getHighlightsCached()` (curated subset). This branch switched to `getHomepageProjectsCached()` — **all** projects with full `images[]` + `views[]` + LQIP + dimensions — so the nav can list everything. That is a product win, but the RSC JSON and hydrate cost grow with every view image. Keep the full ordered catalog for titles/nav, but ship lighter per-project media for first paint: enough to render the current view window, not every view’s full asset metadata up front.

## Current state

`app/page.tsx`:

```ts
const projects = await getHomepageProjectsCached();
return <HomeView projects={projects} />;
```

`sanity/lib/client.ts:58-86` — `homepageProjectsQuery` selects all projects with full `images[]` and `views[]` including `blurDataURL` (lqip), width, height.

`getHighlightsCached` still exists (`client.ts:169-173`) — do **not** revert homepage to highlights-only; full nav is intentional.

Types: `@/types` / `@/types/project` — `Project` expects views/images shapes used by `Project.tsx` `normalizeViews`.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/page.tsx sanity/lib/client.ts` | exit 0 |
| Build smoke | `npm run build` | exit 0 (homepage builds) |

## Scope

**In scope**:
- `sanity/lib/client.ts`
- `app/page.tsx` (only if API surface changes)
- Optional: `types/` only if a narrower homepage type is introduced **and** Home still typechecks

**Out of scope**:
- Gallery / archive queries
- Client-side fetching of remaining views (unless Step 2 explicitly chooses progressive load — default is query slim only)
- Reverting to highlights-only homepage

## Git workflow

- Codex branch. **No `main`.**
- Commit: `Slim homepage Sanity projection for faster TTFB`
- Bump cache key when query changes (required).
- No push/PR unless asked.

## Steps

### Step 1: Choose slim projection (default approach)

Update `homepageProjectsQuery` to still return **all** projects ordered by `orderRank`, but limit media:

**Required fields per project:** `_id`, `title`, and enough media for `normalizeViews` to render at least the first view.

Concrete GROQ shape to implement:

```groq
*[_type == "project"]|order(orderRank asc){
  _id,
  title,
  // Keep first view only for homepage scroll window; Project falls back to images[0]
  "views": views[0...1]{
    _type,
    images[]{
      ...,
      "alt": coalesce(alt, ""),
      "blurDataURL": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  },
  // Fallback when views empty — first legacy image only
  "images": images[0...1]{
    ...,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
}
```

Bump `unstable_cache` key from `sanity-homepage-projects-v1` to `sanity-homepage-projects-v2`.

**Verify**: `rg -n "sanity-homepage-projects-v2" sanity/lib/client.ts` → match; query uses `views[0...1]` / `images[0...1]`.

### Step 2: Accept multi-view limitation OR progressive load

With Step 1 alone, intra-project prev/next only works for projects whose first view is enough — additional views are missing from the payload.

Pick **one** (document choice in commit message):

- **A (default, smaller):** Keep Step 1 only. Intra-project navigation for views beyond the first will no-op / single-view until a later plan adds progressive fetch. Coordinate with plan 004 (prefetch) — prefetch only what exists.
- **B (more complete):** Add a server helper `getProjectViewsCached(id)` and have `Project`/`Home` request full views when a project becomes active (`priorityImages`). This is larger — if choosing B, implement a minimal client fetch via a Route Handler `app/api/project-views/[id]/route.ts` using the existing client + cache. STOP and report if this expands beyond ~100 new lines without a clear pattern in-repo.

Default executor path: **A**, unless the operator said multi-view must work for all projects on homepage in this PR.

**Verify (A)**: `npx tsc --noEmit` → 0; `npm run build` → 0.

### Step 3: Manual payload check

Load `/` once in browser. Confirm Network document/RSC payload is smaller than before (compare approx transfer size if possible). Nav still lists all titles. First view of each project still renders when scrolled into the live window.

## Test plan

- Manual: project that only has `images[]` (no views) still shows.
- Manual: project with many views — under option A, only first view available; do not treat that as a regression against this plan’s done criteria.
- Manual: gallery page unchanged.

## Done criteria

- [ ] Homepage still uses full project list (not highlights-only)
- [ ] Homepage GROQ limits views/images arrays as specified
- [ ] Cache key bumped to `v2`
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] Only in-scope files modified
- [ ] `plans/README.md` 006 → DONE (note A vs B in status note if useful)

## STOP conditions

- GROQ slice syntax fails against the project’s Sanity API version — try equivalent projections; if still failing, STOP with error.
- `normalizeViews` breaks on empty views/images — fix fallback in query, do not broaden to full trees “just in case.”
- Operator requires full multi-view without approving option B scope — STOP.

## Maintenance notes

- Plan 007 further strips LQIP; do 006 first.
- Webhooks / manual revalidation must eventually purge `sanity-homepage-projects-v2`.
- Reviewer: confirm product accepts first-view-only homepage under option A.
