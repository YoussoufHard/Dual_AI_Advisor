import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
      title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <Globe className="w-4 h-4 mr-2" />
      <span className="font-medium text-sm">
        {language === 'fr' ? 'EN' : 'FR'}
      </span>
    </button>
  );
}