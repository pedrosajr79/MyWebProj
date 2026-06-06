import type { GenerationRequest, SlideData } from "@/types/carousel";

export const SYSTEM_PROMPT = `Você é um especialista em criação de conteúdo para Instagram, especialmente carrosséis virais.
Você deve gerar conteúdo em português do Brasil.
Sempre retorne um JSON válido com a estrutura exata especificada.
O conteúdo deve ser envolvente, direto ao ponto e otimizado para engajamento.`;

export function buildCarouselPrompt(req: GenerationRequest): string {
  return `Crie um carrossel para Instagram sobre: "${req.topic}"
Nicho: ${req.niche}
Tom: ${req.tone}
Quantidade de slides: ${req.slideCount}
${req.targetAudience ? `Público-alvo: ${req.targetAudience}` : ""}
${req.cta ? `Call-to-action final: ${req.cta}` : ""}

REGRAS IMPORTANTES:
- O primeiro slide (index 0) deve ser do tipo "cover" com um título impactante de até 8 palavras e corpo curto (1-2 frases)
- O último slide deve ser do tipo "cta" com call-to-action claro
- Os slides do meio devem ser do tipo "content" com conteúdo valioso e objetivo
- Use emojis relevantes mas não exagere
- Títulos: máximo 6-8 palavras, impactantes
- Corpo: 2-4 frases curtas, direto ao ponto, linguagem clara
- Cada slide deve ser independente e fazer sentido sozinho

Retorne APENAS o JSON abaixo, sem markdown, sem explicações:
{
  "title": "Título geral do carrossel",
  "slides": [
    {
      "index": 0,
      "type": "cover",
      "title": "Título impactante",
      "body": "Subtítulo ou chamada de ação curta",
      "emoji": "🚀"
    },
    {
      "index": 1,
      "type": "content",
      "title": "Ponto chave 1",
      "body": "Explicação clara e objetiva do ponto.",
      "emoji": "✅"
    }
  ]
}`;
}

// ─── Review prompts ──────────────────────────────────────────────────────────

export const REVIEW_SYSTEM_PROMPT = `Você é um consultor especialista em conteúdo viral para Instagram com foco em carrosséis de alta performance.
Sua análise deve ser honesta, específica e acionável — não seja condescendente, aponte problemas reais.
Sempre retorne um JSON válido com a estrutura exata especificada.
Sugira melhorias que respeitem o tom e nicho especificados.
Responda em português do Brasil.`;

export function buildReviewPrompt(
  slides: SlideData[],
  context: { topic: string; tone: string; niche: string }
): string {
  const slideSummary = slides
    .map(s => `Slide ${s.index + 1} (${s.type})\nTítulo: ${s.title}\nCorpo: ${s.body}`)
    .join("\n\n");

  return `Analise criticamente os slides do carrossel abaixo e retorne uma avaliação honesta.

CONTEXTO DO CARROSSEL:
- Tema: ${context.topic}
- Nicho: ${context.niche}
- Tom: ${context.tone}

SLIDES PARA REVISAR:
${slideSummary}

CRITÉRIOS DE PONTUAÇÃO (1-10, seja rigoroso):
- clarity: O texto é imediatamente compreensível? Sem jargão desnecessário?
- persuasion: Convence? Gera desejo de continuar lendo ou agir?
- engagement: Prende atenção? Gera curiosidade ou emoção?

TIPOS DE PROBLEMA (use apenas os listados abaixo):
- weak_title: título genérico, longo (>8 palavras), ou sem impacto
- body_too_long: corpo com mais de 4 frases ou linguagem densa
- generic_cta: CTA batido ou vago no slide final
- low_clarity: texto confuso, ambíguo ou mal estruturado
- missing_hook: slide de capa sem elemento de curiosidade/gancho
- no_value: slide de conteúdo que não entrega informação útil
- off_topic: slide que desvia do tema principal

Para cada slide forneça: pontuações, lista de problemas encontrados (pode ser vazia []), e versão melhorada do título e corpo.
As sugestões devem manter o tom "${context.tone}" e ser em português do Brasil.

Retorne APENAS o JSON abaixo, sem markdown, sem explicações:
{
  "slideReviews": [
    {
      "slideIndex": 0,
      "scores": { "clarity": 8, "persuasion": 6, "engagement": 7 },
      "issues": [
        { "type": "missing_hook", "description": "O título não gera curiosidade suficiente" }
      ],
      "suggestedTitle": "Versão melhorada do título",
      "suggestedBody": "Versão melhorada do corpo, mantendo o tom"
    }
  ]
}`;
}
