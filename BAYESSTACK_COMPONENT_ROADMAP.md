# BayesStack Design Studio — Master Component Blueprint & 4-Tier Roadmap

> **Target Package**: `@bayesstack/ui` (BayesStack Enterprise Design System)  
> **Architecture Standard**: 4-Tier Atomic Design Architecture (**Atoms**, **Molecules**, **Organisms**, **Layouts & Templates**)  
> **Source Foundations**: Combined primitives from **Bubbles UI** + Enterprise Extensions from **Ant Design**

---

## 🏛️ 1. Architecture Overview

To ensure maximum modularity, scale, and maintainability across BayesStack applications (`landing`, `learner`, `faculty`, `admin`), all components in `@bayesstack/ui` strictly follow a **4-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   BAYESSTACK 4-TIER DESIGN ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚛️ TIER 1: ATOMS                                                            │
│ Single-purpose UI primitives: Typography, Buttons, Base Inputs, Badges,    │
│ Chips, Avatars, Loaders, Skeleton Placeholders, Dividers, and Boxes.       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🧪 TIER 2: MOLECULES                                                        │
│ Composite input groups & pickers: Dropdown, Selects, MultiSelects, Cascader,│
│ Date/Time Pickers, Alerts, Tooltips, Popovers, Popconfirm, Tabs, Mentions.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🧫 TIER 3: ORGANISMS                                                        │
│ Complex functional sections & data views: Enterprise Tables, Tree Views,    │
│ Dual-List Transfer, Metadata Descriptions, Modals, Drawers, Rich Editors.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📐 TIER 4: LAYOUTS & TEMPLATES                                              │
│ Page Containers, Page Headers, Resizable Splitters, Context Containers,     │
│ and Full Application Shells.                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 2. Master Component Inventory & Classification

---

### ⚛️ TIER 1: ATOMS (Foundational Single-Element Primitives)

Atoms are foundational UI elements that cannot be broken down further without losing their core purpose.

