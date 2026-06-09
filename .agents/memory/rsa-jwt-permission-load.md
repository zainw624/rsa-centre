---
name: RSA permission must be loaded from DB in jwt callback
description: Why every user appeared as 'viewer' despite correct Discord roles
---

# Permission/roles live in the DB, not on the OAuth user object

**Symptom:** Every logged-in user shows as "Viewer" (permission `viewer`) even when
their Discord roles map to admin/league/manager.

**Root cause:** With NextAuth v4 JWT strategy and NO PrismaAdapter, the `user`
argument passed to the `jwt` callback on sign-in is the OAuth-derived user
(`id/name/email/image` only). It does NOT carry `discordId`, `roles`, or
`permission`. The `signIn` callback resolves those from Discord and upserts them
into the `User` table, but the `jwt` callback was reading them off `user` →
always `undefined` → fell back to `viewer`.

**Fix:** In the `jwt` callback, look up the persisted user by `discordId` via Prisma
and copy `roles`/`permission`/`id` onto the token. `signIn` runs before `jwt`, so the
upserted row exists.

**Security fix (do NOT revert):** the `jwt` callback now reloads from the DB on EVERY
request (keyed on `profile?.id ?? token.discordId`), not just at initial sign-in. If it
only refreshed when `profile` was present, a user demoted in the DB/Discord sync would
keep their old elevated `permission` baked into the JWT until it expired → privilege
escalation. Reloading each request means demotions take effect on the next request.

**Why:** Permission is derived from live Discord roles and stored in the DB as the
source of truth; the token is just a cache of that DB state at login time.
