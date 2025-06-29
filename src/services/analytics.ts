import { UserEvent, UserMetrics, PlatformMetrics, RecommendationMetrics } from '../types/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: UserEvent[] = [];
  private isInitialized = false;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Générer un ID utilisateur unique si nécessaire
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', crypto.randomUUID());
    }
    
    // Démarrer la session
    this.startSession();
    
    // Envoyer les événements en batch toutes les 30 secondes
    setInterval(() => {
      this.flushEvents();
    }, 30000);
    
    this.isInitialized = true;
  }

  // Tracking des événements
  track(eventType: string, eventData: Record<string, any> = {}) {
    const event: UserEvent = {
      id: crypto.randomUUID(),
      userId: this.getCurrentUserId(),
      eventType: eventType as any,
      eventData: {
        ...eventData,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: Date.now()
      },
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    
    // Envoyer immédiatement les événements critiques
    if (['recommendation_generated', 'user_feedback', 'error'].includes(eventType)) {
      this.sendToServer(event);
    }
  }

  // Tracking spécifique pour les pages
  trackPageView(page: string) {
    this.track('page_view', { 
      page,
      title: document.title,
      loadTime: performance.now()
    });
  }

  // Tracking pour les recommandations
  trackRecommendationGenerated(type: 'career' | 'startup', profile: any) {
    this.track('recommendation_generated', { 
      type, 
      profileSkillsCount: profile.skills?.length || 0,
      profileInterestsCount: profile.interests?.length || 0,
      experienceLevel: profile.experienceLevel,
      industry: profile.industry
    });
  }

  // Tracking pour le feedback
  trackFeedback(recommendationId: string, feedback: 'positive' | 'negative' | 'neutral') {
    this.track('user_feedback', { recommendationId, feedback });
  }

  // Tracking pour les messages de chat
  trackChatMessage(message: string, type: 'user' | 'ai', mode: 'career' | 'startup') {
    this.track('chat_message', { 
      messageLength: message.length,
      type,
      mode,
      wordCount: message.split(' ').length
    });
  }

  // Tracking pour les interactions UI
  trackButtonClick(buttonName: string, context: string) {
    this.track('button_click', { buttonName, context });
  }

  // Tracking pour les erreurs
  trackError(error: string, context: string) {
    this.track('error', { error, context, stack: new Error().stack });
  }

  // Tracking pour les performances
  trackPerformance(metric: string, value: number, context: string) {
    this.track('performance', { metric, value, context });
  }

  private startSession() {
    const sessionStart = Date.now();
    sessionStorage.setItem('sessionStart', sessionStart.toString());
    
    this.track('session_start', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private async sendToServer(event: UserEvent) {
    try {
      // En développement, on log dans la console
      if (import.meta.env.DEV) {
        console.log('📊 Analytics Event:', event);
        return;
      }

      // En production, envoyer à votre backend analytics
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  private async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      if (import.meta.env.DEV) {
        console.log('📊 Flushing Analytics Events:', eventsToSend.length);
        return;
      }

      await fetch('/api/analytics/events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Remettre les événements dans la queue en cas d'erreur
      this.events.unshift(...eventsToSend);
    }
  }

  // Récupération des métriques (simulation pour le développement)
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    // Simulation de données pour le développement
    return {
      userId,
      totalSessions: Math.floor(Math.random() * 50) + 10,
      totalPageViews: Math.floor(Math.random() * 200) + 50,
      averageSessionDuration: Math.floor(Math.random() * 600) + 120, // en secondes
      lastActiveDate: new Date(),
      conversionEvents: Math.floor(Math.random() * 10) + 1,
      satisfactionScore: Math.random() * 0.4 + 0.6 // Entre 0.6 et 1.0
    };
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    // Simulation de données pour le développement
    const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Project Management'];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Design', 'Consulting'];

    return {
      totalUsers: Math.floor(Math.random() * 10000) + 5000,
      activeUsers: {
        daily: Math.floor(Math.random() * 500) + 200,
        weekly: Math.floor(Math.random() * 2000) + 800,
        monthly: Math.floor(Math.random() * 5000) + 2000
      },
      recommendationsGenerated: Math.floor(Math.random() * 15000) + 8000,
      averageSatisfactionScore: Math.random() * 0.3 + 0.7,
      topSkills: skills.map(skill => ({
        skill,
        count: Math.floor(Math.random() * 1000) + 100
      })).sort((a, b) => b.count - a.count),
      topIndustries: industries.map(industry => ({
        industry,
        count: Math.floor(Math.random() * 800) + 200
      })).sort((a, b) => b.count - a.count),
      conversionRate: Math.random() * 0.1 + 0.15 // Entre 15% et 25%
    };
  }
}

// Hook React pour l'analytics
import { useEffect } from 'react';

export function useAnalytics() {
  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    analytics.initialize();
    // Track page view automatiquement
    analytics.trackPageView(window.location.pathname);
  }, []);

  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackRecommendationGenerated: analytics.trackRecommendationGenerated.bind(analytics),
    trackFeedback: analytics.trackFeedback.bind(analytics),
    trackChatMessage: analytics.trackChatMessage.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics)
  };
}