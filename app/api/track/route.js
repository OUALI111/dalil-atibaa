import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { doctor_id, event_type } = await request.json()

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
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
