// Types pour le système d'analytics
export interface UserEvent {
  id: string;
  userId: string;
  eventType: 'page_view' | 'button_click' | 'form_submit' | 'recommendation_generated' | 'chat_message';
  eventData: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userAgent: string;
  ip?: string;
}

export interface UserMetrics {
  userId: string;
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number;
  lastActiveDate: Date;
  conversionEvents: number;
  satisfactionScore?: number;
}

export interface RecommendationMetrics {
  recommendationId: string;
  userId: string;
  type: 'career' | 'startup';
  generatedAt: Date;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  followUpQuestions: number;
  implementationStatus?: 'not_started' | 'in_progress' | 'completed';
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  recommendationsGenerated: number;
  averageSatisfactionScore: number;
  topSkills: Array<{ skill: string; count: number }>;
  topIndustries: Array<{ industry: string; count: number }>;
  conversionRate: number;
}