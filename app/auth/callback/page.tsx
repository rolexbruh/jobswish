'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[v0] Session error:', sessionError)
          setError('Failed to confirm email. Please try signing up again.')
          setLoading(false)
          return
        }

        if (!session?.user) {
          console.error('[v0] No user session found')
          setError('Email confirmation failed. Please try signing up again.')
          setLoading(false)
          return
        }

        console.log('[v0] Email confirmed successfully')

        // Get user role from user metadata
        const userRole = session.user.user_metadata?.role

        // Create profile if it doesn't exist
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: session.user.id,
              email: session.user.email,
              role: userRole || 'applicant',
              created_at: new Date().toISOString(),
            })

          if (profileError) {
            console.error('[v0] Profile creation error:', profileError)
          }
        }

        // Redirect based on role
        if (userRole === 'recruiter') {
          router.push('/recruiter')
        } else {
          router.push('/onboarding')
        }
      } catch (err) {
        console.error('[v0] Callback error:', err)
        setError('An error occurred during email confirmation. Please try again.')
        setLoading(false)
      }
    }

    handleCallback()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Confirming Email</CardTitle>
            <CardDescription>Please wait while we verify your email address...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Confirmation Failed</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              The confirmation link may have expired. Please try signing up again.
            </p>
            <a href="/auth/signup" className="text-primary hover:underline">
              Back to Sign Up
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
