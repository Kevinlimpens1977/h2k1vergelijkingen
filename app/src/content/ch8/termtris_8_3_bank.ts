/**
 * TERMTRIS §8.3 Question Bank  (v2 — Procedurally enriched)
 *
 * Topics: solving linear equations with variables on BOTH sides
 * using the balance method.
 *
 * Question Types:
 *   'input'  → student types the answer
 *   'mc'     → student picks the correct option (shuffled at runtime)
 *
 * Difficulty: klas 2 havo/vwo, §8.3 level, varied variable names,
 * multi-step reasoning, and plausible distractors.
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
       BLOK 1 — Vergelijkingen direct oplossen (input)
       ═══════════════════════════════════════════════════════ */
    {
        id: 'v01',
        type: 'input',
        prompt: '5x + 3 = 2x + 18\nx = ?',
        answer: '5',
    },
    {
        id: 'v02',
        type: 'input',
        prompt: '7a + 2 = 3a + 22\na = ?',
        answer: '5',
    },
    {
        id: 'v03',
        type: 'input',
        prompt: '6b + 1 = 2b + 21\nb = ?',
        answer: '5',
    },
    {
        id: 'v04',
        type: 'input',
        prompt: '3p + 14 = 8p + 4\np = ?',
        answer: '2',
    },
    {
        id: 'v05',
        type: 'input',
        prompt: '9n − 5 = 4n + 20\nn = ?',
        answer: '5',
    },
    {
        id: 'v06',
        type: 'input',
        prompt: '2x + 30 = 7x + 5\nx = ?',
        answer: '5',
    },
    {
        id: 'v07',
        type: 'input',
        prompt: '8a + 3 = 5a + 15\na = ?',
        answer: '4',
    },
    {
        id: 'v08',
        type: 'input',
        prompt: '4b + 9 = b + 24\nb = ?',
        answer: '5',
    },
    {
        id: 'v09',
        type: 'input',
        prompt: '6x + 2 = 4x + 12\nx = ?',
        answer: '5',
    },
    {
        id: 'v10',
        type: 'input',
        prompt: '10a − 6 = 7a + 9\na = ?',
        answer: '5',
    },
    {
        id: 'v11',
        type: 'input',
        prompt: '3x + 25 = 8x + 5\nx = ?',
        answer: '4',
    },
    {
        id: 'v12',
        type: 'input',
        prompt: '12p − 8 = 4p + 16\np = ?',
        answer: '3',
    },
    {
        id: 'v13',
        type: 'input',
        prompt: '5n + 7 = 2n + 25\nn = ?',
        answer: '6',
    },
    {
        id: 'v14',
        type: 'input',
        prompt: '11b − 3 = 5b + 15\nb = ?',
        answer: '3',
    },
    {
        id: 'v15',
        type: 'input',
        prompt: '4x + 20 = 6x + 8\nx = ?',
        answer: '6',
    },
    {
        id: 'v16',
        type: 'input',
        prompt: '7a + 4 = 3a + 28\na = ?',
        answer: '6',
    },
    {
        id: 'v17',
        type: 'input',
        prompt: '2n + 35 = 9n\nn = ?',
        answer: '5',
    },
    {
        id: 'v18',
        type: 'input',
        prompt: '15 = 3x + 6\nx = ?',
        answer: '3',
    },
    {
        id: 'v19',
        type: 'input',
        prompt: '8b − 2 = 3b + 18\nb = ?',
        answer: '4',
    },
    {
        id: 'v20',
        type: 'input',
        prompt: '6a + 10 = 10a − 2\na = ?',
        answer: '3',
    },

    /* ═══════════════════════════════════════════════════════
       BLOK 2 — Tussenresultaat na een stap (MC)
       "Na ... aan beide kanten wordt de vergelijking..."
       ═══════════════════════════════════════════════════════ */
    {
        id: 's01',
        type: 'mc',
        prompt: '5x + 3 = 2x + 18\nNa −2x aan beide kanten…',
        options: ['3x + 3 = 18', '5x + 3 = 18', '3x = 15'],
        correctIndex: 0,
    },
    {
        id: 's02',
        type: 'mc',
        prompt: '7a + 2 = 3a + 22\nNa −3a aan beide kanten…',
        options: ['4a + 2 = 22', '7a = 22', '3a + 2 = 22'],
        correctIndex: 0,
    },
    {
        id: 's03',
        type: 'mc',
        prompt: '3p + 14 = 8p + 4\nNa −3p aan beide kanten…',
        options: ['14 = 5p + 4', '3p + 14 = 4', '14 = 8p'],
        correctIndex: 0,
    },
    {
        id: 's04',
        type: 'mc',
        prompt: '9n − 5 = 4n + 20\nNa −4n aan beide kanten…',
        options: ['5n − 5 = 20', '9n = 20', '5n + 5 = 20'],
        correctIndex: 0,
    },
    {
        id: 's05',
        type: 'mc',
        prompt: '4b + 9 = b + 24\nNa −b aan beide kanten…',
        options: ['3b + 9 = 24', '4b = 24', '3b + 24 = 9'],
        correctIndex: 0,
    },
    {
        id: 's06',
        type: 'mc',
        prompt: '8a + 3 = 5a + 15\nNa −5a aan beide kanten…',
        options: ['3a + 3 = 15', '8a = 15', '3a + 15 = 3'],
        correctIndex: 0,
    },
    {
        id: 's07',
        type: 'mc',
        prompt: '6x + 2 = 4x + 12\nNa −4x aan beide kanten…',
        options: ['2x + 2 = 12', '6x = 12', '2x + 12 = 2'],
        correctIndex: 0,
    },
    {
        id: 's08',
        type: 'mc',
        prompt: '10a − 6 = 7a + 9\nNa −7a aan beide kanten…',
        options: ['3a − 6 = 9', '10a = 9', '3a + 6 = 9'],
        correctIndex: 0,
    },
    {
        id: 's09',
        type: 'mc',
        prompt: '3x + 25 = 8x + 5\nNa −3x aan beide kanten…',
        options: ['25 = 5x + 5', '3x = 5', '25 = 8x'],
        correctIndex: 0,
    },
    {
        id: 's10',
        type: 'mc',
        prompt: '12p − 8 = 4p + 16\nNa −4p aan beide kanten…',
        options: ['8p − 8 = 16', '12p = 16', '8p + 8 = 16'],
        correctIndex: 0,
    },

    /* ═══════════════════════════════════════════════════════
       BLOK 3 — Welke stap is correct? (MC)
       Subtielere afleiders
       ═══════════════════════════════════════════════════════ */
    {
        id: 'k01',
        type: 'mc',
        prompt: '5x + 3 = 2x + 18\nWelke eerste stap is correct?',
        options: ['−2x aan beide kanten', '−5x aan beide kanten', '−3 alleen links'],
        correctIndex: 0,
    },
    {
        id: 'k02',
        type: 'mc',
        prompt: '3p + 14 = 8p + 4\nWelke eerste stap is correct?',
        options: ['−3p aan beide kanten', '−14 aan beide kanten', '−8p alleen rechts'],
        correctIndex: 0,
    },
    {
        id: 'k03',
        type: 'mc',
        prompt: '3x + 3 = 18\nWat is de volgende stap?',
        options: ['−3 aan beide kanten', '÷3 aan beide kanten', '−18 aan beide kanten'],
        correctIndex: 0,
    },
    {
        id: 'k04',
        type: 'mc',
        prompt: '4a + 2 = 22\nWat is de volgende stap?',
        options: ['−2 aan beide kanten', '÷4 aan beide kanten', '−22 aan beide kanten'],
        correctIndex: 0,
    },
    {
        id: 'k05',
        type: 'mc',
        prompt: '5n − 5 = 20\nWat is de volgende stap?',
        options: ['+5 aan beide kanten', '−5 aan beide kanten', '÷5 aan beide kanten'],
        correctIndex: 0,
    },
    {
        id: 'k06',
        type: 'mc',
        prompt: '25 = 5x + 5\nWat is de volgende stap?',
        options: ['−5 aan beide kanten', '÷5 aan beide kanten', '−25 aan beide kanten'],
        correctIndex: 0,
    },
    {
        id: 'k07',
        type: 'mc',
        prompt: '6a + 10 = 10a − 2\nWelke eerste stap is correct?',
        options: ['−6a aan beide kanten', '−10 aan beide kanten', '+2 alleen rechts'],
        correctIndex: 0,
    },
    {
        id: 'k08',
        type: 'mc',
        prompt: '8p − 8 = 16\nWat is de volgende stap?',
        options: ['+8 aan beide kanten', '−8 aan beide kanten', '÷8 aan beide kanten'],
        correctIndex: 0,
    },

    /* ═══════════════════════════════════════════════════════
       BLOK 4 — Controle: klopt het antwoord? (MC)
       ═══════════════════════════════════════════════════════ */
    {
        id: 'c01',
        type: 'mc',
        prompt: '5x + 3 = 2x + 18\nKlopt x = 5? Reken na.',
        options: ['Ja, want 28 = 28', 'Nee, want 25 ≠ 28', 'Nee, want 28 ≠ 20'],
        correctIndex: 0,
    },
    {
        id: 'c02',
        type: 'mc',
        prompt: '7a + 2 = 3a + 22\nKlopt a = 5? Reken na.',
        options: ['Ja, want 37 = 37', 'Nee, want 35 ≠ 37', 'Nee, want 37 ≠ 42'],
        correctIndex: 0,
    },
    {
        id: 'c03',
        type: 'mc',
        prompt: '3p + 14 = 8p + 4\nKlopt p = 2? Reken na.',
        options: ['Ja, want 20 = 20', 'Nee, want 20 ≠ 22', 'Nee, want 18 ≠ 20'],
        correctIndex: 0,
    },
    {
        id: 'c04',
        type: 'mc',
        prompt: '8a + 3 = 5a + 15\nKlopt a = 4? Reken na.',
        options: ['Ja, want 35 = 35', 'Nee, want 32 ≠ 35', 'Nee, want 35 ≠ 40'],
        correctIndex: 0,
    },
    {
        id: 'c05',
        type: 'mc',
        prompt: '6a + 10 = 10a − 2\nKlopt a = 3? Reken na.',
        options: ['Ja, want 28 = 28', 'Nee, want 28 ≠ 30', 'Nee, want 26 ≠ 28'],
        correctIndex: 0,
    },
    {
        id: 'c06',
        type: 'mc',
        prompt: '4b + 9 = b + 24\nKlopt b = 5? Reken na.',
        options: ['Ja, want 29 = 29', 'Nee, want 29 ≠ 30', 'Nee, want 25 ≠ 29'],
        correctIndex: 0,
    },

    /* ═══════════════════════════════════════════════════════
       BLOK 5 — Invullen: wat is de uitkomst? (input)
       ═══════════════════════════════════════════════════════ */
    {
        id: 'i01',
        type: 'input',
        prompt: 'Vul x = 5 in bij 5x + 3.\nWat is de uitkomst?',
        answer: '28',
    },
    {
        id: 'i02',
        type: 'input',
        prompt: 'Vul a = 4 in bij 8a + 3.\nWat is de uitkomst?',
        answer: '35',
    },
    {
        id: 'i03',
        type: 'input',
        prompt: 'Vul p = 2 in bij 3p + 14.\nWat is de uitkomst?',
        answer: '20',
    },
    {
        id: 'i04',
        type: 'input',
        prompt: 'Vul n = 5 in bij 9n − 5.\nWat is de uitkomst?',
        answer: '40',
    },
    {
        id: 'i05',
        type: 'input',
        prompt: 'Vul b = 5 in bij 4b + 9.\nWat is de uitkomst?',
        answer: '29',
    },
    {
        id: 'i06',
        type: 'input',
        prompt: 'Vul a = 3 in bij 10a − 2.\nWat is de uitkomst?',
        answer: '28',
    },
    {
        id: 'i07',
        type: 'input',
        prompt: 'Vul x = 4 in bij 3x + 25.\nWat is de uitkomst?',
        answer: '37',
    },
    {
        id: 'i08',
        type: 'input',
        prompt: 'Vul a = 6 in bij 7a + 4.\nWat is de uitkomst?',
        answer: '46',
    },

    /* ═══════════════════════════════════════════════════════
       BLOK 6 — Grotere getallen / extra uitdaging (input)
       ═══════════════════════════════════════════════════════ */
    {
        id: 'h01',
        type: 'input',
        prompt: '9x + 4 = 3x + 40\nx = ?',
        answer: '6',
    },
    {
        id: 'h02',
        type: 'input',
        prompt: '2b + 50 = 12b\nb = ?',
        answer: '5',
    },
    {
        id: 'h03',
        type: 'input',
        prompt: '15a − 10 = 5a + 30\na = ?',
        answer: '4',
    },
    {
        id: 'h04',
        type: 'input',
        prompt: '4n + 33 = 7n + 12\nn = ?',
        answer: '7',
    },
    {
        id: 'h05',
        type: 'input',
        prompt: '11x − 8 = 6x + 17\nx = ?',
        answer: '5',
    },
    {
        id: 'h06',
        type: 'input',
        prompt: '3a + 45 = 8a + 10\na = ?',
        answer: '7',
    },
    {
        id: 'h07',
        type: 'input',
        prompt: '13p − 6 = 7p + 18\np = ?',
        answer: '4',
    },
    {
        id: 'h08',
        type: 'input',
        prompt: '6b + 21 = 9b\nb = ?',
        answer: '7',
    },
    {
        id: 'h09',
        type: 'input',
        prompt: '14x − 12 = 8x + 6\nx = ?',
        answer: '3',
    },
    {
        id: 'h10',
        type: 'input',
        prompt: '5n + 36 = 11n\nn = ?',
        answer: '6',
    },

    /* ═══════════════════════════════════════════════════════
       BLOK 7 — Twee stappen in één: wat is de uitkomst? (MC)
       ═══════════════════════════════════════════════════════ */
    {
        id: 'm01',
        type: 'mc',
        prompt: '8a + 3 = 5a + 15\nNa −5a en dan −3 aan beide kanten…',
        options: ['3a = 12', '3a = 18', '3a = 15'],
        correctIndex: 0,
    },
    {
        id: 'm02',
        type: 'mc',
        prompt: '6x + 2 = 4x + 12\nNa −4x en dan −2 aan beide kanten…',
        options: ['2x = 10', '2x = 14', '2x = 12'],
        correctIndex: 0,
    },
    {
        id: 'm03',
        type: 'mc',
        prompt: '9n − 5 = 4n + 20\nNa −4n en dan +5 aan beide kanten…',
        options: ['5n = 25', '5n = 15', '5n = 20'],
        correctIndex: 0,
    },
    {
        id: 'm04',
        type: 'mc',
        prompt: '7a + 2 = 3a + 22\nNa −3a en dan −2 aan beide kanten…',
        options: ['4a = 20', '4a = 24', '4a = 22'],
        correctIndex: 0,
    },
    {
        id: 'm05',
        type: 'mc',
        prompt: '3p + 14 = 8p + 4\nNa −3p en dan −4 aan beide kanten…',
        options: ['10 = 5p', '14 = 5p', '18 = 5p'],
        correctIndex: 0,
    },
    {
        id: 'm06',
        type: 'mc',
        prompt: '12p − 8 = 4p + 16\nNa −4p en dan +8 aan beide kanten…',
        options: ['8p = 24', '8p = 8', '8p = 16'],
        correctIndex: 0,
    },

    /* ═══════════════════════════════════════════════════════
       BLOK 8 — Omgekeerde vraag: welke vergelijking geeft deze x? (MC)
       ═══════════════════════════════════════════════════════ */
    {
        id: 'r01',
        type: 'mc',
        prompt: 'Bij welke vergelijking is x = 3?',
        options: ['4x + 5 = 2x + 11', '4x + 5 = 2x + 9', '4x + 5 = 2x + 15'],
        correctIndex: 0,
    },
    {
        id: 'r02',
        type: 'mc',
        prompt: 'Bij welke vergelijking is a = 4?',
        options: ['3a + 8 = a + 16', '3a + 8 = a + 14', '3a + 8 = a + 20'],
        correctIndex: 0,
    },
    {
        id: 'r03',
        type: 'mc',
        prompt: 'Bij welke vergelijking is n = 6?',
        options: ['2n + 15 = 5n − 3', '2n + 15 = 5n + 3', '2n + 15 = 5n − 9'],
        correctIndex: 0,
    },
    {
        id: 'r04',
        type: 'mc',
        prompt: 'Bij welke vergelijking is b = 2?',
        options: ['7b + 1 = 3b + 9', '7b + 1 = 3b + 7', '7b + 1 = 3b + 11'],
        correctIndex: 0,
    },
];
