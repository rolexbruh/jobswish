import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Plus, Briefcase, Users, Eye, MapPin, Clock, Trash2 } from 'lucide-react'
import { JobsList } from '@/components/jobs-list'
import type { Profile, Job } from '@/lib/types'

interface JobWithApplicationCount extends Job {
  applications: { count: number }[]
}

export default async function RecruiterDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile || profile.role !== 'recruiter') {
    redirect('/dashboard')
  }

  // Fetch jobs with application counts
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, applications(count)')
    .eq('recruiter_id', user.id)
    .order('created_at', { ascending: false })

  const typedJobs = (jobs || []) as JobWithApplicationCount[]

  // Get total stats
  const activeJobs = typedJobs.filter(j => j.is_active).length
  const totalApplications = typedJobs.reduce((acc, j) => acc + (j.applications[0]?.count || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">Manage your internship postings and applicants</p>
        </div>
        <Button asChild>
          <Link href="/recruiter/internships/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Internship
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeJobs}</p>
                <p className="text-sm text-muted-foreground">Active Internships</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalApplications}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{typedJobs.length}</p>
                <p className="text-sm text-muted-foreground">Total Internships Posted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Internships List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Internship Postings</CardTitle>
          <CardDescription>Click on an internship to view applicants</CardDescription>
        </CardHeader>
        <CardContent>
          {typedJobs.length === 0 ? (
            <Empty className="min-h-[300px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Briefcase className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No jobs posted yet</EmptyTitle>
                <EmptyDescription>
                  Create your first job posting to start receiving applications
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link href="/recruiter/jobs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <JobsList jobs={typedJobs} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
