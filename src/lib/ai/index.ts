import type { GenerationRequest, SlideData } from "@/types/carousel";
import { SYSTEM_PROMPT, REVIEW_SYSTEM_PROMPT, buildCarouselPrompt, buildReviewPrompt } from "./prompts";
import { routeGenerate } from "./router";

export async function generateCarouselWithAI(req: GenerationRequest): Promise<string> {
  const prompt = buildCarouselPrompt(req);
  const result = await routeGenerate(SYSTEM_PROMPT, prompt, 2048);
  if (result.attemptCount > 1) {
    console.log(`[AI] Carousel generated via fallback provider: ${result.providerName} (attempt ${result.attemptCount})`);
  }
  return result.text;
}

export async function reviewCarouselWithAI(
  slides: SlideData[],
  context: { topic: string; tone: string; niche: string }
): Promise<string> {
  const prompt = buildReviewPrompt(slides, context);
  const result = await routeGenerate(REVIEW_SYSTEM_PROMPT, prompt, 3072);
  if (result.attemptCount > 1) {
    console.log(`[AI] Review generated via fallback provider: ${result.providerName} (attempt ${result.attemptCount})`);
  }
  return result.text;
}
