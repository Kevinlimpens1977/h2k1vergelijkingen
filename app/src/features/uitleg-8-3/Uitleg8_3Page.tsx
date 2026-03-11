/**
 * §8.3 Uitleg — Interactive Theory Explanation
 *
 * Explains the transition from §8.2 (variables on one side) to §8.3
 * (variables on BOTH sides of the equation). Uses an animated step-by-step
 * walkthrough with a visual balance metaphor.
 *
 * Gate: must complete Balans Blitz (8_2_blitz) to access.
 * On completion: marks uitleg8_3 as passed → unlocks Termtris.
 *
 * Flow: welcome → theory cards → interactive example → book exercises overview → done
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { shuffleMCOptions } from '../../utils/shuffleMC';
import './Uitleg8_3.css';

/* ── slide content ────────────────────────────────────────── */

const BALANCE_STEPS = [
    { label: 'Start', equation: '4a + 1 = 2a + 5', left: '4 zakjes + 1 knikker', right: '2 zakjes + 5 knikkers', action: '' },
    { label: 'Actie 1', equation: '4a = 2a + 4', left: '4 zakjes', right: '2 zakjes + 4 knikkers', action: 'Links en rechts 1 knikker weghalen (−1)' },
    { label: 'Actie 2', equation: '2a = 4', left: '2 zakjes', right: '4 knikkers', action: 'Links en rechts 2 zakjes weghalen (−2a)' },
    { label: 'Conclusie', equation: 'a = 2', left: '1 zakje', right: '2 knikkers', action: 'In twee zakjes zitten 4 knikkers, dus in één zakje zitten 2 knikkers (÷2)' },
];

/* ── helper: animated balance visual ─────────────────────── */

function BalanceVisual({ left, right, equation, action, isActive }: {
    left: string;
    right: string;
    equation: string;
    action: string;
    isActive: boolean;
}) {
    return (
        <div className={`u83-balance ${isActive ? 'u83-balance--active' : ''}`}>
            {action && <div className="u83-balance-action">{action}</div>}
            <div className="u83-balance-beam">
                <div className="u83-balance-pan u83-balance-pan--left">
                    <div className="u83-pan-label">Links</div>
                    <div className="u83-pan-content">{left}</div>
                </div>
                <div className="u83-balance-fulcrum">⚖️</div>
                <div className="u83-balance-pan u83-balance-pan--right">
                    <div className="u83-pan-label">Rechts</div>
                    <div className="u83-pan-content">{right}</div>
                </div>
            </div>
            <div className="u83-balance-equation">{equation}</div>
        </div>
    );
}

/* ── exercise overview card ──────────────────────────────── */

const BOOK_EXERCISES = [
    { id: '15', page: 'p. 54', desc: '4g + 3 = 2g + 17 — drie balansen, stap voor stap uitwerken' },
    { id: '16', page: 'p. 54', desc: '2a + 10 = 5a + 4 — zakjes en knikkers weghalen' },
    { id: '17', page: 'p. 55', desc: 'Kladblaadje: vergelijkingen bij balans ❶❷❸ invullen' },
    { id: '18', page: 'p. 56', desc: 'Twee balansen: 5a + 4 = a + 20 en 4a + 18 = 6a + 4' },
    { id: '19', page: 'p. 56', desc: 'Drie vergelijkingen oplossen met de balans' },
];

const ROUTE_INFO = [
    { emoji: '🔵', label: 'Ondersteunend', exercises: '15 → 16 → 17 → 18 → O19' },
    { emoji: '🟢', label: 'Doorlopend', exercises: '15 → 16 → 17 → 18 → 19' },
    { emoji: '🟣', label: 'Uitdagend', exercises: '16 → 17 → 18 → 19 → U4' },
];

/* ── quiz questions ──────────────────────────────────────── */

