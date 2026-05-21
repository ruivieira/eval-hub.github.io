---
title: "Tool Reference"
---

The EvalHub MCP server exposes three tools for managing evaluation jobs.

## submit_evaluation

Submit a new model evaluation job.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Job name |
| `description` | string | No | Job description |
| `tags` | string[] | No | Tags for the job |
| `model` | object | Yes | Model configuration (see below) |
| `benchmarks` | object[] | No | List of benchmarks to run (mutually exclusive with `collection`) |
| `collection` | object | No | Pre-defined benchmark collection (mutually exclusive with `benchmarks`) |
| `experiment` | object | No | MLflow experiment configuration |

**`model` object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Model inference endpoint URL |
| `name` | string | Yes | Model display name |
| `auth_secret` | string | No | Kubernetes Secret reference for model endpoint authentication |

**`benchmarks` array items:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Benchmark identifier |
| `provider_id` | string | Yes | Provider that runs this benchmark |

**`collection` object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Collection identifier |

**`experiment` object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | MLflow experiment name |
| `tags` | object | No | Key-value tags for the experiment |
| `artifact_location` | string | No | MLflow artifacts storage path |

### Example request

```json
{
  "name": "gpt-4o-leaderboard",
  "description": "Leaderboard evaluation of GPT-4o",
  "model": {
    "url": "https://api.openai.com/v1",
    "name": "gpt-4o"
  },
  "collection": {
    "id": "leaderboard-v2"
  },
  "experiment": {
    "name": "gpt-4o-may-2026"
  }
}
```

### Example response

```json
{
  "job_id": "job-a1b2c3d4",
  "state": "pending"
}
```

### Notes

- You must provide either `benchmarks` or `collection`, not both.
- If `benchmarks` is provided, it must not be empty.
- Use `get_job_status` to monitor the submitted job.

---

## cancel_job

Cancel a running or pending evaluation job.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | string | Yes | The job identifier to cancel |

### Example request

```json
{
  "job_id": "job-a1b2c3d4"
}
```

### Example response

```json
{
  "job_id": "job-a1b2c3d4",
  "message": "Job cancelled successfully"
}
```

### Notes

- Cancellation stops running benchmarks and marks them as cancelled.
- Use `get_job_status` to verify the final state after cancellation.

---

## get_job_status

Get the current status of an evaluation job with progress and per-benchmark details.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | string | Yes | The job identifier to check |

### Example request

```json
{
  "job_id": "job-a1b2c3d4"
}
```

### Example response

```json
{
  "job_id": "job-a1b2c3d4",
  "state": "running",
  "progress_percent": 50,
  "benchmarks": [
    {
      "id": "mmlu",
      "provider_id": "lm-evaluation-harness",
      "status": "completed",
      "started_at": "2026-05-21T10:00:00Z",
      "completed_at": "2026-05-21T10:15:00Z"
    },
    {
      "id": "hellaswag",
      "provider_id": "lm-evaluation-harness",
      "status": "running",
      "started_at": "2026-05-21T10:15:00Z"
    }
  ],
  "created_at": "2026-05-21T09:59:00Z",
  "started_at": "2026-05-21T10:00:00Z"
}
```

### Job states

| State | Description |
|-------|-------------|
| `pending` | Job is queued and waiting to start |
| `running` | One or more benchmarks are executing |
| `completed` | All benchmarks finished successfully |
| `failed` | One or more benchmarks failed |
| `cancelled` | Job was cancelled by the user |
| `partially_failed` | Some benchmarks completed, others failed |

### Notes

- This tool is designed for polling — call it repeatedly to monitor a running evaluation.
- `progress_percent` ranges from 0 to 100.
- Each benchmark entry includes individual timestamps when available.
