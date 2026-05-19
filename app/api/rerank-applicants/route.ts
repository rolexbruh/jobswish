import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Application, Resume, Profile } from '@/lib/types'

interface ApplicationWithDetails extends Application {
  resume: Resume
  applicant: Profile
}

export async function POST(request: NextRequest) {
  try {
    const { jobId, applicants, jobDetails } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only rerank if more than 10 applicants
    if (applicants.length <= 10) {
      return NextResponse.json({ reranked: applicants, scores: {} })
    }

    // Prepare documents for reranking
    const documents = applicants.map((app: ApplicationWithDetails) => {
      const skills = app.resume.skills_strengths || ''
      const experience = app.resume.experience || ''
      const workHistory = (app.resume as any).workExperience 
        ? (app.resume as any).workExperience.map((w: any) => `${w.role} at ${w.company_name}`).join(', ')
        : ''
      
      return {
        id: app.id,
        text: `${app.resume.name}. Experience: ${experience}. Skills: ${skills}. Work: ${workHistory}`
      }
    })

    const query = `${jobDetails.title}. Requirements: ${jobDetails.skills_requirements}. Experience needed: ${jobDetails.experience_needed}`

    // Call Mistral Rerank API
    const response = await fetch('https://integrate.api.nvidia.com/v1/ranking', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-rerank',
        query: query,
        documents: documents,
        top_k: Math.ceil(applicants.length / 10), // Return top 10% or at least 1
      }),
    })

    if (!response.ok) {
      console.error('[v0] Mistral Rerank API error:', response.statusText)
      // Fallback: return all applicants if API fails
      return NextResponse.json({ reranked: applicants, scores: {} })
    }

    const data = await response.json()
    
    // Create a map of scores
    const scores: Record<string, number> = {}
    const rankedIds = new Set<string>()
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((result: any) => {
        scores[result.index] = result.relevance_score || 0
        rankedIds.add(result.index)
      })
    }

    // Reorder applicants based on ranking
    const topApplicants = applicants.filter((app: ApplicationWithDetails) => 
      rankedIds.has(app.id)
    ).sort((a: ApplicationWithDetails, b: ApplicationWithDetails) => {
      return (scores[b.id] || 0) - (scores[a.id] || 0)
    })

    const reranked = [
      ...topApplicants,
      ...applicants.filter((app: ApplicationWithDetails) => !rankedIds.has(app.id))
    ]

    return NextResponse.json({ 
      reranked,
      scores,
      topCount: topApplicants.length 
    })

  } catch (error) {
    console.error('[v0] Rerank error:', error)
    // Fallback: return applicants as-is
    const { applicants } = await request.json()
    return NextResponse.json({ reranked: applicants, scores: {} })
  }
}
