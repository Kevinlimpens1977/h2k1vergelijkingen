/**
 * Speed test question bank for §8.1 "Termen Tikkie"
 * ~40 questions, 4 options each, mixed types.
 */

export interface SpeedQuestion {
    prompt: string;
    options: string[];
    correctIndex: number;
}

export const SPEED_BANK: SpeedQuestion[] = [
    // Equivalence
    { prompt: 'n + n = ?', options: ['2n', 'n²', 'n+2', 'nn'], correctIndex: 0 },
    { prompt: '3n = ?', options: ['n+3', 'n+n+n', 'n³', '3+n'], correctIndex: 1 },
    { prompt: 'a + a + a + a = ?', options: ['a⁴', '4a', '4+a', 'a+4'], correctIndex: 1 },
    { prompt: '5×b is hetzelfde als…', options: ['5b', 'b5', '5+b', 'b⁵'], correctIndex: 0 },
    { prompt: '2×n is hetzelfde als…', options: ['n+n', 'n²', '2+n', 'n−n'], correctIndex: 0 },
    { prompt: 'p + p + p = ?', options: ['p³', '3p', '3+p', 'ppp'], correctIndex: 1 },
    { prompt: '7×a is hetzelfde als…', options: ['a+7', '7a', 'a⁷', '7+a'], correctIndex: 1 },

    // Combine like terms
    { prompt: '10a − 2a = ?', options: ['8a', '8', '12a', '8a²'], correctIndex: 0 },
    { prompt: '3a + 5a = ?', options: ['8a', '8a²', '15a', '8'], correctIndex: 0 },
    { prompt: '4b − 4b = ?', options: ['8b', '0', '4b', '1'], correctIndex: 1 },
    { prompt: '6n + 4n = ?', options: ['10n', '10', '24n', '10n²'], correctIndex: 0 },
    { prompt: '9x − 3x = ?', options: ['6x', '6', '12x', '3x'], correctIndex: 0 },
    { prompt: '2a + 3a + a = ?', options: ['6a', '5a', '6a²', '5'], correctIndex: 0 },
    { prompt: '12b − 7b = ?', options: ['5b', '19b', '5b²', '5'], correctIndex: 0 },
    { prompt: '7n − 7n = ?', options: ['14n', '0', '7', '1'], correctIndex: 1 },
    { prompt: '8p + 2p = ?', options: ['6p', '10p', '16p', '10'], correctIndex: 1 },

    // Solve for variable
    { prompt: '5n = 20 → n = ?', options: ['4', '15', '100', '25'], correctIndex: 0 },
    { prompt: '2n = 18 → n = ?', options: ['16', '9', '20', '36'], correctIndex: 1 },
    { prompt: '8a = 8 → a = ?', options: ['0', '8', '1', '64'], correctIndex: 2 },
    { prompt: '3x = 12 → x = ?', options: ['4', '9', '36', '15'], correctIndex: 0 },
    { prompt: '4n = 20 → n = ?', options: ['5', '16', '80', '24'], correctIndex: 0 },
    { prompt: '6a = 18 → a = ?', options: ['3', '12', '108', '24'], correctIndex: 0 },
    { prompt: '7b = 21 → b = ?', options: ['14', '3', '28', '147'], correctIndex: 1 },
    { prompt: '10x = 50 → x = ?', options: ['40', '500', '5', '60'], correctIndex: 2 },
    { prompt: '9n = 27 → n = ?', options: ['18', '3', '36', '243'], correctIndex: 1 },
    { prompt: '2a = 14 → a = ?', options: ['12', '28', '7', '16'], correctIndex: 2 },

    // True/false style
    { prompt: 'Klopt: n + n = 2n?', options: ['Ja', 'Nee'], correctIndex: 0 },
    { prompt: 'Klopt: n + n = n²?', options: ['Ja', 'Nee'], correctIndex: 1 },
    { prompt: 'Klopt: 3n = n + n + n?', options: ['Ja', 'Nee'], correctIndex: 0 },
    { prompt: 'Klopt: 10 + n = 10n?', options: ['Ja', 'Nee'], correctIndex: 1 },
    { prompt: 'Klopt: 5a + 3a = 8a?', options: ['Ja', 'Nee'], correctIndex: 0 },
    { prompt: 'Klopt: 4b − 2b = 2b?', options: ['Ja', 'Nee'], correctIndex: 0 },
    { prompt: 'Klopt: a × a = 2a?', options: ['Ja', 'Nee'], correctIndex: 1 },
    { prompt: 'Klopt: 2n + 3n = 5n?', options: ['Ja', 'Nee'], correctIndex: 0 },

    // Which expression equals
    { prompt: 'Welke is gelijk aan 6a?', options: ['a+a+a+a+a+a', 'a⁶', '6+a', 'a×6a'], correctIndex: 0 },
    { prompt: 'Welke is gelijk aan b+b?', options: ['b²', '2b', '2+b', 'bb'], correctIndex: 1 },
    { prompt: 'Welke is gelijk aan 4x − x?', options: ['4', '3x', '4x²', '5x'], correctIndex: 1 },
    { prompt: 'Welke is gelijk aan 2a + a?', options: ['2a²', '3a', '3', '2+a'], correctIndex: 1 },
    { prompt: 'Welke is gelijk aan n + n + n + n?', options: ['4n', 'n⁴', '4+n', 'n×4n'], correctIndex: 0 },
    { prompt: 'Wat is 5b + 5b?', options: ['25b', '10b', '10b²', '10'], correctIndex: 1 },
];

/** Pick N random questions from the bank (no repeats within one run). */
export function pickQuestions(count: number): SpeedQuestion[] {
    const shuffled = [...SPEED_BANK].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
