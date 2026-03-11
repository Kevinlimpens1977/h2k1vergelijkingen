/**
 * Battle Engine — Game State Machine
 *
 * 1 equation = 1 regular monster (HP = steps per equation)
 * Boss = 2 equations bundled (HP = 2 × steps per equation)
 * No game over: arena restarts with full HP on depletion.
 */

import type { ArenaLevel, MonsterDef } from './arenaConfig';
import { ARENA_MONSTERS, HERO } from './arenaConfig';
import { generateEquation, generateButtonOptions, type GeneratedEquation, type Operation, type Equation } from './equationGenerator';
import { calculateStepAP, monsterDefeatAP, bossDefeatAP, calculateRunScore, type APBreakdown, type RunScore } from './scoreEngine';

/* ── Types ───────────────────────────────────────────── */

export type ArenaPhase =
    | 'intro'
    | 'arena_1' | 'boss_1'
    | 'arena_2' | 'boss_2'
    | 'arena_3' | 'boss_3'
    | 'final_arena' | 'final_boss'
    | 'victory' | 'leaderboard'
    | 'arena_transition' | 'boss_intro' | 'monster_defeat' | 'boss_defeat';

export interface GameState {
    phase: ArenaPhase;
    arenaLevel: ArenaLevel;

    // Current encounter
    currentMonster: MonsterDef;
    monsterHP: number;
    monsterMaxHP: number;
    heroHP: number;

    // Current equation
    currentEquation: GeneratedEquation;
    currentStepIndex: number;
    currentButtons: { options: Operation[]; correctIndex: number };

    // Scoring
    totalAP: number;
    currentCombo: number;
    maxCombo: number;
    perfectSolves: number;
    totalSteps: number;
    correctSteps: number;
    monsterMistakes: number; // mistakes on current monster

    // Arena progress
    monstersDefeatedInArena: number;
    totalMonstersDefeated: number;
    monsterQueueIndex: number;

    // Boss tracking
    bossEquationsCompleted: number;

    // Timing
    stepStartTime: number;
    runStartTime: number;

    // Audio
    muted: boolean;

    // Step feedback
    lastStepResult: StepResult | null;
}

export interface StepResult {
    isCorrect: boolean;
    apGained: APBreakdown;
    monsterDefeated: boolean;
    bossDefeated: boolean;
    equationComplete: boolean;
    arenaComplete: boolean;
    newEquation?: Equation;
    animation: AnimationType;
    comboCount: number;
}

export type AnimationType =
    | 'hero_slash'
    | 'hero_critical'
    | 'monster_attack'
    | 'monster_defeat'
    | 'boss_defeat'
    | 'combo_flash'
    | 'none';

/* ── Constants ───────────────────────────────────────── */

const REGULAR_COUNT: Record<ArenaLevel, number> = { 1: 4, 2: 4, 3: 4, 4: 2 };


/* ── Factory ─────────────────────────────────────────── */

function getArenaLevel(phase: ArenaPhase): ArenaLevel {
    if (phase === 'arena_1' || phase === 'boss_1') return 1;
    if (phase === 'arena_2' || phase === 'boss_2') return 2;
    if (phase === 'arena_3' || phase === 'boss_3') return 3;
    return 4;
}

function isBossPhase(phase: ArenaPhase): boolean {
    return phase === 'boss_1' || phase === 'boss_2' || phase === 'boss_3' || phase === 'final_boss';
}

function nextArenaPhase(current: ArenaPhase): ArenaPhase {
    switch (current) {
        case 'arena_1': return 'boss_1';
        case 'boss_1': return 'arena_2';
        case 'arena_2': return 'boss_2';
        case 'boss_2': return 'arena_3';
        case 'arena_3': return 'boss_3';
        case 'boss_3': return 'final_arena';
        case 'final_arena': return 'final_boss';
        case 'final_boss': return 'victory';
        default: return 'victory';
    }
}

function spawnMonster(level: ArenaLevel, queueIndex: number, isBoss: boolean): MonsterDef {
    if (isBoss) return ARENA_MONSTERS[level].boss;
    const regulars = ARENA_MONSTERS[level].regular;
    return regulars[queueIndex % regulars.length];
}

