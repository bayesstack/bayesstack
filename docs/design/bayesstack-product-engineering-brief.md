# BayesStack product engineering brief

> **Status:** Repository-derived answer book and proposed decision baseline  
> **Prepared:** 18 September 2026  
> **Purpose:** Answer the 30-part discovery brief sequentially from the repository, distinguish evidence from recommendation, and give a coding agent a reliable product-and-design hierarchy.  
> **Related visual decision:** [Color direction deck](./bayesstack-color-direction-deck.html)

## How to read this document

This is not a claim that every decision below is settled. The repository is unusually clear about BayesStack's product thesis and architecture, but it intentionally leaves some UX decisions open. Rather than fill gaps with invented certainty, every answer is classified as one of:

- **Confirmed** — stated in canonical product/architecture material or implemented in the codebase.
- **Inferred** — a reasonable conclusion from repeated repository evidence; it still needs owner confirmation before becoming policy.
- **Recommended** — a proposed rule that resolves an open question and should be adopted only through design-system/product review.
- **Open** — not knowable from the repository. It is a required decision, not a missing design detail for an agent to improvise.

### Evidence hierarchy

When materials disagree, use this order:

1. [Product context](../prompts/product_context.md), [vision and mission](../system-design/00_vision_and_mission.md), [B2B market strategy](../system-design/BayesStack_B2B_Education_Market_Strategy.pdf), and the system-design documents are the product source of truth.
2. Shipped or substantive source code is the current implementation truth: notably `apps/auth`, `apps/super`, `studios/coding`, `studios/video`, and `packages/ui`.
3. `packages/ui` is the shared visual primitive source of truth, although its foundations still need governance.
4. [Wireframes](../wireframes/README.md) are exploratory evidence only. Their own directive is to optimize visual iteration over maintainability; the requester has also explicitly said they are temporary and not the desired final direction.
5. Daily TODOs are planning/history, not permanent requirements. They are useful for maturity and sequencing, especially [09 September planning](../todo/09-sep-2026.md).

### Executive conclusion

**BayesStack is an academic capability platform, not a prettier LMS.** Its deliberately narrow initial commercial wedge is an **AI-native Curriculum and Courseware Foundry for technology and quantitative programs**. It should feel like a calm, credible academic operating system that makes sophisticated work legible: composing curricula, learning through native studios, producing evidence, and intervening when learning breaks down.

The product vision is mature. The main visual/product-engineering gap is that the shared UI package contains many useful components but does not yet enforce a sufficiently small, semantic system of foundations and page patterns. As a result, direct hex values, raw radii, slightly different token names, and card-like surfaces can drift across apps. The next design-system investment should therefore be **a constrained decision system**, not a larger inventory of visual widgets.

---

## 1. Product and business

### What BayesStack is

**Confirmed.** BayesStack is an **academic capability platform for educational institutions**. It helps institutions decide what to teach, deliver active domain-native learning, establish credible evidence of capability, and enable faculty/admins to improve learning in time to matter. It is designed for universities, colleges, professional institutes, and education organizations; it begins in India but is intended to extend globally without India-specific product assumptions. See [product context, §1–2](../prompts/product_context.md).

Its causal model is not “course content + dashboard.” It is:

```text
Academic architecture
  → learning delivery
  → evidence and credentialing
  → faculty/admin intervention
  → a more capable institution
```

### Personas, buyer, and market

| Question | Repository-derived answer |
| --- | --- |
| Primary daily user | **Learner** while studying, practicing, submitting work, and asking for contextual help. |
| Primary author/operator | **Faculty** composing courses, grading, diagnosing cohorts, and intervening. |
| Institutional operator | **Tenant admin / department chair** governing programs, outcomes, academic health, and operational delivery. |
| Platform operator | **SuperAdmin** managing tenants, catalog/library and platform data. This has a substantive current implementation in `apps/super`. |
| Who pays | **The institution**. The product is enterprise/institutional SaaS, with value delivered to faculty and learners. |
| Market model | **B2B with B2B2C delivery**: the institution buys and configures; learners experience the product under its tenant. |
| Early customer hypothesis | **Confirmed in planning, not yet validated in the repository:** forward-leaning private universities, autonomous colleges, scaled education organizations, and professional institutes launching/refitting technical programs. |

### One-sentence value proposition

**Recommended phrasing, faithful to the repository:**

> BayesStack lets institutions launch and continuously improve modern applied education—through composable curriculum, native learning studios, credible capability evidence, and actionable faculty intervention.

The shorter commercial promise in the planning document is also strong:

> **“BayesStack makes modern applied education dramatically faster to build and dramatically better to experience.”**

### Initial wedge and product sequencing

**Confirmed by the B2B strategy memo.** The platform vision is deliberately broad, but the initial market offer should be narrower: **Course Foundry** for data, AI, cloud, software, mathematics, analytics and finance programs. Its customer-visible promise is an institution-ready course/program designed from market signal through curriculum, materials, applied work, assessments, faculty guidance and an update mechanism.

The memo gives an important corrective to product-design sequencing: build the internal Foundry (research, authoring, review, versioning, QA, exports and rights/provenance) while serving design partners; export into the formats/systems customers already use rather than forcing an immature learner platform onto them. The full learner-facing platform becomes customer-facing when repeated paid behavior proves which workflow merits it. This means the **Course Foundry / faculty-authoring experience is the near-term product priority**, even though learner delivery is central to the long-term system.

**Timing clarification:** the platform’s eventual “one-day instant program launch” is a catalog/composition promise once reusable, reviewed content exists. The strategy memo’s initial Foundry engagement promises a market-signal-to-institution-ready course/program in roughly **6–10 weeks**. Do not collapse these into one claim or design a fake “instant” authoring journey before the production, review and QA system supports it.

### Important workflows

| Workflow | Importance | Product consequence |
| --- | --- | --- |
| Compose/adopt a curriculum or course from the Universal Concept Catalog | Revenue and differentiation | Enables the “one-day launch” promise. Faculty/admin must make provenance, versioning and publish status obvious. |
| Learn a concept through ordered activities and domain studios | Daily learner workflow and retention | Must be focused, contextual, keyboard-capable and visibly connected to progress. |
| Practice, submit, receive feedback, retry | Daily learning and evidence | Requires durable state, clear attempt history, respectful failure states and fast feedback. |
| Diagnose a cohort issue and dispatch an intervention | Core faculty/admin value | Analytics must lead to a concrete next action and later measure effect. |
| Grade/review and release assessment evidence | Faculty workload and institutional trust | AI/machine assistance can give first pass; instructor review is mandatory before grade release. |

**Strongest “wow” moment — confirmed product intent:** a faculty member selects a frontier track and, in roughly five minutes to one afternoon depending on scope, produces a functioning experience: course → concepts → interactive lessons → coding labs → practice → assessment → actionable analytics. This must be a deliberate demo and product journey, not a generic dashboard.

### Built versus aspirational

| State | Evidence |
| --- | --- |
| **Substantive today** | Shared UI library with atoms/molecules/organisms, Storybook and tests; tenant-aware auth/session routing; SuperAdmin database workspace and learning-library work; a rich coding-studio frontend with run/submit/history/settings/shortcuts; a video-studio package; landing-page component showcase. |
| **Shells/placeholders today** | `apps/learner`, `apps/faculty`, and `apps/admin` current route pages are simple “Welcome” placeholders. The code wireframe learner is exploratory, not production. |
| **Architected/partly implemented, not a finished user product** | Universal Concept Catalog, course composition, publications, institutional composition rules, progress/evidence model, coding judge boundaries, domain-studio lifecycle, faculty/admin applications, intervention loop, assessment release flow, global search, skill snapshot and career pathways. |
| **Aspirational / intentionally open** | Exact learner home, motivation model, full AI surface, career marketplace, full applied infra, scheduling, global benchmark/reputation layer, final mobile strategy and final visual language. |

