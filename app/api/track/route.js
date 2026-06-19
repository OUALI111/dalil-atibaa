import { supabase } from '../../../lib/supabase'

// ─── Liste des patterns de bots côté serveur (User-Agent) ────────────────────
const BOT_UA_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /fetch/i,
  /curl/i, /wget/i, /python/i, /java\//i, /go-http/i,
  /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /applebot/i, /duckduckbot/i, /semrushbot/i, /ahrefsbot/i,
  /mj12bot/i, /dotbot/i, /petalbot/i, /gptbot/i, /ccbot/i,
  /claudebot/i, /bytespider/i, /headlesschrome/i,
  /lighthouse/i, /pagespeed/i, /pingdom/i, /uptimerobot/i,
]

function isServerBot(userAgent) {
  if (!userAgent) return true // pas de UA = bot probable
  return BOT_UA_PATTERNS.some(p => p.test(userAgent))
}

export async function POST(request) {
  try {
    // ── Filtre bot côté serveur ────────────────────────────────────────────
    const userAgent = request.headers.get('user-agent') || ''
    if (isServerBot(userAgent)) {
      return Response.json({ skipped: 'bot' })
    }

    const { doctor_id, event_type, visitor_id, referrer } = await request.json()

    if (!doctor_id || !event_type) {
      return Response.json({ error: 'Missing params' }, { status: 400 })
    }

    const allowedEvents = ['view', 'call_click', 'whatsapp_click', 'map_click']
    if (!allowedEvents.includes(event_type)) {
      return Response.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    await supabase.from('doctor_stats').insert({
      doctor_id,
      event_type,
      visitor_id: visitor_id || null,
      referrer:   referrer   || null,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
