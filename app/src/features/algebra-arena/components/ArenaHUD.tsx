/**
 * ArenaHUD — Top bar: arena name, AP, combo, mute
 */
import type { GameState } from '../engine/battleEngine';
import { ARENA_NAMES } from '../engine/arenaConfig';

interface HUDProps {
    state: GameState;
    onToggleMute: () => void;
}

export default function ArenaHUD({ state, onToggleMute }: HUDProps) {
    const arenaName = ARENA_NAMES[state.arenaLevel];
    const apPulse = state.lastStepResult?.isCorrect;

    return (
        <div className="aa-hud">
            <div className="aa-hud-left">
                <span className="aa-hud-arena">⚔️ {arenaName}</span>
            </div>
            <div className="aa-hud-center">
                <span className={`aa-hud-ap ${apPulse ? 'aa-hud-ap--pulse' : ''}`}>
                    ⚡ {state.totalAP.toLocaleString()} AP
                </span>
                {state.currentCombo >= 2 && (
                    <span className={`aa-hud-combo aa-hud-combo--active`}>
                        🔥 {state.currentCombo}×
                    </span>
                )}
            </div>
            <div className="aa-hud-right">
                <button className="aa-hud-mute" onClick={onToggleMute} title={state.muted ? 'Geluid aan' : 'Geluid uit'}>
                    {state.muted ? '🔇' : '🔊'}
                </button>
            </div>
        </div>
    );
}