| # | Component | Primary Origin | Description & Capabilities | Target Priority | Status |
|---|---|---|---|---|---|
| 1 | **Text** | Bubbles | Core typography component supporting font weights, sizes, colors, and line clamps. | 🔴 High (Wave 1) | ✅ Completed |
| 2 | **Title** | Bubbles | Heading primitive (`H1`–`H6`) with standardized token margins and line heights. | 🔴 High (Wave 1) | ✅ Completed |
| 3 | **Paragraph** | Bubbles | Semantic paragraph text component optimized for longform content. | 🔴 High (Wave 1) | ✅ Completed |
| 4 | **Typing** | Bubbles | Typewriter text animation effect for empty states and AI assistant prompts. | 🟡 Medium (Wave 2) | ✅ Completed |
| 5 | **HtmlText** | Bubbles | Renders sanitized HTML strings with design token styling. | 🟡 Medium (Wave 2) | ✅ Completed |
| 5.5 | **Icon** | Hugeicons | Enterprise stroke icon primitive backed by Hugeicons free stroke set. | 🔴 High (Wave 1) | ✅ Completed |
| 6 | **Button** | Bubbles | Core action trigger supporting variants (`primary`, `secondary`, `tertiary`, `link`), sizes, loading states, and icons. | 🔴 High (Wave 1) | ✅ Completed |
| 7 | **IconButton** | Bubbles | Icon-only button with circular/square hit area and accessibility labels. | 🔴 High (Wave 1) | ✅ Completed |
| 8 | **ActionButton** | Bubbles | Compact action button for table rows, inline lists, or toolbars. | 🟡 Medium (Wave 2) | 🚫 Omitted (Covered by `IconButton`) |
| 10 | **ProSwitch** | Bubbles | Toggle switch with custom icon indicators. | 🟢 Low | 🚫 Omitted (Covered by `Switch`) |
| 11 | **TextInput** | Bubbles | Single-line text input with icon prefix, suffix, and error states. | 🔴 High (Wave 1) | ✅ Completed |
| 12 | **PasswordInput** | Bubbles | Secure password input with built-in show/hide toggle. | 🔴 High (Wave 1) | ✅ Completed |
| 13 | **NumberInput** | Bubbles | Numeric field with step buttons, bounds validation, and unit suffixes. | 🟡 Medium (Wave 2) | ✅ Completed |
| 14 | **SearchInput** | Bubbles | Search text input with magnifying glass icon and instant clear (`✕`) trigger. | 🔴 High (Wave 1) | ✅ Completed |
| 15 | **Textarea** | Bubbles | Multi-line text area with auto-grow and character count limiters. | 🔴 High (Wave 1) | ✅ Completed |
| 16 | **Checkbox** | Bubbles | Standard checkbox supporting checked, unchecked, and indeterminate states. | 🔴 High (Wave 1) | ✅ Completed |
| 17 | **Radio** | Bubbles | Single radio button option element. | 🔴 High (Wave 1) | ✅ Completed |
| 18 | **Switch** | Bubbles | Boolean toggle switch input (`true`/`false`). | 🔴 High (Wave 1) | ✅ Completed |
| 19 | **Slider** | Bubbles | Numerical range slider input with step tick marks. | 🟡 Medium (Wave 2) | ✅ Completed |
| 20 | **ColorInput** | Bubbles | Compact color swatch input with hex/rgb format popover. | 🟢 Low | ✅ Completed |
| 20.5 | **PinInput / OTPInput** | BayesStack | Verification code primitive with auto-advance, slot grouping, paste handling, and security masking. | 🔴 High (Wave 1) | ✅ Completed |
| 20.6 | **Autocomplete** | Bubbles | Suggestion text input with keyboard navigation, grouped options, custom renderers, debouncing, and instant clear trigger. | 🔴 High (Wave 1) | ✅ Completed |
| 20.7 | **TagsInput** | Bubbles | Inline tag creation text input with removable badges, suggestion autocomplete, and comma/enter handling. | 🔴 High (Wave 1) | ✅ Completed |
| 20.8 | **ScoreInput** | Bubbles | Interactive numeric/letter grade rating control supporting segmented boxes, star rating, and pills. | 🟡 Medium (Wave 2) | ✅ Completed |
| 20.9 | **BooleanInput** | Bubbles | Segmented button toggle and boxed selection control for boolean/choice states. | 🔴 High (Wave 1) | ✅ Completed |
| 21 | **InputLabel** | Bubbles | Form label primitive with optional/required asterisk (`*`) marker. | 🔴 High (Wave 1) | ✅ Completed |
| 22 | **InputDescription** | Bubbles | Helper text positioned beneath input labels. | 🔴 High (Wave 1) | ✅ Completed |
| 23 | **InputError** | Bubbles | Form error message banner/text styled in danger tokens. | 🔴 High (Wave 1) | ✅ Completed |
| 24 | **InputHelp** | Bubbles | Inline tooltip or helper note icon for form fields. | 🟡 Medium (Wave 2) | ✅ Completed |
| 26 | **Badge** | Bubbles | Status badge/pill supporting `success`, `warning`, `error`, `info` tokens. | 🔴 High (Wave 1) | ✅ Completed |
| 27 | **Chip** | Bubbles | Compact interactive filter chip or removable tag. | 🔴 High (Wave 1) | ✅ Completed |
| 28 | **Avatar** | Bubbles | User avatar displaying profile image, initials, or fallback icon. | 🔴 High (Wave 1) | ✅ Completed |
| 29 | **FileIcon** | Bubbles | Dynamic icon matching file extension (PDF, CSV, ZIP, PNG, MP4, etc.). | 🔴 High (Wave 1) | 🚫 Omitted (Skipped per user spec) |
| 30 | **InlineSvg** | Bubbles | SVG asset renderer with color token inheritance. | 🟢 Low | 🚫 Omitted (Skipped per user spec) |
| 31 | **Logo** | Bubbles | Brand logo container with responsive sizing. | 🔴 High (Wave 1) | ✅ Completed |
| 33 | **Loader** | Bubbles | Animated spinner/loader dots or rings. | 🔴 High (Wave 1) | ✅ Completed |
| 33.5 | **LoadingBar** | BayesStack | Linear progress bar (determinate/indeterminate) for route transitions and async operations. | 🔴 High (Wave 1) | ✅ Completed |
| 34 | **Skeleton** | **Ant Design** ⭐ | Pulsing wireframe placeholder matching card, table, or text shapes during data loading. | 🔴 High (Wave 1) | ✅ Completed |
| 35 | **Box** | Bubbles | Base block container supporting padding, margin, and background tokens. | 🔴 High (Wave 1) | ✅ Completed |
| 36 | **Divider** | Bubbles | Horizontal or vertical divider line with optional centered label. | 🔴 High (Wave 1) | ✅ Completed |
| 37 | **Paper** | Bubbles | Card surface panel with elevation shadows and border radius. | 🔴 High (Wave 1) | ✅ Completed |
| 38 | **Stack** | Bubbles | Flexbox layout primitive for vertical/horizontal spacing of children. | 🔴 High (Wave 1) | ✅ Completed |
| 38.5 | **FileItem** | Bubbles | File preview badge item displaying extension icon, name, file size, thumbnail preview, and download handler. | 🔴 High (Wave 1) | ✅ Completed |
| 38.6 | **CountDown** | Bubbles | Live countdown timer primitive supporting HH:MM:SS format, icon badge, warning/danger alerts, and completion callback. | 🔴 High (Wave 1) | ✅ Completed |
| 38.7 | **ChatMessage** | Bubbles | Chat bubble component displaying sender avatar, name, text content, image attachments, and timestamps for chat UI. | 🔴 High (Wave 1) | ✅ Completed |



