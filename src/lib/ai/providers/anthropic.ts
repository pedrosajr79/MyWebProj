import type { AIProvider } from "../router";

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  name: "Anthropic (Claude Haiku)",

  async generate(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = msg.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type from Anthropic");
    return content.text;
  },
};
