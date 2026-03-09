import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    PARAGRAPHS,
    getProgress,
    touchProgress,
    saveSlidesOpened,
    markCompleted,
    type ParagraphId,
    type ParagraphProgress,
} from '../services/progress';
import './Paragraph.css';
import { markSection8_1Completed } from '../services/chapter8Flow';

const ROUTE_INFO: Record<string, { label: string; color: string; emoji: string }> = {
    O: { label: 'Ondersteunend', color: '#60a5fa', emoji: '🔵' },
    D: { label: 'Doorlopend', color: '#34d399', emoji: '🟢' },
    U: { label: 'Uitdagend', color: '#a78bfa', emoji: '🟣' },
};

export default function ParagraphPage() {
    const { id } = useParams<{ id: string }>();
    const { profile } = useAuth();
    const navigate = useNavigate();

    const paragraphId = id as ParagraphId;
    const meta = PARAGRAPHS.find((p) => p.id === paragraphId);

    const [progress, setProgress] = useState<ParagraphProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    /* touch on open + load progress */
    useEffect(() => {
        if (!profile) return;
        (async () => {
            try {
                await touchProgress(profile.uid, paragraphId);
                const p = await getProgress(profile.uid, paragraphId);
                setProgress(p);
            } catch (err) {
                console.warn('Firestore progress error:', err);
                // Continue with null progress — page still renders
            } finally {
                setLoading(false);
            }
        })();
    }, [profile, paragraphId]);

    if (!meta) {
        return (
            <div className="par-page">
                <div className="par-error">Paragraaf niet gevonden.</div>
            </div>
        );
    }

    /* ── slides gate ─────────────────────────────────────── */
    const slidesOpened = progress?.slidesOpened === true;

    async function handleSlidesClick() {
        // Open slides in new tab
        window.open(`/slides/${paragraphId}.pdf`, '_blank');

        // Mark slides as opened if not already
        if (!slidesOpened && profile) {
            setSaving(true);
            try {
                await saveSlidesOpened(profile.uid, paragraphId);
                setProgress((prev) => prev ? { ...prev, slidesOpened: true } : prev);
            } catch (err) {
                console.warn('Could not save slides opened:', err);
            } finally {
                setSaving(false);
            }
        }
    }

    async function handleComplete() {
        if (!profile) return;
        setSaving(true);
        await markCompleted(profile.uid, paragraphId);
        // Update chapter 8 flow gating when §8.1 is marked completed
        if (paragraphId === '8_1') {
            await markSection8_1Completed(profile.uid).catch(console.warn);
        }
        setProgress((prev) => prev ? { ...prev, status: 'completed' } : prev);
        setSaving(false);
    }

    /* ── route info (read-only) ──────────────────────────── */
    const currentRoute = progress?.adaptiveSnapshot?.currentRoute || 'D';
    const routeInfo = ROUTE_INFO[currentRoute] || ROUTE_INFO['D'];

    /* ── practice URL (no manual route param — adaptive handles it) */
    function getPracticeUrl(): string {
        if (paragraphId === '8_1') return `/practice/8_1`;
        if (paragraphId === '8_2') return `/practice/8_2`;
        return '';
    }

    const hasPractice = paragraphId === '8_1' || paragraphId === '8_2';

    return (
        <div className="par-page">
            {/* header */}
            <header className="par-header">
                <button onClick={() => navigate('/')} className="par-back">← Terug</button>
                <div className="par-header-title">
                    <h1>{meta.title} <span className="par-header-sub">{meta.subtitle}</span></h1>
                </div>
                {progress?.status === 'completed' && (
                    <span className="par-badge par-badge--done">✓ Klaar</span>
                )}
            </header>

            {loading ? (
                <div className="par-loading">Laden...</div>
            ) : (
                <main className="par-main">
                    {/* slides section */}
                    <section className="par-section">
                        <h2 className="par-section-title">Slides</h2>
                        {slidesOpened ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{
                                    color: '#34d399',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                }}>
                                    ✅ Je hebt de slides al bekeken
                                </span>
                                <button
                                    onClick={handleSlidesClick}
                                    className="par-slide-link"
                                    style={{ fontSize: '0.85rem', opacity: 0.7 }}
                                >
                                    Nog eens bekijken
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleSlidesClick}
                                    className="par-slide-link"
                                    disabled={saving}
                                >
                                    📄 Open slides {meta.title} (PDF)
                                </button>
                                <p style={{
                                    color: '#fbbf24',
                                    fontSize: '0.85rem',
                                    marginTop: '0.5rem',
                                    opacity: 0.9,
                                }}>
                                    ⚠ Bekijk eerst de slides om de opdrachten te ontgrendelen.
                                </p>
                            </>
                        )}
                    </section>

                    {/* route info (read-only) */}
                    {hasPractice && slidesOpened && (
                        <section className="par-section">
                            <h2 className="par-section-title">Leerroute</h2>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <span style={{ fontSize: '1.3rem' }}>{routeInfo.emoji}</span>
                                <div>
                                    <div style={{
                                        fontWeight: 600,
                                        color: routeInfo.color,
                                    }}>
                                        {routeInfo.label}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: '#94a3b8',
                                    }}>
                                        {progress?.adaptiveSnapshot
                                            ? 'Je gaat verder waar je gebleven was'
                                            : 'De app past je route automatisch aan'}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* exercises / practice */}
                    <section className="par-section">
                        <h2 className="par-section-title">Opgaven</h2>
                        {hasPractice ? (
                            <>
                                <p className="par-placeholder" style={{ marginBottom: '1rem' }}>
                                    {paragraphId === '8_1'
                                        ? 'Oefen met het samenvoegen van gelijksoortige termen.'
                                        : 'Oefen met het oplossen van vergelijkingen (balansmethode).'}
                                    {progress?.completedExercises?.length
                                        ? ` Je hebt al ${progress.completedExercises.length} opgave(n) goed beantwoord.`
                                        : ''}
                                </p>
                                {slidesOpened ? (
                                    <button
                                        className="par-complete-btn"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                            marginTop: 0,
                                        }}
                                        onClick={() => navigate(getPracticeUrl())}
                                    >
                                        ▶ Start oefenen
                                    </button>
                                ) : (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(251, 191, 36, 0.06)',
                                        border: '1px solid rgba(251, 191, 36, 0.15)',
                                        borderRadius: '0.75rem',
                                        color: '#fbbf24',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                                        <span>Bekijk eerst de slides hierboven om de opdrachten te ontgrendelen.</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="par-placeholder">
                                Opgaven voor deze paragraaf worden binnenkort toegevoegd.
                            </p>
                        )}
                    </section>

                    {/* mark completed */}
                    {progress?.status !== 'completed' && (
                        <button
                            className="par-complete-btn"
                            onClick={handleComplete}
                            disabled={saving}
                        >
                            {saving ? 'Opslaan...' : '✓ Markeer als klaar'}
                        </button>
                    )}
                </main>
            )}
        </div>
    );
}

