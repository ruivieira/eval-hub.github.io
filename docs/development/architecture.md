# Architecture

Technical architecture of EvalHub adapters.

## Adapter Pattern

All adapters implement the `FrameworkAdapter` interface from the SDK:

```python
from evalhub.adapter import FrameworkAdapter, JobSpec, JobResults, JobCallbacks
from evalhub.adapter.models import JobStatusUpdate, JobStatus, JobPhase, OCIArtifactSpec

class MyAdapter(FrameworkAdapter):
    def run_benchmark_job(
        self,
        config: JobSpec,
        callbacks: JobCallbacks
    ) -> JobResults:
        callbacks.report_status(JobStatusUpdate(
            status=JobStatus.RUNNING,
            phase=JobPhase.RUNNING_EVALUATION,
            progress=0.5,
            message="Running evaluation"
        ))

        raw_results = self._run_evaluation(config)
        metrics = self._parse_results(raw_results)

        oci_result = callbacks.create_oci_artifact(OCIArtifactSpec(
            files_path=self._output_dir,
            coordinates=config.exports.oci.coordinates
        ))

        return JobResults(
            id=config.id,
            benchmark_id=config.benchmark_id,
            benchmark_index=config.benchmark_index,
            model_name=config.model.name,
            results=metrics,
            overall_score=self._calculate_score(metrics),
            num_examples_evaluated=len(metrics),
            duration_seconds=self._get_duration(),
            oci_artifact=oci_result
        )
```

The adapter entrypoint creates callbacks and reports results:

```python
def main():
    adapter = MyAdapter()
    callbacks = DefaultCallbacks.from_adapter(adapter)
    results = adapter.run_benchmark_job(adapter.job_spec, callbacks)
    callbacks.report_results(results)
    callbacks.report_metrics_to_mlflow(results, adapter.job_spec)
```

## Component Diagram

![Adapter component diagram](../images/diagrams/adapter-component.svg)

## Data Flow

### 1. Initialisation

![Adapter initialisation sequence](../images/diagrams/adapter-init-sequence.svg)

### 2. Execution

![Adapter execution sequence](../images/diagrams/adapter-execution-sequence.svg)

### 3. Artifact Persistence

![Adapter artifact persistence sequence](../images/diagrams/adapter-artifact-sequence.svg)

## Key Abstractions

### JobSpec

Job configuration loaded from `/meta/job.json` (mounted ConfigMap):

```python
class JobSpec:
    id: str
    provider_id: str
    benchmark_id: str
    benchmark_index: int
    model: ModelConfig          # url, name, auth
    benchmark_config: dict
    callback_url: str           # sidecar base URL
    num_examples: int | None
    experiment_name: str | None # MLflow experiment
    tags: list[dict]
    exports: JobSpecExports | None  # OCI coordinates
```

### JobResults

Structured results returned by the adapter:

```python
class JobResults:
    id: str
    benchmark_id: str
    benchmark_index: int
    model_name: str
    results: list[EvaluationResult]
    overall_score: float | None
    num_examples_evaluated: int
    duration_seconds: float
    completed_at: datetime
    oci_artifact: OCIArtifactResult | None
```

### JobCallbacks

Communication interface for the adapter:

```python
class JobCallbacks(ABC):
    def report_status(self, update: JobStatusUpdate) -> None:
        """Send status update via POST /api/v1/evaluations/jobs/{id}/events"""

    def create_oci_artifact(self, spec: OCIArtifactSpec) -> OCIArtifactResult:
        """Push artifacts to OCI registry using oras/olot"""

    def report_results(self, results: JobResults) -> None:
        """Send final results via POST /api/v1/evaluations/jobs/{id}/events"""

    def report_metrics_to_mlflow(self, results: JobResults, job_spec: JobSpec) -> None:
        """Log metrics and params to MLflow (optional)"""
```

### DefaultCallbacks

The SDK provides `DefaultCallbacks` which:

- Sends status events to the sidecar via HTTP POST
- Pushes OCI artifacts using `oras` and `olot`
- Logs metrics to MLflow when `experiment_name` is set
- Handles auth via ServiceAccount tokens or explicit tokens

### AdapterSettings

Environment-based configuration loaded via `pydantic-settings`:

- `EVALHUB_MODE`: `k8s` (default) or `local`
- `EVALHUB_JOB_SPEC_PATH`: path to job spec (default `/meta/job.json`)
- `EVALHUB_URL`: server base URL
- `OCI_AUTH_CONFIG_PATH`: Docker config for registry auth
- `MLFLOW_TRACKING_URI`: MLflow server URL
- `MLFLOW_TRACKING_TOKEN_PATH`: MLflow auth token

## Adapter Container Images

Adapters are built as UBI9 Python containers with a standard layout:

```
adapters/<name>/
├── main.py           # Entrypoint with FrameworkAdapter implementation
├── requirements.txt  # eval-hub-sdk[adapter] + framework dependencies
├── Containerfile     # UBI9 Python, entrypoint: python main.py
└── meta/
    └── job.json      # Example job spec for local testing
```

## Next Steps

- [Python SDK Reference](../reference/sdk-client.md) - Complete client and adapter API
- [OpenShift Setup](openshift-setup.md) - Production deployment
