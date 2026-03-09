import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    generateSession,
    normalizeAnswer,
    detectErrorTags,
    detectYNErrorTags,
    detectMCErrorTags,
    getHint,
    type Exercise,
    type ErrorTag,
} from '../services/exerciseGenerator';
import { logAttempt, appendCompletedExercise } from '../services/attempts';
import {
    getProgress,
    saveAdaptiveSnapshot,
    appendRouteSwitch,
    type RouteChoice,
} from '../services/progress';
import {
    createAdaptiveState,
    restoreAdaptiveState,
    recordAnswerAndEvaluate,
    toSnapshot,
    getRouteChoice,
    type AdaptiveState,
} from '../services/adaptiveRouter';
import RouteChangeToast from '../components/RouteChangeToast';
import { formatMathDisplay } from '../utils/formatMathDisplay';
import { algebraEquals } from '../utils/algebraEquals';
import './Practice.css';

const MAX_RETRIES_COMBINE = 1; // Step 2 of CAN_COMBINE

type FeedbackState =
    | { type: 'none' }
    | { type: 'correct' }
    | { type: 'hint'; message: string; tags: ErrorTag[] }
    | { type: 'exhausted'; tags: ErrorTag[] };

type CombineStep = 'step1' | 'step2';

const ROUTE_LABEL: Record<string, string> = {
    O: 'Ondersteunend',
    D: 'Doorlopend',
    U: 'Uitdagend',
};

