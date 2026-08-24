# Infrastructure

This directory contains local runtime infrastructure only for now.

- `docker/next.Dockerfile` builds any of the four Next.js apps using the `APP_NAME` build argument.

The root `compose.yaml` is the single local Docker environment. Cloud infrastructure, databases, queues, and production deployment definitions will be added when the corresponding application features exist.
