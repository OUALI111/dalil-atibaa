import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/docteur/')) {
    return NextResponse.next()
  }

  const oldSlug = pathname.replace('/docteur/', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: redirect } = await supabase
    .from('slug_redirects')
    .select('new_slug, specialty_slug, wilaya_slug')
    .eq('old_slug', oldSlug)
    .single()

  if (!redirect) return NextResponse.next()

  if (redirect.new_slug) {
    return NextResponse.redirect(
      new URL(`/docteur/${redirect.new_slug}`, request.url),
      { status: 301 }
    )
  }

  if (redirect.specialty_slug && redirect.wilaya_slug) {
    return NextResponse.redirect(
      new URL(`/specialites/${redirect.specialty_slug}/${redirect.wilaya_slug}`, request.url),
      { status: 301 }
    )
  }

  if (redirect.specialty_slug) {
    return NextResponse.redirect(
      new URL(`/specialites/${redirect.specialty_slug}`, request.url),
      { status: 301 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/docteur/:path*',
}