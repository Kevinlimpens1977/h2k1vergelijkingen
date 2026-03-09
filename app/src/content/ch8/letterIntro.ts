/**
 * Letterrekenen Intro — Content Bank
 *
 * 3 stages, 25 questions total (+ 1 mapping card in Stage C).
 * All questions are INPUT type (single numeric answer).
 *
 * Stage A: Emoji value puzzles (5)
 * Stage B: Two-line system puzzles (5)
 * Stage C: From emoji to letters (15 + 1 mapping card)
 */

export type StageId = 'A' | 'B' | 'C';

export interface LetterIntroQuestion {
    id: string;
    stage: StageId;
    /** Display lines (each line rendered separately) */
    prompt: string[];
    /** The question / what to solve */
    question: string;
    /** Correct numeric answer */
    correctAnswer: number;
    /** Explanation shown on correct */
    explanationCorrect: string;
    /** Hint shown on wrong */
    explanationWrong: string;
    /** If true, this is an info card (no input, just a "Volgende" button) */
    isInfoCard?: boolean;
}

/* ── STAGE A — Emoji Value Puzzles ────────────────────── */

const STAGE_A: LetterIntroQuestion[] = [
    {
        id: 'A1',
        stage: 'A',
        prompt: ['🍒 + 🍒 = 10'],
        question: '🍒 = ?',
        correctAnswer: 5,
        explanationCorrect: 'Goed! Twee keer dezelfde waarde is 10, dus 🍒 = 10 ÷ 2 = 5',
        explanationWrong: 'Bijna… Tip: twee dezelfde = 10, dus deel door 2.',
    },
    {
        id: 'A2',
        stage: 'A',
        prompt: ['🍋 + 🍋 = 8'],
        question: '🍋 = ?',
        correctAnswer: 4,
        explanationCorrect: 'Goed! 🍋 + 🍋 = 8, dus 🍋 = 8 ÷ 2 = 4',
        explanationWrong: 'Bijna… Tip: 🍋 + 🍋 = 8 → deel door 2.',
    },
    {
        id: 'A3',
        stage: 'A',
        prompt: ['🍪 + 🍪 = 12'],
        question: '🍪 = ?',
        correctAnswer: 6,
        explanationCorrect: 'Goed! 🍪 = 12 ÷ 2 = 6',
        explanationWrong: 'Bijna… Tip: 12 gedeeld door 2 geeft de waarde van 🍪.',
    },
    {
        id: 'A4',
        stage: 'A',
        prompt: ['⭐ + ⭐ = 14'],
        question: '⭐ = ?',
        correctAnswer: 7,
        explanationCorrect: 'Goed! ⭐ = 14 ÷ 2 = 7',
        explanationWrong: 'Bijna… Tip: 14 delen door 2 = ?',
    },
    {
        id: 'A5',
        stage: 'A',
        prompt: ['⚽ + ⚽ = 18'],
        question: '⚽ = ?',
        correctAnswer: 9,
        explanationCorrect: 'Goed! ⚽ = 18 ÷ 2 = 9',
        explanationWrong: 'Bijna… Tip: 18 gedeeld door 2.',
    },
];

/* ── STAGE B — Two-Line System Puzzles ───────────────── */

