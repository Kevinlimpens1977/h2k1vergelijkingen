/**
 * 🍎🍌🥥 FRUIT CHALLENGE — Award-winning 3-round math puzzle game
 *
 * Round 1 "De Opwarmer": 🍎🍌🥥 — 3 hints (each = 1 rotten apple 🍏)
 * Round 2 "De Uitdaging": 🍓🍊🍇 — 1 hint (confirmation required, costs 1 🍏)
 * Round 3 "Alles of Niets": 🍉🫐🥝 — NO hints, 1 attempt only
 *
 * Firestore: challenges/fruit_challenge_v2
 * Podium: 🏆 Perfect / ⭐ With rotten apples / 🎯 Challengers
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    doc,
    setDoc,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../hooks/useAuth';

/* ── types ───────────────────────────────────────────── */

interface Props {
    profile: UserProfile;
    onComplete?: (perfect: boolean) => void;
}

type GamePhase = 'intro' | 'round1' | 'transition' | 'round2' | 'round3' | 'results';

interface RoundResult {
    solved: boolean;
    hintsUsed: number;
    attempts: number;
}

interface SolverData {
    firstName: string;
    round1: boolean;
    round2: boolean;
    round3: boolean;
    rottenApples: number;
    allSolved: boolean;
    perfect: boolean;
    solvedAt: unknown;
}

/* ── puzzle data ─────────────────────────────────────── */

interface Equation {
    items: { emoji: string; count: number }[];
    operator: string;
    result: string;
    isMystery?: boolean;
}

interface Puzzle {
    title: string;
    subtitle: string;
    emoji: string;
    gradient: string;
    equations: Equation[];
    answer: string;
    acceptedAnswers: string[];
    hints: string[];
    fruitPrices: { emoji: string; price: string }[];
}

const PUZZLES: Puzzle[] = [
    {
        title: 'De Opwarmer',
        subtitle: 'Bereken de geheime prijs!',
        emoji: '🍎🍌🥥',
        gradient: 'linear-gradient(135deg, #ff6b6b, #ffa502)',
        equations: [
            { items: [{ emoji: '🍎', count: 1 }, { emoji: '🍎', count: 1 }, { emoji: '🍎', count: 1 }], operator: '+', result: '€ 1,20' },
            { items: [{ emoji: '🍎', count: 1 }, { emoji: '🍌', count: 1 }, { emoji: '🍌', count: 1 }], operator: '+', result: '€ 4,80' },
            { items: [{ emoji: '🍌', count: 1 }, { emoji: '🥥', count: 1 }], operator: '−', result: '€ 0,20' },
            { items: [{ emoji: '🥥', count: 1 }, { emoji: '🍎', count: 1 }, { emoji: '🍌', count: 1 }], operator: '+', result: '€ ???', isMystery: true },
        ],
        answer: '4,60',
        acceptedAnswers: ['4,60', '4.60', '€4,60', '€4.60', '€ 4,60', '€ 4.60', '4,6', '4.6'],
        hints: [
            '🍎 Drie appels = €1,20. Hoeveel kost één appel?',
            '🍌 Je weet: 🍎=€0,40. Vergelijking 2: 🍎+🍌+🍌=€4,80 → 0,40+2🍌=4,80 → 🍌=€2,20',
            '🥥 Vergelijking 3: 🍌−🥥=€0,20 → 2,20−🥥=0,20 → 🥥=€2,00. Nu invullen!',
        ],
        fruitPrices: [{ emoji: '🍎', price: '€0,40' }, { emoji: '🍌', price: '€2,20' }, { emoji: '🥥', price: '€2,00' }],
    },
    {
        title: 'De Uitdaging',
        subtitle: 'Kun je het nóg een keer?',
        emoji: '🍓🍊🍇',
        gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
        equations: [
            { items: [{ emoji: '🍓', count: 1 }, { emoji: '🍓', count: 1 }, { emoji: '🍓', count: 1 }, { emoji: '🍓', count: 1 }], operator: '+', result: '€ 2,40' },
            { items: [{ emoji: '🍓', count: 1 }, { emoji: '🍊', count: 1 }, { emoji: '🍊', count: 1 }], operator: '+', result: '€ 2,20' },
            { items: [{ emoji: '🍊', count: 1 }, { emoji: '🍇', count: 1 }], operator: '−', result: '€ 0,30' },
            { items: [{ emoji: '🍓', count: 1 }, { emoji: '🍇', count: 1 }, { emoji: '🍇', count: 1 }], operator: '+', result: '€ ???', isMystery: true },
        ],
        answer: '1,60',
        acceptedAnswers: ['1,60', '1.60', '€1,60', '€1.60', '€ 1,60', '€ 1.60', '1,6', '1.6'],
        hints: [
            '🍓 Vier aardbeien = €2,40. Deel door 4. Dan: 🍓=€0,60. Vul in bij vergelijking 2 om 🍊 te vinden. Gebruik dan vergelijking 3 voor 🍇.',
        ],
        fruitPrices: [{ emoji: '🍓', price: '€0,60' }, { emoji: '🍊', price: '€0,80' }, { emoji: '🍇', price: '€0,50' }],
    },
    {
        title: 'Alles of Niets',
        subtitle: 'Eén kans. Geen hulp.',
        emoji: '🍉🫐🥝',
        gradient: 'linear-gradient(135deg, #e17055, #d63031)',
        equations: [
            { items: [{ emoji: '🍉', count: 1 }, { emoji: '🍉', count: 1 }], operator: '+', result: '€ 3,00' },
            { items: [{ emoji: '🥝', count: 1 }, { emoji: '🥝', count: 1 }, { emoji: '🥝', count: 1 }], operator: '+', result: '€ 2,10' },
            { items: [{ emoji: '🍉', count: 1 }, { emoji: '🫐', count: 1 }, { emoji: '🥝', count: 1 }], operator: '+', result: '€ 3,00' },
            { items: [{ emoji: '🫐', count: 1 }, { emoji: '🫐', count: 1 }, { emoji: '🍉', count: 1 }], operator: '+', result: '€ ???', isMystery: true },
        ],
        answer: '3,10',
        acceptedAnswers: ['3,10', '3.10', '€3,10', '€3.10', '€ 3,10', '€ 3.10', '3,1', '3.1'],
        hints: [],
        fruitPrices: [{ emoji: '🍉', price: '€1,50' }, { emoji: '🫐', price: '€0,80' }, { emoji: '🥝', price: '€0,70' }],
    },
];

