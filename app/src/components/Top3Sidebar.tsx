/**
 * Top3Sidebar — Reusable leaderboard component for all game pages.
 *
 * Variants:
 *   - 'compact'  → narrow sidebar (200px), top 3 only — for during gameplay
 *   - 'full'     → wider card, top 10 — for ready/ended screens
 *   - 'preview'  → top 3, standalone card — for ready screens
 *
 * Auto-subscribes to realtime Firestore leaderboard via unified service.
 */

import { useState, useEffect } from 'react';
import {
    subscribeLeaderboard,
    type BoardId,
    type LeaderboardEntry,
} from '../services/unifiedLeaderboardService';
import './Top3Sidebar.css';

interface Top3SidebarProps {
    boardId: BoardId;
    classId: string | null;
    currentUid?: string;
    currentScore?: number;
    variant?: 'compact' | 'full' | 'preview';
    /** Override medal labels, e.g. 'XP' instead of default */
    scoreLabel?: string;
    /** External entries (if already subscribed elsewhere) — skips internal subscription */
    entries?: LeaderboardEntry[];
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Top3Sidebar({
    boardId,
    classId,
    currentUid,
    currentScore,
    variant = 'compact',
    scoreLabel,
    entries: externalEntries,
}: Top3SidebarProps) {
    const [internalEntries, setInternalEntries] = useState<LeaderboardEntry[]>([]);

    const entries = externalEntries ?? internalEntries;
    const maxEntries = variant === 'full' ? 10 : 3;
    const displayEntries = entries.slice(0, maxEntries);

    /* ── subscribe if no external entries ─────────────── */
    useEffect(() => {
        if (externalEntries) return;
        const unsub = subscribeLeaderboard(
            boardId,
            classId,
            variant === 'full' ? 10 : 5,
            setInternalEntries,
        );
        return () => unsub();
    }, [boardId, classId, variant, externalEntries]);

    if (displayEntries.length === 0) return null;

    /* ── find player rank ─────────────────────────────── */
    const myRank = currentUid
        ? entries.findIndex((e) => e.uid === currentUid) + 1
        : 0;

    const isCompact = variant === 'compact';
    const title = variant === 'full' ? 'Klas Top 10' : 'Klas Top 3';

    return (
        <div className={`lb-sidebar lb-sidebar--${variant}`}>
            <div className="lb-sidebar-card">
                <div className="lb-sidebar-title">
                    {isCompact ? '🏆 Top 3' : `🏆 ${title}`}
                </div>

                {displayEntries.map((e, i) => (
                    <div
                        key={e.uid}
                        className={`lb-sidebar-row ${e.uid === currentUid ? 'lb-sidebar-row--me' : ''}`}
                    >
                        <span className="lb-sidebar-rank">
                            {i < 3 ? MEDALS[i] : `${i + 1}.`}
                        </span>
                        <span className="lb-sidebar-name">{e.firstName}</span>
                        <span className="lb-sidebar-score">
                            {e.bestScore}
                            {scoreLabel && <span className="lb-sidebar-unit"> {scoreLabel}</span>}
                        </span>
                    </div>
                ))}

                {/* Show player position if not in top list */}
                {myRank > maxEntries && currentUid && (
                    <div className="lb-sidebar-row lb-sidebar-row--me lb-sidebar-row--below">
                        <span className="lb-sidebar-rank">#{myRank}</span>
                        <span className="lb-sidebar-name">Jij</span>
                        <span className="lb-sidebar-score">
                            {currentScore ?? entries.find((e) => e.uid === currentUid)?.bestScore ?? '—'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
