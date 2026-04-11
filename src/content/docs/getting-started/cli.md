---
title: "CLI"
---

The `evalhub` command-line tool lets you submit evaluation jobs, check status, retrieve results, and manage collections and configuration — all from a terminal or shell script.

EvalHub is assumed to be running on your OpenShift cluster. If it is not, see [Installation](installation/) first.

## Install the CLI

```bash
pip install "eval-hub-sdk[cli]"
```

Verify the install:

```bash
evalhub version
# evalhub 0.1.3
```

## Configure a connection

Before running any commands, tell the CLI where your EvalHub server is. Connections are stored in named profiles at `~/.config/evalhub/config.yaml`.

```bash
evalhub config set base_url https://evalhub.apps.my-cluster.example.com
evalhub config set token $(kubectl create token <service-account> -n <namespace>)
evalhub config set tenant my-team
```

Check the active profile:

```bash
evalhub config list
# Profile: default
#   base_url: https://evalhub.apps.my-cluster.example.com
#   token: sha256~...
#   tenant: my-team
```

If you work with multiple clusters, create named profiles:

```bash
evalhub config set base_url https://evalhub.staging.example.com
evalhub config use staging
```

Switch back with `evalhub config use default`. Any command accepts `--profile <name>` to override at runtime without changing the active profile.

## I want to see what providers and benchmarks are available

```bash
evalhub providers list
```

```
┏━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ ID                    ┃ NAME                  ┃ DESCRIPTION                             ┃ BENCHMARKS ┃
┡━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━┩
│ lm_evaluation_harness │ LM Evaluation Harness │ EleutherAI language model evaluation    │ 167        │
│ garak                 │ Garak                 │ LLM vulnerability and safety scanner    │ 12         │
│ guidellm              │ GuideLLM              │ Performance benchmarking                │ 4          │
└───────────────────────┴───────────────────────┴─────────────────────────────────────────┴────────────┘
```

To see what a provider offers:

```bash
evalhub providers describe lm_evaluation_harness
```

```
Provider: LM Evaluation Harness
ID:       lm_evaluation_harness
Description: EleutherAI language model evaluation framework

Benchmarks (167):
┏━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ID            ┃ NAME                            ┃ CATEGORY            ┃ METRICS                             ┃
┡━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ mmlu          │ Massive Multitask Language Und… │ knowledge           │ acc, acc_norm                       │
│ hellaswag     │ HellaSwag                       │ reasoning           │ acc, acc_norm                       │
│ gsm8k         │ Grade School Math 8K            │ math                │ exact_match                         │
│ arc_easy      │ ARC Easy                        │ reasoning           │ acc, acc_norm                       │
│ ...           │ ...                             │ ...                 │ ...                                 │
└───────────────┴─────────────────────────────────┴─────────────────────┴─────────────────────────────────────┘
```

## I want to check the service is up

```bash
evalhub health
# EvalHub service: healthy (42ms)
```

## I want to run an evaluation

### From a config file

Create a YAML file describing the job:

```yaml
# eval.yaml
name: llama3-reasoning-eval
model:
  url: https://llama3.apps.my-cluster.example.com/v1
  name: meta-llama/Llama-3.2-8B-Instruct
benchmarks:
  - id: hellaswag
    provider_id: lm_evaluation_harness
  - id: gsm8k
    provider_id: lm_evaluation_harness
```

Submit it:

```bash
evalhub eval run --config eval.yaml
# Job submitted: eval-a1b2c3d4
```

### From flags

```bash
evalhub eval run \
  --name llama3-mmlu \
  --model-url https://llama3.apps.my-cluster.example.com/v1 \
  --model-name meta-llama/Llama-3.2-8B-Instruct \
  --provider lm_evaluation_harness \
  --benchmark mmlu \
  --benchmark hellaswag
# Job submitted: eval-e5f6g7h8
```

### Non-blocking by default

`eval run` returns as soon as the job is accepted by the server, giving you the job ID to use later:

```bash
evalhub eval run --config eval.yaml
# Job submitted: eval-a1b2c3d4
```

You can check progress separately with `evalhub eval status eval-a1b2c3d4` and retrieve results when it finishes.

