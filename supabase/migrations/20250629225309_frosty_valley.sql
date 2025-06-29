/*
  # Reset complet et reconstruction de la base de données

  1. Nouvelles Tables
    - `users` - Profils utilisateurs avec colonnes Stripe
    - `chat_sessions` - Sessions de chat IA
    - `skill_assessments` - Évaluations de compétences
    - `analytics_events` - Événements analytics
    - `job_market_data` - Données marché emploi
    - `learning_progress` - Progression apprentissage
    - `user_sessions` - Sessions utilisateur détaillées
    - `recommendations` - Recommandations IA/ML
    - `user_interactions` - Interactions utilisateur
    - `ml_predictions` - Prédictions ML
    - `skill_classifications` - Classifications de compétences
    - `market_data` - Données de marché
    - `cloud_metrics` - Métriques cloud
    - `chat_conversations` - Conversations avancées

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques granulaires par table
    - Isolation des données utilisateur

  3. Performance
    - 25+ indexes optimisés
    - 9 indexes GIN pour JSONB
    - Indexes composites pour requêtes complexes

  4. Fonctionnalités
    - Triggers automatiques pour updated_at
    - Fonctions PostgreSQL pour analytics
    - Vue matérialisée pour dashboard
    - Données d'exemple pour développement
*/

-- Supprimer toutes les tables existantes dans l'ordre correct
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS cloud_metrics CASCADE;
DROP TABLE IF EXISTS market_data CASCADE;
DROP TABLE IF EXISTS skill_classifications CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS ml_predictions CASCADE;
DROP TABLE IF EXISTS user_interactions CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS job_market_data CASCADE;
DROP TABLE IF EXISTS skill_assessments CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;

-- Supprimer les vues matérialisées
DROP MATERIALIZED VIEW IF EXISTS dashboard_analytics CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS update_user_last_active() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_engagement(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_analytics_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_platform_analytics() CASCADE;
DROP FUNCTION IF EXISTS refresh_dashboard_analytics() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Nettoyer la table users existante (garder la structure auth de Supabase)
DO $$
BEGIN
  -- Supprimer les colonnes ajoutées, garder seulement les colonnes auth de base
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
    ALTER TABLE users DROP COLUMN full_name CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'experience_level') THEN
    ALTER TABLE users DROP COLUMN experience_level CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'skills') THEN
    ALTER TABLE users DROP COLUMN skills CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'interests') THEN
    ALTER TABLE users DROP COLUMN interests CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'goals') THEN
    ALTER TABLE users DROP COLUMN goals CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_role_title') THEN
    ALTER TABLE users DROP COLUMN current_role_title CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'target_role_title') THEN
    ALTER TABLE users DROP COLUMN target_role_title CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location') THEN
    ALTER TABLE users DROP COLUMN location CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'github_url') THEN
    ALTER TABLE users DROP COLUMN github_url CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'linkedin_url') THEN
    ALTER TABLE users DROP COLUMN linkedin_url CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'portfolio_url') THEN
    ALTER TABLE users DROP COLUMN portfolio_url CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
    ALTER TABLE users DROP COLUMN subscription_tier CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE users DROP COLUMN stripe_customer_id CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE users DROP COLUMN stripe_subscription_id CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE users DROP COLUMN subscription_status CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_current_period_end') THEN
    ALTER TABLE users DROP COLUMN subscription_current_period_end CASCADE;
  END IF;
  
  -- Supprimer les contraintes personnalisées
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_experience_level_check;
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ajouter les colonnes nécessaires à la table users existante
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level text NOT NULL DEFAULT 'student' 
  CHECK (experience_level IN ('student', 'junior', 'mid', 'senior', 'lead'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_role_title text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_role_title text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' 
  CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Colonnes Stripe pour la monétisation
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

-- Ajouter les colonnes de timestamp si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
    ALTER TABLE users ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('career', 'startup', 'data-engineering')),
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skill assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  skills_data jsonb NOT NULL,
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  created_at timestamptz DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Job market data table
CREATE TABLE IF NOT EXISTS job_market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  salary_min integer,
  salary_max integer,
  required_skills text[] DEFAULT '{}',
  experience_level text NOT NULL,
  remote_friendly boolean DEFAULT false,
  posted_date timestamptz DEFAULT now(),
  source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Learning progress table
CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  course_title text NOT NULL,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_modules text[] DEFAULT '{}',
  time_spent_minutes integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User sessions for advanced analytics
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
  recommendation_type text CHECK (recommendation_type IN ('career', 'startup')) NOT NULL,
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
  event_timestamp timestamptz DEFAULT now(),
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

-- ML-classified skills
CREATE TABLE IF NOT EXISTS skill_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text UNIQUE NOT NULL,
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
  collected_at timestamptz DEFAULT now(),
  UNIQUE(industry, job_title, region)
);

