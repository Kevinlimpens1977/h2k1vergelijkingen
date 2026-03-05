import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { migrateUserScores } from '../services/unifiedLeaderboardService';

/* ── default class (all students share one leaderboard) ─ */
const DEFAULT_CLASS_ID = 'klas2k';

/* ── helpers ─────────────────────────────────────────── */

function toEmail(studentNumber: string): string {
    return `${studentNumber.trim().toLowerCase()}@mw2k.local`;
}

/* ── types ───────────────────────────────────────────── */

export interface UserProfile {
    uid: string;
    role: 'student' | 'teacher' | 'admin';
    firstName: string;
    studentNumber: string;
    classId: string | null;
}

interface AuthContextValue {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signup: (firstName: string, studentNumber: string, pin: string) => Promise<void>;
    login: (studentNumber: string, pin: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── provider ────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    /* listen to auth state */
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            setUser(fbUser);
            if (fbUser) {
                try {
                    const snap = await getDoc(doc(db, 'users', fbUser.uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        setProfile({
                            uid: fbUser.uid,
                            role: data.role ?? 'student',
                            firstName: data.firstName ?? '',
                            studentNumber: data.studentNumber ?? '',
                            classId: data.classId ?? DEFAULT_CLASS_ID,
                        });
                    } else {
                        // Doc doesn't exist yet (race condition) — use minimal profile
                        setProfile({
                            uid: fbUser.uid,
                            role: 'student',
                            firstName: fbUser.displayName ?? '',
                            studentNumber: fbUser.email?.split('@')[0] ?? '',
                            classId: DEFAULT_CLASS_ID,
                        });
                    }
                } catch (err) {
                    console.warn('Could not read user profile from Firestore:', err);
                    // Fallback: use auth data so the app doesn't hang
                    setProfile({
                        uid: fbUser.uid,
                        role: 'student',
                        firstName: fbUser.displayName ?? '',
                        studentNumber: fbUser.email?.split('@')[0] ?? '',
                        classId: DEFAULT_CLASS_ID,
                    });
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    /* signup */
    async function signup(firstName: string, studentNumber: string, pin: string) {
        const email = toEmail(studentNumber);
        const cred = await createUserWithEmailAndPassword(auth, email, pin);

        await setDoc(doc(db, 'users', cred.user.uid), {
            role: 'student',
            firstName: firstName.trim(),
            studentNumber: studentNumber.trim(),
            classId: DEFAULT_CLASS_ID,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        });

        setProfile({
            uid: cred.user.uid,
            role: 'student',
            firstName: firstName.trim(),
            studentNumber: studentNumber.trim(),
            classId: DEFAULT_CLASS_ID,
        });
    }

    /* login */
    async function login(studentNumber: string, pin: string) {
        const email = toEmail(studentNumber);
        const cred = await signInWithEmailAndPassword(auth, email, pin);

        // update lastLoginAt + ensure classId is set (migrate old accounts)
        await setDoc(doc(db, 'users', cred.user.uid), {
            lastLoginAt: serverTimestamp(),
            classId: DEFAULT_CLASS_ID,
        }, { merge: true });

        const snap = await getDoc(doc(db, 'users', cred.user.uid));
        if (snap.exists()) {
            const data = snap.data();
            setProfile({
                uid: cred.user.uid,
                role: data.role ?? 'student',
                firstName: data.firstName ?? '',
                studentNumber: data.studentNumber ?? '',
                classId: data.classId ?? DEFAULT_CLASS_ID,
            });
        }

        // Migrate any old leaderboard scores to correct classId (fire & forget)
        migrateUserScores(cred.user.uid, DEFAULT_CLASS_ID).catch(() => { });
    }

    /* logout */
    async function logout() {
        await signOut(auth);
        setProfile(null);
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/* ── hook ─────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
