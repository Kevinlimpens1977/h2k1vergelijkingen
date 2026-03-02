/**
 * Leaderboard service for §8.1 Speed Test ("Termen Tikkie").
 *
 * Firestore path: /leaderboard/speedtest_8_1/scores/{uid}
 * Realtime: onSnapshot for live class top-N during gameplay.
 */

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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

function scoresCol() {
    return collection(db, 'leaderboard', 'speedtest_8_1', 'scores');
}

function scoreDoc(uid: string) {
    return doc(db, 'leaderboard', 'speedtest_8_1', 'scores', uid);
}

/* ── read (one-shot) ─────────────────────────────────── */

export async function getClassLeaderboard(
    classId: string | null,
    max = 10,
): Promise<LeaderboardEntry[]> {
    if (!classId) return [];
    const q = query(
        scoresCol(),
        where('classId', '==', classId),
        orderBy('bestScore', 'desc'),
        limit(max),
    );
    const { getDocs } = await import('firebase/firestore');
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LeaderboardEntry);
}

/* ── realtime listener ───────────────────────────────── */

export function subscribeClassLeaderboard(
    classId: string | null,
    max: number,
    callback: (entries: LeaderboardEntry[]) => void,
): Unsubscribe {
    if (!classId) {
        callback([]);
        return () => { };
    }
    const q = query(
        scoresCol(),
        where('classId', '==', classId),
        orderBy('bestScore', 'desc'),
        limit(max),
    );
    return onSnapshot(q, (snap) => {
        const entries = snap.docs.map((d) => d.data() as LeaderboardEntry);
        callback(entries);
    }, (err) => {
        console.warn('Leaderboard snapshot error:', err);
    });
}

/* ── write ───────────────────────────────────────────── */

export async function updateLeaderboardScore(
    uid: string,
    firstName: string,
    classId: string | null,
    score: number,
): Promise<void> {
    const ref = scoreDoc(uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            uid,
            firstName,
            classId,
            bestScore: score,
            lastScore: score,
            attempts: 1,
            bestScoreAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return;
    }

    const current = snap.data() as LeaderboardEntry;
    const isNewBest = score > (current.bestScore ?? 0);

    await setDoc(ref, {
        lastScore: score,
        attempts: (current.attempts ?? 0) + 1,
        updatedAt: serverTimestamp(),
        ...(isNewBest ? {
            bestScore: score,
            bestScoreAt: serverTimestamp(),
        } : {}),
    }, { merge: true });
}
