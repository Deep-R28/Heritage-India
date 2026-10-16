import app from "./app.js";
import { config } from "./config.js";

const server = app.listen(config.port, () => {
  console.log(`🏛️  Heritage India Backend API running on http://localhost:${config.port}`);
  console.log(`   Health check: http://localhost:${config.port}/api/health`);
  console.log(`   Frontend Origin: ${config.frontendOrigin}`);
  console.log(`   LLM Provider: ${config.llmProvider} (${config.llmModel})`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    process.exit(0);
  });
});
