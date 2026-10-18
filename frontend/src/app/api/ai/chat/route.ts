import { NextResponse } from "next/server";
import { generateConciergeResponse } from "@/lib/concierge-fallback";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = (body.message || "").trim();
    const language = body.language || "en";
    const stream = Boolean(body.stream);
    const sessionId = body.sessionId || `session_${Date.now()}`;

    if (!message) {
      return NextResponse.json(
        { data: null, error: { message: "Message is required", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const replyText = generateConciergeResponse(message, language);

    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          // Send meta
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "meta",
                sessionId,
                language: { code: language, name: language === "hi" ? "Hindi" : "English" },
              })}\n\n`
            )
          );

          // Stream words smoothly
          const words = replyText.split(/(\s+)/);
          for (const word of words) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "token", token: word })}\n\n`)
            );
            await new Promise((r) => setTimeout(r, 20));
          }

          // Send done
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", fullText: replyText })}\n\n`)
          );
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json(
      {
        data: {
          message: replyText,
          sessionId,
          language: { code: language, name: language === "hi" ? "Hindi" : "English" },
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal AI route error";
    return NextResponse.json(
      { data: null, error: { message: errorMsg, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
