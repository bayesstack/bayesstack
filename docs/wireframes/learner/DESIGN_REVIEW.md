# Learner wireframe vs. Prismforce reference UI

## Purpose

This is a design review of the current learner wireframe against the supplied Prismforce product references. It identifies visual and interaction-design gaps, then turns them into a direction for the next implementation pass.

> **Implementation status:** The comparison below records the pre-revamp baseline. The learner wireframe has since been rebuilt around the recommended product system: a grouped workspace shell, route-specific command surfaces, richer data and progress components, contextual drawers, evidence-aware states, and responsive reflow across every learner route.

The references demonstrate stronger visual polish. They do **not** by themselves prove a better end-to-end user experience: screenshots cannot show responsiveness, accessibility, performance, keyboard use, error recovery, or whether a learner completes an important task. The comparison is therefore about what the UI communicates at a glance and how product-ready it feels.

## Key difference: product system vs. route wireframes

The Prismforce screens look like a cohesive product system. A shared shell, a stable grid, repeated component patterns, a clear blue action color, strong selected states, and consistent data visualizations appear across screens.

The learner work is a well-reasoned set of route wireframes: Home, Learning, Labs, Projects, Discussions, Calendar, Progress, Help, and Profile each have a clear job. However, much of the presentation is still page-specific markup, simple cards, and text. It reads as an informative wireframe rather than a visually finished learning product.

## UI differences

| Area | Prismforce references | Current learner wireframe | Consequence |
| --- | --- | --- | --- |
| Page hierarchy | A large page title, a compact KPI/context band, then one obvious primary working area | Multiple sections/cards can carry similar visual weight | Learners need longer to decide what deserves attention first |
| App shell | Persistent navigation, top utility bar, stable page frame, and a carefully constrained desktop grid | A learner shell exists, but the internal layout changes more between routes | The product feels less like one connected environment |
| Typography | Confident headings, readable body text, restrained metadata, and consistent casing | Small labels and body styles are used frequently; several route designs rely on dense explanatory copy | The UI feels more like a specification and is harder to scan |
| Components | Rich, repeated controls: tabs, segmented views, metric cards, chips, progress indicators, row actions, tables, dialogs, and charts | Many areas use a bordered section plus native-looking button/text arrangements | Lower perceived quality and weaker interaction affordance |
| Color and state | One saturated blue clearly carries selection, primary action, progress, focus, and data meaning | BayesStack uses a quiet teal/green palette, but its primary action and state hierarchy are less forceful | Important actions and states can blend into surrounding content |
| Information design | Status, confidence, completion, gap, urgency, and evidence are visualized close to the object they describe | Progress/evidence are often conveyed in prose, labels, and simple badges | The learner must read more before they can act |
| Depth and visual material | Controlled shadows, borders, layers, avatars, illustrations, and data surfaces give the screens a finished feel | The UI is comparatively flat and mostly built from text, icons, and uniform cards | Less visual character and lower perceived trust/quality |
| Interaction language | Selected/hover/focus states, tabs, chips, panels, filters, row actions, and drill-ins use a shared visual grammar | Drawers and tabs appear in places, but state coverage is not yet systematic | Users cannot always predict which elements are interactive or what will happen next |
| Task guidance | Tasks expose their purpose, status, reward/effort, and a clear next action in one row | Relevant learner actions exist, but urgency, payoff, and next steps are not uniformly prominent | Home and Labs do not yet feel as action-oriented as they could |

## The UI-library underuse is a real root cause

This is not just a styling issue. The repository already has a rich UI library organized into atoms, molecules, and organisms, including:

- Atoms: `Button`, `IconButton`, `Avatar`, `AvatarsGroup`, `Badge`, `Chip`, `ProgressRing`, `LoadingBar`, `Skeleton`, `Title`, `Text`, `Logo`, and display primitives.
- Molecules: `Calendar`, `DatePicker`, `Select`, `MultiSelect`, `TreeSelect`, `Mentions`, file/image inputs, `Popover`, `Tooltip`, and `Popconfirm`.
- Organisms: `Sidebar`, `Tabs`, `Table`, `Drawer`, `Paper`, `Stepper`, `Ribbon`, editors, `Spotlight`, toast/modal providers, and data-display components including `ScheduleCalendar`.

