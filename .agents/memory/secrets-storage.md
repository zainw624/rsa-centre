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

**Pending remediation (as of June 2026):** the user agreed to rotate the exposed
credentials and re-add them via the Secrets tab. Once they confirm the secrets are
present in the encrypted store, remove the plaintext secret lines from `.replit`
`[userenv.shared]` (keep non-secret config like NEXTAUTH_URL/DISCORD_GUILD_ID if
desired, but the tokens/secrets must go). Do not delete them before they exist in
the Secrets store, or Discord login + bot lookups will break.

**How to apply:** the agent cannot write secret values itself (tooling blocks
setting secret values). Verify presence via `viewEnvVars({type:"secret"})`, then
edit `.replit` to drop the plaintext entries.
