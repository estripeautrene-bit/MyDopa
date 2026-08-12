import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── Score maps ────────────────────────────────────────────────
const q3Map: Record<string, number> = {
  'takes-a-while':    1,
  'feel-distant':     2,
  'not-enough-solid': 3,
  'call-up-fast':     4,
}
const q4Map: Record<string, number> = {
  'rarely-notice':   1,
  'gone-by-bedtime': 2,
  'no-proof':        3,
  'fuels-next-day':  4,
}

// ─── Scoring helpers ───────────────────────────────────────────
function getTier(score: number): 'Emerging' | 'Building' | 'Resilient' {
  if (score <= 4) return 'Emerging'
  if (score <= 9) return 'Building'
  return 'Resilient'
}

function getGapToNextTier(score: number): { gap: number; nextTier: string } | null {
  if (score < 5)  return { gap: 5  - score, nextTier: 'Building' }
  if (score < 10) return { gap: 10 - score, nextTier: 'Resilient' }
  return null
}

function getScoreBreakdown(answers: Record<string, string | number>) {
  return {
    dailyRecall:   { value: Number(answers.q2_likert),                        max: 5 },
    evidenceSpeed: { value: q3Map[answers.q3_evidence as string] ?? 0,        max: 4 },
    winRetention:  { value: q4Map[answers.q4_good_day  as string] ?? 0,       max: 4 },
  }
}

// ─── Profile data ──────────────────────────────────────────────
const PROFILES: Record<string, { label: string; tagline: string }> = {
  'invisible-progress': { label: 'Invisible Progress', tagline: 'You are doing more than your brain is letting you keep.' },
  'feeling-behind':     { label: 'Feeling Behind',     tagline: 'You have been measuring yourself by the gap. DOPA measures you by what is already building.' },
  'identity-lag':       { label: 'Identity Lag',       tagline: 'You are further along than your brain has learned to show you yet. DOPA closes that gap.' },
  'self-trust-gap':     { label: 'Self-Trust Gap',     tagline: 'You have handled more than you remember. DOPA keeps the record so it is always within reach.' },
  'life-on-pause':      { label: 'Life on Pause',      tagline: 'Even on pause, you keep building. DOPA makes it visible, understandable, and yours to keep.' },
}

// ─── Unsubscribe URL ───────────────────────────────────────────
function unsubUrl(email: string): string {
  return `${SUPABASE_URL}/functions/v1/unsubscribe?email=${encodeURIComponent(email)}`
}

// ─── Shared email CSS ──────────────────────────────────────────
const SHARED_CSS = `
  body{margin:0;padding:0;background:#EAE8E3;font-family:'DM Sans',-apple-system,sans-serif;}
  .preheader{display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#FAFAF7;}
  .email-shell{max-width:600px;margin:40px auto;background:#FAFAF7;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,0.06);}
  .pad{padding:36px 40px 8px 40px;}
  .center{text-align:center;}
  .mascot{width:190px;margin:0 0 6px 0;}
  .logo{font-family:'Playfair Display',serif;font-weight:900;font-size:26px;color:#06000D;}
  .logo span{color:#7B2FBE;}
  .logo sup{font-size:11px;font-weight:700;}
  .body-copy{font-family:'DM Sans',sans-serif;font-weight:400;font-size:15px;line-height:1.75;color:#2A2730;text-align:left;margin:0 0 18px 0;}
  .body-copy strong{font-weight:700;color:#06000D;}
  .accent-amber{color:#FFB020;font-weight:700;}
  .brand-word{font-weight:700;color:#06000D;}
  .brand-word .brand-dopa{color:#7B2FBE;}
  .feature-word{color:#7B2FBE;font-weight:700;}
  .prompt-block{background:#F7F3FC;border-left:3px solid #7B2FBE;border-radius:6px;padding:16px 20px;margin:4px 0 22px 0;}
  .prompt-block p{margin:0;}
  .sentence-stem{font-family:'Playfair Display',serif;font-weight:700;font-style:italic;font-size:16px;color:#06000D;}
  .keyline{font-family:'Playfair Display',serif;font-weight:700;font-style:italic;font-size:19px;line-height:1.5;color:#7B2FBE;text-align:center;margin:8px 0 26px 0;padding:20px 10px;border-top:1px solid #F0EDF7;border-bottom:1px solid #F0EDF7;}
  .signoff{font-family:'DM Sans',sans-serif;font-size:14px;color:#2A2730;text-align:left;margin:8px 0 4px 0;}
  .signature{font-family:'Playfair Display',serif;font-weight:700;font-size:15px;color:#7B2FBE;margin:0 0 28px 0;}
  .footer{border-top:1px solid #EDE7F0;padding:20px 40px 28px 40px;font-family:'DM Sans',sans-serif;font-size:11.5px;line-height:1.6;color:#9B96A3;text-align:left;}
  .footer a{color:#9B96A3;text-decoration:underline;}
  .footer .sender{color:#6B6670;font-weight:600;}
`