### Design implication

The UI must consistently make **academic consequence** more visible than platform activity. “Completed 74% of videos” is not the primary institutional story; evidence, capability, next action and outcome attainment are.

---

## 2. Vision for the product

### Intended feeling

**Confirmed / inferred:** BayesStack should feel **capable, calm, rigorous, current, trustworthy, deliberate, academically serious, technically native, and humane**. It should make complex work feel navigable rather than make the interface itself look clever.

The three institutional principles provide direct visual guidance:

- **Begin with the learner:** every institutional screen must maintain a visible chain to learner consequence.
- **Chase progress, not novelty:** no visual trend, AI treatment, animation or metric exists merely to look modern.
- **Design for adoption:** favor familiar, resilient, understandable patterns over spectacular but fragile ones.

### What it must not feel like

- A generic LMS with passive content tiles and completion-only metrics.
- A consumer gamification product with coins, noisy streaks, artificial achievement confetti, or leaderboard pressure.
- An opaque “AI magic” chatbot layered onto unrelated screens.
- A generic enterprise admin template where every workflow starts with a page title and a grid of identical cards.
- A heavy university ERP/SIS. BayesStack interoperates with systems of record; it should not look or behave like one.
- A startup trend collage: gratuitous gradients, glass panels, teal everywhere, excessive roundness, or competing elevated surfaces.

### Product category and premium bar

**Recommended product posture:** **enterprise academic operating system with product-craft quality**, positioned between a disciplined productivity product and a purpose-built learning environment.

It should be:

- quieter than Duolingo and most consumer edtech;
- more academically contextual and less generic than a course marketplace;
- more domain-native and focused than a conventional LMS;
- as deliberate about dense work as Linear, Stripe or GitHub, while retaining warmth and learning clarity;
- capable of moments of richness inside content and studios, not through decorative platform chrome.

### Beauty versus efficiency; delight versus background

**Recommended answer:** Optimize for **extremely efficient and quiet by default**, with a small number of purposeful “alive” moments:

- concept/skill progress moving forward;
- successful execution or assessment feedback;
- studio transitions that preserve context;
- a useful intervention or insight becoming actionable;
- well-designed learning media, simulations, diagrams and subject-specific content.

Animation should clarify status, spatial continuity, or completion. It should not become a reward economy.

---

## 3. Competition and references

### Direct and indirect competition

**Confirmed by the B2B strategy memo:** the company will meet different competitors at different layers. Do not collapse these into one generic “edtech competitor” list.

**Confirmed category-level alternatives:** general LMS/LXP products, academic ERP/SIS systems, passive courseware, coding assessment platforms, and generic AI chat products are all part of the problem space. BayesStack explicitly declines to begin as a general LMS/LXP, high-stakes exam platform, SIS/ERP, or day-one career marketplace. See [09 September planning](../todo/09-sep-2026.md).

### Named product references found in the repository

| Reference | What it is used for in the repo | Safe design lesson |
| --- | --- | --- |
| Canvas, D2L Brightspace, Moodle | Institutional LMS/LXP competitors | They are broad ecosystems and integration destinations. Do not imitate their generic administration-first experience or attempt to out-feature them as the initial wedge. |
| Coursera for Campus | Institutional content/courseware competitor | Content breadth, certificates and guided projects are not enough as a differentiator. BayesStack must show governed, current, applied, institution-ready capability. |
| LeetCode, CodeSignal | Coding-studio benchmark | Clear problem/solution/result separation, attempt feedback, keyboard-centric flow. Do not copy their identity or make all learning feel like competitive programming. |
| Cursor, VS Code Web, Zed | Coding-workspace benchmark | Resizable, dense, theme-aware workspaces with strong keyboard ergonomics. Use only inside workbench/studio contexts. |
| Kaggle/Jupyter | ML/AI studio analogy | Domain-native notebooks and visualizations, not generic lesson cards. |
| Clash of Clans / Clash Royale | A restrained motivation analogy | Skill breadth/depth can be legible and motivating. Do not import the game’s reward mechanics wholesale. |
| Linear, Stripe, Notion, Apple, Duolingo, Coursera, Brilliant, Khan Academy, Figma, GitHub | Named in the discovery questionnaire only | No repository answer says which specific visual qualities should be copied. These remain references to evaluate with the owner, not defaults for an agent. |

### Reference decision needed

**Open:** Select five approved references with a one-sentence reason for each. The agent should never translate “make it like X” into copied visuals. The recommended benchmark set is one each for: dense enterprise workflow, academic reading/learning, authoring, a coding workbench, and motion/feedback restraint.

---

## 4. Current visual identity

### Current colour and typography facts

The table below records **what is currently in source**, not the target design system. The source currently contains several overlapping naming schemes: `--bs-ui-*`, `--bs-*`, `--bs-color-*`, `--auth-*`, and direct fallback hex values.

| Role | Current implementation evidence |
| --- | --- |
| Brand primary | `#056766` (`hsl(179 91% 21%)`) in `packages/assets/src/tokens/colors.ts`; `#0B6763` (`hsl(177 81% 22%)`) is the practical UI primary in shared styles and apps. |
| Brand dark | `#084C49` in app/token variants; auth dark canvas/sidebar uses `#091A18`. The asset manifest also defines white as `#FFFFFF` (`hsl(0 0% 100%)`). |
| Brand soft | `#E4F2EF`, with auth using `#EEF6F4`; other nearby teal tints also appear. |
| Primary ink | `#123333` in shared UI/app foundations; learner wireframe/auth also use Slate/blue inks such as `#0F172A` and `#334155`. |
| Canvas and surface | `#F1F8F6` and `#FFFFFF` in general apps; auth uses `#F8FAFC`; learner wireframe uses `#F8FAFC`. |
| Border | `#D7E8E4`, while many components use Slate-like `#E2E8F0`, `#CBD5E1`, or `#E2ECEB`. |
| Current status colours | Multiple definitions exist: success includes `#0E8345`, `#22C55E`, `#166534`, `#10B981`; warning includes `#D97706`, `#92400E`; errors include `#DC2626`, `#D9381E`, `#B52A2A`. This is not yet one semantic state scale. |
| Fonts | Outfit, Inter and JetBrains Mono are loaded by the apps. `Text`/`Title` also expose EB Garamond and Cedarville Cursive variants. |
| Icons | HugeIcons React is the shared icon dependency. |
| Logo assets | A shared logo/mark system exists in `packages/assets/static/brand/` and is re-exported through assets. |

### Existing typography scale

**Confirmed.** The shared library currently defines:

| Token/component role | Current values |
| --- | --- |
| Text | `xs` 12px/1.35, `sm` 14px/1.4, `md` 16px/1.5, `lg` 18px/1.5, `xl` 20px/1.4. |
| Titles | h1 40px/1.1, h2 32px/1.15, h3 24px/1.2, h4 20px/1.25, h5 18px/1.3, h6 16px/1.35. |
| Weights | 400, 500, 600, 700 and 800 are used; several wireframes also use fractional CSS weights such as 650/660. |
| Spacing | `Stack` has named 4, 8, 16, 24 and 32px gaps. Elsewhere many raw values are used. |
| Radius | `Paper` offers 0, 6, 12, 16 and 24px; component CSS also uses 3, 4, 5, 7, 8, 10, 14, 20, circles and pills. |
| Motion | Most interactions are 100–250ms eases/cubic beziers, but there are no named duration/easing tokens or documented reduced-motion policy. |
| Breakpoints | Auth contains a 960px breakpoint. Breakpoints and layout rules are otherwise local to individual components/wireframes, not published as a system. |

