/**
 * Balance Engine — state model + actions for the Balans Minigame.
 *
 * State:  { bagsLeft, marblesLeft, bagsRight, marblesRight }
 * Actions: removeMarbles, removeBags, divide, undo
 * Micro-actions: removeOneFromSide (click-to-remove one tile/marble)
 */

/* ── types ───────────────────────────────────────────── */

export interface BalanceState {
    bagsLeft: number;
    marblesLeft: number;
    bagsRight: number;
    marblesRight: number;
}

export type ActionType = 'REMOVE_MARBLES' | 'REMOVE_BAGS' | 'DIVIDE';

export interface BalanceAction {
    type: ActionType;
    amount: number;
}

export type Side = 'left' | 'right';
export type TokenType = 'bag' | 'marble';

export interface MicroAction {
    side: Side;
    tokenType: TokenType;
}

/* ── one-sided micro-actions (direct manipulation) ──── */

/** Remove exactly 1 bag or marble from one side. Returns null if impossible. */
export function removeOneFromSide(
    state: BalanceState,
    side: Side,
    tokenType: TokenType,
): BalanceState | null {
    if (side === 'left') {
        if (tokenType === 'bag') {
            if (state.bagsLeft <= 0) return null;
            return { ...state, bagsLeft: state.bagsLeft - 1 };
        } else {
            if (state.marblesLeft <= 0) return null;
            return { ...state, marblesLeft: state.marblesLeft - 1 };
        }
    } else {
        if (tokenType === 'bag') {
            if (state.bagsRight <= 0) return null;
            return { ...state, bagsRight: state.bagsRight - 1 };
        } else {
            if (state.marblesRight <= 0) return null;
            return { ...state, marblesRight: state.marblesRight - 1 };
        }
    }
}

/** Check if the equation is balanced using the actual solution value. */
export function isBalanced(state: BalanceState, solutionValue: number): boolean {
    const left = state.bagsLeft * solutionValue + state.marblesLeft;
    const right = state.bagsRight * solutionValue + state.marblesRight;
    return left === right;
}

/* ── engine (both-sides actions, used by hint quick-actions) ── */


export function applyAction(state: BalanceState, action: BalanceAction): BalanceState | null {
    const { bagsLeft, marblesLeft, bagsRight, marblesRight } = state;

    switch (action.type) {
        case 'REMOVE_MARBLES': {
            const amt = action.amount;
            if (marblesLeft < amt || marblesRight < amt) return null;
            return {
                ...state,
                marblesLeft: marblesLeft - amt,
                marblesRight: marblesRight - amt,
            };
        }
        case 'REMOVE_BAGS': {
            const amt = action.amount;
            if (bagsLeft < amt || bagsRight < amt) return null;
            return {
                ...state,
                bagsLeft: bagsLeft - amt,
                bagsRight: bagsRight - amt,
            };
        }
        case 'DIVIDE': {
            const d = action.amount;
            if (d <= 1) return null;

            // Case 1: bags on left only, marbles on right only
            if (bagsLeft > 0 && bagsRight === 0 && marblesLeft === 0 && marblesRight > 0) {
                if (bagsLeft % d !== 0 || marblesRight % d !== 0) return null;
                return {
                    bagsLeft: bagsLeft / d,
                    marblesLeft: 0,
                    bagsRight: 0,
                    marblesRight: marblesRight / d,
                };
            }
            // Case 2: bags on right only, marbles on left only
            if (bagsRight > 0 && bagsLeft === 0 && marblesRight === 0 && marblesLeft > 0) {
                if (bagsRight % d !== 0 || marblesLeft % d !== 0) return null;
                return {
                    bagsLeft: 0,
                    marblesLeft: marblesLeft / d,
                    bagsRight: bagsRight / d,
                    marblesRight: 0,
                };
            }

            return null; // Division not applicable in this state
        }
        default:
            return null;
    }
}

/* ── queries ─────────────────────────────────────────── */

export function canRemoveMarbles(state: BalanceState, amount: number): boolean {
    return state.marblesLeft >= amount && state.marblesRight >= amount;
}

export function canRemoveBags(state: BalanceState, amount: number): boolean {
    return state.bagsLeft >= amount && state.bagsRight >= amount;
}

export function canDivide(state: BalanceState, divisor: number): boolean {
    if (divisor <= 1) return false;

    // Left bags, right marbles
    if (state.bagsLeft > 0 && state.bagsRight === 0 && state.marblesLeft === 0 && state.marblesRight > 0) {
        return state.bagsLeft % divisor === 0 && state.marblesRight % divisor === 0;
    }
    // Right bags, left marbles
    if (state.bagsRight > 0 && state.bagsLeft === 0 && state.marblesRight === 0 && state.marblesLeft > 0) {
        return state.bagsRight % divisor === 0 && state.marblesLeft % divisor === 0;
    }

    return false;
}

