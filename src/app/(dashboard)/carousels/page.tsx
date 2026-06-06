import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Search, Star, Trash2 } from "lucide-react";
import { formatRelative } from "@/lib/utils";

export default async function CarouselsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: carousels } = await supabase
    .from("carousels")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Carrosséis</h1>
          <p className="text-white/50 mt-1">{carousels?.length ?? 0} carrosséis salvos</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/new"><Plus className="h-4 w-4" /> Novo carrossel</Link>
        </Button>
      </div>

      {!carousels?.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
          <p className="text-white/50 mb-4">Você ainda não tem nenhum carrossel salvo.</p>
          <Button asChild variant="gradient">
            <Link href="/new">Criar primeiro carrossel</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {carousels.map((c) => (
            <Link key={c.id} href={`/carousels/${c.id}`}>
              <div className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer">
                {/* Thumbnail */}
                <div
                  className="h-40 flex items-center justify-center text-4xl font-black opacity-60"
                  style={{ background: `linear-gradient(135deg, ${c.theme?.bgColor ?? "#1e1b4b"}, ${c.theme?.primaryColor ?? "#6366f1"}30)` }}
                >
                  {c.topic?.slice(0, 2).toUpperCase()}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{c.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{c.topic}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{c.slide_count} slides</span>
                      <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full capitalize">{c.status}</span>
                    </div>
                    <span className="text-xs text-white/30">{formatRelative(c.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
