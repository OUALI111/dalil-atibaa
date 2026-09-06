import { supabase } from '../../../lib/supabase'
import { rateLimit, getClientIp } from '../../../lib/rateLimit'

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
  if (!userAgent) return true
  return BOT_UA_PATTERNS.some(p => p.test(userAgent))
}

export async function POST(request) {
  try {
    const userAgent = request.headers.get('user-agent') || ''
    if (isServerBot(userAgent)) {
      return Response.json({ skipped: 'bot' })
    }

    // ✅ Rate limiting : max 10 requêtes par IP par minute
    // Protège contre les bots qui contournent le filtre User-Agent
    const ip = getClientIp(request)
    const { limited, retryAfter } = rateLimit({
      ip,
      route:    'track',
      limit:    10,
      windowMs: 60 * 1000, // 1 minute
    })
    if (limited) {
      return Response.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const { doctor_id, event_type } = await request.json()

    if (!doctor_id || !event_type) {
      return Response.json({ error: 'Missing params' }, { status: 400 })
    }

    const allowedEvents = ['view', 'call_click', 'whatsapp_click', 'map_click']
    if (!allowedEvents.includes(event_type)) {
      return Response.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    // ✅ Un seul INSERT — le rollup pg_cron met à jour count_views toutes les 48h
    // RPC increment_doctor_views supprimée : fonction inexistante dans Supabase (confirmé)
    // Fallback views_count supprimé : mauvais nom de colonne, n'a jamais fonctionné
    const { error } = await supabase.from('doctor_stats').insert({
      doctor_id,
      event_type,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
