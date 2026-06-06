import type { GenerationRequest } from "@/types/carousel";
import { SYSTEM_PROMPT, buildCarouselPrompt } from "./prompts";

export async function generateCarouselWithAI(req: GenerationRequest): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "openai";
  const prompt = buildCarouselPrompt(req);

  if (provider === "anthropic") {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: process.env.AI_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const content = msg.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    return content.text;
  }

  // Default: OpenAI
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2048,
  });
  return completion.choices[0].message.content ?? "{}";
}
