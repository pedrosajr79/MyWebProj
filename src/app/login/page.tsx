"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } });
  }

  return (
    <div className="min-h-screen bg-[#0a0a15] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-white mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            Carrosseiro
          </Link>
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-white/50 mt-2">Entre na sua conta para continuar</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors mb-6"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="bg-[#0f0f1e] px-3 text-sm text-white/30">ou</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm mb-1.5 block">E-mail</Label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500" />
            </div>
            <div>
              <Label className="text-white/70 text-sm mb-1.5 block">Senha</Label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500" />
            </div>
            <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>
              Entrar
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-white/50">
            Não tem conta?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
