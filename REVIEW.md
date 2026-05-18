# Sudo Code review pass 2

## Summary
The repo now has a functional lab-style surface, but the codebase shape regressed hard on cleanliness and maintainability. The main risks are architectural: one 1,700-line workspace component owns too many concerns, the old pre-lab UI stack still ships beside the new one, and AI/storage flows are duplicated instead of composed.

Scalability is also heading the wrong way: tracker state is rewritten as one large blob, workspace state forks into separate keys, and the chat assistant silently ignores most of the catalog after the first 24 problems. Overall verdict: REQUEST CHANGES.

Checks run:
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Architecture notes
- Keep these seams: `lib/review-schema.ts:3-73` is a good single source of truth for API contracts, and `lib/tracker.ts:32-95` does the right thing by sanitizing persisted tracker data before use.
- The live app now routes entirely through the new lab surface: `app/page.tsx:3-4`, `app/problems/page.tsx:1-3`, `app/tracker/page.tsx:1-3`, `app/problems/[slug]/page.tsx:3-5`.
- But the old stack is still present as first-class code: `components/page-frame.tsx:12-29`, `components/site-header.tsx:28-63`, `components/problem-pane.tsx:84-140`, `components/problem-catalog.tsx:41-105`, `components/problem-tracker.tsx:856-1067`, `components/feedback-panel.tsx:478-579`.
- Cleanliness: not clean right now. The repo is carrying parallel UI architectures plus large dead-looking surface area.
- Scalability: the current weak spots are `app/api/chat/route.ts:68-75` (catalog prompt capped to 24 problems) and `lib/tracker.ts:117-177` + `components/problem-workspace.tsx:313-319,398-409` (whole-object local persistence plus split keys).
- Maintainability: the main offender is `components/problem-workspace.tsx:68-200,205-665,704-906,908-1728`, which mixes parsing, rendering, layout, persistence, review orchestration, chat UI, and the entire styling layer in one file.

## Findings by severity

### High

1. `components/problem-workspace.tsx:68-200,205-665,704-906,908-1728` — the workspace is a god component
Problem:
The same file owns syntax tokenization, review transport, layout drag handlers, local persistence, fake test execution UI, embedded guide chat, and an 800+ line CSS template string. That makes small changes high-risk and almost impossible to test in isolation. It also guarantees merge conflicts because visual, state, and API work all land in the same file.

Concrete fix:
Split it into at least four units:
- `workspace/use-workspace-layout.ts`
- `workspace/use-review-runner.ts`
- `workspace/workspace-guide.tsx`
- `workspace/workspace-editor.tsx`
- move `LAB_STYLES` into `components/lab/lab-theme.css` or a CSS module

2. `app/page.tsx:3-4`, `app/problems/page.tsx:1-3`, `app/tracker/page.tsx:1-3`, `app/problems/[slug]/page.tsx:3-5`, `components/page-frame.tsx:12-29`, `components/site-header.tsx:28-63`, `components/problem-pane.tsx:84-140`, `components/problem-catalog.tsx:41-105`, `components/problem-tracker.tsx:856-1067`, `components/feedback-panel.tsx:478-579` — the repo is carrying two app architectures at once
Problem:
The routes render the new lab components, but the previous page shell/problem/tracker/feedback stack still exists as substantial production code. That is not harmless clutter: it doubles the number of places a future contributor has to inspect before changing navigation, problem rendering, tracker behavior, or coaching UX.

Concrete fix:
Pick one of these paths explicitly:
- If the migration is complete, delete the old stack in one cleanup PR.
- If the migration is still staged, move the old stack behind `legacy/` and document that it is frozen.
Either way, stop leaving both architectures at the same level in `components/`.

3. `app/api/review/route.ts:45-123`, `app/api/review/guide/route.ts:36-212`, `app/api/review/quick-help/route.ts:48-111`, `app/api/chat/route.ts:68-109`, `components/problem-workspace.tsx:735-793`, `components/lab/lab-chat.tsx:150-196` — AI behavior is duplicated across too many endpoints and clients
Problem:
The app now has four separate server-side prompt/orchestration paths plus two different client chat implementations. Problem context is built differently in each path, tone/rules differ, and behavior will drift further with every tweak. This is already visible: the workspace guide and the global lab chat both hit `/api/chat`, but only one injects pseudocode context.

Concrete fix:
Create shared server helpers:
- `lib/ai/problem-context.ts` for slug -> prompt context
- `lib/ai/openai-client.ts` for model selection + request wrapper
- `lib/ai/chat-policies.ts` for navigation-coach vs problem-coach rules
Then keep thin route handlers that compose those helpers instead of inlining full prompt logic in each endpoint.

4. `components/problem-workspace.tsx:313-319,398-409`, `lib/tracker.ts:117-177`, `components/lab/lab-tracker.tsx:53-71` — persistence is split across ad-hoc keys and whole-object rewrites
Problem:
The canonical tracker store is `sudocode:tracker:v2`, but the workspace also writes `sudocode:lab:complete:${problem.slug}` and no longer persists drafts. On top of that, tracker updates still serialize and rewrite the full tracker object on each change. This is both a maintainability problem (multiple sources of truth) and a scalability problem (client writes get more expensive as the catalog and metadata grow).

Concrete fix:
Introduce one client persistence module with explicit methods such as:
```ts
getTrackerEntry(slug)
patchTrackerEntry(slug, partial)
getDraft(slug)
setDraft(slug, pseudocode)
```
Make the workspace consume that module instead of inventing separate localStorage keys.

### Medium

