/**
 * BattleScene — Hero vs Monster with HP bars
 */
import type { GameState } from '../engine/battleEngine';

interface BattleSceneProps {
    state: GameState;
}

export default function BattleScene({ state }: BattleSceneProps) {
    const { currentMonster, monsterHP, monsterMaxHP, heroHP, lastStepResult } = state;
    const hpPct = monsterMaxHP > 0 ? (monsterHP / monsterMaxHP) * 100 : 0;
    const hpClass = hpPct > 60 ? '' : hpPct > 30 ? 'aa-hp-fill--mid' : 'aa-hp-fill--low';

    const animation = lastStepResult?.animation;
    const heroAnim = animation === 'hero_slash' || animation === 'hero_critical'
        ? 'aa-hero-sprite--attack'
        : animation === 'monster_attack' ? 'aa-hero-sprite--hit' : '';

    const monsterAnim = animation === 'hero_slash' || animation === 'hero_critical'
        ? 'aa-monster-sprite--hit'
        : animation === 'monster_defeat' || animation === 'boss_defeat'
            ? 'aa-monster-sprite--defeat' : '';

    return (
        <div className="aa-battle-scene">
            {/* Hero */}
            <div className="aa-hero">
                <div className={`aa-hero-sprite ${heroAnim}`}>🗡️</div>
                <div className="aa-hero-hp">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span
                            key={i}
                            className={`aa-heart ${i >= heroHP ? 'aa-heart--empty' : ''}`}
                        >❤️</span>
                    ))}
                </div>
            </div>

            <span className="aa-vs">VS</span>

            {/* Monster */}
            <div className="aa-monster">
                <div className={`aa-monster-sprite ${currentMonster.isBoss ? 'aa-monster-sprite--boss' : ''} ${monsterAnim}`}>
                    {currentMonster.emoji}
                </div>
                <div className="aa-monster-info">
                    <div className="aa-monster-name">{currentMonster.name}</div>
                    <div className="aa-hp-bar">
                        <div
                            className={`aa-hp-fill ${hpClass}`}
                            style={{ width: `${hpPct}%` }}
                        />
                    </div>
                    <div className="aa-hp-text">{monsterHP}/{monsterMaxHP} HP</div>
                </div>
            </div>

            {/* Slash effect */}
            {(animation === 'hero_slash' || animation === 'hero_critical') && (
                <div className="aa-slash-effect" />
            )}
        </div>
    );
}
