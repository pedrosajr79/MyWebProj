"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Platform = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok";
type PostStatus = "scheduled" | "publishing" | "published" | "failed" | "cancelled";

interface CalendarPost {
  id: string;
  platform: Platform;
  status: PostStatus;
  caption: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  social_connections: { account_name: string | null } | null;
  carousels: { title: string } | null;
}

interface Props {
  posts: CalendarPost[];
}

const PLATFORM_COLOR: Record<Platform, string> = {
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  facebook: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  linkedin: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  twitter: "bg-white/10 text-white/60 border-white/20",
  tiktok: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const STATUS_DOT: Record<PostStatus, string> = {
  scheduled: "bg-yellow-400",
  publishing: "bg-blue-400 animate-pulse",
  published: "bg-green-400",
  failed: "bg-red-400",
  cancelled: "bg-white/20",
};

const STATUS_LABEL: Record<PostStatus, string> = {
  scheduled: "Agendado",
  publishing: "Publicando",
  published: "Publicado",
  failed: "Falhou",
  cancelled: "Cancelado",
};

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  tiktok: "TikTok",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const PLATFORM_EMOJI: Record<Platform, string> = {
  instagram: "📸",
  facebook: "👥",
  linkedin: "💼",
  twitter: "🐦",
  tiktok: "🎵",
};

function PlatformIcon({ platform }: { platform: Platform }) {
  return <span className="text-[10px]">{PLATFORM_EMOJI[platform]}</span>;
}

export function CalendarView({ posts }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const postsByDay = new Map<string, CalendarPost[]>();
  for (const post of posts) {
    const dateStr = post.scheduled_at ?? post.published_at;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate().toString();
      if (!postsByDay.has(key)) postsByDay.set(key, []);
      postsByDay.get(key)!.push(post);
    }
  }

  const selectedKey = selectedDay
    ? selectedDay.getDate().toString()
    : null;
  const selectedPosts = selectedKey ? (postsByDay.get(selectedKey) ?? []) : [];

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day: number) =>
    !!selectedDay &&
    day === selectedDay.getDate() &&
    month === selectedDay.getMonth() &&
    year === selectedDay.getFullYear();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar grid */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-white/30 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dayPosts = postsByDay.get(day.toString()) ?? [];
            const hasPost = dayPosts.length > 0;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(new Date(year, month, day))}
                className={cn(
                  "relative rounded-lg p-1.5 min-h-[60px] text-left transition-all group",
                  isToday(day) && "ring-1 ring-indigo-500/60",
                  isSelected(day) ? "bg-indigo-500/20" : "hover:bg-white/5",
                )}
              >
                <span className={cn(
                  "text-xs font-medium block mb-1",
                  isToday(day) ? "text-indigo-400" : "text-white/50 group-hover:text-white/80",
                  isSelected(day) && "text-white"
                )}>
                  {day}
                </span>
                {hasPost && (
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className={cn("flex items-center gap-1 rounded px-1 py-0.5 border text-[10px] font-medium truncate", PLATFORM_COLOR[post.platform])}>
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[post.status])} />
                        <PlatformIcon platform={post.platform} />
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-[10px] text-white/30 px-1">+{dayPosts.length - 3}</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4">
          {(Object.entries(STATUS_DOT) as [PostStatus, string][]).map(([status, dot]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", dot)} />
              <span className="text-xs text-white/30">{STATUS_LABEL[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          {selectedDay ? (
            <>
              <h3 className="font-semibold text-white mb-4">
                {selectedDay.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              {selectedPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-white/15 mx-auto mb-3" />
                  <p className="text-sm text-white/40">Nenhum post neste dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPosts.map(post => (
                    <div key={post.id} className={cn("rounded-xl border p-3", PLATFORM_COLOR[post.platform])}>
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon platform={post.platform} />
                        <span className="text-xs font-semibold">{PLATFORM_LABEL[post.platform]}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[post.status])} />
                          <span className="text-[10px]">{STATUS_LABEL[post.status]}</span>
                        </div>
                      </div>
                      {post.carousels?.title && (
                        <p className="text-xs font-medium text-white/80 mb-1 truncate">{post.carousels.title}</p>
                      )}
                      {post.caption && (
                        <p className="text-xs text-white/50 line-clamp-2">{post.caption}</p>
                      )}
                      {(post.scheduled_at ?? post.published_at) && (
                        <p className="text-[10px] text-white/30 mt-2">
                          {new Date(post.scheduled_at ?? post.published_at!).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">Selecione um dia no calendário para ver os posts</p>
            </div>
          )}
        </div>

        {/* Monthly summary */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="font-semibold text-white mb-4 text-sm">Resumo do mês</h3>
          {posts.length === 0 ? (
            <p className="text-xs text-white/30">Nenhum post neste período</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {(["scheduled","published","failed"] as PostStatus[]).map(s => {
                const count = posts.filter(p => p.status === s &&
                  new Date(p.scheduled_at ?? p.published_at ?? "").getMonth() === month
                ).length;
                if (count === 0) return null;
                return (
                  <div key={s} className="flex justify-between">
                    <dt className="flex items-center gap-1.5 text-white/40">
                      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[s])} />
                      {STATUS_LABEL[s]}
                    </dt>
                    <dd className="text-white font-medium">{count}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
