---
title: "Prompt Reference"
---

MCP prompts are structured conversation templates that guide AI agents through common workflows. The EvalHub MCP server provides three prompts.

## edd_workflow

Structured guidance for Evaluation-Driven Development (EDD) — a methodology for building AI applications with evaluation at every stage.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `application_type` | Yes | The type of application: `rag`, `agent`, `safety`, or `classifier` |

### Application-specific guidance

| Type | Define | Measure | Iterate |
|------|--------|---------|---------|
| `rag` | Define retrieval quality and generation accuracy targets | Measure with RAG-specific benchmarks | Iterate on retrieval pipeline and generation prompts |
| `agent` | Define task completion criteria and tool use accuracy | Measure tool call correctness and task success rate | Iterate on agent prompts and guardrails |
| `safety` | Define safety requirements and acceptable thresholds | Measure toxicity, bias, and harmful content | Iterate with safety guardrails and content filters |
| `classifier` | Define per-class accuracy targets | Measure across class imbalances and edge cases | Iterate on classification prompts and examples |

### Example usage

Ask your AI agent:

```
Use the edd_workflow prompt for a RAG application
```

The agent will receive a structured Define → Measure → Iterate workflow customized to RAG applications, then guide you through each phase using EvalHub tools and resources.

---

## evaluate_model

Step-by-step model evaluation workflow that walks through selecting benchmarks, configuring experiments, submitting jobs, and monitoring results.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `model_url` | No | URL of the model inference endpoint. If provided, skips the model identification step. |
| `benchmark_preferences` | No | Benchmark selection preferences (e.g., "reasoning", "safety", "general"). Guides benchmark recommendation. |

### Workflow steps

1. **Identify the model** — collect the inference endpoint URL (skipped if `model_url` is provided)
2. **Select benchmarks** — browse available benchmarks and collections, recommend based on preferences
3. **Configure experiment** — set up MLflow experiment name and tags for tracking
4. **Submit evaluation** — call `submit_evaluation` with the selected configuration
5. **Monitor results** — poll `get_job_status` and report progress

### Example usage

```
Use the evaluate_model prompt with model_url https://my-model.example.com/v1
```

Or without arguments to be guided through each step:

```
Use the evaluate_model prompt to help me evaluate my model
```

---

## compare_runs

Guidance for comparing results across multiple evaluation jobs.

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `job_ids` | No | Comma-separated job IDs to compare. If provided, skips the job selection step. |

### Workflow steps

1. **Select jobs** — browse recent jobs or use provided IDs (skipped if `job_ids` is provided)
2. **Fetch results** — retrieve full status and metrics for each job
3. **Compare metrics** — analyze differences across runs
4. **Summarize findings** — generate a comparison summary with recommendations

### Example usage

```
Use the compare_runs prompt for jobs job-abc123,job-def456
```

Or without arguments to browse and select jobs interactively:

```
Compare my recent evaluation runs
```
