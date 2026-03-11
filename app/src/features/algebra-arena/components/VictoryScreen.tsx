/**
 * VictoryScreen — Final score, stars, personal best, leaderboard
 */
import type { RunScore } from '../engine/scoreEngine';

interface VictoryScreenProps {
    score: RunScore;
    onReplay: () => void;
    onExit: () => void;
}

export default function VictoryScreen({ score, onReplay, onExit }: VictoryScreenProps) {
    const minutes = Math.floor(score.totalTimeMs / 60000);
    const seconds = Math.floor((score.totalTimeMs % 60000) / 1000);

    return (
        <div className="aa-overlay aa-victory">
            <div className="aa-overlay-emoji">🏆</div>
            <div className="aa-overlay-title">VICTORIE!</div>
            <div className="aa-overlay-subtitle">
                Je hebt de Algebra Arena veroverd!
            </div>

            {/* Stars */}
            <div className="aa-stars">
                {[1, 2, 3].map(s => (
                    <span key={s} className={`aa-star ${s > score.stars ? 'aa-star--empty' : ''}`}>⭐</span>
                ))}
            </div>

            {/* Stats grid */}
            <div className="aa-victory-stats">
                <div className="aa-stat-card">
                    <div className="aa-stat-value">{score.totalAP.toLocaleString()}</div>
                    <div className="aa-stat-label">Arena Punten</div>
                </div>
                <div className="aa-stat-card">
                    <div className="aa-stat-value">{Math.round(score.accuracy * 100)}%</div>
                    <div className="aa-stat-label">Nauwkeurigheid</div>
                </div>
                <div className="aa-stat-card">
                    <div className="aa-stat-value">🔥 {score.maxCombo}×</div>
                    <div className="aa-stat-label">Max Combo</div>
                </div>
                <div className="aa-stat-card">
                    <div className="aa-stat-value">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                    <div className="aa-stat-label">Totale Tijd</div>
                </div>
            </div>

            {score.perfectSolves > 0 && (
                <div className="aa-personal-best">
                    ✨ {score.perfectSolves} perfecte oplossingen!
                </div>
            )}

            {/* Actions */}
            <div className="aa-victory-actions">
                <button className="aa-victory-btn" onClick={onExit}>
                    ← Terug
                </button>
                <button className="aa-victory-btn aa-victory-btn--primary" onClick={onReplay}>
                    🔄 Opnieuw Spelen
                </button>
            </div>
        </div>
    );
}
