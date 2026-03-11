/**
 * ArenaIntro — Pre-game intro + arena transition overlays
 */
import { ARENA_NAMES } from '../engine/arenaConfig';
import type { ArenaLevel } from '../engine/arenaConfig';
import type { MonsterDef } from '../engine/arenaConfig';

interface ArenaIntroProps {
    type: 'game_intro' | 'arena_transition' | 'boss_intro';
    arenaLevel: ArenaLevel;
    monster?: MonsterDef;
    onContinue: () => void;
}

export default function ArenaIntro({ type, arenaLevel, monster, onContinue }: ArenaIntroProps) {
    if (type === 'game_intro') {
        return (
            <div className="aa-overlay">
                <div className="aa-overlay-emoji">⚔️</div>
                <div className="aa-overlay-title">ALGEBRA ARENA</div>
                <div className="aa-overlay-subtitle">
                    Versla monsters door vergelijkingen op te lossen!<br />
                    Kies telkens de juiste bewerking.
                </div>
                <button className="aa-overlay-btn" onClick={onContinue}>
                    🗡️ Start Gevecht!
                </button>
            </div>
        );
    }

    if (type === 'boss_intro' && monster) {
        return (
            <div className="aa-overlay aa-boss-intro">
                <div className="aa-overlay-emoji">{monster.emoji}</div>
                <div className="aa-overlay-title">BOSS GEVECHT!</div>
                <div className="aa-overlay-subtitle">{monster.name}</div>
                {monster.entranceQuote && (
                    <div className="aa-boss-quote">"{monster.entranceQuote}"</div>
                )}
                <button className="aa-overlay-btn" onClick={onContinue}>
                    ⚔️ Vechten!
                </button>
            </div>
        );
    }

    // arena_transition
    return (
        <div className="aa-overlay aa-transition">
            <div className="aa-overlay-emoji">
                {arenaLevel === 2 ? '⚔️' : arenaLevel === 3 ? '🏰' : '🔥'}
            </div>
            <div className="aa-overlay-title">{ARENA_NAMES[arenaLevel]}</div>
            <div className="aa-overlay-subtitle">
                {arenaLevel === 2 && 'De vergelijkingen worden moeilijker!'}
                {arenaLevel === 3 && 'Letters aan beide kanten van het = teken!'}
                {arenaLevel === 4 && 'De ultieme uitdaging!'}
            </div>
            <button className="aa-overlay-btn" onClick={onContinue}>
                Verder →
            </button>
        </div>
    );
}
