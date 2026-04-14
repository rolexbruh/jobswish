import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { MapPin, DollarSign, Calendar, Briefcase } from 'lucide-react'
import type { Application, Job } from '@/lib/types'

interface ApplicationWithJob extends Application {
  job: Job
}

export default async function ApplicationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: applications } = await supabase
    .from('applications')
    .select('*, job:jobs(*)')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false })

  const typedApplications = (applications || []) as ApplicationWithJob[]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null
    const format = (n: number) => `$${(n / 1000).toFixed(0)}k`
    if (min && max) return `${format(min)} - ${format(max)}`
    if (min) return `From ${format(min)}`
    if (max) return `Up to ${format(max)}`
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Applications</h1>

      {typedApplications.length === 0 ? (
        <Empty
          icon={Briefcase}
          title="No applications yet"
          description="Start swiping to apply to jobs you're interested in"
        />
      ) : (
        <div className="space-y-4">
          {typedApplications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{application.job.title}</CardTitle>
                    {application.job.location_city && (
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {[application.job.location_city, application.job.location_state]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {formatSalary(application.job.salary_min, application.job.salary_max) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(application.job.salary_min, application.job.salary_max)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Applied {new Date(application.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
