#!/usr/bin/env node

/**
 * Deterministic image performance audit for the homepage.
 * Usage: npm run test:images [-- --url=https://example.com]
 */

const DEFAULT_BASE_URL = process.env.IMAGE_AUDIT_URL || 'http://localhost:3000';
const MAX_PRELOADS = 2;
const MAX_HTML_BYTES = 105 * 1024;
const MAX_SANITY_CANDIDATE = 2000;

function parseArgs(argv) {
  let baseUrl = DEFAULT_BASE_URL;
  for (const arg of argv) {
    if (arg.startsWith('--url=')) {
      baseUrl = arg.slice('--url='.length);
    } else if (arg.startsWith('--base-url=')) {
      baseUrl = arg.slice('--base-url='.length);
    }
  }
  return { baseUrl: baseUrl.replace(/\/$/, '') };
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function countImagePreloads(html) {
  const preloadMatches = html.match(/<link[^>]+rel=["']preload["'][^>]*>/gi) ?? [];
  return preloadMatches.filter((tag) => /as=["']image["']/i.test(tag)).length;
}

function extractSanityWidths(html) {
  html = decodeHtmlEntities(html);
  const widths = new Set();
  const pattern = /cdn\.sanity\.io[^"'\s]*[?&]w=(\d+)/gi;
  let match = pattern.exec(html);
  while (match) {
    widths.add(Number.parseInt(match[1], 10));
    match = pattern.exec(html);
  }
  return [...widths].sort((a, b) => a - b);
}

function extractInitialImages(html) {
  const images = [];
  const pattern = /<img\b[^>]*>/gi;
  let match = pattern.exec(html);
  while (match) {
    images.push(match[0]);
    match = pattern.exec(html);
  }
  return images;
}

function getAttr(tag, name) {
  const quoted = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  if (quoted) return quoted[1];
  const unquoted = tag.match(new RegExp(`${name}=([^\\s>]+)`, 'i'));
  return unquoted?.[1] ?? '';
}

async function checkImageResponses(html, baseUrl) {
  const failures = [];
  const srcsetPattern = /srcset=["']([^"']+)["']/gi;
  const srcPattern = /src=["']([^"']+)["']/gi;
  const urls = new Set();

  let match = srcsetPattern.exec(html);
  while (match) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) urls.add(new URL(url, baseUrl).toString());
    }
    match = srcsetPattern.exec(html);
  }

  match = srcPattern.exec(html);
  while (match) {
    urls.add(new URL(match[1], baseUrl).toString());
    match = srcPattern.exec(html);
  }

  for (const url of urls) {
    const decodedUrl = decodeHtmlEntities(url);
    if (!/cdn\.sanity\.io/.test(decodedUrl)) {
      continue;
    }

    const response = await fetch(decodedUrl, {
      headers: {
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      failures.push(`Image request failed (${response.status}): ${decodedUrl}`);
    }
  }

  return failures;
}

function detectDuplicateAssets(html) {
  const srcCounts = new Map();

  for (const tag of extractInitialImages(html)) {
    const src = decodeHtmlEntities(getAttr(tag, 'src'));
    if (!src || !/cdn\.sanity\.io/.test(src)) continue;
    srcCounts.set(src, (srcCounts.get(src) ?? 0) + 1);
  }

  return [...srcCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([url, count]) => `Duplicate initial image src (${count}x): ${url.slice(0, 96)}...`);
}

async function main() {
  const { baseUrl } = parseArgs(process.argv.slice(2));
  const failures = [];
  const notes = [];

  const response = await fetch(`${baseUrl}/`, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch homepage (${response.status}) from ${baseUrl}`);
    process.exit(1);
  }

  const html = await response.text();
  const htmlBytes = Buffer.byteLength(html, 'utf8');
  const preloadCount = countImagePreloads(html);
  const sanityWidths = extractSanityWidths(html);
  const initialImages = extractInitialImages(html);

  notes.push(`Base URL: ${baseUrl}`);
  notes.push(`HTML transfer: ${htmlBytes} bytes (${(htmlBytes / 1024).toFixed(1)} KB)`);
  notes.push(`Image preloads: ${preloadCount}`);
  notes.push(`Sanity candidate widths: ${sanityWidths.join(', ') || 'none'}`);
  notes.push(`Initial <img> count: ${initialImages.length}`);

  if (preloadCount > MAX_PRELOADS) {
    failures.push(`Image preload count ${preloadCount} exceeds budget of ${MAX_PRELOADS}`);
  }

  if (htmlBytes > MAX_HTML_BYTES) {
    failures.push(
      `HTML transfer ${htmlBytes} bytes exceeds budget of ${MAX_HTML_BYTES} bytes`
    );
  }

  for (const width of sanityWidths) {
    if (width > MAX_SANITY_CANDIDATE) {
      failures.push(`Sanity candidate width ${width}px exceeds ${MAX_SANITY_CANDIDATE}px`);
    }
  }

  for (const tag of initialImages) {
    const src = getAttr(tag, 'src');
    if (!/cdn\.sanity\.io/.test(src)) continue;
    const sizes = getAttr(tag, 'sizes');
    if (!sizes) {
      failures.push(`Sanity <img> missing sizes attribute: ${src.slice(0, 80)}...`);
    }
  }

  failures.push(...detectDuplicateAssets(html));

  try {
    failures.push(...(await checkImageResponses(html, baseUrl)));
  } catch (error) {
    notes.push(`Skipped live image response checks: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log('Image performance audit');
  console.log('=======================');
  for (const note of notes) {
    console.log(`• ${note}`);
  }

  if (failures.length > 0) {
    console.error('\nFailures:');
    for (const failure of failures) {
      console.error(`✗ ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nAll image performance budgets passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
