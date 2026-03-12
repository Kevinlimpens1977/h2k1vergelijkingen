/**
 * Operation Matcher — recognises free-text descriptions of balance operations.
 *
 * Students can type things like:
 *   "-4"  "−4"  "min 4"  "vier eraf"  "beide kanten -4"
 *   "+3"  "plus 3"  "drie erbij"  "tel 3 op"
 *   "/2"  "÷2"  "delen door 2"  "gedeeld door twee"
 *
 * All must map to the expected operation { type, value } for the current step.
 */

import type { OperationType } from './equationEngine';

/* ── Dutch number words ──────────────────────────────── */

const DUTCH_NUMS: Record<string, number> = {
    nul: 0, een: 1, één: 1, twee: 2, drie: 3, vier: 4,
    vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10,
    elf: 11, twaalf: 12, dertien: 13, veertien: 14, vijftien: 15,
    zestien: 16, zeventien: 17, achttien: 18, negentien: 19, twintig: 20,
};

function extractNumber(text: string): number | null {
    // Try pure digits first
    const digitMatch = text.match(/(\d+)/);
    if (digitMatch) return parseInt(digitMatch[1], 10);

    // Try Dutch words
    const lower = text.toLowerCase();
    for (const [word, num] of Object.entries(DUTCH_NUMS)) {
        if (lower.includes(word)) return num;
    }
    return null;
}

/* ── Operation type detection ────────────────────────── */

interface DetectedOperation {
    type: OperationType;
    value: number;
}

/**
 * Try to match a free-text student answer to a balance operation.
 *
 * Returns { type, value } if matched, or null if not parseable as an operation.
 */
export function matchOperation(input: string): DetectedOperation | null {
    const raw = input.trim();
    if (!raw) return null;

    // Normalize common symbols
    const s = raw
        .replace(/−/g, '-')    // em dash to hyphen
        .replace(/–/g, '-')    // en dash to hyphen
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/·/g, '*')
        .replace(/:/g, '/')
        .toLowerCase();

    // ── Pattern 1: Pure symbol + number  ("-4", "+3", "/2", "*5") ──
    const symbolMatch = s.match(/^\s*([+\-*/])\s*(\d+)\s*$/);
    if (symbolMatch) {
        const val = parseInt(symbolMatch[2], 10);
        if (val > 0) {
            return { type: symbolToType(symbolMatch[1]), value: val };
        }
    }

    // ── Pattern 2: "beide kanten -4", "aan beide kanten +3" ──
    const beidMatch = s.match(/beide\s*kanten?\s*([+\-*/])\s*(\d+)/);
    if (beidMatch) {
        const val = parseInt(beidMatch[2], 10);
        if (val > 0) return { type: symbolToType(beidMatch[1]), value: val };
    }

    // ── Pattern 3: Dutch subtract phrases ──
    // "min 4", "4 eraf", "vier eraf", "trek 4 af", "4 aftrekken", "min vier"
    // "4 eraf halen", "er 4 af", "minus 4"
    if (matchesAny(s, ['eraf', 'aftrekken', 'trek', 'min', 'minus', 'er af', 'haal af', 'af trekken'])) {
        const num = extractNumber(s);
        if (num !== null && num > 0) return { type: 'subtract', value: num };
    }

    // ── Pattern 4: Dutch add phrases ──
    // "plus 3", "3 erbij", "drie erbij", "tel 3 op", "optellen met 3", "er 3 bij"
    if (matchesAny(s, ['erbij', 'plus', 'optellen', 'tel', 'er bij', 'bij tellen', 'bijtellen'])) {
        const num = extractNumber(s);
        if (num !== null && num > 0) return { type: 'add', value: num };
    }

    // ── Pattern 5: Dutch divide phrases ──
    // "delen door 2", "gedeeld door twee", "deel door 2", "/2"
    if (matchesAny(s, ['delen', 'gedeeld', 'deel door', 'door'])) {
        const num = extractNumber(s);
        if (num !== null && num > 1) return { type: 'divide', value: num };
    }

    // ── Pattern 6: Dutch multiply phrases ──
    // "keer 3", "vermenigvuldig met 3", "maal 3"
    if (matchesAny(s, ['keer', 'maal', 'vermenigvuldig'])) {
        const num = extractNumber(s);
        if (num !== null && num > 1) return { type: 'multiply', value: num };
    }

    return null;
}

/**
 * Check if a student's operation description matches the expected operation.
 */
export function operationMatches(
    input: string,
    expectedType: OperationType,
    expectedValue: number,
): boolean {
    const detected = matchOperation(input);
    if (!detected) return false;
    return detected.type === expectedType && detected.value === expectedValue;
}

/* ── Helpers ─────────────────────────────────────────── */

function symbolToType(sym: string): OperationType {
    switch (sym) {
        case '+': return 'add';
        case '-': return 'subtract';
        case '*': return 'multiply';
        case '/': return 'divide';
        default: return 'add';
    }
}

function matchesAny(text: string, keywords: string[]): boolean {
    return keywords.some((kw) => text.includes(kw));
}
