/**
 * Arena Configuration — Constants, Monster Data, Tuning
 *
 * Source of truth: Implementation Decision Addendum
 */

/* ── Arena levels ────────────────────────────────────── */

export type ArenaLevel = 1 | 2 | 3 | 4;

export interface MonsterDef {
    id: string;
    name: string;
    emoji: string;
    hp: number;
    isBoss: boolean;
    arenaLevel: ArenaLevel;
    entranceQuote?: string;
}

/* ── Monster roster (per addendum) ──────────────────── */

export const ARENA_MONSTERS: Record<ArenaLevel, { regular: MonsterDef[]; boss: MonsterDef }> = {
    1: {
        regular: [
            { id: 'wolf', name: 'Wolf', emoji: '🐺', hp: 1, isBoss: false, arenaLevel: 1 },
            { id: 'bat', name: 'Vleermuis', emoji: '🦇', hp: 1, isBoss: false, arenaLevel: 1 },
            { id: 'snake', name: 'Slang', emoji: '🐍', hp: 1, isBoss: false, arenaLevel: 1 },
            { id: 'spider', name: 'Spin', emoji: '🕷️', hp: 1, isBoss: false, arenaLevel: 1 },
        ],
        boss: {
            id: 'draakje', name: 'Draakje', emoji: '🐉', hp: 2, isBoss: true, arenaLevel: 1,
            entranceQuote: 'Probeer mij maar eens te verslaan!',
        },
    },
    2: {
        regular: [
            { id: 'goblin', name: 'Goblin', emoji: '👹', hp: 2, isBoss: false, arenaLevel: 2 },
            { id: 'zombie', name: 'Zombie', emoji: '🧟', hp: 2, isBoss: false, arenaLevel: 2 },
            { id: 'skeleton', name: 'Skelet', emoji: '🦴', hp: 2, isBoss: false, arenaLevel: 2 },
            { id: 'ghost', name: 'Geest', emoji: '👻', hp: 2, isBoss: false, arenaLevel: 2 },
        ],
        boss: {
            id: 'troll', name: 'Trol', emoji: '🧌', hp: 4, isBoss: true, arenaLevel: 2,
            entranceQuote: 'Kun jij tegen mijn kracht op?!',
        },
    },
    3: {
        regular: [
            { id: 'knight', name: 'Ridder', emoji: '⚔️', hp: 3, isBoss: false, arenaLevel: 3 },
            { id: 'archer', name: 'Boogschutter', emoji: '🏹', hp: 3, isBoss: false, arenaLevel: 3 },
            { id: 'wizard', name: 'Tovenaar', emoji: '🧙', hp: 3, isBoss: false, arenaLevel: 3 },
            { id: 'swordsman', name: 'Zwaardvechter', emoji: '🗡️', hp: 3, isBoss: false, arenaLevel: 3 },
        ],
        boss: {
            id: 'dragon', name: 'Grote Draak', emoji: '🐲', hp: 6, isBoss: true, arenaLevel: 3,
            entranceQuote: 'Ik ben de meester van de balans!',
        },
    },
    4: {
        regular: [
            { id: 'demonknight', name: 'Demonridder', emoji: '💀', hp: 3, isBoss: false, arenaLevel: 4 },
            { id: 'shadowmage', name: 'Schaduwmagiër', emoji: '🌑', hp: 3, isBoss: false, arenaLevel: 4 },
        ],
        boss: {
            id: 'algebramaster', name: 'Algebrameester', emoji: '👑', hp: 6, isBoss: true, arenaLevel: 4,
            entranceQuote: 'Ik ken ALLE vergelijkingen!',
        },
    },
};

export const ARENA_NAMES: Record<ArenaLevel, string> = {
    1: 'Rookie Arena',
    2: 'Fighter Arena',
    3: 'Balance Master Arena',
    4: 'Final Arena',
};

/* ── AP scoring constants ────────────────────────────── */

export const AP = {
    STEP_BASE: 20,
    SPEED_BONUS_FAST: 40,     // < 5s
    SPEED_BONUS_MEDIUM: 25,   // < 8s
    COMBO_BONUS: 50,          // combo >= 3
    COMBO_THRESHOLD: 3,
    MONSTER_DEFEAT: 100,
    BOSS_DEFEAT: 300,
    PERFECT_SOLVE: 100,       // no mistakes on a monster
} as const;

/* ── Hero HP ─────────────────────────────────────────── */

export const HERO = {
    MAX_HP: 3,
    HP_LOSS_PER_WRONG: 1,
    HP_HEAL_ON_DEFEAT: 1,    // +1 on monster defeat (cap at MAX)
} as const;

/* ── Star thresholds ─────────────────────────────────── */

export const STARS = {
    ONE: { accuracy: 0 },
    TWO: { accuracy: 0.7 },
    THREE: { accuracy: 0.9, minCombo: 5 },
} as const;

/* ── Timing ──────────────────────────────────────────── */

export const TIMING = {
    SPEED_FAST_MS: 5000,
    SPEED_MEDIUM_MS: 8000,
    FEEDBACK_CORRECT_MS: 800,
    FEEDBACK_WRONG_MS: 2000,
    ARENA_TRANSITION_MS: 2500,
    BOSS_INTRO_MS: 2500,
    MONSTER_DEFEAT_MS: 1200,
    BOSS_DEFEAT_MS: 2000,
    VICTORY_DELAY_MS: 1500,
} as const;

/* ── Steps per level (for HP mapping) ────────────────── */

export const STEPS_PER_LEVEL: Record<ArenaLevel, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 3,
};
