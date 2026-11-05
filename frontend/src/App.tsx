import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { ProfileSwitcherModal } from './components/gamification/ProfileSwitcherModal';
import { HomeScreen } from './views/HomeScreen';
import { SubjectMaterialsScreen } from './views/SubjectMaterialsScreen';
import { QuizRunnerScreen } from './views/QuizRunnerScreen';
import { LeaderboardScreen } from './views/LeaderboardScreen';
import { UploadPastPaperScreen } from './views/UploadPastPaperScreen';

function AppLayout() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();

  const isQuizView = location.pathname.startsWith('/quiz/');
  const isSubjectView = location.pathname.startsWith('/subject/');

  return (
    <div className="min-h-screen bg-dark-navy text-slate-100 flex flex-col font-sans">
      <TopNav
        onOpenProfileSwitcher={() => setIsProfileModalOpen(true)}
        showBack={isQuizView || isSubjectView}
        backTitle={isQuizView ? 'Leave Quiz' : 'Curriculum Home'}
      />

      <main className="flex-1 p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/subject/:subjectId" element={<SubjectMaterialsScreen />} />
          <Route path="/quiz/:materialId" element={<QuizRunnerScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/upload" element={<UploadPastPaperScreen />} />
        </Routes>
      </main>

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
