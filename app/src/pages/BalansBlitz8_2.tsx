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
    BOARD_IDS,
    subscribeLeaderboard,
    updateScore,
    type LeaderboardEntry,
} from '../services/unifiedLeaderboardService';
import Top3Sidebar from '../components/Top3Sidebar';
import { formatMathDisplay } from '../utils/formatMathDisplay';
import { splitEquationPrompt } from '../utils/formatPromptParts';
import { useAutoClickerGuard } from '../hooks/useAutoClickerGuard';
import '../styles/BalansBlitz.css';

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
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [enteredTop3, setEnteredTop3] = useState(false);
    const unsubRef = useRef<(() => void) | null>(null);

    const questionStartRef = useRef(0);

    const question = questions[qIdx % questions.length];

    /* ── leaderboard subscription ─────────────────────── */
    useEffect(() => {
        if (!profile?.classId) return;
        const unsub = subscribeLeaderboard(BOARD_IDS.BALANS_BLITZ, profile.classId, 10, setLeaderboard);
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
            await updateScore(
                BOARD_IDS.BALANS_BLITZ,
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

    /* ── auto-clicker guard ───────────────────────────── */
    const { registerClick, isBlocked, AutoClickerOverlay } = useAutoClickerGuard();

    /* ── MC submit ────────────────────────────────────── */
    const handleMcPick = (idx: number) => {
        if (feedback || question.type !== 'mc' || isBlocked) return;
        if (!registerClick()) return;
        setSelectedOption(idx);
        checkAnswer(idx === question.correctIndex);
    };

    /* ── Smart number matching ─────────────────────────── */
    const DUTCH_NUMBERS: Record<string, string> = {
        nul: '0', een: '1', één: '1', twee: '2', drie: '3', vier: '4',
        vijf: '5', zes: '6', zeven: '7', acht: '8', negen: '9', tien: '10',
        elf: '11', twaalf: '12', dertien: '13', veertien: '14', vijftien: '15',
        zestien: '16', zeventien: '17', achttien: '18', negentien: '19', twintig: '20',
        dertig: '30', veertig: '40', vijftig: '50', zestig: '60',
        zeventig: '70', tachtig: '80', negentig: '90',
        honderd: '100', tweehonderd: '200', driehonderd: '300',
        vierhonderd: '400', vijfhonderd: '500', zeshonderd: '600',
        achthonderd: '800', duizend: '1000', vijftienhonderd: '1500',
    };

    function numericMatch(input: string, expected: string): boolean {
        if (!/^-?\d+$/.test(expected.trim())) return false;
        const lower = input.toLowerCase().trim();
        const digits = lower.match(/-?\d+/g);
        if (digits && digits.length === 1 && digits[0] === expected.trim()) return true;
        for (const [word, num] of Object.entries(DUTCH_NUMBERS)) {
            if (lower.includes(word) && num === expected.trim()) return true;
        }
        return false;
    }

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
        if (!correct) {
            correct = numericMatch(trimmed, question.answer);
        }
        checkAnswer(correct);
    };

    /* ── BalanceStep submit ───────────────────────────── */
    const handleStepPick = (idx: number) => {
        if (feedback || question.type !== 'balanceStep') return;
        setSelectedOption(idx);
        checkAnswer(question.options[idx].op === question.correctOp);
    };


    /* ═══════════════════════════════════════════════════
       READY SCREEN
       ═══════════════════════════════════════════════════ */
    if (phase === 'ready') {
        return (
            <div className="bb-page">
                <header className="bb-topbar">
                    <div className="bb-topbar-title">
                        <span className="bb-icon">⚡</span>
                        <span>Balans Blitz</span>
                    </div>
                    <div className="bb-topbar-stats">
                        {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}
                        <button onClick={() => navigate('/')} className="bb-btn bb-btn--ghost">← Terug</button>
                    </div>
                </header>

                <div className="bb-ready">
                    <div className="bb-ready-icon">⚡</div>
                    <h1>Balans Blitz — §8.2</h1>
                    <p>Beantwoord zoveel mogelijk vragen in 4 minuten!</p>

                    <div className="bb-rules">
                        <div className="bb-rules-title">Spelregels</div>
                        <ul>
                            <li>⏱ 4 minuten — race tegen de klok</li>
                            <li>⚡ Snel goed: +3 (≤4s), +2 (≤8s), +1 (later)</li>
                            <li>❌ Fout: −1 punt</li>
                            <li>🔥 Streak: 5 op rij = +5 bonus</li>
                            <li>🏆 Score ≥ {PASS_SCORE} = gehaald!</li>
                        </ul>
                    </div>

                    {/* Top 3 preview */}
                    {leaderboard.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Top3Sidebar
                                boardId={BOARD_IDS.BALANS_BLITZ}
                                classId={profile?.classId ?? null}
                                currentUid={profile?.uid}
                                variant="preview"
                                entries={leaderboard}
                            />
                        </div>
                    )}

                    <button className="bb-start-btn" onClick={startGame}>
                        ⚡ Start Blitz!
                    </button>
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
            <div className="bb-page">
                <header className="bb-topbar">
                    <div className="bb-topbar-title">
                        <span className="bb-icon">⚡</span>
                        <span>Balans Blitz — Klaar!</span>
                    </div>
                </header>

                <div className="bb-result">
                    <div className={`bb-result-card ${passed ? 'bb-result-card--pass' : 'bb-result-card--fail'}`}>
                        <div className="bb-result-icon">{passed ? '🏆' : '💪'}</div>
                        <h2 style={{ color: passed ? '#00b894' : '#e2e8f0' }}>
                            {passed ? 'Gehaald!' : 'Niet gehaald'}
                        </h2>
                        {!passed && (
                            <p style={{ color: 'rgba(226,232,240,0.6)', fontSize: '0.88rem', margin: '0 0 1rem' }}>
                                Je hebt {PASS_SCORE - score} punten meer nodig. Probeer het nog eens!
                            </p>
                        )}

                        <div className="bb-stats">
                            <div className="bb-stat">
                                <div className="bb-stat-value" style={{ color: '#a78bfa' }}>{score}</div>
                                <div className="bb-stat-label">Score</div>
                            </div>
                            <div className="bb-stat">
                                <div className="bb-stat-value" style={{ color: '#00b894' }}>{correctCount}</div>
                                <div className="bb-stat-label">Goed</div>
                            </div>
                            <div className="bb-stat">
                                <div className="bb-stat-value" style={{ color: '#f43f5e' }}>{wrongCount}</div>
                                <div className="bb-stat-label">Fout</div>
                            </div>
                            <div className="bb-stat">
                                <div className="bb-stat-value" style={{ color: '#f97316' }}>🔥{bestStreak}</div>
                                <div className="bb-stat-label">Streak</div>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        {leaderboard.length > 0 && (
                            <div style={{ margin: '1rem 0', textAlign: 'left' }}>
                                <Top3Sidebar
                                    boardId={BOARD_IDS.BALANS_BLITZ}
                                    classId={profile?.classId ?? null}
                                    currentUid={profile?.uid}
                                    currentScore={score}
                                    variant="full"
                                    entries={leaderboard}
                                />
                            </div>
                        )}

                        <div className="bb-actions">
                            <button className="bb-btn bb-btn--ghost" onClick={() => navigate('/')}>
                                ← Leerpad
                            </button>
                            <button className="bb-btn bb-btn--primary" onClick={startGame}>
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
        <div className="bb-page">
            <header className="bb-topbar">
                <div className="bb-topbar-title">
                    <span className="bb-icon">⚡</span>
                    <span>Balans Blitz</span>
                </div>
                <div className="bb-topbar-stats">
                    {devMode && <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #e17055, #d63031)', color: '#fff' }}>DEV</span>}

                    <span className={`bb-timer ${timeLeft <= 30 ? 'bb-timer--danger' : ''}`}>
                        ⏱ {formatTime(timeLeft)}
                    </span>

                    <span className="bb-score">
                        {score} pts
                    </span>

                    {streak > 0 && (
                        <span className="bb-streak">
                            🔥{streak}
                        </span>
                    )}
                </div>
            </header>

            {/* Timer progress */}
            <div className="bb-progress">
                <div className={`bb-progress-fill ${timeLeft <= 30 ? 'bb-progress-fill--danger' : ''}`} style={{
                    width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
                }} />
            </div>

            <div className="bb-main">
                {/* Main question area */}
                <div className="bb-content">
                    {/* Feedback flash */}
                    {feedback && (
                        <div className={`bb-feedback ${feedback === 'correct' ? 'bb-feedback--correct' : 'bb-feedback--wrong'}`}>
                            {feedback === 'correct' ? `✅ +${lastPoints}` : `❌ ${lastPoints}`}
                        </div>
                    )}

                    {/* Question card */}
                    <div className="bb-question-card">
                        {(() => {
                            const parts = splitEquationPrompt(question.prompt);
                            if (parts.equation) {
                                return (
                                    <>
                                        <div className="bb-equation-box">
                                            {formatMathDisplay(parts.equation)}
                                        </div>
                                        {parts.question && (
                                            <p className="bb-question-text">
                                                {parts.question}
                                            </p>
                                        )}
                                        {parts.rest && (
                                            <p className="bb-question-text" style={{ margin: '0.25rem 0 0' }}>
                                                {formatMathDisplay(parts.rest)}
                                            </p>
                                        )}
                                    </>
                                );
                            }
                            return (
                                <p className="bb-question-text" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                    {formatMathDisplay(question.prompt)}
                                </p>
                            );
                        })()}
                        {question.type === 'balanceStep' && (
                            <div className="bb-step-equation">
                                {formatMathDisplay(question.equation)}
                            </div>
                        )}
                    </div>

                    {/* MC options */}
                    {question.type === 'mc' && (
                        <div className="bb-options">
                            {question.options.map((opt, i) => (
                                <button
                                    key={i}
                                    className={`bb-option ${selectedOption === i
                                        ? (feedback === 'correct' ? 'bb-option--correct' : feedback === 'wrong' ? 'bb-option--wrong' : '')
                                        : ''
                                        }`}
                                    onClick={() => handleMcPick(i)}
                                    disabled={!!feedback}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    {question.type === 'input' && (
                        <div className="bb-input-row">
                            <input
                                className="bb-input"
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                                placeholder="Typ je antwoord…"
                                disabled={!!feedback}
                                autoFocus
                            />
                            <button
                                className="bb-submit-btn"
                                onClick={handleInputSubmit}
                                disabled={!!feedback || !inputValue.trim()}
                            >
                                ↵
                            </button>
                        </div>
                    )}

                    {/* BalanceStep */}
                    {question.type === 'balanceStep' && (
                        <div className="bb-options">
                            {question.options.map((opt, i) => (
                                <button
                                    key={i}
                                    className={`bb-option ${selectedOption === i
                                        ? (feedback === 'correct' ? 'bb-option--correct' : feedback === 'wrong' ? 'bb-option--wrong' : '')
                                        : ''
                                        }`}
                                    onClick={() => handleStepPick(i)}
                                    disabled={!!feedback}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: compact Top 3 */}
                {leaderboard.length > 0 && (
                    <Top3Sidebar
                        boardId={BOARD_IDS.BALANS_BLITZ}
                        classId={profile?.classId ?? null}
                        currentUid={profile?.uid}
                        currentScore={score}
                        variant="compact"
                        entries={leaderboard}
                    />
                )}

                {/* Auto-clicker detection overlay */}
                <AutoClickerOverlay />
            </div>
        </div>
    );
}
