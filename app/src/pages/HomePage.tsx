import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import GameHeader from '../components/GameHeader';
import {
    CHAPTER_8_FLOW,
    getChapter8Progress,
    isStepUnlocked,
    isStepCompleted,
    type Chapter8Progress,
    type FlowStepId,
} from '../services/chapter8Flow';
import {
    BOARD_IDS,
    getLeaderboard,
    type BoardId,
    type LeaderboardEntry,
} from '../services/unifiedLeaderboardService';

/* ── medal config ─────────────────────────────────────── */
const MEDALS = ['🥇', '🥈', '🥉'] as const;
const MEDAL_COLORS = [
    { bg: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))', border: 'rgba(255,215,0,0.35)', text: '#c8a600' },
    { bg: 'linear-gradient(135deg, rgba(192,192,192,0.15), rgba(192,192,192,0.05))', border: 'rgba(192,192,192,0.35)', text: '#808080' },
    { bg: 'linear-gradient(135deg, rgba(205,127,50,0.15), rgba(205,127,50,0.05))', border: 'rgba(205,127,50,0.35)', text: '#8b5e3c' },
] as const;

/* ── step → board mapping ─────────────────────────────── */
const STEP_BOARDS: Partial<Record<FlowStepId, { boardId: BoardId; icon: string; label: string }[]>> = {
    '8_1_intro': [
        { boardId: BOARD_IDS.TERMEN_QUEST, icon: '🎮', label: 'Termen Quest' },
        { boardId: BOARD_IDS.SPEED_TEST, icon: '⚡', label: 'Speed Test' },
    ],
    'balance': [
        { boardId: BOARD_IDS.BALANCE_CHALLENGE, icon: '⚖️', label: 'Balans' },
    ],
    '8_2_blitz': [
        { boardId: BOARD_IDS.BALANS_BLITZ, icon: '⚡', label: 'Blitz' },
    ],
    '8_3': [
        { boardId: BOARD_IDS.TERMTRIS, icon: '🧱', label: 'Termtris' },
    ],
};

