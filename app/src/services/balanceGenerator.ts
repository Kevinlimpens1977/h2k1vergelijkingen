/**
 * Generator for solvable Balance Minigame puzzles.
 *
 * Equation: L*a + cL = R*a + cR   where a = v (integer solution)
 * Solve path: remove marbles → remove bags → divide → solved
 *
 * Marble caps per difficulty (individual dots must be countable):
 *   O: max 12 per side
 *   D: max 16 per side
 *   U: max 20 per side
 */

import type { BalanceState } from './balanceEngine';

export type Difficulty = 'O' | 'D' | 'U';

/** CSS color set for one round's visual theme. */
export interface RoundColors {
    /** Box fill (rgba), border (rgba), glow (rgba), text color */
    boxBg: string;
    boxBorder: string;
    boxGlow: string;
    boxText: string;
    /** Marble gradient start, gradient end, border */
    marbleStart: string;
    marbleEnd: string;
    marbleBorder: string;
}

const BOX_PALETTES: Omit<RoundColors, 'marbleStart' | 'marbleEnd' | 'marbleBorder'>[] = [
    { boxBg: 'rgba(168, 85, 247, 0.12)', boxBorder: 'rgba(168, 85, 247, 0.35)', boxGlow: 'rgba(168, 85, 247, 0.1)', boxText: '#c084fc' },  // purple
    { boxBg: 'rgba(59, 130, 246, 0.12)', boxBorder: 'rgba(59, 130, 246, 0.35)', boxGlow: 'rgba(59, 130, 246, 0.1)', boxText: '#60a5fa' },   // blue
    { boxBg: 'rgba(20, 184, 166, 0.12)', boxBorder: 'rgba(20, 184, 166, 0.35)', boxGlow: 'rgba(20, 184, 166, 0.1)', boxText: '#2dd4bf' },   // teal
    { boxBg: 'rgba(244, 63, 94, 0.12)', boxBorder: 'rgba(244, 63, 94, 0.35)', boxGlow: 'rgba(244, 63, 94, 0.1)', boxText: '#fb7185' },   // rose
    { boxBg: 'rgba(249, 115, 22, 0.12)', boxBorder: 'rgba(249, 115, 22, 0.35)', boxGlow: 'rgba(249, 115, 22, 0.1)', boxText: '#fb923c' },   // orange
    { boxBg: 'rgba(34, 197, 94, 0.12)', boxBorder: 'rgba(34, 197, 94, 0.35)', boxGlow: 'rgba(34, 197, 94, 0.1)', boxText: '#4ade80' },   // green
];

const MARBLE_PALETTES: Pick<RoundColors, 'marbleStart' | 'marbleEnd' | 'marbleBorder'>[] = [
    { marbleStart: '#fde68a', marbleEnd: '#f59e0b', marbleBorder: 'rgba(245, 158, 11, 0.5)' },   // amber
    { marbleStart: '#bbf7d0', marbleEnd: '#22c55e', marbleBorder: 'rgba(34, 197, 94, 0.5)' },     // green
    { marbleStart: '#bae6fd', marbleEnd: '#0ea5e9', marbleBorder: 'rgba(14, 165, 233, 0.5)' },    // sky
    { marbleStart: '#fecdd3', marbleEnd: '#f43f5e', marbleBorder: 'rgba(244, 63, 94, 0.5)' },     // pink
    { marbleStart: '#fecaca', marbleEnd: '#ef4444', marbleBorder: 'rgba(239, 68, 68, 0.5)' },     // red
    { marbleStart: '#a5f3fc', marbleEnd: '#06b6d4', marbleBorder: 'rgba(6, 182, 212, 0.5)' },     // cyan
];

function pickRoundColors(): RoundColors {
    const box = BOX_PALETTES[Math.floor(Math.random() * BOX_PALETTES.length)];
    const marble = MARBLE_PALETTES[Math.floor(Math.random() * MARBLE_PALETTES.length)];
    return { ...box, ...marble };
}

export interface BalanceRound {
    id: string;
    initialState: BalanceState;
    solution: number;
    varName: string;
    difficulty: Difficulty;
    colors: RoundColors;
}

interface DiffConfig {
    vMin: number;
    vMax: number;
    netBagsMin: number;
    netBagsMax: number;
    extraBagsMax: number;
    constMax: number;
    marbleCap: number;
}

const CONFIG: Record<Difficulty, DiffConfig> = {
    O: { vMin: 1, vMax: 8, netBagsMin: 1, netBagsMax: 2, extraBagsMax: 1, constMax: 10, marbleCap: 12 },
    D: { vMin: 1, vMax: 12, netBagsMin: 1, netBagsMax: 3, extraBagsMax: 2, constMax: 15, marbleCap: 16 },
    U: { vMin: 1, vMax: 15, netBagsMin: 1, netBagsMax: 4, extraBagsMax: 3, constMax: 20, marbleCap: 20 },
};

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randVar(): string {
    const vars = ['a', 'b', 'n', 'p', 'x'];
    return vars[Math.floor(Math.random() * vars.length)];
}

let _counter = 0;

/**
 * Generate a solvable balance puzzle.
 *
 * Construction:
 *   1. Pick solution v
 *   2. Pick net bags count (will end up on one side after removing)
 *   3. Pick extra bags (present on BOTH sides, removable)
 *   4. Pick constants for both sides such that the equation balances
 *   5. Enforce marble caps: both cL and cR must be ≤ marbleCap
 *
 * Solution path:
 *   - Remove min(cL,cR) marbles from both → one side has 0 marbles
 *   - Remove extra bags from both → net bags on one side
 *   - Divide by net → 1 bag = v marbles
 */
export function generateRound(difficulty: Difficulty = 'D'): BalanceRound {
    const cfg = CONFIG[difficulty];
    let attempts = 0;

    while (attempts < 100) {
        attempts++;

        const v = randInt(cfg.vMin, cfg.vMax);
        const netBags = randInt(cfg.netBagsMin, cfg.netBagsMax);
        const extraBags = randInt(0, cfg.extraBagsMax);

        // Constants: cL is random, cR is derived
        const cL = randInt(0, Math.min(cfg.constMax, cfg.marbleCap));
        const cR = netBags * v + cL;

        // Enforce marble cap on BOTH sides
        if (cR > cfg.marbleCap) continue;
        if (cL > cfg.marbleCap) continue;

        // Bags
        let bagsLeft = netBags + extraBags;
        let marblesLeft = cL;
        let bagsRight = extraBags;
        let marblesRight = cR;

        // Randomly swap sides for variety (50% chance)
        if (Math.random() < 0.5) {
            [bagsLeft, bagsRight] = [bagsRight, bagsLeft];
            [marblesLeft, marblesRight] = [marblesRight, marblesLeft];
        }

        _counter++;

        return {
            id: `round_${Date.now()}_${_counter}`,
            initialState: { bagsLeft, marblesLeft, bagsRight, marblesRight },
            solution: v,
            varName: randVar(),
            difficulty,
            colors: pickRoundColors(),
        };
    }

    // Fallback: very simple puzzle
    _counter++;
    return {
        id: `round_${Date.now()}_${_counter}`,
        initialState: { bagsLeft: 2, marblesLeft: 4, bagsRight: 1, marblesRight: 7 },
        solution: 3,
        varName: 'a',
        difficulty,
        colors: pickRoundColors(),
    };
}