-- Cloud infrastructure metrics
CREATE TABLE IF NOT EXISTS cloud_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  provider text NOT NULL,
  metric_type text NOT NULL,
  metric_value decimal(10,2),
  unit_type text,
  cost_usd decimal(10,2),
  metric_timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Chat conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id uuid REFERENCES recommendations(id) ON DELETE SET NULL,
  conversation_mode text CHECK (conversation_mode IN ('career', 'startup')) NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  message_count integer DEFAULT 0,
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5)
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for chat_sessions
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for skill_assessments
CREATE POLICY "Users can manage own skill assessments" ON skill_assessments
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for analytics_events
CREATE POLICY "Allow analytics event tracking" ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Allow anonymous analytics events" ON analytics_events
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can read own analytics events" ON analytics_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for job_market_data
CREATE POLICY "Anyone can read job market data" ON job_market_data
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for learning_progress
CREATE POLICY "Users can manage own learning progress" ON learning_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_sessions
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for recommendations
CREATE POLICY "Users can manage own recommendations" ON recommendations
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_interactions
CREATE POLICY "Users can manage own interactions" ON user_interactions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for ml_predictions
CREATE POLICY "Users can manage own predictions" ON ml_predictions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for chat_conversations
CREATE POLICY "Users can manage own conversations" ON chat_conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Public read access for reference data
CREATE POLICY "Public read access for skill classifications" ON skill_classifications
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public read access for market data" ON market_data
  FOR SELECT TO authenticated
  USING (true);

-- Admin policies for cloud metrics
CREATE POLICY "Admin read access for cloud metrics" ON cloud_metrics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND subscription_tier = 'enterprise'
    )
  );

-- Indexes pour users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON users(experience_level);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_users_skills_gin ON users USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_users_interests_gin ON users USING gin(interests);
CREATE INDEX IF NOT EXISTS idx_users_goals_gin ON users USING gin(goals);

-- Indexes pour chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);

-- Indexes pour skill_assessments
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON skill_assessments(user_id);

-- Indexes pour analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Indexes pour job_market_data
CREATE INDEX IF NOT EXISTS idx_job_market_data_posted_date ON job_market_data(posted_date);
CREATE INDEX IF NOT EXISTS idx_job_market_data_skills ON job_market_data USING gin(required_skills);

-- Indexes pour learning_progress
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);

-- Indexes pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_input_gin ON recommendations USING gin(input_data);
CREATE INDEX IF NOT EXISTS idx_recommendations_output_gin ON recommendations USING gin(output_data);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_event_type ON user_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_data_gin ON user_interactions USING gin(event_data);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_user_id ON ml_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_model_id ON ml_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_created_at ON ml_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_features_gin ON ml_predictions USING gin(input_features);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_result_gin ON ml_predictions USING gin(prediction_result);

CREATE INDEX IF NOT EXISTS idx_skill_classifications_category ON skill_classifications(category);
CREATE INDEX IF NOT EXISTS idx_skill_classifications_skill_name ON skill_classifications(skill_name);

CREATE INDEX IF NOT EXISTS idx_market_data_industry ON market_data(industry);
CREATE INDEX IF NOT EXISTS idx_market_data_job_title ON market_data(job_title);

