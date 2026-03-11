/**
 * EquationColumn — vertical step-by-step equation display.
 *
 * Shows equations in BLUE and operations in RED, vertically downward.
 */

interface EquationStep {
    equation: string;
    operation?: string;
}

interface EquationColumnProps {
    steps: EquationStep[];
    currentStepIndex: number;
}

export default function EquationColumn({ steps, currentStepIndex }: EquationColumnProps) {
    return (
        <div className="bi-eq-column">
            {steps.map((step, i) => (
                <div
                    key={i}
                    className="bi-eq-step"
                    style={{
                        opacity: i <= currentStepIndex ? 1 : 0.3,
                        transition: 'opacity 0.3s',
                    }}
                >
                    {/* Equation line — BLUE */}
                    <div className="bi-eq-line">{step.equation}</div>

                    {/* Operation line — RED (if present and not last step) */}
                    {step.operation && (
                        <>
                            <div className="bi-eq-operation">
                                {step.operation}
                            </div>
                            <div className="bi-eq-divider" />
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export type { EquationStep };
