---
title: "Quick Start: Claude Code"
---

Connect the EvalHub MCP server to Claude Code in under 5 steps.

## Option A: stdio transport (recommended)

Stdio is the simplest setup — Claude Code launches the MCP server as a child process.

### Using the standalone binary

**1. Install the MCP server**

Download the binary, see [Install the MCP server](/mcp/installation/#install-the-mcp-server).

**2. Create a config file**

```bash
mkdir -p ~/.evalhub
cat > ~/.evalhub/config.yaml <<EOF
base_url: "https://evalhub.apps.my-cluster.example.com"
token: "YOUR_TOKEN"
tenant: "my-team"
EOF
```

Replace `base_url` and `token` with your EvalHub instance details. For local mode, use `http://localhost:8080` and omit the token.

**3. Register the MCP server with Claude Code**

```bash
claude mcp add evalhub -- evalhub-mcp --config ~/.evalhub/config.yaml
```

**4. Verify the connection**

Start Claude Code and ask:

```
List the available evaluation providers
```

Claude should query the `evalhub://providers` resource and return the list of registered providers.

### Using the Python SDK

**1. Install the SDK with MCP support**

```bash
pip install "eval-hub-sdk[mcp]"
```

**2. Configure the connection**

```bash
evalhub config set base_url https://evalhub.apps.my-cluster.example.com
evalhub config set token YOUR_TOKEN
evalhub config set tenant my-team
```

**3. Register the MCP server with Claude Code**

```bash
claude mcp add evalhub -- evalhub mcp
```

To use a named profile:

```bash
claude mcp add evalhub -- evalhub --profile agent mcp
```

**4. Verify the connection**

Start Claude Code and ask:

```
List the available evaluation providers
```

### Scope: project vs global

By default, `claude mcp add` registers the server for the current project only. To make it available globally:

```bash
claude mcp add -s user evalhub -- evalhub-mcp --config ~/.evalhub/config.yaml
```

## Option B: HTTP transport

Use HTTP when the MCP server runs remotely or you want to share a single server across multiple clients.

**1. Start the MCP server**

```bash
evalhub-mcp --transport http --port 3001 --config ~/.evalhub/config.yaml
```

**2. Register with Claude Code**

```bash
claude mcp add evalhub --transport http http://localhost:3001/
```

For a remote server, replace `localhost` with the server's hostname.

**3. Verify the connection**

Start Claude Code and ask:

```
What benchmarks are available?
```

## Example interactions

Once connected, try these with Claude Code:

```
Evaluate the model at https://my-model.example.com/v1 using the leaderboard-v2 collection
```

```
What's the status of job abc123?
```

```
Cancel job abc123
```

```
Walk me through an Evaluation-Driven Development workflow for a RAG application
```
