/**
 * GameHeader — Youth-friendly "Game HUD" for the app.
 *
 * Used on the HomePage for the full experience.
 * Sub-pages (Blitz, Termtris, etc.) use their own mini topbars.
 *
 * Layout:
 *   LEFT:   Logo badge + Primary title + subtitle
 *   CENTER: Chapter progress mini bar
 *   RIGHT:  Level chip, DEV chip, User pill, Logout ghost button
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import logoSvg from '../assets/brand/logo-2k.svg';

interface GameHeaderProps {
    /** Number of completed steps in the chapter flow */
    completedCount: number;
    /** Total number of steps in the chapter flow */
    totalSteps: number;
}

export default function GameHeader({ completedCount, totalSteps }: GameHeaderProps) {
    const { profile, logout } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();

    const level = completedCount + 1;
    const progressPct = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
    const initial = profile?.firstName?.charAt(0)?.toUpperCase() || '?';

    return (
        <header style={styles.header}>
            {/* ─── LEFT: Logo + Title ─── */}
            <div
                style={styles.left}
                onClick={() => navigate('/')}
                title="Vergelijkingen oplossen minigames klas 2"
            >
                <img src={logoSvg} alt="Logo" style={styles.logo} />
                <div style={styles.titleBlock}>
                    <span style={styles.primaryTitle}>
                        Vergelijkingen: Minigames 2K
                    </span>
                    <span style={styles.subtitle}>
                        Vergelijkingen oplossen minigames klas 2
                    </span>
                </div>
            </div>

            {/* ─── CENTER: Chapter progress mini bar ─── */}
            <div style={styles.center}>
                <span style={styles.chapterLabel}>
                    Hoofdstuk 8 • {completedCount}/{totalSteps}
                </span>
                <div style={styles.progressTrack}>
                    <div
                        style={{
                            ...styles.progressFill,
                            width: `${progressPct}%`,
                        }}
                    />
                </div>
            </div>

            {/* ─── RIGHT: Chips + User pill + Logout ─── */}
            <div style={styles.right}>
                {/* Level chip */}
                <span style={styles.chip} title={`Level ${level}`}>
                    <span style={styles.chipIcon}>⭐</span>
                    Lv {level}
                </span>

                {/* DEV chip */}
                {devMode && (
                    <span style={styles.devChip}>DEV</span>
                )}

                {/* User pill */}
                <div
                    style={styles.userPill}
                    title={`${profile?.firstName} #${profile?.studentNumber}`}
                >
                    <div style={styles.avatar}>{initial}</div>
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>{profile?.firstName}</span>
                        <span style={styles.userNumber}>#{profile?.studentNumber}</span>
                    </div>
                </div>

                {/* Logout ghost button */}
                <button
                    onClick={logout}
                    style={styles.logoutBtn}
                    onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--y-primary)';
                        (e.target as HTMLElement).style.borderColor = 'var(--y-primary)';
                    }}
                    onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--y-muted)';
                        (e.target as HTMLElement).style.borderColor = 'var(--y-outline)';
                    }}
                >
                    Uitloggen
                </button>
            </div>
        </header>
    );
}

/* ── Inline styles ─────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.6rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,244,255,0.95))',
        borderBottom: '2px solid var(--y-outline)',
        boxShadow: '0 2px 16px rgba(30, 41, 59, 0.06)',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(8px)',
        fontFamily: "'Inter', system-ui, sans-serif",
    },

    /* LEFT */
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        cursor: 'pointer',
        flexShrink: 0,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        boxShadow: '0 2px 10px rgba(108, 92, 231, 0.25)',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
    },
    titleBlock: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 0,
    },
    primaryTitle: {
        fontSize: '0.95rem',
        fontWeight: 800,
        color: 'var(--y-text)',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
    },
    subtitle: {
        fontSize: '0.62rem',
        fontWeight: 500,
        color: 'var(--y-muted)',
        lineHeight: 1.2,
        letterSpacing: '0.01em',
    },

    /* CENTER */
    center: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '0.2rem',
        flex: '0 1 auto',
        minWidth: 120,
    },
    chapterLabel: {
        fontSize: '0.65rem',
        fontWeight: 700,
        color: 'var(--y-muted)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap' as const,
    },
    progressTrack: {
        width: 120,
        height: 6,
        background: 'rgba(108, 92, 231, 0.08)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, var(--y-primary), var(--y-cyan))',
        borderRadius: 3,
        transition: 'width 0.4s ease',
    },

    /* RIGHT */
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
    },
    chip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.6rem',
        borderRadius: 20,
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--y-primary)',
        background: 'rgba(108, 92, 231, 0.06)',
        border: '1.5px solid rgba(108, 92, 231, 0.15)',
        boxShadow: '0 1px 4px rgba(108, 92, 231, 0.08)',
        cursor: 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        whiteSpace: 'nowrap' as const,
    },
    chipIcon: {
        fontSize: '0.8rem',
        lineHeight: 1,
    },
    devChip: {
        fontSize: '0.6rem',
        fontWeight: 800,
        padding: '0.15rem 0.45rem',
        borderRadius: 6,
        background: 'linear-gradient(135deg, #e17055, #d63031)',
        color: '#fff',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
    },
    userPill: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.2rem 0.6rem 0.2rem 0.2rem',
        borderRadius: 20,
        background: 'rgba(108, 92, 231, 0.04)',
        border: '1.5px solid rgba(108, 92, 231, 0.12)',
        cursor: 'default',
        transition: 'box-shadow 150ms ease',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--y-primary), var(--y-primary2, #a855f7))',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.78rem',
        fontWeight: 800,
        flexShrink: 0,
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        lineHeight: 1.15,
    },
    userName: {
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--y-text)',
    },
    userNumber: {
        fontSize: '0.62rem',
        fontWeight: 500,
        color: 'var(--y-muted)',
    },
    logoutBtn: {
        padding: '0.3rem 0.7rem',
        borderRadius: 8,
        fontSize: '0.72rem',
        fontWeight: 600,
        cursor: 'pointer',
        border: '1px solid var(--y-outline)',
        background: 'transparent',
        color: 'var(--y-muted)',
        transition: 'color 150ms ease, border-color 150ms ease, transform 150ms ease',
        whiteSpace: 'nowrap' as const,
        fontFamily: 'inherit',
    },
};
