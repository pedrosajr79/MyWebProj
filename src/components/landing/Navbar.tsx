"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

const links = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#planos", label: "Planos" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a15]/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          Carrosseiro
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/register">Começar grátis</Link>
          </Button>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a15] px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block text-white/70 hover:text-white" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild variant="gradient">
              <Link href="/register">Começar grátis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
