/**
 * Chapter 8 Linear Flow — Gating Service
 *
 * STEP ORDER:
 *   1) 8_1_intro  — Termen Quest + Speed Test
 *   2) 8_1        — §8.1 Oefenen (practice)
 *   3) balance    — Balans Minigame (bridge)
 *   4) 8_2        — §8.2 Step-by-step tutor
 *
 * GATING:
 *   Each step requires the previous step to be completed.
 *   Step 1 is always unlocked (entry point).
 *
 * FIRESTORE:
 *   /progress/{uid}/paragraphs/chapter8_flow
 *   Fields: intro8_1Passed, section8_1Completed, balanceGameCompleted, updatedAt
 */

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/* ── flow config ─────────────────────────────────────── */

export type FlowStepId = '8_1_intro' | '8_1' | 'balance' | '8_2' | '8_2_blitz' | '8_3';

export interface FlowStep {
    id: FlowStepId;
    title: string;
    subtitle: string;
    route: string;
    icon: string;
}

export const CHAPTER_8_FLOW: FlowStep[] = [
    { id: '8_1_intro', title: '§8.1 Intro', subtitle: 'Termen Quest + Speed Test', route: '/8-1/intro', icon: '🎮' },
    { id: '8_1', title: '§8.1 Oefenen', subtitle: 'Gelijksoortige termen', route: '/paragraph/8_1', icon: '📝' },
    { id: 'balance', title: 'Balans Minigame', subtitle: 'Leer de balansmethode', route: '/balance-game?difficulty=D', icon: '⚖️' },
    { id: '8_2', title: '§8.2 De balans', subtitle: 'Vergelijkingen oplossen', route: '/practice/8_2', icon: '🎓' },
    { id: '8_2_blitz', title: '§8.2 Balans Blitz', subtitle: 'Snelle challenge', route: '/8-2/blitz', icon: '⚡' },
    { id: '8_3', title: '§8.3 Termtris', subtitle: 'Vergelijkingen met balans', route: '/8-3/termtris', icon: '🧱' },
];

/* ── progress doc ────────────────────────────────────── */

export interface Chapter8Progress {
    letterIntroCompleted: boolean;
    letterIntroCompletedAt: unknown;
    intro8_1Passed: boolean;
    intro8_1PassedAt: unknown;
    section8_1Completed: boolean;
    section8_1CompletedAt: unknown;
    balanceGameCompleted: boolean;
    balanceGameCompletedAt: unknown;
    section8_2Completed: boolean;
    section8_2CompletedAt: unknown;
    section8_2BlitzPassed: boolean;
    section8_2BlitzPassedAt: unknown;
    section8_3Completed: boolean;
    section8_3CompletedAt: unknown;
    updatedAt: unknown;
}

const DEFAULT_PROGRESS: Chapter8Progress = {
    letterIntroCompleted: false,
    letterIntroCompletedAt: null,
    intro8_1Passed: false,
    intro8_1PassedAt: null,
    section8_1Completed: false,
    section8_1CompletedAt: null,
    balanceGameCompleted: false,
    balanceGameCompletedAt: null,
    section8_2Completed: false,
    section8_2CompletedAt: null,
    section8_2BlitzPassed: false,
    section8_2BlitzPassedAt: null,
    section8_3Completed: false,
    section8_3CompletedAt: null,
    updatedAt: null,
};

function flowDocRef(uid: string) {
    return doc(db, 'progress', uid, 'paragraphs', 'chapter8_flow');
}

/* ── read ─────────────────────────────────────────────── */

export async function getChapter8Progress(uid: string): Promise<Chapter8Progress> {
    const snap = await getDoc(flowDocRef(uid));
    if (!snap.exists()) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...snap.data() } as Chapter8Progress;
}

/* ── write helpers ───────────────────────────────────── */

export async function markLetterIntroCompleted(uid: string): Promise<void> {
    await setDoc(flowDocRef(uid), {
        letterIntroCompleted: true,
        letterIntroCompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function markIntro8_1Passed(uid: string): Promise<void> {
    await setDoc(flowDocRef(uid), {
        intro8_1Passed: true,
        intro8_1PassedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function markSection8_1Completed(uid: string): Promise<void> {
    await setDoc(flowDocRef(uid), {
        section8_1Completed: true,
        section8_1CompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function markBalanceGameCompleted(uid: string): Promise<void> {
    await setDoc(flowDocRef(uid), {
        balanceGameCompleted: true,
        balanceGameCompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function markSection8_2Completed(uid: string): Promise<void> {
    await setDoc(flowDocRef(uid), {
        section8_2Completed: true,
        section8_2CompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function markSection8_2BlitzPassed(uid: string): Promise<void> {
    await setDoc(flowDocRef(uid), {
        section8_2BlitzPassed: true,
        section8_2BlitzPassedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function markSection8_3Completed(uid: string): Promise<void> {
    await setDoc(flowDocRef(uid), {
        section8_3Completed: true,
        section8_3CompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

/* ── gating logic ────────────────────────────────────── */

/** Check if a step is unlocked based on progress. */
export function isStepUnlocked(stepId: FlowStepId, progress: Chapter8Progress): boolean {
    switch (stepId) {
        case '8_1_intro':
            return true; // always unlocked
        case '8_1':
            return progress.intro8_1Passed;
        case 'balance':
            return progress.section8_1Completed;
        case '8_2':
            return progress.balanceGameCompleted;
        case '8_2_blitz':
            return progress.section8_2Completed;
        case '8_3':
            return progress.section8_2BlitzPassed;
        default:
            return false;
    }
}

/** Check if a step is completed based on progress. */
export function isStepCompleted(stepId: FlowStepId, progress: Chapter8Progress): boolean {
    switch (stepId) {
        case '8_1_intro':
            return progress.intro8_1Passed;
        case '8_1':
            return progress.section8_1Completed;
        case 'balance':
            return progress.balanceGameCompleted;
        case '8_2':
            return progress.section8_2Completed;
        case '8_2_blitz':
            return progress.section8_2BlitzPassed;
        case '8_3':
            return progress.section8_3Completed;
        default:
            return false;
    }
}

/** Get the route for the next required (incomplete) step. */
export function getNextRequiredRoute(progress: Chapter8Progress): string {
    for (const step of CHAPTER_8_FLOW) {
        if (!isStepCompleted(step.id, progress)) {
            return step.route;
        }
    }
    // All complete — go to last step
    return CHAPTER_8_FLOW[CHAPTER_8_FLOW.length - 1].route;
}

/** Get the redirect route if a step is locked. Returns null if unlocked. */
export function getRedirectIfLocked(stepId: FlowStepId, progress: Chapter8Progress): string | null {
    if (isStepUnlocked(stepId, progress)) return null;
    return getNextRequiredRoute(progress);
}
