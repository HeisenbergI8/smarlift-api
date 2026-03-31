# Prompt: Generate `.github/` AI Orchestration Setup — Universal

> **How to use**: Copy everything below the `---` line and paste it as a single message into GitHub Copilot Chat (Agent mode) while you have your target repository workspace open. Works for any tech stack — frontend, backend, or fullstack.

---

## Task

You are going to generate a complete `.github/` AI orchestration setup for this repository. This setup includes **agents, file-scoped instructions, skills, reusable prompts, a reference checklist, and a post-edit hook**. Every file you produce must be **tailored to this specific codebase** — not generic templates.

This follows a proven orchestration model with these components:

| Component                 | Purpose                                                                  | Location                |
| ------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| `copilot-instructions.md` | Master project guidelines loaded into every chat session                 | `.github/`              |
| Agents                    | Specialist AI personas with restricted tool access and defined workflows | `.github/agents/`       |
| Instructions              | File-type-scoped rules that auto-attach when editing matching files      | `.github/instructions/` |
| Skills                    | Deep workflow guides with step-by-step procedures and reference material | `.github/skills/`       |
| Prompts                   | One-click reusable prompt templates that delegate to specific agents     | `.github/prompts/`      |
| References                | Shared validation checklists that agents and skills cross-reference      | `.github/references/`   |
| Hooks                     | Auto-lint on file edit, auto-typecheck/test after agent loop completes   | `.github/hooks/`        |

---

## Optimization Principles

These are the engineering principles that make each generated file effective. Apply ALL of them:

### P1: Specificity Over Generality

Every file must reference **actual file paths, actual class names, actual module names, and actual patterns** discovered in THIS codebase. Never write "check the service files" — write "read `src/auth/auth.service.ts` for the ownership + Logger pattern".

### P2: Table-Driven Specifications

Use markdown tables for any decision mapping: decorator → when to apply, error scenario → exception type, test scenario → when to include, severity → definition. Tables turn prose into deterministic decision trees.

### P3: NEVER/ALWAYS Constraint Lists

Every agent and instruction file must end with explicit imperative constraints using NEVER and ALWAYS. These are hard rules the AI cannot override. Example: "NEVER put business logic in controllers", "ALWAYS use BigInt() for ID fields in mock data".

### P4: Minimal Tool Access Per Agent

Restrict each agent's `tools` to exactly what it needs:

- **Orchestrator**: `[read, search, edit, execute, agent, todo]` — full access, can delegate
- **Code Generator**: `[read, search, edit, execute]` — can write but cannot delegate or track tasks
- **Reviewer**: `[read, search]` — read-only, CANNOT edit (enforces separation of concerns)
- **Debugger**: `[read, search, execute]` — can diagnose and run but editing is optional (add `edit` only if the project benefits from auto-fix)
- **Refactorer**: `[read, search, edit, execute]` — can modify and verify
- **Tester**: `[read, search, edit, execute]` — can write tests and run them

### P5: Agent Hierarchy (Orchestrator-First, Direct-Implementation-Default)

The orchestrator is the entry point for feature work. It implements directly by default and delegates to specialist subagents only for large or specialized tasks. Code-generator and reviewer are `user-invocable: false` — they serve as internal specialists only.

### P6: Stage-Based Workflows

Every agent workflow uses numbered stages with numbered sub-steps. The orchestrator uses 4 stages: **Analyze → Generate → Test → Verify**. The tester uses: **Discover → Plan → Generate → Verify**. This structure prevents skipped steps.

### P7: Scenario Matrices for Test Planning

The tester agent must include a table mapping test scenarios to inclusion conditions:

| Scenario               | When to Include                                               |
| ---------------------- | ------------------------------------------------------------- |
| Happy path             | Always                                                        |
| Auth/ownership failure | When method checks user identity                              |
| Not found              | When method does lookup + null check                          |
| Duplicate/conflict     | When unique constraint or conflict is possible                |
| Validation/state guard | When method has conditional rejection                         |
| Edge cases             | Empty collections, zero values, boundary data, null optionals |

Adapt scenarios to the stack (e.g., "RBAC role check" for role-based apps, "render state" for frontend components).

### P8: Single Source of Truth for Validation

The `implementation-checklist.md` is the ONE checklist that orchestrator, reviewer, and tester all reference. Never duplicate checklist content inside agent files — point to the checklist file instead.

### P9: Auto-Attach Instructions Reduce Agent Complexity

