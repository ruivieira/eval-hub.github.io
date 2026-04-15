---
title: "LightEval Examples"
---

Configuration examples for common scenarios.

## Coming Soon

Detailed examples are in progress.

## Single Task

```json
{
  "job_id": "job-123",
  "benchmark_id": "hellaswag",
  "model": {
    "name": "gpt2",
    "url": "http://localhost:8000/v1"
  },
  "benchmark_config": {
    "provider": "endpoint",
    "num_few_shot": 0
  }
}
```

For more examples, see the [LightEval README](https://github.com/eval-hub/contrib/tree/main/adapters/lighteval).