/** True when there is a divide-able state (bags on one side, marbles on other). */
export function isDividePhase(state: BalanceState): boolean {
    return (
        (state.bagsLeft > 0 && state.bagsRight === 0 && state.marblesLeft === 0 && state.marblesRight > 0) ||
        (state.bagsRight > 0 && state.bagsLeft === 0 && state.marblesRight === 0 && state.marblesLeft > 0)
    );
}

/** The puzzle is solved: exactly 1 bag on one side, only marbles on the other. */
export function isSolved(state: BalanceState): boolean {
    return (
        (state.bagsLeft === 1 && state.bagsRight === 0 && state.marblesLeft === 0 && state.marblesRight >= 0) ||
        (state.bagsRight === 1 && state.bagsLeft === 0 && state.marblesRight === 0 && state.marblesLeft >= 0)
    );
}

/** Get the solution value when solved. */
export function getSolution(state: BalanceState, varName: string = 'a'): string | null {
    if (state.bagsLeft === 1 && state.bagsRight === 0 && state.marblesLeft === 0) {
        return `${varName} = ${state.marblesRight}`;
    }
    if (state.bagsRight === 1 && state.bagsLeft === 0 && state.marblesRight === 0) {
        return `${varName} = ${state.marblesLeft}`;
    }
    return null;
}

/** Get the numeric solution value. */
export function getSolutionValue(state: BalanceState): number | null {
    if (state.bagsLeft === 1 && state.bagsRight === 0 && state.marblesLeft === 0) {
        return state.marblesRight;
    }
    if (state.bagsRight === 1 && state.bagsLeft === 0 && state.marblesRight === 0) {
        return state.marblesLeft;
    }
    return null;
}

/* ── display ─────────────────────────────────────────── */

/** Build the equation string: "3a + 6 = a + 14" */
export function deriveEquationString(state: BalanceState, varName: string = 'a'): string {
    const fmtSide = (bags: number, marbles: number): string => {
        const parts: string[] = [];
        if (bags > 0) {
            parts.push(bags === 1 ? varName : `${bags}${varName}`);
        }
        if (marbles > 0) {
            parts.push(`${marbles}`);
        }
        if (parts.length === 0) return '0';
        return parts.join(' + ');
    };

    return `${fmtSide(state.bagsLeft, state.marblesLeft)} = ${fmtSide(state.bagsRight, state.marblesRight)}`;
}

/**
 * Tilt angle (-12 to +12 degrees). Negative = left heavy, positive = right heavy.
 * Uses the actual solution value so the beam is perfectly horizontal whenever the
 * equation is truly balanced (L×sol + mL = R×sol + mR → 0°).
 */
export function tiltAngle(state: BalanceState, solutionValue: number): number {
    const leftTotal = state.bagsLeft * solutionValue + state.marblesLeft;
    const rightTotal = state.bagsRight * solutionValue + state.marblesRight;
    const diff = rightTotal - leftTotal;

    // Clamp to ±12 degrees
    const maxTilt = 12;
    if (diff === 0) return 0;
    const tilt = Math.sign(diff) * Math.min(Math.abs(diff) * 0.5, maxTilt);
    return tilt;
}

/* ── hint engine ─────────────────────────────────────── */

export function getHint(state: BalanceState): string {
    // Step 1: remove marbles (constants)
    if (state.marblesLeft > 0 && state.marblesRight > 0) {
        const minM = Math.min(state.marblesLeft, state.marblesRight);
        return `Tip: haal ${minM} knikker${minM !== 1 ? 's' : ''} weg aan beide kanten.`;
    }

    // Step 2: remove bags
    if (state.bagsLeft > 0 && state.bagsRight > 0) {
        const minB = Math.min(state.bagsLeft, state.bagsRight);
        return `Tip: haal ${minB} zakje${minB !== 1 ? 's' : ''} weg aan beide kanten.`;
    }

    // Step 3: divide
    if (isDividePhase(state)) {
        const bags = Math.max(state.bagsLeft, state.bagsRight);
        if (bags > 1) {
            return `Tip: verdeel alles in ${bags} gelijke groepjes (÷${bags}).`;
        }
    }

    // Solved
    if (isSolved(state)) {
        return 'Klaar! De vergelijking is opgelost!';
    }

    return 'Probeer knikkers of zakjes weg te halen aan beide kanten.';
}

/** Format an action for logging. */
export function formatAction(action: BalanceAction): string {
    switch (action.type) {
        case 'REMOVE_MARBLES':
            return `−${action.amount} knikkers`;
        case 'REMOVE_BAGS':
            return `−${action.amount} zakje${action.amount !== 1 ? 's' : ''}`;
        case 'DIVIDE':
            return `÷${action.amount}`;
    }
}
