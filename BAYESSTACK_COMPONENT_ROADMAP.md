# BayesStack Design Studio — Master Component Blueprint & 3-Tier Roadmap

> **Target Package**: `@bayesstack/ui` (BayesStack Enterprise Design System)  
> **Architecture Standard**: 3-Tier Atomic Design Architecture (**Atoms**, **Molecules**, **Organisms**)  
> **Layout Philosophy**: Page layouts are handled natively via **Next.js App Router (`layout.tsx`)**, leveraging route groups, nested layouts, and preserved state rather than standalone UI layout components.  
> **Source Foundations**: Combined primitives from **Bubbles UI** + Enterprise Extensions from **Ant Design** & **Hugeicons**

---

## 🏛️ 1. Architecture Overview

To ensure maximum modularity, scale, and maintainability across BayesStack applications (`landing`, `learner`, `faculty`, `admin`), all components in `@bayesstack/ui` strictly follow a **3-Tier Component Architecture**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BAYESSTACK 3-TIER DESIGN ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚛️ TIER 1: ATOMS                                                            │
│ Single-purpose UI primitives grouped into functional folders:               │
│ • Badges (Avatar, AvatarsGroup, Badge, Chip)                                │
│ • Buttons (Button, IconButton)                                              │
│ • Display (ChatMessage, CountDown, FileItem)                                │
│ • Icons (Icon / Hugeicons)                                                  │
│ • Inputs (TextInput, PasswordInput, NumberInput, SearchInput, Textarea,      │
│          Checkbox, Radio, Switch, Slider, ColorInput, PinInput, Autocomplete, │
│          TagsInput, ScoreInput, BooleanInput, InputLabel, InputDescription,  │
│          InputError, InputHelp)                                             │
│ • Layout (Box, Divider, Paper, Stack)                                       │
│ • Loading (Loader, LoadingBar, Skeleton)                                    │
│ • Logo (Logo)                                                               │
│ • Typography (Text, Title, Paragraph, HtmlText, Typing)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🧪 TIER 2: MOLECULES                                                        │
│ Composite input groups, navigation controls & floating popovers:            │
│ • Feedback (Alert)                                                          │
│ • ChoiceGroups (CheckboxGroup, RadioGroup)                                  │
│ • Dropdown (Dropdown)                                                       │
│ • Navigation (Breadcrumbs, Tabs, Pager, Stepper, Tree)                      │
│ • Popovers (Tooltip, Popover, Popconfirm)                                   │
│ • Selects (Select, MultiSelect, Cascader, TreeSelect, Mentions, DatePicker, │
│            TimeInput, Calendar, ListInput, TableInput, FileUpload,          │
│            ImagePreviewInput, ImageProfilePicker, FileItemDisplay)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🧫 TIER 3: ORGANISMS                                                        │
│ Complex functional modules, data views & rich interactive editors:          │
│ • DataDisplay (Table, Descriptions, Spotlight, HorizontalTimeline)          │
│ • Drawers (Drawer, BaseDrawer, DrawerPush, DetailPanel, EditPanel)          │
│ • Editor (TextEditor, ContentEditorInput, Toolbar, BubbleMenu, CodeBlock,   │
│          LinkModal, SchemaNav, Editor Tools)                                │
│ • Lists (PaginatedList, SortableList, Transfer, UserCards,                  │
│          UserDisplayItemList, Kanban, ActivityAccordion)                    │
│ • Media (VideoPlayer)                                                       │
│ • Modals (Modal, ModalZoom, Tour)                                           │
│ • Notification & Overlay (Notification, LoadingOverlay)                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

> ℹ️ **Layout Strategy Note**: Standalone component layouts have been omitted. Next.js App Router provides native, file-system-based page shells via `layout.tsx` files. This avoids redundant component wrappers while offering superior performance, route-level state preservation, and native HTML semantics.

---

## 📋 2. Master Component Inventory

---

### ⚛️ TIER 1: ATOMS (Foundational Single-Element Primitives)

Atoms are foundational UI elements organized into sub-folders matching Storybook's catalog hierarchy.

