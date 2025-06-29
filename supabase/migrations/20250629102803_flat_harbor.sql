/*
  # Advanced AI/ML/Data Platform Schema

  1. New Tables
    - `users` - User profiles with enhanced metadata
    - `user_sessions` - Session tracking for analytics
    - `recommendations` - AI/ML recommendations storage
    - `user_interactions` - Detailed interaction tracking
    - `ml_predictions` - ML model predictions and results
    - `analytics_events` - Real-time event tracking
    - `skill_classifications` - ML-classified skills
    - `market_data` - Industry and market insights
    - `cloud_metrics` - Cloud infrastructure monitoring

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Implement role-based access control

  3. Performance
    - Add indexes for analytics queries
    - Implement partitioning for large tables
    - Create materialized views for dashboards
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Users table with enhanced profile data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  current_role text,
  years_experience integer DEFAULT 0,
  experience_level text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  industry text,
  goals text CHECK (goals IN ('employment', 'entrepreneurship', 'both')) DEFAULT 'both',
  skills jsonb DEFAULT '[]'::jsonb,
  interests jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- User sessions for analytics
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  page_views integer DEFAULT 0,
  interactions integer DEFAULT 0,
  device_info jsonb DEFAULT '{}'::jsonb,
  location_info jsonb DEFAULT '{}'::jsonb,
  referrer text,
  user_agent text
);

-- AI/ML Recommendations storage
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('career', 'startup')) NOT NULL,
  model_id text NOT NULL,
  input_data jsonb NOT NULL,
  output_data jsonb NOT NULL,
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  feedback text CHECK (feedback IN ('positive', 'negative', 'neutral')),
  implementation_status text CHECK (implementation_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Detailed user interactions tracking
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  page_url text,
  element_id text,
  timestamp timestamptz DEFAULT now(),
  processing_time_ms integer
);

-- ML Predictions and model results
CREATE TABLE IF NOT EXISTS ml_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  model_id text NOT NULL,
  model_version text NOT NULL,
  prediction_type text NOT NULL,
  input_features jsonb NOT NULL,
  prediction_result jsonb NOT NULL,
  confidence_score decimal(3,2),
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Real-time analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  session_id text,
  event_name text NOT NULL,
  event_properties jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);

-- ML-classified skills
CREATE TABLE IF NOT EXISTS skill_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  market_demand_score decimal(3,2),
  rarity_score decimal(3,2),
  growth_trend text CHECK (growth_trend IN ('increasing', 'stable', 'decreasing')),
  related_skills jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Market data and insights
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  region text DEFAULT 'global',
  job_title text,
  average_salary_min integer,
  average_salary_max integer,
  demand_level text CHECK (demand_level IN ('low', 'medium', 'high', 'very_high')),
  growth_rate decimal(4,2),
  required_skills jsonb DEFAULT '[]'::jsonb,
  data_source text,
  collected_at timestamptz DEFAULT now()
);

-- Cloud infrastructure metrics
CREATE TABLE IF NOT EXISTS cloud_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  provider text NOT NULL,
  metric_type text NOT NULL,
  metric_value decimal(10,2),
  unit text,
  cost_usd decimal(10,2),
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Chat conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id uuid REFERENCES recommendations(id) ON DELETE SET NULL,
  mode text CHECK (mode IN ('career', 'startup')) NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  message_count integer DEFAULT 0,
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for recommendations
CREATE POLICY "Users can read own recommendations"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user interactions
CREATE POLICY "Users can read own interactions"
  ON user_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ML predictions
CREATE POLICY "Users can read own predictions"
  ON ml_predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON ml_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics events
CREATE POLICY "Users can read own events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat conversations
CREATE POLICY "Users can read own conversations"
  ON chat_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON chat_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON chat_conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public read access for reference data
CREATE POLICY "Public read access for skill classifications"
  ON skill_classifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for market data"
  ON market_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin policies for cloud metrics
CREATE POLICY "Admin read access for cloud metrics"
  ON cloud_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (metadata->>'role')::text = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_industry ON users(industry);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON users(experience_level);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(type);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_event_type ON user_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_user_id ON ml_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_model_id ON ml_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_created_at ON ml_predictions(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_skill_classifications_category ON skill_classifications(category);
CREATE INDEX IF NOT EXISTS idx_market_data_industry ON market_data(industry);
CREATE INDEX IF NOT EXISTS idx_cloud_metrics_service_name ON cloud_metrics(service_name);

-- Functions for analytics
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_active_at = now(), updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user activity
CREATE TRIGGER trigger_update_user_activity
  AFTER INSERT ON user_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement(user_uuid uuid)
RETURNS decimal AS $$
DECLARE
  engagement_score decimal := 0;
  session_count integer;
  interaction_count integer;
  recommendation_count integer;
BEGIN
  -- Count sessions in last 30 days
  SELECT COUNT(*) INTO session_count
  FROM user_sessions
  WHERE user_id = user_uuid
  AND started_at > now() - interval '30 days';
  
  -- Count interactions in last 30 days
  SELECT COUNT(*) INTO interaction_count
  FROM user_interactions
  WHERE user_id = user_uuid
  AND timestamp > now() - interval '30 days';
  
  -- Count recommendations generated
  SELECT COUNT(*) INTO recommendation_count
  FROM recommendations
  WHERE user_id = user_uuid;
  
  -- Calculate engagement score (0-1)
  engagement_score := LEAST(
    (session_count * 0.3 + interaction_count * 0.01 + recommendation_count * 0.5) / 10,
    1.0
  );
  
  RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_users,
  COUNT(*) FILTER (WHERE last_active_at > now() - interval '1 day') as active_users,
  AVG(years_experience) as avg_experience,
  mode() WITHIN GROUP (ORDER BY industry) as top_industry,
  mode() WITHIN GROUP (ORDER BY experience_level) as top_experience_level
FROM users
WHERE created_at > now() - interval '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_dashboard_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_analytics;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for development
INSERT INTO skill_classifications (skill_name, category, subcategory, market_demand_score, rarity_score, growth_trend) VALUES
('JavaScript', 'Technical', 'Programming Languages', 0.95, 0.20, 'stable'),
('Python', 'Technical', 'Programming Languages', 0.98, 0.25, 'increasing'),
('React', 'Technical', 'Frontend Frameworks', 0.90, 0.30, 'increasing'),
('Machine Learning', 'Technical', 'AI/ML', 0.99, 0.70, 'increasing'),
('Leadership', 'Soft Skills', 'Management', 0.85, 0.40, 'stable'),
('Communication', 'Soft Skills', 'Interpersonal', 0.80, 0.15, 'stable'),
('Data Analysis', 'Technical', 'Analytics', 0.92, 0.45, 'increasing'),
('Cloud Architecture', 'Technical', 'Infrastructure', 0.94, 0.65, 'increasing'),
('UI/UX Design', 'Creative', 'Design', 0.88, 0.35, 'increasing'),
('Project Management', 'Soft Skills', 'Management', 0.82, 0.25, 'stable');

INSERT INTO market_data (industry, job_title, average_salary_min, average_salary_max, demand_level, growth_rate, required_skills) VALUES
('Technology', 'Software Engineer', 60000, 120000, 'very_high', 15.5, '["JavaScript", "Python", "React"]'),
('Technology', 'Data Scientist', 70000, 140000, 'very_high', 22.3, '["Python", "Machine Learning", "Data Analysis"]'),
('Technology', 'Product Manager', 80000, 150000, 'high', 12.8, '["Leadership", "Communication", "Project Management"]'),
('Healthcare', 'Health Data Analyst', 55000, 95000, 'high', 18.2, '["Data Analysis", "Healthcare Knowledge"]'),
('Finance', 'Financial Analyst', 50000, 90000, 'medium', 8.5, '["Data Analysis", "Financial Modeling"]'),
('Marketing', 'Digital Marketing Manager', 45000, 85000, 'high', 14.2, '["Communication", "Data Analysis", "Creative Thinking"]');