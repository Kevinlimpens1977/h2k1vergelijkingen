/**
 * §8.1 Speed Test — "Termen Tikkie" (v1.1 Arcade Edition)
 *
 * GAMIFICATION FEATURES:
 * - Power meter (0..100): +10 on correct, reset on wrong. At 100: LEVEL UP! +3 bonus
 * - Boss round: triggers at 240s/180s/120s/60s remaining. Higher scoring.
 * - Combo banners: streak 3/5/7 show neon combo text
 * - Mission cards: 3 mini-goals for bonus points (once per run)
 * - Rival indicator: shows nearest target above player in leaderboard
 * - Live class leaderboard: top 3 via onSnapshot, confetti on top-3 entry
 *
 * Pass threshold: PASS_SCORE = 35 (unchanged)
 * Timer: 5 minutes (300s)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../../hooks/useAuth';
import { pickQuestions, type SpeedQuestion } from '../data/speedtest8_1_bank';
import { scoreAnswer, streakBonus, PASS_SCORE, TIME_LIMIT_MS } from '../utils/scoring';
import {
    MISSIONS, BOSS_BANK, BOSS_TRIGGERS, scoreBossAnswer,
    type MissionState,
} from '../utils/missions';
import {
    logSpeedTestRun,
    ensureIntroDoc,
} from '../services/introProgressService';
import {
    BOARD_IDS,
    subscribeLeaderboard,
    updateScore,
    type LeaderboardEntry,
} from '../../../services/unifiedLeaderboardService';
import { formatMathDisplay } from '../../../utils/formatMathDisplay';
import '../styles/SpeedTest8_1.css';

type Phase = 'ready' | 'playing' | 'ended';

export default function SpeedTest8_1() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    /* ── core state ───────────────────────────────────── */
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<Phase>('ready');
    const [questions] = useState<SpeedQuestion[]>(() => pickQuestions(80));
    const [qIdx, setQIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'bonus' | null>(null);
    const [lastPoints, setLastPoints] = useState(0);
    const [passed, setPassed] = useState(false);
    const [bestScore, setBestScore] = useState(0);
    const [prevBestScore, setPrevBestScore] = useState(0);

    /* ── power meter ──────────────────────────────────── */
    const [power, setPower] = useState(0);
    const [showLevelUp, setShowLevelUp] = useState(false);

    /* ── boss ─────────────────────────────────────────── */
    const [isBoss, setIsBoss] = useState(false);
    const [bossQuestion, setBossQuestion] = useState<SpeedQuestion | null>(null);
    const [showBossWin, setShowBossWin] = useState(false);
    const bossFiredRef = useRef<Set<number>>(new Set());

    /* ── combo ────────────────────────────────────────── */
    const [comboText, setComboText] = useState<string | null>(null);

    /* ── missions ─────────────────────────────────────── */
    const [missionCompleted, setMissionCompleted] = useState<Set<string>>(new Set());
    const [missionBanner, setMissionBanner] = useState<string | null>(null);
    const [missionState, setMissionState] = useState<MissionState>({
        streak: 0, correctIn2n: 0, secondsWithoutError: 0,
    });
    const lastErrorTimeRef = useRef(Date.now());

    /* ── leaderboard ──────────────────────────────────── */
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [enteredTop3, setEnteredTop3] = useState(false);
    const [showRivalBeat, setShowRivalBeat] = useState(false);
    const unsubLeaderboardRef = useRef<(() => void) | null>(null);

    /* ── refs ─────────────────────────────────────────── */
    const startTimeRef = useRef(0);
    const questionStartRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const question = isBoss && bossQuestion ? bossQuestion : questions[qIdx % questions.length];

    /* ── rival computation ────────────────────────────── */
    const rival = useMemo(() => {
        if (!profile || leaderboard.length === 0) return null;
        const top3 = leaderboard.slice(0, 3);
        // If player is already in top 3, no rival
        if (top3.some((e) => e.uid === profile.uid)) return null;
        // Rival is lowest top-3 entry, or nearest above player
        const lowestTop3 = top3[top3.length - 1];
        if (lowestTop3) {
            return { name: lowestTop3.firstName, score: lowestTop3.bestScore };
        }
        return null;
    }, [leaderboard, profile]);

    /* ── load progress + subscribe leaderboard ────────── */
    useEffect(() => {
        if (!profile) return;
        (async () => {
            const p = await ensureIntroDoc(profile.uid);
            if (p.completedSpeedTest) {
                // Already passed — but allow replaying for leaderboard
            }
            if (!p.completedIntro) {
                navigate('/8-1/intro', { replace: true });
                return;
            }
            setBestScore(p.bestScore ?? 0);
            setPrevBestScore(p.bestScore ?? 0);
            setLoading(false);
        })();

        // Subscribe to leaderboard
        const unsub = subscribeLeaderboard(
            BOARD_IDS.SPEED_TEST,
            profile.classId, 10,
            (entries) => setLeaderboard(entries),
        );
        unsubLeaderboardRef.current = unsub;

        return () => {
            unsub();
            unsubLeaderboardRef.current = null;
        };
    }, [profile, navigate]);

    /* ── timer + boss trigger ─────────────────────────── */
    useEffect(() => {
        if (phase !== 'playing') return;
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, TIME_LIMIT_MS - elapsed);
            setTimeLeft(remaining);

            // Boss trigger check
            const secLeft = Math.floor(remaining / 1000);
            for (const trigger of BOSS_TRIGGERS) {
                if (secLeft <= trigger && secLeft >= trigger - 1 && !bossFiredRef.current.has(trigger)) {
                    bossFiredRef.current.add(trigger);
                    const boss = BOSS_BANK[Math.floor(Math.random() * BOSS_BANK.length)];
                    setBossQuestion({ prompt: boss.prompt, options: boss.options, correctIndex: boss.correctIndex });
                    setIsBoss(true);
                    questionStartRef.current = Date.now();
                }
            }

            if (remaining <= 0) {
                setPhase('ended');
                clearInterval(timerRef.current);
            }
        }, 100);
        return () => clearInterval(timerRef.current);
    }, [phase]);

    /* ── mission tracking (secondsWithoutError) ───────── */
    useEffect(() => {
        if (phase !== 'playing') return;
        const iv = setInterval(() => {
            const secsSinceError = (Date.now() - lastErrorTimeRef.current) / 1000;
            setMissionState((s) => ({ ...s, secondsWithoutError: secsSinceError }));
        }, 1000);
        return () => clearInterval(iv);
    }, [phase]);

    /* ── check missions ──────────────────────────────── */
    useEffect(() => {
        if (phase !== 'playing') return;
        for (const mission of MISSIONS) {
            if (!missionCompleted.has(mission.id) && mission.check(missionState)) {
                setMissionCompleted((s) => new Set(s).add(mission.id));
                setScore((s) => s + mission.bonus);
                setMissionBanner(`${mission.label} → +${mission.bonus}!`);
                setTimeout(() => setMissionBanner(null), 1500);
            }
        }
    }, [missionState, phase, missionCompleted]);

    /* ── top 3 entry detection ────────────────────────── */
    useEffect(() => {
        if (phase !== 'playing' || enteredTop3 || !profile) return;
        const top3 = leaderboard.slice(0, 3);
        if (top3.length < 3) return; // not enough data
        const threshold = top3[2]?.bestScore ?? 0;
        if (score >= threshold && score > 0) {
            setEnteredTop3(true);
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
    }, [score, leaderboard, phase, enteredTop3, profile]);

    /* ── start ──────────────────────────────────────── */
    const startTest = useCallback(() => {
        startTimeRef.current = Date.now();
        questionStartRef.current = Date.now();
        lastErrorTimeRef.current = Date.now();
        bossFiredRef.current.clear();
        setPhase('playing');
        setScore(0);
        setStreak(0);
        setCorrectCount(0);
        setWrongCount(0);
        setQIdx(0);
        setTimeLeft(TIME_LIMIT_MS);
        setPower(0);
        setIsBoss(false);
        setBossQuestion(null);
        setShowLevelUp(false);
        setShowBossWin(false);
        setComboText(null);
        setMissionCompleted(new Set());
        setMissionBanner(null);
        setMissionState({ streak: 0, correctIn2n: 0, secondsWithoutError: 0 });
        setEnteredTop3(false);
        setShowRivalBeat(false);
        setFeedback(null);
    }, []);

    /* ── answer ──────────────────────────────────────── */
    const handleAnswer = useCallback((optionIdx: number) => {
        if (phase !== 'playing' || feedback !== null) return;

        const responseMs = Date.now() - questionStartRef.current;
        const correct = optionIdx === question.correctIndex;

        let points: number;
        if (isBoss) {
            points = scoreBossAnswer(correct, responseMs);
        } else {
            points = scoreAnswer(correct, responseMs);
        }

        let newStreak = streak;
        let bonus = 0;
        let newPower = power;

        if (correct) {
            newStreak = streak + 1;
            bonus = streakBonus(newStreak);
            setCorrectCount((c) => c + 1);

            // Power meter
            newPower = Math.min(100, power + 10);
            if (newPower >= 100) {
                // LEVEL UP!
                bonus += 3;
                newPower = 0;
                setShowLevelUp(true);
                confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
                setTimeout(() => setShowLevelUp(false), 1200);
            }
            setPower(newPower);

            // Combo banners
            if (newStreak === 3 || newStreak === 5 || newStreak === 7 || (newStreak > 7 && newStreak % 5 === 0)) {
                setComboText(`🔥 Combo x${newStreak}!`);
                setTimeout(() => setComboText(null), 1000);
            }

            // Mission: 2n tracking
            if (question.prompt.includes('2n') || question.options[question.correctIndex] === '2n') {
                setMissionState((s) => ({ ...s, correctIn2n: s.correctIn2n + 1 }));
            }

            // Boss win
            if (isBoss) {
                setShowBossWin(true);
                confetti({ particleCount: 60, spread: 60, origin: { y: 0.4 } });
                setTimeout(() => setShowBossWin(false), 1200);
            }

            // Rival beat check
            if (rival && !showRivalBeat && (score + points + bonus) >= rival.score) {
                setShowRivalBeat(true);
                setTimeout(() => setShowRivalBeat(false), 1500);
            }
        } else {
            newStreak = 0;
            newPower = 0;
            setPower(0);
            setWrongCount((w) => w + 1);
            lastErrorTimeRef.current = Date.now();
        }

        const totalGain = points + bonus;
        setScore((s) => s + totalGain);
        setStreak(newStreak);
        setMissionState((s) => ({ ...s, streak: newStreak }));
        setLastPoints(totalGain);

        if (isBoss) {
            setFeedback(correct ? 'correct' : 'wrong');
            setTimeout(() => {
                setFeedback(null);
                setIsBoss(false);
                setBossQuestion(null);
                setQIdx((i) => i + 1);
                questionStartRef.current = Date.now();
            }, 800);
        } else {
            setFeedback(bonus > 0 ? 'bonus' : correct ? 'correct' : 'wrong');
            setTimeout(() => {
                setFeedback(null);
                setQIdx((i) => i + 1);
                questionStartRef.current = Date.now();
            }, 500);
        }
    }, [phase, feedback, question, streak, power, isBoss, rival, showRivalBeat, score]);

    /* ── save results on end ─────────────────────────── */
    useEffect(() => {
        if (phase !== 'ended' || !profile) return;
        const didPass = score >= PASS_SCORE;
        setPassed(didPass);

        (async () => {
            try {
                await logSpeedTestRun(profile.uid, {
                    score,
                    passed: didPass,
                    correctCount,
                    wrongCount,
                    startedAt: startTimeRef.current,
                    endedAt: Date.now(),
                });
                await updateScore(
                    BOARD_IDS.SPEED_TEST,
                    profile.uid,
                    profile.firstName,
                    profile.classId,
                    score,
                );
                if (score > prevBestScore) {
                    setBestScore(score);
                }
            } catch (err) {
                console.warn('Could not save speed test results:', err);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    /* ── helpers ──────────────────────────────────────── */
    const formatTime = (ms: number) => {
        const s = Math.ceil(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const top3 = leaderboard.slice(0, 3);
    const playerRank = profile ? leaderboard.findIndex((e) => e.uid === profile.uid) + 1 : 0;
    const isNewRecord = score > prevBestScore && phase === 'ended';
    const scoreDelta = score - prevBestScore;

    if (loading) {
        return (
            <div className="st-page">
                <div className="st-loading">Laden…</div>
            </div>
        );
    }

    /* ── READY ──────────────────────────────────────── */
    if (phase === 'ready') {
        return (
            <div className="st-page">
                <div className="st-ready">
                    <h1 className="st-title">Termen Tikkie</h1>
                    <p className="st-subtitle">Snelheidstest — 5 minuten</p>

                    {/* Leaderboard */}
                    {top3.length > 0 && (
                        <div className="st-glass st-lb-ready">
                            <div className="st-lb-title">🏆 Klas Leaderboard</div>
                            {top3.map((e, i) => (
                                <div key={e.uid} className={`st-lb-row ${e.uid === profile?.uid ? 'st-lb-row--me' : ''}`}>
                                    <span className="st-lb-rank">#{i + 1}</span>
                                    <span className="st-lb-name">{e.firstName}</span>
                                    <span className="st-lb-score">{e.bestScore}</span>
                                </div>
                            ))}
                            {bestScore > 0 && (
                                <div className="st-lb-myscore">
                                    Jouw record: {bestScore} {playerRank > 0 && `(#${playerRank})`}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="st-rules">
                        <div>⚡ Snel goed = meer punten</div>
                        <div>💥 Fout = −1 punt</div>
                        <div>🔥 5 op rij = +5 bonus</div>
                        <div>🎯 Doel: {PASS_SCORE} punten</div>
                    </div>

                    <button className="st-btn-start" onClick={startTest}>START!</button>
                    <button className="st-btn-back" onClick={() => navigate('/8-1/intro')}>
                        ← Terug naar Termen Quest
                    </button>
                </div>
            </div>
        );
    }

    /* ── ENDED ──────────────────────────────────────── */
    if (phase === 'ended') {
        return (
            <div className="st-page">
                <div className={`st-result ${passed ? 'st-result--pass' : 'st-result--fail'}`}>
                    <div className="st-result-icon">{passed ? '🎉' : '💪'}</div>
                    <h2>{passed ? '§8.1 Ontgrendeld!' : 'Bijna!'}</h2>
                    <div className="st-result-score">{score} punten</div>

                    {isNewRecord && (
                        <div className="st-new-record">
                            ⭐ NIEUW RECORD!
                        </div>
                    )}

                    {scoreDelta !== 0 && prevBestScore > 0 && (
                        <div className="st-delta">
                            {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} vs vorige keer
                        </div>
                    )}

                    <div className="st-result-details">
                        {correctCount} goed, {wrongCount} fout
                        {!passed && ` — nog ${PASS_SCORE - score} punten nodig`}
                    </div>

                    {playerRank > 0 && (
                        <div className="st-result-rank">#{playerRank} in de klas</div>
                    )}

                    {/* Full leaderboard */}
                    {leaderboard.length > 0 && (
                        <div className="st-glass st-lb-full">
                            {leaderboard.slice(0, 5).map((e, i) => (
                                <div key={e.uid} className={`st-lb-row ${e.uid === profile?.uid ? 'st-lb-row--me' : ''}`}>
                                    <span className="st-lb-rank">#{i + 1}</span>
                                    <span className="st-lb-name">{e.firstName}</span>
                                    <span className="st-lb-score">{e.bestScore}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {rival && !passed && (
                        <div className="st-rival-end">
                            Nog {rival.score - score} tot {rival.name} (#{3})
                        </div>
                    )}

                    <div className="st-result-actions">
                        <button className="st-btn-start" onClick={startTest}>
                            Nog 1 ronde!
                        </button>
                        {passed && (
                            <button className="st-btn-start st-btn-start--alt" onClick={() => navigate('/practice/8_1')}>
                                Naar §8.1 →
                            </button>
                        )}
                        <button className="st-btn-back" onClick={() => navigate('/8-1/intro')}>
                            Bekijk hints
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── PLAYING ─────────────────────────────────────── */
    return (
        <div className="st-page">
            {/* header */}
            <header className="st-header">
                <div className="st-timer">{formatTime(timeLeft)}</div>
                <div className="st-score-display">
                    Score: <strong>{score}</strong> / {PASS_SCORE}
                </div>
                <div className="st-streak-display">🔥 {streak}</div>
            </header>

            {/* score bar */}
            <div className="st-score-bar">
                <div className="st-score-fill" style={{ width: `${Math.min(100, (score / PASS_SCORE) * 100)}%` }} />
            </div>

            {/* power meter */}
            <div className="st-power-wrap">
                <div className="st-power-label">⚡ Power</div>
                <div className="st-power-track">
                    <div className="st-power-fill" style={{ width: `${power}%` }} />
                </div>
            </div>

            {/* compact leaderboard + rival */}
            <div className="st-playing-info">
                {top3.length > 0 && (
                    <div className="st-glass st-lb-compact">
                        <div className="st-lb-compact-title">🏆 TOP 3</div>
                        {top3.map((e, i) => (
                            <div key={e.uid} className={`st-lb-row-sm ${e.uid === profile?.uid ? 'st-lb-row--me' : ''}`}>
                                <span>#{i + 1} {e.firstName}</span>
                                <span>{e.bestScore}</span>
                            </div>
                        ))}
                        {rival && (
                            <div className="st-rival-line">
                                🎯 Jaag op: {rival.name} ({rival.score}) — nog {Math.max(0, rival.score - score)}
                            </div>
                        )}
                    </div>
                )}

                {/* missions */}
                <div className="st-missions">
                    {MISSIONS.map((m) => (
                        <div key={m.id} className={`st-mission ${missionCompleted.has(m.id) ? 'st-mission--done' : ''}`}>
                            {missionCompleted.has(m.id) ? '✅' : '◻️'} {m.label} (+{m.bonus})
                        </div>
                    ))}
                </div>
            </div>

            {/* question */}
            <div className="st-main">
                <div className={`st-question ${isBoss ? 'st-question--boss' : ''}`}>
                    {isBoss && <div className="st-boss-label">SUPER-PUNTEN</div>}
                    <div className="st-prompt">
                        {question.prompt.includes('→') ? (
                            <>
                                <div>{isBoss ? '🔥 ' : ''}{formatMathDisplay(question.prompt.split('→')[0].trim())}</div>
                                <div style={{ fontSize: '0.85em', opacity: 0.85, marginTop: '0.3rem' }}>
                                    {formatMathDisplay(question.prompt.split('→')[1].trim())}
                                </div>
                            </>
                        ) : (
                            <>{isBoss ? '🔥 ' : ''}{formatMathDisplay(question.prompt)}</>
                        )}
                    </div>
                    <div className="st-options">
                        {question.options.map((opt, i) => (
                            <button
                                key={`${qIdx}-${i}`}
                                className={`st-option ${feedback !== null
                                    ? i === question.correctIndex
                                        ? 'st-option--correct'
                                        : 'st-option--wrong-disabled'
                                    : ''
                                    }`}
                                onClick={() => handleAnswer(i)}
                                disabled={feedback !== null}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* floating feedback */}
                {feedback && (
                    <div className={`st-float st-float--${feedback}`}>
                        {feedback === 'correct' && `+${lastPoints}`}
                        {feedback === 'wrong' && `${lastPoints}`}
                        {feedback === 'bonus' && `+${lastPoints} STREAK!`}
                    </div>
                )}
            </div>

            {/* banners */}
            {showLevelUp && <div className="st-neon-banner st-neon-banner--levelup">⚡ LEVEL UP! +3</div>}
            {comboText && <div className="st-neon-banner st-neon-banner--combo">{comboText}</div>}
            {showBossWin && <div className="st-neon-banner st-neon-banner--boss">SUPER-PUNTEN VERDIEND! 💥</div>}
            {missionBanner && <div className="st-neon-banner st-neon-banner--mission">🎯 {missionBanner}</div>}
            {showRivalBeat && <div className="st-neon-banner st-neon-banner--rival">🚀 Ingehaald!</div>}
            {enteredTop3 && !showRivalBeat && !showBossWin && !showLevelUp && (
                <div className="st-neon-banner st-neon-banner--top3" onAnimationEnd={() => setEnteredTop3(false)}>
                    🎉 Je staat in de TOP 3!
                </div>
            )}
        </div>
    );
}
