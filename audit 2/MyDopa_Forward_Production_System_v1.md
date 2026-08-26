# MyDopa Forward Production System v1

**Status:** Installed and authoritative. Effective for all Brain Lab articles published August 7, 2026 forward.
**Legacy policy:** Articles published before August 7, 2026 are not retroactively modified — no label, color, HTML, or CTA cleanup — unless René names a specific page for correction.

**Reconstruction note (August 11, 2026):** This file was found entirely missing from the GitHub repo and was reassembled from the Claude project knowledge base. As of this update, all six sections (A through F) have been recovered via search and are believed complete.

---

## A. Strategic Foundation — Three Forward Lanes

All Brain Lab content belongs to one of three lanes, all running through this one factory:

**1. B2C Core**
The existing consumer SEO/Reddit engine — the primary publishing lane. Serves people already trying to improve who need better visibility into their progress, consistency, capability, evidence, and change. Uses the full one-person/pain-point framing, the Pain-Point Validation Rule, and Reddit Vault validation.

**2. Professional / Thought Leadership**
Content for therapists, coaches, psychologists, HR/L&D professionals, managers, educators, and behavior-change/personal-development professionals. Purpose: professional usefulness, credibility, citations, backlinks, AI/search visibility, shareability, Know-Like-Trust, and building MyDopa's intellectual authority — not direct app conversion. B2B/L&D sits inside this lane as a commercial sub-lane, grounded in the durable individual-level evidence record the product genuinely produces, not unproven organizational ROI claims.

Uses the same Article Production Standard and HTML Production Standard as B2C, but is not forced into the consumer one-person/pain-point structure when the professional reader calls for different structure or depth.

**3. Have a Great Yesterday Method™ / Intellectual Property**

Canonical name: **The Have a Great Yesterday Method™ — powered by persistent small practices.**

Governing definition: **The Have a Great Yesterday Method is the daily practice of showing up for yourself.**

Central claim: **Insight can start change, but consistent practice creates and sustains change.**

Practical logic: **notice → preserve evidence → challenge distortion → return to reality** — combined with visibility, continuity, evidence, and persistent small practice.

An explicit content/IP lane, not background doctrine alone. Generates both consumer-facing and professional-facing articles on awareness, attention, consistency, autobiographical memory, evidence, self-efficacy, implementation, continuity, progress visibility, accuracy, clarity, self-confidence, and the distinction between consuming personal-development insight and practicing it consistently.

**Scientific discipline (applies across all three lanes, sharpest here):** established research may support mechanisms adjacent to the Method. The integrated proprietary Method itself is never described as scientifically proven until MyDopa-specific research exists.

**Underlying architecture (all three lanes):** MyDopa = transformation through visible and continuous progress → visibility + continuity mechanisms → Accuracy → Clarity → Self-Confidence destinations → grounded in "confidence comes from evidence" → practiced daily through HGY (MyToday → MyYesterday → MyProgress, activated by Discoveries) → organized across five pillars (Mindset, Emotions, Body, Goals, Relationships). DOPA is the character/voice layer across all lanes. The older governing sentence ("Your day is already full of wins...") remains valid B2C-entry messaging, not the sole governing line. "Transformation" (noun) is canonical; "transform" (verb) stays restricted elsewhere per the standing anti-AI vocabulary rule.

**Register note:** the Content Register remains the work order for all three lanes. It is not yet expanded with Professional or HGY inventory — that expansion is a deliberate future step, done separately.

---

## B. Article Production Standard v1

**Hard gates (pass/fail):**
- Body word count ≥ 1,200, verified by actual count on stripped body text — never self-reported. Floor, not target; 1,275–1,700 is the normal strong range.
- 2+ natural in-body links to live same-cluster Brain Lab articles; pillar-page link where one exists; exactly 2 links in "Also From the Lab."
- CTA block present — copy and destination must come from the current approved funnel standard; never inherited automatically from the canonical HTML master.
- "By DOPA" at top, "— DOPA" at bottom — both present, no substitution, for B2C Core and Professional/Thought Leadership lanes.
- **HGY/IP lane exception — permanent:** every HGY/IP article is authored by René Estripeaut, not DOPA. Opens "By René Estripeaut · [Month Year] · [N] min read," closes "— René Estripeaut." DOPA remains the MyDopa brand/product voice everywhere else, never the apparent author of the Method itself.
- Named-person disclaimer present whenever a named framework/person is the subject.
- Zero banned vocabulary, zero dead openers/transitions/engagement-bait.
- Category label matches the current Content Register cluster name exactly — no fallback labels.
- Category color pulled from `MyDopa_Category_Color_System.md` for that article's actual cluster.
- **Visual variety — hard requirement, not optional:** every article must use at least one `.highlight-block` (deck or a key line) and at least two `.pull-quote` instances, placed to break up long paragraph stretches. Plain unbroken paragraphs top to bottom is an automatic fail. Checked at HTML QC (§E step 7).
- **"Also From the Lab" category/color must be pulled from `MyDopa_Category_Color_System.md` directly — never copied from what a linked article's card currently displays live on the site, and never inferred from legacy HTML.**

