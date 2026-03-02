import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [studentNumber, setStudentNumber] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');

        if (!studentNumber.trim()) { setError('Vul je leerlingnummer in.'); return; }
        if (!pin) { setError('Vul je pincode in.'); return; }

        setBusy(true);
        try {
            await login(studentNumber, pin);
            navigate('/');
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? '';
            if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
                setError('Leerlingnummer of pincode is onjuist.');
            } else if (code === 'auth/too-many-requests') {
                setError('Te veel pogingen. Probeer het later opnieuw.');
            } else {
                setError('Er ging iets mis. Probeer het opnieuw.');
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Inloggen</h1>
                <p className="auth-subtitle">BalansLab MW2K — Hoofdstuk 8</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label">
                        Leerlingnummer
                        <input
                            type="text"
                            className="auth-input"
                            value={studentNumber}
                            onChange={(e) => setStudentNumber(e.target.value)}
                            placeholder="bijv. 12345"
                            autoFocus
                            disabled={busy}
                        />
                    </label>

                    <label className="auth-label">
                        Pincode
                        <input
                            type="password"
                            className="auth-input"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="••••••"
                            disabled={busy}
                        />
                    </label>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-button" disabled={busy}>
                        {busy ? 'Bezig...' : 'Inloggen'}
                    </button>
                </form>

                <p className="auth-switch">
                    Eerste keer? <Link to="/signup">Account aanmaken</Link>
                </p>
            </div>
        </div>
    );
}
