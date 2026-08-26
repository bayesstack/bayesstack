# BayesStack UI

The shared UI library for every BayesStack application and studio frontend.

## Component taxonomy

Components are organized by composition level:

- `src/atoms` — the smallest reusable building blocks
- `src/molecules` — focused combinations of atoms
- `src/organisms` — complete, reusable interface sections and workflows

Each component should live with its implementation, tests, and Storybook stories. The
package's public exports belong in `src/index.ts`, so consuming apps never import from
component internals.

## UI catalog

Run the local Storybook from the monorepo root:

```bash
pnpm --filter @bayesstack/ui dev
```

Then open [http://localhost:6001](http://localhost:6001). The sidebar is intentionally
ordered as `Atoms`, `Molecules`, and `Organisms`; the first story in each section is an
empty shelf until the first real component is added.

## Component documentation

Every component story automatically has a **Docs** tab alongside **Canvas**. The Docs
tab renders the primary example, its generated usage code, and the component's controls
and prop API. The Canvas code panel is also enabled, so an example can be copied without
leaving the interactive story.

To add an explanation for a component, document it in the story metadata. Describe
individual props in `argTypes`; Storybook will include both in the Docs tab.

```tsx
const meta: Meta<typeof Button> = {
  title: "Atoms/Buttons/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: "Use Button to trigger a user action.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "Controls the button's visual emphasis.",
    },
  },
};
```