/* ── Top3 mini podium ─────────────────────────────────── */
function Top3Podium({ label, icon, entries }: { label: string; icon: string; entries: LeaderboardEntry[] }) {
    if (entries.length === 0) return null;
    return (
        <div className="y-podium">
            <div className="y-podium-header">
                <span className="y-podium-icon">{icon}</span>
                <span className="y-podium-label">{label}</span>
            </div>
            <div className="y-podium-list">
                {entries.slice(0, 3).map((entry, i) => (
                    <div
                        key={entry.uid}
                        className="y-podium-row"
                        style={{
                            background: MEDAL_COLORS[i].bg,
                            borderColor: MEDAL_COLORS[i].border,
                        }}
                    >
                        <span className="y-podium-medal">{MEDALS[i]}</span>
                        <span className="y-podium-name" style={{ color: MEDAL_COLORS[i].text }}>
                            {entry.firstName || 'Anoniem'}
                        </span>
                        <span className="y-podium-score">{entry.bestScore}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function HomePage() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();
    const [progress, setProgress] = useState<Chapter8Progress | null>(null);

    // Top 3 per board
    const [topScores, setTopScores] = useState<Partial<Record<BoardId, LeaderboardEntry[]>>>({});

    useEffect(() => {
        if (!profile) return;
        getChapter8Progress(profile.uid).then(setProgress).catch(console.warn);

        // Load top 3 for each board
        if (profile.classId) {
            const boards = Object.values(BOARD_IDS);
            Promise.all(
                boards.map((boardId) =>
                    getLeaderboard(boardId, profile.classId, 3)
                        .then((entries) => ({ boardId, entries }))
                        .catch(() => ({ boardId, entries: [] as LeaderboardEntry[] }))
                ),
            ).then((results) => {
                const map: Partial<Record<BoardId, LeaderboardEntry[]>> = {};
                for (const { boardId, entries } of results) {
                    map[boardId] = entries;
                }
                setTopScores(map);
            });
        }
    }, [profile]);

    // Count completed steps for XP-like display
    const completedCount = progress
        ? CHAPTER_8_FLOW.filter((s) => isStepCompleted(s.id, progress)).length
        : 0;

    return (
        <div className="y-page">
            {/* Game HUD header */}
            <GameHeader
                completedCount={completedCount}
                totalSteps={CHAPTER_8_FLOW.length}
            />

            {/* banner */}
            <div className="y-banner">
                <h1>Welkom, {profile?.firstName}! 👋</h1>
                <p>Hoofdstuk 8 — Vergelijkingen oplossen met de balansmethode</p>
            </div>

            {/* XP progress */}
            <div className="y-main">
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--y-muted)' }}>
                    <span>Voortgang Hoofdstuk 8</span>
                    <span>{completedCount}/{CHAPTER_8_FLOW.length}</span>
                </div>
                <div className="y-progress" style={{ marginBottom: '2rem' }}>
                    <div className="y-progress-fill" style={{ width: `${(completedCount / CHAPTER_8_FLOW.length) * 100}%` }} />
                </div>

                <div className="y-section-label">Leerpad</div>

                {/* roadmap */}
                <div className="y-roadmap">
                    {CHAPTER_8_FLOW.map((step, idx) => {
                        const unlocked = devMode || (progress ? isStepUnlocked(step.id, progress) : false);
                        const completed = unlocked && (progress ? isStepCompleted(step.id, progress) : false);
                        const active = unlocked && !completed;
                        const boards = STEP_BOARDS[step.id];

                        return (
                            <div
                                key={step.id}
                                className={`y-roadmap-step ${completed ? 'y-roadmap-step--done' :
                                    active ? 'y-roadmap-step--active' :
                                        'y-roadmap-step--locked'
                                    }`}
                            >
                                {idx > 0 && (
                                    <div className={`y-roadmap-connector ${completed ? 'y-roadmap-connector--done' : ''}`} />
                                )}

                                <div className="y-roadmap-inner">
                                    <div className="y-roadmap-icon">
                                        {completed ? '✅' : unlocked ? step.icon : '🔒'}
                                    </div>
                                    <div className="y-roadmap-info">
                                        <div className="y-roadmap-title">{step.title}</div>
                                        <div className="y-roadmap-sub">{step.subtitle}</div>

                                        {/* Top 3 podiums per game */}
                                        {boards && boards.length > 0 && (
                                            <div className="y-roadmap-podiums">
                                                {boards.map(({ boardId, icon, label }) => (
                                                    <Top3Podium
                                                        key={boardId}
                                                        label={label}
                                                        icon={icon}
                                                        entries={topScores[boardId] ?? []}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="y-roadmap-action">
                                        {completed ? (
                                            <button
                                                className="y-roadmap-btn"
                                                style={{ background: 'linear-gradient(135deg, var(--y-success), #55efc4)', boxShadow: '0 3px 12px rgba(0,184,148,0.2)' }}
                                                onClick={() => navigate(step.route)}
                                            >
                                                ✓ Herspeel
                                            </button>
                                        ) : active ? (
                                            <button
                                                className="y-roadmap-btn"
                                                onClick={() => navigate(step.route)}
                                            >
                                                {idx === 0 ? 'Start' : 'Verder'} →
                                            </button>
                                        ) : devMode ? (
                                            <button
                                                className="y-roadmap-btn"
                                                style={{ opacity: 0.7 }}
                                                onClick={() => navigate(step.route)}
                                            >
                                                Open (DEV)
                                            </button>
                                        ) : (
                                            <span className="y-badge y-badge--locked">🔒 Vergrendeld</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* summary card */}
                <div className="y-section-label" style={{ marginTop: '2rem' }}>Extra</div>
                <button
                    className="y-card"
                    onClick={() => navigate('/summary')}
                    style={{
                        width: '100%',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        borderTop: '3px solid var(--y-blue)',
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>📝</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: 'var(--y-text)' }}>Samenvatting</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--y-muted)' }}>Extra oefenen (E-opgaven)</div>
                    </div>
                    <span className="y-badge y-badge--active">Beschikbaar</span>
                </button>
            </div>
        </div>
    );
}
