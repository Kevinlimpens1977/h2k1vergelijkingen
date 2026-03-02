/**
 * TERMTRIS HUD — Heads-Up Display
 *
 * Shows: timer, score, streak, and streak bonuses during gameplay.
 * Compact layout that fits in the right panel.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Timer */}
            <div className="y-card" style={{
                padding: '0.75rem 1rem',
                borderTop: `3px solid ${isUrgent ? 'var(--y-danger)' : 'var(--y-cyan)'}`,
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                    color: 'var(--y-muted)',
                    marginBottom: '0.25rem',
                }}>
                    Tijd
                </div>
                <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                    color: isUrgent ? 'var(--y-danger)' : 'var(--y-text)',
                    lineHeight: 1,
                    animation: isUrgent ? 'termtris-pulse 1s ease infinite' : undefined,
                }}>
                    {timerDisplay}
                </div>
            </div>

            {/* Score */}
            <div className="y-card" style={{
                padding: '0.75rem 1rem',
                borderTop: '3px solid var(--y-primary)',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                    color: 'var(--y-muted)',
                    marginBottom: '0.25rem',
                }}>
                    Score
                </div>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--y-primary)',
                    lineHeight: 1,
                }}>
                    {score}
                </div>
            </div>

            {/* Stats row */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
            }}>
                <div className="y-card" style={{
                    flex: 1,
                    padding: '0.5rem',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--y-success)' }}>
                        {correctCount}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--y-muted)', textTransform: 'uppercase' as const, fontWeight: 700 }}>
                        Goed
                    </div>
                </div>
                <div className="y-card" style={{
                    flex: 1,
                    padding: '0.5rem',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#e17055' }}>
                        {wrongCount}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--y-muted)', textTransform: 'uppercase' as const, fontWeight: 700 }}>
                        Fout
                    </div>
                </div>
            </div>

            {/* Streak */}
            {streak > 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '0.45rem 0.75rem',
                    background: 'linear-gradient(135deg, rgba(253,203,110,0.12), rgba(225,112,85,0.08))',
                    borderRadius: 10,
                    border: '1px solid rgba(253,203,110,0.25)',
                    animation: 'termtris-fadeIn 0.25s ease',
                }}>
                    <span style={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: '#e17055',
                    }}>
                        🔥 {streak} op rij!
                    </span>
                </div>
            )}

            {/* Streak banner */}
            {streakBanner && (
                <div style={{
                    textAlign: 'center',
                    padding: '0.6rem 0.75rem',
                    background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
                    borderRadius: 12,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
                    animation: 'termtris-bounceIn 0.4s ease',
                }}>
                    {streakBanner}
                </div>
            )}
        </div>
    );
}