| # | Component | Folder / Group | Primary Origin | Description & Capabilities | Target Priority | Sign Off |
|---|---|---|---|---|---|---|
| **Badges** | | | | | | |
| 1 | **Avatar** | `Badges` | Bubbles | Profile avatar displaying user image, initials, or fallback icon with status indicators. | 🔴 High (Wave 1) | ✅ Passed |
| 2 | **AvatarsGroup** | `Badges` | Bubbles | Stacked overlapping avatar list displaying collaborator count. | 🔴 High (Wave 2) | ✅ Passed |
| 3 | **Badge** | `Badges` | Bubbles | Status badge/pill supporting `success`, `warning`, `error`, `info` color tokens. | 🔴 High (Wave 1) | ✅ Passed |
| 4 | **Chip** | `Badges` | Bubbles | Compact interactive filter chip or removable tag badge. | 🔴 High (Wave 1) | ✅ Passed |
| **Buttons** | | | | | | |
| 5 | **Button** | `Buttons` | Bubbles | Core action trigger supporting variants (`primary`, `secondary`, `tertiary`, `link`), sizes, loading states, and icons. | 🔴 High (Wave 1) | ✅ Passed |
| 6 | **IconButton** | `Buttons` | Bubbles | Icon-only button with square/circular hit target and accessible labels. | 🔴 High (Wave 1) | ✅ Passed |
| **Display** | | | | | | |
| 7 | **ChatMessage** | `Display` | Bubbles | Chat bubble component displaying sender avatar, name, text content, attachments, and timestamps. | 🔴 High (Wave 1) | ✅ Passed |
| 8 | **CountDown** | `Display` | Bubbles | Live countdown timer primitive supporting HH:MM:SS format, icon badge, and completion callbacks. | 🔴 High (Wave 1) | ✅ Passed |
| 9 | **FileItem** | `Display` | Bubbles | File preview badge item displaying extension icon, name, file size, thumbnail preview, and download handler. | 🔴 High (Wave 1) | ✅ Passed |
| **Icons** | | | | | | |
| 10 | **Icon** | `Icons` | Hugeicons | Enterprise stroke icon primitive backed by Hugeicons free stroke set. | 🔴 High (Wave 1) | ✅ Passed |
| **Inputs** | | | | | | |
| 11 | **TextInput** | `Inputs` | Bubbles | Single-line text input with icon prefix, suffix, and error states. | 🔴 High (Wave 1) | ✅ Passed |
| 12 | **PasswordInput** | `Inputs` | Bubbles | Secure password input with built-in show/hide toggle. | 🔴 High (Wave 1) | ✅ Passed |
| 13 | **NumberInput** | `Inputs` | Bubbles | Numeric field with step buttons, bounds validation, and unit suffixes. | 🟡 Medium (Wave 2) | ✅ Passed |
| 14 | **SearchInput** | `Inputs` | Bubbles | Search text input with magnifying glass icon and instant clear (`✕`) trigger. | 🔴 High (Wave 1) | ✅ Passed |
| 15 | **Textarea** | `Inputs` | Bubbles | Multi-line text area with auto-grow and character count limiters. | 🔴 High (Wave 1) | ✅ Passed |
| 16 | **Checkbox** | `Inputs` | Bubbles | Standard checkbox supporting checked, unchecked, and indeterminate states. | 🔴 High (Wave 1) | ✅ Passed |
| 17 | **Radio** | `Inputs` | Bubbles | Single radio button option element. | 🔴 High (Wave 1) | ✅ Passed |
| 18 | **Switch** | `Inputs` | Bubbles | Boolean toggle switch input (`true`/`false`). | 🔴 High (Wave 1) | ✅ Passed |
| 19 | **Slider** | `Inputs` | Bubbles | Numerical range slider input with step tick marks. | 🟡 Medium (Wave 2) | ✅ Passed |
| 20 | **ColorInput** | `Inputs` | Bubbles | Compact color swatch input with hex/rgb format popover. | 🟢 Low | ✅ Passed |
| 21 | **PinInput** | `Inputs` | BayesStack | Verification code primitive with auto-advance, slot grouping, paste handling, and security masking. | 🔴 High (Wave 1) | ✅ Passed |
| 22 | **Autocomplete** | `Inputs` | Bubbles | Suggestion text input with keyboard navigation, grouped options, custom renderers, debouncing, and instant clear. | 🔴 High (Wave 1) | ✅ Passed |
| 23 | **TagsInput** | `Inputs` | Bubbles | Inline tag creation text input with removable badges, suggestion autocomplete, and comma/enter handling. | 🔴 High (Wave 1) | ✅ Passed |
| 24 | **ScoreInput** | `Inputs` | Bubbles | Interactive numeric/letter grade rating control supporting segmented boxes, star rating, and pills. | 🟡 Medium (Wave 2) | ✅ Passed |
| 25 | **BooleanInput** | `Inputs` | Bubbles | Segmented button toggle and boxed selection control for boolean/choice states. | 🔴 High (Wave 1) | ✅ Passed |
| 26 | **InputLabel** | `Inputs` | Bubbles | Form label primitive with optional/required asterisk (`*`) marker. | 🔴 High (Wave 1) | ✅ Passed |
| 27 | **InputDescription**| `Inputs` | Bubbles | Helper text positioned beneath input labels. | 🔴 High (Wave 1) | ✅ Passed |
| 28 | **InputError** | `Inputs` | Bubbles | Form error message banner/text styled in danger tokens. | 🔴 High (Wave 1) | ✅ Passed |
| 29 | **InputHelp** | `Inputs` | Bubbles | Inline tooltip or helper note icon for form fields. | 🟡 Medium (Wave 2) | ✅ Passed |
| **Layout** | | | | | | |
| 30 | **Box** | `Layout` | Bubbles | Base block container supporting padding, margin, and background tokens. | 🔴 High (Wave 1) | ✅ Passed |
| 31 | **Divider** | `Layout` | Bubbles | Horizontal or vertical divider line with optional centered label. | 🔴 High (Wave 1) | ✅ Passed |
| 32 | **Paper** | `Layout` | Bubbles | Card surface panel with elevation shadows and border radius. | 🔴 High (Wave 1) | ✅ Passed |
| 33 | **Stack** | `Layout` | Bubbles | Flexbox layout primitive for vertical/horizontal spacing of children. | 🔴 High (Wave 1) | ✅ Passed |
| **Loading** | | | | | | |
| 34 | **Loader** | `Loading` | Bubbles | Animated spinner/loader dots or rings. | 🔴 High (Wave 1) | ✅ Passed |
| 35 | **LoadingBar** | `Loading` | BayesStack | Linear progress bar (determinate/indeterminate) for route transitions and async operations. | 🔴 High (Wave 1) | ✅ Passed |
| 36 | **Skeleton** | `Loading` | Ant Design | Pulsing wireframe placeholder matching card, table, or text shapes during data loading. | 🔴 High (Wave 1) | ✅ Passed |
| **Logo** | | | | | | |
| 37 | **Logo** | `Logo` | Bubbles | Brand logo container with responsive sizing. | 🔴 High (Wave 1) | ✅ Passed |
| **Typography** | | | | | | |
| 38 | **Text** | `Typography` | Bubbles | Core typography component supporting font weights, sizes, colors, and line clamps. | 🔴 High (Wave 1) | ✅ Passed |
| 39 | **Title** | `Typography` | Bubbles | Heading primitive (`H1`–`H6`) with standardized token margins and line heights. | 🔴 High (Wave 1) | ✅ Passed |
| 40 | **Paragraph** | `Typography` | Bubbles | Semantic paragraph text component optimized for longform content. | 🔴 High (Wave 1) | ✅ Passed |
| 41 | **HtmlText** | `Typography` | Bubbles | Renders sanitized HTML strings with design token styling. | 🟡 Medium (Wave 2) | ✅ Passed |
| 42 | **Typing** | `Typography` | Bubbles | Typewriter text animation effect for empty states and AI assistant prompts. | 🟡 Medium (Wave 2) | ✅ Passed |
| 43 | **LatexText** | `Typography` | BayesStack | Renders inline ($...$) and block ($$...$$) LaTeX mathematical equations via KaTeX rendering. | 🔴 High (Wave 1) | ✅ Passed |

