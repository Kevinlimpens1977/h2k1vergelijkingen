/**
 * Balans Minigame — Practice + Challenge modes (Youth Theme)
 *
 * PRACTICE COMPLETION: Complete 8 puzzles OR solve 5 in a row without hints
 * CHALLENGE SCORING:
 *   +10 per solve, +2 speed bonus (< 20s), -2 per hint, +10 every 3-streak
 * LEADERBOARD: /leaderboard/balance_challenge/scores/{uid}
 * CHAPTER GATE: Practice completion marks balance_game_completed = true
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import {
    type BalanceState,
    type MicroAction,
    applyAction,
    removeOneFromSide,
    isBalanced,
    canRemoveMarbles,
    canRemoveBags,
    canDivide,
    isDividePhase,
    isSolved,
    getSolution,
    getSolutionValue,
    deriveEquationString,
    tiltAngle,
    getHint,
} from '../services/balanceEngine';
import { generateRound, type BalanceRound, type Difficulty } from '../services/balanceGenerator';
import { logAttempt, appendCompletedExercise } from '../services/attempts';
import { markBalanceGameCompleted } from '../services/chapter8Flow';
import {
    subscribeBalanceLeaderboard,
    updateBalanceScore,
    type BalanceLBEntry,
} from '../services/balanceLeaderboardService';
import { formatMathDisplay } from '../utils/formatMathDisplay';
import './BalanceGame.css';

const MARBLE_AMOUNTS = [1, 2, 5, 10];
const BAG_AMOUNTS = [1, 2];
const DIVIDE_OPTIONS = [2, 3, 4];
const PRACTICE_TARGET = 8;
const PRACTICE_STREAK_UNLOCK = 5;
const CHALLENGE_DURATION = 240; // 4 minutes

type GameMode = 'select' | 'practice' | 'challenge' | 'challengeEnd';

export default function BalanceGamePage() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const difficulty = (searchParams.get('difficulty') as Difficulty) || 'D';

    // ── mode state ──────────────────────────────────────
    const [mode, setMode] = useState<GameMode>('select');
    const [practiceComplete, setPracticeComplete] = useState(false);

    // ── puzzle engine state ─────────────────────────────
    const [round, setRound] = useState<BalanceRound>(() => generateRound(difficulty));
    const [committedState, setCommittedState] = useState<BalanceState>(() => round.initialState);
    const [liveState, setLiveState] = useState<BalanceState>(() => round.initialState);
    const [stepBuffer, setStepBuffer] = useState<MicroAction[]>([]);
    const [committedHistory, setCommittedHistory] = useState<BalanceState[]>([]);
    const [actionLog, setActionLog] = useState<string[]>([]);

    const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'info' | 'warn' | 'hint' } | null>(null);
    const [solved, setSolved] = useState(false);
    const [roundsCompleted, setRoundsCompleted] = useState(0);
    const [saving, setSaving] = useState(false);
    const [invalidTries, setInvalidTries] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [hintOpened, setHintOpened] = useState(false);

    // ── practice tracking ───────────────────────────────
    const [practiceStreak, setPracticeStreak] = useState(0); // consecutive solves without hint
    const [practiceNoHintStreak, setPracticeNoHintStreak] = useState(0);

    // ── challenge tracking ──────────────────────────────
    const [challengeScore, setChallengeScore] = useState(0);
    const [challengeStreak, setChallengeStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(CHALLENGE_DURATION);
    const [challengePuzzlesSolved, setChallengePuzzlesSolved] = useState(0);
    const [challengeBest] = useState(0);
    const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
    const toastIdRef = useRef(0);

    // ── leaderboard ─────────────────────────────────────
    const [leaderboard, setLeaderboard] = useState<BalanceLBEntry[]>([]);

    const startTimeRef = useRef<number>(Date.now());
    const initialEqRef = useRef<string>(deriveEquationString(round.initialState, round.varName));
    const puzzleStartRef = useRef<number>(Date.now());

    const balanced = isBalanced(liveState, round.solution);
    const tilt = tiltAngle(liveState, round.solution);
    const unbalanced = stepBuffer.length > 0 && !balanced;

    // ── toast helper ────────────────────────────────────
    const showToast = useCallback((text: string) => {
        const id = ++toastIdRef.current;
        setToasts((t) => [...t, { id, text }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2000);
    }, []);

    // ── challenge timer ─────────────────────────────────
    useEffect(() => {
        if (mode !== 'challenge') return;
        if (timeLeft <= 0) {
            setMode('challengeEnd');
            // save score
            if (profile) {
                updateBalanceScore(
                    profile.uid,
                    profile.firstName || '',
                    profile.classId ?? null,
                    challengeScore,
                ).catch(console.warn);
            }
            return;
        }
        const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [mode, timeLeft, profile, challengeScore]);

    // ── leaderboard subscription ────────────────────────
    useEffect(() => {
        if (mode !== 'challenge' && mode !== 'challengeEnd') return;
        if (!profile?.classId) return;
        const unsub = subscribeBalanceLeaderboard(profile.classId, 5, setLeaderboard);
        return unsub;
    }, [mode, profile?.classId]);

    // ── auto-commit when balance restored ───────────────
    useEffect(() => {
        if (stepBuffer.length > 0 && balanced) {
            setCommittedHistory((h) => [...h, committedState]);
            setCommittedState(liveState);

            const leftBags = stepBuffer.filter(a => a.side === 'left' && a.tokenType === 'bag').length;
            const rightBags = stepBuffer.filter(a => a.side === 'right' && a.tokenType === 'bag').length;
            const leftMarbles = stepBuffer.filter(a => a.side === 'left' && a.tokenType === 'marble').length;
            const rightMarbles = stepBuffer.filter(a => a.side === 'right' && a.tokenType === 'marble').length;
            const parts: string[] = [];
            if (leftBags || rightBags) parts.push(`−${Math.max(leftBags, rightBags)} doosjes`);
            if (leftMarbles || rightMarbles) parts.push(`−${Math.max(leftMarbles, rightMarbles)} knikkers`);
            setActionLog((log) => [...log, parts.join(', ') || 'stap']);

            setStepBuffer([]);
            setFeedback({ text: 'In evenwicht — geldige stap!', type: 'success' });

            if (isSolved(liveState)) {
                setSolved(true);
                setFeedback(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveState, balanced, stepBuffer.length]);

    // ── click-to-remove ─────────────────────────────────
    const handleTokenClick = useCallback((side: 'left' | 'right', tokenType: 'bag' | 'marble') => {
        if (solved) return;
        const result = removeOneFromSide(liveState, side, tokenType);
        if (!result) return;
        setLiveState(result);
        setStepBuffer((buf) => [...buf, { side, tokenType }]);
        setFeedback(null);
    }, [liveState, solved]);

    // ── both-sides quick action (hint-gated) ────────────
    const doBothSidesAction = useCallback((type: 'REMOVE_MARBLES' | 'REMOVE_BAGS', amount: number) => {
        if (solved) return;
        const result = applyAction(liveState, { type, amount });
        if (!result) {
            setFeedback({ text: 'Kan niet: aan één kant te weinig.', type: 'warn' });
            setInvalidTries((n) => n + 1);
            return;
        }
        setCommittedHistory((h) => [...h, committedState]);
        setCommittedState(result);
        setLiveState(result);
        setStepBuffer([]);
        const label = type === 'REMOVE_MARBLES' ? `−${amount} knikkers` : `−${amount} doosjes`;
        setActionLog((log) => [...log, label]);
        setFeedback({ text: 'Links en rechts hetzelfde → balans blijft.', type: 'success' });
        if (isSolved(result)) { setSolved(true); setFeedback(null); }
    }, [liveState, committedState, solved]);

    // ── divide ──────────────────────────────────────────
    const doDivide = useCallback((divisor: number) => {
        if (solved) return;
        const result = applyAction(liveState, { type: 'DIVIDE', amount: divisor });
        if (!result) return;
        setCommittedHistory((h) => [...h, committedState]);
        setCommittedState(result);
        setLiveState(result);
        setStepBuffer([]);
        setActionLog((log) => [...log, `÷${divisor}`]);
        setFeedback({ text: 'Verdeeld — geldige stap!', type: 'success' });
        if (isSolved(result)) { setSolved(true); setFeedback(null); }
    }, [liveState, committedState, solved]);

    // ── undo ────────────────────────────────────────────
    const doUndo = useCallback(() => {
        if (stepBuffer.length > 0) {
            setLiveState(committedState);
            setStepBuffer([]);
            setFeedback({ text: 'Stap geannuleerd.', type: 'info' });
        } else if (committedHistory.length > 0) {
            const prev = committedHistory[committedHistory.length - 1];
            setCommittedHistory((h) => h.slice(0, -1));
            setCommittedState(prev);
            setLiveState(prev);
            setActionLog((log) => log.slice(0, -1));
            setFeedback({ text: 'Laatste stap ongedaan.', type: 'info' });
            setSolved(false);
        }
    }, [stepBuffer, committedState, committedHistory]);

    // ── hint ────────────────────────────────────────────
    const doHint = useCallback(() => {
        setHintsUsed((n) => n + 1);
        setHintOpened(true);
        setFeedback({ text: getHint(liveState), type: 'hint' });
        if (mode === 'challenge') {
            setChallengeScore((s) => Math.max(0, s - 2));
            showToast('💡 Hint −2');
        }
    }, [liveState, mode, showToast]);

    // ── next round ──────────────────────────────────────
    const handleNextRound = useCallback(async () => {
        if (!profile) return;

        const durationMs = Date.now() - startTimeRef.current;
        const puzzleDuration = (Date.now() - puzzleStartRef.current) / 1000;
        const solutionVal = getSolutionValue(liveState);
        const errorTags: string[] = [];
        if (hintsUsed > 0) errorTags.push('HINTS_USED');
        if (invalidTries > 0) errorTags.push('INVALID_TRIES');

        setSaving(true);
        try {
            await logAttempt(profile.uid, {
                paragraphId: 'bridge_balance',
                exerciseType: 'BALANCE_MINIGAME',
                prompt: initialEqRef.current,
                studentAnswer: `${round.varName}=${solutionVal}, steps=[${actionLog.join(', ')}]`,
                correctAnswer: `${round.varName}=${round.solution}`,
                isCorrect: true,
                errorTags,
                durationMs,
                retries: invalidTries,
            });
            await appendCompletedExercise(profile.uid, 'bridge_balance', round.id);
        } catch (err) {
            console.warn('Could not save attempt:', err);
        } finally {
            setSaving(false);
        }

        const newCount = roundsCompleted + 1;
        setRoundsCompleted(newCount);

        // ── practice tracking ──
        if (mode === 'practice') {
            if (hintsUsed === 0) {
                setPracticeNoHintStreak((s) => s + 1);
            } else {
                setPracticeNoHintStreak(0);
            }
            setPracticeStreak((s) => s + 1);

            // Check practice completion
            const noHintNext = hintsUsed === 0 ? practiceNoHintStreak + 1 : 0;
            if (newCount >= PRACTICE_TARGET || noHintNext >= PRACTICE_STREAK_UNLOCK) {
                setPracticeComplete(true);
                markBalanceGameCompleted(profile.uid).catch(console.warn);
            }
        }

        // ── challenge scoring ──
        if (mode === 'challenge') {
            let points = 10;
            showToast('+10 Opgelost!');

            if (puzzleDuration < 20) {
                points += 2;
                showToast('⚡ Snelheidsbonus +2');
            }

            const newStreak = challengeStreak + 1;
            setChallengeStreak(newStreak);
            if (newStreak > 0 && newStreak % 3 === 0) {
                points += 10;
                showToast('🔥 Streak bonus +10');
            }

            setChallengeScore((s) => s + points);
            setChallengePuzzlesSolved((n) => n + 1);
        }

        // New puzzle
        const newRound = generateRound(difficulty);
        setRound(newRound);
        setCommittedState(newRound.initialState);
        setLiveState(newRound.initialState);
        setStepBuffer([]);
        setCommittedHistory([]);
        setActionLog([]);
        setFeedback(null);
        setSolved(false);
        setInvalidTries(0);
        setHintsUsed(0);
        setHintOpened(false);
        startTimeRef.current = Date.now();
        puzzleStartRef.current = Date.now();
        initialEqRef.current = deriveEquationString(newRound.initialState, newRound.varName);
    }, [profile, liveState, round, actionLog, roundsCompleted, difficulty, hintsUsed, invalidTries, mode, challengeStreak, practiceNoHintStreak, showToast]);

    // ── start modes ─────────────────────────────────────
    const startPractice = () => {
        setMode('practice');
        setRoundsCompleted(0);
        setPracticeStreak(0);
        setPracticeNoHintStreak(0);
        resetPuzzle();
    };

    const startChallenge = () => {
        setMode('challenge');
        setChallengeScore(0);
        setChallengeStreak(0);
        setChallengePuzzlesSolved(0);
        setTimeLeft(CHALLENGE_DURATION);
        resetPuzzle();
    };

    const resetPuzzle = () => {
        const newRound = generateRound(difficulty);
        setRound(newRound);
        setCommittedState(newRound.initialState);
        setLiveState(newRound.initialState);
        setStepBuffer([]);
        setCommittedHistory([]);
        setActionLog([]);
        setFeedback(null);
        setSolved(false);
        setInvalidTries(0);
        setHintsUsed(0);
        setHintOpened(false);
        startTimeRef.current = Date.now();
        puzzleStartRef.current = Date.now();
        initialEqRef.current = deriveEquationString(newRound.initialState, newRound.varName);
    };

    /* ── renderers ────────────────────────────────────── */
    const renderBags = (count: number, side: 'left' | 'right') => {
        const c = round.colors;
        return Array.from({ length: count }, (_, i) => (
            <button
                key={`bag-${side}-${i}`}
                className="bal-box bal-box--clickable"
                onClick={() => handleTokenClick(side, 'bag')}
                aria-label={`Verwijder doosje ${round.varName} aan ${side === 'left' ? 'links' : 'rechts'}`}
                disabled={solved}
                style={{
                    background: c.boxBg,
                    borderColor: c.boxBorder,
                    boxShadow: `0 0 8px ${c.boxGlow}`,
                    color: c.boxText,
                }}
            >
                {round.varName}
            </button>
        ));
    };

    const renderMarbles = (count: number, side: 'left' | 'right') => {
        const c = round.colors;
        return Array.from({ length: count }, (_, i) => (
            <button
                key={`marble-${side}-${i}`}
                className="bal-marble bal-marble--clickable"
                onClick={() => handleTokenClick(side, 'marble')}
                aria-label={`Verwijder knikker aan ${side === 'left' ? 'links' : 'rechts'}`}
                disabled={solved}
                style={{
                    background: `radial-gradient(circle at 35% 35%, ${c.marbleStart}, ${c.marbleEnd})`,
                    borderColor: c.marbleBorder,
                }}
            />
        ));
    };

    const renderPanContents = (bags: number, marbles: number, side: 'left' | 'right') => (
        <div className="bal-pan-contents">
            {bags > 0 && <div className="bal-boxes-row">{renderBags(bags, side)}</div>}
            {marbles > 0 && <div className="bal-marbles-grid">{renderMarbles(marbles, side)}</div>}
            {bags === 0 && marbles === 0 && <span className="bal-empty">leeg</span>}
        </div>
    );

    const equation = deriveEquationString(liveState, round.varName);
    const solutionStr = getSolution(liveState, round.varName);
    const canUndo = stepBuffer.length > 0 || committedHistory.length > 0;

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    // ── my rank ─────
    const myRank = profile ? leaderboard.findIndex((e) => e.uid === profile.uid) + 1 : 0;

    /* ════════════════════════════════════════════════════
       MODE SELECT SCREEN
       ════════════════════════════════════════════════════ */
    if (mode === 'select') {
        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">⚖️</span>
                        <span>Balans Minigame</span>
                    </div>
                    <div className="y-topbar-user">
                        {devMode && <span className="bal-dev-chip">DEV</span>}
                        <button onClick={() => navigate('/')} className="y-btn--ghost y-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>← Terug</button>
                    </div>
                </header>

                <div className="y-banner">
                    <h1>⚖️ Balans Minigame</h1>
                    <p>Los vergelijkingen op door de balans in evenwicht te houden</p>
                </div>

                <div className="y-main" style={{ maxWidth: 560 }}>
                    {/* Practice card */}
                    <button
                        className="y-card bal-mode-card"
                        onClick={startPractice}
                        style={{ borderTop: '3px solid var(--y-primary)', textAlign: 'left', cursor: 'pointer', width: '100%', marginBottom: '1rem' }}
                    >
                        <div className="bal-mode-card-header">
                            <span className="bal-mode-emoji">🎯</span>
                            <div style={{ flex: 1 }}>
                                <div className="bal-mode-title">Oefenen</div>
                                <div className="bal-mode-sub">Leer stap voor stap de balansmethode</div>
                            </div>
                            <span className="y-badge y-badge--active">Start →</span>
                        </div>
                        <div className="bal-mode-details">
                            <span>8 puzzels</span>
                            <span>·</span>
                            <span>Geen tijdslimiet</span>
                            <span>·</span>
                            <span>Hints beschikbaar</span>
                        </div>
                    </button>

                    {/* Challenge card */}
                    <button
                        className="y-card bal-mode-card"
                        onClick={practiceComplete || devMode ? startChallenge : undefined}
                        disabled={!practiceComplete && !devMode}
                        style={{
                            borderTop: '3px solid var(--y-cyan)',
                            textAlign: 'left',
                            cursor: practiceComplete || devMode ? 'pointer' : 'default',
                            width: '100%',
                            opacity: practiceComplete || devMode ? 1 : 0.55,
                        }}
                    >
                        <div className="bal-mode-card-header">
                            <span className="bal-mode-emoji">🏆</span>
                            <div style={{ flex: 1 }}>
                                <div className="bal-mode-title">Challenge</div>
                                <div className="bal-mode-sub">4 minuten — scoor punten & versla je klasgenoten</div>
                            </div>
                            {practiceComplete || devMode ? (
                                <span className="y-badge y-badge--active">Start →</span>
                            ) : (
                                <span className="y-badge y-badge--locked">🔒 Eerst oefenen</span>
                            )}
                        </div>
                        <div className="bal-mode-details">
                            <span>4 minuten</span>
                            <span>·</span>
                            <span>Punten + Streaks</span>
                            <span>·</span>
                            <span>Klas Top 3</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    /* ════════════════════════════════════════════════════
       CHALLENGE END SCREEN
       ════════════════════════════════════════════════════ */
    if (mode === 'challengeEnd') {
        const isNewBest = challengeScore > challengeBest;
        if (isNewBest && challengeScore > challengeBest) {
            // Update local best
            setChallengeScore(challengeScore); // keep
        }

        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">⚖️</span>
                        <span>Balans Challenge — Klaar!</span>
                    </div>
                </header>

                <div className="y-main" style={{ maxWidth: 500, paddingTop: '2rem' }}>
                    <div className="y-card" style={{ textAlign: 'center', padding: '2rem', borderTop: '3px solid var(--y-cyan)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--y-text)', margin: '0 0 0.25rem' }}>
                            Challenge voltooid!
                        </h2>
                        {isNewBest && (
                            <div style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.8rem',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, var(--y-amber), #ffeaa7)',
                                color: '#e17055',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                marginBottom: '1rem',
                            }}>
                                🎉 NIEUW RECORD!
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--y-primary)' }}>{challengeScore}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--y-muted)', textTransform: 'uppercase' }}>Score</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--y-success)' }}>{challengePuzzlesSolved}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--y-muted)', textTransform: 'uppercase' }}>Opgelost</div>
                            </div>
                            {myRank > 0 && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--y-cyan)' }}>#{myRank}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--y-muted)', textTransform: 'uppercase' }}>Rang</div>
                                </div>
                            )}
                        </div>

                        {/* Leaderboard */}
                        {leaderboard.length > 0 && (
                            <div style={{ margin: '1rem 0' }}>
                                <div className="y-section-label">Klas Top 5</div>
                                {leaderboard.slice(0, 5).map((e, i) => (
                                    <div key={e.uid} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.4rem 0.5rem',
                                        borderRadius: '8px',
                                        background: e.uid === profile?.uid ? 'rgba(108, 92, 231, 0.06)' : 'transparent',
                                        fontWeight: e.uid === profile?.uid ? 800 : 500,
                                        fontSize: '0.85rem',
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
                            <button className="y-btn y-btn--secondary" onClick={() => setMode('select')}>
                                ← Menu
                            </button>
                            <button className="y-btn y-btn--primary" onClick={startChallenge}>
                                🔄 Nog een ronde
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ════════════════════════════════════════════════════
       PRACTICE COMPLETE SCREEN (overlay)
       ════════════════════════════════════════════════════ */
    const showPracticeComplete = mode === 'practice' && practiceComplete && solved;

    /* ════════════════════════════════════════════════════
       GAME UI (Practice + Challenge share layout)
       ════════════════════════════════════════════════════ */
    return (
        <div className="y-page">
            {/* toasts */}
            <div className="bal-toasts">
                {toasts.map((t) => (
                    <div key={t.id} className="bal-toast">{t.text}</div>
                ))}
            </div>

            {/* header */}
            <header className="y-topbar">
                <div className="y-topbar-logo">
                    <span className="y-topbar-logo-icon">⚖️</span>
                    <span>Balans Minigame</span>
                </div>
                <div className="y-topbar-user" style={{ gap: '0.5rem' }}>
                    {devMode && <span className="bal-dev-chip">DEV</span>}

                    {/* Mode chip */}
                    <span className="y-topbar-badge" style={{
                        background: mode === 'challenge'
                            ? 'linear-gradient(135deg, var(--y-cyan), #00cec9)'
                            : 'linear-gradient(135deg, var(--y-primary), var(--y-primary2))',
                    }}>
                        {mode === 'challenge' ? '🏆 Challenge' : '🎯 Oefenen'}
                    </span>

                    {/* Timer (challenge only) */}
                    {mode === 'challenge' && (
                        <span style={{
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: timeLeft <= 30 ? 'var(--y-danger)' : 'var(--y-text)',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            ⏱ {formatTime(timeLeft)}
                        </span>
                    )}

                    {/* Score (challenge) */}
                    {mode === 'challenge' && (
                        <span style={{ fontWeight: 800, color: 'var(--y-primary)', fontSize: '0.9rem' }}>
                            {challengeScore} pts
                        </span>
                    )}

                    {/* Streak */}
                    {(mode === 'challenge' ? challengeStreak : practiceStreak) > 0 && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e17055' }}>
                            🔥 {mode === 'challenge' ? challengeStreak : practiceStreak}
                        </span>
                    )}

                    {/* Solved counter */}
                    <span className="y-topbar-number">
                        Opgelost: {mode === 'challenge' ? challengePuzzlesSolved : roundsCompleted}
                        {mode === 'practice' ? `/${PRACTICE_TARGET}` : ''}
                    </span>

                    <button onClick={() => setMode('select')} className="y-btn--ghost y-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                        ✕ Stop
                    </button>
                </div>
            </header>

            {/* Progress bar (practice) */}
            {mode === 'practice' && (
                <div className="y-progress" style={{ borderRadius: 0, height: 5 }}>
                    <div className="y-progress-fill" style={{ width: `${(roundsCompleted / PRACTICE_TARGET) * 100}%` }} />
                </div>
            )}

            <div className="balance-main">
                {/* Practice complete overlay */}
                {showPracticeComplete && (
                    <div className="bal-complete-overlay">
                        <div className="y-card" style={{ textAlign: 'center', padding: '2rem', borderTop: '3px solid var(--y-success)', maxWidth: 420 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--y-success)', margin: '0 0 0.5rem' }}>
                                Oefenen voltooid!
                            </h2>
                            <p style={{ color: 'var(--y-muted)', margin: '0 0 1rem', fontSize: '0.9rem' }}>
                                Je hebt de balansmethode onder de knie. Challenge mode is nu ontgrendeld!
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                <button className="y-btn y-btn--secondary" onClick={() => setMode('select')}>
                                    ← Terug
                                </button>
                                <button className="y-btn y-btn--primary" onClick={startChallenge}>
                                    🏆 Start Challenge
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bal-game-layout">
                    {/* Main game area — 3-row safe-area grid */}
                    <div className="bal-game-main">

                        {/* ═══ ROW A — Equation (safe from beam overlap) ═══ */}
                        <div className="bal-row-equation">
                            <div className={`bal-eq-card ${unbalanced ? 'bal-eq-card--warn' : ''}`}>
                                <span className="bal-eq-text">{formatMathDisplay(equation)}</span>
                            </div>
                        </div>

                        {/* ═══ ROW B — Balance Stage (beam tilts inside here) ═══ */}
                        <div className="bal-row-stage">
                            <div className="bal-scale-container" style={{ '--tilt': `${tilt}deg` } as React.CSSProperties}>
                                <div className="bal-beam-group">
                                    {/* Left arm + pan */}
                                    <div className="bal-arm">
                                        <div className="bal-chain" />
                                        <div className="bal-pan">
                                            <div className="bal-pan-tray" />
                                            {renderPanContents(liveState.bagsLeft, liveState.marblesLeft, 'left')}
                                        </div>
                                    </div>

                                    {/* Beam bar */}
                                    <div className="bal-beam" />

                                    {/* Right arm + pan */}
                                    <div className="bal-arm">
                                        <div className="bal-chain" />
                                        <div className="bal-pan">
                                            <div className="bal-pan-tray" />
                                            {renderPanContents(liveState.bagsRight, liveState.marblesRight, 'right')}
                                        </div>
                                    </div>
                                </div>

                                {/* Fulcrum stand */}
                                <div className="bal-fulcrum">
                                    <div className="bal-fulcrum-post" />
                                    <svg className="bal-fulcrum-tri" width="56" height="36" viewBox="0 0 56 36">
                                        <polygon points="28,0 0,36 56,36" fill="#94a3b8" />
                                        <polygon points="28,4 6,34 50,34" fill="#cbd5e1" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* ═══ ROW C — Controls + Feedback (stable bottom) ═══ */}
                        <div className="bal-row-controls">
                            {/* Balance status */}
                            {stepBuffer.length > 0 && (
                                <div className={`bal-status ${balanced ? 'bal-status--balanced' : 'bal-status--unbalanced'}`}>
                                    {balanced
                                        ? 'In evenwicht — geldige stap!'
                                        : 'Uit balans — doe hetzelfde aan de andere kant.'}
                                </div>
                            )}

                            {/* Instruction */}
                            {stepBuffer.length === 0 && !solved && !feedback && (
                                <div className="bal-instruction">
                                    Klik op een doosje of knikker om het weg te halen. Doe daarna hetzelfde aan de andere kant!
                                </div>
                            )}

                            {/* Feedback */}
                            {feedback && (
                                <div className={`bal-feedback bal-feedback--${feedback.type}`}>
                                    {feedback.text}
                                </div>
                            )}

                            {/* Solved */}
                            {solved && solutionStr && !showPracticeComplete ? (
                                <div className="bal-solved-card">
                                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✅</div>
                                    <div className="bal-solved-value">{formatMathDisplay(solutionStr)}</div>
                                    <div style={{ color: 'var(--y-muted)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                                        Opgelost in {actionLog.length} stappen
                                        {hintsUsed > 0 && ` · ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''}`}
                                    </div>
                                    <button
                                        className="y-btn y-btn--primary"
                                        onClick={handleNextRound}
                                        disabled={saving}
                                    >
                                        {saving ? 'Opslaan...' : 'Volgende →'}
                                    </button>
                                </div>
                            ) : !solved && (
                                <div className="bal-actions">
                                    {/* Divide */}
                                    {isDividePhase(liveState) && stepBuffer.length === 0 && (
                                        <div className="bal-action-group">
                                            <div className="bal-action-label">Verdeel in gelijke groepjes</div>
                                            <div className="bal-action-row">
                                                {DIVIDE_OPTIONS.map((d) => (
                                                    <button
                                                        key={`div-${d}`}
                                                        className="y-btn y-btn--secondary"
                                                        disabled={!canDivide(liveState, d)}
                                                        onClick={() => doDivide(d)}
                                                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                                    >
                                                        ÷{d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hint quick-actions */}
                                    {hintOpened && stepBuffer.length === 0 && !isDividePhase(liveState) && (
                                        <div className="bal-action-group">
                                            <div className="bal-action-label">Snelle actie (beide kanten)</div>
                                            <div className="bal-action-row">
                                                {MARBLE_AMOUNTS.map((amt) => (
                                                    <button
                                                        key={`qm-${amt}`}
                                                        className="y-btn y-btn--secondary"
                                                        disabled={!canRemoveMarbles(liveState, amt)}
                                                        onClick={() => doBothSidesAction('REMOVE_MARBLES', amt)}
                                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                    >
                                                        −{amt} ●
                                                    </button>
                                                ))}
                                                {BAG_AMOUNTS.map((amt) => (
                                                    <button
                                                        key={`qb-${amt}`}
                                                        className="y-btn y-btn--secondary"
                                                        disabled={!canRemoveBags(liveState, amt)}
                                                        onClick={() => doBothSidesAction('REMOVE_BAGS', amt)}
                                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                    >
                                                        −{amt} 📦
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Undo + Hint */}
                                    <div className="bal-action-row" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                                        <button
                                            className="y-btn y-btn--ghost"
                                            disabled={!canUndo}
                                            onClick={doUndo}
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            {stepBuffer.length > 0 ? '↩ Annuleer' : '↩ Ongedaan'}
                                        </button>
                                        <button
                                            className="y-btn y-btn--ghost"
                                            onClick={doHint}
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            💡 Hint{mode === 'challenge' ? ' (−2)' : ''}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>{/* /bal-row-controls (Row C) */}
                    </div>{/* /bal-game-main (3-row grid) */}

                    {/* Sidebar: leaderboard (challenge only) */}
                    {mode === 'challenge' && leaderboard.length > 0 && (
                        <div className="bal-sidebar">
                            <div className="y-card" style={{ padding: '1rem', borderTop: '3px solid var(--y-cyan)' }}>
                                <div className="y-section-label">Klas Top 3</div>
                                {leaderboard.slice(0, 3).map((e, i) => (
                                    <div key={e.uid} className="bal-lb-row" style={{
                                        background: e.uid === profile?.uid ? 'rgba(108, 92, 231, 0.06)' : undefined,
                                    }}>
                                        <span className="bal-lb-medal">
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                        </span>
                                        <span className="bal-lb-name">{e.firstName}</span>
                                        <span className="bal-lb-score">{e.bestScore}</span>
                                    </div>
                                ))}
                                {myRank > 3 && (
                                    <div className="bal-lb-row bal-lb-row--you">
                                        <span className="bal-lb-medal">#{myRank}</span>
                                        <span className="bal-lb-name">Jij</span>
                                        <span className="bal-lb-score">{challengeScore}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>{/* /bal-game-layout */}
            </div>{/* /balance-main */}
        </div>
    );
}