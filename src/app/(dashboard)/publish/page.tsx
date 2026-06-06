import { createClient } from "@/lib/supabase/server";
import { Share2 } from "lucide-react";
import { PublishClientPage } from "./PublishClientPage";

export const metadata = { title: "Publicar — Carrosseiro" };

export default async function PublishPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: connections }, { data: carousels }, { data: posts }] = await Promise.all([
    supabase
      .from("social_connections")
      .select("id, platform, account_name, account_id, is_active, token_expires_at, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("carousels")
      .select("id, title, topic, slide_count")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("social_posts")
      .select(`
        id, platform, status, caption, hashtags,
        scheduled_at, published_at, error_message, created_at,
        social_connections(account_name, platform),
        carousels(title, topic)
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15">
              <Share2 className="h-4 w-4 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Publicar</h1>
          </div>
          <p className="text-white/50 ml-12">
            Conecte suas redes sociais e publique ou agende seus carrosséis
          </p>
        </div>
      </div>

      <PublishClientPage
        initialConnections={connections ?? []}
        carousels={carousels ?? []}
        initialPosts={(posts as never) ?? []}
      />
    </div>
  );
}
