# Quick Start

Run your first evaluation with EvalHub using GuideLLM as an example.

## Step 1: Start a Model Server

=== "Ollama (Local)"

    ```bash
    curl -fsSL https://ollama.com/install.sh | sh
    ollama run qwen2.5:1.5b
    ```

    Ollama serves at `http://localhost:11434/v1` (OpenAI-compatible).

=== "vLLM (Kubernetes)"

    ```bash
    kubectl apply -f - <<EOF
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: vllm-server
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: vllm
      template:
        metadata:
          labels:
            app: vllm
        spec:
          containers:
          - name: vllm
            image: vllm/vllm-openai:latest
            args: [--model, meta-llama/Llama-3.2-1B-Instruct, --port, "8000"]
            ports:
            - containerPort: 8000
    EOF
    ```

## Step 2: Install Client SDK

```bash
pip install eval-hub-sdk[client]
```

## Step 3: Submit Evaluation

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
        BenchmarkConfig(
            id="quick_perf_test",
            provider_id="guidellm",
            parameters={
                "profile": "constant",
                "rate": 5,
                "max_seconds": 10,
                "max_requests": 20,
            }
        )
    ]
))

print(f"Job submitted: {job.id}")
```

## Step 4: Wait for Results

```python
result = client.jobs.wait_for_completion(job.id, timeout=120)
print(f"Status: {result.status}")
print(f"Results: {result.results}")
```

Or poll manually:

```python
status = client.jobs.get(job.id)
print(f"Status: {status.status}")
```

## Explore Further

### List Providers and Benchmarks

```python
for provider in client.providers.list():
    print(f"{provider.id}: {provider.name}")

benchmarks = client.benchmarks.list(provider_id="lm_evaluation_harness")
for b in benchmarks:
    print(f"  {b.id}: {b.name}")
```

### Submit a Collection

```python
job = client.jobs.submit(JobSubmissionRequest(
    model=ModelConfig(url="...", name="llama-3-8b"),
    collection={"id": "healthcare_safety_v1"}
))
```

### Use MLflow Tracking

```python
job = client.jobs.submit(JobSubmissionRequest(
    model=ModelConfig(url="...", name="llama-3-8b"),
    benchmarks=[BenchmarkConfig(id="mmlu", provider_id="lm_evaluation_harness")],
    experiment={"name": "my-experiment"}
))
```

## Troubleshooting

**Job stuck in pending**: Check server logs with `kubectl logs deployment/evalhub-server` or run locally with debug logging.

**Model server not responding**: Verify the model endpoint is reachable from the adapter pod (`curl http://model-server:8000/v1/models`).

## Next Steps

- [Installation](installation.md) - Full installation guide
- [Architecture](../development/architecture.md) - Adapter architecture
- [Python SDK](../reference/sdk-client.md) - Complete SDK reference
