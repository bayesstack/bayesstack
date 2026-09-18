# BayesStack application product-engineering constitution

> **Quiet platform, rich work.**
>
> BayesStack should make sophisticated academic work feel understandable. The interface itself should not compete with the work.

This file governs product and interface work in `apps/` and all descendants. Read it as one operating system: product meaning determines information architecture; information architecture determines composition; composition determines components; rendered evidence determines whether the result is done. **MUST** is non-negotiable, **SHOULD** is the default unless a reason is recorded, and **MAY** is permitted. A closer `AGENTS.md` may specialize an app but MUST NOT weaken canonical product, privacy, accessibility, tenant, or academic-authority constraints.

## Authority and evidence

Before substantial work, inspect the canonical source relevant to the change, the target app, adjacent shipped behavior, and the shared UI primitives. Resolve conflicting evidence in this order:

1. Canonical product context, vision, and approved product/market strategy.
2. Explicit system architecture, domain contracts, security rules, and data semantics.
3. Shipped substantive application behavior.
4. `packages/ui` and `packages/assets` for reusable implementation foundations.
5. Approved archetypes and product-engineering guidance in this file and the design brief.
6. Wireframes and prototypes as exploratory evidence only.
7. Historical TODOs, experiments, and stale README claims as supporting context only.

MUST NOT turn a wireframe, mock, TODO, current placeholder, or incidental implementation into product policy. Preserve the source labels used by the design brief: **Confirmed** is canonical evidence; **Inferred** is a reasoned reading; **Recommended** is a proposed operating decision; **Open** is unresolved and MUST NOT be guessed into permanence. If a lower-authority artifact conflicts with a higher one, follow the higher source and record the conflict.

Current code is uneven evidence: `auth` and `super` contain substantive behavior; the primary routes in `learner`, `faculty`, and `admin` are shells; Coding Studio is materially developed while Video Studio is early. Existing duplicated tokens, fallback hex values, app-local font choices, or default `Paper` styling are implementation debt, not permission to spread them.

## Product doctrine

BayesStack is an **academic capability platform for educational institutions**, not a prettier generic LMS. Its connected system is:

**academic architecture → learning delivery → evidence and credentialing → faculty/admin intervention → institutional capability**

The initial commercial wedge is Course Foundry: coherent, institution-ready course/program production. It is a sequencing choice, not a reason to collapse the long-term platform into courseware screens. Begin with the learner, chase progress rather than novelty, and design for real institutional adoption.

The product MUST feel calm, rigorous, capable, deliberate, trustworthy, technically native, academically serious, modern, and humane. It MUST NOT resemble a generic admin template, interchangeable card grid, passive LMS, ERP/SIS, consumer gamification product, bolted-on chatbot, or collage of current visual trends. Platform chrome SHOULD be restrained; richness SHOULD come from academic content, composition, data, diagrams, media, code, visualizations, and domain-native interaction.

> **Premium BayesStack product engineering means that nothing feels accidental.**

For every significant decision, an agent MUST be able to explain why it is prominent, why a boundary exists, why an action is located there, why the container fits the user's mental context, what must remain visible, and what decision or task the screen advances. Product quality is not polish applied after functionality; structure, interaction, feedback, recovery, and trust are implementation.

Preserve canonical terms and their distinctions: institution, curriculum, program, course, chapter, concept, activity, studio, completion, assessment evidence, capability evidence, outcome attainment, intervention, and contextual AI copilot. Do not flatten them into generic “lessons,” “content,” “scores,” “analytics,” or “chat.” Link to canonical definitions instead of inventing new ones.

| Context             | Optimize for                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Learner             | Orientation, continuation, focused learning, doing, feedback, recovery, and credible progress.                                      |
| Faculty             | Authoring, course composition, review, grading, cohort diagnosis, intervention, and teaching efficiency while preserving authority. |
| Institutional admin | Governance, program health, outcomes, permissions, provenance, auditability, and operational action.                                |
| Platform SuperAdmin | Dense platform operations, tenant/catalog/library management, inspection, and safe privileged action.                               |

