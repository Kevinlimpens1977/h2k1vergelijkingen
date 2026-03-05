/**
 * TERMTRIS — §8.3  Real Tetris Minigame
 *
 * Gameplay loop:
 *   1. Player sees a math question
 *   2. Correct answer → a tetromino spawns and can be played (move, rotate, drop)
 *   3. Wrong answer → garbage row rises from the bottom
 *   4. Full rows clear → bonus points
 *   5. Tetris controls: ← → move, ↑ rotate, ↓ soft drop, Space hard drop
 *   6. 10-minute timed run
 *   7. Class top-3 leaderboard (realtime)
 *
 * States:
 *   "ready"     → start screen
 *   "question"  → answering a question (no active piece)
 *   "playing"   → controlling a tetromino
 *   "ended"     → game over / time up
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDevMode } from '../../context/DevModeContext';
import { TERMTRIS_8_3_BANK, type TermtrisQ } from '../../content/ch8/termtris_8_3_bank';
import {
    createEmptyField,
    tryMove,
    tryRotate,
    lockPiece,
    hardDrop,
    clearFullRows,
    addGarbageRow,
    isValidPosition,
    randomPieceType,
    spawnPiece,
    type FieldGrid,
    type ActivePiece,
    type PieceType,
} from './utils/fieldLogic';
import {
    BOARD_IDS,
    subscribeLeaderboard,
    updateScore,
    type LeaderboardEntry,
} from '../../services/unifiedLeaderboardService';
import { markSection8_3Completed } from '../../services/chapter8Flow';
import Field from './components/Field';
import QuestionCard from './components/QuestionCard';
import HUD from './components/HUD';
import Top3Sidebar from '../../components/Top3Sidebar';
import '../../pages/Practice.css';

const TIMER_SECONDS = 600; // 10 minutes
const PASS_SCORE = 30;
const GRAVITY_MS = 800; // piece falls every N ms
const SOFT_DROP_MS = 60; // fast drop speed

type Phase = 'ready' | 'question' | 'playing' | 'ended';

function shuffleBank(): TermtrisQ[] {
    return [...TERMTRIS_8_3_BANK].sort(() => Math.random() - 0.5);
}

export default function TermtrisPage() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();

    const [phase, setPhase] = useState<Phase>('ready');
    const [questions] = useState<TermtrisQ[]>(() => shuffleBank());
    const [qIdx, setQIdx] = useState(0);
    const [field, setField] = useState<FieldGrid>(createEmptyField);
    const [flashRows, setFlashRows] = useState<number[]>([]);

    // Active Tetris piece
    const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
    const [nextType, setNextType] = useState<PieceType>(() => randomPieceType());

    // Scoring
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [lastPoints, setLastPoints] = useState(0);
    const [streakBanner, setStreakBanner] = useState<string | null>(null);
    const [linesCleared, setLinesCleared] = useState(0);

    // Leaderboard
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [enteredTop3, setEnteredTop3] = useState(false);

    // Refs
    const questionStartRef = useRef(0);
    const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gravityRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const softDropRef = useRef(false);
    const fieldRef = useRef(field);
    fieldRef.current = field;
    const activePieceRef = useRef(activePiece);
    activePieceRef.current = activePiece;
    const phaseRef = useRef(phase);
    phaseRef.current = phase;

    const question = questions[qIdx % questions.length];

    /* ── leaderboard subscription ─────────────────────── */
    useEffect(() => {
        if (!profile?.classId) return;
        const unsub = subscribeLeaderboard(BOARD_IDS.TERMTRIS, profile.classId, 10, setLeaderboard);
        return () => unsub();
    }, [profile?.classId]);

    /* ── timer ────────────────────────────────────────── */
    useEffect(() => {
        if (phase !== 'question' && phase !== 'playing') return;
        if (timeLeft <= 0) {
            endGame();
            return;
        }
        const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
        return () => clearInterval(t);
    }, [phase, timeLeft]);

    /* ── gravity: piece falls automatically ───────────── */
    useEffect(() => {
        if (phase !== 'playing' || !activePiece) {
            if (gravityRef.current) clearInterval(gravityRef.current);
            return;
        }
        const speed = softDropRef.current ? SOFT_DROP_MS : GRAVITY_MS;
        gravityRef.current = setInterval(() => {
            const piece = activePieceRef.current;
            if (!piece) return;
            const moved = tryMove(fieldRef.current, piece, 1, 0);
            if (moved) {
                setActivePiece(moved);
            } else {
                // Lock piece
                lockAndClear(piece);
            }
        }, speed);
        return () => { if (gravityRef.current) clearInterval(gravityRef.current); };
    }, [phase, activePiece?.type, activePiece?.rotation, activePiece?.row, activePiece?.col]);

    /* ── keyboard controls ────────────────────────────── */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phaseRef.current !== 'playing' || !activePieceRef.current) return;
            const piece = activePieceRef.current;

            switch (e.key) {
                case 'ArrowLeft': {
                    e.preventDefault();
                    const moved = tryMove(fieldRef.current, piece, 0, -1);
                    if (moved) setActivePiece(moved);
                    break;
                }
                case 'ArrowRight': {
                    e.preventDefault();
                    const moved = tryMove(fieldRef.current, piece, 0, 1);
                    if (moved) setActivePiece(moved);
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    const rotated = tryRotate(fieldRef.current, piece);
                    if (rotated) setActivePiece(rotated);
                    break;
                }
                case 'ArrowDown': {
                    e.preventDefault();
                    softDropRef.current = true;
                    const moved = tryMove(fieldRef.current, piece, 1, 0);
                    if (moved) setActivePiece(moved);
                    break;
                }
                case ' ': {
                    e.preventDefault();
                    const dropped = hardDrop(fieldRef.current, piece);
                    lockAndClear(dropped);
                    break;
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                softDropRef.current = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    /* ── lock piece & clear lines ─────────────────────── */
    const lockAndClear = useCallback((piece: ActivePiece) => {
        const locked = lockPiece(fieldRef.current, piece);
        const { field: cleared, cleared: numCleared } = clearFullRows(locked);

        if (numCleared > 0) {
            setLinesCleared(lc => lc + numCleared);
            const lineBonus = numCleared === 1 ? 10 : numCleared === 2 ? 25 : numCleared === 3 ? 50 : 100;
            setScore(s => s + lineBonus);
            setStreakBanner(
                numCleared === 1 ? '💥 Lijn! +10'
                    : numCleared === 2 ? '💥💥 Dubbel! +25'
                        : numCleared === 3 ? '💥💥💥 Triple! +50'
                            : '💥💥💥💥 TETRIS! +100'
            );
            setTimeout(() => setStreakBanner(null), 1500);
        }

        setField(cleared);
        setActivePiece(null);

        // Check game over: if top rows occupied
        const topBlocked = cleared[0].some(c => c !== 0) || cleared[1].some(c => c !== 0);
        if (topBlocked) {
            endGame();
            return;
        }

        // Go back to question phase
        setPhase('question');
        questionStartRef.current = Date.now();
    }, []);

    /* ── start ────────────────────────────────────────── */
    const startGame = () => {
        setPhase('question');
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setCorrectCount(0);
        setWrongCount(0);
        setTimeLeft(TIMER_SECONDS);
        setQIdx(0);
        setFeedback(null);
        setStreakBanner(null);
        setEnteredTop3(false);
        setField(createEmptyField());
        setFlashRows([]);
        setLinesCleared(0);
        setActivePiece(null);
        setNextType(randomPieceType());
        questionStartRef.current = Date.now();
    };

    /* ── end ──────────────────────────────────────────── */
    const endGame = useCallback(async () => {
        setPhase('ended');
        setActivePiece(null);
        if (!profile) return;

        try {
            await updateScore(
                BOARD_IDS.TERMTRIS,
                profile.uid,
                profile.firstName || '',
                profile.classId ?? null,
                score,
            );
        } catch (e) {
            console.warn('Could not save termtris score:', e);
        }

        if (score >= PASS_SCORE) {
            try {
                await markSection8_3Completed(profile.uid);
            } catch (e) {
                console.warn('Could not mark 8.3 completed:', e);
            }
        }
    }, [profile, score]);

    /* ── answer check ─────────────────────────────────── */
    const checkAnswer = useCallback((isCorrect: boolean) => {
        if (phase !== 'question') return;

        const elapsed = (Date.now() - questionStartRef.current) / 1000;

        if (isCorrect) {
            const pts = elapsed <= 3 ? 3 : elapsed <= 6 ? 2 : 1;
            const newStreak = streak + 1;
            let bonus = 0;
            let banner: string | null = null;

            if (newStreak === 3) { bonus = 5; banner = '🔥 3 op rij! +5 bonus'; }
            if (newStreak === 5) { bonus = 10; banner = '🔥🔥 5 op rij! +10 bonus'; }
            if (newStreak > 5 && newStreak % 5 === 0) { bonus = 10; banner = `🔥🔥🔥 ${newStreak} op rij! +10 bonus`; }

            setScore(s => s + pts + bonus);
            setStreak(newStreak);
            setBestStreak(b => Math.max(b, newStreak));
            setCorrectCount(c => c + 1);
            setLastPoints(pts + bonus);
            setFeedback('correct');
            if (banner) setStreakBanner(banner);

            // Check top-3 entry
            if (!enteredTop3 && leaderboard.length >= 3) {
                const threshold = leaderboard[2]?.bestScore ?? 0;
                if (score + pts + bonus > threshold) {
                    setEnteredTop3(true);
                    fireConfetti();
                }
            }

            // Spawn the next tetromino after feedback delay
            if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = setTimeout(() => {
                setFeedback(null);
                setQIdx(i => i + 1);

                // Spawn piece
                const piece = spawnPiece(nextType);
                if (!isValidPosition(fieldRef.current, piece)) {
                    endGame();
                    return;
                }
                setActivePiece(piece);
                setNextType(randomPieceType());
                setPhase('playing');
            }, 500);
        } else {
            setScore(s => Math.max(0, s - 1));
            setStreak(0);
            setWrongCount(w => w + 1);
            setLastPoints(-1);
            setFeedback('wrong');
            setStreakBanner(null);

            // Add garbage row
            setField(prev => {
                const result = addGarbageRow(prev);
                if (result.gameOver) {
                    setTimeout(() => endGame(), 300);
                }
                return result.field;
            });

            // Next question after delay
            if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = setTimeout(() => {
                setFeedback(null);
                setQIdx(i => i + 1);
                questionStartRef.current = Date.now();
            }, 700);
        }
    }, [phase, streak, score, enteredTop3, leaderboard, nextType, endGame]);

    /* ── MC/input handlers ────────────────────────────── */
    const handleMcPick = (originalIdx: number) => {
        if (feedback || question.type !== 'mc') return;
        checkAnswer(originalIdx === question.correctIndex);
    };

    const handleInputSubmit = (value: string) => {
        if (feedback || question.type !== 'input') return;
        const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
        let correct = norm(value) === norm(question.answer);
        if (!correct && question.accept) {
            correct = question.accept.some(a => norm(value) === norm(a));
        }
        checkAnswer(correct);
    };

    /* ── confetti ─────────────────────────────────────── */
    const fireConfetti = () => {
        try {
            import('canvas-confetti').then(mod => {
                const confetti = mod.default;
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            });
        } catch { /* no confetti fallback */ }
    };

    /* ═══════════════════════════════════════════════════════
       READY SCREEN
       ═══════════════════════════════════════════════════════ */
    if (phase === 'ready') {
        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">🧱</span>
                        <span>Termtris</span>
                    </div>
                    <div className="y-topbar-user">
                        {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}
                        <button onClick={() => navigate('/')} className="y-btn--ghost y-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>← Terug</button>
                    </div>
                </header>

                <div className="y-banner">
                    <h1>🧱 Termtris — §8.3</h1>
                    <p>Los vergelijkingen op en speel Tetris!</p>
                </div>

                <div className="y-main" style={{ maxWidth: 500, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
                    <div className="y-card" style={{ padding: '1.25rem', borderTop: '3px solid var(--y-cyan)', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--y-muted)', marginBottom: '0.75rem' }}>
                            <strong>Spelregels</strong>
                        </div>
                        <ul style={{ fontSize: '0.85rem', color: 'var(--y-text)', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
                            <li>⏱ 10 minuten</li>
                            <li>✅ Goed antwoord → je speelt een Tetris-blokje!</li>
                            <li>❌ Fout antwoord → rommelrij stijgt van onder</li>
                            <li>💥 Volle rij = bonus (+10 tot +100)</li>
                            <li>⚡ Snel goed: +3 (≤3s), +2 (≤6s), +1 (later)</li>
                            <li>🔥 Streak: 3 op rij = +5, 5 op rij = +10</li>
                            <li>🎮 Besturing: ← → bewegen, ↑ draaien, ↓ snel, Spatie = drop</li>
                            <li>🏆 Score ≥ {PASS_SCORE} = gehaald!</li>
                        </ul>
                    </div>

                    {leaderboard.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <Top3Sidebar
                                boardId={BOARD_IDS.TERMTRIS}
                                classId={profile?.classId ?? null}
                                currentUid={profile?.uid}
                                variant="preview"
                                entries={leaderboard}
                            />
                        </div>
                    )}

                    <div style={{ textAlign: 'center' }}>
                        <button className="y-btn y-btn--primary" onClick={startGame} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                            🧱 Start Termtris!
                        </button>
                    </div>
                </div>

                <style>{termtrisCSS}</style>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════
       ENDED SCREEN
       ═══════════════════════════════════════════════════════ */
    if (phase === 'ended') {
        const passed = score >= PASS_SCORE;
        return (
            <div className="y-page">
                <header className="y-topbar">
                    <div className="y-topbar-logo">
                        <span className="y-topbar-logo-icon">🧱</span>
                        <span>Termtris — Klaar!</span>
                    </div>
                </header>

                <div className="y-main" style={{ maxWidth: 560, margin: '0 auto', paddingTop: '2rem', padding: '2rem 1.5rem' }}>
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

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
                            <StatBox value={score} label="Score" color="var(--y-primary)" />
                            <StatBox value={correctCount} label="Goed" color="var(--y-success)" />
                            <StatBox value={wrongCount} label="Fout" color="#e17055" />
                            <StatBox value={`🔥${bestStreak}`} label="Streak" color="var(--y-cyan)" />
                            <StatBox value={linesCleared} label="Lijnen" color="var(--y-amber)" />
                        </div>

                        {leaderboard.length > 0 && (
                            <div style={{ margin: '1rem 0', textAlign: 'left' }}>
                                <Top3Sidebar
                                    boardId={BOARD_IDS.TERMTRIS}
                                    classId={profile?.classId ?? null}
                                    currentUid={profile?.uid}
                                    currentScore={score}
                                    variant="full"
                                    entries={leaderboard}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <button className="y-btn y-btn--secondary" onClick={() => navigate('/')}>← Leerpad</button>
                            <button className="y-btn y-btn--primary" onClick={startGame}>🔄 Nog een ronde</button>
                        </div>
                    </div>
                </div>

                <style>{termtrisCSS}</style>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════
       QUESTION + PLAYING SCREEN
       ═══════════════════════════════════════════════════════ */
    return (
        <div className="y-page">
            <header className="y-topbar">
                <div className="y-topbar-logo">
                    <span className="y-topbar-logo-icon">🧱</span>
                    <span>Termtris</span>
                </div>
                <div className="y-topbar-user" style={{ gap: '0.5rem' }}>
                    {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}
                </div>
            </header>

            {/* Timer progress bar */}
            <div className="y-progress" style={{ borderRadius: 0, height: 5 }}>
                <div className="y-progress-fill" style={{
                    width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
                    background: timeLeft <= 60 ? 'var(--y-danger)' : undefined,
                    transition: 'width 1s linear',
                }} />
            </div>

            {/* Main game layout: Field (left) + Question/HUD/LB (right) */}
            <div style={{
                display: 'flex',
                gap: '1.25rem',
                maxWidth: 1000,
                margin: '0 auto',
                padding: '1rem 1.5rem',
                width: '100%',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* LEFT: Field + Next preview */}
                <div style={{ flexShrink: 0 }}>
                    <Field
                        field={field}
                        activePiece={activePiece}
                        nextPieceType={nextType}
                        flashRows={flashRows}
                    />
                </div>

                {/* RIGHT: Question + HUD + Leaderboard */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
                    {/* Status indicator */}
                    <div style={{
                        textAlign: 'center',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: phase === 'playing'
                            ? 'rgba(0, 184, 148, 0.08)'
                            : 'rgba(108, 92, 231, 0.06)',
                        color: phase === 'playing'
                            ? 'var(--y-success)'
                            : 'var(--y-primary)',
                        border: phase === 'playing'
                            ? '1px solid rgba(0, 184, 148, 0.2)'
                            : '1px solid rgba(108, 92, 231, 0.12)',
                    }}>
                        {phase === 'playing'
                            ? '🎮 Speel het blokje! ← → ↑ ↓ Spatie'
                            : '📝 Beantwoord de vraag voor een nieuw blokje!'}
                    </div>

                    {/* Question Card (shown in question phase, hidden during play) */}
                    {phase === 'question' && (
                        <QuestionCard
                            key={qIdx}
                            question={question}
                            feedback={feedback}
                            lastPoints={lastPoints}
                            onMcPick={handleMcPick}
                            onInputSubmit={handleInputSubmit}
                        />
                    )}

                    {/* During playing, show controls reminder */}
                    {phase === 'playing' && (
                        <div className="y-card" style={{
                            padding: '0.75rem 1rem',
                            borderTop: '3px solid var(--y-success)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--y-muted)', fontWeight: 600 }}>
                                ← → bewegen &nbsp;|&nbsp; ↑ draaien &nbsp;|&nbsp; ↓ snel &nbsp;|&nbsp; <strong>Spatie</strong> drop
                            </div>
                        </div>
                    )}

                    {/* HUD */}
                    <HUD
                        timeLeft={timeLeft}
                        score={score}
                        streak={streak}
                        correctCount={correctCount}
                        wrongCount={wrongCount}
                        streakBanner={streakBanner}
                    />

                    {/* Mini leaderboard */}
                    {leaderboard.length > 0 && (
                        <Top3Sidebar
                            boardId={BOARD_IDS.TERMTRIS}
                            classId={profile?.classId ?? null}
                            currentUid={profile?.uid}
                            currentScore={score}
                            variant="compact"
                            entries={leaderboard}
                        />
                    )}
                </div>
            </div>

            <style>{termtrisCSS}</style>
        </div>
    );
}

/* ── Stats box helper ─────────────────────────────────── */

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--y-muted)', textTransform: 'uppercase' as const, fontWeight: 700, letterSpacing: '0.05em' }}>{label}</div>
        </div>
    );
}

/* ── Termtris-specific CSS ────────────────────────────── */

const termtrisCSS = `
@keyframes termtris-fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes termtris-bounceIn {
    0%   { opacity: 0; transform: scale(0.5); }
    60%  { opacity: 1; transform: scale(1.1); }
    100% { transform: scale(1); }
}

@keyframes termtris-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.5; }
}

@keyframes termtris-flash {
    0%   { background: rgba(253,203,110,0.8) !important; }
    100% { background: rgba(253,203,110,0) !important; }
}

@media (max-width: 700px) {
    .y-page > div:last-of-type {
        flex-direction: column !important;
        align-items: center;
    }
}
`;