interface QuizQuestion {
    prompt: string;
    equation: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        prompt: 'Wat is de eerste stap om deze vergelijking op te lossen?',
        equation: '5a + 3 = 2a + 12',
        options: [
            'Links en rechts 2a weghalen (−2a)',
            'Links en rechts 3 weghalen (−3)',
            'Links en rechts 12 weghalen (−12)',
        ],
        correctIndex: 0,
        explanation: 'Eerst de zakjes (letters) gelijkmaken: haal aan beide kanten 2a weg → 3a + 3 = 12',
    },
    {
        prompt: 'Na −2a aan beide kanten: 3a + 3 = 12. Wat is de volgende stap?',
        equation: '3a + 3 = 12',
        options: [
            'Links en rechts 3 weghalen (−3)',
            'Links en rechts delen door 3 (÷3)',
            'Links 3a weghalen (−3a)',
        ],
        correctIndex: 0,
        explanation: 'Haal nu de losse knikkers weg: −3 aan beide kanten → 3a = 9',
    },
    {
        prompt: 'Na −3 aan beide kanten: 3a = 9. Wat is de oplossing?',
        equation: '3a = 9',
        options: [
            'a = 3',
            'a = 6',
            'a = 9',
        ],
        correctIndex: 0,
        explanation: 'Deel beide kanten door 3: a = 9 ÷ 3 = 3 ✓',
    },
    {
        prompt: 'Los op: 6b + 2 = 4b + 10. Wat is b?',
        equation: '6b + 2 = 4b + 10',
        options: [
            'b = 4',
            'b = 5',
            'b = 3',
        ],
        correctIndex: 0,
        explanation: '−4b: 2b + 2 = 10 → −2: 2b = 8 → ÷2: b = 4 ✓',
    },
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

type Phase = 'welcome' | 'theory' | 'example' | 'quiz' | 'exercises' | 'done';

