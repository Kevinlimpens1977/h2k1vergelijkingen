/**
 * Speed test scoring rules:
 * - correct within 2s => +3
 * - correct within 4s => +2
 * - correct after 4s  => +1
 * - wrong             => -1 and streak reset
 * - streak of 5       => +5 bonus (triggers at every multiple of 5)
 */

export const PASS_SCORE = 35;
export const TIME_LIMIT_MS = 300_000; // 5 minutes

export function scoreAnswer(correct: boolean, responseMs: number): number {
    if (!correct) return -1;
    if (responseMs <= 2000) return 3;
    if (responseMs <= 4000) return 2;
    return 1;
}

export function streakBonus(streak: number): number {
    return streak > 0 && streak % 5 === 0 ? 5 : 0;
}
