'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import { Sparkles, RefreshCw, User, FileText } from 'lucide-react'
import type { Resume } from '@/lib/types'

export default function InsightsPage() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [canUseToday, setCanUseToday] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [resumeResult, usageResult] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user.id).single(),
        supabase.from('ai_insights_usage').select('*')
          .eq('user_id', user.id)
          .eq('used_at', new Date().toISOString().split('T')[0])
      ])

      setResume(resumeResult.data as Resume | null)
      setCanUseToday(!usageResult.data || usageResult.data.length === 0)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const generateInsights = async () => {
    if (!resume) return
    
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: resume.id })
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      setInsights(data.insights)
      setCanUseToday(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty
          icon={User}
          title="Complete your profile first"
          description="Create your resume to get AI-powered insights on improving your job search"
          action={
            <Button asChild>
              <a href="/profile">Create Resume</a>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Get personalized tips to improve your profile</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Analysis
          </CardTitle>
          <CardDescription>
            Our AI will analyze your resume and provide actionable feedback to help you stand out
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canUseToday ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">You&apos;ve already used your daily insight</p>
              <p className="text-sm text-muted-foreground">Come back tomorrow for fresh analysis</p>
            </div>
          ) : (
            <Button onClick={generateInsights} disabled={generating} className="w-full">
              {generating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Analyzing your profile...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Insights
                </>
              )}
            </Button>
          )}
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-muted-foreground">{insights}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
