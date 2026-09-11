import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

type Slot     = 'ywg' | 'morning' | 'afternoon' | 'evening'
type PairSlot = 'morning' | 'afternoon' | 'evening'

// ── Morning copy — three behavioral types ───────────────────────────
const MORNING_TYPE1 = [
  "DOPA is ready for more. What else happened this morning?",
  "Tomorrow morning DOPA has something for you. Build it today.",
  "DOPA will read everything you log today. Give it something."
]
const MORNING_TYPE2 = [
  "Your brain is already discarding something good right now. Beat it.",
  "In 12 seconds your brain will file this under forgettable. Save it first.",
  "Something just happened. You know which one. Don't let it go.",
  "The good things from this morning are already fading. Catch one.",
  "Right now your brain is deciding what to keep. Help it choose.",
  "The commute. The coffee. The quiet moment. Fading. Save one.",
  "Good things happened this morning. Save one before it goes."
]
const MORNING_TYPE3 = [
  "Three things happened before 9am worth keeping. Do you know what they were?",
  "Something happened this morning you will not remember by tonight. Catch it now.",
  "The best part of this morning is fading. You have about an hour before it is gone.",
  "Your brain is doing its morning sort right now. Help it keep the good ones.",
  "Something good is already happening. DOPA needs you to catch it."
]

// ── Afternoon copy ──────────────────────────────────────────────────
const AFTERNOON_TYPE1 = [
  "Your reflection tomorrow morning depends on what you log today.",
  "DOPA is building your day's picture. More moments make it clearer.",
  "The afternoon always has something worth keeping. What is it?"
]
const AFTERNOON_TYPE2 = [
  "The morning had good things in it. They are fading. Save one.",
  "What happened this morning that you almost let go?",
  "Something good just happened in the last hour. You know what it is."
]

// ── Evening copy ────────────────────────────────────────────────────
const EVENING_TYPE1 = [
  "Everything you log tonight shapes what DOPA shows you tomorrow.",
  "Tomorrow morning DOPA reflects your day back. Give it something to work with.",
  "Tonight DOPA reads what you logged. What did today give you?"
]
const EVENING_TYPE2 = [
  "Today closes in a few hours. DOPA is waiting for what happened.",
  "The day's last moments are the easiest to lose. Save one now.",
  "Tonight is the last chance to catch today. What happened?"
]

// ── Re-entry copy (days_since_last_entry 3–13) ───────────────────────
const REENTRY_COPY: Record<PairSlot, string> = {
  morning:   "Something good happened while you were away. DOPA is ready when you are.",
  afternoon: "DOPA has been waiting. Good things kept happening. Catch one today.",
  evening:   "Today still has time. One moment is all DOPA needs."
}

// ── Win-back copy (days_since_last_entry 14+) ────────────────────────
const WINBACK_COPY: Record<PairSlot, string> = {
  morning:   "You started something. It is still here. DOPA kept everything you logged.",
  afternoon: "Your moments are still saved. DOPA is still here. Today counts.",
  evening:   "It has been a while. One good thing. That is all. DOPA is listening."
}

// ── Pair J — Ghost notifications ────────────────────────────────────
const PAIR_J: Record<string, Partial<Record<PairSlot, string>>> = {
  WEEKDAY: {
    morning:   "Something good is about to happen today. Will you catch it?",
    afternoon: "Something good probably just happened. Did you keep it?",
    evening:   "The day's almost gone. One good thing. Before it disappears."
  },
  POSTGYM: {
    morning: "The gym happened. DOPA wants to know what else did."
  },
  WEEKEND: {
    morning: "Weekends move fast. Something good is already happening."
  }
}

// ── Yesterday Was Good ──────────────────────────────────────────────
const YWG_VARIANTS = [
  "DOPA read yesterday. Something worth seeing is waiting.",
  "Your reflection from yesterday is ready. Only you see it.",
  "DOPA noticed something about your day. Come see what it found.",
  "Yesterday has something to say. DOPA is ready to show you.",
  "Your day from yesterday. DOPA kept it. Come read it."
]