**Editorial quality gates (judgment):**
- Concrete lived specificity — at least one fully developed example with unrepeatable detail.
- Genuine development, not compression.
- MyDopa point of view established early.
- A real reframe, not generic advice.
- Science/framework material as support, not decoration.
- One useful action where the format calls for it.
- Natural pacing.
- The "could any brand have written this?" test.

No arbitrary section-count or citation-count minimums.

**Lead-capture rule (commercial production rule, not a copy preference):**

> Article → CTA → Request an Invitation → name/email capture → next experience.

CTA copy may be contextual to the article ("Try the 7-Day Dare," or another framing that fits the piece). The link destination must route through the approved Request-an-Invitation lead-capture flow before anything deeper. No new article's CTA may send anonymous traffic past that capture step without René's explicit approval of an alternate funnel. Applies forward from August 7, 2026 only.

---

## C. HTML Production Rules

**Division of labor:** The Claude project (chat) does not generate, reconstruct, or approximate final article HTML — not from memory, not from the CSS/structure documented in this file. Its role ends at producing the approved article package (see §E). HTML assembly is owned entirely by Claude Code, which has direct access to the repository and to the actual canonical master file on disk.

- **Canonical master:** `maxwell-maltz-self-image.html` (current August Gen-2 lineage), residing in the MyDopa repository. Supersede only if a later file is confirmed current and different.
- Claude Code copies this file directly from the repo for every new article. CSS/design shell is never regenerated, redesigned, or improvised — copied exactly, byte for byte.
- **LOCKED** (never touched): full `:root` token block, font loads, reset/base body, nav shell, `.article-hero`/`.article-h1`/`.article-deck` structural rules, `.article-body` typographic rules, `.cta-block` structural rules (not copy), `.lab-*` component rules, footer shell, responsive breakpoint block, animations.
- **VARIABLE** (populated by Claude Code from the approved article package): meta/title tags, `.article-category` text and color, title/deck/body copy, byline date/read-time, disclaimer text where applicable, the two "Also From the Lab" entries, JSON-LD article-specific fields (`headline`, `datePublished`, `articleSection`).

---

## D. Cluster Identity Rules

- Category label must exactly match the current Content Register cluster name.
- Category color pulled from `MyDopa_Category_Color_System.md` — never inherited from the master file.
- Category colors are a distinct identification layer, separate from the core Brand Identity Reference (purple/orange) palette.
- MyDopa™ wordmark treatment stays as currently implemented (nav + footer, ™ styled and superscripted).

---

## E. Production Workflow

**Steps 1–4 — Claude project (chat):**
1. Register/topic — pulled from the Content Register, validated against the Pain-Point Validation Rule.
2. Draft — written to voice rules, structure, and the current strategic context (lane-appropriate).
3. Article Production Standard QC — word count verified, link/CTA/signature/disclaimer checks, editorial quality review.
4. Approval — single sign-off, producing the final **approved article package**: body copy, title/deck, cluster name, exact cluster hex, byline date/read time, named-person disclaimer if needed, in-body links, the two "Also From the Lab" entries, CTA copy and approved Request-an-Invitation destination, and article-specific JSON-LD/meta values. This package is the handoff artifact to Claude Code — the Claude project's role ends here.

**Steps 5–8 — Claude Code:**
5. Copy canonical HTML master (`maxwell-maltz-self-image.html`) directly from the repo as the starting file.
6. Populate VARIABLE regions only, using the approved article package from step 4. LOCKED regions untouched.
7. HTML QC — diff the new file's `<style>` block against the canonical master byte-for-byte; any unauthorized difference fails. Confirm cluster label, cluster color, correct lane-specific author/signature, lead-capture routing, JSON-LD `articleSection`, and at least 1 highlight-block + 2 pull-quotes present in the body — fail and return for revision if missing.
8. Publish.

---

## F. Legacy Policy

Everything published before August 7, 2026 is legacy. No retroactive label, color, HTML, CTA, or funnel cleanup unless René names a specific page for correction.