export default function PracticePage() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    /* ── adaptive state ─────────────────────────────────── */
    const adaptiveRef = useRef<AdaptiveState>(createAdaptiveState('D'));
    const [currentRouteLabel, setCurrentRouteLabel] = useState('Doorlopend');
    const [initDone, setInitDone] = useState(false);

    /* toast state */
    const [toastMessage, setToastMessage] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    /* session state */
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<FeedbackState>({ type: 'none' });
    const [retries, setRetries] = useState(0);
    const [sessionCorrect, setSessionCorrect] = useState(0);
    const [saving, setSaving] = useState(false);

    /* CAN_COMBINE step tracking */
    const [combineStep, setCombineStep] = useState<CombineStep>('step1');

    /* end-of-paragraph U option */
    const [showUOption, setShowUOption] = useState(false);

    /* timing */
    const startTimeRef = useRef<number>(Date.now());
    useEffect(() => {
        startTimeRef.current = Date.now();
    }, [currentIdx]);

    const inputRef = useRef<HTMLInputElement>(null);

    const current: Exercise | undefined = exercises[currentIdx];
    const isSessionDone = exercises.length > 0 && currentIdx >= exercises.length;
    const progress = exercises.length > 0 ? Math.min(currentIdx / exercises.length, 1) : 0;

    /* ── initialize: load snapshot or start fresh ────────── */
    useEffect(() => {
        if (!profile) return;
        (async () => {
            try {
                const prog = await getProgress(profile.uid, '8_1');
                let startRoute: 'O' | 'D' | 'U' = 'D';

                if (prog?.adaptiveSnapshot) {
                    // Cross-session: restore route (but fresh window)
                    const restored = restoreAdaptiveState(prog.adaptiveSnapshot);
                    adaptiveRef.current = restored;
                    startRoute = restored.currentRoute;
                } else {
                    adaptiveRef.current = createAdaptiveState('D');
                }

                setCurrentRouteLabel(ROUTE_LABEL[startRoute] || 'Doorlopend');
                setExercises(generateSession(startRoute as RouteChoice));
                setInitDone(true);
            } catch (err) {
                console.warn('Could not load adaptive state:', err);
                adaptiveRef.current = createAdaptiveState('D');
                setExercises(generateSession('D'));
                setInitDone(true);
            }
        })();
    }, [profile]);

    /* ── adaptive evaluation after answer ────────────────── */
    const evaluateAndMaybeSwitch = useCallback(async (isCorrect: boolean) => {
        if (!profile) return;

        const { newState, decision } = recordAnswerAndEvaluate(adaptiveRef.current, isCorrect);
        adaptiveRef.current = newState;

        // Persist snapshot
        try {
            await saveAdaptiveSnapshot(
                profile.uid,
                '8_1',
                toSnapshot(newState),
                getRouteChoice(newState),
            );
        } catch (err) {
            console.warn('Could not save adaptive snapshot:', err);
        }

        // Route switch?
        if (decision.switched) {
            setCurrentRouteLabel(ROUTE_LABEL[decision.newRoute] || 'Doorlopend');

            // Log the switch
            try {
                await appendRouteSwitch(profile.uid, '8_1', {
                    from: adaptiveRef.current.currentRoute === decision.newRoute
                        ? 'D' // fallback
                        : adaptiveRef.current.currentRoute,
                    to: decision.newRoute,
                    reason: decision.reason,
                    atQuestion: newState.totalAnswered,
                    timestamp: new Date().toISOString(),
                });
            } catch (err) {
                console.warn('Could not log route switch:', err);
            }

            // Show toast
            setToastMessage(decision.message);
            setToastVisible(true);

            // Regenerate remaining exercises with new difficulty
            const remaining = exercises.length - (currentIdx + 1);
            if (remaining > 0) {
                const newBatch = generateSession(decision.newRoute as RouteChoice).slice(0, remaining);
                setExercises((prev) => {
                    const kept = prev.slice(0, currentIdx + 1);
                    return [...kept, ...newBatch];
                });
            }
        }
    }, [profile, exercises.length, currentIdx]);

    /* ── MC_TERMS: handle option click ──────────────────── */
    const handleMCAnswer = useCallback(async (picked: string) => {
        if (!current || !profile || saving) return;

        const isCorrect = picked === current.correctAnswer;
        const durationMs = Date.now() - startTimeRef.current;
        const tags = isCorrect ? [] : detectMCErrorTags();

        setAnswer(picked);

        if (isCorrect) {
            setFeedback({ type: 'correct' });
            setSessionCorrect((c) => c + 1);
        } else {
            setFeedback({ type: 'exhausted', tags });
        }

        setSaving(true);
        try {
            await logAttempt(profile.uid, {
                paragraphId: '8_1',
                exerciseType: 'MC_TERMS',
                prompt: current.prompt,
                studentAnswer: picked,
                correctAnswer: current.correctAnswer,
                isCorrect,
                errorTags: tags,
                durationMs,
                retries: 0,
            });
            if (isCorrect) {
                await appendCompletedExercise(profile.uid, '8_1', current.id);
            }
        } catch (err) {
            console.warn('Could not save attempt:', err);
        } finally {
            setSaving(false);
        }

        // Adaptive evaluation
        await evaluateAndMaybeSwitch(isCorrect);
    }, [current, profile, saving, evaluateAndMaybeSwitch]);

    /* ── CAN_COMBINE step 1: ja/nee ─────────────────────── */
    const handleCombineYN = useCallback(async (picked: 'ja' | 'nee') => {
        if (!current || !profile || saving) return;

        const isCorrect = picked === current.correctAnswer;
        const durationMs = Date.now() - startTimeRef.current;

        setAnswer(picked);

        if (isCorrect) {
            if (current.canCombine && picked === 'ja') {
                setFeedback({ type: 'correct' });
                setTimeout(() => {
                    setCombineStep('step2');
                    setFeedback({ type: 'none' });
                    setAnswer('');
                    setRetries(0);
                    setTimeout(() => inputRef.current?.focus(), 50);
                }, 800);
            } else {
                setFeedback({ type: 'correct' });
                setSessionCorrect((c) => c + 1);
            }

            setSaving(true);
            try {
                await logAttempt(profile.uid, {
                    paragraphId: '8_1',
                    exerciseType: 'CAN_COMBINE',
                    prompt: `Samenvoegen? ${current.prompt}`,
                    studentAnswer: picked,
                    correctAnswer: current.correctAnswer,
                    isCorrect: true,
                    errorTags: [],
                    durationMs,
                    retries: 0,
                });
                if (!current.canCombine) {
                    await appendCompletedExercise(profile.uid, '8_1', current.id);
                }
            } catch (err) {
                console.warn('Could not save attempt:', err);
            } finally {
                setSaving(false);
            }

            // Adaptive evaluation (correct answer for step 1)
            if (!current.canCombine) {
                // "nee" was correct and exercise is done → evaluate
                await evaluateAndMaybeSwitch(true);
            }
            // If canCombine, we wait for step 2 to evaluate
        } else {
            const tags = detectYNErrorTags(picked, current.correctAnswer);
            setFeedback({ type: 'exhausted', tags });

            setSaving(true);
            try {
                await logAttempt(profile.uid, {
                    paragraphId: '8_1',
                    exerciseType: 'CAN_COMBINE',
                    prompt: `Samenvoegen? ${current.prompt}`,
                    studentAnswer: picked,
                    correctAnswer: current.correctAnswer,
                    isCorrect: false,
                    errorTags: tags,
                    durationMs,
                    retries: 0,
                });
            } catch (err) {
                console.warn('Could not save attempt:', err);
            } finally {
                setSaving(false);
            }

            // Adaptive evaluation (wrong answer)
            await evaluateAndMaybeSwitch(false);
        }
    }, [current, profile, saving, evaluateAndMaybeSwitch]);

    /* ── CAN_COMBINE step 2: simplify input ─────────────── */
    const handleCombineCheck = useCallback(async () => {
        if (!current || !profile || saving || !current.combinedAnswer) return;
        if (answer.trim() === '') return;

        const normalized = normalizeAnswer(answer);
        const correctNorm = normalizeAnswer(current.combinedAnswer);
        const isCorrect = normalized === correctNorm || algebraEquals(answer, current.combinedAnswer);
        const durationMs = Date.now() - startTimeRef.current;

        if (isCorrect) {
            setFeedback({ type: 'correct' });
            setSessionCorrect((c) => c + 1);

            setSaving(true);
            try {
                await logAttempt(profile.uid, {
                    paragraphId: '8_1',
                    exerciseType: 'CAN_COMBINE',
                    prompt: `Vereenvoudig: ${current.prompt}`,
                    studentAnswer: answer,
                    correctAnswer: current.combinedAnswer,
                    isCorrect: true,
                    errorTags: [],
                    durationMs,
                    retries,
                });
                await appendCompletedExercise(profile.uid, '8_1', current.id);
            } catch (err) {
                console.warn('Could not save attempt:', err);
            } finally {
                setSaving(false);
            }

            // Adaptive evaluation
            await evaluateAndMaybeSwitch(true);
        } else {
            const tags = detectErrorTags(answer, current.combinedAnswer);

            if (retries < MAX_RETRIES_COMBINE) {
                setFeedback({ type: 'hint', message: getHint(tags), tags });
                setRetries((r) => r + 1);
            } else {
                setFeedback({ type: 'exhausted', tags });

                setSaving(true);
                try {
                    await logAttempt(profile.uid, {
                        paragraphId: '8_1',
                        exerciseType: 'CAN_COMBINE',
                        prompt: `Vereenvoudig: ${current.prompt}`,
                        studentAnswer: answer,
                        correctAnswer: current.combinedAnswer,
                        isCorrect: false,
                        errorTags: tags,
                        durationMs,
                        retries: retries + 1,
                    });
                } catch (err) {
                    console.warn('Could not save attempt:', err);
                } finally {
                    setSaving(false);
                }

                // Adaptive evaluation
                await evaluateAndMaybeSwitch(false);
            }
        }
    }, [current, profile, answer, retries, saving, evaluateAndMaybeSwitch]);

    /* ── next exercise ──────────────────────────────────── */
    const handleNext = useCallback(() => {
        setCurrentIdx((i) => i + 1);
        setAnswer('');
        setFeedback({ type: 'none' });
        setRetries(0);
        setCombineStep('step1');
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    /* ── restart session ────────────────────────────────── */
    const handleRestart = useCallback(() => {
        const route = adaptiveRef.current.currentRoute;
        setExercises(generateSession(route as RouteChoice));
        setCurrentIdx(0);
        setAnswer('');
        setFeedback({ type: 'none' });
        setRetries(0);
        setSessionCorrect(0);
        setCombineStep('step1');
        setShowUOption(false);
    }, []);

    /* ── start U bonus round ────────────────────────────── */
    const handleStartUBonus = useCallback(() => {
        adaptiveRef.current = {
            ...adaptiveRef.current,
            currentRoute: 'U',
            answersWindow: [],
            isLocked: true, // no more auto-switches in bonus round
        };
        setCurrentRouteLabel('Uitdagend');
        setExercises(generateSession('U'));
        setCurrentIdx(0);
        setAnswer('');
        setFeedback({ type: 'none' });
        setRetries(0);
        setSessionCorrect(0);
        setCombineStep('step1');
        setShowUOption(false);
    }, []);

    /* ── keyboard shortcut ──────────────────────────────── */
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (feedback.type === 'correct' || feedback.type === 'exhausted') {
                    if (current?.exerciseType === 'CAN_COMBINE' && combineStep === 'step1' && feedback.type === 'correct' && current.canCombine) {
                        return;
                    }
                    handleNext();
                } else if (combineStep === 'step2') {
                    handleCombineCheck();
                }
            }
        },
        [feedback, handleNext, handleCombineCheck, current, combineStep],
    );

    /* ── render helpers ──────────────────────────────────── */

    const renderNextButton = () => (
        <div className="practice-actions">
            <button
                className="practice-btn practice-btn--next"
                onClick={handleNext}
                disabled={saving}
            >
                {currentIdx < exercises.length - 1 ? 'Volgende →' : 'Afronden →'}
            </button>
        </div>
    );

    /* ── MC_TERMS renderer ──────────────────────────────── */
    const renderMC = () => {
        if (!current || !current.mcOptions) return null;
        const letters = ['A', 'B', 'C', 'D'];
        const answered = feedback.type !== 'none';

        return (
            <>
                <div className="practice-prompt practice-prompt--mc">
                    <div className="practice-mc-question">
                        Welke termen staan er in deze uitdrukking?
                    </div>
                    <span>{formatMathDisplay(current.prompt)}</span>
                </div>

                <div className="practice-mc-options">
                    {current.mcOptions.map((opt, idx) => {
                        const isSelected = answer === opt;
                        const isCorrectOpt = opt === current.correctAnswer;
                        let cls = 'practice-mc-option';
                        if (answered && isCorrectOpt) cls += ' practice-mc-option--correct';
                        else if (answered && isSelected && !isCorrectOpt) cls += ' practice-mc-option--wrong';
                        else if (!answered) cls += ' practice-mc-option--idle';

                        return (
                            <button
                                key={idx}
                                className={cls}
                                onClick={() => handleMCAnswer(opt)}
                                disabled={answered || saving}
                            >
                                <span className="practice-mc-letter">{letters[idx]}</span>
                                <span className="practice-mc-text">{opt}</span>
                            </button>
                        );
                    })}
                </div>

                {answered && renderNextButton()}
            </>
        );
    };

    /* ── CAN_COMBINE renderer ───────────────────────────── */
    const renderCombine = () => {
        if (!current) return null;

        return (
            <>
                <div className="practice-prompt practice-prompt--yn">
                    <div className="practice-yn-question">
                        {combineStep === 'step1'
                            ? 'Kun je deze termen samenvoegen?'
                            : 'Goed! Wat wordt het samen?'}
                    </div>
                    <span>{formatMathDisplay(current.prompt)}</span>
                </div>

                {combineStep === 'step1' ? (
                    feedback.type === 'none' ? (
                        <div className="practice-yn-buttons">
                            <button
                                className="practice-btn practice-btn--ja"
                                onClick={() => handleCombineYN('ja')}
                                disabled={saving}
                            >
                                Ja
                            </button>
                            <button
                                className="practice-btn practice-btn--nee"
                                onClick={() => handleCombineYN('nee')}
                                disabled={saving}
                            >
                                Nee
                            </button>
                        </div>
                    ) : feedback.type === 'correct' && current.canCombine ? (
                        <div className="practice-feedback practice-feedback--correct">
                            <span className="practice-feedback-icon">✓</span>
                            Ja, klopt! Even kijken wat het samen wordt…
                        </div>
                    ) : (
                        renderNextButton()
                    )
                ) : (
                    <>
                        <div className="practice-input-group">
                            <label className="practice-input-label" htmlFor="practice-combine">
                                Jouw antwoord:
                            </label>
                            <input
                                ref={inputRef}
                                id="practice-combine"
                                className={`practice-input ${feedback.type === 'correct'
                                    ? 'practice-input--correct'
                                    : feedback.type === 'exhausted'
                                        ? 'practice-input--incorrect'
                                        : ''
                                    }`}
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="bijv. 11x"
                                disabled={
                                    feedback.type === 'correct' || feedback.type === 'exhausted'
                                }
                                autoFocus
                                autoComplete="off"
                            />
                            {retries > 0 && feedback.type === 'hint' && (
                                <div className="practice-retries">
                                    Poging {retries + 1} van {MAX_RETRIES_COMBINE + 1}
                                </div>
                            )}
                        </div>

                        <div className="practice-actions">
                            {feedback.type === 'correct' || feedback.type === 'exhausted' ? (
                                <button
                                    className="practice-btn practice-btn--next"
                                    onClick={handleNext}
                                    disabled={saving}
                                >
                                    {currentIdx < exercises.length - 1 ? 'Volgende →' : 'Afronden →'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="practice-btn practice-btn--check"
                                        onClick={handleCombineCheck}
                                        disabled={answer.trim() === '' || saving}
                                    >
                                        {saving ? 'Opslaan...' : 'Controleer'}
                                    </button>
                                    {feedback.type === 'hint' && (
                                        <button
                                            className="practice-btn practice-btn--retry"
                                            onClick={() => {
                                                setAnswer('');
                                                setFeedback({ type: 'none' });
                                                inputRef.current?.focus();
                                            }}
                                        >
                                            Wis &amp; probeer opnieuw
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </>
        );
    };

    /* ── main render ─────────────────────────────────────── */

    if (!initDone) {
        return (
            <div className="practice-page">
                <div className="practice-main">
                    <div className="practice-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        Laden...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="practice-page">
            {/* Route change toast */}
            <RouteChangeToast
                message={toastMessage}
                visible={toastVisible}
                onDone={() => setToastVisible(false)}
            />

            <header className="practice-header">
                <button onClick={() => navigate('/paragraph/8_1')} className="practice-back">
                    ← Terug
                </button>
                <div className="practice-header-info">
                    <h1>§8.1 Oefenen</h1>
                    <span>Route {currentRouteLabel}</span>
                </div>
                <div className="practice-progress-bar">
                    <div className="practice-progress-track">
                        <div
                            className="practice-progress-fill"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                    <span>
                        {Math.min(currentIdx + 1, exercises.length)}/{exercises.length}
                    </span>
                </div>
            </header>

            <div className="practice-main">
                {isSessionDone ? (
                    <div className="practice-card practice-complete">
                        <div className="practice-complete-icon">🎉</div>
                        <h2>Sessie voltooid!</h2>
                        <p style={{ color: '#94a3b8' }}>
                            Je hebt alle {exercises.length} opgaven afgerond.
                        </p>

                        <div className="practice-complete-stats">
                            <div className="practice-stat">
                                <span className="practice-stat-value practice-stat-value--green">
                                    {sessionCorrect}
                                </span>
                                <span className="practice-stat-label">Goed</span>
                            </div>
                            <div className="practice-stat">
                                <span className="practice-stat-value">
                                    {exercises.length - sessionCorrect}
                                </span>
                                <span className="practice-stat-label">Fout</span>
                            </div>
                            <div className="practice-stat">
                                <span className="practice-stat-value">
                                    {Math.round((sessionCorrect / exercises.length) * 100)}%
                                </span>
                                <span className="practice-stat-label">Score</span>
                            </div>
                        </div>

                        {/* End-of-paragraph U option */}
                        {adaptiveRef.current.currentRoute === 'D' && !showUOption && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(167, 139, 250, 0.08)',
                                border: '1px solid rgba(167, 139, 250, 0.2)',
                                borderRadius: '0.75rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ color: '#c4b5fd', marginBottom: '0.75rem' }}>
                                    Je hebt deze paragraaf goed gedaan! Wil je ook de uitdagende opgaven proberen?
                                </p>
                                <button
                                    className="practice-btn practice-btn--again"
                                    style={{
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                    }}
                                    onClick={handleStartUBonus}
                                >
                                    🚀 Ja, uitdagende opgaven!
                                </button>
                            </div>
                        )}

                        <div className="practice-complete-actions">
                            <button
                                className="practice-btn practice-btn--home"
                                onClick={() => navigate('/paragraph/8_1')}
                            >
                                Terug naar §8.1
                            </button>
                            <button
                                className="practice-btn practice-btn--again"
                                onClick={handleRestart}
                            >
                                Opnieuw oefenen
                            </button>
                        </div>
                    </div>
                ) : current ? (
                    <div className="practice-card" key={`${current.id}-${combineStep}`}>
                        <div className="practice-card-type">
                            {current.exerciseType === 'MC_TERMS'
                                ? 'Termen herkennen'
                                : combineStep === 'step2'
                                    ? 'Termen samenvoegen'
                                    : 'Kun je samenvoegen?'}
                        </div>

                        {current.exerciseType === 'MC_TERMS'
                            ? renderMC()
                            : renderCombine()}

                        {/* shared feedback */}
                        {feedback.type === 'correct' && !(current.exerciseType === 'CAN_COMBINE' && combineStep === 'step1' && current.canCombine) && (
                            <div className="practice-feedback practice-feedback--correct">
                                <span className="practice-feedback-icon">✓</span>
                                {current.exerciseType === 'MC_TERMS'
                                    ? 'Goed! Dat zijn de juiste termen.'
                                    : current.exerciseType === 'CAN_COMBINE' && combineStep === 'step1'
                                        ? 'Goed! Deze termen zijn niet gelijksoortig.'
                                        : 'Goed! Druk op Enter of klik Volgende.'}
                            </div>
                        )}

                        {feedback.type === 'hint' && (
                            <div className="practice-feedback practice-feedback--hint">
                                <span className="practice-feedback-icon">💡</span>
                                {feedback.message}
                            </div>
                        )}

                        {feedback.type === 'exhausted' && (
                            <div className="practice-feedback practice-feedback--incorrect">
                                <span className="practice-feedback-icon">✗</span>
                                {current.exerciseType === 'MC_TERMS' ? (
                                    <>
                                        Helaas! Een term is een stuk dat je niet verder uit elkaar haalt.
                                        <div className="practice-worked-answer">
                                            Het goede antwoord is: <strong>{current.correctAnswer}</strong>
                                        </div>
                                    </>
                                ) : combineStep === 'step1' ? (
                                    <>
                                        {current.canCombine
                                            ? 'Deze termen hebben dezelfde letter, dus je kunt ze wél samenvoegen.'
                                            : 'Deze termen hebben niet dezelfde letter (of één is een los getal), dus je kunt ze niet samenvoegen.'}
                                    </>
                                ) : (
                                    <>
                                        Helaas, dat is niet juist.
                                        <div className="practice-worked-answer">
                                            Het goede antwoord is: <strong>{current.combinedAnswer}</strong>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

