'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Users, Mail, Phone, Github, MapPin, Briefcase, GraduationCap, Check, X, ExternalLink } from 'lucide-react'
import type { Application, Resume, Profile, Education, WorkExperience } from '@/lib/types'

interface ApplicationWithDetails extends Application {
  resume: Resume
  applicant: Profile
}

interface ResumeDetails {
  resume: Resume
  education: Education[]
  work_experience: WorkExperience[]
}

interface JobApplicantsProps {
  applications: ApplicationWithDetails[]
  jobId: string
}

export function JobApplicants({ applications, jobId }: JobApplicantsProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationWithDetails | null>(null)
  const [resumeDetails, setResumeDetails] = useState<ResumeDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const viewApplicant = async (application: ApplicationWithDetails) => {
    setSelectedApplicant(application)
    setLoadingDetails(true)

    // Fetch education and work experience
    const [eduResult, workResult] = await Promise.all([
      supabase.from('education').select('*').eq('resume_id', application.resume.id),
      supabase.from('work_experience').select('*').eq('resume_id', application.resume.id)
    ])

    setResumeDetails({
      resume: application.resume,
      education: (eduResult.data || []) as Education[],
      work_experience: (workResult.data || []) as WorkExperience[]
    })
    setLoadingDetails(false)
  }

  const updateStatus = async (applicationId: string, status: 'shortlisted' | 'rejected') => {
    setUpdating(applicationId)

    await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)

    setUpdating(null)
    router.refresh()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  if (applications.length === 0) {
    return (
      <Empty
        icon={Users}
        title="No applicants yet"
        description="Share your job posting to attract candidates"
      />
    )
  }

  return (
    <>
      <div className="space-y-3">
        {applications.map((application) => (
          <Card key={application.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => viewApplicant(application)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {application.resume.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{application.resume.name}</h3>
                      <p className="text-sm text-muted-foreground">{application.resume.email}</p>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                        onClick={() => updateStatus(application.id, 'shortlisted')}
                        disabled={updating === application.id}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/20 hover:bg-destructive/10"
                        onClick={() => updateStatus(application.id, 'rejected')}
                        disabled={updating === application.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applicant Details Modal */}
      <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedApplicant && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApplicant.resume.name}</DialogTitle>
                <DialogDescription>
                  Applied on {new Date(selectedApplicant.created_at).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a 
                    href={`mailto:${selectedApplicant.resume.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {selectedApplicant.resume.email}
                  </a>
                  {selectedApplicant.resume.whatsapp && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {selectedApplicant.resume.whatsapp}
                    </div>
                  )}
                  {selectedApplicant.resume.github_link && (
                    <a 
                      href={selectedApplicant.resume.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedApplicant.resume.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {[selectedApplicant.resume.city, selectedApplicant.resume.state, selectedApplicant.resume.country]
                        .filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>

                {/* Experience & Skills */}
                {selectedApplicant.resume.experience && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Experience Level</h4>
                    <p className="text-sm text-muted-foreground">{selectedApplicant.resume.experience}</p>
                  </div>
                )}

                {selectedApplicant.resume.skills_strengths && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Skills & Strengths</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApplicant.resume.skills_strengths}
                    </p>
                  </div>
                )}

                {/* Education */}
                {resumeDetails && resumeDetails.education.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Education
                    </h4>
                    <div className="space-y-2">
                      {resumeDetails.education.map((edu) => (
                        <div key={edu.id} className="text-sm">
                          <span className="font-medium">{edu.degree_name}</span>
                          <span className="text-muted-foreground"> - {edu.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {resumeDetails && resumeDetails.work_experience.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Work Experience
                    </h4>
                    <div className="space-y-2">
                      {resumeDetails.work_experience.map((work) => (
                        <div key={work.id} className="text-sm">
                          <span className="font-medium">{work.role}</span>
                          <span className="text-muted-foreground"> at {work.company_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Links */}
                {selectedApplicant.resume.project_links && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Project Links</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApplicant.resume.project_links}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedApplicant.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        updateStatus(selectedApplicant.id, 'shortlisted')
                        setSelectedApplicant(null)
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Shortlist
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        updateStatus(selectedApplicant.id, 'rejected')
                        setSelectedApplicant(null)
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
