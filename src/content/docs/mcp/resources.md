---
title: "Resource Reference"
---

MCP resources provide read-only access to EvalHub data using the `evalhub://` URI scheme. All resources return JSON.

## Providers

### List all providers

**URI:** `evalhub://providers`

Returns all registered evaluation providers.

```json
[
  {
    "resource": {
      "id": "garak",
      "created_at": "2026-05-01T12:00:00Z",
      "updated_at": "2026-05-10T08:30:00Z"
    },
    "name": "garak",
    "title": "Garak",
    "description": "LLM vulnerability scanner and red-teaming framework",
    "agent": {
      "evaluates": ["safety", "security", "red_teaming", "toxicity"],
      "target_type": "model",
      "summary": "Red-team an LLM for safety vulnerabilities, toxicity, and OWASP risks",
      "complements": ["lm_evaluation_harness", "guidellm"],
      "hints": [
        "The model endpoint must support OpenAI-compatible chat completions"
      ],
      "result_interpretation": [
        "attack_success_rate measures how often the model was successfully exploited",
        "LOWER is better -- 0.0 means no attacks succeeded"
      ]
    }
  },
  {
    "resource": {
      "id": "guidellm",
      "created_at": "2026-05-01T12:00:00Z",
      "updated_at": "2026-05-10T08:30:00Z"
    },
    "name": "guidellm",
    "title": "GuideLLM",
    "description": "Performance and latency benchmarking",
    "agent": {
      "evaluates": ["performance", "throughput", "latency"],
      "target_type": "inference_server",
      "summary": "Benchmark LLM inference server throughput, latency, and scalability"
    }
  }
]
```

:::note
Each provider is a `ProviderResource` object. The `resource` field contains the provider ID and timestamps. The `name` field is the internal identifier (slug), while `title` is the human-readable display name.
:::

:::note
The `agent` block is optional. Providers without agent metadata omit the field. See [Agent Discoverability](/mcp/agent-discoverability/) for field definitions.
:::

### Get a provider by ID

**URI:** `evalhub://providers/{id}`

**Example:** `evalhub://providers/garak`

Returns details for a single provider including its available benchmarks and optional `agent` metadata.

---

## Benchmarks

### List all benchmarks

**URI:** `evalhub://benchmarks`

Returns all benchmarks across all providers.

### Get a benchmark by ID

**URI:** `evalhub://benchmarks/{id}`

**Example:** `evalhub://benchmarks/mmlu`

Returns details for a single benchmark including its provider, description, and configuration.

### Filter benchmarks by label

**URI:** `evalhub://benchmarks?label={tag}`

Filter benchmarks by tag. The `label` parameter can be repeated for AND-style filtering — all specified labels must match.

**Examples:**

- `evalhub://benchmarks?label=safety` — benchmarks tagged "safety"
- `evalhub://benchmarks?label=rag&label=reasoning` — benchmarks tagged both "rag" and "reasoning"

---

## Collections

### List all collections

**URI:** `evalhub://collections`

Returns all pre-defined benchmark collections.

```json
[
  {
    "resource": {
      "id": "safety-and-fairness-v1",
      "created_at": "2026-05-01T12:00:00Z",
      "updated_at": "2026-05-10T08:30:00Z"
    },
    "name": "Safety and Fairness v1",
    "description": "Safety and bias evaluation benchmarks",
    "category": "safety",
    "agent": {
      "evaluates": ["safety", "fairness", "bias", "toxicity", "ethics", "truthfulness"],
      "summary": "Comprehensive safety and fairness suite covering toxicity, bias, truthfulness, and ethics",
      "complements": ["garak", "toxicity-and-ethical-principles"],
      "hints": [
        "Runs 6 benchmarks across truthfulness, toxicity, gender bias, social bias, and ethics",
        "Overall pass threshold is 0.758"
      ],
      "result_interpretation": [
        "Aggregate score is a weighted average across all benchmarks, higher is better"
      ]
    }
  },
  {
    "resource": {
      "id": "leaderboard-v2",
      "created_at": "2026-05-01T12:00:00Z",
      "updated_at": "2026-05-10T08:30:00Z"
    },
    "name": "Leaderboard v2",
    "description": "Standard leaderboard benchmarks",
    "category": "general"
  }
]
```

:::note
Each collection is a `CollectionResource` object. The `resource` field contains the collection ID and timestamps.
:::

### Get a collection by ID

**URI:** `evalhub://collections/{id}`

**Example:** `evalhub://collections/leaderboard-v2`

Returns the collection with its full benchmark list and configuration.

---

## Jobs

### List all jobs

**URI:** `evalhub://jobs`

Returns all evaluation jobs. Supports pagination.

**Query parameters:**

| Parameter | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| `limit`   | integer | Maximum items to return (1–2000, default 100) |
| `offset`  | integer | Number of items to skip                       |

**Example:** `evalhub://jobs?limit=20&offset=0`

### Filter jobs by status

**URI:** `evalhub://jobs?status={status}`

| Status             | Description                              |
| ------------------ | ---------------------------------------- |
| `pending`          | Queued, waiting to start                 |
| `running`          | Currently executing                      |
| `completed`        | All benchmarks finished                  |
| `failed`           | One or more benchmarks failed            |
| `cancelled`        | Cancelled by user                        |
| `partially_failed` | Some benchmarks succeeded, others failed |

**Examples:**

- `evalhub://jobs?status=running` — all currently running jobs
- `evalhub://jobs?status=completed&limit=10` — last 10 completed jobs

### Get a job by ID

**URI:** `evalhub://jobs/{id}`

**Example:** `evalhub://jobs/job-a1b2c3d4`

Returns full job details including state, progress, per-benchmark status, and timestamps.

---

## Server metadata

### Server version

**URI:** `evalhub://server/version`

Returns server version and build information.

```json
{
  "version": "0.4.0",
  "git_hash": "d2c6d42",
  "build_date": "2026-05-20T12:00:00Z",
  "go_version": "go1.25.9",
  "os": "linux",
  "arch": "amd64",
  "mcp_library": "github.com/modelcontextprotocol/go-sdk",
  "mcp_library_version": "0.2.0"
}
```

---

## Autocompletion

The MCP server provides autocompletion for resource URI parameters. MCP clients that support completions will suggest valid IDs when you type resource URIs:

- **Provider IDs** — when typing `evalhub://providers/{id}`
- **Benchmark IDs** — when typing `evalhub://benchmarks/{id}`
- **Collection IDs** — when typing `evalhub://collections/{id}`
- **Job IDs** — when typing `evalhub://jobs/{id}`
- **Status values** — when typing `evalhub://jobs?status=`
- **Labels** — when typing `evalhub://benchmarks?label=`

Completions are cached for 30 seconds and support partial matching.
