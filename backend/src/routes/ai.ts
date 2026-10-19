import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { optionalAuth } from "../middleware/auth.js";
import { getLLMProvider, type Message } from "../services/ai/provider.js";
import {
  detectLanguage,
  buildGroundingContext,
  buildSystemPrompt,
} from "../services/ai/grounding.js";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
  language: z.string().optional(),
  stream: z.boolean().default(true),
});

router.post("/chat", optionalAuth, async (req, res, next) => {
  try {
    const { message, sessionId, language, stream } = chatSchema.parse(req.body);
    const userId = req.user?.id;

    // Detect language or fallback
    const detectedLang = detectLanguage(message, language || "en");

    // Session resolution or creation
    let activeSession = null;
    if (sessionId) {
      activeSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!activeSession) {
      activeSession = await prisma.chatSession.create({
        data: {
          userId: userId ?? null,
          language: detectedLang.code,
        },
        include: { messages: true },
      });
    }

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        sessionId: activeSession.id,
        role: "user",
        content: message,
      },
    });

    // Build Grounding DB facts and System Prompt
    const sessionHistoryText = [
      ...activeSession.messages.slice(-6).map((m) => m.content),
      message,
    ].join(" ");
    const groundingContext = await buildGroundingContext(sessionHistoryText);
    const systemPrompt = buildSystemPrompt(groundingContext, detectedLang);

    // Prepare message history
    const history: Message[] = [
      { role: "system", content: systemPrompt },
      ...activeSession.messages.slice(-6).map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const llmProvider = getLLMProvider();

    if (stream) {
      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Send initial meta event
      res.write(
        `data: ${JSON.stringify({
          type: "meta",
          sessionId: activeSession.id,
          language: detectedLang,
        })}\n\n`
      );

      let assistantText = "";

      try {
        await llmProvider.chatStream(history, {
          onToken: (token) => {
            assistantText += token;
            res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
          },
          onComplete: async (full) => {
            // Persist assistant reply
            await prisma.chatMessage.create({
              data: {
                sessionId: activeSession!.id,
                role: "assistant",
                content: full,
              },
            });

            res.write(
              `data: ${JSON.stringify({
                type: "done",
                sessionId: activeSession!.id,
                fullText: full,
              })}\n\n`
            );
            res.end();
          },
          onError: (err) => {
            res.write(
              `data: ${JSON.stringify({
                type: "error",
                message: err.message,
              })}\n\n`
            );
            res.end();
          },
        });
      } catch (err: any) {
        console.error("AI stream error:", err);
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: err.message || "Failed to generate AI response",
          })}\n\n`
        );
        res.end();
      }
    } else {
      // Non-streaming response
      let fullResponse = "";
      await llmProvider.chatStream(history, {
        onToken: (token) => {
          fullResponse += token;
        },
      });

      await prisma.chatMessage.create({
        data: {
          sessionId: activeSession.id,
          role: "assistant",
          content: fullResponse,
        },
      });

      return res.json({
        data: {
          sessionId: activeSession.id,
          language: detectedLang,
          message: fullResponse,
        },
        error: null,
      });
    }
  } catch (err) {
    next(err);
  }
});

// Resume or get chat history
router.get("/sessions/:sessionId", optionalAuth, async (req, res, next) => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: req.params.sessionId as string },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    return res.json({ data: session, error: null });
  } catch (err) {
    next(err);
  }
});

export default router;