/* ── Public API ──────────────────────────────────────── */

export function createInitialState(): GameState {
    const level: ArenaLevel = 1;
    const monster = spawnMonster(level, 0, false);
    const eq = generateEquation(level);
    const buttons = generateButtonOptions(eq.equation, eq.solveSteps[0]);

    return {
        phase: 'intro',
        arenaLevel: level,
        currentMonster: monster,
        monsterHP: monster.hp,
        monsterMaxHP: monster.hp,
        heroHP: HERO.MAX_HP,
        currentEquation: eq,
        currentStepIndex: 0,
        currentButtons: buttons,
        totalAP: 0,
        currentCombo: 0,
        maxCombo: 0,
        perfectSolves: 0,
        totalSteps: 0,
        correctSteps: 0,
        monsterMistakes: 0,
        monstersDefeatedInArena: 0,
        totalMonstersDefeated: 0,
        monsterQueueIndex: 0,
        bossEquationsCompleted: 0,
        stepStartTime: Date.now(),
        runStartTime: Date.now(),
        muted: false,
        lastStepResult: null,
    };
}

export function startRun(state: GameState): GameState {
    const level: ArenaLevel = 1;
    const monster = spawnMonster(level, 0, false);
    const eq = generateEquation(level);
    const buttons = generateButtonOptions(eq.equation, eq.solveSteps[0]);

    return {
        ...state,
        phase: 'arena_1',
        arenaLevel: level,
        currentMonster: monster,
        monsterHP: monster.hp,
        monsterMaxHP: monster.hp,
        heroHP: HERO.MAX_HP,
        currentEquation: eq,
        currentStepIndex: 0,
        currentButtons: buttons,
        totalAP: 0,
        currentCombo: 0,
        maxCombo: 0,
        perfectSolves: 0,
        totalSteps: 0,
        correctSteps: 0,
        monsterMistakes: 0,
        monstersDefeatedInArena: 0,
        totalMonstersDefeated: 0,
        monsterQueueIndex: 0,
        bossEquationsCompleted: 0,
        stepStartTime: Date.now(),
        runStartTime: Date.now(),
        lastStepResult: null,
    };
}