Because instruction files auto-attach based on `applyTo` globs, agents should say "Rely on auto-attached instruction files for file-type-specific rules instead of restating them here." This prevents duplication and keeps agents focused on workflow, not rules.

### P10: Reference Files for Pattern Matching

The code-generator and tester agents must list 5-7 **specific existing files** in the codebase as pattern references, with a one-line description of what pattern each demonstrates. Example:

```
- `src/auth/auth.service.ts` — Service pattern with Logger, error handling, bcrypt
- `src/exercise/exercise.controller.ts` — Public + protected routes, ParseIntPipe
```

### P11: Structured Output Formats

Every agent that produces a report (reviewer, debugger, tester) must specify an exact output format template with markdown structure. The reviewer outputs PASS/FAIL with issues table and compliance summary. The debugger outputs a diagnosis block. The tester outputs a coverage summary.

### P12: Coverage Targets as Numbers

The tester agent and testing skill must specify numeric coverage targets by layer:

| Layer                              | Target | Rationale                 |
| ---------------------------------- | ------ | ------------------------- |
| Core business logic / services     | 80%+   | Critical logic lives here |
| Auth / security                    | 90%+   | Security-critical         |
| Thin delegates (controllers/pages) | 50%+   | Low logic                 |
| Declarative (DTOs, config, wiring) | Skip   | No logic to test          |

Adapt layer names to the discovered stack.

---

## Phase 1: Deep Codebase Discovery

Before generating anything, you MUST thoroughly explore the codebase. Your generated files will only be as good as your understanding of the project.

### 1.1 — Project Structure

```
Run these (adapt as needed):
- ls -la (root contents)
- find src -type f | head -120  (or find app, find lib, find pages — whatever exists)
- cat package.json (full read — deps, scripts, config)
- cat tsconfig.json or jsconfig.json (if exists)
```

Determine:

- **Language**: TypeScript, JavaScript, Python, Go, etc.
- **Framework**: Next.js, React, Vue, Angular, NestJS, Express, FastAPI, Django, Rails, etc.
- **Package manager**: npm, yarn, pnpm, pip, go mod, etc.
- **Monorepo or single-project**: Nx, Turborepo, Lerna, or standalone
- **Directory layout**: Where do source files, tests, configs, and assets live?

### 1.2 — Architecture & Patterns

Read 3-5 representative source files to understand:

- **Architecture style**: MVC, layered (controller → service → repository), component-based, modular, feature-based folders, etc.
- **Naming conventions**: File naming (kebab-case, PascalCase, snake_case), class/function/variable naming
- **Import ordering**: Framework → third-party → internal? Any other convention?
- **Error handling pattern**: How are errors caught, thrown, and surfaced? Custom error classes? HTTP exceptions? Error boundaries?
- **Logging pattern**: Custom logger, framework logger, console, or third-party (Winston, Pino, etc.)?

### 1.3 — Database & ORM (if applicable)

- **ORM/ODM**: Prisma, TypeORM, Sequelize, Drizzle, Mongoose, SQLAlchemy, GORM, etc.
- **Database**: PostgreSQL, MySQL/MariaDB, MongoDB, SQLite, etc.
- **Schema location**: Read the full schema file
- **ID type**: Integer, BigInt, UUID, ObjectId, etc.
- **Migration strategy**: How are migrations created and run?

### 1.4 — State Management (if frontend)

- **Library**: Redux Toolkit, Zustand, Pinia, MobX, Jotai, Context API, signals, etc.
- **Data fetching**: RTK Query, TanStack Query, SWR, Apollo Client, axios, fetch, etc.
- Read 2-3 store/slice/state files to understand the pattern

### 1.5 — Routing (if frontend)

- **Router type**: Next.js App Router, Next.js Pages Router, React Router, Vue Router, Angular Router, file-based, etc.
- **Route protection**: Middleware, HOCs, guard components, route-level auth checks?

### 1.6 — UI & Styling (if frontend)

- **Component library**: shadcn/ui, MUI, Ant Design, Chakra, Radix, Headless UI, custom, etc.
- **Styling**: Tailwind, CSS Modules, styled-components, Sass, vanilla CSS, etc.
- **Form library**: react-hook-form, Formik, VeeValidate, native, etc.
- **Validation**: Zod, Yup, Joi, class-validator, etc.

### 1.7 — Authentication & Authorization

