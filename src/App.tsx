import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useAnalytics } from './services/analytics';
import { useSupabaseAuth, UserService } from './services/supabaseClient';
import ProfileForm from './components/ProfileForm';
import CareerCoach from './components/CareerCoach';
import StartupCoach from './components/StartupCoach';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import RealTimeAnalytics from './components/Dashboard/RealTimeAnalytics';
import AuthModal from './components/Auth/AuthModal';
import LanguageToggle from './components/LanguageToggle';
import { Briefcase, Rocket, ArrowLeft, Bot, BarChart3, Database, LogIn, LogOut } from 'lucide-react';

function AppContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeMode, setActiveMode] = useState<'career' | 'startup' | 'dashboard' | 'analytics' | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });
  const { t } = useLanguage();
  const analytics = useAnalytics();
  const { user, loading: authLoading, signOut } = useSupabaseAuth();

  // Charger le profil utilisateur depuis Supabase
  useEffect(() => {
    if (user && !profile) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const userProfile = await UserService.getUserProfile();
      if (userProfile) {
        setProfile({
          name: userProfile.name,
          skills: userProfile.skills,
          interests: userProfile.interests,
          experienceLevel: userProfile.experience_level,
          goals: userProfile.goals,
          industry: userProfile.industry || '',
          currentRole: userProfile.current_role,
          yearsExperience: userProfile.years_experience
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleProfileSubmit = async (userProfile: UserProfile) => {
    try {
      // Sauvegarder dans Supabase
      await UserService.createOrUpdateUser(userProfile);
      
      setProfile(userProfile);
      analytics.track('profile_completed', {
        skillsCount: userProfile.skills.length,
        interestsCount: userProfile.interests.length,
        experienceLevel: userProfile.experienceLevel,
        goals: userProfile.goals,
        industry: userProfile.industry
      });
      
      // Auto-select mode based on user goals
      if (userProfile.goals === 'employment') {
        setActiveMode('career');
      } else if (userProfile.goals === 'entrepreneurship') {
        setActiveMode('startup');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const resetToProfile = () => {
    setProfile(null);
    setActiveMode(null);
    analytics.trackButtonClick('edit_profile', 'header');
  };

  const handleModeChange = (mode: 'career' | 'startup' | 'dashboard' | 'analytics') => {
    setActiveMode(mode);
    analytics.trackButtonClick(`switch_to_${mode}`, 'mode_selection');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setProfile(null);
      setActiveMode(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('header.title')}</h1>
                <p className="text-sm text-gray-600">{t('header.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              
              {user && (
                <>
                  {/* Analytics Access */}
                  <button
                    onClick={() => handleModeChange('analytics')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeMode === 'analytics'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Real-Time
                  </button>
                  
                  {/* Dashboard Access */}
                  <button
                    onClick={() => handleModeChange('dashboard')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeMode === 'dashboard'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </button>
                  
                  {profile && (
                    <button
                      onClick={resetToProfile}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('header.editProfile')}
                    </button>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </button>
                </>
              )}
              
              {!user && (
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          /* Auth Required */
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Plateforme AI/ML/Data/Cloud
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Découvrez une plateforme complète avec intelligence artificielle, machine learning, 
              analytics en temps réel et infrastructure cloud native.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Commencer Gratuitement
              </button>
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Se Connecter
              </button>
            </div>
          </div>
        ) : activeMode === 'analytics' ? (
          /* Real-Time Analytics */
          <RealTimeAnalytics />
        ) : activeMode === 'dashboard' ? (
          /* Analytics Dashboard */
          <AdminDashboard />
        ) : !profile ? (
          /* Profile Form */
          <ProfileForm onSubmit={handleProfileSubmit} />
        ) : (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('welcome.title').replace('{name}', profile.name)}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('welcome.subtitle')}
              </p>
            </div>

            {/* Mode Selection */}
            {!activeMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <button
                  onClick={() => handleModeChange('career')}
                  className="group p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all transform hover:scale-105"
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('mode.career.title')}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('mode.career.description')}
                    </p>
                    <div className="mt-4 text-blue-600 font-medium">
                      {t('mode.career.cta')}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleModeChange('startup')}
                  className="group p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-orange-500 transition-all transform hover:scale-105"
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('mode.startup.title')}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('mode.startup.description')}
                    </p>
                    <div className="mt-4 text-orange-600 font-medium">
                      {t('mode.startup.cta')}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Mode Switch Tabs */}
            {activeMode && !['dashboard', 'analytics'].includes(activeMode) && (
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => handleModeChange('career')}
                    className={`flex items-center px-6 py-3 rounded-md font-medium transition-all ${
                      activeMode === 'career'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mr-2" />
                    {t('mode.career.title')}
                  </button>
                  <button
                    onClick={() => handleModeChange('startup')}
                    className={`flex items-center px-6 py-3 rounded-md font-medium transition-all ${
                      activeMode === 'startup'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    {t('mode.startup.title')}
                  </button>
                </div>
              </div>
            )}

            {/* Active Coach Component */}
            {activeMode === 'career' && <CareerCoach profile={profile} />}
            {activeMode === 'startup' && <StartupCoach profile={profile} />}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        onModeChange={(mode) => setAuthModal({ ...authModal, mode })}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">{t('footer.poweredBy')}</p>
            <p className="text-sm">{t('footer.description')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;