The learner shell and the Learning route do use several of these primitives. For example, Learning uses `Badge`, `Breadcrumbs`, `Button`, `Drawer`, `LoadingBar`, `Paper`, `ProgressRing`, `Stepper`, `Table`, and `Tabs`; Calendar uses `ScheduleCalendar`; and the shell uses `Avatar`, `Sidebar`, `Spotlight`, and `Tooltip`.

But the newer route implementations—Home, Labs/Projects, Discussions, Progress, Help, and Profile—mostly import only `Icon` and build their layouts from raw HTML elements with local CSS. That has three effects:

1. The visual language does not inherit the maturity already present in the library.
2. Interaction states, spacing, focus treatment, responsiveness, and accessibility have to be recreated route by route.
3. The product loses the component richness that makes the Prismforce references feel like a coherent application rather than a set of pages.

## What should be retained

BayesStack should not copy Prismforce wholesale. Prismforce is an enterprise talent-management system; its density could be intimidating in an academic learner experience. BayesStack's strongest ideas should remain:

- Labs, evidence, academic schedule, and learning context as core learner objects.
- A distinction between academic discussion/help and technical/platform support.
- Capability growth and evidence over generic gamification.
- Calm, learner-centred language rather than corporate dashboard language.

The goal is to borrow Prismforce's hierarchy, component discipline, visible states, and visual finish—not its domain model or every dashboard convention.

## Recommended redesign direction

### 1. Establish a learner visual system

Use existing library tokens and primitives to define a consistent learner shell:

- Keep BayesStack teal as a brand color, but add a high-contrast primary-action color and explicit semantic colors for success, warning, deadline, and evidence.
- Use a compact, readable type scale. Metadata must support the hierarchy, not become the default reading size.
- Standardize page headers, tab bars, action rows, section headers, empty states, and right-side context panels.
- Treat selected, hover, focus-visible, disabled, loading, empty, error, and success states as part of every component contract.

### 2. Replace generic cards with task-specific composite components

Create a small set of learner organisms rather than another collection of bespoke cards:

| Composite component | Reuses | Suitable routes |
| --- | --- | --- |
| `LearnerPageHeader` | Breadcrumbs, Title/Text, Badge, Button, Avatar | Every learner route |
| `ActionQueue` / `ActionRow` | Checkbox/status, Badge, Chip, LoadingBar, Button, Tooltip | Home, Labs, Projects, Learning |
| `LearningActivityCard` | Paper, Badge, progress, media slot, action menu | Home, Learning, Labs |
| `EvidenceTimeline` | Avatar, FileItem, Badge/Chip, Tabs, Drawer | Progress, Labs, Projects |
| `CapabilitySnapshot` | ProgressRing, Tabs, Tooltip, comparison/data-display primitives | Progress, Home |
| `ContextRail` | Paper, Tabs, Drawer, related actions | Discussions, Labs, Learning studio |
| `ConnectionCard` | Avatar/Icon, Badge, Popconfirm, Button | Profile |

### 3. Make learner data visual, not explanatory prose

- Home should use a clear next-action queue, progress snapshots, a deadline rail, and explicit completion/effort signals.
- Progress should foreground capability trajectory, skill confidence, evidence coverage, and what closes the next gap.
- Labs should show preparation, attendance/physical sign-off, evidence, feedback, and completion as an ordered workflow.
- Discussions should use thread state, contributor identity, accepted/resolved answers, and contextual links as deliberate reusable UI.
- Calendar should use the shared calendar control alongside a compact agenda, filters, and a detailed event drawer.

### 4. Use the library before creating local CSS

For a learner route, begin by composing the existing atoms, molecules, and organisms. Add a shared learner organism only when the same academic pattern recurs across routes. Local CSS should tune the composition, not recreate buttons, tabs, drawers, tables, progress indicators, or selectors from scratch.

## Definition of done for the visual-quality pass

- Every learner route uses the same page header, action language, spacing scale, and responsive breakpoints.
- Primary actions, statuses, deadlines, and completion are recognizable without reading paragraphs.
- Repeated learner patterns are shared components, backed by the UI library.
- The smallest readable text is accessible and intentionally reserved for metadata.
- Core journeys have empty, loading, error, disabled, focus, and success states.
- Home, Labs, Learning, and Progress each contain a meaningful visual progress/evidence component rather than only card lists.
- The learner experience feels like one product while retaining its academic, not corporate, character.
