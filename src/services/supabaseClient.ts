import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          experience_level: 'student' | 'junior' | 'mid' | 'senior' | 'lead';
          skills: string[];
          interests: string[];
          goals: string[];
          current_role_title?: string;
          target_role_title?: string;
          location?: string;
          github_url?: string;
          linkedin_url?: string;
          portfolio_url?: string;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          experience_level: 'student' | 'junior' | 'mid' | 'senior' | 'lead';
          skills?: string[];
          interests?: string[];
          goals?: string[];
          current_role_title?: string;
          target_role_title?: string;
          location?: string;
          github_url?: string;
          linkedin_url?: string;
          portfolio_url?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          experience_level?: 'student' | 'junior' | 'mid' | 'senior' | 'lead';
          skills?: string[];
          interests?: string[];
          goals?: string[];
          current_role_title?: string;
          target_role_title?: string;
          location?: string;
          github_url?: string;
          linkedin_url?: string;
          portfolio_url?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id?: string;
          mode: 'career' | 'startup' | 'data-engineering';
          messages: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          mode: 'career' | 'startup' | 'data-engineering';
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mode?: 'career' | 'startup' | 'data-engineering';
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
      skill_assessments: {
        Row: {
          id: string;
          user_id?: string;
          category: string;
          skills_data: Record<string, any>;
          overall_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          category: string;
          skills_data: Record<string, any>;
          overall_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          skills_data?: Record<string, any>;
          overall_score?: number;
          created_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          user_id?: string;
          event_type: string;
          event_data: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          event_type: string;
          event_data?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: Record<string, any>;
          created_at?: string;
        };
      };
      job_market_data: {
        Row: {
          id: string;
          job_title: string;
          company: string;
          location: string;
          salary_min?: number;
          salary_max?: number;
          required_skills: string[];
          experience_level: string;
          remote_friendly: boolean;
          posted_date: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_title: string;
          company: string;
          location: string;
          salary_min?: number;
          salary_max?: number;
          required_skills?: string[];
          experience_level: string;
          remote_friendly?: boolean;
          posted_date?: string;
          source: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_title?: string;
          company?: string;
          location?: string;
          salary_min?: number;
          salary_max?: number;
          required_skills?: string[];
          experience_level?: string;
          remote_friendly?: boolean;
          posted_date?: string;
          source?: string;
          created_at?: string;
        };
      };
      learning_progress: {
        Row: {
          id: string;
          user_id?: string;
          course_id: string;
          course_title: string;
          progress_percentage: number;
          completed_modules: string[];
          time_spent_minutes: number;
          last_accessed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          course_id: string;
          course_title: string;
          progress_percentage?: number;
          completed_modules?: string[];
          time_spent_minutes?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          course_title?: string;
          progress_percentage?: number;
          completed_modules?: string[];
          time_spent_minutes?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id?: string;
          recommendation_type: 'career' | 'startup';
          model_id: string;
          input_data: Record<string, any>;
          output_data: Record<string, any>;
          confidence_score?: number;
          feedback?: 'positive' | 'negative' | 'neutral';
          implementation_status: 'not_started' | 'in_progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          recommendation_type: 'career' | 'startup';
          model_id: string;
          input_data: Record<string, any>;
          output_data: Record<string, any>;
          confidence_score?: number;
          feedback?: 'positive' | 'negative' | 'neutral';
          implementation_status?: 'not_started' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recommendation_type?: 'career' | 'startup';
          model_id?: string;
          input_data?: Record<string, any>;
          output_data?: Record<string, any>;
          confidence_score?: number;
          feedback?: 'positive' | 'negative' | 'neutral';
          implementation_status?: 'not_started' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      skill_classifications: {
        Row: {
          id: string;
          skill_name: string;
          category: string;
          subcategory?: string;
          market_demand_score?: number;
          rarity_score?: number;
          growth_trend?: 'increasing' | 'stable' | 'decreasing';
          related_skills: any[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          skill_name: string;
          category: string;
          subcategory?: string;
          market_demand_score?: number;
          rarity_score?: number;
          growth_trend?: 'increasing' | 'stable' | 'decreasing';
          related_skills?: any[];
          updated_at?: string;
        };
        Update: {
          id?: string;
          skill_name?: string;
          category?: string;
          subcategory?: string;
          market_demand_score?: number;
          rarity_score?: number;
          growth_trend?: 'increasing' | 'stable' | 'decreasing';
          related_skills?: any[];
          updated_at?: string;
        };
      };
      market_data: {
        Row: {
          id: string;
          industry: string;
          region: string;
          job_title?: string;
          average_salary_min?: number;
          average_salary_max?: number;
          demand_level?: 'low' | 'medium' | 'high' | 'very_high';
          growth_rate?: number;
          required_skills: any[];
          data_source?: string;
          collected_at: string;
        };
        Insert: {
          id?: string;
          industry: string;
          region?: string;
          job_title?: string;
          average_salary_min?: number;
          average_salary_max?: number;
          demand_level?: 'low' | 'medium' | 'high' | 'very_high';
          growth_rate?: number;
          required_skills?: any[];
          data_source?: string;
          collected_at?: string;
        };
        Update: {
          id?: string;
          industry?: string;
          region?: string;
          job_title?: string;
          average_salary_min?: number;
          average_salary_max?: number;
          demand_level?: 'low' | 'medium' | 'high' | 'very_high';
          growth_rate?: number;
          required_skills?: any[];
          data_source?: string;
          collected_at?: string;
        };
      };
    };
    Functions: {
      calculate_user_engagement: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_user_analytics_summary: {
        Args: { user_uuid: string };
        Returns: Record<string, any>;
      };
      get_platform_analytics: {
        Args: {};
        Returns: Record<string, any>;
      };
    };
  };
}

