# MyDopa Project — Read This First

## What this project is
MyDopa is a habit/mindset app. This repo is the blog + website (mydopa.app).

## Folder map
- Blog articles: `blog/`
- Article filenames match the URL slug, e.g. `blog/why-training-transfer-fails.html`
- Canonical master (copy this for every new article): `blog/maxwell-maltz-self-image.html`

## Production system — how every new article is made
1. Copy `maxwell-maltz-self-image.html` verbatim. Rename to the new slug.
2. Populate only the VARIABLE regions. Leave LOCKED regions untouched.

**LOCKED (never edit):**
- Entire `<style>` block
- `<nav>`, `<footer>`, divider, CTA block structure
- Reveal scroll script, PostHog analytics
- Responsive rules, animations

**VARIABLE (article-specific):**
- `<title>`, meta description, canonical URL, OG/Twitter tags
- JSON-LD (headline, description, url, datePublished, dateModified, author, articleSection, keywords)
- `.article-category` label + inline color
- `<h1>`, deck, byline
- Article body
- Lab cards (href, category label + color, title, excerpt)
- Footer signature

**Style block identity check** — run before committing any article:
```
diff <(awk '/<style>/,/<\/style>/' blog/maxwell-maltz-self-image.html) \
     <(awk '/<style>/,/<\/style>/' blog/YOUR-ARTICLE.html)
```
Empty diff = pass. Any output = stop and fix.

## Authorship by lane
- All lanes default to: byline `By DOPA`, JSON-LD author `DOPA`, footer `— DOPA`
- **HGY / IP lane exception**: byline `By René Estripeaut`, JSON-LD author `René Estripeaut`, footer `— René Estripeaut`

## Category colors
Always source category labels and hex colors from `MyDopa_Category_Color_System.md`.
Never copy from the live site — it has drifted from the source of truth more than once.

## Pre-approval gate
Before writing any file, produce a pre-commit report:
- Filename, confirmed URLs, pub date
- Style-block diff result (pass/fail)
- QC table: category label, color, author, lab card values

No file is written until the user approves the report.

## In-body links
Insert as standalone `<p>` elements between paragraphs — do not inline-wrap existing text.
If a referenced article doesn't exist in the repo, flag it and stop. Do not guess or substitute.

## Visual variety components
`.highlight-block` and `.pull-quote` are defined in the style block (added to canonical master in commit `7d9fbb0`). Use the HTML structure from `blog/can-you-remember-last-tuesday.html` as reference.

## Deploying
```
git add blog/YOUR-ARTICLE.html
git commit -m "..."
git push origin main
```
Site is on **GitHub Pages** (DNS managed at GoDaddy) — pushing to `main` triggers auto-deploy. GitHub remote: `estripeautrene-bit/MyDopa.git`.

## Known gotchas
- Local working directory is `DOPAmine/`; GitHub repo is `MyDopa` — if push fails, check `git remote -v`.
- Named-person articles (Maxwell Maltz, Carol Dweck, etc.) require: "MyDopa is not affiliated with or endorsed by [name]."
- Check the repo before starting a new article — don't duplicate existing slugs or topics.
- The method is now called **MyHGY™ Method** (formerly "Have a Great Yesterday Method"). Use MyHGY™ Method in all new content.
