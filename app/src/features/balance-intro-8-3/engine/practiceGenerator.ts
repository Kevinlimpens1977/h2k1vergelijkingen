/**
 * Practice Generator — random equations for practice mode.
 *
 * Level 1: x + a = b          (1 step)
 * Level 2: ax + b = c         (2 steps)
 * Level 3: ax − b = c         (2 steps)
 *
 * All solutions are positive integers.
 */
import type { Equation, Operation } from './equationEngine';
import { opLabel } from './equationEngine';

interface PracticeEquation {
    equation: Equation;
    solution: number;
    level: 1 | 2 | 3;
    steps: { operation: Operation; result: Equation }[];
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePractice(level?: 1 | 2 | 3): PracticeEquation {
    const lv = level ?? (randInt(1, 3) as 1 | 2 | 3);

    switch (lv) {
        case 1: {
            // x + a = b  →  x = b - a
            const x = randInt(1, 10);
            const a = randInt(2, 9);
            const b = x + a;
            return {
                equation: {
                    left: { coeff: 1, constant: a },
                    right: { coeff: 0, constant: b },
                    variable: 'x',
                },
                solution: x,
                level: 1,
                steps: [
                    {
                        operation: { type: 'subtract', value: a, label: opLabel('subtract', a) },
                        result: {
                            left: { coeff: 1, constant: 0 },
                            right: { coeff: 0, constant: x },
                            variable: 'x',
                        },
                    },
                ],
            };
        }
        case 2: {
            // ax + b = c  →  ax = c - b  →  x = (c-b)/a
            const x = randInt(1, 8);
            const a = randInt(2, 5);
            const b = randInt(1, 9);
            const c = a * x + b;
            return {
                equation: {
                    left: { coeff: a, constant: b },
                    right: { coeff: 0, constant: c },
                    variable: 'x',
                },
                solution: x,
                level: 2,
                steps: [
                    {
                        operation: { type: 'subtract', value: b, label: opLabel('subtract', b) },
                        result: {
                            left: { coeff: a, constant: 0 },
                            right: { coeff: 0, constant: a * x },
                            variable: 'x',
                        },
                    },
                    {
                        operation: { type: 'divide', value: a, label: opLabel('divide', a) },
                        result: {
                            left: { coeff: 1, constant: 0 },
                            right: { coeff: 0, constant: x },
                            variable: 'x',
                        },
                    },
                ],
            };
        }
        case 3: {
            // ax - b = c  →  ax = c + b  →  x = (c+b)/a
            const x = randInt(1, 8);
            const a = randInt(2, 6);
            const b = randInt(1, 9);
            const c = a * x - b;
            // Ensure c > 0
            if (c <= 0) return generatePractice(3);
            return {
                equation: {
                    left: { coeff: a, constant: -b },
                    right: { coeff: 0, constant: c },
                    variable: 'x',
                },
                solution: x,
                level: 3,
                steps: [
                    {
                        operation: { type: 'add', value: b, label: opLabel('add', b) },
                        result: {
                            left: { coeff: a, constant: 0 },
                            right: { coeff: 0, constant: a * x },
                            variable: 'x',
                        },
                    },
                    {
                        operation: { type: 'divide', value: a, label: opLabel('divide', a) },
                        result: {
                            left: { coeff: 1, constant: 0 },
                            right: { coeff: 0, constant: x },
                            variable: 'x',
                        },
                    },
                ],
            };
        }
    }
}

export type { PracticeEquation };