These are different products, not skins on one dashboard template.

## Reason before JSX

For every new screen or material redesign, write down or establish in the task context before composing components:

1. The operating role, tenant context, and user's job, expressed with a verb such as learn, continue, inspect, compare, compose, configure, review, grade, diagnose, intervene, publish, or perform.
2. The primary domain object and the information that must remain visible while acting on it.
3. The primary action; secondary, contextual, rare, and destructive actions.
4. The page archetype, required density, and appropriate interaction container.
5. First-use, loading, empty, success, failure, permission, recovery, and other applicable states.
6. What can be progressively disclosed without hiding essential status, context, or recovery.

Start with “What is the user doing and what must they understand?”, never “Which components can I put on this page?” If an archetype does not fit, document the justified extension instead of improvising a new page grammar silently.

| Archetype                    | Use and composition contract                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Action hub                   | Decide what deserves action next; emphasize priority and continuation, not a wall of metrics.               |
| Index / list                 | Browse, search, filter, sort, select, or compare many objects; prefer rows/tables plus inspection.          |
| Detail                       | Understand one domain object; use a strong object header and semantic sections, not a card per section.     |
| Editorial learning           | Read and understand concepts; optimize measure, typography, sequence, media, math/code, and focus.          |
| Workbench / studio           | Sustain specialist work; use full working space, panes, trees, inspectors, toolbars, and resizable regions. |
| Builder / editor             | Compose curriculum/course/content; preserve tree or structure, working canvas, and contextual inspector.    |
| Review queue                 | Grade, approve, or review; optimize triage, comparison, status, and efficient next-item movement.           |
| Investigation / intervention | Detect, diagnose, act, and measure; charts without an actionable loop are incomplete.                       |
| Settings                     | Use restrained forms, contextual navigation, and semantic sections rather than decorative tiles.            |
| Wizard                       | Reserve for consequential staged workflows; simple CRUD MUST NOT become a wizard.                           |

## Composition grammar

| Structure         | Meaning                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Canvas            | Page/workspace background; never an object boundary by itself.                                      |
| Section           | Semantic grouping formed primarily by spacing, type, alignment, or divider; no box by default.      |
| Panel             | Persistent functional region such as a navigator, outline, inspector, or utility rail.              |
| Surface           | Distinct interaction plane such as a form, editor, dialog, overlay, or controlled input region.     |
| Card              | Independent object with identity plus meaningful state, action, ownership, destination, or preview. |
| Row / table entry | Repeated comparable entity optimized for scanning and comparison.                                   |
| Interactive tile  | A direct choice or launch object, not a generic content wrapper.                                    |
| Workbench         | Dedicated environment for sustained domain work; not a dashboard card enlarged.                     |

One meaningful object SHOULD have no more than one primary visual boundary. Do not wrap content merely because a wrapper is convenient; heading-plus-description, ordinary settings groups, every metric, and every page section are not cards. Do not nest cards unless the nested item is genuinely independent. Whitespace, typography, alignment, and dividers are legitimate structure. A screen with zero cards may be correct.

`Paper` is a low-level capability, not an instruction to create a card. Its current border/elevation defaults MUST NOT decide page architecture. Avoid the ordinary-object combination of border + shadow + tinted background; shadows describe layer relationships, not importance. Hover elevation is only for an object whose interaction benefits from that feedback.

If a page becomes “title + description + grid of rounded rectangles,” stop and reconsider it before decorating. Also stop for nested surfaces, teal-tinted everything, icon-per-heading decoration, excessive pills, equal visual weight, centered enterprise workflows, decorative gradients, needless KPI tiles, repeated “View details,” modal-heavy flows, a floating generic AI button, or charts that lead nowhere.

Build hierarchy in this order: **information priority → spatial placement → typography → whitespace → alignment → scale → structural boundaries → color → decoration**. Every screen needs a deliberate first fixation point and one clear primary action. Richness SHOULD come from editorial sections, full-bleed regions, split layouts, trees, timelines, steppers, progress rails, tables, inspectors, charts, diagrams, media, editors, notebooks, evidence trails, status strips, command surfaces, and well-used empty space.