### Current visual diagnosis

**Confirmed:** teal is already a primary action, focus, selection, border-tint, soft-background and shadow colour across the library. Teal is dominant rather than reserved.

**Inferred:** this is why the system can feel less dynamic than intended. If teal is present in every border, hover, shadow and surface, a primary CTA cannot carry enough visual consequence.

**Recommended visual direction:** use the previously proposed **Bayes Signal** system:

| Semantic role | Proposed value | Use |
| --- | --- | --- |
| Brand / action | `#087A75` | primary action, active/selected state, key progress |
| Brand / strong | `#075B58` | pressed/hover states, deep teal surfaces |
| Brand / subtle | `#E7F5F2` | selected rows, quiet tags, icon tiles |
| Analytic accent | `#5850EC` | AI, insight, forecasting, comparison; never a generic primary |
| Strong ink | `#132B3A` | headings, dark navigation, high-emphasis UI |
| Canvas | `#F6F9FA` | page background |
| Surface | `#FFFFFF` | raised form/control/object surface |
| Border | `#DCE6EA` | standard separators and input boundaries |
| Success/warning/danger | `#14804A` / `#B45309` / `#C53432` | semantic outcomes only |

The proposed primary and semantic values all meet normal-text WCAG AA against white in the key combinations (primary `5.18:1`, analytic `5.56:1`, success `4.98:1`, warning `5.02:1`, danger `5.37:1`). Colour never becomes the only state signal.

### Dark mode

**Confirmed:** there is a dark auth pane, a dark learner-wireframe sidebar, and a light/dark Coding Studio preference. There is no complete, documented cross-platform dark-mode token contract.

**Recommended:** do not advertise universal dark mode until semantic colour and elevation tokens exist. Build it first for focused studio/workbench contexts, then expand through the shared semantic layer. A half-dark product is worse than an intentional light-first product.

---

## 5. Component library

### Technical foundation

**Confirmed:** `@bayesstack/ui` is a React/TypeScript package with plain CSS files, direct CSS variables/fallbacks, Storybook, Vitest, Storybook interaction tests and an a11y addon. It is consumed by Next.js applications and studio React packages. The architecture document once says “Tailwind CSS + shared component library”; the current package itself is plainly CSS-driven, not Tailwind-driven. Treat source code as the implementation truth.

### Existing inventory

| Layer | Components already present |
| --- | --- |
| Atoms | Typography: `Title`, `Text`, `Paragraph`, `HtmlText`, `LatexText`, `Typing`; buttons: `Button`, `IconButton`; inputs: text, textarea, number, password, search, autocomplete, tags, pin, score, checkbox, radio, switch, slider, boolean, colour; badges/avatars/chips; loader/loading bar/progress ring/skeleton; logo; box/stack/paper/divider; icons; display/code/file/chat/countdown. |
| Molecules | Dropdown; alert/feedback; radio and checkbox groups; select, multi-select, date/time/calendar, tree/cascader, mentions, table/list/image inputs and uploads; navigation sidebar/tabs/breadcrumbs/tree/stepper/pager; popover/tooltip/popconfirm; accordion. |
| Organisms | Table; Kanban, sortable/paginated/transfer/user lists; modal, toast, spotlight command surface, tours; drawer/detail/edit panels; rich-text/code/JSON/terminal editors; timelines/descriptions/activity accordion; video player; ribbon; database workspace. |

### Important capability gaps

- No approved page-archetype layer yet (learner home, course, concept, studio host, course builder, grading hub, intervention hub, admin list/detail/settings).
- No first-class chart/data-visualization system is evident. This is a major gap for an intervention platform; add it deliberately rather than allowing ad hoc chart libraries and colour semantics.
- No documented empty-state, permission-denied, offline, no-results, first-use, locked-content or large-data state system. Some individual components have local empty/loading behavior, but not a platform language.
- Spotlight exists and can become universal command search; an explicit command-search information architecture and permissions model do not yet exist.
- No clear `Surface`, `Panel`, `Section`, `Card`, `Row` and `Tile` taxonomy exists. `Paper` is currently a powerful but broad visual wrapper with default elevation, border and freely supplied padding.

### Cards and surfaces

**Confirmed:** there is no dedicated `Card` component; `Paper`, user cards, list cards, tables and bespoke app CSS all serve overlapping roles. `Paper` defaults to a bordered, elevated surface and permits raw padding. This makes it easy for an agent to wrap every content block in a card.

**Recommended surface doctrine:**

| Primitive | What it means | Use | Do not use it for |
| --- | --- | --- | --- |
| **Canvas** | Whole app/page background | page space and scroll regions | an object boundary |
| **Section** | A semantic grouping inside a page | heading + content, separated by space/divider | visual containment by default |
| **Panel** | Persistent functional region | sidebar, inspector, workspace pane, utility rail | a generic dashboard block |
| **Surface** | Raised layer or input plane | form, dialog, editor, temporary overlay | every section |
| **Card** | A discrete independent object | course option, project, recommendation, result, content object | a title-and-description wrapper |
| **List row** | Repeated comparable record | course, learner, activity, submission, concept | rich, editorial object previews |
| **Interactive tile** | A direct navigation/action choice | launch a studio, choose a template, select an activity | passive informational content |

Rules: no nested cards by default; no shadow + border + tinted fill on ordinary cards; no hover lift unless the entire object is clickable; tables/lists win when comparison or scanning matters; whitespace and dividers are legitimate containment.

### Component-selection policy for agents

**Confirmed:** the current source demonstrates both direct component imports and ad hoc CSS/inline style values. There is no repository-level agent rule preventing arbitrary JSX/CSS.

**Recommended policy:** an agent must use existing semantic primitives first. If they cannot represent the need, it must propose a design-system extension with usage, states, accessibility, Storybook example and tests—rather than create one-off styling.

---

## 6. Current problems

### What is visible from the repository

There are no committed screenshots of current app UIs that can be honestly reviewed as final products. The available visual evidence is code, temporary wireframes, the auth/super implementations, studio code and the landing showcase. The design deck supplies an additional visual prototype, not evidence of a shipped screen.

### Confirmed implementation problems

1. **Foundation drift.** The UI package, auth, app shells, SuperAdmin code and wireframe all use different variable names and many direct hex values. The same role may be teal-tinted or slate-tinted depending on source.
2. **Over-broad visual primitive.** `Paper` can be a normal container, card, elevated panel, glass panel or ghost wrapper. Its defaults encourage cardification.
3. **App maturity mismatch.** The product model is sophisticated, but learner/faculty/admin production routes are currently placeholders. Design work must not confuse a detailed wireframe with a validated product surface.
4. **Missing product grammar.** There is a wide component catalog but no approved hierarchy for page type, density, surface, action placement, empty state or cross-role navigation.
5. **Semantic state inconsistency.** Success/warning/error/info variants and focus states have multiple values, some inherited from broad UI conventions rather than a BayesStack decision.
6. **No shared reduced-motion / responsive governance.** Individual components animate reasonably, but the system does not make a platform promise.

### Likely causes of an “AI-generated” feel

