/** Short enough to feel responsive while still making the cascade legible. */
export const GRID_REVEAL_DURATION = 0.22;

export const GRID_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

/** Barely perceptible vertical settle paired with the image fade. */
export const GRID_REVEAL_OFFSET = 4;

/** Gap between items in the currently visible sequence. */
export const GRID_REVEAL_STAGGER = 0.022;

/** Default reveal group for surfaces that do not provide their own load window. */
export const GRID_REVEAL_SEQUENCE_LENGTH = 6;

export function getGridRevealDelay(
  index: number,
  reduceMotion: boolean | null,
  sequenceLength = GRID_REVEAL_SEQUENCE_LENGTH
): number {
  if (reduceMotion) return 0;
  return (index % sequenceLength) * GRID_REVEAL_STAGGER;
}
