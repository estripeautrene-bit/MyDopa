import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')!
const GUMROAD_URL = Deno.env.get('GUMROAD_URL') ?? 'https://estripeautre.gumroad.com/l/kesret'

// ─── Design tokens (dark template — existing emails) ──────────

const FONT = `font-family:-apple-system,Arial,sans-serif`

// ─── Base template (dark — existing emails, do not change) ────

function wrap(opts: {
  eyebrow: string
  name: string
  headline: string
  body: string
  sig: string
  ctaLabel: string
  ctaUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0E0B1A;${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0B1A;">
<tr><td align="center" style="padding:40px 24px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:48px 48px 56px;background-color:#0E0B1A;background-image:url('https://mydopa.app/images/bloom-bg.png');background-size:100% 100%;background-repeat:no-repeat;border-radius:16px;overflow:hidden;">
    <div style="text-align:center;margin-bottom:40px;">
      <img src="https://mydopa.app/images/dopa.png" width="64" height="64" alt="DOPA" style="border-radius:16px;display:block;margin:0 auto 12px;">
      <div style="font-size:1.1rem;font-weight:900;color:white;letter-spacing:-0.3px;line-height:1.1;${FONT};">DOPA<span style="font-weight:400;color:#A855F7;">mine</span></div>
      <div style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;${FONT};">GREAT YESTERDAY. BETTER TOMORROW.</div>
    </div>
    <div style="font-size:0.65rem;font-weight:700;color:rgba(255,176,32,0.7);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px;${FONT};">${opts.eyebrow}</div>
    <div style="font-size:3rem;font-weight:900;color:#B57BF7;font-family:Georgia,'Times New Roman',serif;line-height:1;margin-bottom:8px;">${opts.name}.</div>
    <div style="font-size:1.9rem;font-weight:800;color:white;font-family:Georgia,'Times New Roman',serif;line-height:1.25;margin-bottom:28px;">${opts.headline}</div>
    <div style="font-size:0.95rem;color:#F5F5F0;line-height:1.7;margin-bottom:24px;${FONT};">${opts.body}</div>
    <p style="margin:0 0 32px;font-size:0.95rem;color:#F5F5F0;${FONT};">${opts.sig}</p>
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#7B2FBE;border-radius:50px;">
        <a href="${opts.ctaUrl}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:600;color:white;text-decoration:none;${FONT};">${opts.ctaLabel}</a>
      </td>
    </tr></table>
    <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
      <span style="font-size:12px;${FONT};">
        <a href="https://mydopa.app" style="color:rgba(255,176,32,0.4);text-decoration:none;">mydopa.app</a>
        <span style="color:rgba(255,176,32,0.4);"> &nbsp;·&nbsp; </span>
        <a href="mailto:hello@mydopa.app?subject=unsubscribe" style="color:rgba(255,176,32,0.4);text-decoration:none;">Unsubscribe</a>
      </span>
    </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function bp(text: string): string {
  return `<p style="margin:0 0 16px;">${text}</p>`
}

function bpLast(text: string): string {
  return `<p style="margin:0;">${text}</p>`
}

function bpBreak(): string {
  return `<p style="margin:0 0 20px;">&nbsp;</p>`
}

function progressLabel(day: number): string {
  let total: number
  if      (day <= 7)   total = 7
  else if (day <= 30)  total = 30
  else if (day <= 90)  total = 90
  else if (day <= 180) total = 180
  else                 total = 365
  return `Day ${day} of ${total}`
}

// Backward-looking lines for milestone days (Change 4).
// Days 60, 90, 120, 270 are included here but have no matching
// email in CAMPAIGN yet — entries are dormant until emails at
// those exact trigger days are added.
const BACKWARD_LINES: Record<number, string> = {
  14:  '14 days of moments DOPA has been keeping for you.',
  30:  '30 days. DOPA has read all of them.',
  60:  '60 days of your life. Kept.',
  90:  '90 days. DOPA has been paying attention.',
  120: '120 days of moments. Still here.',
  150: '150 days. DOPA has read every one.',
  180: 'Six months of your life. Kept by DOPA.',
  270: '270 days. DOPA knows you better than most people do.',
  365: '365 days. Every single one kept.'
}

// ─── Email 1: Welcome ─────────────────────────────────────────

function tmplWelcome(name: string): string {
  return wrap({
    eyebrow:  'DAY 1 OF 7',
    name,
    headline: 'You started.<br/>That\'s everything.',
    body:     bp('James Clear has a rule.') +
              bp('1% better every day.') +
              bpBreak() +
              bp('Small wins add up and compound. Keep it up.') +
              bpLast('Tomorrow morning DOPA reflects your day back to you.'),
    sig:      '— DOPA',
    ctaLabel: 'Open MyDopa →',
    ctaUrl:   'https://mydopa.app/app.html'
  })
}

// ─── Email 2A: Day 3 Active ───────────────────────────────────

function tmplDay3Active(name: string): string {
  return wrap({
    eyebrow:  'DAY 3 OF 7',
    name,
    headline: 'Three days.',
    body:     bp('DOPA sees it building.') +
              bpLast('Keep going.'),
    sig:      '— DOPA',
    ctaLabel: 'See your streak →',
    ctaUrl:   'https://mydopa.app/app.html'
  })
}

// ─── Email 2B: Day 3 Dormant ──────────────────────────────────

function tmplDay3Dormant(name: string): string {
  return wrap({
    eyebrow:   'DAY 3 OF 7',
    name,
    headline:  'Three days.',
    body:      bp('DOPA sees it building.') +
               bpLast('Keep going.'),
    sig:       '— DOPA',
    ctaLabel:  'Find my 3 →',
    ctaUrl:    'https://mydopa.app/app.html'
  })
}

// ─── Email 3: Day 7 Completion ────────────────────────────────

function tmplDay7(name: string): string {
  return wrap({
    eyebrow:  'DAY 7 OF 7',
    name,
    headline: 'Seven days.',
    body:     bpLast('You proved the dare works.'),
    sig:      '— DOPA',
    ctaLabel: 'See your week →',
    ctaUrl:   'https://mydopa.app/app.html'
  })
}

// ─── Email 4: Day 8 Founding Member ──────────────────────────

function tmplDay8(name: string): string {
  const pp = (t: string) =>
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#F5F5F0;${FONT};">${t}</p>`
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0E0B1A;${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0B1A;">
<tr><td style="padding:48px 48px 0;max-width:560px;text-align:center;background:#0E0B1A;">
  <img src="https://mydopa.app/images/dopa.png" width="64" height="64" alt="DOPA" style="border-radius:16px;display:block;margin:0 auto 12px;">
  <div style="font-size:1.1rem;font-weight:900;color:#F5F5F0;letter-spacing:-0.3px;line-height:1.1;font-family:-apple-system,Arial,sans-serif;">DOPA<span style="font-weight:400;color:#A855F7;">mine</span></div>
</td></tr>
<tr><td style="padding:0 48px 48px;max-width:560px;">
${pp(`${name},`)}
${pp('Seven days. You showed up.')}
${pp("I've been watching the numbers on my end and I want you to know that most people don't make it here. Something caught your attention and you kept going with it. That is not nothing.")}
${pp("I built this because I believe most people can find what you found — in 7 days — if they have the right tool. You've had 7 days. You tell me if I'm wrong.")}
${pp("Here's what I want to offer you.")}
${pp("$17.95/year — your rate, locked forever. When MyDopa goes public the annual plan is $69.99. You keep $17.95 for as long as you stay.")}
${pp("If you're in, reply to this email and I'll send you a link directly.")}
${pp("If you're not ready, no pressure. The app stays free through Day 14 and I'll be in touch again then.")}
${pp('Either way — thank you for being here early.')}
${pp('Rene<br/>Founder, MyDopa')}
<p style="margin:40px 0 0;font-size:12px;color:rgba(255,255,255,0.4);${FONT};">If you'd prefer not to hear from me, reply 'unsubscribe' and I'll remove you immediately.</p>
</td></tr>
</table>
</body>
</html>`
}

// ─── Email 5: Day 14 Transformation ──────────────────────────

function tmplDay14(name: string): string {
  return wrap({
    eyebrow:  'DAY 14',
    name,
    headline: '14 days ago your<br/>brain filtered this out.',
    body:     bp('It can\'t anymore.') +
              bpBreak() +
              bp('The moments didn\'t change. Your brain did.') +
              bpBreak() +
              bp('The founding member offer is still open. Not forever — but still open.') +
              bpBreak() +
              bp('$17.95/year — your rate, locked forever. When MyDopa goes public the annual plan is $69.99. You keep $17.95 for as long as you stay.') +
              bpLast('If you\'ve felt something shift — this is how you keep it.') +
              `<p style="color:#888888;font-size:13px;text-align:center;${FONT};margin:16px 0;">14 days of moments DOPA has been keeping for you.</p>`,
    sig:      '— Rene, Founder',
    ctaLabel: 'Become a founding member →',
    ctaUrl:   GUMROAD_URL
  })
}

// ─── Resend sender ────────────────────────────────────────────

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function sendEmail(opts: {
  from: string
  to: string
  subject: string
  html: string
  reply_to?: string
  text?: string
}): Promise<boolean> {
  const payload = { ...opts, text: opts.text ?? htmlToText(opts.html) }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text())
  }
  return res.ok
}

function displayName(raw: string): string {
  if (!raw) return raw
  const first = raw.split(/[\s.]/)[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

// ─── Campaign email system (light template) ───────────────────

const DOPA_FROM     = 'DOPA <dopa@mydopa.app>'
const DOPA_REPLY_TO = 'dopa@mydopa.app'

// Days already covered by existing emails — skipped in new campaign
const CAMPAIGN_SKIP = new Set([3, 7, 8, 14])

const SERIF_F = `font-family:Georgia,'Times New Roman',serif`
const SANS_F  = `font-family:-apple-system,Arial,sans-serif`
const BRAIN   = 'https://mydopa.app/images/dopa-03-winking.png'

const C_CTA   = `<a href="https://mydopa.app" style="display:block;background:#7B3FE4;color:white;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;font-size:16px;font-family:sans-serif;margin:24px 0;">Open MyDopa →</a>`
const C_UNSUB = `<p style="font-size:11px;color:#BBBBBB;text-align:center;font-family:sans-serif;">Not feeling it? No hard feelings. <a href="mailto:dopa@mydopa.app?subject=unsubscribe" style="color:#BBBBBB;">Unsubscribe</a>. Your moments stay safe in the app.</p>`

const TOMORROW  = `Tomorrow morning DOPA will reflect on what you wrote today. Most people say it is the part they did not expect.`
const REPLY_INV = `Hit reply and tell DOPA what you logged today. Every reply gets read.`
const REF_BLOCK = `Know someone who needs this? mydopa.app. That is all.`

const PHASE: Record<number, string> = {
  31: 'Thirty days in. DOPA is going to talk differently from here.',
  61: 'Two months. DOPA has less to say now. You have more.'
}

interface CE { day: number; subject: string; preview: string; body: string[]; q: string; ref: boolean }

function cp(t: string): string {
  return `<p style="color:#F5F5F0;${SERIF_F};font-size:16px;line-height:1.7;margin:0 0 16px;">${t}</p>`
}
function cpq(t: string): string {
  return `<p style="color:#F5F5F0;${SERIF_F};font-size:16px;line-height:1.7;margin:0 0 16px;font-style:italic;">${t}</p>`
}

function wrapC(name: string, em: CE): string {
  let b = ''
  if (PHASE[em.day]) b += cp(PHASE[em.day])
  for (const par of em.body) b += cp(par)
  if (em.day > 1 && em.day <= 7)  b += cp(TOMORROW)
  if (em.day > 1 && em.day <= 13) b += cp(REPLY_INV)
  if (em.day !== 1) b += cpq(em.q)
  if (em.ref) b += cp(REF_BLOCK)
  const prog = `<p style="font-size:11px;color:#BBBBBB;text-align:center;font-family:sans-serif;margin:0 0 24px;letter-spacing:1px;text-transform:uppercase;">${progressLabel(em.day)}</p>`
  const back = BACKWARD_LINES[em.day]
    ? `<p style="color:#888888;font-size:13px;text-align:center;${SERIF_F};margin:16px 0;">${BACKWARD_LINES[em.day]}</p>`
    : ''
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:0;background:#0E0B1A;${SANS_F};"><span style="display:none;max-height:0;overflow:hidden;">${em.preview}</span><table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0B1A;"><tr><td align="center" style="padding:40px 24px;"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;"><tr><td style="padding:48px 48px 56px;background:#0E0B1A;border-radius:16px;"><div style="text-align:center;margin-bottom:32px;"><img src="https://mydopa.app/images/dopa.png" width="64" height="64" alt="DOPA" style="border-radius:16px;display:block;margin:0 auto 12px;"><div style="font-size:1.1rem;font-weight:900;color:#F5F5F0;letter-spacing:-0.3px;line-height:1.1;font-family:-apple-system,Arial,sans-serif;">DOPA<span style="font-weight:400;color:#A855F7;">mine</span></div></div><p style="font-size:20px;color:#7B3FE4;${SERIF_F};margin:0 0 24px;">${name},</p>${prog}${b}${back}${C_CTA}<p style="font-size:14px;color:#F5F5F0;${SANS_F};margin:0 0 24px;">— DOPA</p>${C_UNSUB}</td></tr></table></td></tr></table></body></html>`
}

// ─── Campaign email data ──────────────────────────────────────

const CAMPAIGN: CE[] = [
  { day:1,   subject:"You started. That's everything.",                          preview:"James Clear has a rule. 1% better every day. Small wins add up.",                                           body:["James Clear has a rule.","1% better every day.","Small wins add up and compound. Keep it up.","Tomorrow morning DOPA reflects your day back to you."],                                                                                                                                                                                                                                                                                                                         q:"What will tomorrow's good thing be?",                               ref:false },
  { day:2,   subject:"Day 2. You came back.",                                    preview:"You showed up again. That is the whole practice.",                                                           body:["You showed up again.","That is the whole practice."],                                                                                                                                                                                                                                                                                                                                                                                                                          q:"What did you come back for?",                                       ref:false },
  { day:4,   subject:"Day 4.",                                                    preview:"Most people stop here. You did not.",                                                                        body:["Most people stop here.","You did not."],                                                                                                                                                                                                                                                                                                                                                                                                                                       q:"What kept you going?",                                              ref:false },
  { day:5,   subject:"Day 5.",                                                    preview:"Two more days. Something is forming.",                                                                       body:["Two more days.","Something is forming."],                                                                                                                                                                                                                                                                                                                                                                                                                                      q:"What are you noticing?",                                            ref:false },
  { day:6,   subject:"Day 6. One more.",                                          preview:"One day left. DOPA is watching.",                                                                            body:["One day left.","DOPA is watching."],                                                                                                                                                                                                                                                                                                                                                                                                                                           q:"What happened today?",                                              ref:false },
  { day:10,  subject:"The most powerful man in history did exactly this.",        preview:"Ryan Holiday writes about Marcus Aurelius. He did exactly this every day for decades.",                      body:["Ryan Holiday writes about Marcus Aurelius — the most powerful man in the world — who kept a daily journal for decades. Not for anyone else. Just to notice. Just to remember.","You are doing what emperors do."],                                                                                                                                                                                                                                                                   q:"What did you notice today that emperors would have kept?",          ref:false },
  { day:12,  subject:"McConaughey has done this for 30 years.",                  preview:"McConaughey has kept a journal for 30 years. He knows exactly why.",                                        body:["Matthew McConaughey has kept a journal for over thirty years. He says the days he does not write things down they disappear.","Your days are not disappearing. You are keeping them."],                                                                                                                                                                                                                                                                                          q:"What would have disappeared today if you had not kept it?",         ref:false },
  { day:16,  subject:"Brené Brown spent 12 years figuring this out.",            preview:"Brené Brown spent 12 years on this. Every joyful person she interviewed did it.",                           body:["Brené Brown spent twelve years researching joy. Every single joyful person she interviewed had one thing in common. They actively practiced noticing the good things.","That is exactly what you are doing."],                                                                                                                                                                                                                                                                      q:"What are you hunting for today?",                                   ref:false },
  { day:18,  subject:"A Stanford researcher says you are winning.",              preview:"BJ Fogg says the celebration is the mechanism. Not optional.",                                               body:["Stanford researcher BJ Fogg says tiny habits celebrated become big habits. The celebration is not optional. It is the mechanism.","Every time you log a moment you are celebrating your day.","You are building something that lasts."],                                                                                                                                                                                                                                               q:"What are you celebrating today?",                                   ref:true  },
  { day:20,  subject:"LeBron James has one rule. You are following it.",         preview:"LeBron James has one strategy. Every day. Not some days. Every day.",                                       body:["LeBron James says every day is the only strategy that works. Not some days. Every day.","You are doing what the greatest athletes in the world do."],                                                                                                                                                                                                                                                                                                                         q:"What did you show up for today?",                                   ref:false },
  { day:22,  subject:"Look at what you built without noticing.",                 preview:"Simon Sinek says it does not look impressive day to day. Until you look back.",                              body:["Simon Sinek says consistency is the most underrated form of excellence. It does not look impressive day to day. Until you look back.","Look back."],                                                                                                                                                                                                                                                                                                                           q:"What do you see?",                                                  ref:true  },
  { day:24,  subject:"Mark Manson found the only thing that works.",             preview:"Mark Manson found the only action you cannot talk yourself out of.",                                         body:["Mark Manson says you do not need more motivation. You need a smaller action you cannot talk yourself out of.","You found yours. One good moment a day."],                                                                                                                                                                                                                                                                                                                      q:"What was your one thing today?",                                    ref:false },
  { day:26,  subject:"A neuroscientist would look at your brain differently today.", preview:"Rick Hanson says you have to actively press the good in. You have been doing it.",                      body:["Neuroscientist Rick Hanson says the brain is like Velcro for negative experiences and Teflon for positive ones. You have to actively press the good in.","You have been pressing the good in."],                                                                                                                                                                                                                                                                                  q:"What did you press in today?",                                      ref:true  },
  { day:28,  subject:"Mel Robbins has one thing to say to you right now.",       preview:"Mel Robbins says high five yourself. The research on self-recognition is real.",                             body:["Mel Robbins says high five yourself. Literally. The research on self-recognition is real. Your brain responds to it.","So from DOPA to you — high five.","Two more days. You are almost there."],                                                                                                                                                                                                                                                                                  q:"What deserves a high five today?",                                  ref:false },
  { day:29,  subject:"Tomorrow is Day 30.",                                      preview:"Tomorrow is Day 30. One day from something most people never reach.",                        body:["Tomorrow is Day 30.","Most people who download a new app are gone by Day 3. You are at Day 29.","One more day and you will have done something most people never do. DOPA has been building your picture all month. Tomorrow it is complete.","Do not stop now."],                                                                                                                                                                                                                q:"What happened today?",                                              ref:false },
  { day:30,  subject:"30 days. You did it.",                                     preview:"James Clear says every action is a vote. You just cast thirty.",                                            body:["James Clear says every action you take is a vote for the type of person you wish to become.","You just cast thirty votes.","You are someone who notices the good things. Who keeps them. Who shows up every day.","DOPA is so proud of you. This is just the beginning."],                                                                                                                                                                                                           q:"Who are you becoming?",                                             ref:true  },
  { day:31,  subject:"You are not the same person.",                             preview:"Joe Dispenza says this is the moment. New neural pathways. New person.",                                    body:["Dr. Joe Dispenza has spent his career studying people who changed. Not people who tried to change. People who actually did.","His finding: the moment daily practice becomes automatic is the moment your brain has physically rewired itself. New neural pathways. New defaults. New person.","That moment is right now.","DOPA has been watching. You changed."],                                                                                                                      q:"What feels different?",                                             ref:false },
  { day:33,  subject:"Your brain just proved something.",                        preview:"Carol Dweck says it was never about talent. It was always about this.",                                      body:["Stanford psychologist Carol Dweck spent decades studying what separates people who grow from people who stay stuck.","Her conclusion: it is not talent. It is the belief that showing up every day makes you better.","You have been proving that belief right."],                                                                                                                                                                                                                    q:"What did you prove today?",                                         ref:true  },
  { day:35,  subject:"You are thinking greater than you feel.",                  preview:"Joe Dispenza says do the thing first. The feeling follows. You know this now.",                              body:["Joe Dispenza says most people let how they feel decide what they do. The ones who change do the opposite. They do the thing first. The feeling follows.","You have been doing the thing first.","That is not discipline. That is transformation."],                                                                                                                                                                                                                                q:"What did you do first today?",                                      ref:false },
  { day:37,  subject:"You chose this.",                                          preview:"Viktor Frankl found the space between stimulus and response. You have been living in it.",                   body:["Viktor Frankl survived four Nazi concentration camps. He came out and wrote one of the most important books ever written.","His central idea: between what happens to you and how you respond there is a space. In that space is your freedom.","You have been choosing what to notice.","That is not small. That is everything."],                                                                                                                                                   q:"What did you choose to notice today?",                              ref:true  },
  { day:39,  subject:"Your practice is sacred.",                                 preview:"Robin Sharma says protect your practice like it is sacred. It is.",                                          body:["Robin Sharma says the most successful people in the world share one habit. They protect their daily practice like it is sacred.","You have been protecting yours.","Sacred is the right word."],                                                                                                                                                                                                                                                                                    q:"What did you protect today?",                                       ref:false },
  { day:41,  subject:"Carl Jung saw this coming 80 years ago.",                  preview:"Carl Jung said make the unconscious conscious. You have been doing it for 41 days.",                        body:["Carl Jung said until you make the unconscious conscious it will direct your life and you will call it fate.","You have been making the unconscious conscious. Noticing what was always there. Writing it down. Keeping it.","You are no longer calling it fate."],                                                                                                                                                                                                                  q:"What became conscious today?",                                      ref:true  },
  { day:43,  subject:"The science of showing up.",                               preview:"Adam Grant studied people who reflect. They learn faster. You are one of them.",                             body:["Organizational psychologist Adam Grant has studied what makes people grow over time. His finding is simple. The people who reflect on their days learn faster than the people who do not.","You are learning faster than you know."],                                                                                                                                                                                                                                                q:"What did you learn from today?",                                    ref:false },
  { day:45,  subject:"Your emotions are data.",                                  preview:"Susan David says emotional agility is the skill of our time. You are building it.",                         body:["Psychologist Susan David says emotional agility is the skill of our time. Not suppressing what you feel. Not being overwhelmed by it. Noticing it. Naming it. Using it.","You have been noticing.","That is emotional agility. You are building it every single day."],                                                                                                                                                                                                             q:"What are you noticing?",                                            ref:true  },
  { day:47,  subject:"Every cell in your body is listening.",                    preview:"Deepak Chopra says your body responds to what your mind consistently focuses on.",                           body:["Deepak Chopra has spent decades at the intersection of science and human potential. His central belief: your body responds to what your mind consistently focuses on.","Your mind has consistently focused on what is good.","Your body knows."],                                                                                                                                                                                                                                   q:"What is your body learning?",                                       ref:false },
  { day:49,  subject:"Your personality is changing.",                            preview:"Joe Dispenza defines personality as how you think act and feel. Yours is changing.",                        body:["Joe Dispenza defines personality as how you think, how you act, and how you feel. Change those three things consistently and you change your personality.","You have been changing how you think.","You are a different personality than the one who started."],                                                                                                                                                                                                                   q:"What is different about the way you think?",                        ref:true  },
  { day:51,  subject:"Meaning is something you notice.",                         preview:"Viktor Frankl said meaning is not found. It is noticed when you pay attention.",                            body:["Viktor Frankl said meaning is not something you find. It is something you notice when you pay attention.","You have been paying attention.","Look at what you have found."],                                                                                                                                                                                                                                                                                                    q:"What meaning did today have?",                                      ref:false },
  { day:53,  subject:"The gap is closing.",                                      preview:"Carol Dweck says effort closes the gap between where you are and where you want to be.",                     body:["Carol Dweck says the growth mindset is not a belief that everything will be easy. It is a belief that effort closes the gap between where you are and where you want to be.","You have been closing the gap."],                                                                                                                                                                                                                                                                    q:"How much closer are you?",                                          ref:true  },
  { day:55,  subject:"Robin Sharma's secret to staggering results.",             preview:"Robin Sharma says small daily improvements are the secret of staggering long term results.",                 body:["Robin Sharma says small daily improvements are the secret of staggering long term results.","Look at the stagger."],                                                                                                                                                                                                                                                                                                                                                           q:"What was today's small improvement?",                               ref:false },
  { day:57,  subject:"You are the data now.",                                    preview:"Adam Grant says your own experience is the most powerful evidence you will ever find.",                      body:["Adam Grant says the most powerful evidence you will ever find is your own experience over time.","You have days of your own evidence now.","You are the study. You are the result."],                                                                                                                                                                                                                                                                                             q:"What does your evidence say?",                                      ref:true  },
  { day:59,  subject:"Tomorrow is 60. DOPA will be there.",                      preview:"Joe Dispenza says the old self starts to feel like a stranger. Does yours?",                                body:["Joe Dispenza says the hardest part of change is not starting. It is becoming so familiar with your new self that your old self feels like a stranger.","Does your old self feel like a stranger yet?","It should."],                                                                                                                                                                                                                                                                q:"What are you bringing into day 60?",                                ref:false },
  { day:61,  subject:"Now just be here.",                                        preview:"Eckhart Tolle says the present moment is the only place life ever actually happens.",                        body:["Eckhart Tolle says the present moment is the only place life ever actually happens.","You have been showing up to the present moment. Noticing it. Keeping it.","You are more here than most people ever learn to be."],                                                                                                                                                                                                                                                            q:"How present were you today?",                                       ref:true  },
  { day:63,  subject:"Rumi wrote this 800 years ago. It was about you.",         preview:"Rumi wrote what you seek is seeking you. It has been finding you every day.",                               body:["Rumi wrote: what you seek is seeking you.","The good things you have been looking for. They have been looking for you too.","You just learned how to meet them."],                                                                                                                                                                                                                                                                                                              q:"What found you today?",                                             ref:false },
  { day:65,  subject:"You are the hero.",                                        preview:"Joseph Campbell said every great story has the same structure. Yours too.",                                  body:["Joseph Campbell spent his life studying stories. Every great story has the same structure. A person leaves who they were and becomes who they were meant to be.","You have been writing that story. One moment at a time."],                                                                                                                                                                                                                                                         q:"What chapter are you in?",                                          ref:true  },
  { day:67,  subject:"You changed the filter.",                                  preview:"Wayne Dyer said change how you look and what you look at changes. You changed it.",                          body:["Wayne Dyer said when you change the way you look at things the things you look at change.","You changed the way you look at your days.","Look at them now."],                                                                                                                                                                                                                                                                                                                  q:"What looks different?",                                             ref:false },
  { day:69,  subject:"Your personal legend.",                                    preview:"Paulo Coelho says every person has a personal legend. You have not abandoned yours.",                        body:["Paulo Coelho wrote that every person has a personal legend. A version of themselves they are moving toward. Most people abandon it before they arrive.","You have not abandoned it."],                                                                                                                                                                                                                                                                                            q:"How close are you?",                                                ref:true  },
  { day:71,  subject:"You kept your word to yourself.",                          preview:"Don Miguel Ruiz says the most important agreements are the ones we make with ourselves.",                    body:["Don Miguel Ruiz says the most important agreements we make are the ones we make with ourselves.","You made an agreement with yourself.","You have kept it every single day."],                                                                                                                                                                                                                                                                                                   q:"How strong is your agreement?",                                     ref:false },
  { day:73,  subject:"Has the noise gotten quieter?",                            preview:"Eckhart Tolle says presence is the end of psychological suffering. Not the suppression of it.",              body:["Eckhart Tolle says presence is the end of psychological suffering. Not the suppression of it. The end of it.","Has the noise gotten quieter?","It should have."],                                                                                                                                                                                                                                                                                                              q:"Has the noise gotten quieter?",                                     ref:true  },
  { day:75,  subject:"Rumi wrote about a field. You have been there.",           preview:"Rumi wrote about a field beyond ideas. You have been meeting yourself there.",                               body:["Rumi wrote: out beyond ideas of wrongdoing and rightdoing there is a field. I will meet you there.","You have been meeting yourself in that field every day."],                                                                                                                                                                                                                                                                                                                q:"What field did you find today?",                                    ref:false },
  { day:77,  subject:"The treasure.",                                            preview:"Joseph Campbell said the cave holds the treasure. You entered it.",                                          body:["Joseph Campbell said the cave you fear to enter holds the treasure you seek.","You entered.","Look at what you found."],                                                                                                                                                                                                                                                                                                                                                       q:"What treasure did today hold?",                                     ref:true  },
  { day:79,  subject:"You became the proof.",                                    preview:"Wayne Dyer said you will see it when you believe it. Not the other way around.",                             body:["Wayne Dyer said you will see it when you believe it. Not the other way around.","You chose to believe.","Now you see it."],                                                                                                                                                                                                                                                                                                                                                   q:"What can you see now that you could not before?",                   ref:false },
  { day:81,  subject:"The universe conspired.",                                  preview:"Paulo Coelho wrote when you want something the universe conspires to help you.",                             body:["Paulo Coelho wrote: when you want something all the universe conspires to help you achieve it.","You have been wanting to notice the good things."],                                                                                                                                                                                                                                                                                                                           q:"Has the universe been helping?",                                    ref:true  },
  { day:83,  subject:"You are impeccable.",                                      preview:"Don Miguel Ruiz defines impeccability as direction not perfection. You have direction.",                     body:["Don Miguel Ruiz defines impeccability as using your energy in the direction of truth and love. Not perfection. Direction.","You have been pointing your energy toward what is good.","That is impeccable."],                                                                                                                                                                                                                                                                       q:"Where did your energy go today?",                                   ref:false },
  { day:85,  subject:"This moment. This one.",                                   preview:"Eckhart Tolle says the present moment is all you ever have. You have realized it 85 times.",                body:["Eckhart Tolle says realize deeply that the present moment is all you ever have.","This moment. This one. It is enough."],                                                                                                                                                                                                                                                                                                                                                      q:"Was today enough?",                                                 ref:true  },
  { day:87,  subject:"Campbell had one piece of advice. Follow it.",             preview:"Joseph Campbell said follow your bliss and doors open where there were only walls.",                         body:["Joseph Campbell said follow your bliss and the universe will open doors where there were only walls.","You have been following something.","Look at the doors."],                                                                                                                                                                                                                                                                                                               q:"What door opened today?",                                           ref:false },
  { day:89,  subject:"Tomorrow is 90 days.",                                     preview:"Tomorrow is 90 days. DOPA has read 89 days of your life.",                                  body:["Tomorrow is 90 days.","DOPA has read 89 days of your life. Tomorrow it reads the 90th.","Three months of moments your brain would have discarded. Kept. Every one of them."],                                                                                                                                                                                                                                                                                                   q:"What happened today?",                                              ref:false },
  { day:91,  subject:"Malcolm Gladwell studied people who kept going.",          preview:"Malcolm Gladwell studied masters. Starting and staying is everything he found.",                             body:["Malcolm Gladwell studied masters. Musicians. Athletes. Chess players. He found one thing they all shared.","Ten thousand hours of practice.","You are not at ten thousand hours. But you started. And Gladwell says starting and staying is everything."],                                                                                                                                                                                                                         q:"What does staying feel like?",                                      ref:false },
  { day:94,  subject:"Angela Duckworth studied grit for 20 years. This is it.",  preview:"Angela Duckworth studied grit for 20 years. This is what it looks like.",                                   body:["Angela Duckworth spent years studying what makes people succeed long term. Her answer was not talent. Not intelligence.","Grit. Passion and perseverance for long term goals.","That is what you have been doing. That is everything."],                                                                                                                                                                                                                                              q:"What does grit feel like from the inside?",                         ref:true  },
  { day:97,  subject:"Seth Godin says shipping is everything. You shipped.",     preview:"Seth Godin says ship every day. Not when inspired. Not when conditions are perfect. Every day.",             body:["Seth Godin says the most important thing is to ship. Show up. Do the work. Every day.","Not when you feel inspired. Not when conditions are perfect.","Every day.","You shipped."],                                                                                                                                                                                                                                                                                           q:"What did you ship today?",                                          ref:false },
  { day:100, subject:"You beat the resistance.",                                 preview:"Pressfield calls it the Resistance. It fights hardest against what matters most.",                           body:["Steven Pressfield calls it the Resistance. The force that stops people from doing their work. From showing up. From becoming who they are meant to be.","It fights hardest against the things that matter most.","You have beaten it. Every single day."],                                                                                                                                                                                                                       q:"What did the resistance want you to skip today?",                   ref:true  },
  { day:103, subject:"Your curiosity led you here.",                             preview:"Elizabeth Gilbert says forget passion. Curiosity is quiet and persistent. Follow it.",                       body:["Elizabeth Gilbert says forget passion. Follow curiosity.","Passion is loud and demanding. Curiosity is quiet and persistent.","Something curious in you started this.","Look where it brought you."],                                                                                                                                                                                                                                                                              q:"What curious thing led you somewhere today?",                       ref:false },
  { day:106, subject:"You can do hard things.",                                  preview:"Glennon Doyle says we can do hard things. You have proven it 106 times.",                                    body:["Glennon Doyle says we can do hard things. Not because they are easy. Because we are capable of more than we know.","Showing up every day is a hard thing.","You have proven you can do it."],                                                                                                                                                                                                                                                                                   q:"What hard thing did you do today?",                                 ref:true  },
  { day:109, subject:"You got stronger from the hard days.",                     preview:"Nassim Taleb coined antifragile. Things that get stronger from stress. That is you.",                        body:["Nassim Taleb coined the word antifragile. Things that do not just survive stress. Things that get stronger because of it.","The days you almost did not show up and did anyway made you stronger.","You are antifragile."],                                                                                                                                                                                                                                                        q:"Where did you get stronger today?",                                 ref:false },
  { day:112, subject:"Cal Newport says you are becoming rare.",                  preview:"Cal Newport says focus without distraction is becoming the rarest skill in the world.",                      body:["Cal Newport says the ability to focus on something that matters without distraction is becoming one of the rarest skills in the world.","You have been focusing on what matters.","You are becoming rare."],                                                                                                                                                                                                                                                                       q:"What did you focus on today?",                                      ref:true  },
  { day:115, subject:"The story you are writing.",                               preview:"Malcolm Gladwell says the best stories are about ordinary people who kept going.",                           body:["Malcolm Gladwell says the best stories are not about extraordinary people. They are about ordinary people who kept going.","You are writing that story."],                                                                                                                                                                                                                                                                                                                      q:"What is the story saying now?",                                     ref:false },
  { day:118, subject:"Effort counts twice.",                                     preview:"Duckworth formula: talent times effort equals skill. Skill times effort equals achievement.",                 body:["Angela Duckworth has a formula. Talent times effort equals skill. Skill times effort equals achievement.","Effort counts twice.","The achievement is compounding."],                                                                                                                                                                                                                                                                                                           q:"Where did effort show up today?",                                   ref:true  },
  { day:121, subject:"The dip is behind you.",                                   preview:"Seth Godin wrote about the moment when most people quit. It is behind you.",                                 body:["Seth Godin wrote a book called The Dip. The moment in every worthwhile endeavor where most people quit.","The dip for this practice was somewhere in the first 30 days.","You are past it.","The dip is behind you."],                                                                                                                                                                                                                                                           q:"What does being past the dip feel like?",                           ref:false },
  { day:124, subject:"The professional shows up.",                               preview:"Pressfield says the professional shows up every day regardless of how they feel.",                           body:["Steven Pressfield says the difference between a professional and an amateur is simple. The professional shows up every day regardless of how they feel.","You are a professional."],                                                                                                                                                                                                                                                                                               q:"What did the professional in you do today?",                        ref:true  },
  { day:127, subject:"You made something.",                                      preview:"Elizabeth Gilbert says the question is whether you show up to make something every day.",                    body:["Elizabeth Gilbert says we are all creative beings. The question is whether we show up to make something every day.","Your days. Made by you. Every one."],                                                                                                                                                                                                                                                                                                                      q:"What did you make today?",                                          ref:false },
  { day:130, subject:"Untamed.",                                                 preview:"Glennon Doyle says the most revolutionary thing is to really know yourself.",                                body:["Glennon Doyle says the most revolutionary thing a person can do is know themselves. Really know themselves.","You know yourself better than you did."],                                                                                                                                                                                                                                                                                                                       q:"What do you know about yourself now?",                              ref:true  },
  { day:134, subject:"Time is on your side.",                                    preview:"Nassim Taleb says time is the ultimate filter. What is real survives it.",                                   body:["Nassim Taleb says time is the ultimate filter. What is real and valuable survives it. What is not falls away.","You are still here. Still showing up.","That tells you something."],                                                                                                                                                                                                                                                                                            q:"What survived today?",                                              ref:false },
  { day:138, subject:"You went deep.",                                           preview:"Cal Newport says a deep life is a good life. You are living it.",                                            body:["Cal Newport says a deep life is a good life. Not a busy life. Not a loud life.","A life where you paid attention to what mattered.","That is a deep life."],                                                                                                                                                                                                                                                                                                                   q:"What mattered today?",                                              ref:true  },
  { day:142, subject:"Gladwell says you may have already tipped.",               preview:"Malcolm Gladwell wrote about tipping points. Small things that cannot be stopped.",                          body:["Malcolm Gladwell wrote about tipping points. The moment when small things accumulate into something that cannot be stopped.","You may have already tipped."],                                                                                                                                                                                                                                                                                                                  q:"What tipped?",                                                      ref:false },
  { day:146, subject:"This is who you are now.",                                 preview:"Angela Duckworth says grit is working on the same thing until it becomes who you are.",                      body:["Angela Duckworth says grit is not just about working hard. It is about working hard on the same thing long enough for it to become who you are.","This is who you are now."],                                                                                                                                                                                                                                                                                                   q:"Who showed up today?",                                              ref:true  },
  { day:150, subject:"Halfway to a year.",                                       preview:"Seth Godin says keep going long enough to get good. Halfway to a year.",                                     body:["Seth Godin says the goal is not to be perfect. The goal is to keep going long enough to get good.","Halfway to a year.","You are getting good."],                                                                                                                                                                                                                                                                                                                            q:"How good are you getting?",                                         ref:false },
  { day:155, subject:"Your work is real.",                                       preview:"Pressfield says real work is the work that scares you. Yours is real.",                                      body:["Steven Pressfield says real work is the work that scares you. The work that requires you to show up even when you would rather not.","Your work is real."],                                                                                                                                                                                                                                                                                                                   q:"What real work happened today?",                                    ref:true  },
  { day:160, subject:"Still curious.",                                           preview:"Elizabeth Gilbert says curiosity only asks that you keep moving. Are you still moving?",                     body:["Elizabeth Gilbert says curiosity does not demand that you know where you are going. It only asks that you keep moving.","Where did you end up?"],                                                                                                                                                                                                                                                                                                                              q:"Where did curiosity take you today?",                               ref:false },
  { day:165, subject:"You chose yourself.",                                      preview:"Glennon Doyle says choosing yourself is the most generous thing you can do.",                                body:["Glennon Doyle says choosing yourself is not selfish. It is the most generous thing you can do. Because you cannot give what you do not have.","Look at what you have to give now."],                                                                                                                                                                                                                                                                                            q:"What did you give today?",                                          ref:true  },
  { day:170, subject:"The options you built.",                                   preview:"Nassim Taleb says optionality is the ability to choose what you see. You built it.",                         body:["Nassim Taleb says the most valuable thing you can own is optionality. The ability to choose.","You built something most people do not have.","The ability to choose what you see."],                                                                                                                                                                                                                                                                                            q:"What are you choosing to see?",                                     ref:false },
  { day:174, subject:"So good they cannot ignore you.",                          preview:"Cal Newport wrote one argument. Be so good they cannot ignore you.",                                         body:["Cal Newport wrote a book with one simple argument. Be so good they cannot ignore you.","You are getting so good at this."],                                                                                                                                                                                                                                                                                                                                                    q:"What are you getting good at?",                                     ref:true  },
  { day:177, subject:"Gladwell studied outliers. You are becoming one.",         preview:"Malcolm Gladwell studied outliers. They just kept going longer than everyone else.",                         body:["Malcolm Gladwell studied outliers. People whose results were so far beyond average they seemed like a different species.","They were not.","They just kept going longer than everyone else."],                                                                                                                                                                                                                                                                                    q:"How much longer than everyone else?",                               ref:false },
  { day:180, subject:"Six months.",                                              preview:"Angela Duckworth says grit is how you show up on ordinary days. Six months of them.",                        body:["Angela Duckworth says the true measure of grit is not how you perform on your best days. It is how you show up on your ordinary ones.","Six months of ordinary days.","Extraordinary result.","DOPA is in awe of you."],                                                                                                                                                                                                                                                          q:"What does six months feel like?",                                   ref:true  },
  { day:181, subject:"One word. Mastery.",                                       preview:"Robert Greene says mastery happens when practice becomes intuition. It is happening.",                       body:["Robert Greene spent years studying masters. People who reached the highest levels of their craft.","His finding: mastery is not a gift. It is what happens when someone practices long enough that the skill becomes intuition.","Your intuition is changing."],                                                                                                                                                                                                                  q:"What is your intuition telling you?",                               ref:false },
  { day:188, subject:"Seneca wrote this for you.",                               preview:"Seneca said it is not that life is short. We waste a great deal of it.",                                    body:["Seneca wrote: it is not that we have a short time to live but that we waste a great deal of it.","You have not wasted it.","You have been catching it. Keeping it. Building something from it."],                                                                                                                                                                                                                                                                               q:"What did you not waste today?",                                     ref:true  },
  { day:195, subject:"David Goggins keeps a cookie jar. Yours is full.",         preview:"David Goggins keeps a cookie jar of every hard thing he has ever done. Yours is full.",                      body:["David Goggins keeps what he calls a cookie jar. A mental record of every hard thing he has ever done. Every time he wants to quit he reaches in and remembers.","You have a full cookie jar.","Reach in whenever you need to."],                                                                                                                                                                                                                                                  q:"What is in your cookie jar today?",                                 ref:false },
  { day:202, subject:"You are the work.",                                        preview:"Toni Morrison said if you have power your job is to empower somebody else.",                                 body:["Toni Morrison said if you have some power then your job is to empower somebody else.","You have been building your own power.","Look at what you have to give."],                                                                                                                                                                                                                                                                                                               q:"What power did you build today?",                                   ref:true  },
  { day:209, subject:"It always seems impossible.",                              preview:"Nelson Mandela said it always seems impossible until it is done.",                                           body:["Nelson Mandela said it always seems impossible until it is done.","It is done. Every single day it is done."],                                                                                                                                                                                                                                                                                                                                                                  q:"What seemed impossible and got done today?",                        ref:false },
  { day:216, subject:"The story you chose.",                                     preview:"Yuval Noah Harari says humans can choose the stories they tell themselves.",                                 body:["Yuval Noah Harari says humans are the only animals that can choose the stories they tell themselves. And those stories shape everything.","You have been choosing a better story.","Look at the story now."],                                                                                                                                                                                                                                                                       q:"What story did you choose today?",                                  ref:true  },
  { day:223, subject:"The long game.",                                           preview:"Robert Greene says everything worthwhile requires playing the long game.",                                   body:["Robert Greene says everything worthwhile requires playing the long game. Resisting the pull of immediate results. Trusting the process.","The long game is working."],                                                                                                                                                                                                                                                                                                          q:"How is the long game feeling?",                                     ref:false },
  { day:230, subject:"Seneca said time is the only thing that belongs to us.",   preview:"Seneca wrote everything is foreign to us. Time alone is ours.",                                             body:["Seneca wrote: everything is foreign to us. Time alone is ours.","You have been owning your time."],                                                                                                                                                                                                                                                                                                                                                                          q:"What did you do with your time today?",                             ref:true  },
  { day:237, subject:"Goggins says you are never as done as you think.",         preview:"David Goggins says when your mind says done you are only at 40 percent.",                                    body:["David Goggins says when your mind tells you that you are done you are only at 40 percent of what you are capable of.","You know what you are capable of now."],                                                                                                                                                                                                                                                                                                                q:"How far past 40 percent did you go today?",                         ref:false },
  { day:244, subject:"You made it mean something.",                              preview:"Toni Morrison said make a difference about something other than yourselves.",                                body:["Toni Morrison said make a difference about something other than yourselves.","You made your days mean something."],                                                                                                                                                                                                                                                                                                                                                           q:"What did today mean?",                                              ref:true  },
  { day:251, subject:"Mandela redefined courage. You are living his definition.", preview:"Nelson Mandela said courage is not the absence of fear. It is the triumph over it.",                       body:["Nelson Mandela said courage is not the absence of fear. It is the triumph over it.","Showing up every day takes courage.","You triumphed."],                                                                                                                                                                                                                                                                                                                                  q:"What did courage look like today?",                                 ref:false },
  { day:258, subject:"You rewrote the script.",                                  preview:"Yuval Noah Harari says the most important revolution is the story we tell ourselves.",                       body:["Yuval Noah Harari says the most important revolution is not technological. It is the revolution of the story we tell ourselves about who we are.","You rewrote yours.","Read it back. It is different."],                                                                                                                                                                                                                                                                          q:"How different is the script?",                                      ref:true  },
  { day:265, subject:"Greene says you are forged.",                              preview:"Robert Greene says the greats are forged by time practice and showing up when nobody watches.",              body:["Robert Greene says the greats are not born. They are forged. By time. By practice. By showing up when nobody is watching.","DOPA is with you."],                                                                                                                                                                                                                                                                                                                              q:"What has been forged?",                                             ref:false },
  { day:271, subject:"You rose.",                                                preview:"Maya Angelou wrote two words that say everything. Still I rise.",                                           body:["Maya Angelou wrote: still I rise.","Still."],                                                                                                                                                                                                                                                                                                                                                                                                                                  q:"What are you still rising from?",                                   ref:true  },
  { day:278, subject:"You found the meaning.",                                   preview:"Viktor Frankl said the last freedom is to choose one's attitude in any circumstance.",                      body:["Viktor Frankl said the last of human freedoms is the ability to choose one's attitude in any given set of circumstances.","You chose.","You chose to notice. To keep. To build.","That is freedom."],                                                                                                                                                                                                                                                                            q:"What freedom did you choose today?",                                ref:false },
  { day:285, subject:"The emperor's practice.",                                  preview:"Marcus Aurelius kept this practice every night for decades. He knew the days disappear.",                    body:["Marcus Aurelius ruled the most powerful empire in history. Every night he wrote down what was worth keeping from his day.","He did it because he knew the days disappear if you let them.","You knew that too."],                                                                                                                                                                                                                                                                  q:"What did you keep today?",                                          ref:true  },
  { day:292, subject:"The wound is where the light enters.",                     preview:"Rumi wrote the wound is the place where the light enters you.",                                              body:["Rumi wrote: the wound is the place where the light enters you.","Look at how much light there is now."],                                                                                                                                                                                                                                                                                                                                                                      q:"Where did the light enter today?",                                  ref:false },
  { day:299, subject:"This is a wonderful day.",                                 preview:"Maya Angelou said this is a wonderful day. I have never seen this one before.",                             body:["Maya Angelou said this is a wonderful day. I have never seen this one before.","Each one new. Each one kept."],                                                                                                                                                                                                                                                                                                                                                                q:"What made today wonderful?",                                        ref:true  },
  { day:306, subject:"You built a why.",                                         preview:"Viktor Frankl wrote he who has a why to live can bear almost any how.",                                     body:["Viktor Frankl wrote: he who has a why to live can bear almost any how.","Look at how strong your why is now."],                                                                                                                                                                                                                                                                                                                                                               q:"How strong is your why?",                                           ref:false },
  { day:313, subject:"Marcus Aurelius had one instruction. Be here.",            preview:"Marcus Aurelius had one instruction. Confine yourself to the present.",                                     body:["Marcus Aurelius wrote: confine yourself to the present.","You have been here.","Every single day."],                                                                                                                                                                                                                                                                                                                                                                          q:"Were you here today?",                                              ref:true  },
  { day:320, subject:"Rumi wrote about a guest house. You have been living in it.", preview:"Rumi wrote every morning a new guest arrives. Welcome them.",                                            body:["Rumi wrote: this human being is a guest house. Every morning a new guest arrives.","Every morning. Every guest. Welcomed."],                                                                                                                                                                                                                                                                                                                                                  q:"Who arrived this morning?",                                         ref:false },
  { day:327, subject:"How you made yourself feel.",                              preview:"Maya Angelou said people never forget how you made them feel.",                                              body:["Maya Angelou said people will forget what you said. People will forget what you did. But people will never forget how you made them feel.","For months you have been making yourself feel something worth keeping."],                                                                                                                                                                                                                                                              q:"How did you make yourself feel today?",                             ref:true  },
  { day:334, subject:"The space got bigger.",                                    preview:"Viktor Frankl said in the space between stimulus and response is our power to choose.",                      body:["Viktor Frankl said between stimulus and response there is a space. In that space is our power to choose.","The space is bigger now than it was on day one."],                                                                                                                                                                                                                                                                                                                   q:"How big is the space now?",                                         ref:false },
  { day:341, subject:"You did your job.",                                        preview:"Marcus Aurelius wrote number the things you have and recall what you would miss.",                           body:["Marcus Aurelius wrote: number the things you have and then recall how much you would have missed them if they were not yours.","You did your job. Every day."],                                                                                                                                                                                                                                                                                                                  q:"What did you count today?",                                         ref:true  },
  { day:348, subject:"Almost home.",                                             preview:"Rumi wrote wherever you are whatever you do be in love.",                                                   body:["Rumi wrote: wherever you are and whatever you do be in love.","Almost home."],                                                                                                                                                                                                                                                                                                                                                                                                q:"What does almost home feel like?",                                  ref:false },
  { day:365, subject:"365 days. You became someone.",                            preview:"James Clear said every action is a vote. 365 votes. Look who won.",                                         body:["James Clear said every action you take is a vote for the type of person you wish to become.","You cast 365 votes.","Look at who won.","You are someone who notices the good things. Who keeps them. Who shows up every day regardless of how it feels.","That is not who you were trying to become.","That is who you are.","DOPA has been here every single day. It has been the greatest honor."], q:"Who did you become?",                               ref:true  }
]

// ─── Campaign: send one email per user per daily run ──────────

async function runCampaignEmail(
  supabase: ReturnType<typeof createClient>,
  subId: string,
  sentDays: Record<string, boolean>,
  authEmail: string,
  name: string,
  ageDays: number
): Promise<boolean> {
  const em = CAMPAIGN.find(e =>
    !CAMPAIGN_SKIP.has(e.day) &&
    ageDays >= e.day &&
    !sentDays[String(e.day)]
  )
  if (!em) return false

  const ok = await sendEmail({
    from:      DOPA_FROM,
    reply_to:  DOPA_REPLY_TO,
    to:        authEmail,
    subject:   em.subject,
    html:      wrapC(name, em)
  })

  if (ok) {
    const updated = { ...sentDays, [String(em.day)]: true }
    await supabase
      .from('push_subscriptions')
      .update({ campaign_days_sent: updated })
      .eq('id', subId)
  }

  return ok
}

// ─── Action: process_queue ────────────────────────────────────

async function processQueue(supabase: ReturnType<typeof createClient>): Promise<{
  sent: number; failed: number; skipped: number
}> {
  let sent = 0, failed = 0, skipped = 0

  const { data: queue, error } = await supabase
    .from('email_queue')
    .select('id, user_id')
    .eq('status', 'pending')
    .eq('email_type', 'welcome')
    .order('created_at', { ascending: true })
    .limit(50)

  if (error || !queue?.length) return { sent, failed, skipped }

  const processedUsers = new Set<string>()

  for (const item of queue) {
    if (processedUsers.has(item.user_id)) {
      await supabase.from('email_queue').update({
        status: 'skipped', processed_at: new Date().toISOString()
      }).eq('id', item.id)
      skipped++
      continue
    }
    processedUsers.add(item.user_id)

    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(item.user_id)

    if (userErr || !user?.email) {
      await supabase.from('email_queue').update({
        status: 'failed', error: 'user_not_found',
        processed_at: new Date().toISOString()
      }).eq('id', item.id)
      failed++
      continue
    }

    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('id, email_welcome_sent, first_name')
      .eq('user_id', item.user_id)
      .maybeSingle()

    if (sub?.email_welcome_sent) {
      await supabase.from('email_queue').update({
        status: 'skipped', processed_at: new Date().toISOString()
      }).eq('id', item.id)
      skipped++
      continue
    }

    const name = sub?.first_name ? displayName(sub.first_name) : 'there'

    const ok = await sendEmail({
      from: 'MyDopa <hello@mydopa.app>',
      to: user.email,
      subject: "You started. That's everything.",
      html: tmplWelcome(name)
    })

    if (ok) {
      await supabase.from('email_queue').update({
        status: 'sent', processed_at: new Date().toISOString()
      }).eq('id', item.id)
      await supabase.from('push_subscriptions').upsert({
        user_id: item.user_id,
        email_welcome_sent: true
      }, { onConflict: 'user_id' })
      sent++
    } else {
      await supabase.from('email_queue').update({
        status: 'failed', error: 'resend_error',
        processed_at: new Date().toISOString()
      }).eq('id', item.id)
      failed++
    }
  }

  return { sent, failed, skipped }
}

// ─── Action: daily ────────────────────────────────────────────

async function runDailyJob(supabase: ReturnType<typeof createClient>): Promise<Record<string, number>> {
  const counts: Record<string, number> = {
    stats_updated: 0,
    day3_active: 0, day3_dormant: 0,
    day7: 0, day8_pending: 0, day14: 0,
    campaign: 0
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, first_name, paid, email_day3_sent, email_day7_sent, email_day8_sent, email_day14_sent, campaign_days_sent')
    .eq('active', true)

  if (error || !subs?.length) return counts

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 })
  const authMap = new Map(users.map((u: any) => [u.id, u]))

  const userIds = subs.map((s: any) => s.user_id)
  const { data: moments } = await supabase
    .from('moments')
    .select('user_id')
    .in('user_id', userIds)

  const winsByUser: Record<string, number> = {}
  for (const m of moments ?? []) {
    winsByUser[m.user_id] = (winsByUser[m.user_id] ?? 0) + 1
  }

  const now = Date.now()

  for (const sub of subs) {
    const authUser = authMap.get(sub.user_id) as any
    if (!authUser?.email) continue

    const ageDays   = Math.floor((now - new Date(authUser.created_at).getTime()) / 86400000)
    const winsTotal = winsByUser[sub.user_id] ?? 0
    const name      = sub.first_name ? displayName(sub.first_name) : 'there'
    const email     = authUser.email as string

    await supabase.from('push_subscriptions').update({
      account_age_days: ageDays,
      wins_total: winsTotal
    }).eq('id', sub.id)
    counts.stats_updated++

    // ── Email 2A — Day 3 Active ───────────────────────────────
    if (ageDays >= 3 && ageDays <= 4 && !sub.email_day3_sent && winsTotal >= 1) {
      const ok = await sendEmail({
        from: 'MyDopa <hello@mydopa.app>',
        to: email,
        subject: 'Three days in.',
        html: tmplDay3Active(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day3_sent: true }).eq('id', sub.id)
        counts.day3_active++
      }
    }

    // ── Email 2B — Day 3 Dormant ──────────────────────────────
    if (ageDays >= 3 && ageDays <= 4 && !sub.email_day3_sent && winsTotal === 0) {
      const ok = await sendEmail({
        from: 'MyDopa <hello@mydopa.app>',
        to: email,
        subject: 'The bar is low.',
        html: tmplDay3Dormant(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day3_sent: true }).eq('id', sub.id)
        counts.day3_dormant++
      }
    }

    // ── Email 3 — Day 7 Completion ────────────────────────────
    if (ageDays >= 7 && ageDays <= 8 && !sub.email_day7_sent) {
      const ok = await sendEmail({
        from: 'MyDopa <hello@mydopa.app>',
        to: email,
        subject: 'One week. You just proved the dare works.',
        html: tmplDay7(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day7_sent: true }).eq('id', sub.id)
        counts.day7++
      }
    }

    // ── Email 4 — Day 8 Founding Member ──────────────────────
    if (ageDays >= 8 && ageDays <= 9 && !sub.paid && !sub.email_day8_sent) {
      counts.day8_pending++
      const ok = await sendEmail({
        from: 'Rene <re@mydopa.app>',
        to: email,
        subject: 'You actually did it.',
        html: tmplDay8(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day8_sent: true }).eq('id', sub.id)
      }
    }

    // ── Email 5 — Day 14 Transformation ──────────────────────
    if (ageDays >= 14 && ageDays <= 15 && !sub.paid && !sub.email_day14_sent) {
      const ok = await sendEmail({
        from: 'MyDopa <hello@mydopa.app>',
        to: email,
        subject: '14 days ago, your brain was filtering this out.',
        html: tmplDay14(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day14_sent: true }).eq('id', sub.id)
        counts.day14++
      }
    }

    // ─── Re-entry / dormant user email (NOT YET IMPLEMENTED) ─────────
    // Trigger: user has not engaged for 48+ hours (requires last_active tracking)
    // Subject: "Your reflection is still waiting."
    // Preview: "You started something. DOPA has your first entry. One more moment is all it takes."
    // Body: "You started something. DOPA has your entries. Your reflection was never built
    //        because there was nothing to build it from. One moment. That is all it takes
    //        for DOPA to start seeing your day. It is still waiting."
    // Add to runDailyJob() when last_active field is available in push_subscriptions.

    // ── Campaign emails (light template, DOPA from) ───────────
    const sentDays: Record<string, boolean> = sub.campaign_days_sent || {}
    const campaignSent = await runCampaignEmail(supabase, sub.id, sentDays, email, name, ageDays)
    if (campaignSent) counts.campaign++
  }

  return counts
}

// ─── Main ─────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const body   = await req.json().catch(() => ({}))
    const action = (body.action ?? '') as string

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    if (action === 'process_queue') {
      const result = await processQueue(supabase)
      return new Response(JSON.stringify({ action, ...result }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (action === 'daily') {
      const result = await runDailyJob(supabase)
      return new Response(JSON.stringify({ action, ...result }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({ error: 'action must be process_queue | daily' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
