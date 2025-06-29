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
      .update({ updated_at: new Date().toISOString() })
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
  static async saveRecommendation(recommendation: any) {
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

    return {
      events: eventsData,
      users: usersData
    };
  }

  static async refreshDashboard() {
    const { error } = await supabase.rpc('refresh_dashboard_analytics');
    if (error) throw error;
  }
}

export class MarketDataService {
  static async getSkillClassifications() {
    // Since skill_classifications table doesn't exist in the schema,
    // we'll derive skill data from job_market_data
    const { data, error } = await supabase
      .from('job_market_data')
      .select('required_skills')
      .not('required_skills', 'is', null);

    if (error) throw error;

    // Process skills data to create classifications
    const skillCounts: Record<string, number> = {};
    data?.forEach(job => {
      job.required_skills?.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Convert to the expected format
    const skillClassifications = Object.entries(skillCounts)
      .map(([skill_name, count]) => ({
        id: skill_name.toLowerCase().replace(/\s+/g, '-'),
        skill_name,
        category: 'Technical', // Default category
        market_demand_score: Math.min(100, count * 10), // Scale demand score
        rarity_score: Math.max(0, 100 - count * 5),
        growth_trend: 'stable' as const,
        related_skills: [],
        updated_at: new Date().toISOString()
      }))
      .sort((a, b) => b.market_demand_score - a.market_demand_score)
      .slice(0, 20); // Top 20 skills

    return skillClassifications;
  }

  static async getMarketData() {
    const { data, error } = await supabase
      .from('job_market_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Process market data to get industry trends
    const industryData: Record<string, { count: number, avgSalary: number, totalSalary: number }> = {};
    
    data?.forEach(job => {
      // Use job title as industry proxy
      const industry = job.job_title.split(' ')[0]; // First word as industry
      if (!industryData[industry]) {
        industryData[industry] = { count: 0, avgSalary: 0, totalSalary: 0 };
      }
      industryData[industry].count++;
      
      const salary = job.salary_min && job.salary_max 
        ? (job.salary_min + job.salary_max) / 2 
        : job.salary_min || job.salary_max || 0;
      
      industryData[industry].totalSalary += salary;
    });

    // Convert to expected format
    const marketData = Object.entries(industryData)
      .map(([industry, stats]) => ({
        id: industry.toLowerCase().replace(/\s+/g, '-'),
        industry,
        region: 'Global',
        job_title: null,
        average_salary_min: Math.round(stats.totalSalary / stats.count * 0.8),
        average_salary_max: Math.round(stats.totalSalary / stats.count * 1.2),
        demand_level: stats.count > 10 ? 'high' : stats.count > 5 ? 'medium' : 'low' as const,
        growth_rate: Math.random() * 20 - 5, // Random growth rate between -5% and 15%
        required_skills: [],
        data_source: 'job_market_data',
        collected_at: new Date().toISOString()
      }))
      .sort((a, b) => (b.growth_rate || 0) - (a.growth_rate || 0))
      .slice(0, 15); // Top 15 industries

    return marketData;
  }

  static async getJobMarketData() {
    const { data, error } = await supabase
      .from('job_market_data')
      .select('*')
      .order('posted_date', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
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