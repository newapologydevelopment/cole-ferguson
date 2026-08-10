# Plan 027: Make Gallery and Archive payloads progressive without changing their design

> **Executor instructions**: Preserve item order, labels, grid geometry, list behavior, lightbox content, and every visual style. Change only data projections and when full detail is fetched. Run all verification gates and update `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- sanity/lib/client.ts app/gallery/page.tsx app/archive/page.tsx app/views/GalleryView.tsx app/views/ArchiveView.tsx utils/flatImages.ts types/project.ts app/hooks/useHydratedProjectViews.ts app/api/project-views/[id]/route.ts scripts/audit-images.mjs tests`
> Compare current uncommitted code and the excerpts below; bracketed route paths may need shell quoting.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/021-establish-image-reliability-test-foundation.md`, `plans/023-make-carousel-hydration-responsive.md`, `plans/024-cache-project-hydration-at-edge.md`
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-13

## Why this matters

Live staging HTML measured 935,681 bytes for `/gallery` and 794,449 bytes for `/archive`, versus roughly 55 KB for the homepage. Archive alone serialized 248 LQIPs totaling about 449 KB. These documents delay hydration and image discovery before the browser can efficiently fetch the photographs; both routes need minimal index projections and on-demand detail while rendering the identical grid/list/lightbox.

## Current state

- `app/gallery/page.tsx:6-9` calls `getProjectsCached()`, the full project query.
- `sanity/lib/client.ts:14-49` returns gallery-list images, legacy images, every view/image, metadata dimensions, and nested fields for all projects.
- `app/views/GalleryView.tsx:40` calls `collectAllImages(projects)`, and lines 179-200/251-277 use the same full project objects for grid, list, and lightbox.
- `utils/flatImages.ts:3-40` establishes exact flattened order and per-project labels; preserve this contract.
- `app/archive/page.tsx:5` calls `getArchiveCached()`.
- `sanity/lib/client.ts:150-161` returns LQIP for every Archive image.
- `app/views/ArchiveView.tsx:182-218` and 240-270 render the complete Archive grid immediately.
- Planning baseline from staging:
  - `/gallery`: 935,681 bytes, 59 embedded data-image placeholders (~86 KB), 262 null blur markers.
  - `/archive`: 794,449 bytes, 248 embedded placeholders (~449 KB).

Convention: server pages fetch cached Sanity projections, client views receive typed serializable data, and selected project details can use the existing `/api/project-views/:id` hydration boundary.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Unit tests | `npm run test:unit -- gallery-data archive-data` | pass |
| Browser tests | `npm run test:e2e -- gallery archive` | pass desktop/mobile |
| Typecheck | `npx tsc --noEmit --pretty false` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 sanity/lib/client.ts app/gallery/page.tsx app/archive/page.tsx app/views/GalleryView.tsx app/views/ArchiveView.tsx utils/flatImages.ts types/project.ts` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**: files in the drift check, new minimal query/result types, focused tests, and route payload budgets.

**Out of scope**: pagination UI, infinite scrolling, changing grid columns/gaps/order, removing photographs, changing labels/copy, changing image quality/crop, changing reveal or lightbox motion, or editing Sanity documents.

## Git workflow

Use `codex/027-progressive-index-payloads`; commit `Slim Gallery and Archive payloads`. Do not deploy or target `main` without instruction.

## Steps

### Step 1: Freeze data and visual contracts in tests

Create fixtures with legacy images, single/two/three views, manual Gallery list images, and Archive items. Assert `collectAllImages` ordering, labels, counts, selected asset refs, project titles, Archive order, grid item count, and lightbox first selected photograph. Add browser snapshots of semantic state only—item order/count and selected refs—not pixels.

**Verify**: tests pass against current behavior and record current route byte baselines informationally.

### Step 2: Define a minimal Gallery index projection

Add `getGalleryIndexCached` and dedicated types containing only fields needed before selection:

- project `_id`, title, `viewCount`, `imageCount`;
- minimal flattened/grid image data: asset ref, alt, width, height, view type/index/image index and stable label inputs;
- manual `galleryListMode` and the one/two manual list-preview images when configured;
- targeted placeholders only for an above-fold bounded subset if plan 021's browser measurement proves they materially help.

Avoid `...` spreads. Do not serialize full LQIP/crop/detail trees for every project. Keep exact project/image ordering. Update the Gallery page/view to consume this explicit index model. On lightbox open, use the existing hydration endpoint to fetch full selected project views; keep the clicked thumbnail/current image visible until detail is ready.

**Verify**: unit tests prove flattened refs/order/labels are identical; delayed hydration browser test opens the correct image on first click.

### Step 3: Define a minimal Archive index projection

Return all Archive item IDs, titles, asset refs, alt, width, and height so the full existing grid remains present. Remove all-item LQIP serialization. If preserving the exact initial placeholder feel is required, issue two cached server queries and merge by stable order: a bounded above-fold slice with LQIP and the remainder without it. Do not guess viewport-dependent columns on the server; choose a conservative fixed first-window count documented from desktop/mobile measurement.

**Verify**: Archive item count/order and click-to-lightbox mapping remain identical; embedded placeholder count is bounded.

### Step 4: Add explicit payload budgets

Extend the deterministic audit to fetch `/gallery` and `/archive`. Start with hard post-change targets of ≤250 KB each. If measured minimal metadata cannot reach that limit, STOP and report the field-level byte breakdown rather than raising the limits broadly. Also assert image count/order fixtures and that no unbounded data-image set is serialized.

**Verify**: local production build reports both route HTML sizes ≤250 KB and homepage remains ≤105 KB.

### Step 5: Validate slow-network behavior

Under delayed project-detail and image responses, verify Gallery grid/list becomes interactive, one click opens the correct project/photo, and Archive remains complete. No blank full-screen lightbox is allowed while detail loads; retain the clicked/previous image shell.

**Verify**: browser suite passes twice at desktop/mobile widths; build, lint, and typecheck pass.

## Test plan

- Projects with views, legacy images, empty projects, missing refs, and manual list configurations.
- Exact Gallery flattened order and labels before/after projection.
- Grid-click asset maps to the same project and actual photo.
- Archive item order/count and lightbox selection.
- Slow/full-detail failure keeps a stable nonblank shell.
- Route byte and embedded-placeholder budgets.

## Done criteria

- [ ] `/gallery` and `/archive` HTML are each ≤250 KB locally
- [ ] Homepage remains ≤105 KB
- [ ] Gallery and Archive item counts, order, labels, and click mapping are unchanged
- [ ] Only selected project detail hydrates on demand; requests are deduped/cached
- [ ] LQIP serialization is bounded, not all-item
- [ ] No layout, motion, visual quality, or content changes
- [ ] Tests, typecheck, lint, build, and route audits pass

## STOP conditions

- Required pre-interaction fields alone exceed 250 KB after removing spreads/LQIPs.
- Maintaining exact clicked-image mapping requires downloading the full original payload.
- Minimal data changes item order or labels.
- The selected-project endpoint cannot safely return every field the lightbox needs.

## Maintenance notes

Keep index projections separate from detail projections. Any new grid/list field must justify its serialized cost and be added to route-budget fixtures.

