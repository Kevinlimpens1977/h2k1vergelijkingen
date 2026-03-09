/**
 * Letterrekenen Intro 🧩
 *
 * Route: /intro/letterrekenen
 * Purpose: Mandatory first module before chapter 8 flow.
 *
 * Features:
 *   - 3 stages (A/B/C), 25 questions + 1 info card
 *   - 5-second feedback lock after each answer (ONLY in this module)
 *   - Visible countdown + manual "Volgende" button after lock expires
 *   - Saves letterIntroCompleted to Firestore on completion
 *   - Routes to /8-1/intro after completion
 */

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    getChapter8Progress,
    markLetterIntroCompleted,
} from '../../services/chapter8Flow';
import {
    ALL_QUESTIONS,
    TOTAL_SCOREABLE,
    STAGE_LABELS,
    type LetterIntroQuestion,
} from '../../content/ch8/letterIntro';
import './LetterIntro.css';

const LOCK_SECONDS = 5;

type FeedbackState = 'none' | 'correct' | 'wrong';

export default function LetterIntroPage() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [questionIdx, setQuestionIdx] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<FeedbackState>('none');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completed, setCompleted] = useState(false);

    // 5-second lock
    const [lockCountdown, setLockCountdown] = useState(0);
    const [canProceed, setCanProceed] = useState(false);
    const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const question: LetterIntroQuestion | undefined = ALL_QUESTIONS[questionIdx];
    const totalQuestions = ALL_QUESTIONS.length;

    /* ── check if already completed ────────────────────── */
    useEffect(() => {
        if (!profile) return;
        (async () => {
            try {
                const progress = await getChapter8Progress(profile.uid);
                if (progress.letterIntroCompleted) {
                    // Already done — send to 8-1/intro
                    navigate('/8-1/intro', { replace: true });
                    return;
                }
            } catch (e) {
                console.warn('Could not load chapter8 progress:', e);
            }
            setLoading(false);
        })();
    }, [profile, navigate]);

    /* ── cleanup timer on unmount ──────────────────────── */
    useEffect(() => {
        return () => {
            if (lockTimerRef.current) clearInterval(lockTimerRef.current);
        };
    }, []);

    /* ── start 5-second lock ──────────────────────────── */
    const startLock = useCallback(() => {
        setLockCountdown(LOCK_SECONDS);
        setCanProceed(false);

        // Clear any existing timer
        if (lockTimerRef.current) clearInterval(lockTimerRef.current);

        let remaining = LOCK_SECONDS;
        lockTimerRef.current = setInterval(() => {
            remaining -= 1;
            setLockCountdown(remaining);
            if (remaining <= 0) {
                if (lockTimerRef.current) clearInterval(lockTimerRef.current);
                lockTimerRef.current = null;
                setCanProceed(true);
            }
        }, 1000);
    }, []);

    /* ── check answer ─────────────────────────────────── */
    const handleCheck = useCallback(() => {
        if (feedback !== 'none' || !question || question.isInfoCard) return;
        const parsed = parseInt(answer.trim(), 10);
        if (isNaN(parsed)) return;

        const correct = parsed === question.correctAnswer;

        if (correct) {
            setFeedback('correct');
            setScore(s => s + 1);
            setStreak(s => s + 1);
        } else {
            setFeedback('wrong');
            setStreak(0);
        }

        startLock();
    }, [answer, feedback, question, startLock]);

    /* ── advance to next question ─────────────────────── */
    const handleNext = useCallback(async () => {
        // Clear lock state
        if (lockTimerRef.current) {
            clearInterval(lockTimerRef.current);
            lockTimerRef.current = null;
        }
        setCanProceed(false);
        setLockCountdown(0);
        setFeedback('none');
        setAnswer('');

        const nextIdx = questionIdx + 1;
        if (nextIdx >= totalQuestions) {
            // All done!
            setCompleted(true);
            if (profile) {
                try {
                    await markLetterIntroCompleted(profile.uid);
                } catch (e) {
                    console.warn('Could not save letterIntro completion:', e);
                }
            }
        } else {
            setQuestionIdx(nextIdx);
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [questionIdx, totalQuestions, profile]);

    /* ── handle info card advance ─────────────────────── */
    const handleInfoNext = useCallback(() => {
        setQuestionIdx(prev => prev + 1);
    }, []);

    /* ── render: loading ──────────────────────────────── */
    if (loading) {
        return (
            <div className="li-page">
                <div className="li-loading">Laden…</div>
            </div>
        );
    }

    /* ── render: completed ────────────────────────────── */
    if (completed) {
        return (
            <div className="li-page">
                <div className="li-main">
                    <div className="li-complete-card">
                        <div className="li-complete-icon">🎉</div>
                        <h2>Letterrekenen Intro voltooid!</h2>
                        <p>
                            Je hebt {score} van de {TOTAL_SCOREABLE} vragen goed beantwoord.
                            {streak > 3 && ` Mooie streak van ${streak}! 🔥`}
                        </p>
                        <p>Je bent klaar om te beginnen met §8.1!</p>
                        <button
                            className="li-continue-btn"
                            onClick={() => navigate('/8-1/intro', { replace: true })}
                        >
                            Start §8.1 Intro →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!question) return null;

    /* ── render: info card (C0) ────────────────────────── */
    if (question.isInfoCard) {
        return (
            <div className="li-page">
                <header className="li-header">
                    <button onClick={() => navigate('/')} className="li-back">← Terug</button>
                    <div className="li-header-info">
                        <h1>Letterrekenen Intro 🧩</h1>
                        <span>Stap {questionIdx + 1}/{totalQuestions} • {STAGE_LABELS[question.stage]}</span>
                    </div>
                    <div className="li-stats">
                        <span className="li-streak">🔥 {streak}</span>
                        <span className="li-score">✓ {score}</span>
                    </div>
                </header>

                <div className="li-progress-bar">
                    <div className="li-progress-fill" style={{ width: `${(questionIdx / totalQuestions) * 100}%` }} />
                </div>
                <div className="li-progress-label">Stap {questionIdx + 1} / {totalQuestions}</div>

                <div className="li-main">
                    <div className="li-task-card li-info-card">
                        {question.prompt.map((line, i) => (
                            <div
                                key={i}
                                className={`li-prompt-line ${line === '' ? 'li-prompt-line--empty' : ''}`}
                            >
                                {line}
                            </div>
                        ))}
                        <button className="li-info-next-btn" onClick={handleInfoNext}>
                            Begrepen! Verder →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── render: normal question ───────────────────────── */
    return (
        <div className="li-page">
            <header className="li-header">
                <button onClick={() => navigate('/')} className="li-back">← Terug</button>
                <div className="li-header-info">
                    <h1>Letterrekenen Intro 🧩</h1>
                    <span>Stap {questionIdx + 1}/{totalQuestions} • {STAGE_LABELS[question.stage]}</span>
                </div>
                <div className="li-stats">
                    <span className="li-streak">🔥 {streak}</span>
                    <span className="li-score">✓ {score}</span>
                </div>
            </header>

            <div className="li-progress-bar">
                <div className="li-progress-fill" style={{ width: `${(questionIdx / totalQuestions) * 100}%` }} />
            </div>
            <div className="li-progress-label">Stap {questionIdx + 1} / {totalQuestions}</div>

            <div className="li-main">
                <div className="li-task-card" key={question.id}>
                    {/* stage badge */}
                    <div style={{ textAlign: 'center' }}>
                        <span className="li-stage-badge">Stage {question.stage}</span>
                    </div>

                    {/* prompt lines */}
                    <div className="li-prompt">
                        {question.prompt.map((line, i) => (
                            <div
                                key={i}
                                className={`li-prompt-line ${question.prompt.length > 1 ? 'li-prompt-line--equation' : ''}`}
                            >
                                {line}
                            </div>
                        ))}
                    </div>

                    {/* question */}
                    <div className="li-question-line">{question.question}</div>

                    {/* input */}
                    <form
                        className="li-input-group"
                        onSubmit={(e: FormEvent) => {
                            e.preventDefault();
                            if (answer.trim() && feedback === 'none') handleCheck();
                        }}
                        style={{ marginTop: '1rem' }}
                    >
                        <input
                            ref={inputRef}
                            className="li-input"
                            type="number"
                            inputMode="numeric"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="?"
                            autoFocus
                            disabled={feedback !== 'none'}
                        />
                        {feedback === 'none' && (
                            <button
                                type="submit"
                                className="li-check-btn"
                                disabled={!answer.trim()}
                            >
                                Nakijken
                            </button>
                        )}
                    </form>

                    {/* feedback banner */}
                    {feedback === 'correct' && (
                        <div className="li-feedback li-feedback--correct">
                            {question.explanationCorrect}
                        </div>
                    )}
                    {feedback === 'wrong' && (
                        <div className="li-feedback li-feedback--wrong">
                            {question.explanationWrong}
                            <div className="li-feedback-explanation">
                                Het goede antwoord is: <strong>{question.correctAnswer}</strong>
                            </div>
                        </div>
                    )}

                    {/* countdown + next button */}
                    {feedback !== 'none' && (
                        <div className="li-countdown-area">
                            {!canProceed && lockCountdown > 0 && (
                                <div className="li-countdown">
                                    Verder over {lockCountdown}…
                                </div>
                            )}
                            {canProceed && (
                                <button className="li-next-btn" onClick={handleNext}>
                                    Volgende →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
