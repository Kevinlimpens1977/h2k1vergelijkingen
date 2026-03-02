import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    PARAGRAPHS,
    getProgress,
    touchProgress,
    saveRoute,
    markCompleted,
    type ParagraphId,
    type ParagraphProgress,
    type RouteChoice,
} from '../services/progress';
import './Paragraph.css';
import { markSection8_1Completed } from '../services/chapter8Flow';

const ROUTE_LABELS: { value: RouteChoice; label: string; desc: string }[] = [
    { value: 'O', label: 'Ondersteunend', desc: 'Extra begeleiding' },
    { value: 'D', label: 'Doorlopend', desc: 'Standaard route' },
    { value: 'U', label: 'Uitdagend', desc: 'Extra uitdaging' },
];

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

    async function handleRouteChange(route: RouteChoice) {
        if (!profile) return;
        setSaving(true);
        await saveRoute(profile.uid, paragraphId, route);
        setProgress((prev) => prev ? { ...prev, route } : prev);
        setSaving(false);
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

    const slideUrl = `/slides/${paragraphId}.pdf`;

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
                    {/* slides link */}
                    <section className="par-section">
                        <h2 className="par-section-title">Slides</h2>
                        <a
                            href={slideUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="par-slide-link"
                        >
                            📄 Open slides {meta.title} (PDF)
                        </a>
                    </section>

                    {/* route selector */}
                    <section className="par-section">
                        <h2 className="par-section-title">Kies je leerroute</h2>
                        <div className="par-route-grid">
                            {ROUTE_LABELS.map((r) => (
                                <button
                                    key={r.value}
                                    className={`par-route-card ${progress?.route === r.value ? 'par-route-card--active' : ''}`}
                                    onClick={() => handleRouteChange(r.value)}
                                    disabled={saving}
                                >
                                    <span className="par-route-card-label">{r.label}</span>
                                    <span className="par-route-card-desc">{r.desc}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* exercises / practice */}
                    <section className="par-section">
                        <h2 className="par-section-title">Opgaven</h2>
                        {paragraphId === '8_1' ? (
                            <>
                                <p className="par-placeholder" style={{ marginBottom: '1rem' }}>
                                    Oefen met het samenvoegen van gelijksoortige termen.
                                    {progress?.completedExercises?.length
                                        ? ` Je hebt al ${progress.completedExercises.length} opgave(n) goed beantwoord.`
                                        : ''}
                                </p>
                                {progress?.route ? (
                                    <button
                                        className="par-complete-btn"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                            marginTop: 0,
                                        }}
                                        onClick={() => navigate(`/practice/8_1?route=${progress.route}`)}
                                    >
                                        ▶ Start oefenen (Route {progress.route})
                                    </button>
                                ) : (
                                    <p className="par-placeholder" style={{
                                        color: '#fbbf24',
                                        background: 'rgba(251, 191, 36, 0.06)',
                                        borderColor: 'rgba(251, 191, 36, 0.15)',
                                    }}>
                                        ⚠ Kies eerst een leerroute hierboven om te kunnen oefenen.
                                    </p>
                                )}
                            </>
                        ) : paragraphId === '8_2' ? (
                            <>
                                <p className="par-placeholder" style={{ marginBottom: '1rem' }}>
                                    Oefen met het oplossen van vergelijkingen (balansmethode).
                                    {progress?.completedExercises?.length
                                        ? ` Je hebt al ${progress.completedExercises.length} opgave(n) goed beantwoord.`
                                        : ''}
                                </p>
                                {progress?.route ? (
                                    <button
                                        className="par-complete-btn"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                            marginTop: 0,
                                        }}
                                        onClick={() => navigate(`/practice/8_2?route=${progress.route}`)}
                                    >
                                        ▶ Start oefenen (Route {progress.route})
                                    </button>
                                ) : (
                                    <p className="par-placeholder" style={{
                                        color: '#fbbf24',
                                        background: 'rgba(251, 191, 36, 0.06)',
                                        borderColor: 'rgba(251, 191, 36, 0.15)',
                                    }}>
                                        ⚠ Kies eerst een leerroute hierboven om te kunnen oefenen.
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="par-placeholder">
                                {progress?.route
                                    ? `Opgaven voor route ${progress.route} worden binnenkort toegevoegd.`
                                    : 'Kies eerst een leerroute hierboven.'}
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
