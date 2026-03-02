import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/* ── types ───────────────────────────────────────────── */

export type ParagraphId = '8_1' | '8_2' | '8_3' | '8_4' | '8_5';
export type RouteChoice = 'O' | 'D' | 'U' | null;
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface ParagraphProgress {
    paragraphId: ParagraphId;
    status: ProgressStatus;
    route: RouteChoice;
    lastSeenAt: unknown;
    completedExercises: string[];
    updatedAt: unknown;
}

/* ── paragraph metadata ──────────────────────────────── */

export const PARAGRAPHS: { id: ParagraphId; title: string; subtitle: string }[] = [
    { id: '8_1', title: '§8.1', subtitle: 'Gelijksoortige termen' },
    { id: '8_2', title: '§8.2', subtitle: 'De balans' },
    { id: '8_3', title: '§8.3', subtitle: 'Oplossen met balans' },
    { id: '8_4', title: '§8.4', subtitle: 'Vergelijkingen oplossen' },
    { id: '8_5', title: '§8.5', subtitle: 'Het omslagpunt' },
];

/* ── helpers ──────────────────────────────────────────── */

function progressDocRef(uid: string, paragraphId: ParagraphId) {
    return doc(db, 'progress', uid, 'paragraphs', paragraphId);
}

/** Get progress for one paragraph. Returns null if not started. */
export async function getProgress(uid: string, paragraphId: ParagraphId): Promise<ParagraphProgress | null> {
    const snap = await getDoc(progressDocRef(uid, paragraphId));
    if (!snap.exists()) return null;
    return snap.data() as ParagraphProgress;
}

/** Get progress for all paragraphs. */
export async function getAllProgress(uid: string): Promise<Record<ParagraphId, ParagraphProgress | null>> {
    const result: Record<string, ParagraphProgress | null> = {};
    for (const p of PARAGRAPHS) {
        result[p.id] = null;
    }

    const colRef = collection(db, 'progress', uid, 'paragraphs');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
        result[d.id] = d.data() as ParagraphProgress;
    });

    return result as Record<ParagraphId, ParagraphProgress | null>;
}

/** Mark paragraph as opened / in_progress if not yet started, otherwise touch lastSeenAt. */
export async function touchProgress(uid: string, paragraphId: ParagraphId): Promise<void> {
    const ref = progressDocRef(uid, paragraphId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            paragraphId,
            status: 'in_progress',
            route: null,
            lastSeenAt: serverTimestamp(),
            completedExercises: [],
            updatedAt: serverTimestamp(),
        });
    } else {
        await setDoc(ref, {
            lastSeenAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }
}

/** Save chosen route. */
export async function saveRoute(uid: string, paragraphId: ParagraphId, route: RouteChoice): Promise<void> {
    await setDoc(progressDocRef(uid, paragraphId), {
        route,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

/** Mark paragraph as completed. */
export async function markCompleted(uid: string, paragraphId: ParagraphId): Promise<void> {
    await setDoc(progressDocRef(uid, paragraphId), {
        status: 'completed',
        updatedAt: serverTimestamp(),
    }, { merge: true });
}
