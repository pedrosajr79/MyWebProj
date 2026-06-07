-- ─── LGPD: campos de conformidade em profiles ────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_data_export_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_deletion_scheduled_at TIMESTAMPTZ;

-- ─── Admin: tabela de pesquisas de mercado ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'error')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Nenhuma política pública — acesso apenas via service role key
ALTER TABLE public.admin_research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_research_deny_all" ON public.admin_research FOR ALL USING (false);

-- ─── Auditoria de eventos de segurança ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'password_change', 'data_export', 'account_delete_request'
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Usuário só vê seus próprios eventos
CREATE POLICY "security_events_select_own" ON public.security_events
  FOR SELECT USING (auth.uid() = user_id);

-- Inserção apenas via service role (server-side)
CREATE POLICY "security_events_insert_service" ON public.security_events
  FOR INSERT WITH CHECK (false); -- apenas service role bypassa isso

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_admin_research_created ON public.admin_research(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id, created_at DESC);
