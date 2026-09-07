# Coding Studio Judge

The Coding Studio has two service boundaries:

```text
Browser -> Platform API -> Coding Judge -> Piston (private network)
                    |          |
                    |          +-- ExecutionProvider port
                    +-- PostgreSQL: problems, test cases, submissions, results
```

The platform API owns problem limits, private test cases, durable submission state, and result retrieval. The judge owns validation, orchestration, output comparison, verdict aggregation, and provider normalization. Piston owns compilation and sandboxed execution of hostile code. No code is ever executed by the platform API or judge process itself.

## Providers

`EXECUTION_PROVIDER=mock` is the default. `MockExecutionProvider` never interprets submitted code; it is deterministic and makes ordinary local development safe.

Set `EXECUTION_PROVIDER=piston` only when Piston is available. `PistonExecutionProvider` is the sole place Piston's HTTP request/response format appears. A future Judge0 provider implements the same `ExecutionProvider` port without changing the judge, platform API, or studio.

The allowlist is Python, C++, and JavaScript. Runtime versions are configured with `PISTON_RUNTIME_PYTHON`, `PISTON_RUNTIME_CPP`, and `PISTON_RUNTIME_JAVASCRIPT`; Piston's full runtime list is never exposed to end users.

## APIs

The judge API is internal:

- `POST /api/v1/judge/evaluate` — evaluates a private set of test cases.
- `POST /api/v1/judge/run` — executes one custom input.
- `GET /api/v1/languages`, `GET /health`.

When `JUDGE_SERVICE_TOKEN` is set, the two execution routes require the matching `X-Judge-Service-Token`. The browser calls the platform API instead:

- `GET /api/v1/coding/problems/{id}` — public problem metadata and sample cases only.
- `POST /api/v1/coding/problems/{id}/runs` — run sample cases.
- `POST /api/v1/coding/problems/{id}/custom-run` — custom stdin.
- `POST /api/v1/coding/submissions` and `GET /api/v1/coding/submissions/{id}` — durable full-suite submission and status.

`coding_problems`, `coding_test_cases`, `coding_submissions`, and `coding_submission_case_results` are added by Alembic revision `0013_coding_studio_judging`. The frontend cannot submit test cases or limits: the platform fetches both from its database. Hidden-case output is omitted from submission responses.

## Limits and comparison

The current model applies time and memory limits **per test case**, the conventional online-judge model. This is explicit: the judge sends the same bounded server-side limits for each case and does not silently allow arbitrary client limits. Compilation failures stop immediately; callers may choose early stopping for other failures.

The default `WhitespaceInsensitiveComparator` compares output tokens. Add `ExactComparator`, floating-point comparison, or a custom checker behind `OutputComparator`, then select it through a problem's `comparison_mode` in a later migration.

## Development

Normal local development does not require Piston:

```bash
cd services/api && ./.venv/bin/alembic upgrade head
cd studios/coding/backend
./.venv/bin/pytest -q
# or: PYTHONPATH=src .venv/bin/uvicorn main:app --port 2358 --reload
```

For Docker Studio development, `coding-judge` starts in mock mode with the `super-flow`/`core` startup profiles. Enable real execution with the optional Piston profile:

```bash
EXECUTION_PROVIDER=piston docker compose --profile execution up --build api coding-judge piston super
```

Piston's optional development port is bound to `127.0.0.1` only; the judge uses the Compose `judge_internal` network. Piston starts with no application runtimes, so install the three configured runtimes with the upstream Piston CLI before enabling `EXECUTION_PROVIDER=piston`, then confirm them with `GET http://127.0.0.1:2000/api/v2/runtimes`. Set `PISTON_RUNTIME_PYTHON`, `PISTON_RUNTIME_CPP`, and `PISTON_RUNTIME_JAVASCRIPT` to those exact installed versions. Production should remove the loopback port mapping entirely. The service image is pinned by immutable digest; update it deliberately after checking the upstream package digest and installed runtimes.

## Production security checklist

- Keep Piston private; do not restore an Nginx `/judge` public proxy.
- Use a non-empty `JUDGE_SERVICE_TOKEN` (ideally injected from a secret manager) between API and judge.
- Piston requires privileged/container isolation in its reference setup. Run it on dedicated worker nodes with no application source mounts, Docker socket, database credentials, or application secrets.
- The platform API requires an authenticated session for execution/submission and a SuperAdmin session for problem authoring. Keep the existing JWT secret and cookie `secure=True` in production, and add institution/faculty authoring rules before delegating problem management below SuperAdmin.
- Configure Piston's own output/process/network restrictions and monitor provider availability. App-level request/output bounds complement, but do not replace, sandbox policy.
- Move `process_submission(submission_id)` to a durable worker/queue when deployment needs cross-process retry and horizontal workers; the persistent `queued -> running -> completed|failed` lifecycle is already the worker boundary.
