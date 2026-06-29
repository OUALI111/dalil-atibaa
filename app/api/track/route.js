import { supabase } from '../../../lib/supabase'

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

    const { doctor_id, event_type } = await request.json()

    if (!doctor_id || !event_type) {
      return Response.json({ error: 'Missing params' }, { status: 400 })
    }

    const allowedEvents = ['view', 'call_click', 'whatsapp_click', 'map_click']
    if (!allowedEvents.includes(event_type)) {
      return Response.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    // Insérer uniquement les colonnes qui existent dans doctor_stats
    const { error } = await supabase.from('doctor_stats').insert({
      doctor_id,
      event_type,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Si c'est une vue, incrémenter le compteur cumulé views_count dans la table doctors
    if (event_type === 'view') {
      await supabase.rpc('increment_doctor_views', { doc_id: doctor_id })
        .catch(() => {
          // Fallback au cas où la fonction RPC n'est pas encore créée
          supabase.from('doctors')
            .select('views_count')
            .eq('id', doctor_id)
            .single()
            .then(({ data }) => {
              if (data) {
                supabase.from('doctors')
                  .update({ views_count: (data.views_count || 0) + 1 })
                  .eq('id', doctor_id)
                  .then(() => {});
              }
            });
        });
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
