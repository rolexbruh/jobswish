import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Job, Resume } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { userId, resumeId } = await request.json()

    if (!userId || !resumeId) {
      return NextResponse.json(
        { error: 'Missing userId or resumeId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get resume data
    const { data: resume } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single<Resume>()

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Get rejected and applied jobs
    const [rejectedResult, appliedResult] = await Promise.all([
      supabase.from('rejected_jobs').select('job_id').eq('user_id', userId),
      supabase.from('applications').select('job_id').eq('applicant_id', userId)
    ])

    const excludeIds = [
      ...(rejectedResult.data?.map(r => r.job_id) || []),
      ...(appliedResult.data?.map(a => a.job_id) || [])
    ]

    // Fetch all active jobs
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    const { data: allJobs } = await query

    if (!allJobs || allJobs.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    // Step 1: Apply non-AI filters
    let filteredJobs = (allJobs as Job[]).filter(job => {
      // Filter by city if user prefers
      if (resume?.show_jobs_only_in_city && resume.city) {
        if (job.location_city !== resume.city) return false
      }

      // Filter by experience level
      if (job.experience_needed) {
        const userExp = resume?.experience || '0-1'
        if (!matchesExperienceRequirement(userExp, job.experience_needed)) {
          return false
        }
      }

      // Filter by education requirements
      if (job.requires_phd) {
        if (resume?.education_type !== 'phd') return false
      } else if (job.requires_masters) {
        if (!['masters', 'phd'].includes(resume?.education_type || '')) return false
      } else if (job.requires_bachelors) {
        if (!['bachelors', 'masters', 'phd'].includes(resume?.education_type || '')) return false
      }

      return true
    })

    // Step 2: Use BGE M3 embeddings and Rerank for ranking
    if (filteredJobs.length > 0) {
      filteredJobs = await rankJobsWithAI(filteredJobs, resume)
    }

    return NextResponse.json({ jobs: filteredJobs })
  } catch (error) {
    console.error('[v0] Match jobs error:', error)
    return NextResponse.json(
      { error: 'Failed to match jobs' },
      { status: 500 }
    )
  }
}

function matchesExperienceRequirement(userExp: string, requiredExp: string): boolean {
  const expMap: Record<string, number> = {
    '0-1': 0.5,
    '1-3': 2,
    '3-5': 4,
    '5-10': 7.5,
    '10+': 15
  }

  const userYears = expMap[userExp] || 0
  const requiredYears = expMap[requiredExp] || 0

  return userYears >= requiredYears
}

async function rankJobsWithAI(jobs: Job[], resume: Resume): Promise<Job[]> {
  try {
    const bgem3Key = process.env.bgem3
    const rerankKey = process.env.rerank

    if (!bgem3Key || !rerankKey) {
      // Return jobs as-is if APIs not configured
      return jobs
    }

    // Create query combining resume description and skills
    const query = `${resume.skills_strengths || ''} ${resume.project_links || ''}`

    // Get embeddings for each job using BGE M3
    const jobsWithScores = await Promise.all(
      jobs.map(async (job) => {
        try {
          const jobText = `${job.title} ${job.company_name || ''} ${job.description || ''} ${job.skills_requirements || ''}`

          // Get embeddings from BGE M3
          const bgeResponse = await fetch('https://api.mistral.ai/v1/embeddings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${bgem3Key}`
            },
            body: JSON.stringify({
              model: 'mistral-embed',
              input: [query, jobText]
            })
          })

          if (!bgeResponse.ok) {
            return { job, score: 0 }
          }

          const embeddings = await bgeResponse.json()
          const queryEmbedding = embeddings.data[0]?.embedding
          const jobEmbedding = embeddings.data[1]?.embedding

          if (!queryEmbedding || !jobEmbedding) {
            return { job, score: 0 }
          }

          // Calculate similarity score (cosine similarity)
          const score = cosineSimilarity(queryEmbedding, jobEmbedding)
          return { job, score }
        } catch (err) {
          return { job, score: 0 }
        }
      })
    )

    // Use Rerank to get final ranking
    try {
      const rerankResponse = await fetch('https://api.cohere.com/v1/rerank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rerankKey}`
        },
        body: JSON.stringify({
          model: 'rerank-english-v3.0',
          query: query,
          documents: jobs.map(job => ({
            text: `${job.title} at ${job.company_name || 'Company'}. ${job.description}. Skills: ${job.skills_requirements}`
          })),
          top_n: jobs.length
        })
      })

      if (rerankResponse.ok) {
        const rankings = await rerankResponse.json()
        const sortedJobs = rankings.results
          .sort((a: any, b: any) => b.relevance_score - a.relevance_score)
          .map((result: any) => ({
            ...jobs[result.index],
            _matchScore: (result.relevance_score * 100).toFixed(1)
          }))

        return sortedJobs
      }
    } catch (err) {
      // Fall back to embedding scores
      return jobsWithScores
        .sort((a, b) => b.score - a.score)
        .map(({ job, score }) => ({
          ...job,
          _matchScore: (score * 100).toFixed(1)
        }))
    }

    return jobs
  } catch (error) {
    console.error('[v0] AI ranking error:', error)
    return jobs
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
