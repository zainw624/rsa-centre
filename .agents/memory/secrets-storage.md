---
name: Secrets storage (rsa-ops)
description: Where app secrets must live, and a known pending remediation of plaintext secrets in .replit.
---

# Secrets must live in the encrypted Secrets store, never in .replit

App secrets for rsa-ops (DISCORD_BOT_TOKEN, DISCORD_CLIENT_SECRET, NEXTAUTH_SECRET,
ROLES_SYNC_SECRET, etc.) must be stored as encrypted Secrets (Replit Secrets tab),
**not** as plaintext shared env vars in `.replit` `[userenv.shared]`.

**Why:** `.replit` is committed to the repo and visible to anyone with repo/fork
access. The GitHub-imported setup originally placed these live secrets in
`[userenv.shared]` in plaintext — a real credential leak. replit.md already
prescribes the Secrets tab; the imported config violated it.

**Resolved (June 2026):** the exposed credentials were rotated by the user and the
4 real secrets (DISCORD_BOT_TOKEN, DISCORD_CLIENT_SECRET, NEXTAUTH_SECRET,
ROLES_SYNC_SECRET) now live in the encrypted Secrets store. They were removed from
`.replit` `[userenv.shared]`. Three NON-secret config values intentionally remain
as plaintext shared env in `.replit`: NEXTAUTH_URL, DISCORD_CLIENT_ID,
DISCORD_GUILD_ID (public identifiers/URL — not sensitive). Sequence that worked:
deleteEnvVars(shared) first, then requestEnvVar(secret) to avoid a shared-vs-secret
name clash. Do not re-add the secrets to shared.

**Bot note:** the Discord bot (separate, deployed on Render from `bot/`, repo
rootDir `bot`) reads env via process.env using DIFFERENT names — `DISCORD_TOKEN`
(not DISCORD_BOT_TOKEN), plus WEBSITE_URL, ROLES_SYNC_SECRET, BOT_OWNER_ID,
DISCORD_GUILD_ID. ROLES_SYNC_SECRET must be identical on Replit (web) and Render
(bot) for `/api/roles-sync` to authenticate.

**How to apply:** the agent cannot write secret values itself (tooling blocks
setting secret values). Verify presence via `viewEnvVars({type:"secret"})`, then
edit `.replit` to drop the plaintext entries.
