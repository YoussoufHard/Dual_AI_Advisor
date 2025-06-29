export interface UserProfile {
  name: string;
  skills: string[];
  interests: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  goals: 'employment' | 'entrepreneurship' | 'both';
  industry: string;
  currentRole?: string;
  yearsExperience: number;
}

export interface CareerRecommendation {
  jobTitle: string;
  industry: string;
  explanation: string;
  keySkills: string[];
  actionPlan: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
}

export interface StartupRecommendation {
  idea: string;
  elevatorPitch: string;
  mvpFeatures: string[];
  businessModel: string;
  goToMarket: string[];
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}