---

### 🧪 TIER 2: MOLECULES (Composite Controls, Pickers & Popovers)

Molecules combine two or more Atoms into cohesive functional controls.

| # | Component | Primary Origin | Description & Capabilities | Target Priority | Status |
|---|---|---|---|---|---|
| 40 | **Dropdown** | Ant Design / Bubbles | Enterprise floating menu supporting nested submenus, pointer arrows, selectable checkmarks, shortcuts, and placements. | 🟡 Medium (Wave 2) | ✅ Completed |
| 41 | **InputWrapper** | Bubbles | Outer layout wrapper combining Label, Input, Description, and Error atoms. | 🔴 High (Wave 1) | 🚫 Omitted (Form controls use direct label/helper field structure) |
| 42 | **Alert** | Bubbles | Notification banner combining Icon, Title/Text, and close trigger. | 🔴 High (Wave 1) | ✅ Completed |
| 43 | **RadioGroup** | Bubbles | Manages selection state and keyboard navigation across multiple Radio inputs. | 🔴 High (Wave 1) | ✅ Completed |
| 44 | **CheckboxGroup** | Bubbles | Multi-select checkbox container group. | 🔴 High (Wave 1) | ✅ Completed |
| 45 | **ColorPicker** | Bubbles | Color canvas selection popover with hex/hsl inputs and swatch presets. | 🟢 Low | 🚫 Omitted (Color picker popover omitted from roadmap scope) |
| 46 | **Select** | Bubbles | Custom single dropdown select with search filtering and clearable values. | 🔴 High (Wave 1) | ✅ Completed |
| 47 | **MultiSelect** | Bubbles | Dropdown select for picking multiple tags or values. | 🔴 High (Wave 1) | ✅ Completed |
| 48 | **Autocomplete** | Bubbles | Text input with dynamic search suggestion list. | 🔴 High (Wave 1) | 🔄 Moved to Atoms (Tier 1 Inputs) |
| 49 | **AutocompleteBadge**| Bubbles | Autocomplete field displaying selected values as removable badges. | 🟡 Medium (Wave 2) | 🚫 Omitted (Covered by `Autocomplete` custom item renderer) |
| 50 | **AutocompleteUser** | Bubbles | User search autocomplete with avatar cards and emails. | 🔴 High (Wave 2) | 🚫 Omitted (Covered by `Autocomplete` custom item renderer) |
| 51 | **Cascader** | **Ant Design** ⭐ | Multi-stage cascading selection dropdown (*Country > State > City*, *Org > Team*). | 🔴 High (Wave 2) | ✅ Completed |
| 52 | **TreeSelect** | **Ant Design** ⭐ | Select dropdown containing an expandable tree view for nested category picking. | 🔴 High (Wave 2) | ✅ Completed |
| 53 | **Mentions** | **Ant Design** ⭐ | Autocomplete trigger for `@user` or `#tag` insertion inside text fields/textareas. | 🟡 Medium (Wave 2) | ✅ Completed |
| 54 | **BooleanInput** | Bubbles | Segmented toggle control button for True/False choices. | 🔴 High (Wave 1) | 🔄 Moved to Atoms (Tier 1 Inputs) |
| 55 | **DatePicker** | Bubbles | Single/range date picker input with popup calendar. | 🔴 High (Wave 2) | ✅ Completed |
| 56 | **TimeInput** | Bubbles | Time selector supporting 12h/24h formats and minute steps. | 🟡 Medium (Wave 2) | ✅ Completed |
| 57 | **Calendar** | Bubbles | Interactive month calendar view displaying events and selected dates. | 🟡 Medium (Wave 3) | ✅ Completed |
| 58 | **ListInput** | Bubbles | Dynamic list field allowing users to add/remove/reorder text items. | 🟡 Medium (Wave 2) | ✅ Completed |
| 59 | **TableInput** | Bubbles | Inline key-value matrix input. | 🟡 Medium (Wave 3) | ✅ Completed |
| 60 | **TagsInput** | Bubbles | Tag input field supporting tag creation via Enter/Comma. | 🔴 High (Wave 2) | 🔄 Moved to Atoms (Tier 1 Inputs) |
| 61 | **FileUpload** | Bubbles | Drag-and-drop file upload zone with file validation and progress indicator. | 🔴 High (Wave 2) | ✅ Completed |
| 62 | **ImagePreviewInput**| Bubbles | Image file input with thumbnail preview and removal button. | 🟡 Medium (Wave 2) | ✅ Completed |
| 63 | **ImageProfilePicker**| Bubbles | Profile avatar uploader with image cropping overlay. | 🟡 Medium (Wave 3) | ✅ Completed |
| 64 | **ScoreInput** | Bubbles | Rating/Score input with custom numeric scales. | 🟢 Low | 🔄 Moved to Atoms (Tier 1 Inputs) |
| 65 | **Breadcrumbs** | Bubbles | Link navigation path with custom separator icons. | 🔴 High (Wave 1) | ✅ Completed |
| 66 | **Tabs** | Bubbles | Navigation tab bar supporting underline, pill, and icon styles. | 🔴 High (Wave 1) | ✅ Completed |
| 67 | **Anchor** | Bubbles | Anchor link component with smooth scroll and active section indicator. | 🔴 High (Wave 2) | 🚫 Skipped |
| 68 | **Pager** | Bubbles | Pagination control bar with page size selection and direct jump. | 🔴 High (Wave 2) | ✅ Completed |
| 69 | **Stepper** | Bubbles | Horizontal/Vertical step indicator for multi-page forms or wizard flows. | 🔴 High (Wave 2) | ✅ Completed |
| 70 | **ProgressRing** | Bubbles | Radial circular progress indicator with percentage label. | 🟡 Medium (Wave 2) | ✅ Completed |
| 71 | **ProgressColorBar**| Bubbles | Linear progress bar with multi-colored threshold segments. | 🟡 Medium (Wave 2) | 🚫 Skipped |
| 72 | **ProgressBottomBar**| Bubbles | Sticky page scroll progress line. | 🟢 Low | 🚫 Skipped |
| 73 | **AvatarsGroup** | Bubbles | Stacked overlapping avatar list displaying collaborator count. | 🔴 High (Wave 2) | ✅ Completed |
| 74 | **UserDisplayItem** | Bubbles | User row item combining Avatar, Name, Role, and Status Badge. | 🔴 High (Wave 1) | 🚫 Skipped |
| 75 | **ChipsContainer** | Bubbles | Flex container for grouping and wrapping Chip filters. | 🟡 Medium (Wave 2) | 🚫 Skipped |
| 76 | **FileItemDisplay** | Bubbles | File row display showing FileIcon, File Name, Size, and Actions. | 🔴 High (Wave 2) | ✅ Completed |
| 77 | **Tooltip** | Bubbles | Floating hover hint for controls and truncated text. | 🔴 High (Wave 1) | ✅ Completed |
| 78 | **Popover** | Bubbles | Anchored floating card triggerable by click or focus. | 🔴 High (Wave 1) | ✅ Completed |
| 79 | **Popconfirm** | **Ant Design** ⭐ | Lightweight confirmation popover attached to action buttons (*"Delete row? [Yes] [No]"*). | 🔴 High (Wave 1) | ✅ Completed |
| 80 | **ContextHelp** | Bubbles | Help icon trigger opening a contextual documentation popover. | 🟡 Medium (Wave 2) | 🚫 Skipped |