- **Auth strategy**: JWT, session-based, OAuth, NextAuth/Auth.js, Clerk, Supabase Auth, etc.
- **Guard/middleware pattern**: How are routes/endpoints protected?
- **Role-based access**: Does the project have roles? How are they defined and enforced? (Read guard/middleware/decorator files)
- **User context extraction**: How is the current user obtained in handlers/components?

### 1.8 — Testing

- **Test runner**: Jest, Vitest, pytest, go test, Mocha, etc.
- **Test libraries**: React Testing Library, Supertest, Testing Module (NestJS), Cypress, Playwright, etc.
- **Existing tests**: Read 2-3 existing test files to understand mock patterns, assertion style, and naming
- **Test location**: Co-located (`*.spec.ts` next to source) or separate (`__tests__/`, `test/`)?
- **Coverage tool**: Istanbul, c8, built-in?

### 1.9 — CI/CD & Existing `.github/`

- Check if `.github/` already exists — **do not overwrite** useful existing content (workflows, issue templates, etc.)
- Note any existing CI workflows, PR templates, or Dependabot config

### 1.10 — Build & Commands

- Read `package.json` scripts (or `Makefile`, `pyproject.toml`, `go.mk`, etc.)
- Note: dev server command, build command, test command, lint command, format command, migration command

**IMPORTANT**: Record ALL findings. You will reference specific file paths, module names, class names, function patterns, and conventions throughout every generated file.

---

## Phase 2: Generate the `.github/` Directory

Based on your discoveries, generate every file below. **Adapt the structure to match the tech stack** — the file names, glob patterns, content, and examples must all reflect what you found.

### 2.1 — `copilot-instructions.md`

The master project guidelines document. This is the MOST important file — it's loaded into every Copilot Chat session automatically.

**Structure it with these sections** (include only sections relevant to the discovered stack):

#### Architecture section

- Create an ASCII or text diagram showing the layer flow (e.g., `Controller → Service → PrismaService → DB` or `Page → Component → Hook → Redux → API → Backend`)
- Create a **table** with columns: Layer | Does | Never Does — one row per layer
- State that each feature is a self-contained module/folder

#### Code Style section

- Language strictness level (e.g., "TypeScript strict — no `any`")
- Async pattern (e.g., "`async/await` only — no `.then()` chains")
- Control flow (e.g., "Guard clauses — early returns instead of nested conditionals")
- Logging (e.g., "NestJS `Logger` — never `console.log`" or "No `console.log` in production code")
- Naming conventions as a list: file naming, class naming, method naming, constant naming
- Import grouping order (e.g., "Framework → third-party → internal")
- Method size limit (e.g., "Extract private helpers when method exceeds ~30 lines")

#### Database/Data section (if applicable)

- ORM and database names
- ID type and conversion patterns (show code: how IDs go in and out)
- Ownership verification pattern (show the fetch → verify → operate code)
- Transaction pattern for multi-step writes
- Eager loading pattern (never N+1 loops)
- `orderBy` requirement on all list queries
- Indexing rule
- Pagination pattern — show the COMPLETE code block with `page`, `limit`, `skip`, `Promise.all([findMany, count])`, and the `{ data, total, page, limit }` response shape. State: "Empty results return `{ data: [], total: 0, page, limit }` — never 404 for lists."

#### State Management section (if frontend)

- Store configuration pattern
- Slice/reducer naming convention
- Async thunk vs data fetching library pattern
- Selector patterns and memoization rules
- When to use local state vs global state

#### Auth & Authorization section

- Auth strategy name
- User context extraction pattern (show code)
- Route/endpoint protection pattern
- Role system description (if roles exist): how defined, how enforced, current roles, extensibility
- Rate limiting configuration

#### Error Handling section

- Create a **table** mapping: Scenario | Exception/Error Type — one row per scenario
- State: "Never expose internal error details. Never throw raw `Error`." (or equivalent for the stack)

#### Security section

- Secret management pattern
- Input validation approach
- Query safety (parameterized queries / prepared statements)
- Rate limiting
- CORS configuration

#### Build & Test section

- List the ACTUAL commands from `package.json` scripts (or equivalent) as a code block

**KEY RULE**: Every pattern and code example MUST come from the actual codebase. Reference real file paths and real class/function names.

---

### 2.2 — `agents/` — 6 Agent Files

Generate these 6 agents. Each file uses YAML frontmatter. Apply optimization principles P1-P12 throughout.

---

#### `orchestrator.agent.md`

**Frontmatter:**

