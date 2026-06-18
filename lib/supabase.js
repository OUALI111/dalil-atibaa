import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client Supabase standard — le cache ISR est géré au niveau de chaque page
// via "export const revalidate = 3600" dans chaque page.js
export const supabase = createClient(supabaseUrl, supabaseKey)