---

### 🧫 TIER 3: ORGANISMS (Complex Modules, Data Views & Editors)

Organisms combine Molecules and Atoms into complete, self-contained interactive sections.

| # | Component | Primary Origin | Description & Capabilities | Target Priority | Status |
|---|---|---|---|---|---|
| 81 | **Table** | Bubbles | Enterprise data table supporting column sorting, filtering, row selection, sticky header, and pagination. | 🔴 High (Wave 2) | ✅ Completed |
| 82 | **PaginatedList** | Bubbles | Data list view supporting Table and Grid layouts coupled with Pager toolbar. | 🔴 High (Wave 2) | ✅ Completed |
| 83 | **SortableList** | Bubbles | Drag-and-drop reorderable list with move controls and remove triggers. | 🟡 Medium (Wave 3) | ✅ Completed |
| 84 | **Tree** | Bubbles | Hierarchical tree view with node expansion, selection, and guide lines. | 🔴 High (Wave 2) | ✅ Completed |
| 85 | **Transfer** | **Ant Design** ⭐ | Dual-listbox for moving items between *"Available"* and *"Selected"* columns (used for permissions/roles). | 🔴 High (Wave 2) | ✅ Completed |
| 86 | **Descriptions**| **Ant Design** ⭐ | Key-value detail grid with aligned labels and values for inspecting entity metadata. | 🔴 High (Wave 2) | ✅ Completed |
| 87 | **Spotlight** | Bubbles | Global command palette (`Cmd + K`) search modal with fuzzy matching. | 🔴 High (Wave 2) | ✅ Completed |
| 88 | **HorizontalTimeline**| Bubbles | Chronological event timeline view. | 🟡 Medium (Wave 3) | ✅ Completed |
| 89 | **UserCards** | Bubbles | Grid of user profile cards with quick contact actions. | 🟡 Medium (Wave 3) | ✅ Completed |
| 90 | **UserDisplayItemList**| Bubbles | Scrollable list view of multiple UserDisplayItems. | 🟡 Medium (Wave 3) | ✅ Completed |
| 91 | **Kanban** | Bubbles | Interactive Kanban board with columns, card drag-and-drop, and filters. | 🟡 Medium (Wave 3) | ✅ Completed |
| 92 | **ActivityAccordion**| Bubbles | Collapsible activity log feed. | 🟡 Medium (Wave 3) | ✅ Completed |
| 93 | **Tour** | **Ant Design** ⭐ | Interactive step-by-step guided onboarding walkthrough popover anchored to UI elements. | 🟡 Medium (Wave 3) | ✅ Completed |
| 94 | **Modal** | Bubbles | Dialog modal with backdrop blur, header, scrollable body, and action footer. | 🔴 High (Wave 1) | ✅ Completed |
| 95 | **ModalZoom** | Bubbles | Fullscreen media lightbox modal for viewing high-res images/documents. | 🟡 Medium (Wave 3) | ✅ Completed |
| 96 | **Drawer** | Bubbles | Slide-over drawer panel (left/right/top/bottom) for filters, forms, or side details. | 🔴 High (Wave 1) | ✅ Completed |
| 97 | **BaseDrawer** | Bubbles | Low-level primitive container for side drawers. | 🟢 Low | ✅ Completed |
| 98 | **DrawerPush** | Bubbles | Side drawer that pushes content stage rather than overlaying. | 🟢 Low | ✅ Completed |
| 99 | **DetailPanel** | Bubbles | Slide-in drawer specialized for inspecting entity details and metadata. | 🔴 High (Wave 2) | ✅ Completed |
| 100| **EditPanel** | Bubbles | Slide-in side form editor panel for quick entity editing without page navigation. | 🔴 High (Wave 2) | ✅ Completed |
| 101| **LoadingOverlay** | Bubbles | Full-container or full-page blur loading overlay with spinner. | 🔴 High (Wave 1) | ✅ Completed |
| 102| **TextEditor** | Bubbles | Rich text WYSIWYG editor powered by Tiptap / ProseMirror with custom formatting toolbar. | 🔴 High (Wave 3) | ✅ Completed |
| 103| **ContentEditorInput**| Bubbles | Form-ready rich content editor wrapped with label and validation handlers. | 🔴 High (Wave 3) | ✅ Completed |
| 104| **Toolbar** | Bubbles | Formatting toolbar for rich text editors and canvas tools. | 🔴 High (Wave 3) | ✅ Completed |
| 105| **BubbleMenu** | Bubbles | Floating text-selection menu for quick bold/italic/link formatting. | 🟡 Medium (Wave 3) | ✅ Completed |
| 106| **CodeBlockComponent**| Bubbles | Syntax-highlighted code block component inside rich text documents. | 🔴 High (Wave 3) | ✅ Completed |
| 107| **LinkModal** | Bubbles | Modal dialog for inserting and editing URLs and link labels. | 🟡 Medium (Wave 3) | ✅ Completed |
| 108| **SchemaNav** | Bubbles | Document outline tree navigation generated from heading tags. | 🟡 Medium (Wave 3) | ✅ Completed |
| 109| **Editor Tools** | Bubbles | Formatting modules: `BoldTool`, `ItalicTool`, `UnderlineTool`, `StrikeTool`, `HeadingsTool`, `BlockquoteTool`, `CodeTool`, `Tool`, `TextAlignTool`, `ColorTool`, `ImageTool`, `LinkTool`, `VideoTool`, `EmbedTool`. | 🔴 High (Wave 3) | ✅ Completed |
| 110| **Notification** | Bubbles | Toast notification card with dismiss timer and status icons. | 🔴 High (Wave 1) | ✅ Completed |
| 110b| **VideoPlayer** | Bubbles | Enterprise SaaS video player with custom glassmorphic controls, PiP, playback speed, and keyboard shortcuts. | 🔴 High (Wave 3) | ✅ Completed |

