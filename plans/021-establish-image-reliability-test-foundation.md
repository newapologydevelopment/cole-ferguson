# Plan 021: Establish deterministic image-loading and interaction regression tests

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving on. Preserve the site's rendered design and animation values. If a STOP condition occurs, stop and report instead of improvising. Update this plan's row in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- package.json package-lock.json scripts/audit-images.mjs README.md tests playwright.config.ts`
> This plan was written against commit `0426b50` plus the uncommitted branch working tree on 2026-07-13. Also run `git diff --stat -- package.json scripts/audit-images.mjs README.md`; compare live code with the excerpts below before editing.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

The current image audit can pass while carousel clicks are discarded, Gallery or Archive transfers nearly a megabyte of HTML, hidden video consumes bandwidth, or client-rendered images fail. All later plans change asynchronous request behavior; they need deterministic unit and browser characterization first. Tests must assert request/state invariants, not exact animation screenshots or design values.

## Current state

- `package.json:5-12` has build, lint, and `test:images`, but no unit test runner, browser test runner, aggregate `test`, or `typecheck` script.
- `scripts/audit-images.mjs:128-179` fetches only `/` server HTML.
- `scripts/audit-images.mjs:178-182` converts a thrown live image check into a note, allowing a requested live reliability check to pass without checking images.
- `sanity/lib/image.ts:46-158` contains pure custom parsing, candidate, URL, and prefetch-width functions with no tests.
- `app/components/Project.tsx`, `ProjectMobile.tsx`, `GridRevealImage.tsx`, `prefetchProjectViews.ts`, and `app/hooks/useHydratedProjectViews.ts` have no component/browser coverage.
- Existing verification commands were run successfully during planning: `npx tsc --noEmit`, `npm run lint -- --max-warnings=0`, and the staging homepage `npm run test:images -- --url=https://cole-ferguson-staging.vercel.app`.

Repository convention: TypeScript uses the `@/*` path alias, strict mode, and npm with `package-lock.json`. Match existing semicolon/style conventions in each touched file. Git history uses short imperative messages such as `Fix project selection and image loading`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0` | exit 0 |
| Unit tests | `npm run test:unit` | exit 0, all tests pass |
| Browser tests | `npm run test:e2e` | exit 0, all tests pass |
| Existing audit | `npm run test:images -- --url=http://localhost:3000` | all image budgets pass |
| Aggregate | `npm test` | typecheck, lint, unit, and deterministic browser checks pass |

## Scope

**In scope**:

- `package.json`, `package-lock.json`
- a minimal test-runner config and `tests/` directory
- `playwright.config.ts` or equivalent browser-runner config
- `scripts/audit-images.mjs`
- `README.md`
- test-only reset/export seams in `app/components/prefetchProjectViews.ts` and `app/hooks/useHydratedProjectViews.ts` only if required

**Out of scope**:

- Changing production image behavior, layout, CSS, transitions, timing, or quality
- Adding screenshot/pixel-diff tests
- Making normal local unit tests depend on Sanity or Vercel network availability
- Creating a GitHub workflow when the repository has no existing CI convention

## Git workflow

- Work on `codex/portfolio-performance-and-info-motion` or `codex/021-image-test-foundation` cut from it.
- Use a short imperative commit such as `Add image reliability regression tests`.
- Do not push, deploy, or open a PR unless instructed. Never target `main`; staging is the validation environment.

## Steps

### Step 1: Add the smallest maintainable test toolchain

Add a TypeScript-capable unit/component runner compatible with React 19 and Next 15, plus Playwright for real-browser request and interaction tests. Prefer Vitest with jsdom and Testing Library unless an incompatibility is demonstrated. Add scripts `typecheck`, `test:unit`, `test:e2e`, and an aggregate `test` that does not require an external URL. Keep the existing `test:images` command.

**Verify**: `npm run test:unit -- --run` and `npx playwright test --list` both exit 0.

