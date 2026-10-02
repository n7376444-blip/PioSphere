/**
 * BioSphere - High School Interactive Biology Educational Platform
 * Built for Saudi Secondary Curriculum & Tahsili Mastery
 */

import React, { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Topbar } from './components/Topbar.tsx';
import { CelebrationModal } from './components/CelebrationModal.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { JourneyPage } from './pages/JourneyPage.tsx';
import { QuizzesPage } from './pages/QuizzesPage.tsx';
import { QuizEnginePage } from './pages/QuizEnginePage.tsx';
import { DailyBattlePage } from './pages/DailyBattlePage.tsx';
import { GardenPage } from './pages/GardenPage.tsx';
import { BiologyMapPage } from './pages/BiologyMapPage.tsx';
import { LeaderboardPage } from './pages/LeaderboardPage.tsx';
import { AchievementsPage } from './pages/AchievementsPage.tsx';
import { BioBotPage } from './pages/BioBotPage.tsx';
import { SecretLabPage } from './pages/SecretLabPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';

import { User } from './types.ts';

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active quiz config if taking test
  const [activeQuizConfig, setActiveQuizConfig] = useState<{
    quizType: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab';
    category?: 'bio1' | 'bio2' | 'ecology';
  } | null>(null);

  // Celebration Modal state
  const [celebrationData, setCelebrationData] = useState<{
    type: 'rank_up' | 'badge';
    title: string;
    subtitle: string;
    badge?: string;
  } | null>(null);

  // Check existing session token on startup
  useEffect(() => {
    const token = localStorage.getItem('biosphere_token');

    async function verifyExistingToken() {
      if (!token) {
        // Show brief splash screen then login
        setTimeout(() => setInitialLoading(false), 900);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('biosphere_token');
          setUser(null);
        }
      } catch {
        // Offline or server not ready
      } finally {
        setTimeout(() => setInitialLoading(false), 800);
      }
    }

    verifyExistingToken();
  }, []);

  const refreshUserData = async () => {
    const token = localStorage.getItem('biosphere_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSuccess = (token: string, verifiedUser: User) => {
    setUser(verifiedUser);
    setCurrentTab('home');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('biosphere_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {}
    }
    localStorage.removeItem('biosphere_token');
    setUser(null);
    setCurrentTab('home');
    setActiveQuizConfig(null);
  };

  const handleStartQuiz = (
    quizType: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab',
    category?: 'bio1' | 'bio2' | 'ecology'
  ) => {
    setActiveQuizConfig({ quizType, category });
    setCurrentTab('quiz_engine');
  };

  // 1. Initial Splash / Loading Screen
  if (initialLoading) {
    return <LoadingScreen message="مرحبًا بك في رحلتك العلمية..." />;
  }

  // 2. Auth Screen if not logged in
  if (!user) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#1F3A4A] flex flex-col antialiased">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'quiz_engine') {
            setActiveQuizConfig(null);
          }
          setCurrentTab(tab);
        }}
        user={user}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by desktop sidebar width 288px = 72 tailwind width) */}
      <div className="md:mr-72 flex-1 flex flex-col min-w-0">
        
        {/* Sticky Topbar */}
        <Topbar
          user={user}
          onOpenMobile={() => setIsMobileMenuOpen(true)}
          onNavigate={(tab) => {
            setActiveQuizConfig(null);
            setCurrentTab(tab);
          }}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {currentTab === 'home' && (
            <HomePage
              user={user}
              onNavigate={(tab, meta) => {
                if (tab === 'quizzes') {
                  setCurrentTab('quizzes');
                } else if (tab === 'daily') {
                  setCurrentTab('daily');
                } else if (tab === 'biobot') {
                  setCurrentTab('biobot');
                } else if (tab === 'journey') {
                  setCurrentTab('journey');
                } else if (tab === 'garden') {
                  setCurrentTab('garden');
                } else if (tab === 'map') {
                  setCurrentTab('map');
                } else if (tab === 'secret_lab') {
                  setCurrentTab('secret_lab');
                } else {
                  setCurrentTab(tab);
                }
              }}
            />
          )}

          {currentTab === 'journey' && (
            <JourneyPage
              user={user}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'quizzes' && (
            <QuizzesPage
              user={user}
              onStartQuiz={handleStartQuiz}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'quiz_engine' && activeQuizConfig && (
            <QuizEnginePage
              quizType={activeQuizConfig.quizType}
              category={activeQuizConfig.category}
              onExit={() => {
                setActiveQuizConfig(null);
                setCurrentTab('quizzes');
              }}
              onRefreshUser={refreshUserData}
              onTriggerCelebration={(data) => setCelebrationData(data)}
            />
          )}

          {currentTab === 'daily' && (
            <DailyBattlePage
              user={user}
              onRefreshUser={refreshUserData}
            />
          )}

          {currentTab === 'garden' && (
            <GardenPage
              user={user}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'map' && (
            <BiologyMapPage
              user={user}
              onStartQuiz={(type, cat) => handleStartQuiz(type, cat)}
            />
          )}

          {currentTab === 'leaderboard' && (
            <LeaderboardPage currentUser={user} />
          )}

          {currentTab === 'achievements' && (
            <AchievementsPage user={user} />
          )}

          {currentTab === 'biobot' && (
            <BioBotPage user={user} />
          )}

          {currentTab === 'secret_lab' && (
            <SecretLabPage
              user={user}
              onStartQuiz={(type) => handleStartQuiz(type)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              user={user}
              onLogout={handleLogout}
            />
          )}

          {currentTab === 'about' && (
            <AboutPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}

          {currentTab === 'teacher_dashboard' && (
            <TeacherDashboardPage currentUser={user} />
          )}

          {currentTab === 'admin_dashboard' && user.role === 'admin' && (
            <AdminDashboardPage currentUser={user} />
          )}
        </main>

      </div>

      {/* Celebration Modal (Rank Up & Achievements) */}
      <CelebrationModal
        data={celebrationData}
        onClose={() => setCelebrationData(null)}
      />

    </div>
  );
}
