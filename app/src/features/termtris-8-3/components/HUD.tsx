/**
 * TERMTRIS HUD — Heads-Up Display (Arcade themed)
 *
 * Shows: timer, score, streak, and streak bonuses during gameplay.
 * Now uses Termtris.css classes for dark arcade styling.
 */

interface HUDProps {
    timeLeft: number;
    score: number;
    streak: number;
    correctCount: number;
    wrongCount: number;
    streakBanner: string | null;
}

export default function HUD({ timeLeft, score, streak, correctCount, wrongCount, streakBanner }: HUDProps) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;
    const isUrgent = timeLeft <= 30;

    return (
        <div className="tt-hud">
            {/* Timer */}
            <div className="tt-hud-panel">
                <div className="tt-hud-label">Tijd</div>
                <div className={`tt-hud-timer ${isUrgent ? 'tt-hud-timer--danger' : ''}`}>
                    {timerDisplay}
                </div>
            </div>

            {/* Score */}
            <div className="tt-hud-panel">
                <div className="tt-hud-label">Score</div>
                <div className="tt-hud-score">{score}</div>
            </div>

            {/* Stats row */}
            <div className="tt-hud-stats-row">
                <div className="tt-hud-stat">
                    <div className="tt-hud-stat-value" style={{ color: '#00b894' }}>
                        {correctCount}
                    </div>
                    <div className="tt-hud-stat-label">Goed</div>
                </div>
                <div className="tt-hud-stat">
                    <div className="tt-hud-stat-value" style={{ color: '#f43f5e' }}>
                        {wrongCount}
                    </div>
                    <div className="tt-hud-stat-label">Fout</div>
                </div>
            </div>

            {/* Streak */}
            {streak > 0 && (
                <div className="tt-streak">
                    <span className="tt-streak-text">
                        🔥 {streak} op rij!
                    </span>
                </div>
            )}

            {/* Streak banner */}
            {streakBanner && (
                <div className="tt-streak-banner">
                    {streakBanner}
                </div>
            )}
        </div>
    );
}
