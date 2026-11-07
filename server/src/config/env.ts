import "dotenv/config";
import { z } from "zod";

type AiEnvLike = Record<string, string | number | undefined>;

const groqBaseUrl = "https://api.groq.com/openai/v1";

export function resolveAiConfig(envLike: AiEnvLike = process.env) {
  const apiKey = String(envLike.GROQ_API_KEY ?? "").trim();

  const model = String(envLike.AI_MODEL ?? "").trim();

  return {
    apiKey,
    baseUrl: groqBaseUrl,
    model,
    enabled: apiKey !== "",
  };
}

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z
    .string()
    .default(
      "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
    ),
  JWT_SECRET: z.string().min(16).default("dev-only-jwt-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  DATA_FILE: z.string().default("./data/db.json"),
  // AI — leave GROQ_API_KEY empty to use the built-in mock assistant.
  GROQ_API_KEY: z.string().default(""),
  AI_MODEL: z.string().default(""),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues)
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

const aiConfig = resolveAiConfig({ ...process.env, ...parsed.data });

export const env = {
  ...parsed.data,
  GROQ_API_KEY: aiConfig.apiKey,
  GROQ_BASE_URL: aiConfig.baseUrl,
  AI_MODEL: aiConfig.model,
  isProduction: parsed.data.NODE_ENV === "production",
  clientOrigins: parsed.data.CLIENT_ORIGIN.split(",").map((o) => o.trim()),
  aiEnabled: aiConfig.enabled,
};

if (aiConfig.enabled && !aiConfig.model) {
  console.error(
    "GROQ_API_KEY is set but AI_MODEL is empty. Set AI_MODEL in .env (see .env.example).",
  );
  process.exit(1);
}

if (env.isProduction && env.JWT_SECRET.startsWith("dev-only")) {
  console.error("JWT_SECRET must be set in production.");
  process.exit(1);
}
