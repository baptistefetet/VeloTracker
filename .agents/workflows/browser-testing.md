---
description: Utiliser la version déployée du site pour le test en navigateur au lieu de lancer un serveur local.
---

# Browser Testing Workflow

When a browser steering tool (`browser_subagent`) is available, **ALWAYS** prioritize testing on the production URL instead of launching a local Node server.

## Instructions

1. **Do NOT launch a local server** (e.g., `npm run dev`, `node server.js`).
2. **Use the production URL**: `https://velo.pbat.ovh`
3. **Wait for deployment**: After a push to GitHub, wait approximately 10 seconds for the GitHub Action to complete the deployment before refreshing or visiting the page.
4. **Browser Actions**: Use `browser_subagent` to navigate to `https://velo.pbat.ovh` to verify changes.

## Rationale

The production environment at `https://velo.pbat.ovh` is automatically updated on every push to GitHub. Testing against this URL ensures consistency with the deployed state and avoids the overhead and potential environment differences of a local server.
