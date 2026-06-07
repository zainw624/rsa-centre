---
name: RSA logo file
description: Status and details of the rsa1.png logo asset
---

The original rsa1.png (both in public/assets/ and in .migration-backup/web/public/assets/) was a 1×1 pixel RGBA PNG stub (70 bytes) — it was never the real logo.

**Fix applied:** Generated a proper 512×512px PNG using ImageMagick's `magick` command (not `convert` — use `magick` in IMv7+):
- Background: #0b1220 (dark navy)
- Border: #c9a55a (RSA gold)
- Text: "RSA" in DejaVu-Sans-Bold, #c9a55a

**Why:** The real logo asset was never committed to the GitHub repo. The 1×1 stub caused a bright red placeholder square in all logo locations.

**How to apply:** If the user ever provides their actual logo file, replace /public/assets/rsa1.png. The image is referenced throughout as `src="/assets/rsa1.png"` in Next.js Image components.

**After replacing the stub:** Always clear `.next/cache/images/` (or the entire `.next/` dir) and restart the workflow to flush Next.js image optimization cache.