// ── Interfaces ──────────────────────────────────────────────────────
interface UserState {
  streak_count: number
  wins_today: number
  wins_yesterday: number
  missed_yesterday: boolean
  account_age_days: number
  avg_daily_wins_7d: number
}

interface UserSignals {
  wins_today: number
  days_since_last_entry: number
  account_age_days: number
  opened_today: boolean
}

// ── Helpers ─────────────────────────────────────────────────────────
function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function getYWGCopy(variantIndex: number): string {
  return YWG_VARIANTS[variantIndex % YWG_VARIANTS.length]
}

function localHHMM(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date())
    const h = parts.find(p => p.type === 'hour')?.value ?? '00'
    const m = parts.find(p => p.type === 'minute')?.value ?? '00'
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
  } catch { return '00:00' }
}

function dateKey(timezone: string, offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(d)
  } catch { return d.toISOString().substring(0, 10) }
}

function dayOfWeek(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date())
  } catch { return 'Monday' }
}

// ── State + signals ─────────────────────────────────────────────────
function computeState(
  moments: { date_key: string; created_at: string }[],
  timezone: string
): UserState {
  const today     = dateKey(timezone, 0)
  const yesterday = dateKey(timezone, -1)

  const byDate: Record<string, number> = {}
  for (const m of moments) {
    byDate[m.date_key] = (byDate[m.date_key] ?? 0) + 1
  }

  const wins_today       = byDate[today] ?? 0
  const wins_yesterday   = byDate[yesterday] ?? 0
  const missed_yesterday = wins_yesterday === 0

  const days = Object.keys(byDate).sort((a, b) => b.localeCompare(a))
  let streak_count = 0
  if (days.length > 0) {
    let cursor: string | null = days[0] === today ? today : days[0] === yesterday ? yesterday : null
    if (cursor) {
      for (const day of days) {
        if (day === cursor) {
          streak_count++
          const d = new Date(cursor + 'T12:00:00Z')
          d.setDate(d.getDate() - 1)
          cursor = d.toISOString().substring(0, 10)
        } else break
      }
    }
  }

  const earliest = moments[0]?.created_at ?? null
  const account_age_days = earliest
    ? Math.floor((Date.now() - new Date(earliest).getTime()) / 86400000)
    : 0

  let totalLast7 = 0
  for (let i = 0; i < 7; i++) {
    totalLast7 += byDate[dateKey(timezone, -i)] ?? 0
  }
  const avg_daily_wins_7d = totalLast7 / 7

  return { streak_count, wins_today, wins_yesterday, missed_yesterday, account_age_days, avg_daily_wins_7d }
}

function buildSignals(
  moments: { date_key: string; created_at: string }[],
  tz: string
): UserSignals {
  const today = dateKey(tz, 0)

  const wins_today = moments.filter(m => m.date_key === today).length

  let days_since_last_entry = 999
  if (moments.length > 0) {
    const latest = moments.reduce((a, b) => a.created_at > b.created_at ? a : b)
    days_since_last_entry = Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 86400000)
  }

  let account_age_days = 0
  if (moments.length > 0) {
    const earliest = moments.reduce((a, b) => a.created_at < b.created_at ? a : b)
    account_age_days = Math.floor((Date.now() - new Date(earliest.created_at).getTime()) / 86400000)
  }

  // opened_today not yet tracked in DB — defaults to false (treat as not opened)
  const opened_today = false

  return { wins_today, days_since_last_entry, account_age_days, opened_today }
}

