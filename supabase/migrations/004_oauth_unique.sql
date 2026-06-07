-- Garantir upsert de conexões OAuth por user+platform
ALTER TABLE public.social_connections
  DROP CONSTRAINT IF EXISTS social_connections_user_platform_unique;

ALTER TABLE public.social_connections
  ADD CONSTRAINT social_connections_user_platform_unique UNIQUE (user_id, platform);
