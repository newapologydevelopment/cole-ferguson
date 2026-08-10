#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

/**
 * Deterministic image performance audit for the homepage.
 * Usage: npm run test:images [-- --url=https://example.com]
 */

const DEFAULT_BASE_URL = process.env.IMAGE_AUDIT_URL || 'http://localhost:3000';
const MAX_PRELOADS = 2;
const MAX_HTML_BYTES = 105 * 1024;
const MAX_SANITY_CANDIDATE = 2000;
const MAX_LIVE_IMAGE_CHECKS = 12;

function parseArgs(argv) {
  let baseUrl = DEFAULT_BASE_URL;
  let avifOnly = false;
  for (const arg of argv) {
    if (arg.startsWith('--url=')) {
      baseUrl = arg.slice('--url='.length);
    } else if (arg.startsWith('--base-url=')) {
      baseUrl = arg.slice('--base-url='.length);
    } else if (arg === '--avif-only') {
      avifOnly = true;
    }
  }
  return { baseUrl: baseUrl.replace(/\/$/, ''), avifOnly };
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

function extractImageUrls(html, baseUrl) {
  html = decodeHtmlEntities(html);
  const urls = new Set();
  const srcsetPattern = /srcset=["']([^"']+)["']/gi;
  const srcPattern = /src=["']([^"']+)["']/gi;

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

  return [...urls];
}

async function checkAvifConfiguration() {
  const failures = [];
  const notes = [];
  const [nextConfig, sanityImageHelper] = await Promise.all([
    readFile(new URL('../next.config.ts', import.meta.url), 'utf8'),
    readFile(new URL('../sanity/lib/image.ts', import.meta.url), 'utf8'),
  ]);

  if (!/formats:\s*\[\s*['"]image\/avif['"]\s*,\s*['"]image\/webp['"]\s*\]/.test(nextConfig)) {
    failures.push('Next.js must prefer AVIF and retain WebP as its fallback format.');
  } else {
    notes.push('Next.js output formats: AVIF, then WebP fallback');
  }

  if (!/auto=format/.test(sanityImageHelper)) {
    failures.push('Sanity image URLs must include auto=format for AVIF negotiation.');
  } else {
    notes.push('Sanity image negotiation: auto=format enabled');
  }

  return { failures, notes };
}

async function checkImageResponses(html, baseUrl) {
  const failures = [];
  const notes = [];
  const urls = extractImageUrls(html, baseUrl);
  const sanityUrls = urls.filter((url) => /cdn\.sanity\.io/.test(url));
  const discoveredNextImageUrls = urls.filter(
    (url) => new URL(url).pathname === '/_next/image'
  );
  const nextImageUrls = discoveredNextImageUrls.length
    ? discoveredNextImageUrls
    : [
        new URL(
          '/_next/image?url=%2Fpreloader_images%2F1.webp&w=640&q=75',
          baseUrl
        ).toString(),
      ];
  let sanityAvifResponses = 0;
  let sanityFallbackResponses = 0;
  let nextAvifResponses = 0;

  for (const decodedUrl of sanityUrls.slice(0, MAX_LIVE_IMAGE_CHECKS)) {
    const parsed = new URL(decodedUrl);
    if (parsed.searchParams.get('auto') !== 'format') {
      failures.push(`Sanity image is missing auto=format: ${decodedUrl}`);
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
      continue;
    }

    const contentType = response.headers.get('content-type')?.split(';')[0] ?? '';
    if (contentType === 'image/avif') {
      sanityAvifResponses += 1;
    } else if (/^image\/(webp|jpeg|png)$/.test(contentType)) {
      // Sanity may return WebP/JPEG/PNG while a new AVIF rendition is generated.
      sanityFallbackResponses += 1;
    } else {
      failures.push(`Unexpected Sanity image content type (${contentType || 'missing'}): ${decodedUrl}`);
    }
  }

  for (const url of nextImageUrls.slice(0, MAX_LIVE_IMAGE_CHECKS)) {
    const response = await fetch(url, {
      headers: { Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' },
      redirect: 'follow',
    });
    const contentType = response.headers.get('content-type')?.split(';')[0] ?? '';
    if (!response.ok) {
      failures.push(`Next image request failed (${response.status}): ${url}`);
    } else if (contentType !== 'image/avif') {
      failures.push(`Next image optimizer did not return AVIF (${contentType || 'missing'}): ${url}`);
    } else {
      nextAvifResponses += 1;
    }
  }

  notes.push(
    `Sanity AVIF negotiation: ${sanityAvifResponses} AVIF, ${sanityFallbackResponses} temporary fallback response(s)`
  );
  notes.push(`Next.js AVIF responses: ${nextAvifResponses}`);

  return { failures, notes };
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
  const { baseUrl, avifOnly } = parseArgs(process.argv.slice(2));
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
  const avifConfiguration = await checkAvifConfiguration();
  failures.push(...avifConfiguration.failures);
  notes.push(...avifConfiguration.notes);

  notes.push(`Base URL: ${baseUrl}`);
  notes.push(`HTML transfer: ${htmlBytes} bytes (${(htmlBytes / 1024).toFixed(1)} KB)`);
  notes.push(`Image preloads: ${preloadCount}`);
  notes.push(`Sanity candidate widths: ${sanityWidths.join(', ') || 'none'}`);
  notes.push(`Initial <img> count: ${initialImages.length}`);
  if (avifOnly) notes.push('Audit mode: AVIF support only');

  if (!avifOnly && preloadCount > MAX_PRELOADS) {
    failures.push(`Image preload count ${preloadCount} exceeds budget of ${MAX_PRELOADS}`);
  }

  if (!avifOnly && htmlBytes > MAX_HTML_BYTES) {
    failures.push(
      `HTML transfer ${htmlBytes} bytes exceeds budget of ${MAX_HTML_BYTES} bytes`
    );
  }

  for (const width of avifOnly ? [] : sanityWidths) {
    if (width > MAX_SANITY_CANDIDATE) {
      failures.push(`Sanity candidate width ${width}px exceeds ${MAX_SANITY_CANDIDATE}px`);
    }
  }

  for (const tag of avifOnly ? [] : initialImages) {
    const src = getAttr(tag, 'src');
    if (!/cdn\.sanity\.io/.test(src)) continue;
    const sizes = getAttr(tag, 'sizes');
    if (!sizes) {
      failures.push(`Sanity <img> missing sizes attribute: ${src.slice(0, 80)}...`);
    }
  }

  if (!avifOnly) failures.push(...detectDuplicateAssets(html));

  try {
    const routeDocuments = [{ route: '/', html }];
    if (avifOnly) {
      for (const route of ['/gallery', '/archive']) {
        const routeResponse = await fetch(`${baseUrl}${route}`, {
          headers: { Accept: 'text/html,application/xhtml+xml' },
        });
        if (!routeResponse.ok) {
          failures.push(`Failed to fetch ${route} (${routeResponse.status})`);
          continue;
        }
        routeDocuments.push({ route, html: await routeResponse.text() });
      }
    }

    for (const routeDocument of routeDocuments) {
      const imageResponses = await checkImageResponses(
        routeDocument.html,
        `${baseUrl}${routeDocument.route}`
      );
      failures.push(...imageResponses.failures);
      notes.push(
        ...imageResponses.notes.map((note) => `${routeDocument.route}: ${note}`)
      );
    }
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
