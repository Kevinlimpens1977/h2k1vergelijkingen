/**
 * Exercise generator for §8.2 — BALANCE_STEPS_TUTOR
 *
 * Step-by-step guided solving of equations: n·var + c = d
 * Each question has 2 MC steps:
 *   Step 1: "What do you remove on both sides?" (the constant)
 *   Step 2: "How do you isolate the variable?"  (divide by n)
 *
 * Route-based difficulty:
 *   O: n ∈ {2..6}, a ∈ {1..10}, c ∈ {0..20}, d positive
 *   D: n ∈ {2..9}, a ∈ {-10..10}\{0}, c ∈ {-20..20}
 *   U: n ∈ {2..12}, a ∈ {-15..15}\{0}, c ∈ {-30..30}
 */

import type { RouteChoice } from './progress';

/* ── types ───────────────────────────────────────────── */

export type ExerciseType8_2 = 'BALANCE_STEPS_TUTOR';

export interface MCOption {
    label: string;   // "A", "B", "C", "D"
    text: string;    // the option text
    isCorrect: boolean;
}

export interface Exercise8_2 {
    id: string;
    /** The full equation, e.g. "3a + 2 = 17" */
    prompt: string;
    /** The correct final answer as string, e.g. "5" */
    correctAnswer: string;
    exerciseType: ExerciseType8_2;
    paragraphId: '8_2';

    /* internal equation parts */
    _n: number;
    _c: number;
    _d: number;
    _var: string;
    _solution: number;

    /* Step 1: remove constant */
    step1Question: string;
    step1Options: MCOption[];
    /** Equation after step 1: "3a = 15" */
    intermediateEq: string;
    /** Description of correct action for step 1 */
    step1CorrectAction: string;

    /* Step 2: isolate variable */
    step2Question: string;
    step2Options: MCOption[];
    /** Final result: "a = 5" */
    finalEq: string;
    /** Description of correct action for step 2 */
    step2CorrectAction: string;

    /** Substitution check line */
    checkLine: string;
}

/* ── difficulty ──────────────────────────────────────── */

interface DifficultyConfig {
    nMin: number;
    nMax: number;
    solMin: number;
    solMax: number;
    cMin: number;
    cMax: number;
    allowNeg: boolean;
}

const DIFFICULTY: Record<string, DifficultyConfig> = {
    O: { nMin: 2, nMax: 6, solMin: 1, solMax: 10, cMin: 0, cMax: 20, allowNeg: false },
    D: { nMin: 2, nMax: 9, solMin: -10, solMax: 10, cMin: -20, cMax: 20, allowNeg: true },
    U: { nMin: 2, nMax: 12, solMin: -15, solMax: 15, cMin: -30, cMax: 30, allowNeg: true },
};

function getDifficulty(route: RouteChoice): DifficultyConfig {
    if (route && DIFFICULTY[route]) return DIFFICULTY[route];
    return DIFFICULTY['D'];
}

/* ── helpers ──────────────────────────────────────────── */

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randIntNonZero(min: number, max: number): number {
    let n = 0;
    while (n === 0) n = randInt(min, max);
    return n;
}

function randVar(): string {
    const vars = ['a', 'b', 'n', 'p', 'x', 'y'];
    return vars[Math.floor(Math.random() * vars.length)];
}

function formatCoeff(n: number, v: string): string {
    if (n === 1) return v;
    if (n === -1) return `-${v}`;
    return `${n}${v}`;
}

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let _counter = 0;
function makeId(): string {
    _counter++;
    return `ex_8_2_${Date.now()}_${_counter}`;
}

/* ── equation generator ─────────────────────────────── */

