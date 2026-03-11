/**
 * Guided Examples — 3 predefined worked examples with decreasing scaffolding.
 */
import type { Equation, Operation } from '../engine/equationEngine';
import { opLabel } from '../engine/equationEngine';

export type ExamplePhase = 'example1' | 'example2' | 'example3';

export interface GuidedStep {
    prompt: string;
    correctOperation: Operation;
    wrongOptions: Operation[];
    resultEquation: Equation;
    narration?: string;
    hintText?: string;
    /** In semi-open mode: student types the result equation */
    requireTypedResult?: boolean;
}

export interface GuidedExample {
    id: ExamplePhase;
    title: string;
    equation: Equation;
    solution: number;
    steps: GuidedStep[];
    introText: string;
}

export const GUIDED_EXAMPLES: GuidedExample[] = [
    // ─── Example 1: x + 3 = 7  (1 step, full scaffolding) ───
    {
        id: 'example1',
        title: 'Voorbeeld 1',
        equation: {
            left: { coeff: 1, constant: 3 },
            right: { coeff: 0, constant: 7 },
            variable: 'x',
        },
        solution: 4,
        introText:
            'We gaan een vergelijking oplossen met een balans.\n\n' +
            'Stel je voor: links op de balans ligt een onbekend gewicht (x) en 3 kilo.\n' +
            'Rechts ligt 7 kilo. De balans staat in evenwicht!\n\n' +
            'Doel: ontdek hoeveel x weegt.',
        steps: [
            {
                prompt: 'Wat moeten we weghalen om x alleen te krijgen?',
                correctOperation: {
                    type: 'subtract',
                    value: 3,
                    label: opLabel('subtract', 3),
                },
                wrongOptions: [
                    { type: 'add', value: 3, label: opLabel('add', 3) },
                    { type: 'subtract', value: 7, label: opLabel('subtract', 7) },
                    { type: 'divide', value: 3, label: opLabel('divide', 3) },
                ],
                resultEquation: {
                    left: { coeff: 1, constant: 0 },
                    right: { coeff: 0, constant: 4 },
                    variable: 'x',
                },
                narration:
                    'We halen 3 weg aan beide kanten van de balans.\n' +
                    'Links: x + 3 − 3 = x\n' +
                    'Rechts: 7 − 3 = 4\n\n' +
                    'Dus x = 4! ✅',
                hintText: 'Tip: de +3 moet weg. Hoe maak je +3 ongedaan?',
            },
        ],
    },

    // ─── Example 2: 2x + 5 = 13  (2 steps, semi-open) ───
    {
        id: 'example2',
        title: 'Voorbeeld 2',
        equation: {
            left: { coeff: 2, constant: 5 },
            right: { coeff: 0, constant: 13 },
            variable: 'x',
        },
        solution: 4,
        introText:
            'Nu een vergelijking met een getal vóór de x.\n\n' +
            'Links: twee keer het onbekende gewicht (2x) plus 5 kilo.\n' +
            'Rechts: 13 kilo.\n\n' +
            'We moeten twee stappen doen om x te vinden!',
        steps: [
            {
                prompt: 'Stap 1: Hoe krijg je de +5 weg?',
                correctOperation: {
                    type: 'subtract',
                    value: 5,
                    label: opLabel('subtract', 5),
                },
                wrongOptions: [
                    { type: 'add', value: 5, label: opLabel('add', 5) },
                    { type: 'divide', value: 2, label: opLabel('divide', 2) },
                    { type: 'subtract', value: 13, label: opLabel('subtract', 13) },
                ],
                resultEquation: {
                    left: { coeff: 2, constant: 0 },
                    right: { coeff: 0, constant: 8 },
                    variable: 'x',
                },
                narration:
                    'We halen 5 weg aan beide kanten.\n' +
                    '2x + 5 − 5 = 13 − 5\n' +
                    '2x = 8',
                hintText: 'Tip: welk getal staat er bij de x? Dat moet weg.',
                requireTypedResult: true,
            },
            {
                prompt: 'Stap 2: Hoe vind je x als je 2x = 8 hebt?',
                correctOperation: {
                    type: 'divide',
                    value: 2,
                    label: opLabel('divide', 2),
                },
                wrongOptions: [
                    { type: 'subtract', value: 2, label: opLabel('subtract', 2) },
                    { type: 'multiply', value: 2, label: opLabel('multiply', 2) },
                    { type: 'divide', value: 8, label: opLabel('divide', 8) },
                ],
                resultEquation: {
                    left: { coeff: 1, constant: 0 },
                    right: { coeff: 0, constant: 4 },
                    variable: 'x',
                },
                narration:
                    'We delen beide kanten door 2.\n' +
                    '2x ÷ 2 = 8 ÷ 2\n' +
                    'x = 4 ✅',
                hintText: 'Tip: je hebt 2x. Hoe krijg je 1x?',
                requireTypedResult: true,
            },
        ],
    },

    // ─── Example 3: 3x - 4 = 11  (2 steps, light scaffolding) ───
    {
        id: 'example3',
        title: 'Voorbeeld 3',
        equation: {
            left: { coeff: 3, constant: -4 },
            right: { coeff: 0, constant: 11 },
            variable: 'x',
        },
        solution: 5,
        introText:
            'Nu een vergelijking met een minteken!\n\n' +
            'Links: drie keer x minus 4.\n' +
            'Rechts: 11.\n\n' +
            'Let op: er staat −4, dus we moeten optellen om het weg te krijgen.',
        steps: [
            {
                prompt: 'Stap 1: Hoe krijg je de −4 weg?',
                correctOperation: {
                    type: 'add',
                    value: 4,
                    label: opLabel('add', 4),
                },
                wrongOptions: [
                    { type: 'subtract', value: 4, label: opLabel('subtract', 4) },
                    { type: 'divide', value: 3, label: opLabel('divide', 3) },
                ],
                resultEquation: {
                    left: { coeff: 3, constant: 0 },
                    right: { coeff: 0, constant: 15 },
                    variable: 'x',
                },
                hintText: 'Tip: het tegenovergestelde van −4 is +4.',
                requireTypedResult: true,
            },
            {
                prompt: 'Stap 2: Hoe vind je x als je 3x = 15 hebt?',
                correctOperation: {
                    type: 'divide',
                    value: 3,
                    label: opLabel('divide', 3),
                },
                wrongOptions: [
                    { type: 'subtract', value: 3, label: opLabel('subtract', 3) },
                    { type: 'multiply', value: 3, label: opLabel('multiply', 3) },
                ],
                resultEquation: {
                    left: { coeff: 1, constant: 0 },
                    right: { coeff: 0, constant: 5 },
                    variable: 'x',
                },
                hintText: 'Tip: je hebt 3x. Deel door 3 om 1x te krijgen.',
                requireTypedResult: true,
            },
        ],
    },
];
