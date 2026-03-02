/**
 * Developer Mode context — Ctrl+Shift+Z toggle.
 *
 * When enabled, all route guards and roadmap locks are bypassed.
 * Persisted in localStorage; never touches Firestore.
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';

/* ── types ────────────────────────────────────────────── */

interface DevModeContextValue {
    devMode: boolean;
    toggle: () => void;
}

const STORAGE_KEY = 'balanslab_dev_mode';

const DevModeContext = createContext<DevModeContextValue>({
    devMode: false,
    toggle: () => { },
});

/* ── provider ─────────────────────────────────────────── */

export function DevModeProvider({ children }: { children: ReactNode }) {
    const [devMode, setDevMode] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === '1';
        } catch {
            return false;
        }
    });

    const [toast, setToast] = useState<string | null>(null);

    const toggle = useCallback(() => {
        setDevMode((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
            } catch { /* quota */ }
            setToast(next
                ? 'Developer mode: AAN (alle onderdelen ontgrendeld)'
                : 'Developer mode: UIT',
            );
            return next;
        });
    }, []);

    // Toast auto-dismiss
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(t);
    }, [toast]);

    // Keyboard listener: Ctrl+Shift+Z / Cmd+Shift+Z
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            // Skip if user is typing in an input-like element
            const tag = (e.target as HTMLElement)?.tagName;
            const editable = (e.target as HTMLElement)?.isContentEditable;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;

            if (
                (e.ctrlKey || e.metaKey) &&
                e.shiftKey &&
                e.key.toUpperCase() === 'Z'
            ) {
                e.preventDefault();
                toggle();
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [toggle]);

    return (
        <DevModeContext.Provider value={{ devMode, toggle }}>
            {children}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0.55rem 1.4rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    zIndex: 99999,
                    pointerEvents: 'none',
                    background: devMode
                        ? 'linear-gradient(135deg, #6c5ce7, #a855f7)'
                        : 'linear-gradient(135deg, #64748b, #94a3b8)',
                    color: '#fff',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                    animation: 'y-toast-in 0.3s ease forwards',
                    fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                    {toast}
                </div>
            )}
        </DevModeContext.Provider>
    );
}

/* ── hook ──────────────────────────────────────────────── */

export function useDevMode() {
    return useContext(DevModeContext);
}
