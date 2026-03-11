/**
 * Equation Generator — Levels 1–4
 *
 * Addendum constraints:
 *   L1: x+a=b or x-a=b (1 step)
 *   L2: ax+b=c or ax-b=c (2 steps)
 *   L3: ax+b=dx+c, a>d>0, x∈[1..8], a∈[2..5], (a-d)≤4, intermediates≤30
 *   L4: ax+b=−dx+c, b≥0, c>0, a∈[2..4], d∈[1..3], (a+d)≤6, x∈[1..6]
 */

import type { ArenaLevel } from './arenaConfig';

/* ── Types ───────────────────────────────────────────── */

export interface Operation {
    type: 'add' | 'subtract' | 'multiply' | 'divide';
    value: number;
    /** Display label: e.g. "−5" or "+2x" */
    label: string;
    /** Whether this operates on the variable term (e.g. −2x) */
    isVariable?: boolean;
}

export interface Equation {
    /** Left side: coeff*x + constant */
    leftCoeff: number;
    leftConst: number;
    /** Right side: coeff*x + constant */
    rightCoeff: number;
    rightConst: number;
    variable: string;
}

export interface SolveStep {
    operation: Operation;
    resultEquation: Equation;
    displayLabel: string;
}

export interface GeneratedEquation {
    equation: Equation;
    solution: number;
    level: ArenaLevel;
    solveSteps: SolveStep[];
}

/* ── Display helpers ─────────────────────────────────── */

export function eqToString(eq: Equation): string {
    const left = sideToString(eq.leftCoeff, eq.leftConst, eq.variable);
    const right = sideToString(eq.rightCoeff, eq.rightConst, eq.variable);
    return `${left} = ${right}`;
}

function sideToString(coeff: number, constant: number, v: string): string {
    const parts: string[] = [];
    if (coeff !== 0) {
        parts.push(coeff === 1 ? v : coeff === -1 ? `−${v}` : `${coeff}${v}`);
    }
    if (constant !== 0) {
        if (parts.length > 0) {
            parts.push(constant > 0 ? `+ ${constant}` : `− ${Math.abs(constant)}`);
        } else {
            parts.push(`${constant}`);
        }
    }
    if (parts.length === 0) parts.push('0');
    return parts.join(' ');
}

/* ── Random helpers ──────────────────────────────────── */

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Level 1: x ± a = b (1 step) ────────────────────── */

function generateLevel1(): GeneratedEquation {
    const x = randInt(1, 10);
    const a = randInt(2, 9);
    const isAdd = Math.random() > 0.5;
    const variable = 'x';

    if (isAdd) {
        // x + a = b → step: −a
        const b = x + a;
        const eq: Equation = { leftCoeff: 1, leftConst: a, rightCoeff: 0, rightConst: b, variable };
        return {
            equation: eq,
            solution: x,
            level: 1,
            solveSteps: [{
                operation: { type: 'subtract', value: a, label: `−${a}` },
                resultEquation: { leftCoeff: 1, leftConst: 0, rightCoeff: 0, rightConst: x, variable },
                displayLabel: `−${a} aan beide kanten`,
            }],
        };
    } else {
        // x - a = b → step: +a
        const b = x - a;
        if (b <= 0) return generateLevel1(); // retry if negative
        const eq: Equation = { leftCoeff: 1, leftConst: -a, rightCoeff: 0, rightConst: b, variable };
        return {
            equation: eq,
            solution: x,
            level: 1,
            solveSteps: [{
                operation: { type: 'add', value: a, label: `+${a}` },
                resultEquation: { leftCoeff: 1, leftConst: 0, rightCoeff: 0, rightConst: x, variable },
                displayLabel: `+${a} aan beide kanten`,
            }],
        };
    }
}

/* ── Level 2: ax ± b = c (2 steps) ──────────────────── */

