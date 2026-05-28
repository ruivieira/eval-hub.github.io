---
title: "MCP Troubleshooting"
---

Common issues when running the EvalHub MCP server and how to resolve them.

## Server unreachable / connection refused

**Symptoms:** The AI agent cannot connect to the MCP server, or returns "connection refused" errors.

**Causes and solutions:**

- **Server not running.** Start the MCP server before opening the AI client:

  ```bash
  evalhub-mcp --config ~/.evalhub/config.yaml
  ```

- **Wrong transport mode.** Make sure the transport matches your client configuration. For Claude Code and VS Code with stdio, use the default (`--transport stdio` or omit the flag). For HTTP clients, use `--transport http`.

- **Port conflict (HTTP mode).** If port 3001 is in use, specify a different port:

  ```bash
  evalhub-mcp --transport http --port 3002 --config ~/.evalhub/config.yaml
  ```

  Update your client configuration to match the new port.

- **EvalHub API unreachable.** The MCP server needs to reach the EvalHub backend. Verify connectivity:

  ```bash
  curl -s https://evalhub.apps.my-cluster.example.com/api/v1/health
  ```

  If using local mode, make sure the EvalHub server is running on the configured `base_url`.

## Authentication failure

**Symptoms:** Tools return `401 Unauthorized` or `403 Forbidden` errors.

**Causes and solutions:**

- **Missing or expired token.** Regenerate the token:

  ```bash
  # OpenShift ServiceAccount
  export EVALHUB_TOKEN=$(oc create token team-a-agent -n team-a --duration=8760h)
  ```

  Update the token in your config file or environment variable.

- **Wrong tenant.** Verify the `tenant` value matches your namespace:

  ```bash
  # Check your config
  cat ~/.evalhub/config.yaml
  ```

- **Insufficient RBAC permissions.** The ServiceAccount needs permissions for evaluations, collections, and providers. See the [OpenShift multi-tenant setup](/mcp/installation/#openshift-multi-tenant-setup).

- **Health check.** Use the CLI to verify the connection:

  ```bash
  evalhub --profile agent health
  ```

## Client not detecting the MCP server

**Symptoms:** The AI agent does not list EvalHub tools or resources, or does not recognize `evalhub-mcp` as an MCP server.

**Causes and solutions:**

- **Binary not in PATH (stdio mode).** Verify the binary is accessible:

  ```bash
  which evalhub-mcp
  evalhub-mcp --version
  ```

  If installed via Homebrew, it should be in `/opt/homebrew/bin/` (macOS Apple Silicon) or `/usr/local/bin/`.

- **Wrong command in client config.** Double-check the command and arguments in your client configuration:

  **Claude Code**:

  ```bash
  claude mcp list
  ```

  **VS Code** (`settings.json`):

  ```json
  {
    "github.copilot.chat.mcp.servers": {
      "evalhub": {
        "command": "evalhub-mcp",
        "args": ["--config", "~/.evalhub/config.yaml"]
      }
    }
  }
  ```

- **Python SDK not installed (when using `evalhub mcp`).** The MCP support is an optional extra:

  ```bash
  pip install "eval-hub-sdk[mcp]"
  ```

- **Virtual environment not activated.** If the SDK is installed in a virtualenv, make sure the shell that launches the MCP server has it activated — or use the full path to the `evalhub` binary.

- **Restart required.** After changing MCP configuration, restart the AI client:
  - **Claude Code:** exit and restart the session
  - **VS Code:** Ctrl/Cmd+Shift+P > "Developer: Reload Window"

## TLS certificate errors

**Symptoms:** Errors like `x509: certificate signed by unknown authority` or `SSL certificate problem`.

**Causes and solutions:**

- **Self-signed or corporate CA certificate.** If your EvalHub instance uses a self-signed certificate or a corporate CA not in the system trust store, use the `--insecure` flag as a workaround:

  ```bash
  evalhub-mcp --insecure --config ~/.evalhub/config.yaml
  ```

  Or set the environment variable:

  ```bash
  export EVALHUB_INSECURE=true
  ```

  Or add to your config file:

  ```yaml
  insecure: true
  ```

  :::caution
  The `--insecure` flag disables TLS certificate verification. Only use this for development or when you trust the network path. For production, add the CA certificate to your system trust store.
  :::

- **TLS serving configuration (HTTP mode).** When serving the MCP server over HTTPS, both `--tls-cert` and `--tls-key` must be set:

  ```bash
  evalhub-mcp --transport http --tls-cert /path/to/cert.pem --tls-key /path/to/key.pem
  ```

  If only one is set, the server will fail to start with a configuration error.

## Common error messages

| Error                                                    | Cause                                                       | Solution                                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `client not initialized`                                 | MCP server started without a valid EvalHub connection       | Check `base_url` in your config; the EvalHub API must be reachable                                    |
| `must provide either benchmarks or collection, not both` | `submit_evaluation` called with both fields                 | Use `benchmarks` for individual selection or `collection` for a pre-defined set, not both             |
| `benchmarks list must not be empty`                      | `submit_evaluation` called with an empty `benchmarks` array | Provide at least one benchmark, or use a `collection` instead                                         |
| `resource not found`                                     | Invalid ID in a resource URI                                | Verify the provider/benchmark/collection/job ID exists — use the list resources to discover valid IDs |
| `invalid status filter`                                  | Unrecognized status value in `evalhub://jobs?status=`       | Valid values: `pending`, `running`, `completed`, `failed`, `cancelled`, `partially_failed`            |

## Using the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) provides a web UI for testing MCP servers interactively. It is the best tool for debugging connection and configuration issues.

```bash
npx @modelcontextprotocol/inspector
```

In the Inspector UI, configure the server:

**For the standalone binary:**

- **Command:** `evalhub-mcp`
- **Arguments:** `--config /path/to/config.yaml`

**For the Python SDK:**

- **Command:** `evalhub`
- **Arguments:** `--profile agent mcp`

**For HTTP transport:**

- **URL:** `http://localhost:3001/`

The Inspector lets you browse resources, invoke tools, and test prompts without an AI agent.

## Getting help

If the issue persists after trying these steps:

1. Check the server logs — the MCP server logs to stderr
2. Run with verbose output by checking the log messages
3. File an issue at [github.com/eval-hub/eval-hub/issues](https://github.com/eval-hub/eval-hub/issues)
