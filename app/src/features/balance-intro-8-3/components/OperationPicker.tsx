/**
 * OperationPicker — structured input for practice mode.
 *
 * Two-step UX:
 *   1. Click one of four large operation symbols (+, −, ×, ÷)
 *   2. Type the number value
 *   3. Hit "Controleer" or Enter
 *
 * Props:
 *   - onSubmit(type, value)  — called with the chosen operation
 *   - disabled               — locks all interaction
 *   - stepLabel              — prompt above the picker (e.g. "Wat is stap 1?")
 *   - wrongCount / maxWrong  — shows attempt counter
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { OperationType } from '../engine/equationEngine';

interface Props {
    onSubmit: (type: OperationType, value: number) => void;
    disabled?: boolean;
    stepLabel: string;
    wrongCount: number;
    maxWrong: number;
}

const SYMBOLS: { type: OperationType; symbol: string; label: string; color: string }[] = [
    { type: 'add',      symbol: '+', label: 'Optellen',          color: '#00b894' },
    { type: 'subtract', symbol: '−', label: 'Aftrekken',         color: '#e17055' },
    { type: 'multiply', symbol: '×', label: 'Vermenigvuldigen',  color: '#6c5ce7' },
    { type: 'divide',   symbol: '÷', label: 'Delen',             color: '#fdcb6e' },
];

export default function OperationPicker({ onSubmit, disabled, stepLabel, wrongCount, maxWrong }: Props) {
    const [selectedType, setSelectedType] = useState<OperationType | null>(null);
    const [numberValue, setNumberValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input after symbol selection
    useEffect(() => {
        if (selectedType) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [selectedType]);

    const handleSubmit = useCallback(() => {
        if (!selectedType || !numberValue.trim()) return;
        const val = parseInt(numberValue.trim(), 10);
        if (isNaN(val) || val <= 0) return;
        onSubmit(selectedType, val);
    }, [selectedType, numberValue, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Reset on new step (disabled toggles)
    useEffect(() => {
        if (!disabled) {
            setSelectedType(null);
            setNumberValue('');
        }
    }, [disabled]);

    const selectedInfo = SYMBOLS.find(s => s.type === selectedType);

    return (
        <div className="bi-op-picker">
            {/* Prompt */}
            <div className="bi-op-picker-prompt">{stepLabel}</div>
            <div className="bi-op-picker-sub">
                Kies de bewerking en vul het getal in:
            </div>

            {/* Symbol buttons */}
            <div className="bi-op-picker-symbols">
                {SYMBOLS.map((sym) => {
                    const isSelected = selectedType === sym.type;
                    return (
                        <button
                            key={sym.type}
                            className={`bi-op-symbol ${isSelected ? 'bi-op-symbol--active' : ''}`}
                            style={{
                                '--sym-color': sym.color,
                                '--sym-glow': `${sym.color}40`,
                            } as React.CSSProperties}
                            onClick={() => !disabled && setSelectedType(sym.type)}
                            disabled={disabled}
                            title={sym.label}
                        >
                            <span className="bi-op-symbol-char">{sym.symbol}</span>
                            <span className="bi-op-symbol-label">{sym.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Number input + submit — appears after symbol selection */}
            {selectedType && (
                <div className="bi-op-picker-value" style={{ animation: 'bi-slideIn 0.25s ease-out' }}>
                    <div className="bi-op-picker-preview">
                        <span className="bi-op-picker-preview-sym" style={{ color: selectedInfo?.color }}>
                            {selectedInfo?.symbol}
                        </span>
                        <input
                            ref={inputRef}
                            type="number"
                            min="1"
                            max="99"
                            className="bi-op-picker-number"
                            value={numberValue}
                            onChange={(e) => setNumberValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="?"
                            disabled={disabled}
                            autoComplete="off"
                        />
                        <span className="bi-op-picker-preview-label">
                            aan beide kanten
                        </span>
                    </div>

                    <div className="bi-actions" style={{ marginTop: '0.5rem' }}>
                        <button
                            className="bi-btn bi-btn--primary"
                            onClick={handleSubmit}
                            disabled={disabled || !numberValue.trim()}
                        >
                            Controleer
                        </button>
                        <button
                            className="bi-btn bi-btn--secondary"
                            onClick={() => { setSelectedType(null); setNumberValue(''); }}
                            disabled={disabled}
                            style={{ fontSize: '0.9rem' }}
                        >
                            ↩ Opnieuw kiezen
                        </button>
                    </div>
                </div>
            )}

            {/* Wrong attempt counter */}
            {wrongCount > 0 && wrongCount < maxWrong && (
                <div className="bi-op-picker-attempts">
                    Poging {wrongCount}/{maxWrong} — {maxWrong - wrongCount} kans{maxWrong - wrongCount !== 1 ? 'en' : ''} over
                </div>
            )}
        </div>
    );
}
