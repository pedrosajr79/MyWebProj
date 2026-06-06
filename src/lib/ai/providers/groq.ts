import type { AIProvider } from "../router";

export const groqProvider: AIProvider = {
  id: "groq",
  name: "Groq (Llama 3)",

  async generate(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");

    // Groq uses the OpenAI-compatible API
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await client.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      // Groq supports response_format for some models
      max_tokens: maxTokens,
    });

    return completion.choices[0].message.content ?? "{}";
  },
};
