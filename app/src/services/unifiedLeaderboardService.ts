/**
 * Unified Leaderboard Service
 *
 * Single generic service replacing per-game leaderboard services.
 * Firestore path: /leaderboard/{boardId}/scores/{uid}
 *
 * Supported boards:
 *   - termen_quest_8_1  (§8.1 Termen Quest)
 *   - speedtest_8_1     (§8.1 Speed Test / Termen Tikkie)
 *   - balance_challenge  (Balans Minigame)
 *   - balansblitz_8_2   (§8.2 Balans Blitz)
 *   - termtris_8_3      (§8.3 Termtris)
 */

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    serverTimestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/* ── board IDs ───────────────────────────────────────── */

export const BOARD_IDS = {
    TERMEN_QUEST: 'termen_quest_8_1',
    SPEED_TEST: 'speedtest_8_1',
    BALANCE_CHALLENGE: 'balance_challenge',
    BALANS_BLITZ: 'balansblitz_8_2',
    TERMTRIS: 'termtris_8_3',
    ALGEBRA_ARENA: 'algebra_arena',
} as const;

export type BoardId = typeof BOARD_IDS[keyof typeof BOARD_IDS];

/* ── types ───────────────────────────────────────────── */

export interface LeaderboardEntry {
    uid: string;
    firstName: string;
    classId: string | null;
    bestScore: number;
    lastScore: number;
    attempts: number;
    bestScoreAt: unknown;
    updatedAt: unknown;
}

/* ── refs ─────────────────────────────────────────────── */

function scoresCol(boardId: BoardId) {
    return collection(db, 'leaderboard', boardId, 'scores');
}

function scoreDoc(boardId: BoardId, uid: string) {
    return doc(db, 'leaderboard', boardId, 'scores', uid);
}

/* ── read (one-shot) ─────────────────────────────────── */

export async function getLeaderboard(
    boardId: BoardId,
    classId: string | null,
    max = 10,
): Promise<LeaderboardEntry[]> {
    if (!classId) return [];
    // Single-field where (auto-indexed) — sort & slice client-side
    const q = query(
        scoresCol(boardId),
        where('classId', '==', classId),
    );
    const snap = await getDocs(q);
    return snap.docs
        .map((d) => d.data() as LeaderboardEntry)
        .sort((a, b) => b.bestScore - a.bestScore)
        .slice(0, max);
}

/* ── realtime listener ───────────────────────────────── */

export function subscribeLeaderboard(
    boardId: BoardId,
    classId: string | null,
    max: number,
    callback: (entries: LeaderboardEntry[]) => void,
): Unsubscribe {
    if (!classId) {
        callback([]);
        return () => { };
    }
    // Single-field where (auto-indexed) — sort & slice client-side
    const q = query(
        scoresCol(boardId),
        where('classId', '==', classId),
    );
    return onSnapshot(q, (snap) => {
        const entries = snap.docs
            .map((d) => d.data() as LeaderboardEntry)
            .sort((a, b) => b.bestScore - a.bestScore)
            .slice(0, max);
        callback(entries);
    }, (err) => {
        console.warn(`Leaderboard [${boardId}] snapshot error:`, err);
    });
}

/* ── write ───────────────────────────────────────────── */

export async function updateScore(
    boardId: BoardId,
    uid: string,
    firstName: string,
    classId: string | null,
    score: number,
): Promise<void> {
    const ref = scoreDoc(boardId, uid);

    // Try to read existing doc for bestScore comparison.
    // If read fails (permissions), fall back to blind upsert.
    let existingBest = -1;
    try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
            existingBest = (snap.data() as LeaderboardEntry).bestScore ?? 0;
        }
    } catch {
        // Read not allowed — do blind upsert (bestScore may overwrite lower)
        existingBest = -1;
    }

    const isNewBest = existingBest < 0 || score > existingBest;

    await setDoc(ref, {
        uid,
        firstName,
        classId,
        lastScore: score,
        updatedAt: serverTimestamp(),
        ...(isNewBest ? {
            bestScore: score,
            bestScoreAt: serverTimestamp(),
        } : {}),
    }, { merge: true });
}

/**
 * Migrate all existing scores for a user to the given classId.
 * Called once on login to fix old scores that had classId: null.
 */
export async function migrateUserScores(uid: string, classId: string): Promise<void> {
    const boards = Object.values(BOARD_IDS);
    await Promise.all(
        boards.map(async (boardId) => {
            try {
                const ref = scoreDoc(boardId, uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    if (!data.classId || data.classId !== classId) {
                        await setDoc(ref, { classId }, { merge: true });
                    }
                }
            } catch {
                // Silently skip — score may not exist for this board
            }
        }),
    );
}
