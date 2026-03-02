/**
 * §8.1 Intro — "Termen Quest"
 *
 * Progress doc: /progress/{uid}/paragraphs/8_1_intro
 * Pass score: PASS_SCORE (35) for speed test
 * Guard: /practice/8_1 redirects here if !completedSpeedTest
 *
 * 6 short levels with mixed task types.
 * On completion of all levels: markIntroCompleted → navigate to speed test.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { INTRO_LEVELS, type TaskData } from '../data/intro8_1_content';
import {
    markIntroCompleted,
    ensureIntroDoc,
} from '../services/introProgressService';
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

    const level = INTRO_LEVELS[levelIdx];
    const task = level?.tasks[taskIdx];
    const totalTasks = INTRO_LEVELS.reduce((s, l) => s + l.tasks.length, 0);
    const doneTasks = INTRO_LEVELS.slice(0, levelIdx).reduce((s, l) => s + l.tasks.length, 0) + taskIdx;

    /* ── load progress ──────────────────────────────────── */
    useEffect(() => {
        if (!profile) return;
        (async () => {
            const p = await ensureIntroDoc(profile.uid);
            // If already completed intro, skip to speed test
            if (p.completedSpeedTest) {
                navigate('/practice/8_1', { replace: true });
            } else if (p.completedIntro) {
                navigate('/8-1/speed-test', { replace: true });
            }
            setLoading(false);
        })();
    }, [profile, navigate]);

    /* ── check answer ───────────────────────────────────── */
    const checkAnswer = useCallback(() => {
        if (!task || feedback !== 'none') return;

        let correct = false;

        switch (task.type) {
            case 'INPUT':
                correct = answer.trim() === task.correctAnswer;
                break;
            case 'MC':
                correct = selectedOption === task.correctIndex;
                break;
            case 'DRAG_MATCH':
                correct = answer === task.correctChoice;
                break;
            case 'COMBINE_LIKE_TERMS': {
                const norm = answer.trim().replace(/\s+/g, ' ');
                correct = norm === task.correctAnswer ||
                    (task.alternativeAnswers?.includes(norm) ?? false);
                break;
            }
        }

        if (correct) {
            setFeedback('correct');
            setStreak((s) => s + 1);
            setXp((x) => x + 10);
        } else {
            setFeedback('wrong');
            setStreak(0);
            setShowExplanation(true);
        }
    }, [task, answer, selectedOption, feedback]);

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
                }
            }
        }
        setFeedback('none');
        setAnswer('');
        setSelectedOption(null);
        setShowExplanation(false);
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

    if (completed) {
        return (
            <div className="intro-page">
                <div className="intro-complete-card">
                    <div className="intro-complete-icon">🎉</div>
                    <h2>Termen Quest voltooid!</h2>
                    <p>Je hebt alle 6 levels gehaald. XP: {xp}</p>
                    <p>Nu volgt de Speed Test om §8.1 te ontgrendelen.</p>
                    <button
                        className="intro-btn-primary"
                        onClick={() => navigate('/8-1/speed-test')}
                    >
                        Start Speed Test →
                    </button>
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
                        <div className="intro-input-group">
                            <input
                                className="intro-input"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                                placeholder="Typ je antwoord…"
                                autoFocus
                                disabled={feedback !== 'none'}
                            />
                        </div>
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
                                    onClick={() => feedback === 'none' && setSelectedOption(i)}
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
                                    onClick={() => feedback === 'none' && setAnswer(choice)}
                                    disabled={feedback !== 'none'}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    )}

                    {task.type === 'COMBINE_LIKE_TERMS' && (
                        <div className="intro-combine">
                            <div className="intro-combine-cards">
                                {task.cards.map((card, i) => (
                                    <span key={i} className="intro-combine-card">{card}</span>
                                ))}
                            </div>
                            <input
                                className="intro-input"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                                placeholder="Typ het antwoord…"
                                autoFocus
                                disabled={feedback !== 'none'}
                            />
                        </div>
                    )}

                    {/* feedback */}
                    {feedback === 'correct' && (
                        <div className="intro-feedback intro-feedback--correct">
                            Goed! 🎯
                        </div>
                    )}

                    {feedback === 'wrong' && (
                        <div className="intro-feedback intro-feedback--wrong">
                            Niet goed.
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

                    {/* action buttons */}
                    <div className="intro-actions">
                        {feedback === 'none' ? (
                            <button
                                className="intro-btn-primary"
                                onClick={checkAnswer}
                                disabled={
                                    (task.type === 'INPUT' && answer.trim() === '') ||
                                    (task.type === 'MC' && selectedOption === null) ||
                                    (task.type === 'DRAG_MATCH' && answer === '') ||
                                    (task.type === 'COMBINE_LIKE_TERMS' && answer.trim() === '')
                                }
                            >
                                Controleer
                            </button>
                        ) : (
                            <button className="intro-btn-primary" onClick={nextTask}>
                                Volgende →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