**Inferred:** when an agent works from components but not decision rules, it tends to generate: title + description + card grid; equal visual weight; rounded bordered wrappers; arbitrary gaps; and brand colour in every surface. This repo has the ingredients to avoid that pattern, but not yet the guardrails.

### Closest current direction

**Inferred:** the learner wireframe’s concept/studio architecture is closest to the product thesis because it shows course → chapter → concept → activity and supports notes/resources/discussion/contextual help. Keep this **information model**, not necessarily its final visual treatment. The SuperAdmin database workspace is closest to a serious dense-workspace pattern. Auth is closest to a deliberately scoped, calm entry experience.

---

## 7. Information architecture

### Product topology

**Confirmed:** the intended application surfaces are:

```text
bayesstack.com                    product discovery
{tenant}.bayesstack.com/auth      auth and role routing
{tenant}.bayesstack.com/learner   learner experience
{tenant}.bayesstack.com/faculty   faculty experience
{tenant}.bayesstack.com/admin     institutional admin
{tenant}.bayesstack.com/catalog   catalog access for admin/faculty
super.bayesstack.com              platform SuperAdmin
api.bayesstack.com                platform API
```

### Navigation answer

**Confirmed:** role-specific apps, tenant boundaries and role routing are fundamental. SuperAdmin currently exposes Platform Core → BayesStack DB / Learning Library. The temporary learner wireframe exposes Home, Learning, Labs, Projects, Discussions, Calendar, Progress, Help and Profile.

**Recommended:** do not treat the wireframe learner sidebar as final. It is a useful candidate structure:

| Area | Global or contextual | Recommended placement |
| --- | --- | --- |
| Home, Learning, Tasks/Labs, Projects, Discussions, Calendar, Progress | global learner areas | primary sidebar on desktop |
| Current course/chapter/concept/activity | contextual | course/subshell navigation, breadcrumbs and studio host header |
| Notes, resources, discussion, contextual AI | contextual utilities | concept utility panel or drawer; never all permanently expanded on narrow screens |
| Search / command | global but permission-scoped | top-level command surface, available by keyboard |
| Notifications | global | top bar; each notification must deep-link to an academic action |
| Profile/settings | global but low-frequency | sidebar footer/account menu |
| Tenant/institution switch | only if a real multi-membership need is confirmed | account menu; never assume it is universally available |

### Navigation depth and device posture

- **Recommended:** support a maximum of two persistent navigation levels: app-level sidebar plus course/workspace-level rail/tree. Deeper hierarchy is traversed through the current context, breadcrumbs and command search.
- **Recommended:** desktop-first for studios, authoring and administrative work. Make learner consumption responsive, but do not pretend a complex coding/notebook workspace can be a shrunk desktop app. Define a supported mobile minimum before implementation.
- **Confirmed:** collapsible sidebars are already supported in the shared UI and are prototyped in learner/super contexts.
- **Recommended:** universal command search is a primary navigation backbone, as the product context already specifies. A floating generic AI launcher is not an equivalent substitute.

---

## 8. The home screen

### What the repository says

**Confirmed:** learner home is deliberately open design work. Potential inputs include progress, skills, trends, cohort context and quick actions; the docs explicitly say not to treat these as specified UI requirements yet.

### Proposed answer

**Recommended primary job:** learner home is **continuation and next-best academic action**, with just enough orientation to make that action credible. It is not an analytics dashboard, a feed, or a course marketplace.

| User state | First 30 seconds should accomplish | Primary CTA |
| --- | --- | --- |
| Returning learner | Resume the exact meaningful thread: a current concept/activity, due lab, unresolved feedback, or intervention recommendation. | **Continue learning** / **Resume activity** |
| Learner with a due obligation | Understand urgency, why it matters, and one route to act. | **Open task** |
| Learner falling behind | Receive an empathetic, evidence-based recovery recommendation with a manageable action. | **Start recovery step** |
| First-time learner | Establish program/course context and begin the first required concept. | **Begin your first concept** |

### Home content priority

1. One current/next action with context, progress and time/cognitive cost.
2. A short due/commitment horizon (not a giant calendar by default).
3. Course/program progress only to orient—not a wall of metric cards.
4. One useful recommendation or skill/evidence insight when it leads to a clear action.
5. Recent feedback or instructor notice only when it changes what the learner should do.

Do **not** default to cohort rank, empty streak widgets, generic “trending,” several equal course cards, or a feed. Those may have a role later, but they should earn home-screen attention through an actionable consequence.

Role-specific home should differ dramatically: a faculty home starts with teaching/assessment/intervention work; an admin home starts with institutional action signals, not the learner’s continuation model.

---

## 9. Learning experience

### Core model

**Confirmed:** curriculum → program → course → chapter → concept; a concept is the atomic learning topic and contains ordered activities. A studio is the reusable runtime that renders an activity. An activity may be video, coding, quiz or another domain runtime and need not be a top-level learner object.

**Confirmed learning modalities/intended studios:** coding/IDE, video, notebooks/modeling/visualization, spreadsheets, finance terminal, mathematics/statistics visualizations, practice, lab, project/assignment, summative assessment, discussion and contextual AI.

### Recommended experience model

| Level | User purpose | UI pattern |
| --- | --- | --- |
| Learning overview | Choose or resume a course | searchable/scannable course list and one continuation object; avoid card-wall treatment. |
| Course | Understand progress and choose a learning thread | course header, concise status strip, chapter outline/list, next action, task visibility. |
| Concept | Learn one objective through ordered activities | stable concept header, activity sequence, focused content/utility regions. |
| Studio | Perform domain work | dedicated full-bleed or near-full-bleed workspace, with platform chrome reduced to essential context and escape route. |

### Linear versus exploratory learning

**Recommended:** activity order should be **guided by default, not coercively linear**. Requiredness/prerequisites and due dates can constrain progression; otherwise learners may inspect prior material and supported alternatives. The UI must state why something is locked or recommended.

### Completion and progress

**Confirmed:** the platform tracks concept-level progress, activity attempts/submissions and formal grades. The coding model supports attempts and durable state. The design documents reject a simplistic interpretation of mastery as a single authoritative scalar.

**Recommended:** distinguish visibly:

- **Completion:** required activity state has been satisfied.
- **Practice outcome:** a run/attempt result; can be retried.
- **Assessment evidence:** scored/reviewed evidence with provenance.
- **Capability signal:** a qualified aggregation that acknowledges evidence dimensions and uncertainty.

The course should feel alive through current context, activity state, feedback, meaningful next actions and timely intervention—not through decorative animation.

### Focus mode and utilities

**Recommended:** provide a focus mode for reading/studios. Keep the current course/concept and progress minimally visible; move utilities (notes, resources, discussion, copilot) into a right panel/drawer or explicit tab. Do not show everything simultaneously.

---

## 10. Gamification and motivation

**Confirmed:** BayesStack wants restrained motivation, not consumer gamification. The documented model is skill **breadth** (unlocked skills) and **depth** (skill levels), grounded in real learning/evidence. The exact mechanics remain open.

### Decision baseline

- **Reward:** capability evidence, completion of meaningful work, consistency where it improves learning, substantive project contributions and legitimate assessment progress.
- **Do not reward by default:** raw time-on-platform, speed for its own sake, superficial clicks, public status accumulation or meaningless daily streak maintenance.
- **Tone:** prestigious, academic and professional—not collectible, cartoonish or childlike.
- **Social comparison:** **off by default**. Cohort context can help orientation if it is private, useful and does not reduce a learner to a rank.
- **Public profile:** evidence sharing must be permissioned. The product documents emphasize privacy for grades, diagnostics and performance data.
- **Motion:** completion can have a restrained acknowledgement; no confetti system unless a future research-backed decision justifies it.

