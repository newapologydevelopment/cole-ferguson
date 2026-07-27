# Plan 024: Cache project hydration responses at the HTTP edge

> **Executor instructions**: Align HTTP freshness with the existing one-hour Sanity cache. Do not change response fields, project ordering, or client navigation behavior. Run every verification and update `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/api/project-views/[id]/route.ts sanity/lib/client.ts app/hooks/useHydratedProjectViews.ts tests`
> Shells may require quoting the bracketed route path. Compare uncommitted working-tree code with the excerpts below.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`, `plans/023-make-carousel-hydration-responsive.md`
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

Sanity results are cached server-side for one hour, but each browser reload still makes an uncached dynamic route round trip. Staging returned `public, max-age=0, must-revalidate`, `x-vercel-cache: MISS`, and approximately 125-500 ms response time. Edge caching removes most repeated latency while preserving the same freshness window.

## Current state

- `sanity/lib/client.ts:129-134` wraps each project response in `unstable_cache` with `revalidate: 60 * 60`.
- `app/api/project-views/[id]/route.ts:8-22` returns JSON without explicit cache headers or route revalidation metadata.
- `app/hooks/useHydratedProjectViews.ts:10-11` keeps same-tab in-memory caches, which disappear on reload/new tab.
- Response shape is exactly `{ views: project.views ?? [], images: project.images ?? [] }`; consumers depend on it.

Convention: use Next route-handler response metadata/headers, retain the existing JSON error statuses, and keep cache lifetime stated once or obviously synchronized.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Route tests | `npm run test:unit -- project-views-route` | all pass |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 'app/api/project-views/[id]/route.ts' sanity/lib/client.ts` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: route handler, a shared freshness constant only if needed, focused route/browser tests.

**Out of scope**: changing Sanity documents, response fields, client cache size/retry policy, adding authentication, or caching error responses for long periods.

## Git workflow

Use `codex/024-hydration-edge-cache`; commit `Cache project hydration responses`. Do not deploy or target `main` without instruction.

## Steps

### Step 1: Characterize response policy

Add route tests for 200, 400, and 404 behavior. Assert successful responses expose an explicit public edge-cache policy aligned with one hour and a bounded stale-while-revalidate window. Assert client/browser freshness is conservative (`max-age=0` or a deliberately small value) if immediate same-browser content freshness matters. Ensure errors are not cached for an hour.

**Verify**: the successful-cache assertion fails before the runtime change.

### Step 2: Add Next/Vercel-compatible caching

Use route segment revalidation or explicit `Cache-Control`/`CDN-Cache-Control` supported by the installed Next/Vercel versions. Keep the one-hour server and HTTP windows aligned. Preserve response JSON exactly.

**Verify**: route tests pass and build output does not mark the route incompatible with the chosen caching method.

### Step 3: Verify real edge behavior on staging

After an authorized staging deployment, request the same public project endpoint at least three times. Record `cache-control`, `age`, `x-vercel-cache`, bytes, and timing. The later request should show an edge hit or increasing age; do not accept repeated MISS plus `max-age=0`.

**Verify**: repeated staging requests show cache reuse and identical response bytes.

## Test plan

- 200 response cacheable at edge.
- 400 missing ID and 404 missing project remain non-long-lived.
- Response shape unchanged.
- Repeated request yields same ETag/body.
- Content becomes refreshable at or before the one-hour Sanity window.

## Done criteria

- [ ] Successful project hydration can be served from Vercel edge cache
- [ ] Cache freshness does not exceed the Sanity cache contract
- [ ] Error responses are not long-lived
- [ ] Response shape and client behavior are unchanged
- [ ] Tests, typecheck, lint, and build pass

## STOP conditions

- Next 15 ignores or overrides the selected header/route configuration on staging.
- Edge caching would exceed the existing one-hour editorial freshness contract.
- Correct caching requires exposing unpublished/draft Sanity data.

## Maintenance notes

When Sanity revalidation becomes tag/webhook driven, update or explicitly purge this edge layer too. Keep the live header check in the image reliability audit.

