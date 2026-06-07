"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Shield, Download, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PrivacySettingsPage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch("/api/lgpd/export", { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carrosseiro-dados-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Seus dados foram exportados com sucesso.");
    } catch {
      toast.error("Erro ao exportar dados. Tente novamente.");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteRequest() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/lgpd/delete", { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Solicitação de exclusão registrada. Você receberá confirmação por e-mail em até 30 dias.");
      setDeleteConfirm(false);
    } catch {
      toast.error("Erro ao solicitar exclusão. Contate privacidade@carrosseiro.com.br");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
          <Shield className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Privacidade e Seus Dados</h1>
          <p className="text-sm text-white/50">Gerencie seus dados pessoais conforme a LGPD</p>
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
            <Download className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-white mb-1">Exportar meus dados</h2>
            <p className="text-sm text-white/50 mb-4">
              Receba um arquivo JSON com todos os seus dados armazenados na plataforma: perfil, carrosséis criados e histórico de uso. Direito garantido pelo Art. 18, V da LGPD.
            </p>
            <Button onClick={handleExport} loading={exportLoading} variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              <Download className="h-4 w-4" /> Exportar meus dados (JSON)
            </Button>
          </div>
        </div>
      </div>

      {/* Cookie preferences */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-semibold text-white mb-3">Preferências de cookies</h2>
        <p className="text-sm text-white/50 mb-4">Gerencie quais cookies você aceita.</p>
        <div className="space-y-3">
          {[
            { label: "Cookies essenciais", desc: "Necessários para autenticação e funcionamento", locked: true },
            { label: "Cookies analíticos", desc: "Nos ajudam a entender como você usa o produto", locked: false },
          ].map(({ label, desc, locked }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
              <div className={`h-5 w-9 rounded-full ${locked ? "bg-indigo-500 cursor-not-allowed" : "bg-white/20 cursor-pointer"} flex items-center px-0.5`}>
                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${locked ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete account */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-white mb-1">Solicitar exclusão da conta</h2>
            <p className="text-sm text-white/50 mb-4">
              Solicita a exclusão completa dos seus dados pessoais. Os dados serão anonimizados em até 30 dias, salvo obrigações legais de retenção (ex: dados fiscais por 5 anos). Esta ação é <strong className="text-white">irreversível</strong>.
            </p>

            {deleteConfirm && (
              <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-300">Tem certeza?</p>
                  <p className="text-xs text-yellow-300/70 mt-1">Sua conta, carrosséis e histórico serão excluídos permanentemente. Clique novamente para confirmar.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDeleteRequest}
                loading={deleteLoading}
                size="sm"
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
                {deleteConfirm ? "Confirmar exclusão" : "Solicitar exclusão da conta"}
              </Button>
              {deleteConfirm && (
                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(false)} className="text-white/50 hover:text-white">
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-white/30">
        Dúvidas sobre privacidade?{" "}
        <a href="mailto:privacidade@carrosseiro.com.br" className="text-indigo-400 hover:underline">privacidade@carrosseiro.com.br</a>
        {" · "}
        <Link href="/privacidade" className="text-indigo-400 hover:underline">Política de Privacidade</Link>
      </p>
    </div>
  );
}