**Open:** level criteria, retention mechanics, the place of certificates, and whether skill progress is public all require educational/product validation before implementation.

---

## 11. Content density

### Repository evidence

BayesStack supports both five-minute learner sessions and hours-long studio/faculty/admin work. It includes dense data workspaces, tables, code, mathematics, rubrics, course composition and institutional analytics. A single density rule would be wrong.

### Recommended density contract

| Context | Density | Rule |
| --- | --- | --- |
| Learner home/course | Comfortable | Emphasize one next action and readable course structure. Use progressive disclosure for secondary detail. |
| Concept reading | Focused / editorial | Limit prose line length, preserve reading rhythm, reserve utilities for a panel/drawer. |
| Studio | Compact and configurable | Maximize work area, support keyboard, resize regions, persist sensible preferences. |
| Faculty course builder/grading | Compact | Tables, trees, side inspectors, inline controls and contextual bulk actions beat card grids. |
| Admin/SuperAdmin | Compact-to-dense | Data tables, saved filters/views, side inspectors and auditability; no decorative dashboard card wall. |

**Recommended information rule:** never hide the current task’s status, primary action, grade/attempt consequence, or the action needed to recover from an error. Hide metadata, secondary options and long explanations behind progressive disclosure when they do not change the immediate decision.

**Open:** a user-selectable compact/comfortable density setting is not specified. Add it only after the base patterns are consistent; it multiplies testing and component complexity.

---

## 12. Interaction philosophy

### Recommended placement rules

| Pattern | Use when | Do not use when |
| --- | --- | --- |
| **New page/route** | The task has its own URL, deep workflow, durable context, or needs significant focus: course, concept, studio, assessment, course builder, institutional health. | A short confirmation or one-record inspection. |
| **Drawer / detail panel** | Inspect/edit a record while preserving a list, table or builder context; show context-dependent utilities. | A task needs several stages or focused work. |
| **Modal** | A bounded interruption: confirmation, short form, permissions choice, quick create, important legal/security decision. | Main editing, reading, complex tables or a generic container for every action. |
| **Inline expansion** | Explain/preview/change a small local element without changing the user’s mental context. | It would create a second full page inside a page. |
| **Dedicated workbench** | Code, notebook, finance, rich authoring, database or high-density domain work. | A simple form or list. |

### State and action rules

- **Destructive actions:** require a confirmation that names the consequence, except a reversible action with a visible undo. Preserve academic/audit-relevant records where deletion is unsafe.
- **Autosave:** use for drafts, notes, code and non-destructive authoring; make state explicit (`Saved`, `Saving`, `Offline`, `Error`) and retain a manual recovery route where stakes are high.
- **Editing:** inline for one small field; panel/page for structured record editing; workbench for content/complex authoring.
- **Optimism:** use optimistic UI only when rollback is clear and the user will not be misled about an academic/grade outcome. Submissions should show durable queue/running/completed state, not a false instant success.
- **Undo:** prefer for reversible local actions such as archive/unarchive or reorder. Confirm for publication, grade release, institutional changes and irreversible deletion.
- **Hover:** may reveal secondary action controls on pointer devices, but keyboard focus and an always-discoverable overflow/menu must provide the same access.
- **Keyboard:** command search, escape/close, focus movement, submit/run/save in studios, panel toggles and standard form navigation should be first-class. Coding studio already points in this direction.

---

## 13. Typography

### Answer from current source

The current stack is sound: **Outfit** for display/identity, **Inter** for product/body, and **JetBrains Mono** for code and technical data. The detailed current scale is recorded in §4.

### Recommended typography policy

| Role | Family | Weight/rules |
| --- | --- | --- |
| Display / page heading / product identity | Outfit | 600–700, tight letter-spacing used sparingly; do not make every label Outfit bold. |
| App UI, body, tables, labels, forms | Inter | 400–600; it should carry dense enterprise reading. |
| Code, IDs, timestamps, structured technical values | JetBrains Mono | 400–500; never default prose. |
| Authored academic content only | EB Garamond or other editorial choice only when content strategy supports it | Opt-in component/content mode; not navigation, dashboard or general UI. |
| Handwritten treatment | Cedarville Cursive | Not platform chrome. Only a deliberate content/annotation case, if retained at all. |

### Specific rules

- Use size, line height, spacing and layout—not colour alone or weight alone—to create hierarchy.
- Primary readable text should use strong ink, not teal. Teal is interactive/semantic, not default prose.
- Target readable long-form lines of roughly 60–75 characters for academic prose; math, code and tables need their own responsive overflow/zoom behavior.
- Keep interface labels concise and sentence case unless a technical/context label benefits from mono uppercase.
- Avoid fractional CSS font weights until the system publishes them as supported; current 650/660 wireframe values are not a stable cross-font policy.

---

## 14. Colour and visual hierarchy

### Current answer

**Confirmed:** the UI has a strong teal identity, teal-tinted backgrounds/borders and an increasing mix of teal and Slate neutrals. The product is light-first with limited dark areas. Gradients/glass/shadows exist as component variants, but no governance says when they are appropriate.

### Recommended hierarchy

1. **Space and typography first:** use canvas, layout, contrast and type scale to establish reading order.
2. **Brand teal second:** primary action, active/selected state, essential progress and anchor moments.
3. **Analytic indigo third:** intelligence/forecast/comparison/AI labels only; no competition with brand action.
4. **Semantic state colours fourth:** outcomes, never brand decoration.
5. **Colour-independent state:** icon/text/pattern/position must also communicate result, selection, warning or completion.

### Surface and effect policy

- Tinted surfaces: yes, but only subtle selection/context/education states—not as the default page background for every grouping.
- Gradients: allowed on landing/brand moments and rare studio/insight moments; never essential for legibility or generic card decoration.
- Glass: reserved for transient overlays above rich media; not a default enterprise surface.
- Shadows: use to establish a layer relationship (dialog, popover, floating panel), not every card.
- Borders: the default separator. Use low-contrast borders with spacious layouts; use hard structure in dense tables/workspaces.
- Accessibility: WCAG AA is the minimum operational standard. User-facing learning/studio workflows should aim beyond that where feasible, particularly focus states, media and error recovery.

---

## 15. Layout

### What exists

The shared `Stack` uses a 4px-base-like sequence of 4/8/16/24/32. General app content max-widths are 1200–1400px. The wireframe learner uses a persistent sidebar/topbar and approximately 1080–1180px content widths. There is no published 12-column grid, standardized page shell set, or system-wide vertical rhythm.

### Recommended layout grammar

| Archetype | Recommended structure |
| --- | --- |
| Dashboard/action hub | persistent app nav + top context bar + wide content container; one primary action region and evidence/list sections. |
| List/index | title/context + filters/actions aligned to the list/table + one dense data region; inspect via drawer. |
| Detail | breadcrumbs/context + strong header + sections separated by space/dividers; no mandatory outer card. |
| Settings | narrow readable form column with contextual nav; use sections, not tiles. |
| Builder/editor | app nav + workspace rail/tree + main canvas + optional inspector; preserve working context. |
| Learning/course | learner nav + course context + structured outline/continuation; support focus mode. |
| Studio | edge-to-edge workspace below minimal context header; no general dashboard container. |
| Analytics/intervention | evidence table/chart + diagnosis + recommended action + history/outcome measurement. |

