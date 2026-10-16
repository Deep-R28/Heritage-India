import { config } from "../../config.js";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (err: Error) => void;
}

export interface LLMProvider {
  chatStream(messages: Message[], callbacks: StreamCallbacks): Promise<string>;
}

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model || "gemini-2.5-flash-lite";
  }

  async chatStream(messages: Message[], callbacks: StreamCallbacks): Promise<string> {
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemMessage = messages.find((m) => m.role === "system");
    const systemInstruction = systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined;

    // Use SSE / streamGenerateContent endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemInstruction && { systemInstruction }),
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `Gemini API error (${res.status}): ${errText}`;
      if (res.status === 404 && this.model.includes("3.5")) {
        // Fallback to gemini-2.5-flash-lite as requested in prompt
        console.warn("Gemini 3.5 returned 404, falling back to gemini-2.5-flash-lite...");
        const fallbackProvider = new GeminiProvider(this.apiKey, "gemini-2.5-flash-lite");
        return fallbackProvider.chatStream(messages, callbacks);
      }
      if (res.status === 429) {
        errorMsg = "Free AI assistant quota temporarily exceeded. Please try again in a few moments.";
      }
      throw new Error(errorMsg);
    }

    if (!res.body) {
      throw new Error("No response body received from Gemini API");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.substring(5).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const data = JSON.parse(jsonStr);
            const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textPart) {
              accumulatedText += textPart;
              callbacks.onToken(textPart);
            }
          } catch {
            // Ignore parse chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    callbacks.onComplete?.(accumulatedText);
    return accumulatedText;
  }
}

export class GroqProvider implements LLMProvider {
  constructor(private apiKey: string, private model = "llama-3.3-70b-versatile") {}

  async chatStream(messages: Message[], callbacks: StreamCallbacks): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error (${res.status}): ${await res.text()}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.substring(5).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const data = JSON.parse(jsonStr);
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) {
            accumulatedText += delta;
            callbacks.onToken(delta);
          }
        } catch {
          // ignore
        }
      }
    }

    callbacks.onComplete?.(accumulatedText);
    return accumulatedText;
  }
}

export class OpenRouterProvider implements LLMProvider {
  constructor(private apiKey: string, private model = "meta-llama/llama-3.2-3b-instruct:free") {}

  async chatStream(messages: Message[], callbacks: StreamCallbacks): Promise<string> {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error (${res.status}): ${await res.text()}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.substring(5).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const data = JSON.parse(jsonStr);
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) {
            accumulatedText += delta;
            callbacks.onToken(delta);
          }
        } catch {
          // ignore
        }
      }
    }

    callbacks.onComplete?.(accumulatedText);
    return accumulatedText;
  }
}

export function getLLMProvider(): LLMProvider {
  const provider = (config.llmProvider || "gemini").toLowerCase();

  if (provider === "groq" && config.groqApiKey) {
    return new GroqProvider(config.groqApiKey, config.llmModel);
  }
  if (provider === "openrouter" && config.openRouterApiKey) {
    return new OpenRouterProvider(config.openRouterApiKey, config.llmModel);
  }
  return new GeminiProvider(config.geminiApiKey, config.llmModel);
}
