# Kanbot API

Express 5 + TypeScript. JSON-file database. JWT auth. AI assistant through Groq, with a free built-in mock.

```bash
npm install
cp .env.example .env
npm run seed     # reset DB: demo@kanbot.dev / password123 (2 projects, 3 sprints, 24 todos)
npm run dev      # http://localhost:4000/api (auto-reload)
npm run smoke    # end-to-end test of every endpoint on a temp DB
npm run typecheck
```

- **API reference:** [docs/IMPLEMENTATION-PLAN.en.md §4](../docs/IMPLEMENTATION-PLAN.en.md#4-backend-api-design)
- **Types (the contract):** [`src/types/api.ts`](src/types/api.ts). Copy this file into the frontend.
- **Data:** `data/db.json`. Delete it or re-seed to start fresh.

## AI configuration

| `.env`                            | Behaviour                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `GROQ_API_KEY` empty (default)    | **Mock mode**: rule-based answers, instant, free, offline. `GET /api/ai/status` → `{ "mode": "mock" }` |
| `GROQ_API_KEY` and `AI_MODEL` set | **Groq mode** via `https://api.groq.com/openai/v1/chat/completions`                                    |

If Groq rejects the key, is rate-limited, times out, or otherwise fails, the request automatically uses the built-in mock instead of returning an AI error. The server then stays in mock mode until restarted, avoiding repeated requests with a bad key; check `GET /api/ai/status` to see the active mode. Restart after correcting the key to try Groq again. No hosted AI provider can guarantee uninterrupted access, so keep the key private and expect provider-side limits or outages.

The server validates everything the model returns: enums are coerced, story points are snapped to 1/2/3/5/8/13, and sprint plans only contain real backlog ids within capacity. Invalid model output also falls back to the mock. AI routes are limited to 20 requests per minute per user.

## Structure

```
src/
├── app.ts / index.ts        # express app, routes mounting, startup
├── config/env.ts            # validated environment
├── types/api.ts             # API contract (shared with the client)
├── db/store.ts              # JSON-file store + record types
├── services/board.service.ts# ownership checks, ordering, sprint stats, serializers
├── routes/                  # auth, projects, todos, sprints, ai (+ zod schemas)
├── ai/                      # client.ts (Groq API fetch), assistant.service.ts (Groq + mock)
├── middleware/              # auth, validation, errors, request logger
├── lib/                     # jwt, password hashing, errors
└── scripts/                 # seed.ts, smoke.ts
```