export default function Uitleg8_3Page() {
    const navigate = useNavigate();

    const [phase, setPhase] = useState<Phase>('welcome');
    const [exampleStep, setExampleStep] = useState(0);
    const [quizIdx, setQuizIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [quizCorrect, setQuizCorrect] = useState(0);

    /** Navigate to practice page */
    const handleComplete = useCallback(() => {
        navigate('/practice/8_3');
    }, [navigate]);

    /** Quiz answer handler */
    const handleQuizAnswer = (idx: number) => {
        if (quizFeedback) return;
        setSelectedOption(idx);
        const q = QUIZ_QUESTIONS[quizIdx];
        const shuffled = shuffleMCOptions(q.options, q.correctIndex, `quiz-${quizIdx}`);
        const correct = idx === shuffled.correctIndex;
        setQuizFeedback(correct ? 'correct' : 'wrong');
        if (correct) setQuizCorrect((c) => c + 1);

        // Auto-advance after delay
        setTimeout(() => {
            if (quizIdx + 1 < QUIZ_QUESTIONS.length) {
                setQuizIdx((i) => i + 1);
                setSelectedOption(null);
                setQuizFeedback(null);
            } else {
                // Quiz done → go to exercises overview
                setPhase('exercises');
            }
        }, correct ? 2000 : 3000);
    };

    /* ═══════════════════════════════════════════════════════
       WELCOME SCREEN
       ═══════════════════════════════════════════════════════ */
    if (phase === 'welcome') {
        return (
            <div className="u83-page">
                <header className="u83-topbar">
                    <div className="u83-topbar-title">
                        <span className="u83-icon">📖</span>
                        <span>§8.3 Uitleg</span>
                    </div>
                    <button onClick={() => navigate('/')} className="u83-btn u83-btn--ghost">← Terug</button>
                </header>

                <div className="u83-hero">
                    <div className="u83-hero-icon">⚖️</div>
                    <h1>§8.3 — Vergelijkingen oplossen met&nbsp;een&nbsp;balans</h1>
                    <p className="u83-hero-sub">
                        In §8.2 stonden de letters alleen aan <strong>één kant</strong>.
                        Nu leer je vergelijkingen oplossen met letters aan <strong>beide kanten</strong>!
                    </p>

                    <div className="u83-comparison">
                        <div className="u83-compare-card u83-compare-card--old">
                            <div className="u83-compare-badge">§8.2</div>
                            <div className="u83-compare-eq">5a + 6 = 16</div>
                            <div className="u83-compare-desc">Letters aan één kant</div>
                        </div>
                        <div className="u83-compare-arrow">→</div>
                        <div className="u83-compare-card u83-compare-card--new">
                            <div className="u83-compare-badge">§8.3</div>
                            <div className="u83-compare-eq">4a + 1 = 2a + 5</div>
                            <div className="u83-compare-desc">Letters aan beide kanten</div>
                        </div>
                    </div>

                    <div className="u83-key-rule">
                        <div className="u83-key-rule-icon">💡</div>
                        <div className="u83-key-rule-text">
                            <strong>Kernregel:</strong> Bij een vergelijking kun je denken aan een balans.
                            Je kunt de vergelijking oplossen door links en rechts van het '= teken' <strong>hetzelfde</strong> te doen.
                        </div>
                    </div>

                    <div className="u83-learning-goal">
                        <div className="u83-learning-goal-label">Leerdoel</div>
                        <div className="u83-learning-goal-text">
                            Je leert hoe je een vergelijking oplost met een balans
                        </div>
                    </div>

                    <button className="u83-btn u83-btn--primary u83-btn--lg" onClick={() => setPhase('theory')}>
                        Bekijk de theorie →
                    </button>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════
       THEORY SCREEN — new approach explained
       ═══════════════════════════════════════════════════════ */
    if (phase === 'theory') {
        return (
            <div className="u83-page">
                <header className="u83-topbar">
                    <div className="u83-topbar-title">
                        <span className="u83-icon">📖</span>
                        <span>§8.3 Uitleg — Theorie</span>
                    </div>
                    <button onClick={() => setPhase('welcome')} className="u83-btn u83-btn--ghost">← Terug</button>
                </header>

                <div className="u83-theory">
                    <h2>Verschil met §8.2</h2>
                    <div className="u83-diff-table">
                        <div className="u83-diff-row u83-diff-row--header">
                            <div>§8.2</div>
                            <div>§8.3 (nieuw!)</div>
                        </div>
                        <div className="u83-diff-row">
                            <div>Letters alleen aan <strong>één kant</strong></div>
                            <div>Letters aan <strong>beide kanten</strong></div>
                        </div>
                        <div className="u83-diff-row">
                            <div>Alleen knikkers (getallen) weghalen</div>
                            <div>Eerst <strong>zakjes</strong> (letters) weghalen, dan getallen</div>
                        </div>
                        <div className="u83-diff-row">
                            <div>Voorbeeld: <code>5a + 6 = 16</code></div>
                            <div>Voorbeeld: <code>4a + 1 = 2a + 5</code></div>
                        </div>
                    </div>

                    <div className="u83-method-steps">
                        <h3>Aanpak in 3 stappen</h3>
                        <div className="u83-step-cards">
                            <div className="u83-step-card">
                                <div className="u83-step-num">1</div>
                                <div className="u83-step-text">
                                    <strong>Zakjes (letters) gelijkmaken:</strong> Haal aan beide kanten hetzelfde aantal zakjes weg
                                </div>
                            </div>
                            <div className="u83-step-card">
                                <div className="u83-step-num">2</div>
                                <div className="u83-step-text">
                                    <strong>Knikkers (getallen) weghalen:</strong> Haal de losse knikkers aan beide kanten weg
                                </div>
                            </div>
                            <div className="u83-step-card">
                                <div className="u83-step-num">3</div>
                                <div className="u83-step-text">
                                    <strong>Delen:</strong> Deel door het aantal zakjes om de waarde van 1 zakje te vinden
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="u83-btn u83-btn--primary u83-btn--lg" onClick={() => setPhase('example')}>
                        Bekijk het voorbeeld →
                    </button>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════
       INTERACTIVE EXAMPLE — step through balance
       ═══════════════════════════════════════════════════════ */
    if (phase === 'example') {
        const step = BALANCE_STEPS[exampleStep];
        const isLast = exampleStep === BALANCE_STEPS.length - 1;

        return (
            <div className="u83-page">
                <header className="u83-topbar">
                    <div className="u83-topbar-title">
                        <span className="u83-icon">📖</span>
                        <span>§8.3 Uitleg — Voorbeeld</span>
                    </div>
                    <button onClick={() => setPhase('theory')} className="u83-btn u83-btn--ghost">← Terug</button>
                </header>

                <div className="u83-example">
                    <h2>Voorbeeld: 4a + 1 = 2a + 5</h2>
                    <p className="u83-example-sub">Volg de stappen om de vergelijking op te lossen</p>

                    {/* Progress dots */}
                    <div className="u83-example-dots">
                        {BALANCE_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`u83-dot ${i === exampleStep ? 'u83-dot--active' : i < exampleStep ? 'u83-dot--done' : ''}`}
                            />
                        ))}
                    </div>

                    {/* Step label */}
                    <div className="u83-step-label">{step.label}</div>

                    {/* Balance visual */}
                    <BalanceVisual
                        left={step.left}
                        right={step.right}
                        equation={step.equation}
                        action={step.action}
                        isActive={true}
                    />

                    {/* Step history */}
                    {exampleStep > 0 && (
                        <div className="u83-step-log">
                            <div className="u83-step-log-title">Stappen tot nu toe:</div>
                            {BALANCE_STEPS.slice(0, exampleStep + 1).map((s, i) => (
                                <div key={i} className={`u83-log-entry ${i === exampleStep ? 'u83-log-entry--current' : ''}`}>
                                    <span className="u83-log-step">Stap {i}:</span>
                                    <span className="u83-log-eq">{s.equation}</span>
                                    {s.action && <span className="u83-log-action">({s.action.split('(')[0].trim()})</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="u83-example-nav">
                        {exampleStep > 0 && (
                            <button
                                className="u83-btn u83-btn--ghost"
                                onClick={() => setExampleStep((s) => s - 1)}
                            >
                                ← Vorige stap
                            </button>
                        )}
                        {isLast ? (
                            <button
                                className="u83-btn u83-btn--primary u83-btn--lg"
                                onClick={() => setPhase('quiz')}
                            >
                                Nu jij! Oefenvragen →
                            </button>
                        ) : (
                            <button
                                className="u83-btn u83-btn--primary"
                                onClick={() => setExampleStep((s) => s + 1)}
                            >
                                Volgende stap →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════
       QUIZ — quick comprehension check
       ═══════════════════════════════════════════════════════ */
    if (phase === 'quiz') {
        const q = QUIZ_QUESTIONS[quizIdx];
        return (
            <div className="u83-page">
                <header className="u83-topbar">
                    <div className="u83-topbar-title">
                        <span className="u83-icon">📖</span>
                        <span>§8.3 Uitleg — Oefenvragen</span>
                    </div>
                    <div className="u83-topbar-progress">
                        {quizIdx + 1} / {QUIZ_QUESTIONS.length}
                    </div>
                </header>

                {/* Progress bar */}
                <div className="u83-quiz-progress">
                    <div
                        className="u83-quiz-progress-fill"
                        style={{ width: `${((quizIdx + (quizFeedback ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                </div>

                <div className="u83-quiz">
                    <div className="u83-quiz-card">
                        <div className="u83-quiz-equation">{q.equation}</div>
                        <div className="u83-quiz-prompt">{q.prompt}</div>

                        <div className="u83-quiz-options">
                            {(() => {
                                const shuffled = shuffleMCOptions(q.options, q.correctIndex, `quiz-${quizIdx}`);
                                return shuffled.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        className={`u83-quiz-option ${
                                            quizFeedback
                                                ? i === shuffled.correctIndex
                                                    ? 'u83-quiz-option--correct'
                                                    : selectedOption === i
                                                        ? 'u83-quiz-option--wrong'
                                                        : 'u83-quiz-option--dimmed'
                                                : selectedOption === i
                                                    ? 'u83-quiz-option--selected'
                                                    : ''
                                        }`}
                                        onClick={() => handleQuizAnswer(i)}
                                        disabled={!!quizFeedback}
                                    >
                                        {opt}
                                    </button>
                                ));
                            })()}
                        </div>

                        {quizFeedback && (
                            <div className={`u83-quiz-feedback ${quizFeedback === 'correct' ? 'u83-quiz-feedback--correct' : 'u83-quiz-feedback--wrong'}`}>
                                <div className="u83-quiz-feedback-icon">
                                    {quizFeedback === 'correct' ? '✅' : '❌'}
                                </div>
                                <div className="u83-quiz-feedback-text">
                                    {quizFeedback === 'correct' ? 'Goed!' : 'Niet helemaal.'}
                                    <div className="u83-quiz-explanation">{q.explanation}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════
       EXERCISES OVERVIEW — book exercises for §8.3
       ═══════════════════════════════════════════════════════ */
    if (phase === 'exercises') {
        return (
            <div className="u83-page">
                <header className="u83-topbar">
                    <div className="u83-topbar-title">
                        <span className="u83-icon">📖</span>
                        <span>§8.3 Uitleg — Opdrachten</span>
                    </div>
                </header>

                <div className="u83-exercises">
                    <div className="u83-quiz-result">
                        <div className="u83-quiz-result-icon">{quizCorrect >= 3 ? '🎉' : '💪'}</div>
                        <div className="u83-quiz-result-text">
                            {quizCorrect}/{QUIZ_QUESTIONS.length} oefenvragen goed!
                        </div>
                    </div>

                    <h2>Opdrachten uit het boek</h2>
                    <p className="u83-exercises-sub">
                        Dit zijn de opdrachten bij §8.3. Je gaat straks met Termtris deze vaardigheden oefenen!
                    </p>

                    <div className="u83-exercise-list">
                        {BOOK_EXERCISES.map((ex) => (
                            <div key={ex.id} className="u83-exercise-item">
                                <div className="u83-exercise-id">
                                    <span className="u83-exercise-num">{ex.id}</span>
                                    <span className="u83-exercise-page">{ex.page}</span>
                                </div>
                                <div className="u83-exercise-desc">{ex.desc}</div>
                            </div>
                        ))}
                    </div>

                    <h3>Leerroutes</h3>
                    <div className="u83-routes">
                        {ROUTE_INFO.map((r) => (
                            <div key={r.label} className="u83-route-card">
                                <span className="u83-route-emoji">{r.emoji}</span>
                                <div>
                                    <div className="u83-route-label">{r.label}</div>
                                    <div className="u83-route-exercises">{r.exercises}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="u83-leerdoel-check">
                        <div className="u83-leerdoel-icon">🎯</div>
                        <div>
                            <div className="u83-leerdoel-title">Leerdoelencheck</div>
                            <div className="u83-leerdoel-eq">3a + 4 = a + 14</div>
                            <div className="u83-leerdoel-desc">
                                Na de opdrachten los je deze vergelijking op met de balans.
                                Verwacht antwoord: a = 5
                            </div>
                        </div>
                    </div>

                    <button
                        className="u83-btn u83-btn--primary u83-btn--lg"
                        onClick={handleComplete}
                    >
                        Start de opdrachten 📝 →
                    </button>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════
       DONE SCREEN
       ═══════════════════════════════════════════════════════ */
    return (
        <div className="u83-page">
            <header className="u83-topbar">
                <div className="u83-topbar-title">
                    <span className="u83-icon">📖</span>
                    <span>§8.3 Uitleg — Klaar!</span>
                </div>
            </header>

            <div className="u83-done">
                <div className="u83-done-icon">🎉</div>
                <h2>§8.3 Uitleg voltooid!</h2>
                <p>Je weet nu hoe je vergelijkingen met letters aan beide kanten oplost met de balans.</p>
                <p className="u83-done-summary">
                    Oefenvragen: {quizCorrect}/{QUIZ_QUESTIONS.length} goed
                </p>

                <div className="u83-done-actions">
                    <button
                        className="u83-btn u83-btn--primary u83-btn--lg"
                        onClick={() => navigate('/practice/8_3')}
                    >
                        📝 Start opdrachten §8.3 →
                    </button>
                    <button
                        className="u83-btn u83-btn--ghost"
                        onClick={() => navigate('/')}
                    >
                        ← Terug naar leerpad
                    </button>
                </div>
            </div>
        </div>
    );
}
