import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { NotificationProvider } from './components/Notifications/NotificationProvider';
import { GamificationProvider } from './components/Gamification/GamificationProvider';
import { LocationProvider } from './components/Geolocation/LocationProvider';
import { useAnalytics } from './services/analytics';
import { useSupabaseAuth, UserService } from './services/supabaseClient';
import { useSubscription } from './hooks/useSubscription';
import ProfileForm from './components/ProfileForm';
import CareerCoach from './components/CareerCoach';
import StartupCoach from './components/StartupCoach';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import RealTimeAnalytics from './components/Dashboard/RealTimeAnalytics';
import AuthModal from './components/Auth/AuthModal';
import LanguageToggle from './components/LanguageToggle';
import ThemeCustomizer from './components/ThemeProvider/ThemeCustomizer';
import NotificationCenter from './components/Notifications/NotificationCenter';
import GamificationPanel from './components/Gamification/GamificationPanel';
import AdvancedSearch from './components/Search/AdvancedSearch';
import ExportManager from './components/Export/ExportManager';
import LocalOpportunities from './components/Geolocation/LocalOpportunities';
import PWAInstallPrompt from './components/PWA/PWAInstallPrompt';
import PricingPlans from './components/Subscription/PricingPlans';
import SubscriptionGuard from './components/Subscription/SubscriptionGuard';
import UsageLimits from './components/Subscription/UsageLimits';
import { Briefcase, Rocket, ArrowLeft, Bot, BarChart3, Database, LogIn, LogOut, Search, Trophy, MapPin, CreditCard, Crown } from 'lucide-react';

function AppContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeMode, setActiveMode] = useState<'career' | 'startup' | 'dashboard' | 'analytics' | 'search' | 'gamification' | 'local' | 'subscription' | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });
  const { t } = useLanguage();
  const analytics = useAnalytics();
  const { user, loading: authLoading, signOut } = useSupabaseAuth();
  const { subscription, hasReachedLimit, canUseFeature } = useSubscription();

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

  const handleModeChange = (mode: 'career' | 'startup' | 'dashboard' | 'analytics' | 'search' | 'gamification' | 'local' | 'subscription') => {
    // Vérifier les limites d'usage pour certaines fonctionnalités
    if ((mode === 'career' || mode === 'startup') && hasReachedLimit('recommendations')) {
      setActiveMode('subscription');
      return;
    }

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

  const getCurrentPlan = () => {
    return subscription?.plan || 'free';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('header.title')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('header.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              
              {user && (
                <>
                  {/* Subscription Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getCurrentPlan() === 'enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                      getCurrentPlan() === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {getCurrentPlan() === 'enterprise' && <Crown className="w-3 h-3 inline mr-1" />}
                      Plan {getCurrentPlan().charAt(0).toUpperCase() + getCurrentPlan().slice(1)}
                    </div>
                    <button
                      onClick={() => handleModeChange('subscription')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Gérer l'abonnement"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Notifications */}
                  <NotificationCenter />
                  
                  {/* Local Opportunities */}
                  <button
                    onClick={() => handleModeChange('local')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeMode === 'local'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Local
                  </button>
                  
                  {/* Search */}
                  <SubscriptionGuard
                    requiredPlan="pro"
                    currentPlan={getCurrentPlan()}
                    feature="Recherche avancée"
                    fallback={
                      <button
                        onClick={() => handleModeChange('subscription')}
                        className="flex items-center px-4 py-2 rounded-lg transition-colors text-gray-400 cursor-not-allowed"
                        title="Fonctionnalité Pro"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Recherche
                      </button>
                    }
                  >
                    <button
                      onClick={() => handleModeChange('search')}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeMode === 'search'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Recherche
                    </button>
                  </SubscriptionGuard>
                  
                  {/* Gamification */}
                  <button
                    onClick={() => handleModeChange('gamification')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeMode === 'gamification'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Progression
                  </button>
                  
                  {/* Analytics Access */}
                  <SubscriptionGuard
                    requiredPlan="pro"
                    currentPlan={getCurrentPlan()}
                    feature="Analytics temps réel"
                    fallback={
                      <button
                        onClick={() => handleModeChange('subscription')}
                        className="flex items-center px-4 py-2 rounded-lg transition-colors text-gray-400 cursor-not-allowed"
                        title="Fonctionnalité Pro"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Real-Time
                      </button>
                    }
                  >
                    <button
                      onClick={() => handleModeChange('analytics')}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeMode === 'analytics'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Real-Time
                    </button>
                  </SubscriptionGuard>
                  
                  {/* Dashboard Access */}
                  <SubscriptionGuard
                    requiredPlan="pro"
                    currentPlan={getCurrentPlan()}
                    feature="Dashboard analytics"
                    fallback={
                      <button
                        onClick={() => handleModeChange('subscription')}
                        className="flex items-center px-4 py-2 rounded-lg transition-colors text-gray-400 cursor-not-allowed"
                        title="Fonctionnalité Pro"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </button>
                    }
                  >
                    <button
                      onClick={() => handleModeChange('dashboard')}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeMode === 'dashboard'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </button>
                  </SubscriptionGuard>
                  
                  {/* Export Manager */}
                  <SubscriptionGuard
                    requiredPlan="pro"
                    currentPlan={getCurrentPlan()}
                    feature="Export de données"
                    fallback={null}
                  >
                    <ExportManager />
                  </SubscriptionGuard>
                  
                  {profile && (
                    <button
                      onClick={resetToProfile}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('header.editProfile')}
                    </button>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Plateforme AI/ML/Data/Cloud avec Monétisation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Découvrez une plateforme révolutionnaire avec intelligence artificielle, machine learning, 
              analytics en temps réel, géolocalisation, gamification et système de paiement intégré.
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
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Se Connecter
              </button>
            </div>
          </div>
        ) : activeMode === 'subscription' ? (
          /* Subscription Management */
          <div className="space-y-8">
            <PricingPlans currentPlan={getCurrentPlan()} />
            {user && <UsageLimits />}
          </div>
        ) : activeMode === 'local' ? (
          /* Local Opportunities */
          <LocalOpportunities />
        ) : activeMode === 'search' ? (
          /* Advanced Search */
          <SubscriptionGuard
            requiredPlan="pro"
            currentPlan={getCurrentPlan()}
            feature="Recherche avancée"
          >
            <AdvancedSearch />
          </SubscriptionGuard>
        ) : activeMode === 'gamification' ? (
          /* Gamification Panel */
          <GamificationPanel />
        ) : activeMode === 'analytics' ? (
          /* Real-Time Analytics */
          <SubscriptionGuard
            requiredPlan="pro"
            currentPlan={getCurrentPlan()}
            feature="Analytics temps réel"
          >
            <RealTimeAnalytics />
          </SubscriptionGuard>
        ) : activeMode === 'dashboard' ? (
          /* Analytics Dashboard */
          <SubscriptionGuard
            requiredPlan="pro"
            currentPlan={getCurrentPlan()}
            feature="Dashboard analytics"
          >
            <AdminDashboard />
          </SubscriptionGuard>
        ) : !profile ? (
          /* Profile Form */
          <ProfileForm onSubmit={handleProfileSubmit} />
        ) : (
          <div className="space-y-8">
            {/* Usage Limits Display */}
            {getCurrentPlan() === 'free' && <UsageLimits />}

            {/* Welcome Message */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('welcome.title').replace('{name}', profile.name)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t('welcome.subtitle')}
              </p>
            </div>

            {/* Mode Selection */}
            {!activeMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <button
                  onClick={() => handleModeChange('career')}
                  disabled={hasReachedLimit('recommendations')}
                  className={`group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all transform hover:scale-105 ${
                    hasReachedLimit('recommendations') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{t('mode.career.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t('mode.career.description')}
                    </p>
                    <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
                      {hasReachedLimit('recommendations') ? 'Limite atteinte - Upgrader' : t('mode.career.cta')}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleModeChange('startup')}
                  disabled={hasReachedLimit('recommendations')}
                  className={`group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-transparent hover:border-orange-500 dark:hover:border-orange-400 transition-all transform hover:scale-105 ${
                    hasReachedLimit('recommendations') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{t('mode.startup.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t('mode.startup.description')}
                    </p>
                    <div className="mt-4 text-orange-600 dark:text-orange-400 font-medium">
                      {hasReachedLimit('recommendations') ? 'Limite atteinte - Upgrader' : t('mode.startup.cta')}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Mode Switch Tabs */}
            {activeMode && !['dashboard', 'analytics', 'search', 'gamification', 'local', 'subscription'].includes(activeMode) && (
              <div className="flex justify-center mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => handleModeChange('career')}
                    className={`flex items-center px-6 py-3 rounded-md font-medium transition-all ${
                      activeMode === 'career'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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

      {/* Theme Customizer */}
      <ThemeCustomizer />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">{t('footer.poweredBy')} + Stripe</p>
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
      <ThemeProvider>
        <NotificationProvider>
          <GamificationProvider>
            <LocationProvider>
              <AppContent />
            </LocationProvider>
          </GamificationProvider>
        </NotificationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;