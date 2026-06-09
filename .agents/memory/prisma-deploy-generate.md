---
name: Prisma generate in deploy build
description: Why production builds must explicitly run prisma generate in this monorepo
---

# Prisma client must be generated during the production build

The rsa-ops `build` script must run `prisma generate` before `next build`
(also added a `postinstall` that generates). Plain `next build` alone leaves
the Prisma client ungenerated in the deployment's fresh build environment.

**Why:** In this pnpm monorepo the `@prisma/client` postinstall hook runs with
cwd in the virtual store and does NOT find `artifacts/rsa-ops/prisma/schema.prisma`,
so generation is skipped. At runtime the first DB call throws "did not initialize".

**Symptom seen:** Discord login failed with `?error=discord`. The real cause was
`prisma.user.upsert` in the NextAuth signIn callback throwing because the client
was never generated — NOT an OAuth/credential problem. App healthcheck stayed
green because the landing page does not touch the DB; only login does.

**How to apply:** Any Next.js + Prisma artifact deployed here must include
`prisma generate --schema ./prisma/schema.prisma` in its build (and ideally
postinstall). Don't rely on the @prisma/client auto-postinstall in the monorepo.

# Debugging NextAuth `error=discord`
With JWT strategy + no adapter, `error=discord` means an exception was thrown in
the signIn callback (often a DB/prisma failure), not necessarily an OAuth issue.
Verify credentials directly via Discord API (client_credentials grant, bot
token `oauth2/applications/@me`, guild access) before assuming the secret is wrong.