```yaml
---
description: 'Use when implementing a new feature, building a module, or processing a feature requirement. Central orchestrator that analyzes requirements, decomposes tasks, delegates to specialist subagents, and produces production-ready [LANGUAGE] code.'
tools: [read, search, edit, execute, agent, todo]
argument-hint: 'Describe the feature requirement you want implemented...'
---
```

**Body structure — follow this EXACT layout:**

1. **Opening persona** (1 sentence): "You are the **[ProjectName] Orchestrator** — a senior [systems architect / frontend architect] for [one-line project description]. Your job is to take a feature requirement and produce a complete, production-ready implementation with minimal orchestration overhead."

2. **Project Context** (bullet list):
   - Stack: [discovered stack]
   - Architecture: [discovered architecture — layer flow]
   - Guide: "Coding standards are embedded in `.github/copilot-instructions.md` (loaded automatically on every chat)"
   - Feature plan: Reference an `IMPLEMENTATION_CHUNKS.md` or similar if one exists; if not, omit this line.

3. **Workflow — 4 Stages** (use `###` headings):

   **Stage 1: Analyze** (numbered sub-steps)
   1. Parse the requirement — identify domain, affected models/components, and user stories
   2. Search the codebase for matching patterns and reusable code
   3. Check feature plan doc if one exists and the task maps to a planned item
   4. Identify scope, dependencies, and the file manifest
   5. Create a concise task list with the todo tool for multi-step work

   **Stage 2: Generate** (numbered sub-steps — adapt order to the stack)
   - For backend: Schema → DTOs/interfaces → Services → Controllers → Modules → App registration
   - For frontend: State/slice → API layer → Shared components → Page components → Route registration → Route protection
   - Include one line: "Prefer direct generation over sub-agent delegation. Use a specialist subagent only when the task is unusually large or narrowly specialized."

   **Stage 3: Test** (numbered sub-steps)
   1. Create or update test files alongside each new or modified module
   2. Mock dependencies — only what the module actually uses
   3. Cover: happy path, auth/ownership, not-found, error paths, edge cases
   4. Run the project's test command targeting the affected module
   5. If tests fail, fix the tests or the implementation before proceeding
   6. "Skip test generation only when the change is purely declarative (DTOs, modules, config, schema)."

   **Stage 4: Verify** (numbered sub-steps)
   1. "Self-check the work against `.github/references/implementation-checklist.md`."
   2. "Use the `reviewer` subagent only for optional second-pass validation on large or risky changes."

4. **Summary output** (what to provide after completion):
   1. Task breakdown
   2. Files created or modified
   3. Test results summary
   4. Key decisions
   5. Next steps when needed

5. **Constraints** (imperative NEVER/ALWAYS list — adapt to the stack):

   ```
   - NEVER produce placeholder or stub code — every method/function body must be complete
   - NEVER put business logic in [controllers/pages] (keep in [services/hooks/slices])
   - NEVER skip [ownership verification / route protection] on [user-scoped mutations / restricted routes]
   - ALWAYS use [project-specific ID handling pattern] for database queries
   - ALWAYS use [project-specific exception/error classes] — never raw `Error`
   - ALWAYS use [project-specific Logger] — never `console.log`
   - ALWAYS include `orderBy` on list queries (if applicable)
   - ALWAYS paginate list endpoints (if applicable)
   - ALWAYS generate unit tests for new or modified [services/components/slices]
   - ALWAYS run tests before marking work complete
   - FOLLOW existing patterns from [list 3-5 actual reference file paths]
   ```

6. **Delegation Rules** (3 rules):
   - "Always search first before creating or modifying files"
   - "Default to direct implementation inside this agent to avoid unnecessary hops"
   - "Use `code-generator` only for unusually large generation tasks; use `reviewer` as an optional validation pass, not a mandatory pipeline stage"

---

#### `code-generator.agent.md`

**Frontmatter:**

```yaml
---
description: 'Use when generating [FRAMEWORK] code including [list the layer types discovered, e.g., controllers, services, DTOs, components, slices]. Expert at producing production-ready [LANGUAGE] with [list 2-3 key libraries].'
tools: [read, search, edit, execute]
user-invocable: false
---
```

**Body structure:**

1. **Opening persona** (1 sentence): "You are the **[ProjectName] Code Generator** — an expert [framework] developer. You produce complete, production-ready code that follows the project's engineering standards with minimal prompt overhead."