*Note: Context providers (`ModalsProvider`, `NotificationProvider`) manage modal and toast imperative APIs and ship alongside `Modal` and `Notification`.*

---

### 📐 TIER 4: LAYOUTS & TEMPLATES (Structural Containers & App Shells)

Structural frameworks, resizable splitters, and application page containers.

| # | Component | Primary Origin | Description & Capabilities | Target Priority | Status |
|---|---|---|---|---|---|
| 111| **PageContainer** | Bubbles | Main page layout wrapper enforcing responsive padding and max-width bounds. | 🔴 High (Wave 1) | ⏳ Pending |
| 112| **PageHeader** | Bubbles | Standard page title header with breadcrumbs, action button group, and tab bar. | 🔴 High (Wave 1) | ⏳ Pending |
| 113| **TotalLayout** | Bubbles | Full-screen app layout shell with primary topbar, sidebar navigation, and main content stage. | 🔴 High (Wave 1) | ⏳ Pending |
| 114| **TLayout** | Bubbles | T-shaped split-screen layout shell (Header + Left Navigation + Content Stage). | 🟡 Medium (Wave 2) | ⏳ Pending |
| 115| **ContextContainer**| Bubbles | Form section card container grouping input controls with title and description. | 🔴 High (Wave 1) | ⏳ Pending |
| 116| **Splitter** | **Ant Design** ⭐ | Resizable, draggable pane splitter for multi-pane dashboards and workspace IDE views. | 🔴 High (Wave 2) | ⏳ Pending |
| 117| **HorizontalStepperContainer**| Bubbles | Page container binding horizontal Stepper to form step pages. | 🟡 Medium (Wave 2) | ⏳ Pending |
| 118| **VerticalStepperContainer**| Bubbles | Page container binding vertical Stepper side-by-side with step forms. | 🟡 Medium (Wave 2) | ⏳ Pending |
| 119| **ContentLegible** | Bubbles | Max-width text container optimized for comfortable reading line length. | 🟢 Low | ⏳ Pending |

