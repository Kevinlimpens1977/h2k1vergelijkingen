/**
 * Leaderboard service for Balance Challenge mode.
 *
 * Firestore path: /leaderboard/balance_challenge/scores/{uid}
 * Mirror of speedtest leaderboard — different collection key.
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

export interface BalanceLBEntry {
    uid: string;
    firstName: string;
    classId: string | null;
    bestScore: number;
    lastScore: number;
    attempts: number;
    bestScoreAt: unknown;
    updatedAt: unknown;
}

function scoresCol() {
    return collection(db, 'leaderboard', 'balance_challenge', 'scores');
}

function scoreDoc(uid: string) {
    return doc(db, 'leaderboard', 'balance_challenge', 'scores', uid);
}

export async function getBalanceLeaderboard(
    classId: string | null,
    max = 10,
): Promise<BalanceLBEntry[]> {
    if (!classId) return [];
    const q = query(
        scoresCol(),
        where('classId', '==', classId),
        orderBy('bestScore', 'desc'),
        limit(max),
    );
    const { getDocs } = await import('firebase/firestore');
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as BalanceLBEntry);
}

export function subscribeBalanceLeaderboard(
    classId: string | null,
    max: number,
    callback: (entries: BalanceLBEntry[]) => void,
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
        const entries = snap.docs.map((d) => d.data() as BalanceLBEntry);
        callback(entries);
    }, (err) => {
        console.warn('Balance leaderboard error:', err);
    });
}

export async function updateBalanceScore(
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

    const current = snap.data() as BalanceLBEntry;
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