## Visual foundations

- Semantic tokens in `packages/ui/src/styles.css` and brand assets in `packages/assets` own shared visual values. Application code MUST NOT create raw brand colors, duplicate neutrals, arbitrary type sizes, spacing, radii, shadows, focus treatments, container widths, or motion values when a shared semantic value exists.
- Neutral colors carry most of the product. Strong neutral ink is the default for readable text. Bayes teal is scarce and meaningful: primary action, selection/active state, important progress, or a deliberate brand anchor. **If teal appears everywhere, teal communicates nothing.**
- Success, warning, and danger communicate outcomes, not brand decoration. AI/analytics accents require a defined semantic role and MUST NOT compete with primary actions. Color MUST NOT be the only state signal. Badges are for compact stable state/classification—such as Draft, Published, Required, Due, Failed, or Pending—not arbitrary metadata confetti.
- Outfit is for product identity and deliberate display use; Inter is for UI, labels, controls, tables, and general reading; JetBrains Mono is for code and genuinely technical structured values. Editorial type is opt-in for academic content only after approval. Do not use display type everywhere, teal body copy, arbitrary app scales, or monospace as “technical” decoration.
- Establish hierarchy through size, line height, measure, spacing, placement, and limited weight differences before color. Long-form learning needs readable measure; workbenches, tables, builders, analytics, and media MAY use full width. There is no universal page max-width.
- Use the shared spacing rhythm and restrained geometry. Repetition comes from a small scale, not visually similar arbitrary values. Not every object is a rounded rectangle. Use the shared `Icon`/HugeIcons registry; decorative icons are hidden from assistive technology and standalone meaningful icons require a label.

The exact global token consolidation is not settled: `packages/assets` and `packages/ui` currently encode near-but-not-identical primary teals, while app globals repeat aliases. Do not resolve that discrepancy in local app CSS; it requires a shared design-system decision and migration.

## Interaction and navigation

Choose the interaction container from the user's mental context:

| Container           | Contract                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Full route          | Sustained, stateful, deep-linkable, bookmarkable, or substantial work.                          |
| Drawer / side panel | Inspect or moderately edit while the underlying list/workspace remains useful.                  |
| Modal               | Bounded interruption: confirmation, short flow, permission, or small high-consequence decision. |
| Inline              | Small local decision that does not change mental context.                                       |
| Popover / menu      | Contextual controls and secondary actions.                                                      |
| Workbench           | Complex specialist task requiring dedicated spatial and interaction rules.                      |

A select chooses a value; a menu invokes an action; a combobox searches a large value space; radios expose a small meaningful set; tabs navigate stable sibling views; accordions disclose optional content; a switch changes an immediate Boolean; a checkbox supports selection or an explicit Boolean; a tooltip supplements; a toast reports a transient outcome. Persistent errors remain beside the problem. Do not hide frequent actions in overflow solely for tidiness or expose every rare action solely for discoverability.

Actions stay local: global actions at the global level, object actions beside object identity, row actions with the row, selection actions when selection exists, studio actions in the studio toolbar, and contextual actions near their context. Rare actions MAY use overflow. Destructive actions MUST NOT compete with the normal primary flow.

Global navigation answers “where can I go?”; contextual navigation answers “where am I within this thing?” Desktop SHOULD have no more than two persistent hierarchies: role/application and course/workspace/context. Do not duplicate a course tree in the global sidebar. Use breadcrumbs for ancestry, keep supported command search globally reachable, and keep profile/account controls quiet. Show a tenant switcher only for real multi-institution membership.

## Academic experience and institutional trust

