import type { AIProvider } from "../router";

interface CohereResponse {
  text?: string;
  message?: string;
}

export const cohereProvider: AIProvider = {
  id: "cohere",
  name: "Cohere (Command R)",

  async generate(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) throw new Error("COHERE_API_KEY not configured");

    const model = process.env.COHERE_MODEL ?? "command-r";

    const res = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Client-Name": "carrosseiro-app",
      },
      body: JSON.stringify({
        model,
        preamble: systemPrompt,
        message: userPrompt,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({})) as CohereResponse;
      const message = errorBody?.message ?? res.statusText;
      const err = new Error(`Cohere API error ${res.status}: ${message}`);
      (err as Error & { status: number }).status = res.status;
      throw err;
    }

    const data = await res.json() as CohereResponse;
    if (!data.text) throw new Error("Cohere returned empty response");

    return data.text;
  },
};