function generateEquation(cfg: DifficultyConfig): Exercise8_2 {
    const v = randVar();
    const n = randInt(cfg.nMin, cfg.nMax);
    const sol = cfg.allowNeg ? randIntNonZero(cfg.solMin, cfg.solMax) : randInt(cfg.solMin, cfg.solMax);
    let c = randInt(cfg.cMin, cfg.cMax);
    const d = n * sol + c;

    // Ensure d is within -80..80
    if (d < -80 || d > 80) {
        c = randInt(0, 10); // fallback to simpler
        // recalc: can't change sol/n, so just accept
    }
    const dFinal = n * sol + c;

    // Build prompt: "3a + 2 = 17" or "3a - 5 = 10" or "3a = 15"
    let lhs: string;
    if (c === 0) {
        lhs = formatCoeff(n, v);
    } else if (c > 0) {
        lhs = `${formatCoeff(n, v)} + ${c}`;
    } else {
        lhs = `${formatCoeff(n, v)} - ${Math.abs(c)}`;
    }
    const prompt = `${lhs} = ${dFinal}`;

    // Intermediate equation after removing c: n*v = d - c
    const dMinusC = dFinal - c;
    const intermediateEq = `${formatCoeff(n, v)} = ${dMinusC}`;

    // Final equation
    const finalEq = `${v} = ${sol}`;

    // Check line
    const lhsCheck = n * sol + c;
    const checkLine = c !== 0
        ? `Controle: ${formatCoeff(n, v)} met ${v}=${sol} → ${n}·${sol} + ${c > 0 ? c : `(${c})`} = ${lhsCheck} = ${dFinal} ✓`
        : `Controle: ${formatCoeff(n, v)} met ${v}=${sol} → ${n}·${sol} = ${lhsCheck} = ${dFinal} ✓`;

    // ─── Step 1 MC options ──────────────────────────────
    const step1Question = c === 0
        ? `Stap 1: Er staat al ${formatCoeff(n, v)} = ${dFinal}. Wat is de volgende stap?`
        : `Stap 1: Houd de balans in evenwicht. Wat haal je links én rechts weg?`;

    let step1Options: MCOption[];

    if (c === 0) {
        // Special case: no constant to remove, go straight to divide
        step1Options = shuffle([
            { label: 'A', text: `Delen door ${n} aan beide kanten`, isCorrect: true },
            { label: 'B', text: `${n} aftrekken aan beide kanten`, isCorrect: false },
            { label: 'C', text: `Vermenigvuldigen met ${n}`, isCorrect: false },
            { label: 'D', text: 'Niets, het antwoord staat er al', isCorrect: false },
        ]);
    } else if (c > 0) {
        step1Options = shuffle([
            { label: 'A', text: `${c} aftrekken aan beide kanten (−${c})`, isCorrect: true },
            { label: 'B', text: `${formatCoeff(n, v)} weghalen aan beide kanten`, isCorrect: false },
            { label: 'C', text: `${c} erbij optellen aan beide kanten (+${c})`, isCorrect: false },
            { label: 'D', text: `Alleen links ${c} weghalen`, isCorrect: false },
        ]);
    } else {
        // c is negative: displayed as "- |c|", so you add |c| to both sides
        const absC = Math.abs(c);
        step1Options = shuffle([
            { label: 'A', text: `${absC} optellen aan beide kanten (+${absC})`, isCorrect: true },
            { label: 'B', text: `${formatCoeff(n, v)} weghalen aan beide kanten`, isCorrect: false },
            { label: 'C', text: `${absC} aftrekken aan beide kanten (−${absC})`, isCorrect: false },
            { label: 'D', text: `Alleen links ${absC} optellen`, isCorrect: false },
        ]);
    }

    // Re-label A-D after shuffle
    step1Options.forEach((opt, i) => { opt.label = ['A', 'B', 'C', 'D'][i]; });

    const step1CorrectAction = c === 0
        ? `Er is geen los getal om weg te halen. Je kunt meteen delen door ${n}.`
        : c > 0
            ? `Trek ${c} af aan beide kanten: ${lhs} → ${intermediateEq}`
            : `Tel ${Math.abs(c)} op aan beide kanten: ${lhs} → ${intermediateEq}`;

    // ─── Step 2 MC options ──────────────────────────────
    const step2Question = `Stap 2: Er staat ${intermediateEq}. Hoe krijg je 1·${v}?`;

    let step2Options: MCOption[] = shuffle([
        { label: 'A', text: `Delen door ${n} aan beide kanten (÷${n})`, isCorrect: true },
        { label: 'B', text: `${n} aftrekken aan beide kanten`, isCorrect: false },
        { label: 'C', text: `Vermenigvuldigen met ${n} aan beide kanten`, isCorrect: false },
        { label: 'D', text: 'Niets, het antwoord staat er al', isCorrect: false },
    ]);
    step2Options.forEach((opt, i) => { opt.label = ['A', 'B', 'C', 'D'][i]; });

    const step2CorrectAction = `Deel beide kanten door ${n}: ${dMinusC} ÷ ${n} = ${sol} → ${finalEq}`;

    return {
        id: makeId(),
        prompt,
        correctAnswer: `${sol}`,
        exerciseType: 'BALANCE_STEPS_TUTOR',
        paragraphId: '8_2',
        _n: n,
        _c: c,
        _d: dFinal,
        _var: v,
        _solution: sol,
        step1Question,
        step1Options,
        intermediateEq,
        step1CorrectAction,
        step2Question,
        step2Options,
        finalEq,
        step2CorrectAction,
        checkLine,
    };
}

/* ── session generator ──────────────────────────────── */

export function generateSession8_2(route: RouteChoice = 'D'): Exercise8_2[] {
    const cfg = getDifficulty(route);
    const exercises: Exercise8_2[] = [];
    const seenPrompts = new Set<string>();

    for (let i = 0; i < 20; i++) {
        let attempts = 0;
        let ex: Exercise8_2;
        do {
            ex = generateEquation(cfg);
            attempts++;
        } while (seenPrompts.has(ex.prompt) && attempts < 30);

        seenPrompts.add(ex.prompt);
        exercises.push(ex);
    }

    return exercises;
}