const GOOGLE_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>`

const MASCOT_URL = 'https://mydopa.app/assets/mascot.png'

function emailHeader(): string {
  return `<div class="center">
    <img class="mascot" src="${MASCOT_URL}" alt="Dopa" width="190"/>
    <div class="logo">My<span>Dopa</span><sup>&#8482;</sup></div>
  </div>`
}

function emailFooter(email: string): string {
  const u = unsubUrl(email)
  return `<div class="footer">
    You&rsquo;re receiving this because you joined the early <span class="sender">MyDopa</span> email list and opted in to receive launch updates.<br/>
    Unsubscribe from future emails: <a href="${u}">${u}</a><br/><br/>
    <span class="sender">MyDopa</span> &mdash; Ren&eacute; Estripeaut, doing business as MyDopa<br/>
    5401 NW 72nd Ave, Suite LPX 15004, Miami, Florida 33166, United States<br/>
    hello@mydopa.app
  </div>`
}

// ─── Email 1 builder ───────────────────────────────────────────
function buildEmail1Html(
  name:    string,
  profile: string | null,
  score:   number,
  answers: Record<string, string | number>,
  email:   string,
): string {
  const data      = (profile && PROFILES[profile]) ? PROFILES[profile] : PROFILES['invisible-progress']
  const tier      = getTier(score)
  const gap       = getGapToNextTier(score)
  const bd        = getScoreBreakdown(answers)
  const pct       = (v: number, max: number) => `${Math.round(v / max * 100)}%`
  const dashoffset = (402.12 * (1 - score / 13)).toFixed(2)

  const zoneItems = [
    { label: 'Emerging',  bg: '#EDE7F9', extra: 'border:1px solid #D8CFEA;' },
    { label: 'Building',  bg: '#D3B8F5', extra: '' },
    { label: 'Resilient', bg: '#7B2FBE', extra: 'opacity:0.35;' },
  ]
  const zoneKeys = zoneItems.map(z =>
    `<span class="zone-key${tier === z.label ? ' active-key' : ''}">` +
    `<span class="zone-dot" style="background:${z.bg};${z.extra}"></span>${z.label}</span>`
  ).join('')

  const pathForward = gap === null
    ? `<span class="gap">You&rsquo;ve already reached Resilient.</span> MyDopa&rsquo;s job now is helping you keep it that way.`
    : `<span class="gap">${gap.gap} point${gap.gap === 1 ? '' : 's'} from ${gap.nextTier}.</span> That is exactly the gap <span class="brand">MyDopa</span> is built to close &mdash; one captured moment at a time.`

  const scorecard = `
  <div class="scorecard">
    <div class="eyebrow">Visibility-Powered Motivation</div>
    <div class="brand-subtitle"><span class="brand-word">My<span class="brand-dopa">Dopa</span></span> makes invisible personal progress visible, understandable, and cumulative.</div>
    <div class="gauge-wrap">
      <div class="gauge-glow"></div>
      <svg class="gauge-svg" width="200" height="200" viewBox="0 0 200 200">
        <g>
          <line x1="100.00" y1="10.00" x2="100.00" y2="2.00"   stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="141.83" y1="20.31" x2="145.54" y2="13.23"  stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="174.07" y1="48.87" x2="180.65" y2="44.33"  stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="189.34" y1="89.15" x2="197.29" y2="88.19"  stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="184.15" y1="131.91" x2="191.63" y2="134.75" stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="159.68" y1="167.37" x2="164.99" y2="173.35" stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="121.54" y1="187.38" x2="123.45" y2="195.15" stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="78.46"  y1="187.38" x2="76.55"  y2="195.15" stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="40.32"  y1="167.37" x2="35.01"  y2="173.35" stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="15.85"  y1="131.91" x2="8.37"   y2="134.75" stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="10.66"  y1="89.15"  x2="2.71"   y2="88.19"  stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="25.93"  y1="48.87"  x2="19.35"  y2="44.33"  stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
          <line x1="58.17"  y1="20.31"  x2="54.46"  y2="13.23"  stroke="#D8CFEA" stroke-width="2" stroke-linecap="round"/>
        </g>
        <path d="M 100.00 18.00 A 82 82 0 0 1 157.98 157.98" fill="none" stroke="#EDE7F9" stroke-width="9" stroke-linecap="round"/>
        <path d="M 154.87 160.94 A 82 82 0 0 1 18.11 95.71"  fill="none" stroke="#D3B8F5" stroke-width="9" stroke-linecap="round"/>
        <path d="M 18.45 91.43 A 82 82 0 0 1 95.71 18.11"    fill="none" stroke="#7B2FBE" stroke-width="9" stroke-linecap="round" opacity="0.35"/>
        <circle cx="100" cy="100" r="64" fill="none" stroke="#F5F2FA" stroke-width="13"/>
        <circle cx="100" cy="100" r="64" fill="none" stroke="url(#ringGradient)" stroke-width="13"
                stroke-linecap="round" stroke-dasharray="402.12" stroke-dashoffset="${dashoffset}"
                transform="rotate(-90 100 100)"/>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#A855F7"/>
            <stop offset="100%" stop-color="#7B2FBE"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="gauge-center">
        <div class="gauge-number">${score}</div>
        <div class="gauge-denom">OF 13</div>
      </div>
    </div>
    <div class="gauge-zone-legend">${zoneKeys}</div>
    <div class="profile-label">${data.label}</div>
    <div class="profile-rule"></div>
    <div class="tagline">&ldquo;${data.tagline}&rdquo;</div>
    <div class="breakdown">
      <div class="breakdown-title">What Your Score Is Made Of</div>
      <div class="metric-row">
        <div class="metric-label-row">
          <span class="metric-name">Daily Recall</span>
          <span class="metric-frac">${bd.dailyRecall.value} / ${bd.dailyRecall.max}</span>
        </div>
        <p class="metric-desc">How much of today you can actually name, moment by moment &mdash; not the highlight reel, the real total.</p>
        <div class="metric-track"><div class="metric-fill" style="width:${pct(bd.dailyRecall.value, bd.dailyRecall.max)};"></div></div>
      </div>
      <div class="metric-row">
        <div class="metric-label-row">
          <span class="metric-name">Evidence Speed</span>
          <span class="metric-frac">${bd.evidenceSpeed.value} / ${bd.evidenceSpeed.max}</span>
        </div>
        <p class="metric-desc">How fast you can prove to yourself, mid-crisis, that you actually handle things.</p>
        <div class="metric-track"><div class="metric-fill" style="width:${pct(bd.evidenceSpeed.value, bd.evidenceSpeed.max)};"></div></div>
      </div>
      <div class="metric-row">
        <div class="metric-label-row">
          <span class="metric-name">Win Retention</span>
          <span class="metric-frac">${bd.winRetention.value} / ${bd.winRetention.max}</span>
        </div>
        <p class="metric-desc">How long a genuinely good day survives in your memory before it quietly disappears.</p>
        <div class="metric-track"><div class="metric-fill" style="width:${pct(bd.winRetention.value, bd.winRetention.max)};"></div></div>
      </div>
    </div>
    <div class="path-forward">${pathForward}</div>
  </div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MyDopa &mdash; Progress Profile Email</title>