// ── J ghost variant detection ────────────────────────────────────────
function detectJVariant(
  state: UserState,
  tz: string,
  moments: { date_key: string; created_at: string }[]
): string {
  const dow = dayOfWeek(tz)
  if (dow === 'Saturday' || dow === 'Sunday') return 'J_WEEKEND'

  const hour = parseInt(localHHMM(tz).substring(0, 2), 10)
  if (hour >= 7 && hour < 9 && state.streak_count >= 3) {
    const today = dateKey(tz, 0)
    const hasMorningSave = moments.some(m => {
      if (m.date_key !== today) return false
      try {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: tz, hour: '2-digit', hour12: false
        }).formatToParts(new Date(m.created_at))
        const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '23', 10)
        return h < 10
      } catch { return false }
    })
    if (hasMorningSave) return 'J_POSTGYM'
  }

  return 'J_WEEKDAY'
}

function getJCopy(pairId: string, slot: PairSlot): string {
  const variant = pairId.slice(2) // strip 'J_' → WEEKDAY / POSTGYM / WEEKEND
  return PAIR_J[variant]?.[slot] ?? PAIR_J.WEEKDAY[slot] ?? ''
}

// ── V2 message selection — priority chain ────────────────────────────
// Evaluate P1→P5 in order; use first match. jVariant non-null for ghost-variant users.
function selectMessage(slot: PairSlot, signals: UserSignals, jVariant: string | null): string {
  const { wins_today, days_since_last_entry, account_age_days, opened_today } = signals

  // P1 — New user (≤3 days), no entry today — highest urgency
  if (account_age_days <= 3 && wins_today === 0) {
    if (slot === 'morning') return pickRandom(MORNING_TYPE3)
    if (slot === 'afternoon') return pickRandom(AFTERNOON_TYPE2)
    return pickRandom(EVENING_TYPE2)
  }

  // P2 — Dormant, 3–13 days since last entry — warm re-engagement
  if (days_since_last_entry >= 3 && days_since_last_entry < 14) {
    return REENTRY_COPY[slot]
  }

  // P3 — Dormant, 14+ days — soft win-back
  if (days_since_last_entry >= 14) {
    return WINBACK_COPY[slot]
  }

  // P4 — Active, logged today — pull toward reward
  if (wins_today >= 1) {
    if (jVariant) {
      const jCopy = getJCopy(jVariant, slot)
      if (jCopy) return jCopy
    }
    if (slot === 'morning') return pickRandom(MORNING_TYPE1)
    if (slot === 'afternoon') return pickRandom(AFTERNOON_TYPE1)
    return pickRandom(EVENING_TYPE1)
  }

  // P5 — Active, not logged today
  if (jVariant) {
    const jCopy = getJCopy(jVariant, slot)
    if (jCopy) return jCopy
  }
  if (!opened_today) {
    // FOMO bridge — user has not opened app today
    if (slot === 'morning') return pickRandom(MORNING_TYPE3)
    return pickRandom(EVENING_TYPE2)
  }

  // Default (P5 opened, or fallback when signals unavailable)
  if (slot === 'morning') return pickRandom(MORNING_TYPE2)
  if (slot === 'afternoon') return pickRandom(AFTERNOON_TYPE2)
  return pickRandom(EVENING_TYPE2)
}

const FIXED_TIMES: Record<string, string> = { afternoon: '12:30', evening: '20:30' }

