# Vercel Environment Variables Setup Guide

## For Production on Vercel

### 1. Get Your Environment Values Ready

Before deploying, gather these values:

**Discord OAuth:**
- `DISCORD_CLIENT_ID` - From Discord Developer Portal
- `DISCORD_CLIENT_SECRET` - From Discord Developer Portal  
- `DISCORD_GUILD_ID` - Your RSA Discord server ID
- `DISCORD_BOT_TOKEN` - Your bot's token
- `BOT_OWNER_ID` - Your Discord user ID

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (must be accessible from Vercel)
  - Format: `postgresql://user:password@host:5432/dbname?schema=public`
  - For PostgreSQL cloud providers (Supabase, Railway, etc.)

**NextAuth:**
- `NEXTAUTH_URL` - Your production URL (e.g., https://rsa-ops.vercel.app)
- `NEXTAUTH_SECRET` - Generate a strong random string:
  ```bash
  openssl rand -base64 32
  ```

### 2. Add Environment Variables to Vercel

**Option A: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your RSA Operations Centre project
3. Go to **Settings** > **Environment Variables**
4. Add each variable:
   - Select which environments: Production, Preview, Development (or all)
   - Name: (e.g., `NEXTAUTH_URL`)
   - Value: (your actual value)
   - Click Add

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Add environment variables (one at a time)
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add DISCORD_CLIENT_ID
vercel env add DISCORD_CLIENT_SECRET
vercel env add DISCORD_GUILD_ID
vercel env add DISCORD_BOT_TOKEN
vercel env add BOT_OWNER_ID
vercel env add DATABASE_URL
```

### 3. Update Discord OAuth Redirect URIs

In Discord Developer Portal for your bot:

1. Go to **OAuth2** > **General**
2. Under "Authorized Redirect URIs", add:
   ```
   https://your-vercel-domain.vercel.app/api/auth/callback/discord
   ```
   Replace `your-vercel-domain` with your actual Vercel deployment URL

### 4. Database Considerations

For Vercel, you'll need a cloud PostgreSQL database:

**Recommended Options:**
- **Supabase** (PostgreSQL): https://supabase.com
  - Free tier includes 500MB database
  - Get connection string from Settings > Database > Connection string
  
- **Railway** (PostgreSQL): https://railway.app
  - Pay-as-you-go pricing
  - Easy one-click PostgreSQL setup
  
- **Neon** (PostgreSQL): https://neon.tech
  - Serverless PostgreSQL, free tier available
  
- **AWS RDS**: PostgreSQL on AWS
  - More complex but highly scalable

**After setting up cloud database:**
1. Create the database with Prisma:
   ```bash
   npx prisma migrate deploy
   ```
2. Add the DATABASE_URL to Vercel environment variables

### 5. Deploy to Vercel

```bash
# Option 1: Push to GitHub and enable Vercel auto-deployment
git push origin main

# Option 2: Deploy directly from CLI
vercel --prod
```

### 6. First Production Run

After deployment:

1. Visit your Vercel URL
2. Try logging in with Discord
3. Check bot commands still work (they should update the production database)

### 7. Troubleshooting

**"Error: Invalid redirect_uri"**
- Update OAuth redirect URIs in Discord Developer Portal
- Make sure URL matches exactly: `https://your-domain/api/auth/callback/discord`

**"Error connecting to database"**
- Verify DATABASE_URL is correct
- Check that your database is accessible from Vercel's IP ranges
- Some cloud databases block by default; check firewall settings

**"NextAuth error"**
- Verify NEXTAUTH_SECRET is set and non-empty
- Verify NEXTAUTH_URL matches your production domain

**"Discord bot not responding"**
- Bot uses DISCORD_BOT_TOKEN to make API calls
- Verify token is correct
- Check bot has required permissions in Discord server

---

## Environment Variables Summary

```env
# NextAuth (Production)
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=generated-random-secret

# Discord OAuth
DISCORD_CLIENT_ID=your-id
DISCORD_CLIENT_SECRET=your-secret

# Discord Server & Bot
DISCORD_GUILD_ID=your-guild-id
DISCORD_BOT_TOKEN=your-bot-token
BOT_OWNER_ID=your-user-id

# Database (Cloud PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
```

---

## Local Development vs Vercel

Your `.env.local` file is for **local development only** and will be ignored by Vercel.

Vercel will use the environment variables you set in the Vercel Dashboard.

**Never commit sensitive values to GitHub.**
