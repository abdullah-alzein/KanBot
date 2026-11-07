# Kanbot client

React 19 + TypeScript + Vite frontend for the Kanbot API (`../server`).

## Run it

```bash
# 1. Backend (separate terminal)
cd server
npm install
cp .env.example .env     # then add AI_API_KEY / AI_BASE_URL / AI_MODEL for real AI (Groq)
npm run seed             # demo@kanbot.dev / password123 (resets the DB)
npm run dev              # http://localhost:4000/api

# 2. Frontend
cd client
npm install
cp ../server/src/types/api.ts src/types/api.ts   # the API contract
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm run dev              # http://localhost:5173
```

`npm run lint` and `npm run build` must pass with no errors. The Groq key lives only in `server/.env`, never in the client.

## Design choices

| Choice                                         | Why                                                                                                                                                                                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plain CSS with design tokens (`src/index.css`) | No UI library needed; tokens follow the Notion design system in `notion-DESIGN.md`: purple `#5645d4` primary, 8px rectangular buttons, 12px cards, pastel tints for sprint sections, project cards and board columns, navy hero on the auth pages. |
| Native `<dialog>` for modals and drawers       | Focus trap, Esc and an inert background come from the browser.                                                                                                                                                                                     |
| TanStack Query for all server state            | Caching, invalidation and optimistic updates with rollback.                                                                                                                                                                                        |
| react-hook-form + zod                          | Client validation plus mapping server `details[]` to fields.                                                                                                                                                                                       |
| dnd-kit                                        | Pointer and keyboard drag-and-drop.                                                                                                                                                                                                                |
| react-markdown (raw HTML off)                  | AI output is never rendered as HTML.                                                                                                                                                                                                               |
| Todo details in the URL (`?todo=<id>`)         | Works over every project page and survives refresh.                                                                                                                                                                                                |

## Structure

```
src/
  api/          fetch wrapper (ApiError, 401 handling) + one module per domain
  hooks/        TanStack Query hooks (useBacklog, useMoveTodo, useSprints, ...)
  lib/          constants, date formatting, query client, optimistic-update helper
  components/   Button, Field, Dialog, ConfirmDialog, RowMenu, Badges, Markdown, toast/
  features/     auth, projects, backlog, todos, sprints, board, ai
  layouts/      Root, Auth, App (shell), Project
```

## Completed

- **Auth:** register/login with field errors, 409/401 handling, session restore via `/auth/me`, guards with `?redirect=`, session-expired redirect on any 401, logout clears cache.
- **Projects:** list, create, edit (key hint), delete with confirmation, switcher, project id in the URL.
- **Backlog/todos:** ordered list with totals, quick create (Enter/Escape), details drawer (all fields, discard warning, server field errors, delete), debounced search (350 ms) with priority/type filters.
- **Sprints:** planned sprint sections, create/edit/delete, start dialog (defaults today and +14 days, disabled while another sprint is active, 409 handled), completion with carry-over target, history and detail pages using the saved `completedStats`.
- **Drag and drop:** backlog reorder and board moves with optimistic updates and rollback. Board cards can be dropped anywhere in a status column, including empty columns. Non-drag alternatives: row menu (top, bottom, move to sprint or backlog) and a status select on board cards.
- **AI:** Ask AI drawer with chat (Enter/Shift+Enter, Markdown, thinking state, kept while closed, reset on project switch or New chat), Generate todos (editable drafts, nothing saved until confirmed), Plan sprint (editable goal and selection, running total vs capacity, created only on confirmation), sprint summary (saved, regenerate, timestamp), Mock AI badge, "AI can make mistakes" notice, loading/error/retry states.

## Known limitations

- Dropping a board card onto another card inserts it before that card.
- Dragging a backlog todo into a planned sprint is not supported; use the row menu instead.
- Reordering is paused while a backlog filter is active.
- Chat history is not persisted (the backend is stateless).
- No automated tests; verification so far is type-check, lint, build and manual flows.
