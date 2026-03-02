/**
 * TERMTRIS QuestionCard — displays the current question + answer UI.
 *
 * KEY FIX: MC options are SHUFFLED so the correct answer isn't always first.
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
                <div style={{
                    textAlign: 'center', fontWeight: 800, fontSize: '1.1rem',
                    color: feedback === 'correct' ? 'var(--y-success)' : '#e17055',
                    animation: 'termtris-fadeIn 0.2s ease',
                }}>
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
                    background: 'rgba(253, 203, 110, 0.12)',
                    border: '1px solid rgba(253, 203, 110, 0.3)',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#e17055',
                    whiteSpace: 'nowrap',
                }}>
                    📖 Boek p. {question.bookRef.page} – {question.bookRef.exercise}
                    {question.bookRef.label && (
                        <span style={{ color: 'var(--y-muted)', fontWeight: 600, marginLeft: 2 }}>
                            · {question.bookRef.label}
                        </span>
                    )}
                </div>
            )}

            {/* Question card */}
            <div className="y-card" style={{
                padding: '1rem 1.25rem',
                borderTop: '3px solid var(--y-cyan)',
            }}>
                {equationLine && (
                    <div style={{
                        marginBottom: '0.4rem',
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(0,206,209,0.06)',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        color: 'var(--y-primary)',
                    }}>
                        {formatMathDisplay(equationLine)}
                    </div>
                )}
                <p style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--y-text)',
                    margin: 0,
                    textAlign: 'center',
                    lineHeight: 1.5,
                }}>
                    {formatMathDisplay(questionLine)}
                </p>
            </div>

            {/* MC options (SHUFFLED) */}
            {question.type === 'mc' && shuffled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {shuffled.shuffled.map((opt, displayIdx) => {
                        let btnClass = 'y-btn y-btn--secondary';
                        if (selectedDisplayIdx === displayIdx) {
                            btnClass = feedback === 'correct'
                                ? 'y-btn y-btn--success'
                                : feedback === 'wrong'
                                    ? 'y-btn y-btn--danger'
                                    : 'y-btn y-btn--primary';
                        }
                        return (
                            <button
                                key={displayIdx}
                                className={btnClass}
                                onClick={() => handleMcClick(displayIdx)}
                                disabled={!!feedback}
                                style={{
                                    textAlign: 'left',
                                    padding: '0.55rem 1rem',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {formatMathDisplay(opt)}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Input */}
            {question.type === 'input' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Typ je antwoord…"
                        disabled={!!feedback}
                        autoFocus
                        style={{
                            flex: 1,
                            fontSize: '1.05rem',
                            padding: '0.6rem 0.85rem',
                            borderRadius: 12,
                            border: '2px solid var(--y-outline)',
                            fontWeight: 600,
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                    />
                    <button
                        className="y-btn y-btn--primary"
                        onClick={handleSubmit}
                        disabled={!!feedback || !inputValue.trim()}
                        style={{ padding: '0.6rem 1.1rem' }}
                    >
                        ↵
                    </button>
                </div>
            )}
        </div>
    );
}
