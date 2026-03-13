# EvalHub

Open source evaluation orchestration platform for Large Language Models.

## What is EvalHub?

EvalHub is an evaluation orchestration platform for systematic LLM evaluation. It supports local development and Kubernetes-native deployment at scale. The platform consists of three components:

- **[EvalHub Server](https://github.com/eval-hub/eval-hub)**: Go REST API service for managing evaluation workflows
- **[EvalHub SDK](https://github.com/eval-hub/eval-hub-sdk)**: Python SDK for submitting evaluations and building adapters
- **[EvalHub Contrib](https://github.com/eval-hub/eval-hub-contrib)**: Community-contributed framework adapters

## Architecture Overview

![EvalHub architecture overview](images/diagrams/index-architecture.svg)

| Component | Description | Technology |
|-----------|-------------|------------|
| **Server** | REST API, job orchestration, provider management | Go, SQLite / PostgreSQL |
| **SDK** | Client library, adapter framework, data models | Python 3.11+ |
| **Contrib** | Community framework adapters | Python containers (UBI9) |
| **Jobs** | Isolated evaluation execution | Kubernetes Jobs |
| **Registry** | Immutable artifact storage | OCI registries |

## Quick Start

```python
from evalhub import SyncEvalHubClient
from evalhub.models.api import ModelConfig, BenchmarkConfig, JobSubmissionRequest

client = SyncEvalHubClient(base_url="http://localhost:8080")

job = client.jobs.submit(JobSubmissionRequest(
    model=ModelConfig(
        url="http://localhost:11434/v1",
        name="qwen2.5:1.5b"
    ),
    benchmarks=[
        BenchmarkConfig(id="mmlu", provider_id="lm_evaluation_harness")
    ]
))

result = client.jobs.wait_for_completion(job.id)
```

## Key Features

- **Versioned REST API** (v1) with OpenAPI specification
- **Provider registry** with benchmark discovery
- **Benchmark collections** with weighted scoring
- **Kubernetes-native** job orchestration
- **MLflow integration** for experiment tracking
- **OCI artifact persistence** for evaluation results
- **Adapter pattern** for "Bring Your Own Framework" (BYOF) extensibility
- **Prometheus metrics** and OpenTelemetry tracing

## Available Adapters

| Adapter | Provider | Metrics |
|---------|----------|---------|
| **LightEval** | `lighteval` | accuracy, acc_norm, exact_match |
| **GuideLLM** | `guidellm` | TTFT, ITL, throughput, latency |
| **MTEB** | `mteb` | STS, retrieval, classification |
| **lm-eval-harness** | `lm_evaluation_harness` | 167 benchmarks across 12 categories |
| **Garak** | `garak` | OWASP Top 10, vulnerability scanning |

## Next Steps

- [Overview](getting-started/overview.md) - Architecture and core concepts
- [Installation](getting-started/installation.md) - Install server and SDK
- [Quick Start](getting-started/quickstart.md) - Run your first evaluation
- [Model authentication](getting-started/model-authentication.md) - API key, CA cert, and ServiceAccount token
- [Using custom data](getting-started/custom-data.md) - Using custom benchmark test data
- [Python SDK Reference](reference/sdk-client.md) - Client and adapter API

## License

Apache 2.0 - see [LICENSE](https://github.com/eval-hub/eval-hub/blob/main/LICENSE).