### Geometry decisions

- **Recommended base unit:** 4px. Publish scale values rather than allowing arbitrary gaps.
- **Recommended page spacing:** 24px at compact desktop, 32px at standard desktop, 40–48px only for editorial/landing contexts; avoid 58px/42px one-off page padding as a platform default.
- **Recommended sidebar:** 256–272px expanded, 64–72px collapsed rail, role/app dependent. A studio’s internal navigator should be independently resizable where appropriate.
- **Recommended topbar:** 56–64px for application chrome; a studio can use 40–48px minimal context chrome.
- **Recommended full-width allowance:** yes for tables, studios, media and data canvases. Content should not be squeezed into a marketing-site max-width where efficient scanning is required.

---

## 16. Cards specifically

### The answer

Cards should solve a real object-boundary problem—not the agent’s need for a wrapper.

**Use a card when** the content is a discrete, independent object with its own identity, preview, action, ownership/state or click target: a course candidate, activity recommendation, project, file, template, insight/action recommendation, or portfolio item.

**Do not use a card when** the content is a section of a single page, a repeated comparable record, an explanation, a settings group, a table row, a step in an already bounded workflow, or a title + description that can live on the canvas.

### Hard rules

- One visual boundary per object. Do not nest card inside card without a real sub-object relationship.
- Informational card: no lift, no implied click cursor, no vague CTA.
- Interactive card: entire card keyboard-accessible; hover is supplementary; clearly communicates destination/action.
- Dense repeated entities: prefer list rows or tables.
- Elevated cards: reserved for overlays/floating recommendations/important featured objects. Ordinary cards use a border **or** subtle tonal separation, not heavy border + shadow + tint.
- Card radius should follow the shared radius scale; individual pages should not invent a new rounded-rectangle language.

The current `Paper` should be split or documented as `Surface`/`Card`/`Panel` semantics before it becomes more entrenched.

---

## 17. State design

### Current state coverage

**Confirmed:** the shared package includes loaders, loading bars, skeletons, alerts, toasts, modal/loading overlays, table skeletons and component-level disabled/error states. The coding architecture specifies queued/running/completed/failed submission states. The runtime architecture specifies recoverable failures such as unknown studio, media failure, queue delay, worker crash and publication mismatch.

**Gap:** there is no shared, documented visual/state contract for all product states.

### Recommended platform state matrix

| State | Required design behavior |
| --- | --- |
| First use | Explain the user’s next meaningful action and establish context; do not use generic empty-illustration filler. |
| Empty data | State why it is empty, whether this is expected, and the one relevant create/import/filter action. |
| No results | Preserve query/filter context; offer remove-filter/refine-search actions. |
| Loading | Use skeleton only when layout is predictable; otherwise display a concise progress/status state. Do not fake data. |
| Partial loading | Keep available content interactive and clearly mark unresolved regions. |
| Error | Explain the failed action, whether work was saved, and a safe retry/recovery path. Keep technical details available when helpful. |
| Offline | Preserve drafts locally where safe; state synchronization status and prevent misleading submission success. |
| Permission denied | Explain the unavailable capability at an appropriate level without exposing restricted content. Offer a request/access-owner path if valid. |
| Locked prerequisite | State what is required and why, with a direct route to fulfil it. |
| Archived | Preserve provenance/readability; make mutability and restore rules clear. |
| Complete | State what was completed and what logically happens next; do not stop the learner in a reward dead-end. |
| Huge data | Filter/search/paginate/virtualize, preserve query state and support saved views before showing a wall of cards. |

Every state must support keyboard and screen reader communication. Progress and status cannot rely on colour alone.

---

## 18. Enterprise requirements

### Confirmed requirements

The architecture explicitly supports tenant isolation, multiple roles, organization/institution boundaries, content ownership, version pinning/provenance, enrollment/sections, audit-relevant data, assessment attempts, grades, exports and role-specific apps. Auth has SSO as an intended configuration path. SuperAdmin is separate from tenant applications. Privacy of grades, diagnostics, rubrics and performance data is non-negotiable.

| Requirement | Design consequence |
| --- | --- |
| RBAC and tenant isolation | Never imply access that a role cannot use. Hide unavailable actions only when discoverability would not help; otherwise provide clear denied/request states. |
| Content provenance/versioning | Builder/list/detail surfaces must show canonical/custom/derived origin, publication state and version without hiding it as obscure metadata. |
| Auditability | Publishing, grade release, structural changes, intervention dispatch and privileged changes need clear actors/timestamps/status/history. |
| Exports | Treat exports as controlled workflows with scope/format/state, not a mystery download icon. |
| Data-heavy operations | Provide filters, sort, pagination/virtualization, selection, bulk actions and detail inspection. |
| Faculty versus admin | Faculty sees teaching, authoring, grading and cohort actions; admin sees aggregated institutional outcomes/governance. Do not reskin the same dashboard for both. |

**Open:** formal compliance target, detailed approval workflows, billing UX, saved views, custom fields and usage-monitoring requirements are not yet specified in a stable product brief. Do not build them as generic enterprise checkboxes.

---

## 19. AI-native interaction

### Product answer

**Confirmed:** AI is a contextual academic copilot, not a generic chat feature. Its value comes from grounding in the active course/chapter/concept, assignment/rubric, code/work state, dataset/runtime, attempt history, evidence and conversation context. It diagnoses, explains and guides; it should not bypass learning.

### Recommended interaction model

| Context | AI pattern |
| --- | --- |
| Concept/studio | Contextual help panel, utility drawer or targeted inline help attached to the current activity. |
| Coding/notebook | Explain, diagnose, suggest next investigative step, and cite what it used; never silently author a final answer as the default. |
| Faculty builder | Suggest composition/coverage/gaps with provenance and human approval before change. |
| Grading | First-pass/rubric assistance; instructor review controls final released grade. |
| Analytics | Detect → diagnose → recommend action → human dispatch → measure. AI cannot turn a metric into an unreviewed institutional action. |
| Global | Command search may route to contextual copilot capabilities, but a floating universal chat button should not be the principal model. |

### Trust rules

- Generated content must be distinguishable from authored/institutional material when that distinction affects trust or grade/curriculum decisions.
- Show source/context/provenance in an inspectable form; users need a way to verify claims.
- AI may draft, recommend or prepare actions. It must require an appropriate human confirmation before publishing curricula, dispatching sensitive messages or releasing grades.
- Preserve academic integrity: help should guide reasoning and reveal constraints, not simply erase the intended learning task.

---

## 20. Agent-driven development

### Current state

