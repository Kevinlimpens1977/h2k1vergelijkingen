/**
 * OperationButtons — 2×2 grid with 1 correct + 3 distractors
 */
import { useState, useCallback } from 'react';
import type { Operation } from '../engine/equationGenerator';

interface OperationButtonsProps {
    options: Operation[];
    correctIndex: number;
    onSelect: (index: number) => void;
    disabled: boolean;
}

export default function OperationButtons({ options, correctIndex, onSelect, disabled }: OperationButtonsProps) {
    const [selected, setSelected] = useState<number | null>(null);

    const handleClick = useCallback((idx: number) => {
        if (disabled || selected !== null) return;
        setSelected(idx);
        onSelect(idx);
        // Reset selected after feedback
        setTimeout(() => setSelected(null), 800);
    }, [disabled, selected, onSelect]);

    return (
        <div className="aa-ops">
            <div className="aa-ops-prompt">Welke bewerking?</div>
            <div className="aa-ops-grid">
                {options.map((op, idx) => {
                    let cls = 'aa-op-btn';
                    if (selected !== null) {
                        if (idx === correctIndex) cls += ' aa-op-btn--correct';
                        else if (idx === selected && idx !== correctIndex) cls += ' aa-op-btn--wrong';
                    }
                    return (
                        <button
                            key={`${op.type}-${op.value}-${idx}`}
                            className={cls}
                            onClick={() => handleClick(idx)}
                            disabled={disabled || selected !== null}
                        >
                            {op.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