const STAGE_B: LetterIntroQuestion[] = [
    {
        id: 'B1',
        stage: 'B',
        prompt: ['🍌🍌🍌🍌🍌 = 10', '🍎 + 🍌 = 6'],
        question: '🍎 = ?',
        correctAnswer: 4,
        explanationCorrect: 'Goed! 🍌 = 10 ÷ 5 = 2, dus 🍎 = 6 − 2 = 4',
        explanationWrong: 'Bijna… Tip: bereken eerst 🍌 uit de bovenste regel (10 ÷ 5), dan invullen onderaan.',
    },
    {
        id: 'B2',
        stage: 'B',
        prompt: ['🍇🍇🍇 = 9', '🍇 + 🍓 = 7'],
        question: '🍓 = ?',
        correctAnswer: 4,
        explanationCorrect: 'Goed! 🍇 = 9 ÷ 3 = 3, dus 🍓 = 7 − 3 = 4',
        explanationWrong: 'Bijna… Tip: 🍇 = 9 ÷ 3 = 3. Vul dat in: 3 + 🍓 = 7.',
    },
    {
        id: 'B3',
        stage: 'B',
        prompt: ['🍍🍍 = 8', '🍍 + 🥝 = 7'],
        question: '🥝 = ?',
        correctAnswer: 3,
        explanationCorrect: 'Goed! 🍍 = 8 ÷ 2 = 4, dus 🥝 = 7 − 4 = 3',
        explanationWrong: 'Bijna… Tip: 🍍 = 8 ÷ 2 = 4. Dan: 4 + 🥝 = 7.',
    },
    {
        id: 'B4',
        stage: 'B',
        prompt: ['🧁🧁🧁🧁 = 12', '🧁 + 🍩 = 6'],
        question: '🍩 = ?',
        correctAnswer: 3,
        explanationCorrect: 'Goed! 🧁 = 12 ÷ 4 = 3, dus 🍩 = 6 − 3 = 3',
        explanationWrong: 'Bijna… Tip: 🧁 = 12 ÷ 4 = 3. Wat is dan 🍩?',
    },
    {
        id: 'B5',
        stage: 'B',
        prompt: ['🐟🐟🐟🐟🐟 = 15', '🐟 + 🦐 = 8'],
        question: '🦐 = ?',
        correctAnswer: 5,
        explanationCorrect: 'Goed! 🐟 = 15 ÷ 5 = 3, dus 🦐 = 8 − 3 = 5',
        explanationWrong: 'Bijna… Tip: 🐟 = 15 ÷ 5 = 3. Dan: 3 + 🦐 = 8.',
    },
];

/* ── STAGE C — From Emoji to Letters ─────────────────── */