**Confirmed:** `packages/ui` has Storybook, tests and an a11y addon; the current runtime also has Playwright dependency coverage. The repository has [product context](../prompts/product_context.md), but no project-level `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, component-selection policy or visible visual-regression workflow was found. The current workspace is being worked on with Codex, but that is not itself a committed repository instruction.

### Recommended agent operating contract

1. Read this brief, the product-context guardrails and relevant page archetype before building a product surface.
2. Use semantic tokens and existing components first; raw colours/radii/shadows/one-off component CSS require a documented exception.
3. Select an approved archetype before writing JSX: list, detail, builder, studio, intervention hub, settings or learning route.
4. Follow card/surface and page-vs-modal-vs-drawer rules above.
5. Add a component only through the library with states, accessibility, stories and tests. Do not solve one screen with private primitive variants.
6. Render the route at target viewport sizes and inspect it before considering the work done.
7. For any change to colour, type, spacing, radius, elevation or motion, update the shared system—not an app-local approximation.
8. Preserve product guardrails: instructor authority, tenant privacy, accessible studios, grounded AI and intervention over vanity analytics.

Agents should be **strongly constrained within approved patterns**. They can propose a new design-system extension, but may not silently redefine the system.

---

## 21. Quality control

### Existing quality foundation

- Shared UI components have unit tests and Storybook stories.
- Storybook docs and `@storybook/addon-a11y` are configured.
- Chromatic configuration exists, but repository evidence does not establish that it is running in CI or enforcing visual review.
- `@bayesstack/ui` has typecheck and test scripts; root scripts include lint/typecheck/build orchestration.
- No committed product-level UX acceptance checklist, screenshot baseline set or confirmed E2E visual regression gate was found.

### Definition of done — recommended

A page/feature is not done until it has:

1. Correct role/tenant/permission behavior and an appropriate empty/loading/error/denied state.
2. An approved page archetype and component choices; no arbitrary foundation values.
3. Keyboard path, focus order, focus visibility and screen-reader semantics checked.
4. AA contrast verified and colour-independent states present.
5. Rendered review at desktop standard, narrow desktop/tablet and the defined mobile behavior.
6. Tests proportionate to risk: component/unit, interaction and production-critical E2E flows.
7. A visual review/screenshot comparison for shared UI or consequential route changes.
8. A decision about how the flow supports learner consequence, instructor authority and auditability where applicable.

**Recommended governance gate:** any new page or component must pass a lightweight design review against this brief before merge. This is more valuable now than broadening the component inventory again.

---

## 22. Design-system governance

### Current state

The library has a taxonomy and Storybook but no explicit authority model. Raw values appear in shared CSS, apps, wireframes and inline styles, so nothing technically prevents drift.

### Recommended governance rules

| Change | Authority / rule |
| --- | --- |
| New colour, type size, spacing, radius, shadow, motion duration | Design-system owner review. Add a semantic token only if it has a repeated role. |
| New component variant | Must state the semantic use case, states, accessibility behavior, responsive behavior and why an existing primitive cannot serve it. |
| Raw CSS foundation values in app code | Forbidden except for documented data visualizations, tenant branding boundaries or an approved experiment. |
| App-local component | Permitted only if it is truly domain/page-specific and composes shared primitives; it cannot redefine global visual foundations. |
| New chart/visualization | Must use a published categorical/sequential/diverging colour contract and accessible table/summary fallback. |
| Agent exception | The agent proposes the extension in review; it does not merge an improvised token/variant as if it were standard. |

The critical engineering follow-up is a canonical token layer in `packages/ui/src/styles.css`, followed by migration away from fallback hex values. Enforce it with lint/style checks when the semantic API is stable.

---

## 23. Responsiveness and platforms

### Known facts

BayesStack is currently web/Next.js/React based. Auth has a meaningful mobile breakpoint. The app/studio vision is desktop-intensive; Coding Studio has full-screen, Zen and panel layout behavior. The product context requires keyboard and screen-reader accessibility across domain studios.

### Recommended platform contract

- **Desktop web is the primary product.** Optimize 1280–1440px first, with serious support for 13–16 inch laptop heights and width constraints.
- **Learner mobile web is valuable**, but it should preserve the learning mental model with a simplified layout: course/context/next action/content, not a compressed multi-pane workspace.
- **Faculty/admin/mobile studio:** define limited supported operations before promising full parity. Complex builder, grading and code/notebook flows may require desktop.
- **Minimum interaction:** 44px touch target where touch is primary; complete keyboard navigation where keyboard is primary.
- **Internationalization:** global-market ambition requires avoiding text baked into icons, preparing layouts for longer translations and planning date/number/time formats. RTL is not implemented or specified; treat it as an open platform commitment, not a casual CSS afterthought.
- **PWA/native/desktop app:** open. Do not make product/design decisions that assume one without an explicit strategy.

---

## 24. Motion and polish

### Existing posture

The library already uses short 100–250ms transitions, drawers, skeleton shimmer, loading motion, tooltip/dropdown animation and some celebratory/pulse-like patterns. These are individually reasonable but not governed by semantic motion tokens or reduced-motion behavior.

### Recommended motion doctrine

- Default to **120–180ms** for hover/focus/selection and **180–250ms** for entering/exiting panels or reorganizing layout.
- Use motion to explain: loading/progress, panel placement, completion, state change and preservation of workspace context.
- Avoid page-transition theatre, perpetual decorative loops, bouncing, noisy pulses and attention-grabbing animation in high-density academic work.
- Respect `prefers-reduced-motion` from day one; replace spatial animation with immediate state change while retaining status communication.
- Studio performance wins over animation. Drag/resizing and code/editor interaction should disable expensive transitions while active.

---

## 25. Imagery, illustration and visual richness

### Current answer

The product is mostly UI primitives, text, icons, media and domain studios. There are shared brand assets, video capabilities, diagrams in architecture docs and room for activity-specific visualizations; there is no published illustration/photography/course-cover system. The committed [master curriculum workbook](../content/master%20curriculum.xlsx) shows the intended breadth of the library—mathematics, computer science, software engineering, ML/AI, quantitative finance, natural sciences, economics/game theory and humanities—across foundational through frontier phases. That breadth makes generic per-subject card colour-coding especially risky.

### Recommended richness strategy

BayesStack should get richness primarily from **content, data, spatial composition and domain-native media**, not decorative marketing art inside product workspaces:

- course covers/templates can establish contextual identity, but must not create a rainbow taxonomy without a semantic strategy;
- studios should use visualizations, diagrams, code, notebooks, media and interactive feedback that are native to the subject;
- learner profile/evidence can use carefully permissioned avatars/artifacts;
- landing/auth may use editorial brand imagery; operational pages should be quieter;
- subject colours must remain secondary to status/action semantics. Do not use “red = mathematics” if red is also error.

**Open:** photography, illustration direction, avatar policy, course-cover art direction and a subject taxonomy need a dedicated content/brand decision.

---

## 26. Education-specific semantics

### Confirmed model

| Term | Meaning |
| --- | --- |
| Concept | Atomic reusable learning topic, typically an estimated 15–30 minute step in the architecture. |
| Activity | Ordered technical delivery unit within a concept. It can be video, coding, quiz, lab configuration, etc. |
| Completion | Must be derived from activity requirements/progress rules; not merely page view. |
| Assessment evidence | Attempt/submission/rubric/grade information tied to institutional context. |
| Outcome attainment | Program outcome → course → concept → activity → assessment → evidence → attainment. |
| Capability evidence | Multi-dimensional evidence, not an authoritative single “mastery percentage.” |
| Practice tiers | Formative drills; institutional labs; capstones/projects/assignments; summative exams/reflection. |

### Design rules

- Learners can fail and retry formative practice. Failure must be diagnostic, not a dead end.
- Grade/score presentation must distinguish practice feedback, machine preliminary result, instructor feedback and released official result.
- Prerequisites, deadlines, cohorts, sections, faculty feedback and project contribution need explicit semantics, not generic tags.
- Support self-paced behavior within the institution’s course/offering rules; cohort-based learning remains a first-class reality.
- When a learner is behind, surface a recovery path based on pacing/evidence/prerequisites and enable human/AI support. Do not shame or simply mark them red.

---

## 27. The emotional loop

### Product-derived answer

Users should return because BayesStack maintains a credible, personal thread of work: what they were learning, what improved, what needs attention, and the next action that will move them forward.

| Need | Product expression |
| --- | --- |
| Tomorrow’s pull | A current activity, feedback response, due obligation, project responsibility or relevant recommendation. |
| Momentum | Visible but restrained concept/course/skill evidence, not empty streak theatre. |
| Accomplishment | A completed meaningful activity, accepted run, helpful feedback, evidence artifact or project progress. |
| Personalization | Contextual recommendations and copilot grounded in actual academic work. |
| Trust | Clear status, not false certainty; faculty authority and institution privacy respected. |
| Memory after closing | “I know what I am working toward, and this system helps me make real progress.” |

The differentiator should be **clarity and capability**, not addictive engagement mechanics.

---

## 28. Strongest constraints

### Non-negotiable product constraints — confirmed

- Build for institutions broadly, initially India and globally extensible.
- Keep curriculum/program/course/chapter composition flexible above reusable atomic concepts.
- Keep custom institutional content private and institution-owned; keep shared catalog content distinct.
- Retain faculty/curriculum committee control over curriculum decisions.
- AI/machine assistance cannot release final grades without instructor review.
- Institutions remain official systems of record for transcripts/registrar governance; BayesStack provides learning delivery/evidence/exports.
- Grades, rubrics, diagnostics and performance data are confidential to authorized personnel.
- Accessibility, keyboard operation, screen-reader support and colour-independent meaning are baseline requirements.
- Studios are modular and tenant/curriculum agnostic; no direct primary DB coupling.
- Analytics should form an intervention loop, not passive vanity reporting.
- AI must be grounded in real academic context.

### Design-system constraints — recommended

- Preserve BayesStack teal equity, but stop using teal as a universal surface/border/shadow colour.
- Preserve the Outfit/Inter/JetBrains Mono stack, with strict role assignment.
- Existing public component APIs should evolve compatibly where feasible, but visual consistency is more valuable than preserving every ungoverned style escape hatch.
- The UI library may need a meaningful refactor of its token/surface contract. The first refactor should be additive/aliased, then migrate app by app; do not perform a reckless visual rewrite of every app at once.

---

## 29. Personal taste

### Honest answer

**Open.** The repository does not record the founder’s five favorite interfaces, three favorite fonts, personal examples of premium/cheap, or definitive choices between sharp/rounded, dense/spacious, flat/dimensional, monochrome/colourful, editorial/utilitarian and hidden/visible controls.

### Evidence-based provisional read

The existing choices imply a preference for:

- restrained rounded geometry (mostly 6–12px, though currently inconsistent);
- light canvas, crisp surfaces and soft teal identity;
- Outfit/Inter contemporary enterprise typography;
- rich, dense specialist workspaces when the task warrants it;
- less decorative and more serious than consumer learning apps.

This is a **provisional read, not owner-approved taste**. Before treating it as a brand direction, capture a curated reference board and explicit anti-references. The color direction deck provides three credible directions and ranks the teal-led route first; it is not a substitute for those personal choices.

---

## 30. Artifact inventory and next decisions

### Artifacts present in the repository

| Requested artifact | Status / location |
| --- | --- |
| Current brand palette | `packages/assets/brand-palette.json`, `packages/assets/src/tokens/colors.ts`. |
| Current shared style foundations | `packages/ui/src/styles.css`. |
| Typography styles | `packages/ui/src/atoms/Typography/`; app globals in `apps/*/app/globals.css`. |
| Spacing/radius/shadow behavior | `packages/ui/src/atoms/Layout/Layout.css` plus component CSS. Not yet a canonical token specification. |
| Logo/brand assets | `packages/assets/static/brand/`, shared logo components. |
| Component catalog/documentation | `packages/ui`, Storybook configuration, component tests and stories; [UI README](../../packages/ui/README.md). |
| Current UI application code | `apps/auth`, `apps/super`, `apps/landing`; learner/faculty/admin route placeholders. |
| Temporary screen mockups | `docs/wireframes/`; learner is materially richer than faculty/admin. See [wireframe README](../wireframes/README.md). |
| Studio implementations | `studios/coding`, `studios/video`; coding UI is substantial. |
| Product/system documents | `docs/prompts/product_context.md`, `docs/system-design/`, daily planning in `docs/todo/`. |
| Market / wedge decision | `docs/system-design/BayesStack_B2B_Education_Market_Strategy.pdf`; this sets Course Foundry as the initial commercial priority and India → UAE → UK strategy. |
| Master curriculum evidence | `docs/content/master curriculum.xlsx`; an early cross-domain curriculum map, not a final information architecture or visual taxonomy. |
| Visual palette comparison | [Color direction deck](./bayesstack-color-direction-deck.html). |
| Current UI screenshots | No clearly maintained, committed UI screenshot set found. Architecture diagrams exist under `docs/**/img`, but they are not UI review artifacts. |
| Approved design-agent instruction file | Not found at repository root. Product context exists but is not a component-selection/design-governance contract. |
| Rough sitemap | Derivable from product topology and wireframe routes; not maintained as a single authoritative sitemap. |

### Immediate decision queue

The following are the highest-value decisions to make before an agent attempts to build final learner/faculty/admin products:

1. **Adopt a canonical semantic token contract** and the Bayes Signal palette direction; migrate aliases and remove competing primitive names over time.
2. **Approve surface/card doctrine** and split/document `Paper` into intentional surface semantics.
3. **Approve role-specific page archetypes**: learner home/course/concept/studio; faculty builder/grading/intervention; admin health/action; shared list/detail/settings.
4. **Resolve learner home and minimum motivation model** with a concrete returning learner, first-time learner and behind-learner flow.
5. **Define the contextual AI contract**: visible context, citations/provenance, assistance boundaries, human confirmation and academic integrity behavior.
6. **Create a state-design kit** for all product states, especially submissions, publication, grading, permission and recovery.
7. **Write project-level agent instructions and acceptance checklist**, then make Storybook/a11y/rendered review a required development loop.
8. **Select official reference and anti-reference products** with specific lessons, not aesthetic name-dropping.

---

## Appendix A — canonical terms an agent must preserve

| Term | Do not collapse it into |
| --- | --- |
| Institution | University only; the product must accommodate other education organizations. |
| Curriculum | Course; it is an institution-level pathway. |
| Program | A fixed “semester” only; terminology/structure varies by institution. |
| Concept | A lesson page only; it is the reusable atomic pedagogical unit. |
| Activity | A standalone learner object by default; it is a delivery/runtime unit inside a concept. |
| Studio | A generic UI panel; it is a specialized pluggable domain learning runtime. |
| Completion | Mastery; completion is a workflow state. |
| Capability evidence | A single score; it is multi-dimensional and contextual. |
| Analytics | Dashboard charts; it must aim to complete an intervention loop. |
| AI copilot | Generic chat; it is grounded in active academic work. |

## Appendix B — short instruction for a coding agent

> Build BayesStack as a calm, rigorous academic operating system—not a generic LMS or card-heavy SaaS dashboard. Work from learner consequence, faculty authority, institutional privacy, accessibility and actionable intervention. Use the shared semantic design system and approved page archetypes; do not introduce raw visual values or one-off components. Teal is for meaningful action and selection, neutral structure carries most of the UI, and analytic accent is reserved for insight/AI. Prefer sections, lists, tables and panels over arbitrary cards. A complex user task gets a focused route or workbench; drawers preserve context; modals are bounded interruptions. Every state must be keyboard-accessible, color-independent and explain recovery. If existing primitives cannot produce a needed UI, propose a documented system extension instead of improvising.
