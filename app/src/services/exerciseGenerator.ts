/**
 * Exercise generator for §8.1
 *
 * Visible exercise types (in sessions):
 *   A) MC_TERMS      — "Welke termen staan er in <expression>?" (multiple choice)
 *   B) CAN_COMBINE   — "Kun je deze termen samenvoegen?" (YN + optional simplify)
 *
 * Internal helpers (not shown in sessions directly):
 *   - SIMPLIFY_LIKE_TERMS patterns for generating CAN_COMBINE step-2
 *   - LIKE_TERMS_YN logic for CAN_COMBINE step-1
 *
 * Route-based difficulty:
 *   O (Ondersteunend) — easier, mostly positive, 8 MC + 2 combine
 *   D (Doorlopend)    — balanced, 5 MC + 5 combine
 *   U (Uitdagend)     — harder, 2 MC + 8 combine
 */

import type { RouteChoice } from './progress';

/* ── types ───────────────────────────────────────────── */

export type ExerciseType = 'MC_TERMS' | 'CAN_COMBINE';

export interface Exercise {
    id: string;
    prompt: string;
    correctAnswer: string;
    exerciseType: ExerciseType;
    paragraphId: '8_1';
    /** MC_TERMS: 4 options (one correct). */
    mcOptions?: string[];
    /** CAN_COMBINE: whether the two terms can actually be combined. */
    canCombine?: boolean;
    /** CAN_COMBINE step-2: the simplified result if canCombine === true. */
    combinedAnswer?: string;
}

/* ── difficulty config per route ─────────────────────── */

interface DifficultyConfig {
    coeffMin: number;
    coeffMax: number;
    constMin: number;
    constMax: number;
    /** Number of MC_TERMS questions in a 10-question session. */
    mcCount: number;
}

const DIFFICULTY: Record<string, DifficultyConfig> = {
    O: { coeffMin: 1, coeffMax: 6, constMin: 1, constMax: 10, mcCount: 16 },
    D: { coeffMin: -9, coeffMax: 9, constMin: -20, constMax: 20, mcCount: 10 },
    U: { coeffMin: -15, coeffMax: 15, constMin: -30, constMax: 30, mcCount: 4 },
};

function getDifficulty(route: RouteChoice): DifficultyConfig {
    if (route && DIFFICULTY[route]) return DIFFICULTY[route];
    return DIFFICULTY['D'];
}

/* ── helpers ──────────────────────────────────────────── */

