/**
 * AI Assistant integration module.
 * Connects directly to backend /api/ai/chat with live LLM streaming,
 * with graceful fallback to serverless / local concierge intelligence.
 */
import { getApiBase } from "@/lib/api";
import { generateConciergeResponse } from "@/lib/concierge-fallback";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: { url: string; caption: string };
  language?: { code: string; name: string };
}

export const ASSISTANT_PREFERENCE_KEY = "heritage-assistant-preference";
export type AssistantMode = "chat" | "voice";

export async function sendMessageToAssistant(
  input: string,
  fallbackText?: (input: string) => string,
  onToken?: (token: string) => void
): Promise<AssistantMessage> {
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("chat_session_id") || undefined : undefined;
  const base = getApiBase();
  const primaryUrl = base ? `${base}/api/ai/chat` : "/api/ai/chat";

  let res: Response | null = null;

  try {
    res = await fetch(primaryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: input,
        sessionId,
        stream: Boolean(onToken),
      }),
    });
  } catch {
    // If primary external backend was unreachable, seamlessly try same-origin relative route
    if (base && typeof window !== "undefined") {
      try {
        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: input,
            sessionId,
            stream: Boolean(onToken),
          }),
        });
      } catch {
        res = null;
      }
    }
  }

  // If response succeeded (either primary or fallback serverless route)
  if (res && res.ok) {
    try {
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
        text: json.data?.message || generateConciergeResponse(input, undefined, sessionId),
        language: json.data?.language,
      };
    } catch (parseErr) {
      console.warn("Error parsing assistant stream, using local concierge:", parseErr);
    }
  }

  // Graceful local concierge answer (never display stub responses)
  const intelligentReply = generateConciergeResponse(input, undefined, sessionId);
  if (onToken) {
    // If streaming was requested, simulate a quick token stream
    const words = intelligentReply.split(/(\s+)/);
    for (const w of words) {
      onToken(w);
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: intelligentReply,
  };
}
