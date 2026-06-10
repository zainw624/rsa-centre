---
name: NextAuth v4 GET sign-in causes ?error=discord
description: Why Discord OAuth login failed with ?error=<provider> and the fix
---

# NextAuth v4: never initiate OAuth sign-in via a plain GET link

**Symptom:** Clicking "Login with Discord" lands back on `/login?...&error=discord`
without ever reaching Discord. Config (client id/secret, redirect URI, secrets) all
correct.

**Root cause:** The login page used plain GET links
`<Link href="/api/auth/signin/discord?callbackUrl=...">`. NextAuth v4 requires a
**CSRF-protected POST** to initiate OAuth sign-in. A GET to `/api/auth/signin/:provider`
does NOT start the flow — it 302s straight to the error page with `error=<provider id>`
(hence `error=discord`, which is NOT one of NextAuth's documented error codes).

**How it was diagnosed (cheap, no browser, no deploy logs):**
- `curl -i "https://<host>/api/auth/signin/discord?callbackUrl=/dashboard"`
  → `302 Location: /login?...&error=discord` (fails at INITIATION).
- POST with a csrf token + `json=true` → `200 {"url":"https://discord.com/.../authorize?..."}`
  (initiation works fine via POST). This split proves the bug is GET vs POST, not config.
- `fetch_deployment_logs` returned nothing for this autoscale deployment — unreliable;
  curl against the live site was the effective diagnostic.

**Fix:** Initiate sign-in with the client helper `signIn('discord', { callbackUrl })`
from `next-auth/react` inside a `'use client'` button component. `signIn`/`signOut`
work without a `SessionProvider` (only `useSession` needs it). Add button CSS resets
(`border:none; cursor:pointer; font-family:inherit`) when swapping `<Link>`→`<button>`.

**Why:** GET initiation is intentionally blocked for CSRF safety. Any direct
`/api/auth/signin/:provider` link is a bug.
