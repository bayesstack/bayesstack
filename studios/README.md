# Studios

Studios are self-contained learning environments mounted by the Learner application. Version one starts with Video and Coding only.

Studio frontends are React workspace packages, not independently deployed web apps. The Learner Next.js app transpiles and mounts them in its own route tree:

- Video activities mount `@bayesstack/studio-video` directly; no separate video process is required.
- Coding activities mount `@bayesstack/studio-coding` directly; code execution goes through `services/api` to the private `coding-judge` process on port `2358`.

Use the `learner-flow` startup profile for the complete learner experience. It starts Learner, API, the coding judge, authentication, and Nginx; it does not start separate studio frontend servers.
