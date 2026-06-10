---
name: Bot ↔ website sync contract
description: How the Discord bot pushes results/fixtures into the web app and the constraints around it
---

# Bot ↔ website sync

The Discord bot (in `bot/`, deployed on Render) and the web app (`artifacts/rsa-ops`,
deployed autoscale) share one Postgres DB but talk over HTTP for writes the bot can't
do directly.

- Bot-only write endpoints live under `app/api/bot/*` and authenticate with header
  `x-sync-secret` == env `ROLES_SYNC_SECRET`. The browser endpoints (`/api/fixtures`,
  etc.) use NextAuth sessions, which the bot has no access to — hence the separate
  `/api/bot/*` family.
- For sync to work, BOTH sides need matching `WEBSITE_URL` (bot) and `ROLES_SYNC_SECRET`.
  Bot sync calls are deliberately **non-fatal**: a failed POST must never block the
  Discord-side action.
- Only `/results add` and `/announcefix` push to the website. `/results edit|remove`
  stay local by design.

**Why:** decided to keep the Discord flow resilient and the website the single source
of truth for standings/stats/dashboard.

**How to apply:** any new bot command that should appear on the website needs a
matching `/api/bot/*` endpoint guarded by `x-sync-secret`, called non-fatally.
