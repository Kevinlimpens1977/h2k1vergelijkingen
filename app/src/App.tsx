import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DevModeProvider } from './context/DevModeContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireUnlocked from './components/RequireUnlocked';
import RequireLetterIntro from './components/RequireLetterIntro';
import Chapter8Entry from './components/Chapter8Entry';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ParagraphPage from './pages/ParagraphPage';
import SummaryPage from './pages/SummaryPage';
import PracticePage from './pages/PracticePage';
import PracticePage8_2 from './pages/PracticePage8_2';
import BalanceGamePage from './pages/BalanceGamePage';
import LetterIntroPage from './features/letter-intro/LetterIntroPage';
import Intro8_1 from './features/section8-1-intro/routes/Intro8_1';
import SpeedTest8_1 from './features/section8-1-intro/routes/SpeedTest8_1';
import BalansBlitz8_2 from './pages/BalansBlitz8_2';
import FruitChallengePage from './pages/FruitChallengePage';
import TermtrisPage from './features/termtris-8-3/TermtrisPage';
import Uitleg8_3Page from './features/uitleg-8-3/Uitleg8_3Page';
import BalanceIntroPage from './features/balance-intro-8-3/BalanceIntroPage';
import PracticePage8_3 from './pages/PracticePage8_3';
import AlgebraArenaPage from './features/algebra-arena/AlgebraArenaPage';

/** Redirect away from auth pages if already logged in */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <DevModeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

            {/* Letterrekenen Intro — mandatory first module */}
            <Route path="/intro/letterrekenen" element={<ProtectedRoute><LetterIntroPage /></ProtectedRoute>} />

            {/* Chapter 8 entry — redirects to first incomplete step */}
            <Route path="/hoofdstuk-8" element={<ProtectedRoute><RequireLetterIntro><Chapter8Entry /></RequireLetterIntro></ProtectedRoute>} />

            {/* Paragraph pages (generic) */}
            <Route path="/paragraph/:id" element={<ProtectedRoute><ParagraphPage /></ProtectedRoute>} />
            <Route path="/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />

            {/* §8.1 Intro — gated behind letter intro */}
            <Route path="/8-1/intro" element={<ProtectedRoute><RequireLetterIntro><Intro8_1 /></RequireLetterIntro></ProtectedRoute>} />
            <Route path="/8-1/speed-test" element={<ProtectedRoute><SpeedTest8_1 /></ProtectedRoute>} />

            {/* §8.1 Practice — requires intro passed */}
            <Route path="/practice/8_1" element={
              <ProtectedRoute><RequireUnlocked stepId="8_1"><PracticePage /></RequireUnlocked></ProtectedRoute>
            } />

            {/* §8.2 Practice — requires §8.1 completed */}
            <Route path="/practice/8_2" element={
              <ProtectedRoute><RequireUnlocked stepId="8_2"><PracticePage8_2 /></RequireUnlocked></ProtectedRoute>
            } />

            {/* 🍎 Fruit Challenge — requires §8.2 completed */}
            <Route path="/fruit-challenge" element={
              <ProtectedRoute><RequireUnlocked stepId="fruit_challenge"><FruitChallengePage /></RequireUnlocked></ProtectedRoute>
            } />

            {/* §8.2 Balans Blitz — requires Fruit Challenge or §8.2 completed */}
            <Route path="/8-2/blitz" element={
              <ProtectedRoute><RequireUnlocked stepId="8_2_blitz"><BalansBlitz8_2 /></RequireUnlocked></ProtectedRoute>
            } />

            {/* §8.3 Balance Intro — requires Blitz passed */}
            <Route path="/8-3/balance-intro" element={
              <ProtectedRoute><RequireUnlocked stepId="8_3_balance_intro"><BalanceIntroPage /></RequireUnlocked></ProtectedRoute>
            } />

            {/* §8.3 Uitleg — requires Balance Intro passed */}
            <Route path="/8-3/uitleg" element={
              <ProtectedRoute><RequireUnlocked stepId="8_3_uitleg"><Uitleg8_3Page /></RequireUnlocked></ProtectedRoute>
            } />

            {/* §8.3 Practice — book exercises */}
            <Route path="/practice/8_3" element={
              <ProtectedRoute><RequireUnlocked stepId="8_3_uitleg"><PracticePage8_3 /></RequireUnlocked></ProtectedRoute>
            } />

            {/* §8.3 Termtris — requires §8.3 Uitleg passed */}
            <Route path="/8-3/termtris" element={
              <ProtectedRoute><RequireUnlocked stepId="8_3"><TermtrisPage /></RequireUnlocked></ProtectedRoute>
            } />
            <Route path="/8-3" element={<Navigate to="/8-3/uitleg" replace />} />

            {/* ⚖️ Balans Minigame — requires §8.3 completed */}
            <Route path="/balance-game" element={
              <ProtectedRoute><RequireUnlocked stepId="balance"><BalanceGamePage /></RequireUnlocked></ProtectedRoute>
            } />

            {/* ⚔️ Algebra Arena — ENDGAME — requires balance game completed */}
            <Route path="/arena" element={
              <ProtectedRoute><RequireUnlocked stepId="algebra_arena"><AlgebraArenaPage /></RequireUnlocked></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </DevModeProvider>
    </BrowserRouter>
  );
}