### Blocking until complete

Add `--wait` to block the shell until the job reaches a terminal state:

```bash
evalhub eval run --config eval.yaml --wait
# Job submitted: eval-a1b2c3d4
# Waiting for job eval-a1b2c3d4 to complete...
# Job eval-a1b2c3d4 finished with state: completed
```

The command exits with code `1` if the job fails, making it suitable for CI pipelines.

If the model endpoint requires authentication, see [Model authentication](model-authentication/).

## I want to check what's running

List all jobs:

```bash
evalhub eval status
```

```
┏━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ID                 ┃ NAME                    ┃ STATE       ┃ PROVIDER              ┃ BENCHMARKS ┃ CREATED                    ┃
┡━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ eval-a1b2c3d4      │ llama3-reasoning-eval   │ running     │ lm_evaluation_harness │ 2          │ 2026-03-25 10:00:00+00:00  │
│ eval-e5f6g7h8      │ llama3-mmlu             │ completed   │ lm_evaluation_harness │ 2          │ 2026-03-24 09:15:00+00:00  │
└────────────────────┴─────────────────────────┴─────────────┴───────────────────────┴────────────┴────────────────────────────┘
```

Filter by status:

```bash
evalhub eval status --status running
evalhub eval status --status failed
```

Inspect a single job:

```bash
evalhub eval status eval-a1b2c3d4
# Job:     eval-a1b2c3d4
# Name:    llama3-reasoning-eval
# State:   running
# Model:   meta-llama/Llama-3.2-8B-Instruct (https://llama3.apps.my-cluster.example.com/v1)
# Created: 2026-03-25 10:00:00+00:00
```

Watch a job until it finishes:

```bash
evalhub eval status eval-a1b2c3d4 --watch
```

## I want to see the results

```bash
evalhub eval results eval-a1b2c3d4
```

```
┏━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━┓
┃ BENCHMARK  ┃ PROVIDER              ┃ METRIC                ┃ VALUE   ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━┩
│ hellaswag  │ lm_evaluation_harness │ acc                   │ 0.7823  │
│ hellaswag  │ lm_evaluation_harness │ acc_norm              │ 0.8012  │
│ gsm8k      │ lm_evaluation_harness │ exact_match           │ 0.6540  │
└────────────┴───────────────────────┴───────────────────────┴─────────┘
```

Export for downstream processing:

```bash
# JSON
evalhub eval results eval-a1b2c3d4 --format json > results.json

# CSV
evalhub eval results eval-a1b2c3d4 --format csv > results.csv
```

## I want to cancel a job

```bash
evalhub eval cancel eval-a1b2c3d4
# Are you sure you want to cancel this job? [y/N]: y
# Job eval-a1b2c3d4 cancelled.
```

To permanently remove it:

```bash
evalhub eval cancel eval-a1b2c3d4 --hard-delete
```

## I want to work with collections

A collection is a named set of benchmarks that can be run together as a single job. Collections are defined on the server; the CLI lets you browse and run them.

### List available collections

```bash
evalhub collections list
```

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ ID                       ┃ NAME                     ┃ DESCRIPTION                    ┃ TAGS            ┃ BENCHMARKS ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━┩
│ healthcare_safety_v1     │ Healthcare Safety v1     │ Medical domain benchmarks      │ safety, medical │ 8          │
│ finance_compliance_v1    │ Finance Compliance v1    │ Financial reasoning benchmarks │ finance         │ 5          │
│ general_llm_eval_v1      │ General LLM Eval v1      │ Broad capability evaluation    │ general         │ 12         │
└──────────────────────────┴──────────────────────────┴────────────────────────────────┴─────────────────┴────────────┘
```

Filter by tag:

```bash
evalhub collections list --tag safety
```

### Inspect a collection

```bash
evalhub collections describe healthcare_safety_v1
# Collection: Healthcare Safety v1
# ID:          healthcare_safety_v1
# Description: Medical domain benchmarks
# Tags:        safety, medical
# Pass threshold: 0.75
#
# Benchmarks (8):
# ...
```

### Run a collection

```bash
evalhub collections run healthcare_safety_v1 \
  --model-url https://llama3.apps.my-cluster.example.com/v1 \
  --model-name meta-llama/Llama-3.2-8B-Instruct
