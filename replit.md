# RSA Operations Centre

A private Discord-authenticated operations platform for RSA league management. Staff login via Discord OAuth, with role-based permissions controlling access to dashboards, rosters, transfers, fixtures, discipline, and more.

## Run & Operate

- `pnpm --filter @workspace/rsa-ops run dev` — start Next.js dev server (port 26138)
- `pnpm --filter @workspace/rsa-ops run build` — production build
- `pnpm --filter @workspace/rsa-ops run start` — start production server
- `cd artifacts/rsa-ops && npx prisma db push` — push DB schema to database
- `cd artifacts/rsa-ops && npx prisma generate` — regenerate Prisma client

## Stack

- Next.js 15 (App Router), React 18, TypeScript
- Prisma ORM + PostgreSQL
- NextAuth v4 with Discord provider
- Tailwind CSS

## Where things live

- `artifacts/rsa-ops/` — the entire Next.js web application
- `artifacts/rsa-ops/app/` — Next.js App Router pages and API routes
- `artifacts/rsa-ops/components/` — shared React components
- `artifacts/rsa-ops/lib/` — server utilities (auth, db, discord)
- `artifacts/rsa-ops/prisma/schema.prisma` — database schema (source of truth)
- `artifacts/rsa-ops/lib/auth.ts` — NextAuth Discord config
- `artifacts/rsa-ops/lib/db.ts` — all database query functions
- `artifacts/rsa-ops/lib/discord.ts` — Discord API helpers
- `.migration-backup/` — original source files from GitHub import

## Architecture decisions

- Next.js App Router with server components for all data fetching
- Discord OAuth via NextAuth — roles stored in `User.roles` as string array
- Prisma with PostgreSQL; schema includes: User, Team, RosterPlayer, Fixture, Transfer, Sanction, Notification, AuditLog, SystemLog
- `artifacts/api-server` is an unused Replit scaffold — its previewPath is `/scaffold-api` so it does NOT intercept `/api/*` routes (Next.js handles all API routes)
- `allowedDevOrigins` uses `REPLIT_DEV_DOMAIN` env var to allow Replit proxy through

## Required Environment Variables

Set all of these as Replit Secrets (Tools → Secrets):

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@host/db`) |
| `NEXTAUTH_SECRET` | Random 32+ char secret (run: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your Replit app URL (e.g. `https://your-repl.replit.app`) |
| `DISCORD_CLIENT_ID` | Discord OAuth2 app Client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 app Client Secret |
| `DISCORD_BOT_TOKEN` | Discord bot token (for role/member lookups) |
| `DISCORD_GUILD_ID` | Your Discord server (guild) ID |
| `BOT_OWNER_ID` | Discord user ID of bot owner (optional) |
| `ROLES_SYNC_SECRET` | Secret key for the `/api/roles-sync` endpoint |

After setting `DATABASE_URL`, run:
```
cd artifacts/rsa-ops && npx prisma db push
```
to create all database tables.

## Discord OAuth Setup

In your Discord Developer Portal:
1. Go to OAuth2 → Redirects
2. Add: `https://your-repl.replit.app/api/auth/callback/discord`
3. Copy Client ID and Client Secret → set as Replit Secrets

## Product

Full operations centre for RSA (a Discord gaming community):
- **Dashboard** — overview of recent activity, sanctions, transfers
- **Player Profiles** — roster management and player history
- **Teams** — team management with Discord role mapping
- **Managers** — manager assignments synced from Discord roles
- **Staff** — staff directory by Discord role hierarchy
- **Rosters** — team roster sheets with player status
- **Transfers** — transfer request workflow (pending/approved/declined)
- **Discipline** — sanction tracking and compliance
- **Fixtures** — match scheduling
- **Results** — match result recording
- **World Cup** — tournament bracket management
- **League Table** — standings calculation
- **Statistics** — player and team stats
- **Compliance** — audit logging
- **Hall of Fame** — achievement tracking

## User preferences

_Populate as you build._

## Gotchas

- After any change to `prisma/schema.prisma`, run `npx prisma generate` then `npx prisma db push` (dev) or `npx prisma migrate deploy` (prod)
- `artifacts/api-server` must NOT use previewPath `/api` — it would intercept Next.js API routes
- `discord.ts` functions return empty data (not throw) when env vars are missing — graceful dev degradation
- Next.js `allowedDevOrigins` must include the `REPLIT_DEV_DOMAIN` value for static assets to load through the Replit proxy

## Pointers

- Original source archived in `.migration-backup/web/`, `.migration-backup/bot/`, `.migration-backup/shared/`
- See the `pnpm-workspace` skill for workspace structure details
