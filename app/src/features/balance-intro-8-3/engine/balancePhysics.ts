/**
 * Balance Physics — tilt angle computation.
 */
import type { Equation } from './equationEngine';
import { evalExpr } from './equationEngine';

/**
 * Compute the tilt angle of the balance scale.
 *
 * - Balanced: 0°
 * - Left heavier: negative (left side drops)
 * - Right heavier: positive (right side drops)
 *
 * Range clamped to ±15°.
 */
export function computeTiltAngle(eq: Equation, xValue: number): number {
    const leftW = evalExpr(eq.left, xValue);
    const rightW = evalExpr(eq.right, xValue);
    const diff = leftW - rightW;

    // Scale: 1 unit difference ≈ 3 degrees, clamped to ±15
    const raw = diff * 3;
    return Math.max(-15, Math.min(15, raw));
}

/**
 * Check if the equation is balanced (both sides equal).
 */
export function isBalanced(eq: Equation, xValue: number): boolean {
    const leftW = evalExpr(eq.left, xValue);
    const rightW = evalExpr(eq.right, xValue);
    return Math.abs(leftW - rightW) < 0.001;
}