${GOOGLE_FONTS}
<style>
${SHARED_CSS}
  .h1{font-family:'Playfair Display',serif;font-weight:900;font-size:27px;line-height:1.35;color:#06000D;text-align:center;margin:22px 0 30px 0;}
  .h1 .accent{color:#7B2FBE;}
  .brand-subtitle{font-family:'DM Sans',sans-serif;font-style:italic;font-weight:400;font-size:13.5px;line-height:1.5;color:#4A4650;max-width:440px;margin:0 auto 22px auto;}
  .scorecard{margin:8px 0 30px 0;padding:32px 28px 30px 28px;background:linear-gradient(180deg,#FFFFFF 0%,#FCFAFF 100%);border:1px solid #EFE8FB;border-radius:20px;box-shadow:0 4px 28px rgba(123,47,190,0.09);text-align:center;}
  .eyebrow{font-family:'DM Sans',sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#E0A100;margin:0 0 18px 0;}
  .gauge-wrap{position:relative;width:200px;height:200px;margin:0 auto 6px auto;}
  .gauge-glow{position:absolute;top:50%;left:50%;width:68px;height:68px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 42% 38%,#FFF6DE 0%,#FFC94D 45%,#FFB020 72%,rgba(255,176,32,0) 100%);}
  .gauge-svg{position:relative;z-index:2;}
  .gauge-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:3;text-align:center;}
  .gauge-number{font-family:'Playfair Display',serif;font-weight:900;font-size:44px;color:#7B2FBE;line-height:1;margin-bottom:6px;}
  .gauge-denom{font-family:'DM Sans',sans-serif;font-weight:700;font-size:11px;color:#8A6BAE;letter-spacing:1px;}
  .gauge-zone-legend{display:flex;justify-content:center;gap:18px;margin:4px 0 24px 0;}
  .zone-key{display:flex;align-items:center;gap:5px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:10.5px;letter-spacing:0.3px;color:#A79FC0;}
  .zone-key.active-key{color:#06000D;}
  .zone-dot{width:8px;height:8px;border-radius:50%;display:inline-block;}
  .profile-label{font-family:'Playfair Display',serif;font-weight:900;font-size:28px;color:#7B2FBE;margin:0 0 4px 0;}
  .profile-rule{width:44px;height:3px;background:#FFB020;border-radius:3px;margin:10px auto 16px auto;}
  .tagline{font-family:'DM Sans',sans-serif;font-style:italic;font-weight:400;font-size:14.5px;line-height:1.6;color:#4A4650;max-width:420px;margin:0 auto 26px auto;}
  .breakdown{text-align:left;padding-top:22px;border-top:1px solid #F0EDF7;margin-bottom:22px;}
  .breakdown-title{font-family:'DM Sans',sans-serif;font-weight:700;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#A79FC0;margin:0 0 14px 0;}
  .metric-row{margin-bottom:12px;}
  .metric-row:last-child{margin-bottom:0;}
  .metric-label-row{display:flex;justify-content:space-between;font-family:'DM Sans',sans-serif;font-size:12.5px;margin-bottom:5px;}
  .metric-name{color:#06000D;font-weight:600;}
  .metric-frac{color:#A79FC0;font-weight:600;}
  .metric-desc{font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.5;color:#6B6670;margin:0 0 7px 0;}
  .metric-track{width:100%;height:6px;background:#F0EDF7;border-radius:4px;overflow:hidden;}
  .metric-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#A855F7,#7B2FBE);}
  .path-forward{padding-top:20px;border-top:1px solid #F0EDF7;font-family:'DM Sans',sans-serif;font-size:13.5px;line-height:1.6;color:#4A4650;text-align:center;}
  .path-forward .gap{color:#7B2FBE;font-weight:700;}
  .path-forward .brand{color:#06000D;font-weight:700;}
  .outcome-word{color:#FFB020;font-weight:700;}
</style>
</head>
<body>
<div class="preheader">The way your progress becomes invisible says a lot about what you need next.</div>
<div class="email-shell">
  <div class="pad">
    ${emailHeader()}
    <div class="h1">You&rsquo;re on the list.<br/>Your <span class="accent">Progress Profile</span> is ready.</div>
    <p class="body-copy">Hey <strong>${name}</strong>,</p>
    <p class="body-copy">Your <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> Progress Profile is <strong>${data.label}</strong>.</p>
    <p class="body-copy">You discovered that your life already has a body of evidence showing that more is working than your mind is currently able to hold.</p>
    <p class="body-copy">Something goes wrong and it grabs your attention, your emotions, and the whole room inside your head, while three other things are humming along right next to it.</p>
    <p class="body-copy">That is how the brain works. The bad hour demands your attention. The <span class="accent-amber">good evidence</span> needs to be caught.</p>
    <p class="body-copy">This is where <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> comes in.</p>
    ${scorecard}
    <p class="body-copy">It tracks the things you finished when your brain was telling you otherwise. The opportunity that showed up just when you were sure you had missed the window. The hard hour that you kept to exactly that: one hour. The small win that gives you reliable proof that you are showing up more and more for yourself.</p>
    <p class="body-copy">Here is your first move with <span class="brand-word">My<span class="brand-dopa">Dopa</span></span>: spend two minutes tonight jotting down one moment from today when more was working than your mind gave it credit for.</p>
    <p class="body-copy">It can be small. It can be subtle. It only has to be true.</p>
    <p class="body-copy">Then complete this sentence:</p>
    <div class="prompt-block"><p class="sentence-stem">&ldquo;This matters because I&rsquo;m someone who&hellip;&rdquo;</p></div>
    <p class="body-copy">That sentence is the first entry in your own record.</p>
    <p class="body-copy"><span class="brand-word">My<span class="brand-dopa">Dopa</span></span> is being built to help you keep that record. You&rsquo;ll log meaningful moments in <span class="feature-word">TODAY</span>, see the patterns unfold in <span class="feature-word">MYPROGRESS</span>, decode the signals through <span class="feature-word">DISCOVERIES</span>, and watch your capabilities expand through your <span class="feature-word">RESILIENCE HORIZON</span>.</p>
    <p class="body-copy">That is how daily effort becomes <span class="outcome-word">CLARITY</span>, <span class="outcome-word">ACCURACY</span>, and <span class="outcome-word">SELF-CONFIDENCE</span>.</p>
    <p class="body-copy">Reply and tell me: what is one type of progress you&rsquo;re tired of losing sight of?</p>
    <p class="signoff">Fall in love with your own progress.</p>
    <p class="signature">&mdash; DOPA</p>
  </div>
  ${emailFooter(email)}
</div>
</body>
</html>`
}

// ─── Edge Function handler ─────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: CORS })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const email = ((body.email ?? '') as string).trim().toLowerCase()
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const answers          = (body.answers ?? {}) as Record<string, unknown>
  const first_name       = ((answers.first_name       ?? '') as string).trim() || null
  const age_group        = (answers.age_group         ?? null) as string | null
  const sex              = (answers.sex               ?? null) as string | null
  const q1_profile       = (answers.q1_profile        ?? null) as string | null
  const q2_likert        = Number(answers.q2_likert)  || 0
  const q3_evidence      = (answers.q3_evidence       ?? '') as string
  const q4_good_day      = (answers.q4_good_day       ?? '') as string
  const consent_version  = (answers.consent_version   ?? null) as string | null
  const consent_source   = (answers.consent_source    ?? null) as string | null
  const stage            = ((body.stage ?? 'quiz_completed') as string).trim()

  const visibility_score =
    q2_likert +
    (q3Map[q3_evidence] ?? 0) +
    (q4Map[q4_good_day]  ?? 0)

  const supabase = createClient(
    SUPABASE_URL,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ── invitation_requested: save contact info only, no email send ──
  if (stage === 'invitation_requested') {
    const { error } = await supabase
      .from('waitlist_subscribers')
      .upsert({
        email,
        first_name,
        consent_status:    'subscribed',
        consent_timestamp: new Date().toISOString(),
        consent_version,
        consent_source,
      }, { onConflict: 'email' })

    if (error) {
      console.error('Supabase upsert error:', error)
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // ── quiz_completed: guard against double email send ──
  const { data: existing } = await supabase
    .from('waitlist_subscribers')
    .select('email_1_status')
    .eq('email', email)
    .single()

  const alreadySent = existing?.email_1_status === 'sent'

  const { error: upsertError } = await supabase
    .from('waitlist_subscribers')
    .upsert({
      email,
      first_name,
      age_group,
      sex,
      quiz_result:       q1_profile,
      visibility_score,
      quiz_answers:      answers,
      consent_status:    'subscribed',
      consent_timestamp: new Date().toISOString(),
      consent_version,
      consent_source,
    }, { onConflict: 'email' })

  if (upsertError) {
    console.error('Supabase upsert error:', upsertError)
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  if (alreadySent) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Email 1 to subscriber
  const displayName = first_name
    ? first_name.charAt(0).toUpperCase() + first_name.slice(1)
    : 'there'

  let email1Status = 'failed'
  let email1Id: string | null = null
  let email1Error: string | null = null

  try {
    const res  = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        from:    'MyDopa <hello@mydopa.app>',
        to:      [email],
        subject: 'Your Progress Profile is in.',
        html:    buildEmail1Html(displayName, q1_profile, visibility_score, answers as Record<string, string | number>, email),
      }),
    })
    const data = await res.json() as { id?: string; [k: string]: unknown }
    if (res.ok) {
      email1Status = 'sent'
      email1Id     = data.id ?? null
    } else {
      email1Error = JSON.stringify(data)
      console.error('Email 1 send failed:', data)
    }
  } catch (err) {
    email1Error = String(err)
    console.error('Email 1 send error:', err)
  }

  // Update email_1 status columns
  await supabase
    .from('waitlist_subscribers')
    .update({
      email_1_status:    email1Status,
      email_1_sent_at:   new Date().toISOString(),
      resend_email_1_id: email1Id,
      ...(email1Error ? { last_email_error: email1Error } : {}),
    })
    .eq('email', email)

  // Internal notification (fire-and-forget)
  fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from:    'MyDopa <hello@mydopa.app>',
      to:      ['re@mydopa.app'],
      subject: `New waitlist signup: ${email}`,
      html:    `<p><strong>${email}</strong> just joined the MyDopa waitlist. Score: ${visibility_score}/13. Profile: ${q1_profile ?? 'unknown'}.</p>`,
    }),
  }).catch(() => {})

  return new Response(JSON.stringify({ ok: true }), {
    status:  200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
