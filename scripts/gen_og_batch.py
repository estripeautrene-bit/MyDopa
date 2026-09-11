#!/usr/bin/env python3
"""Batch OG image generator — MyDopa. Produces 1200×630 PNG headline cards."""
from PIL import Image, ImageDraw, ImageFont
import os

REPO    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(REPO, "images")
W, H    = 1200, 630
AMBER, WHITE, PURPLE, MUTED = "#FFB020", "#FFFFFF", "#B57BF7", "#5A5470"

# slug (without images/ prefix or .png suffix) → pre-split display lines
PAGES = {
    "og-i-changed-but-i-still-feel-like-the-old-me": "I Changed But I Still\nFeel Like the Old Me",
    "og-why-you-still-feel-the-same-after-changing":  "Why You Still Feel\nthe Same After Changing",
    "og-your-brain-hasnt-caught-up-yet":              "Your Brain Hasn't\nCaught Up Yet",
    "og-everyone-else-is-not-ahead-of-you":           "Everyone Else Is\nNot Ahead of You",
    "og-why-everyone-seems-ahead-of-you":             "Why Everyone\nSeems Ahead of You",
    "og-why-everyone-feels-behind-in-life":           "Why Everyone\nFeels Behind in Life",
    "og-why-high-achievers-feel-behind":              "Why High Achievers\nFeel Behind",
    "og-you-are-not-behind":                          "You Are\nNot Behind",
}

def get_font(size, weight="bold"):
    bold = ["/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf",
            "/System/Library/Fonts/HelveticaNeue.ttc"]
    reg  = ["/System/Library/Fonts/Supplemental/Arial.ttf",
            "/Library/Fonts/Arial.ttf",
            "/System/Library/Fonts/HelveticaNeue.ttc"]
    for path in (bold if weight == "bold" else reg):
        if os.path.exists(path):
            try: return ImageFont.truetype(path, size)
            except Exception: continue
    return ImageFont.load_default()

def make_og(headline: str, out_path: str):
    img  = Image.new("RGBA", (W, H), color=(14, 11, 26, 255))
    draw = ImageDraw.Draw(img)

    # bottom bloom — identical to original script
    BLOOM_H, BLOOM_ALPHA = 225, 48
    for y in range(H - 1, H - BLOOM_H, -1):
        t     = (H - y) / BLOOM_H
        alpha = int(BLOOM_ALPHA * (1 - t))
        r = 14 + int((255 - 14) * alpha / 255 * 0.55)
        g = 11 + int((176 - 11) * alpha / 255 * 0.30)
        for x in range(W):
            draw.point((x, y), fill=(r, g, 26, 255))

    draw.text((68, 52),     "MyDopa · mydopa.app", font=get_font(23, "regular"), fill=AMBER)
    draw.text((68, H - 48), "mydopa.app",           font=get_font(24, "regular"), fill=MUTED)

    FONT_SIZE, LINE_GAP = 88, int(88 * 1.15)
    h1    = get_font(FONT_SIZE)
    lines = headline.split("\n")
    for i, line in enumerate(lines):
        color = PURPLE if i == len(lines) - 1 else WHITE
        draw.text((68, 155 + i * LINE_GAP), line, font=h1, fill=color)

    img.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"✅  {os.path.basename(out_path)}")

os.makedirs(IMG_DIR, exist_ok=True)
for slug, headline in PAGES.items():
    make_og(headline, os.path.join(IMG_DIR, f"{slug}.png"))
