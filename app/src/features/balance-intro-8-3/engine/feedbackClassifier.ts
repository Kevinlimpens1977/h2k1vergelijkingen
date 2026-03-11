/**
 * Feedback Classifier — determines student-facing feedback from validation result.
 *
 * Core rule: NEVER mention notation differences in feedback.
 */
import type { ValidationResult, ValidationReason } from './answerValidator';

export type FeedbackType =
    | 'correct'
    | 'correct_alt_path'
    | 'wrong_value'
    | 'wrong_step';

export interface ClassifiedFeedback {
    type: FeedbackType;
    message: string;
    showExpected: boolean;
    expectedDisplay?: string;
}

const CORRECT_MESSAGES = [
    'Goed! 🎉',
    'Klopt! ✅',
    'Helemaal goed! 👏',
    'Top! 💪',
];

function randomCorrect(): string {
    return CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
}

export function classifyFeedback(
    result: ValidationResult,
    expectedDisplay?: string,
): ClassifiedFeedback {
    if (result.isCorrect) {
        if (result.reason === 'step_equivalent') {
            return {
                type: 'correct_alt_path',
                message: `${randomCorrect()} Dat kan ook!`,
                showExpected: !!expectedDisplay,
                expectedDisplay: expectedDisplay ? `De verwachte stap was: ${expectedDisplay}` : undefined,
            };
        }
        if (result.reason === 'direct_solution') {
            return {
                type: 'correct',
                message: 'Goed! Je hebt het direct opgelost! 🚀',
                showExpected: false,
            };
        }
        return {
            type: 'correct',
            message: randomCorrect(),
            showExpected: false,
        };
    }

    // Wrong
    const fb = WRONG_FEEDBACK[result.reason] ?? WRONG_FEEDBACK['wrong_value'];
    return {
        type: fb.type,
        message: fb.message,
        showExpected: false,
    };
}

const WRONG_FEEDBACK: Record<ValidationReason, { type: FeedbackType; message: string }> = {
    exact_match: { type: 'correct', message: '' },
    numeric_equivalent: { type: 'correct', message: '' },
    algebraic_equivalent: { type: 'correct', message: '' },
    step_equivalent: { type: 'correct', message: '' },
    chained_correct: { type: 'correct', message: '' },
    button_match: { type: 'correct', message: '' },
    direct_solution: { type: 'correct', message: '' },
    wrong_value: {
        type: 'wrong_value',
        message: 'Dat klopt niet. Probeer het opnieuw!',
    },
    wrong_step: {
        type: 'wrong_step',
        message: 'Dit klopt wiskundig, maar het helpt niet om x te vinden.',
    },
};