Deno.serve(async (req) => {
  try {
    const body  = await req.json().catch(() => ({}))
    const slot  = body.slot as Slot
    const force = body.force === true

    if (!slot || !['ywg', 'morning', 'afternoon', 'evening'].includes(slot)) {
      return new Response(
        JSON.stringify({ error: 'slot must be ywg | morning | afternoon | evening' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!
    const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
    const VAPID_EMAIL   = Deno.env.get('VAPID_EMAIL') ?? 'mailto:hello@mydopa.app'
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription, notify_time, timezone, last_morning_pair_id, last_ywg_variant_index')
      .eq('active', true)

    if (error) return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )

    const targets = (subs ?? []).filter(s => {
      if (force) return true
      const tz       = s.timezone ?? 'UTC'
      const now      = localHHMM(tz)
      const baseTime = (s.notify_time ?? '08:00').substring(0, 5)
      if (slot === 'ywg') {
        const uid = s.user_id ?? ''
        const offset = uid.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 60
        return now === addMinutesToHHMM('08:00', offset)
      }
      if (slot === 'morning') return now === addMinutesToHHMM(baseTime, 30)
      return now === FIXED_TIMES[slot]
    })

    if (targets.length === 0) {
      return new Response(
        JSON.stringify({ slot, sent: 0, skipped: 0, total_active: subs?.length ?? 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userIds    = [...new Set(targets.map(t => t.user_id).filter(Boolean))]
    // Extend cutoff to 60 days so dormant/winback users are correctly identified
    const cutoffDate = dateKey('UTC', -60)

    const { data: allMoments } = await supabase
      .from('moments')
      .select('user_id, date_key, created_at')
      .in('user_id', userIds)
      .gte('date_key', cutoffDate)
      .order('created_at', { ascending: true })

    const momentsByUser: Record<string, { date_key: string; created_at: string }[]> = {}
    for (const m of allMoments ?? []) {
      if (!momentsByUser[m.user_id]) momentsByUser[m.user_id] = []
      momentsByUser[m.user_id].push(m)
    }

    const pairUpdates: { id: string; pair: string }[] = []
    const ywgUpdates:  { id: string; nextIndex: number }[] = []

    const results = await Promise.allSettled(
      targets.map(async s => {
        const tz      = s.timezone ?? 'UTC'
        const moments = momentsByUser[s.user_id] ?? []
        const state   = computeState(moments, tz)
        const signals = buildSignals(moments, tz)

        let message: string

        // YWG slot — fires independently; highest morning priority when reflection exists
        if (slot === 'ywg') {
          if (state.wins_yesterday < 1) return
          const variantIndex = s.last_ywg_variant_index ?? 0
          message = getYWGCopy(variantIndex)
          ywgUpdates.push({ id: s.id, nextIndex: (variantIndex + 1) % YWG_VARIANTS.length })
        } else if (slot === 'morning') {
          // Detect J ghost variant for users ≤21 days; null otherwise
          const jVariant = signals.account_age_days <= 21
            ? detectJVariant(state, tz, moments)
            : null
          message = selectMessage('morning', signals, jVariant)
          pairUpdates.push({ id: s.id, pair: jVariant ?? 'DEFAULT' })
        } else {
          // Afternoon / evening: use J variant from this morning's pair if set
          const morningPair = s.last_morning_pair_id ?? 'DEFAULT'
          const jVariant    = morningPair.startsWith('J_') ? morningPair : null
          message = selectMessage(slot as PairSlot, signals, jVariant)
        }

        const payloadObj: Record<string, string> = { title: 'MyDopa', body: message, icon: '/icon.png' }
        if (slot === 'ywg') payloadObj.url = 'https://mydopa.app/app.html#yesterday'
        const payload = JSON.stringify(payloadObj)
        return webpush.sendNotification(s.subscription, payload)
      })
    )

    if (slot === 'morning' && pairUpdates.length > 0) {
      await Promise.all(
        pairUpdates.map(({ id, pair }) =>
          supabase.from('push_subscriptions').update({ last_morning_pair_id: pair }).eq('id', id)
        )
      )
    }

    if (slot === 'ywg' && ywgUpdates.length > 0) {
      await Promise.all(
        ywgUpdates.map(({ id, nextIndex }) =>
          supabase.from('push_subscriptions').update({ last_ywg_variant_index: nextIndex }).eq('id', id)
        )
      )
    }

    const expiredIds = results
      .map((r, i) => ({ r, id: targets[i].id }))
      .filter(({ r }) => r.status === 'rejected' && (r.reason as any)?.statusCode === 410)
      .map(({ id }) => id)

    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').update({ active: false }).in('id', expiredIds)
    }

    const sent = results.filter(r => r.status === 'fulfilled').length
    return new Response(
      JSON.stringify({ slot, sent, skipped: targets.length - sent, total_active: subs?.length ?? 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
