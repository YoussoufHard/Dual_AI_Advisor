import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations = {
  fr: {
    // Header
    'header.title': 'AI Advisor',
    'header.subtitle': 'Votre Coach Personnel Carrière & Startup',
    'header.editProfile': 'Modifier le Profil',

    // Profile Form
    'profile.title': 'Créez Votre Profil',
    'profile.subtitle': 'Parlez-nous de vous pour obtenir des conseils personnalisés',
    'profile.name': 'Nom Complet',
    'profile.name.placeholder': 'Entrez votre nom complet',
    'profile.currentRole': 'Poste Actuel',
    'profile.currentRole.placeholder': 'ex: Développeur Logiciel',
    'profile.yearsExperience': 'Années d\'Expérience',
    'profile.industry': 'Secteur Préféré',
    'profile.industry.select': 'Sélectionnez un secteur',
    'profile.industry.technology': 'Technologie',
    'profile.industry.healthcare': 'Santé',
    'profile.industry.finance': 'Finance',
    'profile.industry.education': 'Éducation',
    'profile.industry.marketing': 'Marketing',
    'profile.industry.design': 'Design',
    'profile.industry.consulting': 'Conseil',
    'profile.industry.manufacturing': 'Industrie',
    'profile.industry.retail': 'Commerce',
    'profile.industry.other': 'Autre',
    'profile.skills': 'Compétences',
    'profile.skills.subtitle': '(Ajoutez au moins 3)',
    'profile.skills.placeholder': 'ex: JavaScript, Gestion de Projet, Analyse de Données',
    'profile.skills.add': 'Ajouter',
    'profile.interests': 'Centres d\'Intérêt',
    'profile.interests.subtitle': '(Ajoutez au moins 2)',
    'profile.interests.placeholder': 'ex: IA, Durabilité, Gaming, Voyage',
    'profile.experienceLevel': 'Niveau d\'Expérience',
    'profile.experienceLevel.beginner': 'Débutant',
    'profile.experienceLevel.intermediate': 'Intermédiaire',
    'profile.experienceLevel.advanced': 'Avancé',
    'profile.experienceLevel.expert': 'Expert',
    'profile.goals': 'Objectifs Principaux',
    'profile.goals.employment': 'Trouver un Emploi',
    'profile.goals.entrepreneurship': 'Créer une Entreprise',
    'profile.goals.both': 'Explorer les Deux',
    'profile.submit': 'Obtenir Mes Conseils Personnalisés',

    // Welcome
    'welcome.title': 'Bienvenue, {name}!',
    'welcome.subtitle': 'Choisissez votre mode de coaching ou explorez les deux options',

    // Mode Selection
    'mode.career.title': 'Coach Carrière',
    'mode.career.description': 'Obtenez des recommandations de carrière personnalisées, des plans de développement de compétences et une feuille de route d\'action sur 3 mois',
    'mode.career.cta': 'Commencer le Coaching Carrière →',
    'mode.startup.title': 'Coach Startup',
    'mode.startup.description': 'Découvrez des idées de startup sur mesure, créez des pitches d\'ascenseur et développez des stratégies commerciales',
    'mode.startup.cta': 'Commencer le Coaching Startup →',

    // Career Coach
    'career.title': 'Coach Carrière',
    'career.subtitle': 'Obtenez des conseils de carrière personnalisés basés sur votre profil',
    'career.generate': 'Obtenir Ma Recommandation Carrière',
    'career.generating': 'Génération de Votre Plan de Carrière...',
    'career.keySkills': 'Compétences Clés à Développer',
    'career.actionPlan': 'Plan d\'Action sur 3 Mois',
    'career.month': 'Mois',
    'career.chat.title': 'Demandez à Votre Coach Carrière',
    'career.chat.placeholder': 'Posez des questions sur le développement de carrière, les compétences ou les stratégies de recherche d\'emploi...',
    'career.chat.empty': 'Demandez-moi tout sur votre parcours professionnel, le développement de compétences ou les stratégies de recherche d\'emploi !',

    // Startup Coach
    'startup.title': 'Coach Startup',
    'startup.subtitle': 'Découvrez votre idée de startup parfaite et votre stratégie commerciale',
    'startup.generate': 'Obtenir Ma Recommandation Startup',
    'startup.generating': 'Génération de Votre Idée de Startup...',
    'startup.idea': 'Votre Idée de Startup',
    'startup.elevatorPitch': 'Pitch d\'Ascenseur',
    'startup.mvpFeatures': 'Fonctionnalités MVP Clés',
    'startup.businessModel': 'Modèle Économique',
    'startup.goToMarket': 'Stratégie de Lancement',
    'startup.chat.title': 'Demandez à Votre Coach Startup',
    'startup.chat.placeholder': 'Posez des questions sur le financement, la validation, les stratégies marketing...',
    'startup.chat.empty': 'Demandez-moi tout sur le financement, la validation, la constitution d\'équipe ou les défis de startup !',

    // Common
    'common.thinking': 'Réflexion...',
    'common.send': 'Envoyer',
    'common.error': 'Je m\'excuse, mais j\'ai rencontré une erreur. Veuillez réessayer votre question.',
    'common.poweredBy': 'Propulsé par Google Gemini AI',
    'common.tagline': 'Obtenez des conseils personnalisés en carrière et startup adaptés à votre profil unique',

    // Footer
    'footer.poweredBy': 'Propulsé par Google Gemini AI',
    'footer.description': 'Obtenez des conseils personnalisés en carrière et startup adaptés à votre profil unique'
  },
  en: {
    // Header
    'header.title': 'AI Advisor',
    'header.subtitle': 'Your Personal Career & Startup Coach',
    'header.editProfile': 'Edit Profile',

    // Profile Form
    'profile.title': 'Create Your Profile',
    'profile.subtitle': 'Tell us about yourself to get personalized advice',
    'profile.name': 'Full Name',
    'profile.name.placeholder': 'Enter your full name',
    'profile.currentRole': 'Current Role',
    'profile.currentRole.placeholder': 'e.g., Software Developer',
    'profile.yearsExperience': 'Years of Experience',
    'profile.industry': 'Preferred Industry',
    'profile.industry.select': 'Select an industry',
    'profile.industry.technology': 'Technology',
    'profile.industry.healthcare': 'Healthcare',
    'profile.industry.finance': 'Finance',
    'profile.industry.education': 'Education',
    'profile.industry.marketing': 'Marketing',
    'profile.industry.design': 'Design',
    'profile.industry.consulting': 'Consulting',
    'profile.industry.manufacturing': 'Manufacturing',
    'profile.industry.retail': 'Retail',
    'profile.industry.other': 'Other',
    'profile.skills': 'Skills',
    'profile.skills.subtitle': '(Add at least 3)',
    'profile.skills.placeholder': 'e.g., JavaScript, Project Management, Data Analysis',
    'profile.skills.add': 'Add',
    'profile.interests': 'Interests',
    'profile.interests.subtitle': '(Add at least 2)',
    'profile.interests.placeholder': 'e.g., AI, Sustainability, Gaming, Travel',
    'profile.experienceLevel': 'Experience Level',
    'profile.experienceLevel.beginner': 'Beginner',
    'profile.experienceLevel.intermediate': 'Intermediate',
    'profile.experienceLevel.advanced': 'Advanced',
    'profile.experienceLevel.expert': 'Expert',
    'profile.goals': 'Primary Goals',
    'profile.goals.employment': 'Find Employment',
    'profile.goals.entrepreneurship': 'Start a Business',
    'profile.goals.both': 'Explore Both',
    'profile.submit': 'Get My Personalized Advice',

    // Welcome
    'welcome.title': 'Welcome, {name}!',
    'welcome.subtitle': 'Choose your coaching mode or explore both options',

    // Mode Selection
    'mode.career.title': 'Career Coach',
    'mode.career.description': 'Get personalized career recommendations, skill development plans, and a 3-month action roadmap',
    'mode.career.cta': 'Start Career Coaching →',
    'mode.startup.title': 'Startup Coach',
    'mode.startup.description': 'Discover tailored startup ideas, create elevator pitches, and develop business strategies',
    'mode.startup.cta': 'Start Startup Coaching →',

    // Career Coach
    'career.title': 'Career Coach',
    'career.subtitle': 'Get personalized career guidance based on your profile',
    'career.generate': 'Get My Career Recommendation',
    'career.generating': 'Generating Your Career Plan...',
    'career.keySkills': 'Key Skills to Develop',
    'career.actionPlan': '3-Month Action Plan',
    'career.month': 'Month',
    'career.chat.title': 'Ask Your Career Coach',
    'career.chat.placeholder': 'Ask about career development, skills, or job search strategies...',
    'career.chat.empty': 'Ask me anything about your career path, skill development, or job search strategies!',

    // Startup Coach
    'startup.title': 'Startup Coach',
    'startup.subtitle': 'Discover your perfect startup idea and business strategy',
    'startup.generate': 'Get My Startup Recommendation',
    'startup.generating': 'Generating Your Startup Idea...',
    'startup.idea': 'Your Startup Idea',
    'startup.elevatorPitch': 'Elevator Pitch',
    'startup.mvpFeatures': 'MVP Key Features',
    'startup.businessModel': 'Business Model',
    'startup.goToMarket': 'Go-to-Market Strategy',
    'startup.chat.title': 'Ask Your Startup Coach',
    'startup.chat.placeholder': 'Ask about funding, validation, marketing strategies...',
    'startup.chat.empty': 'Ask me about funding, validation, team building, or any startup challenges!',

    // Common
    'common.thinking': 'Thinking...',
    'common.send': 'Send',
    'common.error': 'I apologize, but I encountered an error. Please try asking your question again.',
    'common.poweredBy': 'Powered by Google Gemini AI',
    'common.tagline': 'Get personalized career and startup advice tailored to your unique profile',

    // Footer
    'footer.poweredBy': 'Powered by Google Gemini AI',
    'footer.description': 'Get personalized career and startup advice tailored to your unique profile'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}