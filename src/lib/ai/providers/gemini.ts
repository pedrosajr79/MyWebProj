import type { AIProvider } from "../router";

interface GeminiContent {
  parts: { text: string }[];
}

interface GeminiCandidate {
  content: GeminiContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { code: number; message: string; status: string };
}

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Google Gemini (Flash)",

  async generate(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({})) as GeminiResponse;
      const message = errorBody?.error?.message ?? res.statusText;
      const err = new Error(`Gemini API error ${res.status}: ${message}`);
      (err as Error & { status: number }).status = res.status;
      throw err;
    }

    const data = await res.json() as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned empty response");

    return text;
  },
};
