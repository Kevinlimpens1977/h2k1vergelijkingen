/**
 * Student Dashboard — v2
 *
 * Full-screen overlay accessible via DevMode banner.
 * Shows a sortable class overview table with signals + visual step dots.
 * Click on a student row → detail panel slides in with per-step checklist,
 * accuracy, game scores, and last activity.
 *
 * Fully synced with CHAPTER_8_FLOW (10 steps).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    fetchClassDashboard,
    fetchStudentDetail,
    computeSignal,
    getSignalInfo,
    STEP_CHAIN,
    TOTAL_STEPS,
    type StudentRow,
    type StudentDetail,
    type SignalType,
} from '../services/dashboardService';

/* ── types ───────────────────────────────────────────── */

type SortKey = 'studentNumber' | 'firstName' | 'stepIndex' | 'signal' | 'lastActivity';
type SortDir = 'asc' | 'desc';

interface Props {
    classId: string;
    onClose: () => void;
}

/* ── helpers ─────────────────────────────────────────── */

function formatTimeAgo(d: Date | null): string {
    if (!d) return '—';
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'zojuist';
    if (mins < 60) return `${mins}m geleden`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}u geleden`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'gisteren';
    return `${days}d geleden`;
}

function pct(n: number, total: number): number {
    return total > 0 ? Math.round((n / total) * 100) : 0;
}

/* ── component ───────────────────────────────────────── */

export default function StudentDashboard({ classId, onClose }: Props) {
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sort
    const [sortKey, setSortKey] = useState<SortKey>('studentNumber');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // Detail panel
    const [selectedUid, setSelectedUid] = useState<string | null>(null);
    const [detail, setDetail] = useState<StudentDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Search
    const [search, setSearch] = useState('');

    /* ── load data ────────────────────────────────────── */

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const rows = await fetchClassDashboard(classId);
            setStudents(rows);
        } catch (e) {
            setError('Kon data niet ophalen. Controleer de internetverbinding.');
            console.error('Dashboard fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    /* ── class averages ──────────────────────────────── */

    const classAvgStepIndex = useMemo(() => {
        if (students.length === 0) return 0;
        return students.reduce((sum, s) => sum + s.stepIndex, 0) / students.length;
    }, [students]);

    /* ── signals ─────────────────────────────────────── */

    const signalMap = useMemo(() => {
        const map: Record<string, SignalType> = {};
        students.forEach((s) => {
            map[s.uid] = computeSignal(s, classAvgStepIndex, null, 0);
        });
        return map;
    }, [students, classAvgStepIndex]);

    /* ── sort & filter ───────────────────────────────── */

    const signalPriority: Record<string, number> = { check: 0, top: 1, extra: 2, slow: 3 };

    const sorted = useMemo(() => {
        let filtered = students;
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            filtered = students.filter((s) =>
                s.firstName.toLowerCase().includes(q) ||
                s.studentNumber.toLowerCase().includes(q),
            );
        }

        return [...filtered].sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'studentNumber':
                    cmp = a.studentNumber.localeCompare(b.studentNumber);
                    break;
                case 'firstName':
                    cmp = a.firstName.localeCompare(b.firstName);
                    break;
                case 'stepIndex':
                    cmp = a.stepIndex - b.stepIndex;
                    break;
                case 'signal': {
                    const sa = signalMap[a.uid] ?? 'zzz';
                    const sb = signalMap[b.uid] ?? 'zzz';
                    cmp = (signalPriority[sa] ?? 99) - (signalPriority[sb] ?? 99);
                    break;
                }
                case 'lastActivity': {
                    const ta = a.lastActivity?.getTime() ?? 0;
                    const tb = b.lastActivity?.getTime() ?? 0;
                    cmp = ta - tb;
                    break;
                }
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [students, sortKey, sortDir, search, signalMap]);

    /* ── sort handler ────────────────────────────────── */

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir(key === 'lastActivity' ? 'desc' : 'asc');
        }
    };

    const sortArrow = (key: SortKey) =>
        sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

    /* ── detail panel ────────────────────────────────── */

    const openDetail = async (uid: string) => {
        setSelectedUid(uid);
        setDetail(null);
        setDetailLoading(true);
        try {
            const d = await fetchStudentDetail(uid);
            setDetail(d);
        } catch (e) {
            console.warn('Detail fetch error:', e);
        } finally {
            setDetailLoading(false);
        }
    };

    const selectedStudent = students.find((s) => s.uid === selectedUid);

    /* ── class stats ─────────────────────────────────── */

    const completedCount = students.filter((s) => s.stepIndex >= TOTAL_STEPS).length;
    const avgStep = classAvgStepIndex.toFixed(1);
    const avgPct = pct(classAvgStepIndex, TOTAL_STEPS);
    const checkCount = students.filter((s) => signalMap[s.uid] === 'check').length;
    const topCount = students.filter((s) => signalMap[s.uid] === 'top').length;

    /* ── step dot colors ─────────────────────────────── */

    function stepDotColor(done: boolean, _idx: number): string {
        if (done) return '#00b894';
        return 'rgba(255,255,255,0.08)';
    }

    /* ── styles ───────────────────────────────────────── */

    const S = {
        overlay: {
            position: 'fixed' as const,
            inset: 0,
            zIndex: 50000,
            background: '#1a1a2e',
            color: '#e0e0e0',
            fontFamily: "'Inter', system-ui, sans-serif",
            overflow: 'auto',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            borderBottom: '2px solid #6c5ce7',
        },
        title: {
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        closeBtn: {
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.15s',
        },
        kpiRow: {
            display: 'flex',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            flexWrap: 'wrap' as const,
        },
        kpiCard: (accent?: string) => ({
            flex: '1 1 120px',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${accent ? accent + '33' : 'rgba(255,255,255,0.08)'}`,
        }),
        kpiValue: {
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
        },
        kpiLabel: {
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
        },
        searchRow: {
            padding: '0 1.5rem 0.5rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
        },
        searchInput: {
            flex: 1,
            maxWidth: 300,
            padding: '0.45rem 0.8rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: '#e0e0e0',
            fontSize: '0.85rem',
            outline: 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '0.85rem',
        },
        th: {
            padding: '0.6rem 0.8rem',
            textAlign: 'left' as const,
            fontWeight: 700,
            fontSize: '0.72rem',
            color: '#94a3b8',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            userSelect: 'none' as const,
            whiteSpace: 'nowrap' as const,
        },
        td: {
            padding: '0.55rem 0.8rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
        },
        row: {
            cursor: 'pointer',
            transition: 'background 0.12s',
        },
        signalBadge: (bg: string, color: string) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: bg,
            color,
            whiteSpace: 'nowrap' as const,
        }),
        detailPanel: {
            position: 'fixed' as const,
            top: 0,
            right: 0,
            bottom: 0,
            width: '440px',
            maxWidth: '90vw',
            background: '#1e1e3a',
            borderLeft: '2px solid #6c5ce7',
            zIndex: 50001,
            overflow: 'auto',
            padding: '0',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
            animation: 'slideInRight 0.2s ease-out',
        },
        detailHeader: {
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #16213e, #0f3460)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        sectionTitle: {
            fontSize: '0.7rem',
            fontWeight: 800,
            color: '#6c5ce7',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            marginTop: '1.25rem',
            marginBottom: '0.5rem',
            paddingLeft: '1.25rem',
        },
        dataRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.4rem 1.25rem',
            fontSize: '0.82rem',
        },
        dataLabel: { color: '#94a3b8', fontWeight: 600 },
        dataValue: { color: '#fff', fontWeight: 700 },
    };

    /* ── render ───────────────────────────────────────── */

    return (
        <div style={S.overlay}>
            {/* Slide-in animation */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>

            {/* Header */}
            <div style={S.header}>
                <div style={S.title}>
                    <span>📊</span>
                    <span>Leerling Dashboard — {classId}</span>
                    <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
                        color: '#fff',
                        marginLeft: '0.5rem',
                    }}>DEV-ONLY</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        onClick={loadData}
                        style={{ ...S.closeBtn, background: 'rgba(108,92,231,0.15)', borderColor: '#6c5ce7' }}
                        title="Data opnieuw laden"
                    >
                        🔄 Ververs
                    </button>
                    <button onClick={onClose} style={S.closeBtn}>
                        ✕ Sluiten
                    </button>
                </div>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    Data ophalen...
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* KPI Cards */}
                    <div style={S.kpiRow}>
                        <div style={S.kpiCard()}>
                            <div style={S.kpiValue}>{students.length}</div>
                            <div style={S.kpiLabel}>Leerlingen</div>
                        </div>
                        <div style={S.kpiCard()}>
                            <div style={S.kpiValue}>{avgStep}<span style={{ fontSize: '0.8rem', color: '#64748b' }}>/{TOTAL_STEPS}</span></div>
                            <div style={S.kpiLabel}>Gem. stap ({avgPct}%)</div>
                        </div>
                        <div style={S.kpiCard('#00b894')}>
                            <div style={{ ...S.kpiValue, color: '#00b894' }}>{completedCount}</div>
                            <div style={S.kpiLabel}>Alles af</div>
                        </div>
                        <div style={S.kpiCard('#6c5ce7')}>
                            <div style={{ ...S.kpiValue, color: '#6c5ce7' }}>{topCount}</div>
                            <div style={S.kpiLabel}>🚀 Top</div>
                        </div>
                        <div style={S.kpiCard('#ff9f43')}>
                            <div style={{ ...S.kpiValue, color: '#ff9f43' }}>{checkCount}</div>
                            <div style={S.kpiLabel}>⚠️ Aandacht</div>
                        </div>
                    </div>

                    {/* Step legend */}
                    <div style={{
                        padding: '0 1.5rem 0.75rem',
                        display: 'flex',
                        gap: '0.35rem',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginRight: '0.25rem' }}>
                            STAPPEN:
                        </span>
                        {STEP_CHAIN.map((step, i) => (
                            <span
                                key={step.id}
                                title={`${i + 1}. ${step.label}`}
                                style={{
                                    fontSize: '0.65rem',
                                    color: '#94a3b8',
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'default',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {step.icon} {i + 1}
                            </span>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={S.searchRow}>
                        <input
                            type="text"
                            placeholder="🔍 Zoek op naam of leerlingnummer…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={S.searchInput}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {sorted.length} leerling{sorted.length !== 1 ? 'en' : ''}
                        </span>
                    </div>

                    {/* Table */}
                    <div style={{ padding: '0 1.5rem 2rem', overflowX: 'auto' }}>
                        <table style={S.table}>
                            <thead>
                                <tr>
                                    <th style={S.th} onClick={() => handleSort('studentNumber')}>
                                        Nr{sortArrow('studentNumber')}
                                    </th>
                                    <th style={S.th} onClick={() => handleSort('firstName')}>
                                        Naam{sortArrow('firstName')}
                                    </th>
                                    <th style={S.th} onClick={() => handleSort('stepIndex')}>
                                        Stap{sortArrow('stepIndex')}
                                    </th>
                                    <th style={{ ...S.th, textAlign: 'center' }}>
                                        Voortgang ({TOTAL_STEPS} stappen)
                                    </th>
                                    <th style={S.th} onClick={() => handleSort('signal')}>
                                        Signaal{sortArrow('signal')}
                                    </th>
                                    <th style={S.th} onClick={() => handleSort('lastActivity')}>
                                        Laatst actief{sortArrow('lastActivity')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((s) => {
                                    const signal = getSignalInfo(signalMap[s.uid]);
                                    const isSelected = selectedUid === s.uid;
                                    return (
                                        <tr
                                            key={s.uid}
                                            onClick={() => openDetail(s.uid)}
                                            style={{
                                                ...S.row,
                                                background: isSelected
                                                    ? 'rgba(108,92,231,0.15)'
                                                    : 'transparent',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <td style={{ ...S.td, fontVariantNumeric: 'tabular-nums', color: '#94a3b8', fontWeight: 600 }}>
                                                {s.studentNumber}
                                            </td>
                                            <td style={{ ...S.td, fontWeight: 700, color: '#fff' }}>
                                                {s.firstName}
                                                {!s.letterIntroDone && (
                                                    <span style={{
                                                        fontSize: '0.6rem', color: '#ff6b6b',
                                                        marginLeft: '0.4rem', fontWeight: 600,
                                                    }}>
                                                        (letter intro)
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ ...S.td, fontVariantNumeric: 'tabular-nums' }}>
                                                <span style={{ fontWeight: 700, color: '#fff' }}>{s.stepIndex}</span>
                                                <span style={{ color: '#64748b' }}>/{TOTAL_STEPS}</span>
                                            </td>
                                            <td style={{ ...S.td, textAlign: 'center' }}>
                                                {/* Step dots */}
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                }}>
                                                    {STEP_CHAIN.map((step, i) => (
                                                        <div
                                                            key={step.id}
                                                            title={step.label}
                                                            style={{
                                                                width: '10px',
                                                                height: '10px',
                                                                borderRadius: '2px',
                                                                background: stepDotColor(s.stepCompletion[step.id], i),
                                                                transition: 'background 0.2s',
                                                            }}
                                                        />
                                                    ))}
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        marginLeft: '0.3rem',
                                                        fontVariantNumeric: 'tabular-nums',
                                                    }}>
                                                        {pct(s.stepIndex, TOTAL_STEPS)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={S.td}>
                                                {signal ? (
                                                    <span style={S.signalBadge(signal.bg, signal.color)}>
                                                        {signal.emoji} {signal.label}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#475569', fontSize: '0.75rem' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ ...S.td, fontSize: '0.78rem', color: '#94a3b8' }}>
                                                {formatTimeAgo(s.lastActivity)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {sorted.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                                            {search ? 'Geen leerlingen gevonden.' : 'Geen leerlingen in deze klas.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Detail Panel */}
            {selectedUid && selectedStudent && (
                <div style={S.detailPanel}>
                    <div style={S.detailHeader}>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                                👤 {selectedStudent.firstName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                                #{selectedStudent.studentNumber} · {selectedStudent.classId}
                            </div>
                        </div>
                        <button
                            onClick={() => { setSelectedUid(null); setDetail(null); }}
                            style={{
                                ...S.closeBtn,
                                padding: '0.3rem 0.7rem',
                                fontSize: '0.8rem',
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Overview cards */}
                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem', flexWrap: 'wrap' }}>
                        <div style={{
                            flex: '1 1 60px', padding: '0.5rem', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                                {selectedStudent.stepIndex}/{TOTAL_STEPS}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                                Stappen
                            </div>
                        </div>
                        <div style={{
                            flex: '1 1 60px', padding: '0.5rem', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                                {pct(selectedStudent.stepIndex, TOTAL_STEPS)}%
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                                Voortgang
                            </div>
                        </div>
                        <div style={{
                            flex: '1 1 60px', padding: '0.5rem', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedStudent.letterIntroDone ? '#00b894' : '#ff6b6b' }}>
                                {selectedStudent.letterIntroDone ? '✓' : '✗'}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                                Letter Intro
                            </div>
                        </div>
                    </div>

                    {/* Step checklist — derived from STEP_CHAIN */}
                    <div style={S.sectionTitle}>📋 Stappen ({selectedStudent.stepIndex}/{TOTAL_STEPS})</div>
                    {STEP_CHAIN.map((step, i) => {
                        const done = selectedStudent.stepCompletion[step.id];
                        return (
                            <div key={step.id} style={{
                                ...S.dataRow,
                                opacity: done ? 1 : 0.5,
                                background: done ? 'rgba(0,184,148,0.03)' : 'transparent',
                            }}>
                                <span style={S.dataLabel}>
                                    <span style={{ display: 'inline-block', width: '1.5rem', textAlign: 'center' }}>
                                        {done ? '✅' : '⬜'}
                                    </span>
                                    <span style={{ marginLeft: '0.3rem' }}>
                                        {i + 1}. {step.icon} {step.label}
                                    </span>
                                </span>
                                <span style={{ ...S.dataValue, color: done ? '#00b894' : '#64748b', fontSize: '0.78rem' }}>
                                    {done ? 'Klaar' : '—'}
                                </span>
                            </div>
                        );
                    })}

                    {/* Last activity */}
                    <div style={{ ...S.dataRow, marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
                        <span style={S.dataLabel}>Laatst actief</span>
                        <span style={S.dataValue}>{formatTimeAgo(selectedStudent.lastActivity)}</span>
                    </div>

                    {/* Attempts stats (lazy loaded) */}
                    <div style={S.sectionTitle}>📊 Statistieken</div>
                    {detailLoading && (
                        <div style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                            ⏳ Data laden...
                        </div>
                    )}
                    {detail && (
                        <>
                            <div style={S.dataRow}>
                                <span style={S.dataLabel}>Nauwkeurigheid</span>
                                <span style={{
                                    ...S.dataValue,
                                    color: detail.accuracy === null
                                        ? '#64748b'
                                        : detail.accuracy >= 70
                                            ? '#00b894'
                                            : detail.accuracy >= 50
                                                ? '#ff9f43'
                                                : '#ff6b6b',
                                }}>
                                    {detail.accuracy !== null ? `${detail.accuracy}%` : '—'}
                                </span>
                            </div>
                            <div style={S.dataRow}>
                                <span style={S.dataLabel}>Totaal pogingen</span>
                                <span style={S.dataValue}>{detail.totalAttempts || '—'}</span>
                            </div>

                            {/* Game scores */}
                            {detail.gameScores.length > 0 && (
                                <>
                                    <div style={{
                                        ...S.sectionTitle,
                                        borderTop: '1px solid rgba(255,255,255,0.06)',
                                        paddingTop: '1rem',
                                    }}>
                                        🎮 Game-scores
                                    </div>
                                    {detail.gameScores.map((g) => (
                                        <div key={g.boardId} style={{
                                            margin: '0 1.25rem 0.5rem',
                                            padding: '0.6rem 0.8rem',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                        }}>
                                            <div style={{
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                color: '#e0e0e0',
                                                marginBottom: '0.3rem',
                                            }}>
                                                {g.boardLabel}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                fontSize: '0.72rem',
                                            }}>
                                                <span style={S.dataLabel}>Best: <span style={{ color: '#6c5ce7', fontWeight: 800 }}>{g.bestScore}</span></span>
                                                <span style={S.dataLabel}>Laatste: <span style={{ color: '#94a3b8', fontWeight: 700 }}>{g.lastScore}</span></span>
                                                <span style={S.dataLabel}>Gespeeld: <span style={{ color: '#94a3b8', fontWeight: 700 }}>{g.attempts}×</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {detail.gameScores.length === 0 && (
                                <div style={{ padding: '0.5rem 1.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                                    Nog geen game-scores beschikbaar.
                                </div>
                            )}
                        </>
                    )}

                    {!detailLoading && !detail && (
                        <div style={{ padding: '1rem 1.25rem', color: '#64748b', fontSize: '0.8rem' }}>
                            Klik op een leerling om details te laden.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
