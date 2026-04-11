---
title: "Model Authentication"
---

If a model endpoint requires authentication or custom TLS verification, EvalHub can provide the necessary credentials to the evaluation job so the adapter can securely call the model endpoint.

### Model Secured with an API Key (and Optional Custom TLS)

Create a Kubernetes Secret consisting of the API key and optional CA certificate. In the job request, set `model.auth.secret_ref` to that secret’s name. EvalHub mounts the secret into the job pod; the adapter sends the API key in the `Authorization: Bearer` header and uses the CA certificate for TLS verification.

### Model Secured with Kubernetes RBAC (ServiceAccount Token)

The model endpoint is protected by Kubernetes RBAC (for example, a KServe service exposed through kube-rbac-proxy). Grant the EvalHub job ServiceAccount access to the model (for example, via a RoleBinding to the model’s view role). The adapter automatically sends the pod’s ServiceAccount token when calling the model. If the endpoint uses a custom CA for TLS only, you can use a secret with just `ca_cert` and reference it with `model.auth.secret_ref`.

Both approaches work when EvalHub runs in Kubernetes and creates evaluation jobs in a tenant namespace.

## When to use a secret

A secret is only required if:

- The model requires an API key
- The endpoint uses a custom CA certificate for TLS

If the model requires neither, omit the `model.auth` section.

---

## Scenario 1: API key and CA certificate

Use this scenario when the model requires an API key and/or a custom CA certificate for TLS (for example, a secured vLLM endpoint).

### Secret structure

Create a Kubernetes Secret in the tenant namespace where EvalHub runs evaluation jobs.

The secret can contain the following keys:

- **`api-key`** (optional) – Sent in the request header as: `Authorization: Bearer <api-key>`
- **`ca_cert`** (optional) – PEM-encoded CA certificate used for TLS verification.

At least one of these keys must be present. If `ca_cert` is not provided, the adapter uses the container's system trust store.

**Example secret:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: vllm-api-key
  namespace: team-a
type: Opaque
stringData:
  api-key: "your-api-key-here"
  ca_cert: |
    -----BEGIN CERTIFICATE-----
    ... your CA certificate PEM ...
    -----END CERTIFICATE-----
```

Or create it using kubectl:

```bash
kubectl create secret generic vllm-api-key -n team-a \
  --from-literal=api-key="your-api-key-here" \
  --from-file=ca_cert=/path/to/ca.pem
```

### Step 1: Reference the secret in the job

Set `model.auth.secret_ref` to the secret name when submitting the evaluation job.

**Example request:**

```bash
curl -k -X POST "$HOST/api/v1/evaluations/jobs" \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -H "X-Tenant: team-a" \
  -d '{
  "name": "model api key/cert test",
  "model": {
    "url": "https://vllm-route-prabhu.apps.rosa.prabhu-comhub.xqmp.p3.openshiftapps.com/v1",
    "name": "gpt2",
    "auth": {
      "secret_ref": "vllm-api-key"
    }
  },
  "benchmarks": [
    {
      "id": "arc_easy",
      "provider_id": "lm_evaluation_harness",
      "parameters": {
        "limit": 5,
        "num_examples": 10,
        "tokenizer": "google/flan-t5-small"
      }
    }
  ]
}'
```

**Example using the Python SDK**

The following example submits the same evaluation job using the EvalHub Python SDK.

```python
import os
from evalhub import SyncEvalHubClient
from evalhub.models.api import ModelConfig, BenchmarkConfig, JobSubmissionRequest

client = SyncEvalHubClient(base_url=os.environ.get("HOST", "http://localhost:8080"))

