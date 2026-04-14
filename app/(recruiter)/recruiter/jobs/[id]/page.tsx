import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { JobApplicants } from '@/components/job-applicants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, DollarSign, Briefcase, GraduationCap } from 'lucide-react'
import type { Job, Application, Resume, Profile } from '@/lib/types'

interface ApplicationWithDetails extends Application {
  resume: Resume
  applicant: Profile
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('recruiter_id', user.id)
    .single<Job>()

  if (!job) {
    notFound()
  }

  const { data: applications } = await supabase
    .from('applications')
    .select('*, resume:resumes(*), applicant:profiles(*)')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const typedApplications = (applications || []) as ApplicationWithDetails[]

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null
    const format = (n: number) => `$${(n / 1000).toFixed(0)}k`
    if (min && max) return `${format(min)} - ${format(max)}`
    if (min) return `From ${format(min)}`
    if (max) return `Up to ${format(max)}`
    return null
  }

  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/recruiter" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Job Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                {job.location_city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {[job.location_city, job.location_state, job.location_country].filter(Boolean).join(', ')}
                  </span>
                )}
                {salary && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {salary}
                  </span>
                )}
                {job.experience_needed && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.experience_needed}
                  </span>
                )}
              </div>
            </div>
            <Badge variant={job.is_active ? 'default' : 'secondary'}>
              {job.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {job.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{job.description}</p>
              </div>
            )}
            {job.skills_requirements && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills_requirements.split(',').map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(job.requires_bachelors || job.requires_masters || job.requires_phd) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>
                  Requires: {[
                    job.requires_bachelors && "Bachelor's",
                    job.requires_masters && "Master's",
                    job.requires_phd && "PhD"
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applicants */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Applicants ({typedApplications.length})
        </h2>
        <JobApplicants applications={typedApplications} jobId={job.id} />
      </div>
    </div>
  )
}
