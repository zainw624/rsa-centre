# RSA Operations Centre Web Platform

This is the new Next.js + TypeScript website scaffold for the RSA Operations Centre.

## Features included

- Next.js 15 app router
- Tailwind CSS branding
- Discord OAuth with NextAuth
- Role sync from RSA Discord server
- Prisma + PostgreSQL setup
- Private protected routes for staff
- Login page and access denied page
- Branding with `assets/rsa1.png`

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in `DATABASE_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID`, `DISCORD_BOT_TOKEN`, `BOT_OWNER_ID`, and `NEXTAUTH_SECRET`.
3. Run `npm install`.
4. Run `npx prisma migrate dev --name init` to prepare your database.
5. Run `npm run dev`.

## Notes

- The site is intentionally private. Users must login with Discord.
- RSA roles are synchronized from the Discord guild.
- The logo reference is `assets/rsa1.png`.
- Team logos are copied into `public/assets/` from the existing repository assets.