function generateLevel2(): GeneratedEquation {
    const x = randInt(1, 8);
    const a = randInt(2, 5);
    const b = randInt(1, 9);
    const isAdd = Math.random() > 0.5;
    const variable = 'x';

    if (isAdd) {
        // ax + b = c → step 1: −b → step 2: ÷a
        const c = a * x + b;
        if (c > 30) return generateLevel2();
        const eq: Equation = { leftCoeff: a, leftConst: b, rightCoeff: 0, rightConst: c, variable };
        const afterStep1: Equation = { leftCoeff: a, leftConst: 0, rightCoeff: 0, rightConst: a * x, variable };
        const afterStep2: Equation = { leftCoeff: 1, leftConst: 0, rightCoeff: 0, rightConst: x, variable };
        return {
            equation: eq, solution: x, level: 2,
            solveSteps: [
                { operation: { type: 'subtract', value: b, label: `−${b}` }, resultEquation: afterStep1, displayLabel: `−${b} aan beide kanten` },
                { operation: { type: 'divide', value: a, label: `÷${a}` }, resultEquation: afterStep2, displayLabel: `÷${a} aan beide kanten` },
            ],
        };
    } else {
        // ax - b = c → step 1: +b → step 2: ÷a
        const c = a * x - b;
        if (c <= 0) return generateLevel2();
        const eq: Equation = { leftCoeff: a, leftConst: -b, rightCoeff: 0, rightConst: c, variable };
        const afterStep1: Equation = { leftCoeff: a, leftConst: 0, rightCoeff: 0, rightConst: a * x, variable };
        const afterStep2: Equation = { leftCoeff: 1, leftConst: 0, rightCoeff: 0, rightConst: x, variable };
        return {
            equation: eq, solution: x, level: 2,
            solveSteps: [
                { operation: { type: 'add', value: b, label: `+${b}` }, resultEquation: afterStep1, displayLabel: `+${b} aan beide kanten` },
                { operation: { type: 'divide', value: a, label: `÷${a}` }, resultEquation: afterStep2, displayLabel: `÷${a} aan beide kanten` },
            ],
        };
    }
}

/* ── Level 3: ax + b = dx + c, a>d>0 (3 steps) ──────── */

function generateLevel3(): GeneratedEquation {
    const x = randInt(1, 8);
    const a = randInt(2, 5);
    const d = randInt(1, a - 1);
    const diff = a - d;
    if (diff > 4 || diff === 1) return generateLevel3();

    const b = randInt(1, 9);
    const c = diff * x + b;
    if (c > 25 || c <= b || c > 30) return generateLevel3();

    const variable = 'x';
    const eq: Equation = { leftCoeff: a, leftConst: b, rightCoeff: d, rightConst: c, variable };

    // Step 1: −dx → (a-d)x + b = c
    const after1: Equation = { leftCoeff: diff, leftConst: b, rightCoeff: 0, rightConst: c, variable };
    // Step 2: −b → (a-d)x = c - b
    const cMinusB = c - b;
    const after2: Equation = { leftCoeff: diff, leftConst: 0, rightCoeff: 0, rightConst: cMinusB, variable };
    // Step 3: ÷(a-d) → x = solution
    const after3: Equation = { leftCoeff: 1, leftConst: 0, rightCoeff: 0, rightConst: x, variable };

    return {
        equation: eq, solution: x, level: 3,
        solveSteps: [
            { operation: { type: 'subtract', value: d, label: `−${d}x`, isVariable: true }, resultEquation: after1, displayLabel: `−${d}x aan beide kanten` },
            { operation: { type: 'subtract', value: b, label: `−${b}` }, resultEquation: after2, displayLabel: `−${b} aan beide kanten` },
            { operation: { type: 'divide', value: diff, label: `÷${diff}` }, resultEquation: after3, displayLabel: `÷${diff} aan beide kanten` },
        ],
    };
}

/* ── Level 4: ax + b = −dx + c (3 steps) ────────────── */

