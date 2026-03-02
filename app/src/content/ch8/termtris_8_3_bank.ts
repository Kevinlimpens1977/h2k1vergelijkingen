/**
 * TERMTRIS §8.3 Question Bank
 *
 * Questions derived from exercises 15–19 in §8.3 (balancing equations with
 * variables on BOTH sides).  All equations use the balance method.
 *
 * Book references:
 *   opgave 15, 16 → blz 53
 *   opgave 17     → blz 54
 *   opgave 18, 19 → blz 55
 */

export type TermtrisQ =
    | {
        id: string;
        type: 'mc';
        prompt: string;
        options: string[];
        correctIndex: number;
        bookRef?: { page: number; exercise: string; label?: string };
    }
    | {
        id: string;
        type: 'input';
        prompt: string;
        answer: string;
        accept?: string[];
        bookRef?: { page: number; exercise: string; label?: string };
    };

export const TERMTRIS_8_3_BANK: TermtrisQ[] = [
    /* ═══════════════════════════════════════════════════════
       OPGAVE 15  (blz 53) — 4g + 3 = 2g + 17
       ═══════════════════════════════════════════════════════ */
    {
        id: 't15a',
        type: 'mc',
        prompt: '4g + 3 = 2g + 17\nWelke vergelijking hoort bij balans ❶?',
        options: ['4g + 3 = 2g + 17', '4g = 2g + 17', '2g + 3 = 17'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 15', label: 'Balans ❶' },
    },
    {
        id: 't15b',
        type: 'input',
        prompt: '4g + 3 = 2g + 17\nHoeveel kazen zijn er aan beide kanten weggehaald bij stap 1?',
        answer: '2',
        accept: ['2 kazen', '2g'],
        bookRef: { page: 53, exercise: 'opgave 15', label: 'Stap 1' },
    },
    {
        id: 't15c',
        type: 'mc',
        prompt: '4g + 3 = 2g + 17\nNa het weghalen van 2 kazen (2g) aan beide kanten, wat wordt de vergelijking?',
        options: ['2g + 3 = 17', '4g + 3 = 17', '2g = 14'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 15', label: 'Balans ❷' },
    },
    {
        id: 't15d',
        type: 'mc',
        prompt: '2g + 3 = 17\nWelke stap is eerlijk?',
        options: ['−3 aan beide kanten', '−3 alleen links', '+3 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 15', label: 'Stap 2' },
    },
    {
        id: 't15e',
        type: 'mc',
        prompt: '2g + 3 = 17\nNa −3 aan beide kanten wordt de vergelijking…',
        options: ['2g = 14', '2g = 20', 'g = 7'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 15', label: 'Balans ❸' },
    },
    {
        id: 't15f',
        type: 'input',
        prompt: '2g = 14\ng = ?',
        answer: '7',
        bookRef: { page: 53, exercise: 'opgave 15', label: 'Eindantwoord' },
    },

    /* ═══════════════════════════════════════════════════════
       OPGAVE 16  (blz 53) — 2a + 10 = 5a + 4
       ═══════════════════════════════════════════════════════ */
    {
        id: 't16a',
        type: 'mc',
        prompt: '2a + 10 = 5a + 4\nWelke vergelijking hoort bij balans ❶?',
        options: ['2a + 10 = 5a + 4', '2a + 10 = 5a', 'a + 10 = 5a + 4'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 16', label: 'Balans ❶' },
    },
    {
        id: 't16b',
        type: 'mc',
        prompt: '2a + 10 = 5a + 4\nWelke stap is eerlijk om zakjes weg te halen?',
        options: ['−2a aan beide kanten', '−5a aan beide kanten', '−2a alleen links'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 16', label: 'Stap 1' },
    },
    {
        id: 't16c',
        type: 'mc',
        prompt: '2a + 10 = 5a + 4\nNa −2a aan beide kanten wordt de vergelijking…',
        options: ['10 = 3a + 4', '10 = 5a + 4', '2a + 10 = 4'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 16', label: 'Balans ❷' },
    },
    {
        id: 't16d',
        type: 'mc',
        prompt: '10 = 3a + 4\nWelke stap is eerlijk?',
        options: ['−4 aan beide kanten', '−10 aan beide kanten', '÷3 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 16', label: 'Stap 2' },
    },
    {
        id: 't16e',
        type: 'mc',
        prompt: '10 = 3a + 4\nNa −4 aan beide kanten wordt de vergelijking…',
        options: ['6 = 3a', '14 = 3a', '10 = 3a'],
        correctIndex: 0,
        bookRef: { page: 53, exercise: 'opgave 16', label: 'Balans ❸' },
    },
    {
        id: 't16f',
        type: 'input',
        prompt: '6 = 3a\na = ?',
        answer: '2',
        bookRef: { page: 53, exercise: 'opgave 16', label: 'Eindantwoord' },
    },

    /* ═══════════════════════════════════════════════════════
       OPGAVE 17  (blz 54) — Kladblaadje, vergelijkingen invullen
       bij de balansen van opgave 16  (2a + 10 = 5a + 4)
       ═══════════════════════════════════════════════════════ */
    {
        id: 't17a',
        type: 'mc',
        prompt: 'Schrijf de vergelijking bij balans ❶ (opgave 16).',
        options: ['2a + 10 = 5a + 4', '2a = 5a + 4', '10 = 3a + 4'],
        correctIndex: 0,
        bookRef: { page: 54, exercise: 'opgave 17', label: 'Balans ❶' },
    },
    {
        id: 't17b',
        type: 'mc',
        prompt: 'Schrijf de vergelijking bij balans ❷ (na −2a aan beide kanten).',
        options: ['10 = 3a + 4', '2a + 10 = 4', '10 = 5a'],
        correctIndex: 0,
        bookRef: { page: 54, exercise: 'opgave 17', label: 'Balans ❷' },
    },
    {
        id: 't17c',
        type: 'mc',
        prompt: 'Schrijf de vergelijking bij balans ❸ (na −4 aan beide kanten).',
        options: ['6 = 3a', '10 = 3a', '4 = 3a'],
        correctIndex: 0,
        bookRef: { page: 54, exercise: 'opgave 17', label: 'Balans ❸' },
    },
    {
        id: 't17d',
        type: 'input',
        prompt: 'Controleer het antwoord a = 2 door in te vullen:\n2·2 + 10 = 5·2 + 4\nWat is de uitkomst links?',
        answer: '14',
        bookRef: { page: 54, exercise: 'opgave 17', label: 'Controle links' },
    },
    {
        id: 't17e',
        type: 'input',
        prompt: 'Controleer het antwoord a = 2 door in te vullen:\n2·2 + 10 = 5·2 + 4\nWat is de uitkomst rechts?',
        answer: '14',
        bookRef: { page: 54, exercise: 'opgave 17', label: 'Controle rechts' },
    },

    /* ═══════════════════════════════════════════════════════
       OPGAVE 18  (blz 55) — Twee balansen
       Balans A: 5a + 4 = a + 20
       Balans B: 4a + 18 = 6a + 4
       ═══════════════════════════════════════════════════════ */
    // — Balans A —
    {
        id: 't18a1',
        type: 'mc',
        prompt: 'Balans A: 5a + 4 = a + 20\nWelke stap is eerlijk om zakjes weg te halen?',
        options: ['−a aan beide kanten', '−5a aan beide kanten', '−4 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans A – Stap 1' },
    },
    {
        id: 't18a2',
        type: 'mc',
        prompt: 'Balans A: 5a + 4 = a + 20\nNa −a aan beide kanten wordt de vergelijking…',
        options: ['4a + 4 = 20', '5a = 20', '4a + 4 = a + 20'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans A – Stap 1 resultaat' },
    },
    {
        id: 't18a3',
        type: 'mc',
        prompt: '4a + 4 = 20\nWelke stap is eerlijk?',
        options: ['−4 aan beide kanten', '÷4 aan beide kanten', '+4 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans A – Stap 2' },
    },
    {
        id: 't18a4',
        type: 'mc',
        prompt: '4a + 4 = 20\nNa −4 aan beide kanten wordt de vergelijking…',
        options: ['4a = 16', '4a = 24', 'a = 4'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans A – Stap 2 resultaat' },
    },
    {
        id: 't18a5',
        type: 'input',
        prompt: '4a = 16\na = ?',
        answer: '4',
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans A – Eindantwoord' },
    },

    // — Balans B —
    {
        id: 't18b1',
        type: 'mc',
        prompt: 'Balans B: 4a + 18 = 6a + 4\nWelke stap is eerlijk om zakjes weg te halen?',
        options: ['−4a aan beide kanten', '−6a aan beide kanten', '−18 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans B – Stap 1' },
    },
    {
        id: 't18b2',
        type: 'mc',
        prompt: 'Balans B: 4a + 18 = 6a + 4\nNa −4a aan beide kanten wordt de vergelijking…',
        options: ['18 = 2a + 4', '4a + 18 = 4', '18 = 6a'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans B – Stap 1 resultaat' },
    },
    {
        id: 't18b3',
        type: 'mc',
        prompt: '18 = 2a + 4\nWelke stap is eerlijk?',
        options: ['−4 aan beide kanten', '÷2 aan beide kanten', '−18 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans B – Stap 2' },
    },
    {
        id: 't18b4',
        type: 'mc',
        prompt: '18 = 2a + 4\nNa −4 aan beide kanten wordt de vergelijking…',
        options: ['14 = 2a', '22 = 2a', '18 = 2a'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans B – Stap 2 resultaat' },
    },
    {
        id: 't18b5',
        type: 'input',
        prompt: '14 = 2a\na = ?',
        answer: '7',
        bookRef: { page: 55, exercise: 'opgave 18', label: 'Balans B – Eindantwoord' },
    },

    /* ═══════════════════════════════════════════════════════
       OPGAVE 19  (blz 55) — Drie vergelijkingen oplossen
       A: 3a + 2 = a + 12
       B: 5a + 4 = 2a + 7
       C: 28 = 5a + 3
       ═══════════════════════════════════════════════════════ */
    // — 19A —
    {
        id: 't19a1',
        type: 'mc',
        prompt: '3a + 2 = a + 12\nWelke stap is eerlijk om letters weg te halen?',
        options: ['−a aan beide kanten', '−3a aan beide kanten', '−2 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 19', label: 'A – Stap 1' },
    },
    {
        id: 't19a2',
        type: 'mc',
        prompt: '3a + 2 = a + 12\nNa −a aan beide kanten…',
        options: ['2a + 2 = 12', '3a = 12', '2a + 2 = a + 12'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 19', label: 'A – Stap 1 resultaat' },
    },
    {
        id: 't19a3',
        type: 'input',
        prompt: '2a + 2 = 12\na = ?',
        answer: '5',
        bookRef: { page: 55, exercise: 'opgave 19', label: 'A – Eindantwoord' },
    },

    // — 19B —
    {
        id: 't19b1',
        type: 'mc',
        prompt: '5a + 4 = 2a + 7\nWelke stap is eerlijk om letters weg te halen?',
        options: ['−2a aan beide kanten', '−5a aan beide kanten', '−4 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 19', label: 'B – Stap 1' },
    },
    {
        id: 't19b2',
        type: 'mc',
        prompt: '5a + 4 = 2a + 7\nNa −2a aan beide kanten…',
        options: ['3a + 4 = 7', '5a = 7', '3a + 4 = 2a + 7'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 19', label: 'B – Stap 1 resultaat' },
    },
    {
        id: 't19b3',
        type: 'input',
        prompt: '3a + 4 = 7\na = ?',
        answer: '1',
        bookRef: { page: 55, exercise: 'opgave 19', label: 'B – Eindantwoord' },
    },

    // — 19C —
    {
        id: 't19c1',
        type: 'mc',
        prompt: '28 = 5a + 3\nWelke stap is eerlijk?',
        options: ['−3 aan beide kanten', '−28 aan beide kanten', '÷5 aan beide kanten'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 19', label: 'C – Stap 1' },
    },
    {
        id: 't19c2',
        type: 'mc',
        prompt: '28 = 5a + 3\nNa −3 aan beide kanten…',
        options: ['25 = 5a', '31 = 5a', '28 = 5a'],
        correctIndex: 0,
        bookRef: { page: 55, exercise: 'opgave 19', label: 'C – Stap 1 resultaat' },
    },
    {
        id: 't19c3',
        type: 'input',
        prompt: '25 = 5a\na = ?',
        answer: '5',
        bookRef: { page: 55, exercise: 'opgave 19', label: 'C – Eindantwoord' },
    },
];
