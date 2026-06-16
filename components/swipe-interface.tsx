'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { X, Heart, RefreshCw, Briefcase } from 'lucide-react'
import Link from 'next/link'
import type { Job, Resume } from '@/lib/types'

interface SwipeInterfaceProps {
  userId: string
  resume: Resume | null
}

// Convert experience string to numeric value
const getExperienceValue = (experience: string): number => {
  if (!experience) return 0
  if (experience.includes('0-1')) return 1
  if (experience.includes('1-3')) return 2
  if (experience.includes('3-5')) return 3
  if (experience.includes('5-10')) return 4
  if (experience.includes('10+')) return 5
  return 0
}

// Get education level from job's requirements
const getJobEducationLevel = (job: Job): number => {
  if (job.requires_phd) return 3
  if (job.requires_masters) return 2
  if (job.requires_bachelors) return 1
  return 0
}

export function SwipeInterface({ userId, resume }: SwipeInterfaceProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const supabase = createClient()

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    
    // Get rejected and applied job IDs
    const [rejectedResult, appliedResult] = await Promise.all([
      supabase.from('rejected_jobs').select('job_id').eq('user_id', userId),
      supabase.from('applications').select('job_id').eq('applicant_id', userId)
    ])

    const excludeIds = [
      ...(rejectedResult.data?.map(r => r.job_id) || []),
      ...(appliedResult.data?.map(a => a.job_id) || [])
    ]

    // Fetch active jobs not in exclude list
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    // Filter by city if user prefers
    if (resume?.show_jobs_only_in_city && resume.city) {
      query = query.eq('location_city', resume.city)
    }

    const { data } = await query

    // Filter by experience and education level
    let filteredJobs = data || []
    
    // Get applicant's education level from education table
    const [educationResult] = await Promise.all([
      supabase.from('education').select('type').eq('resume_id', resume?.id || '')
    ])
    const educationTypes = educationResult.data?.map(e => e.type) || []
    let userEducationLevel = 0
    if (educationTypes.includes('phd')) userEducationLevel = 3
    else if (educationTypes.includes('masters')) userEducationLevel = 2
    else if (educationTypes.includes('bachelors')) userEducationLevel = 1

    filteredJobs = filteredJobs.filter(job => {
      // Filter by experience
      if (resume?.experience && job.experience_needed) {
        const userExp = getExperienceValue(resume.experience)
        const jobExp = getExperienceValue(job.experience_needed)
        if (userExp < jobExp) return false
      }

      // Filter by education
      if (userEducationLevel > 0) {
        const jobEducationLevel = getJobEducationLevel(job)
        if (jobEducationLevel > 0 && userEducationLevel < jobEducationLevel) return false
      }

      return true
    })

    setJobs(filteredJobs)
    setLoading(false)
  }, [supabase, userId, resume])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (jobs.length === 0 || swiping) return
    
    setSwiping(true)
    const currentJob = jobs[0]

    if (direction === 'right') {
      // Apply to job
      if (resume) {
        await supabase.from('applications').insert({
          job_id: currentJob.id,
          applicant_id: userId,
          resume_id: resume.id,
          status: 'pending'
        })
      }
    } else {
      // Reject job
      await supabase.from('rejected_jobs').insert({
        user_id: userId,
        job_id: currentJob.id
      })
    }

    // Remove from list
    setJobs(prev => prev.slice(1))
    setSwiping(false)

    // Fetch more if running low
    if (jobs.length <= 2) {
      fetchJobs()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Complete your profile</EmptyTitle>
            <EmptyDescription>
              Create your resume to start swiping on jobs
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/profile">Create Resume</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No more jobs</EmptyTitle>
            <EmptyDescription>
              You&apos;ve seen all available jobs. Check back later for new opportunities!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={fetchJobs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cards Container */}
      <div className="flex-1 relative max-w-md mx-auto w-full p-4">
        <AnimatePresence>
          {jobs.slice(0, 2).map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 py-6">
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => handleSwipe('left')}
          disabled={swiping}
        >
          <X className="h-8 w-8" />
        </Button>
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
          onClick={() => handleSwipe('right')}
          disabled={swiping}
        >
          <Heart className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}
