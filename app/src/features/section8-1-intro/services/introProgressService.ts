/**
 * Firestore service for §8.1 intro gate progress.
 *
 * Doc path: /progress/{uid}/paragraphs/8_1_intro
 * Fields:
 *   completedIntro: boolean
 *   completedSpeedTest: boolean
 *   bestScore: number
 *   lastScore: number
 *   attempts: number
 *   completedAt: serverTimestamp | null
 *   updatedAt: serverTimestamp
 *
 * Speed test runs: /progress/{uid}/paragraphs/8_1_intro/runs/{runId}
 */

import {
    doc,
    getDoc,
    setDoc,
    addDoc,
    collection,
    serverTimestamp,
    increment,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { markIntro8_1Passed } from '../../../services/chapter8Flow';

/* ── types ───────────────────────────────────────────── */

export interface IntroProgress {
    completedIntro: boolean;
    completedSpeedTest: boolean;
    bestScore: number;
    lastScore: number;
    attempts: number;
    completedAt: unknown;
    updatedAt: unknown;
}

export interface SpeedTestRun {
    score: number;
    passed: boolean;
    correctCount: number;
    wrongCount: number;
    startedAt: unknown;
    endedAt: unknown;
}

/* ── refs ─────────────────────────────────────────────── */

function introDocRef(uid: string) {
    return doc(db, 'progress', uid, 'paragraphs', '8_1_intro');
}

function runsColRef(uid: string) {
    return collection(db, 'progress', uid, 'paragraphs', '8_1_intro', 'runs');
}

/* ── read ─────────────────────────────────────────────── */

export async function getIntroProgress(uid: string): Promise<IntroProgress | null> {
    const snap = await getDoc(introDocRef(uid));
    if (!snap.exists()) return null;
    return snap.data() as IntroProgress;
}

/* ── write: intro completed ──────────────────────────── */

export async function markIntroCompleted(uid: string): Promise<void> {
    await setDoc(introDocRef(uid), {
        completedIntro: true,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

/* ── write: speed test run ───────────────────────────── */

export async function logSpeedTestRun(
    uid: string,
    run: Omit<SpeedTestRun, 'startedAt' | 'endedAt'> & { startedAt: number; endedAt: number },
): Promise<void> {
    // Log individual run
    await addDoc(runsColRef(uid), {
        ...run,
        startedAt: new Date(run.startedAt),
        endedAt: new Date(run.endedAt),
    });

    // Update progress doc
    const snap = await getDoc(introDocRef(uid));
    const current = snap.exists() ? (snap.data() as IntroProgress) : null;
    const bestScore = Math.max(current?.bestScore ?? 0, run.score);

    await setDoc(introDocRef(uid), {
        lastScore: run.score,
        bestScore,
        attempts: increment(1),
        updatedAt: serverTimestamp(),
        ...(run.passed ? {
            completedSpeedTest: true,
            completedAt: serverTimestamp(),
        } : {}),
    }, { merge: true });

    // Also update chapter 8 flow gating
    if (run.passed) {
        await markIntro8_1Passed(uid);
    }
}

/* ── init (ensure doc exists) ────────────────────────── */

export async function ensureIntroDoc(uid: string): Promise<IntroProgress> {
    const snap = await getDoc(introDocRef(uid));
    if (snap.exists()) return snap.data() as IntroProgress;

    const initial: Record<string, unknown> = {
        completedIntro: false,
        completedSpeedTest: false,
        bestScore: 0,
        lastScore: 0,
        attempts: 0,
        completedAt: null,
        updatedAt: serverTimestamp(),
    };
    await setDoc(introDocRef(uid), initial);
    return initial as unknown as IntroProgress;
}
