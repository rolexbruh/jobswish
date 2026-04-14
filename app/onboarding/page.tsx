'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, User, Building2 } from 'lucide-react'

export default function OnboardingPage() {
  const [role, setRole] = useState<'applicant' | 'recruiter' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleContinue = async () => {
    if (!role) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to JobSwipe</CardTitle>
          <CardDescription>Choose how you want to use the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setRole('applicant')}
              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                role === 'applicant' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`p-3 rounded-full ${role === 'applicant' ? 'bg-primary/20' : 'bg-muted'}`}>
                <User className={`h-8 w-8 ${role === 'applicant' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-center">
                <h3 className={`font-semibold ${role === 'applicant' ? 'text-primary' : 'text-foreground'}`}>
                  Job Seeker
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Find your dream job by swiping
                </p>
              </div>
            </button>
            <button
              onClick={() => setRole('recruiter')}
              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                role === 'recruiter' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`p-3 rounded-full ${role === 'recruiter' ? 'bg-primary/20' : 'bg-muted'}`}>
                <Building2 className={`h-8 w-8 ${role === 'recruiter' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="text-center">
                <h3 className={`font-semibold ${role === 'recruiter' ? 'text-primary' : 'text-foreground'}`}>
                  Recruiter
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Post jobs and find candidates
                </p>
              </div>
            </button>
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleContinue}
            disabled={!role || loading}
          >
            {loading ? 'Setting up...' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
