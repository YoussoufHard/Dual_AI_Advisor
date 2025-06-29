import { createClient } from '@supabase/supabase-js';

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
          name: string;
          avatar_url?: string;
          role_title?: string;
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
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          role_title?: string;
          years_experience?: number;
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          industry?: string;
          goals?: 'employment' | 'entrepreneurship' | 'both';
          skills?: string[];
          interests?: string[];
          preferences?: Record<string, any>;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          role_title?: string;
          years_experience?: number;
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          industry?: string;
          goals?: 'employment' | 'entrepreneurship' | 'both';
          skills?: string[];
          interests?: string[];
          preferences?: Record<string, any>;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
          is_active?: boolean;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
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
          user_id: string;
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
      analytics_events: {
        Row: {
          id: string;
          user_id?: string;
          session_id?: string;
          event_name: string;
          event_properties: Record<string, any>;
          event_timestamp: string;
          processed: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string;
          session_id?: string;
          event_name: string;
          event_properties?: Record<string, any>;
          event_timestamp?: string;
          processed?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          event_name?: string;
          event_properties?: Record<string, any>;
          event_timestamp?: string;
          processed?: boolean;
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
          related_skills: string[];
          updated_at: string;
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
          required_skills: string[];
          data_source?: string;
          collected_at: string;
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
      refresh_dashboard_analytics: {
        Args: {};
        Returns: void;
      };
    };
  };
}

// Service classes for database operations
export class UserService {
  static async createOrUpdateUser(userData: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'email' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateLastActive(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  }

  static async getUserEngagement(userId: string) {
    const { data, error } = await supabase
      .rpc('calculate_user_engagement', { user_uuid: userId });

    if (error) throw error;
    return data;
  }

  static async getUserAnalyticsSummary(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_analytics_summary', { user_uuid: userId });

    if (error) throw error;
    return data;
  }
}

export class RecommendationService {
  static async saveRecommendation(recommendation: Database['public']['Tables']['recommendations']['Insert']) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert(recommendation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserRecommendations(userId: string, type?: 'career' | 'startup') {
    let query = supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
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
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(event);

    if (error) throw error;
    return data;
  }

  static async getAnalyticsDashboard() {
    // Get dashboard analytics
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('dashboard_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (dashboardError) throw dashboardError;

    // Get skill classifications
    const { data: skillsData, error: skillsError } = await supabase
      .from('skill_classifications')
      .select('*')
      .order('market_demand_score', { ascending: false })
      .limit(10);

    if (skillsError) throw skillsError;

    // Get market data
    const { data: marketData, error: marketError } = await supabase
      .from('market_data')
      .select('*')
      .order('growth_rate', { ascending: false })
      .limit(10);

    if (marketError) throw marketError;

    return {
      dashboard: dashboardData,
      topSkills: skillsData,
      marketTrends: marketData
    };
  }

  static async refreshDashboard() {
    const { error } = await supabase.rpc('refresh_dashboard_analytics');
    if (error) throw error;
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