CREATE INDEX IF NOT EXISTS idx_cloud_metrics_service_name ON cloud_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_cloud_metrics_timestamp ON cloud_metrics(metric_timestamp);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_started_at ON chat_conversations(started_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
  AND event_timestamp > now() - interval '30 days';
  
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

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', (
      SELECT COUNT(*) FROM user_sessions WHERE user_id = user_uuid
    ),
    'total_interactions', (
      SELECT COUNT(*) FROM user_interactions WHERE user_id = user_uuid
    ),
    'total_recommendations', (
      SELECT COUNT(*) FROM recommendations WHERE user_id = user_uuid
    ),
    'engagement_score', calculate_user_engagement(user_uuid),
    'favorite_skills', (
      SELECT skills FROM users WHERE id = user_uuid
    ),
    'learning_progress', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'course_title', course_title,
          'progress_percentage', progress_percentage
        )
      )
      FROM learning_progress 
      WHERE user_id = user_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform analytics
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_recommendations', (SELECT COUNT(*) FROM recommendations),
    'total_interactions', (SELECT COUNT(*) FROM user_interactions),
    'avg_engagement_score', (
      SELECT AVG(calculate_user_engagement(id)) FROM users
    ),
    'top_skills', (
      SELECT jsonb_agg(
        jsonb_build_object('skill', skill_name, 'demand_score', market_demand_score)
      )
      FROM (
        SELECT skill_name, market_demand_score
        FROM skill_classifications
        ORDER BY market_demand_score DESC NULLS LAST
        LIMIT 10
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_users,
  COUNT(*) FILTER (WHERE updated_at > now() - interval '1 day') as active_users,
  mode() WITHIN GROUP (ORDER BY experience_level) as top_experience_level
FROM users
WHERE created_at > now() - interval '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_analytics;
END;
$$ LANGUAGE plpgsql;

-- Insert sample skill classifications
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
('Project Management', 'Soft Skills', 'Management', 0.82, 0.25, 'stable')
ON CONFLICT (skill_name) DO NOTHING;

-- Insert sample market data
INSERT INTO market_data (industry, job_title, average_salary_min, average_salary_max, demand_level, growth_rate, required_skills) VALUES
('Technology', 'Software Engineer', 60000, 120000, 'very_high', 15.5, '["JavaScript", "Python", "React"]'),
('Technology', 'Data Scientist', 70000, 140000, 'very_high', 22.3, '["Python", "Machine Learning", "Data Analysis"]'),
('Technology', 'Product Manager', 80000, 150000, 'high', 12.8, '["Leadership", "Communication", "Project Management"]'),
('Healthcare', 'Health Data Analyst', 55000, 95000, 'high', 18.2, '["Data Analysis", "Healthcare Knowledge"]'),
('Finance', 'Financial Analyst', 50000, 90000, 'medium', 8.5, '["Data Analysis", "Financial Modeling"]'),
('Marketing', 'Digital Marketing Manager', 45000, 85000, 'high', 14.2, '["Communication", "Data Analysis", "Creative Thinking"]')
ON CONFLICT (industry, job_title, region) DO NOTHING;

-- Insert sample job market data
INSERT INTO job_market_data (job_title, company, location, salary_min, salary_max, required_skills, experience_level, remote_friendly, source) VALUES
('Senior React Developer', 'TechCorp', 'Paris, France', 65000, 85000, ARRAY['React', 'JavaScript', 'TypeScript'], 'senior', true, 'LinkedIn'),
('Data Scientist', 'DataCorp', 'Lyon, France', 55000, 75000, ARRAY['Python', 'Machine Learning', 'SQL'], 'mid', true, 'Indeed'),
('Product Manager', 'StartupXYZ', 'Remote', 70000, 90000, ARRAY['Product Management', 'Agile', 'Analytics'], 'senior', true, 'AngelList'),
('Full Stack Developer', 'WebAgency', 'Marseille, France', 45000, 60000, ARRAY['JavaScript', 'Node.js', 'React'], 'junior', false, 'WelcomeToTheJungle'),
('DevOps Engineer', 'CloudTech', 'Toulouse, France', 60000, 80000, ARRAY['AWS', 'Docker', 'Kubernetes'], 'mid', true, 'Stack Overflow Jobs');

-- Insert sample cloud metrics
INSERT INTO cloud_metrics (service_name, provider, metric_type, metric_value, unit_type, cost_usd) VALUES
('Compute Engine', 'Google Cloud', 'CPU Usage', 75.5, 'percentage', 245.50),
('Cloud SQL', 'Google Cloud', 'Storage Usage', 65.2, 'GB', 89.30),
('AI Platform', 'Google Cloud', 'API Calls', 15420, 'requests', 156.80),
('Cloud Storage', 'Google Cloud', 'Storage Usage', 1024.5, 'GB', 23.45),
('BigQuery', 'Google Cloud', 'Data Processed', 2.5, 'TB', 78.90),
('Cloud Security', 'Google Cloud', 'Scans Performed', 1250, 'scans', 45.60);