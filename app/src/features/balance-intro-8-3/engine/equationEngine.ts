/**
 * Equation Engine — data model and operations for linear equations.
 *
 * Represents equations like: 2x + 5 = 13
 * as { left: { coeff: 2, constant: 5 }, right: { coeff: 0, constant: 13 } }
 */

export interface Expression {
    coeff: number;     // coefficient of variable (0 = no variable term)
    constant: number;  // standalone number
}

export interface Equation {
    left: Expression;
    right: Expression;
    variable: string;  // 'x', 'a', etc.
}

export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

export interface Operation {
    type: OperationType;
    value: number;
    label: string;      // display label: "−5 aan beide kanten"
}

/* ── helpers ──────────────────────────────────────────── */

export function exprToString(e: Expression, variable: string): string {
    const parts: string[] = [];

    if (e.coeff !== 0) {
        if (e.coeff === 1) parts.push(variable);
        else if (e.coeff === -1) parts.push(`-${variable}`);
        else parts.push(`${e.coeff}${variable}`);
    }

    if (e.constant !== 0) {
        if (parts.length > 0 && e.constant > 0) parts.push(`+ ${e.constant}`);
        else if (parts.length > 0 && e.constant < 0) parts.push(`- ${Math.abs(e.constant)}`);
        else parts.push(`${e.constant}`);
    }

    if (parts.length === 0) parts.push('0');

    return parts.join(' ');
}

export function eqToString(eq: Equation): string {
    return `${exprToString(eq.left, eq.variable)} = ${exprToString(eq.right, eq.variable)}`;
}

/** Evaluate expression given a value for the variable. */
export function evalExpr(e: Expression, xVal: number): number {
    return e.coeff * xVal + e.constant;
}

/** Apply an operation to both sides of an equation. */
export function applyOperation(eq: Equation, op: Operation): Equation {
    const apply = (e: Expression): Expression => {
        switch (op.type) {
            case 'add':
                return { coeff: e.coeff, constant: e.constant + op.value };
            case 'subtract':
                return { coeff: e.coeff, constant: e.constant - op.value };
            case 'multiply':
                return { coeff: e.coeff * op.value, constant: e.constant * op.value };
            case 'divide':
                return { coeff: e.coeff / op.value, constant: e.constant / op.value };
        }
    };

    return {
        left: apply(eq.left),
        right: apply(eq.right),
        variable: eq.variable,
    };
}

/** Subtract variable terms: remove `value` from coeff on both sides. */
export function subtractVariable(eq: Equation, value: number): Equation {
    return {
        left: { coeff: eq.left.coeff - value, constant: eq.left.constant },
        right: { coeff: eq.right.coeff - value, constant: eq.right.constant },
        variable: eq.variable,
    };
}

/** Check if equation is in solved form: x = number. */
export function isSolved(eq: Equation): boolean {
    return (
        (eq.left.coeff === 1 && eq.left.constant === 0 && eq.right.coeff === 0) ||
        (eq.right.coeff === 1 && eq.right.constant === 0 && eq.left.coeff === 0)
    );
}

/** Get the solution value if equation is solved. */
export function getSolution(eq: Equation): number | null {
    if (eq.left.coeff === 1 && eq.left.constant === 0 && eq.right.coeff === 0) {
        return eq.right.constant;
    }
    if (eq.right.coeff === 1 && eq.right.constant === 0 && eq.left.coeff === 0) {
        return eq.left.constant;
    }
    return null;
}

/** Create operation label in Dutch. */
export function opLabel(type: OperationType, value: number): string {
    switch (type) {
        case 'add': return `+${value} aan beide kanten`;
        case 'subtract': return `−${value} aan beide kanten`;
        case 'multiply': return `×${value} aan beide kanten`;
        case 'divide': return `÷${value} aan beide kanten`;
    }
}
