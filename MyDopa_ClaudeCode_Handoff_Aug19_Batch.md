# Claude Code Handoff — Wednesday Batch (11 articles)

**Everything you need is in this brief. Do not re-derive, re-fetch the blog, or re-parse the register for anything already given here.** Anti-repeat, cluster colors, slugs, keywords, and internal-link targets are already resolved. Your job is: write 11 bodies → build 11 HTML files → one commit → one deploy.

---

## CREDIT-EFFICIENCY RULES (follow exactly)

1. Read CLAUDE.md, `MyDopa_Forward_Production_System_v1.md` (§B Article Standard, §C HTML Rules), and `MyDopa_Category_Color_System.md` **once** at the start. Do not re-open per article.
2. Colors, slugs, keywords, and link targets are in the table below — **do not open the color file or the register to look them up again.**
3. Do **not** web-fetch the blog. Anti-repeat is already done; live link targets are listed per article.
4. Write all 11 bodies first. Then build all 11 HTML files by copying the canonical master and filling only VARIABLE regions. Never touch LOCKED regions.
5. Verify word count with `wc -w` on all 11 in **one** batched pass (floor 1,200; strong range 1,275–1,700).
6. **One** git commit, **one** Cloudflare deploy at the end. Not per-article.
7. If something is genuinely blocked, stop and report — do not improvise around a locked rule (shell design, CTA destination, byline, colors).

---

## REPO SELF-CHECK (do first, ~30 sec)

- [ ] `maxwell-maltz-self-image.html` present (canonical master — copy its shell exactly).
- [ ] CLAUDE.md + Forward Production System + Category Color System are current synced versions.
- [ ] Confirm register-update ownership this cycle (Claude Code vs chat) before editing the .xlsx — avoid double-edit.

---

## THE WORK ORDER — 11 ARTICLES

Lane split: 9 B2C Core + 2 Professional. Category label = the cluster name exactly as in the color table. Slugs are proposals — once set, they lock.

| # | ID | Lane | Category label (tag) | Hex | Proposed slug | Working title | Primary keyword |
|---|----|------|----------------------|-----|---------------|---------------|-----------------|
| 1 | E-4 | B2C | Small Wins | `#A3E635` | why-celebrating-small-wins-matters | Why Celebrating Small Wins Matters More Than You Think | celebrating small wins psychology |
| 2 | A-8 | B2C | Invisible Progress | `#FFB020` | why-motivation-fades-when-results-feel-invisible | Why Motivation Fades When Results Feel Invisible | motivation fades no visible results |
| 3 | D-9 | B2C | Goals and Commitment | `#34D399` | pre-commitment-beats-motivation | Pre-Commitment: The Strategy That Beats Motivation Every Time | pre-commitment strategy goals |
| 4 | C-6 | B2C | Mental Resilience | `#38BDF8` | resilience-is-built-backwards | Why Resilience Is Built Backwards (From Evidence, Not Hope) | how resilience is built evidence |
| 5 | B-4 | B2C | Negativity Bias | `#2DD4BF` | the-12-second-rule | The 12-Second Rule for Installing Positive Experience | install positive experience brain |
| 6 | G-4 | B2C | Belief and Identity | `#F472B6` | why-self-sabotage-happens | Why Self-Sabotage Happens and What It Is Actually Protecting | why self sabotage happens psychology |
| 7 | W-2 | B2C | Male Over-30 | `#D4A574` | the-gap-between-knowing-and-doing | The Gap Between Knowing and Doing | gap between knowing and doing |
| 8 | X-4 | B2C | Long-View Scoreboard | `#FDE68A` | some-progress-looks-like-peace | Some Progress Looks Like Peace | what gets better with age progress peace |
| 9 | U-3 | B2C | Life Script Collapse | `#FDA4AF` | does-anyone-actually-feel-good-anymore | Does Anyone Actually Feel Good Anymore? | does anyone actually feel good anymore |
| 10 | I-5 | Professional | Identity Lag | `#E879F9` | why-clients-dont-feel-their-progress | Why Clients Understand Their Progress Intellectually But Don't Feel It | intellectual insight vs emotional insight |
| 11 | D-19 | Professional | Goals and Commitment | `#34D399` | why-coaching-clients-dont-follow-through | Why Coaching Clients Don't Follow Through on Goals They Actually Want | why clients don't follow through on goals |

> **W-2 register note:** ID `W-2` appears twice in the register (Male Over-30 **and** Word Campaign). Target the **Male Over-30 / "gap between knowing and doing"** row only. Flag the collision; do not renumber without approval.

---

## INTERNAL LINKS (already resolved — use these exact live slugs)

