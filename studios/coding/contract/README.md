# Coding Studio contract

Contract version: `2026-09-07`.

Coding activity descriptors identify a platform-owned `problem_id`; they may contain prompt, starter code, and display metadata. They must not be treated as authority for limits or hidden test cases.

```json
{
  "activity_type": "coding",
  "config": {
    "problem_id": "knapsack-01",
    "default_language": "python",
    "allowed_languages": ["python", "cpp", "javascript"]
  }
}
```

The Studio retrieves visible samples from `GET /api/v1/coding/problems/{problem_id}` and sends source/language only to the platform API. It never receives a Piston address or sends expected output for a full submission.

Verdicts are `accepted`, `wrong_answer`, `compilation_error`, `runtime_error`, `time_limit_exceeded`, `memory_limit_exceeded`, `output_limit_exceeded`, and `system_error`. Durable states are `queued`, `running`, `completed`, and `failed`; `failed + system_error` is distinct from a completed programming verdict.
