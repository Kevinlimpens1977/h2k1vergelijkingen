/**
 * Generate a similar (but different) task when a student gets one wrong.
 * Uses different coefficients and/or variables to provide variety.
 */

import type { TaskData } from '../data/intro8_1_content';

const VARS = ['a', 'b', 'n', 'p', 'x', 'k', 'm'];

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickVar(exclude?: string): string {
    const options = VARS.filter(v => v !== exclude);
    return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate a variant of the given task with different numbers/variables.
 * Falls back to returning the same task if generation isn't possible.
 */
export function generateSimilarTask(original: TaskData): TaskData {
    switch (original.type) {
        case 'INPUT': {
            // Detect pattern from prompt
            const solveMatch = original.prompt.match(/(\d+)([a-z])\s*=\s*(\d+)/);
            if (solveMatch) {
                // Pattern: "5n = 20" → generate similar like "3b = 9"
                const v = pickVar(solveMatch[2]);
                const coeff = randInt(2, 10);
                const answer = randInt(1, 12);
                const rhs = coeff * answer;
                return {
                    type: 'INPUT',
                    prompt: `${coeff}${v} = ${rhs}\nWat is ${v}?`,
                    correctAnswer: `${answer}`,
                    hint: `${rhs} ÷ ${coeff} = ?`,
                };
            }

            const addMatch = original.prompt.match(/(\d+)\s*\+\s*([a-z])\s*=\s*(\d+)/);
            if (addMatch) {
                // Pattern: "2 + n = 10" → generate similar
                const v = pickVar(addMatch[2]);
                const a = randInt(1, 9);
                const total = randInt(a + 2, 20);
                const answer = total - a;
                return {
                    type: 'INPUT',
                    prompt: `${a} + ${v} = ${total}\nWat is ${v}?`,
                    correctAnswer: `${answer}`,
                    hint: `${total} − ${a} = ?`,
                };
            }

            const addRevMatch = original.prompt.match(/([a-z])\s*\+\s*(\d+)\s*=\s*(\d+)/);
            if (addRevMatch) {
                // Pattern: "n + 3 = 9"
                const v = pickVar(addRevMatch[1]);
                const b = randInt(1, 9);
                const total = randInt(b + 2, 20);
                const answer = total - b;
                return {
                    type: 'INPUT',
                    prompt: `${v} + ${b} = ${total}\nWat is ${v}?`,
                    correctAnswer: `${answer}`,
                    hint: `${total} − ${b} = ?`,
                };
            }

            const doubleMatch = original.prompt.match(/([a-z])\s*\+\s*\1\s*=\s*(\d+)/);
            if (doubleMatch) {
                // Pattern: "n + n = 14"
                const v = pickVar(doubleMatch[1]);
                const answer = randInt(2, 12);
                const total = answer * 2;
                return {
                    type: 'INPUT',
                    prompt: `${v} + ${v} = ${total}\nWat is ${v}?`,
                    correctAnswer: `${answer}`,
                    hint: `${v} + ${v} = ${total}, dus ${v} = ${total} ÷ 2`,
                };
            }

            // Fallback: return original
            return original;
        }

        case 'MC': {
            // MC tasks are concept-based, hard to auto-generate meaningfully
            // Return original — the student will see it again with fresh eyes
            return original;
        }

        case 'DRAG_MATCH': {
            // Concept-based, return original
            return original;
        }

        case 'COMBINE_LIKE_TERMS': {
            // Generate similar combine question
            const v1 = pickVar();
            const v2 = pickVar(v1);
            const patterns = [
                () => {
                    // "Xa + Ya = ?" (same variable)
                    const a = randInt(2, 10);
                    const b = randInt(2, 10);
                    return {
                        type: 'COMBINE_LIKE_TERMS' as const,
                        prompt: `${a}${v1} + ${b}${v1} = ?`,
                        cards: [`${a}${v1}`, `+${b}${v1}`],
                        correctAnswer: `${a + b}${v1}`,
                    };
                },
                () => {
                    // "Xa − Ya = ?" (same variable, subtraction)
                    const a = randInt(5, 12);
                    const b = randInt(1, a - 1);
                    return {
                        type: 'COMBINE_LIKE_TERMS' as const,
                        prompt: `${a}${v1} − ${b}${v1} = ?`,
                        cards: [`${a}${v1}`, `−${b}${v1}`],
                        correctAnswer: `${a - b}${v1}`,
                    };
                },
                () => {
                    // "Xa + Yb = ?" (different variables, can't combine)
                    const a = randInt(2, 8);
                    const b = randInt(2, 8);
                    return {
                        type: 'COMBINE_LIKE_TERMS' as const,
                        prompt: `${a}${v1} + ${b}${v2} = ?`,
                        cards: [`${a}${v1}`, `+${b}${v2}`],
                        correctAnswer: `${a}${v1} + ${b}${v2}`,
                        alternativeAnswers: [`${b}${v2} + ${a}${v1}`],
                    };
                },
            ];

            const gen = patterns[Math.floor(Math.random() * patterns.length)];
            return gen();
        }

        default:
            return original;
    }
}