2. **Your Role** (3-bullet scope):
   - "You receive specific code generation tasks from the orchestrator."
   - "Read existing patterns in the codebase to match conventions"
   - "Generate complete implementation code — no stubs, no placeholders, no TODOs"

3. **Reference Files (Always Check First)** — List 5-7 ACTUAL files from the codebase with one-line pattern descriptions:

   ```
   Before writing any code, read these files to match existing patterns:

   - `[path/to/service-file]` — [what pattern it demonstrates]
   - `[path/to/controller-or-page]` — [what pattern it demonstrates]
   - `[path/to/complex-crud]` — [what pattern it demonstrates]
   - `[path/to/auth-or-guard]` — [what pattern it demonstrates]
   - `[path/to/dto-or-form]` — [what pattern it demonstrates]
   - `[path/to/common-utility]` — [what pattern it demonstrates]
   ```

4. **Operating Rules** (4 rules):
   - "Read existing patterns first, then generate the smallest complete change set"
   - "Rely on auto-attached instruction files for file-type-specific rules instead of restating them here"
   - "Preserve existing public APIs unless the task explicitly changes them"
   - "Keep outputs production-ready: no stubs, placeholders, or TODOs"

5. **Output Format** — For each file: File path, Action (Create/Modify), one-line description

---

#### `reviewer.agent.md`

**Frontmatter:**

```yaml
---
description: 'Use when reviewing generated code for architecture compliance, security, performance, and adherence to project engineering standards. Read-only validation agent.'
tools: [read, search]
user-invocable: false
---
```

**Body structure:**

1. **Opening persona**: "You are the **[ProjectName] Code Reviewer** — a strict code quality enforcer. You validate code against the project's engineering standards. You CANNOT edit files — you can only read and report issues."

2. **Review Checklist**: "Run the shared checklist in `.github/references/implementation-checklist.md` for every review. Focus on [list the discovered concern areas: architecture, security, database, pagination, state management, accessibility, etc.]."

3. **Output Format** — specify this EXACT template:

   ```
   ## Review Result: PASS / FAIL

   ### Issues Found (if FAIL)
   1. **[SEVERITY]** File: `path/to/file` Line ~N
      - Problem: Description of the issue
      - Fix: What needs to change

   ### Compliance Summary
   - [Category 1]: ✅/❌
   - [Category 2]: ✅/❌
   - [etc.]
   ```

4. **Severity levels** — define as a table:

   | Severity | Definition                                                           | Action      |
   | -------- | -------------------------------------------------------------------- | ----------- |
   | CRITICAL | Security vulnerability or architecture violation                     | Must fix    |
   | HIGH     | Missing auth check, missing pagination, N+1 / unnecessary re-renders | Must fix    |
   | MEDIUM   | Missing index, suboptimal pattern, accessibility gap                 | Should fix  |
   | LOW      | Style issue, naming convention                                       | Nice to fix |

---

#### `debugger.agent.md`

**Frontmatter:**

```yaml
---
description: 'Use when debugging errors, diagnosing issues, tracing failures, analyzing stack traces, or troubleshooting [FRAMEWORK/STACK] problems.'
tools: [read, search, execute]
---
```

**Body structure:**

1. **Opening persona**: "You are the **[ProjectName] Debugger** — a systematic diagnostic specialist for [stack description] applications."

2. **Approach** — 4-step method with `###` headings:
   - **1. Reproduce**: Understand exact error, identify trigger and conditions
   - **2. Isolate**: Trace execution path through the layers discovered
   - **3. Diagnose**: Read source files, search for similar working patterns, check common gotchas
   - **4. Fix**: Propose targeted fix, verify standards compliance, check for similar issues elsewhere

3. **Common Issues** — organize by category based on the discovered stack. Include 3-5 categories with 3-4 specific issues each. Each issue should name the symptom, explain why it happens, and state the fix in one line. Example format:

   ```
   ## Common [Framework] Issues

   ### [Category Name]
   - **[Symptom]**: [Why it happens] — [Fix]
   - **[Symptom]**: [Why it happens] — [Fix]
   ```

   Typical categories by stack:
   - Backend: Validation Pipeline, Guards/Auth, Dependency Injection, ORM/Query Errors, TypeScript
   - Frontend: Rendering/Hydration, State Management, Routing, Auth/Guards, API/Network, TypeScript

4. **Output Format**:

   ```
   ## Diagnosis

   **Error**: [error message or behavior]
   **Root Cause**: [why it happens]
   **Location**: [file and approximate line]
   **Fix**: [what to change]

   ## Explanation
   [Brief explanation of why this fix resolves the issue]
   ```

