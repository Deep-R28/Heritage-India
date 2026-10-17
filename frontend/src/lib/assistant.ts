/**
 * AI Assistant integration module.
 * Connects directly to backend /api/ai/chat with live LLM streaming.
 */

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: { url: string; caption: string };
  language?: { code: string; name: string };
}

export const ASSISTANT_PREFERENCE_KEY = "heritage-assistant-preference";
export type AssistantMode = "chat" | "voice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function sendMessageToAssistant(
  input: string,
  fallbackText?: (input: string) => string,
  onToken?: (token: string) => void
): Promise<AssistantMessage> {
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("chat_session_id") || undefined : undefined;

  try {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: input,
        sessionId,
        stream: Boolean(onToken),
      }),
    });

    if (!res.ok) {
      throw new Error(`AI assistant error (${res.status})`);
    }

    if (onToken && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";
      let detectedLang: { code: string; name: string } | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.substring(5).trim();
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === "meta") {
              if (data.sessionId && typeof window !== "undefined") {
                localStorage.setItem("chat_session_id", data.sessionId);
              }
              if (data.language) detectedLang = data.language;
            } else if (data.type === "token") {
              fullText += data.token;
              onToken(data.token);
            } else if (data.type === "done") {
              fullText = data.fullText || fullText;
            }
          } catch {
            // ignore chunk parse
          }
        }
      }

      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: fullText,
        language: detectedLang,
      };
    }

    const json = await res.json();
    if (json.data?.sessionId && typeof window !== "undefined") {
      localStorage.setItem("chat_session_id", json.data.sessionId);
    }

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: json.data?.message || fallbackText?.(input) || "I am your AI heritage assistant.",
      language: json.data?.language,
    };
  } catch (err) {
    console.warn("Falling back to local assistant response:", err);
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text:
        fallbackText?.(input) ||
        "I am currently operating in offline mode. Please ensure the backend is running to access live crowd and guide intelligence.",
    };
  }
}
