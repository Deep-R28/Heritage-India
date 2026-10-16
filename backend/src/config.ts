import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key-change-in-production-32bytes",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  llmProvider: process.env.LLM_PROVIDER || "gemini",
  llmModel: process.env.LLM_MODEL || "gemini-2.5-flash-lite",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
};
