import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Job, Resume } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { userId, resumeId } = await request.json()

    if (!userId || !resumeId) {
      return NextResponse.json({ jobs: [] })
    }

    const supabase = await createClient()

    // Get resume data
    const { data: resume } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single<Resume>()

    if (!resume) {
      return NextResponse.json({ jobs: [] })
    }

    // Get education for this resume
    const { data: educationData } = await supabase
      .from('education')
      .select('type')
      .eq('resume_id', resumeId)

    const userEducationTypes = educationData?.map(e => e.type) || []

    // Get rejected and applied jobs
    const [rejectedResult, appliedResult] = await Promise.all([
      supabase.from('rejected_jobs').select('job_id').eq('user_id', userId),
      supabase.from('applications').select('job_id').eq('applicant_id', userId)
    ])

    const excludeIds = new Set([
      ...(rejectedResult.data?.map(r => r.job_id) || []),
      ...(appliedResult.data?.map(a => a.job_id) || [])
    ])

    // Fetch ALL active jobs
    const { data: allJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (jobsError || !allJobs) {
      console.error('[v0] Jobs fetch error:', jobsError)
      return NextResponse.json({ jobs: [] })
    }

    // Filter jobs
    let filteredJobs = allJobs.filter((job: Job) => {
      // Skip already rejected or applied jobs
      if (excludeIds.has(job.id)) {
        return false
      }

      // City filter - only if user has city preference enabled AND set a city
      if (resume.show_jobs_only_in_city && resume.city) {
        if (job.location_city !== resume.city) {
          return false
        }
      }

      // Experience filter - only if user set experience AND job requires it
      if (resume.experience && job.experience_needed) {
        if (!matchesExperience(resume.experience, job.experience_needed)) {
          return false
        }
      }

      // Education filter - only check if user selected education types
      if (userEducationTypes.length > 0) {
        if (job.requires_phd) {
          // PhD required - user must have PhD
          if (!userEducationTypes.includes('phd')) {
            return false
          }
        } else if (job.requires_masters) {
          // Masters required - user must have Masters or PhD
          if (!userEducationTypes.some(t => t === 'masters' || t === 'phd')) {
            return false
          }
        } else if (job.requires_bachelors) {
          // Bachelors required - user must have Bachelors, Masters, or PhD
          if (!userEducationTypes.some(t => t === 'bachelors' || t === 'masters' || t === 'phd')) {
            return false
          }
        }
      }

      return true
    })

    // Add match scores if user has skills
    let jobsWithScores = filteredJobs.map((job: Job) => {
      let score = 50 // Default base score
      
      // Boost score if skills match
      if (resume.skills_strengths && job.skills_requirements) {
        const userSkills = resume.skills_strengths.toLowerCase()
        const jobSkills = job.skills_requirements.toLowerCase()
        
        const skillMatch = userSkills.split(/[,\s]+/).some(skill => 
          jobSkills.includes(skill.trim())
        )
        
        if (skillMatch) {
          score = 75
        }
      }

      return {
        ...job,
        _matchScore: score.toString()
      }
    })

    // Sort by match score descending
    jobsWithScores.sort((a, b) => {
      const scoreA = parseInt(a._matchScore || '50')
      const scoreB = parseInt(b._matchScore || '50')
      return scoreB - scoreA
    })

    return NextResponse.json({ jobs: jobsWithScores })
  } catch (error) {
    console.error('[v0] Match jobs error:', error)
    return NextResponse.json({ jobs: [] })
  }
}

function matchesExperience(userExp: string, requiredExp: string): boolean {
  const levels: Record<string, number> = {
    '0-1': 0.5,
    '1-3': 2,
    '3-5': 4,
    '5-10': 7.5,
    '10+': 15
  }

  const userLevel = levels[userExp] || 0
  const requiredLevel = levels[requiredExp] || 0

  return userLevel >= requiredLevel
}
