# ADR-001: Raising Generated App Quality

**Status:** Proposed
**Date:** 2026-04-17
**Deciders:** @archas
**Supersedes:** informal Part B notes

## Context

Phase 1 shipped a pipeline: user prompt → LLM → JSX → Babel transpile → whitelisted runtime. Phase 2 (Part A) added concurrent chat-based generation with per-app message history. Token limits were bumped (16k/16k/32k) and the validator's false-positive brace check was removed.

The remaining failure modes observed in practice:

| Symptom | Root cause |
|---|---|
| Flat "demo-grade" UI even on simple prompts | Weak visual guidance in the system prompt; temperature too high for code |
| Dead button handlers, missing empty/error states | No directive forcing state enumeration before render |
| Syntax errors reach the user (Babel parse fails) | No repair loop — one shot, fail |
| Refinements drift stylistically from the original | `refineJSX` passes only current code, not intent history |
| Apps don't visually match the Oggy host | No shared design tokens communicated to the model |
| New users don't know which provider to pick | Raw provider picker instead of task-oriented mode |
| Generation feels like a void — no progress signal | No streaming; ETA helps but isn't granular |
| No baseline to measure improvements against | No eval harness |

The brief is "make generated apps much better quality." This ADR decomposes that into measurable goals, enumerates the design space honestly (with tradeoffs, not just a checklist), and sequences the work.

## Goals

**Primary (measurable):**

| Metric | Baseline (estimated) | Target |
|---|---|---|
| **Parse-success rate** (Babel accepts output on first try) | ~85% | ≥98% (post-repair) |
| **Directive-compliance rate** (output honors ≥80% of stated rules) | unknown | measured + trended |
| **Refinement coherence** (refined output preserves non-changed style) | poor anecdotally | measured + trended |
| **User-perceived wait** (first visible progress) | full generation latency | < 1s after submit |
| **Cost per generation** (user-key spend) | ~$0.05–0.15 | bounded; documented |

**Secondary (qualitative):**
- Apps visually harmonize with the Oggy shell
- Apps include realistic seed data, not "Item 1, Item 2"
- Apps handle empty, loading, and error states by default

## Constraints

1. **Solo development.** Can't invest in heavy infra before it pays off.
2. **User-owned API keys.** We don't see their costs; we should minimize multi-pass extravagance.
3. **Three providers must keep working.** OpenAI, Google, Anthropic. No provider-exclusive features unless gracefully degraded.
4. **Sandboxed runtime.** Output executes in a whitelisted component set, no imports, no eval. Constrains what patterns we can promote.
5. **No prior ADR context.** This is the first ADR; establish the template.
6. **Part A is already landed.** Messages-per-app, concurrent generation, cancel, EWMA ETA. New work builds on it.

## Strategy

Quality is a stack of interacting levers, not a single knob. The strategy below breaks quality into seven levers and makes an explicit call on each, then sequences the landings by dependency and expected impact. Each lever is its own mini-ADR below with options + tradeoff + decision.

High-level shape:

```
     ┌─ Prompt content (Lever 1) ──────────┐
     │                                     │
user prompt ─▶ Router (Lever 3)            │
     │          │                          ▼
     │          ├─▶ Plan pass (Lever 2) ──▶ Implement pass ──▶ Repair loop (Lever 7) ──▶ JSX
     │          │    (cheap model)           (user model)         (on failure only)
     │          │
     │          └─▶ Context builder (Lever 4) ── history-aware prompt for refines
     │
     └─ UI feedback (Lever 5): inline chat, ETA, streaming signal (Lever 6)

                    Eval harness (Lever 7b) watches all of the above.
```

## Lever-by-lever decisions

Each lever is an independent decision. They compose but don't require each other to ship.

---

### L1 — Prompt engineering

**Question:** How do we raise baseline output quality without architectural change?

#### Options

**Option A: Rules-only iteration** (status quo, bigger). Add more CRITICAL RULES.
- Pros: trivial.
- Cons: attention dilution — past ~15 rules, adherence drops.

**Option B: Few-shot + structured guidance**. Add one gold-standard example; reframe rules as a checklist; add a Design Tokens block; add a State Checklist directive; drop temperature 0.7 → 0.3; add per-component "when to reach for this" hints.
- Pros: demonstrably the highest-ROI move in prompt engineering practice; works across all three providers.
- Cons: ~+1500 input tokens per call (~+$0.005 on Sonnet; nothing on Flash).

