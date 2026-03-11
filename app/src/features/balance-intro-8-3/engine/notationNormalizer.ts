/**
 * Notation Normalizer — input cleanup and symbol mapping.
 *
 * Converts student notation to a canonical form:
 * - x, X, ·, × → * (between digits)
 * - Whitespace removed
 * - : → / (Dutch division)
 * - Comma decimal → dot decimal
 */

export interface NormalizedInput {
    raw: string;
    normalized: string;
    isEquation: boolean;
    isChain: boolean;
    segments: string[];
}

/**
 * Normalize raw student input into a canonical math string.
 */
export function normalizeNotation(raw: string): NormalizedInput {
    let s = raw.trim();

    // Replace middle-dot and × with *
    s = s.replace(/·/g, '*');
    s = s.replace(/×/g, '*');

    // Replace : (Dutch division) with /
    s = s.replace(/\s*:\s*/g, '/');

    // Replace ÷ with /
    s = s.replace(/÷/g, '/');

    // Replace x/X between digits with * (multiplication, not variable)
    s = s.replace(/(\d)[xX](\d)/g, '$1*$2');

    // Replace comma decimal with dot
    s = s.replace(/(\d),(\d)/g, '$1.$2');

    // Remove all whitespace
    const normalized = s.replace(/\s+/g, '').toLowerCase();

    // Check for equation / chain
    const eqParts = normalized.split('=').filter(p => p.length > 0);
    const isEquation = eqParts.length >= 2;
    const isChain = eqParts.length >= 3;

    return {
        raw,
        normalized,
        isEquation,
        isChain,
        segments: eqParts,
    };
}

/**
 * Strip variable name from an equation answer.
 * "x = 4" → "4", "x=4" → "4", "4" → "4"
 */
export function stripVariable(input: string, variable: string): string {
    const norm = input.replace(/\s+/g, '').toLowerCase();
    const v = variable.toLowerCase();

    // Pattern: "x=4" or "4=x"
    if (norm.startsWith(`${v}=`)) return norm.slice(v.length + 1);
    if (norm.endsWith(`=${v}`)) return norm.slice(0, -(v.length + 1));

    return norm;
}
