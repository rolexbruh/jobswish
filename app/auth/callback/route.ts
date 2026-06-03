import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  if (!code) {
    console.error('[v0] No code provided to callback')
    return NextResponse.redirect(`${origin}/auth/error?error=no_code`)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[v0] Exchange code error:', error.message)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
    }

    // Successfully exchanged code, redirect to swipe page
    return NextResponse.redirect(`${origin}/swipe`)
  } catch (err: any) {
    console.error('[v0] Callback exception:', err?.message || err)
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(err?.message || 'Unknown error')}`)
  }
}
