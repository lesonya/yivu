import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { BottomBar } from './components/layout/BottomBar';
import { AnimatedMovingBackground } from './components/layout/AnimatedMovingBackground';
import { ProfileSwitcherModal } from './components/gamification/ProfileSwitcherModal';
import { HomeScreen } from './views/HomeScreen';
import { SubjectMaterialsScreen } from './views/SubjectMaterialsScreen';
import { QuizRunnerScreen } from './views/QuizRunnerScreen';
import { LeaderboardScreen } from './views/LeaderboardScreen';
import { UploadPastPaperScreen } from './views/UploadPastPaperScreen';
import { PerformanceAnalyticsScreen } from './views/PerformanceAnalyticsScreen';
import { CustomTestGeneratorScreen } from './views/CustomTestGeneratorScreen';

function AppLayout() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();

  const isQuizView = location.pathname.startsWith('/quiz/');
  const isSubjectView = location.pathname.startsWith('/subject/');
  const isAnalyticsView = location.pathname.startsWith('/analytics');
  const isCustomTestView = location.pathname.startsWith('/custom-test');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans relative selection:bg-purple-500 selection:text-white">
      {/* Cognix Pure Animated Hardware-Accelerated Background */}
      <AnimatedMovingBackground />

      {/* App Foreground Shell */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNav
          showBack={isQuizView || isSubjectView || isAnalyticsView || isCustomTestView}
          backTitle={isQuizView ? 'Leave Quiz' : 'Curriculum Home'}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/subject/:subjectId" element={<SubjectMaterialsScreen />} />
            <Route path="/quiz/:materialId" element={<QuizRunnerScreen />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
            <Route path="/analytics" element={<PerformanceAnalyticsScreen />} />
            <Route path="/custom-test" element={<CustomTestGeneratorScreen />} />
            <Route path="/upload" element={<UploadPastPaperScreen />} />
          </Routes>
        </main>

        {/* Bottom Bar containing Upload and Profile Switcher */}
        <BottomBar onOpenProfileSwitcher={() => setIsProfileModalOpen(true)} />
      </div>

      <ProfileSwitcherModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
