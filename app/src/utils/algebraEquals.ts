/**
 * Commutative algebra comparison utility.
 *
 * Parses simple algebraic expressions into sorted term lists
 * so that "4b+2a" equals "2a+4b" regardless of order.
 *
 * Handles: coefficients, variables, constants, +/- signs, spaces.
 */

interface Term {
    coeff: number;
    variable: string; // '' for constants
}

/**
 * Parse an expression like "4b + 2a - 3" into sorted terms.
 * Returns null if parsing fails (fallback to string comparison).
 */
function parseTerms(expr: string): Term[] | null {
    // Remove all spaces
    const s = expr.replace(/\s+/g, '');
    if (!s) return null;

    const terms: Term[] = [];

    // Match terms: optional sign, optional digits, optional letter(s)
    // Examples: 4b, +2a, -3, a, -b, 12, +7x
    const regex = /([+-]?)(\d*)([a-z]?)/g;
    let match: RegExpExecArray | null;
    let consumed = 0;

    while ((match = regex.exec(s)) !== null) {
        // Skip empty matches
        if (match[0] === '') {
            regex.lastIndex++;
            if (regex.lastIndex > s.length) break;
            continue;
        }

        const sign = match[1] === '-' ? -1 : 1;
        const digits = match[2];
        const variable = match[3] || '';

        // Must have at least digits or variable
        if (!digits && !variable) {
            // Unknown char — can't parse
            return null;
        }

        let coeff: number;
        if (variable) {
            // e.g. "a" → 1a, "4b" → 4b, "-b" → -1b
            coeff = digits ? parseInt(digits, 10) * sign : sign;
        } else {
            // Pure number, e.g. "3", "-7"
            coeff = parseInt(digits, 10) * sign;
        }

        terms.push({ coeff, variable });
        consumed += match[0].length;
    }

    // Verify we consumed the entire string
    if (consumed < s.length) return null;
    if (terms.length === 0) return null;

    return terms;
}

/**
 * Normalize terms: combine like terms, sort by variable, remove zeros.
 */
function normalizeTerms(terms: Term[]): Term[] {
    const map = new Map<string, number>();
    for (const t of terms) {
        map.set(t.variable, (map.get(t.variable) ?? 0) + t.coeff);
    }

    const result: Term[] = [];
    for (const [variable, coeff] of map) {
        if (coeff !== 0) {
            result.push({ coeff, variable });
        }
    }

    // Sort: variables alphabetically, constants last
    result.sort((a, b) => {
        if (a.variable === '' && b.variable !== '') return 1;
        if (a.variable !== '' && b.variable === '') return -1;
        return a.variable.localeCompare(b.variable);
    });

    return result;
}

/**
 * Compare two algebraic expressions for mathematical equivalence.
 * "4b+2a" === "2a+4b" → true
 * "8a" === "8a" → true
 * "3" === "3" → true
 * Falls back to stripped string comparison if parsing fails.
 */
export function algebraEquals(a: string, b: string): boolean {
    // Quick string check first (most common case)
    const stripA = a.replace(/\s+/g, '').toLowerCase();
    const stripB = b.replace(/\s+/g, '').toLowerCase();
    if (stripA === stripB) return true;

    // Try algebraic comparison
    const termsA = parseTerms(a.toLowerCase());
    const termsB = parseTerms(b.toLowerCase());

    if (!termsA || !termsB) return false;

    const normA = normalizeTerms(termsA);
    const normB = normalizeTerms(termsB);

    if (normA.length !== normB.length) return false;

    return normA.every((t, i) =>
        t.coeff === normB[i].coeff && t.variable === normB[i].variable
    );
}