const CHALLENGE_ID = 'fruit_challenge_v2';

/* ── component ───────────────────────────────────────── */

export default function FruitChallenge({ profile, onComplete }: Props) {
    const [phase, setPhase] = useState<GamePhase>('intro');
    const [currentRound, setCurrentRound] = useState(0);
    const [results, setResults] = useState<RoundResult[]>([]);
    const [answer, setAnswer] = useState('');
    const [scratchpad, setScratchpad] = useState('');
    const [showScratchpad, setShowScratchpad] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const [showHintConfirm, setShowHintConfirm] = useState(false);
    const [roundSolved, setRoundSolved] = useState(false);
    const [wrongShake, setWrongShake] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [rottenApples, setRottenApples] = useState(0);
    const [roundFailed, setRoundFailed] = useState(false);
    const [transitionCount, setTransitionCount] = useState(3);
    const [solvers, setSolvers] = useState<Record<string, SolverData>>({});
    const [roundAttempts, setRoundAttempts] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    /* ── Firestore: realtime solvers ─────────────────── */

    useEffect(() => {
        const ref = doc(db, 'challenges', CHALLENGE_ID);
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setSolvers((data.solvers ?? {}) as Record<string, SolverData>);
            }
        }, () => {});
        return unsub;
    }, []);

    /* ── check answer ────────────────────────────────── */

    const puzzle = PUZZLES[currentRound];

    const checkAnswer = useCallback(() => {
        if (!puzzle) return;
        const normalized = answer.trim().replace(/\s+/g, '');
        const isCorrect = puzzle.acceptedAnswers.some(
            (a) => normalized.toLowerCase() === a.toLowerCase(),
        );

        setRoundAttempts((a) => a + 1);

        if (isCorrect) {
            setRoundSolved(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } else {
            setWrongShake(true);
            setTimeout(() => setWrongShake(false), 600);
            // Round 3: 1 attempt only
            if (currentRound === 2) {
                setRoundFailed(true);
            }
        }
    }, [answer, puzzle, currentRound]);

    /* ── advance to next round ───────────────────────── */

    const advanceRound = useCallback(() => {
        const result: RoundResult = {
            solved: roundSolved,
            hintsUsed: hintLevel,
            attempts: roundAttempts,
        };
        const newResults = [...results, result];
        setResults(newResults);

        const nextRound = currentRound + 1;

        if (nextRound >= PUZZLES.length) {
            // Game complete
            setPhase('results');

            // Save to Firestore
            const allSolved = newResults.every((r) => r.solved);
            const totalRottenApples = newResults.reduce((sum, r) => sum + r.hintsUsed, 0);
            const perfect = allSolved && totalRottenApples === 0;

            const ref = doc(db, 'challenges', CHALLENGE_ID);
            setDoc(ref, {
                solvers: {
                    [profile.uid]: {
                        firstName: profile.firstName,
                        round1: newResults[0]?.solved ?? false,
                        round2: newResults[1]?.solved ?? false,
                        round3: newResults[2]?.solved ?? false,
                        rottenApples: totalRottenApples,
                        allSolved,
                        perfect,
                        solvedAt: serverTimestamp(),
                    },
                },
            }, { merge: true }).catch(console.warn);

            onComplete?.(perfect);
        } else {
            // Transition to next round
            setPhase('transition');
            setCurrentRound(nextRound);
            setAnswer('');
            setScratchpad('');
            setShowScratchpad(false);
            setHintLevel(0);
            setRoundSolved(false);
            setRoundFailed(false);
            setRoundAttempts(0);
            setTransitionCount(3);
        }
    }, [roundSolved, hintLevel, roundAttempts, results, currentRound, profile, onComplete]);

    /* ── transition countdown ────────────────────────── */

    useEffect(() => {
        if (phase !== 'transition') return;
        if (transitionCount <= 0) {
            const roundKey = `round${currentRound + 1}` as GamePhase;
            setPhase(roundKey);
            return;
        }
        const timer = setTimeout(() => setTransitionCount((c) => c - 1), 800);
        return () => clearTimeout(timer);
    }, [phase, transitionCount, currentRound]);

    /* ── use hint ─────────────────────────────────────── */

    const useHint = useCallback(() => {
        if (currentRound === 1) {
            setShowHintConfirm(true);
            return;
        }
        setHintLevel((h) => h + 1);
        setRottenApples((r) => r + 1);
    }, [currentRound]);

    const confirmHint = useCallback(() => {
        setShowHintConfirm(false);
        setHintLevel((h) => h + 1);
        setRottenApples((r) => r + 1);
    }, []);

    /* ── podium data ──────────────────────────────────── */

    const perfectSolvers = Object.values(solvers).filter((s) => s.perfect);
    const allSolvedSolvers = Object.values(solvers).filter((s) => s.allSolved && !s.perfect);
    const challengers = Object.values(solvers).filter((s) => !s.allSolved);

    /* ── confetti emojis ──────────────────────────────── */

    const confettiItems = ['🍎', '🍌', '🥥', '🍓', '🍊', '🍇', '🍉', '🫐', '🥝', '⭐', '🏆', '✨', '🎉'];

    /* ── CSS animations ──────────────────────────────── */

    const cssAnimations = `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.7} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes float { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-500px) rotate(720deg);opacity:0} }
        @keyframes bounceIn { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes glow { 0%,100%{box-shadow:0 0 5px rgba(108,92,231,.3)} 50%{box-shadow:0 0 25px rgba(108,92,231,.6)} }
        @keyframes countdown { 0%{transform:scale(3);opacity:0} 30%{transform:scale(1);opacity:1} 80%{transform:scale(1);opacity:1} 100%{transform:scale(.5);opacity:0} }
        @keyframes rottenDrop { 0%{transform:translateY(-60px) rotate(0);opacity:0} 60%{transform:translateY(5px) rotate(180deg);opacity:1} 100%{transform:translateY(0) rotate(180deg);opacity:1} }
        @keyframes stampIn { 0%{transform:scale(4) rotate(-20deg);opacity:0} 50%{transform:scale(0.9) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(-3deg);opacity:1} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 15%{transform:scale(1.15)} 30%{transform:scale(1)} 45%{transform:scale(1.1)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        .fc-emoji:hover { transform: scale(1.4) rotate(15deg) !important; }
        .fc-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.2) !important; }
    `;

    /* ═══════════════════════════════════════════════════
       RENDER: INTRO
       ═══════════════════════════════════════════════════ */

    if (phase === 'intro') {
        return (
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', fontFamily: "'Fredoka', 'Inter', sans-serif", textAlign: 'center' }}>
                <style>{cssAnimations}</style>

                {/* Floating fruit background */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                    {['🍎','🍌','🥥','🍓','🍊','🍇','🍉','🫐','🥝'].map((e, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            fontSize: `${1.5 + Math.random() * 2}rem`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: 0.12,
                            animation: `heartbeat ${3 + Math.random() * 3}s infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}>{e}</div>
                    ))}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '4rem', marginBottom: '0.5rem', animation: 'bounceIn 0.6s ease-out' }}>🍎🍌🥥</div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2d3436', margin: '0 0 0.3rem', animation: 'slideUp 0.4s ease-out' }}>Fruit Challenge</h1>
                    <p style={{ fontSize: '1rem', color: '#636e72', fontWeight: 500, marginBottom: '1.5rem', animation: 'slideUp 0.5s ease-out' }}>
                        3 puzzels. Stijgende moeilijkheid. Kun jij ze alle drie oplossen? 🏆
                    </p>

                    {/* Round preview cards */}
                    {PUZZLES.map((p, i) => (
                        <div key={i} style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '1rem 1.25rem',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            border: '2px solid #f0f0f0',
                            animation: `fadeSlide 0.4s ease-out`,
                            animationDelay: `${0.2 + i * 0.15}s`,
                            animationFillMode: 'both',
                            textAlign: 'left',
                        }}>
                            <div style={{ fontSize: '2rem', minWidth: '3rem', textAlign: 'center' }}>{p.emoji.split('').slice(0, 1)}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#2d3436' }}>
                                    Ronde {i + 1}: {p.title}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#636e72', fontWeight: 500 }}>
                                    {i === 0 && '3 hints beschikbaar — elke hint = 1 🍏 rotte appel'}
                                    {i === 1 && '1 hint (kost een 🍏) — weet je het zeker?'}
                                    {i === 2 && '❌ Geen hints · 1 poging · Alles of niets!'}
                                </div>
                            </div>
                            <div style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: i === 0 ? '#e8f8f5' : i === 1 ? '#fef3e2' : '#fde8e8',
                                color: i === 0 ? '#00b894' : i === 1 ? '#f39c12' : '#e74c3c',
                            }}>
                                {i === 0 ? 'MAKKELIJK' : i === 1 ? 'MEDIUM' : 'MOEILIJK'}
                            </div>
                        </div>
                    ))}

                    {/* Scoring info */}
                    <div style={{
                        background: 'linear-gradient(135deg, #2d3436, #636e72)',
                        borderRadius: '16px',
                        padding: '1rem 1.25rem',
                        margin: '1.5rem 0',
                        color: '#fff',
                        textAlign: 'left',
                        animation: 'slideUp 0.6s ease-out',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>🏅 Scorebord</div>
                        <div style={{ fontSize: '0.78rem', lineHeight: 1.7, opacity: 0.9 }}>
                            🏆 <strong>Fruit Master</strong> — Alle 3 goed, 0 rotte appels<br />
                            ⭐ <strong>Fruit Champion</strong> — Alle 3 goed, maar met rotte appels<br />
                            🎯 <strong>Fruit Challenger</strong> — Niet alle 3 opgelost
                        </div>
                    </div>

                    {/* Start button */}
                    <button
                        className="fc-btn"
                        onClick={() => setPhase('round1')}
                        style={{
                            padding: '1rem 3rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ff6b6b, #ffa502)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1.3rem',
                            cursor: 'pointer',
                            fontFamily: "'Fredoka', sans-serif",
                            boxShadow: '0 8px 32px rgba(255,107,107,0.4)',
                            transition: 'all 0.2s',
                            animation: 'heartbeat 2s infinite',
                        }}
                    >
                        🚀 Start de Challenge!
                    </button>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════
       RENDER: TRANSITION
       ═══════════════════════════════════════════════════ */

    if (phase === 'transition') {
        const nextPuzzle = PUZZLES[currentRound];
        return (
            <div style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                background: nextPuzzle.gradient, color: '#fff', zIndex: 9999,
                fontFamily: "'Fredoka', sans-serif",
            }}>
                <style>{cssAnimations}</style>
                {transitionCount > 0 ? (
                    <div key={transitionCount} style={{
                        fontSize: '8rem', fontWeight: 700,
                        animation: 'countdown 0.8s ease-out',
                    }}>
                        {transitionCount}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', animation: 'bounceIn 0.5s ease-out' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{nextPuzzle.emoji}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>Ronde {currentRound + 1}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 500, opacity: 0.9 }}>{nextPuzzle.title}</div>
                    </div>
                )}
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════
       RENDER: RESULTS
       ═══════════════════════════════════════════════════ */

    if (phase === 'results') {
        const allSolved = results.every((r) => r.solved);
        const totalRotten = results.reduce((s, r) => s + r.hintsUsed, 0);
        const perfect = allSolved && totalRotten === 0;

        return (
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', fontFamily: "'Fredoka', sans-serif", textAlign: 'center' }}>
                <style>{cssAnimations}</style>

                {/* Confetti for perfect/allSolved */}
                {allSolved && (
                    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999, overflow: 'hidden' }}>
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute', bottom: -20,
                                left: `${Math.random() * 100}%`,
                                fontSize: `${1 + Math.random() * 2}rem`,
                                animation: `float ${2 + Math.random() * 3}s ease-out forwards`,
                                animationDelay: `${Math.random()}s`,
                            }}>
                                {confettiItems[i % confettiItems.length]}
                            </div>
                        ))}
                    </div>
                )}

                {/* Result header */}
                <div style={{ animation: 'bounceIn 0.5s ease-out' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '0.3rem' }}>
                        {perfect ? '🏆' : allSolved ? '⭐' : '🎯'}
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3436', margin: '0 0 0.3rem' }}>
                        {perfect ? 'FRUIT MASTER!' : allSolved ? 'FRUIT CHAMPION!' : 'Goed geprobeerd!'}
                    </h1>
                    <p style={{ color: '#636e72', fontWeight: 500, marginBottom: '1rem' }}>
                        {perfect && `Ongelooflijk, ${profile.firstName}! Alle 3 zonder hints! 🎉`}
                        {allSolved && !perfect && `Goed gedaan, ${profile.firstName}! Alle 3 opgelost met ${totalRotten} rotte appel${totalRotten !== 1 ? 's' : ''} 🍏`}
                        {!allSolved && `Jammer, ${profile.firstName}. Probeer het nog eens! 💪`}
                    </p>
                </div>

                {/* Round results */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{
                            background: '#fff', borderRadius: '14px', padding: '1rem', minWidth: '160px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            border: `2px solid ${r.solved ? '#00b894' : '#e74c3c'}`,
                            animation: `fadeSlide 0.3s ease-out`, animationDelay: `${i * 0.15}s`, animationFillMode: 'both',
                        }}>
                            <div style={{ fontSize: '1.5rem' }}>{PUZZLES[i].emoji.split('').slice(0, 1)}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0.3rem 0' }}>Ronde {i + 1}</div>
                            <div style={{ fontSize: '1.5rem' }}>{r.solved ? '✅' : '❌'}</div>
                            {r.hintsUsed > 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#e67e22', fontWeight: 600, marginTop: '0.3rem' }}>
                                    {'🍏'.repeat(r.hintsUsed)} {r.hintsUsed} hint{r.hintsUsed !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Podium */}
                <div style={{
                    background: 'linear-gradient(135deg, #2d3436, #636e72)',
                    borderRadius: '16px', padding: '1.25rem', color: '#fff', textAlign: 'left',
                }}>
                    {/* Perfect Masters */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '0.3rem' }}>
                            🏆 Fruit Masters — Perfect, geen hints
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.8 }}>
                            {perfectSolvers.length > 0
                                ? perfectSolvers.map((s, i) => (
                                    <span key={i} style={{
                                        display: 'inline-block', background: 'rgba(255,215,0,0.2)', padding: '0.15rem 0.5rem',
                                        borderRadius: '6px', margin: '0.1rem', border: '1px solid rgba(255,215,0,0.3)',
                                    }}>🏆 {s.firstName}</span>
                                ))
                                : <span style={{ opacity: 0.5 }}>Nog niemand — word de eerste! 👑</span>
                            }
                        </div>
                    </div>

                    {/* Champions */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '0.3rem' }}>
                            ⭐ Fruit Champions — Alles goed, maar met rotte appels
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.8 }}>
                            {allSolvedSolvers.length > 0
                                ? allSolvedSolvers.map((s, i) => (
                                    <span key={i} style={{
                                        display: 'inline-block', background: 'rgba(108,92,231,0.2)', padding: '0.15rem 0.5rem',
                                        borderRadius: '6px', margin: '0.1rem',
                                    }}>⭐ {s.firstName} {'🍏'.repeat(s.rottenApples)}</span>
                                ))
                                : <span style={{ opacity: 0.5 }}>—</span>
                            }
                        </div>
                    </div>

                    {/* Challengers */}
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '0.3rem' }}>
                            🎯 Fruit Challengers — Nog niet alles opgelost
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.8 }}>
                            {challengers.length > 0
                                ? challengers.map((s, i) => (
                                    <span key={i} style={{
                                        display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem',
                                        borderRadius: '6px', margin: '0.1rem',
                                    }}>🎯 {s.firstName} ({[s.round1, s.round2, s.round3].filter(Boolean).length}/3)</span>
                                ))
                                : <span style={{ opacity: 0.5 }}>—</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════
       RENDER: ROUND (1, 2, or 3)
       ═══════════════════════════════════════════════════ */

    if (!puzzle) return null;

    const maxHints = puzzle.hints.length;
    const canHint = !roundSolved && !roundFailed && hintLevel < maxHints;
    const isRound3 = currentRound === 2;
    const canSubmit = !roundSolved && !roundFailed && answer.trim().length > 0;

    return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem', fontFamily: "'Fredoka', 'Inter', sans-serif" }}>
            <style>{cssAnimations}</style>

            {/* Confetti */}
            {showConfetti && (
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999, overflow: 'hidden' }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute', bottom: -20,
                            left: `${Math.random() * 100}%`,
                            fontSize: `${1 + Math.random() * 1.5}rem`,
                            animation: `float ${2 + Math.random() * 2}s ease-out forwards`,
                            animationDelay: `${Math.random() * 0.5}s`,
                        }}>
                            {confettiItems[i % confettiItems.length]}
                        </div>
                    ))}
                </div>
            )}

            {/* Round header */}
            <div style={{
                background: puzzle.gradient, borderRadius: '16px', padding: '1rem 1.5rem',
                color: '#fff', textAlign: 'center', marginBottom: '1rem',
                boxShadow: `0 8px 32px ${currentRound === 0 ? 'rgba(255,107,107,0.3)' : currentRound === 1 ? 'rgba(108,92,231,0.3)' : 'rgba(225,112,85,0.3)'}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                        fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)',
                        padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase',
                    }}>
                        Ronde {currentRound + 1}/3
                    </div>
                    {rottenApples > 0 && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {'🍏'.repeat(rottenApples)} {rottenApples} rotte appel{rottenApples !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
                <div style={{ fontSize: '2rem', margin: '0.3rem 0', animation: 'bounceIn 0.4s ease-out' }}>{puzzle.emoji}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{puzzle.title}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.9 }}>{puzzle.subtitle}</div>

                {isRound3 && !roundSolved && !roundFailed && (
                    <div style={{
                        marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)',
                        padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem',
                        fontWeight: 700, animation: 'heartbeat 1.5s infinite',
                    }}>
                        ⚠️ GEEN HINTS · 1 POGING · ALLES OF NIETS
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                        flex: 1, height: '6px', borderRadius: '3px',
                        background: i < currentRound ? '#00b894' : i === currentRound ? '#6c5ce7' : '#ddd',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>

            {/* Equations card */}
            <div style={{
                background: '#fff', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '2px solid #f0f0f0',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '0.3rem', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vergelijkingen
                </div>
                {puzzle.equations.map((eq, eIdx) => (
                    <div key={eIdx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                        padding: '0.5rem 0', fontSize: '1.2rem', fontWeight: 700,
                        borderBottom: eIdx < puzzle.equations.length - 1 ? '1px solid #f5f5f5' : 'none',
                        ...(eq.isMystery ? {
                            background: 'linear-gradient(135deg, #f0f0ff, #fff5f5)',
                            borderRadius: '10px', marginTop: '0.3rem', border: 'none',
                        } : {}),
                    }}>
                        {eq.items.map((item, j) => (
                            <span key={j} style={{ display: 'contents' }}>
                                {j > 0 && (
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', minWidth: '1.2rem', textAlign: 'center' }}>
                                        {j === 1 && eq.items.length === 2 ? eq.operator : '+'}
                                    </span>
                                )}
                                <span className="fc-emoji" style={{ fontSize: '1.6rem', display: 'inline-block', transition: 'transform 0.2s', cursor: 'default' }}>
                                    {item.emoji}
                                </span>
                            </span>
                        ))}
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>=</span>
                        <span style={eq.isMystery ? {
                            fontWeight: 900, color: '#6c5ce7', fontSize: '1.1rem', minWidth: '3.5rem', textAlign: 'right', animation: 'pulse 2s infinite',
                        } : {
                            fontWeight: 800, color: '#2d3436', fontSize: '1rem', minWidth: '3.5rem', textAlign: 'right',
                        }}>
                            {eq.result}
                        </span>
                    </div>
                ))}
            </div>

            {/* Solved state */}
            {roundSolved && (
                <div style={{
                    background: 'linear-gradient(135deg, #00b894, #00cec9)',
                    borderRadius: '16px', padding: '1.25rem', textAlign: 'center', color: '#fff',
                    marginBottom: '1rem', animation: 'bounceIn 0.4s ease-out',
                    boxShadow: '0 8px 32px rgba(0,184,148,0.3)',
                }}>
                    <div style={{ fontSize: '2rem' }}>✅</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {hintLevel === 0 ? 'PERFECT!' : 'Goed opgelost!'} € {puzzle.answer}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', opacity: 0.9 }}>
                        {puzzle.fruitPrices.map((f) => `${f.emoji}=${f.price}`).join(' · ')}
                    </div>
                    {hintLevel === 0 && (
                        <div style={{
                            marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700,
                            background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem',
                            borderRadius: '20px', display: 'inline-block', animation: 'stampIn 0.5s ease-out',
                        }}>
                            ⭐ ZONDER HINTS
                        </div>
                    )}
                    <div style={{ marginTop: '0.75rem' }}>
                        <button className="fc-btn" onClick={advanceRound} style={{
                            padding: '0.6rem 2rem', borderRadius: '12px', border: 'none',
                            background: '#fff', color: '#00b894', fontWeight: 700, fontSize: '0.95rem',
                            cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", transition: 'all 0.2s',
                        }}>
                            {currentRound < 2 ? `Ronde ${currentRound + 2} →` : '🏆 Resultaten bekijken'}
                        </button>
                    </div>
                </div>
            )}

            {/* Failed state (round 3 only) */}
            {roundFailed && (
                <div style={{
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    borderRadius: '16px', padding: '1.25rem', textAlign: 'center', color: '#fff',
                    marginBottom: '1rem', animation: 'bounceIn 0.4s ease-out',
                }}>
                    <div style={{ fontSize: '2rem' }}>❌</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Helaas!</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.3rem', opacity: 0.9 }}>
                        Het juiste antwoord was € {puzzle.answer}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', opacity: 0.8 }}>
                        {puzzle.fruitPrices.map((f) => `${f.emoji}=${f.price}`).join(' · ')}
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                        <button className="fc-btn" onClick={advanceRound} style={{
                            padding: '0.6rem 2rem', borderRadius: '12px', border: 'none',
                            background: '#fff', color: '#e74c3c', fontWeight: 700, fontSize: '0.95rem',
                            cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", transition: 'all 0.2s',
                        }}>
                            🏆 Resultaten bekijken
                        </button>
                    </div>
                </div>
            )}

            {/* Input area (when not solved/failed) */}
            {!roundSolved && !roundFailed && (
                <>
                    {/* Scratchpad */}
                    <div
                        onClick={() => setShowScratchpad(!showScratchpad)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.5rem', borderRadius: '10px', border: '2px dashed #ddd',
                            background: showScratchpad ? '#fffde7' : '#fff', cursor: 'pointer',
                            fontSize: '0.82rem', fontWeight: 700, color: '#636e72', marginBottom: '0.75rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        📝 Kladblaadje {showScratchpad ? 'inklappen' : 'openen'}
                    </div>

                    {showScratchpad && (
                        <textarea
                            value={scratchpad}
                            onChange={(e) => setScratchpad(e.target.value)}
                            style={{
                                width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '10px',
                                border: '2px solid #ffeaa7', background: '#fffef5',
                                fontFamily: "'Caveat', 'Comic Sans MS', cursive", fontSize: '1.1rem',
                                color: '#2d3436', resize: 'vertical', outline: 'none', marginBottom: '0.75rem',
                                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
                            }}
                            placeholder="Reken hier uit..."
                        />
                    )}

                    {/* Hints */}
                    {canHint && !showHintConfirm && (
                        <button
                            className="fc-btn"
                            onClick={useHint}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid #ddd',
                                background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                                color: '#636e72', margin: '0 auto 0.75rem', transition: 'all 0.15s',
                                fontFamily: "'Fredoka', sans-serif",
                            }}
                        >
                            💡 Hint {hintLevel + 1}/{maxHints} (kost 1 🍏)
                        </button>
                    )}

                    {/* Hint confirmation (round 2) */}
                    {showHintConfirm && (
                        <div style={{
                            background: '#fef3e2', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem',
                            border: '2px solid #f39c12', textAlign: 'center', animation: 'bounceIn 0.3s ease-out',
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>⚠️</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e67e22', marginBottom: '0.5rem' }}>
                                Weet je het zeker? Deze hint kost een 🍏 rotte appel!
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button className="fc-btn" onClick={confirmHint} style={{
                                    padding: '0.4rem 1rem', borderRadius: '8px', border: 'none',
                                    background: '#e67e22', color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                                    cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", transition: 'all 0.2s',
                                }}>Ja, gebruik hint</button>
                                <button className="fc-btn" onClick={() => setShowHintConfirm(false)} style={{
                                    padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #ddd',
                                    background: '#fff', color: '#636e72', fontWeight: 700, fontSize: '0.8rem',
                                    cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", transition: 'all 0.2s',
                                }}>Nee, ik los het zelf op!</button>
                            </div>
                        </div>
                    )}

                    {/* Displayed hints */}
                    {puzzle.hints.slice(0, hintLevel).map((hint, i) => (
                        <div key={i} style={{
                            background: '#f0f7ff', borderRadius: '12px', padding: '0.8rem 1rem',
                            margin: '0.5rem 0', border: '1px solid #bee3f8', fontSize: '0.85rem',
                            color: '#2d3436', lineHeight: 1.5, animation: 'slideUp 0.3s ease-out',
                        }}>
                            <span style={{ marginRight: '0.3rem' }}>🍏</span> {hint}
                        </div>
                    ))}

                    {/* Answer input */}
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6c5ce7', marginBottom: '0.4rem' }}>
                            {puzzle.equations[puzzle.equations.length - 1].items.map((it) => it.emoji).join(' + ')} = ?
                        </div>
                        <div style={{
                            display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center',
                            animation: wrongShake ? 'shake 0.5s' : 'none',
                        }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#636e72' }}>€</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && canSubmit && checkAnswer()}
                                style={{
                                    padding: '0.65rem 1rem', borderRadius: '12px', border: '2px solid #6c5ce7',
                                    fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', width: '140px',
                                    outline: 'none', fontFamily: "'Fredoka', sans-serif", animation: 'glow 3s infinite',
                                }}
                                placeholder="?,??"
                                autoFocus
                            />
                            <button
                                className="fc-btn"
                                onClick={checkAnswer}
                                disabled={!canSubmit}
                                style={{
                                    padding: '0.65rem 1.2rem', borderRadius: '12px', border: 'none',
                                    background: canSubmit ? 'linear-gradient(135deg, #6c5ce7, #a855f7)' : '#ccc',
                                    color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: canSubmit ? 'pointer' : 'default',
                                    fontFamily: "'Fredoka', sans-serif", transition: 'all 0.2s',
                                    boxShadow: canSubmit ? '0 4px 16px rgba(108,92,231,0.3)' : 'none',
                                }}
                            >
                                Controleer 🔍
                            </button>
                        </div>
                        {wrongShake && (
                            <div style={{ color: '#e74c3c', fontWeight: 700, fontSize: '0.82rem', marginTop: '0.4rem', animation: 'slideUp 0.2s' }}>
                                {isRound3 ? '❌ Helaas, dat was je enige kans...' : '❌ Dat klopt niet. Probeer opnieuw!'}
                            </div>
                        )}
                        {isRound3 && !wrongShake && (
                            <div style={{ color: '#e67e22', fontWeight: 600, fontSize: '0.75rem', marginTop: '0.4rem', opacity: 0.8 }}>
                                ⚠️ Let op: je hebt maar 1 poging!
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