# Job submitted: eval-z9y8x7w6
```

Add `--wait` to block until all benchmarks complete:

```bash
evalhub collections run healthcare_safety_v1 \
  --model-url https://llama3.apps.my-cluster.example.com/v1 \
  --model-name meta-llama/Llama-3.2-8B-Instruct \
  --wait
```

Give the resulting job a meaningful name:

```bash
evalhub collections run healthcare_safety_v1 \
  --model-url https://llama3.apps.my-cluster.example.com/v1 \
  --model-name meta-llama/Llama-3.2-8B-Instruct \
  --name llama3-healthcare-2026-03-25
```

### Create a collection

Define the collection in YAML:

```yaml
# bias-collection.yaml
name: Bias and Fairness
description: Benchmarks for bias detection and fairness evaluation
tags:
  - safety
  - bias
benchmarks:
  - id: bbq
    provider_id: lm_evaluation_harness
    weight: 1.0
  - id: winogender
    provider_id: lm_evaluation_harness
    weight: 1.0
pass_criteria:
  threshold: 0.70
```

```bash
evalhub collections create --file bias-collection.yaml
# Collection created: bias-and-fairness-a1b2
```

### Delete a collection

```bash
evalhub collections delete bias-and-fairness-a1b2
# Are you sure you want to delete this collection? [y/N]: y
# Collection bias-and-fairness-a1b2 deleted.
```

Pass `--yes` to skip the confirmation prompt in scripts.

## Using in CI/CD

The CLI is designed for scripted use. All commands return standard exit codes (0 on success, non-zero on failure), and every command that produces data supports `--format json` for machine-readable output.

### GitHub Actions example

```yaml
- name: Run safety evaluation
  env:
    EVALHUB_BASE_URL: ${{ secrets.EVALHUB_URL }}
    EVALHUB_TOKEN: ${{ secrets.EVALHUB_TOKEN }}
  run: |
    pip install "eval-hub-sdk[cli]"

    evalhub eval run \
      --name "ci-eval-${{ github.sha }}" \
      --model-url "$MODEL_URL" \
      --model-name "$MODEL_NAME" \
      --provider lm_evaluation_harness \
      --benchmark mmlu \
      --wait

- name: Export results
  run: |
    evalhub eval results --format json > eval-results.json

- name: Upload results
  uses: actions/upload-artifact@v4
  with:
    name: eval-results
    path: eval-results.json
```

`EVALHUB_BASE_URL` and `EVALHUB_TOKEN` are read from environment variables automatically — no config file needed in CI.

## Output formats

All data-returning commands accept `--format`:

| Format  | Use case                              |
|---------|---------------------------------------|
| `table` | Default; human-readable terminal view |
| `json`  | Machine-readable; pipe to `jq`        |
| `yaml`  | Config-compatible output              |
| `csv`   | Spreadsheet import                    |

Example:

```bash
evalhub eval status --format json | jq '.[].state'
```

ANSI colour codes are stripped automatically when stdout is not a TTY, so piped output is always clean.

## Command reference

| Command | Description |
|---|---|
| `evalhub version` | Print version |
| `evalhub health` | Check EvalHub service health |
| **eval** | |
| `evalhub eval run` | Submit an evaluation job |
| `evalhub eval status [job-id]` | List jobs or inspect one |
| `evalhub eval results <job-id>` | Show evaluation results |
| `evalhub eval cancel <job-id>` | Cancel a job |
| **collections** | |
| `evalhub collections list` | List all collections |
| `evalhub collections describe <id>` | Show collection details |
| `evalhub collections create --file <spec>` | Create a collection |
| `evalhub collections run <id>` | Run a collection as a job |
| `evalhub collections delete <id>` | Delete a collection |
| **providers** | |
| `evalhub providers list` | List registered providers |
| `evalhub providers describe <id>` | Show provider details |
| **config** | |
| `evalhub config set <key> <value>` | Set a config value |
| `evalhub config get <key>` | Read a config value |
| `evalhub config list` | Show active profile |
| `evalhub config use <profile>` | Switch profile |

Every command supports `--help` for full flag details.