- Learner home is an **action hub**, not primarily a dashboard. Order attention around meaningful continuation, due obligation, actionable feedback, useful recommendation/intervention, then enough progress context to orient. First-time, returning, behind, and deadline-driven states may differ. No default streak, leaderboard, marketplace, hero, or equal course-card wall.
- Course mode provides orientation: structure, progress, prerequisites, obligations, and next step. Concept mode becomes editorial and focused: explanation, sequence, media, math/code, and receding utilities. Studio mode becomes a domain-native place for doing: reduce general chrome and give panes/tools the space they need. Never place a professional studio inside a generic page card.
- Motivate through completion of meaningful work, evidence, skill depth, substantive projects, useful feedback, and credible progress. Gamification requires a pedagogical reason; do not optimize for addiction, shame, coins, arbitrary XP, public rank, scarcity, confetti, or streak pressure. A learner who is behind needs context, a manageable next action, and a route to support—not a wall of red.
- Faculty automation MAY prepare, diagnose, draft, or recommend, but instructors retain authority over official grades and curriculum publication. Analytics MUST form **detect → diagnose → recommend → act → measure**, not passive reporting.
- Institutional and SuperAdmin UI MUST account for permissions, tenant boundaries, privacy, ownership, provenance, actor identity, timestamps, versions, audit trails, publication/review/grade state, bulk operations, filters, sorting, selection, inspection, export, large datasets, and recovery. Never reveal restricted content merely to explain denial.
- AI is contextual capability attached to the active course, concept, work, rubric, runtime, evidence, or investigation—not a generic floating chatbot. Make generated versus official/authored material distinguishable and context/provenance inspectable where trust requires it. Human authority MUST remain for publication, official grades, sensitive communication, and institutional intervention. AI must support learning, not perform away the intended learning task.

## State, safety, accessibility, and adaptation

Design the state machine, not only the happy path. Consider as applicable: first use, empty, no results, loading/partial loading, loaded, saving/saved, queued/running, success/failure/retry, offline, denied/locked, archived/completed, stale/conflicted, and large dataset. Errors MUST state what failed, what work is preserved, whether anything changed, and what can safely happen next. Locked states explain the requirement and route to satisfy it; completion supplies the next relevant step.

Autosave suits drafts, notes, code, and low-risk authoring; expose Saving, Saved, Offline, Failed to save, or Conflict when consequential. Optimistic UI is allowed only when rollback is understandable. Never imply durable submission, publication, grade release, or institutional action before success is confirmed.

Use undo for safely reversible local actions. Confirm material external or academic consequences, including final publication, official grade release, destructive deletion, sensitive communication, privileged configuration, and irreversible structural change. A confirmation MUST name what will change; “Are you sure?” is insufficient.

Accessibility is architecture: semantic HTML, complete keyboard operation, meaningful focus order, visible focus, screen-reader semantics, contrast, color-independent meaning, accessible errors/dialogs/tables/media, and reduced-motion behavior are required. Hover-only controls need equivalent focus/keyboard discovery; required information MUST NOT live only in a tooltip.

Responsiveness preserves task hierarchy, primary action, academic context, and state clarity—not desktop geometry. Learner consumption SHOULD adopt a simpler mobile mental model. Complex studio, builder, grading, or admin workflows MAY intentionally offer limited mobile capability only when the product contract says so. Do not mechanically stack every desktop column.

Motion explains state change, continuity, loading, panel location, completion, or workspace reorganization. Use restrained shared transitions, respect `prefers-reduced-motion`, and prioritize studio performance. No theatrical transitions, perpetual loops, bouncing, attention pulses, or decorative movement.

Density follows work: comfortable for learner orientation, editorial for concept reading, compact/configurable for studios, compact for builders and grading, and compact-to-dense for admin/SuperAdmin data work. Progressive disclosure hides secondary detail, never essential status or recovery.

## Design-system authority

| Authority                       | Agent behavior                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Autonomous                      | Use existing tokens, public `@bayesstack/ui` exports, approved variants, archetypes, layouts, and interaction patterns.        |
| Proposal required               | Explain why the system is insufficient before adding a component, variant, reusable domain composite, or archetype.            |
| Design-system decision required | Do not silently introduce global color, type, spacing, radius, elevation, motion, focus, or conflicting interaction semantics. |

Before adding a shared component, determine whether it is a new semantic primitive, a composition, a local domain object, or merely a variant. Reuse alone is insufficient justification. A justified shared component MUST define use case, API, states, accessibility, responsiveness, Storybook examples, tests, and public exports. Avoid one component per screen, vague wrappers, and deep imports. A repeated platform problem belongs in the shared layer, not app-local CSS.

