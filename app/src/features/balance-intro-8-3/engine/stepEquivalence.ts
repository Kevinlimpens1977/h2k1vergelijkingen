/**
 * Step Equivalence — checks whether two algebra steps are equivalent.
 */
import type { Equation } from './equationEngine';
import { evalExpr } from './equationEngine';

export interface StepEquivalenceResult {
    equivalent: boolean;
    validAlternativeStep: boolean;
    reason: string;
}

/**
 * Check if the student's answer (a number) matches the expected solution.
 */
export function isSolutionMatch(
    studentAnswer: string,
    solution: number,
    variable: string,
): boolean {
    // Strip "x =" prefix if present
    const stripped = studentAnswer
        .replace(/\s+/g, '')
        .toLowerCase()
        .replace(new RegExp(`^${variable}=`), '')
        .replace(new RegExp(`=${variable}$`), '');

    const parsed = parseFloat(stripped);
    if (isNaN(parsed)) return false;
    return Math.abs(parsed - solution) < 0.001;
}

/**
 * Check if two equations are equivalent (both sides evaluate to same values).
 * We test with the known solution value.
 */
export function equationsEquivalent(a: Equation, b: Equation, xValue: number): boolean {
    const aLeft = evalExpr(a.left, xValue);
    const aRight = evalExpr(a.right, xValue);
    const bLeft = evalExpr(b.left, xValue);
    const bRight = evalExpr(b.right, xValue);

    // Both equations must be balanced at xValue
    if (Math.abs(aLeft - aRight) > 0.001) return false;
    if (Math.abs(bLeft - bRight) > 0.001) return false;

    // The equations represent the same constraint
    return true;
}

/**
 * Check if a student's equation string represents a valid step
 * from the current equation toward the solution.
 *
 * A valid step means: the equation is still true (balanced) for the solution value,
 * AND it has fewer terms / is simpler than the current equation.
 */
export function isValidStep(
    studentEquationStr: string,
    currentEquation: Equation,
    solution: number,
    variable: string,
): StepEquivalenceResult {
    // Try to parse "ax + b = cx + d" or "ax + b = c" etc.
    const parsed = parseSimpleEquation(studentEquationStr, variable);
    if (!parsed) {
        return { equivalent: false, validAlternativeStep: false, reason: 'Could not parse equation' };
    }

    // Check if it's balanced at the solution
    const leftVal = evalExpr(parsed.left, solution);
    const rightVal = evalExpr(parsed.right, solution);

    if (Math.abs(leftVal - rightVal) > 0.001) {
        return { equivalent: false, validAlternativeStep: false, reason: 'Equation not balanced at solution' };
    }

    // It's a valid transformation if balanced
    // Check if it's "simpler" (fewer non-zero terms)
    const currentComplexity = termCount(currentEquation);
    const newComplexity = termCount(parsed);

    return {
        equivalent: true,
        validAlternativeStep: newComplexity <= currentComplexity,
        reason: newComplexity < currentComplexity ? 'Simpler equation' : 'Equivalent equation',
    };
}

function termCount(eq: Equation): number {
    let count = 0;
    if (eq.left.coeff !== 0) count++;
    if (eq.left.constant !== 0) count++;
    if (eq.right.coeff !== 0) count++;
    if (eq.right.constant !== 0) count++;
    return count;
}

/**
 * Parse a simple equation string like "2x + 5 = 13" into an Equation.
 */
export function parseSimpleEquation(str: string, variable: string): Equation | null {
    const norm = str.replace(/\s+/g, '').toLowerCase();
    const parts = norm.split('=');
    if (parts.length !== 2) return null;

    const left = parseSide(parts[0], variable);
    const right = parseSide(parts[1], variable);
    if (!left || !right) return null;

    return { left, right, variable };
}

function parseSide(s: string, variable: string): { coeff: number; constant: number } | null {
    if (!s) return null;

    let coeff = 0;
    let constant = 0;

    // Match terms: optional sign, optional digits, optional variable
    const v = variable.toLowerCase();
    const regex = new RegExp(`([+-]?)(\\d*)(${v})?`, 'g');
    let match: RegExpExecArray | null;
    let consumed = 0;

    while ((match = regex.exec(s)) !== null) {
        if (match[0] === '') {
            regex.lastIndex++;
            if (regex.lastIndex > s.length) break;
            continue;
        }

        const sign = match[1] === '-' ? -1 : 1;
        const digits = match[2];
        const hasVar = !!match[3];

        if (!digits && !hasVar) return null;

        if (hasVar) {
            coeff += digits ? parseInt(digits, 10) * sign : sign;
        } else if (digits) {
            constant += parseInt(digits, 10) * sign;
        }

        consumed += match[0].length;
    }

    if (consumed < s.length) return null;

    return { coeff, constant };
}
