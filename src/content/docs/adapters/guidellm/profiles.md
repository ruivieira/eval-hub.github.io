---
title: "Execution Profiles"
---

GuideLLM supports multiple load patterns for different testing scenarios.

## Profile Types

### Sweep Profile

Automatically explore different request rates to find safe operating ranges.

**Use case**: Discovery - find optimal request rates for your deployment

**Configuration:**

```json
{
  "parameters": {
    "profile": "sweep",
    "max_seconds": 30,
    "detect_saturation": true
  }
}
```

**Behaviour**: Incrementally increases request rate until saturation or limits are reached.

---

### Throughput Profile

Maximum capacity testing to identify performance limits.

**Use case**: Stress testing - find the breaking point

**Configuration:**

```json
{
  "parameters": {
    "profile": "throughput",
    "max_seconds": 60,
    "max_requests": 1000
  }
}
```

**Behaviour**: Sends requests as fast as possible to saturate the server.

---

### Concurrent Profile

Simulate parallel users with fixed concurrency level.

**Use case**: User simulation - test with realistic concurrent load

**Configuration:**

```json
{
  "parameters": {
    "profile": "concurrent",
    "rate": 10,
    "max_requests": 100
  }
}
```

**Behaviour**: Maintains exactly N concurrent requests at all times.

---

### Constant Profile

Fixed requests per second for steady-state testing.

**Use case**: Baseline measurement - consistent, predictable load

**Configuration:**

```json
{
  "parameters": {
    "profile": "constant",
    "rate": 5,
    "max_seconds": 10,
    "max_requests": 20
  }
}
```

**Behaviour**: Sends requests at a fixed rate (e.g., 5 req/s).

---

### Poisson Profile

Randomised request rates following Poisson distribution.

**Use case**: Realistic simulation - natural traffic patterns

**Configuration:**

```json
{
  "parameters": {
    "profile": "poisson",
    "rate": 5,
    "max_seconds": 30
  }
}
```

**Behaviour**: Random intervals averaging to the specified rate.

---

### Synchronous Profile

Sequential requests for baseline measurements.

**Use case**: Single-user testing - minimum latency baseline

**Configuration:**

```json
{
  "parameters": {
    "profile": "synchronous",
    "max_requests": 50
  }
}
```

**Behaviour**: Waits for each request to complete before sending the next.

## Profile Selection Guide

| Scenario | Recommended Profile | Why |
|----------|-------------------|-----|
| First-time testing | `sweep` | Automatically finds safe operating range |
| Load testing | `constant` | Predictable, repeatable results |
| Capacity planning | `throughput` | Find maximum capacity |
| User simulation | `concurrent` | Realistic concurrent load |
| Production-like traffic | `poisson` | Natural traffic patterns |
| Baseline latency | `synchronous` | Minimum possible latency |

## Common Parameters

All profiles support these common parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `max_seconds` | Maximum duration in seconds | None |
| `max_requests` | Maximum number of requests | None |
| `max_errors` | Error threshold before stopping | None |
| `warmup` | Warmup period to exclude (% or absolute) | None |
| `cooldown` | Cooldown period to exclude (% or absolute) | None |

:::tip[Warmup Recommendations]
Use `"warmup": "5%"` or `"warmup": "10%"` to exclude initial cold-start effects from measurements.
:::

## Examples

### Quick Test

Fast test with minimal samples:

```json
{
  "parameters": {
    "profile": "constant",
    "rate": 5,
    "max_seconds": 10,
    "max_requests": 20,
    "warmup": "0"
  }
}
```

### Production Load Test

Realistic production simulation:

```json
{
  "parameters": {
    "profile": "poisson",
    "rate": 50,
    "max_seconds": 300,
    "warmup": "5%",
    "detect_saturation": true
  }
}
```

### Capacity Test

Find maximum throughput:

```json
{
  "parameters": {
    "profile": "throughput",
    "max_seconds": 60,
    "max_requests": 5000,
    "warmup": "10%"
  }
}
```