export function processStep(state: GameState, chosenIndex: number): GameState {
    const isCorrect = chosenIndex === state.currentButtons.correctIndex;
    const stepTimeMs = Date.now() - state.stepStartTime;
    const nextCombo = isCorrect ? state.currentCombo + 1 : 0;
    const maxCombo = Math.max(state.maxCombo, nextCombo);
    const isBoss = isBossPhase(state.phase);

    if (isCorrect) {
        const ap = calculateStepAP(stepTimeMs, nextCombo);
        const newStepIdx = state.currentStepIndex + 1;
        const eqComplete = newStepIdx >= state.currentEquation.solveSteps.length;
        let newMonsterHP = state.monsterHP;
        let monsterDefeated = false;
        let bossDefeated = false;
        let arenaComplete = false;
        let newBossEqCompleted = state.bossEquationsCompleted;

        // Damage monster
        newMonsterHP = state.monsterHP - 1;

        if (newMonsterHP <= 0) {
            monsterDefeated = true;
        } else if (eqComplete && isBoss) {
            // Boss: equation complete but HP remains → next equation for same boss
            newBossEqCompleted = state.bossEquationsCompleted + 1;
        }

        let totalAP = state.totalAP + ap.total;
        let perfectSolves = state.perfectSolves;

        if (monsterDefeated) {
            totalAP += isBoss ? bossDefeatAP() : monsterDefeatAP(state.monsterMistakes === 0);
            if (state.monsterMistakes === 0) perfectSolves++;
            bossDefeated = isBoss;
        }

        // Check arena complete
        const newDefeatedInArena = monsterDefeated ? state.monstersDefeatedInArena + 1 : state.monstersDefeatedInArena;
        if (!isBoss && monsterDefeated && newDefeatedInArena >= REGULAR_COUNT[state.arenaLevel]) {
            arenaComplete = true;
        }

        const animation: AnimationType = monsterDefeated
            ? (isBoss ? 'boss_defeat' : 'monster_defeat')
            : (ap.speedBonus > 0 ? 'hero_critical' : 'hero_slash');

        const stepResult: StepResult = {
            isCorrect: true,
            apGained: ap,
            monsterDefeated,
            bossDefeated,
            equationComplete: eqComplete,
            arenaComplete,
            newEquation: eqComplete ? undefined : state.currentEquation.solveSteps[newStepIdx]?.resultEquation,
            animation,
            comboCount: nextCombo,
        };

        let nextState: GameState = {
            ...state,
            currentStepIndex: eqComplete ? 0 : newStepIdx,
            monsterHP: newMonsterHP,
            totalAP,
            currentCombo: nextCombo,
            maxCombo,
            perfectSolves,
            totalSteps: state.totalSteps + 1,
            correctSteps: state.correctSteps + 1,
            monstersDefeatedInArena: newDefeatedInArena,
            totalMonstersDefeated: monsterDefeated ? state.totalMonstersDefeated + 1 : state.totalMonstersDefeated,
            bossEquationsCompleted: newBossEqCompleted,
            stepStartTime: Date.now(),
            lastStepResult: stepResult,
            heroHP: monsterDefeated ? Math.min(state.heroHP + HERO.HP_HEAL_ON_DEFEAT, HERO.MAX_HP) : state.heroHP,
        };

        // Generate next equation/buttons if equation is complete but monster not defeated (boss)
        if (eqComplete && !monsterDefeated) {
            const newEq = generateEquation(state.arenaLevel);
            nextState = {
                ...nextState,
                currentEquation: newEq,
                currentStepIndex: 0,
                currentButtons: generateButtonOptions(newEq.equation, newEq.solveSteps[0]),
            };
        } else if (!eqComplete) {
            // Next step buttons
            nextState = {
                ...nextState,
                currentButtons: generateButtonOptions(
                    state.currentEquation.solveSteps[newStepIdx - 1]?.resultEquation ?? state.currentEquation.equation,
                    state.currentEquation.solveSteps[newStepIdx],
                ),
            };
        }

        return nextState;
    } else {
        // Wrong answer
        const newHeroHP = state.heroHP - HERO.HP_LOSS_PER_WRONG;
        const animation: AnimationType = 'monster_attack';

        const stepResult: StepResult = {
            isCorrect: false,
            apGained: { base: 0, speedBonus: 0, comboBonus: 0, total: 0 },
            monsterDefeated: false,
            bossDefeated: false,
            equationComplete: false,
            arenaComplete: false,
            animation,
            comboCount: 0,
        };

        let nextState: GameState = {
            ...state,
            heroHP: newHeroHP,
            currentCombo: 0,
            totalSteps: state.totalSteps + 1,
            monsterMistakes: state.monsterMistakes + 1,
            stepStartTime: Date.now(),
            lastStepResult: stepResult,
        };

        // If hero dies → restart arena with full HP
        if (newHeroHP <= 0) {
            nextState = restartArena(nextState);
        }

        return nextState;
    }
}

function restartArena(state: GameState): GameState {
    const level = state.arenaLevel;
    const monster = spawnMonster(level, 0, false);
    const eq = generateEquation(level);

    return {
        ...state,
        heroHP: HERO.MAX_HP,
        currentMonster: monster,
        monsterHP: monster.hp,
        monsterMaxHP: monster.hp,
        currentEquation: eq,
        currentStepIndex: 0,
        currentButtons: generateButtonOptions(eq.equation, eq.solveSteps[0]),
        monstersDefeatedInArena: 0,
        monsterQueueIndex: 0,
        monsterMistakes: 0,
        bossEquationsCompleted: 0,
    };
}

