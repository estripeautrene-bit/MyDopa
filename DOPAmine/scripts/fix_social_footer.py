#!/usr/bin/env python3
"""Phase 2: Fix Instagram/LinkedIn URLs, add TikTok + YouTube to footer."""
import os, glob

ROOT = "/Users/reneestripeaut/MyDopa"

TIKTOK = '    <a href="https://www.tiktok.com/@mydopa_app" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.23 8.23 0 0 0 4.83 1.55V6.79a4.83 4.83 0 0 1-1.06-.1z"/></svg></a>'

YOUTUBE = '    <a href="https://www.youtube.com/@MyDopa_app" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>'

# Unique suffix of the LinkedIn SVG path — used as insertion anchor
LINKEDIN_ANCHOR_END = 'h.003z"/></svg></a>\n  </div>'
LINKEDIN_WITH_NEW   = 'h.003z"/></svg></a>\n' + TIKTOK + '\n' + YOUTUBE + '\n  </div>'

files = (
    glob.glob(os.path.join(ROOT, "blog", "*.html")) +
    [os.path.join(ROOT, "landing-es.html")]
)

updated = skipped = errors = 0
for path in sorted(files):
    with open(path, encoding="utf-8") as f:
        src = f.read()

    if "footer-social" not in src:
        continue

    # Already has TikTok/YouTube → skip (idempotency)
    if "tiktok.com/@mydopa_app" in src:
        skipped += 1
        continue

    changed = src

    # 1. Fix Instagram handle
    changed = changed.replace(
        "https://www.instagram.com/have_a_great_yesterday/",
        "https://www.instagram.com/mydopa_app/",
    )

    # 2. Fix LinkedIn numeric ID
    changed = changed.replace(
        "https://www.linkedin.com/company/myhgy/",
        "https://www.linkedin.com/company/113233465/",
    )

    # 3. Insert TikTok + YouTube after LinkedIn anchor
    if LINKEDIN_ANCHOR_END not in changed:
        print(f"WARNING — anchor not found: {path}")
        errors += 1
        continue

    changed = changed.replace(LINKEDIN_ANCHOR_END, LINKEDIN_WITH_NEW, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(changed)
    updated += 1

print(f"Updated : {updated}")
print(f"Skipped : {skipped}")
print(f"Errors  : {errors}")
