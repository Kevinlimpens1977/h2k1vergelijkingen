import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Chapter8Progress } from './chapter8Flow';
import { CHAPTER_8_FLOW, isStepCompleted, type FlowStepId } from './chapter8Flow';
import { BOARD_IDS, getLeaderboard } from './unifiedLeaderboardService';

/* ── types ───────────────────────────────────────────── */

export interface StudentRow {
    uid: string;
    firstName: string;
    studentNumber: string;
    classId: string;
    /** Index 0–TOTAL in the flow (0 = niets af, TOTAL = alles af) */
    stepIndex: number;
    /** Human-readable label for the current step */
    stepLabel: string;
    /** Raw chapter8_flow data (for detail panel) */
    flowData: Chapter8Progress | null;
    /** Per-step completion map for detail panel */
    stepCompletion: Record<FlowStepId, boolean>;
    /** Whether letter-intro pre-gate is done */
    letterIntroDone: boolean;
    /** Last activity timestamp (updatedAt from flowData) */
    lastActivity: Date | null;
}

export type SignalType = 'check' | 'top' | 'extra' | 'slow' | null;

export interface SignalInfo {
    type: SignalType;
    emoji: string;
    label: string;
    color: string;
    bg: string;
}

export interface StudentDetail {
    /** Per-paragraph attempt stats */
    accuracy: number | null;
    totalAttempts: number;
    /** Game scores */
    gameScores: {
        boardId: string;
        boardLabel: string;
        bestScore: number;
        lastScore: number;
        attempts: number;
    }[];
}

/* ── step logic ──────────────────────────────────────── */

/** Total number of steps in the flow (excluding letterIntro pre-gate) */
export const TOTAL_STEPS = CHAPTER_8_FLOW.length;

/**
 * The canonical step chain — derived directly from CHAPTER_8_FLOW.
 * Each entry maps to a FlowStepId and its human-readable label.
 */
export const STEP_CHAIN: { id: FlowStepId; label: string; icon: string }[] =
    CHAPTER_8_FLOW.map((s) => ({ id: s.id, label: s.title, icon: s.icon }));

/**
 * Resolve the current step index + label for a student.
 * Returns { index: 0..TOTAL_STEPS, label }.
 * index === TOTAL_STEPS means "alles af".
 */
export function resolveStep(flow: Chapter8Progress | null): { index: number; label: string } {
    if (!flow) return { index: 0, label: STEP_CHAIN[0].label };

    for (let i = 0; i < STEP_CHAIN.length; i++) {
        if (!isStepCompleted(STEP_CHAIN[i].id, flow)) {
            return { index: i, label: STEP_CHAIN[i].label };
        }
    }
    return { index: TOTAL_STEPS, label: '✅ Alles af' };
}

/**
 * Build per-step completion map for a student.
 */
function buildStepCompletion(flow: Chapter8Progress | null): Record<FlowStepId, boolean> {
    const result = {} as Record<FlowStepId, boolean>;
    for (const step of STEP_CHAIN) {
        result[step.id] = flow ? isStepCompleted(step.id, flow) : false;
    }
    return result;
}

/* ── signal logic ────────────────────────────────────── */

