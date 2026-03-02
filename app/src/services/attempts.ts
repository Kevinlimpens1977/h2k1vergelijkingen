/**
 * Firestore service for logging practice attempts and updating progress.
 *
 * Data model:
 *   /attempts/{uid}/items/{attemptId}
 *   /progress/{uid}/paragraphs/{paragraphId}.completedExercises
 */

import {
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    arrayUnion,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/* ── types ───────────────────────────────────────────── */

export interface AttemptDoc {
    paragraphId: string;
    exerciseType: string;
    prompt: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    errorTags: string[];
    createdAt: unknown; // serverTimestamp
    durationMs: number;
    retries: number;
}

/* ── log attempt ─────────────────────────────────────── */

/**
 * Log a single attempt to Firestore.
 * Returns the generated attemptId.
 */
export async function logAttempt(uid: string, data: Omit<AttemptDoc, 'createdAt'>): Promise<string> {
    const colRef = collection(db, 'attempts', uid, 'items');
    const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/* ── progress update ─────────────────────────────────── */

/**
 * Append an exerciseId to completedExercises for a paragraph
 * and update timestamps.
 */
export async function appendCompletedExercise(
    uid: string,
    paragraphId: string,
    exerciseId: string,
): Promise<void> {
    const ref = doc(db, 'progress', uid, 'paragraphs', paragraphId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        // Create the document if it doesn't exist
        await setDoc(ref, {
            paragraphId,
            status: 'in_progress',
            route: null,
            completedExercises: [exerciseId],
            lastSeenAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } else {
        await setDoc(ref, {
            completedExercises: arrayUnion(exerciseId),
            lastSeenAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }
}
