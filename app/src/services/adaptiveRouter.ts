/**
 * Adaptive Router — automatic route switching based on student performance.
 *
 * Rules (set by teacher):
 *   - Every student starts in D (Doorlopend) per paragraph
 *   - D → O: 4 wrong in the last 5 questions
 *   - D → U: First 5 questions all correct
 *   - O → D: 4 correct in the last 5 questions
 *   - U → D: 3 wrong in the last 5 questions
 *   - Max 2 route switches per session
 *   - Cross-session within paragraph: preserve route
 *   - Cross-paragraph: always reset to D
 *   - No manual override
 */

import type { RouteChoice } from './progress';

/* ── constants ──────────────────────────────────────── */

const WINDOW_SIZE = 5;
const DEMOTION_ERRORS = 4;   // 4 wrong in 5 → D→O
const PROMOTION_CORRECT = 5; // 5/5 correct in first 5 → D→U
const RECOVERY_CORRECT = 4;  // 4/5 correct → O→D
const FALLBACK_ERRORS = 3;   // 3/5 wrong → U→D
const MAX_SWITCHES = 2;

/* ── types ───────────────────────────────────────────── */

export interface AdaptiveState {
    currentRoute: 'O' | 'D' | 'U';
    /** Sliding window of recent answers (true = correct). Max length = WINDOW_SIZE. */
    answersWindow: boolean[];
    /** Number of route switches so far this session. */
    switchCount: number;
    /** Total questions answered this session. */
    totalAnswered: number;
    /** Total correct answers this session. */
    totalCorrect: number;
    /** If true, no more switches allowed (max reached). */
    isLocked: boolean;
}

export interface AdaptiveDecision {
    newRoute: 'O' | 'D' | 'U';
    switched: boolean;
    reason: string;
    /** Student-facing message (Dutch, positive tone). */
    message: string;
}

export interface RouteSwitch {
    from: 'O' | 'D' | 'U';
    to: 'O' | 'D' | 'U';
    reason: string;
    atQuestion: number;
    timestamp: unknown; // serverTimestamp when persisted
}

/* ── factory ─────────────────────────────────────────── */

/**
 * Create a fresh AdaptiveState. Used when starting a new paragraph
 * or when no snapshot exists.
 */
export function createAdaptiveState(startRoute: 'O' | 'D' | 'U' = 'D'): AdaptiveState {
    return {
        currentRoute: startRoute,
        answersWindow: [],
        switchCount: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        isLocked: false,
    };
}

/**
 * Restore an AdaptiveState from a Firestore snapshot.
 * The answersWindow resets on a new session, but the route & switchCount persist.
 */
export function restoreAdaptiveState(snapshot: {
    currentRoute: 'O' | 'D' | 'U';
    totalAnswered: number;
    totalCorrect: number;
    switchCount: number;
    isLocked: boolean;
}): AdaptiveState {
    return {
        currentRoute: snapshot.currentRoute,
        answersWindow: [], // fresh window for new session
        switchCount: snapshot.switchCount,
        totalAnswered: snapshot.totalAnswered,
        totalCorrect: snapshot.totalCorrect,
        isLocked: snapshot.isLocked,
    };
}

/* ── core evaluation ─────────────────────────────────── */

/**
 * Record a new answer and evaluate whether a route switch should occur.
 *
 * This function is PURE — it returns a new state + decision without side effects.
 */
export function recordAnswerAndEvaluate(
    state: AdaptiveState,
    isCorrect: boolean,
): { newState: AdaptiveState; decision: AdaptiveDecision } {
    // Update window (keep last WINDOW_SIZE answers)
    const newWindow = [...state.answersWindow, isCorrect];
    if (newWindow.length > WINDOW_SIZE) {
        newWindow.shift();
    }

    const newState: AdaptiveState = {
        ...state,
        answersWindow: newWindow,
        totalAnswered: state.totalAnswered + 1,
        totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
    };

    // If locked, no more switches
    if (state.isLocked) {
        return {
            newState,
            decision: noSwitch(state.currentRoute),
        };
    }

    const route = state.currentRoute;
    const windowCorrect = newWindow.filter(Boolean).length;
    const windowErrors = newWindow.length - windowCorrect;

    // ── PROMOTION: D → U ──────────────────────────────
    // First 5 questions all correct
    if (
        route === 'D' &&
        newState.totalAnswered === PROMOTION_CORRECT &&
        newState.totalCorrect === PROMOTION_CORRECT
    ) {
        return applySwitch(newState, 'U', 'Eerste 5 perfect',
            'Je snapt het! We geven je een extra uitdaging 🚀');
    }

    // ── DEMOTION: D → O ───────────────────────────────
    // 4 errors in the last 5
    if (
        route === 'D' &&
        newWindow.length >= WINDOW_SIZE &&
        windowErrors >= DEMOTION_ERRORS
    ) {
        return applySwitch(newState, 'O', '4 van 5 fout',
            'We helpen je even op weg met extra begeleiding 🤝');
    }

    // ── RECOVERY: O → D ──────────────────────────────
    // 4 correct in the last 5
    if (
        route === 'O' &&
        newWindow.length >= WINDOW_SIZE &&
        windowCorrect >= RECOVERY_CORRECT
    ) {
        return applySwitch(newState, 'D', 'Weer op koers',
            'Goed bezig! Je bent klaar voor de standaard route 💪');
    }

    // ── FALLBACK: U → D ──────────────────────────────
    // 3 errors in the last 5
    if (
        route === 'U' &&
        newWindow.length >= WINDOW_SIZE &&
        windowErrors >= FALLBACK_ERRORS
    ) {
        return applySwitch(newState, 'D', 'Even terug naar standaard',
            'We gaan even terug naar de standaard opgaven');
    }

    return { newState, decision: noSwitch(route) };
}

/* ── internal helpers ────────────────────────────────── */

function noSwitch(route: 'O' | 'D' | 'U'): AdaptiveDecision {
    return { newRoute: route, switched: false, reason: '', message: '' };
}

function applySwitch(
    state: AdaptiveState,
    to: 'O' | 'D' | 'U',
    reason: string,
    message: string,
): { newState: AdaptiveState; decision: AdaptiveDecision } {
    const newSwitchCount = state.switchCount + 1;
    const isNowLocked = newSwitchCount >= MAX_SWITCHES;

    return {
        newState: {
            ...state,
            currentRoute: to,
            answersWindow: [], // reset window after switch (cooldown)
            switchCount: newSwitchCount,
            isLocked: isNowLocked,
        },
        decision: {
            newRoute: to,
            switched: true,
            reason,
            message,
        },
    };
}

/* ── snapshot helpers ────────────────────────────────── */

/**
 * Create a serializable snapshot for Firestore persistence.
 */
export function toSnapshot(state: AdaptiveState) {
    return {
        currentRoute: state.currentRoute,
        totalAnswered: state.totalAnswered,
        totalCorrect: state.totalCorrect,
        switchCount: state.switchCount,
        isLocked: state.isLocked,
    };
}

/**
 * Get the non-null route from an adaptive state, cast to RouteChoice.
 */
export function getRouteChoice(state: AdaptiveState): RouteChoice {
    return state.currentRoute;
}