---

### 🧪 TIER 2: MOLECULES (Composite Controls, Navigation & Pickers)

Molecules combine two or more Atoms into cohesive functional controls.

| # | Component | Folder / Group | Primary Origin | Description & Capabilities | Target Priority | Sign Off |
|---|---|---|---|---|---|---|
| **Feedback** | | | | | | |
| 44 | **Alert** | `Feedback` | Bubbles | Notification banner combining Icon, Title/Text, and close trigger. | 🔴 High (Wave 1) | ✅ Passed |
| **ChoiceGroups** | | | | | | |
| 45 | **CheckboxGroup** | `ChoiceGroups` | Bubbles | Multi-select checkbox container group. | 🔴 High (Wave 1) | ✅ Passed |
| 46 | **RadioGroup** | `ChoiceGroups` | Bubbles | Manages selection state and keyboard navigation across multiple Radio inputs. | 🔴 High (Wave 1) | ✅ Passed |
| **Dropdown** | | | | | | |
| 47 | **Dropdown** | `Dropdown` | Ant Design | Enterprise floating menu supporting nested submenus, pointer arrows, selectable checkmarks, shortcuts, and placements. | 🟡 Medium (Wave 2) | ✅ Passed |
| **Navigation** | | | | | | |
| 48 | **Breadcrumbs** | `Navigation` | Bubbles | Link navigation path with custom separator icons. | 🔴 High (Wave 1) | — |
| 49 | **Tabs** | `Navigation` | Bubbles | Navigation tab bar supporting underline, pill, and icon styles. | 🔴 High (Wave 1) | — |
| 50 | **Pager** | `Navigation` | Bubbles | Pagination control bar with page size selection and direct jump. | 🔴 High (Wave 2) | — |
| 51 | **Stepper** | `Navigation` | Bubbles | Horizontal/Vertical step indicator for multi-page forms or wizard flows. | 🔴 High (Wave 2) | — |
| 52 | **Tree** | `Navigation` | Bubbles | Hierarchical tree view with node expansion, selection, and guide lines. | 🔴 High (Wave 2) | — |
| **Popovers** | | | | | | |
| 53 | **Tooltip** | `Popovers` | Bubbles | Floating hover hint for controls and truncated text. | 🔴 High (Wave 1) | — |
| 54 | **Popover** | `Popovers` | Bubbles | Anchored floating card triggerable by click or focus. | 🔴 High (Wave 1) | — |
| 55 | **Popconfirm** | `Popovers` | Ant Design | Lightweight confirmation popover attached to action buttons (*"Delete row? [Yes] [No]"*). | 🔴 High (Wave 1) | — |
| **Selects** | | | | | | |
| 56 | **Select** | `Selects` | Bubbles | Custom single dropdown select with search filtering and clearable values. | 🔴 High (Wave 1) | — |
| 57 | **MultiSelect** | `Selects` | Bubbles | Dropdown select for picking multiple tags or values. | 🔴 High (Wave 1) | — |
| 58 | **Cascader** | `Selects` | Ant Design | Multi-stage cascading selection dropdown (*Country > State > City*, *Org > Team*). | 🔴 High (Wave 2) | — |
| 59 | **TreeSelect** | `Selects` | Ant Design | Select dropdown containing an expandable tree view for nested category picking. | 🔴 High (Wave 2) | — |
| 60 | **Mentions** | `Selects` | Ant Design | Autocomplete trigger for `@user` or `#tag` insertion inside text fields/textareas. | 🟡 Medium (Wave 2) | — |
| 61 | **DatePicker** | `Selects` | Bubbles | Single/range date picker input with popup calendar. | 🔴 High (Wave 2) | — |
| 62 | **TimeInput** | `Selects` | Bubbles | Time selector supporting 12h/24h formats and minute steps. | 🟡 Medium (Wave 2) | — |
| 63 | **Calendar** | `Selects` | Bubbles | Interactive month calendar view displaying events and selected dates. | 🟡 Medium (Wave 3) | — |
| 64 | **ListInput** | `Selects` | Bubbles | Dynamic list field allowing users to add/remove/reorder text items. | 🟡 Medium (Wave 2) | — |
| 65 | **TableInput** | `Selects` | Bubbles | Inline key-value matrix input. | 🟡 Medium (Wave 3) | — |
| 66 | **FileUpload** | `Selects` | Bubbles | Drag-and-drop file upload zone with file validation and progress indicator. | 🔴 High (Wave 2) | — |
| 67 | **ImagePreviewInput**| `Selects` | Bubbles | Image file input with thumbnail preview and removal button. | 🟡 Medium (Wave 2) | — |
| 68 | **ImageProfilePicker**| `Selects` | Bubbles | Profile avatar uploader with image cropping overlay. | 🟡 Medium (Wave 3) | — |
| 69 | **FileItemDisplay** | `Selects` | Bubbles | File row display showing extension icon, file name, size, and actions. | 🔴 High (Wave 2) | — |

