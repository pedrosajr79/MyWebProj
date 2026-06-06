export type SlideType = "cover" | "content" | "cta";
export type PlanId = "free" | "pro" | "business";

// ─── AI Review types ────────────────────────────────────────────────────────

export type SlideIssueType =
  | "weak_title"
  | "body_too_long"
  | "generic_cta"
  | "low_clarity"
  | "missing_hook"
  | "no_value"
  | "off_topic";

export interface SlideIssue {
  type: SlideIssueType;
  description: string;
}

export interface SlideScores {
  clarity: number;
  persuasion: number;
  engagement: number;
}

export interface SlideReview {
  slideIndex: number;
  scores: SlideScores;
  overallScore: number;
  issues: SlideIssue[];
  suggestedTitle: string;
  suggestedBody: string;
  accepted: boolean | null;
}

export type CarouselVerdict = "approved" | "needs_revision";

export interface CarouselReview {
  overallScore: number;
  verdict: CarouselVerdict;
  verdictReason: string;
  slideReviews: SlideReview[];
}

export interface GenerationMeta {
  topic: string;
  tone: string;
  niche: string;
}

export interface SlideData {
  index: number;
  type: SlideType;
  title: string;
  body: string;
  emoji?: string;
  customizations?: {
    bgColor?: string;
    textColor?: string;
    fontSize?: "sm" | "md" | "lg";
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  fontFamily: string;
  layout: "centered" | "left-aligned" | "split";
}

export interface Carousel {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  tone: string;
  slide_count: number;
  slides: SlideData[];
  theme: ThemeConfig;
  status: "draft" | "published" | "archived";
  is_favorite: boolean;
  ai_provider?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerationRequest {
  topic: string;
  niche: string;
  tone: string;
  slideCount: number;
  themeId: string;
  targetAudience?: string;
  cta?: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "modern-dark",
    name: "Modern Dark",
    primaryColor: "#6366f1",
    accentColor: "#a5b4fc",
    bgColor: "#0f0f1a",
    textColor: "#f8fafc",
    fontFamily: "Inter",
    layout: "centered",
  },
  {
    id: "pastel",
    name: "Pastel Soft",
    primaryColor: "#ec4899",
    accentColor: "#f9a8d4",
    bgColor: "#fdf2f8",
    textColor: "#1e1b4b",
    fontFamily: "Inter",
    layout: "left-aligned",
  },
  {
    id: "corporate",
    name: "Corporate Blue",
    primaryColor: "#0ea5e9",
    accentColor: "#38bdf8",
    bgColor: "#0c1e35",
    textColor: "#f0f9ff",
    fontFamily: "Inter",
    layout: "left-aligned",
  },
  {
    id: "vibrant",
    name: "Vibrant Orange",
    primaryColor: "#f97316",
    accentColor: "#fb923c",
    bgColor: "#fff7ed",
    textColor: "#1c1917",
    fontFamily: "Inter",
    layout: "centered",
  },
  {
    id: "minimal",
    name: "Minimal White",
    primaryColor: "#18181b",
    accentColor: "#52525b",
    bgColor: "#ffffff",
    textColor: "#18181b",
    fontFamily: "Inter",
    layout: "left-aligned",
  },
  {
    id: "green-nature",
    name: "Green Nature",
    primaryColor: "#16a34a",
    accentColor: "#4ade80",
    bgColor: "#052e16",
    textColor: "#f0fdf4",
    fontFamily: "Inter",
    layout: "centered",
  },
];

export const TONES = [
  { value: "professional", label: "Profissional" },
  { value: "casual", label: "Casual e Descontraído" },
  { value: "educational", label: "Educativo" },
  { value: "motivational", label: "Motivacional" },
  { value: "storytelling", label: "Storytelling" },
  { value: "humorous", label: "Bem-humorado" },
];

export const NICHES = [
  { value: "marketing", label: "Marketing Digital" },
  { value: "finance", label: "Finanças e Investimentos" },
  { value: "health", label: "Saúde e Bem-estar" },
  { value: "business", label: "Empreendedorismo" },
  { value: "tech", label: "Tecnologia" },
  { value: "education", label: "Educação" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "food", label: "Gastronomia" },
  { value: "beauty", label: "Beleza e Moda" },
  { value: "sports", label: "Esportes e Fitness" },
  { value: "travel", label: "Viagens" },
  { value: "other", label: "Outro" },
];

export const PLAN_LIMITS: Record<PlanId, { carousels: number; slides: number; pdf: boolean; watermark: boolean; customThemes: boolean; historyDays: number }> = {
  free: { carousels: 3, slides: 7, pdf: false, watermark: true, customThemes: false, historyDays: 7 },
  pro: { carousels: 30, slides: 15, pdf: true, watermark: false, customThemes: true, historyDays: 90 },
  business: { carousels: -1, slides: 20, pdf: true, watermark: false, customThemes: true, historyDays: -1 },
};
