/**
 * Public entrypoint for the shared BayesStack UI library.
 *
 * Components will be exported here as they are created. Keeping the entrypoint
 * stable means apps and studios never need to reach into component internals.
 */
export { Button } from "./atoms/Buttons/Button";
export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./atoms/Buttons/Button";
