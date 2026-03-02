/**
 * Route guard for Chapter 8 linear flow.
 * Checks if the given step is unlocked; if not, redirects to the next required step.
 * When devMode is ON, always allows access (no redirect).
 */

import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDevMode } from '../context/DevModeContext';
import {
    type FlowStepId,
    getChapter8Progress,
    getRedirectIfLocked,
} from '../services/chapter8Flow';

interface Props {
    stepId: FlowStepId;
    children: ReactNode;
}

export default function RequireUnlocked({ stepId, children }: Props) {
    const { profile } = useAuth();
    const { devMode } = useDevMode();
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        // Dev mode: skip all gating
        if (devMode) {
            setAllowed(true);
            setChecked(true);
            return;
        }

        if (!profile) return;
        (async () => {
            try {
                const progress = await getChapter8Progress(profile.uid);
                const redirect = getRedirectIfLocked(stepId, progress);
                if (redirect) {
                    navigate(redirect, { replace: true });
                } else {
                    setAllowed(true);
                }
            } catch (err) {
                console.warn('Could not check chapter 8 progress:', err);
                setAllowed(true);
            } finally {
                setChecked(true);
            }
        })();
    }, [profile, stepId, navigate, devMode]);

    if (!checked) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--y-bg, #f0f4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--y-muted, #64748b)',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
                Even checken…
            </div>
        );
    }

    if (!allowed) return null;
    return <>{children}</>;
}
