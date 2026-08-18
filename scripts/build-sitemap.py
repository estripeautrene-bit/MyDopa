#!/usr/bin/env python3
"""
Rebuilds sitemap.xml from the repo's live published pages.

Include logic (mirrors the manual audit from 2026-08-18):
  - Homepage and four product pages (fixed, hardcoded)
  - Every blog/*.html whose rel="canonical" href matches
    https://mydopa.app/blog/{slug}  (slug = filename stem)

Exclude automatically:
  - blog/index.html          → canonical is /blog/, not /blog/index
  - DOPAmine_Blog_Post2_*.html → canonical points to renamed slug
  - Redirect stubs (2 KB files) → canonical points to a different slug
  - Any file with no canonical tag at all
"""

import re
from pathlib import Path

ROOT     = Path(__file__).parent.parent
BLOG_DIR = ROOT / "blog"
SITEMAP  = ROOT / "sitemap.xml"
BASE     = "https://mydopa.app"

FIXED_PAGES = [
    (f"{BASE}/",            "1.0"),
    (f"{BASE}/meaning",     "0.9"),
    (f"{BASE}/examples",    "0.9"),
    (f"{BASE}/word-mirrors","0.9"),
    (f"{BASE}/feelings",    "0.9"),
]

ENTRY = "  <url>\n    <loc>{loc}</loc>\n    <priority>{prio}</priority>\n  </url>"

def get_canonical(path: Path) -> str | None:
    text = path.read_text(encoding="utf-8", errors="ignore")
    m = re.search(r'rel="canonical"\s+href="([^"]+)"', text)
    if not m:
        m = re.search(r'href="([^"]+)"\s+rel="canonical"', text)
    return m.group(1).rstrip("/") if m else None

def blog_urls():
    for path in sorted(BLOG_DIR.glob("*.html")):
        expected  = f"{BASE}/blog/{path.stem}"
        canonical = get_canonical(path)
        if canonical == expected:
            yield expected

def build():
    all_urls = list(FIXED_PAGES) + [(u, "0.8") for u in blog_urls()]

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, prio in all_urls:
        lines.append(ENTRY.format(loc=loc, prio=prio))
    lines.append("</urlset>")

    SITEMAP.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"sitemap.xml: {len(all_urls)} URLs written")

if __name__ == "__main__":
    build()
