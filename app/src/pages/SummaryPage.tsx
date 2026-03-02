import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Paragraph.css'; // reuse paragraph styling

const E_EXERCISES = [
    { id: 'E1', par: '§8.1', desc: 'Gelijksoortige termen herkennen' },
    { id: 'E2', par: '§8.1', desc: 'Formules vereenvoudigen' },
    { id: 'E3', par: '§8.1', desc: 'Formules zo kort mogelijk schrijven' },
    { id: 'E4', par: '§8.2', desc: 'Balans eenvoudig (knikkers)' },
    { id: 'E5', par: '§8.3', desc: 'Balans twee kanten' },
    { id: 'E6', par: '§8.3', desc: 'Balans meerstaps' },
    { id: 'E7', par: '§8.4', desc: 'Kladblaadje invullen (tussenstappen)' },
    { id: 'E8', par: '§8.4', desc: 'Vergelijkingen oplossen + controle' },
    { id: 'E9', par: '§8.5', desc: 'Omslagpunt aflezen (grafiek)' },
    { id: 'E10', par: '§8.5', desc: 'Omslagpunt berekenen (vergelijking)' },
    { id: 'E11', par: '§8.5', desc: 'Luchtballonnen omslagpunt (context)' },
];

export default function SummaryPage() {
    const navigate = useNavigate();
    const [pdfError, setPdfError] = useState(false);

    function handleOpenPdf() {
        // Try opening the PDF. If it fails (404), show message.
        const url = '/slides/samenvatting.pdf';
        fetch(url, { method: 'HEAD' })
            .then((res) => {
                if (res.ok) {
                    window.open(url, '_blank');
                } else {
                    setPdfError(true);
                }
            })
            .catch(() => setPdfError(true));
    }

    return (
        <div className="par-page">
            <header className="par-header">
                <button onClick={() => navigate('/')} className="par-back">← Terug</button>
                <div className="par-header-title">
                    <h1>Samenvatting <span className="par-header-sub">Leerdoelen & extra oefenen</span></h1>
                </div>
            </header>

            <main className="par-main">
                {/* PDF link */}
                <section className="par-section">
                    <h2 className="par-section-title">Samenvatting slides</h2>
                    <button onClick={handleOpenPdf} className="par-slide-link" style={{ cursor: 'pointer', border: '1px solid rgba(148,163,184,0.15)' }}>
                        📄 Open samenvatting (PDF)
                    </button>
                    {pdfError && (
                        <p style={{ marginTop: '0.75rem', color: '#f59e0b', fontSize: '0.875rem' }}>
                            ⚠️ Samenvatting PDF ontbreekt nog. Vraag je docent om het bestand toe te voegen.
                        </p>
                    )}
                </section>

                {/* E-exercises list */}
                <section className="par-section">
                    <h2 className="par-section-title">Extra oefeningen (E1–E11)</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {E_EXERCISES.map((ex) => (
                            <div
                                key={ex.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(30,41,59,0.5)',
                                    border: '1px solid rgba(148,163,184,0.1)',
                                    borderRadius: '10px',
                                }}
                            >
                                <span style={{ fontWeight: 700, color: '#60a5fa', minWidth: '2.5rem' }}>
                                    {ex.id}
                                </span>
                                <span style={{ color: '#64748b', fontSize: '0.8rem', minWidth: '3rem' }}>
                                    {ex.par}
                                </span>
                                <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                                    {ex.desc}
                                </span>
                                <span
                                    style={{
                                        marginLeft: 'auto',
                                        fontSize: '0.7rem',
                                        color: '#64748b',
                                        background: 'rgba(148,163,184,0.1)',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '8px',
                                    }}
                                >
                                    Binnenkort
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
