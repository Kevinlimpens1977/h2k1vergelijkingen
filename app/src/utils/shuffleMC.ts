/**
 * MC Shuffle Utility — shuffles multiple-choice options at render time
 * so the correct answer isn't always in the same position.
 *
 * Uses a seeded shuffle per question ID for consistency during a session.
 */

interface ShuffledMC {
    options: string[];
    correctIndex: number;
}

/**
 * Shuffle MC options so the correct answer appears at a random position.
 * Uses the question id as a seed for deterministic but varied positioning.
 */
export function shuffleMCOptions(
    options: string[],
    correctIndex: number,
    questionId: string,
): ShuffledMC {
    if (options.length <= 1) return { options, correctIndex };

    // Create indexed pairs
    const indexed = options.map((opt, i) => ({ opt, isCorrect: i === correctIndex }));

    // Seeded shuffle using question ID
    const seed = hashString(questionId);
    const shuffled = seededShuffle(indexed, seed);

    return {
        options: shuffled.map(s => s.opt),
        correctIndex: shuffled.findIndex(s => s.isCorrect),
    };
}

/**
 * Shuffle an array of operation buttons for balance-intro guided examples.
 * Returns the shuffled array and the new index of the correct item.
 */
export function shuffleOperations<T>(
    items: T[],
    correctIdx: number,
    seed: string,
): { items: T[]; correctIdx: number } {
    if (items.length <= 1) return { items, correctIdx };

    const indexed = items.map((item, i) => ({ item, isCorrect: i === correctIdx }));
    const shuffled = seededShuffle(indexed, hashString(seed));

    return {
        items: shuffled.map(s => s.item),
        correctIdx: shuffled.findIndex(s => s.isCorrect),
    };
}

// ── internals ──

function hashString(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit int
    }
    return Math.abs(hash);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
    const result = [...arr];
    let s = seed;
    for (let i = result.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) & 0x7fffffff; // LCG
        const j = s % (i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