---

#### `refactorer.agent.md`

**Frontmatter:**

```yaml
---
description: 'Use when refactoring existing code, extracting shared logic, improving code structure, applying DRY/SOLID principles, or reducing duplication. Preserves behavior while improving design.'
tools: [read, search, edit, execute]
---
```

**Body structure:**

1. **Opening persona**: "You are the **[ProjectName] Refactorer** — a code quality specialist. You improve existing code structure without changing behavior."

2. **Principles** (4 rules):
   1. Preserve behavior — refactoring must not change what the code does, only how it's organized
   2. One change at a time — make small, reviewable changes rather than massive rewrites
   3. Follow existing patterns — match the conventions established in the codebase
   4. Justify every change — explain why the refactoring improves the code

3. **Common Refactoring Patterns** — include 4-6 patterns with before/after code examples adapted to the stack. Choose from:
   - Backend: Extract private helper, extract shared ownership/auth check, extract include/select constant, guard clause flattening, extract date/filter builder, extract magic numbers
   - Frontend: Extract custom hook, extract shared component, co-locate state, simplify conditional rendering, extract form field component, consolidate API error handling, extract role/permission utility

4. **Constraints** (NEVER/ALWAYS):
   - NEVER change a public API (routes, endpoints, component props, exported interfaces) without explicit user request
   - NEVER remove tests — update them to match refactored code
   - ALWAYS run lint after refactoring
   - ALWAYS explain what changed and why in your summary

5. **Approach** (5-step):
   1. Read first — understand the full context
   2. Identify the smell — what specific problem makes this code hard to maintain?
   3. Plan the change — describe what will change before doing it
   4. Execute — make the changes
   5. Verify — confirm behavior is preserved (lint passes, types check)

---

#### `tester.agent.md`

**Frontmatter:**

```yaml
---
description: 'Use when creating tests for existing code that has no tests. Reads the target code, applies the testing skill and standards, generates a complete test file, and verifies tests pass.'
tools: [read, search, edit, execute]
argument-hint: 'Name the module, component, or service to test (e.g., "auth service", "dashboard page", "user slice")...'
---
```

**Body structure:**

1. **Opening persona**: "You are the **[ProjectName] Tester** — a dedicated test engineer for [one-line project description]. Your sole purpose is to add production-level tests to existing code that currently has no test coverage."

2. **Project Context** (bullet list):
   - Stack and test runner
   - Testing libraries
   - Test config location
   - Coding standards reference
   - Testing skill reference: `.github/skills/testing/SKILL.md`
   - Testing instructions reference: `.github/instructions/testing.instructions.md`

3. **Workflow — 4 Stages** (`###` headings):

   **Stage 1: Discover** (numbered sub-steps)
   1. Read the target file to understand every public method/function, parameters, return type, and logic
   2. Read the corresponding module/config to identify all dependencies
   3. Read any types/interfaces/DTOs used
   4. Check for existing test file — if one exists, report that and ask what to add instead of overwriting
   5. Search for existing test files in the codebase and list 2-3 by path as pattern references

   **Stage 2: Plan** (scenario matrix — THIS IS CRITICAL)
   1. List every public method/function/component
   2. For each, determine test scenarios using this matrix:

   **Create the scenario matrix table adapted to the stack:**

   For backend:

   | Scenario               | When to Include                                        |
   | ---------------------- | ------------------------------------------------------ |
   | Happy path             | Always                                                 |
   | Auth/ownership failure | When method filters by userId or checks ownership      |
   | Not found              | When method does lookup + null check                   |
   | Duplicate/conflict     | When method catches unique constraint error            |
   | State guard            | When method has conditional rejection based on state   |
   | Edge cases             | Empty list, zero values, null optionals, boundary data |

   For frontend:

   | Scenario                   | When to Include                                   |
   | -------------------------- | ------------------------------------------------- |
   | Renders correctly          | Always                                            |
   | Loading state              | When component has loading/pending state          |
   | Error state                | When component handles error display              |
   | Empty state                | When component handles no-data case               |
   | User interaction           | When component has clickable/interactive elements |
   | Form validation            | When component contains a form                    |
   | Role-conditional rendering | When component shows/hides based on user role     |

   Add stack-specific rows based on what you discovered (e.g., notification resilience, cache invalidation, rate limit handling).
   3. Create a concise task list with the todo tool

   **Stage 3: Generate**

   Create the test file alongside the source. Include:
   - **File structure template**: Show the complete test boilerplate adapted to the discovered test patterns (import style, describe/it nesting, beforeEach setup, mock patterns)
   - **Mock rules** (CRITICAL — list as bullets):
     - Mock **only** dependencies the module actually uses
     - Mock **only** the methods the module actually calls
     - Use the project's ID type for all ID fields in mock data
     - Use `jest.clearAllMocks()` / `vi.clearAllMocks()` (or equivalent) in `beforeEach`
     - Never share mutable state between tests
   - **Test quality rules** (list as bullets):
     - Every `it`/`test` block must have a meaningful assertion — no empty tests
     - Test **behavior**, not implementation details
     - Error path tests verify the specific exception/error type
     - Each describe block groups tests for one public method/function/component
     - Naming: `describe('[Name]') → describe('[method]') → it('should [behavior] when [condition]')`

   **Stage 4: Verify**
   1. Run the test command targeting the specific module
   2. If tests fail: read failure message, determine if issue is in test or source, fix accordingly
   3. All tests must pass before completing
   4. Validate against the Testing section of `.github/references/implementation-checklist.md`

