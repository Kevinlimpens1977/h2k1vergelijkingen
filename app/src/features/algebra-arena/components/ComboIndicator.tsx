/**
 * ComboIndicator — "🔥 3x COMBO!" overlay
 */
import { useEffect, useState } from 'react';

interface ComboIndicatorProps {
    combo: number;
}

export default function ComboIndicator({ combo }: ComboIndicatorProps) {
    const [showBurst, setShowBurst] = useState(false);

    useEffect(() => {
        if (combo >= 3) {
            setShowBurst(true);
            const timer = setTimeout(() => setShowBurst(false), 800);
            return () => clearTimeout(timer);
        }
    }, [combo]);

    if (!showBurst) return null;

    return (
        <div className="aa-combo-overlay">
            <div className="aa-combo-text">
                🔥 {combo}× COMBO!
            </div>
        </div>
    );
}
