#!/usr/bin/env python3
"""
Apply 4-column discovery footer to Family B (blog) and Family C (authority/key) pages.
Family A (homepage) is handled separately via direct edit.
"""

import re
from pathlib import Path

ROOT = Path('/Users/reneestripeaut/MyDopa')

EXCLUDED = ('pre-redesign', 'backup', 'DOPAmine', 'claude-seo')

# ── CSS (inserted as a new <style> block before </head>) ─────────────────────

FOOTER_CSS_BLOCK = """\
<style>
  .footer-nav{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;max-width:900px;margin:32px auto 0;padding:32px 24px 0;border-top:1px solid rgba(255,255,255,0.07);text-align:left;position:static;}
  .footer-col h4{font-family:'Playfair Display',Georgia,serif;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gray-muted);margin-bottom:14px;}
  .footer-col a{display:block;color:var(--gray-light);text-decoration:none;font-size:13px;line-height:1.5;margin-bottom:8px;transition:color .15s;}
  .footer-col a:hover{color:#fff;}
  @media(max-width:640px){.footer-nav{grid-template-columns:1fr;gap:24px;}}
</style>
"""

# ── Nav HTML (no Cookie Settings — used on Family B and C) ───────────────────

FOOTER_NAV = """\
<nav class="footer-nav" aria-label="Site navigation">
<div class="footer-col">
<h4>Explore</h4>
<a href="/meaning">Meaning</a>
<a href="/examples">Examples</a>
<a href="/word-mirrors">Word Mirrors</a>
<a href="/feelings">Feelings</a>
<a href="/blog/">Blog</a>
<a href="/myagency/">MyAgency™</a>
</div>
<div class="footer-col">
<h4>Ideas &amp; Research</h4>
<a href="/fall-in-love-with-your-own-progress/">Fall in Love With Your Own Progress™</a>
<a href="/feelings-are-not-facts/">Feelings Are Not Facts™</a>
<a href="/savouring/">Savouring™</a>
<a href="/visibility-and-continuity/">Visibility and Continuity™</a>
<a href="/personal-development-deserves-a-practice/">Personal Development Deserves a Practice™</a>
<a href="/self-efficacy/">Self-Efficacy™</a>
</div>
<div class="footer-col">
<h4>For Professionals</h4>
<a href="/for-organizations/">For Organizations</a>
<a href="/personal-development/">Personal Development</a>
<a href="/self-efficacy/">Self-Efficacy™</a>
<a href="/accuracy-clarity-self-confidence/">Accuracy, Clarity, and Self-Confidence™</a>
<a href="/feelings-are-not-facts/">Feelings Are Not Facts™</a>
<a href="/visibility-and-continuity/">Visibility and Continuity™</a>
</div>
<div class="footer-col">
<h4>Company</h4>
<a href="/privacy">Privacy Policy</a>
<a href="/terms">Terms of Service</a>
<a href="/cookies">Cookie Notice</a>
<a href="mailto:hello@mydopa.app">hello@mydopa.app</a>
</div>
</nav>"""

# ── Family C explicit list ────────────────────────────────────────────────────

FAMILY_C = [
    ROOT / 'accuracy-clarity-self-confidence/index.html',
    ROOT / 'examples/index.html',
    ROOT / 'fall-in-love-with-your-own-progress/index.html',
    ROOT / 'feelings-are-not-facts/index.html',
    ROOT / 'feelings/index.html',
    ROOT / 'for-organizations/index.html',
    ROOT / 'meaning/index.html',
    ROOT / 'myagency/index.html',
    ROOT / 'personal-development-deserves-a-practice/index.html',
    ROOT / 'personal-development/index.html',
    ROOT / 'savouring/index.html',
    ROOT / 'self-efficacy/index.html',
    ROOT / 'visibility-and-continuity/index.html',
    ROOT / 'word-mirrors/index.html',
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def safety_check(path):
    s = str(path)
    for ex in EXCLUDED:
        if ex in s:
            print(f'  SKIP (excluded pattern "{ex}"): {path}')
            return False
    return True

def insert_css(text):
    return text.replace('</head>', FOOTER_CSS_BLOCK + '</head>', 1)

# ── Family B ──────────────────────────────────────────────────────────────────

def update_family_b(path):
    if not safety_check(path):
        return False
    text = path.read_text(encoding='utf-8')
    if 'footer-nav' in text:
        print(f'  SKIP (already updated): {path.name}')
        return False

    text = insert_css(text)

    # Insert footer-nav after the closing </div> of .footer-social
    updated = re.sub(
        r'(<div class="footer-social">.*?</div>)',
        r'\1\n' + FOOTER_NAV,
        text,
        count=1,
        flags=re.DOTALL,
    )
    if updated == text:
        # Fallback: insert before </footer>
        updated = text.replace('</footer>', FOOTER_NAV + '\n</footer>', 1)

    path.write_text(updated, encoding='utf-8')
    return True

# ── Family C ──────────────────────────────────────────────────────────────────

def update_family_c(path):
    if not safety_check(path):
        return False
    text = path.read_text(encoding='utf-8')
    if 'footer-nav' in text:
        print(f'  SKIP (already updated): {path.name}')
        return False

    text = insert_css(text)

    # Replace <div class="footer-links">...</div> with footer-nav
    updated = re.sub(
        r'<div class="footer-links">.*?</div>',
        FOOTER_NAV,
        text,
        count=1,
        flags=re.DOTALL,
    )
    if updated == text:
        print(f'  WARNING: footer-links pattern not found in {path}')
        return False

    path.write_text(updated, encoding='utf-8')
    return True

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    blog_files = sorted((ROOT / 'blog').glob('*.html'))
    b_done = b_skip = 0
    for f in blog_files:
        if update_family_b(f):
            b_done += 1
        else:
            b_skip += 1
    print(f'\nFamily B: {b_done} updated, {b_skip} skipped of {len(blog_files)} total')

    c_done = c_skip = 0
    for f in FAMILY_C:
        if update_family_c(f):
            c_done += 1
        else:
            c_skip += 1
    print(f'Family C: {c_done} updated, {c_skip} skipped of {len(FAMILY_C)} total')

if __name__ == '__main__':
    main()