const SIGNAL_MAP: Record<Exclude<SignalType, null>, SignalInfo> = {
    check: { type: 'check', emoji: '⚠️', label: 'Check', color: '#ff9f43', bg: 'rgba(255,159,67,0.1)' },
    top: { type: 'top', emoji: '🚀', label: 'Top', color: '#6c5ce7', bg: 'rgba(108,92,231,0.1)' },
    extra: { type: 'extra', emoji: '🔁', label: 'Oefent extra', color: '#00b894', bg: 'rgba(0,184,148,0.1)' },
    slow: { type: 'slow', emoji: '🐢', label: 'Rustig tempo', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export function getSignalInfo(type: SignalType): SignalInfo | null {
    if (!type) return null;
    return SIGNAL_MAP[type];
}

/**
 * Compute signal for a student.
 * Requires classAvgStepIndex for relative comparison.
 * accuracy and gameAttempts are optional (lazy-loaded).
 */
export function computeSignal(
    student: StudentRow,
    classAvgStepIndex: number,
    accuracy: number | null,
    gameAttempts: number,
): SignalType {
    // Priority 1: ⚠️ Check
    if (accuracy !== null && accuracy < 50) return 'check';
    if (student.stepIndex <= classAvgStepIndex - 2) return 'check';

    // Priority 2: 🚀 Top
    if (accuracy !== null && accuracy >= 90 && student.stepIndex >= Math.floor(TOTAL_STEPS * 0.4)) return 'top';

    // Priority 3: 🔁 Oefent extra
    if (gameAttempts >= 3 && student.stepIndex > 0) return 'extra';

    // Priority 4: 🐢 Rustig tempo
    if (student.stepIndex < classAvgStepIndex - 1 && (accuracy === null || accuracy >= 60)) return 'slow';

    return null;
}

/* ── data fetching ───────────────────────────────────── */

/**
 * Fetch all students in a class with their chapter8_flow progress.
 *
 * Strategy: Dual-path discovery
 * 1. Try users collection query (works if Firestore rules allow it)
 * 2. If that fails, discover UIDs via leaderboard scores (always permitted)
 *    and enrich with individual user doc reads
 */
export async function fetchClassDashboard(classId: string): Promise<StudentRow[]> {
    let students: { uid: string; firstName: string; studentNumber: string; classId: string }[] = [];

    // ── Step 1: Discover students ──────────────────────

    // Path A: Try direct users query
    try {
        const usersQuery = query(
            collection(db, 'users'),
            where('classId', '==', classId),
        );
        const usersSnap = await getDocs(usersQuery);

        usersSnap.forEach((d) => {
            const data = d.data();
            students.push({
                uid: d.id,
                firstName: data.firstName ?? '',
                studentNumber: data.studentNumber ?? d.id.slice(0, 6),
                classId: data.classId ?? classId,
            });
        });
    } catch (err) {
        console.warn('Dashboard: users query blocked by rules, falling back to leaderboard discovery', err);
    }

    // Path B: If no students found, discover via leaderboard
    if (students.length === 0) {
        const boardIds = Object.values(BOARD_IDS);
        const uidMap = new Map<string, { firstName: string }>();

        const boardPromises = boardIds.map(async (boardId) => {
            try {
                const entries = await getLeaderboard(boardId, classId, 100);
                entries.forEach((e) => {
                    if (!uidMap.has(e.uid)) {
                        uidMap.set(e.uid, { firstName: e.firstName });
                    }
                });
            } catch { /* ignore */ }
        });
        await Promise.all(boardPromises);

        const enrichPromises = Array.from(uidMap.entries()).map(async ([uid, info]) => {
            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    return {
                        uid,
                        firstName: data.firstName ?? info.firstName,
                        studentNumber: data.studentNumber ?? uid.slice(0, 6),
                        classId: data.classId ?? classId,
                    };
                }
            } catch { /* individual read failed */ }
            return {
                uid,
                firstName: info.firstName,
                studentNumber: uid.slice(0, 6),
                classId,
            };
        });

        students = await Promise.all(enrichPromises);
    }

    if (students.length === 0) return [];

    // ── Step 2: Try reading chapter8_flow docs ──────────

    const flowPromises = students.map(async (s) => {
        try {
            const flowRef = doc(db, 'progress', s.uid, 'paragraphs', 'chapter8_flow');
            const snap = await getDoc(flowRef);
            if (snap.exists()) return snap.data() as Chapter8Progress;
        } catch (err) {
            console.warn(`Dashboard: chapter8_flow read blocked for ${s.uid}`, err);
        }
        return null;
    });

    const flows = await Promise.all(flowPromises);

    // ── Step 3: Infer progress from leaderboard if flow data is missing ──

    const boardIds = Object.values(BOARD_IDS);
    const studentBoardPresence = new Map<string, Set<string>>();

    const boardPromises = boardIds.map(async (boardId) => {
        try {
            const entries = await getLeaderboard(boardId, classId, 100);
            entries.forEach((e) => {
                if (!studentBoardPresence.has(e.uid)) {
                    studentBoardPresence.set(e.uid, new Set());
                }
                studentBoardPresence.get(e.uid)!.add(boardId);
            });
        } catch { /* ignore */ }
    });
    await Promise.all(boardPromises);

    // ── Step 4: Build rows with best available data ─────

    return students.map((s, i) => {
        let flowData = flows[i];

        // If no flow data from Firestore, infer from leaderboard
        if (!flowData) {
            const boards = studentBoardPresence.get(s.uid);
            if (boards && boards.size > 0) {
                flowData = {
                    letterIntroCompleted: true,
                    letterIntroCompletedAt: null,
                    intro8_1Passed: boards.has('termen_quest_8_1') || boards.has('speedtest_8_1'),
                    intro8_1PassedAt: null,
                    section8_1Completed: boards.has('termen_quest_8_1') || boards.has('speedtest_8_1'),
                    section8_1CompletedAt: null,
                    balanceGameCompleted: boards.has('balance_challenge'),
                    balanceGameCompletedAt: null,
                    section8_2Completed: boards.has('balansblitz_8_2'),
                    section8_2CompletedAt: null,
                    fruitChallengeCompleted: false,
                    fruitChallengeCompletedAt: null,
                    section8_2BlitzPassed: boards.has('balansblitz_8_2'),
                    section8_2BlitzPassedAt: null,
                    balanceIntro8_3Passed: boards.has('termtris_8_3'),
                    balanceIntro8_3PassedAt: null,
                    uitleg8_3Passed: boards.has('termtris_8_3'),
                    uitleg8_3PassedAt: null,
                    section8_3Completed: boards.has('termtris_8_3'),
                    section8_3CompletedAt: null,
                    algebraArenaCompleted: boards.has('algebra_arena'),
                    algebraArenaCompletedAt: null,
                    updatedAt: null,
                } as Chapter8Progress;
            }
        }

        const { index, label } = resolveStep(flowData);
        const stepCompletion = buildStepCompletion(flowData);

        // Extract last activity time
        let lastActivity: Date | null = null;
        if (flowData?.updatedAt) {
            const ts = flowData.updatedAt as { toDate?: () => Date; seconds?: number };
            if (ts.toDate) lastActivity = ts.toDate();
            else if (ts.seconds) lastActivity = new Date(ts.seconds * 1000);
        }

        return {
            ...s,
            stepIndex: index,
            stepLabel: label,
            flowData,
            stepCompletion,
            letterIntroDone: !!flowData?.letterIntroCompleted,
            lastActivity,
        };
    });
}