---

## 🌊 3. BayesStack UI Build Roadmap (4 Execution Waves)

To systematically build out `@bayesstack/ui` in Storybook, we will execute the components across **4 planned waves**:

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                       BAYESSTACK 4-WAVE BUILD ROADMAP                   │
 ├─────────────────────────────────────────────────────────────────────────┤
 │ 🌊 WAVE 1: CORE PRIMITIVES (ATOMS + BASE LAYOUTS)                       │
 │ • Atoms: Text, Title, Paragraph, Button, IconButton, Icon, TextInput,   │
 │   PasswordInput, SearchInput, Autocomplete (✅), Checkbox, Radio,       │
 │   Switch, Badge, Chip, Avatar, Loader, Skeleton, Box, Stack, Divider,   │
 │   Paper                                                                 │
 │ • Molecules: Dropdown (✅), Alert (✅), Select, MultiSelect,         │
 │   RadioGroup, CheckboxGroup, Tabs, Breadcrumbs, Tooltip, Popover,       │
 │   Popconfirm                                                            │
 │ • Organisms & Layout: Modal, Drawer, LoadingOverlay, Notification,      │
 │   PageContainer, PageHeader, ContextContainer                           │
 ├─────────────────────────────────────────────────────────────────────────┤
 │ 🌊 WAVE 2: ADVANCED CONTROLS & ENTERPRISE PANELS                        │
 │ • Molecules: DatePicker, TimeInput, TagsInput, FileUpload, Cascader,    │
 │   TreeSelect, AutocompleteUser, Mentions, Pager, Stepper, AvatarsGroup  │
 │ • Organisms & Layout: Table, PaginatedList, Tree, Transfer,             │
 │   Descriptions, DetailPanel, EditPanel, Spotlight (Cmd+K), Splitter     │
 ├─────────────────────────────────────────────────────────────────────────┤
 │ 🌊 WAVE 3: RICH EDITORS, DATA MODULES & ONBOARDING                    │
 │ • Organisms: TextEditor (Tiptap), ContentEditorInput, Toolbar,          │
 │   CodeBlockComponent, Kanban, SortableList, Tour, UserCards             │
 ├─────────────────────────────────────────────────────────────────────────┤
 │ 🌊 WAVE 4: SPECIALIZED WORKSPACE UTILITIES & POLISH                     │
 │ • ImageProfilePicker, ScoreInput, Calendar, ProgressRing, TLayout,      │
 │   StepperContainers, ContentLegible                                     │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏁 4. Next Steps for Development

1. **Component Selection**: Pick the next component from Wave 1 to implement or enhance in `packages/ui/src/`.
2. **Implementation Protocol**:
   - Component logic written in TypeScript in `packages/ui/src/<tier>/<ComponentName>.tsx`.
   - Matching CSS module / token styles in `packages/ui/src/<tier>/<ComponentName>.css`.
   - Interactive Storybook stories created in `packages/ui/src/<tier>/<ComponentName>.stories.tsx`.
