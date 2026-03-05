/**
 * §8.1 Intro — "Termen Quest"
 *
 * Progress doc: /progress/{uid}/paragraphs/8_1_intro
 * Pass score: PASS_SCORE (35) for speed test
 * Guard: /practice/8_1 redirects here if !completedSpeedTest
 *
 * 6 short levels with mixed task types.
 * On completion of all levels: markIntroCompleted → navigate to speed test.
 *
 * LEADERBOARD: /leaderboard/termen_quest_8_1/scores/{uid}
 * Saves final XP as bestScore. Top 3 sidebar shown during gameplay.
 */

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { INTRO_LEVELS, type TaskData } from '../data/intro8_1_content';
import { algebraEquals } from '../../../utils/algebraEquals';
import { generateSimilarTask } from '../utils/generateSimilarTask';
import {
    markIntroCompleted,
    ensureIntroDoc,
} from '../services/introProgressService';
import {
    BOARD_IDS,
    updateScore,
    subscribeLeaderboard,
    type LeaderboardEntry,
} from '../../../services/unifiedLeaderboardService';
import Top3Sidebar from '../../../components/Top3Sidebar';
import '../styles/Intro8_1.css';

type TaskFeedback = 'none' | 'correct' | 'wrong';

export default function Intro8_1() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [levelIdx, setLevelIdx] = useState(0);
    const [taskIdx, setTaskIdx] = useState(0);
    const [feedback, setFeedback] = useState<TaskFeedback>('none');
    const [streak, setStreak] = useState(0);
    const [xp, setXp] = useState(0);
    const [answer, setAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [showReplayHub, setShowReplayHub] = useState(false);
    const [overrideTask, setOverrideTask] = useState<TaskData | null>(null);

    /* ── leaderboard ──────────────────────────────────── */
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [enteredTop3, setEnteredTop3] = useState(false);
    const xpRef = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const level = INTRO_LEVELS[levelIdx];
    const task = overrideTask ?? level?.tasks[taskIdx];
    const totalTasks = INTRO_LEVELS.reduce((s, l) => s + l.tasks.length, 0);
    const doneTasks = INTRO_LEVELS.slice(0, levelIdx).reduce((s, l) => s + l.tasks.length, 0) + taskIdx;

    /* ── load progress ──────────────────────────────────── */
    useEffect(() => {
        if (!profile) return;
        (async () => {
            try {
                const p = await ensureIntroDoc(profile.uid);
                // If already completed both, show replay hub
                if (p.completedSpeedTest) {
                    setShowReplayHub(true);
                }
            } catch (e) {
                console.warn('Could not load intro progress:', e);
            }
            setLoading(false);
        })();
    }, [profile]);

    /* ── leaderboard subscription ─────────────────────── */
    useEffect(() => {
        if (!profile?.classId) return;
        const unsub = subscribeLeaderboard(
            BOARD_IDS.TERMEN_QUEST,
            profile.classId,
            10,
            setLeaderboard,
        );
        return () => unsub();
    }, [profile?.classId]);

    /* ── check answer ───────────────────────────────────── */
    /** Strip all whitespace + lowercase for comparison */
    const strip = (s: string) => s.replace(/\s+/g, '').toLowerCase();

    const checkAnswer = useCallback((overrideAnswer?: string, overrideOption?: number) => {
        if (feedback !== 'none' || !task) return;

        const ans = overrideAnswer ?? answer;
        const opt = overrideOption ?? selectedOption;

        let correct = false;
        switch (task.type) {
            case 'INPUT':
                correct = algebraEquals(ans, task.correctAnswer);
                break;
            case 'MC':
                correct = opt === task.correctIndex;
                break;
            case 'DRAG_MATCH':
                correct = strip(ans) === strip(task.correctChoice);
                break;
            case 'COMBINE_LIKE_TERMS': {
                correct = algebraEquals(ans, task.correctAnswer) ||
                    (task.alternativeAnswers?.some(alt => algebraEquals(ans, alt)) ?? false);
                break;
            }
        }

        if (correct) {
            setFeedback('correct');
            setStreak((s) => s + 1);
            const newXp = xp + 10;
            setXp(newXp);
            xpRef.current = newXp;

            // Check top-3 entry
            if (!enteredTop3 && leaderboard.length >= 3) {
                const threshold = leaderboard[2]?.bestScore ?? 0;
                if (newXp > threshold) {
                    setEnteredTop3(true);
                    try {
                        import('canvas-confetti').then((mod) => {
                            mod.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                        });
                    } catch { /* no confetti fallback */ }
                }
            }
        } else {
            setFeedback('wrong');
            setStreak(0);
            setShowExplanation(true);
        }
    }, [task, answer, selectedOption, feedback]);

    /* ── auto-advance / similar question after feedback ─ */
    useEffect(() => {
        if (feedback === 'none') return;
        const delay = feedback === 'correct' ? 3000 : 5000;
        const timer = setTimeout(() => {
            if (feedback === 'correct') {
                setOverrideTask(null);
                nextTask();
            } else {
                // Wrong: generate a similar question
                if (task) {
                    const similar = generateSimilarTask(task);
                    setOverrideTask(similar);
                }
                setFeedback('none');
                setAnswer('');
                setSelectedOption(null);
                setShowExplanation(false);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        }, delay);
        return () => clearTimeout(timer);
    }, [feedback]);

    /* ── next task ───────────────────────────────────────── */
    const nextTask = useCallback(async () => {
        const nextTaskIdx = taskIdx + 1;
        if (nextTaskIdx < level.tasks.length) {
            setTaskIdx(nextTaskIdx);
        } else {
            const nextLevelIdx = levelIdx + 1;
            if (nextLevelIdx < INTRO_LEVELS.length) {
                setLevelIdx(nextLevelIdx);
                setTaskIdx(0);
            } else {
                // All levels complete
                setCompleted(true);
                if (profile) {
                    await markIntroCompleted(profile.uid);
                    // Save XP as leaderboard score
                    try {
                        await updateScore(
                            BOARD_IDS.TERMEN_QUEST,
                            profile.uid,
                            profile.firstName || '',
                            profile.classId ?? null,
                            xpRef.current,
                        );
                    } catch (e) {
                        console.warn('Could not save Termen Quest score:', e);
                    }
                }
            }
        }
        setFeedback('none');
        setAnswer('');
        setSelectedOption(null);
        setShowExplanation(false);
        // Re-focus input after task transition
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [taskIdx, levelIdx, level, profile]);

    /* ── render helpers ──────────────────────────────────── */
    const getHintText = (): string | undefined => {
        if (!task) return undefined;
        if (task.type === 'INPUT') return task.hint;
        if (task.type === 'MC') return task.explanation;
        if (task.type === 'DRAG_MATCH') return task.explanation;
        return undefined;
    };

    if (loading) {
        return (
            <div className="intro-page">
                <div className="intro-loading">Laden…</div>
            </div>
        );
    }

    if (showReplayHub) {
        return (
            <div className="intro-page">
                <div className="intro-complete-card" style={{ maxWidth: 500 }}>
                    <div className="intro-complete-icon">🔄</div>
                    <h2>§8.1 Herspelen</h2>
                    <p style={{ color: 'var(--st-text-dim, #7b8db0)', marginBottom: '1.5rem' }}>
                        Kies welk onderdeel je opnieuw wilt spelen voor een hogere score!
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            className="intro-btn-primary"
                            onClick={() => {
                                setShowReplayHub(false);
                                setLevelIdx(0);
                                setTaskIdx(0);
                                setXp(0);
                                setStreak(0);
                                setFeedback('none');
                                setAnswer('');
                                setSelectedOption(null);
                                setShowExplanation(false);
                                setCompleted(false);
                                setEnteredTop3(false);
                            }}
                        >
                            🎮 Termen Quest opnieuw
                        </button>
                        <button
                            className="intro-btn-primary"
                            style={{ background: 'linear-gradient(135deg, #00e5ff, #2979ff)' }}
                            onClick={() => navigate('/8-1/speed-test')}
                        >
                            ⚡ Speed Test opnieuw
                        </button>
                        <button
                            className="intro-btn-primary"
                            style={{ background: 'transparent', border: '1px solid rgba(100,140,255,0.2)', color: 'var(--st-text-dim, #7b8db0)' }}
                            onClick={() => navigate('/')}
                        >
                            ← Terug naar menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (completed) {
        const restartQuest = () => {
            setLevelIdx(0);
            setTaskIdx(0);
            setXp(0);
            setStreak(0);
            setFeedback('none');
            setAnswer('');
            setSelectedOption(null);
            setShowExplanation(false);
            setCompleted(false);
            setEnteredTop3(false);
        };

        return (
            <div className="intro-page">
                <div className="intro-complete-card">
                    <div className="intro-complete-icon">🎉</div>
                    <h2>Termen Quest voltooid!</h2>
                    <p>Je hebt alle 6 levels gehaald. XP: {xp}</p>
                    <p>Nu volgt de Speed Test om §8.1 te ontgrendelen.</p>

                    {/* Leaderboard */}
                    <div style={{ margin: '1rem 0' }}>
                        <Top3Sidebar
                            boardId={BOARD_IDS.TERMEN_QUEST}
                            classId={profile?.classId ?? null}
                            currentUid={profile?.uid}
                            currentScore={xp}
                            variant="preview"
                            scoreLabel="XP"
                            entries={leaderboard}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="intro-btn-primary"
                            onClick={() => navigate('/8-1/speed-test')}
                        >
                            Start Speed Test →
                        </button>
                        <button
                            className="intro-btn-primary"
                            style={{ background: 'linear-gradient(135deg, var(--y-amber, #ffc107), #ff9800)' }}
                            onClick={restartQuest}
                        >
                            🔄 Opnieuw spelen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) return null;

    return (
        <div className="intro-page">
            <header className="intro-header">
                <button onClick={() => navigate('/')} className="intro-back">← Terug</button>
                <div className="intro-header-info">
                    <h1>Termen Quest</h1>
                    <span>Level {levelIdx + 1}: {level.title}</span>
                </div>
                <div className="intro-stats">
                    <span className="intro-streak">🔥 {streak}</span>
                    <span className="intro-xp">XP: {xp}</span>
                </div>
            </header>

            {/* progress bar */}
            <div className="intro-progress-bar">
                <div
                    className="intro-progress-fill"
                    style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                />
            </div>
            <div className="intro-progress-label">{doneTasks + 1} / {totalTasks}</div>

            {/* Top 3 sidebar — float right on larger screens */}
            {leaderboard.length > 0 && (
                <div className="intro-sidebar-wrap">
                    <Top3Sidebar
                        boardId={BOARD_IDS.TERMEN_QUEST}
                        classId={profile?.classId ?? null}
                        currentUid={profile?.uid}
                        currentScore={xp}
                        variant="compact"
                        scoreLabel="XP"
                        entries={leaderboard}
                    />
                </div>
            )}

            <div className="intro-main">
                <div className="intro-task-card">
                    {/* prompt */}
                    <div className="intro-prompt">
                        {task.prompt.split('\n').map((line, i) => (
                            <div key={i} className={i === 0 ? 'intro-prompt-equation' : ''}>{line}</div>
                        ))}
                    </div>

                    {/* task body */}
                    {task.type === 'INPUT' && (
                        <form className="intro-input-group" onSubmit={(e: FormEvent) => { e.preventDefault(); if (answer.trim()) checkAnswer(); }}>
                            <input
                                ref={inputRef}
                                className="intro-input"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Typ je antwoord…"
                                autoFocus
                                disabled={feedback !== 'none'}
                            />
                        </form>
                    )}

                    {task.type === 'MC' && (
                        <div className="intro-mc-options">
                            {task.options.map((opt, i) => (
                                <button
                                    key={i}
                                    className={`intro-mc-btn ${feedback !== 'none'
                                        ? i === task.correctIndex
                                            ? 'intro-mc-btn--correct'
                                            : selectedOption === i
                                                ? 'intro-mc-btn--wrong'
                                                : ''
                                        : selectedOption === i
                                            ? 'intro-mc-btn--selected'
                                            : ''
                                        }`}
                                    onClick={() => { if (feedback === 'none') { setSelectedOption(i); checkAnswer(undefined, i); } }}
                                    disabled={feedback !== 'none'}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {task.type === 'DRAG_MATCH' && (
                        <div className="intro-mc-options">
                            {task.choices.map((choice) => (
                                <button
                                    key={choice}
                                    className={`intro-mc-btn ${feedback !== 'none'
                                        ? choice === task.correctChoice
                                            ? 'intro-mc-btn--correct'
                                            : answer === choice
                                                ? 'intro-mc-btn--wrong'
                                                : ''
                                        : answer === choice
                                            ? 'intro-mc-btn--selected'
                                            : ''
                                        }`}
                                    onClick={() => { if (feedback === 'none') { setAnswer(choice); checkAnswer(choice); } }}
                                    disabled={feedback !== 'none'}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    )}

                    {task.type === 'COMBINE_LIKE_TERMS' && (
                        <form className="intro-combine" onSubmit={(e: FormEvent) => { e.preventDefault(); if (answer.trim()) checkAnswer(); }}>
                            <div className="intro-combine-cards">
                                {task.cards.map((card, i) => (
                                    <span key={i} className="intro-combine-card">{card}</span>
                                ))}
                            </div>
                            <input
                                ref={inputRef}
                                className="intro-input"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Typ het antwoord…"
                                autoFocus
                                disabled={feedback !== 'none'}
                            />
                        </form>
                    )}

                    {/* feedback */}
                    {feedback === 'correct' && (
                        <div className="intro-feedback intro-feedback--correct">
                            Goed! 🎯
                        </div>
                    )}

                    {feedback === 'wrong' && (
                        <div className="intro-feedback intro-feedback--wrong">
                            Niet goed. Je krijgt een herkansing!
                            {showExplanation && getHintText() && (
                                <div className="intro-hint">{getHintText()}</div>
                            )}
                            {task.type === 'INPUT' && (
                                <div className="intro-hint">Het antwoord is: {(task as Extract<TaskData, { type: 'INPUT' }>).correctAnswer}</div>
                            )}
                            {task.type === 'COMBINE_LIKE_TERMS' && (
                                <div className="intro-hint">Het antwoord is: {(task as Extract<TaskData, { type: 'COMBINE_LIKE_TERMS' }>).correctAnswer}</div>
                            )}
                        </div>
                    )}

                    {/* auto-advance / retry countdown */}
                    {feedback !== 'none' && (
                        <div className="intro-actions">
                            <div style={{ fontSize: '0.85rem', color: 'var(--st-text-dim, #7b8db0)', marginTop: '0.5rem' }}>
                                {feedback === 'correct'
                                    ? 'Volgende vraag over 3 seconden…'
                                    : 'Soortgelijke vraag over 5 seconden…'
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
