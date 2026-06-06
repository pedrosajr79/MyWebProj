import type { GenerationRequest } from "@/types/carousel";

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