function randCoeff(min: number, max: number): number {
    let n = 0;
    while (n === 0) {
        n = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return n;
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randVar(): string {
    const vars = ['a', 'b', 'n', 'p', 'x', 'y'];
    return vars[Math.floor(Math.random() * vars.length)];
}

function randVarExcept(exclude: string): string {
    const vars = ['a', 'b', 'n', 'p', 'x', 'y'].filter((v) => v !== exclude);
    return vars[Math.floor(Math.random() * vars.length)];
}

function formatTerm(coeff: number, variable: string): string {
    if (coeff === 1) return variable;
    if (coeff === -1) return `-${variable}`;
    return `${coeff}${variable}`;
}

function formatSignedTerm(coeff: number, variable: string): string {
    if (coeff >= 0) return ` + ${formatTerm(coeff, variable)}`;
    return ` - ${formatTerm(Math.abs(coeff), variable)}`;
}

function formatSignedConst(c: number): string {
    if (c >= 0) return ` + ${c}`;
    return ` - ${Math.abs(c)}`;
}

export function buildAnswer(coeffSum: number, variable: string, constant: number | null): string {
    const parts: string[] = [];
    if (coeffSum !== 0) parts.push(formatTerm(coeffSum, variable));
    if (constant !== null && constant !== 0) {
        if (parts.length === 0) {
            parts.push(`${constant}`);
        } else {
            parts.push(constant > 0 ? `+ ${constant}` : `- ${Math.abs(constant)}`);
        }
    }
    if (parts.length === 0) return '0';
    return parts.join(' ');
}

let _counter = 0;
function makeId(): string {
    _counter++;
    return `ex_8_1_${Date.now()}_${_counter}`;
}

/** Shuffle array in-place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ══════════════════════════════════════════════════════
   MC_TERMS generator
   "Welke termen staan er in: <expression> ?"
   ══════════════════════════════════════════════════════ */

interface TermInfo {
    text: string;   // how it appears in the expression (e.g., "2t", "-7a", "5")
    isVar: boolean;
    variable?: string;
    coeff?: number;
}

/**
 * Generate a random expression composed of 2-4 terms and return
 * the expression string plus the list of terms.
 */
function generateExpression(cfg: DifficultyConfig): { expr: string; terms: TermInfo[] } {
    const termCount = Math.random() < 0.5 ? 2 : 3;
    const terms: TermInfo[] = [];

    // Generate terms
    for (let i = 0; i < termCount; i++) {
        const useVar = i === 0 || Math.random() < 0.7; // at least first is variable
        if (useVar) {
            const v = i === 0 ? randVar() : (Math.random() < 0.5 ? terms[0].variable! : randVarExcept(terms[0].variable || 'x'));
            const c = randCoeff(cfg.coeffMin || 1, cfg.coeffMax || 9);
            terms.push({ text: formatTerm(c, v), isVar: true, variable: v, coeff: c });
        } else {
            const c = randInt(Math.abs(cfg.constMin) || 1, Math.abs(cfg.constMax) || 20);
            const val = cfg.coeffMin < 0 && Math.random() < 0.3 ? -c : c;
            terms.push({ text: `${val}`, isVar: false, coeff: val });
        }
    }

    // Build expression string
    let expr = terms[0].text;
    for (let i = 1; i < terms.length; i++) {
        const t = terms[i];
        if (t.isVar) {
            expr += formatSignedTerm(t.coeff!, t.variable!);
        } else {
            expr += formatSignedConst(t.coeff!);
        }
    }

    return { expr, terms };
}

/**
 * Format the list of terms as the correct answer string.
 * e.g., ["2t", "-7a", "5"] -> "2t, -7a en 5"
 */
function formatTermList(terms: TermInfo[]): string {
    if (terms.length === 1) return terms[0].text;
    if (terms.length === 2) return `${terms[0].text} en ${terms[1].text}`;
    const head = terms.slice(0, -1).map((t) => t.text).join(', ');
    return `${head} en ${terms[terms.length - 1].text}`;
}

/**
 * Generate plausible wrong answers for MC_TERMS.
 */
function generateMCDistractors(terms: TermInfo[], cfg: DifficultyConfig): string[] {
    const distractors: Set<string> = new Set();
    const correct = formatTermList(terms);

    // Strategy 1: Split coefficients from variables ("2 en t" instead of "2t")
    if (terms.some((t) => t.isVar && t.coeff !== undefined && Math.abs(t.coeff) > 1)) {
        const split = terms.map((t) => {
            if (t.isVar && t.coeff !== undefined && Math.abs(t.coeff) > 1) {
                return `${t.coeff} en ${t.variable}`;
            }
            return t.text;
        });
        const d = split.join(', ');
        if (d !== correct) distractors.add(d);
    }

    // Strategy 2: Already simplified (combine like terms if any)
    const varGroups: Record<string, number> = {};
    let constSum = 0;
    for (const t of terms) {
        if (t.isVar && t.variable) {
            varGroups[t.variable] = (varGroups[t.variable] || 0) + (t.coeff || 0);
        } else {
            constSum += t.coeff || 0;
        }
    }
    const simplified: string[] = [];
    for (const [v, c] of Object.entries(varGroups)) {
        if (c !== 0) simplified.push(formatTerm(c, v));
    }
    if (constSum !== 0) simplified.push(`${constSum}`);
    if (simplified.length > 0 && simplified.length < terms.length) {
        const d = simplified.length === 1 ? simplified[0] : simplified.slice(0, -1).join(', ') + ' en ' + simplified[simplified.length - 1];
        if (d !== correct) distractors.add(d);
    }

    // Strategy 3: Missing a term
    if (terms.length >= 3) {
        const missing = [...terms];
        missing.splice(Math.floor(Math.random() * missing.length), 1);
        const d = formatTermList(missing);
        if (d !== correct) distractors.add(d);
    }

    // Strategy 4: Random wrong term list
    while (distractors.size < 3) {
        const fakeTerms: TermInfo[] = [];
        const count = randInt(2, 4);
        for (let i = 0; i < count; i++) {
            if (Math.random() < 0.6) {
                const v = randVar();
                const c = randCoeff(cfg.coeffMin || 1, cfg.coeffMax || 6);
                fakeTerms.push({ text: formatTerm(c, v), isVar: true, variable: v, coeff: c });
            } else {
                const c = randInt(1, 20);
                fakeTerms.push({ text: `${c}`, isVar: false, coeff: c });
            }
        }
        const d = formatTermList(fakeTerms);
        if (d !== correct) distractors.add(d);
    }

    return [...distractors].slice(0, 3);
}

function generateMCTerms(cfg: DifficultyConfig): Exercise {
    const { expr, terms } = generateExpression(cfg);
    const correct = formatTermList(terms);
    const distractors = generateMCDistractors(terms, cfg);

    const options = shuffle([correct, ...distractors]);

    return {
        id: makeId(),
        prompt: expr,
        correctAnswer: correct,
        exerciseType: 'MC_TERMS',
        paragraphId: '8_1',
        mcOptions: options,
    };
}

/* ══════════════════════════════════════════════════════
   CAN_COMBINE generator
   "Kun je deze termen samenvoegen: <term1> en <term2> ?"
   Step 1: ja/nee
   Step 2 (if ja): "Wat wordt het samen?" -> input
   ══════════════════════════════════════════════════════ */

function generateCanCombine(cfg: DifficultyConfig): Exercise {
    const canCombine = Math.random() < 0.5;
    const v1 = randVar();
    const c1 = randCoeff(cfg.coeffMin || 1, cfg.coeffMax || 9);
    const c2 = randCoeff(cfg.coeffMin || 1, cfg.coeffMax || 9);

    if (canCombine) {
        // Same variable — can combine
        const prompt = `${formatTerm(c1, v1)}  en  ${formatTerm(c2, v1)}`;
        const sum = c1 + c2;
        const combined = sum === 0 ? '0' : formatTerm(sum, v1);
        return {
            id: makeId(),
            prompt,
            correctAnswer: 'ja',
            exerciseType: 'CAN_COMBINE',
            paragraphId: '8_1',
            canCombine: true,
            combinedAnswer: combined,
        };
    } else {
        // Different — cannot combine
        if (Math.random() < 0.5) {
            // Different variable
            const v2 = randVarExcept(v1);
            const prompt = `${formatTerm(c1, v1)}  en  ${formatTerm(c2, v2)}`;
            return {
                id: makeId(),
                prompt,
                correctAnswer: 'nee',
                exerciseType: 'CAN_COMBINE',
                paragraphId: '8_1',
                canCombine: false,
            };
        } else {
            // Variable vs constant
            const constVal = randInt(Math.abs(cfg.constMin) || 1, Math.abs(cfg.constMax) || 20);
            const prompt = `${formatTerm(c1, v1)}  en  ${constVal}`;
            return {
                id: makeId(),
                prompt,
                correctAnswer: 'nee',
                exerciseType: 'CAN_COMBINE',
                paragraphId: '8_1',
                canCombine: false,
            };
        }
    }
}

/* ── normalizer ──────────────────────────────────────── */

export function normalizeAnswer(raw: string): string {
    let s = raw.trim();
    s = s.replace(/\s+/g, '');
    s = s.replace(/\*/g, '');
    if (s.startsWith('+')) s = s.slice(1);

    const varMatch = s.match(/^([+-]?\d*)(([a-z]))(.*)$/);
    if (varMatch) {
        const coeffStr = varMatch[1];
        const variable = varMatch[3];
        const rest = varMatch[4];

        let coeff: number;
        if (coeffStr === '' || coeffStr === '+') coeff = 1;
        else if (coeffStr === '-') coeff = -1;
        else coeff = parseInt(coeffStr, 10);

        let constant = 0;
        if (rest) {
            const constMatch = rest.match(/^([+-]\d+)$/);
            if (constMatch) {
                constant = parseInt(constMatch[1], 10);
            } else {
                return s;
            }
        }
        return buildAnswer(coeff, variable, constant === 0 ? null : constant);
    }

    const numMatch = s.match(/^([+-]?\d+)$/);
    if (numMatch) {
        return `${parseInt(numMatch[1], 10)}`;
    }

    return s;
}

/* ── error tagging ───────────────────────────────────── */

export type ErrorTag =
    | 'SIGN_ERROR'
    | 'ARITHMETIC_ERROR'
    | 'FORMAT_ERROR'
    | 'LIKE_TERMS_MISMATCH'
    | 'LIKE_TERMS_CONFUSION'
    | 'MC_WRONG_CHOICE';

/**
 * Detect error tags for simplify-style answers (CAN_COMBINE step 2).
 */
export function detectErrorTags(studentRaw: string, correctAnswer: string): ErrorTag[] {
    const tags: ErrorTag[] = [];
    const normalized = normalizeAnswer(studentRaw);
    const correctNorm = normalizeAnswer(correctAnswer);

    if (normalized === studentRaw.replace(/\s+/g, '').replace(/\*/g, '')) {
        if (!/^[+-]?\d*[a-z]?([+-]\d+)?$/.test(normalized) && !/^[+-]?\d+$/.test(normalized)) {
            tags.push('FORMAT_ERROR');
            return tags;
        }
    }

    const studentParts = parseAnswer(normalized);
    const correctParts = parseAnswer(correctNorm);

    if (!studentParts || !correctParts) {
        tags.push('FORMAT_ERROR');
        return tags;
    }

    if (studentParts.variable && correctParts.variable && studentParts.variable !== correctParts.variable) {
        tags.push('LIKE_TERMS_MISMATCH');
    }

    if (studentParts.coeff === -correctParts.coeff && correctParts.coeff !== 0) {
        tags.push('SIGN_ERROR');
    } else if (studentParts.constant === -correctParts.constant && correctParts.constant !== 0) {
        tags.push('SIGN_ERROR');
    }

    if (
        studentParts.variable === correctParts.variable &&
        studentParts.coeff !== correctParts.coeff &&
        !tags.includes('SIGN_ERROR')
    ) {
        tags.push('ARITHMETIC_ERROR');
    }

    if (studentParts.constant !== correctParts.constant && !tags.includes('SIGN_ERROR')) {
        if (!tags.includes('ARITHMETIC_ERROR')) tags.push('ARITHMETIC_ERROR');
    }

    if (tags.length === 0 && normalized !== correctNorm) {
        tags.push('ARITHMETIC_ERROR');
    }

    return tags;
}

/** Error tag for wrong YN in CAN_COMBINE step 1. */
export function detectYNErrorTags(studentAnswer: string, correctAnswer: string): ErrorTag[] {
    if (studentAnswer !== correctAnswer) return ['LIKE_TERMS_CONFUSION'];
    return [];
}

/** Error tag for wrong MC choice. */
export function detectMCErrorTags(): ErrorTag[] {
    return ['MC_WRONG_CHOICE'];
}

interface ParsedAnswer {
    coeff: number;
    variable: string | null;
    constant: number;
}

function parseAnswer(s: string): ParsedAnswer | null {
    const varConstMatch = s.match(/^([+-]?\d*?)([a-z])([+-]\d+)?$/);
    if (varConstMatch) {
        const coeffStr = varConstMatch[1];
        const variable = varConstMatch[2];
        const constStr = varConstMatch[3] || '0';
        let coeff: number;
        if (coeffStr === '' || coeffStr === '+') coeff = 1;
        else if (coeffStr === '-') coeff = -1;
        else coeff = parseInt(coeffStr, 10);
        return { coeff, variable, constant: parseInt(constStr, 10) };
    }
    const numMatch = s.match(/^([+-]?\d+)$/);
    if (numMatch) return { coeff: 0, variable: null, constant: parseInt(numMatch[1], 10) };
    return null;
}

/* ── hint generator ──────────────────────────────────── */

export function getHint(tags: ErrorTag[]): string {
    if (tags.includes('FORMAT_ERROR')) {
        return 'Schrijf je antwoord in de vorm "5x" of "3a + 2". Gebruik geen haakjes.';
    }
    if (tags.includes('LIKE_TERMS_MISMATCH')) {
        return 'Let op: je kunt alleen gelijksoortige termen optellen (dezelfde letter).';
    }
    if (tags.includes('LIKE_TERMS_CONFUSION')) {
        return 'Gelijksoortige termen hebben dezelfde letter. Een getal zonder letter is niet gelijksoortig aan een term met letter.';
    }
    if (tags.includes('SIGN_ERROR')) {
        return 'Kijk nog eens goed naar de plus- en mintekens.';
    }
    if (tags.includes('ARITHMETIC_ERROR')) {
        return 'Tel de getallen nog eens goed op. Controleer je rekenwerk.';
    }
    return 'Probeer het nog eens!';
}

/* ── session generator ───────────────────────────────── */

/**
 * Generate a session of 10 exercises for §8.1.
 * Mix based on route:
 *   O: 8x MC_TERMS + 2x CAN_COMBINE
 *   D: 5x MC_TERMS + 5x CAN_COMBINE
 *   U: 2x MC_TERMS + 8x CAN_COMBINE
 */
export function generateSession(route: RouteChoice = 'D'): Exercise[] {
    const cfg = getDifficulty(route);
    const exercises: Exercise[] = [];
    const seenPrompts = new Set<string>();

    const total = 20;
    const combineCount = total - cfg.mcCount;

    // Build an interleaved schedule
    const schedule: ExerciseType[] = [];
    if (combineCount > 0 && cfg.mcCount > 0) {
        // Interleave: place combine exercises evenly among MC
        const interval = Math.max(1, Math.floor(total / combineCount));
        let combinePlaced = 0;
        for (let i = 0; i < total; i++) {
            if (combinePlaced < combineCount && (i + 1) % interval === 0) {
                schedule.push('CAN_COMBINE');
                combinePlaced++;
            } else {
                schedule.push('MC_TERMS');
            }
        }
        // Fill/trim to exactly 10
        while (schedule.length < total) schedule.push('MC_TERMS');
        while (schedule.length > total) schedule.pop();
        // Ensure correct counts
        let mcPlaced = schedule.filter((t) => t === 'MC_TERMS').length;
        let ccPlaced = schedule.filter((t) => t === 'CAN_COMBINE').length;
        // Fix if counts are off
        for (let i = schedule.length - 1; i >= 0 && mcPlaced > cfg.mcCount; i--) {
            if (schedule[i] === 'MC_TERMS') {
                schedule[i] = 'CAN_COMBINE';
                mcPlaced--;
                ccPlaced++;
            }
        }
        for (let i = schedule.length - 1; i >= 0 && ccPlaced > combineCount; i--) {
            if (schedule[i] === 'CAN_COMBINE') {
                schedule[i] = 'MC_TERMS';
                ccPlaced--;
                mcPlaced++;
            }
        }
    } else if (combineCount === 0) {
        for (let i = 0; i < total; i++) schedule.push('MC_TERMS');
    } else {
        for (let i = 0; i < total; i++) schedule.push('CAN_COMBINE');
    }

    for (const type of schedule) {
        let attempts = 0;
        let ex: Exercise;
        do {
            ex = type === 'CAN_COMBINE' ? generateCanCombine(cfg) : generateMCTerms(cfg);
            attempts++;
        } while (seenPrompts.has(ex.prompt) && attempts < 20);

        seenPrompts.add(ex.prompt);
        exercises.push(ex);
    }

    return exercises;
}