---

### 🧫 TIER 3: ORGANISMS (Complex Modules, Data Views & Editors)

Organisms combine Molecules and Atoms into complete, self-contained interactive sections.

| # | Component | Folder / Group | Primary Origin | Description & Capabilities | Target Priority | Sign Off |
|---|---|---|---|---|---|---|
| **DataDisplay** | | | | | | |
| 70 | **Table** | `DataDisplay` | Bubbles | Enterprise data table supporting column sorting, filtering, row selection, sticky header, and pagination. | 🔴 High (Wave 2) | — |
| 71 | **Descriptions**| `DataDisplay` | Ant Design | Key-value detail grid with aligned labels and values for inspecting entity metadata. | 🔴 High (Wave 2) | — |
| 72 | **Spotlight** | `DataDisplay` | Bubbles | Global command palette (`Cmd + K`) search modal with fuzzy matching. | 🔴 High (Wave 2) | — |
| 73 | **HorizontalTimeline**| `DataDisplay` | Bubbles | Chronological event timeline view. | 🟡 Medium (Wave 3) | — |
| **Drawers** | | | | | | |
| 74 | **Drawer** | `Drawers` | Bubbles | Slide-over drawer panel (left/right/top/bottom) for filters, forms, or side details. | 🔴 High (Wave 1) | — |
| 75 | **BaseDrawer** | `Drawers` | Bubbles | Low-level primitive container for side drawers. | 🟢 Low | — |
| 76 | **DrawerPush** | `Drawers` | Bubbles | Side drawer that pushes content stage rather than overlaying. | 🟢 Low | — |
| 77 | **DetailPanel** | `Drawers` | Bubbles | Slide-in drawer specialized for inspecting entity details and metadata. | 🔴 High (Wave 2) | — |
| 78 | **EditPanel** | `Drawers` | Bubbles | Slide-in side form editor panel for quick entity editing without page navigation. | 🔴 High (Wave 2) | — |
| **Editor** | | | | | | |
| 79 | **TextEditor** | `Editor` | Bubbles | Rich text WYSIWYG editor powered by Tiptap / ProseMirror with custom formatting toolbar. | 🔴 High (Wave 3) | — |
| 80 | **ContentEditorInput**| `Editor` | Bubbles | Form-ready rich content editor wrapped with label and validation handlers. | 🔴 High (Wave 3) | — |
| 81 | **Toolbar** | `Editor` | Bubbles | Formatting toolbar for rich text editors and canvas tools. | 🔴 High (Wave 3) | — |
| 82 | **BubbleMenu** | `Editor` | Bubbles | Floating text-selection menu for quick bold/italic/link formatting. | 🟡 Medium (Wave 3) | — |
| 83 | **CodeBlockComponent**| `Editor` | Bubbles | Syntax-highlighted code block component inside rich text documents. | 🔴 High (Wave 3) | — |
| 84 | **LinkModal** | `Editor` | Bubbles | Modal dialog for inserting and editing URLs and link labels. | 🟡 Medium (Wave 3) | — |
| 85 | **SchemaNav** | `Editor` | Bubbles | Document outline tree navigation generated from heading tags. | 🟡 Medium (Wave 3) | — |
| 86 | **Editor Tools** | `Editor` | Bubbles | Formatting modules: `BoldTool`, `ItalicTool`, `UnderlineTool`, `StrikeTool`, `HeadingsTool`, `BlockquoteTool`, `CodeTool`, `TextAlignTool`, `ColorTool`, `ImageTool`, `LinkTool`, `VideoTool`, `EmbedTool`. | 🔴 High (Wave 3) | — |
| **Lists** | | | | | | |
| 87 | **PaginatedList** | `Lists` | Bubbles | Data list view supporting Table and Grid layouts coupled with Pager toolbar. | 🔴 High (Wave 2) | — |
| 88 | **SortableList** | `Lists` | Bubbles | Drag-and-drop reorderable list with move controls and remove triggers. | 🟡 Medium (Wave 3) | — |
| 89 | **Transfer** | `Lists` | Ant Design | Dual-listbox for moving items between *"Available"* and *"Selected"* columns (used for permissions/roles). | 🔴 High (Wave 2) | — |
| 90 | **UserCards** | `Lists` | Bubbles | Grid of user profile cards with quick contact actions. | 🟡 Medium (Wave 3) | — |
| 91 | **UserDisplayItemList**| `Lists` | Bubbles | Scrollable list view of multiple UserDisplayItems. | 🟡 Medium (Wave 3) | — |
| 92 | **Kanban** | `Lists` | Bubbles | Interactive Kanban board with columns, card drag-and-drop, and filters. | 🟡 Medium (Wave 3) | — |
| 93 | **ActivityAccordion**| `Lists` | Bubbles | Collapsible activity log feed. | 🟡 Medium (Wave 3) | — |
| **Media** | | | | | | |
| 94 | **VideoPlayer** | `Media` | BayesStack | Enterprise SaaS video player with custom glassmorphic controls, PiP, playback speed, and keyboard shortcuts. | 🔴 High (Wave 3) | — |
| **Modals** | | | | | | |
| 95 | **Modal** | `Modals` | Bubbles | Dialog modal with backdrop blur, header, scrollable body, and action footer. | 🔴 High (Wave 1) | — |
| 96 | **ModalZoom** | `Modals` | Bubbles | Fullscreen media lightbox modal for viewing high-res images/documents. | 🟡 Medium (Wave 3) | — |
| 97 | **Tour** | `Modals` | Ant Design | Interactive step-by-step guided onboarding walkthrough popover anchored to UI elements. | 🟡 Medium (Wave 3) | — |
| **Notification & Overlay** | | | | | | |
| 98 | **Notification** | `Notification` | Bubbles | Toast notification card with dismiss timer and status icons. | 🔴 High (Wave 1) | — |
| 99 | **LoadingOverlay**| `LoadingOverlay`| Bubbles | Full-container or full-page blur loading overlay with spinner. | 🔴 High (Wave 1) | — |

