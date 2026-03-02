/**
 * Termtris §8.3 Leaderboard Service
 *
 * Firestore path: /leaderboard/termtris_8_3/scores/{uid}
 * Mirrors the §8.2 Balans Blitz leaderboard pattern exactly.
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
import { db } from '../../../lib/firebase';

/* ── types ───────────────────────────────────────────── */

export interface TermtrisLBEntry {
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
    return collection(db, 'leaderboard', 'termtris_8_3', 'scores');
}

function scoreDoc(uid: string) {
    return doc(db, 'leaderboard', 'termtris_8_3', 'scores', uid);
}

/* ── realtime listener ───────────────────────────────── */

export function subscribeTermtrisLeaderboard(
    classId: string | null,
    max: number,
    callback: (entries: TermtrisLBEntry[]) => void,
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
        const entries = snap.docs.map((d) => d.data() as TermtrisLBEntry);
        callback(entries);
    }, (err) => {
        console.warn('Termtris leaderboard snapshot error:', err);
    });
}

/* ── write ───────────────────────────────────────────── */

export async function updateTermtrisScore(
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

    const current = snap.data() as TermtrisLBEntry;
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