function generateLevel4(): GeneratedEquation {
    const x = randInt(1, 6);
    const a = randInt(2, 4);
    const d = randInt(1, 3);
    const sum = a + d;
    if (sum > 6) return generateLevel4();

    const b = randInt(0, 8);
    const c = sum * x + b;
    if (c > 25 || c <= 0) return generateLevel4();

    const variable = 'x';
    // Display: ax + b = −dx + c
    const eq: Equation = { leftCoeff: a, leftConst: b, rightCoeff: -d, rightConst: c, variable };

    // Step 1: +dx → (a+d)x + b = c
    const after1: Equation = { leftCoeff: sum, leftConst: b, rightCoeff: 0, rightConst: c, variable };
    // Step 2: −b → (a+d)x = c - b
    const cMinusB = c - b;
    const after2: Equation = { leftCoeff: sum, leftConst: 0, rightCoeff: 0, rightConst: cMinusB, variable };
    // Step 3: ÷(a+d) → x = solution
    const after3: Equation = { leftCoeff: 1, leftConst: 0, rightCoeff: 0, rightConst: x, variable };

    return {
        equation: eq, solution: x, level: 4,
        solveSteps: [
            { operation: { type: 'add', value: d, label: `+${d}x`, isVariable: true }, resultEquation: after1, displayLabel: `+${d}x aan beide kanten` },
            ...(b > 0 ? [{ operation: { type: 'subtract' as const, value: b, label: `−${b}` }, resultEquation: after2, displayLabel: `−${b} aan beide kanten` }] : []),
            { operation: { type: 'divide', value: sum, label: `÷${sum}` }, resultEquation: after3, displayLabel: `÷${sum} aan beide kanten` },
        ],
    };
}

/* ── Public API ──────────────────────────────────────── */

export function generateEquation(level: ArenaLevel): GeneratedEquation {
    switch (level) {
        case 1: return generateLevel1();
        case 2: return generateLevel2();
        case 3: return generateLevel3();
        case 4: return generateLevel4();
    }
}

/* ── Distractor generation ───────────────────────────── */

export function generateButtonOptions(
    currentEquation: Equation,
    correctStep: SolveStep,
): { options: Operation[]; correctIndex: number } {
    const correct = correctStep.operation;
    const distractors: Operation[] = [];

    // 1. Inverse of correct operation
    if (correct.type === 'subtract') {
        distractors.push({ type: 'add', value: correct.value, label: `+${correct.value}${correct.isVariable ? 'x' : ''}`, isVariable: correct.isVariable });
    } else if (correct.type === 'add') {
        distractors.push({ type: 'subtract', value: correct.value, label: `−${correct.value}${correct.isVariable ? 'x' : ''}`, isVariable: correct.isVariable });
    } else if (correct.type === 'divide') {
        distractors.push({ type: 'multiply', value: correct.value, label: `×${correct.value}` });
    } else {
        distractors.push({ type: 'divide', value: correct.value, label: `÷${correct.value}` });
    }

    // 2. Same type, different value from equation
    const eqValues = [
        Math.abs(currentEquation.leftConst),
        Math.abs(currentEquation.rightConst),
        Math.abs(currentEquation.leftCoeff),
        Math.abs(currentEquation.rightCoeff),
    ].filter(v => v > 0 && v !== correct.value);

    if (eqValues.length > 0) {
        const altVal = pick(eqValues);
        const typeLabel = correct.type === 'add' ? '+' : correct.type === 'subtract' ? '−' : correct.type === 'divide' ? '÷' : '×';
        distractors.push({ type: correct.type, value: altVal, label: `${typeLabel}${altVal}` });
    }

    // 3. Different type from equation
    const otherTypes: Array<'add' | 'subtract' | 'divide'> = ['add', 'subtract', 'divide'];
    const unusedType = pick(otherTypes.filter(t => t !== correct.type && !distractors.some(d => d.type === t)));
    if (unusedType) {
        const val = pick(eqValues.length > 0 ? eqValues : [correct.value]);
        const typeLabel = unusedType === 'add' ? '+' : unusedType === 'subtract' ? '−' : '÷';
        distractors.push({ type: unusedType, value: val, label: `${typeLabel}${val}` });
    }

    // Ensure we have exactly 3 distractors
    while (distractors.length < 3) {
        const val = randInt(1, 9);
        distractors.push({ type: 'subtract', value: val, label: `−${val}` });
    }

    // Shuffle into 4 positions
    const options = [correct, ...distractors.slice(0, 3)];
    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.indexOf(correct);
    return { options, correctIndex };
}
