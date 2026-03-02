/**
 * §8.1 Intro "Termen Quest" — 6 levels of introductory tasks.
 * Each level has 2–4 tasks of mixed types.
 */

export type TaskType = 'INPUT' | 'MC' | 'DRAG_MATCH' | 'COMBINE_LIKE_TERMS';

export interface InputTaskData {
    type: 'INPUT';
    prompt: string;
    correctAnswer: string;
    hint?: string;
}

export interface MCTaskData {
    type: 'MC';
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export interface DragMatchTaskData {
    type: 'DRAG_MATCH';
    prompt: string;
    choices: string[];
    correctChoice: string;
    explanation?: string;
}

export interface CombineLikeTermsTaskData {
    type: 'COMBINE_LIKE_TERMS';
    prompt: string;
    cards: string[];
    correctAnswer: string;
    alternativeAnswers?: string[];
}

export type TaskData = InputTaskData | MCTaskData | DragMatchTaskData | CombineLikeTermsTaskData;

export interface Level {
    id: number;
    title: string;
    tasks: TaskData[];
}

export const INTRO_LEVELS: Level[] = [
    {
        id: 0,
        title: 'Wat is n?',
        tasks: [
            {
                type: 'INPUT',
                prompt: '2 + n = 10\nWat is n?',
                correctAnswer: '8',
                hint: '10 − 2 = ?',
            },
            {
                type: 'INPUT',
                prompt: 'n + 3 = 9\nWat is n?',
                correctAnswer: '6',
                hint: '9 − 3 = ?',
            },
        ],
    },
    {
        id: 1,
        title: 'Dubbel n',
        tasks: [
            {
                type: 'INPUT',
                prompt: 'n + n + 10 = 20\nWat is n?',
                correctAnswer: '5',
                hint: 'Eerst 10 wegdenken: n + n = 10. Dan: n = ?',
            },
            {
                type: 'INPUT',
                prompt: 'n + n = 14\nWat is n?',
                correctAnswer: '7',
                hint: 'n + n = 14, dus n = 14 ÷ 2',
            },
        ],
    },
    {
        id: 2,
        title: 'Van n+n naar 2×n',
        tasks: [
            {
                type: 'DRAG_MATCH',
                prompt: 'n + n is hetzelfde als…',
                choices: ['2×n', 'n²', 'n−n', 'n+2'],
                correctChoice: '2×n',
                explanation: 'n + n is twee keer n, dus 2×n.',
            },
            {
                type: 'MC',
                prompt: 'Je mag × weglaten: 2×n is hetzelfde als…',
                options: ['2n', 'n2', 'n+n+n'],
                correctIndex: 0,
                explanation: '2×n schrijf je korter als 2n.',
            },
        ],
    },
    {
        id: 3,
        title: 'Notatie check',
        tasks: [
            {
                type: 'MC',
                prompt: '2×n = 2n\nKlopt dit?',
                options: ['Ja', 'Nee'],
                correctIndex: 0,
                explanation: 'Klopt! 2×n schrijf je als 2n.',
            },
            {
                type: 'MC',
                prompt: 'n + n = n²\nKlopt dit?',
                options: ['Ja', 'Nee'],
                correctIndex: 1,
                explanation: 'Nee! n² = n × n, maar n + n = 2n.',
            },
            {
                type: 'MC',
                prompt: '3n = n + n + n\nKlopt dit?',
                options: ['Ja', 'Nee'],
                correctIndex: 0,
                explanation: 'Klopt! 3n = 3 × n = n + n + n.',
            },
            {
                type: 'MC',
                prompt: '10 + n = 10n\nKlopt dit?',
                options: ['Ja', 'Nee'],
                correctIndex: 1,
                explanation: 'Nee! 10n = 10 × n, maar 10 + n is gewoon optellen.',
            },
        ],
    },
    {
        id: 4,
        title: 'Gelijke termen samenvoegen',
        tasks: [
            {
                type: 'COMBINE_LIKE_TERMS',
                prompt: '10a − 2a = ?',
                cards: ['10a', '−2a'],
                correctAnswer: '8a',
            },
            {
                type: 'COMBINE_LIKE_TERMS',
                prompt: '3a + 5a = ?',
                cards: ['3a', '+5a'],
                correctAnswer: '8a',
            },
            {
                type: 'COMBINE_LIKE_TERMS',
                prompt: '4b + 2a = ?',
                cards: ['4b', '+2a'],
                correctAnswer: '4b + 2a',
                alternativeAnswers: ['2a + 4b'],
            },
            {
                type: 'COMBINE_LIKE_TERMS',
                prompt: '7n − 7n = ?',
                cards: ['7n', '−7n'],
                correctAnswer: '0',
            },
        ],
    },
    {
        id: 5,
        title: 'a alleen krijgen',
        tasks: [
            {
                type: 'MC',
                prompt: '8a = 8\nWat doe je om a te vinden?',
                options: ['+8', '÷8', '×8'],
                correctIndex: 1,
                explanation: 'Je deelt door 8: a = 8 ÷ 8 = 1.',
            },
            {
                type: 'INPUT',
                prompt: '8a = 8\nWat is a?',
                correctAnswer: '1',
                hint: '8 ÷ 8 = ?',
            },
            {
                type: 'INPUT',
                prompt: '5n = 20\nWat is n?',
                correctAnswer: '4',
                hint: '20 ÷ 5 = ?',
            },
            {
                type: 'INPUT',
                prompt: '2n = 18\nWat is n?',
                correctAnswer: '9',
                hint: '18 ÷ 2 = ?',
            },
        ],
    },
];
