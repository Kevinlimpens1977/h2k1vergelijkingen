/**
 * TERMTRIS QuestionCard — displays the current question + answer UI.
 *
 * KEY FIX: MC options are SHUFFLED so the correct answer isn't always first.
 * Now uses Termtris.css classes for dark arcade styling.
 */

import { useState, useMemo } from 'react';
import { formatMathDisplay } from '../../../utils/formatMathDisplay';
import type { TermtrisQ } from '../../../content/ch8/termtris_8_3_bank';

interface QuestionCardProps {
    question: TermtrisQ;
    feedback: 'correct' | 'wrong' | null;
    lastPoints: number;
    onMcPick: (originalIndex: number) => void;
    onInputSubmit: (value: string) => void;
}

/** Shuffle an array and return mapping from new index to original index. */
function shuffleOptions(options: string[]): { shuffled: string[]; originalIndices: number[] } {
    const indices = options.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return {
        shuffled: indices.map(i => options[i]),
        originalIndices: indices,
    };
}

export default function QuestionCard({
    question,
    feedback,
    lastPoints,
    onMcPick,
    onInputSubmit,
}: QuestionCardProps) {
    const [inputValue, setInputValue] = useState('');
    const [selectedDisplayIdx, setSelectedDisplayIdx] = useState<number | null>(null);

    // Shuffle MC options ONCE per question (useMemo with question.id as key)
    const shuffled = useMemo(() => {
        if (question.type !== 'mc') return null;
        return shuffleOptions(question.options);
    }, [question.id]);

    const handleMcClick = (displayIdx: number) => {
        if (feedback || !shuffled) return;
        setSelectedDisplayIdx(displayIdx);
        const originalIdx = shuffled.originalIndices[displayIdx];
        onMcPick(originalIdx);
    };

    const handleSubmit = () => {
        if (feedback || !inputValue.trim()) return;
        onInputSubmit(inputValue.trim());
        setInputValue('');
    };

    // Split prompt by newline: first part is equation, second is question
    const promptLines = question.prompt.split('\n');
    const hasEquation = promptLines.length > 1;
    const equationLine = hasEquation ? promptLines[0] : null;
    const questionLine = hasEquation ? promptLines.slice(1).join(' ') : promptLines[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Feedback flash */}
            {feedback && (
                <div className={`tt-feedback ${feedback === 'correct' ? 'tt-feedback--correct' : 'tt-feedback--wrong'}`}>
                    {feedback === 'correct' ? `✅ +${lastPoints}` : `❌ ${lastPoints}`}
                </div>
            )}

            {/* BookRef chip */}
            {question.bookRef && (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    background: 'rgba(253, 203, 110, 0.1)',
                    border: '1px solid rgba(253, 203, 110, 0.25)',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#f97316',
                    whiteSpace: 'nowrap',
                }}>
                    📖 Boek p. {question.bookRef.page} – {question.bookRef.exercise}
                    {question.bookRef.label && (
                        <span style={{ color: 'rgba(226,232,240,0.5)', fontWeight: 600, marginLeft: 2 }}>
                            · {question.bookRef.label}
                        </span>
                    )}
                </div>
            )}

            {/* Question card */}
            <div className="tt-question-card">
                {equationLine && (
                    <div className="tt-equation-display">
                        {formatMathDisplay(equationLine)}
                    </div>
                )}
                <p className="tt-question-prompt" style={{ margin: 0 }}>
                    {formatMathDisplay(questionLine)}
                </p>
            </div>

            {/* MC options (SHUFFLED) */}
            {question.type === 'mc' && shuffled && (
                <div className="tt-options">
                    {shuffled.shuffled.map((opt, displayIdx) => {
                        let optClass = 'tt-option';
                        if (selectedDisplayIdx === displayIdx) {
                            if (feedback === 'correct') optClass += ' tt-option--correct';
                            else if (feedback === 'wrong') optClass += ' tt-option--wrong';
                        }
                        return (
                            <button
                                key={displayIdx}
                                className={optClass}
                                onClick={() => handleMcClick(displayIdx)}
                                disabled={!!feedback}
                            >
                                {formatMathDisplay(opt)}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Input */}
            {question.type === 'input' && (
                <div className="tt-input-row">
                    <input
                        className="tt-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Typ je antwoord…"
                        disabled={!!feedback}
                        autoFocus
                    />
                    <button
                        className="tt-submit-btn"
                        onClick={handleSubmit}
                        disabled={!!feedback || !inputValue.trim()}
                    >
                        ↵
                    </button>
                </div>
            )}
        </div>
    );
}
