import type { AIProvider } from "../router";

export const openaiProvider: AIProvider = {
  id: "openai",
  name: "OpenAI (GPT-4o mini)",

  async generate(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: maxTokens,
    });

    return completion.choices[0].message.content ?? "{}";
  },
};
