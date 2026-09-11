import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function yesterdayDateStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const { user_id, date_key, slot = 1, micro_entry, mode } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Micro-reflection mode — one sentence, fires same session ──
    if (mode === 'micro') {
      if (!micro_entry) {
        return new Response(JSON.stringify({ error: 'micro_entry required' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...CORS }
        })
      }

      const supabaseMicro = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      const microDateKey = date_key || todayDateStr()
      const fingerprint = micro_entry.slice(0, 120)

      const { data: cachedMicro } = await supabaseMicro
        .from('dopa_reflections')
        .select('insight')
        .eq('user_id', user_id)
        .eq('date_key', microDateKey)
        .eq('slot', 0)
        .eq('angle', fingerprint)
        .maybeSingle()

      if (cachedMicro?.insight) {
        return new Response(JSON.stringify({ micro_response: cachedMicro.insight }), {
          headers: { 'Content-Type': 'application/json', ...CORS }
        })
      }

      const microPrompt = `You are DOPA, the AI companion inside MyDopa.
Voice: warm, observational, specific. Never generic.
Never use: 'great job', 'well done', 'proud of you'.
Always reference the specific words the user wrote.

The user just saved this moment: "${micro_entry}"

Write ONE sentence — maximum 20 words — that references something specific from what they wrote.
Do not summarize. Do not evaluate. Just notice one specific thing and name it.

Examples of the right tone:
- Entry: "Had coffee before the meeting and felt ready"
  Response: The coffee before the meeting — you set the tone before it started.
- Entry: "My daughter laughed at breakfast"
  Response: That laugh at breakfast — your brain almost filed it under ordinary.
- Entry: "Finished the report finally"
  Response: Finally is doing a lot of work in that sentence.

Return ONLY the sentence. No JSON. No preamble. No quotation marks. Just the sentence.`

      const microRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 60,
          messages: [{ role: 'user', content: microPrompt }]
        })
      })

      if (!microRes.ok) throw new Error('Anthropic API error')

      const microJson = await microRes.json()
      const sentence = (microJson.content?.[0]?.text ?? '').trim()
        .replace(/^["']|["']$/g, '')

      try {
        await supabaseMicro.from('dopa_reflections').upsert(
          { user_id, date_key: microDateKey, slot: 0, insight: sentence, mascot_question: '', angle: fingerprint },
          { onConflict: 'user_id,date_key,slot' }
        )
      } catch (_) { /* best-effort cache — don't block response */ }

      return new Response(JSON.stringify({ micro_response: sentence }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    const targetDateKey = date_key || todayDateStr()
    const targetSlot = slot || 1

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check cache first — no duplicate API calls
    const { data: cached } = await supabase
      .from('dopa_reflections')
      .select('insight, mascot_question')
      .eq('user_id', user_id)
      .eq('date_key', targetDateKey)
      .eq('slot', targetSlot)
      .single()

    if (cached) {
      return new Response(JSON.stringify({ insight: cached.insight, mascot_question: cached.mascot_question }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // Fetch full moments archive
    const { data: moments, error: momentsError } = await supabase
      .from('moments')
      .select('date_key, text, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true })

    if (momentsError) throw momentsError

    const allMoments = moments ?? []
    const totalCount = allMoments.length
    const uniqueDays = new Set(allMoments.map(m => m.date_key)).size

    // Calculate account age from first moment
    const accountAgeDays = allMoments.length > 0
      ? Math.floor((Date.now() - new Date(allMoments[0].created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Determine daily quota by milestone
    let quota = 1
    if (accountAgeDays >= 14 || totalCount >= 50) quota = 3
    else if (accountAgeDays >= 7) quota = 2

    // If requesting a slot beyond quota, return slot 1 silently
    if (targetSlot > quota) {
      const { data: slot1 } = await supabase
        .from('dopa_reflections')
        .select('insight, mascot_question')
        .eq('user_id', user_id)
        .eq('date_key', targetDateKey)
        .eq('slot', 1)
        .single()

      if (slot1) {
        return new Response(JSON.stringify({ insight: slot1.insight, mascot_question: slot1.mascot_question }), {
          headers: { 'Content-Type': 'application/json', ...CORS }
        })
      }
    }

    // Early user fallbacks — keep existing behavior
    if (uniqueDays < 3) {
      const n = uniqueDays === 0 ? 1 : uniqueDays
      const insight = `Day ${n}. ${totalCount} moment${totalCount !== 1 ? 's' : ''}. Consistency compounds from the first rep. You are already in motion.`
      const mascot_question = `What was the best moment from today so far?`
      return new Response(JSON.stringify({ insight, mascot_question }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    if (uniqueDays === 3) {
      const insight = `Just like Warren Buffett, you are compounding wins. Keep using his recipe.`
      const mascot_question = `What's one thing you noticed about yourself this week?`
      return new Response(JSON.stringify({ insight, mascot_question }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // Determine angle by slot
    type Angle = 'cross-temporal' | 'pattern' | 'forward'
    const angleMap: Record<number, Angle> = { 1: 'cross-temporal', 2: 'pattern', 3: 'forward' }
    const angle: Angle = angleMap[targetSlot] || 'cross-temporal'

    let angleInstruction = ''
    if (angle === 'cross-temporal') {
      angleInstruction = `Find ONE connection between something from 7 or more days ago and something from yesterday (or the most recent day with entries). Use their actual words from both entries. One sentence, 30 words max. Then write ONE short follow-up question specific to their archive — not generic.`
    } else if (angle === 'pattern') {
      angleInstruction = `Look across the full archive and name ONE pattern visible in their entries — something they do or feel repeatedly. Name the pattern using their actual words. One sentence, 30 words max. Then write ONE question that helps them see the pattern more clearly.`
    } else if (angle === 'forward') {
      angleInstruction = `Based on the full archive, identify ONE forward direction already visible in their entries — not what they should do, but what they are already becoming. One sentence, 30 words max. Then write ONE question that helps them step into what is already forming.`
    }

    const archive = allMoments
      .map(m => `[${m.date_key}] ${m.text}`)
      .join('\n')

    const yDate = yesterdayDateStr()

    const systemPrompt = `You are DOPA, the AI companion inside MyDopa.
Voice: warm, observational, specific, earned. Never cheerleading.

You are a precision mirror — not a motivational coach. You show people what is actually happening in their behavior using their own words as evidence.

Rules:
- Use their actual words, not paraphrases
- Never use: "amazing", "proud of you", "incredible", "awesome", "fantastic", "keep it up", "you've got this"
- Never speak in negatives or future conditionals
- Sound like a therapist who has been watching the whole time
- The insight must be something only you could say — because only you have read the whole archive

Return ONLY valid JSON in this exact format, no other text:
{"insight": "...", "mascot_question": "..."}`

    const userMessage = `Here is the full moments archive, ordered oldest to newest:\n${archive}\n\nYesterday's date was ${yDate}. If yesterday had no entries, use the most recent day that does.\n\n${angleInstruction}`

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    })

    if (!aiRes.ok) {
      console.error('Anthropic error:', aiRes.status, await aiRes.text())
      throw new Error('Anthropic API error')
    }

    const aiJson = await aiRes.json()
    let rawText = aiJson.content?.[0]?.text?.trim() ?? ''

    // Parse JSON response — strip markdown fences if present
    let insight = ''
    let mascot_question = ''

    try {
      rawText = rawText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(rawText)
      insight = parsed.insight ?? ''
      mascot_question = parsed.mascot_question ?? ''
    } catch {
      // Fallback if JSON parse fails
      insight = rawText.split('\n')[0] || 'Consistency compounds from the first rep. You are already in motion.'
      mascot_question = 'What was the best moment from today so far?'
    }

    // Cache result in dopa_reflections
    await supabase
      .from('dopa_reflections')
      .insert({ user_id, date_key: targetDateKey, slot: targetSlot, insight, mascot_question, angle })

    return new Response(JSON.stringify({ insight, mascot_question }), {
      headers: { 'Content-Type': 'application/json', ...CORS }
    })

  } catch (err) {
    console.error('generate-dopa-reflection error:', String(err))
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
})
