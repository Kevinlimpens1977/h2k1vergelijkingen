/**
 * Mission cards for speed test gamification.
 * Each mission can be completed once per run for bonus points.
 */

export interface Mission {
    id: string;
    label: string;
    bonus: number;
    check: (state: MissionState) => boolean;
}

export interface MissionState {
    streak: number;
    correctIn2n: number; // times answered a "2n" question correctly
    secondsWithoutError: number;
}

export const MISSIONS: Mission[] = [
    {
        id: 'streak5',
        label: '5 goed op rij',
        bonus: 5,
        check: (s) => s.streak >= 5,
    },
    {
        id: '2n_expert',
        label: '3× "2n" goed',
        bonus: 3,
        check: (s) => s.correctIn2n >= 3,
    },
    {
        id: 'flawless30',
        label: '0 fouten in 30 sec',
        bonus: 4,
        check: (s) => s.secondsWithoutError >= 30,
    },
];

/** Boss questions (curated, high-value). */
export interface BossQuestion {
    prompt: string;
    options: string[];
    correctIndex: number;
}

export const BOSS_BANK: BossQuestion[] = [
    { prompt: '🔥 BOSS: n + n + n + n = ?', options: ['4n', 'n⁴', '4+n', 'n×4'], correctIndex: 0 },
    { prompt: '🔥 BOSS: 10a − 5a + 2a = ?', options: ['7a', '3a', '17a', '7'], correctIndex: 0 },
    { prompt: '🔥 BOSS: 6n = 42 → n = ?', options: ['36', '7', '48', '252'], correctIndex: 1 },
    { prompt: '🔥 BOSS: 3b + 3b + 3b = ?', options: ['9b', '3b³', '9+b', '27b'], correctIndex: 0 },
    { prompt: '🔥 BOSS: 12x − 12x = ?', options: ['24x', '0', '12', '1'], correctIndex: 1 },
];

/** Timestamps (seconds remaining) at which boss rounds trigger. */
export const BOSS_TRIGGERS = [240, 180, 120, 60];

/** Score a boss answer. */
export function scoreBossAnswer(correct: boolean, responseMs: number): number {
    if (!correct) return -1;
    if (responseMs <= 2000) return 5;
    if (responseMs <= 4000) return 3;
    return 2;
}