**Option C: Provider-specific prompt adapters**. XML tags for Claude, terse for Gemini, Markdown for OpenAI.
- Pros: small extra quality win per provider.
- Cons: 3× maintenance; prompt drift; not worth the coordination cost until the base prompt is stable.

**Option D: Template-anchored generation**. Pre-fill scaffolding; model only fills gaps.
- Pros: very high parse reliability.
- Cons: sacrifices the "creative component" the user hired an LLM for; most useful for narrow domains we don't have.

#### Decision: **B now; C deferred; D rejected.**

#### Implementation

- `services/llm/index.ts`: rewrite `SYSTEM_PROMPT`. Sections: Role, Rules (numbered, short), Design Tokens (Oggy's actual Colors/Spacing/Type), Component Toolbox (when to reach for each whitelisted piece), State Checklist (enumerate states before render), Realism (seed data), Polish bar, one full Example (~120 lines, referencing the tokens).
- Restructure `getRefineSystemPrompt` so current code lives in an **assistant turn**, not embedded in the system prompt — improves model's treatment of it as prior work rather than reference text.
- Add `PROMPT_VERSION = 'v2'` constant. Stamp `promptVersion` onto each assistant `ChatMessage` so we can correlate regressions with versions.
- Drop temperature 0.7 → 0.3 in all three provider clients.

#### Risk

Adding the example nudges the model toward that example's pattern. Mitigate: pick a neutral exemplar (a card+form+list pattern common to many apps).

---

### L2 — Multi-pass generation (Plan → Implement)

**Question:** Does separating "what to build" from "how to build it" produce measurably better apps, at acceptable cost/latency?

#### Options

**Option A: Single pass.** Status quo.
- Pros: lowest latency, lowest cost.
- Cons: model juggles planning and coding in one attention pass → incomplete apps.

**Option B: Plan → Implement.** First call (cheap/fast model, e.g., Gemini Flash) produces a JSON plan: states, data model, key interactions, visual direction, edge cases. Second call (user's chosen model) implements from the plan.
- Pros: smaller surface per call; planning is cheap (~$0.001); implement stays on the good model.
- Cons: adds ~2–5s latency; failure modes double (either pass can fail).

**Option C: Implement → Critique → Revise.** Generate, then ask the same model to find bugs and fix them.
- Pros: catches real issues.
- Cons: 2× cost on the expensive pass; +30s latency on every generation.

**Option D: Ensemble (two models, pick best).**
- Pros: top quality.
- Cons: 2× cost every time; "pick best" needs a judge; not worth it for a mini-app generator.

#### Decision: **B, opt-in via Quality mode (see L3). A remains default for Fast mode.**

#### Implementation

- `services/llm/planner.ts`: new module. `plan(prompt, signal) → Promise<AppPlan>` where `AppPlan` is a typed JSON shape.
- Planner always calls Gemini Flash regardless of user-selected provider (cheap, fast, structured output works well).
- Store `plan` on the assistant `ChatMessage` so the ChatPanel can show "Planning → Coding" as two phases of one message (no extra bubble).
- `generationManager.startJob`: if `mode === 'quality'`, call planner first, attach plan to implement prompt.
- Refines **skip planning**: you already have a component; a plan adds noise.

#### Cost model

Assume 1000 tokens in/2500 tokens out for plan, 3000 in/6000 out for implement:

| Mode | Plan cost (Flash) | Implement cost (Sonnet) | Total |
|---|---|---|---|
| Fast | — | ~$0.02 (Flash implement) | $0.02 |
| Quality (plan+impl) | $0.003 | $0.09 | $0.093 |

Plan overhead is ~3% of Quality cost. Acceptable.

#### Risk

Plan → implement introduces cross-call coupling. If the plan is garbage (hallucinated states), implement faithfully builds garbage. Mitigation: include a small self-check in the plan schema ("confidence: low|med|high") and bypass planning on low confidence.

---

### L3 — Model selection strategy

**Question:** Do we keep raw provider pickers, or abstract to task-oriented modes?

#### Options

**Option A: Raw provider picker** (status quo).
- Pros: power-user control.
- Cons: new users don't know. "Which is best?" has no good answer in the UI. Ties our feature set to whichever provider the user happens to pick.

**Option B: Fast / Quality mode**. Hide providers behind intent. Fast = Gemini Flash (current: `gemini-3-flash-preview`). Quality = Claude Sonnet (current: `claude-sonnet-4-20250514`). Advanced toggle exposes the raw picker for users who want it.
- Pros: good defaults; clear mental model; unlocks L2 (Quality can do two-pass, Fast stays single-pass).
- Cons: users need keys for both if they want both modes; we pick the canonical "Quality" model and have to maintain that choice.

**Option C: Auto-route by prompt**. Heuristic: long/complex → Quality, short/simple → Fast.
- Pros: zero-config.
- Cons: surprising ("why did it use a different model?"); heuristic is hard to tune; key availability makes it flaky.

**Option D: All models, user picks each generation**. Current + friction per-generation.
- Pros: none beyond current.
- Cons: high friction.

#### Decision: **B. Default to Quality when the Anthropic key is present; else Fast; else prompt the user.** C can be a future enhancement behind a flag.

#### Implementation

- `store/appStore.ts`: add `generationMode: 'fast' | 'quality'`. Keep `selectedProvider` for Advanced mode.
- `hooks/useGeneration.ts`: resolve mode → provider at call time, checking key availability. If chosen mode has no key, surface an actionable error ("Add your Anthropic key in Settings to use Quality mode").
- `app/(tabs)/settings.tsx`: mode toggle at top; Advanced section reveals per-provider picker.
- `components/ProviderPill.tsx` → rename to `ModePill.tsx` with "Fast" / "Quality" labels; keep the old component alive for Advanced.

#### Risk

Canonical "Quality" model choice drifts over time. Mitigation: make the mapping a const in one file (`services/llm/modeRouter.ts`) so we can flip it when a better model ships.

---

### L4 — Context strategy for refinements

**Question:** What do we send to `refineJSX` to maximize coherence without blowing token budgets?

#### Options

**Option A: Current code only** (status quo). `refineJSX(currentCode, newPrompt)`.
- Pros: bounded size.
- Cons: model doesn't know prior intent; refinements drift ("make it darker" after 3 prior tweaks has no anchor).

**Option B: Full message history**. `refineJSX(messages[])`.
- Pros: complete context.
- Cons: unbounded growth; easily 20k+ tokens input; multiple versions of JSX in history; cost explodes for iterating users.

**Option C: Selective context**. First user prompt (intent anchor) + last N user prompts (recency) + current code (state of truth). Drop old assistant JSX entirely — the current one supersedes.
- Pros: bounded (~5k tokens typical), captures the signal without the noise.
- Cons: heuristic tuning needed.

**Option D: Summarized context**. When history exceeds threshold, ask a cheap model to summarize it into a "directive digest."
- Pros: infinite horizon.
- Cons: adds a call; summarizer can drop important details; over-engineered for realistic session lengths.

#### Decision: **C with D as future fallback.** The realistic session length for a mini-app is 3–10 refinements; C handles that natively.

#### Implementation

- `services/llm/index.ts`: change `refineJSX` signature to `refineJSX(context: RefineContext, signal?)` where `RefineContext = { originalPrompt: string, recentRefinements: string[], currentCode: string, newPrompt: string }`.
- All three provider clients: map context into native conversation shape. For Anthropic/OpenAI, use proper `messages: [{role:'user',content:original},{role:'assistant',content:currentCode},{role:'user',content:newPrompt}]`. For Gemini, equivalent `contents[]`.
- `generationManager`: build context from the app's ChatMessage history. Rule: `originalPrompt` = first user message; `recentRefinements` = up to 3 most recent user messages before the new one; `currentCode` = `app.currentJSX`; `newPrompt` = just-appended user text.
- Add a "Preserve the existing visual style unless explicitly asked to change it" directive to `getRefineSystemPrompt`.

#### Risk

Passing old prompts might confuse the model about what to do *now*. Mitigation: frame the prior messages as history, and the last user message as the instruction. Provider-native role mapping handles this naturally.

---

### L5 — Repair loop on parse failure

**Question:** When Babel fails to parse, should we show the error or try to fix it silently?

#### Options

**Option A: Surface the error** (status quo).
- Pros: transparent; cheap.
- Cons: ~10–15% of generations hit this; UX is poor.

**Option B: Single retry with error context**. On parse fail, re-call the same provider with "Your previous output failed to parse: <error>. Return a corrected version."
- Pros: catches most truncation/typo issues at 1× extra call cost.
- Cons: some failures (fundamental logic issues) retry the same garbage.

**Option C: Up to 2 retries with escalating context**. Retry 1: same model with error. Retry 2: switch to a bigger/different model.
- Pros: highest recovery rate.
- Cons: can 3× the cost of a failing generation; complex routing.

**Option D: AST-based auto-fix for common issues**. Detect missing braces, unclosed JSX, trailing commas. Fix mechanically.
- Pros: deterministic, free.
- Cons: heroic engineering for marginal gain; fragile.

#### Decision: **B. Single retry, same model. Only fires on failure — asymmetric win.**

#### Implementation

- `services/jsx/transformer.ts`: export a pure `parse(code) → { ok: boolean, error?: { line, col, message } }` alongside the existing transform.
- `services/llm/repair.ts`: new module with `withRepair(generateFn, ...) → string`. Calls once, parses, if fail calls once more with error context appended.
- `generationManager.startJob`: wrap the provider call in `withRepair`.
- Chat UI: during repair, the pending message's phase becomes "fixing syntax…". User sees continuous progress, not a failure-then-retry stutter.

#### Risk

Repair can mask latent prompt quality issues (we never see the failure rate). Mitigation: log every repair attempt + whether it succeeded to local telemetry (console-only for now). When we add L7 evals, raw failure rate is one of the tracked metrics.

---

### L6 — Streaming & perceived latency

**Question:** How do we make 15–30s feel faster?

#### Options

**Option A: Static progress** (status quo). ETA + pulse.
- Pros: simple, already landed.
- Cons: user has no signal that anything's happening beyond a clock.

**Option B: Token streaming, text-only display**. Stream tokens; show accumulating character/line count in the ChatMessage. Preview stays empty/placeholder until end.
- Pros: clear progress; no risk of broken mid-stream renders; all three providers support SSE.
- Cons: user doesn't see the app until the end.

**Option C: Token streaming with live preview**. Stream tokens; try to parse every ~500ms; swap the rendered component on successful parse.
- Pros: feels magical when it works.
- Cons: complex. Mid-stream code rarely parses cleanly. If a partial parse *succeeds* but JSX is half-wired, the runtime (ErrorBoundary) will show an ugly error flash. Mitigation needed: only render if the last assistant message's `status` becomes `success`.

**Option D: Stream + strict "don't render until complete"**. Combine B+C: show text stream AND render the preview only on completion. Best of both.
- Pros: progress signal + no rendering errors.
- Cons: users might want to see it build up; but given the failure modes of C, this is the safe compromise.

#### Decision: **B first (ships the progress signal).** Consider D in a later phase; C too risky.

#### Implementation (phase B)

- Each provider client gets a sibling method: `generateJSXStream(ctx, signal): AsyncIterable<StreamEvent>` where `StreamEvent = { type: 'text', delta: string } | { type: 'done', full: string }`.
- `generationManager.startJob`: when streaming is enabled, accumulate chunks; update the pending message's `estimatedMs` countdown to reflect actual progress rate (bytes received / expected ratio).
- `GeneratingMessage.tsx`: show live character count and elapsed time instead of pure countdown; the shimmer bar advances based on progress.
- Feature flag `useStreaming: boolean` in settings (default on for Fast mode, off for Quality until proven stable).

#### Risk

Streaming adds complexity to error handling and AbortController propagation. Mitigation: start with one provider (OpenAI — best streaming infra), prove the pattern, then port.

---

### L7 — Measurement

**Question:** How do we know any of this works?

#### Options

**Option A: Ship and vibe-check** (status quo).
- Pros: zero effort.
- Cons: we'll disagree with ourselves about whether v2 is better than v1.

**Option B: Manual smoke-test suite**. A documented list of ~15 canonical prompts; run by hand before merging prompt changes; eyeball review.
- Pros: immediately useful; catches regressions on core cases.
- Cons: manual; doesn't scale.

**Option C: Automated eval — objective metrics**. Script: run N prompts × 3 providers × M variations; record parse rate, line count, directive keyword presence (e.g., did "empty state" appear?), generation time, token count.
- Pros: cheap to run on demand; catches reliability regressions.
- Cons: doesn't measure subjective quality.

**Option D: LLM-judge eval**. GPT-4 scores each output 1-10 on rubric dimensions.
- Pros: proxies subjective quality.
- Cons: expensive; circular (model judging model); drift over time.

#### Decision: **B immediately (no code); C after L1 and L5 land (they're the infra-dependent ones). D rejected for now.**

#### Implementation

- **Phase B:** Create `docs/eval/prompts.md` with 15 canonical prompts + acceptance criteria ("must render, must have empty state, must handle input validation", etc.). Run before every merge touching prompts or providers.
- **Phase C:** `scripts/evalPrompts.ts` — CLI that reads the prompts, runs each through a chosen provider, writes outputs + metrics to `evals/results/YYYY-MM-DD/`. Compare baselines with simple diff.

#### Risk

Evals can become a maintenance burden. Mitigation: keep the suite small (≤25 prompts), metrics objective. Don't gate CI on it initially — just run before prompt changes.

---

## Sequencing

Dependencies:

```
   L1 ─┬─▶ L5 ─▶ L7c
       │
       ├─▶ L4
       │
   L3 ─┼─▶ L2 (needs L3's Quality mode to opt in)
       │
       └─▶ L6

   L7b is a prerequisite for evaluating L1+L5+L4 objectively.
```

Proposed phases, each ~1–2 days of focused work:

### Phase 1 — Prompt & context foundation
- L1 (prompt refresh + temp drop + `promptVersion` stamp)
- L4 (chat-context refinements)
- L7b (manual smoke suite — 15 prompts in markdown)

Why together: both touch provider-client code and the prompt surface, and share the refine-path rewrite. L7b is cheap and lets us verify the other two landed correctly.

**Success criteria:** Manual suite passes qualitatively. Refinements feel stylistically consistent. Parse rate anecdotally ≥ current.

### Phase 2 — Reliability
- L5 (repair loop)

Isolated change. Measurable: parse-success rate on the smoke suite.

**Success criteria:** Post-repair parse-success ≥ 98% on the suite.

### Phase 3 — UX routing
- L3 (Fast / Quality mode)

UI + settings refactor. Doesn't improve quality directly but opens the door for L2.

**Success criteria:** New users pick a mode without confusion; power users can still fall through to raw providers.

### Phase 4 — Multi-pass
- L2 (Plan → Implement for Quality mode)
- L7c (automated eval; first baseline captured here)

**Success criteria:** Quality mode generations pass more of the smoke suite criteria than Fast mode, at roughly documented cost.

### Phase 5 — Perceived performance
- L6 phase B (token streaming, text-only)

**Success criteria:** Users see progress within 1s of submitting.

### Phase 6 (deferred/conditional) — Later polish
- L6 phase D (stream + render on completion)
- L7d (LLM-judge eval if needed)
- C variant of L1 (provider-specific adapters) if evals show a gap

## Action items

### Phase 1 (kickoff: next)
1. [ ] `services/llm/index.ts` — rewrite `SYSTEM_PROMPT` with the 6 sections (Role, Rules, Design Tokens, Component Toolbox, State Checklist, Example); export `PROMPT_VERSION = 'v2'`.
2. [ ] `services/llm/index.ts` — refactor `getRefineSystemPrompt` to drop inline code; change `refineJSX` signature to accept `RefineContext`.
3. [ ] `services/llm/{openai,google,anthropic}.ts` — implement `RefineContext` → native messages mapping; drop temperature to 0.3; thread `PROMPT_VERSION` into returned metadata.
4. [ ] `services/llm/generationManager.ts` — build `RefineContext` from app message history when starting a refine job; stamp `promptVersion` on ChatMessage.
5. [ ] `store/appStore.ts` — add `promptVersion?: string` to `ChatMessage`.
6. [ ] `hooks/useGeneration.ts` — pass history into refine path instead of just currentJSX.
7. [ ] `docs/eval/prompts.md` — write 15 canonical prompts with acceptance criteria (tip calc, todo, pomodoro, habit tracker, notes, calculator, settings panel, color picker, card game, weather, expense tracker, timer, quiz, form, empty-state demo).
8. [ ] Manual run: execute all 15 against each provider, capture outputs in `docs/eval/baseline-phase1/`. (No script yet — just paste-and-eyeball.)

### Phase 2
9. [ ] `services/jsx/transformer.ts` — export `parse(code)` returning structured error.
10. [ ] `services/llm/repair.ts` — new module; single retry with error context.
11. [ ] `services/llm/generationManager.ts` — wrap provider calls in repair.
12. [ ] `components/GeneratingMessage.tsx` — add "fixing syntax…" phase label.

### Phase 3
13. [ ] `store/appStore.ts` — add `generationMode`.
14. [ ] `services/llm/modeRouter.ts` — map mode → concrete provider+model.
15. [ ] `app/(tabs)/settings.tsx` — mode toggle + Advanced reveal.
16. [ ] `components/ModePill.tsx` — new; retire ProviderPill from default flow.

### Phase 4
17. [ ] `services/llm/planner.ts` — Gemini Flash JSON plan call.
18. [ ] `store/appStore.ts` — `plan?: string; phase?: 'planning' | 'coding'` on ChatMessage.
19. [ ] `services/llm/generationManager.ts` — plan-then-implement path for Quality mode.
20. [ ] `components/GeneratingMessage.tsx` — two-phase progress display.
21. [ ] `scripts/evalPrompts.ts` — automated runner + metric collector.
22. [ ] `evals/results/*` — baselines committed.

### Phase 5
23. [ ] `services/llm/openai.ts` — streaming variant first; prove the pattern.
24. [ ] `services/llm/{google,anthropic}.ts` — streaming variants.
25. [ ] `services/llm/generationManager.ts` — stream-accumulating job runner.
26. [ ] `components/GeneratingMessage.tsx` — live char-count/progress.

## Consequences

### Easier after this lands
- Quality iteration on prompts via versioned `promptVersion` stamps + eval suite.
- Adding new providers (contract is stable: `generateJSX(prompt, signal)` + `refineJSX(context, signal)` + optional `stream`).
- Rolling back a bad prompt change (previous `PROMPT_VERSION` is git-recoverable; stamped messages correlate user bug reports to version).
- Adding new modes or tiers (the mode router is a single file).

### Harder after this lands
- Multi-pass generation doubles the surface area for failures. Phase 2's repair loop partially compensates.
- Streaming adds concurrency complexity around cancel. AbortController propagation must be tested on each provider.
- The system prompt is longer. If we add more rules later, they risk attention dilution. Leads us toward eventual RAG/template approaches (not in this ADR).

### To revisit
- **RAG / component library** when the system prompt exceeds ~3k tokens of rules.
- **LLM-judge eval (D)** if objective metrics (C) plateau and we still see subjective quality gaps.
- **Provider-specific prompt adapters (L1/C)** after evals identify a consistent per-provider gap.
- **Live-preview streaming (L6/C)** once the streaming pipeline is stable in B form.
- **Auto-routing (L3/C)** once we have telemetry on which mode users actually pick.

## Open questions

1. **What counts as the canonical "Quality" model?** Currently Claude Sonnet 4. Reevaluate when Opus pricing drops or when a new Claude/GPT ships. Decision: store the mapping in one file, don't hardcode elsewhere.
2. **Do we track usage/cost for the user?** Would require a local counter (no server). Probably yes, eventually, as a Settings panel. Not in this ADR.
3. **Should refines ever go through the Plan pass?** Default no (we have the current code; planning is about greenfield). But "major refactor" prompts arguably benefit. Punt: single-pass refines; revisit if evals suggest otherwise.
4. **Should prompt version be per-call configurable (A/B)?** For a solo project, no. If a second dev joins, we'll want this.
5. **Can we fail more gracefully on missing keys for the chosen mode?** Yes — upstream UX concern. Keep in mind during Phase 3.

## Non-goals

Called out explicitly so scope doesn't creep:

- **Fine-tuning.** Not at our scale; user-owned keys make this awkward.
- **On-device inference.** Explicitly removed in prior cleanup; not coming back until there's a compelling use case.
- **Generated-app backend (databases, auth, network).** Apps remain local-state; that's a feature, not a limitation.
- **Cross-app sharing / templates.** Separate product concern.
- **Rich media generation (images, sounds).** Out of scope; whitelist is text-and-layout components only.



# Questions by Me

- **Asking user question then showing build button when confident about prompt.** The model would need to be aware about its capabilities to be able to assess if it has all the requirements fulfilled to create the said app.
- **Read the decisions and override if not agreed with.** Have to go through the decisions and iterate on them.