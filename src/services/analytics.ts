// Service d'analytics
export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: UserEvent[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Tracking des événements
  track(eventType: string, eventData: Record<string, any> = {}) {
    const event: UserEvent = {
      id: crypto.randomUUID(),
      userId: this.getCurrentUserId(),
      eventType: eventType as any,
      eventData,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    this.sendToServer(event);
  }

  // Tracking spécifique pour les pages
  trackPageView(page: string) {
    this.track('page_view', { page });
  }

  // Tracking pour les recommandations
  trackRecommendationGenerated(type: 'career' | 'startup', profile: any) {
    this.track('recommendation_generated', { type, profile });
  }

  // Tracking pour le feedback
  trackFeedback(recommendationId: string, feedback: 'positive' | 'negative' | 'neutral') {
    this.track('user_feedback', { recommendationId, feedback });
  }

  // Tracking pour les messages de chat
  trackChatMessage(message: string, type: 'user' | 'ai') {
    this.track('chat_message', { message: message.substring(0, 100), type });
  }

  private getCurrentUserId(): string {
    // Implémentation pour récupérer l'ID utilisateur
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
      // Envoyer à votre backend analytics
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  // Récupération des métriques
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    const response = await fetch(`/api/analytics/users/${userId}/metrics`);
    return response.json();
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const response = await fetch('/api/analytics/platform/metrics');
    return response.json();
  }
}

// Hook React pour l'analytics
import { useEffect } from 'react';

export function useAnalytics() {
  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    // Track page view automatiquement
    analytics.trackPageView(window.location.pathname);
  }, []);

  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackRecommendationGenerated: analytics.trackRecommendationGenerated.bind(analytics),
    trackFeedback: analytics.trackFeedback.bind(analytics),
    trackChatMessage: analytics.trackChatMessage.bind(analytics)
  };
}