Rule: 2+ in-body links to same-cluster live articles, linked naturally. Four clusters below are thin/new — approved adjacent-cluster targets are provided so you still hit 2 links without fabricating. All paths are under `https://mydopa.app/blog/`.

- **E-4 (Small Wins):** how-to-track-personal-progress · two-minute-daily-mindset-practice · daily-wins-habit-brain-rewire
- **A-8 (Invisible Progress):** why-doing-the-work-does-not-feel-like-anything · invisible-progress · self-improvement-burnout · consistency-is-the-compounding-effect
- **D-9 (Goals and Commitment):** why-most-people-never-actually-commit-to-a-goal · implementation-intentions · woop-method-goal-setting · wanting-vs-deciding
- **C-6 (Mental Resilience):** how-to-build-mental-resilience · positive-neuroplasticity-how-to-rewire-your-brain · mental-resilience-vs-emotional-intelligence · the-moment-a-habit-stops-being-hard
- **B-4 (Negativity Bias):** five-to-one-rule-negativity-bias · why-you-remember-criticism-more-than-praise · your-brain-is-deleting-your-day · why-do-i-only-remember-bad-things
- **G-4 (Belief and Identity — 1 same-cluster):** how-to-change-limiting-beliefs (same) + adjacent: the-belief-ceiling · why-you-reject-yourself-before-anyone-else-can
- **W-2 (Male Over-30 — 0 same-cluster):** adjacent only: why-doing-the-work-does-not-feel-like-anything · you-do-not-have-a-discipline-problem · i-thought-id-be-further-along-by-now
- **X-4 (Long-View Scoreboard — 1 same-cluster):** what-older-happy-people-know-about-progress (same) + adjacent: why-you-keep-moving-the-finish-line · when-you-have-more-tools-but-feel-less-alive
- **U-3 (Life Script Collapse — 0 same-cluster):** adjacent only: when-you-have-more-tools-but-feel-less-alive · why-do-millennials-feel-numb · why-nothing-ever-feels-like-enough
- **I-5 (Identity Lag):** why-growth-feels-invisible · your-brain-hasnt-caught-up-yet · identity-lag-self-image-change · why-you-still-feel-the-same-after-changing
- **D-19 (Goals and Commitment):** same pool as D-9 (pick 2 not already used in D-9 where possible)

**"Also From the Lab" (mandatory, ships with the article):** exactly 2 links, related cluster. Where a new cluster has no siblings, pull the cross-cluster relation (science↔practice, or the adjacency above).

---

## STANDARDS (don't re-derive — this is the short reminder)

- **Structure — B2C (1–9):** emotional opening → shame removal → hidden mechanism → real examples → MyDopa reframe → one practical behavior → identity shift → CTA.
- **Structure — Professional (10–11):** use the structure that fits the professional reader (research synthesis / argument-led / framework). Not forced into the 8-part emotional shape. Same word-count, linking, CTA, and HTML gates apply.
- **Voice / Anti-AI:** per Forward Production System. Banned words (transform-verb, journal, gratitude, amazing, incredible, life-changing, delve/leverage/etc.), no negative parallelism, no dead openers, no engagement bait. "Transformation" (noun) is allowed.
- **CTA / Lead-Capture:** every article ends with a CTA routing through the Request-an-Invitation flow → `https://mydopa.app/?quiz=open`. CTA copy may be contextual.
- **Byline:** open "By DOPA · August 2026 · [N] min read"; close "— DOPA". (These are all B2C/Professional — **not** HGY — so DOPA signature, not René.)
- **HTML:** copy `maxwell-maltz-self-image.html` shell exactly. Fill only VARIABLE regions (meta/title, category label + hex, title/deck/body, byline, "Also From the Lab" entries, JSON-LD article fields). Never touch LOCKED regions.
- **No named-person articles in this batch** — no disclaimer needed.

---

## PUBLISH ORDER

Publish Order Rule: max 2 consecutive same-cluster tags. Only conflict in this batch: **D-9 and D-19 are both Goals and Commitment — do not schedule them adjacent.** Everything else is a distinct cluster; sequence freely around that one constraint.

---

## FINAL QA GATE (one pass, then deploy)

- [ ] 11 files, each ≥1,200 words (`wc -w`, batched).
- [ ] Category label matches table; hex matches table.
- [ ] 2+ in-body internal links per article (same-cluster, or approved adjacency for G-4/W-2/X-4/U-3).
- [ ] Exactly 2 "Also From the Lab" links each.
- [ ] CTA → quiz=open present; "By DOPA" open + "— DOPA" close present.
- [ ] Zero banned vocab / dead openers / negative parallelism.
- [ ] LOCKED regions untouched (diff the shell against master).
- [ ] One commit, one Cloudflare deploy.

Report back: files built, word counts, final publish sequence, and the W-2 collision status.