4. **Coverage Targets** — adapt to the stack:

   | Layer                 | Target | Rationale                              |
   | --------------------- | ------ | -------------------------------------- |
   | [Core logic layer]    | 80%+   | Critical business/app logic lives here |
   | [Auth/security layer] | 90%+   | Security-critical                      |
   | [Thin delegate layer] | 50%+   | Low logic, mainly delegation           |
   | [Declarative layer]   | Skip   | No logic to test                       |

5. **Reference Files**: List 2-3 actual existing test files in the codebase with one-line descriptions

6. **Constraints** (NEVER/ALWAYS — include ALL of these, adapted):
   - NEVER overwrite an existing test file — if one exists, report it and ask for direction
   - NEVER write placeholder or stub tests — every `it`/`test` block must have complete assertions
   - NEVER test framework behavior (decorator wiring, guard application, route registration)
   - NEVER use snapshot tests for API responses or serialized objects (brittle)
   - NEVER mock more than what the code actually uses
   - ALWAYS use the project's ID type for all IDs in mock data
   - ALWAYS clear mocks in `beforeEach`
   - ALWAYS match the naming convention: `describe → describe → it('should ...')`
   - ALWAYS run tests and confirm they pass before completing

---

### 2.3 — `instructions/` — File-Scoped Instructions

Generate **one instruction file per major file type/layer** in the project. Use `applyTo` glob patterns to auto-attach.

**Determine the right set based on the stack:**

| Backend (e.g., NestJS, Express, FastAPI) | Frontend (e.g., Next.js, React, Vue) | Fullstack |
| ---------------------------------------- | ------------------------------------ | --------- |
| controller/route handler instructions    | component instructions               | Both sets |
| service/business logic instructions      | page/route instructions              |           |
| module/DI wiring instructions            | state management instructions        |           |
| DTO/validation instructions              | API layer/data fetching instructions |           |
| schema/migration instructions            | form instructions                    |           |
| auth guard/middleware instructions       | auth guard/middleware instructions   |           |
| testing instructions                     | testing instructions                 |           |

Each instruction file must include:

- YAML frontmatter with `description` and `applyTo` (glob matching the file type)
- Rules and anti-patterns specific to that file type
- A standard template with code examples pulled from the actual codebase
- Import ordering convention
- Common mistakes to avoid

---

### 2.4 — `skills/` — 7 Skills

Generate 7 skill folders, each with a `SKILL.md` and optional `references/` subfolder.

**Determine the right set based on the stack:**

| Skill                          | Backend Focus                                | Frontend Focus                                   |
| ------------------------------ | -------------------------------------------- | ------------------------------------------------ |
| feature-implementation         | Schema → DTO → Service → Controller → Module | Slice → API → Components → Page → Route          |
| api-design OR component-design | REST patterns, status codes, pagination      | Component hierarchy, composition, accessibility  |
| code-review                    | Architecture, security, DB, pagination       | Architecture, RBAC, accessibility, performance   |
| debugging                      | ORM, DI, auth, query errors                  | Rendering, state, routing, hydration             |
| performance                    | Query optimization, N+1, indexing, caching   | Re-renders, code splitting, bundle size, caching |
| refactoring                    | Extract helper, ownership check, constants   | Extract hook, extract component, co-locate state |
| testing                        | Service mocking, ownership tests, pagination | Component rendering, interaction, state, mocks   |

