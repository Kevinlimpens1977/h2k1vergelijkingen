/**
 * BalanceIntroPage — §8.3 Intro "Balansen Oefenen"
 *
 * Phase orchestrator:
 *   welcome → example1 → example2 → example3 → practice → done
 *
 * Learning phases:
 *   1. Guided Example 1 (x + 3 = 7)  — buttons only
 *   2. Guided Example 2 (2x + 5 = 13) — buttons + typed result
 *   3. Guided Example 3 (3x − 4 = 11) — buttons + typed result (light hints)
 *   4. Practice Mode — free text, 5 consecutive correct to finish
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDevMode } from '../../context/DevModeContext';
import { markBalanceIntro8_3Passed } from '../../services/chapter8Flow';

import BalanceScale from './components/BalanceScale';
import EquationColumn from './components/EquationColumn';
import type { EquationStep } from './components/EquationColumn';

import { eqToString, applyOperation } from './engine/equationEngine';
import type { Equation, OperationType } from './engine/equationEngine';
import { computeTiltAngle } from './engine/balancePhysics';
import { generatePractice } from './engine/practiceGenerator';
import type { PracticeEquation } from './engine/practiceGenerator';
import { GUIDED_EXAMPLES } from './data/guidedExamples';
import type { GuidedExample } from './data/guidedExamples';
import { validateAnswer } from './engine/answerValidator';
import { classifyFeedback } from './engine/feedbackClassifier';
import type { ClassifiedFeedback } from './engine/feedbackClassifier';

import './BalanceIntro.css';
import { shuffleOperations } from '../../utils/shuffleMC';
import OperationPicker from './components/OperationPicker';

type Phase = 'welcome' | 'example1' | 'example2' | 'example3' | 'practice' | 'done';

interface PracticeState {
    problem: PracticeEquation;
    currentStepIdx: number;
    currentEquation: Equation;
}

const PRACTICE_TARGET = 5; // consecutive correct to finish
const MAX_WRONG_BEFORE_HINT = 4; // show hint + skip after this many wrong

export default function BalanceIntroPage() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();

    // ── Phase management ──
    const [phase, setPhase] = useState<Phase>('welcome');
    const [currentExample, setCurrentExample] = useState<GuidedExample | null>(null);
    const [exampleStepIdx, setExampleStepIdx] = useState(0);
    const [exampleSubStep, setExampleSubStep] = useState<'choose-op' | 'type-result' | 'narration'>('choose-op');

    // ── Equation state ──
    const [equation, setEquation] = useState<Equation>(GUIDED_EXAMPLES[0].equation);
    const [solutionValue, setSolutionValue] = useState(GUIDED_EXAMPLES[0].solution);
    const [eqSteps, setEqSteps] = useState<EquationStep[]>([]);
    const [pendingEquation, setPendingEquation] = useState<Equation | null>(null);

    // ── Balance visual ──
    const [tiltAngle, setTiltAngle] = useState(0);
    const [wobble, setWobble] = useState(false);

    // ── Interaction ──
    const [selectedOp, setSelectedOp] = useState<number | null>(null);
    const [typedInput, setTypedInput] = useState('');
    const [feedback, setFeedback] = useState<ClassifiedFeedback | null>(null);
    const [showHint, setShowHint] = useState(false);

    // ── Practice tracking ──
    const [practiceState, setPracticeState] = useState<PracticeState | null>(null);
    const [practiceConsecutive, setPracticeConsecutive] = useState(0);
    const [practiceTotal, setPracticeTotal] = useState(0);
    const [saving, setSaving] = useState(false);
    const [stepWrongCount, setStepWrongCount] = useState(0);
    const [hintRevealed, setHintRevealed] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // ── Progress calculation ──
    const phaseProgress: Record<Phase, number> = {
        welcome: 0, example1: 0.15, example2: 0.35, example3: 0.55,
        practice: 0.7, done: 1,
    };

    // ═══════════════════════════════════════════════════
    // PHASE TRANSITIONS
    // ═══════════════════════════════════════════════════

    const startExample = useCallback((exId: 'example1' | 'example2' | 'example3') => {
        const ex = GUIDED_EXAMPLES.find(e => e.id === exId)!;
        setCurrentExample(ex);
        setPhase(exId);
        setEquation(ex.equation);
        setSolutionValue(ex.solution);
        setExampleStepIdx(0);
        setExampleSubStep('choose-op');
        setEqSteps([{ equation: eqToString(ex.equation) }]);
        setTiltAngle(0);
        setSelectedOp(null);
        setTypedInput('');
        setFeedback(null);
        setShowHint(false);
    }, []);

    const startPractice = useCallback(() => {
        setPhase('practice');
        setPracticeConsecutive(0);
        setPracticeTotal(0);
        loadNewPractice();
    }, []);

    const loadNewPractice = useCallback(() => {
        const level = practiceTotal < 2 ? 1 : practiceTotal < 4 ? 2 : 3;
        const problem = generatePractice(level as 1 | 2 | 3);
        setPracticeState({
            problem,
            currentStepIdx: 0,
            currentEquation: problem.equation,
        });
        setEquation(problem.equation);
        setSolutionValue(problem.solution);
        setEqSteps([{ equation: eqToString(problem.equation) }]);
        setTiltAngle(0);
        setSelectedOp(null);
        setTypedInput('');
        setFeedback(null);
        setShowHint(false);
        setStepWrongCount(0);
        setHintRevealed(false);
        setWobble(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [practiceTotal]);

    const finishModule = useCallback(async () => {
        setPhase('done');
        if (profile) {
            setSaving(true);
            try {
                await markBalanceIntro8_3Passed(profile.uid);
            } catch (e) {
                console.warn('Could not mark balance intro passed:', e);
            } finally {
                setSaving(false);
            }
        }
    }, [profile]);

    // ═══════════════════════════════════════════════════
    // GUIDED EXAMPLE HANDLERS
    // ═══════════════════════════════════════════════════

    const handleOperationSelect = useCallback((opIdx: number) => {
        if (!currentExample || selectedOp !== null) return;
        const step = currentExample.steps[exampleStepIdx];
        const rawOps = [step.correctOperation, ...step.wrongOptions];
        const { items: allOps, correctIdx } = shuffleOperations(rawOps, 0, `${currentExample.id}-${exampleStepIdx}`);
        const chosen = allOps[opIdx];
        const isCorrect = opIdx === correctIdx;

        setSelectedOp(opIdx);

        if (isCorrect) {
            const newEq = applyOperation(equation, step.correctOperation);
            setTiltAngle(0); // balanced

            // Add operation to equation column
            const opStr = `${chosen.type === 'add' ? '+' : chosen.type === 'subtract' ? '−' : chosen.type === 'multiply' ? '×' : '÷'}${chosen.value}        ${chosen.type === 'add' ? '+' : chosen.type === 'subtract' ? '−' : chosen.type === 'multiply' ? '×' : '÷'}${chosen.value}`;

            if (step.requireTypedResult) {
                // DON'T update the balance yet — store pending equation
                // Balance will update after student types the correct result
                setPendingEquation(newEq);
                // Only show the operation line, NOT the result — student must type it
                setEqSteps(prev => [
                    ...prev.map((s, i) => i === prev.length - 1 ? { ...s, operation: opStr } : s),
                ]);
                setExampleSubStep('type-result');
                // Clear the "Goed!" feedback — input area has its own clear label
                setFeedback(null);
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                // Update the balance immediately for non-typed steps
                setEquation(newEq);
                // Show both operation + result immediately
                setEqSteps(prev => [
                    ...prev.map((s, i) => i === prev.length - 1 ? { ...s, operation: opStr } : s),
                    { equation: eqToString(newEq) },
                ]);
                if (step.narration) {
                    setExampleSubStep('narration');
                    setFeedback({ type: 'correct', message: 'Goed! 🎉', showExpected: false });
                } else {
                    setFeedback({ type: 'correct', message: 'Goed! 🎉', showExpected: false });
                }
            }
        } else {
            // Wrong — tilt + wobble
            const wrongEq = applyOperation(equation, chosen);
            const angle = computeTiltAngle(wrongEq, solutionValue);
            setTiltAngle(angle);
            setWobble(true);
            setTimeout(() => setWobble(false), 800);
            setFeedback({ type: 'wrong_value', message: 'De balans slaat door! Dat is niet de juiste bewerking.', showExpected: false });

            // Reset after delay
            setTimeout(() => {
                setSelectedOp(null);
                setTiltAngle(0);
                setFeedback(null);
            }, 2000);
        }
    }, [currentExample, exampleStepIdx, selectedOp, equation, solutionValue]);

    const handleTypedResultCheck = useCallback(() => {
        if (!currentExample || !typedInput.trim()) return;
        const step = currentExample.steps[exampleStepIdx];

        const result = validateAnswer(typedInput, {
            mode: 'semi-open',
            currentEquation: equation,
            expectedResult: step.resultEquation,
            expectedAnswer: eqToString(step.resultEquation),
            solutionValue: currentExample.solution,
            variable: currentExample.equation.variable,
        });

        const fb = classifyFeedback(result, eqToString(step.resultEquation));

        if (result.isCorrect) {
            // NOW update the balance to show the result
            if (pendingEquation) {
                setEquation(pendingEquation);
                setPendingEquation(null);
            }
            // NOW add the result equation to the column (was hidden until student typed it)
            setEqSteps(prev => [
                ...prev,
                { equation: eqToString(step.resultEquation) },
            ]);
            setFeedback(fb);
            if (step.narration) {
                setExampleSubStep('narration');
            }
        } else {
            setFeedback({ type: 'wrong_value', message: 'Dat klopt niet helemaal. Probeer opnieuw!', showExpected: false });
            setTimeout(() => {
                setFeedback(null);
                setTypedInput('');
                inputRef.current?.focus();
            }, 1500);
        }
    }, [currentExample, exampleStepIdx, typedInput, equation, pendingEquation]);

    const handleExampleNext = useCallback(() => {
        if (!currentExample) return;
        const nextStep = exampleStepIdx + 1;

        if (nextStep < currentExample.steps.length) {
            // More steps in this example
            setExampleStepIdx(nextStep);
            setExampleSubStep('choose-op');
            setSelectedOp(null);
            setTypedInput('');
            setFeedback(null);
            setShowHint(false);
        } else {
            // Move to next example or practice
            if (currentExample.id === 'example1') startExample('example2');
            else if (currentExample.id === 'example2') startExample('example3');
            else startPractice();
        }
    }, [currentExample, exampleStepIdx, startExample, startPractice]);

    // ═══════════════════════════════════════════════════
    // PRACTICE MODE HANDLERS
    // ═══════════════════════════════════════════════════

    const handlePracticeSubmit = useCallback((opType: OperationType, opValue: number) => {
        if (!practiceState) return;
        const { problem, currentStepIdx, currentEquation: curEq } = practiceState;
        const step = problem.steps[currentStepIdx];

        // Direct comparison: does the chosen operation match the expected step?
        const isCorrect = opType === step.operation.type && opValue === step.operation.value;

        if (isCorrect) {
            setFeedback({ type: 'correct', message: 'Goed! 🎉', showExpected: false });

            // Normal step progression
            const opSymbol = opType === 'add' ? '+' : opType === 'subtract' ? '−' : opType === 'multiply' ? '×' : '÷';
            const opStr = `${opSymbol}${opValue}        ${opSymbol}${opValue}`;

            setEqSteps(prev => [
                ...prev.map((s, i) => i === prev.length - 1 ? { ...s, operation: opStr } : s),
                { equation: eqToString(step.result) },
            ]);
            setEquation(step.result);
            setTiltAngle(0);

            const nextStepIdx = currentStepIdx + 1;
            if (nextStepIdx < problem.steps.length) {
                // More steps in this problem
                setPracticeState(prev => prev ? {
                    ...prev,
                    currentStepIdx: nextStepIdx,
                    currentEquation: step.result,
                } : null);
                setTypedInput('');
                setStepWrongCount(0);
                setHintRevealed(false);
            } else {
                // Problem complete
                const newConsecutive = practiceConsecutive + 1;
                setPracticeConsecutive(newConsecutive);
                setPracticeTotal(t => t + 1);

                if (newConsecutive >= PRACTICE_TARGET) {
                    setTimeout(() => finishModule(), 1200);
                }
            }
        } else {
            const newWrongCount = stepWrongCount + 1;
            setStepWrongCount(newWrongCount);

            if (newWrongCount >= MAX_WRONG_BEFORE_HINT) {
                // Reveal the answer as hint — student can skip this step
                const correctSymbol = step.operation.type === 'add' ? '+' : step.operation.type === 'subtract' ? '−' : step.operation.type === 'multiply' ? '×' : '÷';
                const hintMsg = `Het antwoord is: ${correctSymbol}${step.operation.value} aan beide kanten → ${eqToString(step.result)}`;
                setFeedback({ type: 'wrong_value', message: hintMsg, showExpected: false });
                setHintRevealed(true);
            } else {
                // Show wrong feedback
                const wrongSymbol = opType === 'add' ? '+' : opType === 'subtract' ? '−' : opType === 'multiply' ? '×' : '÷';
                const wrongEq = applyOperation(curEq, { type: opType, value: opValue, label: '' });
                setFeedback({ type: 'wrong_value', message: `${wrongSymbol}${opValue}? Dat klopt niet. De balans slaat door!`, showExpected: false });

                // Show the tilt for wrong answer
                setTiltAngle(computeTiltAngle(wrongEq, problem.solution) || 8);
                setWobble(true);
                setTimeout(() => setWobble(false), 800);

                // Reset feedback after delay
                setTimeout(() => {
                    setFeedback(null);
                    setTiltAngle(0);
                }, 2000);
            }

            // Reset consecutive
            setPracticeConsecutive(0);
        }
    }, [practiceState, practiceConsecutive, stepWrongCount, finishModule]);

    const handlePracticeNext = useCallback(() => {
        loadNewPractice();
    }, [loadNewPractice]);

    /** Skip to next step after hint is revealed (4 wrong answers) */
    const handleHintSkip = useCallback(() => {
        if (!practiceState) return;
        const { problem, currentStepIdx } = practiceState;
        const step = problem.steps[currentStepIdx];

        // Apply the step to the equation
        const opSymbol = step.operation.type === 'add' ? '+' : step.operation.type === 'subtract' ? '−' : step.operation.type === 'multiply' ? '×' : '÷';
        const opStr = `${opSymbol}${step.operation.value}        ${opSymbol}${step.operation.value}`;

        setEqSteps(prev => [
            ...prev.map((s, i) => i === prev.length - 1 ? { ...s, operation: opStr } : s),
            { equation: eqToString(step.result) },
        ]);
        setEquation(step.result);
        setTiltAngle(0);
        setStepWrongCount(0);
        setHintRevealed(false);
        setTypedInput('');

        const nextStepIdx = currentStepIdx + 1;
        if (nextStepIdx < problem.steps.length) {
            setPracticeState(prev => prev ? {
                ...prev,
                currentStepIdx: nextStepIdx,
                currentEquation: step.result,
            } : null);
            setFeedback(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Problem complete (via hint skip — does NOT count as consecutive)
            setFeedback({ type: 'correct', message: 'Opgave klaar. We gaan verder!', showExpected: false });
            setPracticeTotal(t => t + 1);
            // Don't increment consecutive — they needed hints
        }
    }, [practiceState]);

    // ═══════════════════════════════════════════════════
    // KEY HANDLER
    // ═══════════════════════════════════════════════════
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (exampleSubStep === 'type-result') {
                handleTypedResultCheck();
            }
        }
    }, [exampleSubStep, handleTypedResultCheck]);

    // Load practice on transition
    useEffect(() => {
        if (phase === 'practice' && !practiceState) {
            loadNewPractice();
        }
    }, [phase, practiceState, loadNewPractice]);

    // ═══════════════════════════════════════════════════
    // RENDER: WELCOME
    // ═══════════════════════════════════════════════════
    if (phase === 'welcome') {
        return (
            <div className="bi-page">
                <header className="bi-header">
                    <div className="bi-header-title">
                        <span className="bi-header-title-icon">⚖️</span>
                        <span>Balansen Oefenen</span>
                    </div>
                    <div className="bi-header-right">
                        <button className="bi-btn-stop" onClick={() => navigate('/')}>✕ Stop</button>
                    </div>
                </header>
                <div className="bi-progress"><div className="bi-progress-fill" style={{ width: '0%' }} /></div>

                <div className="bi-main">
                    <div className="bi-card bi-card--intro">
                        <div className="bi-card-emoji">⚖️</div>
                        <h2 className="bi-card-title">De Balansmethode</h2>
                        <p className="bi-card-text">
                            Een vergelijking is als een weegschaal in evenwicht.{'\n\n'}
                            Wat je aan de ene kant doet, moet je ook aan de andere kant doen!{'\n\n'}
                            We gaan stap voor stap leren hoe je vergelijkingen oplost.
                        </p>
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--primary" onClick={() => startExample('example1')} style={{ fontSize: '1.05rem', padding: '0.75rem 2rem' }}>
                                🚀 Start met Voorbeeld 1
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════
    // RENDER: DONE
    // ═══════════════════════════════════════════════════
    if (phase === 'done') {
        return (
            <div className="bi-page">
                <header className="bi-header">
                    <div className="bi-header-title">
                        <span className="bi-header-title-icon">⚖️</span>
                        <span>Balansen Oefenen — Klaar!</span>
                    </div>
                </header>
                <div className="bi-progress"><div className="bi-progress-fill" style={{ width: '100%' }} /></div>

                <div className="bi-main">
                    <div className="bi-card bi-card--done">
                        <div className="bi-card-emoji">🎉</div>
                        <h2 className="bi-card-title" style={{ color: 'var(--bi-correct)' }}>
                            Geweldig gedaan!
                        </h2>
                        <p className="bi-card-text">
                            Je kunt nu vergelijkingen oplossen met de balansmethode!{'\n'}
                            Je hebt {practiceTotal} oefeningen gemaakt.
                        </p>
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--secondary" onClick={() => navigate('/')}>
                                ← Leerpad
                            </button>
                            <button
                                className="bi-btn bi-btn--success"
                                onClick={() => navigate('/8-3/uitleg')}
                                disabled={saving}
                            >
                                📖 Door naar §8.3 →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════
    // RENDER: GUIDED EXAMPLES
    // ═══════════════════════════════════════════════════
    if (phase === 'example1' || phase === 'example2' || phase === 'example3') {
        const ex = currentExample!;
        const step = ex.steps[exampleStepIdx];
        const allOps = (() => {
            const rawOps = [step.correctOperation, ...step.wrongOptions];
            return shuffleOperations(rawOps, 0, `${ex.id}-${exampleStepIdx}`).items;
        })();

        // Intro screen
        if (eqSteps.length === 1 && exampleStepIdx === 0 && exampleSubStep === 'choose-op' && !feedback) {
            return (
                <div className="bi-page">
                    <header className="bi-header">
                        <div className="bi-header-title">
                            <span className="bi-header-title-icon">⚖️</span>
                            <span>{ex.title}</span>
                        </div>
                        <div className="bi-header-right">
                            <span className="bi-phase-badge">{ex.title}</span>
                            <button className="bi-btn-stop" onClick={() => navigate('/')}>✕ Stop</button>
                        </div>
                    </header>
                    <div className="bi-progress">
                        <div className="bi-progress-fill" style={{ width: `${phaseProgress[phase] * 100}%` }} />
                    </div>

                    <div className="bi-main">
                        <BalanceScale
                            leftExpr={equation.left}
                            rightExpr={equation.right}
                            variable={equation.variable}
                            tiltAngle={0}
                        />

                        <EquationColumn steps={eqSteps} currentStepIndex={0} />

                        <div className="bi-narration">{ex.introText}</div>

                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--primary" onClick={() => setFeedback({ type: 'correct', message: '', showExpected: false })}>
                                Begrepen — Ga verder →
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bi-page">
                <header className="bi-header">
                    <div className="bi-header-title">
                        <span className="bi-header-title-icon">⚖️</span>
                        <span>{ex.title}</span>
                    </div>
                    <div className="bi-header-right">
                        <span className="bi-phase-badge">
                            Stap {exampleStepIdx + 1}/{ex.steps.length}
                        </span>
                        {devMode && <span className="bi-hint-badge">DEV</span>}
                        <button className="bi-btn-stop" onClick={() => navigate('/')}>✕ Stop</button>
                    </div>
                </header>
                <div className="bi-progress">
                    <div className="bi-progress-fill" style={{ width: `${phaseProgress[phase] * 100}%` }} />
                </div>

                <div className="bi-main">
                    {/* Balance Scale */}
                    <BalanceScale
                        leftExpr={equation.left}
                        rightExpr={equation.right}
                        variable={equation.variable}
                        tiltAngle={tiltAngle}
                        wobble={wobble}
                    />

                    {/* Equation Steps Column */}
                    <EquationColumn steps={eqSteps} currentStepIndex={eqSteps.length - 1} />

                    {/* Operation Selection (buttons) */}
                    {exampleSubStep === 'choose-op' && (
                        <div className="bi-ops">
                            <div className="bi-ops-prompt">{step.prompt}</div>
                            <div className="bi-ops-grid">
                                {allOps.map((op, i) => (
                                    <button
                                        key={i}
                                        className={`bi-op-btn ${
                                            selectedOp === i
                                                ? feedback?.type === 'correct' || feedback?.type === 'correct_alt_path'
                                                    ? 'bi-op-btn--correct'
                                                    : feedback?.type === 'wrong_value' || feedback?.type === 'wrong_step'
                                                        ? 'bi-op-btn--wrong'
                                                        : 'bi-op-btn--selected'
                                                : ''
                                        }`}
                                        onClick={() => handleOperationSelect(i)}
                                        disabled={selectedOp !== null}
                                    >
                                        {op.label}
                                    </button>
                                ))}
                            </div>

                            {/* Hint button */}
                            {step.hintText && !showHint && selectedOp === null && (
                                <div className="bi-actions">
                                    <button className="bi-btn bi-btn--hint" onClick={() => setShowHint(true)}>
                                        💡 Hint
                                    </button>
                                </div>
                            )}
                            {showHint && step.hintText && (
                                <div className="bi-feedback bi-feedback--hint">{step.hintText}</div>
                            )}
                        </div>
                    )}

                    {/* Type result (semi-open) */}
                    {exampleSubStep === 'type-result' && (
                        <div className="bi-input-group">
                            <label className="bi-input-label">Wat wordt de vergelijking nu?</label>
                            <input
                                ref={inputRef}
                                className={`bi-input ${feedback?.type === 'correct' || feedback?.type === 'correct_alt_path' ? 'bi-input--correct' : ''}`}
                                value={typedInput}
                                onChange={e => setTypedInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`bijv. … = …`}
                                disabled={feedback?.type === 'correct' || feedback?.type === 'correct_alt_path'}
                                autoComplete="off"
                            />
                            {(!feedback || feedback.type === 'wrong_value' || feedback.type === 'wrong_step') && (
                                <div className="bi-actions" style={{ marginTop: '0.5rem' }}>
                                    <button className="bi-btn bi-btn--primary" onClick={handleTypedResultCheck} disabled={!typedInput.trim()}>
                                        Controleer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Narration */}
                    {exampleSubStep === 'narration' && step.narration && (
                        <div className="bi-narration">{step.narration}</div>
                    )}

                    {/* Feedback */}
                    {feedback && feedback.message && (
                        <div className={`bi-feedback bi-feedback--${feedback.type === 'correct' || feedback.type === 'correct_alt_path' ? 'correct' : 'wrong'}`}>
                            {feedback.message}
                            {feedback.showExpected && feedback.expectedDisplay && (
                                <div className="bi-feedback-sub">{feedback.expectedDisplay}</div>
                            )}
                        </div>
                    )}

                    {/* Next button (after correct) */}
                    {feedback && (feedback.type === 'correct' || feedback.type === 'correct_alt_path') && exampleSubStep !== 'type-result' && (
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--primary" onClick={handleExampleNext}>
                                {exampleStepIdx + 1 >= ex.steps.length
                                    ? (ex.id === 'example3' ? '🏋️ Start Oefenen' : 'Volgend voorbeeld →')
                                    : 'Volgende stap →'
                                }
                            </button>
                        </div>
                    )}
                    {feedback && (feedback.type === 'correct' || feedback.type === 'correct_alt_path') && exampleSubStep === 'type-result' && (
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--primary" onClick={handleExampleNext}>
                                {exampleStepIdx + 1 >= ex.steps.length
                                    ? (ex.id === 'example3' ? '🏋️ Start Oefenen' : 'Volgend voorbeeld →')
                                    : 'Volgende stap →'
                                }
                            </button>
                        </div>
                    )}

                    {/* Dev skip */}
                    {devMode && (
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--secondary" onClick={handleExampleNext} style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                ⏭ Skip (dev)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════
    // RENDER: PRACTICE MODE
    // ═══════════════════════════════════════════════════
    if (phase === 'practice') {
        const problem = practiceState?.problem;
        const step = problem?.steps[practiceState?.currentStepIdx ?? 0];
        const isComplete = feedback?.type === 'correct' || feedback?.type === 'correct_alt_path';
        const isLastStep = practiceState ? practiceState.currentStepIdx >= (problem?.steps.length ?? 1) - 1 : false;

        return (
            <div className="bi-page">
                <header className="bi-header">
                    <div className="bi-header-title">
                        <span className="bi-header-title-icon">⚖️</span>
                        <span>Oefenmodus</span>
                    </div>
                    <div className="bi-header-right">
                        <div className="bi-practice-counter">
                            <div className="bi-practice-dots">
                                {Array.from({ length: PRACTICE_TARGET }).map((_, i) => (
                                    <div key={i} className={`bi-practice-dot ${i < practiceConsecutive ? 'bi-practice-dot--filled' : ''}`} />
                                ))}
                            </div>
                            <span>{practiceConsecutive}/{PRACTICE_TARGET}</span>
                        </div>
                        <button className="bi-btn-stop" onClick={() => navigate('/')}>✕ Stop</button>
                    </div>
                </header>
                <div className="bi-progress">
                    <div className="bi-progress-fill" style={{ width: `${(phaseProgress.practice + (practiceConsecutive / PRACTICE_TARGET) * 0.3) * 100}%` }} />
                </div>

                <div className="bi-main">
                    <BalanceScale
                        leftExpr={equation.left}
                        rightExpr={equation.right}
                        variable={equation.variable}
                        tiltAngle={tiltAngle}
                        wobble={wobble}
                    />

                    <EquationColumn steps={eqSteps} currentStepIndex={eqSteps.length - 1} />

                    {/* Operation Picker */}
                    {!isComplete && !hintRevealed && step && (
                        <OperationPicker
                            onSubmit={handlePracticeSubmit}
                            disabled={!!feedback}
                            stepLabel={
                                practiceState?.currentStepIdx === 0
                                    ? 'Wat is stap 1?'
                                    : `Wat is stap ${(practiceState?.currentStepIdx ?? 0) + 1}?`
                            }
                            wrongCount={stepWrongCount}
                            maxWrong={MAX_WRONG_BEFORE_HINT}
                        />
                    )}

                    {/* Feedback */}
                    {feedback && feedback.message && (
                        <div className={`bi-feedback bi-feedback--${feedback.type === 'correct' || feedback.type === 'correct_alt_path' ? 'correct' : hintRevealed ? 'hint' : 'wrong'}`}>
                            {feedback.message}
                        </div>
                    )}

                    {/* Skip button after hint revealed (4 wrong) */}
                    {hintRevealed && (
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--primary" onClick={handleHintSkip}>
                                Begrepen — Ga verder →
                            </button>
                        </div>
                    )}

                    {/* Next problem / continue */}
                    {isComplete && isLastStep && practiceConsecutive < PRACTICE_TARGET && (
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--primary" onClick={handlePracticeNext}>
                                Volgende opgave →
                            </button>
                        </div>
                    )}

                    {/* Dev skip */}
                    {devMode && (
                        <div className="bi-actions">
                            <button className="bi-btn bi-btn--secondary" onClick={finishModule} style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                ⏭ Finish (dev)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
