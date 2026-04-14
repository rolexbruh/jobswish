import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Users, Mail, MapPin, ArrowRight } from 'lucide-react'
import type { Application, Job, Resume, Profile } from '@/lib/types'

interface ApplicationWithDetails extends Application {
  job: Job
  resume: Resume
  applicant: Profile
}

export default async function AllApplicantsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get all applications for recruiter's jobs
  const { data: applications } = await supabase
    .from('applications')
    .select('*, job:jobs!inner(*), resume:resumes(*), applicant:profiles(*)')
    .eq('jobs.recruiter_id', user.id)
    .order('created_at', { ascending: false })

  const typedApplications = (applications || []) as ApplicationWithDetails[]

  // Group by status
  const pending = typedApplications.filter(a => a.status === 'pending')
  const shortlisted = typedApplications.filter(a => a.status === 'shortlisted')
  const rejected = typedApplications.filter(a => a.status === 'rejected')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  const ApplicationCard = ({ application }: { application: ApplicationWithDetails }) => (
    <Link
      href={`/recruiter/jobs/${application.job_id}`}
      className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-semibold">
              {application.resume.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{application.resume.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              Applied for: {application.job.title}
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">All Applicants</h1>
      <p className="text-muted-foreground mb-8">View and manage all applications across your jobs</p>

      {typedApplications.length === 0 ? (
        <Empty
          icon={Users}
          title="No applicants yet"
          description="Post jobs to start receiving applications from job seekers"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pending Review</CardTitle>
                <Badge variant="secondary">{pending.length}</Badge>
              </div>
              <CardDescription>Applications waiting for your decision</CardDescription>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No pending applications</p>
              ) : (
                <div className="space-y-2">
                  {pending.slice(0, 10).map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {pending.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      +{pending.length - 10} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shortlisted */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Shortlisted</CardTitle>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{shortlisted.length}</Badge>
              </div>
              <CardDescription>Candidates you&apos;re interested in</CardDescription>
            </CardHeader>
            <CardContent>
              {shortlisted.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No shortlisted candidates</p>
              ) : (
                <div className="space-y-2">
                  {shortlisted.slice(0, 10).map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {shortlisted.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      +{shortlisted.length - 10} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejected */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Rejected</CardTitle>
                <Badge variant="destructive">{rejected.length}</Badge>
              </div>
              <CardDescription>Applications you&apos;ve passed on</CardDescription>
            </CardHeader>
            <CardContent>
              {rejected.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No rejected applications</p>
              ) : (
                <div className="space-y-2">
                  {rejected.slice(0, 10).map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                  {rejected.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      +{rejected.length - 10} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
