import React, { useState } from 'react';
import { UserProfile } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import ProfileForm from './components/ProfileForm';
import CareerCoach from './components/CareerCoach';
import StartupCoach from './components/StartupCoach';
import LanguageToggle from './components/LanguageToggle';
import { Briefcase, Rocket, ArrowLeft, Bot } from 'lucide-react';

function AppContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeMode, setActiveMode] = useState<'career' | 'startup' | null>(null);
  const { t } = useLanguage();

  const handleProfileSubmit = (userProfile: UserProfile) => {
    setProfile(userProfile);
    // Auto-select mode based on user goals
    if (userProfile.goals === 'employment') {
      setActiveMode('career');
    } else if (userProfile.goals === 'entrepreneurship') {
      setActiveMode('startup');
    }
    // If 'both', let user choose
  };

  const resetToProfile = () => {
    setProfile(null);
    setActiveMode(null);
  };

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
              {profile && (
                <button
                  onClick={resetToProfile}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('header.editProfile')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
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
                  onClick={() => setActiveMode('career')}
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
                  onClick={() => setActiveMode('startup')}
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
            {activeMode && (
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => setActiveMode('career')}
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
                    onClick={() => setActiveMode('startup')}
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