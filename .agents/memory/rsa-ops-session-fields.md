---
name: RSA Ops session fields
description: Shape of the NextAuth session.user object in this project
---

Defined in artifacts/rsa-ops/types/next-auth.d.ts:

```ts
session.user = {
  id: string          // DB user id
  discordId: string   // Discord snowflake
  permission: 'owner' | 'administrator' | 'league' | 'results' | 'manager' | 'viewer'
  roles: string[]     // raw Discord role names e.g. 'RSA | Founders'
  name: string        // Discord display name
  image: string       // Discord avatar URL
}
```

Permission rank (lowest→highest): viewer=0, manager=1, results=2, league=3, administrator=4, owner=5

**Why:** Sidebar, TopNav, and all page-level access guards depend on this shape.

**How to apply:** Use session.user.permission for access checks (not the roles array). Cast with `(session.user as any)` where needed since some pages predate the type augmentation.