/**
 * Lazy-load detail data for a single student.
 */
export async function fetchStudentDetail(uid: string): Promise<StudentDetail> {
    // Fetch attempts
    const attemptsRef = collection(db, 'attempts', uid, 'items');
    const attemptsSnap = await getDocs(attemptsRef);

    let correct = 0;
    let total = 0;
    attemptsSnap.forEach((d) => {
        const data = d.data();
        total++;
        if (data.isCorrect) correct++;
    });

    // Fetch game scores
    const boardIds = Object.values(BOARD_IDS);
    const boardLabels: Record<string, string> = {
        termen_quest_8_1: 'Termen Quest',
        speedtest_8_1: 'Speed Test',
        balance_challenge: 'Balans Minigame',
        balansblitz_8_2: 'Balans Blitz h8',
        termtris_8_3: 'Termtris',
        algebra_arena: 'Algebra Arena',
    };

    const gamePromises = boardIds.map(async (boardId) => {
        try {
            const scoreRef = doc(db, 'leaderboard', boardId, 'scores', uid);
            const snap = await getDoc(scoreRef);
            if (!snap.exists()) return null;
            const d = snap.data();
            return {
                boardId,
                boardLabel: boardLabels[boardId] ?? boardId,
                bestScore: d.bestScore ?? 0,
                lastScore: d.lastScore ?? 0,
                attempts: d.attempts ?? 0,
            };
        } catch {
            return null;
        }
    });

    const games = (await Promise.all(gamePromises)).filter(Boolean) as StudentDetail['gameScores'];

    return {
        accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
        totalAttempts: total,
        gameScores: games,
    };
}

/**
 * Fetch total game attempts for a student (used for signal calculation).
 * Lighter than full detail — only counts attempts across boards.
 */
export async function fetchGameAttempts(uid: string): Promise<number> {
    const boardIds = Object.values(BOARD_IDS);
    let total = 0;

    const promises = boardIds.map(async (boardId) => {
        try {
            const scoreRef = doc(db, 'leaderboard', boardId, 'scores', uid);
            const snap = await getDoc(scoreRef);
            if (snap.exists()) {
                total += snap.data().attempts ?? 0;
            }
        } catch { /* ignore */ }
    });

    await Promise.all(promises);
    return total;
}
