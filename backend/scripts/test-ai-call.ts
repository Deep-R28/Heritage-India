import "dotenv/config";
import { getLLMProvider } from "../src/services/ai/provider.js";
import {
  buildGroundingContext,
  buildSystemPrompt,
  detectLanguage,
} from "../src/services/ai/grounding.js";

async function testAICall() {
  console.log("🤖 Testing Live LLM Call with Heritage India AI Assistant...\n");

  const query = "What are quiet places to visit in India under Rs. 500?";
  console.log(`User Query: "${query}"`);

  const lang = detectLanguage(query);
  console.log(`Language Detected: ${lang.name} (${lang.code})`);

  const grounding = await buildGroundingContext(query);
  console.log("Database Grounding Context Loaded (Sample):");
  console.log(grounding.substring(0, 300) + "...\n");

  const systemPrompt = buildSystemPrompt(grounding, lang);

  const provider = getLLMProvider();

  let receivedTokens = 0;
  let fullOutput = "";

  console.log("Sending request to LLM...");
  try {
    await provider.chatStream(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      {
        onToken: (token) => {
          receivedTokens++;
          fullOutput += token;
          process.stdout.write(token);
        },
        onComplete: (full) => {
          console.log("\n\n✅ Stream completed successfully!");
          console.log(`Received ${receivedTokens} token chunks, ${full.length} characters.`);
        },
      }
    );

    console.log("\n\n--------------------------------------------");
    console.log("🇮🇳 Testing Multilingual (Hindi) Grounded Call...\n");

    const hindiQuery = "ताजमहल का प्रवेश शुल्क कितना है और वहां भीड़ कैसी है?";
    console.log(`User Query: "${hindiQuery}"`);

    const hindiLang = detectLanguage(hindiQuery);
    console.log(`Language Detected: ${hindiLang.name} (${hindiLang.code})`);

    const hindiGrounding = await buildGroundingContext(hindiQuery);
    const hindiPrompt = buildSystemPrompt(hindiGrounding, hindiLang);

    console.log("Sending Hindi request to LLM...");
    await provider.chatStream(
      [
        { role: "system", content: hindiPrompt },
        { role: "user", content: hindiQuery },
      ],
      {
        onToken: (token) => {
          process.stdout.write(token);
        },
        onComplete: (full) => {
          console.log("\n\n✅ Hindi stream completed successfully!");
          console.log(`Characters: ${full.length}`);
        },
      }
    );
  } catch (err: any) {
    console.error("\n❌ LLM Call Failed:", err.message);
    process.exit(1);
  }
}

testAICall()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  });
