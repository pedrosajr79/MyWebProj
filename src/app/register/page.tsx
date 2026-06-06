"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Zap, Check } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("A senha deve ter pelo menos 8 caracteres"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a15] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Confirme seu e-mail</h1>
          <p className="text-white/50">Enviamos um link de confirmação para <strong className="text-white">{email}</strong>. Clique no link para ativar sua conta.</p>
          <Link href="/login" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 text-sm">
            Voltar para o login →
          </Link>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-white">Crie sua conta grátis</h1>
          <p className="text-white/50 mt-2">3 carrosséis grátis todo mês. Sem cartão de crédito.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm mb-1.5 block">Nome</Label>
              <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500" />
            </div>
            <div>
              <Label className="text-white/70 text-sm mb-1.5 block">E-mail</Label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500" />
            </div>
            <div>
              <Label className="text-white/70 text-sm mb-1.5 block">Senha</Label>
              <Input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500" />
            </div>
            <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>
              Criar conta grátis
            </Button>
          </form>

          <p className="text-center mt-4 text-xs text-white/30">
            Ao criar sua conta você concorda com os{" "}
            <a href="#" className="text-white/50 hover:text-white underline">Termos de Uso</a>{" "}
            e a{" "}
            <a href="#" className="text-white/50 hover:text-white underline">Política de Privacidade</a>.
          </p>

          <p className="text-center mt-6 text-sm text-white/50">
            Já tem conta?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
