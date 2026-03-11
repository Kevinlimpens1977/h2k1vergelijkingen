/**
 * DamageNumbers — Floating "+20 AP" etc.
 */
import type { APBreakdown } from '../engine/scoreEngine';

interface DamageNumbersProps {
    breakdown: APBreakdown | null;
    show: boolean;
}

export default function DamageNumbers({ breakdown, show }: DamageNumbersProps) {
    if (!show || !breakdown || breakdown.total === 0) return null;

    return (
        <>
            <div className="aa-damage-num aa-damage-num--ap" style={{ top: '30%', right: '25%' }}>
                +{breakdown.base} AP
            </div>
            {breakdown.speedBonus > 0 && (
                <div className="aa-damage-num aa-damage-num--speed" style={{ top: '22%', right: '20%' }}>
                    ⚡ +{breakdown.speedBonus}
                </div>
            )}
            {breakdown.comboBonus > 0 && (
                <div className="aa-damage-num aa-damage-num--combo" style={{ top: '15%', right: '30%' }}>
                    🔥 +{breakdown.comboBonus}
                </div>
            )}
        </>
    );
}
