/**
 * Answer Validator — orchestrates validation per mode.
 *
 * Wraps mathValidator.ts and adds step-equivalence checking.
 */
import { safeEval, matchAnswer } from '../../../utils/mathValidator';
import { normalizeNotation, stripVariable } from './notationNormalizer';
import { isSolutionMatch, isValidStep } from './stepEquivalence';
import type { Equation } from './equationEngine';
import { eqToString } from './equationEngine';

export type ValidationMode = 'strict-guided' | 'semi-open' | 'open-practice';

export type ValidationReason =
    | 'exact_match'
    | 'numeric_equivalent'
    | 'algebraic_equivalent'
    | 'step_equivalent'
    | 'chained_correct'
    | 'button_match'
    | 'direct_solution'
    | 'wrong_value'
    | 'wrong_step';

export interface ValidationResult {
    isCorrect: boolean;
    reason: ValidationReason;
    normalizedInput: string;
    confidence: 'certain' | 'high' | 'low';
}

export interface ValidationContext {
    mode: ValidationMode;
    currentEquation: Equation;
    expectedResult?: Equation;
    expectedAnswer?: string;
    solutionValue: number;
    variable: string;
}

/**
 * Validate a student's answer in the given context.
 */
export function validateAnswer(
    rawInput: string,
    ctx: ValidationContext,
): ValidationResult {
    const input = normalizeNotation(rawInput);
    const norm = input.normalized;

    // ① Button-based (strict-guided): should not use this function
    // (buttons are compared by ID in the component)

    // ② Exact match against expected answer string
    if (ctx.expectedAnswer) {
        const expectedNorm = normalizeNotation(ctx.expectedAnswer).normalized;
        if (norm === expectedNorm) {
            return ok('exact_match', norm);
        }

        // Use mathValidator's matchAnswer for flexible comparison
        if (matchAnswer(rawInput, ctx.expectedAnswer)) {
            return ok('algebraic_equivalent', norm);
        }
    }

    // ③ Check if student gave the final solution directly
    if (isSolutionMatch(rawInput, ctx.solutionValue, ctx.variable)) {
        return ok('direct_solution', norm);
    }

    // ④ Check if the expected answer is a number and evaluate  
    if (ctx.expectedAnswer) {
        const expectedVal = safeEval(ctx.expectedAnswer);
        const studentVal = safeEval(rawInput);
        if (expectedVal !== null && studentVal !== null) {
            if (Math.abs(studentVal - expectedVal) < 0.001) {
                return ok('numeric_equivalent', norm);
            }
        }
    }

    // ⑤ Chain equation check (e.g. "2x+5-5=2x=8")
    if (input.isChain && ctx.expectedAnswer) {
        const expectedVal = safeEval(ctx.expectedAnswer);
        if (expectedVal !== null) {
            const allMatch = input.segments.every(seg => {
                const val = safeEval(seg);
                return val !== null && Math.abs(val - expectedVal) < 0.001;
            });
            if (allMatch) return ok('chained_correct', norm);
        }
    }

    // ⑥ Check if student wrote a valid equation step
    if (ctx.expectedResult && input.isEquation) {
        const stepResult = isValidStep(rawInput, ctx.currentEquation, ctx.solutionValue, ctx.variable);
        if (stepResult.equivalent && stepResult.validAlternativeStep) {
            return ok('step_equivalent', norm);
        }
    }

    // ⑦ Check expected result as equation string
    if (ctx.expectedResult) {
        const expectedStr = eqToString(ctx.expectedResult);
        if (matchAnswer(rawInput, expectedStr)) {
            return ok('algebraic_equivalent', norm);
        }
        // Also try stripped (without variable assignment)
        const stripped = stripVariable(rawInput, ctx.variable);
        const expectedStripped = stripVariable(expectedStr, ctx.variable);
        if (stripped === expectedStripped) {
            return ok('exact_match', norm);
        }
    }

    // ❌ Nothing matched
    return {
        isCorrect: false,
        reason: input.isEquation ? 'wrong_step' : 'wrong_value',
        normalizedInput: norm,
        confidence: 'certain',
    };
}

function ok(reason: ValidationReason, normalizedInput: string): ValidationResult {
    return { isCorrect: true, reason, normalizedInput, confidence: 'certain' };
}
