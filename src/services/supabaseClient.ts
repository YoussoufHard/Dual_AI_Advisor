import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  current_role?: string;
  years_experience: number;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  industry?: string;
  goals: 'employment' | 'entrepreneurship' | 'both';
  skills: string[];
  interests: string[];
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  is_active: boolean;
}

export interface DatabaseRecommendation {
  id: string;
  user_id: string;
  type: 'career' | 'startup';
  model_id: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  confidence_score: number;
  feedback?: 'positive' | 'negative' | 'neutral';
  implementation_status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface DatabaseAnalyticsEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_name: string;
  event_properties: Record<string, any>;
  timestamp: string;
  processed: boolean;
}

// Service pour la gestion des utilisateurs
export class UserService {
  static async createOrUpdateUser(profile: UserProfile): Promise<DatabaseUser> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userData = {
      id: user.id,
      email: user.email!,
      name: profile.name,
      current_role: profile.currentRole,
      years_experience: profile.yearsExperience,
      experience_level: profile.experienceLevel,
      industry: profile.industry,
      goals: profile.goals,
      skills: profile.skills,
      interests: profile.interests,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save user profile: ${error.message}`);
    }

    return data;
  }

  static async getUserProfile(): Promise<DatabaseUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }

  static async updateLastActive(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);
  }
}

// Service pour les recommandations
export class RecommendationService {
  static async saveRecommendation(
    type: 'career' | 'startup',
    modelId: string,
    inputData: Record<string, any>,
    outputData: Record<string, any>,
    confidenceScore: number
  ): Promise<DatabaseRecommendation> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        user_id: user.id,
        type,
        model_id: modelId,
        input_data: inputData,
        output_data: outputData,
        confidence_score: confidenceScore
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save recommendation: ${error.message}`);
    }

    return data;
  }

  static async getUserRecommendations(type?: 'career' | 'startup'): Promise<DatabaseRecommendation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    let query = supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    return data || [];
  }

  static async updateRecommendationFeedback(
    recommendationId: string,
    feedback: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    const { error } = await supabase
      .from('recommendations')
      .update({ 
        feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', recommendationId);

    if (error) {
      throw new Error(`Failed to update feedback: ${error.message}`);
    }
  }
}

// Service pour les analytics
export class AnalyticsService {
  static async trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    sessionId?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id,
        session_id: sessionId,
        event_name: eventName,
        event_properties: properties
      });

    if (error) {
      console.error('Failed to track event:', error);
    }
  }

  static async trackUserInteraction(
    eventType: string,
    eventData: Record<string, any>,
    sessionId: string,
    elementId?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.href,
        element_id: elementId
      });

    if (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  static async getAnalyticsDashboard(): Promise<any> {
    // Récupérer les métriques du dashboard
    const { data, error } = await supabase
      .from('dashboard_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      throw new Error(`Failed to fetch dashboard analytics: ${error.message}`);
    }

    return data;
  }

  static async getUserEngagementScore(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return 0;

    const { data, error } = await supabase
      .rpc('calculate_user_engagement', { user_uuid: user.id });

    if (error) {
      console.error('Failed to calculate engagement:', error);
      return 0;
    }

    return data || 0;
  }
}

// Service pour les prédictions ML
export class MLPredictionService {
  static async savePrediction(
    modelId: string,
    modelVersion: string,
    predictionType: string,
    inputFeatures: Record<string, any>,
    predictionResult: Record<string, any>,
    confidenceScore: number,
    executionTimeMs: number
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('ml_predictions')
      .insert({
        user_id: user.id,
        model_id: modelId,
        model_version: modelVersion,
        prediction_type: predictionType,
        input_features: inputFeatures,
        prediction_result: predictionResult,
        confidence_score: confidenceScore,
        execution_time_ms: executionTimeMs
      });

    if (error) {
      console.error('Failed to save ML prediction:', error);
    }
  }

  static async getUserPredictions(predictionType?: string): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    let query = supabase
      .from('ml_predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (predictionType) {
      query = query.eq('prediction_type', predictionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch predictions:', error);
      return [];
    }

    return data || [];
  }
}

// Service pour les données de marché
export class MarketDataService {
  static async getSkillClassifications(): Promise<any[]> {
    const { data, error } = await supabase
      .from('skill_classifications')
      .select('*')
      .order('market_demand_score', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch skill classifications: ${error.message}`);
    }

    return data || [];
  }

  static async getMarketData(industry?: string): Promise<any[]> {
    let query = supabase
      .from('market_data')
      .select('*')
      .order('collected_at', { ascending: false });

    if (industry) {
      query = query.eq('industry', industry);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }

    return data || [];
  }

  static async getIndustryInsights(industry: string): Promise<any> {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('industry', industry);

    if (error) {
      throw new Error(`Failed to fetch industry insights: ${error.message}`);
    }

    // Calculer des insights agrégés
    const insights = {
      averageSalary: 0,
      demandLevel: 'medium',
      growthRate: 0,
      topSkills: [],
      jobCount: data?.length || 0
    };

    if (data && data.length > 0) {
      insights.averageSalary = data.reduce((sum, item) => 
        sum + ((item.average_salary_min + item.average_salary_max) / 2), 0) / data.length;
      
      insights.growthRate = data.reduce((sum, item) => 
        sum + (item.growth_rate || 0), 0) / data.length;
      
      // Extraire les compétences les plus demandées
      const skillCounts: Record<string, number> = {};
      data.forEach(item => {
        if (item.required_skills) {
          item.required_skills.forEach((skill: string) => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        }
      });
      
      insights.topSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill);
    }

    return insights;
  }
}

// Hook React pour Supabase
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
}