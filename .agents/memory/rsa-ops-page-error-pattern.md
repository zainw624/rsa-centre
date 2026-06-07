---
name: RSA Ops page error pattern
description: How all shell pages handle DB unavailability without crashing
---

Every shell page in artifacts/rsa-ops/app/(shell)/ wraps DB calls in try/catch and shows an amber banner on error instead of crashing.

```tsx
let data: any[] = [];
let dbError = false;
try {
  data = await getSomeDbFunction();
} catch {
  dbError = true;
}
// In JSX:
{dbError ? (
  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/05 px-5 py-8 text-center">
    <p className="text-sm font-semibold text-amber-300">Database not connected</p>
    <p className="mt-1 text-xs text-slate-500">Set DATABASE_URL in Replit Secrets to view this data</p>
  </div>
) : ( /* normal content */ )}
```

**Why:** DATABASE_URL is not yet set in Replit Secrets; without this pattern every page crashes on load.

**How to apply:** Every new shell page must follow this pattern. Never let a bare await of a Prisma/db call sit at the top level of an async server component.
