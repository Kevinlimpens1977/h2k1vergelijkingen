/**
 * §8.2 Balans Blitz — Timed challenge minigame
 *
 * 4-minute timer, random questions from BALANS_BLITZ_8_2 bank.
 * Scoring:  correct ≤4s → +3,  ≤8s → +2,  later → +1,  wrong → -1
 * Streak:   every 5 correct → +5 bonus
 * Pass:     score ≥ 25 → section8_2_blitz_passed = true
 *
 * Class Top 3 leaderboard (realtime) + confetti on top-3 entry.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import { BALANS_BLITZ_8_2, type BlitzQ } from '../content/ch8/balansBlitz_8_2_bank';
import { markSection8_2BlitzPassed } from '../services/chapter8Flow';
import {
    subscribeBlitzLeaderboard,
    updateBlitzScore,
    type BlitzLBEntry,
} from '../services/blitzLeaderboardService';
import { formatMathDisplay } from '../utils/formatMathDisplay';
import { splitEquationPrompt } from '../utils/formatPromptParts';
import './Practice.css';

const TIMER_SECONDS = 240; // 4 minutes
const PASS_SCORE = 25;

type Phase = 'ready' | 'playing' | 'ended';

function shuffleBank(): BlitzQ[] {
    return [...BALANS_BLITZ_8_2].sort(() => Math.random() - 0.5);
}

export default function BalansBlitz8_2() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();

    const [phase, setPhase] = useState<Phase>('ready');
    const [questions] = useState<BlitzQ[]>(() => shuffleBank());
    const [qIdx, setQIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [lastPoints, setLastPoints] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Leaderboard
    const [leaderboard, setLeaderboard] = useState<BlitzLBEntry[]>([]);
    const [enteredTop3, setEnteredTop3] = useState(false);
    const unsubRef = useRef<(() => void) | null>(null);

    const questionStartRef = useRef(0);

    const question = questions[qIdx % questions.length];

    /* ── leaderboard subscription ─────────────────────── */
    useEffect(() => {
        if (!profile?.classId) return;
        const unsub = subscribeBlitzLeaderboard(profile.classId, 10, setLeaderboard);
        unsubRef.current = unsub;
        return () => unsub();
    }, [profile?.classId]);

    /* ── timer ────────────────────────────────────────── */
    useEffect(() => {
        if (phase !== 'playing') return;
        if (timeLeft <= 0) {
            endGame();
            return;
        }
        const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [phase, timeLeft]);

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    /* ── start ────────────────────────────────────────── */
    const startGame = () => {
        setPhase('playing');
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setCorrectCount(0);
        setWrongCount(0);
        setTimeLeft(TIMER_SECONDS);
        setQIdx(0);
        setFeedback(null);
        setInputValue('');
        setSelectedOption(null);
        setEnteredTop3(false);
        questionStartRef.current = Date.now();
    };

    /* ── end ──────────────────────────────────────────── */
    const endGame = useCallback(async () => {
        setPhase('ended');
        if (!profile) return;

        // Save score
        try {
            await updateBlitzScore(
                profile.uid,
                profile.firstName || '',
                profile.classId ?? null,
                score,
            );
        } catch (e) {
            console.warn('Could not save blitz score:', e);
        }

        // Mark passed if threshold met
        if (score >= PASS_SCORE) {
            try {
                await markSection8_2BlitzPassed(profile.uid);
            } catch (e) {
                console.warn('Could not mark blitz passed:', e);
            }
        }
    }, [profile, score]);

    /* ── answer check ─────────────────────────────────── */
    const checkAnswer = useCallback((isCorrect: boolean) => {
        if (phase !== 'playing') return;

        const elapsed = (Date.now() - questionStartRef.current) / 1000;

        if (isCorrect) {
            const pts = elapsed <= 4 ? 3 : elapsed <= 8 ? 2 : 1;
            const newStreak = streak + 1;
            let bonus = 0;
            if (newStreak > 0 && newStreak % 5 === 0) bonus = 5;

            setScore((s) => s + pts + bonus);
            setStreak(newStreak);
            setBestStreak((b) => Math.max(b, newStreak));
            setCorrectCount((c) => c + 1);
            setLastPoints(pts + bonus);
            setFeedback('correct');

            // Check top-3 entry
            if (!enteredTop3 && leaderboard.length >= 3) {
                const myNewBest = Math.max(score + pts + bonus, leaderboard.find(e => e.uid === profile?.uid)?.bestScore ?? 0);
                const threshold = leaderboard[2]?.bestScore ?? 0;
                if (myNewBest > threshold) {
                    setEnteredTop3(true);
                    fireConfetti();
                }
            }
        } else {
            setScore((s) => Math.max(0, s - 1));
            setStreak(0);
            setWrongCount((w) => w + 1);
            setLastPoints(-1);
            setFeedback('wrong');
        }

        // Next question after brief delay
        setTimeout(() => {
            setFeedback(null);
            setInputValue('');
            setSelectedOption(null);
            setQIdx((i) => i + 1);
            questionStartRef.current = Date.now();
        }, 600);
    }, [phase, streak, score, enteredTop3, leaderboard, profile?.uid]);

    /* ── confetti ─────────────────────────────────────── */
    const fireConfetti = () => {
        try {
            import('canvas-confetti').then((mod) => {
                const confetti = mod.default;
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            });
        } catch { /* no confetti fallback */ }
    };

    /* ── MC submit ────────────────────────────────────── */
    const handleMcPick = (idx: number) => {
        if (feedback || question.type !== 'mc') return;
        setSelectedOption(idx);
        checkAnswer(idx === question.correctIndex);
    };

    /* ── Input submit ─────────────────────────────────── */
    const handleInputSubmit = () => {
        if (feedback || question.type !== 'input') return;
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
        let correct = norm(trimmed) === norm(question.answer);
        if (!correct && question.accept) {
            correct = question.accept.some((a) => norm(trimmed) === norm(a));
        }
        checkAnswer(correct);
    };

    /* ── BalanceStep submit ───────────────────────────── */
    const handleStepPick = (idx: number) => {
        if (feedback || question.type !== 'balanceStep') return;
        setSelectedOption(idx);
        checkAnswer(question.options[idx].op === question.correctOp);
    };

    /* ── my rank ──────────────────────────────────────── */
    const myRank = profile ? leaderboard.findIndex((e) => e.uid === profile.uid) + 1 : 0;

    /* ═══════════════════════════════════════════════════
       READY SCREEN
       ═══════════════════════════════════════════════════ */
    if (phase === 'ready') {
        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">⚡</span>
                        <span>Balans Blitz</span>
                    </div>
                    <div className="y-topbar-user">
                        {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}
                        <button onClick={() => navigate('/')} className="y-btn--ghost y-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>← Terug</button>
                    </div>
                </header>

                <div className="y-banner">
                    <h1>⚡ Balans Blitz — §8.2</h1>
                    <p>Beantwoord zoveel mogelijk vragen in 4 minuten!</p>
                </div>

                <div className="y-main" style={{ maxWidth: 500 }}>
                    <div className="y-card" style={{ padding: '1.25rem', borderTop: '3px solid var(--y-cyan)', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--y-muted)', marginBottom: '0.75rem' }}>
                            <strong>Spelregels</strong>
                        </div>
                        <ul style={{ fontSize: '0.85rem', color: 'var(--y-text)', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
                            <li>⏱ 4 minuten</li>
                            <li>⚡ Snel goed: +3 (≤4s), +2 (≤8s), +1 (later)</li>
                            <li>❌ Fout: −1 punt</li>
                            <li>🔥 Streak: 5 op rij = +5 bonus</li>
                            <li>🏆 Score ≥ {PASS_SCORE} = gehaald!</li>
                        </ul>
                    </div>

                    {/* Top 3 preview */}
                    {leaderboard.length > 0 && (
                        <div className="y-card" style={{ padding: '1rem', borderTop: '3px solid var(--y-amber)', marginBottom: '1rem' }}>
                            <div className="y-section-label">Klas Top 3</div>
                            {leaderboard.slice(0, 3).map((e, i) => (
                                <div key={e.uid} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.35rem 0.5rem', borderRadius: '8px', fontSize: '0.85rem',
                                    background: e.uid === profile?.uid ? 'rgba(108,92,231,0.06)' : undefined,
                                }}>
                                    <span style={{ width: '1.5rem', textAlign: 'center', fontWeight: 800 }}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                    </span>
                                    <span style={{ flex: 1, fontWeight: 600 }}>{e.firstName}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--y-primary)' }}>{e.bestScore}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ textAlign: 'center' }}>
                        <button className="y-btn y-btn--primary" onClick={startGame} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                            ⚡ Start Blitz!
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════
       ENDED SCREEN
       ═══════════════════════════════════════════════════ */
    if (phase === 'ended') {
        const passed = score >= PASS_SCORE;
        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">⚡</span>
                        <span>Balans Blitz — Klaar!</span>
                    </div>
                </header>

                <div className="y-main" style={{ maxWidth: 500, paddingTop: '2rem' }}>
                    <div className="y-card" style={{ textAlign: 'center', padding: '2rem', borderTop: `3px solid ${passed ? 'var(--y-success)' : 'var(--y-danger)'}` }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{passed ? '🏆' : '💪'}</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: passed ? 'var(--y-success)' : 'var(--y-text)', margin: '0 0 0.25rem' }}>
                            {passed ? 'Gehaald!' : 'Niet gehaald'}
                        </h2>
                        {!passed && (
                            <p style={{ color: 'var(--y-muted)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                                Je hebt {PASS_SCORE - score} punten meer nodig. Probeer het nog eens!
                            </p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--y-primary)' }}>{score}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--y-muted)', textTransform: 'uppercase' }}>Score</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--y-success)' }}>{correctCount}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--y-muted)', textTransform: 'uppercase' }}>Goed</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e17055' }}>{wrongCount}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--y-muted)', textTransform: 'uppercase' }}>Fout</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--y-cyan)' }}>🔥{bestStreak}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--y-muted)', textTransform: 'uppercase' }}>Streak</div>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        {leaderboard.length > 0 && (
                            <div style={{ margin: '1rem 0', textAlign: 'left' }}>
                                <div className="y-section-label">Klas Top 10</div>
                                {leaderboard.slice(0, 10).map((e, i) => (
                                    <div key={e.uid} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.4rem 0.5rem', borderRadius: '8px', fontSize: '0.85rem',
                                        background: e.uid === profile?.uid ? 'rgba(108,92,231,0.06)' : 'transparent',
                                        fontWeight: e.uid === profile?.uid ? 800 : 500,
                                    }}>
                                        <span style={{ width: '1.5rem', textAlign: 'center', fontWeight: 800 }}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                                        </span>
                                        <span style={{ flex: 1, textAlign: 'left' }}>{e.firstName}</span>
                                        <span style={{ color: 'var(--y-primary)', fontWeight: 700 }}>{e.bestScore}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <button className="y-btn y-btn--secondary" onClick={() => navigate('/')}>
                                ← Leerpad
                            </button>
                            <button className="y-btn y-btn--primary" onClick={startGame}>
                                🔄 Nog een ronde
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════
       PLAYING SCREEN
       ═══════════════════════════════════════════════════ */
    return (
        <div className="y-page">
            <header className="y-topbar">
                <div className="y-topbar-logo">
                    <span className="y-topbar-logo-icon">⚡</span>
                    <span>Balans Blitz</span>
                </div>
                <div className="y-topbar-user" style={{ gap: '0.5rem' }}>
                    {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}

                    <span style={{
                        fontWeight: 800, fontSize: '0.9rem',
                        color: timeLeft <= 30 ? 'var(--y-danger)' : 'var(--y-text)',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        ⏱ {formatTime(timeLeft)}
                    </span>

                    <span style={{ fontWeight: 800, color: 'var(--y-primary)', fontSize: '0.9rem' }}>
                        {score} pts
                    </span>

                    {streak > 0 && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e17055' }}>
                            🔥{streak}
                        </span>
                    )}
                </div>
            </header>

            {/* Timer progress */}
            <div className="y-progress" style={{ borderRadius: 0, height: 5 }}>
                <div className="y-progress-fill" style={{
                    width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
                    background: timeLeft <= 30 ? 'var(--y-danger)' : undefined,
                    transition: 'width 1s linear',
                }} />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', maxWidth: 900, margin: '0 auto', padding: '1.5rem 1.5rem', width: '100%' }}>
                {/* Main question area */}
                <div style={{ flex: 1 }}>
                    {/* Feedback flash */}
                    {feedback && (
                        <div style={{
                            textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem',
                            color: feedback === 'correct' ? 'var(--y-success)' : '#e17055',
                            animation: 'bal-fadeIn 0.2s ease',
                        }}>
                            {feedback === 'correct' ? `✅ +${lastPoints}` : `❌ ${lastPoints}`}
                        </div>
                    )}

                    {/* Question card */}
                    <div className="y-card" style={{ padding: '1.25rem 1.5rem', borderTop: '3px solid var(--y-cyan)', marginBottom: '1rem' }}>
                        {(() => {
                            const parts = splitEquationPrompt(question.prompt);
                            if (parts.equation) {
                                return (
                                    <>
                                        <div style={{ marginBottom: '0.35rem', padding: '0.5rem 1rem', background: 'rgba(0,206,209,0.06)', borderRadius: '10px', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center', color: 'var(--y-primary)' }}>
                                            {formatMathDisplay(parts.equation)}
                                        </div>
                                        {parts.question && (
                                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--y-text)', margin: '0.25rem 0 0', textAlign: 'center' }}>
                                                {parts.question}
                                            </p>
                                        )}
                                        {parts.rest && (
                                            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--y-text)', lineHeight: 1.5, margin: '0.25rem 0 0' }}>
                                                {formatMathDisplay(parts.rest)}
                                            </p>
                                        )}
                                    </>
                                );
                            }
                            return (
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--y-text)', lineHeight: 1.5, margin: 0 }}>
                                    {formatMathDisplay(question.prompt)}
                                </p>
                            );
                        })()}
                        {question.type === 'balanceStep' && (
                            <div style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(108,92,231,0.06)', borderRadius: '10px', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', color: 'var(--y-primary)' }}>
                                {formatMathDisplay(question.equation)}
                            </div>
                        )}
                    </div>

                    {/* MC options */}
                    {question.type === 'mc' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {question.options.map((opt, i) => (
                                <button
                                    key={i}
                                    className={`y-btn ${selectedOption === i
                                        ? (feedback === 'correct' ? 'y-btn--success' : feedback === 'wrong' ? 'y-btn--danger' : 'y-btn--primary')
                                        : 'y-btn--secondary'
                                        }`}
                                    onClick={() => handleMcPick(i)}
                                    disabled={!!feedback}
                                    style={{ textAlign: 'left', padding: '0.7rem 1.25rem', fontSize: '1rem' }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    {question.type === 'input' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                                placeholder="Typ je antwoord…"
                                disabled={!!feedback}
                                autoFocus
                                style={{ flex: 1, fontSize: '1.1rem', padding: '0.7rem 1rem', borderRadius: '12px', border: '2px solid var(--y-outline)', fontWeight: 600 }}
                            />
                            <button
                                className="y-btn y-btn--primary"
                                onClick={handleInputSubmit}
                                disabled={!!feedback || !inputValue.trim()}
                                style={{ padding: '0.7rem 1.25rem' }}
                            >
                                ↵
                            </button>
                        </div>
                    )}

                    {/* BalanceStep */}
                    {question.type === 'balanceStep' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {question.options.map((opt, i) => (
                                <button
                                    key={i}
                                    className={`y-btn ${selectedOption === i
                                        ? (feedback === 'correct' ? 'y-btn--success' : feedback === 'wrong' ? 'y-btn--danger' : 'y-btn--primary')
                                        : 'y-btn--secondary'
                                        }`}
                                    onClick={() => handleStepPick(i)}
                                    disabled={!!feedback}
                                    style={{ textAlign: 'left', padding: '0.7rem 1.25rem', fontSize: '1rem' }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: compact Top 3 */}
                {leaderboard.length > 0 && (
                    <div style={{ width: 200, flexShrink: 0 }}>
                        <div className="y-card" style={{ padding: '0.75rem', borderTop: '3px solid var(--y-amber)' }}>
                            <div className="y-section-label" style={{ fontSize: '0.7rem' }}>Top 3</div>
                            {leaderboard.slice(0, 3).map((e, i) => (
                                <div key={e.uid} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.25rem 0.4rem', borderRadius: '6px', fontSize: '0.78rem',
                                    background: e.uid === profile?.uid ? 'rgba(108,92,231,0.06)' : undefined,
                                }}>
                                    <span style={{ width: '1.2rem', textAlign: 'center', fontWeight: 800 }}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                    </span>
                                    <span style={{ flex: 1, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.firstName}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--y-primary)' }}>{e.bestScore}</span>
                                </div>
                            ))}
                            {myRank > 3 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.25rem 0.4rem', borderRadius: '6px', fontSize: '0.78rem',
                                    borderTop: '1px dashed var(--y-outline)', marginTop: '0.25rem', paddingTop: '0.35rem',
                                }}>
                                    <span style={{ width: '1.2rem', textAlign: 'center', fontWeight: 800 }}>#{myRank}</span>
                                    <span style={{ flex: 1, fontWeight: 600 }}>Jij</span>
                                    <span style={{ fontWeight: 700, color: 'var(--y-primary)' }}>{score}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