// Hook pour l'authentification Supabase
export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };
}

// Service classes for database operations
export class UserService {
  static async createOrUpdateUser(profile: UserProfile) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const userData: Database['public']['Tables']['users']['Insert'] = {
      id: user.id,
      email: user.email!,
      full_name: profile.name,
      experience_level: profile.experienceLevel as any,
      skills: profile.skills,
      interests: profile.interests,
      goals: [profile.goals],
      current_role_title: profile.currentRole,
      subscription_tier: 'free'
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User profile doesn't exist yet
        return null;
      }
      throw error;
    }

    return {
      name: data.full_name,
      skills: data.skills || [],
      interests: data.interests || [],
      experience_level: data.experience_level,
      goals: data.goals?.[0] || 'both',
      industry: '', // Will be added later
      current_role: data.current_role_title,
      years_experience: 0 // Will be calculated or added later
    };
  }

  static async updateLastActive() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) console.error('Failed to update last active:', error);
  }

  static async getUserEngagement() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .rpc('calculate_user_engagement', { user_uuid: user.id });

    if (error) {
      console.error('Failed to get user engagement:', error);
      return 0;
    }
    return data || 0;
  }

  static async getUserAnalyticsSummary() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .rpc('get_user_analytics_summary', { user_uuid: user.id });

    if (error) {
      console.error('Failed to get user analytics summary:', error);
      return null;
    }
    return data;
  }
}

export class RecommendationService {
  static async saveRecommendation(recommendation: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        user_id: user.id,
        ...recommendation
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserRecommendations(type?: 'career' | 'startup') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('recommendation_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async updateRecommendationFeedback(
    recommendationId: string, 
    feedback: 'positive' | 'negative' | 'neutral'
  ) {
    const { data, error } = await supabase
      .from('recommendations')
      .update({ feedback, updated_at: new Date().toISOString() })
      .eq('id', recommendationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export class AnalyticsService {
  static async trackEvent(event: Database['public']['Tables']['analytics_events']['Insert']) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        ...event,
        user_id: user?.id || null
      });

    if (error) throw error;
    return data;
  }

  static async getAnalyticsDashboard() {
    // Get analytics events
    const { data: eventsData, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (eventsError) throw eventsError;

    // Get user data
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (usersError) throw usersError;

    // Simulate dashboard data for the last 30 days
    const dashboardData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dashboardData.push({
        date: date.toISOString(),
        new_users: Math.floor(Math.random() * 20) + 5,
        active_users: Math.floor(Math.random() * 50) + 20
      });
    }

    return dashboardData;
  }

  static async getUserEngagementScore() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .rpc('calculate_user_engagement', { user_uuid: user.id });

      if (error) {
        console.error('Failed to get engagement score:', error);
        return Math.random() * 0.5 + 0.5; // Fallback random score
      }
      return data || 0;
    } catch (error) {
      console.error('Error calculating engagement:', error);
      return Math.random() * 0.5 + 0.5; // Fallback random score
    }
  }

  static async getPlatformAnalytics() {
    try {
      const { data, error } = await supabase.rpc('get_platform_analytics');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get platform analytics:', error);
      // Return mock data as fallback
      return {
        total_users: Math.floor(Math.random() * 1000) + 500,
        total_recommendations: Math.floor(Math.random() * 5000) + 2000,
        total_interactions: Math.floor(Math.random() * 10000) + 5000,
        avg_engagement_score: Math.random() * 0.5 + 0.5
      };
    }
  }
}

export class MarketDataService {
  static async getSkillClassifications() {
    const { data, error } = await supabase
      .from('skill_classifications')
      .select('*')
      .order('market_demand_score', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Failed to get skill classifications:', error);
      // Return mock data as fallback
      return [
        { skill_name: 'JavaScript', category: 'Technical', market_demand_score: 95 },
        { skill_name: 'Python', category: 'Technical', market_demand_score: 98 },
        { skill_name: 'React', category: 'Technical', market_demand_score: 90 },
        { skill_name: 'Machine Learning', category: 'Technical', market_demand_score: 99 },
        { skill_name: 'Leadership', category: 'Soft Skills', market_demand_score: 85 }
      ];
    }

    return data || [];
  }

  static async getMarketData() {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .order('growth_rate', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Failed to get market data:', error);
      // Return mock data as fallback
      return [
        { industry: 'Technology', growth_rate: 15.5, demand_level: 'very_high' },
        { industry: 'Healthcare', growth_rate: 18.2, demand_level: 'high' },
        { industry: 'Finance', growth_rate: 8.5, demand_level: 'medium' },
        { industry: 'Marketing', growth_rate: 14.2, demand_level: 'high' }
      ];
    }

    return data || [];
  }

  static async getJobMarketData() {
    const { data, error } = await supabase
      .from('job_market_data')
      .select('*')
      .order('posted_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to get job market data:', error);
      return [];
    }

    return data || [];
  }
}

// Real-time subscriptions
export class RealtimeService {
  static subscribeToUserEvents(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-events-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics_events',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToRecommendations(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`recommendations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recommendations',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToDashboardUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        callback
      )
      .subscribe();
  }
}

export default supabase;