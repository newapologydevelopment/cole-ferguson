export const ratios = {
    '16:10': [16, 10],
    '5:4': [5, 4],
    '4:5': [4, 5],
    '3:2': [3, 2],
    '2:3': [2, 3],
    '1:1': [1, 1],
} as const;

type RatioKey = keyof typeof ratios;
type Breakpoints = 'xl' | 'desktop' | 'tablet' | 'mobile';

export const imageWidths: Record<Breakpoints, Partial<Record<RatioKey, number>>> = {
    xl: {
        '16:10': 1440, // 1440×899
        '5:4': 1226,   // 1226×980
        '4:5': 797,    // 797×997
        '3:2': 1440,   // 1440×960
        '2:3': 1197,   // 1197×798
        '1:1': 1012,   // 1012×1012
    },
    desktop: {
        '16:10': 956,  // 956×596.84
        '5:4': 956,    // 956×764.8 (пропорційно)
        '4:5': 748,    // 748×935
        '3:2': 956,    // 956×637.33
        '2:3': 672,    // 672×448
        '1:1': 702,    // 702×702
    },
    tablet: {
        '16:10': 748,  // 748×466.98
        '5:4': 748,    // 748×597.91
        '4:5': 748,    // 748×935
        '3:2': 748,    // 748×498.67
        '2:3': 548,    // 548×822
        '1:1': 548,    // 548×548
    },
    mobile: {
        '16:10': 353,  // 353×220.38
        '5:4': 353,    // 353×282.17
        '4:5': 353,    // 353×441.25
        '3:2': 353,    // 353×235.33
        '2:3': 529.5,  // 529.5×353
        '1:1': 353,    // 353×353
    },
};

export const twoViewWidths: Record<Breakpoints, Partial<Record<RatioKey, number>>> = {
    xl: {
        '4:5': 689,  // 689 × 861
        '5:4': 797,  // 797 × 638.58
        '3:2': 797,  // 797 × 531
    },
    desktop: {
        '4:5': 384,  // 384 × 479
        '5:4': 448,  // 448 × 358.95
        '3:2': 448,  // 448 × 298
    },
    tablet: {
        '4:5': 348,  // 348 × 435
        '5:4': 448,  // 448 × 358.95
        '3:2': 448,  // 448 × 298
    },
    mobile: {
        '4:5': 166,  // 166 × 207.5
        '5:4': 166,  // 166 × 133
        '3:2': 166,  // 166 × 110.67
    },
};

export const threeViewWidths: Record<Breakpoints, Partial<Record<RatioKey, number>>> = {
    xl: {
        '4:5': 511.98, // 511.98 × 639.97
        '3:2': 511.78, // 511.78 × 340.85
        '5:4': 511,    // 511 × 409
    },
    desktop: {
        '4:5': 279.08, // 279.08 × 348.86
        '3:2': 279,    // 279 × 186
        '5:4': 279,    // 279 × 222
    },
    tablet: {
        '4:5': 282.06, // 282.06 × 352.57
        '3:2': 282.38, // 282.38 × 188.25
        '5:4': 281.35, // 281.35 × 224.27
    },
    mobile: {
        '4:5': 105.25, // 105.25 × 131.56
        '3:2': 105.37, // 105.37 × 70.25
        '5:4': 104.99, // 104.99 × 83.69
    },
};

export function getAspectLabel(w: number, h: number): RatioKey | 'custom' {
    const r = w / h;
    const entries = Object.entries(ratios) as [RatioKey, readonly [number, number]][];
    let best: { k: RatioKey, diff: number } | null = null;
    for (const [k, [a, b]] of entries) {
        const diff = Math.abs(r - a / b);
        if (!best || diff < best.diff) best = { k, diff };
    }
    return best && best.diff <= 0.06 ? best.k : 'custom';
}

export function boxStyle(ratio: RatioKey, bp: Breakpoints): React.CSSProperties {
    const w = imageWidths[bp]?.[ratio];
    const [a, b] = ratios[ratio];
    return {
        width: w ? `${w}px` : '100%',
        aspectRatio: `${a} / ${b}`,
    };
}