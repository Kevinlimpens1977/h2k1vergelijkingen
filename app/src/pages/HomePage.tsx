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
} from '../services/chapter8Flow';

export default function HomePage() {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();
    const [progress, setProgress] = useState<Chapter8Progress | null>(null);

    useEffect(() => {
        if (!profile) return;
        getChapter8Progress(profile.uid).then(setProgress).catch(console.warn);
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
