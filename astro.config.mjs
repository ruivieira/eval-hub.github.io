import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightClientMermaid from '@pasqal-io/starlight-client-mermaid';

export default defineConfig({
  site: 'https://eval-hub.github.io',
  integrations: [
    starlight({
      title: 'EvalHub',
      plugins: [starlightClientMermaid()],
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/eval-hub' },
      ],
      editLink: {
        baseUrl: 'https://github.com/eval-hub/eval-hub.github.io/edit/main/',
      },
      sidebar: [
        { label: 'Home', slug: 'index' },
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', slug: 'getting-started/overview' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quickstart' },
            { label: 'CLI', slug: 'getting-started/cli' },
            { label: 'Model Authentication', slug: 'getting-started/model-authentication' },
            { label: 'Using Custom Data', slug: 'getting-started/custom-data' },
          ],
        },
        {
          label: 'Server',
          items: [
            { label: 'Overview', slug: 'server' },
          ],
        },
        {
          label: 'Development',
          items: [
            { label: 'Architecture', slug: 'development/architecture' },
            { label: 'OpenShift Setup', slug: 'development/openshift-setup' },
            { label: 'Multi-Tenancy', slug: 'development/multi-tenancy' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Python SDK', slug: 'reference/sdk-client' },
            { label: 'MCP', slug: 'reference/mcp' },
          ],
        },
        {
          label: 'Adapters',
          items: [
            {
              label: 'GuideLLM',
              items: [
                { label: 'Overview', slug: 'adapters/guidellm' },
                { label: 'Configuration', slug: 'adapters/guidellm/configuration' },
                { label: 'Profiles', slug: 'adapters/guidellm/profiles' },
                { label: 'Metrics', slug: 'adapters/guidellm/metrics' },
                { label: 'Examples', slug: 'adapters/guidellm/examples' },
              ],
            },
            {
              label: 'LightEval',
              items: [
                { label: 'Overview', slug: 'adapters/lighteval' },
                { label: 'Configuration', slug: 'adapters/lighteval/configuration' },
                { label: 'Benchmarks', slug: 'adapters/lighteval/benchmarks' },
                { label: 'Examples', slug: 'adapters/lighteval/examples' },
              ],
            },
          ],
        },
        {
          label: 'Build Details',
          items: [
            { label: 'CVE Fixer', slug: 'build-details/cve-fixer' },
          ],
        },
      ],
    }),
  ],
});
