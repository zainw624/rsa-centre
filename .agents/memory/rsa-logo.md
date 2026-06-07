---
name: RSA logo file
description: Status and details of the rsa1.png logo asset
---

The real RSA logo is the official "Roblox Soccer Association" circular crest:
- Gold/black/white badge — "ROBLOX SOCCER ASSOCIATION · RSA · MMXXVI"
- 592×592px PNG, 370KB
- Has a black background (the logo itself, not just the container)

File location: `artifacts/rsa-ops/public/assets/rsa1.png`

**History:** The original rsa1.png committed to GitHub was a 1×1 pixel stub (70 bytes).
A generated placeholder (dark navy + gold "RSA" wordmark) was used temporarily.
The user then provided the real crest which now replaces it.

**Why it matters:** The real logo has a black background — the container styling
in login page, sidebar, and BrandHeader uses dark navy/black backgrounds which
complement the logo naturally. No need to adjust container colors.

**After replacing rsa1.png:** Always clear `.next/cache/images/` and restart
the workflow to flush Next.js image optimisation cache.