job = client.jobs.submit(
    JobSubmissionRequest(
        name="model api key/cert test",
        model=ModelConfig(
            url="https://vllm-route-prabhu.apps.rosa.prabhu-comhub.xqmp.p3.openshiftapps.com/v1",
            name="gpt2",
            auth={"secret_ref": "vllm-api-key"},
        ),
        benchmarks=[
            BenchmarkConfig(
                id="arc_easy",
                provider_id="lm_evaluation_harness",
                parameters={"limit": 5, "num_examples": 10, "tokenizer": "google/flan-t5-small"},
            )
        ],
    ),
    headers={"X-Tenant": "team-a"},
)
```

### Troubleshooting

If the evaluation job fails with authentication or TLS errors, check the adapter container logs:

```bash
kubectl logs -n <tenant-namespace> job/<job-name> -c adapter
```

### Verifying model access (optional)

Before running a full evaluation, you can verify that the model endpoint is reachable using the same API key and CA certificate used by the evaluation job.

Typical failures include:

- Missing CA certificate → TLS error
- Missing API key → 401 Unauthorized

---

## Scenario 2: ServiceAccount token (KServe / kube-rbac-proxy)

Use this scenario when the model endpoint is protected by Kubernetes RBAC.

The evaluation job uses the EvalHub job ServiceAccount, and the adapter sends the pod's ServiceAccount token when calling the model. The model's proxy verifies that this ServiceAccount has permission to access the model.

### Step 1: Grant the ServiceAccount access

The model namespace typically already has a Role (e.g. `gpt2-view-role`) from model deployment. Create a **RoleBinding** that binds the EvalHub job ServiceAccount to that role. The job runs as an SA in the tenant namespace (e.g. `evalhub-prabhu-job` in `team-a`).

**Using oc:**

```bash
oc create rolebinding gpt2-view-evalhub-prabhu-job \
  --role=gpt2-view-role \
  --serviceaccount=team-a:evalhub-prabhu-job \
  -n team-a
```

**Or apply a RoleBinding YAML:**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: gpt2-view-evalhub-prabhu-job
  namespace: team-a
subjects:
  - kind: ServiceAccount
    name: evalhub-prabhu-job
    namespace: team-a
roleRef:
  kind: Role
  name: gpt2-view-role
  apiGroup: rbac.authorization.k8s.io
```

Apply and verify access:

```bash
kubectl apply -f role-binding.yaml

kubectl auth can-i get inferenceservices.serving.kserve.io/gpt2 \
  -n team-a \
  --as=system:serviceaccount:team-a:evalhub-prabhu-job
```

The command should return: `yes`

### Step 2: Submit the job

When using ServiceAccount authentication, do not set `model.auth` unless the endpoint uses a custom CA certificate—in that case, create a secret containing only `ca_cert` and reference it using `model.auth.secret_ref`.

**Example:**

```bash
curl -k -X POST "$HOST/api/v1/evaluations/jobs" \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -H "X-Tenant: team-a" \
  -d '{
  "name": "model api key/cert test",
  "model": {
    "url": "https://gpt2-team-a.apps.rosa.prabhu-comhub.xqmp.p3.openshiftapps.com/v1",
    "name": "gpt2"
  },
  "benchmarks": [
    {
      "id": "arc_easy",
      "provider_id": "lm_evaluation_harness",
      "parameters": {
        "limit": 5,
        "num_examples": 10,
        "tokenizer": "google/flan-t5-small"
      }
    }
  ]
}'
```

---

## Summary

| Scenario              | Secret                          | model.auth                    | Authentication              |
|-----------------------|----------------------------------|-------------------------------|-----------------------------|
| API key               | `api-key` and/or `ca_cert`       | `secret_ref` required         | API key (`Authorization: Bearer`) |
| ServiceAccount token  | Optional (`ca_cert` only for TLS) | Omit unless TLS secret is used | Pod ServiceAccount token    |

## Next steps

- [Quick Start](quickstart/) – Run your first evaluation
- [Using custom data](custom-data/) – S3/MinIO test data and secrets
- [Multi-Tenancy](/development/multi-tenancy/) – Namespaces, job ServiceAccounts, and RBAC
