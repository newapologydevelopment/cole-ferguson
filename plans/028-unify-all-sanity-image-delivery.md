# Plan 028: Route every Sanity image through one direct responsive delivery path

> **Executor instructions**: Remove duplicate optimization hops while preserving exact `sizes`, aspect ratios, object-fit, crops, visual quality, and loading intent. Do not redesign components. Update `plans/README.md` after all gates pass.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- sanity/lib/image.ts next.config.ts app/components/PortfolioSanityImage.tsx app/components/GridRevealImage.tsx app/components/GalleryGridView.tsx app/components/GalleryGridViewMobile.tsx app/components/GalleryListView.tsx app/views/ArchiveView.tsx app/components/ArchiveProject.tsx tests scripts/audit-images.mjs`
> Compare the uncommitted working tree with current-state excerpts before editing.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`, `plans/027-slim-gallery-archive-payloads.md`
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

Portfolio views and the mobile Gallery grid request responsive transforms directly from Sanity, but desktop Gallery, Gallery list, and Archive pre-transform a fixed Sanity source and then send it through Next/Vercel's optimizer. That double transformation adds latency, optimizer usage, cache variants, and sometimes a second hydration-driven source request. One direct loader should own width, format, quality, and source-width clamping everywhere.

## Current state

- `sanity/lib/image.ts:101-137` contains canonical direct Sanity URL generation and `sanityLoader`.
- `PortfolioSanityImage.tsx:28-35` wraps that loader and clamps by source width.
- `GalleryGridViewMobile.tsx:77-90` already uses `sanityLoader` with an untransformed base URL.
- `GalleryGridView.tsx:69-101` stores client DPR and screen width; lines 133-139 create a fixed transformed URL with `.width().dpr().auto().quality().fit()` before `GridRevealImage` passes it to default Next optimization.
- `ArchiveView.tsx:186/244` fixes the source at 800 pixels, then default Next optimization runs.
- `GalleryListView.tsx:40-50` and `ArchiveProject.tsx:104-110` use fixed transformed sources, then default Next optimization.
- `next.config.ts` has a shared bounded candidate list and AVIF/WebP settings; direct Sanity `auto=format` negotiation must remain verified.

Convention: base `cdn.sanity.io` URL in `src`, one canonical custom loader, explicit `sizes`, known `sourceWidth`, quality 75 for portfolio unless a surface has a documented existing quality that must be visually retained.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit tests | `npm run test:unit -- sanity-image` | pass exact URLs |
| Browser tests | `npm run test:e2e -- image-delivery` | pass network assertions |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 sanity/lib/image.ts app/components/PortfolioSanityImage.tsx app/components/GridRevealImage.tsx app/components/GalleryGridView.tsx app/components/GalleryGridViewMobile.tsx app/components/GalleryListView.tsx app/views/ArchiveView.tsx app/components/ArchiveProject.tsx` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: every Sanity-backed rendered image listed above, shared loader/wrapper code, network assertions, audit detection of `_next/image` Sanity sources.

**Out of scope**: local preloader frames, icons/share images, layout sizes, crop/object-fit changes, global quality reduction, upload recompression, or changing which images appear.

## Git workflow

Use `codex/028-unified-sanity-delivery`; commit `Unify Sanity image delivery`. Do not deploy or target `main` without instruction.

## Steps

### Step 1: Inventory and freeze rendered request contracts

At representative 390/DPR3, 1440/DPR2, and 2560/DPR2 viewports, record each surface's `sizes`, rendered CSS width, selected URL width, format, quality, source dimensions, and crop/hotspot parameters. Add tests proving canonical URLs retain existing query/crop parameters and never exceed source width.

**Verify**: inventory identifies every Sanity image call site and tests pass for the already-direct portfolio path.

### Step 2: Make the shared wrapper usable by all surfaces

Extend `PortfolioSanityImage` or rename/refactor it into a generic Sanity image wrapper without changing its DOM output. It must accept base source, source width, caller loading/priority/placeholder/error props, and preserve custom loader escape hatches. `GridRevealImage` must use this direct loader while retaining its exact motion wrapper and animation constants.

**Verify**: component tests show identical props/markup semantics except URL delivery.

### Step 3: Remove client-derived fixed thumbnail sources

In desktop Gallery, remove `dpr`/`screenWidth` state and fixed `.width().dpr()` source generation. Pass an untransformed base URL, source width, the existing desktop `sizes`, and the surface's quality policy to the shared loader. Keep every class/style and grid calculation unchanged. Match mobile through the same component path.

**Verify**: first client render and post-hydration use the same base source; no duplicate asset request caused by DPR state.

### Step 4: Migrate Gallery list and Archive

Replace fixed 800/1600 transformed sources plus default Next optimization with base Sanity source and canonical direct loading. Preserve each existing `sizes`, `fill`/width-height geometry, placeholder, eager/lazy intent, and archive transition ownership.

**Verify**: browser network log contains direct `cdn.sanity.io` candidate URLs and no `_next/image?url=<sanity...>` request on Gallery/Archive.

### Step 5: Add optimizer and quality gates

Extend `test:images`/browser tests to fail if any Sanity URL is nested inside `/_next/image`. Assert candidate widths stay ≤2000/source width, direct responses are successful, and content negotiation yields a supported modern format. Compare high-detail photographs at 1x/2x; do not lower quality based only on bytes.

**Verify**: all route/browser audits pass and request counts do not increase.

## Test plan

- Base URLs with no query and existing crop/hotspot query.
- Source widths below/between/above candidates.
- Desktop/mobile Gallery, list preview, Archive grid/lightbox, portfolio single/two/three.
- Initial render versus post-hydration URL identity.
- No nested Next optimizer request for Sanity.
- Visual spot-check fine grain, gradients, dark tones at 1x/2x.

## Done criteria

- [ ] Every Sanity-backed image uses one canonical direct loader
- [ ] No Sanity image is pre-transformed and then sent through `/_next/image`
- [ ] No hydration-driven duplicate thumbnail source request
- [ ] Candidate/source limits and modern format negotiation pass
- [ ] Existing `sizes`, loading priority, placeholders, layout, crop, and perceived quality are preserved
- [ ] Tests, typecheck, lint, build, and route audits pass

## STOP conditions

- Direct delivery loses a Sanity crop/hotspot parameter.
- A migrated surface cannot preserve its existing selected pixel density at the bounded candidate set.
- Modern format negotiation differs materially across supported browsers and degrades reliability.
- The migration requires changing visual geometry or global quality.

## Maintenance notes

New Sanity image call sites must use the shared wrapper/loader from the start. Keep the audit's nested-optimizer detection so fixed transformed URLs do not reappear.

