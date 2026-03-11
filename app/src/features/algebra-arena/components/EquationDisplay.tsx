/**
 * EquationDisplay — Current equation + step indicator
 */
import { eqToString, type GeneratedEquation } from '../engine/equationGenerator';

interface EquationDisplayProps {
    equation: GeneratedEquation;
    stepIndex: number;
}

export default function EquationDisplay({ equation, stepIndex }: EquationDisplayProps) {
    // Show the current equation state based on step index
    const currentEq = stepIndex === 0
        ? equation.equation
        : equation.solveSteps[stepIndex - 1].resultEquation;

    const totalSteps = equation.solveSteps.length;

    return (
        <div className="aa-equation-area">
            <div className="aa-equation">{eqToString(currentEq)}</div>
            {totalSteps > 1 && (
                <div className="aa-equation-step">
                    Stap {stepIndex + 1} van {totalSteps}
                </div>
            )}
        </div>
    );
}
