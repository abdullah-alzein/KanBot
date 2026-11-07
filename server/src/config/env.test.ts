import test from "node:test";
import assert from "node:assert/strict";

import { resolveAiConfig } from "./env.js";

test("uses the Groq key and fixed Groq endpoint", () => {
  const config = resolveAiConfig({
    GROQ_API_KEY: "groq-key",
    AI_BASE_URL: "https://openrouter.ai/api/v1",
    AI_MODEL: "openai/gpt-oss-20b",
  });

  assert.equal(config.apiKey, "groq-key");
  assert.equal(config.baseUrl, "https://api.groq.com/openai/v1");
  assert.equal(config.model, "openai/gpt-oss-20b");
});

test("ignores non-Groq provider keys", () => {
  const config = resolveAiConfig({
    OPENAI_API_KEY: "openai-key",
    OPENROUTER_API_KEY: "router-key",
    GEMINI_API_KEY: "gemini-key",
    AI_MODEL: "openai/gpt-oss-20b",
  });

  assert.equal(config.apiKey, "");
  assert.equal(config.baseUrl, "https://api.groq.com/openai/v1");
  assert.equal(config.enabled, false);
});

test("does not allow a custom URL to redirect Groq credentials", () => {
  const config = resolveAiConfig({
    GROQ_API_KEY: "groq-key",
    AI_BASE_URL: "https://custom.example/v1/",
    AI_MODEL: "custom-model",
  });

  assert.equal(config.baseUrl, "https://api.groq.com/openai/v1");
});

test("keeps empty values as disabled AI mode", () => {
  const config = resolveAiConfig({
    AI_API_KEY: "",
    OPENAI_API_KEY: "",
    AI_MODEL: "",
  });

  assert.equal(config.apiKey, "");
  assert.equal(config.enabled, false);
});
