-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive',
  carousels_used_this_month INT NOT NULL DEFAULT 0,
  quota_reset_at TIMESTAMPTZ DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carousels
CREATE TABLE IF NOT EXISTS public.carousels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'professional',
  slide_count INT NOT NULL DEFAULT 7,
  slides JSONB NOT NULL DEFAULT '[]',
  theme JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_favorite BOOLEAN DEFAULT FALSE,
  ai_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carousels_user_id ON public.carousels(user_id);
CREATE INDEX IF NOT EXISTS idx_carousels_created_at ON public.carousels(created_at DESC);

-- Plans
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INT NOT NULL,
  price_yearly INT NOT NULL,
  carousel_limit INT NOT NULL,
  slide_limit INT NOT NULL,
  export_formats TEXT[] NOT NULL DEFAULT ARRAY['png'],
  watermark BOOLEAN NOT NULL DEFAULT TRUE,
  custom_themes BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_price_monthly TEXT,
  stripe_price_yearly TEXT
);

-- Seed plans
INSERT INTO public.plans VALUES
  ('free', 'Free', 0, 0, 3, 7, ARRAY['png'], true, false, null, null),
  ('pro', 'Pro', 3700, 2900, 30, 15, ARRAY['png','pdf'], false, true, null, null),
  ('business', 'Business', 9700, 7700, -1, 20, ARRAY['png','pdf'], false, true, null, null)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "carousels_select_own" ON public.carousels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "carousels_insert_own" ON public.carousels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "carousels_update_own" ON public.carousels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "carousels_delete_own" ON public.carousels FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment carousel usage
CREATE OR REPLACE FUNCTION public.increment_carousel_usage(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET
    carousels_used_this_month = CASE
      WHEN quota_reset_at <= NOW() THEN 1
      ELSE carousels_used_this_month + 1
    END,
    quota_reset_at = CASE
      WHEN quota_reset_at <= NOW()
      THEN date_trunc('month', NOW()) + INTERVAL '1 month'
      ELSE quota_reset_at
    END,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;