---

## 🔍 3. Sign Off Verification Checklist Criteria

A component receives a **`✅ Passed`** Sign Off status only when it satisfies all of the following quality gates:

1. **Implementation Completeness**: Zero stubbed features or missing handlers.
2. **Prop & Type Parity**: Props are clean, fully typed in TypeScript, and consistent across variants.
3. **Storybook CSF3 Parade & Code Snippets**: Stories feature interactive Controls (`args`), clear usage examples, and working code copy snippets.
4. **Accessibility (WCAG 2.1 AA Compliance)**: Zero `a11y` violation flags in Storybook's automated accessibility audit panel (proper ARIA roles, valid labels, keyboard focus states, and high contrast text).

---

## 🏁 4. Next Steps for Development & Integration

1. **Next.js Integration**: Consume `@bayesstack/ui` primitives directly within BayesStack Next.js applications (`landing`, `learner`, `faculty`, `admin`) using native Next.js `layout.tsx` wrappers.
2. **Maintenance Protocol**:
   - Component logic maintained in TypeScript: `packages/ui/src/<tier>/<Group>/<ComponentName>.tsx`.
   - Matching design token CSS styles: `packages/ui/src/<tier>/<Group>/<ComponentName>.css`.
   - Interactive Storybook stories: `packages/ui/src/<tier>/<Group>/<ComponentName>.stories.tsx`.