5. `app/api/chat/route.ts:68-75` — the global assistant only sees the first 24 problems
Problem:
The catalog prompt is built with `getProblemSummaries().slice(0, 24)`. The app markets a 75-problem set, but the assistant can only recommend from a truncated subset. This gets worse, not better, as more problems are added.

Concrete fix:
Do not stuff a fixed prefix of the catalog into every prompt. Either:
- build a compact searchable index keyed by concept/category/difficulty, or
- resolve only the subset relevant to the current request.
At minimum, stop hard-coding `24`.

6. `components/problem-workspace.tsx:748-765`, `app/api/chat/route.ts:12-20,104-109` — the workspace guide smuggles pseudocode into chat history as a fake user message
Problem:
The workspace client injects the current pseudocode draft into `messages` as a synthetic user turn instead of sending a dedicated field. That makes the `/api/chat` contract implicit and brittle: the server cannot distinguish real conversation from hidden context, and future prompt logic will accidentally reason over the draft as if the user literally typed it.

Concrete fix:
Extend the `/api/chat` request schema with an optional `draftPseudocode` field and pass it explicitly:
```ts
context: { page: "workspace", problemSlug },
draftPseudocode: code,
messages: [...]
```
Then let the server decide how that context should be injected.

7. `README.md:27-39,93-115`, `app/page.tsx:68-70,191-193`, `app/problems/page.tsx:14-17`, `components/problem-workspace.tsx:303,365-394` — product/docs still describe features and routes the current app no longer has cleanly
Problem:
The README still documents `api/review/guide`, `feedback-panel.tsx`, `problem-tracker.tsx`, and a “Check logic” / “Guide mode” flow, while the live app now uses lab shell pages and the workspace markets step-through behavior that is not actually wired (`activeLine` is declared but never driven). That makes onboarding and future maintenance harder because the docs describe a different architecture from the code.

Concrete fix:
Rewrite the README around the actual route/component map, and stop advertising step-through execution until a real trace exists.

8. `components/lab/lab-shell.tsx:4-50`, `components/lab/lab-chat.tsx:20-23,150-196`, `components/problem-workspace.tsx:704-843` — chat UI behavior is duplicated instead of shared
Problem:
The app has both a global `LabChat` and a separate workspace `WorkspaceGuide`, each with its own local message state, request code, reset behavior, and UI chrome. They are similar enough to drift but different enough to confuse future refactors.

Concrete fix:
Extract a shared `useChatSession()` hook and a shared transport layer. Keep two skins if needed, but stop duplicating fetch/state/reset behavior.

### Low

9. `components/problem-card.tsx:14-38` vs `components/lab/lab-problem-list.tsx:177-239` — problem list rendering is duplicated
Problem:
The old catalog stack and the new lab catalog both maintain their own card/list rendering patterns. This is smaller than the issues above, but it is another sign that the migration happened by cloning UI rather than by composing reusable primitives.

Concrete fix:
Unify around one list item primitive that can render in “full row” and “compact card” variants from the same data contract.

## Refactor proposals (ranked by impact/effort)

1. High impact / Large effort — decompose `components/problem-workspace.tsx:68-200,205-665,704-906,908-1728`
Rationale:
This file is the biggest maintainability risk in the repo. Splitting state, UI, and styling boundaries will reduce merge conflicts, make behavior testable, and unblock future feature work.

2. High impact / Medium effort — unify AI orchestration behind shared helpers across `app/api/review/route.ts:45-123`, `app/api/review/guide/route.ts:36-212`, `app/api/review/quick-help/route.ts:48-111`, `app/api/chat/route.ts:68-109`
Rationale:
Today the same problem context and coaching behavior are being rebuilt in multiple places. One shared context builder plus one OpenAI wrapper will cut duplication fast.

3. High impact / Medium effort — collapse the repo to one active UI architecture using `app/page.tsx:3-4`, `components/lab/lab-shell.tsx:4-50`, `components/page-frame.tsx:12-29`, `components/problem-tracker.tsx:856-1067`, `components/feedback-panel.tsx:478-579`
Rationale:
The current dual-stack layout makes every review slower and every future refactor harder. Either archive the old stack or remove it.

4. Medium impact / Medium effort — centralize browser persistence across `lib/tracker.ts:117-177`, `components/lab/lab-tracker.tsx:53-71`, `components/problem-workspace.tsx:313-319,398-409`
Rationale:
One persistence adapter would fix the current split-brain storage model and make draft/completion behavior predictable.

5. Medium impact / Small effort — remove the hard-coded catalog cap in `app/api/chat/route.ts:68-75`
Rationale:
This is the cheapest scalability win in the repo. The current assistant is artificially blind to most of the product catalog.

6. Medium impact / Small effort — move `LAB_STYLES` out of `components/problem-workspace.tsx:908-1728`
Rationale:
Even before the larger workspace split lands, extracting the CSS will make diffs reviewable and let the theme evolve without reopening the entire component.

## Follow-ups for coder
- `components/problem-workspace.tsx:303,365-394` — decide whether step-through execution is a real feature or marketing copy. If real, return an execution trace; if not, remove the claim everywhere.
- `app/api/chat/route.ts:22-36` vs `app/api/review/guide/route.ts:58-78` — decide whether the app wants one “navigation assistant” and one “problem coach”, or one assistant with explicit modes. The current middle ground is hard to reason about.
- `components/problem-workspace.tsx:313-319,398-409` vs `lib/tracker.ts:14,154-177` — decide the single canonical storage contract for completion + drafts before adding more workspace features.
- `README.md:93-115` — rewrite the project structure section so it matches the routes and components that are actually live today.
