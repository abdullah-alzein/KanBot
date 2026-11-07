import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

process.env.NODE_ENV = "test";
process.env.DATA_FILE = join(mkdtempSync(join(tmpdir(), "kanbot-ai-fallback-")), "db.json");
process.env.GROQ_API_KEY = "rejected-key";
process.env.AI_MODEL = "openai/gpt-oss-20b";

const originalFetch = globalThis.fetch;
let providerRequests = 0;
globalThis.fetch = async () => {
  providerRequests++;
  return new Response('{"error":{"message":"invalid API key"}}', {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
};
const [{ aiSource, chat, generateTodos, planSprint, summarizeSprint }, { db }] =
  await Promise.all([
    import("./assistant.service.js"),
    import("../db/store.js"),
  ]);

after(() => {
  globalThis.fetch = originalFetch;
});

test("falls back to mock AI and suppresses further provider requests after rejection", async () => {
  const project = {
    id: "project-1",
    userId: "user-1",
    name: "Kanbot",
    key: "KAN",
    description: "",
    nextTodoNumber: 2,
    nextSprintNumber: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
  const todo = {
    id: "todo-1",
    projectId: project.id,
    sprintId: "sprint-1",
    key: "KAN-1",
    title: "Build dashboard",
    description: "",
    type: "task" as const,
    status: "done" as const,
    priority: "high" as const,
    storyPoints: 3 as const,
    labels: [],
    dueDate: null,
    order: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:00:00.000Z",
  };
  const backlogTodo = {
    ...todo,
    id: "todo-2",
    sprintId: null,
    key: "KAN-2",
    title: "Add project filters",
    order: 1,
    completedAt: null,
  };
  const sprint = {
    id: "sprint-1",
    projectId: project.id,
    name: "Sprint 1",
    goal: "Build the dashboard",
    startDate: "2026-01-01",
    endDate: "2026-01-14",
    status: "completed" as const,
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-14T00:00:00.000Z",
    completedStats: null,
    summary: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-14T00:00:00.000Z",
  };
  db.data.todos.push(todo, backlogTodo);
  db.data.sprints.push(sprint);

  assert.equal(aiSource(), "ai");
  const drafts = await generateTodos(project, "Build a dashboard", 3);
  assert.equal(drafts.length, 3);
  assert.equal(aiSource(), "mock");

  const plan = await planSprint(project, 5);
  assert.deepEqual(plan.todoIds, [backlogTodo.id]);
  const summary = await summarizeSprint(project, sprint);
  assert.match(summary, /Sprint 1 summary/);
  const answer = await chat(project, [{ role: "user", content: "Hi" }]);
  assert.match(answer, /offline mode/);
  assert.equal(providerRequests, 1);
});
