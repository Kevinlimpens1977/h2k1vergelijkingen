/**
 * Score Engine — AP, Combos, Speed Bonus, Stars
 */

import { AP, STARS, TIMING } from './arenaConfig';

export interface APBreakdown {
    base: number;
    speedBonus: number;
    comboBonus: number;
    total: number;
}

export interface RunScore {
    totalAP: number;
    perfectSolves: number;
    maxCombo: number;
    accuracy: number;
    totalTimeMs: number;
    stars: 1 | 2 | 3;
    totalSteps: number;
    correctSteps: number;
    totalMonstersDefeated: number;
}

export function calculateStepAP(stepTimeMs: number, comboCount: number): APBreakdown {
    const base = AP.STEP_BASE;
    let speedBonus = 0;
    if (stepTimeMs < TIMING.SPEED_FAST_MS) speedBonus = AP.SPEED_BONUS_FAST;
    else if (stepTimeMs < TIMING.SPEED_MEDIUM_MS) speedBonus = AP.SPEED_BONUS_MEDIUM;

    const comboBonus = comboCount >= AP.COMBO_THRESHOLD ? AP.COMBO_BONUS : 0;

    return {
        base,
        speedBonus,
        comboBonus,
        total: base + speedBonus + comboBonus,
    };
}

export function monsterDefeatAP(isPerfect: boolean): number {
    return AP.MONSTER_DEFEAT + (isPerfect ? AP.PERFECT_SOLVE : 0);
}

export function bossDefeatAP(): number {
    return AP.BOSS_DEFEAT;
}

export function calculateStars(accuracy: number, maxCombo: number): 1 | 2 | 3 {
    if (accuracy >= STARS.THREE.accuracy && maxCombo >= STARS.THREE.minCombo) return 3;
    if (accuracy >= STARS.TWO.accuracy) return 2;
    return 1;
}

export function calculateRunScore(
    totalAP: number,
    perfectSolves: number,
    maxCombo: number,
    totalSteps: number,
    correctSteps: number,
    totalTimeMs: number,
    totalMonstersDefeated: number,
): RunScore {
    const accuracy = totalSteps > 0 ? correctSteps / totalSteps : 0;
    return {
        totalAP,
        perfectSolves,
        maxCombo,
        accuracy,
        totalTimeMs,
        stars: calculateStars(accuracy, maxCombo),
        totalSteps,
        correctSteps,
        totalMonstersDefeated,
    };
}