const STAGE_C: LetterIntroQuestion[] = [
    // C0 — info card (no input)
    {
        id: 'C0',
        stage: 'C',
        prompt: [
            '✨ Letterrekenen ✨',
            '',
            'In de wiskunde gebruiken we letters',
            'in plaats van emoji\'s.',
            '',
            '🍌 wordt b',
            '🍎 wordt a',
            '⭐ wordt x',
            '',
            'Dezelfde regels, maar nu met letters!',
        ],
        question: '',
        correctAnswer: 0,
        explanationCorrect: '',
        explanationWrong: '',
        isInfoCard: true,
    },
    // C1..C5 — letters 1-line
    {
        id: 'C1',
        stage: 'C',
        prompt: ['p + 4 = 10'],
        question: 'p = ?',
        correctAnswer: 6,
        explanationCorrect: 'Goed! p = 10 − 4 = 6',
        explanationWrong: 'Bijna… Tip: p = 10 − 4. Hoeveel is dat?',
    },
    {
        id: 'C2',
        stage: 'C',
        prompt: ['a + 3 = 9'],
        question: 'a = ?',
        correctAnswer: 6,
        explanationCorrect: 'Goed! a = 9 − 3 = 6',
        explanationWrong: 'Bijna… Tip: a = 9 − 3.',
    },
    {
        id: 'C3',
        stage: 'C',
        prompt: ['m + 1 = 10'],
        question: 'm = ?',
        correctAnswer: 9,
        explanationCorrect: 'Goed! m = 10 − 1 = 9',
        explanationWrong: 'Bijna… Tip: m = 10 − 1.',
    },
    {
        id: 'C4',
        stage: 'C',
        prompt: ['t + 5 = 12'],
        question: 't = ?',
        correctAnswer: 7,
        explanationCorrect: 'Goed! t = 12 − 5 = 7',
        explanationWrong: 'Bijna… Tip: t = 12 − 5.',
    },
    {
        id: 'C5',
        stage: 'C',
        prompt: ['q + 2 = 8'],
        question: 'q = ?',
        correctAnswer: 6,
        explanationCorrect: 'Goed! q = 8 − 2 = 6',
        explanationWrong: 'Bijna… Tip: q = 8 − 2.',
    },
    // C6..C10 — coefficients
    {
        id: 'C6',
        stage: 'C',
        prompt: ['2a = 10'],
        question: 'a = ?',
        correctAnswer: 5,
        explanationCorrect: 'Goed! 2 × a = 10, dus a = 10 ÷ 2 = 5',
        explanationWrong: 'Bijna… Tip: 2a betekent 2 × a. Deel 10 door 2.',
    },
    {
        id: 'C7',
        stage: 'C',
        prompt: ['3p = 12'],
        question: 'p = ?',
        correctAnswer: 4,
        explanationCorrect: 'Goed! 3 × p = 12, dus p = 12 ÷ 3 = 4',
        explanationWrong: 'Bijna… Tip: deel 12 door 3.',
    },
    {
        id: 'C8',
        stage: 'C',
        prompt: ['4m = 20'],
        question: 'm = ?',
        correctAnswer: 5,
        explanationCorrect: 'Goed! 4 × m = 20, dus m = 20 ÷ 4 = 5',
        explanationWrong: 'Bijna… Tip: 20 gedeeld door 4.',
    },
    {
        id: 'C9',
        stage: 'C',
        prompt: ['5t = 15'],
        question: 't = ?',
        correctAnswer: 3,
        explanationCorrect: 'Goed! 5 × t = 15, dus t = 15 ÷ 5 = 3',
        explanationWrong: 'Bijna… Tip: deel 15 door 5.',
    },
    {
        id: 'C10',
        stage: 'C',
        prompt: ['2q = 14'],
        question: 'q = ?',
        correctAnswer: 7,
        explanationCorrect: 'Goed! 2 × q = 14, dus q = 14 ÷ 2 = 7',
        explanationWrong: 'Bijna… Tip: deel 14 door 2.',
    },
    // C11..C15 — mixed easy
    {
        id: 'C11',
        stage: 'C',
        prompt: ['2a + 2 = 10'],
        question: 'a = ?',
        correctAnswer: 4,
        explanationCorrect: 'Goed! 2a = 10 − 2 = 8, dus a = 8 ÷ 2 = 4',
        explanationWrong: 'Bijna… Tip: eerst −2 aan beide kanten: 2a = 8. Dan delen door 2.',
    },
    {
        id: 'C12',
        stage: 'C',
        prompt: ['3p + 3 = 15'],
        question: 'p = ?',
        correctAnswer: 4,
        explanationCorrect: 'Goed! 3p = 15 − 3 = 12, dus p = 12 ÷ 3 = 4',
        explanationWrong: 'Bijna… Tip: 3p = 15 − 3 = 12. Deel door 3.',
    },
    {
        id: 'C13',
        stage: 'C',
        prompt: ['4m − 4 = 16'],
        question: 'm = ?',
        correctAnswer: 5,
        explanationCorrect: 'Goed! 4m = 16 + 4 = 20, dus m = 20 ÷ 4 = 5',
        explanationWrong: 'Bijna… Tip: 4m = 16 + 4 = 20. Deel door 4.',
    },
    {
        id: 'C14',
        stage: 'C',
        prompt: ['2t + 6 = 12'],
        question: 't = ?',
        correctAnswer: 3,
        explanationCorrect: 'Goed! 2t = 12 − 6 = 6, dus t = 6 ÷ 2 = 3',
        explanationWrong: 'Bijna… Tip: 2t = 12 − 6 = 6. Deel door 2.',
    },
    {
        id: 'C15',
        stage: 'C',
        prompt: ['5q − 5 = 20'],
        question: 'q = ?',
        correctAnswer: 5,
        explanationCorrect: 'Goed! 5q = 20 + 5 = 25, dus q = 25 ÷ 5 = 5',
        explanationWrong: 'Bijna… Tip: 5q = 20 + 5 = 25. Deel door 5.',
    },
];

/* ── Export all questions in order ────────────────────── */

export const ALL_QUESTIONS: LetterIntroQuestion[] = [
    ...STAGE_A,
    ...STAGE_B,
    ...STAGE_C,
];

/** Total scoreable questions (excludes info cards) */
export const TOTAL_SCOREABLE = ALL_QUESTIONS.filter(q => !q.isInfoCard).length;

/** Stage labels for progress display */
export const STAGE_LABELS: Record<StageId, string> = {
    A: 'Emoji Puzzels',
    B: 'Stelsel Puzzels',
    C: 'Letterrekenen',
};