If a shared semantic value is missing: verify the need, inspect existing foundations, propose the extension, implement it in the owning package after approval, document the purpose, and migrate consumers deliberately. Do not smuggle a new foundation into a feature patch.

## Delivery loop and definition of done

For meaningful UI work, follow **intent → archetype → implementation → render → inspect → critique → revise → accessibility validation → interaction validation → done**. TypeScript success and present data are not visual completion. Render the real route when practical; use Storybook for shared components; inspect representative desktop and applicable mobile viewport sizes.

During visual review, ask: What does the eye see first, and should it? Is the page boxed or equally weighted? Can a card become a section, row, table, or whitespace? Does each border/shadow/color have semantic work? Is teal scarce? Is typography carrying hierarchy? Is there one clear primary action? Is necessary context visible and secondary metadata disclosed appropriately? Does the archetype fit the job and density? Are all states credible? Can the user tell what changed and what to do next? If it resembles a generic AI-generated SaaS dashboard, revise the structure.

A substantial change is done only when all applicable items hold:

- Correct role, tenant, permission, privacy, provenance, and academic-authority behavior.
- Appropriate archetype and domain semantics; semantic shared foundations; no unjustified raw visual values.
- Loading, empty, error, recovery, persistence, and consequential-action behavior.
- Complete keyboard path, visible focus, semantic accessibility, color-independent state, and reduced motion.
- Deliberate responsive behavior and rendered visual inspection at representative viewports.
- Appropriate unit/interaction/E2E coverage; Storybook stories and tests when shared UI changes.
- Relevant repository checks pass. Run the narrowest package checks during iteration and root `pnpm typecheck` / `pnpm lint` when the change warrants repository-wide validation.

Do not claim visual completion without rendering when rendering is reasonably available.

## Canonical references and intentionally open decisions

- Product baseline and terminology: [`../docs/prompts/product_context.md`](../docs/prompts/product_context.md)
- Vision and adoption principles: [`../docs/system-design/00_vision_and_mission.md`](../docs/system-design/00_vision_and_mission.md)
- Platform/domain architecture: [`../docs/system-design/01_first_thought_hld.md`](../docs/system-design/01_first_thought_hld.md), [`02_data_model_and_system_architecture.md`](../docs/system-design/02_data_model_and_system_architecture.md), and [`03_studio_runtime_architecture.md`](../docs/system-design/03_studio_runtime_architecture.md)
- Course Foundry market strategy: [`BayesStack_B2B_Education_Market_Strategy.pdf`](../docs/system-design/BayesStack_B2B_Education_Market_Strategy.pdf)
- Evidence, recommendations, and current-state audit: [`../docs/design/bayesstack-product-engineering-brief.md`](../docs/design/bayesstack-product-engineering-brief.md)
- UI implementation and catalog: [`../packages/ui/README.md`](../packages/ui/README.md), [`../packages/ui/src/styles.css`](../packages/ui/src/styles.css), and Storybook via `pnpm --filter @bayesstack/ui dev`
- Brand assets: [`../packages/assets/brand-palette.json`](../packages/assets/brand-palette.json) and [`../packages/assets/src/tokens/colors.ts`](../packages/assets/src/tokens/colors.ts)
- Exploratory wireframes: [`../docs/wireframes/README.md`](../docs/wireframes/README.md); domain workspaces: [`../studios/coding`](../studios/coding) and [`../studios/video`](../studios/video)

The following remain open unless a scoped decision closes them: the final semantic palette/token consolidation and platform-wide dark mode; exact learner-home and restrained motivation model; detailed AI interaction/integrity contract; official reference and anti-reference products; illustration, photography, course-cover, editorial-type, and subject-color systems; mobile parity for complex professional workflows; localization/RTL commitments; and detailed role-app information architecture beyond confirmed product contracts. The color direction deck is a recommendation artifact, not a replacement for canonical tokens. Do not guess these decisions.
