/**
 * AlgebraArenaPage — Main orchestrator
 *
 * State machine driving the full endgame experience.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AlgebraArena.css';

// Engine
import {
    createInitialState,
    startRun,
    processStep,
    advanceToNextEncounter,
    enterBossPhase,
    enterArenaPhase,
    getRunScore,
    type GameState,
} from './engine/battleEngine';
import { TIMING } from './engine/arenaConfig';

// Components
import ArenaHUD from './components/ArenaHUD';
import BattleScene from './components/BattleScene';
import EquationDisplay from './components/EquationDisplay';
import OperationButtons from './components/OperationButtons';
import DamageNumbers from './components/DamageNumbers';
import ComboIndicator from './components/ComboIndicator';
import ArenaIntro from './components/ArenaIntro';
import VictoryScreen from './components/VictoryScreen';

// Audio
import { playSFX, setMuted } from './audio/arenaSounds';

// Services
import { useAuth } from '../../hooks/useAuth';
import { updateScore, BOARD_IDS } from '../../services/unifiedLeaderboardService';
import { markAlgebraArenaCompleted } from '../../services/chapter8Flow';

export default function AlgebraArenaPage() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [gameState, setGameState] = useState<GameState>(createInitialState);
    const [showDamage, setShowDamage] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const [victorySaved, setVictorySaved] = useState(false);
    const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        };
    }, []);

    // Victory: save score + mark progress (fires once)
    useEffect(() => {
        if (gameState.phase !== 'victory' || victorySaved) return;
        setVictorySaved(true);
        playSFX('victory');

        const runScore = getRunScore(gameState);
        if (user?.uid) {
            const firstName = profile?.firstName ?? 'Speler';
            const classId = profile?.classId ?? null;
            updateScore(BOARD_IDS.ALGEBRA_ARENA, user.uid, firstName, classId, runScore.totalAP).catch(console.warn);
            markAlgebraArenaCompleted(user.uid).catch(console.warn);
        }
    }, [gameState.phase, victorySaved, gameState, user, profile]);

    // ── Handle operation button press ──
    const handleOperationSelect = useCallback((chosenIndex: number) => {
        setButtonsDisabled(true);

        setGameState(prev => {
            const nextState = processStep(prev, chosenIndex);
            const result = nextState.lastStepResult;
            if (!result) return nextState;

            if (result.isCorrect) {
                // SFX
                if (result.animation === 'hero_critical') playSFX('critical');
                else playSFX('slash');

                if (result.comboCount >= 3) {
                    playSFX('combo');
                }

                // Show floating numbers
                setShowDamage(true);
                setTimeout(() => setShowDamage(false), 1200);

                // Schedule next state
                const delay = result.monsterDefeated
                    ? (result.bossDefeated ? TIMING.BOSS_DEFEAT_MS : TIMING.MONSTER_DEFEAT_MS)
                    : TIMING.FEEDBACK_CORRECT_MS;

                if (result.monsterDefeated) {
                    playSFX(result.bossDefeated ? 'defeat' : 'slash');
                }

                feedbackTimerRef.current = setTimeout(() => {
                    setGameState(s => advanceToNextEncounter(s));
                    setButtonsDisabled(false);
                }, delay);
            } else {
                // Wrong
                playSFX('monster_hit');
                setScreenShake(true);
                setTimeout(() => setScreenShake(false), 300);

                feedbackTimerRef.current = setTimeout(() => {
                    setGameState(s => ({ ...s, lastStepResult: null }));
                    setButtonsDisabled(false);
                }, TIMING.FEEDBACK_WRONG_MS);
            }

            return nextState;
        });
    }, []);

    // ── Handle start game ──
    const handleStartGame = useCallback(() => {
        setGameState(prev => startRun(prev));
    }, []);

    // ── Handle arena transition continue ──
    const handleTransitionContinue = useCallback(() => {
        setGameState(prev => enterArenaPhase(prev));
    }, []);

    // ── Handle boss intro continue ──
    const handleBossIntroContinue = useCallback(() => {
        playSFX('boss_roar');
        setGameState(prev => enterBossPhase(prev));
    }, []);

    // ── Handle mute toggle ──
    const handleToggleMute = useCallback(() => {
        setGameState(prev => {
            const newMuted = !prev.muted;
            setMuted(newMuted);
            return { ...prev, muted: newMuted };
        });
    }, []);

    // ── Handle replay ──
    const handleReplay = useCallback(() => {
        setGameState(createInitialState());
        setButtonsDisabled(false);
        setVictorySaved(false);
    }, []);

    // ── Handle exit ──
    const handleExit = useCallback(() => {
        navigate('/');
    }, [navigate]);

    // ── Arena intensity class ──
    const arenaClass = `aa-page--arena${gameState.arenaLevel}`;

    // ── Render overlays ──
    if (gameState.phase === 'intro') {
        return (
            <div className={`aa-page ${arenaClass}`}>
                <ArenaIntro
                    type="game_intro"
                    arenaLevel={1}
                    onContinue={handleStartGame}
                />
            </div>
        );
    }

    if (gameState.phase === 'arena_transition') {
        return (
            <div className={`aa-page ${arenaClass}`}>
                <ArenaIntro
                    type="arena_transition"
                    arenaLevel={gameState.arenaLevel}
                    onContinue={handleTransitionContinue}
                />
            </div>
        );
    }

    if (gameState.phase === 'boss_intro') {
        return (
            <div className={`aa-page ${arenaClass}`}>
                <ArenaIntro
                    type="boss_intro"
                    arenaLevel={gameState.arenaLevel}
                    monster={gameState.currentMonster}
                    onContinue={handleBossIntroContinue}
                />
            </div>
        );
    }

    if (gameState.phase === 'victory') {
        const runScore = getRunScore(gameState);
        return (
            <div className={`aa-page ${arenaClass}`}>
                <VictoryScreen
                    score={runScore}
                    onReplay={handleReplay}
                    onExit={handleExit}
                />
            </div>
        );
    }

    // ── Main battle UI ──
    const isPlaying = ['arena_1', 'boss_1', 'arena_2', 'boss_2', 'arena_3', 'boss_3', 'final_arena', 'final_boss'].includes(gameState.phase);

    if (!isPlaying) {
        return (
            <div className={`aa-page ${arenaClass}`}>
                <ArenaIntro type="game_intro" arenaLevel={1} onContinue={handleStartGame} />
            </div>
        );
    }

    return (
        <div className={`aa-page ${arenaClass} ${screenShake ? 'aa-screen-shake' : ''}`}>
            <ArenaHUD state={gameState} onToggleMute={handleToggleMute} />

            <div className="aa-battle">
                <BattleScene state={gameState} />

                <DamageNumbers
                    breakdown={gameState.lastStepResult?.apGained ?? null}
                    show={showDamage}
                />

                <EquationDisplay
                    equation={gameState.currentEquation}
                    stepIndex={gameState.currentStepIndex}
                />

                <OperationButtons
                    options={gameState.currentButtons.options}
                    correctIndex={gameState.currentButtons.correctIndex}
                    onSelect={handleOperationSelect}
                    disabled={buttonsDisabled}
                />
            </div>

            <ComboIndicator combo={gameState.currentCombo} />
        </div>
    );
}
