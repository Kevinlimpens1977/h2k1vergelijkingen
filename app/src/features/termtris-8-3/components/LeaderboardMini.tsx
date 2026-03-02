/**
 * TERMTRIS LeaderboardMini — Compact top-3 during play, top-10 at end.
 *
 * Reuses the same visual pattern as BalansBlitz leaderboard.
 */

import type { TermtrisLBEntry } from '../services/termtrisLeaderboardService';

interface LeaderboardMiniProps {
    entries: TermtrisLBEntry[];
    currentUid: string | undefined;
    currentScore?: number;
    mode: 'compact' | 'full';
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardMini({
    entries,
    currentUid,
    currentScore,
    mode,
}: LeaderboardMiniProps) {
    if (entries.length === 0) return null;

    const maxShow = mode === 'compact' ? 3 : 10;
    const shown = entries.slice(0, maxShow);
    const myRank = currentUid ? entries.findIndex((e) => e.uid === currentUid) + 1 : 0;

    return (
        <div className="y-card" style={{
            padding: mode === 'compact' ? '0.75rem' : '1rem',
            borderTop: '3px solid var(--y-amber)',
        }}>
            <div className="y-section-label" style={{ fontSize: mode === 'compact' ? '0.7rem' : '0.72rem' }}>
                {mode === 'compact' ? 'Top 3' : 'Klas Top 10'}
            </div>

            {shown.map((e, i) => (
                <div key={e.uid} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: mode === 'compact' ? '0.35rem' : '0.5rem',
                    padding: mode === 'compact' ? '0.25rem 0.4rem' : '0.35rem 0.5rem',
                    borderRadius: mode === 'compact' ? 6 : 8,
                    fontSize: mode === 'compact' ? '0.78rem' : '0.85rem',
                    background: e.uid === currentUid ? 'rgba(108,92,231,0.06)' : 'transparent',
                    fontWeight: e.uid === currentUid ? 800 : 500,
                }}>
                    <span style={{
                        width: mode === 'compact' ? '1.2rem' : '1.5rem',
                        textAlign: 'center',
                        fontWeight: 800,
                    }}>
                        {i < 3 ? MEDAL[i] : `${i + 1}.`}
                    </span>
                    <span style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        textAlign: 'left',
                    }}>
                        {e.firstName}
                    </span>
                    <span style={{
                        fontWeight: 700,
                        color: 'var(--y-primary)',
                    }}>
                        {e.bestScore}
                    </span>
                </div>
            ))}

            {/* Show current user if not in top shown */}
            {myRank > maxShow && currentScore !== undefined && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.4rem',
                    borderRadius: 6,
                    fontSize: mode === 'compact' ? '0.78rem' : '0.85rem',
                    borderTop: '1px dashed var(--y-outline)',
                    marginTop: '0.25rem',
                    paddingTop: '0.35rem',
                }}>
                    <span style={{ width: '1.2rem', textAlign: 'center', fontWeight: 800 }}>
                        #{myRank}
                    </span>
                    <span style={{ flex: 1, fontWeight: 600 }}>Jij</span>
                    <span style={{ fontWeight: 700, color: 'var(--y-primary)' }}>
                        {currentScore}
                    </span>
                </div>
            )}
        </div>
    );
}