Each `SKILL.md` must include:

- YAML frontmatter with `name`, `description`, `argument-hint`
- "When to Use" section
- Step-by-step procedure
- Code examples from the actual codebase
- Output format

For skills that benefit from reference material (api-design/component-design, performance, refactoring), create a `references/patterns.md` with concrete before/after code examples.

---

### 2.5 — `prompts/` — 4 Reusable Prompts

Generate 4 prompt files with YAML frontmatter (`description`, `agent`, `argument-hint`):

| Prompt                                  | Agent          | Purpose                                                             |
| --------------------------------------- | -------------- | ------------------------------------------------------------------- |
| `implement-feature.prompt.md`           | `orchestrator` | Full feature implementation from requirement                        |
| `add-[endpoint\|page\|route].prompt.md` | `orchestrator` | Add a single endpoint/page to existing module (name based on stack) |
| `generate-tests.prompt.md`              | `agent`        | Generate comprehensive tests for specified code                     |
| `review-code.prompt.md`                 | `reviewer`     | Review code against engineering standards                           |

Each prompt includes instructions and a `{user input}` placeholder.

---

### 2.6 — `references/implementation-checklist.md`

Generate a comprehensive `- [ ]` checkbox list covering all quality dimensions relevant to the discovered stack. Choose from these sections as applicable:

- **Architecture** — layer separation, module boundaries, single responsibility
- **Security** — auth guards, input validation, secret management, role enforcement
- **Auth/RBAC** (if roles exist) — guard application, role checks, unauthorized handling
- **Database** (if applicable) — ID handling, query patterns, indexing, transactions, constraints
- **State Management** (if frontend) — slice patterns, no mutation, selector memoization
- **API Integration** — type safety, error handling, auth header injection
- **Pagination** (if applicable) — skip/take pattern, response shape, empty results
- **Accessibility** (if frontend) — semantic HTML, ARIA, keyboard nav, contrast
- **Performance** — no N+1/unnecessary re-renders, proper loading, caching
- **TypeScript/Type Safety** — no `any`, all inputs/outputs typed, strict mode
- **Error Handling** — proper exception types, user-facing messages, no internal leaks
- **Code Quality** — no `console.log`, naming conventions, import order, no dead code
- **Testing** — test files exist, happy path covered, error paths covered, auth/RBAC tested, tests pass

---

### 2.7 — `hooks/post-edit-lint.json`

Generate a hook file adapted to the project's linter and test runner:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "<lint-fix command for the project's file types>",
        "timeout": 10
      }
    ],
    "PostAgentLoop": [
      {
        "type": "command",
        "command": "<typecheck or test command that provides quick feedback>",
        "timeout": 60
      }
    ]
  }
}
```

Adapt the commands based on the discovered toolchain:

- **TypeScript + ESLint**: `npx eslint --fix` on `.ts/.tsx` files, `npx tsc --noEmit` or `npx jest --passWithNoTests` for post-loop
- **Python + Ruff/Black**: `ruff check --fix`, `mypy` or `pytest` for post-loop
- **Go**: `gofmt -w`, `go vet` or `go test` for post-loop
- Use the actual commands from the project's `package.json` scripts or equivalent

---

## Phase 3: Self-Verification

After generating all files, verify:

1. **Completeness**: Count your files — you should have approximately 30+ files across the `.github/` tree
2. **No generic templates**: Every file references **actual** module names, file paths, class names, and patterns from THIS codebase — not hypothetical examples
3. **Stack consistency**: All glob patterns, code examples, and patterns match the actual tech stack
4. **Cross-reference integrity**: Agents reference skills and instructions that exist; skills reference the checklist; prompts reference agents by correct name
5. **Convention fidelity**: File naming, code style, error handling, and import ordering all match codebase conventions discovered in Phase 1
6. **Auth/RBAC integration** (if applicable): Auth patterns appear in copilot-instructions, relevant agents, guard instructions, feature-implementation skill, testing skill, and the implementation checklist

## Summary

Provide:

1. **Codebase profile**: Stack, framework, database, auth strategy, test runner, styling (1-2 lines each)
2. **Files created**: Count and full tree listing
3. **Key conventions encoded**: The 5-10 most important patterns captured from the codebase
4. **Recommended follow-ups**: Anything the project would benefit from (e.g., missing test infrastructure, no linter config, inconsistent patterns found)
