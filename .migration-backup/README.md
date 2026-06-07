# RSA Monorepo

This repository is organized as a monorepo with separate packages for the Discord bot, website, and shared code.

## Repository Structure

```
/
├── bot/          # Discord.js bot package
├── shared/       # Shared constants, team configuration, permissions, and types
├── web/          # Next.js website package
├── README.md     # Monorepo documentation
└── .gitignore
```

## Packages

- `/bot` — Discord bot that writes league data to PostgreSQL and connects to Discord.
- `/web` — Next.js website that reads league and roster data from PostgreSQL.
- `/shared` — Shared constants and typings used by both packages.

---

## Getting Started

### Install dependencies

Run from the repository root:

```bash
npm install
```

This installs dependencies for the monorepo and links the local `@rsa/shared` package.

---

## Environment Configuration

Use `.env.example` in each package as a template. Do not commit real secrets.

### Bot environment variables

Copy `bot/.env.example` to `bot/.env` and set values:

```env
DISCORD_TOKEN=your_bot_token_here
BOT_OWNER_ID=your_discord_user_id_here
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Website environment variables

Copy `web/.env.example` to `web/.env` and set values:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-me-with-a-strong-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_GUILD_ID=your-rsa-discord-server-id
DISCORD_BOT_TOKEN=your-discord-bot-token
BOT_OWNER_ID=your-discord-user-id
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Shared database usage

Both the bot and website use the same PostgreSQL database URI from `DATABASE_URL`.
The bot writes league data into the database, while the website reads and displays league data.

---

## Running Locally

### Run the bot

```bash
cd bot
npm run dev
```

### Run the website

```bash
cd web
npm run dev
```

---

## Deployment

### Deploy the website to Vercel

1. Set the Vercel project root to `/web`.
2. Add the same environment variables used locally in Vercel:
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_GUILD_ID`
   - `DISCORD_BOT_TOKEN`
   - `BOT_OWNER_ID`
   - `DATABASE_URL`
3. Use the default build command:

```bash
npm run build
```

4. Use the default install command:

```bash
npm install
```

### Deploy the bot separately

The bot deploys outside Vercel. Use any Node.js host or container service.

1. Copy `bot/.env.example` to `bot/.env` and fill in values.
2. Install dependencies in `/bot`:

```bash
cd bot
npm install
```

3. Start the bot:

```bash
npm start
```

---

## Notes

- Do not commit `.env` files or secrets to GitHub.
- Use the package-level `.env.example` files as templates.
- `shared/` contains reusable constants and typings for both packages.


// Get team by name
const team = registry.getTeamByName("USA");

// Add player to roster
await registry.addPlayerToRoster("USA", "playerId", "playerName");

// Remove player from roster
await registry.removePlayerFromRoster("USA", "playerId");

// Save changes to teams.json
await registry.saveTeams();
```

---

## 🚀 Advanced Usage

### Adding a Player to a Roster

To programmatically add players:

```javascript
try {
  await registry.addPlayerToRoster("USA", "roblox_user_id", "Player Name");
  console.log("✅ Player added successfully");
} catch (error) {
  console.error("❌ Error:", error.message);
}
```

### Updating Coach Information

Edit `teams.json` directly:

```json
{
  "teamName": "USA",
  "coachDiscordId": "123456789",
  "coachRobloxId": "roblox_user_id",
  ...
}
```

### Checking Roster Space

```javascript
const team = registry.getTeamByName("USA");
const availableSlots = team.rosterLimit - team.rosterPlayers.length;
console.log(`Available slots: ${availableSlots}/16`);
```

---

## ⚙️ Configuration

### Change Roster Limit

Edit `teams.json`:

```json
{
  "rosterLimit": 20
}
```

### Change Role IDs

Update `roleId` in each team object in `teams.json`.

### Update Coach Information

Set `coachDiscordId` and `coachRobloxId` in teams.json:

```json
{
  "coachDiscordId": "Discord User ID",
  "coachRobloxId": "Roblox User ID"
}
```

---

## 🔧 Error Handling

The bot includes production-ready error handling:

- ✅ Missing environment variables
- ✅ Invalid team names
- ✅ Missing logo files
- ✅ Roster capacity checks
- ✅ Duplicate player detection
- ✅ File I/O errors
- ✅ Discord API errors

All errors are logged to console and displayed to users as embeds.

---

## 📦 Dependencies

- **discord.js** ^14.14.1 - Discord API wrapper
- **dotenv** ^16.3.1 - Environment variable management

---

## 📝 License

ISC

---

## 📞 Support

For issues or questions, check the main.js file for inline documentation.

**RSA | Roblox Soccer Association**
