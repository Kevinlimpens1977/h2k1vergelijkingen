import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    /* auto-suggest pin = studentNumber */
    function handleStudentNumberChange(value: string) {
        setStudentNumber(value);
        if (!pin || pin === studentNumber) {
            setPin(value);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');

        if (!firstName.trim()) { setError('Vul je voornaam in.'); return; }
        if (!studentNumber.trim()) { setError('Vul je leerlingnummer in.'); return; }
        if (pin.length < 6) { setError('Pincode moet minimaal 6 tekens zijn.'); return; }

        setBusy(true);
        try {
            await signup(firstName, studentNumber, pin);
            navigate('/');
        } catch (err: unknown) {
            const code = (err as { code?: string }).code ?? '';
            if (code === 'auth/email-already-in-use') {
                setError('Er bestaat al een account met dit leerlingnummer.');
            } else if (code === 'auth/weak-password') {
                setError('Pincode is te zwak. Gebruik minimaal 6 tekens.');
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
                <h1 className="auth-title">Account aanmaken</h1>
                <p className="auth-subtitle">BalansLab MW2K — Hoofdstuk 8</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label">
                        Voornaam
                        <input
                            type="text"
                            className="auth-input"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="bijv. Jan"
                            autoFocus
                            disabled={busy}
                        />
                    </label>

                    <label className="auth-label">
                        Leerlingnummer
                        <input
                            type="text"
                            className="auth-input"
                            value={studentNumber}
                            onChange={(e) => handleStudentNumberChange(e.target.value)}
                            placeholder="bijv. 12345"
                            disabled={busy}
                        />
                    </label>

                    <label className="auth-label">
                        Pincode
                        <span className="auth-hint">Minimaal 6 tekens. Standaard: je leerlingnummer.</span>
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
                        {busy ? 'Bezig...' : 'Account aanmaken'}
                    </button>
                </form>

                <p className="auth-switch">
                    Al een account? <Link to="/login">Inloggen</Link>
                </p>
            </div>
        </div>
    );
}