### Step 2: Characterize pure image URL behavior

Create table-driven tests for `parseSizesAttribute`, `pickCandidateWidth`, `buildCanonicalSanityUrl`, and `resolvePrefetchWidth`. Cover ordered desktop/mobile media clauses, DPR 1/2/3 and values above the cap, existing query strings, source widths below/between/above candidates, and explicit/default quality. Assert exact stable URLs and bounded widths.

**Verify**: `npm run test:unit -- sanity-image` passes with at least 12 named cases.

### Step 3: Characterize hydration and prefetch state machines

Use mocked `fetch`, timers, `Image`, viewport/DPR, and `requestIdleCallback` to test: in-flight deduplication, cached reuse, eviction after the configured maximum, two retries then stop, cancellation on project change/unmount, adjacent wraparound, one-view behavior, URL dedupe, and idle fallback. If test-only reset functions are needed, mark them clearly and do not call them from production code.

**Verify**: `npm run test:unit -- hydration prefetch` passes and asserts request counts as well as URLs.

### Step 4: Add focused browser regressions

Run against a local production build started by Playwright's `webServer`. Add behavior tests for:

- one next/previous action during delayed project hydration eventually advances exactly once;
- 2-5 immediate desktop clicks and mobile taps are not dropped or doubled;
- a recognized mobile swipe does not also synthesize a navigation click;
- every Gallery grid item eventually reaches visible/non-translated state on desktop and mobile, including reload and reduced motion;
- image failures reach a stable fallback and never loop;
- no information video request occurs before Information is opened.

Mock the hydration API and image/video responses at the browser boundary so these tests are deterministic. Use ARIA labels and data attributes, not CSS geometry or screenshots.

**Verify**: `npm run test:e2e` passes twice consecutively.

### Step 5: Make the live audit explicit and fail closed

Retain the cheap HTML budget checks. Add request timeout, bounded concurrency, and limited retry. When a user explicitly supplies `--url`/`--base-url`, a DNS/TLS/timeout/image-response failure must fail the command; an optional offline mode may skip live responses only when explicitly selected. Extend route budgets to `/gallery` and `/archive` after plans 027/028 establish their targets; until then report those sizes without failing.

**Verify**: a deliberately invalid explicit URL exits nonzero with a concise error; the staging homepage URL exits 0.

### Step 6: Document the verification workflow

Update `README.md` with local prerequisites, commands, deterministic versus live checks, and the rule that animation assertions are state-based rather than screenshot-based.

**Verify**: `npm test` exits 0 and `npm run test:images -- --url=https://cole-ferguson-staging.vercel.app` exits 0.

## Test plan

This plan creates the test infrastructure itself. Run every new suite twice. Confirm the browser suite passes with normal motion and reduced motion. Deliberately break one URL expectation, one carousel final-index expectation, and one live URL to prove each layer fails clearly; restore those changes before finishing.

## Done criteria

- [ ] `npm test` is a deterministic one-command gate and exits 0
- [ ] Pure Sanity URL/candidate functions have table-driven coverage
- [ ] Hydration/prefetch cache, retry, cancellation, and dedupe behavior is covered
- [ ] Rapid carousel input and full-grid reveal have browser coverage
- [ ] Explicit live network failures fail closed
- [ ] No production layout, CSS, animation, quality, or request policy changed
- [ ] Only in-scope files plus `plans/README.md` are modified

## STOP conditions

- React 19/Next 15 requires downgrading production packages to support the chosen runner.
- Browser tests cannot intercept Sanity/CDN requests without using real external network calls.
- Stable selectors would require changing visual markup semantics rather than adding nonvisual test attributes.
- Any test requires exact animation milliseconds or screenshots to pass.

## Maintenance notes

Every later image plan should add its regression to this foundation. Keep external staging checks separate from deterministic CI checks, and tighten route payload budgets only from measured post-change baselines.