export function advanceToNextEncounter(state: GameState): GameState {
    const result = state.lastStepResult;
    if (!result) return state;

    // Boss defeated → transition to next arena
    if (result.bossDefeated) {
        const nextPhase = nextArenaPhase(state.phase);
        if (nextPhase === 'victory') {
            return { ...state, phase: 'victory', lastStepResult: null };
        }

        const nextLevel = getArenaLevel(nextPhase);
        const isBoss = isBossPhase(nextPhase);

        // Show arena transition or boss intro
        if (isBoss) {
            const boss = spawnMonster(nextLevel, 0, true);
            const eq = generateEquation(nextLevel);
            return {
                ...state,
                phase: 'boss_intro',
                arenaLevel: nextLevel,
                currentMonster: boss,
                monsterHP: boss.hp,
                monsterMaxHP: boss.hp,
                heroHP: HERO.MAX_HP,
                currentEquation: eq,
                currentStepIndex: 0,
                currentButtons: generateButtonOptions(eq.equation, eq.solveSteps[0]),
                monstersDefeatedInArena: 0,
                monsterQueueIndex: 0,
                monsterMistakes: 0,
                bossEquationsCompleted: 0,
                lastStepResult: null,
            };
        }

        const monster = spawnMonster(nextLevel, 0, false);
        const eq = generateEquation(nextLevel);
        return {
            ...state,
            phase: 'arena_transition',
            arenaLevel: nextLevel,
            currentMonster: monster,
            monsterHP: monster.hp,
            monsterMaxHP: monster.hp,
            heroHP: HERO.MAX_HP,
            currentEquation: eq,
            currentStepIndex: 0,
            currentButtons: generateButtonOptions(eq.equation, eq.solveSteps[0]),
            monstersDefeatedInArena: 0,
            monsterQueueIndex: 0,
            monsterMistakes: 0,
            bossEquationsCompleted: 0,
            lastStepResult: null,
        };
    }

    // Regular monster defeated → check if arena complete (go to boss)
    if (result.monsterDefeated && result.arenaComplete) {
        const level = state.arenaLevel;
        const boss = spawnMonster(level, 0, true);
        const eq = generateEquation(level);
        return {
            ...state,
            phase: 'boss_intro',
            currentMonster: boss,
            monsterHP: boss.hp,
            monsterMaxHP: boss.hp,
            currentEquation: eq,
            currentStepIndex: 0,
            currentButtons: generateButtonOptions(eq.equation, eq.solveSteps[0]),
            monsterMistakes: 0,
            bossEquationsCompleted: 0,
            lastStepResult: null,
        };
    }

    // Regular monster defeated → next monster
    if (result.monsterDefeated) {
        const nextIdx = state.monsterQueueIndex + 1;
        const level = state.arenaLevel;
        const monster = spawnMonster(level, nextIdx, false);
        const eq = generateEquation(level);
        return {
            ...state,
            currentMonster: monster,
            monsterHP: monster.hp,
            monsterMaxHP: monster.hp,
            monsterQueueIndex: nextIdx,
            currentEquation: eq,
            currentStepIndex: 0,
            currentButtons: generateButtonOptions(eq.equation, eq.solveSteps[0]),
            monsterMistakes: 0,
            lastStepResult: null,
        };
    }

    // Clear step result
    return { ...state, lastStepResult: null };
}

export function enterBossPhase(state: GameState): GameState {
    const level = state.arenaLevel;
    const bossPhase: ArenaPhase = level === 1 ? 'boss_1' : level === 2 ? 'boss_2' : level === 3 ? 'boss_3' : 'final_boss';
    return { ...state, phase: bossPhase, lastStepResult: null };
}

export function enterArenaPhase(state: GameState): GameState {
    const level = state.arenaLevel;
    const arenaPhase: ArenaPhase = level === 1 ? 'arena_1' : level === 2 ? 'arena_2' : level === 3 ? 'arena_3' : 'final_arena';
    return { ...state, phase: arenaPhase, lastStepResult: null };
}

export function getRunScore(state: GameState): RunScore {
    return calculateRunScore(
        state.totalAP,
        state.perfectSolves,
        state.maxCombo,
        state.totalSteps,
        state.correctSteps,
        Date.now() - state.runStartTime,
        state.totalMonstersDefeated,
    );
}
