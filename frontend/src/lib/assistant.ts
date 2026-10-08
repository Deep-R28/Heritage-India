/**
 * AI modules — stubs only (MAKE.md Section 11). UI-complete, logic-empty:
 * swap the bodies below for real model/API calls without touching any
 * component that imports them.
 */

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: { url: string; caption: string };
}

/** Stub — replace with a real chatbot API call. `stubText` is pre-built by the
 * caller (via i18next) so this module stays framework-agnostic. */
export async function sendMessageToAssistant(input: string, stubText: (input: string) => string): Promise<AssistantMessage> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: stubText(input),
  };
}

export const ASSISTANT_PREFERENCE_KEY = "heritage-assistant-preference";
export type AssistantMode = "chat" | "voice";
