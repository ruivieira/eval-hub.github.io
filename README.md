# eval-hub.github.io

Documentation site for EvalHub.

## Overview

This repository contains the source for the [EvalHub documentation](https://eval-hub.github.io) built with Astro/Starlight.

## Deployment

### Automatic Deployment

Documentation is automatically built and deployed to GitHub Pages when changes are pushed to the `main` branch.

## Adding Blog Posts

Blog posts live in `src/content/docs/blog/`. Create a new Markdown file there with this frontmatter:

```markdown
---
title: "Your Post Title"
date: 2026-05-02T00:00:00.000Z
authors:
  - evalhub
excerpt: >
  A short summary shown in the blog index.
---

Post content goes here.
```

- `date` controls the publish date and sort order.
- `authors` must match a key defined in the `starlightBlog` authors config in `astro.config.mjs`.
- The filename becomes the URL slug (e.g. `my-post.md` → `/blog/my-post/`).

## License

See the [LICENSE](LICENSE) file for details.

## Evalhub deployment status

### Cluster [prabhu-comhub.xqmp.p3.openshiftapps.com](https://console-openshift-console.apps.rosa.prabhu-comhub.xqmp.p3.openshiftapps.com/dashboards)

![prabhu/prabhu-comhub](https://img.shields.io/badge/dynamic/json.svg?colorB=green&style=round-square&label=prabhu/prabhu-comhub&query=build_date&url=https%3A%2F%2Fevalhub-prabhu.apps.rosa.prabhu-comhub.xqmp.p3.openshiftapps.com%2Fapi%2Fv1%2Fhealth)
![julian/prabhu-comhub](https://img.shields.io/badge/dynamic/json.svg?colorB=green&style=round-square&label=julian/prabhu-comhub&query=build_date&url=https%3A%2F%2Fevalhub-julian.apps.rosa.prabhu-comhub.xqmp.p3.openshiftapps.com%2Fapi%2Fv1%2Fhealth)
