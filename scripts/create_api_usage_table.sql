-- =====================================================
-- API Usage Tracking Tables
-- =====================================================
-- এই tables user দের API usage track করার জন্য
-- Address generator এবং Email2Name API এর জন্য

-- Global API limits table (applies to all users)
CREATE TABLE IF NOT EXISTS public.global_api_limits (
    id SERIAL PRIMARY KEY,
    api_type TEXT NOT NULL UNIQUE CHECK (api_type IN ('address_generator', 'email2name')),
    daily_limit INTEGER NOT NULL DEFAULT 200,
    is_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default global limits
INSERT INTO public.global_api_limits (api_type, daily_limit, is_unlimited) 
VALUES 
    ('address_generator', 200, FALSE),
    ('email2name', 200, FALSE)
ON CONFLICT (api_type) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_type TEXT NOT NULL CHECK (api_type IN ('address_generator', 'email2name')),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_count INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 200,
  is_unlimited BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per API per day
  UNIQUE(user_id, api_type, usage_date)
);

-- User-specific API limits table (overrides global limits)
CREATE TABLE IF NOT EXISTS public.api_user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_type TEXT NOT NULL CHECK (api_type IN ('address_generator', 'email2name')),
  daily_limit INTEGER NOT NULL DEFAULT 200,
  is_unlimited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure one limit per user per API
  UNIQUE(user_id, api_type)
);

-- API request logs table (optional detailed logging)
CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  api_type TEXT NOT NULL CHECK (api_type IN ('address_generator', 'email2name')),
  request_data JSONB,
  response_data JSONB,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Indexes for api_usage table
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON public.api_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_type ON public.api_usage(api_type);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON public.api_usage(usage_date);

-- Indexes for api_user_limits table
CREATE INDEX IF NOT EXISTS idx_api_user_limits_user ON public.api_user_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_api_user_limits_api_type ON public.api_user_limits(api_type);

-- Indexes for api_request_logs table
CREATE INDEX IF NOT EXISTS idx_api_request_logs_user ON public.api_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_api_type ON public.api_request_logs(api_type);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at ON public.api_request_logs(created_at);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "System can insert API usage" ON public.api_usage;
DROP POLICY IF EXISTS "System can update API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can view their own limits" ON public.api_user_limits;
DROP POLICY IF EXISTS "Admins can manage all limits" ON public.api_user_limits;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.api_request_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.api_request_logs;

-- RLS Policies for api_usage
CREATE POLICY "Users can view their own API usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API usage"
  ON public.api_usage FOR SELECT
  USING (true);

CREATE POLICY "System can insert API usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update API usage"
  ON public.api_usage FOR UPDATE
  USING (true);

-- RLS Policies for api_user_limits
CREATE POLICY "Users can view their own limits"
  ON public.api_user_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all limits"
  ON public.api_user_limits FOR ALL
  USING (true);

-- RLS Policies for api_request_logs
CREATE POLICY "Users can view their own logs"
  ON public.api_request_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs"
  ON public.api_request_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_api_usage_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to handle updated_at for user limits
CREATE OR REPLACE FUNCTION public.handle_api_user_limits_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS api_usage_updated_at ON public.api_usage;
CREATE TRIGGER api_usage_updated_at
  BEFORE UPDATE ON public.api_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_api_usage_updated_at();

DROP TRIGGER IF EXISTS api_user_limits_updated_at ON public.api_user_limits;
CREATE TRIGGER api_user_limits_updated_at
  BEFORE UPDATE ON public.api_user_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_api_user_limits_updated_at();

-- Function to get or create daily usage record (updated to use global limits)
CREATE OR REPLACE FUNCTION public.get_or_create_daily_usage(
  p_user_id UUID,
  p_api_type TEXT,
  p_usage_date DATE DEFAULT CURRENT_DATE
)
RETURNS public.api_usage
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage_record api_usage;
  v_user_limit api_user_limits;
  v_global_limit global_api_limits;
  v_default_limit INTEGER := 200;
  v_is_unlimited BOOLEAN := FALSE;
BEGIN
  -- Try to get existing record
  SELECT * INTO v_usage_record
  FROM api_usage
  WHERE user_id = p_user_id
    AND api_type = p_api_type
    AND usage_date = p_usage_date;
  
  -- If record exists, return it
  IF FOUND THEN
    RETURN v_usage_record;
  END IF;
  
  -- Get global limit for this API type
  SELECT * INTO v_global_limit
  FROM global_api_limits
  WHERE api_type = p_api_type;
  
  -- Use global limit as default if found
  IF FOUND THEN
    v_default_limit := v_global_limit.daily_limit;
    v_is_unlimited := v_global_limit.is_unlimited;
  END IF;
  
  -- Get user specific limit if exists (overrides global limit)
  SELECT * INTO v_user_limit
  FROM api_user_limits
  WHERE user_id = p_user_id
    AND api_type = p_api_type;
  
  -- Use user specific limit if exists (overrides global)
  IF FOUND THEN
    v_default_limit := v_user_limit.daily_limit;
    v_is_unlimited := v_user_limit.is_unlimited;
  END IF;
  
  -- Create new record
  INSERT INTO api_usage (user_id, api_type, usage_date, daily_count, daily_limit, is_unlimited)
  VALUES (p_user_id, p_api_type, p_usage_date, 0, v_default_limit, v_is_unlimited)
  RETURNING * INTO v_usage_record;
  
  RETURN v_usage_record;
END;
$$;

-- Function to increment API usage
CREATE OR REPLACE FUNCTION public.increment_api_usage(
  p_user_id UUID,
  p_api_type TEXT,
  p_usage_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage_record api_usage;
  v_result JSONB;
BEGIN
  -- Get or create usage record
  SELECT * INTO v_usage_record
  FROM get_or_create_daily_usage(p_user_id, p_api_type, p_usage_date);
  
  -- Check if user has unlimited access
  IF v_usage_record.is_unlimited THEN
    -- Update last used time
    UPDATE api_usage
    SET last_used_at = NOW()
    WHERE id = v_usage_record.id;
    
    RETURN jsonb_build_object(
      'success', TRUE,
      'unlimited', TRUE,
      'daily_count', v_usage_record.daily_count,
      'daily_limit', v_usage_record.daily_limit,
      'remaining', 'unlimited'
    );
  END IF;
  
  -- Check if limit exceeded
  IF v_usage_record.daily_count >= v_usage_record.daily_limit THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'unlimited', FALSE,
      'daily_count', v_usage_record.daily_count,
      'daily_limit', v_usage_record.daily_limit,
      'remaining', 0,
      'error', 'Daily limit exceeded'
    );
  END IF;
  
  -- Increment usage count
  UPDATE api_usage
  SET daily_count = daily_count + 1,
      last_used_at = NOW()
  WHERE id = v_usage_record.id
  RETURNING daily_count, daily_limit INTO v_usage_record.daily_count, v_usage_record.daily_limit;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'unlimited', FALSE,
    'daily_count', v_usage_record.daily_count,
    'daily_limit', v_usage_record.daily_limit,
    'remaining', v_usage_record.daily_limit - v_usage_record.daily_count
  );
END;
$$;

-- =====================================================
-- Sample Data (Optional)
-- =====================================================

-- Insert sample admin user limits (comment out if not needed)
-- INSERT INTO api_user_limits (user_id, api_type, daily_limit, is_unlimited)
-- SELECT 
--   (SELECT id FROM auth.users LIMIT 1),
--   'address_generator',
--   500,
--   FALSE
-- WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
-- ON CONFLICT (user_id, api_type) DO NOTHING;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
