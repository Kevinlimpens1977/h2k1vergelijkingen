/**
 * §8.3 Practice Page — "Vergelijkingen oplossen met een balans" content runner
 *
 * Renders section8_3.items sequentially:
 *   mc, input, multiInput, order, balanceStep, theory
 *
 * Points: 4 (first try), 2 (after hint1), 1 (after hint2)
 * Completion: all items correct at least once → markSection8_3Completed (already done by Termtris)
 *
 * NOTE: This practice page does NOT mark 8.3 as "completed" in the flow —
 * that's done by Termtris. This page just marks uitleg8_3 as passed.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import { section8_3, } from '../content/ch8/section8_3';
import type { Task } from '../content/ch8/section8_2';
import { logAttempt, appendCompletedExercise } from '../services/attempts';
import { markUitleg8_3Passed } from '../services/chapter8Flow';
import { formatMathDisplay } from '../utils/formatMathDisplay';
import { splitEquationPrompt } from '../utils/formatPromptParts';
import { matchAnswer, matchMultiAnswer } from '../utils/mathValidator';
import { shuffleMCOptions } from '../utils/shuffleMC';
import './Practice.css';

type FeedbackState =
    | { type: 'none' }
    | { type: 'correct'; msg: string; pts: number }
    | { type: 'wrong'; msg: string }
    | { type: 'hint'; msg: string };

export default function PracticePage8_3() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();

    const items = section8_3.items;
    const [currentIdx, setCurrentIdx] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackState>({ type: 'none' });
    const [hintsUsed, setHintsUsed] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [saving, setSaving] = useState(false);
    const [sessionDone, setSessionDone] = useState(false);

    // MC / balanceStep
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Input
    const [inputValue, setInputValue] = useState('');

    // MultiInput
    const [multiValues, setMultiValues] = useState<Record<string, string>>({});

    // Order
    const [orderItems, setOrderItems] = useState<number[]>([]);

    const startTimeRef = useRef(Date.now());

    const current: Task | undefined = items[currentIdx];
    const progress = sessionDone ? 1 : currentIdx / items.length;

    useEffect(() => {
        startTimeRef.current = Date.now();
    }, [currentIdx]);

    const resetQuestion = useCallback(() => {
        setFeedback({ type: 'none' });
        setHintsUsed(0);
        setSelectedOption(null);
        setInputValue('');
        setMultiValues({});
        if (current?.type === 'order') {
            setOrderItems([...current.correctOrder].sort(() => Math.random() - 0.5));
        }
    }, [current]);

    useEffect(() => {
        resetQuestion();
    }, [currentIdx, resetQuestion]);

    /* ── points calc ──────────────────────────────────── */
    const getPoints = () => {
        const rule = current?.points ?? section8_3.pointsRule;
        if (hintsUsed === 0) return rule.firstTry;
        if (hintsUsed === 1) return rule.afterHint1;
        return rule.afterHint2;
    };

    /* ── hint handler ─────────────────────────────────── */
    const doHint = () => {
        if (!current) return;
        const nextHint = hintsUsed === 0 ? current.hint1 : current.hint2;
        if (nextHint) {
            setHintsUsed((h) => h + 1);
            setFeedback({ type: 'hint', msg: nextHint });
        }
    };

    /* ── submit / check answer ────────────────────────── */
    const handleSubmit = useCallback(async () => {
        if (!current || !profile || feedback.type === 'correct') return;

        let isCorrect = false;
        let studentAnswer = '';
        let correctAnswer = '';

        switch (current.type) {
            case 'mc': {
                if (selectedOption === null) return;
                const shuffled = shuffleMCOptions(current.options, current.correctIndex, current.id);
                isCorrect = selectedOption === shuffled.correctIndex;
                studentAnswer = shuffled.options[selectedOption];
                correctAnswer = shuffled.options[shuffled.correctIndex];
                break;
            }
            case 'input': {
                const trimmed = inputValue.trim();
                if (!trimmed) return;
                studentAnswer = trimmed;
                correctAnswer = current.answer;
                isCorrect = matchAnswer(trimmed, current.answer, current.accept);
                break;
            }
            case 'multiInput': {
                const allFilled = current.fields.every((f) => (multiValues[f.key] ?? '').trim());
                if (!allFilled) return;
                studentAnswer = JSON.stringify(multiValues);
                correctAnswer = JSON.stringify(current.answers);
                isCorrect = matchMultiAnswer(multiValues, current.answers, current.fields, current.accept);
                break;
            }
            case 'order': {
                studentAnswer = orderItems.join(',');
                correctAnswer = current.correctOrder.join(',');
                isCorrect = orderItems.every((v, i) => v === current.correctOrder[i]);
                break;
            }
            case 'balanceStep': {
                if (selectedOption === null) return;
                const chosen = current.choices[selectedOption];
                studentAnswer = chosen.label;
                correctAnswer = current.choices.find((c) => c.op === current.correctOp)?.label ?? current.correctOp;
                isCorrect = chosen.op === current.correctOp;
                break;
            }
        }

        const pts = isCorrect ? getPoints() : 0;

        if (isCorrect) {
            setTotalPoints((p) => p + pts);
            setFeedback({ type: 'correct', msg: current.explainCorrect ?? 'Goed!', pts });

            setSaving(true);
            try {
                await logAttempt(profile.uid, {
                    paragraphId: '8_3',
                    exerciseType: current.type,
                    prompt: current.prompt,
                    studentAnswer,
                    correctAnswer,
                    isCorrect: true,
                    errorTags: hintsUsed > 0 ? ['HINTS_USED'] : [],
                    durationMs: Date.now() - startTimeRef.current,
                    retries: 0,
                });
                await appendCompletedExercise(profile.uid, '8_3', current.id);
            } catch (e) {
                console.warn('Could not log attempt:', e);
            } finally {
                setSaving(false);
            }
        } else {
            setFeedback({ type: 'wrong', msg: current.explainWrong ?? 'Helaas, probeer opnieuw.' });
        }
    }, [current, profile, selectedOption, inputValue, multiValues, orderItems, feedback.type, hintsUsed]);

    /* ── next question ────────────────────────────────── */
    const handleNext = useCallback(async () => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= items.length) {
            setSessionDone(true);
            // Mark uitleg/practice completion
            if (profile) {
                try {
                    await markUitleg8_3Passed(profile.uid);
                } catch (e) {
                    console.warn('Could not mark 8.3 practice completed:', e);
                }
            }
        } else {
            setCurrentIdx(nextIdx);
        }
    }, [currentIdx, items.length, profile]);

    /* ── order drag helpers ────────────────────────────── */
    const moveOrderItem = (fromIdx: number, toIdx: number) => {
        const next = [...orderItems];
        const [removed] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, removed);
        setOrderItems(next);
    };


    /* ═══════════════════════════════════════════════════
       SESSION DONE
       ═══════════════════════════════════════════════════ */
    if (sessionDone) {
        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">⚖️</span>
                        <span>§8.3 Voltooid!</span>
                    </div>
                </header>
                <div className="y-main" style={{ maxWidth: 500, paddingTop: '2rem' }}>
                    <div className="y-card" style={{ textAlign: 'center', padding: '2rem', borderTop: '3px solid var(--y-success)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--y-success)', margin: '0 0 0.5rem' }}>
                            §8.3 Oefenen — Klaar!
                        </h2>
                        <p style={{ color: 'var(--y-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
                            Je hebt alle opgaven voltooid met {totalPoints} punten!
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <button className="y-btn y-btn--secondary" onClick={() => navigate('/')}>
                                ← Leerpad
                            </button>
                            <button className="y-btn y-btn--primary" onClick={() => navigate('/8-3/termtris')}>
                                🧱 Start Termtris
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Dev-mode skip navigation ─────────────────────── */
    const devSkip = (dir: -1 | 1) => {
        const next = currentIdx + dir;
        if (next < 0 || next >= items.length) return;
        setCurrentIdx(next);
        setFeedback({ type: 'none' });
        setHintsUsed(0);
        setSelectedOption(null);
        setInputValue('');
        setMultiValues({});
    };

    const DevNav = () => devMode ? (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #2d3436, #636e72)',
            borderTop: '2px solid #e17055',
            zIndex: 9999,
            fontSize: '0.8rem',
            color: '#fff',
        }}>
            <span style={{ fontWeight: 800, color: '#e17055', fontSize: '0.7rem' }}>DEV</span>
            <button
                onClick={() => devSkip(-1)}
                disabled={currentIdx === 0}
                style={{
                    padding: '0.25rem 0.6rem', borderRadius: '6px',
                    border: 'none', background: currentIdx === 0 ? '#555' : '#6c5ce7',
                    color: '#fff', fontWeight: 700, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                }}
            >◀ Vorige</button>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {currentIdx + 1}/{items.length}
            </span>
            <button
                onClick={() => devSkip(1)}
                disabled={currentIdx >= items.length - 1}
                style={{
                    padding: '0.25rem 0.6rem', borderRadius: '6px',
                    border: 'none', background: currentIdx >= items.length - 1 ? '#555' : '#6c5ce7',
                    color: '#fff', fontWeight: 700, cursor: currentIdx >= items.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                }}
            >Volgende ▶</button>
            <span style={{ fontSize: '0.65rem', color: '#b2bec3', marginLeft: '0.5rem' }}>
                {current?.id} ({current?.type})
            </span>
        </div>
    ) : null;

    if (!current) return null;

    /* ═══════════════════════════════════════════════════
       THEORY SLIDE
       ═══════════════════════════════════════════════════ */
    if (current.type === 'theory') {
        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">📖</span>
                        <span>§8.3 — Theorie</span>
                    </div>
                    <div className="y-topbar-user" style={{ gap: '0.5rem' }}>
                        {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}
                        <span className="y-topbar-number">
                            {currentIdx + 1}/{items.length}
                        </span>
                        <button onClick={() => navigate('/')} className="y-btn--ghost y-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                            ✕ Stop
                        </button>
                    </div>
                </header>

                <div className="y-progress" style={{ borderRadius: 0, height: 5 }}>
                    <div className="y-progress-fill" style={{ width: `${progress * 100}%` }} />
                </div>

                <div className="y-main" style={{ maxWidth: 700, paddingTop: '1.5rem', paddingBottom: devMode ? '4rem' : undefined }}>
                    {current.title && (
                        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                            <span className="y-badge y-badge--active" style={{ fontSize: '0.8rem', background: 'rgba(0,184,148,0.1)', color: '#00b894', border: '1px solid rgba(0,184,148,0.2)' }}>
                                {current.title}
                            </span>
                        </div>
                    )}

                    <div className="y-card" style={{
                        padding: '1.5rem',
                        borderTop: '3px solid #00b894',
                        marginBottom: '1rem',
                    }}>
                        {current.bookRef && (
                            <div style={{
                                display: 'inline-block',
                                marginBottom: '0.75rem',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '20px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: 'var(--y-muted)',
                                background: 'rgba(0,184,148,0.06)',
                                border: '1px solid rgba(0,184,148,0.15)',
                            }}>
                                📖 Boek p. {current.bookRef.page}
                                {current.bookRef.label && ` — ${current.bookRef.label}`}
                            </div>
                        )}

                        <p style={{
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            color: 'var(--y-text)',
                            lineHeight: 1.6,
                            margin: '0 0 1rem',
                            whiteSpace: 'pre-line',
                        }}>
                            {current.prompt}
                        </p>

                        {current.image && (
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={current.image}
                                    alt={current.title || 'Theorie'}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '400px',
                                        borderRadius: '10px',
                                        border: '1.5px solid var(--y-outline)',
                                        objectFit: 'contain',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                        <button
                            className="y-btn y-btn--primary"
                            onClick={handleNext}
                            style={{ fontSize: '1rem', padding: '0.7rem 2rem' }}
                        >
                            ✅ Begrepen — Volgende →
                        </button>
                    </div>
                </div>
                <DevNav />
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════
       PRACTICE UI
       ═══════════════════════════════════════════════════ */
    return (
        <div className="y-page">
            {/* top bar */}
            <header className="y-topbar">
                <div className="y-topbar-logo">
                    <span className="y-topbar-logo-icon">⚖️</span>
                    <span>§8.3 Vergelijkingen met balans</span>
                </div>
                <div className="y-topbar-user" style={{ gap: '0.5rem' }}>
                    {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}
                    <span className="y-topbar-badge">
                        {totalPoints} pts
                    </span>
                    <span className="y-topbar-number">
                        {currentIdx + 1}/{items.length}
                    </span>
                    <button onClick={() => navigate('/')} className="y-btn--ghost y-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                        ✕ Stop
                    </button>
                </div>
            </header>

            {/* progress bar */}
            <div className="y-progress" style={{ borderRadius: 0, height: 5 }}>
                <div className="y-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>

            <div className="y-main" style={{ maxWidth: 700, paddingTop: '1.5rem', paddingBottom: devMode ? '4rem' : undefined }}>
                {/* title badge */}
                {current.title && (
                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <span className="y-badge y-badge--active" style={{ fontSize: '0.75rem' }}>
                            {current.title}
                        </span>
                    </div>
                )}

                {/* prompt */}
                <div className="y-card" style={{ padding: '1.25rem 1.5rem', borderTop: '3px solid var(--y-primary)', marginBottom: '1rem' }}>
                    {/* book reference chip */}
                    {current.bookRef && (
                        <div style={{
                            display: 'inline-block',
                            marginBottom: '0.5rem',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--y-muted)',
                            background: 'rgba(108,92,231,0.06)',
                            border: '1px solid rgba(108,92,231,0.12)',
                            letterSpacing: '0.01em',
                        }}>
                            📖 Boek p. {current.bookRef.page}
                            {current.bookRef.exercise && ` – opgave ${current.bookRef.exercise}`}
                            {current.bookRef.label && ` (${current.bookRef.label})`}
                        </div>
                    )}
                    {/* book illustration */}
                    {current.image && (
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '0.75rem',
                        }}>
                            <img
                                src={current.image}
                                alt={current.title || 'Opgave afbeelding'}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    borderRadius: '10px',
                                    border: '1.5px solid var(--y-outline)',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>
                    )}
                    {(() => {
                        const parts = splitEquationPrompt(current.prompt);
                        if (parts.equation) {
                            return (
                                <>
                                    <div style={{ marginBottom: '0.35rem', padding: '0.5rem 1rem', background: 'rgba(108,92,231,0.05)', borderRadius: '10px', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center', color: 'var(--y-primary)' }}>
                                        {formatMathDisplay(parts.equation)}
                                    </div>
                                    {parts.question && (
                                        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--y-text)', margin: '0.25rem 0 0', textAlign: 'center' }}>
                                            {parts.question}
                                        </p>
                                    )}
                                    {parts.rest && (
                                        <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--y-text)', lineHeight: 1.5, margin: '0.25rem 0 0' }}>
                                            {formatMathDisplay(parts.rest)}
                                        </p>
                                    )}
                                </>
                            );
                        }
                        return (
                            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--y-text)', lineHeight: 1.5, margin: 0 }}>
                                {formatMathDisplay(current.prompt)}
                            </p>
                        );
                    })()}
                    {current.type === 'balanceStep' && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(108,92,231,0.06)', borderRadius: '10px', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', color: 'var(--y-primary)' }}>
                            {formatMathDisplay(current.equation)}
                        </div>
                    )}
                </div>

                {/* ── MC ──────────────────────────────────── */}
                {current.type === 'mc' && (() => {
                    const shuffled = shuffleMCOptions(current.options, current.correctIndex, current.id);
                    return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {shuffled.options.map((opt, i) => (
                            <button
                                key={i}
                                className={`y-btn ${selectedOption === i
                                    ? (feedback.type === 'correct' ? 'y-btn--success' : feedback.type === 'wrong' ? 'y-btn--danger' : 'y-btn--primary')
                                    : 'y-btn--secondary'
                                    }`}
                                onClick={() => { if (feedback.type !== 'correct') setSelectedOption(i); }}
                                disabled={feedback.type === 'correct'}
                                style={{ textAlign: 'left', padding: '0.75rem 1.25rem', fontSize: '1rem' }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    );
                })()}

                {/* ── Input ───────────────────────────────── */}
                {current.type === 'input' && (
                    <div>
                        <input
                            type="text"
                            className="y-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Typ je antwoord…"
                            disabled={feedback.type === 'correct'}
                            autoFocus
                            style={{ fontSize: '1.1rem', padding: '0.75rem 1rem', width: '100%', borderRadius: '12px', border: '2px solid var(--y-outline)', fontWeight: 600 }}
                        />
                    </div>
                )}

                {/* ── MultiInput ──────────────────────────── */}
                {current.type === 'multiInput' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {current.fields.map((f) => (
                            <div key={f.key}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--y-muted)', marginBottom: '0.25rem', display: 'block' }}>
                                    {f.label}
                                </label>
                                <input
                                    type="text"
                                    className="y-input"
                                    value={multiValues[f.key] ?? ''}
                                    onChange={(e) => setMultiValues((v) => ({ ...v, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder}
                                    disabled={feedback.type === 'correct'}
                                    style={{ fontSize: '1rem', padding: '0.6rem 1rem', width: '100%', borderRadius: '10px', border: '2px solid var(--y-outline)', fontWeight: 600 }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Order ───────────────────────────────── */}
                {current.type === 'order' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {orderItems.map((stepIdx, i) => (
                            <div key={stepIdx} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'var(--y-panel)', border: '2px solid var(--y-outline)',
                                borderRadius: '10px', padding: '0.6rem 1rem'
                            }}>
                                <span style={{ fontWeight: 800, color: 'var(--y-muted)', minWidth: '1.5rem' }}>{i + 1}.</span>
                                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem' }}>{current.steps[stepIdx]}</span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                        className="y-btn y-btn--ghost"
                                        onClick={() => i > 0 && moveOrderItem(i, i - 1)}
                                        disabled={i === 0 || feedback.type === 'correct'}
                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                                    >↑</button>
                                    <button
                                        className="y-btn y-btn--ghost"
                                        onClick={() => i < orderItems.length - 1 && moveOrderItem(i, i + 1)}
                                        disabled={i === orderItems.length - 1 || feedback.type === 'correct'}
                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                                    >↓</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── BalanceStep ─────────────────────────── */}
                {current.type === 'balanceStep' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {current.choices.map((ch, i) => (
                            <button
                                key={i}
                                className={`y-btn ${selectedOption === i
                                    ? (feedback.type === 'correct' ? 'y-btn--success' : feedback.type === 'wrong' ? 'y-btn--danger' : 'y-btn--primary')
                                    : 'y-btn--secondary'
                                    }`}
                                onClick={() => { if (feedback.type !== 'correct') setSelectedOption(i); }}
                                disabled={feedback.type === 'correct'}
                                style={{ textAlign: 'left', padding: '0.75rem 1.25rem', fontSize: '1rem' }}
                            >
                                {ch.label}
                            </button>
                        ))}
                        {feedback.type === 'correct' && current.nextEquation && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(0,184,148,0.06)', borderRadius: '10px', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center', color: 'var(--y-success)' }}>
                                → {formatMathDisplay(current.nextEquation)}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Feedback banner ─────────────────────── */}
                {feedback.type !== 'none' && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        textAlign: 'center',
                        background: feedback.type === 'correct'
                            ? 'rgba(0,184,148,0.08)'
                            : feedback.type === 'wrong'
                                ? 'rgba(225,112,85,0.06)'
                                : 'rgba(253,203,110,0.08)',
                        border: `1.5px solid ${feedback.type === 'correct'
                            ? 'rgba(0,184,148,0.2)'
                            : feedback.type === 'wrong'
                                ? 'rgba(225,112,85,0.2)'
                                : 'rgba(253,203,110,0.25)'
                            }`,
                        color: feedback.type === 'correct'
                            ? 'var(--y-success)'
                            : feedback.type === 'wrong'
                                ? '#e17055'
                                : '#e17055',
                        whiteSpace: 'pre-line',
                    }}>
                        {feedback.type === 'correct' && <span>✅ +{feedback.pts} </span>}
                        {feedback.type === 'wrong' && <span>❌ </span>}
                        {feedback.type === 'hint' && <span>💡 </span>}
                        {feedback.msg}
                    </div>
                )}

                {/* ── Action buttons ──────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
                    {feedback.type !== 'correct' && (
                        <>
                            <button
                                className="y-btn y-btn--ghost"
                                onClick={doHint}
                                disabled={hintsUsed >= 2 || (!current.hint1 && !current.hint2)}
                                style={{ fontSize: '0.9rem' }}
                            >
                                💡 Hint {hintsUsed > 0 ? `(${hintsUsed}/2)` : ''}
                            </button>
                            <button
                                className="y-btn y-btn--primary"
                                onClick={handleSubmit}
                                disabled={saving}
                                style={{ fontSize: '0.95rem', padding: '0.6rem 1.5rem' }}
                            >
                                {saving ? 'Opslaan…' : 'Nakijken'}
                            </button>
                        </>
                    )}
                    {feedback.type === 'correct' && (
                        <button
                            className="y-btn y-btn--primary"
                            onClick={handleNext}
                            style={{ fontSize: '0.95rem', padding: '0.6rem 1.5rem' }}
                        >
                            {currentIdx + 1 >= items.length ? '🎉 Afronden' : 'Volgende →'}
                        </button>
                    )}
                    {feedback.type === 'wrong' && (
                        <button
                            className="y-btn y-btn--secondary"
                            onClick={() => { setFeedback({ type: 'none' }); setSelectedOption(null); }}
                            style={{ fontSize: '0.9rem' }}
                        >
                            Opnieuw proberen
                        </button>
                    )}
                </div>
            </div>
            <DevNav />
        </div>
    );
}
